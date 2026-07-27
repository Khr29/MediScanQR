import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, QrCode, Activity, ArrowRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import QRModal from '../../components/patient/QRModal';
import { getPatientDashboardStats } from '../../services/patientService';

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPatientDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching patient dashboard stats:', err);
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
            <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Manage and view your active digital prescriptions</p>
          </div>

          {loading ? (
            <Loader text="Loading your health records..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                    <span className="text-xs font-semibold text-slate-500">Active / Pending</span>
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.activePrescriptions || 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Fulfilled / Dispensed</span>
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.dispensedPrescriptions || 0}</p>
                </div>
              </div>

              {/* Recent Prescriptions Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-sky-600" /> Active Prescriptions
                  </h2>
                  <Link
                    to="/patient/prescriptions"
                    className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <Table
                  headers={['Rx ID', 'Doctor', 'Medicines', 'Status', 'Issued Date', 'QR Pass']}
                  emptyMessage="No active prescriptions found."
                >
                  {stats?.recentPrescriptions?.map((rx) => (
                    <tr key={rx._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                        {rx.doctorName ? `Dr. ${rx.doctorName}` : 'Authorized Physician'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge variant={rx.status === 'DISPENSED' ? 'success' : 'info'}>{rx.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs">
                        <button
                          onClick={() => setSelectedQR(rx)}
                          className="flex items-center gap-1 rounded-lg bg-sky-50 text-sky-600 px-2.5 py-1 text-xs font-semibold hover:bg-sky-100 transition-colors"
                        >
                          <QrCode className="h-3.5 w-3.5" /> QR Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}

          {/* QR Modal Popup */}
          {selectedQR && (
            <QRModal
              isOpen={!!selectedQR}
              onClose={() => setSelectedQR(null)}
              qrCodeUrl={selectedQR.qrCodeUrl}
              prescriptionId={selectedQR.prescriptionId || selectedQR._id}
              doctorName={selectedQR.doctorName}
              date={selectedQR.createdAt}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;