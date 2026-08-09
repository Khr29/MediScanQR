import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarClock, Pill, UserCircle, Bell, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '../components/common/Logo';
import UserMenu from '../components/common/UserMenu';
import NavItem from '../components/common/NavItem';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const SIDEBAR_COLLAPSE_KEY = 'mediscanqr:patientSidebarCollapsed';

const NAV_ITEMS = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/prescriptions', icon: FileText, label: 'My Prescriptions' },
  { to: '/patient/schedule', icon: CalendarClock, label: 'Medication Schedule' },
  { to: '/patient/history', icon: Pill, label: 'Medication History' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
  { to: '/patient/profile', icon: UserCircle, label: 'My Profile' },
];

// Simpler, less table-dense than the clinical/pharmacy/admin workspaces —
// patients need clarity, not density. Shares the same brand header/sidebar
// shell as every other portal; only the nav items and page content differ.
//
// The sidebar is collapsible (desktop/tablet) and persists the user's
// preference in localStorage. On mobile it's always the full-width drawer
// regardless of the collapse preference — collapse is a desktop-density
// choice, not something that makes sense on a touch overlay.
const PatientLayout = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      // localStorage unavailable (e.g. private browsing) — preference just won't persist.
    }
  }, [collapsed]);

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
          className={`fixed left-0 top-16 bottom-0 z-50 w-64 flex flex-col border-r border-ink-100 bg-white p-4 transition-[width,transform] duration-200 ease-in-out lg:static lg:top-auto lg:bottom-auto lg:z-0 lg:shrink-0 lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
        >
          <div className={`mb-2 hidden lg:flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-1.5" onClick={closeOnLinkClick}>
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                tone="brand"
                collapsed={collapsed && !mobileOpen}
              />
            ))}
          </nav>
        </aside>

        <main key={location.pathname} className="animate-page-enter flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
