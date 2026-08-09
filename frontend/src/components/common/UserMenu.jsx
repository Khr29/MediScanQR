import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Identity chip + logout, shared by every role layout's header so the
// account/session affordance stays consistent without duplicating markup.
// `dark` flips text colors for use on a dark header bar (Admin).
const UserMenu = ({ dark = false }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div
      className={`flex items-center gap-3 border-l pl-4 ${dark ? 'border-white/10' : 'border-slate-200'}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold border ${
            dark ? 'bg-white/10 text-white border-white/10' : 'bg-brand-50 text-brand-600 border-brand-200'
          }`}
        >
          <User className="h-4 w-4" />
        </div>
        <div className="hidden text-left md:block">
          <p className={`text-sm font-semibold leading-none ${dark ? 'text-white' : 'text-ink-900'}`}>
            {user.name}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
        </div>
      </div>

      <button
        onClick={logout}
        className={`rounded-lg p-2 transition-colors ${
          dark
            ? 'text-slate-400 hover:bg-white/10 hover:text-rose-400'
            : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
        }`}
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
};

export default UserMenu;
