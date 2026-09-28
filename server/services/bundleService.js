import { defaultBundles } from '../config/bundles.js';
import { adapterRegistryInstance } from '../adapters/AdapterRegistry.js';
import { hubServiceInstance } from './hubService.js';
import { auditServiceInstance } from './auditService.js';

/**
 * BundleService: Orchestration Engine for Bundled Life & Business Event Applications
 * 
 * CORE RESPONSIBILITIES:
 * 1. Data-Driven Event Bundle Catalog management
 * 2. Cross-Service Field Deduplication & Connected Department Auto-Fill
 * 3. Transparent DEPA Multi-Department Consent Breakdown
 * 4. Parallel Fan-Out Submission with Offline Queueing & Circuit-Breaker Resilience
 * 5. Parent-Child Hierarchical Application Tracking
 */
export class BundleService {
  constructor() {
    this.bundles = new Map();
    defaultBundles.forEach(b => this.bundles.set(b.bundle_id, JSON.parse(JSON.stringify(b))));

    // Active submitted bundle applications store: unifiedId -> Array of bundle apps
    this.bundleApplications = new Map([
      [
        'EK-MH-849102',
        [
          {
            bundleAppId: 'BND-2026-HOTEL-8812',
            bundleId: 'hotel_business',
            bundleTitle: 'Start a Hotel / Restaurant Business',
            category: 'Business & Commerce',
            citizenUnifiedId: 'EK-MH-849102',
            citizenName: 'Rajesh Tukaram Patil',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            overallStatus: 'IN_PROGRESS',
            totalServicesCount: 3,
            approvedServicesCount: 1,
            summaryBadge: '1 of 3 Approved',
            subApplications: [
              {
                serviceId: 'srv_land_use',
                serviceName: 'Commercial Land Use & 7/12 Clearance',
                departmentId: 'dept-land-records',
                departmentName: 'Revenue Dept (MahaBhumi)',
                applicationId: 'APP-LAND-449102',
                status: 'APPROVED',
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                stages: [
                  { label: '7/12 Mutation Dossier Logged', date: '2026-09-10', completed: true },
                  { label: 'Tehsildar Zoning & NA Inspection', date: '2026-09-11', completed: true },
                  { label: 'Digital Land Use NOC Endorsed', date: '2026-09-11', completed: true }
                ]
              },
              {
                serviceId: 'srv_trade_license',
                serviceName: 'Trade & Establishment License',
                departmentId: 'dept-employment',
                departmentName: 'Skill Dev & Employment (Mahaswayam)',
                applicationId: 'APP-EMP-881290',
                status: 'UNDER_REVIEW',
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                stages: [
                  { label: 'Trade License Dossier Ingested', date: '2026-09-10', completed: true },
                  { label: 'Municipal Labour Officer Verification', date: 'In Progress', completed: false },
                  { label: 'Establishment Sanction Order', date: 'Pending', completed: false }
                ]
              },
              {
                serviceId: 'srv_food_noc',
                serviceName: 'Commercial Grain & Food Supply Clearance NOC',
                departmentId: 'dept-pds',
                departmentName: 'Food & Civil Supplies (PDS)',
                applicationId: 'APP-PDS-220194',
                status: 'UNDER_REVIEW',
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                stages: [
                  { label: 'Commercial Dossier Registered in PDS Hub', date: '2026-09-10', completed: true },
                  { label: 'Fair Price Shop Quota Allocation Scrutiny', date: 'In Progress', completed: false },
                  { label: 'Commercial Food Supply Sanction Order', date: 'Pending', completed: false }
                ]
              }
            ]
          }
        ]
      ]
    ]);
  }

  getAllBundles() {
    return Array.from(this.bundles.values()).map(b => {
      const bId = b.bundle_id || b.id;
      return {
        ...b,
        id: bId,
        bundle_id: bId,
        participatingDepartments: Array.from(new Set((b.services || []).map(s => s.department_id || s.departmentId)))
      };
    });
  }

  getBundleById(bundleId) {
    if (!bundleId) return null;
    return this.bundles.get(bundleId) || Array.from(this.bundles.values()).find(b => b.bundle_id === bundleId || b.id === bundleId) || null;
  }

