import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { verifyPrescription, dispensePrescription } from '../../services/pharmacyService';
import { CheckCircle, AlertTriangle, Pill, ShieldCheck, PackageCheck, User } from 'lucide-react';

const DispensePortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [dispensedItems, setDispensedItems] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        const response = await verifyPrescription(id);
        const rx = response.prescription || response;
        setPrescription(rx);

        // Default all medicines as selected for dispensation
        const initialMap = {};
        rx.medicines?.forEach((med, idx) => {
          initialMap[idx] = true;
        });
        setDispensedItems(initialMap);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or revoked prescription code.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAndVerify();
  }, [id]);

  const handleToggleMed = (index) => {
    setDispensedItems({ ...dispensedItems, [index]: !dispensedItems[index] });
  };

  const handleConfirmDispense = async () => {
    setDispensing(true);
    try {
      await dispensePrescription(id, {
        dispensedItems,
        pharmacyNotes: notes,
      });
      navigate('/pharmacy/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to finalize dispensation.');
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <Loader text="Verifying digital prescription validity..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto">
          {error ? (
            <div className="rounded-2xl bg-white p-8 border border-rose-200 shadow-sm text-center">
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
              {/* Rx Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <h1 className="text-lg font-bold text-slate-900">Verified Prescription</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Rx ID: {prescription?.prescriptionId || id}</p>
                  </div>
                  <Badge variant={prescription?.status === 'DISPENSED' ? 'success' : 'info'}>
                    {prescription?.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Patient</span>
                    <span className="font-bold text-slate-800">{prescription?.patient?.name || prescription?.patientName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Prescribing Doctor</span>
                    <span className="font-bold text-slate-800">{prescription?.doctor?.name ? `Dr. ${prescription.doctor.name}` : 'Authorized Physician'}</span>
                  </div>
                </div>
              </div>

              {/* Medication Selection List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-sky-600" /> Select Medications To Dispense
                </h2>

                <div className="space-y-3">
                  {prescription?.medicines?.map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleMed(idx)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                        dispensedItems[idx]
                          ? 'bg-sky-50/60 border-sky-300'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!dispensedItems[idx]}
                          onChange={() => {}}
                          className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{med.name}</p>
                          <p className="text-[11px] text-slate-500">{med.dosage} — {med.frequency}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{med.duration}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacy Dispensing Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Batch #4092, substituted brand with patient consent..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-sky-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleConfirmDispense}
                  disabled={dispensing || prescription?.status === 'DISPENSED'}
                  className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <PackageCheck className="h-4 w-4" /> {dispensing ? 'Processing Dispensation...' : 'Confirm & Mark Dispensed'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DispensePortal;