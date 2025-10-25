const mongoose = require("mongoose");

const ALLOWED_ACTIONS = [
    "USER_REGISTER",
    "USER_LOGIN",
    "DRUG_CREATE",
    "PRESCRIPTION_CREATE",
    "PRESCRIPTION_VIEW",
    // Add more as needed
];

const logSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true, 
            index: true,
        },
        action: { 
            type: String, 
            required: true,
            enum: ALLOWED_ACTIONS, // Enforce data integrity
            index: true,
        }, 
        target: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Any', 
            default: null,
        }, 
        details: { 
            type: Object, 
            default: {},
        }, 
    },
    { 
        timestamps: true,
        versionKey: false,
        collection: 'logs',
    }
);

module.exports = mongoose.model("Log", logSchema);