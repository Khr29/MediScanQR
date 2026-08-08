import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorLayout from '../../layouts/DoctorLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getDoctorPrescriptions } from '../../services/doctorService';
import { getStatusVariant, formatDate } from '../../utils/formatters';
import { Search } from 'lucide-react';

const PrescriptionHistory = () => {
  const [searchParams] = useSearchParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(searchParams.get('patient') || '');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescription history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = prescriptions.filter(
    (rx) =>
      rx.prescriptionId?.toLowerCase().includes(filter.toLowerCase()) ||
      rx.patientName?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">Prescription History</h1>
      <p className="page-subheading mb-6">Archive of all prescriptions you've issued</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by Rx ID or patient name..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-sky-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : (
        <Table
          headers={['Rx ID', 'Patient', 'Medicines', 'Status', 'Date']}
          emptyMessage="No prescription history found."
          loading={loading}
        >
          {filtered.map((rx) => (
            <tr key={rx._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">{rx.patientName || 'N/A'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0}</td>
              <td className="px-6 py-4 text-xs">
                <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </DoctorLayout>
  );
};

export default PrescriptionHistory;
