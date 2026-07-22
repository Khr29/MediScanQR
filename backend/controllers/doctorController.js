const Prescription = require('../models/Prescription');
const PatientProfile = require('../models/PatientProfile');

// @desc Create a new prescription with unique RX ID
exports.createPrescription = async (req, res) => {
  try {
    const { patientName, patientAge, doctorName, doctorSignature, medicines, validityDays } = req.body;

    const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiryDate = new Date(Date.now() + (validityDays || 14) * 24 * 60 * 60 * 1000);

    const prescription = new Prescription({
      prescriptionId: rxId,
      patientName,
      patientAge,
      doctorName: doctorName || req.user.name,
      doctorSignature,
      medicines,
      expiresAt: expiryDate,
    });

    await prescription.save();

    return res.status(201).json({
      message: "Prescription generated successfully.",
      prescription,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Get prescriptions created by doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorName: req.user.name }).sort({ createdAt: -1 });
    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Search Patients for Doctor Portal
exports.searchPatients = async (req, res) => {
  try {
    const profiles = await PatientProfile.find().populate('user', 'name email');
    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};