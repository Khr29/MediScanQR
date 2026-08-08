import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, FilePlus, FileText, Users, BarChart3 } from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';

const DoctorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <Link to="/doctor/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-slate-900">MediScanQR</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">Clinician Portal</p>
          </div>
        </Link>
        <UserMenu />
      </header>

      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 min-h-[calc(100vh-4rem)]">
          <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            <NavItem to="/doctor/dashboard" icon={LayoutDashboard} label="Dashboard" tone="sky" />
            <NavItem to="/doctor/create-prescription" icon={FilePlus} label="Create Prescription" tone="sky" />
            <NavItem to="/doctor/history" icon={FileText} label="Prescription History" tone="sky" />
            <NavItem to="/doctor/patients" icon={Users} label="Patient Management" tone="sky" />
            <NavItem to="/doctor/analytics" icon={BarChart3} label="Analytics" tone="sky" />
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
