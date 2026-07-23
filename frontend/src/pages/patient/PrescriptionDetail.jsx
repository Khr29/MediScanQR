import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import QRModal from '../../components/patient/QRModal';
import { getPrescriptionById } from '../../services/patientService';
import { ArrowLeft, QrCode, FileText, Pill, Calendar, User, ShieldCheck, AlertCircle } from 'lucide-react';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getPrescriptionById(id);
        setPrescription(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prescription details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <Loader text="Retrieving prescription details..." />
          </main>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 max-w-xl mx-auto text-center">
            <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
              <h2 className="text-lg font-bold text-slate-900">Prescription Not Found</h2>
              <p className="text-xs text-rose-600 mt-1 mb-6">{error || 'Invalid prescription identifier.'}</p>
              <Link
                to="/patient/prescriptions"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" /> Back to My Prescriptions
              </Link>
            </div>
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
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/patient/prescriptions"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Prescriptions
            </Link>
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 shadow-sm transition-colors"
            >
              <QrCode className="h-4 w-4" /> Display QR Pass
            </button>
          </div>

          {/* Rx Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx ID</span>
                <h1 className="text-lg font-mono font-bold text-slate-900">{prescription.prescriptionId || prescription._id}</h1>
              </div>
              <Badge variant={prescription.status === 'DISPENSED' ? 'success' : 'info'}>
                {prescription.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Prescribed By</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User className="h-3.5 w-3.5 text-sky-600" />
                  {prescription.doctor?.name ? `Dr. ${prescription.doctor.name}` : prescription.doctorName || 'Authorized Physician'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Issued Date</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-600" />
                  {new Date(prescription.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Digital Verification</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Cryptographically Signed
                </span>
              </div>
            </div>
          </div>

          {/* Prescribed Medications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Pill className="h-4 w-4 text-sky-600" /> Prescribed Medications ({prescription.medicines?.length || 0})
            </h2>

            <div className="space-y-3">
              {prescription.medicines?.map((med, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{med.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{med.instructions || 'Take as directed by doctor'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-sky-700 font-semibold">{med.dosage}</span>
                    <span className="text-slate-600">{med.frequency}</span>
                    <span className="text-slate-400">({med.duration})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* QR Modal Display */}
      {showQR && (
        <QRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          qrCodeUrl={prescription.qrCode}
          prescriptionId={prescription.prescriptionId}
          doctorName={prescription.doctorName}
          date={prescription.createdAt}
        />
)}
    </div>
  );
};

export default PrescriptionDetail;