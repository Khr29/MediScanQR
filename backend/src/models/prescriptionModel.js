const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    medication: { type: mongoose.Schema.Types.ObjectId, ref: "Drug", required: true },
    dosage: { type: String, required: true },
    qrCode: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["active", "fulfilled", "expired"], 
      default: "active" 
    }, // 🆕 status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
