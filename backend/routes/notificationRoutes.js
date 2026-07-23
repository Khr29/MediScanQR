const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllNotificationsRead, // Add if you have this in controller
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/notifications/alerts
router.get("/alerts", verifyToken, getUserNotifications);
router.get("/", verifyToken, getUserNotifications);

// PATCH /api/notifications/alerts/:id/read
router.patch("/alerts/:id/read", verifyToken, markAsRead);
router.patch("/:id/read", verifyToken, markAsRead);

// PATCH /api/notifications/alerts/read-all (Optional if defined in controller)
if (markAllNotificationsRead) {
  router.patch("/alerts/read-all", verifyToken, markAllNotificationsRead);
}

module.exports = router;