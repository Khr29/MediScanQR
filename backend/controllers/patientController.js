const Prescription = require("../models/Prescription");
const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");
const DoseLog = require("../models/DoseLog");
const { createPrescriptionPDF } = require("../utils/pdfGenerator");
const logAction = require("../utils/auditLogger");
const {
  computeDosesForDate,
  computeNextDose,
  computeTodaysProgress,
  deriveTimesForMedicine,
  doseKey,
} = require("../utils/medicationSchedule");

// Builds a `(medicineId, scheduledFor) -> taken` lookup from this patient's
// DoseLog rows within [rangeStart, rangeEnd). Kept separate from the pure
// schedule-computation util since it's the one part of "is this dose done"
// that actually requires a DB round-trip.
const buildTakenLookup = async (patientId, rangeStart, rangeEnd) => {
  const logs = await DoseLog.find({
    patient: patientId,
    scheduledFor: { $gte: rangeStart, $lt: rangeEnd },
  }).lean();

  const takenMap = new Map();
  for (const log of logs) {
    takenMap.set(doseKey(String(log.medicineId), log.scheduledFor), log.takenAt);
  }

  return {
    isTaken: (dose) => takenMap.has(doseKey(dose.medicineId, dose.scheduledFor)),
    takenAt: (dose) => takenMap.get(doseKey(dose.medicineId, dose.scheduledFor)) || null,
  };
};

const attachDisplayTimes = (prescription) => {
  const plain = prescription.toObject ? prescription.toObject() : prescription;
  return {
    ...plain,
    medicines: (plain.medicines || []).map((med) => ({
      ...med,
      displayTimes: deriveTimesForMedicine(med),
    })),
  };
};

// @desc Get active digital prescriptions for logged in patient
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get a single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!prescription) {
      return res
        .status(404)
        .json({ message: "Invalid or non-existent prescription ID." });
    }

    await logAction({
      req,
      user: req.user,
      action: "VIEW_PRESCRIPTION",
      target: prescription.prescriptionId,
      result: "SUCCESS",
    });

    return res.status(200).json(attachDisplayTimes(prescription));
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
// @desc Download a PDF copy of one of the patient's own prescriptions
exports.downloadPrescriptionPdf = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Invalid or non-existent prescription ID." });
    }

    const pdfBuffer = await createPrescriptionPDF(prescription);

    await logAction({
      req,
      user: req.user,
      action: "DOWNLOAD_PRESCRIPTION",
      target: `${prescription.prescriptionId} (${prescription.patientName})`,
      result: "SUCCESS",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${prescription.prescriptionId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Flattened medicine history across all of the patient's prescriptions
exports.getMedicineHistory = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    }).sort({ createdAt: -1 });

    const history = prescriptions.flatMap((p) =>
      (p.medicines || []).map((m) => ({
        medicineName: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        prescriptionId: p.prescriptionId,
        doctorName: p.doctorName,
        status: p.status,
        date: p.createdAt,
      })),
    );

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get patient dashboard statistics, including today's real medication
// progress and the nearest not-yet-taken dose (server is the source of
// truth for both - never computed client-side).
exports.getPatientDashboard = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    }).sort({ createdAt: -1 });

    const totalPrescriptions = prescriptions.length;

    const activePrescriptions = prescriptions.filter(
      (p) => p.status === "ACTIVE",
    ).length;

    const dispensedPrescriptions = prescriptions.filter(
      (p) => p.status === "DISPENSED",
    ).length;

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const weekAhead = new Date(dayStart);
    weekAhead.setDate(weekAhead.getDate() + 8);

    const { isTaken } = await buildTakenLookup(req.user._id, dayStart, weekAhead);
    const todaysProgress = computeTodaysProgress(prescriptions, isTaken, now);
    const nextDose = computeNextDose(prescriptions, isTaken, now);

    res.status(200).json({
      totalPrescriptions,
      activePrescriptions,
      dispensedPrescriptions,
      todaysProgress,
      nextMedication: nextDose
        ? { ...nextDose, overdue: nextDose.scheduledFor < now }
        : null,
      recentPrescriptions: prescriptions.slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Today's (or a given date's) full medication schedule for the
// logged-in patient, with each dose's real completion status.
exports.getMedicationSchedule = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const prescriptions = await Prescription.find({
      patient: req.user._id,
    }).lean();

    const { isTaken, takenAt } = await buildTakenLookup(req.user._id, dayStart, dayEnd);
    const doses = computeDosesForDate(prescriptions, targetDate).map((dose) => ({
      ...dose,
      taken: isTaken(dose),
      takenAt: takenAt(dose),
    }));

    return res.status(200).json({ date: dayStart, doses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Record that the patient took a scheduled dose. The patient can only
// log adherence - the dose descriptor itself (medicine/dosage/time) always
// comes from the doctor's prescription, never from client input.
exports.markDoseTaken = async (req, res) => {
  try {
    const { prescriptionId, medicineId, scheduledFor } = req.body;
    if (!prescriptionId || !medicineId || !scheduledFor) {
      return res.status(400).json({
        message: "prescriptionId, medicineId, and scheduledFor are required.",
      });
    }

    // Ownership check - the prescription must belong to the authenticated
    // patient, and the medicine must actually be part of it. Never trust
    // the client for either.
    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patient: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    const medicine = prescription.medicines.id(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found on this prescription." });
    }

    const scheduledDate = new Date(scheduledFor);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledFor value." });
    }

    let doseLog;
    try {
      doseLog = await DoseLog.create({
        prescription: prescription._id,
        patient: req.user._id,
        medicineId,
        scheduledFor: scheduledDate,
        takenAt: new Date(),
      });
    } catch (err) {
      // Duplicate key = already marked taken. Treat as idempotent success
      // rather than an error - the patient's intent ("I took this") is
      // already satisfied.
      if (err.code === 11000) {
        doseLog = await DoseLog.findOne({
          prescription: prescription._id,
          medicineId,
          scheduledFor: scheduledDate,
        });
      } else {
        throw err;
      }
    }

    await logAction({
      req,
      user: req.user,
      action: "MARK_DOSE_TAKEN",
      target: `${prescription.prescriptionId} - ${medicine.name}`,
      result: "SUCCESS",
    });

    return res.status(200).json({
      message: "Dose marked as taken.",
      takenAt: doseLog.takenAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Get patient medical profile details
exports.getPatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      user: req.user._id,
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.updatePatientProfile = async (req, res) => {
  try {
    const { name, bloodGroup, phone, age } = req.body;

    // Update PatientProfile
    let profile = await PatientProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    profile.bloodGroup = bloodGroup ?? profile.bloodGroup;
    profile.age = age ?? profile.age;

    // Your frontend uses "phone", but your model stores "emergencyContact"
    profile.emergencyContact = phone ?? profile.emergencyContact;

    await profile.save();
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name;
      await user.save();
    }

    await logAction({
      req,
      user: req.user,
      action: "PROFILE_UPDATED",
      target: req.user.email,
      result: "SUCCESS",
    });

    // Return updated profile with user info
    profile = await PatientProfile.findOne({
      user: req.user._id,
    }).populate("user", "name email");

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
