const mongoose = require("mongoose");

const ScanLogSchema = new mongoose.Schema(
  {
    rxId: String,

    pharmacist: String,

    result: {
      type: String,
      enum: ["SUCCESS", "REJECTED"],
    },

    reason: String,

    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ScanLog", ScanLogSchema);
