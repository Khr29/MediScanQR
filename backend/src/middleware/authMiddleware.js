const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Helper function for consistent error throwing
const throwAuthError = (message, statusCode = 401) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
};

// NOTE: The development bypass logic has been removed to force all requests
// to go through the authentication flow, ensuring the debug logs execute.

const protect = asyncHandler(async (req, res, next) => {
    let token;
    let decoded;

    // 1. Check for token presence and format
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];

        try {
            // Log for successful token extraction
            console.log(`[Auth Debug] 1. Token extracted: ${token.substring(0, 10)}...`);
            
            // 2. Attempt JWT verification
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Log the decoded ID
            console.log(`[Auth Debug] 2. Decoded ID: ${decoded.id}, Role: ${decoded.role}`);

        } catch (err) {
            console.error(`[Auth Middleware] Token verify failed: ${err.message}`);
            return throwAuthError("Not authorized, token failed.", 401);
        }

        try {
            // 3. Attempt user lookup
            console.log(`[Auth Debug] 3. Querying DB for User ID: ${decoded.id}`);
            // Fetch user, excluding sensitive fields
            const userResult = await User.findById(decoded.id).select("-password -__v");

            // 4. Log the result directly from Mongoose
            console.log(`[Auth Debug] 4. Mongoose FindById Result: ${userResult ? 'User FOUND' : 'NULL or UNDEFINED'}`);

            req.user = userResult;

        } catch (dbErr) {
            // Catch Mongoose specific errors
            console.error(`[Auth Middleware] Database Lookup Error: ${dbErr.message}`);
            return throwAuthError("Database lookup failed during authentication.", 500); 
        }

        // 5. Final check before continuing
        console.log(`[Auth Debug] 5. req.user Final Status: ${req.user ? 'Set' : 'NOT SET'}`);


        if (!req.user) {
            // If the ID was valid but the user wasn't in the DB
            return throwAuthError("Not authorized, user not found.", 401);
        }

        next();

    } else {
        // If no token is provided in the headers
        throwAuthError("Not authorized, no token provided.", 401);
    }
});


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