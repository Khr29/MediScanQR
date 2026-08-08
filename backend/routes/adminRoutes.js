const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getAllUsers,
  getUserDetail,
  getPendingDoctors,
  getPendingPharmacies,
  approveUser,
  rejectUser,
  getAuditLogs,
  getSystemAnalytics,
  getAllPrescriptions,
  getPrescriptionDetail,
  downloadPrescriptionPdf,
} = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const roles = require("../config/roles");

// Dashboard
router.get("/stats", verifyToken, requireRole(roles.ADMIN), getAdminStats);

// User Management
router.get("/users", verifyToken, requireRole(roles.ADMIN), getAllUsers);
router.get("/users/:id", verifyToken, requireRole(roles.ADMIN), getUserDetail);

// Doctor Approvals
router.get(
  "/approvals/doctors",
  verifyToken,
  requireRole(roles.ADMIN),
  getPendingDoctors,
);

router.patch(
  "/approvals/doctors/:id/approve",
  verifyToken,
  requireRole(roles.ADMIN),
  approveUser,
);

router.patch(
  "/approvals/doctors/:id/reject",
  verifyToken,
  requireRole(roles.ADMIN),
  rejectUser,
);

// Pharmacy Approvals
router.get(
  "/approvals/pharmacies",
  verifyToken,
  requireRole(roles.ADMIN),
  getPendingPharmacies,
);

router.patch(
  "/approvals/pharmacies/:id/approve",
  verifyToken,
  requireRole(roles.ADMIN),
  approveUser,
);

router.patch(
  "/approvals/pharmacies/:id/reject",
  verifyToken,
  requireRole(roles.ADMIN),
  rejectUser,
);

// Prescription Monitoring
router.get("/prescriptions", verifyToken, requireRole(roles.ADMIN), getAllPrescriptions);
router.get("/prescriptions/:id", verifyToken, requireRole(roles.ADMIN), getPrescriptionDetail);
router.get("/prescriptions/:id/pdf", verifyToken, requireRole(roles.ADMIN), downloadPrescriptionPdf);

// Audit Logs
router.get("/audit-logs", verifyToken, requireRole(roles.ADMIN), getAuditLogs);

// Analytics
router.get(
  "/analytics",
  verifyToken,
  requireRole(roles.ADMIN),
  getSystemAnalytics,
);

module.exports = router;
