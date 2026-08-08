import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { getUserDetail } from '../../services/adminService';
import { getStatusVariant, formatDate, formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Mail, Award, Stethoscope, Building2, MapPin, Phone, Calendar, Activity, PenTool } from 'lucide-react';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserDetail(id);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <Loader text="Loading user details..." />
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <ErrorState message={error} onRetry={fetchDetail} />
      </AdminLayout>
    );
  }

  const { user, profile, recentActivity } = data;

  return (
    <AdminLayout>
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</span>
            <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
          </div>
          <Badge variant={user.isApproved ? 'success' : 'warning'}>{user.isApproved ? 'Approved' : 'Pending'}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-3.5 w-3.5 text-indigo-600" /> {user.email}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Registered {formatDate(user.createdAt)}
          </div>

          {user.role === 'DOCTOR' && profile && (
            <>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="h-3.5 w-3.5 text-indigo-600" /> License: {profile.licenseNumber || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Stethoscope className="h-3.5 w-3.5 text-indigo-600" /> {profile.specialization || 'N/A'}
              </div>
              {profile.hospitalName && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" /> {profile.hospitalName}
                </div>
              )}
              {profile.clinicAddress && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" /> {profile.clinicAddress}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-indigo-600" /> {profile.phone}
                </div>
              )}
            </>
          )}

          {user.role === 'PHARMACY' && profile && (
            <>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="h-3.5 w-3.5 text-indigo-600" /> License: {profile.licenseNumber || 'N/A'}
              </div>
              {profile.address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" /> {profile.address}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-indigo-600" /> {profile.phone}
                </div>
              )}
            </>
          )}

          {user.role === 'PATIENT' && profile && (
            <>
              <div className="flex items-center gap-2 text-slate-600">
                Age: {profile.age ?? 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                Blood Group: {profile.bloodGroup || 'N/A'}
              </div>
            </>
          )}
        </div>

        {user.role === 'DOCTOR' && profile?.digitalSignature && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <PenTool className="h-3 w-3" /> Doctor Signature
            </p>
            <img src={profile.digitalSignature} alt="Doctor signature" className="h-14 object-contain bg-slate-50 rounded border border-slate-200 p-1.5" />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" /> Recent Activity
        </h2>

        {!recentActivity || recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No recorded activity for this account yet.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div key={log._id} className="flex items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  {log.target && <span className="text-slate-500 ml-2">{log.target}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusVariant(log.result)}>{log.result}</Badge>
                  <span className="text-slate-400">{formatDateTime(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
