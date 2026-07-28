const Prescription = require("../models/Prescription");
const ScanLog = require("../models/ScanLog");

// @desc Verify prescription by RX ID or scanned QR payload
exports.verifyPrescription = async (req, res) => {
  try {
    const { rxId } = req.params;
    const prescription = await Prescription.findOne({ prescriptionId: rxId });

    if (!prescription) {
      return res
        .status(404)
        .json({ message: "Invalid or non-existent prescription ID." });
    }

    // Auto-expiry check
    if (
      prescription.status !== "DISPENSED" &&
      new Date() > new Date(prescription.expiresAt)
    ) {
      prescription.status = "EXPIRED";
      await prescription.save();

      await ScanLog.create({
        rxId,
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
    return res.status(500).json({ message: error.message });
  }
};

// @desc Dispense medicine & lock against double-dispensing
exports.dispensePrescription = async (req, res) => {
  try {
    const { rxId } = req.params;
    const prescription = await Prescription.findOne({ prescriptionId: rxId });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    if (prescription.status === "DISPENSED") {
      await ScanLog.create({
        rxId,
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

    if (prescription.status === "EXPIRED") {
      return res
        .status(400)
        .json({ message: "Cannot dispense an expired prescription." });
    }

    prescription.status = "DISPENSED";
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user ? req.user.name : "Pharmacy";

    await prescription.save();

    return res.status(200).json({
      message: "Medicine dispensed successfully. Prescription locked.",
      prescription,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    const expiredPrescriptions = await Prescription.countDocuments({
      status: "EXPIRED",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dispensedToday = await Prescription.countDocuments({
      status: "DISPENSED",
      dispensedAt: {
        $gte: today,
      },
    });

    res.status(200).json({
      totalDispensed,
      pendingPrescriptions,
      expiredPrescriptions,
      dispensedToday,
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
