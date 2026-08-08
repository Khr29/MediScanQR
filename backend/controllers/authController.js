const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PatientProfile = require("../models/PatientProfile");
const PharmacyProfile = require("../models/PharmacyProfile");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const jwtConfig = require("../config/jwt");
const roles = require("../config/roles");
const { sendEmail } = require("../utils/sendEmail");
const logAction = require("../utils/auditLogger");

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// In-memory brute-force guard on login, keyed by email. Not distributed
// (resets on server restart / doesn't share state across instances) but this
// app runs as a single process, so it's a real, meaningful deterrent without
// adding an external dependency.
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const isRateLimited = (email) => {
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS;
};

const recordLoginFailure = (email) => {
  const entry = loginAttempts.get(email);
  if (!entry || Date.now() - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(email, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count += 1;
  }
};

const clearLoginAttempts = (email) => loginAttempts.delete(email);

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.JWT_SECRET, {
    expiresIn: jwtConfig.JWT_EXPIRES_IN,
  });
};

// @desc Register User (Patient, Doctor, or Pharmacy)
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      licenseNumber,
      specialization,
      bloodGroup,
      age,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    // Doctors and Pharmacies require admin approval by default
    const isApproved = role === roles.PATIENT;

    const newUser = new User({
      name,
      email,
      password, // hashed automatically by the User model's pre('save') hook
      role: role || roles.PATIENT,
      isApproved,
      licenseNumber,
    });

    await newUser.save();

    // Create linked role profiles
    if (role === roles.DOCTOR) {
      await DoctorProfile.create({
        user: newUser._id,
        specialization: specialization || "General Physician",
        licenseNumber: licenseNumber || "PENDING",
      });
    } else if (role === roles.PATIENT) {
      await PatientProfile.create({
        user: newUser._id,
        age: Number(age),
        bloodGroup: bloodGroup || "Unknown",
        allergies: [],
        chronicDiseases: [],
        emergencyContact: "",
      });
    } else if (role === roles.PHARMACY) {
      await PharmacyProfile.create({
        user: newUser._id,
        licenseNumber: licenseNumber || "PENDING",
      });
    }

    await logAction({
      req,
      user: newUser,
      action: "REGISTER",
      target: newUser.email,
      result: "SUCCESS",
      details: `Registered as ${newUser.role}`,
    });

    return res.status(201).json({
      message: isApproved
        ? "Registration successful."
        : "Registration submitted. Pending admin approval.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isRateLimited(email)) {
      await logAction({
        req,
        user: { email },
        action: "FAILED_LOGIN",
        target: email,
        result: "FAILED",
        details: "Blocked - too many failed attempts",
      });
      return res.status(429).json({
        message: "Too many failed login attempts. Please try again in 15 minutes.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      recordLoginFailure(email);
      await logAction({
        req,
        user: user || { email },
        action: "FAILED_LOGIN",
        target: email,
        result: "FAILED",
        details: "Invalid credentials",
      });
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
      });
    }

    clearLoginAttempts(email);
    const token = generateToken(user._id);

    await logAction({
      req,
      user,
      action: "LOGIN",
      target: user.email,
      result: "SUCCESS",
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Request a password reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Respond identically whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password/${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your MediScanQR password",
        text: `Reset your password using this link (valid for 30 minutes): ${resetUrl}`,
        html: `<p>Reset your MediScanQR password using the link below. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    }

    return res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Reset a password using a token issued by forgotPassword
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = password; // re-hashed automatically by the pre('save') hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get Current Logged-In User Profile
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
