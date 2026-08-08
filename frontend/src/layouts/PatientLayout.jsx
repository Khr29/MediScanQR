import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, FileText, Pill, UserCircle } from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';

// Simpler, warmer, less table-dense than the clinical/admin portals —
// patients need clarity, not density.
const PatientLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-emerald-50/40 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-emerald-100 bg-white px-6 shadow-sm">
        <Link to="/patient/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-slate-900">MediScanQR</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">My Health</p>
          </div>
        </Link>
        <UserMenu />
      </header>

      <div className="flex flex-1">
        <aside className="w-60 shrink-0 border-r border-emerald-100 bg-white p-4 min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1.5">
            <NavItem to="/patient/dashboard" icon={LayoutDashboard} label="Dashboard" tone="emerald" />
            <NavItem to="/patient/prescriptions" icon={FileText} label="My Prescriptions" tone="emerald" />
            <NavItem to="/patient/history" icon={Pill} label="Medicine History" tone="emerald" />
            <NavItem to="/patient/profile" icon={UserCircle} label="My Profile" tone="emerald" />
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8 max-w-5xl">{children}</main>
      </div>
    </div>
  );
};

export default PatientLayout;
