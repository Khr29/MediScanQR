const mongoose = require("mongoose");

const DoctorProfileSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    specialization: { 
      type: String, 
      required: true 
    },
    licenseNumber: { 
      type: String, 
      required: true 
    },
    hospitalName: { 
      type: String 
    },
    clinicAddress: { 
      type: String 
    },
    phone: { 
      type: String 
    },
    digitalSignature: { 
      type: String 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", DoctorProfileSchema);