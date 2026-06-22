import { useState, useEffect } from 'react';
import { schemeAPI } from '../../services/schemeAPI';
import { LuFileText, LuCheckCircle2 } from 'react-icons/lu';

const SCHEMES = [
  { id: 'PM-KISAN', name: 'PM-KISAN', type: 'Central' },
  { id: 'PMFBY', name: 'PMFBY', type: 'Central' },
  { id: 'PMKSY', name: 'PMKSY', type: 'Central' },
  { id: 'TN_IFS', name: 'TN IFS', type: 'State' },
  { id: 'TN_SOLAR_PUMP', name: 'TN Solar Pump', type: 'State' }
];

export default function SchemeDocuments() {
  const [selectedScheme, setSelectedScheme] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedScheme) {
      fetchDocuments();
    }
  }, [selectedScheme]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await schemeAPI.getRequiredDocuments(selectedScheme);
      setDocuments(data.requiredDocuments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-6">Scheme Documents</h1>
      
      <div className="mb-6">
        <label className="text-sm font-bold text-gray-700 mb-2 block">Select Scheme</label>
        <select
          className="input-field"
          value={selectedScheme}
          onChange={(e) => setSelectedScheme(e.target.value)}
        >
          <option value="">Choose a scheme...</option>
          {SCHEMES.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading documents...</p>}

      {documents.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <LuFileText className="text-emerald-600 w-6 h-6" />
            <h2 className="text-xl font-black text-gray-900">Required Documents</h2>
          </div>
          <ul className="space-y-3">
            {documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                <LuCheckCircle2 className="text-emerald-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
