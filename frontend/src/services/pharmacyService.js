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

// Unauthenticated verification, used by the public /verify/:id page.
export const verifyPublicPrescription = async (rxId) => {
  const response = await api.get(`/pharmacy/verify-public/${rxId}`);
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

// Log invalid QR scans
export const logInvalidScan = async (rawQRCode) => {
  const response = await api.post("/pharmacy/log-invalid-scan", {
    rawQRCode,
  });
  return response.data;
};
