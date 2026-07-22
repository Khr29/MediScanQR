import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import { BarChart3, Pill, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getDoctorAnalytics } from '../../services/doctorService';

const DoctorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getDoctorAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Prescription Analytics</h1>
          <p className="text-xs text-slate-500 mb-8">Statistical trends of prescribed medications</p>

          {loading ? (
            <Loader text="Generating analytics reports..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Medicines Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-sky-600" /> Most Prescribed Medicines
                </h2>
                <div className="space-y-4">
                  {analytics?.topMedicines?.map((med, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{med.name}</span>
                        <span className="text-sky-600">{med.count} prescriptions</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full"
                          style={{ width: `${Math.min(100, (med.count / (analytics?.totalRx || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-600" /> Dispensation Status Distribution
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                    <span className="text-2xl font-bold text-emerald-900">{analytics?.dispensedRate || '0%'}</span>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">Dispensed Rate</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 text-center">
                    <ShieldAlert className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                    <span className="text-2xl font-bold text-amber-900">{analytics?.pendingRate || '0%'}</span>
                    <p className="text-xs text-amber-700 mt-1 font-medium">Pending Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorAnalytics;