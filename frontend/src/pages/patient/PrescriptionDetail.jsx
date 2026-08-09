import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PatientLayout from '../../layouts/PatientLayout';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorState from '../../components/common/ErrorState';
import QRModal from '../../components/patient/QRModal';
import { getPrescriptionById, downloadPrescriptionPdf } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { downloadBlob } from '../../utils/download';
import {
  ArrowLeft,
  QrCode,
  Pill,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  Award,
  Download,
  PenTool,
  Clock,
  Utensils,
  Hash,
  FileText,
} from 'lucide-react';

const FOOD_LABEL = {
  BEFORE_FOOD: 'Before food',
  WITH_FOOD: 'With food',
  AFTER_FOOD: 'After food',
  ANYTIME: 'Anytime',
};

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrescriptionById(id);
      setPrescription(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadPrescriptionPdf(id);
      downloadBlob(blob, `${prescription.prescriptionId}.pdf`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download prescription PDF.');
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
        <div className="max-w-xl mx-auto">
          <ErrorState
            title="Prescription not found"
            message={error || 'This prescription could not be found, or does not belong to your account.'}
            onRetry={fetchDetail}
          />
          <div className="mt-4 text-center">
            <Link
              to="/patient/prescriptions"
              className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-ink-800 transition-colors"
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
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-xs font-semibold text-white hover:bg-accent-600 shadow-sm transition-colors"
          >
            <QrCode className="h-4 w-4" /> Display QR Pass
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx ID</span>
            <h1 className="text-lg font-mono font-bold text-slate-900">{prescription.prescriptionId || prescription._id}</h1>
          </div>
          <StatusBadge status={prescription.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Patient</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-brand-500" />
              {prescription.patientName || 'You'}
            </span>
            {typeof prescription.patientAge === 'number' && (
              <span className="block text-[11px] text-slate-500 mt-1">Age {prescription.patientAge}</span>
            )}
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Prescribed By</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-brand-500" />
              {prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Authorized Physician'}
            </span>
            {prescription.doctorSpecialization && (
              <span className="block text-[11px] text-slate-500 mt-1">{prescription.doctorSpecialization}</span>
            )}
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Doctor License</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Award className="h-3.5 w-3.5 text-brand-500" />
              {prescription.doctorLicenseNumber || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Issued Date</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-brand-500" />
              {formatDate(prescription.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Pill className="h-4 w-4 text-brand-500" /> Prescribed Medications ({prescription.medicines?.length || 0})
        </h2>

        <div className="space-y-3">
          {prescription.medicines?.map((med, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-bold text-sm text-slate-900">{med.name}</span>
                <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs text-brand-700 font-semibold">{med.dosage}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Frequency</span>
                  <span className="text-slate-700 font-medium">{med.frequency || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                  <span className="text-slate-700 font-medium">{med.duration || 'N/A'}</span>
                </div>
                {med.quantity && (
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Quantity</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <Hash className="h-3 w-3 text-slate-400" /> {med.quantity}
                    </span>
                  </div>
                )}
                {med.foodInstruction && (
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Food Instruction</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <Utensils className="h-3 w-3 text-slate-400" /> {FOOD_LABEL[med.foodInstruction] || med.foodInstruction}
                    </span>
                  </div>
                )}
              </div>

              {Array.isArray(med.displayTimes) && med.displayTimes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Scheduled Times</span>
                  <div className="flex flex-wrap gap-1.5">
                    {med.displayTimes.map((time, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        <Clock className="h-3 w-3 text-brand-500" /> {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {med.instructions && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-start gap-1.5 text-xs text-slate-600">
                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{med.instructions}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Doctor signature — a core proof element, given its own section
          rather than buried in a details grid. If missing, this must show a
          clear warning, never a fallback that implies it's fine. */}
      <div className="card p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <PenTool className="h-4 w-4 text-brand-500" /> Doctor Signature
        </h2>

        {prescription.doctorSignature ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={prescription.doctorSignature}
              alt={`Signature of Dr. ${prescription.doctorName || 'the prescribing doctor'}`}
              className="h-16 object-contain bg-white rounded-lg border border-slate-200 p-2"
            />
            <div className="text-xs text-slate-500">
              <p className="font-bold text-slate-800">Dr. {prescription.doctorName || 'Authorized Physician'}</p>
              {prescription.doctorLicenseNumber && <p>License: {prescription.doctorLicenseNumber}</p>}
              <p className="mt-1 flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> Digitally issued prescription
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">No signature on file for this prescription.</strong> This prescription
              does not have a doctor signature recorded. Contact your pharmacy or prescribing doctor if you have
              concerns about this prescription's authenticity.
            </span>
          </div>
        )}
      </div>

      {/* Verification — explains what the QR actually does, since that's a
          core MediScanQR concept most patients won't already understand. */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <QrCode className="h-4.5 w-4.5" />
          </div>
          <div className="text-xs text-slate-600 max-w-md">
            <p className="font-bold text-slate-800">Verification</p>
            <p className="mt-0.5">
              This QR code can be scanned by an authorized MediScanQR pharmacy to verify this prescription
              (Rx ID: <span className="font-mono font-semibold">{prescription.prescriptionId}</span>) before dispensing.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowQR(true)}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-xs font-semibold text-white hover:bg-accent-600 shadow-sm transition-colors"
        >
          <QrCode className="h-4 w-4" /> View QR Pass
        </button>
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
