const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const roles = require('../config/roles');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$/;

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

// Hash the password whenever it is set/changed - covers registration and
// any future password-reset flow without controllers needing to remember to hash.
// This hook is async (returns a Promise) - Mongoose does NOT inject a `next`
// callback for async pre-hooks, so completion is signaled by the promise
// resolving, not by calling next().
UserSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  // Already a bcrypt hash (e.g. re-saved without a password change elsewhere) - don't double-hash.
  if (BCRYPT_HASH_PATTERN.test(this.password)) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compares a candidate password against the stored hash.
// Legacy support: rows created before bcrypt was wired in may still hold
// plaintext. If so, fall back to a direct comparison and transparently
// rehash on success, so no account is locked out and no separate
// migration script/DB access is required.
UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!BCRYPT_HASH_PATTERN.test(this.password)) {
    const legacyMatch = candidate === this.password;
    if (legacyMatch) {
      // Hash directly here (rather than re-assigning the same plaintext value)
      // because Mongoose's isModified('password') would otherwise stay false
      // when the new value equals the old one, and the pre-save hook would
      // never fire to rehash it.
      this.password = await bcrypt.hash(candidate, 10);
      await this.save();
    }
    return legacyMatch;
  }
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);