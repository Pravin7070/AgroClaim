const SCHEME_DOCUMENTS = {
  'PM-KISAN': [
    'Aadhaar Card (Biometric Verification)',
    'Land Ownership Certificate (7/12 Extract or Patta)',
    'Bank Account Passbook (First Page with IFSC)',
    'Self-Declaration Affidavit (Non-Institutional Landowner)',
    'Ration Card or Voter ID (Address Proof)'
  ],
  'PMFBY': [
    'Crop Insurance Policy Document (Previous Season)',
    'Land Records (Khata/Khatauni with Survey Number)',
    'Sowing Certificate (Issued by Village Officer)',
    'Bank Account Statement (Last 3 Months)',
    'Damage Assessment Report (Revenue Inspector Signed)'
  ],
  'PMKSY': [
    'Water Source Ownership Proof (Borewell/Well License)',
    'Land Measurement Certificate (Minimum 1 Hectare)',
    'Soil Health Card (Issued by Agriculture Department)',
    'Project Proposal (Drip/Sprinkler System Plan)',
    'Caste Certificate (For SC/ST Subsidy Enhancement)'
  ],
  'TN_IFS': [
    'Tamil Nadu Farmer Registration Card (e-Chitta)',
    'Integrated Farming System Plan (Crop + Livestock)',
    'Panchayat NOC (No Objection Certificate)',
    'Income Certificate (Below ₹2.5 Lakh Annual)',
    'Training Completion Certificate (Agriculture University)'
  ],
  'TN_SOLAR_PUMP': [
    'Electricity Board NOC (Existing Connection Surrender)',
    'Land Ownership Document (Patta with Survey Number)',
    'Technical Feasibility Report (Solar Vendor Certified)',
    'Groundwater Extraction Permit (PWD Issued)',
    'Bank Loan Sanction Letter (If Availing Subsidy Loan)'
  ]
};

const getSchemeDocuments = (schemeName) => {
  const normalized = schemeName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return SCHEME_DOCUMENTS[normalized] || [
    'Aadhaar Card',
    'Land Ownership Certificate',
    'Bank Account Passbook',
    'Income Certificate',
    'Recent Passport Size Photograph'
  ];
};

module.exports = { getSchemeDocuments, SCHEME_DOCUMENTS };
