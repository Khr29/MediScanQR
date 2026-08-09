import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
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

// `hero` renders a solid brand-pink filled tile with white text and a bigger
// font-display number, for the single most important metric on a dashboard.
// Use on exactly one StatCard per page — it loses its impact as a pattern.
const StatCard = ({ icon: Icon, label, value, tone = 'sky', to = null, loading = false, hero = false, trend = null }) => {
  const content = hero ? (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/80">{label}</span>
        {Icon && (
          <div className="rounded-lg bg-white/15 p-2 text-white">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-20 animate-pulse rounded bg-white/20" />
      ) : (
        <p className="text-[34px] leading-tight font-bold font-display text-white mt-2">{value ?? 0}</p>
      )}
      {trend && !loading && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-white/85">
          <TrendingUp className="h-3 w-3" /> {trend}
        </p>
      )}
    </>
  ) : (
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
      {trend && !loading && <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{trend}</p>}
    </>
  );

  const className = `stat-card transition-shadow ${hero ? 'bg-brand-500 border-brand-500 shadow-md' : ''} ${
    to ? 'hover:shadow-md' : ''
  }`;

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
