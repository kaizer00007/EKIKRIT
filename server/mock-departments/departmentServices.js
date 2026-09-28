import crypto from 'crypto';
import { pdsBeneficiaries, landRecords, employmentRecords, mahadbtRecords } from './seedData.js';

/**
 * SIMULATED DEPARTMENT 1: PDS (Food & Civil Supplies)
 * Native Auth: OAuth2 Client Credentials
 */
export class MockPdsDepartmentService {
  constructor() {
    this.clientId = 'pds_client_id_mh';
    this.clientSecret = 'pds_secret_key_2026';
    this.validTokens = new Set();
    this.records = [...pdsBeneficiaries];
    this.isDowntimeSimulated = false;
  }

  generateOAuthToken(clientId, clientSecret) {
    if (clientId !== this.clientId || clientSecret !== this.clientSecret) {
      throw new Error('PDS OAuth2: Invalid Client Credentials');
    }
    const token = 'pds_oauth_' + crypto.randomBytes(16).toString('hex');
    this.validTokens.add(token);
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  validateToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('PDS: Missing or malformed Authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    if (!this.validTokens.has(token)) {
      throw new Error('PDS: Invalid or expired Bearer Token');
    }
  }

  queryBeneficiary(authHeader, criteria) {
    if (this.isDowntimeSimulated) {
      throw new Error('PDS Gateway Timeout (504): Food & Civil Supplies Core Portal is unresponsive');
    }
    this.validateToken(authHeader);

    const { beneficiary_id, ration_no, name, dob, phone } = criteria || {};

    const record = this.records.find(b => {
      if (beneficiary_id && b.beneficiary_id.toLowerCase() === beneficiary_id.toLowerCase()) return true;
      if (ration_no && b.ration_no.toLowerCase() === ration_no.toLowerCase()) return true;
      if (phone && b.contact_no === phone) return true;
      if (name && dob && b.head_of_family_name.toLowerCase().includes(name.toLowerCase()) && b.dob === dob) return true;
      return false;
    });

    return record ? JSON.parse(JSON.stringify(record)) : null;
  }
}

/**
 * SIMULATED DEPARTMENT 2: MahaBhumi (Revenue & Land Records)
 * Native Auth: HMAC Signed Header (X-MahaBhumi-Signature)
 */
export class MockLandRecordsDepartmentService {
  constructor() {
    this.hmacSecret = 'mahabhumi_hmac_secret_4491';
    this.records = [...landRecords];
    this.isDowntimeSimulated = false;
  }

  verifyHmacSignature(headers) {
    const signature = headers['x-mahabhumi-signature'] || headers['X-MahaBhumi-Signature'];
    const timestamp = headers['x-mahabhumi-timestamp'] || headers['X-MahaBhumi-Timestamp'];
    if (!signature || !timestamp) {
      throw new Error('MahaBhumi: Missing X-MahaBhumi-Signature or Timestamp header');
    }
    const expected = crypto.createHmac('sha256', this.hmacSecret).update(timestamp.toString()).digest('hex');
    if (signature !== expected) {
      throw new Error('MahaBhumi: HMAC Signature Mismatch - Unauthorized Request');
    }
  }

  queryLandRecord(headers, criteria) {
    if (this.isDowntimeSimulated) {
      throw new Error('MahaBhumi Server Error (503): Land Records Bhoomi Node connection refused');
    }
    this.verifyHmacSignature(headers);

    const { citizen_uid, property_owner_id, aadhaar_ref, name } = criteria || {};

    const record = this.records.find(r => {
      if (citizen_uid && r.citizen_uid.toLowerCase() === citizen_uid.toLowerCase()) return true;
      if (property_owner_id && r.property_owner_id.toLowerCase() === property_owner_id.toLowerCase()) return true;
      if (aadhaar_ref && r.aadhaar_ref === aadhaar_ref) return true;
      if (name && r.owner_full_name.toLowerCase().includes(name.toLowerCase())) return true;
      return false;
    });

    return record ? JSON.parse(JSON.stringify(record)) : null;
  }
}

/**
 * SIMULATED DEPARTMENT 3: Mahaswayam (Skill Dev & Employment Exchange)
 * Native Auth: Static Department API Key (X-Department-Key)
 */
export class MockEmploymentDepartmentService {
  constructor() {
    this.apiKey = 'emp_live_secret_key_8892';
    this.records = [...employmentRecords];
    this.isDowntimeSimulated = false;
  }

  verifyApiKey(headers) {
    const key = headers['x-department-key'] || headers['X-Department-Key'];
    if (!key || key !== this.apiKey) {
      throw new Error('Mahaswayam: Missing or Invalid X-Department-Key API Key');
    }
  }

  queryCandidate(headers, criteria) {
    if (this.isDowntimeSimulated) {
      throw new Error('Mahaswayam Database Timeout (504): Employment Exchange cluster unreachable');
    }
    this.verifyApiKey(headers);

    const { applicant_ref, aadhar_no, name, mobile } = criteria || {};

    const record = this.records.find(c => {
      if (applicant_ref && c.applicant_ref.toLowerCase() === applicant_ref.toLowerCase()) return true;
      if (aadhar_no && c.aadhar_no === aadhar_no) return true;
      if (mobile && c.mobile_contact === mobile) return true;
      if (name && c.candidate_name.toLowerCase().includes(name.toLowerCase())) return true;
      return false;
    });

    return record ? JSON.parse(JSON.stringify(record)) : null;
  }
}

/**
 * SIMULATED DEPARTMENT 4: MahaDBT (Direct Benefit Transfer & Social Welfare)
 * Native Auth: Dynamic Custom Auth Token / API Key
 * Ready for the live judge demonstration of onboarding a 4th system live!
 */
export class MockMahaDBTDepartmentService {
  constructor() {
    this.apiKey = 'dbt_live_key_9921';
    this.records = [...mahadbtRecords];
    this.isDowntimeSimulated = false;
  }

  verifyAuth(headers) {
    const auth = headers['authorization'] || headers['Authorization'];
    if (!auth || auth !== `Bearer ${this.apiKey}`) {
      throw new Error('MahaDBT: Unauthorized - Invalid Social Welfare API Key');
    }
  }

  queryBeneficiary(headers, criteria) {
    if (this.isDowntimeSimulated) {
      throw new Error('MahaDBT Node Unavailable (503): DBT Public Fund Management server offline');
    }
    this.verifyAuth(headers);

    const { dbt_reg_id, aadhaar_hash, name } = criteria || {};

    const record = this.records.find(d => {
      if (dbt_reg_id && d.dbt_reg_id.toLowerCase() === dbt_reg_id.toLowerCase()) return true;
      if (aadhaar_hash && d.beneficiary_aadhaar_hash === aadhaar_hash) return true;
      if (name && d.applicant_legal_name.toLowerCase().includes(name.toLowerCase())) return true;
      return false;
    });

    return record ? JSON.parse(JSON.stringify(record)) : null;
  }
}

// Singletons representing the live external department backends
export const pdsServiceInstance = new MockPdsDepartmentService();
export const landServiceInstance = new MockLandRecordsDepartmentService();
export const employmentServiceInstance = new MockEmploymentDepartmentService();
export const mahadbtServiceInstance = new MockMahaDBTDepartmentService();
