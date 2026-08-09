import React from 'react';
import { Link } from 'react-router-dom';
import { SkeletonBar } from './Skeleton';

// Static class map — Tailwind's JIT compiler only picks up class names it can
// see literally in source, so tone -> classes must be a lookup, not a template string.
// `sky` (legacy tone name) now renders as brand pink, `indigo` as accent cyan —
// kept as the same prop values pages already pass to limit churn.
const TONES = {
  sky: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  indigo: 'bg-accent-50 text-accent-600',
  rose: 'bg-rose-100 text-rose-700',
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
        <SkeletonBar className="mt-3 h-8 w-16" />
      ) : (
        <p className="text-[28px] leading-tight font-bold text-ink-900 mt-2">{value ?? 0}</p>
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
