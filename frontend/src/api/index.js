import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Request interceptor: inject the JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401 (session expired / not logged in)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login — the app's router will handle showing the login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
