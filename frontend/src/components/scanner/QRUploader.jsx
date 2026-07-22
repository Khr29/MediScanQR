import React, { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Upload, AlertCircle } from 'lucide-react';

const QRUploader = ({ onScanSuccess, onScanError }) => {
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const html5QrCode = new Html5Qrcode('qr-file-reader-temp');

    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      if (onScanSuccess) onScanSuccess(decodedText);
    } catch (err) {
      const msg = 'Unable to read QR code from image. Please ensure image is clear.';
      setError(msg);
      if (onScanError) onScanError(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div id="qr-file-reader-temp" className="hidden"></div>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-8 text-center hover:border-sky-500 transition-colors">
        <Upload className="h-10 w-10 text-slate-400 mb-2" />
        <p className="text-xs text-slate-600 mb-3 font-medium">
          Upload prescription QR code image
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default QRUploader;