import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Pill, Calendar, User } from 'lucide-react';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import { verifyPublicPrescription } from '../services/pharmacyService';
import { getStatusVariant, formatDate } from '../utils/formatters';

const PublicVerify = () => {
  const { id } = useParams();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyRx = async () => {
      try {
        const data = await verifyPublicPrescription(id);
        setRx(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or revoked prescription code.');
      } finally {
        setLoading(false);
      }
    };
    if (id) verifyRx();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="rounded-xl bg-sky-600 p-2 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Medi<span className="text-sky-600">Scan</span>QR
          </span>
        </div>

        {loading ? (
          <Loader text="Verifying prescription..." />
        ) : error ? (
          <div className="text-center py-6 space-y-3">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Prescription Status</span>
                <p className="text-xs font-mono font-bold text-slate-800">{rx?.prescriptionId || id}</p>
              </div>
              <Badge variant={getStatusVariant(rx?.status)}>{rx?.status}</Badge>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-600" /> Doctor:
                </span>
                <span className="font-bold text-slate-800">
                  {rx?.doctorName ? `Dr. ${rx.doctorName}` : 'Authorized Physician'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-600" /> Issued:
                </span>
                <span className="font-bold text-slate-800">{formatDate(rx?.createdAt)}</span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
              <Pill className="h-4 w-4 text-sky-600" /> Prescribed Items ({rx?.medicines?.length || 0})
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rx?.medicines?.map((med, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{med.name}</span>
                    <span className="text-[10px] text-slate-500">{med.frequency}</span>
                  </div>
                  <span className="font-mono font-semibold text-sky-600">{med.dosage}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Digital Prescription Record
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVerify;
