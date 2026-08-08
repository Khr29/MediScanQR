import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  PATIENT: '/patient/dashboard',
  PHARMACY: '/pharmacy/dashboard',
};

const Unauthorized = () => {
  const { user } = useAuth();
  const home = ROLE_HOME[user?.role] || '/login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Your account doesn't have permission to view this page.
      </p>
      <Link
        to={home}
        className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
      >
        Back to my dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
