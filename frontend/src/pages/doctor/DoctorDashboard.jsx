import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, Users, FileText, TrendingUp, Activity, Plus } from 'lucide-react';
import DoctorLayout from '../../layouts/DoctorLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import { getDoctorDashboardStats } from '../../services/doctorService';
import { getStatusVariant, formatDate } from '../../utils/formatters';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DoctorLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-heading">Doctor Dashboard</h1>
          <p className="page-subheading">Overview of your prescriptions and patient queue</p>
        </div>
        <Button as={Link} to="/doctor/create-prescription" icon={Plus}>
          New Prescription
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FileText} label="Total Prescriptions" value={stats?.totalPrescriptions} tone="sky" loading={loading} />
            <StatCard icon={FilePlus} label="Issued Today" value={stats?.todayPrescriptions} tone="emerald" loading={loading} />
            <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients} tone="indigo" loading={loading} />
            <StatCard icon={TrendingUp} label="Dispensed Count" value={stats?.dispensedCount} tone="amber" loading={loading} />
          </div>

          <div>
            <h2 className="section-title mb-3">
              <Activity className="h-4 w-4 text-brand-500" /> Recent Prescriptions
            </h2>
            <Table
              headers={['Prescription ID', 'Patient', 'Medicines', 'Status', 'Issued Date']}
              emptyMessage="No prescriptions created yet."
              loading={loading}
            >
              {stats?.recentPrescriptions?.map((rx) => (
                <tr key={rx._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{rx.patient?.name || rx.patientName || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      )}
    </DoctorLayout>
  );
};

export default DoctorDashboard;
