/**
 * Synthetic Seed Data for 3 Simulated Maharashtra Government Departments
 * + 1 Dynamic 4th Department (MahaDBT Social Welfare)
 * 
 * Each department has intentionally inconsistent schemas, divergent date formats,
 * unique primary keys, and realistic name variations for Entity Resolution testing.
 */

export const pdsBeneficiaries = [
  {
    beneficiary_id: "PDS-MH-849102",
    ration_no: "RC-27-04-987101",
    head_of_family_name: "PATIL RAJESH T",
    dob: "14-08-1985", // DD-MM-YYYY format
    ration_card_type: "AAY", // Antyodaya (BPL) - Intentionally triggers anomaly with Land Records!
    family_members_count: 4,
    monthly_quota_kg: 35,
    fps_shop_id: "FPS-PN-042",
    district: "PUNE",
    taluka: "Haveli",
    contact_no: "9822019482",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-28"
  },
  {
    beneficiary_id: "PDS-MH-849103",
    ration_no: "RC-27-04-987102",
    head_of_family_name: "DESHMUKH SUNITA R",
    dob: "05-11-1990",
    ration_card_type: "PHH", // Priority Household
    family_members_count: 3,
    monthly_quota_kg: 15,
    fps_shop_id: "FPS-NG-108",
    district: "NAGPUR",
    taluka: "Nagpur Urban",
    contact_no: "9823456711",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-25"
  },
  {
    beneficiary_id: "PDS-MH-849104",
    ration_no: "RC-27-04-987103",
    head_of_family_name: "SHINDE AMOL VITTHAL",
    dob: "22-03-1988",
    ration_card_type: "NPHH", // Non-Priority Household
    family_members_count: 5,
    monthly_quota_kg: 20,
    fps_shop_id: "FPS-NS-014",
    district: "NASHIK",
    taluka: "Dindori",
    contact_no: "9765432109",
    application_status: "UNDER_REVIEW",
    last_transaction_date: "2026-07-15"
  },
  {
    beneficiary_id: "PDS-MH-849105",
    ration_no: "RC-27-04-987104",
    head_of_family_name: "MORE GANESH B",
    dob: "10-01-1979",
    ration_card_type: "PHH",
    family_members_count: 4,
    monthly_quota_kg: 20,
    fps_shop_id: "FPS-KL-089",
    district: "KOLHAPUR",
    taluka: "Karveer",
    contact_no: "9422001122",
    application_status: "APPROVED",
    last_transaction_date: "2026-09-02"
  },
  {
    beneficiary_id: "PDS-MH-849106",
    ration_no: "RC-27-04-987105",
    head_of_family_name: "KULKARNI PRIYA S",
    dob: "19-07-1994",
    ration_card_type: "PHH",
    family_members_count: 2,
    monthly_quota_kg: 10,
    fps_shop_id: "FPS-CSN-055",
    district: "CHHATRAPATI_SAMBHAJINAGAR",
    taluka: "Paithan",
    contact_no: "9890123456",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-30"
  },
  {
    beneficiary_id: "PDS-MH-849107",
    ration_no: "RC-27-04-987106",
    head_of_family_name: "JADHAV SURESH N",
    dob: "30-12-1982",
    ration_card_type: "AAY",
    family_members_count: 6,
    monthly_quota_kg: 35,
    fps_shop_id: "FPS-SL-023",
    district: "SOLAPUR",
    taluka: "North Solapur",
    contact_no: "9970112233",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-20"
  },
  {
    beneficiary_id: "PDS-MH-849108",
    ration_no: "RC-27-04-987107",
    head_of_family_name: "GAIKWAD REKHA S",
    dob: "15-05-1987",
    ration_card_type: "PHH",
    family_members_count: 3,
    monthly_quota_kg: 15,
    fps_shop_id: "FPS-TH-119",
    district: "THANE",
    taluka: "Kalyan",
    contact_no: "9821998877",
    application_status: "APPROVED",
    last_transaction_date: "2026-09-01"
  },
  {
    beneficiary_id: "PDS-MH-849109",
    ration_no: "RC-27-04-987108",
    head_of_family_name: "PAWAR SACHIN D",
    dob: "08-09-1992",
    ration_card_type: "PHH",
    family_members_count: 4,
    monthly_quota_kg: 20,
    fps_shop_id: "FPS-ST-044",
    district: "SATARA",
    taluka: "Karad",
    contact_no: "9822334455",
    application_status: "SUBMITTED",
    last_transaction_date: "2026-08-10"
  },
  {
    beneficiary_id: "PDS-MH-849110",
    ration_no: "RC-27-04-987109",
    head_of_family_name: "CHAVAN KAVITA A",
    dob: "25-04-1991",
    ration_card_type: "PHH",
    family_members_count: 3,
    monthly_quota_kg: 15,
    fps_shop_id: "FPS-AM-012",
    district: "AMRAVATI",
    taluka: "Achalpur",
    contact_no: "9823114477",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-29"
  },
  {
    beneficiary_id: "PDS-MH-849111",
    ration_no: "RC-27-04-987110",
    head_of_family_name: "JOSHI DEEPAK M",
    dob: "03-06-1980",
    ration_card_type: "NPHH",
    family_members_count: 4,
    monthly_quota_kg: 20,
    fps_shop_id: "FPS-PN-067",
    district: "PUNE",
    taluka: "Shirur",
    contact_no: "9822556677",
    application_status: "APPROVED",
    last_transaction_date: "2026-08-18"
  }
];

