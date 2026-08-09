import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-accent-50 text-accent-700 border-accent-200',
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
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