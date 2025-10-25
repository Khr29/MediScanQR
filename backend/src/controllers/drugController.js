// controllers/drugController.js

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
// ✅ CORRECT PATH: Go up one directory (from 'controllers' to root) and down into 'models'
const Drug = require("../models/drugModel");

// --- Helper function for Validation ---
const validateDrugInput = (data) => {
    const { name, manufacturer, description, price } = data;
    
    if (!name || !manufacturer || !description || !price) {
        const error = new Error("Please provide name, manufacturer, description, and price.");
        error.statusCode = 400; 
        throw error;
    }
    
    if (isNaN(price) || Number(price) <= 0) {
        const error = new Error("Price must be a positive number.");
        error.statusCode = 400; 
        throw error;
    }
};

// @desc    Add a new drug
// @route   POST /api/v1/drugs
const addDrug = asyncHandler(async (req, res) => {
    const { name, manufacturer, description, price } = req.body;
    
    // 1. Input Validation
    validateDrugInput(req.body); 

    // 2. Check if drug already exists (Optional pre-check, schema handles the final check)
    const drugExists = await Drug.findOne({ name: name }); 
    if (drugExists) {
        const error = new Error(`Drug with name '${name}' already exists.`);
        error.statusCode = 409; // 409 Conflict
        throw error;
    }

    // 3. Create the new drug
    const drug = await Drug.create({
        name,
        manufacturer,
        description,
        price: Number(price),
    });

    res.status(201).json({
        message: "Drug successfully added.",
        data: drug,
    });
});

// @desc    Get all drugs
// @route   GET /api/v1/drugs
const getAllDrugs = asyncHandler(async (req, res) => {
    const drugs = await Drug.find().sort({ name: 1 }).select('-__v'); 
    
    res.status(200).json({
        count: drugs.length,
        data: drugs,
    });
});

// @desc    Get a single drug by ID
// @route   GET /api/v1/drugs/:id
const getDrugById = asyncHandler(async (req, res) => {
    const drugId = req.params.id;

    // 1. ID Format Validation (Explicit check, though errorMiddleware catches CastError)
    if (!mongoose.Types.ObjectId.isValid(drugId)) {
        const error = new Error(`Invalid ID format: ${drugId}`);
        error.statusCode = 400; 
        throw error;
    }

    // 2. Database Query
    const drug = await Drug.findById(drugId).select('-__v');

    // 3. Not Found Check
    if (!drug) {
        const error = new Error("Drug not found.");
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json(drug);
});

module.exports = {
    addDrug,
    getAllDrugs,
    getDrugById,
};