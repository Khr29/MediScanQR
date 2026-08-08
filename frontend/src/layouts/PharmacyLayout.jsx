import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, LayoutDashboard, PackageCheck, History } from 'lucide-react';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';

const PharmacyLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <Link to="/pharmacy/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-slate-900">MediScanQR</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Pharmacy Portal</p>
          </div>
        </Link>
        <UserMenu />
      </header>

      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 min-h-[calc(100vh-4rem)]">
          {/* Always-reachable primary action — the scan workflow is what pharmacy staff do all day. */}
          <Link
            to="/pharmacy/scan"
            className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <ScanLine className="h-4 w-4" /> Scan Prescription
          </Link>

          <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            <NavItem to="/pharmacy/dashboard" icon={LayoutDashboard} label="Dashboard" tone="amber" />
            <NavItem to="/pharmacy/scan" icon={ScanLine} label="Scan QR" tone="amber" />
            <NavItem to="/pharmacy/history" icon={History} label="History" tone="amber" />
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
