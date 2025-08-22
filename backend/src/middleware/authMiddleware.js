const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Protect routes (require login)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    try {
      // If header starts with "Bearer <token>"
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        // If header is just the token
        token = req.headers.authorization;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role-based authorization
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized for this action" });
  }
  next();
};

module.exports = { protect, authorize };