// Additional synthetic records to reach 35+
for (let i = 12; i <= 36; i++) {
  const pad = i.toString().padStart(2, '0');
  const d = (1 + (i % 28)).toString().padStart(2, '0');
  const m = (1 + (i % 12)).toString().padStart(2, '0');
  const y = 1970 + (i % 30);
  pdsBeneficiaries.push({
    beneficiary_id: `PDS-MH-8491${pad}`,
    ration_no: `RC-27-04-9871${pad}`,
    head_of_family_name: `CITIZEN SAMPLE ${pad}`,
    dob: `${d}-${m}-${y}`,
    ration_card_type: i % 3 === 0 ? "AAY" : "PHH",
    family_members_count: 2 + (i % 5),
    monthly_quota_kg: 15 + (i % 20),
    fps_shop_id: `FPS-MH-${100 + i}`,
    district: ["PUNE", "NAGPUR", "NASHIK", "KOLHAPUR", "THANE"][i % 5],
    taluka: "General Taluka",
    contact_no: `982200${1000 + i}`,
    application_status: "APPROVED",
    last_transaction_date: "2026-08-15"
  });
}

export const landRecords = [
  {
    citizen_uid: "LR-UID-990141",
    property_owner_id: "7-12-PN-HAV-4912",
    owner_full_name: "Rajesh Tukaram Patil", // Full formal Marathi name
    date_of_birth: "1985-08-14T00:00:00.000Z", // ISO 8601
    khatano: "342",
    survey_no: "142/2A",
    area_hec: 12.8, // 12.8 Hectares Irrigated Land! Triggers Anomaly with AAY Ration card!
    land_type: "Bagayat (Irrigated)",
    encumbrance_status: "CLEAR",
    village_taluka: "Wagholi, Haveli, Pune",
    district: "PUNE",
    aadhaar_ref: "XXXX-XXXX-9482",
    mutation_status: "MUTATION_RECORDED",
    application_tracking: {
      application_id: "LR-MUT-2026-0041",
      service_name: "7/12 Digital Land Mutation Extract",
      current_stage: "APPROVED",
      stage_history: [
        { stage: "Submitted to Talathi", timestamp: "2026-07-01T10:00:00Z" },
        { stage: "Tehsildar Inspection Completed", timestamp: "2026-07-10T14:30:00Z" },
        { stage: "Mutation Order Approved & Signed", timestamp: "2026-07-15T16:00:00Z" }
      ]
    }
  },
  {
    citizen_uid: "LR-UID-990142",
    property_owner_id: "7-12-NG-URB-1184",
    owner_full_name: "Sunita Ramesh Deshmukh",
    date_of_birth: "1990-11-05T00:00:00.000Z",
    khatano: "108",
    survey_no: "56/1B",
    area_hec: 1.45,
    land_type: "Jirayat (Dryland)",
    encumbrance_status: "MORTGAGE_BOI",
    village_taluka: "Kamptee, Nagpur Urban, Nagpur",
    district: "NAGPUR",
    aadhaar_ref: "XXXX-XXXX-6711",
    mutation_status: "MUTATION_RECORDED",
    application_tracking: {
      application_id: "LR-MUT-2026-0042",
      service_name: "Farmer Crop Loan NOC & 8-A Extract",
      current_stage: "APPROVED",
      stage_history: [
        { stage: "Application Submitted", timestamp: "2026-08-01T09:00:00Z" },
        { stage: "Bank Verification Completed", timestamp: "2026-08-05T11:00:00Z" },
        { stage: "Digital NOC Issued", timestamp: "2026-08-08T15:00:00Z" }
      ]
    }
  },
  {
    citizen_uid: "LR-UID-990143",
    property_owner_id: "7-12-NS-DIN-8821",
    owner_full_name: "Amol V. Shinde",
    date_of_birth: "1988-03-22T00:00:00.000Z",
    khatano: "77",
    survey_no: "89/4",
    area_hec: 2.1,
    land_type: "Bagayat (Grape Vineyard)",
    encumbrance_status: "CLEAR",
    village_taluka: "Vani, Dindori, Nashik",
    district: "NASHIK",
    aadhaar_ref: "XXXX-XXXX-2109",
    mutation_status: "UNDER_INSPECTION",
    application_tracking: {
      application_id: "LR-MUT-2026-0043",
      service_name: "Horticulture Subsidy Land Partition",
      current_stage: "UNDER_REVIEW",
      stage_history: [
        { stage: "Partition Deed Submitted", timestamp: "2026-08-12T11:30:00Z" },
        { stage: "Circle Officer Field Measurement Scheduled", timestamp: "2026-08-20T10:00:00Z" }
      ]
    }
  },
  {
    citizen_uid: "LR-UID-990144",
    property_owner_id: "7-12-KL-KAR-3319",
    owner_full_name: "Ganesh Balasaheb More",
    date_of_birth: "1979-01-10T00:00:00.000Z",
    khatano: "419",
    survey_no: "12/3",
    area_hec: 0.85,
    land_type: "Jirayat",
    encumbrance_status: "CLEAR",
    village_taluka: "Uchgaon, Karveer, Kolhapur",
    district: "KOLHAPUR",
    aadhaar_ref: "XXXX-XXXX-1122",
    mutation_status: "MUTATION_RECORDED",
    application_tracking: {
      application_id: "LR-MUT-2026-0044",
      service_name: "7/12 Name Correction",
      current_stage: "APPROVED",
      stage_history: [
        { stage: "Request Logged", timestamp: "2026-07-20T08:00:00Z" },
        { stage: "Revenue Record Updated", timestamp: "2026-07-26T12:00:00Z" }
      ]
    }
  },
  {
    citizen_uid: "LR-UID-990145",
    property_owner_id: "7-12-CSN-PAI-0912",
    owner_full_name: "Priya S. Kulkarni",
    date_of_birth: "1994-07-19T00:00:00.000Z",
    khatano: "201",
    survey_no: "33/7",
    area_hec: 1.1,
    land_type: "Bagayat",
    encumbrance_status: "CLEAR",
    village_taluka: "Bidkin, Paithan, Sambhajinagar",
    district: "CHHATRAPATI_SAMBHAJINAGAR",
    aadhaar_ref: "XXXX-XXXX-3456",
    mutation_status: "MUTATION_RECORDED",
    application_tracking: {
      application_id: "LR-MUT-2026-0045",
      service_name: "Agricultural Drip Irrigation Clearance",
      current_stage: "APPROVED",
      stage_history: [
        { stage: "Application Submitted", timestamp: "2026-08-10T09:00:00Z" },
        { stage: "Approved by Agriculture Officer", timestamp: "2026-08-18T14:00:00Z" }
      ]
    }
  }
];

