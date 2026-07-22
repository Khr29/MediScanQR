const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, required: true, unique: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    doctorName: { type: String, required: true },
    doctorSignature: { type: String }, // Base64 canvas image data
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'DISPENSED', 'EXPIRED'],
      default: 'PENDING',
    },
    dispensedBy: { type: String }, // Pharmacy name or account ID
    dispensedAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days validity
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);