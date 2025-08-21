const express = require("express");
const router = express.Router();
const {
  addDrug,
  getDrugs,
  getDrugById,
} = require("../controllers/drugController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/drugs → add a new drug
router.post("/", protect, addDrug);

// GET /api/drugs → get all drugs
router.get("/", protect, getDrugs);

// GET /api/drugs/:id → get one drug by ID
router.get("/:id", protect, getDrugById);

module.exports = router;
