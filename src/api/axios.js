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
    console.log('🔑 Axios Interceptor - Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('🔑 Axios Interceptor - Request URL:', config.url);
    console.log('🔑 Axios Interceptor - Is login request?', config.url.includes('/log_in'));
    
    if (token && !config.url.includes('/log_in')) {
      // Try both header formats to ensure compatibility
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = `Trendora ${token}`;
      console.log('✅ Token added to request:', token.substring(0, 20) + '...');
      console.log('✅ Request headers after token addition:', config.headers);
    } else if (!token && !config.url.includes('/log_in')) {
      console.warn('❌ No token found for API request');
    } else if (config.url.includes('/log_in')) {
      console.log('🔐 Login request - no token needed');
    }
    
    // Note: Removed custom headers to avoid CORS issues
    // The backend can get user info from the JWT token in Authorization header
    
    // Add debug logging
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request headers:', config.headers);
    if (config.data) {
      console.log('Request data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
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
