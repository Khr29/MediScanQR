const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    // Link prescription to the actual patient account
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientAge: {
      type: Number,
      required: true,
    },

    // Link prescription to the authenticated doctor account that created it -
    // set server-side from req.user, never trusted from client input.
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
    },

    // Snapshot of the doctor's professional details at the time this
    // prescription was created, so later profile edits don't rewrite history.
    doctorLicenseNumber: {
      type: String,
    },

    doctorSpecialization: {
      type: String,
    },

    doctorSignature: {
      type: String,
    },

    // QR Image (Base64 Data URL)
    qrCode: {
      type: String,
    },

    medicines: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
        },
        instructions: {
          type: String,
        },
        // --- Optional scheduling fields (all backward-compatible additions) ---
        // Quantity taken per dose, e.g. "1 tablet" - distinct from `dosage`
        // (the drug strength, e.g. "10mg").
        quantity: {
          type: String,
        },
        // Explicit clock times (HH:mm, 24h) the doctor wants this dose taken
        // at, e.g. ["08:00", "20:00"]. When not provided, the patient-portal
        // schedule falls back to deriving sensible default times from
        // `frequency` (see backend/utils/medicationSchedule.js) rather than
        // inventing arbitrary data.
        times: {
          type: [String],
          default: undefined,
        },
        foodInstruction: {
          type: String,
          enum: ["BEFORE_FOOD", "WITH_FOOD", "AFTER_FOOD", "ANYTIME"],
        },
      },
    ],

    // Doctor's overall clinical notes for this prescription (not per-medicine).
    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "DISPENSED", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },

    dispensedBy: String,

    dispensedAt: Date,

    // Pharmacist's notes captured at the time of dispensing.
    pharmacyNotes: String,

    cancelledAt: Date,

    cancelledBy: String,

    cancelReason: String,

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ patient: 1 });
PrescriptionSchema.index({ doctor: 1 });
PrescriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Prescription", PrescriptionSchema);