const AuditLog = require("../models/AuditLog");

const logAction = async ({
  req,
  user,
  action,
  target = "",
  result = "SUCCESS",
  details = "",
}) => {
  try {
    await AuditLog.create({
      user: user?.name || user?.email || "Unknown",
      role: user?.role || "UNKNOWN",
      action,
      target,
      result,
      details,
      ipAddress:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "",
    });
  } catch (err) {
    console.error("Audit Log Error:", err.message);
  }
};

module.exports = logAction;
