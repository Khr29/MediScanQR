import api from './api';

export const getDoctorStats = async () => {
  const response = await api.get('/doctor/stats');
  return response.data;
};

export const getDoctorDashboardStats = getDoctorStats;

export const getDoctorPatients = async () => {
  const response = await api.get('/doctor/patients');
  return response.data;
};

export const getPatients = getDoctorPatients;

export const searchPatients = async (query) => {
  const response = await api.get(`/doctor/patients/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/doctor/patients', patientData);
  return response.data;
};

export const registerPatient = createPatient;

export const createPrescription = async (prescriptionData) => {
  const response = await api.post('/doctor/prescriptions/create', prescriptionData);
  return response.data;
};

export const getDoctorPrescriptions = async () => {
  const response = await api.get('/doctor/prescriptions');
  return response.data;
};

export const getPrescriptions = getDoctorPrescriptions;

export const getDoctorAnalytics = async () => {
  const response = await api.get('/doctor/analytics');
  return response.data;
};

export const getMedicineSuggestions = async (query) => {
  const response = await api.get(`/doctor/medicines/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const searchMedicines = getMedicineSuggestions;