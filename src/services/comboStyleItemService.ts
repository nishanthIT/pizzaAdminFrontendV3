import axios from 'axios';
import { getStoredToken } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔧 Making request to:', config.baseURL + config.url);
  console.log('🔧 With headers:', config.headers);
  return config;
});

// Add response interceptor to log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const comboStyleItemService = {
  // Get all combo style items
  getAll: () => api.get('/api/admin/comboStyleItems'),
  
  // Get combo style item by ID
  getById: (id: string) => api.get(`/api/admin/comboStyleItems/${id}`),
  
  // Create new combo style item
  create: (data: any) => {
    const config = data instanceof FormData ? 
      { headers: { 'Content-Type': 'multipart/form-data' } } : 
      {};
    return api.post('/api/admin/comboStyleItems', data, config);
  },
  
  // Update combo style item
  update: (id: string, data: any) => {
    const config = data instanceof FormData ? 
      { headers: { 'Content-Type': 'multipart/form-data' } } : 
      {};
    return api.put(`/api/admin/comboStyleItems/${id}`, data, config);
  },
  
  // Delete combo style item
  delete: (id: string) => api.delete(`/api/admin/comboStyleItems/${id}`),
  
  // Get available sauces (global configuration)
  getSauces: () => api.get('/api/admin/sauces'),
  
  // Update available sauces
  updateSauces: (sauces: string[]) => api.put('/api/admin/sauces', { sauces }),
  
  // Get available sides
  getSides: () => api.get('/api/admin/sides'),
  
  // Update available sides
  updateSides: (sides: any[]) => api.put('/api/admin/sides', { sides }),
  
  // Get available drinks
  getDrinks: () => api.get('/api/admin/drinks'),
  
  // Update available drinks
  updateDrinks: (drinks: any[]) => api.put('/api/admin/drinks', { drinks }),
};