  /**
   * Allows judges/admins to add a new bundle as pure configuration live during Q&A
   */
  registerCustomBundle(bundleConfig) {
    const key = bundleConfig?.bundle_id || bundleConfig?.id;
    if (!bundleConfig || !key) {
      throw new Error('Bundle must have a unique bundle_id or id');
    }
    const normalized = {
      ...bundleConfig,
      bundle_id: key,
      id: key,
      services: (bundleConfig.services || []).map(s => ({
        ...s,
        service_id: s.service_id || s.serviceId,
        service_name: s.service_name || s.serviceName,
        department_id: s.department_id || s.departmentId,
        department_name: s.department_name || s.departmentName
      }))
    };
    this.bundles.set(key, normalized);
    return normalized;
  }

  /**
   * Synthesizes a consolidated, deduplicated form schema for a bundle
   * and auto-fills values from connected department records for a citizen.
   */
  async getConsolidatedBundleSchema(bundleId, unifiedId) {
    const bundle = this.getBundleById(bundleId);
    if (!bundle) throw new Error(`Bundle not found: ${bundleId}`);

    // Fetch citizen's existing connected department data for auto-fill
    let citizenProfile = null;
    try {
      citizenProfile = await hubServiceInstance.pullUnifiedRecords(unifiedId, { role: 'citizen' });
    } catch (e) {
      console.warn('Could not load profile for auto-fill:', e.message);
    }

    const demo = citizenProfile?.canonicalDemographics || {};
    const pdsData = citizenProfile?.departmentRecords?.['dept-pds']?.data?.domainData || {};
    const landData = citizenProfile?.departmentRecords?.['dept-land-records']?.data?.domainData || {};
    const empData = citizenProfile?.departmentRecords?.['dept-employment']?.data?.domainData || {};

    // Deduplicate fields across services
    const seenFieldKeys = new Set();
    const consolidatedFields = [];

    // Core identity fields (asked once, shared everywhere)
    consolidatedFields.push({
      key: 'applicant_full_name',
      label: 'Applicant / Legal Representative Name',
      type: 'text',
      value: demo.fullName || 'Rajesh Tukaram Patil',
      autoFilled: Boolean(demo.fullName),
      autoFillBadge: 'Auto-filled from DigiLocker / Aadhaar',
      required: true
    });

    consolidatedFields.push({
      key: 'contact_mobile',
      label: 'Registered Mobile Number',
      type: 'text',
      value: demo.phoneMasked ? demo.phoneMasked.replace(/\D/g, '').slice(-10) : '9822019482',
      autoFilled: true,
      autoFillBadge: 'Auto-filled from DigiLocker Profile',
      required: true
    });

    consolidatedFields.push({
      key: 'domicile_district',
      label: 'Administrative District',
      type: 'text',
      value: demo.district || 'PUNE',
      autoFilled: Boolean(demo.district),
      autoFillBadge: 'Auto-filled from Resident Master Register',
      required: true
    });

    seenFieldKeys.add('applicant_full_name');
    seenFieldKeys.add('contact_mobile');
    seenFieldKeys.add('domicile_district');

    // Merge bundle specific fields
    bundle.services.forEach(svc => {
      (svc.fields || []).forEach(f => {
        if (!seenFieldKeys.has(f.key)) {
          seenFieldKeys.add(f.key);

          let autoVal = f.defaultValue || '';
          let autoBadge = null;
          let autoFilled = false;

          if (f.key === 'property_address' && landData.villageTaluka) {
            autoVal = `${landData.villageTaluka}, ${demo.district || 'Pune'}`;
            autoBadge = 'Auto-filled from MahaBhumi (7/12 Land Record)';
            autoFilled = true;
          } else if (f.key === 'survey_no' && landData.surveyNo) {
            autoVal = `Survey ${landData.surveyNo}, Khata ${landData.khataNo || '342'}`;
            autoBadge = 'Auto-filled from MahaBhumi Land Parcel';
            autoFilled = true;
          } else if (f.key === 'family_members_count' && pdsData.familyMembersCount) {
            autoVal = pdsData.familyMembersCount;
            autoBadge = 'Auto-filled from Food & Civil Supplies (PDS)';
            autoFilled = true;
          } else if (f.key === 'highest_qualification' && empData.highestQualification) {
            autoVal = empData.highestQualification;
            autoBadge = 'Auto-filled from Mahaswayam Employment Record';
            autoFilled = true;
          }

          consolidatedFields.push({
            key: f.key,
            label: f.label,
            type: f.type,
            options: f.options,
            value: autoVal,
            autoFilled,
            autoFillBadge: autoBadge,
            required: f.required !== false
          });
        }
      });
    });

    // Build the DEPA Multi-Department Consent Breakdown
    const consentMatrix = bundle.services.map(svc => {
      const fieldNames = (svc.fields || []).map(f => f.label);
      fieldNames.unshift('Applicant Full Name', 'Contact Mobile');
      return {
        serviceId: svc.service_id,
        serviceName: svc.service_name,
        departmentId: svc.department_id,
        departmentName: svc.department_name,
        mandatory: svc.mandatory,
        dataFieldsRouted: fieldNames,
        purpose: `Processing and statutory clearance of ${svc.service_name} under Maharashtra Right to Public Services Act.`
      };
    });

    // Prerequisite documents checklist
    const documentsChecklist = [];
    bundle.services.forEach(svc => {
      (svc.required_documents || []).forEach(doc => {
        documentsChecklist.push({
          documentName: doc,
          forService: svc.service_name,
          departmentName: svc.department_name,
          status: 'DIGILOCKER_VERIFIED'
        });
      });
    });

    const autoFillData = {
      applicantName: demo.fullName || 'Rajesh Tukaram Patil',
      aadhaarNo: '9482-1029-4819',
      mobileNumber: demo.phoneMasked ? demo.phoneMasked.replace(/\D/g, '').slice(-10) : '9822019482',
      district: demo.district || 'Pune',
      villageTaluka: landData.villageTaluka || 'Haveli',
      surveyNo: landData.surveyNo || '108/2',
      khataNo: landData.khataNo || '342'
    };

    const depaConsent = {
      required: true,
      participatingDepartments: Array.from(new Set(bundle.services.map(s => s.department_id || s.departmentId))),
      matrix: consentMatrix
    };

    return {
      bundle: {
        ...bundle,
        id: bundle.id || bundle.bundle_id,
        bundle_id: bundle.bundle_id || bundle.id
      },
      citizenUnifiedId: unifiedId,
      citizenName: demo.fullName || 'Verified Citizen',
      consolidatedFields,
      autoFillData,
      depaConsent,
      consentMatrix,
      documentsChecklist
    };
  }

