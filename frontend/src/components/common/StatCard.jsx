import React from 'react';
import { Link } from 'react-router-dom';

// Static class map — Tailwind's JIT compiler only picks up class names it can
// see literally in source, so tone -> classes must be a lookup, not a template string.
const TONES = {
  sky: 'bg-sky-100 text-sky-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  rose: 'bg-rose-100 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

const StatCard = ({ icon: Icon, label, value, tone = 'sky', to = null, loading = false }) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        {Icon && (
          <div className={`rounded-lg p-2 ${TONES[tone] || TONES.sky}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 mt-2">{value ?? 0}</p>
      )}
    </>
  );

  const className = 'stat-card transition-shadow' + (to ? ' hover:shadow-md' : '');

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

export default StatCard;
