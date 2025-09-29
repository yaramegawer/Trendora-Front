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

  // Forget password - send reset code to email
  forgetPassword: async (email) => {
    try {
      console.log('🔍 Forget Password Debug Info:');
      console.log('📧 Email:', email);
      console.log('🌐 API URL:', userApi.defaults.baseURL);
      console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.USER.FORGET_PASSWORD);
      
      const requestData = { email: email.trim() };
      console.log('📦 Request data:', requestData);
      
      // Test if the backend is reachable
      try {
        console.log('🔍 Testing backend connectivity...');
        const testResponse = await fetch(`${userApi.defaults.baseURL}/user/log_in`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('🔍 Backend test response status:', testResponse.status);
      } catch (testError) {
        console.log('🔍 Backend test failed:', testError.message);
      }
      
      // Send only the email as expected by the Joi schema
      console.log('📦 Sending request data:', requestData);
      
      const response = await userApi.post(API_CONFIG.ENDPOINTS.USER.FORGET_PASSWORD, requestData);
      
      console.log('📡 Response status:', response.status);
      console.log('📄 Response data:', response.data);
      
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to send reset code';
        console.error('❌ Backend error:', errorMessage);
        console.error('❌ Full response:', response.data);
        
        // Provide more specific error messages based on the backend response
        if (errorMessage.includes('Something went wrong')) {
          throw new Error('The password reset service is temporarily unavailable. Please try again later or contact support.');
        } else if (errorMessage.includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else if (errorMessage.includes('not found')) {
          throw new Error('This email is not registered in our system.');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Forget password error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Email not found in our system. Please check your email address.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      } else {
        throw new Error(`Failed to send reset code: ${error.message}`);
      }
    }
  },

  // Reset password with code
  resetPassword: async (resetData) => {
    try {
      console.log('Resetting password with data:', { email: resetData.email, hasCode: !!resetData.forgetCode });
      
      const response = await userApi.put(API_CONFIG.ENDPOINTS.USER.RESET_PASSWORD, resetData);
      
      console.log('Reset password response:', response.data);
      
      // Check if the response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to reset password';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid reset data';
        if (errorMessage.includes('password')) {
          throw new Error('Password must be at least 8 characters with uppercase, lowercase, and special character');
        } else if (errorMessage.includes('code')) {
          throw new Error('Invalid or expired reset code');
        } else if (errorMessage.includes('match')) {
          throw new Error('Passwords do not match');
        }
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error('Email not found or reset code expired');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to reset password. Please try again.');
      }
    }
  },
};

export default userApiService;
