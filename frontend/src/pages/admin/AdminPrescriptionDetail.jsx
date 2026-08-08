import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getPrescriptionDetail, downloadPrescriptionPdf } from '../../services/adminService';
import { getStatusVariant, formatDateTime } from '../../utils/formatters';
import { downloadBlob } from '../../utils/download';
import {
  ArrowLeft,
  Pill,
  User,
  Award,
  Download,
  FilePlus,
  PackageCheck,
  Ban,
  AlertTriangle,
  Activity,
  ShieldCheck,
} from 'lucide-react';

const ACTION_ICONS = {
  CREATE_PRESCRIPTION: FilePlus,
  CANCEL_PRESCRIPTION: Ban,
  DOWNLOAD_PRESCRIPTION: Download,
  'Medicine Dispensed': PackageCheck,
};

const getActionIcon = (action) => ACTION_ICONS[action] || (action?.includes('Reject') || action?.includes('Invalid') || action?.includes('Expired') ? AlertTriangle : Activity);

const AdminPrescriptionDetail = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrescriptionDetail(id);
      setPrescription(data.prescription);
      setTimeline(data.timeline);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescription.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadPrescriptionPdf(id);
      downloadBlob(blob, `${id}.pdf`);
    } catch (err) {
      toast.error('Failed to download prescription PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loader text="Loading prescription..." />
      </AdminLayout>
    );
  }

  if (error || !prescription) {
    return (
      <AdminLayout>
        <ErrorState message={error} onRetry={fetchDetail} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link to="/admin/prescriptions" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Prescriptions
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx ID</span>
            <h1 className="text-lg font-mono font-bold text-slate-900">{prescription.prescriptionId}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(prescription.status)}>{prescription.status}</Badge>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> {downloading ? 'Preparing...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Prescribing Doctor</p>
            <p className="font-bold text-slate-900 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-indigo-600" /> Dr. {prescription.doctorName}</p>
            <p className="text-slate-500 mt-1 flex items-center gap-1.5"><Award className="h-3 w-3" /> {prescription.doctorLicenseNumber || 'N/A'}</p>
            {prescription.doctorSpecialization && <p className="text-slate-500 mt-0.5">{prescription.doctorSpecialization}</p>}
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Patient</p>
            <p className="font-bold text-slate-900">{prescription.patient?.name || prescription.patientName}</p>
            <p className="text-slate-500 mt-1">{prescription.patient?.email || 'N/A'}</p>
            <p className="text-slate-500 mt-0.5">Age: {prescription.patientAge ?? 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Issued</p>
            <p className="font-semibold text-slate-700 mt-0.5">{formatDateTime(prescription.createdAt)}</p>
          </div>
          {prescription.dispensedAt && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Dispensed</p>
              <p className="font-semibold text-slate-700 mt-0.5">{formatDateTime(prescription.dispensedAt)}</p>
              {prescription.dispensedBy && <p className="text-slate-500">by {prescription.dispensedBy}</p>}
            </div>
          )}
          {prescription.cancelledAt && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Cancelled</p>
              <p className="font-semibold text-slate-700 mt-0.5">{formatDateTime(prescription.cancelledAt)}</p>
              {prescription.cancelledBy && <p className="text-slate-500">by {prescription.cancelledBy}</p>}
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Expires</p>
            <p className="font-semibold text-slate-700 mt-0.5">{formatDateTime(prescription.expiresAt)}</p>
          </div>
        </div>

        {prescription.doctorSignature !== undefined && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Doctor Signature
            </p>
            {prescription.doctorSignature ? (
              <img src={prescription.doctorSignature} alt="Doctor signature" className="h-14 object-contain bg-slate-50 rounded border border-slate-200 p-1.5" />
            ) : (
              <p className="text-xs text-slate-400 italic">No signature on file at time of creation.</p>
            )}
          </div>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Pill className="h-4 w-4 text-indigo-600" /> Medicines ({prescription.medicines?.length || 0})
        </h2>
        <div className="space-y-2">
          {prescription.medicines?.map((med, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">{med.name}</span>
                {med.instructions && <span className="text-slate-500 block">{med.instructions}</span>}
              </div>
              <span className="text-slate-600 font-mono">{med.dosage} · {med.frequency}{med.duration ? ` · ${med.duration}` : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" /> Activity Timeline
        </h2>

        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No recorded activity for this prescription yet.</p>
        ) : (
          <div className="space-y-0">
            {timeline.map((event, idx) => {
              const Icon = getActionIcon(event.action);
              return (
                <div key={idx} className="flex gap-3 pb-5 relative">
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200" />
                  )}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.result === 'FAILED' || event.result === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{event.action}</span>
                      <Badge variant={getStatusVariant(event.result)}>{event.result}</Badge>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {event.actor} {event.role && `(${event.role})`} • {formatDateTime(event.timestamp)}
                    </p>
                    {event.details && <p className="text-slate-400 mt-0.5">{event.details}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPrescriptionDetail;
