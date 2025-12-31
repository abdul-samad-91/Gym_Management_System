import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // baseURL: '/api',
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    
    // Handle offline mode
    if (!navigator.onLine) {
      toast.error('No internet connection. Operating in offline mode.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

