const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Prescription = require("../models/Prescription");
const logAction = require("../utils/auditLogger");

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

    const totalUsers = await User.countDocuments();

    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,

      totalDoctors,
      totalPatients,
      totalPharmacies,

      pendingDoctors,
      pendingPharmacies,

      totalPrescriptions,
      dispensedPrescriptions,

      recentLogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Escape user input before embedding it in a RegExp so search text can't be
// used to build an unintended/expensive pattern.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ===============================
// All Users (search / filter / paginate)
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const { q, role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role && role !== "ALL") filter.role = role;
    if (status === "APPROVED") filter.isApproved = true;
    if (status === "PENDING") filter.isApproved = false;
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await logAction({
      req,
      user: req.user,
      action: `APPROVE_${user.role}`,
      target: `${user.name} (${user.role})`,
      result: "SUCCESS",
      details: `${user.role} account approved`,
    });

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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await logAction({
      req,
      user: req.user,
      action: `REJECT_${user.role}`,
      target: `${user.name} (${user.role})`,
      result: "SUCCESS",
      details: `${user.role} account rejected`,
    });

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
    const totalPrescriptions = await Prescription.countDocuments();
    const dispensedPrescriptions = await Prescription.countDocuments({
      status: "DISPENSED",
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: monthStart },
    });

    const analytics = {
      totalUsers: await User.countDocuments(),
      totalDoctors: await User.countDocuments({ role: "DOCTOR" }),
      totalPatients: await User.countDocuments({ role: "PATIENT" }),
      totalPharmacies: await User.countDocuments({ role: "PHARMACY" }),
      totalPrescriptions,
      dispensedPrescriptions,
      monthlyPrescriptions,
      // Percentage of prescriptions ever dispensed, one decimal place.
      fulfillmentRate: totalPrescriptions
        ? Math.round((dispensedPrescriptions / totalPrescriptions) * 1000) / 10
        : 0,
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
