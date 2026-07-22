const mongoose = require('mongoose');
const roles = require('../config/roles');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [roles.DOCTOR, roles.PATIENT, roles.PHARMACY, roles.ADMIN],
      default: roles.PATIENT,
    },
    isApproved: { type: Boolean, default: false }, // Doctors & Pharmacies need admin approval
    licenseNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);