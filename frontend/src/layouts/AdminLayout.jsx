import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Stethoscope,
  UserRound,
  Building2,
  ClipboardCheck,
  History,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';

const USER_MANAGEMENT_PATHS = ['/admin/users', '/admin/users/doctors', '/admin/users/patients', '/admin/users/pharmacies'];
const APPROVAL_PATHS = ['/admin/doctor-approvals', '/admin/pharmacy-approvals'];

const NavGroup = ({ label, icon: Icon, children, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-slate-500" />
          {label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const inUserManagement = USER_MANAGEMENT_PATHS.includes(location.pathname);
  const inApprovals = APPROVAL_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Distinct dark header — signals this is a separate administration application. */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-slate-900 px-6 shadow-md">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-white">MediScanQR</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Administration</p>
          </div>
        </Link>
        <UserMenu dark />
      </header>

      <div className="flex flex-1">
        <aside className="w-72 shrink-0 bg-slate-900 p-4 min-h-[calc(100vh-4rem)]">
          <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" tone="indigo" dark />

            <NavGroup label="User Management" icon={Users} defaultOpen={inUserManagement}>
              <NavItem to="/admin/users" icon={Users} label="All Users" tone="indigo" dark indent />
              <NavItem to="/admin/users/doctors" icon={Stethoscope} label="Doctors" tone="indigo" dark indent />
              <NavItem to="/admin/users/patients" icon={UserRound} label="Patients" tone="indigo" dark indent />
              <NavItem to="/admin/users/pharmacies" icon={Building2} label="Pharmacies" tone="indigo" dark indent />
            </NavGroup>

            <NavGroup label="Approvals" icon={ClipboardCheck} defaultOpen={inApprovals}>
              <NavItem to="/admin/doctor-approvals" icon={Stethoscope} label="Doctor Approvals" tone="indigo" dark indent />
              <NavItem to="/admin/pharmacy-approvals" icon={Building2} label="Pharmacy Approvals" tone="indigo" dark indent />
            </NavGroup>

            <NavItem to="/admin/audit-logs" icon={History} label="Audit Logs" tone="indigo" dark />
            <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" tone="indigo" dark />
            <NavItem to="/admin/settings" icon={Settings} label="Settings" tone="indigo" dark />
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