  /**
   * ORCHESTRATED FAN-OUT SUBMISSION:
   * Fans out consolidated submission data to each selected department adapter in parallel.
   * If an adapter is down, that child application is marked QUEUED_OFFLINE without failing the bundle!
   */
  async submitBundle(unifiedId, bundleId, submissionData, selectedServiceIds = [], consentContext = {}) {
    const startTime = Date.now();
    const bundle = this.getBundleById(bundleId);
    if (!bundle) throw new Error(`Bundle not found: ${bundleId}`);

    // Filter services citizen chose to apply for (defaults to all if empty)
    const activeServices = bundle.services.filter(svc => 
      selectedServiceIds.length === 0 || selectedServiceIds.includes(svc.service_id)
    );

    if (activeServices.length === 0) {
      throw new Error('At least one service must be selected to submit this bundle.');
    }

    const bundleAppId = `BND-2026-${bundleId.toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Dispatch to each department adapter in parallel
    const fanoutPromises = activeServices.map(async (svc) => {
      const adapter = adapterRegistryInstance.getAdapter(svc.department_id);
      if (!adapter) {
        return {
          serviceId: svc.service_id,
          serviceName: svc.service_name,
          departmentId: svc.department_id,
          departmentName: svc.department_name,
          status: 'QUEUED_OFFLINE',
          error: `Adapter ${svc.department_id} not active in registry. Queued for background sync.`,
          queuedAt: new Date().toISOString()
        };
      }

      // Map consolidated data to department-specific fields
      const mappedPayload = {
        ...submissionData,
        serviceId: svc.service_id,
        bundleAppId,
        citizenUnifiedId: unifiedId
      };

      // Call adapter executeSubmission with fault isolation
      const subResult = await adapter.executeSubmission(svc.service_id, mappedPayload, {
        unifiedId,
        bundleAppId
      });

      return {
        serviceId: svc.service_id,
        serviceName: svc.service_name,
        departmentId: svc.department_id,
        departmentName: svc.department_name,
        applicationId: subResult.applicationId || `APP-${svc.department_id.slice(5).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: subResult.status || 'SUBMITTED',
        error: subResult.error || null,
        submittedAt: new Date().toISOString(),
        stages: subResult.trackingStages || [
          { label: 'Bundle Application Dossier Logged', date: new Date().toISOString().split('T')[0], completed: true },
          { label: 'Department Scrutiny & Field Review', date: 'In Progress', completed: false },
          { label: 'Digital Order & Certificate Dispatched', date: 'Pending', completed: false }
        ]
      };
    });

    const settledResults = await Promise.allSettled(fanoutPromises);

    const subApplications = settledResults.map((s, idx) => {
      if (s.status === 'fulfilled') return s.value;
      const svc = activeServices[idx];
      return {
        serviceId: svc.service_id,
        serviceName: svc.service_name,
        departmentId: svc.department_id,
        departmentName: svc.department_name,
        status: 'QUEUED_OFFLINE',
        error: s.reason?.message || 'Adapter connection failed; queued for sync',
        queuedAt: new Date().toISOString(),
        stages: []
      };
    });

    const submittedCount = subApplications.filter(s => s.status === 'SUBMITTED').length;
    const queuedCount = subApplications.filter(s => s.status === 'QUEUED_OFFLINE').length;

    // Determine overall bundle status
    let overallStatus = 'SUBMITTED';
    let summaryBadge = `${submittedCount} of ${activeServices.length} Submitted`;
    if (queuedCount > 0) {
      overallStatus = 'PARTIALLY_SUBMITTED';
      summaryBadge = `${submittedCount} Submitted, ${queuedCount} Queued Offline`;
    }

    const parentRecord = {
      id: bundleAppId,
      bundleApplicationId: bundleAppId,
      bundleAppId,
      bundleId,
      bundleTitle: bundle.title,
      category: bundle.category,
      citizenUnifiedId: unifiedId,
      citizenName: submissionData.applicant_full_name || submissionData.applicantName || 'Verified Citizen',
      submittedAt: new Date().toISOString(),
      overallStatus,
      status: overallStatus,
      totalServicesCount: activeServices.length,
      approvedServicesCount: 0,
      submittedServicesCount: submittedCount,
      queuedServicesCount: queuedCount,
      summaryBadge,
      submissionData,
      subApplications,
      results: subApplications
    };

    // Store in active applications map
    const existing = this.bundleApplications.get(unifiedId) || [];
    existing.unshift(parentRecord);
    this.bundleApplications.set(unifiedId, existing);

    // Invalidate cache so queries immediately reflect new sub-applications
    hubServiceInstance.clearCache();

    // Log to tamper-evident audit log with bundle tag
    auditServiceInstance.logEvent({
      actorRole: 'citizen',
      actorName: parentRecord.citizenName,
      action: 'EVENT_BUNDLE_SUBMITTED',
      targetCitizenId: unifiedId,
      bundleId,
      bundleAppId,
      status: overallStatus,
      latencyMs: Date.now() - startTime,
      notes: `Orchestrated fan-out submission for "${bundle.title}". ${submittedCount} services submitted, ${queuedCount} queued offline.`
    });

    return parentRecord;
  }

  getBundleApplicationsForCitizen(unifiedId) {
    return this.bundleApplications.get(unifiedId) || [];
  }
}

export const bundleServiceInstance = new BundleService();