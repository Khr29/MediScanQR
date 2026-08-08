import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PharmacyLayout from '../../layouts/PharmacyLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import { getPharmacyDashboardStats } from '../../services/pharmacyService';
import { getStatusVariant, formatDate } from '../../utils/formatters';
import { QrCode, CheckCircle2, ShieldAlert, Scan } from 'lucide-react';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPharmacyDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacy metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <PharmacyLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-heading">Pharmacy Dispense Portal</h1>
          <p className="page-subheading">Scan QR codes to verify and dispense medication</p>
        </div>
        <Link
          to="/pharmacy/scan"
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Scan className="h-4 w-4" /> Scan QR Pass
        </Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={QrCode} label="Today's Scans" value={stats?.todaysScans} tone="amber" loading={loading} />
            <StatCard icon={CheckCircle2} label="Total Dispensed" value={stats?.totalDispensed} tone="emerald" loading={loading} />
            <StatCard icon={ShieldAlert} label="Invalid / Rejected" value={stats?.invalidRejected} tone="rose" loading={loading} />
          </div>

          <div>
            <h2 className="section-title mb-3">Recent Verification Scans</h2>
            <Table
              headers={['Rx ID', 'Patient', 'Status', 'Verified Date', 'Action']}
              emptyMessage="No recent scans recorded."
              loading={loading}
            >
              {stats?.recentScans?.map((rx) => (
                <tr key={rx._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{rx.patient?.name || rx.patientName || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.updatedAt)}</td>
                  <td className="px-6 py-4 text-xs">
                    <Link to={`/pharmacy/history/${rx.prescriptionId || rx._id}`} className="font-semibold text-amber-600 hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      )}
    </PharmacyLayout>
  );
};

export default PharmacyDashboard;
