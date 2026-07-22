const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const JWT_SECRET = 'mediscan_secret_key_12345';

// 1. Doctor Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ name, email, password: hashedPassword });
    await doctor.save();

    res.status(201).json({ message: 'Doctor account created successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Doctor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: doctor._id, name: doctor.name }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      doctor: { id: doctor._id, name: doctor.name, email: doctor.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;