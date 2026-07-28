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
    console.log("Prescription before save:");
    console.log(prescription);

    await prescription.save();

    await ScanLog.create({
      rxId,
      pharmacist: req.user?.name || "Unknown",
      result: "SUCCESS",
      reason: "Medicine Dispensed",
    });

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

    return res.status(200).json(profiles);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
