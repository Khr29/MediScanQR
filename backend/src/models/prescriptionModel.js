// src/models/prescriptionModel.js
const mongoose = require("mongoose");

// --- Define Sub-Schema for Medication Item ---
const medicationItemSchema = new mongoose.Schema({
  drug: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Drug", 
    required: true,
    immutable: true,
  },
  quantity: {
    type: Number,
    required: [true, "Please specify the quantity of medication."],
    min: [1, "Quantity must be at least 1."],
  },
  dosage: { 
    type: String,
    required: [true, "Please specify the dosage instructions."],
    trim: true,
  },
  notes: { 
    type: String,
    trim: true,
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    // keep doctor ref but allow it to be optional for quick demo (so frontend can create without auth)
    doctor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: false, // changed to false for demo convenience
      index: true,
    },

    patientName: { 
      type: String, 
      required: [true, "Please add the patient's name."],
      trim: true,
      index: true,
    },

    // medications array (keeps your structure)
    medication: {
      type: [medicationItemSchema],
      required: [true, "A prescription must include at least one medication."],
      validate: {
        validator: v => Array.isArray(v) && v.length > 0,
        message: 'A prescription must include at least one medication item.'
      }
    },

    instructions: {
      type: String,
      trim: true,
      default: ""
    },

    // token used in QR (PRESC-xxxx)
    token: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // keep your existing qrCode field (optional) — can store data url or token
    qrCode: { 
      type: String,
      unique: false,
      sparse: true,
    },

    // status + dispense info
    status: { 
      type: String, 
      enum: ["active", "fulfilled", "expired", "archived"],
      default: "active",
      trim: true,
    },

    dispensed: {
      type: Boolean,
      default: false,
      index: true,
    },

    dispensedAt: {
      type: Date,
      default: null,
    }
  },
  { 
    timestamps: true,
    versionKey: false,
    collection: 'prescriptions',
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
