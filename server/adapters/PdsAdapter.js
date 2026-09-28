import { BaseAdapter } from './BaseAdapter.js';
import { pdsServiceInstance } from '../mock-departments/departmentServices.js';

/**
 * PdsAdapter: Food & Civil Supplies (Ration Card / PDS) Connector
 * 
 * Demonstrates:
 * 1. Native Authentication: OAuth2 Client Credentials Flow (Bearer Token)
 * 2. Schema Transformation:
 *    - Maps "beneficiary_id" & "ration_no" to canonical identifiers
 *    - Parses non-standard "dob" string (DD-MM-YYYY) into canonical ISO 8601 (YYYY-MM-DD)
 *    - Normalizes uppercase name "PATIL RAJESH T" into title case
 *    - Packages ration quota & card tier (PHH / AAY) into unified payload
 */
export class PdsAdapter extends BaseAdapter {
  constructor() {
    super({
      departmentId: 'dept-pds',
      departmentName: 'Food, Civil Supplies & Consumer Protection (PDS)',
      version: '2.1.0',
      authType: 'oauth2',
      description: 'Manages National Food Security Act (NFSA) ration cards, fair price shops & grain entitlements.',
      supportedIdentifiers: ['beneficiary_id', 'ration_no', 'phone']
    });

    this.clientId = 'pds_client_id_mh';
    this.clientSecret = 'pds_secret_key_2026';
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * OAuth2 Token Acquisition
   */
  async authenticate() {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiry) {
      return { headers: { Authorization: `Bearer ${this.cachedToken}` } };
    }

    // Call PDS OAuth2 endpoint
    const res = pdsServiceInstance.generateOAuthToken(this.clientId, this.clientSecret);
    this.cachedToken = res.access_token;
    this.tokenExpiry = now + (res.expires_in * 1000) - 60000;

    return { headers: { Authorization: `Bearer ${this.cachedToken}` } };
  }

  /**
   * Query native PDS backend
   */
  async fetchRawRecord(criteria, authContext) {
    const authHeader = authContext.headers.Authorization;
    return pdsServiceInstance.queryBeneficiary(authHeader, {
      beneficiary_id: criteria.localIdentifier?.value,
      ration_no: criteria.ration_no,
      phone: criteria.demographicMatch?.phone,
      name: criteria.demographicMatch?.name,
      dob: criteria.demographicMatch?.dobDdMmYyyy
    });
  }

  /**
   * Transforms raw PDS data to Unified Canonical Model
   */
  mapToUnified(raw) {
    // Transform DD-MM-YYYY to YYYY-MM-DD
    let isoDob = null;
    if (raw.dob && typeof raw.dob === 'string') {
      const parts = raw.dob.split('-');
      if (parts.length === 3) {
        isoDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Title case formatting for name
    const normalizedName = raw.head_of_family_name
      ? raw.head_of_family_name
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      : '';

    return {
      departmentCode: 'dept-pds',
      departmentName: this.metadata.departmentName,
      identifiers: [
        { type: 'beneficiary_id', value: raw.beneficiary_id, primary: true },
        { type: 'ration_no', value: raw.ration_no, primary: false }
      ],
      demographicsExtract: {
        fullName: normalizedName,
        dobIso: isoDob,
        phone: raw.contact_no,
        district: raw.district,
        taluka: raw.taluka
      },
      domainData: {
        rationCardNo: raw.ration_no,
        cardTier: raw.ration_card_type, // 'PHH' | 'AAY' | 'NPHH'
        familyMembersCount: raw.family_members_count,
        monthlyQuotaKg: raw.monthly_quota_kg,
        fairPriceShopId: raw.fps_shop_id,
        applicationStatus: raw.application_status,
        lastTransactionDate: raw.last_transaction_date
      }
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      await this.authenticate();
      return {
        healthy: !pdsServiceInstance.isDowntimeSimulated,
        latencyMs: Date.now() - start,
        error: pdsServiceInstance.isDowntimeSimulated ? 'Simulated Outage' : null
      };
    } catch (err) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  async submitNativeApplication(serviceCode, payload, authContext) {
    if (pdsServiceInstance.isDowntimeSimulated) {
      throw new Error('PDS Gateway Timeout (504): Food & Civil Supplies Core Portal is offline');
    }
    const appId = `APP-PDS-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      applicationId: appId,
      serviceTitle: 'Food & Civil Supplies Commercial Clearance NOC',
      trackingStages: [
        { label: 'Commercial Dossier Registered in PDS Hub', date: new Date().toISOString().split('T')[0], completed: true },
        { label: 'Fair Price Shop Quota Allocation Scrutiny', date: 'Pending', completed: false },
        { label: 'Commercial Food Supply Sanction Order', date: 'Pending', completed: false }
      ]
    };
  }
}
