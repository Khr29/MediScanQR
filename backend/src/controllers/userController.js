const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// --- UTILITY: Generate JWT Token (Optimized to include role) ---
const generateToken = (id, role) => {
    // CRITICAL: Include role in the payload for middleware optimization
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/v1/users/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // 1. Input Validation
    if (!name || !email || !password || !role) {
        const error = new Error("Please fill in all required fields (name, email, password, role).");
        error.statusCode = 400; 
        throw error;
    }

    // 2. Security: Validate role against allowed values
    const allowedRoles = ["patient", "doctor", "pharmacist", "admin"]; 
    const lowerRole = role.toLowerCase();
    if (!allowedRoles.includes(lowerRole)) {
        const error = new Error(`Invalid role provided. Must be one of: ${allowedRoles.join(', ')}.`);
        error.statusCode = 400;
        throw error;
    }

    // 3. Check if user exists (handled by Mongoose 11000 error, but explicit check is cleaner)
    const userExists = await User.findOne({ email });
    if (userExists) {
        const error = new Error("User already exists.");
        error.statusCode = 409; 
        throw error;
    }

    // 4. Create the new user
    const user = await User.create({ name, email, password, role: lowerRole });

    // 5. Successful response
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role), // Use new optimized token
        });
    } else {
        const error = new Error("Invalid user data received.");
        error.statusCode = 400;
        throw error;
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic Input Validation
    if (!email || !password) {
        const error = new Error("Please provide email and password.");
        error.statusCode = 400;
        throw error;
    }

    // 2. Find user (must select password manually since schema has `select: false`)
    const user = await User.findOne({ email }).select('+password'); 

    // 3. Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role), // Use new optimized token
        });
    } else {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401; 
        throw error;
    }
});

// @desc    Get user profile
// @route   GET /api/v1/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password -__v");

    if (user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }
});

module.exports = { registerUser, loginUser, getUserProfile };