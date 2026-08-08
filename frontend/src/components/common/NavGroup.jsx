import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Collapsible sidebar nav section, shared by any layout that needs to group
// related nav items (e.g. Admin's "User Management", Doctor's "Prescriptions").
const NavGroup = ({ label, icon: Icon, children, defaultOpen = false, dark = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const buttonClasses = dark
    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  const iconClasses = dark ? 'text-slate-500' : 'text-slate-400';
  const chevronClasses = dark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${buttonClasses}`}
      >
        <span className="flex items-center gap-3">
          <Icon className={`h-4 w-4 ${iconClasses}`} />
          {label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${chevronClasses} ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
};

export default NavGroup;
