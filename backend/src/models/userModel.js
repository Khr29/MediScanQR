const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // user's full name
    email: { type: String, required: true, unique: true }, // must be unique
    password: { type: String, required: true }, // password (later we will hash it)
    role: {
      type: String,
      enum: ["doctor", "pharmacist", "admin"],
      required: true,
    }, // user type
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
