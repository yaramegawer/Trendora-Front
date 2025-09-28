import axios from 'axios';
import { API_CONFIG, getApiUrl } from '../config/api';

// Create axios instance for user API
const userApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
userApi.interceptors.request.use(
  (config) => {
    console.log(`[User API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[User API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
userApi.interceptors.response.use(
  (response) => {
    console.log(`[User API] Response:`, response.data);
    console.log(`[User API] Full Response Structure:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('[User API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API functions
export const userApiService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await userApi.post(API_CONFIG.ENDPOINTS.USER.LOGIN, credentials);
      
      // Log the response structure for debugging
      console.log('Login API Response:', response.data);
      
      // Validate response structure
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Check if the response indicates an error (even with 200 status)
      if (response.data.success === false || response.data.error) {
        const errorMessage = response.data.message || response.data.error || 'Login failed';
        throw new Error(errorMessage);
      }
      
      return response;
    } catch (error) {
      console.error('Login API Error:', error.response?.data || error.message);
      
      // Handle different error response structures
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid credentials');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  // Get user details by ID (including role)
  getUserDetails: async (userId) => {
    try {
      console.log('Fetching user details for ID:', userId);
      
      // Add token to request headers
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.token = `Trendora ${token}`;
      }
      
      const response = await userApi.get(`/user/${userId}`, { headers });
      
      console.log('User details response:', response.data);
      
      // Check if the response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch user details';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get user details error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch user details');
      }
    }
  },
};

export default userApiService;
