import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import DispenseFlowSteps from '../../components/pharmacy/DispenseFlowSteps';
import { verifyPrescription, dispensePrescription } from '../../services/pharmacyService';
import { formatDateTime } from '../../utils/formatters';
import { AlertTriangle, Pill, ShieldCheck, PackageCheck } from 'lucide-react';

const DispensePortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showLockedModal, setShowLockedModal] = useState(false);
  const isDispensed = prescription?.status === 'DISPENSED';

  useEffect(() => {
    if (!id) return;

    const fetchAndVerify = async () => {
      try {
        const response = await verifyPrescription(id);
        setPrescription(response.prescription || response);
      } catch (err) {
        const data = err.response?.data;
        // If the backend still returned the prescription (e.g. already
        // dispensed / expired), keep showing its details rather than a blank error.
        if (data?.prescription) {
          setPrescription(data.prescription);
        }
        setError(data?.message || 'Invalid or revoked prescription code.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndVerify();
  }, [id]);

  const handleConfirmDispense = async () => {
    setDispensing(true);
    try {
      await dispensePrescription(id, { pharmacyNotes: notes });
      toast.success('Prescription dispensed and recorded.');
      navigate('/pharmacy/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize dispensation.');
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <PharmacyLayout>
        <Loader text="Verifying digital prescription validity..." />
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <div className="max-w-4xl mx-auto">
        <DispenseFlowSteps current={isDispensed ? 'record' : 'review'} />

        {error && !prescription ? (
          <div className="card p-8 border-rose-200 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Prescription Verification Failed</h2>
            <p className="text-xs text-rose-600 font-medium mt-1 mb-6">{error}</p>
            <button
              onClick={() => navigate('/pharmacy/scan')}
              className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-900"
            >
              Scan Another QR Pass
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className={`px-6 py-5 ${isDispensed ? 'bg-rose-50 border-b border-rose-200' : 'bg-emerald-50 border-b border-emerald-200'}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-3 ${isDispensed ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                      <ShieldCheck className={`h-6 w-6 ${isDispensed ? 'text-rose-600' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">Verified Digital Prescription</h1>
                      <p className="text-sm text-slate-500 font-mono mt-1">{prescription?.prescriptionId || id}</p>
                    </div>
                  </div>
                  <Badge variant={isDispensed ? 'danger' : 'info'}>
                    {isDispensed ? 'ALREADY DISPENSED' : 'READY TO DISPENSE'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Patient</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {prescription?.patient?.name || prescription?.patientName || 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Prescribing Doctor</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {prescription?.doctorName ? `Dr. ${prescription.doctorName}` : 'Authorized Physician'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Current Status</p>
                  <p className={`mt-2 text-lg font-bold ${isDispensed ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isDispensed ? 'Dispensed' : 'Active'}
                  </p>
                </div>
              </div>

              {isDispensed && (
                <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 p-5">
                  <div className="flex gap-4">
                    <AlertTriangle className="h-7 w-7 text-rose-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-bold text-rose-700 text-base">Prescription Already Dispensed</h3>
                      <p className="mt-2 text-sm text-rose-600">
                        This prescription has already been dispensed and is locked to prevent duplicate dispensing.
                      </p>
                      {prescription?.dispensedAt && (
                        <p className="mt-4 text-sm font-semibold text-rose-700">
                          Dispensed on {formatDateTime(prescription.dispensedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                <Pill className="h-4 w-4 text-amber-600" /> Prescribed Medications
              </h2>

              <div className="space-y-3">
                {prescription?.medicines?.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.dosage} — {med.frequency}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{med.duration}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacy Dispensing Notes</label>
                <textarea
                  readOnly={isDispensed}
                  rows={2}
                  value={isDispensed ? prescription?.pharmacyNotes || 'No notes recorded.' : notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Batch #4092, substituted brand with patient consent..."
                  className={`w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none ${
                    isDispensed ? 'bg-slate-100 cursor-not-allowed' : ''
                  }`}
                ></textarea>
              </div>

              <button
                onClick={() => (isDispensed ? setShowLockedModal(true) : handleConfirmDispense())}
                disabled={dispensing}
                className={`w-full mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-60 ${
                  isDispensed ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <PackageCheck className="h-4 w-4" />
                {isDispensed ? 'View Dispense Details' : dispensing ? 'Processing Dispensation...' : 'Confirm & Mark Dispensed'}
              </button>
            </div>
          </div>
        )}

        <Modal isOpen={showLockedModal} onClose={() => setShowLockedModal(false)} title="Prescription Already Dispensed" size="small">
          <p className="text-sm text-slate-600">This prescription has already been dispensed and cannot be dispensed again.</p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Patient</span>
              <span>{prescription?.patientName || prescription?.patient?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Dispensed On</span>
              <span>{prescription?.dispensedAt ? formatDateTime(prescription.dispensedAt) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Status</span>
              <span className="font-bold text-rose-600">ALREADY DISPENSED</span>
            </div>
          </div>
          <button
            onClick={() => setShowLockedModal(false)}
            className="mt-6 w-full rounded-xl bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700"
          >
            Close
          </button>
        </Modal>
      </div>
    </PharmacyLayout>
  );
};

export default DispensePortal;
