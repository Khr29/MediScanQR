import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DoctorLayout from '../../layouts/DoctorLayout';
import MedicineSearchInput from '../../components/doctor/MedicineSearchInput';
import DigitalSignaturePad from '../../components/doctor/DigitalSignaturePad';
import QRDisplay from '../../components/qr/QRDisplay';
import { createPrescription } from '../../services/doctorService';
import { Trash2, FileCheck, Send } from 'lucide-react';

const CreatePrescription = () => {
  const [patientEmail, setPatientEmail] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [createdRxId, setCreatedRxId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMedicine = (med) => {
    setMedicines([
      ...medicines,
      { name: med.name, dosage: med.defaultDosage || '500mg', frequency: 'Twice daily', duration: '5 days' },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.length === 0) {
      toast.error('Add at least one medicine before issuing the prescription.');
      return;
    }

    setLoading(true);
    try {
      const response = await createPrescription({
        patientEmail,
        medicines,
        digitalSignature: signature,
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
    setPatientEmail('');
    setSignature('');
    setNotes('');
  };

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">Create Digital Prescription</h1>
      <p className="page-subheading mb-6">Issue a QR-secured prescription tied to the patient's account</p>

      {createdRxId ? (
        <div className="card p-8 max-w-lg mx-auto text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <FileCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Prescription Issued Successfully!</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Rx ID: <span className="font-mono font-bold text-slate-800">{createdRxId}</span>
          </p>

          <QRDisplay value={qrCodeUrl} />

          <button
            onClick={resetForm}
            className="mt-6 rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            Create Another Prescription
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Patient & Medicine Entry */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800">1. Patient Identification</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Registered Email</label>
                <input
                  type="email"
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800">2. Prescribe Medications</h2>
              <MedicineSearchInput onSelectMedicine={handleAddMedicine} />

              {medicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic pt-1">No medicines added yet.</p>
              ) : (
                <div className="space-y-3 mt-4">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-800 w-28 truncate">{med.name}</span>
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
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="ml-auto text-rose-500 hover:text-rose-700 p-1"
                        title="Remove medicine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Signature & Confirmation */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">3. Signature &amp; Notes</h2>
              <DigitalSignaturePad onSave={(sig) => setSignature(sig)} />
            </div>

            <div className="card p-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Take after meal, rest for 3 days..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-sky-500 focus:outline-none"
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-md mt-2"
              >
                <Send className="h-4 w-4" /> {loading ? 'Issuing Prescription...' : 'Generate & Issue Rx'}
              </button>
            </div>
          </div>
        </form>
      )}
    </DoctorLayout>
  );
};

export default CreatePrescription;
