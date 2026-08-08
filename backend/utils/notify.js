const Notification = require("../models/Notification");

// Creates a real notification for a real event. Never throws - a
// notification failure must never break the action that triggered it,
// mirroring the same safety pattern as auditLogger.js.
const notifyUser = async ({ recipient, title, message, type = "SYSTEM" }) => {
  try {
    await Notification.create({ recipient, title, message, type });
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};

module.exports = { notifyUser };
