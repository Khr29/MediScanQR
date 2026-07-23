import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.warn('Logout endpoint failed:', err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};