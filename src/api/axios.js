import axios from "axios";
import { API_CONFIG } from "../config/api.js";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  validateStatus: () => true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
      
      // Debug logging removed for production
    }
    
    // Method-specific cache behavior
    const method = (config.method || 'get').toLowerCase();
    if (method === 'get') {
      // Allow short-lived caching; server ultimately decides via response headers
      config.headers['Cache-Control'] = 'max-age=60, stale-while-revalidate=300';
    } else {
      // Ensure mutations skip caches
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
    
    // Initialize retry metadata
    if (config.metadata == null) {
      config.metadata = { retryCount: 0 };
    }
    
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

    // Lightweight retry for transient GET errors
    const config = error.config;
    const isNetworkOrTimeout = !error.response || error.code === 'ECONNABORTED';
    if (config && (config.method || 'get').toLowerCase() === 'get' && isNetworkOrTimeout) {
      config.metadata = config.metadata || { retryCount: 0 };
      if (config.metadata.retryCount < 2) {
        config.metadata.retryCount += 1;
        const backoffMs = 200 * Math.pow(2, config.metadata.retryCount - 1);
        return new Promise((resolve) => setTimeout(resolve, backoffMs)).then(() => api(config));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
