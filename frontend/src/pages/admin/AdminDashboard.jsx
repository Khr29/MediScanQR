import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import { getAdminDashboardStats } from '../../services/adminService';
import { getStatusVariant, formatDateTime } from '../../utils/formatters';
import {
  Users,
  Stethoscope,
  UserRound,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  Activity,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const pendingTotal = (stats?.pendingDoctors || 0) + (stats?.pendingPharmacies || 0);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="page-heading">Admin Command Center</h1>
        <p className="page-subheading">System-wide statistics, verification queues, and audit activity</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} tone="indigo" loading={loading} />
            <StatCard icon={Stethoscope} label="Total Doctors" value={stats?.totalDoctors} tone="sky" loading={loading} />
            <StatCard icon={UserRound} label="Total Patients" value={stats?.totalPatients} tone="emerald" loading={loading} />
            <StatCard icon={Building2} label="Total Pharmacies" value={stats?.totalPharmacies} tone="amber" loading={loading} />
            <StatCard
              icon={Stethoscope}
              label="Pending Doctor Approvals"
              value={stats?.pendingDoctors}
              tone="amber"
              to="/admin/doctor-approvals"
              loading={loading}
            />
            <StatCard
              icon={Building2}
              label="Pending Pharmacy Approvals"
              value={stats?.pendingPharmacies}
              tone="amber"
              to="/admin/pharmacy-approvals"
              loading={loading}
            />
            <StatCard icon={FileText} label="Total Prescriptions" value={stats?.totalPrescriptions} tone="slate" loading={loading} />
            <StatCard icon={CheckCircle2} label="Dispensed Prescriptions" value={stats?.dispensedPrescriptions} tone="emerald" loading={loading} />
          </div>

          {!loading && pendingTotal > 0 && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-800">
                {pendingTotal} account{pendingTotal === 1 ? '' : 's'} waiting on approval
              </p>
              <div className="flex gap-3">
                {stats?.pendingDoctors > 0 && (
                  <Link to="/admin/doctor-approvals" className="text-xs font-semibold text-amber-800 hover:underline">
                    Review doctors ({stats.pendingDoctors})
                  </Link>
                )}
                {stats?.pendingPharmacies > 0 && (
                  <Link to="/admin/pharmacy-approvals" className="text-xs font-semibold text-amber-800 hover:underline">
                    Review pharmacies ({stats.pendingPharmacies})
                  </Link>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">
                <Activity className="h-4 w-4 text-indigo-600" /> Recent Activity
              </h2>
              <Link
                to="/admin/audit-logs"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View Full Audit Log <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <Table
              headers={['Timestamp', 'User', 'Role', 'Action', 'Target', 'Result']}
              emptyMessage="No recent activity recorded."
              loading={loading}
            >
              {stats?.recentLogs?.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{log.user || 'System'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{log.role}</td>
                  <td className="px-6 py-4 text-xs text-slate-700">{log.action}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{log.target || '—'}</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={getStatusVariant(log.result)}>{log.result}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
