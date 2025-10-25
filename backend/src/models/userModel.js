const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            trim: true,
            lowercase: true, // CRITICAL: Standardize email for unique check
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Security: Do not return password by default
        },
        role: {
            type: String,
            enum: ["patient", "doctor", "pharmacist", "admin"],
            required: [true, "Please provide a role"],
            default: "patient",
            lowercase: true, // Ensure consistent role checks
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'users',
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);