// controllers/prescriptionController.js

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Prescription = require("../models/prescriptionModel"); 
const generateQR = require('../utils/qrGenerator'); 
// const verifyQR = require('../utils/qrVerifier'); // Assuming this is not needed in the controller, but leaving it commented for context

// @desc    Create new prescription (Doctor only)
// @route   POST /api/v1/prescriptions
const createPrescription = asyncHandler(async (req, res) => {
    const { patientName, medication, instructions } = req.body; 

    if (!patientName || !medication || !instructions || !Array.isArray(medication) || medication.length === 0) {
        const error = new Error("Please provide patientName, non-empty medication array (with drug IDs), and instructions.");
        error.statusCode = 400; 
        throw error;
    }

    // --- FIX APPLIED HERE ---
    // 1. Create the prescription document WITHOUT the QR code initially.
    // The prescription object now receives its unique _id.
    let prescription = await Prescription.create({
        doctor: req.user.id,
        patientName,
        medication, 
        instructions,
        qrCode: "", // Temporary placeholder
    });
    
    // 2. Generate the QR code using the newly created document's ID
    const qrCodeDataUrl = await generateQR(prescription._id.toString());
    
    // 3. Update the prescription document with the generated QR code
    prescription = await Prescription.findByIdAndUpdate(
        prescription._id, 
        { qrCode: qrCodeDataUrl },
        { new: true } // Return the updated document
    ).populate('medication.drug', 'name manufacturer price'); // Populate the drugs for the response

    res.status(201).json({
        message: "Prescription created successfully.",
        data: prescription,
    });
});

// @desc    Get all prescriptions for the logged-in doctor
// @route   GET /api/v1/prescriptions
const getPrescriptions = asyncHandler(async (req, res) => {
    // Only fetch prescriptions created by the logged-in doctor
    const prescriptions = await Prescription.find({ doctor: req.user.id })
        .sort({ createdAt: -1 })
        .select('-__v')
        .populate('medication.drug', 'name manufacturer price'); 
    
    res.status(200).json({
        count: prescriptions.length,
        data: prescriptions,
    });
});

// @desc    Get a single prescription by ID
// @route   GET /api/v1/prescriptions/:id
const getPrescription = asyncHandler(async (req, res) => {
    const prescriptionId = req.params.id;

    // Fetch and ensure the prescription belongs to the logged-in doctor
    const prescription = await Prescription.findOne({
        _id: prescriptionId,
        doctor: req.user.id, 
    }).select('-__v')
      .populate('medication.drug', 'name manufacturer price'); 

    if (!prescription) {
        const error = new Error("Prescription not found or access denied.");
        error.statusCode = 404; 
        throw error;
    }

    res.status(200).json(prescription);
});

module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescription,
};
