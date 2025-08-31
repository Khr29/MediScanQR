const asyncHandler = require("express-async-handler");
const Drug = require("../models/drugModel");

// @desc    Add a new drug
// @route   POST /api/drugs
// @access  Private (Doctor only)
const addDrug = asyncHandler(async (req, res) => {
  const { name, manufacturer, description, price } = req.body;

  // Check if all fields are filled
  if (!name || !manufacturer || !description || !price) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Check if the authenticated user is a doctor
  if (req.user.role !== "doctor") {
    res.status(403);
    throw new Error("Only doctors can add new drugs");
  }

  // Create the new drug
  const drug = await Drug.create({
    name,
    manufacturer,
    description,
    price,
  });

  res.status(201).json(drug);
});

// @desc    Get all drugs
// @route   GET /api/drugs
// @access  Private (All authenticated users)
const getAllDrugs = asyncHandler(async (req, res) => {
  const drugs = await Drug.find();
  res.status(200).json(drugs);
});

// @desc    Get a single drug by ID
// @route   GET /api/drugs/:id
// @access  Private (All authenticated users)
const getDrugById = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);

  if (!drug) {
    res.status(404);
    throw new Error("Drug not found");
  }

  res.status(200).json(drug);
});

module.exports = {
  addDrug,
  getAllDrugs,
  getDrugById,
};