// Seed land records to 35+
for (let i = 6; i <= 36; i++) {
  const pad = i.toString().padStart(2, '0');
  landRecords.push({
    citizen_uid: `LR-UID-9901${pad}`,
    property_owner_id: `7-12-MH-DIS-${4900 + i}`,
    owner_full_name: `Landholder Resident ${pad}`,
    date_of_birth: `1980-05-${(1 + (i % 25)).toString().padStart(2, '0')}T00:00:00.000Z`,
    khatano: `${100 + i}`,
    survey_no: `${i}/2`,
    area_hec: Number((0.5 + (i * 0.2)).toFixed(2)),
    land_type: i % 2 === 0 ? "Bagayat (Irrigated)" : "Jirayat",
    encumbrance_status: "CLEAR",
    village_taluka: "Maha Village, Maharashtra",
    district: ["PUNE", "NAGPUR", "NASHIK", "KOLHAPUR", "THANE"][i % 5],
    aadhaar_ref: `XXXX-XXXX-${3000 + i}`,
    mutation_status: "MUTATION_RECORDED",
    application_tracking: {
      application_id: `LR-MUT-2026-00${pad}`,
      service_name: "7/12 Land Verification",
      current_stage: "APPROVED",
      stage_history: [{ stage: "Processed", timestamp: "2026-08-01T10:00:00Z" }]
    }
  });
}

