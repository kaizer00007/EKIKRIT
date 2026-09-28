const BASE = "http://localhost:5000/api/v1";

async function runBundleTests() {
  console.log("=== EKIKRIT BUNDLED APPLICATIONS E2E VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      console.log("PASSED ?");
      passed++;
    } catch (err) {
      console.log(`FAILED ? (${err.message})`);
      failed++;
    }
  }

  // 1. Bundle Catalog Verification
  await check("Bundle Catalog: returns pre-configured life/business event bundles", async () => {
    const res = await fetch(`${BASE}/bundles`);
    const json = await res.json();
    if (!json.success) throw new Error("API call unsuccessful");
    if (!Array.isArray(json.bundles) || json.bundles.length < 3) throw new Error("Fewer than 3 bundles found");
    
    const hotel = json.bundles.find(b => b.id === 'hotel_business');
    if (!hotel) throw new Error("hotel_business bundle not found");
    if (!hotel.services || hotel.services.length < 3) throw new Error("hotel_business missing services");
    if (!hotel.participatingDepartments || hotel.participatingDepartments.length < 3) throw new Error("hotel_business missing participating departments");
  });

  // 2. Bundle Schema & Auto-Fill Mapping
  await check("Bundle Schema & Auto-Fill: deduplicates fields & populates citizen profile", async () => {
    const res = await fetch(`${BASE}/bundles/hotel_business?unifiedId=EK-MH-849102`);
    const json = await res.json();
    if (!json.success) throw new Error("API call unsuccessful");
    if (!json.bundle) throw new Error("Missing bundle details");
    if (!Array.isArray(json.consolidatedFields) || json.consolidatedFields.length === 0) throw new Error("Consolidated fields empty");

    const autoFill = json.autoFillData;
    if (!autoFill) throw new Error("Missing auto-fill data");
    if (autoFill.applicantName !== "Rajesh Tukaram Patil") throw new Error(`Unexpected name: ${autoFill.applicantName}`);
    if (autoFill.district.toUpperCase() !== "PUNE") throw new Error(`Unexpected district: ${autoFill.district}`);
    
    if (!json.depaConsent || !json.depaConsent.required) throw new Error("DEPA consent requirement missing");
    if (!json.depaConsent.participatingDepartments.includes("dept-pds")) throw new Error("PDS missing from DEPA consent");
  });

  // 3. Parallel Fan-Out Submission
  let createdBundleAppId = null;
  await check("Bundle Fan-Out: submits bundle and fans out across adapters", async () => {
    const payload = {
      unifiedId: "EK-MH-849102",
      formData: {
        applicantName: "Rajesh Tukaram Patil",
        aadhaarNo: "9482-1029-4819",
        mobileNumber: "9822019482",
        email: "rajesh.patil@example.com",
        entityName: "Sahyadri Heritage Inn & Dining",
        establishmentType: "Hotel & Multi-Cuisine Restaurant",
        khataNo: "KH-4091",
        surveyNo: "SN-108/2",
        district: "Pune",
        plannedStaffCount: 18,
        storageCapacitySqFt: 2500,
        proposedPowerKw: 45
      },
      consentGranted: true
    };

    const res = await fetch(`${BASE}/bundles/hotel_business/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Bundle submission failed: ${json.error}`);
    if (!json.bundleApplicationId) throw new Error("Missing bundleApplicationId");
    createdBundleAppId = json.bundleApplicationId;

    if (!Array.isArray(json.results) || json.results.length < 3) throw new Error("Fan-out results count mismatch");
    const pdsResult = json.results.find(r => r.departmentId === "dept-pds");
    const landResult = json.results.find(r => r.departmentId === "dept-land-records");
    const empResult = json.results.find(r => r.departmentId === "dept-employment");

    if (!pdsResult || !landResult || !empResult) throw new Error("One or more department fan-out responses missing");
    if (!pdsResult.applicationId || !landResult.applicationId || !empResult.applicationId) {
      throw new Error("Missing departmental application reference IDs");
    }
  });

  // 4. Hierarchical Application Tracker Retrieval
  await check("Application Tracker: returns parent bundle application with child status", async () => {
    const res = await fetch(`${BASE}/citizen/EK-MH-849102/applications`);
    const json = await res.json();
    if (!json.success) throw new Error("API call unsuccessful");
    if (!json.tracker.bundleApplications || json.tracker.bundleApplications.length === 0) {
      throw new Error("No bundle applications found in tracker");
    }

    const trackedBundle = json.tracker.bundleApplications.find(b => b.id === createdBundleAppId);
    if (!trackedBundle) throw new Error("Newly created bundle not found in tracker");
    if (!trackedBundle.results || trackedBundle.results.length < 3) throw new Error("Tracked bundle missing child results");
  });

  // 5. Offline Queue Resilience during Simulated Department Outage
  await check("Resilience: handles adapter downtime gracefully with QUEUED_OFFLINE", async () => {
    const downRes = await fetch(`${BASE}/admin/adapter/dept-pds/toggle-downtime`, { method: "POST" });
    const downJson = await downRes.json();
    if (!downJson.isDown) throw new Error("Failed to set PDS downtime");

    const payload = {
      unifiedId: "EK-MH-849102",
      formData: {
        applicantName: "Rajesh Tukaram Patil",
        aadhaarNo: "9482-1029-4819",
        mobileNumber: "9822019482",
        residentialAddress: "Flat 402, Shivneri Heights, Kothrud",
        khataNo: "KH-4091",
        surveyNo: "SN-108/2",
        district: "Pune",
        familyMembersCount: 4,
        monthlyQuotaKg: 20
      },
      consentGranted: true
    };

    const res = await fetch(`${BASE}/bundles/new_resident/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error("Bundle submission threw fatal error instead of degrading gracefully");

    const pdsResult = json.results.find(r => r.departmentId === "dept-pds");
    if (!pdsResult) throw new Error("PDS child result missing");
    if (pdsResult.status !== "QUEUED_OFFLINE") {
      throw new Error(`Expected QUEUED_OFFLINE for PDS, got: ${pdsResult.status}`);
    }

    const landResult = json.results.find(r => r.departmentId === "dept-land-records");
    if (landResult && landResult.status === "QUEUED_OFFLINE") {
      throw new Error("Land adapter was erroneously marked offline");
    }

    await fetch(`${BASE}/admin/adapter/dept-pds/toggle-downtime`, { method: "POST" });
  });

  // 6. Zero-Code Admin Bundle Registration
  await check("Zero-Code Extensibility: admin deploys a new goal bundle live", async () => {
    const newBundle = {
      id: "ev_fleet_permit",
      title: "Commercial EV Fleet Operating Sanction",
      category: "Transport & Green Mobility",
      description: "Fast-track unified permit for commercial electric vehicle charging infrastructure and green commercial permits.",
      estimatedTotalDays: "3 - 5 Days",
      icon: "Zap",
      services: [
        {
          serviceId: "ev_land_permit",
          serviceName: "EV Charging Station Land Clearance",
          departmentId: "dept-land-records",
          departmentName: "Revenue & Land Records (MahaBhumi)",
          estimatedDays: 3,
          requiredFields: ["applicantName", "aadhaarNo", "khataNo", "surveyNo", "district"]
        },
        {
          serviceId: "ev_green_subsidy",
          serviceName: "Direct EV Fleet Capital Subsidy",
          departmentId: "dept-mahadbt",
          departmentName: "Social Welfare (MahaDBT)",
          estimatedDays: 5,
          requiredFields: ["applicantName", "aadhaarNo", "mobileNumber"]
        }
      ]
    };

    const regRes = await fetch(`${BASE}/admin/bundles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBundle)
    });
    const regJson = await regRes.json();
    if (!regJson.success) throw new Error(`Failed to register bundle: ${regJson.error}`);

    const listRes = await fetch(`${BASE}/bundles`);
    const listJson = await listRes.json();
    const found = listJson.bundles.find(b => b.id === "ev_fleet_permit");
    if (!found) throw new Error("Dynamically registered bundle not found in catalog");
  });

  console.log("\n==========================================");
  console.log(`TOTAL BUNDLE TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBundleTests();
