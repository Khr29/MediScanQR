import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/common/StatCard';
import ProgressRing from '../../components/common/ProgressRing';
import ErrorState from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import { getSystemAnalytics } from '../../services/adminService';
import { CalendarClock, FileCheck2, FileText, Users } from 'lucide-react';

const ROLE_BARS = [
  { key: 'totalDoctors', label: 'Doctors', barClass: 'bg-sky-500' },
  { key: 'totalPharmacies', label: 'Pharmacies', barClass: 'bg-amber-500' },
  { key: 'totalPatients', label: 'Patients', barClass: 'bg-emerald-500' },
];

const SystemAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getSystemAnalytics();
      setData(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalForDistribution = data ? data.totalDoctors + data.totalPharmacies + data.totalPatients : 0;

  return (
    <AdminLayout>
      <h1 className="page-heading mb-1">System Analytics</h1>
      <p className="page-subheading mb-6">Platform throughput, role distribution, and prescription fulfillment</p>

      {error ? (
        <ErrorState message={error} onRetry={fetchAnalytics} />
      ) : loading ? (
        <Loader text="Generating platform analytics..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={data?.totalUsers} tone="indigo" />
            <StatCard icon={FileText} label="Total Prescriptions" value={data?.totalPrescriptions} tone="slate" />
            <StatCard icon={FileCheck2} label="Dispensed" value={data?.dispensedPrescriptions} tone="emerald" />
            <StatCard icon={CalendarClock} label="Prescribed This Month" value={data?.monthlyPrescriptions} tone="sky" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" /> Platform Role Distribution
              </h3>
              <div className="space-y-4">
                {ROLE_BARS.map(({ key, label, barClass }) => {
                  const count = data?.[key] || 0;
                  const pct = totalForDistribution ? Math.round((count / totalForDistribution) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span>{label}</span>
                        <span>
                          {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${barClass} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-6 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 self-start flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" /> Prescription Fulfillment
              </h3>
              <ProgressRing
                value={data?.fulfillmentRate || 0}
                tone="emerald"
                size={140}
                strokeWidth={14}
                label={`${data?.dispensedPrescriptions || 0} of ${data?.totalPrescriptions || 0} prescriptions dispensed`}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SystemAnalytics;
