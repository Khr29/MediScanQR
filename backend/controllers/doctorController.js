exports.createPrescription = async (req, res) => {
  try {
    const { patientEmail, medicines, digitalSignature, notes } = req.body;

    // Find patient by email
    const user = await User.findOne({ email: patientEmail });

    if (!user) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    // Find patient profile
    const profile = await PatientProfile.findOne({
      user: user._id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Patient profile not found.",
      });
    }

    // 👇 ADD THESE TWO LINES
    console.log("========== DEBUG ==========");
    console.log("User:", user);
    console.log("Profile:", profile);
    console.log("===========================");

    // Generate unique Prescription ID
    const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prescription expires after 14 days
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create prescription
    const prescription = new Prescription({
      prescriptionId: rxId,
      patientName: user.name,
      patientAge: profile.age,
      doctorName: req.user.name,
      doctorSignature: digitalSignature,
      medicines,
      expiresAt: expiryDate,
    });

    await prescription.save();

    return res.status(201).json({
      message: "Prescription generated successfully.",
      prescription,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};