export const employmentRecords = [
  {
    applicant_ref: "EMP/MH/2023/00891",
    aadhar_no: "XXXX-XXXX-9482", // Matches Rajesh Patil Aadhaar hash
    candidate_name: "R T Patil", // Abbreviated name variation
    birth_date: 492825600, // Unix epoch seconds for 1985-08-14 00:00:00 UTC
    qualification: "B.Sc Agriculture",
    employment_status: "Seeking Employment",
    registered_date: 1685577600, // 2023-06-01
    applied_schemes: ["PMEGP Agro-Processing Subsidy", "Chief Minister Employment Scheme (CMEGP)"],
    annual_income: 95000,
    domicile_state: "Maharashtra",
    district: "Pune",
    mobile_contact: "9822019482",
    application_tracking: {
      application_no: "MAHA-EMP-2026-8891",
      scheme_title: "CMEGP Skill Entrepreneurship Subsidy",
      current_stage: "DISBURSAL_SCHEDULED",
      timeline: [
        { title: "Application Registered on Mahaswayam", date: "2026-06-15" },
        { title: "District Industries Centre (DIC) Interview Cleared", date: "2026-07-22" },
        { title: "Bank Subsidy Sanction Letter Issued", date: "2026-08-14" }
      ]
    }
  },
  {
    applicant_ref: "EMP/MH/2024/01142",
    aadhar_no: "XXXX-XXXX-6711",
    candidate_name: "Sunita Deshmukh",
    birth_date: 657763200, // 1990-11-05
    qualification: "M.Com Finance",
    employment_status: "Self-Employed (Micro Enterprise)",
    registered_date: 1704067200,
    applied_schemes: ["Mahaswayam Rural Women Entrepreneurship"],
    annual_income: 180000,
    domicile_state: "Maharashtra",
    district: "Nagpur",
    mobile_contact: "9823456711",
    application_tracking: {
      application_no: "MAHA-EMP-2026-9042",
      scheme_title: "Rural Women Micro-Enterprise Support",
      current_stage: "APPROVED",
      timeline: [
        { title: "Portal Registration Completed", date: "2026-07-05" },
        { title: "Verification by Project Officer", date: "2026-07-28" },
        { title: "Approved for Seed Capital", date: "2026-08-12" }
      ]
    }
  },
  {
    applicant_ref: "EMP/MH/2024/01890",
    aadhar_no: "XXXX-XXXX-2109",
    candidate_name: "Amol Shinde",
    birth_date: 574992000, // 1988-03-22
    qualification: "Diploma Mechanical Engineering",
    employment_status: "Unemployed",
    registered_date: 1709251200,
    applied_schemes: ["Apprenticeship Training Scheme (NATS)"],
    annual_income: 40000,
    domicile_state: "Maharashtra",
    district: "Nashik",
    mobile_contact: "9765432109",
    application_tracking: {
      application_no: "MAHA-EMP-2026-9214",
      scheme_title: "Industrial Apprenticeship Placement",
      current_stage: "UNDER_REVIEW",
      timeline: [
        { title: "Applied for Nashik MIDC Industry Match", date: "2026-08-10" },
        { title: "Under Review by Apprenticeship Advisor", date: "2026-08-25" }
      ]
    }
  },
  {
    applicant_ref: "EMP/MH/2023/00451",
    aadhar_no: "XXXX-XXXX-1122",
    candidate_name: "Ganesh More",
    birth_date: 284774400, // 1979-01-10
    qualification: "Higher Secondary (12th Pass)",
    employment_status: "Self-Employed",
    registered_date: 1672531200,
    applied_schemes: ["Transport Vehicle Soft Loan"],
    annual_income: 120000,
    domicile_state: "Maharashtra",
    district: "Kolhapur",
    mobile_contact: "9422001122",
    application_tracking: {
      application_no: "MAHA-EMP-2026-9501",
      scheme_title: "Commercial Vehicle Subsidy",
      current_stage: "APPROVED",
      timeline: [
        { title: "Application Received", date: "2026-06-02" },
        { title: "Loan Sanctioned by District Bank", date: "2026-07-19" }
      ]
    }
  },
  {
    applicant_ref: "EMP/MH/2025/00109",
    aadhar_no: "XXXX-XXXX-3456",
    candidate_name: "Priya Kulkarni",
    birth_date: 774576000, // 1994-07-19
    qualification: "B.E. Computer Science",
    employment_status: "Employed - IT Consultant",
    registered_date: 1735689600,
    applied_schemes: ["Maharashtra Cyber Skill Mission"],
    annual_income: 650000,
    domicile_state: "Maharashtra",
    district: "Chhatrapati Sambhajinagar",
    mobile_contact: "9890123456",
    application_tracking: {
      application_no: "MAHA-EMP-2026-9710",
      scheme_title: "Cyber Security Certification",
      current_stage: "APPROVED",
      timeline: [
        { title: "Enrolled in Advanced Module", date: "2026-07-01" },
        { title: "Certificate Issued by CDAC", date: "2026-08-01" }
      ]
    }
  }
];

