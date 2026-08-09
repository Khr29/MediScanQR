import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, CheckCircle2, Circle, ChevronLeft, ChevronRight, Utensils, FileText } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { SkeletonBar, SkeletonCircle } from '../../components/common/Skeleton';
import { getMedicationSchedule, markDoseTaken } from '../../services/patientService';

const FOOD_LABEL = {
  BEFORE_FOOD: 'Before food',
  WITH_FOOD: 'With food',
  AFTER_FOOD: 'After food',
  ANYTIME: 'Anytime',
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const formatDayLabel = (date) => {
  const target = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(target, today)) return 'Today';
  if (isSameDay(target, yesterday)) return 'Yesterday';
  if (isSameDay(target, tomorrow)) return 'Tomorrow';
  return target.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const toDateParam = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const ScheduleSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="card flex items-center gap-4 p-4">
        <SkeletonCircle className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-3.5 w-40" />
          <SkeletonBar className="h-3 w-56" />
        </div>
        <SkeletonBar className="h-8 w-24 rounded-lg" />
      </div>
    ))}
  </div>
);

const MedicationSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingKey, setMarkingKey] = useState(null);

  const fetchSchedule = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicationSchedule(toDateParam(date));
      setDoses(data.doses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your medication schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate, fetchSchedule]);

  const changeDay = (delta) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const isToday = toDateParam(selectedDate) === toDateParam(new Date());

  const handleMarkTaken = async (dose) => {
    const key = `${dose.medicineId}_${dose.scheduledFor}`;
    setMarkingKey(key);
    try {
      const result = await markDoseTaken({
        prescriptionId: dose.prescriptionId,
        medicineId: dose.medicineId,
        scheduledFor: dose.scheduledFor,
      });
      setDoses((prev) =>
        prev.map((d) =>
          d.medicineId === dose.medicineId && d.scheduledFor === dose.scheduledFor
            ? { ...d, taken: true, takenAt: result.takenAt }
            : d,
        ),
      );
      toast.success(`✓ Marked ${dose.medicineName} as taken.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to mark this dose as taken.');
    } finally {
      setMarkingKey(null);
    }
  };

  const takenCount = doses.filter((d) => d.taken).length;
  const totalCount = doses.length;
  const progressPct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <PatientLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-heading">Medication Schedule</h1>
          <p className="page-subheading">What you need to take, as prescribed by your doctor</p>
        </div>
      </div>

      <div className="card flex items-center justify-between gap-3 p-3 mb-6">
        <button
          onClick={() => changeDay(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <CalendarClock className="h-4 w-4 text-brand-500" />
          {formatDayLabel(selectedDate)}
        </div>
        <button
          onClick={() => changeDay(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isToday ? "Today's Progress" : `${formatDayLabel(selectedDate)}'s Progress`}
            </span>
            <span className="text-xs font-bold text-ink-900">
              {takenCount} of {totalCount} doses completed
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => fetchSchedule(selectedDate)} />
      ) : loading ? (
        <ScheduleSkeleton />
      ) : doses.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No medications scheduled"
          message={
            isToday
              ? "You have no doses scheduled for today. New prescriptions from your doctor will appear here automatically."
              : 'No doses were scheduled on this day.'
          }
        />
      ) : (
        <div className="space-y-3">
          {doses.map((dose) => {
            const key = `${dose.medicineId}_${dose.scheduledFor}`;
            const overdue = !dose.taken && new Date(dose.scheduledFor) < new Date();
            return (
              <div
                key={key}
                className={`card flex flex-wrap items-center gap-4 p-4 ${dose.taken ? 'opacity-70' : ''}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    dose.taken ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {dose.taken ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>

                <div className="min-w-[10rem] flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-ink-900">{dose.medicineName}</p>
                    <span className="text-xs font-semibold text-slate-500">{formatTime(dose.scheduledFor)}</span>
                    {overdue && (
                      <Badge variant="danger" className="text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{dose.dosage}</span>
                    {dose.quantity && <span>Qty: {dose.quantity}</span>}
                    {dose.foodInstruction && (
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" /> {FOOD_LABEL[dose.foodInstruction] || dose.foodInstruction}
                      </span>
                    )}
                    {dose.instructions && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {dose.instructions}
                      </span>
                    )}
                  </div>
                  {dose.doctorName && (
                    <p className="mt-1 text-[11px] text-slate-400">Prescribed by Dr. {dose.doctorName}</p>
                  )}
                </div>

                {dose.taken ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Taken at {formatTime(dose.takenAt)}
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkTaken(dose)}
                    disabled={markingKey === key}
                    className="rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {markingKey === key ? 'Marking...' : 'Mark as Taken'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PatientLayout>
  );
};

export default MedicationSchedule;
