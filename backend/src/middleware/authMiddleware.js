const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const throwAuthError = (message, statusCode = 401) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
};

// @desc    Protect routes (require valid JWT)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Attach user to request (without password and version key)
            // CRITICAL NOTE: This DB query runs on EVERY protected request. See recommendations for optimization.
            req.user = await User.findById(decoded.id).select("-password -__v");

            if (!req.user) {
                throwAuthError("Not authorized, user not found.");
            }

            next();
        } catch (error) {
            console.error(`[Auth Middleware] Token Verification Failed: ${error.message}`);
            // Force 401 Unauthorized for all token failures (security)
            throwAuthError("Not authorized, token failed.", 401); 
        }
    } else {
        throwAuthError("Not authorized, no token provided.", 401);
    }
};

// @desc    Role-based authorization (e.g., authorize('doctor', 'admin'))
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        throwAuthError("Authentication required for role check.", 401);
    }
    
    if (!roles.includes(req.user.role)) {
        throwAuthError("Forbidden: You do not have the necessary permissions for this action.", 403);
    }
    
    next();
};

module.exports = { protect, authorize };