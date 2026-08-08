import React from 'react';
import PatientLayout from '../../layouts/PatientLayout';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, FileText, PackageCheck, ShieldCheck } from 'lucide-react';

const TYPE_ICONS = {
  NEW_RX: FileText,
  DISPENSED: PackageCheck,
  EXPIRING: Bell,
  SYSTEM: ShieldCheck,
};

const PatientNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return (
    <PatientLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Updates about your prescriptions and account</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="No notifications yet" message="You'll see updates here when your prescriptions change status." />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            return (
              <div
                key={notif._id}
                className={`flex items-start justify-between gap-3 p-4 ${notif.isRead ? '' : 'bg-emerald-50/40'}`}
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-100 transition-colors shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientNotifications;
