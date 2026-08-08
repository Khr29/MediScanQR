const Prescription = require("../models/Prescription");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const { generateQRCode } = require("../utils/qrGenerator");
const ScanLog = require("../models/ScanLog");
const logAction = require("../utils/auditLogger");
const { notifyUser } = require("../utils/notify");
const { createPrescriptionPDF } = require("../utils/pdfGenerator");

// @desc Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientEmail, medicines, notes } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        message: "At least one medicine is required.",
      });
    }

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

    // The doctor's identity, license, specialization, and signature come
    // from their own stored profile - never from client-submitted data -
    // so a prescription can't be forged with someone else's signature.
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.status(400).json({
        message: "Complete your doctor profile before creating prescriptions.",
      });
    }

    if (!doctorProfile.digitalSignature) {
      return res.status(400).json({
        message: "Add your signature to your profile before creating prescriptions.",
      });
    }

    // Generate Prescription ID
    const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Expiry after 14 days
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // QR encodes only a verification reference - never patient/doctor
    // identity - so scanning it with any generic QR app leaks nothing.
    // Full details are only ever returned via an authenticated/backend-verified lookup.
    const qrCode = await generateQRCode({ type: "MEDISCANQR_RX", id: rxId });

    // Save prescription
    const prescription = new Prescription({
      prescriptionId: rxId,

      // Patient information
      patient: user._id,
      patientName: user.name,
      patientAge: profile.age,

      // Doctor information - snapshotted at creation time
      doctor: req.user._id,
      doctorName: req.user.name,
      doctorLicenseNumber: doctorProfile.licenseNumber,
      doctorSpecialization: doctorProfile.specialization,
      doctorSignature: doctorProfile.digitalSignature,

      medicines,
      notes,

      qrCode,
      expiresAt: expiryDate,
    });

    await prescription.save();

    await logAction({
      req,
      user: req.user,
      action: "CREATE_PRESCRIPTION",
      target: `${rxId} (${user.name})`,
      result: "SUCCESS",
      details: `Prescribed ${medicines.length} medicine(s) to ${user.name}`,
    });

    await notifyUser({
      recipient: user._id,
      title: "New Prescription",
      message: `Dr. ${req.user.name} issued you a new prescription (${rxId}).`,
      type: "NEW_RX",
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
    const doctor = req.user._id;

    const totalPrescriptions = await Prescription.countDocuments({
      doctor,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPrescriptions = await Prescription.countDocuments({
      doctor,
      createdAt: {
        $gte: today,
      },
    });

    const patients = await Prescription.distinct("patientName", {
      doctor,
    });

    const totalPatients = patients.length;

    const dispensedCount = await Prescription.countDocuments({
      doctor,
      status: "DISPENSED",
    });

    const recentPrescriptions = await Prescription.find({
      doctor,
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
      doctor: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Download a PDF copy of a prescription the doctor created
exports.downloadPrescriptionPdf = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.id,
      doctor: req.user._id,
    });

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
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Get the logged-in doctor's professional profile (incl. signature)
exports.getDoctorProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email createdAt",
    );

    if (!profile) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Update the logged-in doctor's professional profile, including signature
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { name, specialization, licenseNumber, hospitalName, clinicAddress, phone, digitalSignature } =
      req.body;

    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    if (specialization !== undefined) profile.specialization = specialization;
    if (licenseNumber !== undefined) profile.licenseNumber = licenseNumber;
    if (hospitalName !== undefined) profile.hospitalName = hospitalName;
    if (clinicAddress !== undefined) profile.clinicAddress = clinicAddress;
    if (phone !== undefined) profile.phone = phone;
    if (digitalSignature !== undefined) profile.digitalSignature = digitalSignature;

    await profile.save();

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    const updated = await DoctorProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email createdAt",
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Cancel a prescription the doctor created, before it's dispensed
exports.cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    if (String(prescription.doctor) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only cancel prescriptions you created.",
      });
    }

    if (prescription.status !== "ACTIVE") {
      return res.status(400).json({
        message: `Cannot cancel a prescription that is already ${prescription.status}.`,
      });
    }

    prescription.status = "CANCELLED";
    prescription.cancelledAt = new Date();
    prescription.cancelledBy = req.user.name;
    prescription.cancelReason = req.body?.reason || "";
    await prescription.save();

    await logAction({
      req,
      user: req.user,
      action: "CANCEL_PRESCRIPTION",
      target: `${prescription.prescriptionId} (${prescription.patientName})`,
      result: "SUCCESS",
      details: prescription.cancelReason || "No reason provided",
    });

    await notifyUser({
      recipient: prescription.patient,
      title: "Prescription Cancelled",
      message: `Your prescription ${prescription.prescriptionId} was cancelled by Dr. ${req.user.name}.`,
      type: "SYSTEM",
    });

    return res.status(200).json({
      message: "Prescription cancelled.",
      prescription,
    });
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
    const prescriptions = await Prescription.find({ doctor: req.user._id });

    const totalPrescriptions = prescriptions.length;
    const dispensedCount = prescriptions.filter((p) => p.status === "DISPENSED").length;
    const activeCount = prescriptions.filter((p) => p.status === "ACTIVE").length;
    const expiredCount = prescriptions.filter((p) => p.status === "EXPIRED").length;
    const cancelledCount = prescriptions.filter((p) => p.status === "CANCELLED").length;

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
      activeCount,
      expiredCount,
      cancelledCount,
      dispensedRate: totalPrescriptions
        ? Math.round((dispensedCount / totalPrescriptions) * 100)
        : 0,
      activeRate: totalPrescriptions
        ? Math.round((activeCount / totalPrescriptions) * 100)
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
