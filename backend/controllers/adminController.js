const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Prescription = require("../models/Prescription");
const ScanLog = require("../models/ScanLog");
const DoctorProfile = require("../models/DoctorProfile");
const PharmacyProfile = require("../models/PharmacyProfile");
const logAction = require("../utils/auditLogger");
const { createPrescriptionPDF } = require("../utils/pdfGenerator");
const { notifyUser } = require("../utils/notify");

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

    // Real security signals from the last 24 hours - never fabricated.
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failedLogins24h = await AuditLog.countDocuments({
      action: "FAILED_LOGIN",
      createdAt: { $gte: since24h },
    });
    const rejectedScans24h = await ScanLog.countDocuments({
      result: "REJECTED",
      scannedAt: { $gte: since24h },
    });

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

      failedLogins24h,
      rejectedScans24h,
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
// User Detail (role-appropriate profile + recent activity)
// ===============================
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let profile = null;
    if (user.role === "DOCTOR") {
      profile = await DoctorProfile.findOne({ user: user._id });
    } else if (user.role === "PHARMACY") {
      profile = await PharmacyProfile.findOne({ user: user._id });
    } else if (user.role === "PATIENT") {
      profile = await require("../models/PatientProfile").findOne({ user: user._id });
    }

    // Recent activity - matched by name/email since AuditLog.user stores whichever was
    // available at the time, not a stable reference (never expose passwords/tokens here).
    const identifierPattern = new RegExp(`^(${escapeRegex(user.name)}|${escapeRegex(user.email)})$`, "i");
    const recentActivity = await AuditLog.find({ user: identifierPattern })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ user, profile, recentActivity });
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

    // Merge in specialization/hospital info from DoctorProfile - the User
    // record alone doesn't carry it.
    const profiles = await DoctorProfile.find({ user: { $in: doctors.map((d) => d._id) } });
    const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

    const merged = doctors.map((doc) => {
      const profile = profileByUser.get(String(doc._id));
      const obj = doc.toObject();
      return {
        ...obj,
        specialization: profile?.specialization,
        hospitalName: profile?.hospitalName,
      };
    });

    res.json(merged);
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

    // Merge in address/phone from PharmacyProfile - the User record alone doesn't carry it.
    const profiles = await PharmacyProfile.find({ user: { $in: pharmacies.map((p) => p._id) } });
    const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

    const merged = pharmacies.map((pharmacy) => {
      const profile = profileByUser.get(String(pharmacy._id));
      const obj = pharmacy.toObject();
      return {
        ...obj,
        address: profile?.address,
        phone: profile?.phone,
      };
    });

    res.json(merged);
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

    await notifyUser({
      recipient: user._id,
      title: "Account Approved",
      message: `Your ${user.role.toLowerCase()} account has been approved. You can now sign in.`,
      type: "SYSTEM",
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
// Prescription Monitoring (search / filter / paginate)
// ===============================
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { q, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "ALL") filter.status = status;
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ prescriptionId: regex }, { patientName: regex }, { doctorName: regex }];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .select("-doctorSignature -qrCode")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Prescription.countDocuments(filter),
    ]);

    res.json({
      prescriptions,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Prescription Detail + Activity Timeline
// ===============================
// The timeline is assembled entirely from real records already written
// elsewhere (AuditLog for account/prescription actions, ScanLog for pharmacy
// scan/verify/dispense attempts) - nothing here is synthesized or fabricated.
exports.getPrescriptionDetail = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ prescriptionId: req.params.id }).populate(
      "patient",
      "name email",
    );

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    const idPattern = new RegExp(escapeRegex(prescription.prescriptionId));

    const [auditEvents, scanEvents] = await Promise.all([
      AuditLog.find({ target: idPattern }).sort({ createdAt: 1 }),
      ScanLog.find({ rxId: prescription.prescriptionId }).sort({ scannedAt: 1 }),
    ]);

    const timeline = [
      ...auditEvents.map((log) => ({
        timestamp: log.createdAt,
        actor: log.user,
        role: log.role,
        action: log.action,
        result: log.result,
        details: log.details,
        source: "audit",
      })),
      ...scanEvents.map((log) => ({
        timestamp: log.scannedAt || log.createdAt,
        actor: log.pharmacist,
        role: "PHARMACY",
        action: log.reason,
        result: log.result,
        details: log.qrType,
        source: "scan",
      })),
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ prescription, timeline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Admin download of any prescription's PDF
exports.downloadPrescriptionPdf = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ prescriptionId: req.params.id });
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    const pdfBuffer = await createPrescriptionPDF(prescription);

    await logAction({
      req,
      user: req.user,
      action: "DOWNLOAD_PRESCRIPTION",
      target: `${prescription.prescriptionId} (${prescription.patientName})`,
      result: "SUCCESS",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${prescription.prescriptionId}.pdf"`);
    return res.send(pdfBuffer);
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
