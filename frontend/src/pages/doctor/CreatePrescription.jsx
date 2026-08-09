import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DoctorLayout from '../../layouts/DoctorLayout';
import MedicineSearchInput from '../../components/doctor/MedicineSearchInput';
import QRDisplay from '../../components/qr/QRDisplay';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { createPrescription, searchPatients, getDoctorProfile } from '../../services/doctorService';
import { Trash2, FileCheck, Send, Search, User, ArrowRight, ArrowLeft, AlertTriangle, PenTool } from 'lucide-react';

const STEPS = ['Patient', 'Medicines', 'Review'];

const CreatePrescription = () => {
  const [step, setStep] = useState(0);

  // Step 1 - patient search/select
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Step 2 - medicines
  const [medicines, setMedicines] = useState([]);

  // Step 3 - review
  const [notes, setNotes] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [createdRxId, setCreatedRxId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoctorProfile()
      .then(setDoctorProfile)
      .catch(() => setDoctorProfile(null));
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPatients(searchTerm);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleAddMedicine = (med) => {
    setMedicines([
      ...medicines,
      { name: med.name, dosage: med.defaultDosage || '500mg', frequency: 'Twice daily', duration: '5 days', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const medicinesValid = medicines.length > 0 && medicines.every((m) => m.name && m.dosage && m.frequency);

  const goNext = () => {
    if (step === 0 && !selectedPatient) {
      toast.error('Select a patient before continuing.');
      return;
    }
    if (step === 1 && !medicinesValid) {
      toast.error('Every medicine needs a name, dosage, and frequency.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!selectedPatient || !medicinesValid) return;
    if (!doctorProfile?.digitalSignature) {
      toast.error('Add your signature to your profile before creating prescriptions.');
      return;
    }

    setLoading(true);
    try {
      const response = await createPrescription({
        patientEmail: selectedPatient.email,
        medicines,
        notes,
      });

      setQrCodeUrl(response.prescription?.qrCode);
      setCreatedRxId(response.prescription?.prescriptionId);
      toast.success('Prescription issued successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating prescription.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCreatedRxId('');
    setMedicines([]);
    setQrCodeUrl('');
    setSelectedPatient(null);
    setSearchTerm('');
    setSearchResults([]);
    setNotes('');
    setStep(0);
  };

  if (createdRxId) {
    return (
      <DoctorLayout>
        <div className="card p-8 max-w-lg mx-auto text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <FileCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Prescription Issued Successfully!</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Rx ID: <span className="font-mono font-bold text-slate-800">{createdRxId}</span>
          </p>

          <QRDisplay value={qrCodeUrl} />

          <Button onClick={resetForm} className="mt-6">
            Create Another Prescription
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">Create Digital Prescription</h1>
      <p className="page-subheading mb-6">Issue a QR-secured prescription tied to the patient's account</p>

      {doctorProfile && !doctorProfile.digitalSignature && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            You haven't added a signature yet.{' '}
            <Link to="/doctor/profile" className="font-semibold underline">
              Add one to your profile
            </Link>{' '}
            before you can issue prescriptions.
          </span>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 max-w-md">
        {STEPS.map((label, idx) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  idx < step
                    ? 'bg-emerald-500 text-white'
                    : idx === step
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-xs font-semibold ${idx === step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="h-0.5 flex-1 bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* STEP 1 - Patient */}
        {step === 0 && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Select Patient</h2>

            {selectedPatient ? (
              <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedPatient.name}</p>
                    <p className="text-xs text-slate-500">{selectedPatient.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search patient by name or email..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {searching && <p className="text-xs text-slate-400">Searching...</p>}

                {!searching && searchTerm.trim() && searchResults.length === 0 && (
                  <EmptyState title="No matching patients" message="Try a different name or email." />
                )}

                {searchResults.length > 0 && (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() =>
                          setSelectedPatient({ name: p.user?.name, email: p.user?.email, bloodGroup: p.bloodGroup, age: p.age })
                        }
                        disabled={!p.user?.email}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-brand-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">{p.user?.name || 'Unknown'}</span>
                          <span className="text-slate-400">{p.user?.email || 'No linked account'}</span>
                        </div>
                        <span className="text-[10px] text-brand-600 font-medium">{p.bloodGroup || ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 2 - Medicines */}
        {step === 1 && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Add Medicines</h2>
            <MedicineSearchInput onSelectMedicine={handleAddMedicine} />

            {medicines.length === 0 ? (
              <p className="text-xs text-slate-400 italic pt-1">No medicines added yet.</p>
            ) : (
              <div className="space-y-3 mt-4">
                {medicines.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{med.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remove medicine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        placeholder="Dosage"
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        placeholder="Frequency"
                        className="w-28 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        placeholder="Duration"
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      placeholder="Instructions (e.g. take after meals)"
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 - Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Review Prescription</h2>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Patient</p>
                <p className="font-semibold text-slate-800">{selectedPatient?.name}</p>
                <p className="text-slate-500">{selectedPatient?.email}</p>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Medicines ({medicines.length})</p>
                <div className="space-y-2">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                      <span className="font-bold text-slate-800">{med.name}</span> — {med.dosage}, {med.frequency}
                      {med.duration ? `, ${med.duration}` : ''}
                      {med.instructions && <p className="text-slate-500 mt-0.5">{med.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take after meal, rest for 3 days..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <PenTool className="h-3 w-3" /> Doctor Signature
                </p>
                {doctorProfile?.digitalSignature ? (
                  <img src={doctorProfile.digitalSignature} alt="Your signature" className="h-14 object-contain bg-white rounded border border-slate-200 p-1" />
                ) : (
                  <p className="text-xs text-rose-600">No signature on file - add one to your profile first.</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  This is a visual record of the prescribing doctor, not a cryptographic signature.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!doctorProfile?.digitalSignature}
              loading={loading}
              icon={Send}
              fullWidth
              size="lg"
            >
              {loading ? 'Issuing Prescription...' : 'Generate & Issue Rx'}
            </Button>
          </div>
        )}

        {/* Step navigation */}
        {step < 2 && (
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <Button onClick={goNext} icon={ArrowRight} className="flex-row-reverse">
              Next
            </Button>
          </div>
        )}
        {step === 2 && (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 mt-4 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Medicines
          </button>
        )}
      </div>
    </DoctorLayout>
  );
};

export default CreatePrescription;
