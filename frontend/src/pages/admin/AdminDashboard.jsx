import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { getAdminDashboardStats } from '../../services/adminService';
import { Users, Stethoscope, Building2, FileText, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Admin Command Center</h1>
            <p className="text-xs text-slate-500 mt-1">System monitoring, verification queues, and audit log tracking</p>
          </div>

          {loading ? (
            <Loader text="Loading administrative dashboard..." />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Pending Doctors</span>
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.pendingDoctors || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Pending Pharmacies</span>
                    <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.pendingPharmacies || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Users</span>
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Prescriptions</span>
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalPrescriptions || 0}</p>
                </div>
              </div>

              {/* System Audit Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" /> Recent Security Events
                  </h2>
                  <Link
                    to="/admin/audit-logs"
                    className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    View Full Logs <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <Table
                  headers={['Timestamp', 'User', 'Action', 'IP Address', 'Severity']}
                  emptyMessage="No security audit events recorded."
                >
                  {stats?.recentLogs?.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">{log.userName || log.user || 'System'}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{log.action}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge variant={log.severity === 'CRITICAL' || log.severity === 'HIGH' ? 'danger' : 'info'}>
                          {log.severity || 'INFO'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;