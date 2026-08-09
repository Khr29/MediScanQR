// Background job that notifies patients when a scheduled dose is due,
// using the exact same schedule computation as the medication-schedule API
// (utils/medicationSchedule.js) so "what's due" is never calculated two
// different ways. No new dependency: a plain interval is enough at this
// scale, and Notification.dedupeKey (unique, sparse) guarantees a given
// real-world dose can only ever generate one reminder, even if a tick
// overlaps a previous one or the server restarts mid-window.

const Prescription = require("../models/Prescription");
const DoseLog = require("../models/DoseLog");
const { notifyUser } = require("./notify");
const { computeDosesForDate, doseKey, ACTIVE_STATUSES } = require("./medicationSchedule");

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const REMINDER_WINDOW_MS = 5 * 60 * 1000; // doses due within the next 5 minutes

const foodLabel = {
  BEFORE_FOOD: "Before food",
  WITH_FOOD: "With food",
  AFTER_FOOD: "After food",
  ANYTIME: "Anytime",
};

const checkDueReminders = async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  try {
    const patientIds = await Prescription.distinct("patient", {
      status: { $in: ACTIVE_STATUSES },
    });

    for (const patientId of patientIds) {
      const prescriptions = await Prescription.find({
        patient: patientId,
        status: { $in: ACTIVE_STATUSES },
      }).lean();

      const doses = computeDosesForDate(prescriptions, now).filter(
        (dose) => dose.scheduledFor >= now && dose.scheduledFor < windowEnd,
      );
      if (doses.length === 0) continue;

      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const takenLogs = await DoseLog.find({
        patient: patientId,
        scheduledFor: { $gte: dayStart, $lt: dayEnd },
      }).lean();
      const takenKeys = new Set(
        takenLogs.map((log) => doseKey(String(log.medicineId), log.scheduledFor)),
      );

      for (const dose of doses) {
        if (takenKeys.has(doseKey(dose.medicineId, dose.scheduledFor))) continue;

        const time = dose.scheduledFor.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        const details = [dose.dosage, dose.quantity, foodLabel[dose.foodInstruction]]
          .filter(Boolean)
          .join(" · ");

        await notifyUser({
          recipient: patientId,
          title: `Time for ${dose.medicineName}`,
          message: `${details ? details + " · " : ""}${time}`,
          type: "MEDICATION_REMINDER",
          relatedPrescription: dose.prescriptionId,
          dedupeKey: `reminder_${dose.prescriptionId}_${dose.medicineId}_${dose.scheduledFor.toISOString()}`,
        });
      }
    }
  } catch (err) {
    console.error("Medication reminder scheduler error:", err.message);
  }
};

let intervalHandle = null;

const startMedicationReminderScheduler = () => {
  if (intervalHandle) return;
  // Run once shortly after boot, then on a fixed interval.
  checkDueReminders();
  intervalHandle = setInterval(checkDueReminders, CHECK_INTERVAL_MS);
};

module.exports = { startMedicationReminderScheduler, checkDueReminders };
