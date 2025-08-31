const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // user's full name
    },
    email: {
      type: String,
      required: true,
      unique: true, // must be unique
    },
    password: {
      type: String,
      required: true, // password (will be hashed before saving)
    },
    role: {
      type: String,
      enum: ["user", "doctor", "pharmacist", "admin"], // allowed roles
      required: true,
      default: "user", // if not provided, defaults to 'user'
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// This is a pre-save hook that runs before a user is saved to the database.
// It hashes the password using bcrypt.
userSchema.pre("save", async function (next) {
  // Only hash the password if it's being created or modified
  if (!this.isModified("password")) {
    next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// This is a custom method to compare the entered password with the hashed password.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
