// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const throwAuthError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

/**
 * Helper: allow public creation during dev.
 * - Allows POST /api/v1/prescriptions and /api/prescriptions in non-production.
 * - Also allows disabling auth completely with DISABLE_AUTH=true.
 */
function isPublicDevEndpoint(req) {
  if (process.env.DISABLE_AUTH === "true") return true;
  if (process.env.NODE_ENV === "production") return false;

  const path = req.originalUrl || req.url || "";
  const allowedCreatePaths = ["/api/v1/prescriptions", "/api/prescriptions"];
  if (req.method === "POST" && allowedCreatePaths.includes(path)) return true;
  return false;
}

const protect = async (req, res, next) => {
  try {
    if (isPublicDevEndpoint(req)) return next();

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error(`[Auth Middleware] Token verify failed: ${err.message}`);
        throwAuthError("Not authorized, token failed.", 401);
      }

      req.user = await User.findById(decoded.id).select("-password -__v");
      if (!req.user) throwAuthError("Not authorized, user not found.", 401);

      return next();
    } else {
      throwAuthError("Not authorized, no token provided.", 401);
    }
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  try {
    if (!req.user || !req.user.role) throwAuthError("Authentication required for role check.", 401);
    if (!roles.includes(req.user.role)) throwAuthError("Forbidden: You do not have the necessary permissions for this action.", 403);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, authorize };
