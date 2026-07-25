import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, FileText, Users, QrCode, CheckCircle, ShieldCheck, History, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const getMenuItems = () => {
    switch (user.role) {
      case 'DOCTOR':
        return [
          { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'Create Prescription', path: '/doctor/create-prescription', icon: FilePlus },
          { label: 'Prescription History', path: '/doctor/history', icon: FileText },
          { label: 'Patient Search', path: '/doctor/patients', icon: Users },
        ];
      case 'PATIENT':
        return [
          { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'My Prescriptions', path: '/patient/prescriptions', icon: FileText },
          { label: 'My Profile', path: '/patient/profile', icon: UserCircle },
        ];
      case 'PHARMACY':
        return [
          { label: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
          { label: 'Verify QR Code', path: '/pharmacy/scan', icon: QrCode },
          { label: 'Dispense Logs', path: '/pharmacy/history', icon: CheckCircle },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Approvals', path: '/admin/approvals', icon: ShieldCheck },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 shadow-sm min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        Navigation
      </div>
      <nav className="space-y-1">
        {getMenuItems().map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sky-50 text-sky-700 font-semibold border-r-4 border-sky-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;