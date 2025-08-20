const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
  scannedBy: { type: String, required: true }, // pharmacy name or ID
  scannedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "rejected"], required: true },
  reason: { type: String } // if rejected, why
});

module.exports = mongoose.model("Log", logSchema);
