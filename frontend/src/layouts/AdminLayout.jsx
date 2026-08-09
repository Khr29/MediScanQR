import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserRound,
  Building2,
  ClipboardCheck,
  History,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import Logo from '../components/common/Logo';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import NavGroup from '../components/common/NavGroup';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const USER_MANAGEMENT_PATHS = ['/admin/users', '/admin/users/doctors', '/admin/users/patients', '/admin/users/pharmacies'];
const APPROVAL_PATHS = ['/admin/doctor-approvals', '/admin/pharmacy-approvals'];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const inUserManagement = USER_MANAGEMENT_PATHS.includes(location.pathname);
  const inApprovals = APPROVAL_PATHS.includes(location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Delegated: closes the drawer only when an actual nav link is clicked,
  // not when a NavGroup's expand/collapse toggle button is clicked.
  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header stays the same MediScanQR-branded shell as every other portal —
          the dark, authority-signaling treatment lives on the sidebar below. */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/admin/dashboard">
            <Logo subtitle="Administration" />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <NotificationDropdown />
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed left-0 top-16 bottom-0 z-50 w-72 overflow-y-auto bg-ink-900 p-4 transition-transform duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1" onClick={closeOnLinkClick}>
            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" tone="brand" dark />

            <NavGroup label="User Management" icon={Users} defaultOpen={inUserManagement} dark>
              <NavItem to="/admin/users" icon={Users} label="All Users" tone="brand" dark indent />
              <NavItem to="/admin/users/doctors" icon={Stethoscope} label="Doctors" tone="brand" dark indent />
              <NavItem to="/admin/users/patients" icon={UserRound} label="Patients" tone="brand" dark indent />
              <NavItem to="/admin/users/pharmacies" icon={Building2} label="Pharmacies" tone="brand" dark indent />
            </NavGroup>

            <NavGroup label="Approvals" icon={ClipboardCheck} defaultOpen={inApprovals} dark>
              <NavItem to="/admin/doctor-approvals" icon={Stethoscope} label="Doctor Approvals" tone="brand" dark indent />
              <NavItem to="/admin/pharmacy-approvals" icon={Building2} label="Pharmacy Approvals" tone="brand" dark indent />
            </NavGroup>

            <NavItem to="/admin/prescriptions" icon={FileText} label="Prescriptions" tone="brand" dark />
            <NavItem to="/admin/audit-logs" icon={History} label="Audit Logs" tone="brand" dark />
            <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" tone="brand" dark />
            <NavItem to="/admin/settings" icon={Settings} label="Settings" tone="brand" dark />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
