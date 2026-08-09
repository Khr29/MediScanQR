import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Pill, UserCircle, Bell, Menu, X } from 'lucide-react';
import Logo from '../components/common/Logo';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

// Simpler, less table-dense than the clinical/pharmacy/admin workspaces —
// patients need clarity, not density. Shares the same brand header/sidebar
// shell as every other portal; only the nav items and page content differ.
const PatientLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/patient/dashboard">
            <Logo subtitle="Patient Portal" />
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
          className={`fixed left-0 top-16 bottom-0 z-50 w-60 overflow-y-auto border-r border-ink-100 bg-white p-4 transition-transform duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-1.5" onClick={closeOnLinkClick}>
            <NavItem to="/patient/dashboard" icon={LayoutDashboard} label="Dashboard" tone="brand" />
            <NavItem to="/patient/prescriptions" icon={FileText} label="My Prescriptions" tone="brand" />
            <NavItem to="/patient/history" icon={Pill} label="Medicine History" tone="brand" />
            <NavItem to="/patient/notifications" icon={Bell} label="Notifications" tone="brand" />
            <NavItem to="/patient/profile" icon={UserCircle} label="My Profile" tone="brand" />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default PatientLayout;
