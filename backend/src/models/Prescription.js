const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    qrCode: { type: String }, // store QR code data or image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
