const Prescription = require("../models/Prescription");
const ScanLog = require("../models/ScanLog");
const PharmacyProfile = require("../models/PharmacyProfile");
const User = require("../models/User");
const logAction = require("../utils/auditLogger");
const { notifyUser } = require("../utils/notify");

// @desc Get the logged-in pharmacy's profile
exports.getPharmacyProfile = async (req, res) => {
  try {
    const profile = await PharmacyProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email createdAt",
    );

    if (!profile) {
      return res.status(404).json({ message: "Pharmacy profile not found." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Update the logged-in pharmacy's profile
exports.updatePharmacyProfile = async (req, res) => {
  try {
    const { name, licenseNumber, address, phone } = req.body;

    const profile = await PharmacyProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Pharmacy profile not found." });
    }

    if (licenseNumber !== undefined) profile.licenseNumber = licenseNumber;
    if (address !== undefined) profile.address = address;
    if (phone !== undefined) profile.phone = phone;
    await profile.save();

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    const updated = await PharmacyProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email createdAt",
    );
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Verify prescription by RX ID or scanned QR payload
exports.verifyPrescription = async (req, res) => {
  try {
    const { rxId } = req.params;

    const prescription = await Prescription.findOne({
      prescriptionId: rxId,
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Invalid or non-existent prescription ID.",
      });
    }

    // Already Dispensed
    if (prescription.status === "DISPENSED") {
      await ScanLog.create({
        rxId: prescription.prescriptionId,
        patientName: prescription.patientName,
        qrType: "Medical QR",
        rawQRCode: "Prescription",
        pharmacist: req.user?.name || "Unknown",
        result: "REJECTED",
        reason: "Already Dispensed",
      });

      return res.status(400).json({
        message: "ALERT: This prescription has already been dispensed.",
        prescription,
      });
    }

    // Cancelled by the prescribing doctor
    if (prescription.status === "CANCELLED") {
      await ScanLog.create({
        rxId: prescription.prescriptionId,
        patientName: prescription.patientName,
        qrType: "Medical QR",
        rawQRCode: "Prescription",
        pharmacist: req.user?.name || "Unknown",
        result: "REJECTED",
        reason: "Prescription Cancelled",
      });

      return res.status(400).json({
        message: "ALERT: This prescription was cancelled by the prescribing doctor.",
        prescription,
      });
    }

    // Auto Expiry
    if (new Date() > new Date(prescription.expiresAt)) {
      prescription.status = "EXPIRED";
      await prescription.save();

      await ScanLog.create({
        rxId: prescription.prescriptionId,
        patientName: prescription.patientName,
        qrType: "Medical QR",
        rawQRCode: "Prescription",
        pharmacist: req.user?.name || "Unknown",
        result: "REJECTED",
        reason: "Expired Prescription",
      });

      return res.status(400).json({
        message: "ALERT: This prescription has EXPIRED.",
        prescription,
      });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Dispense medicine & lock against double-dispensing
exports.dispensePrescription = async (req, res) => {
  try {
    const { rxId } = req.params;

    const prescription = await Prescription.findOne({
      prescriptionId: rxId,
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found.",
      });
    }

    // Prevent double dispensing
    if (prescription.status === "DISPENSED") {
      await ScanLog.create({
        rxId: prescription.prescriptionId,
        patientName: prescription.patientName,
        qrType: "Medical QR",
        rawQRCode: "Prescription",
        pharmacist: req.user?.name || "Unknown",
        result: "REJECTED",
        reason: "Already Dispensed",
      });

      return res.status(400).json({
        message: `ALERT: Double Dispense Blocked! Dispensed on ${new Date(
          prescription.dispensedAt,
        ).toLocaleString()}`,
      });
    }

    // Prevent dispensing expired or cancelled prescriptions
    if (prescription.status === "EXPIRED") {
      return res.status(400).json({
        message: "Cannot dispense an expired prescription.",
      });
    }

    if (prescription.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot dispense a prescription that was cancelled by the prescribing doctor.",
      });
    }

    // Dispense prescription (only reachable when status is ACTIVE, the only
    // remaining enum value after the guards above).
    prescription.status = "DISPENSED";
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user?.name || "Pharmacy";
    if (typeof req.body?.pharmacyNotes === "string") {
      prescription.pharmacyNotes = req.body.pharmacyNotes;
    }

    await prescription.save();

    // Create audit log
    await ScanLog.create({
      rxId: prescription.prescriptionId,
      patientName: prescription.patientName,
      qrType: "Medical QR",
      rawQRCode: "Prescription",
      pharmacist: req.user?.name || "Unknown",
      result: "SUCCESS",
      reason: "Medicine Dispensed",
    });

    await logAction({
      req,
      user: req.user,
      action: "DISPENSE_PRESCRIPTION",
      target: `${prescription.prescriptionId} (${prescription.patientName})`,
      result: "SUCCESS",
      details: `Dispensed by ${req.user?.name || "Pharmacy"}`,
    });

    await notifyUser({
      recipient: prescription.patient,
      title: "Prescription Dispensed",
      message: `Your prescription ${prescription.prescriptionId} has been dispensed.`,
      type: "DISPENSED",
      relatedPrescription: prescription._id,
    });

    return res.status(200).json({
      message: "Medicine dispensed successfully. Prescription locked.",
      prescription,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
// @desc Pharmacy Dashboard Statistics
exports.getPharmacyStats = async (req, res) => {
  try {
    const totalDispensed = await Prescription.countDocuments({
      status: "DISPENSED",
    });

    const activePrescriptions = await Prescription.countDocuments({
      status: "ACTIVE",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count ALL scans today (SUCCESS + REJECTED)
    const todaysScans = await ScanLog.countDocuments({
      createdAt: {
        $gte: today,
      },
    });

    // Count only rejected scans
    const invalidRejected = await ScanLog.countDocuments({
      result: "REJECTED",
    });

    // Recent dispensed prescriptions
    const recentScans = await Prescription.find({
      status: "DISPENSED",
    })
      .populate("patient", "name email")
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      totalDispensed,
      activePrescriptions,
      todaysScans,
      invalidRejected,
      recentScans,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// @desc Get Audit Log (All Scan Attempts)
exports.getDispenseHistory = async (req, res) => {
  try {
    const history = await ScanLog.find().sort({ scannedAt: -1 }).lean();

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get Prescription Details
exports.getPrescriptionDetails = async (req, res) => {
  try {
    const { rxId } = req.params;

    const prescription = await Prescription.findOne({
      prescriptionId: rxId,
    }).populate("patient", "name email");

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found.",
      });
    }

    res.json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch prescription details.",
    });
  }
};

// @desc Public, unauthenticated verification for QR-printed prescriptions.
// Deliberately returns only the minimal fields needed to prove authenticity —
// no patient identity, doctor signature, or internal IDs.
exports.verifyPublic = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.id,
    }).select(
      "prescriptionId doctorName doctorLicenseNumber doctorSignature status createdAt expiresAt medicines",
    );

    if (!prescription) {
      return res.status(404).json({
        message: "Invalid or non-existent prescription ID.",
      });
    }

    return res.status(200).json({
      prescriptionId: prescription.prescriptionId,
      doctorName: prescription.doctorName,
      doctorLicenseNumber: prescription.doctorLicenseNumber,
      // The raw signature image isn't exposed on this unauthenticated public
      // page - only whether one is on file - to avoid it being scraped/copied.
      hasSignature: Boolean(prescription.doctorSignature),
      status: prescription.status,
      createdAt: prescription.createdAt,
      expiresAt: prescription.expiresAt,
      medicines: prescription.medicines,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Log Invalid QR Scan
exports.logInvalidScan = async (req, res) => {
  try {
    const { rawQRCode } = req.body;

    let qrType = "Text";

    if (rawQRCode.startsWith("WIFI:")) {
      qrType = "Wi-Fi";
    } else if (rawQRCode.startsWith("mailto:")) {
      qrType = "Email";
    } else if (rawQRCode.startsWith("BEGIN:VCARD")) {
      qrType = "Contact";
    } else {
      try {
        new URL(rawQRCode);
        qrType = "Website";
      } catch {
        qrType = "Text";
      }
    }

    const log = await ScanLog.create({
      rxId: null,
      rawQRCode,
      qrType, // <-- THIS IS THE IMPORTANT LINE
      pharmacist: req.user?.name || "Unknown",
      result: "REJECTED",
      reason: "Invalid QR Code",
    });

    return res.status(201).json({
      message: "Invalid QR scan logged.",
      log,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
