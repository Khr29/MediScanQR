import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Activity, CheckCircle, Clock, FileText, User, Pill } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';

const PublicVerify = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyRx = async () => {
      try {
        const response = await API.get(`/pharmacy/verify/${id}`);
        setPrescription(response.data.prescription || response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Prescription signature invalid or not found.');
      } finally {
        setLoading(false);
      }
    };

    if (id) verifyRx();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader text="Verifying cryptographic signature..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-sky-600">
            <Activity className="h-8 w-8" />
            <span className="text-2xl tracking-tight text-slate-900">
              MediScan<span className="text-sky-600">QR</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Cryptographic Prescription Verification</p>
        </div>

        {/* Verification Status Banner */}
        {error ? (
          <div className="rounded-2xl bg-white p-6 shadow-xl border border-rose-200 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-rose-600 font-medium mt-2">{error}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Authentic Prescription</h2>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Digital Signature Verified
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Prescription ID</span>
                <span className="font-mono font-bold text-slate-800">{prescription?.prescriptionId || id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Status</span>
                <Badge variant={prescription?.status === 'DISPENSED' ? 'success' : 'info'}>
                  {prescription?.status || 'VALID'}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Doctor</span>
                <span className="font-semibold text-slate-800">
                  {prescription?.doctor?.name ? `Dr. ${prescription.doctor.name}` : 'Authorized Physician'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Issued Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(prescription?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Prescribed Medications */}
            {prescription?.medicines && prescription.medicines.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-sky-600" /> Prescribed Medications
                </h3>
                <div className="space-y-2">
                  {prescription.medicines.map((med, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{med.name}</span>
                      <span className="text-slate-500 font-mono">{med.dosage} ({med.frequency})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVerify;