const express = require("express");
const router = express.Router();
const {
    addDrug,
    getAllDrugs,
    getDrugById,
} = require("../controllers/drugController");
const { protect, authorize } = require("../middleware/authMiddleware"); 

// --- /api/v1/drugs ---
router.route("/")
    // POST /api/v1/drugs (Doctor only)
    .post(protect, authorize('doctor'), addDrug) 
    // GET /api/v1/drugs (All authenticated users)
    .get(protect, getAllDrugs);

// --- /api/v1/drugs/:id ---
router.route("/:id")
    // GET /api/v1/drugs/:id (All authenticated users)
    .get(protect, getDrugById);

module.exports = router;