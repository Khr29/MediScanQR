const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "CREATE_PRESCRIPTION"
    target: { type: String }, // optional: prescription ID, drug ID
    details: { type: Object }, // flexible field for extra data
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
