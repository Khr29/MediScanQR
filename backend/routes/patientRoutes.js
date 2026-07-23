const express = require('express');
const router = express.Router();
const {
  getMyPrescriptions,
  getPatientProfile,
  getPrescriptionById,
} = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const roles = require('../config/roles');

router.get('/my-prescriptions', verifyToken, requireRole(roles.PATIENT), getMyPrescriptions);
router.get(
  '/prescriptions/:id',
  verifyToken,
  requireRole(roles.PATIENT),
  getPrescriptionById
);
router.get('/profile', verifyToken, requireRole(roles.PATIENT), getPatientProfile);

module.exports = router;