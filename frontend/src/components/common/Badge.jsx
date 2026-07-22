import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
        variants[variant] || variants.info
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;