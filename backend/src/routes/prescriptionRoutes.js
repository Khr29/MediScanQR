const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescription,
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/prescriptions → create a new prescription
router.post("/", protect, createPrescription);

// GET /api/prescriptions → get all prescriptions
router.get("/", protect, getPrescriptions);

// GET /api/prescriptions/:id → get a single prescription by ID
router.get("/:id", protect, getPrescription);

module.exports = router;
