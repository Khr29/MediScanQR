import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Clock, CheckCircle2, QrCode, Activity, ArrowRight, Pill, Utensils, CalendarClock } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { SkeletonBar, SkeletonCircle } from '../../components/common/Skeleton';
import QRModal from '../../components/patient/QRModal';
import { getPatientDashboardStats, markDoseTaken } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const FOOD_LABEL = {
  BEFORE_FOOD: 'Before food',
  WITH_FOOD: 'With food',
  AFTER_FOOD: 'After food',
  ANYTIME: 'Anytime',
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// Real wall-clock greeting — no invented data, just framing around the
// authenticated user's actual name from AuthContext.
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [marking, setMarking] = useState(false);

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

  const handleMarkTaken = async () => {
    const dose = stats?.nextMedication;
    if (!dose) return;
    setMarking(true);
    try {
      await markDoseTaken({
        prescriptionId: dose.prescriptionId,
        medicineId: dose.medicineId,
        scheduledFor: dose.scheduledFor,
      });
      toast.success(`✓ Marked ${dose.medicineName} as taken.`);
      await fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to mark this dose as taken.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <PatientLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="page-subheading">Here's an overview of your prescriptions and health information</p>
        </div>
        <Button as={Link} to="/patient/prescriptions" icon={FileText} bracket>
          View My Prescriptions
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <>
          {loading ? (
            <div className="card flex items-center gap-4 p-5 mb-6">
              <SkeletonCircle className="h-11 w-11 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-3.5 w-40" />
                <SkeletonBar className="h-3 w-64" />
              </div>
              <SkeletonBar className="h-9 w-28 rounded-lg" />
            </div>
          ) : stats?.nextMedication ? (
            <div className="card flex flex-wrap items-center gap-4 p-5 mb-6 border-brand-200">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Pill className="h-5 w-5" />
              </div>
              <div className="min-w-[12rem] flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600">Next Medication</span>
                  {stats.nextMedication.overdue && (
                    <Badge variant="danger" className="text-[10px]">
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-ink-900 mt-0.5">
                  {stats.nextMedication.medicineName} · {formatTime(stats.nextMedication.scheduledFor)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{stats.nextMedication.dosage}</span>
                  {stats.nextMedication.foodInstruction && (
                    <span className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" /> {FOOD_LABEL[stats.nextMedication.foodInstruction] || stats.nextMedication.foodInstruction}
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" onClick={handleMarkTaken} loading={marking}>
                Mark as Taken
              </Button>
            </div>
          ) : (
            <div className="card flex items-center gap-4 p-5 mb-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900">You're all caught up</p>
                <p className="text-xs text-slate-500">No upcoming doses in the next 7 days. Great job staying on track.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FileText} label="Total Prescriptions" value={stats?.totalPrescriptions} tone="sky" loading={loading} />
            <StatCard icon={Clock} label="Active / Pending" value={stats?.activePrescriptions} tone="amber" loading={loading} hero />
            <StatCard icon={CheckCircle2} label="Fulfilled / Dispensed" value={stats?.dispensedPrescriptions} tone="emerald" loading={loading} />

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Today's Progress</span>
                <div className="rounded-lg p-2 bg-accent-50 text-accent-600">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </div>
              {loading ? (
                <SkeletonBar className="mt-3 h-8 w-16" />
              ) : (
                <p className="text-[28px] leading-tight font-bold text-ink-900 mt-2">
                  {stats?.todaysProgress?.taken ?? 0}/{stats?.todaysProgress?.total ?? 0}
                </p>
              )}
              {!loading && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    style={{
                      width: `${
                        stats?.todaysProgress?.total
                          ? Math.round((stats.todaysProgress.taken / stats.todaysProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              )}
            </div>
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
              emptyMessage="No prescriptions yet"
              emptyDescription="Your digital prescriptions will appear here when a doctor issues one."
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
                    <StatusBadge status={rx.status} />
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
