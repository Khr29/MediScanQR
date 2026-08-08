import React from 'react';
import { Check, Bell, X, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const NotificationList = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-[11px] font-semibold text-sky-600 hover:underline">
              Mark all read
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No notifications available.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start justify-between p-3 text-xs rounded-lg transition-colors ${
                notif.isRead ? 'opacity-60 bg-white' : 'bg-sky-50/50 font-medium'
              }`}
            >
              <div className="flex gap-2.5">
                <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-800 leading-snug">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif._id)}
                  className="rounded p-1 text-sky-600 hover:bg-sky-100 transition-colors shrink-0 ml-2"
                  title="Mark as Read"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;