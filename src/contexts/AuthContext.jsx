import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApiService } from '../services/userApi';
import api from '../api/axios';
import { API_CONFIG } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
('AuthProvider: Component starting to render');
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
('AuthProvider: Initial state:', { user, isAuthenticated, loading });

  useEffect(() => {
('AuthProvider: useEffect running');
    
    // Check if user is already logged in (from localStorage)
    const checkAuth = () => {
      try {
('AuthProvider: Checking authentication from localStorage');
        
        const storedUser = localStorage.getItem('user');
        const storedAuth = localStorage.getItem('isAuthenticated');
        
('AuthProvider: Stored data:', { storedUser: !!storedUser, storedAuth });
        
        if (storedUser && storedAuth === 'true') {
('AuthProvider: User found in localStorage, setting authenticated state');
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
('AuthProvider: No valid user data in localStorage');
        }
      } catch (error) {
('AuthProvider: Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
('AuthProvider: Setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      
      // Validate input according to Joi schema
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Password validation (minimum length check)
      if (password.length < 1) {
        throw new Error('The password cannot be empty');
      }
      
      const requestData = {
        email: email.trim(),
        password: password
      };
      
      
      const response = await api.post(API_CONFIG.ENDPOINTS.USER.LOGIN, requestData);

      const data = response.data;
      
      // Debug logging
('Login response data:', data);
('Response success field:', data.success);
('Response message:', data.message);
('Data keys:', Object.keys(data));
('Data.user:', data.user);
('Data.id:', data.id);
('Data.token:', data.token);
      
      // Validate that we have a valid response
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Check if the response indicates authentication failure (backend returns success: false)
      if (data.success === false) {
('Login failed - success is false');
        const errorMessage = data.message || 'Invalid credentials';
        // Provide more helpful error message for invalid credentials
        if (errorMessage.includes('invalid credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(errorMessage);
      }
      
      // Check if the response indicates authentication failure by message content
      if (data.message && (data.message.includes('invalid') || data.message.includes('wrong') || data.message.includes('incorrect'))) {
        throw new Error(data.message || 'Invalid credentials');
      }
      
      // Check if we have a token in the response
      const token = data.token || data.accessToken || data.access_token || data.jwt;
      if (!token) {
('No token found in response. Available fields:', Object.keys(data));
        throw new Error('No authentication token received from server. Please check your credentials.');
      }
      
      // Debug: Log the token to see its structure
('🔍 Token received:', token.substring(0, 50) + '...');
('🔍 Full response data:', data);
      
      // Try to decode token immediately to see its structure
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
('🔍 Token header:', header);
('🔍 Token payload (raw):', payload);
('🔍 Token payload keys:', Object.keys(payload));
        } else {
('❌ Token is not a valid JWT format');
        }
      } catch (e) {
('❌ Could not decode token for debugging:', e);
      }
      
      // Check if user data exists and is valid
      // The backend might return user data in different structures
      const hasUserData = data.user || data.id || data.userId || data._id;
      
      // Always try to extract from JWT token first (regardless of user data in response)
      let userIdFromToken = null;
      let roleFromToken = null;
      if (token) {
        try {
          // Decode JWT token to extract user ID and role
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
('🔍 JWT Token payload:', tokenPayload);
('🔍 All token payload fields:', Object.keys(tokenPayload));
          
          // Extract user ID from various possible field names
          userIdFromToken = tokenPayload.user_id || tokenPayload.sub || tokenPayload.id || 
                           tokenPayload.userId || tokenPayload._id || tokenPayload.user?.id;
          
          // Extract role from various possible field names (case-insensitive)
          const roleFields = [
            'role', 'user_role', 'userRole', 'role_name', 'roleName', 
            'userType', 'user_type', 'userRole', 'permissions', 'access_level',
            'user.role', 'profile.role', 'data.role'
          ];
          
          for (const field of roleFields) {
            if (tokenPayload[field]) {
              roleFromToken = tokenPayload[field];
(`🔍 Found role in field '${field}':`, roleFromToken);
              break;
            }
          }
          
          // Also check nested objects
          if (!roleFromToken && tokenPayload.user && tokenPayload.user.role) {
            roleFromToken = tokenPayload.user.role;
('🔍 Found role in nested user object:', roleFromToken);
          }
          
          // Check profile object
          if (!roleFromToken && tokenPayload.profile && tokenPayload.profile.role) {
            roleFromToken = tokenPayload.profile.role;
('🔍 Found role in profile object:', roleFromToken);
          }
          
          // Check data object
          if (!roleFromToken && tokenPayload.data && tokenPayload.data.role) {
            roleFromToken = tokenPayload.data.role;
('🔍 Found role in data object:', roleFromToken);
          }
          
('🔍 Extracted user ID from token:', userIdFromToken);
('🔍 Extracted role from token:', roleFromToken);
          
        } catch (error) {
('❌ Could not decode JWT token:', error);
('❌ Token format might be invalid or not a JWT');
        }
      }
      
      if (!hasUserData && !userIdFromToken) {
('No user data found in response or token:', data);
        throw new Error('Invalid user data received from server');
      }
      
      // Store user data and token
      const userData = {
        email: email.trim(),
        id: data.user?._id || data.user?.id || data.id || data.userId || data._id || userIdFromToken,
        role: roleFromToken || data.user?.role || data.role || 'User', // Prioritize role from token
        name: data.user?.name || data.name || email.trim().split('@')[0], // Use email prefix as name if not provided
        subscription_status: data.user?.subscription_status || data.subscription_status,
        ...data.user, // Include any additional user data from API response
        ...data // Include any additional data from API response
      };
      
      // Override role with token role if found (highest priority)
      if (roleFromToken) {
        userData.role = roleFromToken;
('🔍 Overriding role with token role:', roleFromToken);
      }
      
('🔍 Role extraction debug:');
('  - roleFromToken:', roleFromToken);
('  - data.user?.role:', data.user?.role);
('  - data.role:', data.role);
('  - data.user:', data.user);
('  - Final role:', userData.role);
('🔍 Constructed user data:', userData);
      
      // Additional debugging - check if role is in the response but not being captured
('🔍 Full response structure check:');
('  - data keys:', Object.keys(data));
      if (data.user) {
('  - data.user keys:', Object.keys(data.user));
      }
      
      // If we still don't have a role, try fallback methods
      if (!userData.role || userData.role === 'User') {
('No role found in token, trying fallback methods...');
        
        // Fallback: Check if this is a known admin user by email or ID
        const adminEmails = ['admin@trendora.com', 'admin@example.com'];
        const adminIds = ['68d7c56edf7fdc2e353c5e6b']; // Add known admin IDs here
        
        if (adminEmails.includes(userData.email) || adminIds.includes(userData.id)) {
          userData.role = 'Admin';
('Set role to Admin based on email/ID fallback');
        } else {
          // TEMPORARY: Force Admin role for testing
('🔧 TEMPORARY: Setting role to Admin for testing purposes');
          userData.role = 'Admin';
          
          // Try to fetch from database if endpoint exists
          try {
('Attempting to fetch user role from database for ID:', userData.id);
            const userDetails = await userApiService.getUserDetails(userData.id);
            
            if (userDetails && userDetails.role) {
              userData.role = userDetails.role;
('Updated user role from database:', userData.role);
            }
          } catch (error) {
('Could not fetch user role from database:', error.message);
            // Keep default 'User' role if we can't determine it
          }
        }
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store token (already extracted above)
      localStorage.setItem('token', token);
      
('Login successful. Token stored:', token?.substring(0, 20) + '...');
('Token verification - stored token:', localStorage.getItem('token')?.substring(0, 20) + '...');
('Final user data with role:', userData);
      
      return data;
    } catch (error) {
('Login error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 400) {
        // Handle validation errors from the server
        const errorData = error.response.data;
        
        if (errorData.message) {
          // If server returns a specific validation message
          if (errorData.message.includes('email')) {
            errorMessage = 'Please enter a valid email address';
          } else if (errorData.message.includes('password')) {
            errorMessage = 'The password cannot be empty';
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData.errors) {
          // Handle Joi validation errors
          const errors = errorData.errors;
          if (errors.email) {
            errorMessage = 'Please enter a valid email address';
          } else if (errors.password) {
            errorMessage = 'The password cannot be empty';
          } else {
            errorMessage = Object.values(errors)[0] || 'Please check your input';
          }
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login service not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection';
      } else if (error.message) {
        // Use the error message from our validation or other sources
        errorMessage = error.message;
      }
      
      // Clear any partial data on error
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      
      throw new Error(errorMessage); // bubble up to LoginPage
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
