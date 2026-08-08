import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { getCurrentUser } from '../../services/authService';
import { formatDateTime } from '../../utils/formatters';
import { User, Mail, ShieldCheck, CalendarClock } from 'lucide-react';

const AdminSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentUser();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">Settings</h1>
      <p className="page-subheading mb-6">Your administrator account details</p>

      {error ? (
        <ErrorState message={error} onRetry={fetchProfile} />
      ) : loading ? (
        <Loader text="Loading account details..." />
      ) : (
        <div className="card max-w-xl p-6 divide-y divide-slate-100">
          <div className="flex items-center gap-3 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{profile?.name}</p>
              <Badge variant="info">{profile?.role}</Badge>
            </div>
          </div>

          <div className="py-4 flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{profile?.email}</p>
            </div>
          </div>

          <div className="py-4 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Account Status</p>
              <p className="text-sm text-slate-700">{profile?.isApproved ? 'Active' : 'Pending'}</p>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <CalendarClock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Administrator Since</p>
              <p className="text-sm text-slate-700">{formatDateTime(profile?.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
