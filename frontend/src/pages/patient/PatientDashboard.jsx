import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, QrCode, Activity, ArrowRight } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import QRModal from '../../components/patient/QRModal';
import { getPatientDashboardStats } from '../../services/patientService';
import { getStatusVariant, formatDate } from '../../utils/formatters';

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <PatientLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading">Welcome back</h1>
          <p className="page-subheading">Here's an overview of your active digital prescriptions</p>
        </div>
        <Button as={Link} to="/patient/prescriptions" icon={FileText} bracket>
          View My Prescriptions
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={FileText} label="Total Prescriptions" value={stats?.totalPrescriptions} tone="sky" loading={loading} />
            <StatCard icon={Clock} label="Active / Pending" value={stats?.activePrescriptions} tone="amber" loading={loading} hero />
            <StatCard icon={CheckCircle2} label="Fulfilled / Dispensed" value={stats?.dispensedPrescriptions} tone="emerald" loading={loading} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">
                <Activity className="h-4 w-4 text-brand-500" /> Recent Prescriptions
              </h2>
              <Link to="/patient/prescriptions" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <Table
              headers={['Rx ID', 'Doctor', 'Medicines', 'Status', 'Issued Date', 'QR Pass']}
              emptyMessage="No prescriptions yet."
              loading={loading}
            >
              {stats?.recentPrescriptions?.map((rx) => (
                <tr key={rx._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{rx.prescriptionId || rx._id}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-2">
                      <Avatar name={rx.doctorName} size="sm" />
                      {rx.doctorName ? `Dr. ${rx.doctorName}` : 'Authorized Physician'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{rx.medicines?.length || 0} Meds</td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={getStatusVariant(rx.status)}>{rx.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{formatDate(rx.createdAt)}</td>
                  <td className="px-6 py-4 text-xs">
                    <button
                      onClick={() => setSelectedQR(rx)}
                      className="flex items-center gap-1 rounded-lg bg-accent-50 text-accent-600 px-2.5 py-1 text-xs font-semibold hover:bg-accent-100 transition-colors"
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

      <QRModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        qrCodeUrl={selectedQR?.qrCode}
        prescriptionId={selectedQR?.prescriptionId || selectedQR?._id}
        doctorName={selectedQR?.doctorName}
        date={selectedQR?.createdAt}
      />
    </PatientLayout>
  );
};

export default PatientDashboard;
