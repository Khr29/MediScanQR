const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  patientName: { type: String, required: true },
  drugName: { type: String, required: true },
  dosage: { type: String, required: true },
  qrCode: { type: String, required: true }, // unique string
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
