import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Static class maps — Tailwind's JIT compiler needs literal class names, not
// template strings, so tone/theme -> classes must be lookups.
const LIGHT_TONES = {
  sky: 'bg-sky-50 text-sky-700 border-sky-600',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-600',
  amber: 'bg-amber-50 text-amber-700 border-amber-600',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-600',
};
const LIGHT_ICON_TONES = {
  sky: 'text-sky-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
};
const DARK_TONES = {
  indigo: 'bg-white/10 text-white border-indigo-400',
};
const DARK_ICON_TONES = {
  indigo: 'text-indigo-300',
};

// Single sidebar nav row, reused by every role layout. Each layout still owns
// its own nav tree/grouping/labels — only this leaf row's markup is shared.
const NavItem = ({ to, icon: Icon, label, tone = 'sky', dark = false, indent = false }) => {
  const location = useLocation();
  const active = location.pathname === to;

  const toneClasses = dark ? DARK_TONES[tone] || DARK_TONES.indigo : LIGHT_TONES[tone] || LIGHT_TONES.sky;
  const iconToneClasses = dark
    ? DARK_ICON_TONES[tone] || DARK_ICON_TONES.indigo
    : LIGHT_ICON_TONES[tone] || LIGHT_ICON_TONES.sky;

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
