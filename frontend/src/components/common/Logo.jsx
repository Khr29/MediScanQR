import React from 'react';
import logoSrc from '../../assets/mediscanqr-logo.png';

// Single source of truth for the MediScanQR wordmark — used in every layout
// header, every login page, and the public verify page. Never re-implement
// the icon-chip/text version of this again; swap this component instead.
const Logo = ({ subtitle, height = 28, className = '', subtitleClassName = '' }) => {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={logoSrc} alt="MediScanQR" style={{ height }} className="w-auto shrink-0" />
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
