const express = require('express');
const router = express.Router();
const { createPrescription, getDoctorPrescriptions, searchPatients } = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const roles = require('../config/roles');

router.post('/prescriptions/create', verifyToken, requireRole(roles.DOCTOR), createPrescription);
router.get('/prescriptions', verifyToken, requireRole(roles.DOCTOR), getDoctorPrescriptions);
router.get('/patients', verifyToken, requireRole(roles.DOCTOR), searchPatients);

module.exports = router;