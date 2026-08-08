import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import ScannerCamera from '../../components/scanner/ScannerCamera';
import QRUploader from '../../components/scanner/QRUploader';
import DispenseFlowSteps from '../../components/pharmacy/DispenseFlowSteps';
import { Camera, Upload, ShieldCheck } from 'lucide-react';
import { logInvalidScan, verifyPrescription } from '../../services/pharmacyService';

const ScanPrescription = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('camera');
  const [manualRxId, setManualRxId] = useState('');
  const [manualError, setManualError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleScanSuccess = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.prescriptionId) {
        navigate(`/pharmacy/dispense/${qrData.prescriptionId}`);
        return;
      }
    } catch {
      // Not a JSON-encoded prescription QR — fall through to log as invalid.
    }

    try {
      await logInvalidScan(decodedText);
    } catch (err) {
      console.error('Failed to log invalid scan:', err);
    }

    navigate('/pharmacy/invalid-qr');
  };

  const handleScanError = () => {
    toast.error('Camera unavailable. Use manual entry or image upload below.');
  };

  const handleManualVerify = async () => {
    if (!manualRxId.trim() || verifying) return;

    const rxId = manualRxId.trim().toUpperCase();
    setVerifying(true);
    setManualError('');

    try {
      const prescription = await verifyPrescription(rxId);
      navigate(`/pharmacy/dispense/${prescription.prescriptionId}`);
    } catch (err) {
      // Already dispensed / expired — DispensePortal shows the locked details.
      if (err.response?.data?.prescription) {
        navigate(`/pharmacy/dispense/${rxId}`);
        return;
      }
      setManualError(err.response?.data?.message || 'Unable to verify prescription.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="page-heading">Scan Prescription QR</h1>
          <p className="page-subheading">Verify a prescription's signature and details before dispensing</p>
        </div>

        <DispenseFlowSteps current="scan" />

        <div className="flex rounded-xl bg-slate-200 p-1 mb-6 max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Camera className="h-4 w-4" />
            Live Camera
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
        </div>

        <div className="card p-6 text-center">
          {activeTab === 'camera' ? (
            <ScannerCamera onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
          ) : (
            <QRUploader onScanSuccess={handleScanSuccess} />
          )}

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Camera not working?</h3>
            <p className="text-xs text-slate-500 mb-4">Enter the Prescription ID manually.</p>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="RX-409108"
                value={manualRxId}
                onChange={(e) => {
                  setManualRxId(e.target.value.toUpperCase());
                  setManualError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                onClick={handleManualVerify}
                disabled={!manualRxId.trim() || verifying}
                className="rounded-xl bg-amber-500 px-6 py-2 text-white text-sm font-semibold hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            {manualError && <p className="mt-3 text-sm text-red-600">{manualError}</p>}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified against the prescription registry before dispensing</span>
          </div>
        </div>
      </div>
    </PharmacyLayout>
  );
};

export default ScanPrescription;
