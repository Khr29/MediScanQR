import React, { useRef, useState } from 'react';
import { Eraser, Check } from 'lucide-react';

const getPoint = (canvas, e) => {
  const rect = canvas.getBoundingClientRect();
  const source = 'touches' in e ? e.touches[0] || e.changedTouches[0] : e;
  return { x: source.clientX - rect.left, y: source.clientY - rect.top };
};

const DigitalSignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [saved, setSaved] = useState(false);

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getPoint(canvas, e);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setSaved(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getPoint(canvas, e);
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0284c7'; // Sky-600
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSaved(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) onSave(dataUrl);
    setSaved(true);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Digital Signature <span className="font-normal normal-case text-slate-400">(optional)</span>
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
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
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
          <Check className="h-3.5 w-3.5" /> {saved ? 'Signature Saved' : 'Confirm Signature'}
        </button>
      </div>
    </div>
  );
};

export default DigitalSignaturePad;
