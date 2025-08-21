const Prescription = require("../models/prescriptionModel");
const generateQR = require("../utils/generateQR");

// Create prescription
const createPrescription = async (req, res) => {
  const { patientName, medication, dosage } = req.body;

  try {
    const qrData = `${patientName}-${medication}-${Date.now()}`;
    const qrCode = await generateQR(qrData);

    const prescription = await Prescription.create({
      patientName,
      medication,
      dosage,
      qrCode,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPrescription, getPrescriptions, getPrescriptionById };
