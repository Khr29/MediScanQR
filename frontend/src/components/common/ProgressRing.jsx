import React from 'react';

// Legacy tone-name keys kept as-is (callers already pass these), remapped to
// the new brand/status palette: sky->brand pink, indigo->accent cyan.
const STROKE_TONES = {
  sky: '#e9005b',
  emerald: '#16a34a',
  amber: '#f59e0b',
  indigo: '#16a9e0',
  rose: '#dc2626',
};

// Dependency-free SVG ring chart used across Admin/Doctor analytics — avoids
// pulling in a full charting library for a single percentage indicator.
const ProgressRing = ({ value = 0, size = 96, strokeWidth = 10, tone = 'sky', label }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e5e5" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE_TONES[tone] || STROKE_TONES.sky}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-ink-900">
            {clamped % 1 === 0 ? clamped : clamped.toFixed(1)}%
          </span>
        </div>
      </div>
      {label && <p className="mt-3 text-xs font-medium text-slate-500 text-center">{label}</p>}
    </div>
  );
};

export default ProgressRing;
