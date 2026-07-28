import api from "./api";

export const getPharmacyStats = async () => {
  const response = await api.get("/pharmacy/stats");
  return response.data;
};

export const getPharmacyDashboardStats = getPharmacyStats;

export const verifyPrescription = async (rxId) => {
  const response = await api.get(`/pharmacy/verify/${rxId}`);
  return response.data;
};

export const getPrescriptionDetails = async (rxId) => {
  const response = await api.get(`/pharmacy/prescription/${rxId}`);
  return response.data;
};

// alias if another component uses it
export const verifyQR = verifyPrescription;

export const dispensePrescription = async (id, dispenseData) => {
  const response = await api.post(`/pharmacy/dispense/${id}`, dispenseData);
  return response.data;
};

export const dispenseMedicines = dispensePrescription;

export const getDispenseHistory = async () => {
  const response = await api.get("/pharmacy/history");
  return response.data;
};

export const getScanHistory = getDispenseHistory;
export const getDispensedHistory = getDispenseHistory; // Added alias
