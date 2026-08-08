const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getDoctorPrescriptions,
  searchPatients,
  getDoctorStats,
  getDoctorAnalytics,
  cancelPrescription,
  getDoctorProfile,
  updateDoctorProfile,
  downloadPrescriptionPdf,
} = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const roles = require('../config/roles');

router.get('/stats', verifyToken, requireRole(roles.DOCTOR), getDoctorStats);
router.get('/analytics', verifyToken, requireRole(roles.DOCTOR), getDoctorAnalytics);
router.get('/profile', verifyToken, requireRole(roles.DOCTOR), getDoctorProfile);
router.put('/profile', verifyToken, requireRole(roles.DOCTOR), updateDoctorProfile);
router.post('/prescriptions/create', verifyToken, requireRole(roles.DOCTOR), createPrescription);
router.get('/prescriptions', verifyToken, requireRole(roles.DOCTOR), getDoctorPrescriptions);
router.patch('/prescriptions/:id/cancel', verifyToken, requireRole(roles.DOCTOR), cancelPrescription);
router.get('/prescriptions/:id/pdf', verifyToken, requireRole(roles.DOCTOR), downloadPrescriptionPdf);
router.get('/patients', verifyToken, requireRole(roles.DOCTOR), searchPatients);

module.exports = router;