// Seed employment records to 35+
for (let i = 6; i <= 36; i++) {
  const pad = i.toString().padStart(2, '0');
  employmentRecords.push({
    applicant_ref: `EMP/MH/2025/00${pad}`,
    aadhar_no: `XXXX-XXXX-${3000 + i}`,
    candidate_name: `Applicant Candidate ${pad}`,
    birth_date: 315532800 + (i * 31536000), // Varying birth dates
    qualification: i % 2 === 0 ? "Graduate B.A." : "Diploma Polytechnic",
    employment_status: "Registered Jobseeker",
    registered_date: 1704067200 + (i * 86400),
    applied_schemes: ["State Skill Upgradation Scheme"],
    annual_income: 60000 + (i * 2000),
    domicile_state: "Maharashtra",
    district: ["Pune", "Nagpur", "Nashik", "Kolhapur", "Thane"][i % 5],
    mobile_contact: `982210${1000 + i}`,
    application_tracking: {
      application_no: `MAHA-EMP-2026-${9800 + i}`,
      scheme_title: "Vocational Placement Drive",
      current_stage: "SUBMITTED",
      timeline: [{ title: "Profile Registered", date: "2026-08-01" }]
    }
  });
}

/**
 * 4th Mock Department: MahaDBT (Direct Benefit Transfer & Social Welfare)
 * Used for the Live Judge Demo to prove dynamic onboarding of a 4th system
 * with custom API-Key auth without restarting the hub!
 */
export const mahadbtRecords = [
  {
    dbt_reg_id: "DBT-2026-992140",
    beneficiary_aadhaar_hash: "XXXX-XXXX-9482", // Linked to Rajesh Patil
    applicant_legal_name: "Mr. Rajesh T. Patil",
    b_day: "1985/08/14", // YYYY/MM/DD format
    caste_category: "OBC - Kunbi Maratha",
    scholarship_grant_status: "DISBURSED",
    scheme_name: "Dr. Punjabrao Deshmukh Hostel Subsidy & Farm Mechanization Grant",
    disbursed_amount_inr: 45000,
    disbursal_date: "2026-08-15",
    district_office: "Pune Central",
    bank_account_last4: "9102",
    ifsc_code: "MAHB0001042"
  },
  {
    dbt_reg_id: "DBT-2026-992141",
    beneficiary_aadhaar_hash: "XXXX-XXXX-6711",
    applicant_legal_name: "Mrs. Sunita Ramesh Deshmukh",
    b_day: "1990/11/05",
    caste_category: "General / EWS",
    scholarship_grant_status: "APPROVED",
    scheme_name: "Rajarshi Chhatrapati Shahu Maharaj Higher Education Grant",
    disbursed_amount_inr: 30000,
    disbursal_date: "2026-08-20",
    district_office: "Nagpur East",
    bank_account_last4: "6711",
    ifsc_code: "BKID0008812"
  },
  {
    dbt_reg_id: "DBT-2026-992142",
    beneficiary_aadhaar_hash: "XXXX-XXXX-2109",
    applicant_legal_name: "Amol Vitthal Shinde",
    b_day: "1988/03/22",
    caste_category: "General",
    scholarship_grant_status: "PENDING_SCRUTINY",
    scheme_name: "Post-Matric Technical Course Fee Reimbursement",
    disbursed_amount_inr: 25000,
    disbursal_date: null,
    district_office: "Nashik North",
    bank_account_last4: "2109",
    ifsc_code: "SBIN0004918"
  }
];

// Seed MahaDBT to 25+
for (let i = 3; i <= 25; i++) {
  const pad = i.toString().padStart(2, '0');
  mahadbtRecords.push({
    dbt_reg_id: `DBT-2026-9921${pad}`,
    beneficiary_aadhaar_hash: `XXXX-XXXX-${3000 + i}`,
    applicant_legal_name: `DBT Grantee ${pad}`,
    b_day: `1985/06/${(1 + (i % 25)).toString().padStart(2, '0')}`,
    caste_category: ["OBC", "SC", "ST", "General/EWS"][i % 4],
    scholarship_grant_status: i % 2 === 0 ? "DISBURSED" : "APPROVED",
    scheme_name: "State Merit Financial Assistance",
    disbursed_amount_inr: 20000 + (i * 1000),
    disbursal_date: "2026-08-10",
    district_office: "Regional Social Welfare Office",
    bank_account_last4: `${1000 + i}`,
    ifsc_code: "MAHB0000001"
  });
}
