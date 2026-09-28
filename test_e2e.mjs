const BASE = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("=== EKIKRIT END-TO-END VERIFICATION SUITE ===");
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      console.log("PASSED ✓");
      passed++;
    } catch (err) {
      console.log(`FAILED ✗ (${err.message})`);
      failed++;
    }
  }

  // 1. PRIORITY 1: Adapter Layer & Unified Records Query
  await check("Priority 1: Brokered query pulls and merges from 3 independent systems live", async () => {
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/records`);
    const json = await res.json();
    if (!json.success) throw new Error("API call unsuccessful");
    if (!json.profile.departmentRecords["dept-pds"]) throw new Error("Missing PDS");
    if (!json.profile.departmentRecords["dept-land-records"]) throw new Error("Missing Land");
    if (!json.profile.departmentRecords["dept-employment"]) throw new Error("Missing Employment");
    if (json.profile.canonicalDemographics.dob !== "1985-08-14") throw new Error("DOB normalization mismatch");
  });

  // 2. PRIORITY 2: Federated SSO Simulation
  await check("Priority 2: Federated SSO OTP request & verification", async () => {
    const otpReq = await fetch(`${BASE}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "9822019482" })
    });
    const otpJson = await otpReq.json();
    if (!otpJson.success || !otpJson.simulatedOtp) throw new Error("OTP request failed");

    const verReq = await fetch(`${BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "9822019482", otp: otpJson.simulatedOtp })
    });
    const verJson = await verReq.json();
    if (!verJson.token || verJson.user.unifiedId !== "EK-MH-849102") throw new Error("JWT token invalid");
  });

  // 3. PRIORITY 3: Entity Resolution & HITL Queue
  await check("Priority 3: Fuzzy matching & Human-in-the-Loop review queue", async () => {
    const queueReq = await fetch(`${BASE}/official/hitl-queue`);
    const queueJson = await queueReq.json();
    if (!queueJson.queue || queueJson.queue.length === 0) throw new Error("HITL queue empty");
    
    // Simulate similarity calculation
    const simReq = await fetch(`${BASE}/official/entity-match-simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileA: { name: "PATIL RAJESH T", dobIso: "1985-08-14", district: "PUNE", phone: "9822019482" },
        profileB: { name: "Rajesh Tukaram Patil", dobIso: "1985-08-14", district: "PUNE", phone: "9822019482" }
      })
    });
    const simJson = await simReq.json();
    if (simJson.result.overallScore < 85) throw new Error("Fuzzy similarity score calculation error");
  });

  // 4. PRIORITY 4: DEPA Consent Enforcement
  await check("Priority 4: DEPA consent gatekeeper blocks cross-dept data without active consent", async () => {
    const officialToken = btoa(JSON.stringify({ role: "official", departmentId: "dept-land-records", name: "Tehsildar" }));
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/records`, {
      headers: { Authorization: `Bearer ${officialToken}` }
    });
    const json = await res.json();
    const pdsBlock = json.profile.departmentRecords["dept-pds"];
    if (pdsBlock.status !== "CONSENT_REQUIRED") throw new Error("Expected PDS data to be blocked by DEPA");
  });

  // 5. PRIORITY 5: Unified Application Tracker
  await check("Priority 5: Unified Application Tracker aggregates cross-department milestones", async () => {
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/applications`);
    const json = await res.json();
    if (!json.success || !json.tracker.applications || json.tracker.applications.length < 3) {
      throw new Error("Tracker missing cross-department applications");
    }
  });

  // 6. PRIORITY 1 CORE JUDGE SCENARIO: Live 4th System Onboarding (MahaDBT)
  await check("Live Demo Scenario: Onboard 4th system (MahaDBT with Bearer Auth) live without hub reboot", async () => {
    const onboardReq = await fetch(`${BASE}/admin/adapter/onboard-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: "dept-mahadbt",
        departmentName: "Social Welfare (MahaDBT)",
        authType: "bearer",
        version: "1.0.0-live",
        credentials: { apiKey: "dbt_live_key_9921" },
        fieldMappings: {
          primaryIdField: "dbt_reg_id",
          nameField: "applicant_legal_name",
          dobField: "b_day"
        }
      })
    });
    const onboardJson = await onboardReq.json();
    if (!onboardJson.success) throw new Error("Live onboarding failed");

    // Live query must now contain MahaDBT
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/records`);
    const json = await res.json();
    if (!json.profile.departmentRecords["dept-mahadbt"]) throw new Error("MahaDBT missing in live query");
    if (json.profile.departmentRecords["dept-mahadbt"].status !== "SUCCESS") throw new Error("MahaDBT query unsuccessful");
  });

  // 7. Graceful Degradation Test (Simulate Downtime)
  await check("Graceful Degradation: Simulating PDS downtime isolates failure and serves other departments", async () => {
    // Toggle down
    await fetch(`${BASE}/admin/adapter/dept-pds/toggle-downtime`, { method: "POST" });
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/records`);
    const json = await res.json();
    const pdsBlock = json.profile.departmentRecords["dept-pds"];
    const landBlock = json.profile.departmentRecords["dept-land-records"];
    if (pdsBlock.status !== "ERROR") throw new Error("PDS should report error/unavailable");
    if (landBlock.status !== "SUCCESS") throw new Error("Land records should remain healthy");

    // Restore
    await fetch(`${BASE}/admin/adapter/dept-pds/toggle-downtime`, { method: "POST" });
  });

  // 8. AI Schema Mapping (Gemini)
  await check("Priority 7: AI-assisted schema mapping proposes canonical field mappings with confidence", async () => {
    const res = await fetch(`${BASE}/admin/ai/suggest-mapping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        samplePayload: {
          dbt_reg_id: "DBT-2026-992140",
          applicant_legal_name: "Mr. Rajesh T. Patil",
          b_day: "1985/08/14",
          district_office: "Pune Central"
        },
        departmentMetadata: { departmentName: "Social Welfare" }
      })
    });
    const json = await res.json();
    if (!json.success || !json.mappings || json.overallConfidence < 70) {
      throw new Error("AI schema mapping failed or confidence too low");
    }
  });

  // 9. Tamper-Evident Audit Logging
  await check("Priority 8: Audit log records cross-department access events", async () => {
    const res = await fetch(`${BASE}/admin/audit-logs`);
    const json = await res.json();
    if (!json.success || !json.logs || json.logs.length === 0) throw new Error("Audit log empty");
  });

  console.log(`\nTEST SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests().catch(err => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});