const Notification = require("../models/Notification");

// Creates a real notification for a real event. Never throws - a
// notification failure must never break the action that triggered it,
// mirroring the same safety pattern as auditLogger.js.
const notifyUser = async ({
  recipient,
  title,
  message,
  type = "SYSTEM",
  relatedPrescription,
  dedupeKey,
}) => {
  try {
    await Notification.create({
      recipient,
      title,
      message,
      type,
      ...(relatedPrescription ? { relatedPrescription } : {}),
      ...(dedupeKey ? { dedupeKey } : {}),
    });
  } catch (err) {
    // A duplicate dedupeKey means this exact event already notified the
    // recipient - not a real error, just the idempotency guard doing its job.
    if (err.code !== 11000) {
      console.error("Notification Error:", err.message);
    }
  }
};

module.exports = { notifyUser };
