import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PatientLayout from '../../layouts/PatientLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import QRModal from '../../components/patient/QRModal';
import { getPrescriptionById, downloadPrescriptionPdf } from '../../services/patientService';
import { getStatusVariant, formatDate } from '../../utils/formatters';
import { downloadBlob } from '../../utils/download';
import { ArrowLeft, QrCode, Pill, Calendar, User, ShieldCheck, AlertCircle, Award, Download } from 'lucide-react';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getPrescriptionById(id);
        setPrescription(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prescription details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadPrescriptionPdf(id);
      downloadBlob(blob, `${prescription.prescriptionId}.pdf`);
    } catch (err) {
      toast.error('Failed to download prescription PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout>
        <Loader text="Retrieving prescription details..." />
      </PatientLayout>
    );
  }

  if (error || !prescription) {
    return (
      <PatientLayout>
        <div className="max-w-xl mx-auto text-center">
          <div className="card p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Prescription Not Found</h2>
            <p className="text-xs text-rose-600 mt-1 mb-6">{error || 'Invalid prescription identifier.'}</p>
            <Link
              to="/patient/prescriptions"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back to My Prescriptions
            </Link>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/patient/prescriptions" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Prescriptions
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" /> {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <QrCode className="h-4 w-4" /> Display QR Pass
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx ID</span>
            <h1 className="text-lg font-mono font-bold text-slate-900">{prescription.prescriptionId || prescription._id}</h1>
          </div>
          <Badge variant={getStatusVariant(prescription.status)}>{prescription.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Prescribed By</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              {prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Authorized Physician'}
            </span>
            {prescription.doctorSpecialization && (
              <span className="block text-[11px] text-slate-500 mt-1">{prescription.doctorSpecialization}</span>
            )}
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Doctor License</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              {prescription.doctorLicenseNumber || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Issued Date</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              {formatDate(prescription.createdAt)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Doctor Signature</span>
            {prescription.doctorSignature ? (
              <img src={prescription.doctorSignature} alt="Doctor signature" className="h-10 mt-1 object-contain bg-white rounded border border-slate-200 p-1" />
            ) : (
              <span className="font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Signed by Prescribing Doctor
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Pill className="h-4 w-4 text-emerald-600" /> Prescribed Medications ({prescription.medicines?.length || 0})
        </h2>

        <div className="space-y-3">
          {prescription.medicines?.map((med, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-sm text-slate-900 block">{med.name}</span>
                <span className="text-xs text-slate-500 font-medium">{med.instructions || 'Take as directed by doctor'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-700 font-semibold">{med.dosage}</span>
                <span className="text-slate-600">{med.frequency}</span>
                {med.duration && <span className="text-slate-400">({med.duration})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrCodeUrl={prescription.qrCode}
        prescriptionId={prescription.prescriptionId}
        doctorName={prescription.doctorName}
        date={prescription.createdAt}
      />
    </PatientLayout>
  );
};

export default PrescriptionDetail;
