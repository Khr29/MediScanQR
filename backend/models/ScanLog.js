const mongoose = require("mongoose");

const ScanLogSchema = new mongoose.Schema(
  {
    rxId: {
      type: String,
      required: true,
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
