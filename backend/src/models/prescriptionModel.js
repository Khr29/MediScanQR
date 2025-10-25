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
        doctor: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true,
        },
        patientName: { 
            type: String, 
            required: [true, "Please add the patient's name."],
            trim: true,
            index: true,
        },
        // CRITICAL FIX: Array of sub-documents to allow multiple drugs
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
            required: [true, "Please add general instructions."],
            trim: true,
        },
        qrCode: { 
            type: String,
            unique: true, 
            sparse: true, 
        },
        status: { 
            type: String, 
            enum: ["active", "fulfilled", "expired", "archived"],
            default: "active",
            trim: true,
        },
    },
    { 
        timestamps: true,
        versionKey: false,
        collection: 'prescriptions',
    }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);