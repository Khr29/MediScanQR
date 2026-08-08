const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/alerts", verifyToken, getUserNotifications);
router.patch("/alerts/read-all", verifyToken, markAllNotificationsRead);
router.patch("/alerts/:id/read", verifyToken, markAsRead);

module.exports = router;