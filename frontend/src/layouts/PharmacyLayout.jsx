import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, LayoutDashboard, PackageCheck, History, UserCircle, Menu, X } from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const PharmacyLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/pharmacy/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <ScanLine className="h-5 w-5" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold tracking-tight text-slate-900">MediScanQR</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Pharmacy Portal</p>
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
          className={`fixed left-0 top-16 bottom-0 z-50 w-64 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Always-reachable primary action — the scan workflow is what pharmacy staff do all day. */}
          <Link
            to="/pharmacy/scan"
            onClick={() => setMobileOpen(false)}
            className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <ScanLine className="h-4 w-4" /> Scan Prescription
          </Link>

          <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1" onClick={closeOnLinkClick}>
            <NavItem to="/pharmacy/dashboard" icon={LayoutDashboard} label="Dashboard" tone="amber" />
            <NavItem to="/pharmacy/scan" icon={ScanLine} label="Scan QR" tone="amber" />
            <NavItem to="/pharmacy/history" icon={History} label="History" tone="amber" />
            <NavItem to="/pharmacy/profile" icon={UserCircle} label="Profile" tone="amber" />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
