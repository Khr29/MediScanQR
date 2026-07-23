const express = require("express");
const router = express.Router();
const {
  verifyPrescription,
  dispensePrescription,
  getPharmacyStats,
} = require("../controllers/pharmacyController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const roles = require("../config/roles");

router.get(
  "/stats",
  verifyToken,
  requireRole(roles.PHARMACY),
  getPharmacyStats,
);

// Verification can be called by scanning (Public or Pharmacy)
router.get("/verify/:rxId", verifyPrescription);
router.post(
  "/dispense/:rxId",
  verifyToken,
  requireRole(roles.PHARMACY),
  dispensePrescription,
);

module.exports = router;
