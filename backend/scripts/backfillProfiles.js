// One-time (re-runnable) migration: creates the role profile document for any
// User that predates the registration flow's profile-creation step, or whose
// profile was otherwise lost. Idempotent - only inserts where none exists.
//
// Usage: node scripts/backfillProfiles.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PharmacyProfile = require("../models/PharmacyProfile");
const PatientProfile = require("../models/PatientProfile");
const Prescription = require("../models/Prescription");
const roles = require("../config/roles");

async function backfillDoctors() {
  const doctors = await User.find({ role: roles.DOCTOR });
  let created = 0;

  for (const doctor of doctors) {
    const existing = await DoctorProfile.findOne({ user: doctor._id });
    if (existing) continue;

    // Recover specialization/license from the most recent prescription
    // snapshot when available, since that's real historical data rather
    // than a guess.
    const lastRx = await Prescription.findOne({ doctor: doctor._id }).sort({
      createdAt: -1,
    });

    await DoctorProfile.create({
      user: doctor._id,
      specialization: lastRx?.doctorSpecialization || "General Physician",
      licenseNumber: lastRx?.doctorLicenseNumber || doctor.licenseNumber || "PENDING",
      ...(lastRx?.doctorSignature ? { digitalSignature: lastRx.doctorSignature } : {}),
    });
    created += 1;
    console.log(`Created DoctorProfile for ${doctor.email}`);
  }

  return created;
}

async function backfillPharmacies() {
  const pharmacies = await User.find({ role: roles.PHARMACY });
  let created = 0;

  for (const pharmacy of pharmacies) {
    const existing = await PharmacyProfile.findOne({ user: pharmacy._id });
    if (existing) continue;

    await PharmacyProfile.create({
      user: pharmacy._id,
      licenseNumber: pharmacy.licenseNumber || "PENDING",
    });
    created += 1;
    console.log(`Created PharmacyProfile for ${pharmacy.email}`);
  }

  return created;
}

async function backfillPatients() {
  const patients = await User.find({ role: roles.PATIENT });
  let created = 0;

  for (const patient of patients) {
    const existing = await PatientProfile.findOne({ user: patient._id });
    if (existing) continue;

    await PatientProfile.create({
      user: patient._id,
      bloodGroup: "Unknown",
      allergies: [],
      chronicDiseases: [],
      emergencyContact: "",
    });
    created += 1;
    console.log(`Created PatientProfile for ${patient.email}`);
  }

  return created;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const doctorsCreated = await backfillDoctors();
  const pharmaciesCreated = await backfillPharmacies();
  const patientsCreated = await backfillPatients();

  console.log(
    `Done. Created ${doctorsCreated} doctor profile(s), ${pharmaciesCreated} pharmacy profile(s), ${patientsCreated} patient profile(s).`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
