import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../layouts/PatientLayout';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, FileText, PackageCheck, ShieldCheck, ArrowRight } from 'lucide-react';

const TYPE_ICONS = {
  NEW_RX: FileText,
  DISPENSED: PackageCheck,
  EXPIRING: Bell,
  SYSTEM: ShieldCheck,
};

// Prescription-related types vs. account/system types — both real fields
// already returned by the API, just grouped for the filter tabs.
const PRESCRIPTION_TYPES = ['NEW_RX', 'DISPENSED', 'EXPIRING'];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'account', label: 'Account' },
  { key: 'unread', label: 'Unread' },
];

// The Rx ID is embedded in the notification's real message text (e.g.
// "...issued you a new prescription (RX-142709)."), not a separate field —
// pull it out so we can link to the prescriptions list pre-searched for it,
// without inventing a detail-page deep link the backend can't resolve.
const extractRxId = (message = '') => message.match(/RX-\d+/i)?.[0] || null;

const PatientNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'prescriptions':
        return notifications.filter((n) => PRESCRIPTION_TYPES.includes(n.type));
      case 'account':
        return notifications.filter((n) => !PRESCRIPTION_TYPES.includes(n.type));
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  return (
    <PatientLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Stay updated about your prescriptions and account</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-semibold text-brand-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="mb-5 flex items-center gap-1.5 rounded-xl border border-ink-100 bg-white p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.key ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={filter === 'all' ? 'No notifications yet' : 'No notifications here'}
            message={
              filter === 'all'
                ? "You'll see updates here when your prescriptions change status."
                : 'Try a different filter to see other notifications.'
            }
          />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const rxId = extractRxId(notif.message);
            return (
              <div
                key={notif._id}
                className={`flex items-start justify-between gap-3 p-4 ${notif.isRead ? '' : 'bg-brand-50/40'}`}
              >
                <div className="flex gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      {notif.title}
                      {!notif.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-label="Unread" />}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {rxId && (
                      <Link
                        to={`/patient/prescriptions?q=${encodeURIComponent(rxId)}`}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                      >
                        View Prescription <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="flex items-center gap-1 rounded-lg bg-brand-50 text-brand-600 px-2.5 py-1 text-xs font-semibold hover:bg-brand-100 transition-colors shrink-0"
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
