const mongoose = require("mongoose");

const ScanLogSchema = new mongoose.Schema(
  {
    rxId: {
      type: String,
      default: null,
    },
    rawQRCode: {
      type: String,
      default: null,
    },

    patientName: {
      type: String,
    },

    pharmacist: {
      type: String,
      required: true,
    },

    result: {
      type: String,
      enum: ["SUCCESS", "REJECTED"],
      required: true,
    },

    rawQRCode: {
      type: String,
      default: null,
    },

    qrType: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      required: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ScanLog", ScanLogSchema);
