const express = require("express");
const router = express.Router();
const {
  addDrug,
  getAllDrugs,
  getDrugById,
} = require("../controllers/drugController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/drugs
// @desc    Add a new drug
// @access  Private (Doctor only)
router.post("/", protect, addDrug);

// @route   GET /api/drugs
// @desc    Get all drugs
// @access  Private (All authenticated users)
router.get("/", protect, getAllDrugs);

// @route   GET /api/drugs/:id
// @desc    Get a single drug by ID
// @access  Private (All authenticated users)
router.get("/:id", protect, getDrugById);

module.exports = router;
