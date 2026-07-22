const AuditLog = require("../models/AuditLog");

const logAudit = (actionName) => {
  return async (req, res, next) => {
    try {
      const performedBy = req.user ? req.user.email : "ANONYMOUS_OR_SYSTEM";
      const role = req.user ? req.user.role : "GUEST";

      await AuditLog.create({
        action: actionName,
        performedBy,
        role,
        details: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip || req.connection.remoteAddress,
      });
    } catch (error) {
      console.error("Audit log creation error:", error.message);
    }
    next();
  };
};

module.exports = { logAudit };