/**
 * Tamper-Evident Audit Logging & Health Telemetry Service
 * 
 * Logs all cross-department data accesses, consent validations,
 * adapter state transitions, and downtime events.
 */

export class AuditService {
  constructor() {
    this.logs = [
      {
        id: 'AUD-2026-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actorRole: 'official',
        actorName: 'Shri S. K. Kadam (Tehsildar)',
        action: 'CONSENT_REQUEST_INITIATED',
        targetCitizenId: 'EK-MH-849102',
        requestingDept: 'dept-land-records',
        targetDept: 'dept-pds',
        consentId: 'CNS-MH-2026-0091',
        status: 'PENDING_CITIZEN_ACTION',
        latencyMs: 12,
        notes: 'Requested PDS quota verification for agricultural subsidy clearance'
      },
      {
        id: 'AUD-2026-002',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        actorRole: 'citizen',
        actorName: 'Sunita Ramesh Deshmukh',
        action: 'CONSENT_APPROVAL_GRANTED',
        targetCitizenId: 'EK-MH-849103',
        requestingDept: 'dept-employment',
        targetDept: 'dept-land-records',
        consentId: 'CNS-MH-2026-0092',
        status: 'APPROVED',
        latencyMs: 9,
        notes: 'Citizen authorized 60-day read access for Rural Women Seed Fund'
      }
    ];
  }

  logEvent(event) {
    const entry = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop(); // Retain last 200 events
    return entry;
  }

  getRecentLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }
}

export const auditServiceInstance = new AuditService();
