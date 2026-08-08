const Prescription = require("../models/Prescription");
const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");
const { generateQRCode } = require("../utils/qrGenerator");
const ScanLog = require("../models/ScanLog");

// @desc Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientEmail, medicines, digitalSignature, notes } = req.body;

    // Find patient
    const user = await User.findOne({ email: patientEmail });

    if (!user) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    // Find profile
    const profile = await PatientProfile.findOne({
      user: user._id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Patient profile not found.",
      });
    }

    // Generate Prescription ID
    const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Expiry after 14 days
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // QR payload
    const qrPayload = {
      prescriptionId: rxId,
      patientName: user.name,
      doctorName: req.user.name,
      expiresAt: expiryDate,
    };

    // Generate QR
    const qrCode = await generateQRCode(qrPayload);

    // Save prescription
    const prescription = new Prescription({
      prescriptionId: rxId,

      // Patient information
      patient: user._id,
      patientName: user.name,
      patientAge: profile.age,

      // Doctor information
      doctorName: req.user.name,
      doctorSignature: digitalSignature,

      medicines,

      qrCode,
      expiresAt: expiryDate,
    });

    await prescription.save();

    return res.status(201).json({
      message: "Prescription generated successfully.",
      prescription,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Dashboard Statistics
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorName = req.user.name;

    const totalPrescriptions = await Prescription.countDocuments({
      doctorName,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPrescriptions = await Prescription.countDocuments({
      doctorName,
      createdAt: {
        $gte: today,
      },
    });

    const patients = await Prescription.distinct("patientName", {
      doctorName,
    });

    const totalPatients = patients.length;

    const dispensedCount = await Prescription.countDocuments({
      doctorName,
      status: "DISPENSED",
    });

    const recentPrescriptions = await Prescription.find({
      doctorName,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      totalPrescriptions,
      todayPrescriptions,
      totalPatients,
      dispensedCount,
      recentPrescriptions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get prescriptions created by doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      doctorName: req.user.name,
    }).sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Search Patients for Doctor Portal
exports.searchPatients = async (req, res) => {
  try {
    const profiles = await PatientProfile.find().populate("user", "name email");

    const q = req.query.q?.trim().toLowerCase();
    if (!q) {
      return res.status(200).json(profiles);
    }

    const filtered = profiles.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(q) ||
        p.user?.email?.toLowerCase().includes(q),
    );

    return res.status(200).json(filtered);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Analytics for the logged-in doctor's own prescriptions
exports.getDoctorAnalytics = async (req, res) => {
  try {
    const doctorName = req.user.name;
    const prescriptions = await Prescription.find({ doctorName });

    const totalPrescriptions = prescriptions.length;
    const dispensedCount = prescriptions.filter((p) => p.status === "DISPENSED").length;
    const pendingCount = prescriptions.filter((p) => p.status === "PENDING").length;
    const expiredCount = prescriptions.filter((p) => p.status === "EXPIRED").length;

    const medicineCounts = {};
    prescriptions.forEach((p) => {
      p.medicines?.forEach((m) => {
        medicineCounts[m.name] = (medicineCounts[m.name] || 0) + 1;
      });
    });
    const topMedicines = Object.entries(medicineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Prescription volume for the last 6 calendar months (oldest first).
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = prescriptions.filter(
        (p) => p.createdAt >= start && p.createdAt < end,
      ).length;
      monthlyTrend.push({ label: start.toLocaleString("en-US", { month: "short" }), count });
    }

    return res.status(200).json({
      totalPrescriptions,
      dispensedCount,
      pendingCount,
      expiredCount,
      dispensedRate: totalPrescriptions
        ? Math.round((dispensedCount / totalPrescriptions) * 100)
        : 0,
      pendingRate: totalPrescriptions
        ? Math.round((pendingCount / totalPrescriptions) * 100)
        : 0,
      topMedicines,
      monthlyTrend,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
