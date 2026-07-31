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
      user: user?.name || "Unknown",
      role: user?.role || "UNKNOWN",

      action,
      target,
      result,
      details,

      ipAddress:
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown",
    });
  } catch (err) {
    console.error("Audit Logger Error:", err.message);
  }
};

module.exports = logAction;