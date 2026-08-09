const mongoose = require("mongoose");

// Records ONLY completion events - the schedule itself (which doses are due,
// when) is computed on the fly from the Prescription's medicines (see
// utils/medicationSchedule.js), so this collection never duplicates
// prescription data. A dose is "taken" if and only if a matching DoseLog
// document exists.
const DoseLogSchema = new mongoose.Schema(
  {
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    // Denormalized for fast/simple ownership checks without a join - the
    // controller still always re-verifies against the authenticated user.
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The medicines[]._id subdocument id - Mongoose gives every subdocument
    // its own _id automatically, so this precisely identifies which
    // medicine within the prescription this dose belongs to.
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // The exact computed dose datetime (date + scheduled time combined).
    scheduledFor: {
      type: Date,
      required: true,
    },
    takenAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

// A given dose can only be marked taken once.
DoseLogSchema.index(
  { prescription: 1, medicineId: 1, scheduledFor: 1 },
  { unique: true },
);
DoseLogSchema.index({ patient: 1, scheduledFor: 1 });

module.exports = mongoose.model("DoseLog", DoseLogSchema);
