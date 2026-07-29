import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ScannerCamera from '../../components/scanner/ScannerCamera';
import QRUploader from '../../components/scanner/QRUploader';
import { Camera, Upload, ShieldCheck } from 'lucide-react';

const ScanPrescription = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'

  const handleScanSuccess = (decodedText) => {
  try {
    const qrData = JSON.parse(decodedText);

    if (!qrData.prescriptionId) {
      navigate("/pharmacy/invalid-qr");
      return;
    }

    navigate(`/pharmacy/dispense/${qrData.prescriptionId}`);
  } catch {
    navigate("/pharmacy/invalid-qr");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Scan Prescription QR</h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify cryptographic signature and patient prescription details
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-200 p-1 mb-6 max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Camera className="h-4 w-4" /> Live Camera
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Upload className="h-4 w-4" /> Upload Image
            </button>
          </div>

          {/* Scanner Viewport Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            {activeTab === 'camera' ? (
              <ScannerCamera onScanSuccess={handleScanSuccess} />
            ) : (
              <QRUploader onScanSuccess={handleScanSuccess} />
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cryptographically verified against tamper-proof registry</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScanPrescription;