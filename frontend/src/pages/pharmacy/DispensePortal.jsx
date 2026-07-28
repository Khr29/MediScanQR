import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { verifyPrescription, dispensePrescription } from '../../services/pharmacyService';
import { AlertTriangle, Pill, ShieldCheck, PackageCheck } from "lucide-react";

const DispensePortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [dispensedItems, setDispensedItems] = useState({});
  const [notes, setNotes] = useState('');
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const isDispensed = prescription?.status === "DISPENSED";

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        const response = await verifyPrescription(id);
        const rx = response.prescription || response;
        console.log("Prescription:", rx);
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
                  <Badge variant={isDispensed ? "danger" : "info"}>
                    {isDispensed ? "ALREADY DISPENSED" : prescription?.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      Patient
                    </span>
                    <span className="font-bold text-slate-800">
                      {prescription?.patient?.name || prescription?.patientName || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      Prescribing Doctor
                    </span>
                    <span className="font-bold text-slate-800">
                      {prescription?.doctor?.name
                        ? `Dr. ${prescription.doctor.name}`
                        : "Authorized Physician"}
                    </span>
                  </div>
                </div>

                {isDispensed && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />

                    <div>
                      <p className="text-sm font-bold text-red-700">
                        This prescription has already been dispensed.
                      </p>

                      <p className="text-xs text-red-600">
                        To prevent duplicate dispensing, medicines and notes are locked.
                      </p>

                      {prescription?.dispensedAt && (
                        <p className="mt-3 text-xs font-semibold text-red-700">
                          Dispensed on:{" "}
                          {new Date(prescription.dispensedAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                      onClick={() => !isDispensed && handleToggleMed(idx)}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        dispensedItems[idx]
                          ? 'bg-sky-50/60 border-sky-300'
                          : 'bg-slate-50 border-slate-200'
                      }${isDispensed ? " cursor-not-allowed opacity-70" : " cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={isDispensed}
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
                    readOnly={isDispensed}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Batch #4092, substituted brand with patient consent..."
                    className={`w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-sky-500 focus:outline-none ${
                      isDispensed ? "bg-slate-100 cursor-not-allowed" : ""
                    }`}
                  ></textarea>
                </div>

                <button
                  onClick={() => {
                    if (isDispensed) {
                      setShowDispenseModal(true);
                      return;
                    }

                    handleConfirmDispense();
                  }}
                  disabled={dispensing}
                  className={`w-full mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-white transition-colors shadow-sm ${
                    isDispensed
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <PackageCheck className="h-4 w-4" />

                  {isDispensed
                    ? "View Dispense Details"
                    : dispensing
                    ? "Processing Dispensation..."
                    : "Confirm & Mark Dispensed"}
                </button>
              </div>
            </div>
          )}

          {showDispenseModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <h2 className="text-lg font-bold text-slate-900">
          Prescription Already Dispensed
        </h2>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        This prescription has already been dispensed and cannot be dispensed again.
      </p>

      <div className="mt-5 rounded-xl bg-slate-50 p-4 space-y-3">

        <div className="flex justify-between text-sm">
          <span className="font-semibold">Patient</span>
          <span>
            {prescription?.patientName ||
              prescription?.patient?.name ||
              "N/A"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="font-semibold">Dispensed On</span>
          <span>
            {prescription?.dispensedAt
              ? new Date(prescription.dispensedAt).toLocaleString()
              : "N/A"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="font-semibold">Status</span>
          <span className="font-bold text-red-600">
            ALREADY DISPENSED
          </span>
        </div>

      </div>

      <button
        onClick={() => setShowDispenseModal(false)}
        className="mt-6 w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
      >
        Close
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