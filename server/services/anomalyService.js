/**
 * Cross-Department Anomaly & Duplicate Claim Detection Service
 * 
 * Inspects synthesized multi-department records in real-time to detect
 * eligibility contradictions, welfare leakages, and double-dipping.
 */

export class AnomalyService {
  detectAnomalies(unifiedProfile) {
    const anomalies = [];
    const deptRecords = unifiedProfile.departmentRecords || {};

    const pds = deptRecords['dept-pds']?.data?.domainData;
    const land = deptRecords['dept-land-records']?.data?.domainData;
    const emp = deptRecords['dept-employment']?.data?.domainData;
    const mahadbt = deptRecords['dept-mahadbt']?.data?.domainData;

    // RULE 1: Antyodaya (BPL) Ration Card vs Large Agricultural Land Ownership
    if (pds && land) {
      if (pds.cardTier === 'AAY' && land.totalAreaHectares > 2.0) {
        anomalies.push({
          id: 'ANOM-2026-001',
          ruleCode: 'INCOME_ASSET_DISPARITY',
          severity: 'HIGH',
          title: 'High-Risk Welfare Ceiling Conflict: Antyodaya vs Irrigated Land',
          description: `Citizen is enrolled under Antyodaya Anna Yojana (AAY - extreme poverty tier receiving 35kg subsidized grain), but MahaBhumi revenue records verify ownership of ${land.totalAreaHectares} Hectares of ${land.landClassification} land.`,
          evidence: {
            pdsBenefit: `Card #${pds.rationCardNo} (AAY - 35kg/mo)`,
            landHolding: `${land.totalAreaHectares} Ha at Survey ${land.surveyNo}, Khata ${land.khataNo}`
          },
          recommendedAction: 'Trigger physical field verification by Tehsildar & issue notice for ration card category revision.'
        });
      }
    }

    // RULE 2: Unemployed Youth Stipend vs Active Disbursed Entrepreneurship Grant
    if (emp && mahadbt) {
      if (emp.employmentStatus === 'Seeking Employment' && mahadbt.grantStatus === 'DISBURSED' && mahadbt.disbursedAmountInr > 30000) {
        anomalies.push({
          id: 'ANOM-2026-002',
          ruleCode: 'DUPLICATE_SUBSIDY_BENEFIT',
          severity: 'MEDIUM',
          title: 'Duplicate Welfare Claim: Unemployed Status vs Active Commercial Grant',
          description: `Citizen declared "Seeking Employment" on Mahaswayam with declared income under threshold, but MahaDBT confirms disbursal of Rs. ${mahadbt.disbursedAmountInr.toLocaleString('en-IN')} for ${mahadbt.schemeTitle}.`,
          evidence: {
            employmentRef: emp.applicantReference,
            dbtDisbursal: `Rs. ${mahadbt.disbursedAmountInr} on ${mahadbt.disbursalDate}`
          },
          recommendedAction: 'Cross-verify business registration with District Industries Centre (DIC).'
        });
      }
    }

    return anomalies;
  }
}

export const anomalyServiceInstance = new AnomalyService();
