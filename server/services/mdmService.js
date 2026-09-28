/**
 * Master Data Management (MDM) & Entity Resolution Service
 * 
 * Implements:
 * 1. Jaro-Winkler String Distance for Indian name variation matching
 * 2. ISO DOB normalization & comparison
 * 3. Match Confidence Scoring (0 - 100%)
 * 4. Human-In-The-Loop (HITL) Confirmation / Rejection Queue
 */

function jaroWinkler(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();

  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const sim = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix scaling (up to 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return sim + prefix * 0.1 * (1 - sim);
}

// Token Sort Ratio to handle "Patil Rajesh" vs "Rajesh Tukaram Patil"
function tokenSortSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const t1 = s1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');
  const t2 = s2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');
  return jaroWinkler(t1, t2);
}

export class MDMService {
  constructor() {
    // Canonical Master Entities mapped to local department records
    this.unifiedCitizens = new Map([
      [
        'EK-MH-849102',
        {
          unifiedId: 'EK-MH-849102',
          canonicalName: 'Rajesh Tukaram Patil',
          canonicalDob: '1985-08-14',
          canonicalGender: 'MALE',
          canonicalPhone: '9822019482',
          canonicalDistrict: 'PUNE',
          linkedRecords: {
            'dept-pds': { idType: 'beneficiary_id', idValue: 'PDS-MH-849102' },
            'dept-land-records': { idType: 'citizen_uid', idValue: 'LR-UID-990141' },
            'dept-employment': { idType: 'applicant_ref', idValue: 'EMP/MH/2023/00891' },
            'dept-mahadbt': { idType: 'dbt_reg_id', idValue: 'DBT-2026-992140' }
          },
          matchConfidence: 98,
          status: 'RESOLVED'
        }
      ],
      [
        'EK-MH-849103',
        {
          unifiedId: 'EK-MH-849103',
          canonicalName: 'Sunita Ramesh Deshmukh',
          canonicalDob: '1990-11-05',
          canonicalGender: 'FEMALE',
          canonicalPhone: '9823456711',
          canonicalDistrict: 'NAGPUR',
          linkedRecords: {
            'dept-pds': { idType: 'beneficiary_id', idValue: 'PDS-MH-849103' },
            'dept-land-records': { idType: 'citizen_uid', idValue: 'LR-UID-990142' },
            'dept-employment': { idType: 'applicant_ref', idValue: 'EMP/MH/2024/01142' },
            'dept-mahadbt': { idType: 'dbt_reg_id', idValue: 'DBT-2026-992141' }
          },
          matchConfidence: 96,
          status: 'RESOLVED'
        }
      ],
      [
        'EK-MH-849104',
        {
          unifiedId: 'EK-MH-849104',
          canonicalName: 'Amol Vitthal Shinde',
          canonicalDob: '1988-03-22',
          canonicalGender: 'MALE',
          canonicalPhone: '9765432109',
          canonicalDistrict: 'NASHIK',
          linkedRecords: {
            'dept-pds': { idType: 'beneficiary_id', idValue: 'PDS-MH-849104' },
            'dept-land-records': { idType: 'citizen_uid', idValue: 'LR-UID-990143' },
            'dept-employment': { idType: 'applicant_ref', idValue: 'EMP/MH/2024/01890' }
          },
          matchConfidence: 89,
          status: 'RESOLVED'
        }
      ]
    ]);

    // Human-In-The-Loop (HITL) Review Queue for ambiguous matches (60% - 84%)
    this.pendingMatchesQueue = [
      {
        matchId: 'HITL-2026-081',
        candidateA: {
          sourceDept: 'dept-pds',
          recordId: 'PDS-MH-849109',
          name: 'PAWAR SACHIN D',
          dob: '08-09-1992',
          district: 'SATARA',
          phone: '9822334455'
        },
        candidateB: {
          sourceDept: 'dept-employment',
          recordId: 'EMP/MH/2025/0009',
          name: 'Sachin Dnyanoba Pawar',
          dobIso: '1992-09-08',
          district: 'Satara',
          phone: '9822334455'
        },
        confidenceScore: 78,
        matchFactors: [
          { factor: 'Name Phonetic Match', score: 82, note: 'Initials "D" matches "Dnyanoba"' },
          { factor: 'Date of Birth', score: 100, note: 'Exact date match: 1992-09-08' },
          { factor: 'District & Phone', score: 100, note: 'Satara & identical mobile number' }
        ],
        status: 'PENDING_OFFICIAL_REVIEW',
        flaggedReason: 'Name format disparity between PDS abbreviation and full Employment register.'
      },
      {
        matchId: 'HITL-2026-082',
        candidateA: {
          sourceDept: 'dept-land-records',
          recordId: 'LR-UID-990144',
          name: 'Ganesh Balasaheb More',
          dobIso: '1979-01-10',
          district: 'KOLHAPUR',
          holdingArea: '0.85 Hec'
        },
        candidateB: {
          sourceDept: 'dept-pds',
          recordId: 'PDS-MH-849105',
          name: 'MORE GANESH B',
          dob: '10-01-1979',
          district: 'KOLHAPUR',
          phone: '9422001122'
        },
        confidenceScore: 74,
        matchFactors: [
          { factor: 'Name Token Match', score: 79, note: '"MORE GANESH B" matches "Ganesh Balasaheb More"' },
          { factor: 'DOB Match', score: 100, note: 'Identical birthday: 10 Jan 1979' },
          { factor: 'District', score: 100, note: 'Kolhapur' }
        ],
        status: 'PENDING_OFFICIAL_REVIEW',
        flaggedReason: 'Middle initial vs full name; PDS phone not yet linked to Land Record.'
      }
    ];
  }

