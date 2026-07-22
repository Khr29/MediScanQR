const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    chronicDiseases: [{ type: String }],
    emergencyContact: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);