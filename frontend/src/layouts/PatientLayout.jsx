import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, FileText, Pill, UserCircle, Bell, Menu, X } from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

// Simpler, warmer, less table-dense than the clinical/admin portals —
// patients need clarity, not density.
const PatientLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-emerald-100 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-emerald-50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/patient/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold tracking-tight text-slate-900">MediScanQR</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">My Health</p>
            </div>
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
          className={`fixed left-0 top-16 bottom-0 z-50 w-60 overflow-y-auto border-r border-emerald-100 bg-white p-4 transition-transform duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-1.5" onClick={closeOnLinkClick}>
            <NavItem to="/patient/dashboard" icon={LayoutDashboard} label="Dashboard" tone="emerald" />
            <NavItem to="/patient/prescriptions" icon={FileText} label="My Prescriptions" tone="emerald" />
            <NavItem to="/patient/history" icon={Pill} label="Medicine History" tone="emerald" />
            <NavItem to="/patient/notifications" icon={Bell} label="Notifications" tone="emerald" />
            <NavItem to="/patient/profile" icon={UserCircle} label="My Profile" tone="emerald" />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default PatientLayout;
