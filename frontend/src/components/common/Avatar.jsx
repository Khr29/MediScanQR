import React from 'react';

// Deterministic tint from a small palette, keyed off the name itself — the
// same person renders with the same color everywhere without the backend
// needing to store or assign a per-user color.
const PALETTE = [
  'bg-brand-100 text-brand-700',
  'bg-accent-100 text-accent-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Initials-circle avatar. Use anywhere a person's name appears in a
// table/list row, in place of plain text: `<Avatar name={x} />` + text.
const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const tone = PALETTE[hashString(String(name)) % PALETTE.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size] || SIZES.md} ${tone} ${className}`}
    >
      {getInitials(name)}
    </span>
  );
};

export default Avatar;
