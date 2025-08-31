const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);
  console.log("Password received:", password);

  try {
    const user = await User.findOne({ email });

    // Check if a user with that email exists
    if (!user) {
      console.log("User not found in database.");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found:", user.email);
    console.log(
      "Comparing entered password with hashed password in database..."
    );

    // Compare the entered password with the hashed password
    if (await user.matchPassword(password)) {
      console.log("Password matched successfully!");
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      console.log("Password did NOT match.");
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