  getUnifiedCitizen(unifiedId) {
    return this.unifiedCitizens.get(unifiedId) || null;
  }

  getAllUnifiedCitizens() {
    return Array.from(this.unifiedCitizens.values());
  }

  getHitlQueue() {
    return this.pendingMatchesQueue;
  }

  /**
   * Official confirms or rejects an uncertain match
   */
  resolveHitlMatch(matchId, decision, officialNotes, officialName) {
    const item = this.pendingMatchesQueue.find(m => m.matchId === matchId);
    if (!item) throw new Error('Match record not found in triage queue');

    item.status = decision === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED';
    item.resolvedBy = officialName || 'Senior Revenue Inspector';
    item.resolvedAt = new Date().toISOString();
    item.officialNotes = officialNotes;

    // If confirmed, link them into the unified master registry
    if (decision === 'CONFIRM') {
      const newUnifiedId = `EK-MH-${Math.floor(100000 + Math.random() * 900000)}`;
      this.unifiedCitizens.set(newUnifiedId, {
        unifiedId: newUnifiedId,
        canonicalName: item.candidateB.name || item.candidateA.name,
        canonicalDob: item.candidateB.dobIso || '1990-01-01',
        canonicalDistrict: item.candidateA.district || item.candidateB.district,
        linkedRecords: {
          [item.candidateA.sourceDept]: { idValue: item.candidateA.recordId },
          [item.candidateB.sourceDept]: { idValue: item.candidateB.recordId }
        },
        matchConfidence: item.confidenceScore,
        status: 'MANUALLY_CONFIRMED'
      });
      item.generatedUnifiedId = newUnifiedId;
    }

    return item;
  }

  /**
   * Real-time Entity Resolution Match Calculation
   */
  calculateSimilarity(profileA, profileB) {
    const nameSim = Math.max(
      jaroWinkler(profileA.name || '', profileB.name || ''),
      tokenSortSimilarity(profileA.name || '', profileB.name || '')
    );

    let dobSim = 0;
    if (profileA.dobIso && profileB.dobIso) {
      dobSim = profileA.dobIso === profileB.dobIso ? 1.0 : 0.0;
    }

    let districtSim = 0;
    if (profileA.district && profileB.district) {
      districtSim = profileA.district.toLowerCase() === profileB.district.toLowerCase() ? 1.0 : 0.0;
    }

    let phoneSim = 0;
    if (profileA.phone && profileB.phone) {
      phoneSim = profileA.phone === profileB.phone ? 1.0 : 0.0;
    }

    // Weighted composite score
    const weightedScore = Math.round(
      (nameSim * 0.40 + dobSim * 0.35 + districtSim * 0.15 + phoneSim * 0.10) * 100
    );

    return {
      overallScore: weightedScore,
      nameSim: Math.round(nameSim * 100),
      dobSim: Math.round(dobSim * 100),
      districtSim: Math.round(districtSim * 100),
      phoneSim: Math.round(phoneSim * 100)
    };
  }
}

export const mdmServiceInstance = new MDMService();
