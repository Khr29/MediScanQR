import React from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const NotificationBell = ({ onClick, dark = false }) => {
  const { unreadCount } = useNotification();

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg p-2 transition-colors ${
        dark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
      }`}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;