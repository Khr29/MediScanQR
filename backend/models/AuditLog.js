const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. 'LOGIN', 'QR_SCAN', 'DISPENSE'
    performedBy: { type: String, required: true }, // User email or ID
    role: { type: String },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);