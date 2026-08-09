import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import ErrorState from '../../components/common/ErrorState';
import QRModal from '../../components/patient/QRModal';
import { getPatientPrescriptions, downloadPrescriptionPdf } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { downloadBlob } from '../../utils/download';
import { Search, QrCode, Eye, Download, Loader2 } from 'lucide-react';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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
    // Prefill the search box when arriving from a notification that
    // referenced a specific prescription (real query param, no fake linking).
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchTerm(q);
  }, []);

  const handleDownload = async (rx) => {
    setDownloadingId(rx._id);
    try {
      const blob = await downloadPrescriptionPdf(rx._id);
      downloadBlob(blob, `${rx.prescriptionId || rx._id}.pdf`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download prescription PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

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
          aria-label="Search prescriptions by Rx ID or doctor name"
          className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white shadow-sm"
        />
      </div>

      {error ? (
        <ErrorState
          title="Unable to load your prescriptions"
          message={error || "We couldn't retrieve your prescriptions right now."}
          onRetry={fetchPrescriptions}
        />
      ) : (
        <Table
          headers={['Rx ID', 'Doctor', 'Medicines', 'Status', 'Date', 'Actions']}
          emptyMessage={searchTerm ? 'No matching prescriptions' : 'No prescriptions yet'}
          emptyDescription={
            searchTerm
              ? 'Try a different Rx ID or doctor name.'
              : 'Your digital prescriptions will appear here when a doctor issues one.'
          }
          loading={loading}
        >
          {filtered.map((rx) => (
            <tr key={rx._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <Avatar name={rx.doctorName} size="sm" />
                  {rx.doctorName ? `Dr. ${rx.doctorName}` : 'Authorized Physician'}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
              <td className="px-6 py-4 text-xs">
                <StatusBadge status={rx.status} />
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
              <td className="px-6 py-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(rx)}
                    className="flex items-center gap-1 rounded-lg bg-accent-50 text-accent-600 px-2.5 py-1 text-xs font-semibold hover:bg-accent-100 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR
                  </button>
                  <Link
                    to={`/patient/prescription/${rx._id}`}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
                  <button
                    onClick={() => handleDownload(rx)}
                    disabled={downloadingId === rx._id}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {downloadingId === rx._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    PDF
                  </button>
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
