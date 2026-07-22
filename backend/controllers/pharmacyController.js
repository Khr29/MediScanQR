const Prescription = require('../models/Prescription');

// @desc Verify prescription by RX ID or scanned QR payload
exports.verifyPrescription = async (req, res) => {
  try {
    const { rxId } = req.params;
    const prescription = await Prescription.findOne({ prescriptionId: rxId });

    if (!prescription) {
      return res.status(404).json({ message: "Invalid or non-existent prescription ID." });
    }

    // Auto-expiry check
    if (prescription.status !== 'DISPENSED' && new Date() > new Date(prescription.expiresAt)) {
      prescription.status = 'EXPIRED';
      await prescription.save();
      return res.status(400).json({ message: "ALERT: This prescription has EXPIRED.", prescription });
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

    if (prescription.status === 'DISPENSED') {
      return res.status(400).json({
        message: `ALERT: Double Dispense Blocked! Dispensed on ${new Date(prescription.dispensedAt).toLocaleString()}`,
      });
    }

    if (prescription.status === 'EXPIRED') {
      return res.status(400).json({ message: "Cannot dispense an expired prescription." });
    }

    prescription.status = 'DISPENSED';
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