import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode } from 'lucide-react';

const QRDisplay = ({ value, title = 'Prescription QR Pass', size = 220, showActions = true }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
        { width: size, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } },
        (error) => {
          if (error) console.error('Error rendering QR code:', error);
        }
      );
    }
  }, [value, size]);

  const handleCopy = () => {
    const textToCopy = typeof value === 'object' ? JSON.stringify(value) : String(value);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prescription-QR-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-4 w-4 text-sky-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</h3>
        </div>
      )}

      <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-inner mb-4">
        <canvas ref={canvasRef} />
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            {copied ? 'Copied Payload' : 'Copy Payload'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download QR
          </button>
        </div>
      )}
    </div>
  );
};

export default QRDisplay;