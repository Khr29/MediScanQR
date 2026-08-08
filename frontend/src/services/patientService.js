import api from './api';

export const getPatientDashboard = async () => {
  const response = await api.get('/patient/dashboard');
  return response.data;
};

// Aliases for PatientDashboard
export const getPatientDashboardStats = getPatientDashboard;

export const getPatientPrescriptions = async () => {
  const response = await api.get('/patient/my-prescriptions');
  return response.data;
};

export const getMyPrescriptions = getPatientPrescriptions;

export const getPrescriptionById = async (id) => {
  const response = await api.get(`/patient/prescriptions/${id}`);
  return response.data;
};

export const getPrescriptionDetails = getPrescriptionById;

export const downloadPrescriptionPdf = async (id) => {
  const response = await api.get(`/patient/prescriptions/${id}/pdf`, { responseType: 'blob' });
  return response.data;
};

export const getMedicineHistory = async () => {
  const response = await api.get('/patient/medicine-history');
  return response.data;
};

// Alias for MedicineHistory import
export const getMedicalHistory = getMedicineHistory;

export const getPatientProfile = async () => {
  const response = await api.get('/patient/profile');
  return response.data;
};

export const updatePatientProfile = async (profileData) => {
  const response = await api.put('/patient/profile', profileData);
  return response.data;
};