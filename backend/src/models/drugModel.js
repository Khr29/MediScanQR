const mongoose = require("mongoose");

const drugSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a drug name"],
            trim: true,
            maxlength: [100, "Drug name cannot be more than 100 characters"],
        },
        manufacturer: {
            type: String,
            required: [true, "Please add a manufacturer"],
            trim: true,
            maxlength: [100, "Manufacturer name cannot be more than 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Please add a price"],
            min: [0, "Price cannot be negative"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'drugs'
    }
);

// CRITICAL FIX: Unique index for name, made case-insensitive for reliable uniqueness
drugSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model("Drug", drugSchema);