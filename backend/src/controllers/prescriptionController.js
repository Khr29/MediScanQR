const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Prescription = require("../models/prescriptionModel"); 
const generateQR = require('../utils/qrGenerator'); 

// @desc    Create new prescription (Doctor only)
// @route   POST /api/v1/prescriptions
const createPrescription = asyncHandler(async (req, res) => {
    // === DEFENSIVE AUTH CHECK (Added for clearer error messages) ===
    if (!req.user || !req.user.id) {
        const error = new Error("Authentication token failed verification. Doctor ID is missing.");
        // Throw a 401 error instead of letting the 500 error occur later
        error.statusCode = 401; 
        throw error;
    }
    // =============================================================

    const { patientName, medication, instructions } = req.body; 

    if (!patientName || !medication || !instructions || !Array.isArray(medication) || medication.length === 0) {
        const error = new Error("Please provide patientName, non-empty medication array (with drug IDs), and instructions.");
        error.statusCode = 400; 
        throw error;
    }

    // 1. Create the prescription document WITHOUT the QR code initially.
    let prescription = await Prescription.create({
        doctor: req.user.id, // This line is now protected by the check above
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

// @desc    Get all prescriptions for the logged-in doctor
// @route   GET /api/v1/prescriptions
const getPrescriptions = asyncHandler(async (req, res) => {
    // === DEFENSIVE AUTH CHECK (Added for clearer error messages) ===
    if (!req.user || !req.user.id) {
        const error = new Error("Authentication token failed verification. Doctor ID is missing.");
        error.statusCode = 401; 
        throw error;
    }
    // =============================================================
    
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

// @desc    Get a single prescription by ID
// @route   GET /api/v1/prescriptions/:id
const getPrescription = asyncHandler(async (req, res) => {
    // === DEFENSIVE AUTH CHECK (Added for clearer error messages) ===
    if (!req.user || !req.user.id) {
        const error = new Error("Authentication token failed verification. Doctor ID is missing.");
        error.statusCode = 401; 
        throw error;
    }
    // =============================================================
    
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

// @desc    Mark a prescription as dispensed/fulfilled (Pharmacist/Authorized User only)
// @route   POST /api/v1/prescriptions/:id/dispense
const dispensePrescription = asyncHandler(async (req, res) => {
    const prescriptionId = req.params.id;

    // 1. Defensive Auth Check (Assuming Pharmacist/Authorized User role is handled by middleware)
    if (!req.user || !req.user.id) {
        const error = new Error("Authentication token failed verification. Only authorized users (e.g., Pharmacists) can dispense prescriptions.");
        error.statusCode = 401; 
        throw error;
    }

    // 2. Find and Validate Prescription
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
        const error = new Error(`Prescription with ID ${prescriptionId} not found.`);
        error.statusCode = 404; 
        throw error;
    }
    
    // 3. Check if already dispensed
    if (prescription.dispensed) {
        const error = new Error("This prescription has already been dispensed.");
        error.statusCode = 400; // Bad Request
        throw error;
    }
    
    // 4. Update the prescription status and dispense details
    const dispensedPrescription = await Prescription.findByIdAndUpdate(
        prescriptionId,
        {
            dispensed: true,
            dispensedAt: Date.now(),
            status: 'fulfilled' // Change status to fulfilled
        },
        { new: true } // Return the updated document
    ).populate('medication.drug', 'name manufacturer price');

    res.status(200).json({
        message: "Prescription successfully dispensed and fulfilled.",
        data: dispensedPrescription,
    });
});


module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescription,
    dispensePrescription, // <<< NEWLY EXPORTED FUNCTION
};