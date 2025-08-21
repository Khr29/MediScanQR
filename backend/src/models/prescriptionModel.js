const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },  // patient name
    medication: { type: String, required: true },   // drug/medicine name
    dosage: { type: String, required: true },       // dosage instructions
    qrCode: { type: String },                       // QR code data or image URL
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to doctor
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
