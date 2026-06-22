const { getSchemeDocuments, SCHEME_DOCUMENTS } = require('../utils/schemeDocuments');

describe('Scheme Document Generator', () => {
  test('PM-KISAN returns 5 unique documents', () => {
    const docs = getSchemeDocuments('PM-KISAN');
    expect(docs).toHaveLength(5);
    expect(docs).toContain('Aadhaar Card (Biometric Verification)');
    expect(docs).toContain('Land Ownership Certificate (7/12 Extract or Patta)');
  });

  test('PMFBY returns insurance-specific documents', () => {
    const docs = getSchemeDocuments('PMFBY');
    expect(docs).toHaveLength(5);
    expect(docs).toContain('Crop Insurance Policy Document (Previous Season)');
    expect(docs).toContain('Damage Assessment Report (Revenue Inspector Signed)');
  });

  test('TN_SOLAR_PUMP returns state-specific documents', () => {
    const docs = getSchemeDocuments('TN Solar Pump');
    expect(docs).toHaveLength(5);
    expect(docs).toContain('Electricity Board NOC (Existing Connection Surrender)');
    expect(docs).toContain('Groundwater Extraction Permit (PWD Issued)');
  });

  test('Unknown scheme returns generic documents', () => {
    const docs = getSchemeDocuments('UNKNOWN_SCHEME');
    expect(docs).toHaveLength(5);
    expect(docs).toContain('Aadhaar Card');
  });

  test('All schemes have unique document sets', () => {
    const schemes = Object.keys(SCHEME_DOCUMENTS);
    const allDocs = schemes.map(s => SCHEME_DOCUMENTS[s].join('|'));
    const uniqueDocs = new Set(allDocs);
    expect(uniqueDocs.size).toBe(schemes.length);
  });
});
