import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { getPharmacyDashboardStats } from '../../services/pharmacyService';
import { QrCode, CheckCircle2, Clock, ShieldCheck, ArrowRight, Scan } from 'lucide-react';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPharmacyDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching pharmacy stats:', err);
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
              <h1 className="text-2xl font-bold text-slate-900">Pharmacy Dispense Portal</h1>
              <p className="text-xs text-slate-500 mt-1">Scan QR codes to verify and dispense medication</p>
            </div>
            <Link
              to="/pharmacy/scan"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
            >
              <Scan className="h-4 w-4" /> Scan QR Pass
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading pharmacy metrics..." />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Today's Scans</span>
                    <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
                      <QrCode className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.todaysScans || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Dispensed</span>
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalDispensed || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Invalid / Rejected</span>
                    <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.invalidRejected || 0}</p>
                </div>
              </div>

              {/* Recent Scan Logs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800">Recent Verification Scans</h2>
                </div>

                <Table
                  headers={['Rx ID', 'Patient', 'Status', 'Verified Date', 'Action']}
                  emptyMessage="No recent scans recorded today."
                >
                  {stats?.recentScans?.map((rx) => (
                    <tr key={rx._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{rx.patient?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge variant={rx.status === 'DISPENSED' ? 'success' : 'info'}>{rx.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(rx.updatedAt || Date.now()).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs">
                        <Link
                          to={`/pharmacy/history/${rx.prescriptionId || rx._id}`}
                          className="font-semibold text-sky-600 hover:underline"
                        >
                          View Details
                        </Link>
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

export default PharmacyDashboard;