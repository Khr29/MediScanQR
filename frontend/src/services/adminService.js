import api from './api';

export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminStats = getAdminDashboardStats;

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await api.get('/admin/approvals/doctors');
  return response.data;
};

export const approveDoctor = async (id) => {
  const response = await api.patch(`/admin/approvals/doctors/${id}/approve`);
  return response.data;
};

export const rejectDoctor = async (id) => {
  const response = await api.patch(`/admin/approvals/doctors/${id}/reject`);
  return response.data;
};

export const getPendingPharmacies = async () => {
  const response = await api.get('/admin/approvals/pharmacies');
  return response.data;
};

export const approvePharmacy = async (id) => {
  const response = await api.patch(`/admin/approvals/pharmacies/${id}/approve`);
  return response.data;
};

export const rejectPharmacy = async (id) => {
  const response = await api.patch(`/admin/approvals/pharmacies/${id}/reject`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};

export const getSystemAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getAnalytics = getSystemAnalytics;