const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescription,
  dispensePrescription, // <-- Added import
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware"); // <-- Added restrictTo import

// POST /api/v1/prescriptions → create a new prescription (Doctor only)
router.post("/", protect, createPrescription);

// GET /api/v1/prescriptions → get all prescriptions
router.get("/", protect, getPrescriptions);

// GET /api/v1/prescriptions/:id → get a single prescription by ID
router.get("/:id", protect, getPrescription);

// POST /api/v1/prescriptions/:id/dispense → dispense a prescription (Pharmacist only)
router.post("/:id/dispense", protect, dispensePrescription);

module.exports = router;
