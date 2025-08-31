const asyncHandler = require("express-async-handler");
const Prescription = require("../models/prescriptionModel");
const User = require("../models/userModel");

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res) => {
  const { patientName, medication, dosage, instructions } = req.body;

  // Check if all fields are filled
  if (!patientName || !medication || !dosage || !instructions) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Get the doctor's ID from the authenticated user
  const doctor = await User.findById(req.user.id);

  // Check if the authenticated user is a doctor
  if (doctor.role !== "doctor") {
    res.status(403);
    throw new Error("Only doctors can create prescriptions");
  }

  // Create the new prescription
  const prescription = await Prescription.create({
    doctor: req.user.id,
    patientName,
    medication,
    dosage,
    instructions,
  });

  res.status(201).json(prescription);
});

// @desc    Get all prescriptions for the logged-in doctor
// @route   GET /api/prescriptions
// @access  Private (Doctor only)
const getPrescriptions = asyncHandler(async (req, res) => {
  // Find all prescriptions where the 'doctor' field matches the ID of the logged-in user
  const prescriptions = await Prescription.find({ doctor: req.user.id });
  res.status(200).json(prescriptions);
});

// @desc    Get a single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  // Check that the found prescription belongs to the logged-in doctor
  if (prescription.doctor.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to view this prescription");
  }

  res.status(200).json(prescription);
});

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescription,
};
