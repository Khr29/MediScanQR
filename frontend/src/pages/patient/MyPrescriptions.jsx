import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import QRModal from '../../components/patient/QRModal';
import { getPatientPrescriptions } from '../../services/patientService';
import { getStatusVariant, formatDate } from '../../utils/formatters';
import { Search, QrCode, Eye } from 'lucide-react';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter(
    (rx) =>
      rx.prescriptionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PatientLayout>
      <h1 className="page-heading mb-1">My Prescriptions</h1>
      <p className="page-subheading mb-6">Complete record of your digital prescriptions</p>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Rx ID or doctor name..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchPrescriptions} />
      ) : (
        <Table
          headers={['Rx ID', 'Doctor', 'Medicines', 'Status', 'Date', 'Actions']}
          emptyMessage="No prescriptions found."
          loading={loading}
        >
          {filtered.map((rx) => (
            <tr key={rx._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                {rx.doctorName ? `Dr. ${rx.doctorName}` : 'Authorized Physician'}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
              <td className="px-6 py-4 text-xs">
                <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
              <td className="px-6 py-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(rx)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Pass
                  </button>
                  <Link
                    to={`/patient/prescription/${rx._id}`}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <QRModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        qrCodeUrl={selectedQR?.qrCode}
        prescriptionId={selectedQR?.prescriptionId}
        doctorName={selectedQR?.doctorName}
        date={selectedQR?.createdAt}
      />
    </PatientLayout>
  );
};

export default MyPrescriptions;
