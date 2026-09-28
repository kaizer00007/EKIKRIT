import crypto from 'crypto';
import { BaseAdapter } from './BaseAdapter.js';
import { landServiceInstance } from '../mock-departments/departmentServices.js';

/**
 * LandAdapter: MahaBhumi (Revenue & Land Records / 7-12 Portal) Connector
 * 
 * Demonstrates:
 * 1. Native Authentication: HMAC Signed Header (X-MahaBhumi-Signature)
 * 2. Schema Transformation:
 *    - Maps "citizen_uid" & "property_owner_id" to canonical identifiers
 *    - Parses standard ISO 8601 string ("1985-08-14T00:00:00.000Z") to "1985-08-14"
 *    - Normalizes land holding area and encumbrance classifications
 *    - Ingests application tracking timeline for the Unified Tracker
 */
export class LandAdapter extends BaseAdapter {
  constructor() {
    super({
      departmentId: 'dept-land-records',
      departmentName: 'Revenue Department (MahaBhumi Land Records)',
      version: '3.0.4',
      authType: 'hmac',
      description: 'Records land parcel ownership, 7/12 & 8-A mutation extracts, survey maps & encumbrances.',
      supportedIdentifiers: ['citizen_uid', 'property_owner_id', 'aadhaar_ref']
    });

    this.hmacSecret = 'mahabhumi_hmac_secret_4491';
  }

  /**
   * Generates timestamped cryptographic HMAC-SHA256 signature
   */
  async authenticate() {
    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', this.hmacSecret).update(timestamp).digest('hex');
    return {
      headers: {
        'x-mahabhumi-signature': signature,
        'x-mahabhumi-timestamp': timestamp
      }
    };
  }

  /**
   * Query native MahaBhumi records
   */
  async fetchRawRecord(criteria, authContext) {
    return landServiceInstance.queryLandRecord(authContext.headers, {
      citizen_uid: criteria.localIdentifier?.value,
      property_owner_id: criteria.property_owner_id,
      aadhaar_ref: criteria.aadhaar_ref,
      name: criteria.demographicMatch?.name
    });
  }

  /**
   * Transforms raw MahaBhumi land record to Unified Canonical Model
   */
  mapToUnified(raw) {
    let isoDob = null;
    if (raw.date_of_birth) {
      isoDob = raw.date_of_birth.substring(0, 10); // "1985-08-14"
    }

    return {
      departmentCode: 'dept-land-records',
      departmentName: this.metadata.departmentName,
      identifiers: [
        { type: 'citizen_uid', value: raw.citizen_uid, primary: true },
        { type: 'property_owner_id', value: raw.property_owner_id, primary: false },
        { type: 'aadhaar_ref', value: raw.aadhaar_ref, primary: false }
      ],
      demographicsExtract: {
        fullName: raw.owner_full_name,
        dobIso: isoDob,
        district: raw.district,
        villageTaluka: raw.village_taluka
      },
      domainData: {
        propertyOwnerId: raw.property_owner_id,
        khataNo: raw.khatano,
        surveyNo: raw.survey_no,
        totalAreaHectares: raw.area_hec,
        landClassification: raw.land_type,
        encumbranceStatus: raw.encumbrance_status,
        mutationStatus: raw.mutation_status,
        applicationTracking: raw.application_tracking || null
      }
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      const auth = await this.authenticate();
      landServiceInstance.verifyHmacSignature(auth.headers);
      return {
        healthy: !landServiceInstance.isDowntimeSimulated,
        latencyMs: Date.now() - start,
        error: landServiceInstance.isDowntimeSimulated ? 'Simulated Outage' : null
      };
    } catch (err) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  async submitNativeApplication(serviceCode, payload, authContext) {
    if (landServiceInstance.isDowntimeSimulated) {
      throw new Error('MahaBhumi Server Error (503): Land Records Bhoomi Node connection refused');
    }
    const appId = `APP-LAND-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      applicationId: appId,
      serviceTitle: 'Commercial Land Use & 7/12 Verification',
      trackingStages: [
        { label: '7/12 Mutation Dossier Logged', date: new Date().toISOString().split('T')[0], completed: true },
        { label: 'Tehsildar Zoning & NA Inspection', date: 'Pending', completed: false },
        { label: 'Digital Land Use NOC Endorsed', date: 'Pending', completed: false }
      ]
    };
  }
}
