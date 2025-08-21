const Drug = require("../models/drugModel");

// Add drug
const addDrug = async (req, res) => {
  const { name, description } = req.body;

  try {
    const drug = await Drug.create({ name, description });
    res.status(201).json(drug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all drugs
const getDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.json(drugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get drug by ID
const getDrugById = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }
    res.json(drug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addDrug, getDrugs, getDrugById };
