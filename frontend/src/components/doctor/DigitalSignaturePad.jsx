import React, { useRef, useState } from 'react';
import { Eraser, Check } from 'lucide-react';

const DigitalSignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0284c7'; // Sky-600 color
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) onSave(dataUrl);
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Doctor Digital Signature
        </label>
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
        >
          <Eraser className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-36 cursor-crosshair touch-none"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSigned}
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          <Check className="h-3.5 w-3.5" /> Confirm Signature
        </button>
      </div>
    </div>
  );
};

export default DigitalSignaturePad;