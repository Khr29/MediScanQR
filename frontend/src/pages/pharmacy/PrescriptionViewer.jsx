import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { getPrescriptionDetails } from '../../services/pharmacyService';
import { getStatusVariant, formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Pill, ShieldCheck } from 'lucide-react';

const PrescriptionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrescription = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPrescriptionDetails(id);
      setPrescription(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load prescription.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <PharmacyLayout>
        <Loader text="Loading prescription..." />
      </PharmacyLayout>
    );
  }

  if (error) {
    return (
      <PharmacyLayout>
        <ErrorState message={error} onRetry={fetchPrescription} />
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <div className="max-w-5xl mx-auto">
        <div className="card p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h1 className="text-xl font-bold text-slate-900">Prescription Details</h1>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">Rx ID: {prescription.prescriptionId}</p>
            </div>
            <Badge variant={getStatusVariant(prescription.status)}>{prescription.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Patient</p>
              <p className="font-bold text-slate-900">{prescription.patient?.name || prescription.patientName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Doctor</p>
              <p className="font-bold text-slate-900">{prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Dispensed By</p>
              <p className="font-bold text-slate-900">{prescription.dispensedBy || 'Not Dispensed'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Dispensed At</p>
              <p className="font-bold text-slate-900">
                {prescription.dispensedAt ? formatDateTime(prescription.dispensedAt) : 'Not Dispensed'}
              </p>
            </div>
            {prescription.pharmacyNotes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 uppercase font-semibold">Pharmacy Notes</p>
                <p className="font-medium text-slate-700 text-sm mt-1">{prescription.pharmacyNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h2 className="flex items-center gap-2 font-bold mb-5 text-slate-900">
            <Pill className="h-5 w-5 text-amber-600" /> Medicines
          </h2>

          {!prescription.medicines?.length ? (
            <EmptyState title="No medicines on this prescription" />
          ) : (
            <div className="space-y-3">
              {prescription.medicines.map((med, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-900">{med.name}</p>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                  <p className="text-sm text-slate-500">{med.frequency}</p>
                  {med.duration && <p className="text-sm text-slate-500">{med.duration}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    </PharmacyLayout>
  );
};

export default PrescriptionViewer;
