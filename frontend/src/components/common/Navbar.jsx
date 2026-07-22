import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-sky-600 hover:opacity-90">
        <Activity className="h-7 w-7 text-sky-600" />
        <span className="text-xl tracking-tight text-slate-900">
          MediScan<span className="text-sky-600">QR</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="hidden items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200 sm:flex">
              <Shield className="h-3.5 w-3.5" />
              {user.role}
            </span>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;