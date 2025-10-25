const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); 

// --- Public Routes ---

// POST /api/v1/users/register
router.route("/register").post(registerUser);

// POST /api/v1/users/login
router.route("/login").post(loginUser);

// --- Protected Routes ---

// GET /api/v1/users/profile
router.route("/profile").get(protect, getUserProfile);

module.exports = router;