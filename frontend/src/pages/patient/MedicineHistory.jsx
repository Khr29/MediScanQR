import React, { useEffect, useState } from 'react';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import ErrorState from '../../components/common/ErrorState';
import { getMedicalHistory } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { Pill } from 'lucide-react';

const MedicineHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <PatientLayout>
      <h1 className="page-heading mb-1">Medicine History</h1>
      <p className="page-subheading mb-6">Every medication you've been prescribed, across all your prescriptions</p>

      {error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : (
        <Table
          headers={['Medicine', 'Dosage', 'Prescribed By', 'Frequency / Duration', 'Date']}
          emptyMessage="No medicine history yet."
          loading={loading}
        >
          {history.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-600 shrink-0" />
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
