import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, LayoutDashboard, History, UserCircle, Menu, X } from 'lucide-react';
import Logo from '../components/common/Logo';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import Button from '../components/common/Button';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const PharmacyLayout = ({ children }) => {
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
          <Link to="/pharmacy/dashboard">
            <Logo subtitle="Pharmacy Portal" />
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
          className={`fixed left-0 top-16 bottom-0 z-50 w-64 overflow-y-auto border-r border-ink-100 bg-white p-4 transition-transform duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Always-reachable primary action — the scan workflow is what pharmacy
              staff do all day. Cyan (accent), not brand pink: this is the QR/
              healthcare-tech action, not a generic primary CTA. */}
          <Button
            as={Link}
            to="/pharmacy/scan"
            onClick={() => setMobileOpen(false)}
            variant="accent"
            icon={ScanLine}
            fullWidth
            className="mb-4"
          >
            Scan Prescription
          </Button>

          <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1" onClick={closeOnLinkClick}>
            <NavItem to="/pharmacy/dashboard" icon={LayoutDashboard} label="Dashboard" tone="brand" />
            <NavItem to="/pharmacy/scan" icon={ScanLine} label="Scan QR" tone="accent" />
            <NavItem to="/pharmacy/history" icon={History} label="History" tone="brand" />
            <NavItem to="/pharmacy/profile" icon={UserCircle} label="Profile" tone="brand" />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
