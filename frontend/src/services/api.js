import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- API Functions ---
export const login = (email, password) => api.post('/users/login', { email, password });
export const register = (userData) => api.post('/users/register', userData); // New registration function

export const getDrugs = () => api.get('/drugs');
export const createDrug = (drugData) => api.post('/drugs', drugData); // New function for Doctor to add drugs
export const createPrescription = (prescriptionData) => api.post('/prescriptions', prescriptionData);
export const getPrescriptions = () => api.get('/prescriptions');
export const getPrescriptionById = (id) => api.get(`/prescriptions/${id}`);
export const fulfillPrescription = (id) => api.put(`/prescriptions/fulfill/${id}`); 

export default api;