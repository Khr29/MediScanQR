const express = require("express");
const router = express.Router();
const {
  verifyPrescription,
  dispensePrescription,
  getPharmacyStats,
  getDispenseHistory,
  getPrescriptionDetails,
  logInvalidScan,
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

// Verification (Pharmacy only)
router.get(
  "/verify/:rxId",
  verifyToken,
  requireRole(roles.PHARMACY),
  verifyPrescription,
);
router.post(
  "/dispense/:rxId",
  verifyToken,
  requireRole(roles.PHARMACY),
  dispensePrescription,
);

router.get(
  "/prescription/:rxId",
  verifyToken,
  requireRole(roles.PHARMACY),
  getPrescriptionDetails,
);

router.get(
  "/history",
  verifyToken,
  requireRole(roles.PHARMACY),
  getDispenseHistory,
);
router.post(
  "/log-invalid-scan",
  verifyToken,
  requireRole(roles.PHARMACY),
  logInvalidScan,
);

module.exports = router;
