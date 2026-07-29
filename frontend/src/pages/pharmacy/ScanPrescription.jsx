import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import ScannerCamera from "../../components/scanner/ScannerCamera";
import QRUploader from "../../components/scanner/QRUploader";
import { Camera, Upload, ShieldCheck } from "lucide-react";
import {
  logInvalidScan,
  verifyPrescription,
} from "../../services/pharmacyService";

const ScanPrescription = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("camera");
  const [manualRxId, setManualRxId] = useState("");
  const [manualError, setManualError] = useState("");

  const handleScanSuccess = async (decodedText) => {
    console.log("handleScanSuccess called:", decodedText);

    try {
      const qrData = JSON.parse(decodedText);

      if (qrData.prescriptionId) {
        navigate(`/pharmacy/dispense/${qrData.prescriptionId}`);
        return;
      }
    } catch (err) {
      console.log("Not a JSON QR");
    }

    console.log("Logging invalid QR...");

    try {
      const result = await logInvalidScan(decodedText);
      console.log("Log result:", result);
    } catch (err) {
      console.error("Logging failed:", err.response?.status);
      console.error(err.response?.data);
      console.error(err);
    }

    navigate("/pharmacy/invalid-qr");
  };

  const handleManualVerify = async () => {
  if (!manualRxId.trim()) return;

  const rxId = manualRxId.trim().toUpperCase();

  try {
    setManualError("");

    const prescription = await verifyPrescription(rxId);

    navigate(`/pharmacy/dispense/${prescription.prescriptionId}`);
  } catch (err) {
    // Already Dispensed / Expired
    if (err.response?.data?.prescription) {
      navigate(`/pharmacy/dispense/${rxId}`);
      return;
    }

    // Invalid RX ID
    setManualError(
      err.response?.data?.message || "Unable to verify prescription."
    );
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Scan Prescription QR
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Verify cryptographic signature and patient prescription details
            </p>
          </div>

          {/* Mode Switch */}
          <div className="flex rounded-xl bg-slate-200 p-1 mb-6 max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "camera"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              <Camera className="h-4 w-4" />
              Live Camera
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </button>
          </div>

          {/* Scanner Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            {activeTab === "camera" ? (
              <ScannerCamera onScanSuccess={handleScanSuccess} />
            ) : (
              <QRUploader onScanSuccess={handleScanSuccess} />
            )}

            {/* Manual Verification */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Camera not working?
              </h3>

              <p className="text-xs text-slate-500 mb-4">
                Enter the Prescription ID manually.
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="RX-409108"
                  value={manualRxId}
                  onChange={(e) => {
                    setManualRxId(e.target.value.toUpperCase());
                    setManualError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualVerify();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button
                  onClick={handleManualVerify}
                  disabled={!manualRxId.trim()}
                  className="rounded-xl bg-sky-600 px-6 py-2 text-white text-sm font-semibold hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>

              {manualError && (
                <p className="mt-3 text-sm text-red-600">{manualError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                Cryptographically verified against tamper-proof registry
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScanPrescription;