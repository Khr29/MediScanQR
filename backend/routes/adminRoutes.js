const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getPendingDoctors,
  getPendingPharmacies,
  approveUser,
  rejectUser,
  getAuditLogs,
  getSystemAnalytics,
} = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const roles = require("../config/roles");

// Dashboard
router.get("/stats", verifyToken, requireRole(roles.ADMIN), getAdminStats);

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
