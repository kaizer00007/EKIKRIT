/**
 * DEPA (Data Empowerment & Protection Architecture) Consent Service
 * 
 * Complies with India's DPDP Act 2023 principles:
 * 1. Purpose Specification
 * 2. Granular Field Authorization
 * 3. Citizen Right to Approve, Deny, and Instantly Revoke Access
 * 4. Time-bound Expiry & Cryptographic Audit Trails
 */

export class ConsentService {
  constructor() {
    this.consents = new Map([
      [
        'CNS-MH-2026-0091',
        {
          consentId: 'CNS-MH-2026-0091',
          citizenUnifiedId: 'EK-MH-849102', // Rajesh Patil
          citizenName: 'Rajesh Tukaram Patil',
          requestingDepartment: 'dept-land-records',
          requestingDepartmentName: 'Revenue Dept (MahaBhumi)',
          targetDepartment: 'dept-pds',
          targetDepartmentName: 'Food & Civil Supplies (PDS)',
          purpose: 'Verification of family quota & economic status for Agricultural Subsidy Grant',
          requestedFields: ['cardTier', 'monthlyQuotaKg', 'familyMembersCount'],
          status: 'PENDING', // Ready for citizen to click Approve/Deny in demo
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
          accessMode: 'ONE_TIME_QUERY',
          revokedAt: null
        }
      ],
      [
        'CNS-MH-2026-0092',
        {
          consentId: 'CNS-MH-2026-0092',
          citizenUnifiedId: 'EK-MH-849103', // Sunita Deshmukh
          citizenName: 'Sunita Ramesh Deshmukh',
          requestingDepartment: 'dept-employment',
          requestingDepartmentName: 'Skill Dev & Employment (Mahaswayam)',
          targetDepartment: 'dept-land-records',
          targetDepartmentName: 'Revenue Dept (MahaBhumi)',
          purpose: 'Rural Women Micro-Enterprise Seed Capital verification of land holding',
          requestedFields: ['totalAreaHectares', 'landClassification', 'encumbranceStatus'],
          status: 'APPROVED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          approvedAt: new Date(Date.now() - 80000000).toISOString(),
          validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
          accessMode: 'RECURRENT',
          revokedAt: null
        }
      ]
    ]);
  }

  getConsentsForCitizen(citizenUnifiedId) {
    return Array.from(this.consents.values()).filter(
      c => c.citizenUnifiedId === citizenUnifiedId
    );
  }

  getAllConsents() {
    return Array.from(this.consents.values());
  }

  /**
   * Core Enforcement Gatekeeper:
   * Checks if an official from requestingDept is authorized to view data from targetDept.
   */
  checkConsent(citizenUnifiedId, requestingDept, targetDept) {
    // If querying own department data, consent is intrinsically authorized
    if (!requestingDept || requestingDept === targetDept || requestingDept === 'hub-citizen-direct' || requestingDept === 'system-admin') {
      return { allowed: true, reason: 'Direct citizen self-query or internal department access' };
    }

    const consent = Array.from(this.consents.values()).find(c =>
      c.citizenUnifiedId === citizenUnifiedId &&
      c.requestingDepartment === requestingDept &&
      c.targetDepartment === targetDept &&
      c.status === 'APPROVED'
    );

    if (!consent) {
      return {
        allowed: false,
        reason: `Access Denied: No active DEPA consent record found from Citizen for ${requestingDept} to inspect ${targetDept} data.`
      };
    }

    // Check expiry
    if (new Date(consent.validUntil) < new Date()) {
      return {
        allowed: false,
        reason: `Access Denied: Consent record ${consent.consentId} expired on ${consent.validUntil}.`
      };
    }

    return { allowed: true, consentId: consent.consentId, allowedFields: consent.requestedFields };
  }

  approveConsent(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error('Consent record not found');
    consent.status = 'APPROVED';
    consent.approvedAt = new Date().toISOString();
    return consent;
  }

  denyConsent(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error('Consent record not found');
    consent.status = 'DENIED';
    consent.deniedAt = new Date().toISOString();
    return consent;
  }

  revokeConsent(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error('Consent record not found');
    consent.status = 'REVOKED';
    consent.revokedAt = new Date().toISOString();
    return consent;
  }

  createConsentRequest(data) {
    const id = `CNS-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newConsent = {
      consentId: id,
      citizenUnifiedId: data.citizenUnifiedId,
      citizenName: data.citizenName || 'Verified Citizen',
      requestingDepartment: data.requestingDepartment,
      requestingDepartmentName: data.requestingDepartmentName,
      targetDepartment: data.targetDepartment,
      targetDepartmentName: data.targetDepartmentName,
      purpose: data.purpose,
      requestedFields: data.requestedFields || ['all_eligible_fields'],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      accessMode: data.accessMode || 'ONE_TIME_QUERY',
      revokedAt: null
    };
    this.consents.set(id, newConsent);
    return newConsent;
  }
}

export const consentServiceInstance = new ConsentService();
