const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PatientProfile = require("../models/PatientProfile");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const roles = require("../config/roles");

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
      password, // In production, hash with bcrypt
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
    }

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

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
      });
    }

    const token = generateToken(user._id);

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
