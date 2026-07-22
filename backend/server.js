const express = require("express");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const Prescription = require("./models/Prescription");

const app = express();
app.use(express.json());
app.use(cors());

// Auth Routes
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/mediscanqr")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// 1. CREATE PRESCRIPTION & GENERATE QR
app.post("/api/prescriptions/create", async (req, res) => {
  try {
    const { patientName, patientAge, doctorName, medicines } = req.body;
    const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPrescription = new Prescription({
      prescriptionId: rxId,
      patientName,
      patientAge,
      doctorName,
      medicines,
    });

    await newPrescription.save();

    // Encode standard Prescription ID directly into QR
    const qrCodeImage = await QRCode.toDataURL(rxId);

    return res.status(201).json({
      message: "Prescription Created Successfully",
      prescriptionId: rxId,
      qrCodeImage,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. VERIFY PRESCRIPTION DETAILS
app.get("/api/prescriptions/verify/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.id,
    });

    if (!prescription) {
      return res
        .status(404)
        .json({ message: "Invalid or non-existent prescription" });
    }

    // Return prescription directly so frontend reads attributes seamlessly
    return res.status(200).json(prescription);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. DISPENSE MEDICATION (Supports POST & PATCH)
const handleDispense = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.status === "DISPENSED") {
      return res.status(400).json({
        message: `ALERT: Already dispensed on ${new Date(prescription.dispensedAt).toLocaleString()}`,
      });
    }

    prescription.status = "DISPENSED";
    prescription.dispensedAt = new Date();
    await prescription.save();

    return res.status(200).json({
      message: "Medicine Dispensed Successfully",
      prescription,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

app.post("/api/prescriptions/dispense/:id", handleDispense);
app.patch("/api/prescriptions/dispense/:id", handleDispense);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
