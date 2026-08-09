import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Static class maps — Tailwind's JIT compiler needs literal class names, not
// template strings, so tone/theme -> classes must be lookups.
// One brand tone (pink) is used for the active-nav indicator across all four
// portals; `accent` (cyan) is available for QR/scan-specific items.
const LIGHT_TONES = {
  brand: 'bg-brand-50 text-brand-600 border-brand-500',
  accent: 'bg-accent-50 text-accent-600 border-accent-500',
};
const LIGHT_ICON_TONES = {
  brand: 'text-brand-500',
  accent: 'text-accent-500',
};
const DARK_TONES = {
  brand: 'bg-white/10 text-white border-brand-400',
  accent: 'bg-white/10 text-white border-accent-400',
};
const DARK_ICON_TONES = {
  brand: 'text-brand-400',
  accent: 'text-accent-400',
};

// Single sidebar nav row, reused by every role layout. Each layout still owns
// its own nav tree/grouping/labels — only this leaf row's markup is shared.
const NavItem = ({ to, icon: Icon, label, tone = 'brand', dark = false, indent = false }) => {
  const location = useLocation();
  const active = location.pathname === to;

  const toneClasses = dark ? DARK_TONES[tone] || DARK_TONES.brand : LIGHT_TONES[tone] || LIGHT_TONES.brand;
  const iconToneClasses = dark
    ? DARK_ICON_TONES[tone] || DARK_ICON_TONES.brand
    : LIGHT_ICON_TONES[tone] || LIGHT_ICON_TONES.brand;

  const inactiveClasses = dark
    ? 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent';

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg border-r-4 px-3 py-2.5 text-sm font-medium transition-colors ${
        indent ? 'pl-9' : ''
      } ${active ? toneClasses + ' font-semibold' : inactiveClasses}`}
    >
      {Icon && <Icon className={`h-4 w-4 shrink-0 ${active ? iconToneClasses : dark ? 'text-slate-500' : 'text-slate-400'}`} />}
      {label}
    </Link>
  );
};

export default NavItem;
