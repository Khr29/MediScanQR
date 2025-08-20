const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
  scannedAt: { type: Date, default: Date.now },
  scannerIp: { type: String },
});

module.exports = mongoose.model("Log", LogSchema);
