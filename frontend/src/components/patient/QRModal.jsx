import React from 'react';
import { X, Download, Printer, QrCode, ShieldCheck } from 'lucide-react';

const QRModal = ({ isOpen, onClose, qrCodeUrl, prescriptionId, doctorName, date }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `Prescription_QR_${prescriptionId || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription QR Code - ${prescriptionId}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; }
            .card { border: 1px solid #e2e8f0; padding: 32px; border-radius: 16px; text-align: center; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            img { width: 280px; height: 280px; margin: 16px 0; }
            h2 { margin: 0 0 8px 0; color: #0284c7; }
            p { margin: 4px 0; color: #475569; font-size: 14px; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>MediScanQR Pass</h2>
            <p><strong>Rx ID:</strong> ${prescriptionId}</p>
            ${doctorName ? `<p><strong>Prescribed by:</strong> Dr. ${doctorName}</p>` : ''}
            ${date ? `<p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>` : ''}
            <img src="${qrCodeUrl}" alt="Prescription QR Code" />
            <br />
            <div class="badge">Present to Pharmacist for Verification</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Digital QR Pass</h3>
            <p className="text-xs text-slate-500 font-mono">Rx ID: {prescriptionId || 'N/A'}</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-6 my-4">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Prescription QR Code"
              className="h-52 w-52 object-contain rounded-lg shadow-sm bg-white p-2"
            />
          ) : (
            <div className="flex h-52 w-52 flex-col items-center justify-center text-slate-400">
              <QrCode className="h-12 w-12 mb-2" />
              <span className="text-xs">QR Code unavailable</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Anti-Fraud Cryptographic Verification</span>
          </div>
        </div>

        {/* Prescription Metadata */}
        {(doctorName || date) && (
          <div className="mb-4 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {doctorName && <p><strong className="text-slate-800">Doctor:</strong> Dr. {doctorName}</p>}
            {date && <p><strong className="text-slate-800">Issued Date:</strong> {new Date(date).toLocaleDateString()}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" /> Save Image
          </button>
          <button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <Printer className="h-4 w-4" /> Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;