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

    doctorName: {
      type: String,
      required: true,
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
      },
    ],

    status: {
      type: String,
      enum: ["PENDING", "DISPENSED", "EXPIRED"],
      default: "PENDING",
    },

    dispensedBy: String,

    dispensedAt: Date,

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

module.exports = mongoose.model("Prescription", PrescriptionSchema);