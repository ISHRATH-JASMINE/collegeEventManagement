import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getMyEvents: () => api.get('/events/coordinator/my-events'),
};

// Registrations API
export const registrationsAPI = {
  register: (data) => api.post('/registrations', data),
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  cancel: (id) => api.delete(`/registrations/${id}`),
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
};

export default api;