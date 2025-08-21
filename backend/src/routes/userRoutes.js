const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/users/register → register new user
router.post("/register", registerUser);

// POST /api/users/login → login user
router.post("/login", loginUser);

// GET /api/users/profile → get logged in user info (protected route)
router.get("/profile", protect, getUserProfile);

module.exports = router;
