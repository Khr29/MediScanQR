const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['DISPENSED', 'EXPIRING', 'NEW_RX', 'SYSTEM', 'MEDICATION_REMINDER'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false },
    // Optional - lets the frontend deep-link straight to the relevant
    // prescription instead of guessing from the message text.
    relatedPrescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    // Optional idempotency key (e.g. `${prescriptionId}_${medicineId}_${scheduledFor}`)
    // so background jobs like the medication reminder scheduler can't create
    // duplicate notifications for the same real-world event on re-run.
    dedupeKey: {
      type: String,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
// Sparse: most notifications have no dedupeKey, and we only need uniqueness
// scoped to a given recipient + key.
NotificationSchema.index({ recipient: 1, dedupeKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', NotificationSchema);