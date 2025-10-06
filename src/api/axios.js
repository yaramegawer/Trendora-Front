import axios from "axios";
import { API_CONFIG } from "../config/api.js";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (but NOT for login requests)
    const token = localStorage.getItem('token');
    
    if (token && !config.url.includes('/log_in')) {
      // Try both header formats to ensure compatibility
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = `Trendora ${token}`;
    }
    
    // Note: Removed custom headers to avoid CORS issues
    // The backend can get user info from the JWT token in Authorization header
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (only if token exists)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
