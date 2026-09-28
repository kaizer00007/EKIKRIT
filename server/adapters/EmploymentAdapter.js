import { BaseAdapter } from './BaseAdapter.js';
import { employmentServiceInstance } from '../mock-departments/departmentServices.js';

/**
 * EmploymentAdapter: Mahaswayam (Skill Dev & Employment Exchange) Connector
 * 
 * Demonstrates:
 * 1. Native Authentication: Static API Key Header (X-Department-Key)
 * 2. Schema Transformation:
 *    - Maps "applicant_ref" and "aadhar_no" to canonical identifiers
 *    - Converts Unix epoch timestamp in seconds (e.g. 492825600) into ISO 8601 "1985-08-14"
 *    - Maps enrolled skill schemes (PMEGP, CMEGP) and declared income
 *    - Feeds application tracking stages into the Unified Tracker
 */
export class EmploymentAdapter extends BaseAdapter {
  constructor() {
    super({
      departmentId: 'dept-employment',
      departmentName: 'Skill Development, Employment & Entrepreneurship (Mahaswayam)',
      version: '1.8.2',
      authType: 'api_key',
      description: 'Coordinates employment exchanges, vocational training, apprentice drives & youth subsidies.',
      supportedIdentifiers: ['applicant_ref', 'aadhar_no', 'mobile']
    });

    this.apiKey = 'emp_live_secret_key_8892';
  }

  /**
   * Static API Key Authentication
   */
  async authenticate() {
    return {
      headers: {
        'x-department-key': this.apiKey
      }
    };
  }

  /**
   * Query native Mahaswayam records
   */
  async fetchRawRecord(criteria, authContext) {
    return employmentServiceInstance.queryCandidate(authContext.headers, {
      applicant_ref: criteria.localIdentifier?.value,
      aadhar_no: criteria.aadhar_no,
      mobile: criteria.demographicMatch?.phone,
      name: criteria.demographicMatch?.name
    });
  }

  /**
   * Transforms raw Employment candidate record to Unified Canonical Model
   */
  mapToUnified(raw) {
    // Transform Unix timestamp in seconds to ISO 8601 Date
    let isoDob = null;
    if (raw.birth_date && typeof raw.birth_date === 'number') {
      const dateObj = new Date(raw.birth_date * 1000);
      isoDob = dateObj.toISOString().split('T')[0]; // "1985-08-14"
    }

    return {
      departmentCode: 'dept-employment',
      departmentName: this.metadata.departmentName,
      identifiers: [
        { type: 'applicant_ref', value: raw.applicant_ref, primary: true },
        { type: 'aadhar_no', value: raw.aadhar_no, primary: false }
      ],
      demographicsExtract: {
        fullName: raw.candidate_name,
        dobIso: isoDob,
        phone: raw.mobile_contact,
        district: raw.district,
        state: raw.domicile_state
      },
      domainData: {
        applicantReference: raw.applicant_ref,
        highestQualification: raw.qualification,
        employmentStatus: raw.employment_status,
        enrolledSchemes: raw.applied_schemes || [],
        annualDeclaredIncomeInr: raw.annual_income,
        applicationTracking: raw.application_tracking || null
      }
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      const auth = await this.authenticate();
      employmentServiceInstance.verifyApiKey(auth.headers);
      return {
        healthy: !employmentServiceInstance.isDowntimeSimulated,
        latencyMs: Date.now() - start,
        error: employmentServiceInstance.isDowntimeSimulated ? 'Simulated Outage' : null
      };
    } catch (err) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  async submitNativeApplication(serviceCode, payload, authContext) {
    if (employmentServiceInstance.isDowntimeSimulated) {
      throw new Error('Mahaswayam Database Timeout (504): Employment Exchange cluster unreachable');
    }
    const appId = `APP-EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const isStaff = serviceCode === 'srv_staff_welfare';
    return {
      applicationId: appId,
      serviceTitle: isStaff ? 'Staff Labour & Apprentice Quota Setup' : 'Trade & Establishment License',
      trackingStages: [
        { label: isStaff ? 'Labour Roll Declaration Ingested' : 'Trade License Dossier Ingested', date: new Date().toISOString().split('T')[0], completed: true },
        { label: 'Labour Officer Verification', date: 'Pending', completed: false },
        { label: 'Establishment Sanction Order', date: 'Pending', completed: false }
      ]
    };
  }
}
