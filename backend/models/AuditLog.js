const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      default: "",
    },

    result: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    details: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1 });
// Speeds up the per-prescription activity timeline lookup (target regex match).
AuditLogSchema.index({ target: 1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
