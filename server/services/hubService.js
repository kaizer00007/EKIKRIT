import { adapterRegistryInstance } from '../adapters/AdapterRegistry.js';
import { mdmServiceInstance } from './mdmService.js';
import { consentServiceInstance } from './consentService.js';
import { anomalyServiceInstance } from './anomalyService.js';
import { auditServiceInstance } from './auditService.js';

/**
 * HubService: The Central Integration Hub Query Broker
 * 
 * CORE ARCHITECTURAL INVARIANTS:
 * 1. Federated Model: Does not store duplicate copies of source department databases.
 * 2. Parallel Dispatch: Dispatches adapter queries asynchronously via Promise.allSettled().
 * 3. Graceful Degradation: An offline department adapter never brings down the hub.
 * 4. DEPA Consent Gatekeeper: Zero cross-department data sharing without active consent.
 * 5. Short-TTL Query Caching: 60-second caching for high performance during repeat queries.
 */
export class HubService {
  constructor() {
    this.queryCache = new Map();
    this.cacheTtlMs = 60000;
  }

  async pullUnifiedRecords(unifiedId, callerContext = {}) {
    const startTime = Date.now();
    const callerRole = callerContext.role || 'citizen';
    const callerDept = callerContext.departmentId || 'hub-citizen-direct';
    const callerName = callerContext.name || 'Anonymous User';

    const unifiedCitizen = mdmServiceInstance.getUnifiedCitizen(unifiedId);
    if (!unifiedCitizen) {
      throw new Error(`Unified citizen record not found for ID: ${unifiedId}`);
    }

    const cacheKey = `${unifiedId}_${callerDept}_${callerRole}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTtlMs)) {
      return {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          servedFromCache: true,
          cacheAgeSec: Math.round((Date.now() - cached.timestamp) / 1000)
        }
      };
    }

    const registeredAdapters = adapterRegistryInstance.getAllAdapters();

    const queryPromises = registeredAdapters.map(async (adapter) => {
      const deptId = adapter.metadata.departmentId;

      if (callerRole === 'official' && callerDept !== deptId) {
        const consentCheck = consentServiceInstance.checkConsent(unifiedId, callerDept, deptId);
        if (!consentCheck.allowed) {
          return {
            departmentId: deptId,
            departmentName: adapter.metadata.departmentName,
            status: 'CONSENT_REQUIRED',
            consentStatus: 'NOT_GRANTED',
            message: `Cross-department access blocked by DEPA privacy policy. ${consentCheck.reason}`,
            circuitState: adapter.circuitBreaker.state,
            data: null
          };
        }
      }

      const linkedRecord = unifiedCitizen.linkedRecords?.[deptId];
      const criteria = {
        localIdentifier: linkedRecord ? { value: linkedRecord.idValue } : undefined,
        demographicMatch: {
          name: unifiedCitizen.canonicalName,
          dobIso: unifiedCitizen.canonicalDob,
          phone: unifiedCitizen.canonicalPhone,
          dobDdMmYyyy: unifiedCitizen.canonicalDob ? 
            `${unifiedCitizen.canonicalDob.split('-')[2]}-${unifiedCitizen.canonicalDob.split('-')[1]}-${unifiedCitizen.canonicalDob.split('-')[0]}` : undefined
        }
      };

      return await adapter.executeQuery(criteria);
    });

    const settledResults = await Promise.allSettled(queryPromises);

    const departmentRecords = {};
    const sourcesAvailable = [];
    const sourcesUnavailable = [];
    const sourcesConsentBlocked = [];

    settledResults.forEach((settled, idx) => {
      const adapter = registeredAdapters[idx];
      const deptId = adapter.metadata.departmentId;

      if (settled.status === 'fulfilled') {
        const res = settled.value;
        departmentRecords[deptId] = res;

        if (res.status === 'SUCCESS') {
          sourcesAvailable.push(deptId);
        } else if (res.status === 'CONSENT_REQUIRED') {
          sourcesConsentBlocked.push(deptId);
        } else {
          sourcesUnavailable.push(deptId);
        }
      } else {
        departmentRecords[deptId] = {
          departmentId: deptId,
          departmentName: adapter.metadata.departmentName,
          status: 'UNAVAILABLE',
          error: settled.reason?.message || 'Adapter execution failed',
          circuitState: adapter.circuitBreaker.state,
          data: null
        };
        sourcesUnavailable.push(deptId);
      }
    });

    const canonicalProfile = {
      unifiedId: unifiedCitizen.unifiedId,
      canonicalDemographics: {
        fullName: unifiedCitizen.canonicalName,
        dob: unifiedCitizen.canonicalDob,
        gender: unifiedCitizen.canonicalGender,
        phoneMasked: unifiedCitizen.canonicalPhone ? `+91 ${unifiedCitizen.canonicalPhone.slice(0, 2)}XXXX${unifiedCitizen.canonicalPhone.slice(-4)}` : null,
        district: unifiedCitizen.canonicalDistrict,
        state: 'Maharashtra',
        country: 'India'
      },
      identifiers: Object.entries(unifiedCitizen.linkedRecords || {}).map(([deptId, val]) => ({
        departmentId: deptId,
        identifierType: val.idType || 'department_key',
        identifierValue: val.idValue,
        status: 'VERIFIED'
      })),
      departmentRecords,
      anomalies: [],
      metadata: {
        queriedAt: new Date().toISOString(),
        totalLatencyMs: Date.now() - startTime,
        sourcesAvailable,
        sourcesUnavailable,
        sourcesConsentBlocked,
        servedFromCache: false,
        activeAdaptersCount: registeredAdapters.length,
        matchConfidence: unifiedCitizen.matchConfidence
      }
    };

    canonicalProfile.anomalies = anomalyServiceInstance.detectAnomalies(canonicalProfile);
    this.queryCache.set(cacheKey, { timestamp: Date.now(), data: canonicalProfile });

    auditServiceInstance.logEvent({
      actorRole: callerRole,
      actorName: callerName,
      action: 'CROSS_DEPARTMENT_RECORD_FETCH',
      targetCitizenId: unifiedId,
      requestingDept: callerDept,
      status: sourcesUnavailable.length === 0 ? 'SUCCESS' : (sourcesAvailable.length > 0 ? 'PARTIAL_SUCCESS' : 'FAILURE'),
      latencyMs: canonicalProfile.metadata.totalLatencyMs,
      notes: `Brokered live data across ${registeredAdapters.length} adapters.`
    });

    return canonicalProfile;
  }

  async getUnifiedApplicationTracker(unifiedId) {
    const profile = await this.pullUnifiedRecords(unifiedId, { role: 'citizen', departmentId: 'hub-citizen-direct' });
    const records = profile.departmentRecords || {};
    const applications = [];

    const pdsData = records['dept-pds']?.data?.domainData;
    if (pdsData) {
      applications.push({
        id: 'APP-PDS-2026-9812',
        departmentId: 'dept-pds',
        departmentName: 'Food & Civil Supplies (PDS)',
        serviceName: `NFSA Ration Card Issuance (${pdsData.cardTier} Tier)`,
        currentStatus: pdsData.applicationStatus || 'APPROVED',
        submittedDate: '2026-06-10',
        lastUpdatedDate: '2026-08-28',
        steps: [
          { label: 'Application Form Submitted', date: '2026-06-10', completed: true },
          { label: 'Fair Price Shop Verification', date: '2026-06-25', completed: true },
          { label: 'District Supply Officer (DSO) Sanction', date: '2026-07-12', completed: true },
          { label: 'Smart Ration Card Dispatched', date: '2026-08-28', completed: true }
        ]
      });
    }

    const landData = records['dept-land-records']?.data?.domainData;
    if (landData?.applicationTracking) {
      const track = landData.applicationTracking;
      applications.push({
        id: track.application_id,
        departmentId: 'dept-land-records',
        departmentName: 'Revenue Dept (MahaBhumi)',
        serviceName: track.service_name,
        currentStatus: track.current_stage || 'APPROVED',
        submittedDate: '2026-07-01',
        lastUpdatedDate: '2026-07-15',
        steps: track.stage_history.map(s => ({
          label: s.stage,
          date: s.timestamp.split('T')[0],
          completed: true
        }))
      });
    }

    const empData = records['dept-employment']?.data?.domainData;
    if (empData?.applicationTracking) {
      const track = empData.applicationTracking;
      applications.push({
        id: track.application_no,
        departmentId: 'dept-employment',
        departmentName: 'Skill Dev & Employment (Mahaswayam)',
        serviceName: track.scheme_title,
        currentStatus: track.current_stage || 'DISBURSED_SCHEDULED',
        submittedDate: '2026-06-15',
        lastUpdatedDate: '2026-08-14',
        steps: track.timeline.map(s => ({
          label: s.title,
          date: s.date,
          completed: true
        }))
      });
    }

    const mahadbtData = records['dept-mahadbt']?.data?.domainData;
    if (mahadbtData) {
      applications.push({
        id: 'APP-DBT-2026-4410',
        departmentId: 'dept-mahadbt',
        departmentName: 'Social Welfare (MahaDBT)',
        serviceName: mahadbtData.schemeTitle,
        currentStatus: mahadbtData.grantStatus || 'DISBURSED',
        submittedDate: '2026-07-20',
        lastUpdatedDate: mahadbtData.disbursalDate || '2026-08-15',
        steps: [
          { label: 'Online Application Logged', date: '2026-07-20', completed: true },
          { label: 'Caste & Income Certificate Scrutiny', date: '2026-08-01', completed: true },
          { label: 'Public Financial Management System (PFMS) Mandate', date: '2026-08-10', completed: true },
          { label: `Direct Benefit Disbursal (Rs. ${mahadbtData.disbursedAmountInr?.toLocaleString('en-IN')})`, date: mahadbtData.disbursalDate || '2026-08-15', completed: true }
        ]
      });
    }

    let bundleApplications = [];
    try {
      const { bundleServiceInstance } = await import('./bundleService.js');
      bundleApplications = bundleServiceInstance.getBundleApplicationsForCitizen(unifiedId);
    } catch (e) {}

    return {
      unifiedId,
      citizenName: profile.canonicalDemographics.fullName,
      totalApplications: applications.length,
      applications,
      bundleApplications
    };
  }

  clearCache() {
    this.queryCache.clear();
  }
}

export const hubServiceInstance = new HubService();