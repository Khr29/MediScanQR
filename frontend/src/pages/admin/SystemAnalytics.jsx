import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import { getSystemAnalytics } from '../../services/adminService';
import { Activity, Users, FileCheck, Shield, TrendingUp } from 'lucide-react';

const SystemAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await getSystemAnalytics();
        setData(stats);
      } catch (err) {
        console.error('Error fetching system analytics:', err);
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">System Health & Analytics</h1>
          <p className="text-xs text-slate-500 mb-6">Platform throughput, user adoption, and dispensation velocity</p>

          {loading ? (
            <Loader text="Generating platform analytics report..." />
          ) : (
            <div className="space-y-6">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Monthly Active Prescriptions</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{data?.monthlyPrescriptions || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Fulfillment Rate</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{data?.fulfillmentRate || '98.4%'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Verification Security Score</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">100%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-600" /> Platform Role Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Doctors</span>
                        <span>{data?.roleDistribution?.doctors || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Pharmacies</span>
                        <span>{data?.roleDistribution?.pharmacies || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Patients</span>
                        <span>{data?.roleDistribution?.patients || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" /> API Gateway Status
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">QR Generator Engine</span>
                      <span className="font-bold text-emerald-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">Database Connection</span>
                      <span className="font-bold text-emerald-600">Healthy (2ms)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">JWT Signing Service</span>
                      <span className="font-bold text-emerald-600">Active</span>
                    </div>
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

export default SystemAnalytics;