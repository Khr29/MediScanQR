import React, { useEffect, useState } from 'react';
import DoctorLayout from '../../layouts/DoctorLayout';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import ProgressRing from '../../components/common/ProgressRing';
import EmptyState from '../../components/common/EmptyState';
import { BarChart3, Pill, TrendingUp } from 'lucide-react';
import { getDoctorAnalytics } from '../../services/doctorService';

const DoctorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxMonthly = Math.max(1, ...(analytics?.monthlyTrend?.map((m) => m.count) || [1]));
  const topMedicineMax = Math.max(1, ...(analytics?.topMedicines?.map((m) => m.count) || [1]));

  return (
    <DoctorLayout>
      <h1 className="page-heading mb-1">Prescription Analytics</h1>
      <p className="page-subheading mb-8">Statistical trends from prescriptions you've issued</p>

      {error ? (
        <ErrorState message={error} onRetry={fetchAnalytics} />
      ) : loading ? (
        <Loader text="Generating analytics report..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="section-title mb-4">
                <Pill className="h-4 w-4 text-sky-600" /> Most Prescribed Medicines
              </h2>
              {!analytics?.topMedicines?.length ? (
                <EmptyState title="No prescriptions yet" message="Medicine trends will appear here once you issue prescriptions." />
              ) : (
                <div className="space-y-4">
                  {analytics.topMedicines.map((med) => (
                    <div key={med.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{med.name}</span>
                        <span className="text-sky-600">{med.count} prescriptions</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full"
                          style={{ width: `${(med.count / topMedicineMax) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 flex items-center justify-center gap-8">
              <ProgressRing value={analytics?.dispensedRate || 0} tone="emerald" size={120} strokeWidth={12} label="Dispensed" />
              <ProgressRing value={analytics?.activeRate || 0} tone="amber" size={120} strokeWidth={12} label="Active" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-5">
              <TrendingUp className="h-4 w-4 text-sky-600" /> Prescriptions Issued — Last 6 Months
            </h2>
            <div className="flex items-end justify-between gap-3 h-40">
              {analytics?.monthlyTrend?.map((m) => (
                <div key={m.label} className="flex flex-col items-center flex-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600 mb-1">{m.count}</span>
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-md bg-sky-500"
                    style={{ height: `${Math.max(4, (m.count / maxMonthly) * 100)}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400 mt-2">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BarChart3 className="h-3.5 w-3.5" />
            Based on {analytics?.totalPrescriptions || 0} total prescriptions
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorAnalytics;
