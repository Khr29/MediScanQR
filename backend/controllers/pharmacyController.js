const Prescription = require("../models/Prescription");
const ScanLog = require("../models/ScanLog");

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
        pharmacist: req.user?.name || "Unknown",
        result: "REJECTED",
        reason: "Already Dispensed",
      });

      return res.status(400).json({
        message: "ALERT: This prescription has already been dispensed.",
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

    // Prevent dispensing expired prescriptions
    if (prescription.status === "EXPIRED") {
      return res.status(400).json({
        message: "Cannot dispense an expired prescription.",
      });
    }

    // Dispense prescription
    prescription.status = "DISPENSED";
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user?.name || "Pharmacy";

    await prescription.save();

    // Create audit log
    try {
      await ScanLog.create({
        rxId: prescription.prescriptionId,
        patientName: prescription.patientName,
        pharmacist: req.user?.name || "Unknown",
        result: "SUCCESS",
        reason: "Medicine Dispensed",
      });

      console.log("✅ ScanLog created successfully");
    } catch (err) {
      console.error("❌ Failed to create ScanLog:");
      console.error(err);
    }

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

    const pendingPrescriptions = await Prescription.countDocuments({
      status: "PENDING",
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
      pendingPrescriptions,
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
// @desc Get dispense history
exports.getDispenseHistory = async (req, res) => {
  try {
    const history = await Prescription.find({
      status: "DISPENSED",
    })
      .populate("patient", "name email")
      .sort({ dispensedAt: -1 });

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
