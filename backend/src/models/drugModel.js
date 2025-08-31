const mongoose = require("mongoose");

const drugSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a drug name"],
    },
    manufacturer: {
      type: String,
      required: [true, "Please add a manufacturer"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Drug", drugSchema);
