// Shared medication-schedule computation - the single source of truth used
// by the dashboard, the medication-schedule page, and the reminder
// scheduler, so "what's due when" is never computed two different ways.
//
// The doctor's UI does not yet collect explicit dose times or a structured
// frequency (that's tracked as a separate follow-up - see PATIENT_PORTAL
// notes). Until then, `deriveTimesForMedicine` derives real, deterministic
// default times from the doctor's actual `frequency` text rather than
// inventing arbitrary data. Once the doctor UI is updated to collect
// `medicine.times` explicitly, those are used as-is and this derivation is
// bypassed entirely.

const ACTIVE_STATUSES = ["ACTIVE", "DISPENSED"];

const FREQUENCY_DEFAULT_TIMES = {
  "ONCE DAILY": ["09:00"],
  "ONCE A DAY": ["09:00"],
  "DAILY": ["09:00"],
  "TWICE DAILY": ["09:00", "21:00"],
  "TWICE A DAY": ["09:00", "21:00"],
  "TWO TIMES DAILY": ["09:00", "21:00"],
  "THREE TIMES DAILY": ["09:00", "15:00", "21:00"],
  "THRICE DAILY": ["09:00", "15:00", "21:00"],
  "FOUR TIMES DAILY": ["09:00", "13:00", "17:00", "21:00"],
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Pull the first integer out of a free-text duration like "5 days" -> 5.
const parseDurationDays = (duration) => {
  const match = String(duration || "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const deriveTimesForMedicine = (medicine) => {
  if (Array.isArray(medicine.times) && medicine.times.length > 0) {
    return medicine.times;
  }
  const freq = String(medicine.frequency || "").trim().toUpperCase();
  if (FREQUENCY_DEFAULT_TIMES[freq]) return FREQUENCY_DEFAULT_TIMES[freq];

  // Loose fallback for free text like "3 times a day" / "4x daily".
  const match = freq.match(/(\d+)\s*(?:X|TIME)/);
  if (match) {
    const n = Math.min(Math.max(parseInt(match[1], 10), 1), 6);
    const startHour = 8;
    const endHour = 22;
    const step = n > 1 ? Math.floor((endHour - startHour) / (n - 1)) : 0;
    return Array.from({ length: n }, (_, i) => {
      const hour = n > 1 ? startHour + i * step : startHour;
      return `${String(hour).padStart(2, "0")}:00`;
    });
  }

  // Unrecognized/free-text frequency (e.g. "as needed") - default to a
  // single reminder rather than silently showing nothing.
  return ["09:00"];
};

// All doses due on `date` across the given prescriptions (already filtered
// to one patient). Each dose is a plain descriptor; `taken`/`takenAt` are
// filled in by the caller via `isTakenFn`, since that requires a DB lookup
// this module intentionally has no knowledge of.
const computeDosesForDate = (prescriptions, date) => {
  const day = startOfDay(date);
  const doses = [];

  for (const rx of prescriptions) {
    if (!ACTIVE_STATUSES.includes(rx.status)) continue;
    const rxStart = startOfDay(rx.createdAt);
    if (day < rxStart) continue;

    for (const med of rx.medicines || []) {
      const durationDays = parseDurationDays(med.duration);
      const rxEnd = durationDays
        ? addDays(rxStart, durationDays)
        : startOfDay(rx.expiresAt || addDays(rxStart, 14));
      if (day >= rxEnd) continue;

      const times = deriveTimesForMedicine(med);
      for (const time of times) {
        const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
        const scheduledFor = new Date(day);
        scheduledFor.setHours(hh, mm, 0, 0);

        doses.push({
          prescriptionId: String(rx._id),
          prescriptionRxId: rx.prescriptionId,
          medicineId: String(med._id),
          medicineName: med.name,
          dosage: med.dosage,
          quantity: med.quantity || null,
          foodInstruction: med.foodInstruction || null,
          instructions: med.instructions || null,
          doctorName: rx.doctorName,
          scheduledFor,
        });
      }
    }
  }

  doses.sort((a, b) => a.scheduledFor - b.scheduledFor);
  return doses;
};

// Earliest not-yet-taken dose, checking today first (so an overdue-but-
// unlogged dose from earlier today still surfaces) then scanning forward.
const computeNextDose = (prescriptions, isTakenFn, now = new Date(), lookaheadDays = 7) => {
  for (let offset = 0; offset <= lookaheadDays; offset++) {
    const doses = computeDosesForDate(prescriptions, addDays(now, offset)).filter(
      (dose) => !isTakenFn(dose),
    );
    if (doses.length > 0) return doses[0];
  }
  return null;
};

const computeTodaysProgress = (prescriptions, isTakenFn, now = new Date()) => {
  const doses = computeDosesForDate(prescriptions, now);
  const taken = doses.filter((dose) => isTakenFn(dose)).length;
  return { taken, total: doses.length };
};

const doseKey = (medicineId, scheduledFor) => `${medicineId}_${new Date(scheduledFor).getTime()}`;

module.exports = {
  ACTIVE_STATUSES,
  deriveTimesForMedicine,
  parseDurationDays,
  computeDosesForDate,
  computeNextDose,
  computeTodaysProgress,
  doseKey,
  startOfDay,
  addDays,
};
