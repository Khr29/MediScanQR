const express = require("express");
const router = express.Router();

const {
  getMyPrescriptions,
  getPatientDashboard,
  getPatientProfile,
  updatePatientProfile,
  getPrescriptionById,
  getMedicineHistory,
  downloadPrescriptionPdf,
  getMedicationSchedule,
  markDoseTaken,
} = require("../controllers/patientController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const roles = require("../config/roles");

router.get(
  "/my-prescriptions",
  verifyToken,
  requireRole(roles.PATIENT),
  getMyPrescriptions,
);

router.get(
  "/dashboard",
  verifyToken,
  requireRole(roles.PATIENT),
  getPatientDashboard,
);

router.get(
  "/prescriptions/:id",
  verifyToken,
  requireRole(roles.PATIENT),
  getPrescriptionById,
);

router.get(
  "/prescriptions/:id/pdf",
  verifyToken,
  requireRole(roles.PATIENT),
  downloadPrescriptionPdf,
);

router.get(
  "/medicine-history",
  verifyToken,
  requireRole(roles.PATIENT),
  getMedicineHistory,
);

router.get(
  "/medication-schedule",
  verifyToken,
  requireRole(roles.PATIENT),
  getMedicationSchedule,
);

router.post(
  "/medication-schedule/taken",
  verifyToken,
  requireRole(roles.PATIENT),
  markDoseTaken,
);

router.get(
  "/profile",
  verifyToken,
  requireRole(roles.PATIENT),
  getPatientProfile,
);

router.put(
  "/profile",
  verifyToken,
  requireRole(roles.PATIENT),
  updatePatientProfile,
);

module.exports = router;
