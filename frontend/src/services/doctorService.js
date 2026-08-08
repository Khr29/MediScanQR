import api from "./api";

export const getDoctorStats = async () => {
  const response = await api.get("/doctor/stats");
  return response.data;
};

export const getDoctorDashboardStats = getDoctorStats;

export const searchPatients = async (query) => {
  const response = await api.get(
    `/doctor/patients?q=${encodeURIComponent(query)}`,
  );
  return response.data;
};

export const createPrescription = async (prescriptionData) => {
  const response = await api.post(
    "/doctor/prescriptions/create",
    prescriptionData,
  );
  return response.data;
};

export const getDoctorPrescriptions = async () => {
  const response = await api.get("/doctor/prescriptions");
  return response.data;
};

export const getPrescriptions = getDoctorPrescriptions;

export const getDoctorAnalytics = async () => {
  const response = await api.get("/doctor/analytics");
  return response.data;
};

export const cancelPrescription = async (prescriptionId, reason) => {
  const response = await api.patch(
    `/doctor/prescriptions/${prescriptionId}/cancel`,
    { reason },
  );
  return response.data;
};

export const downloadPrescriptionPdf = async (prescriptionId) => {
  const response = await api.get(`/doctor/prescriptions/${prescriptionId}/pdf`, { responseType: 'blob' });
  return response.data;
};

export const getDoctorProfile = async () => {
  const response = await api.get("/doctor/profile");
  return response.data;
};

export const updateDoctorProfile = async (profileData) => {
  const response = await api.put("/doctor/profile", profileData);
  return response.data;
};
