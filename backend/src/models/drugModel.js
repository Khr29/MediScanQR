const mongoose = require("mongoose");

const drugSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },         // drug name
    description: { type: String },                  // details about the drug
    manufacturer: { type: String },                 // company that makes it
    stock: { type: Number, default: 0 },            // how many units available
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drug", drugSchema);
