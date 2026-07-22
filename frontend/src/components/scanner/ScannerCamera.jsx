import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera } from 'lucide-react';

const ScannerCamera = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'camera-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        if (onScanSuccess) onScanSuccess(decodedText);
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
        <Camera className="h-4 w-4 text-sky-600" />
        <span>Live Camera Scanner</span>
      </div>
      <div id="camera-reader" className="overflow-hidden rounded-lg border border-slate-200"></div>
    </div>
  );
};

export default ScannerCamera;