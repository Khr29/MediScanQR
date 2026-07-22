import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, Users, FileText, TrendingUp, Activity, Plus } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { getDoctorDashboardStats } from '../../services/doctorService';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDoctorDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1">Overview of today's prescriptions and patient queue</p>
            </div>
            <Link
              to="/doctor/create-prescription"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Prescription
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading dashboard metrics..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Prescriptions</span>
                    <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalPrescriptions || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Issued Today</span>
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <FilePlus className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.todayPrescriptions || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Patients</span>
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalPatients || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Dispensed Count</span>
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.dispensedCount || 0}</p>
                </div>
              </div>

              {/* Recent Prescriptions Table */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-600" /> Recent Prescriptions
                </h2>
                <Table
                  headers={['Prescription ID', 'Patient', 'Medicines', 'Status', 'Issued Date']}
                  emptyMessage="No recent prescriptions created."
                >
                  {stats?.recentPrescriptions?.map((rx) => (
                    <tr key={rx._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{rx.patient?.name || rx.patientName || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge variant={rx.status === 'DISPENSED' ? 'success' : 'info'}>{rx.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</td>
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

export default DoctorDashboard;