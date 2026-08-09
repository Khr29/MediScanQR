import React from 'react';
import Badge from './Badge';
import { getStatusVariant } from '../../utils/formatters';

const DOT_COLORS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-accent-500',
  brand: 'bg-brand-500',
  neutral: 'bg-slate-400',
};

// Status pill used everywhere a prescription/user/approval status is shown —
// wraps the existing Badge + formatters.getStatusVariant mapping so every
// page renders the same status semantics instead of ad-hoc color logic.
const StatusBadge = ({ status, label, className = '' }) => {
  const variant = getStatusVariant(status);
  return (
    <Badge variant={variant} className={`gap-1.5 ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[variant] || DOT_COLORS.neutral}`} />
      {label || status}
    </Badge>
  );
};

export default StatusBadge;
