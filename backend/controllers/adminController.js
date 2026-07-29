const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Prescription = require("../models/Prescription");

// ===============================
// Dashboard Statistics
// ===============================
exports.getAdminStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: "DOCTOR" });
    const totalPatients = await User.countDocuments({ role: "PATIENT" });
    const totalPharmacies = await User.countDocuments({ role: "PHARMACY" });

    const pendingDoctors = await User.countDocuments({
      role: "DOCTOR",
      isApproved: false,
    });

    const pendingPharmacies = await User.countDocuments({
      role: "PHARMACY",
      isApproved: false,
    });

    const totalPrescriptions = await Prescription.countDocuments();

    const dispensedPrescriptions = await Prescription.countDocuments({
      status: "DISPENSED",
    });

    res.json({
      totalDoctors,
      totalPatients,
      totalPharmacies,
      pendingDoctors,
      pendingPharmacies,
      totalPrescriptions,
      dispensedPrescriptions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Pending Doctors
// ===============================
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "DOCTOR",
      isApproved: false,
    }).select("-password");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Pending Pharmacies
// ===============================
exports.getPendingPharmacies = async (req, res) => {
  try {
    const pharmacies = await User.find({
      role: "PHARMACY",
      isApproved: false,
    }).select("-password");

    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Approve User
// ===============================
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    ).select("-password");

    res.json({
      message: "User approved successfully.",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Reject User
// ===============================
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true },
    ).select("-password");

    res.json({
      message: "User rejected.",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Audit Logs
// ===============================
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Analytics
// ===============================
exports.getSystemAnalytics = async (req, res) => {
  try {
    const analytics = {
      totalUsers: await User.countDocuments(),
      totalDoctors: await User.countDocuments({ role: "DOCTOR" }),
      totalPatients: await User.countDocuments({ role: "PATIENT" }),
      totalPharmacies: await User.countDocuments({ role: "PHARMACY" }),
      totalPrescriptions: await Prescription.countDocuments(),
      dispensedPrescriptions: await Prescription.countDocuments({
        status: "DISPENSED",
      }),
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
