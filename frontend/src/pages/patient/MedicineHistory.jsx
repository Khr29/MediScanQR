import React, { useEffect, useState } from 'react';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import ErrorState from '../../components/common/ErrorState';
import { getMedicalHistory } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { Pill, Search } from 'lucide-react';

const MedicineHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicalHistory();
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your medicine history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Client-side only — the medicine-history endpoint already returns the
  // patient's full flattened history in one response, so there's no
  // separate search API to call.
  const filtered = history.filter(
    (item) =>
      item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PatientLayout>
      <h1 className="page-heading mb-1">Medicine History</h1>
      <p className="page-subheading mb-6">Every medication you've been prescribed, across all your prescriptions</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by medicine or doctor name..."
          aria-label="Search medicine history"
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState
          title="Unable to load your medicine history"
          message={error || "We couldn't retrieve your medicine history right now."}
          onRetry={fetchHistory}
        />
      ) : (
        <Table
          headers={['Medicine', 'Dosage', 'Prescribed By', 'Frequency / Duration', 'Date']}
          emptyMessage={searchTerm ? 'No matching medicines' : 'No medicine history yet'}
          emptyDescription={
            searchTerm
              ? 'Try a different medicine or doctor name.'
              : "Medications from your prescriptions will appear here once a doctor issues one."
          }
          loading={loading}
        >
          {filtered.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-brand-500 shrink-0" />
                  {item.medicineName}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-700">{item.dosage}</td>
              <td className="px-6 py-4 text-xs text-slate-600">{item.doctorName ? `Dr. ${item.doctorName}` : 'Authorized Physician'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {item.frequency || 'Daily'}
                {item.duration ? ` (${item.duration})` : ''}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(item.date)}</td>
            </tr>
          ))}
        </Table>
      )}
    </PatientLayout>
  );
};

export default MedicineHistory;
