/**
 * Data-Driven Life Event & Business Event Bundle Catalog
 * 
 * Defines bundles as pure data schemas, mapping real-world citizen goals
 * to participating departments, adapters, required fields, and documents.
 */

export const defaultBundles = [
  {
    bundle_id: "hotel_business",
    title: "Start a Hotel / Restaurant Business",
    category: "Business & Commerce",
    icon: "UtensilsCrossed",
    estimated_days: "7 - 12 Days",
    tag: "High Priority Service Bundle",
    description: "Consolidates municipal trade licensing, 7/12 land use verification, staff labour registration, and commercial food supply NOC into one guided application.",
    services: [
      {
        service_id: "srv_land_use",
        service_name: "Commercial Land Use & 7/12 Clearance",
        department_id: "dept-land-records",
        department_name: "Revenue Dept (MahaBhumi)",
        mandatory: true,
        estimated_time: "3 days",
        required_documents: ["7/12 Extract Copy", "Zoning NOC / NA Order"],
        fields: [
          { key: "property_address", label: "Establishment / Site Address", type: "text", autoFillSource: "land_records.village_taluka", required: true },
          { key: "survey_no", label: "Land Survey / Gat Number", type: "text", autoFillSource: "land_records.survey_no", required: true },
          { key: "plot_area_sqft", label: "Commercial Built-Up Area (sq. ft.)", type: "number", defaultValue: "2400", required: true }
        ]
      },
      {
        service_id: "srv_trade_license",
        service_name: "Trade & Establishment License",
        department_id: "dept-employment",
        department_name: "Skill Dev & Employment (Mahaswayam)",
        mandatory: true,
        estimated_time: "5 days",
        required_documents: ["Shop & Establishment Act Form A", "PAN Card Copy"],
        fields: [
          { key: "business_name", label: "Trade / Restaurant Legal Name", type: "text", defaultValue: "Shree Ganesh Grand Hotel & Dining", required: true },
          { key: "business_type", label: "Entity Constitution", type: "select", options: ["Sole Proprietorship", "Partnership LLP", "Private Limited"], defaultValue: "Sole Proprietorship", required: true },
          { key: "investment_capital_inr", label: "Initial Capital Investment (INR)", type: "number", defaultValue: "1500000", required: true }
        ]
      },
      {
        service_id: "srv_staff_welfare",
        service_name: "Staff Labour & Apprentice Welfare Quota",
        department_id: "dept-employment",
        department_name: "Skill Dev & Employment (Mahaswayam)",
        mandatory: false,
        estimated_time: "2 days",
        required_documents: ["Employee Roll Register (Form 1)"],
        fields: [
          { key: "estimated_staff_count", label: "Total Estimated Kitchen & Service Staff", type: "number", defaultValue: "12", required: true },
          { key: "min_wage_compliance", label: "Minimum Wage & ESIC Undertaking", type: "select", options: ["Compliant", "Exempt (< 10 staff)"], defaultValue: "Compliant", required: true }
        ]
      },
      {
        service_id: "srv_food_noc",
        service_name: "Commercial Grain & Food Supply Clearance NOC",
        department_id: "dept-pds",
        department_name: "Food & Civil Supplies (PDS)",
        mandatory: false,
        estimated_time: "4 days",
        required_documents: ["FSSAI Food Safety Registration Copy"],
        fields: [
          { key: "kitchen_type", label: "Kitchen Classification", type: "select", options: ["Commercial Gas / Electric", "Wood / Biomass"], defaultValue: "Commercial Gas / Electric", required: true },
          { key: "monthly_commercial_grain_kg", label: "Estimated Monthly Grain Procurement (kg)", type: "number", defaultValue: "500", required: true }
        ]
      }
    ]
  },
  {
    bundle_id: "new_resident",
    title: "New Resident Moving to Maharashtra",
    category: "Life Event / Relocation",
    icon: "Home",
    estimated_days: "3 - 5 Days",
    tag: "Citizen Onboarding Bundle",
    description: "Transfers family ration quota to local Fair Price Shop, records tenancy or land deed, and registers in the district employment exchange.",
    services: [
      {
        service_id: "srv_ration_transfer",
        service_name: "Ration Card Address & Fair Price Shop Transfer",
        department_id: "dept-pds",
        department_name: "Food & Civil Supplies (PDS)",
        mandatory: true,
        estimated_time: "3 days",
        required_documents: ["Old Ration Card Surrender Certificate", "Aadhaar Card"],
        fields: [
          { key: "property_address", label: "New Residential Address in Maharashtra", type: "text", autoFillSource: "pds.district", required: true },
          { key: "family_members_count", label: "Number of Family Members in Household", type: "number", autoFillSource: "pds.family_members_count", required: true }
        ]
      },
      {
        service_id: "srv_resident_land",
        service_name: "Residential Property / Tenancy Record",
        department_id: "dept-land-records",
        department_name: "Revenue Dept (MahaBhumi)",
        mandatory: false,
        estimated_time: "2 days",
        required_documents: ["Registered Sale Deed or 11-Month Tenancy Agreement"],
        fields: [
          { key: "survey_no", label: "Property / Flat Khata Reference", type: "text", autoFillSource: "land_records.property_owner_id", required: true }
        ]
      },
      {
        service_id: "srv_resident_employment",
        service_name: "District Employment Exchange Registration",
        department_id: "dept-employment",
        department_name: "Skill Dev & Employment (Mahaswayam)",
        mandatory: true,
        estimated_time: "1 day",
        required_documents: ["Educational Certificates", "Domicile Certificate"],
        fields: [
          { key: "highest_qualification", label: "Highest Educational Qualification", type: "text", autoFillSource: "employment.highestQualification", required: true },
          { key: "preferred_sector", label: "Preferred Sector / Industry", type: "text", defaultValue: "Agro-Industries & Hospitality", required: true }
        ]
      }
    ]
  },
  {
    bundle_id: "farming_business",
    title: "Start Commercial Farming on Owned Land",
    category: "Agriculture & Rural Enterprise",
    icon: "Sprout",
    estimated_days: "10 - 15 Days",
    tag: "Farmer Empowerment Bundle",
    description: "Verifies agricultural land parcel, sanctions Chief Minister CMEGP agro-processing soft loan, and applies for MahaDBT mechanization grant.",
    services: [
      {
        service_id: "srv_farm_land",
        service_name: "7/12 Land Title & Soil Classification Verification",
        department_id: "dept-land-records",
        department_name: "Revenue Dept (MahaBhumi)",
        mandatory: true,
        estimated_time: "3 days",
        required_documents: ["Latest 7/12 Digital Extract with QR Code"],
        fields: [
          { key: "survey_no", label: "Farm Survey / Gat Number", type: "text", autoFillSource: "land_records.survey_no", required: true },
          { key: "property_address", label: "Village & Taluka Location", type: "text", autoFillSource: "land_records.village_taluka", required: true }
        ]
      },
      {
        service_id: "srv_farm_loan",
        service_name: "CMEGP Skill & Agro-Processing Loan Sanction",
        department_id: "dept-employment",
        department_name: "Skill Dev & Employment (Mahaswayam)",
        mandatory: true,
        estimated_time: "7 days",
        required_documents: ["Detailed Project Appraisal Report (DPR)"],
        fields: [
          { key: "business_name", label: "Proposed Enterprise Name", type: "text", defaultValue: "Patil Organic Food Processing & Cold Store", required: true },
          { key: "investment_capital_inr", label: "Total Project Cost (INR)", type: "number", defaultValue: "2500000", required: true }
        ]
      },
      {
        service_id: "srv_farm_dbt",
        service_name: "MahaDBT Solar Pump & Tractor Mechanization Grant",
        department_id: "dept-mahadbt",
        department_name: "Social Welfare (MahaDBT)",
        mandatory: false,
        estimated_time: "5 days",
        required_documents: ["Equipment Dealer Proforma Invoice"],
        fields: [
          { key: "equipment_type", label: "Approved Farm Equipment", type: "select", options: ["Solar Irrigation Pump 5HP", "Mini Tractor 25HP", "Drip Irrigation Unit"], defaultValue: "Solar Irrigation Pump 5HP", required: true }
        ]
      }
    ]
  }
];