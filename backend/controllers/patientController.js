const Prescription = require("../models/Prescription");
const PatientProfile = require("../models/PatientProfile");

// @desc Get active digital prescriptions for logged in patient
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get a single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found.",
      });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get patient medical profile details
exports.getPatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      user: req.user._id,
    }).populate("user", "name email");

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
