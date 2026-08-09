import React from 'react';

// The MediScanQR mark, drawn as vector shapes rather than a raster asset —
// stays crisp at any size/DPI and needs no image file to keep in sync.
// Corner brackets = the QR-scan viewfinder; pink disc + "M" = the wordmark's
// icon; the same mark is redrawn (not embedded) in the PDF generator.
const LogoMark = ({ size = 28 }) => {
  const s = size;
  const bracket = s * 0.32;
  const stroke = Math.max(1.6, s * 0.09);
  const r = s * 0.34;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <g stroke="#171717" strokeWidth={stroke} strokeLinecap="round" fill="none">
        <path d={`M${stroke / 2} ${bracket} V${stroke / 2} H${bracket}`} />
        <path d={`M${s - bracket} ${stroke / 2} H${s - stroke / 2} V${bracket}`} />
        <path d={`M${s - stroke / 2} ${s - bracket} V${s - stroke / 2} H${s - bracket}`} />
        <path d={`M${bracket} ${s - stroke / 2} H${stroke / 2} V${s - bracket}`} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="#E9005B" />
      <text
        x={cx}
        y={cy}
        dy="0.35em"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="800"
        fontSize={r * 1.15}
        fill="#FFFFFF"
      >
        M
      </text>
    </svg>
  );
};

// Single source of truth for the MediScanQR wordmark — used in every layout
// header, every login page, and the public verify page. Never re-implement
// the icon-chip/text version of this again; swap this component instead.
const Logo = ({ subtitle, height = 28, className = '', subtitleClassName = '' }) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={height} />
      <span
        className="inline-flex items-baseline font-extrabold tracking-tight leading-none"
        style={{ fontSize: height * 0.62 }}
      >
        <span className="text-ink-900">Medi</span>
        <span className="text-brand-500">Scan</span>
        <span className="text-ink-900">QR</span>
      </span>
      {subtitle && (
        <span
          className={`border-l border-ink-100 pl-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${subtitleClassName}`}
        >
          {subtitle}
        </span>
      )}
    </span>
  );
};

export default Logo;
