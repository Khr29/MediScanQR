const express = require('express');
const router = express.Router();
const { getPendingApprovals, toggleUserApproval, getAuditLogs } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const roles = require('../config/roles');

router.get('/approvals', verifyToken, requireRole(roles.ADMIN), getPendingApprovals);
router.patch('/users/:userId/approval', verifyToken, requireRole(roles.ADMIN), toggleUserApproval);
router.get('/audit-logs', verifyToken, requireRole(roles.ADMIN), getAuditLogs);

module.exports = router;