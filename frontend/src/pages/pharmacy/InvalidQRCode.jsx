import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import { AlertTriangle } from "lucide-react";

const InvalidQRCode = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-rose-200 shadow-sm p-8 text-center">

            <AlertTriangle className="mx-auto h-14 w-14 text-rose-500 mb-4" />

            <h1 className="text-2xl font-bold text-slate-900">
              Invalid QR Code
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              This QR code is not a valid <strong>MediScanQR</strong> prescription.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Please scan a prescription issued by an authorized doctor.
            </p>

            <button
              onClick={() => navigate("/pharmacy/scan")}
              className="mt-8 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Scan Again
            </button>

          </div>
        </main>  
      </div>
    </div>
  );
};

export default InvalidQRCode;