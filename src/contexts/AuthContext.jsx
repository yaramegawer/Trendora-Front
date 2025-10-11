import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApiService } from '../services/userApi';
import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Department ID mapping (same as in departmentAuth.jsx)
const DEPARTMENT_ID_MAP = {
  '68da376594328b3a175633a7': 'IT',
  '68da377194328b3a175633ad': 'HR',
  '68da378594328b3a175633b3': 'Operation',
  '68da378d94328b3a175633b9': 'Sales',
  '68da379894328b3a175633bf': 'Accounting',
  '68da6e0813fe176e91aefd59': 'Digital Marketing'
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider: Component starting to render');
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  console.log('AuthProvider: Initial state:', { user, isAuthenticated, loading });

  useEffect(() => {
    console.log('AuthProvider: useEffect running');
    
    // Check if user is already logged in (from localStorage)
    const checkAuth = () => {
      try {
        console.log('AuthProvider: Checking authentication from localStorage');
        
        const storedUser = localStorage.getItem('user');
        const storedAuth = localStorage.getItem('isAuthenticated');
        
        console.log('AuthProvider: Stored data:', { storedUser: !!storedUser, storedAuth });
        
        if (storedUser && storedAuth === 'true') {
          console.log('AuthProvider: User found in localStorage, setting authenticated state');
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          console.log('AuthProvider: No valid user data in localStorage');
        }
      } catch (error) {
        console.log('AuthProvider: Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        console.log('AuthProvider: Setting loading to false');
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
      console.log('Login response data:', data);
      console.log('Response success field:', data.success);
      console.log('Response message:', data.message);
      console.log('Data keys:', Object.keys(data));
      console.log('Data.user:', data.user);
      console.log('Data.id:', data.id);
      console.log('Data.token:', data.token);
      
      // Validate that we have a valid response
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Check if the response indicates authentication failure (backend returns success: false)
      if (data.success === false) {
        console.log('Login failed - success is false');
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
        console.log('No token found in response. Available fields:', Object.keys(data));
        throw new Error('No authentication token received from server. Please check your credentials.');
      }
      
      // Debug: Log the token to see its structure
      console.log('🔍 Token received:', token.substring(0, 50) + '...');
      console.log('🔍 Full response data:', data);
      
      // Try to decode token immediately to see its structure
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Token header:', header);
          console.log('🔍 Token payload (raw):', payload);
          console.log('🔍 Token payload keys:', Object.keys(payload));
        } else {
          console.log('❌ Token is not a valid JWT format');
        }
      } catch (e) {
        console.log('❌ Could not decode token for debugging:', e);
      }
      
      // Check if user data exists and is valid
      // The backend might return user data in different structures
      const hasUserData = data.user || data.id || data.userId || data._id;
      
      // Always try to extract from JWT token first (regardless of user data in response)
      let userIdFromToken = null;
      let roleFromToken = null;
      let departmentFromToken = null;
      if (token) {
        try {
          // Decode JWT token to extract user ID, role, and department
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          
          
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
              break;
            }
          }
          
          // Extract department from various possible field names
          const departmentFields = [
            'department', 'department_id', 'departmentId', 'dept', 'dept_id',
            'departmentId', 'departmentName', 'deptName', 'department_name',
            'userDepartment', 'user_department', 'userDepartmentId', 'user_department_id'
          ];
          
          for (const field of departmentFields) {
            if (tokenPayload[field]) {
              departmentFromToken = tokenPayload[field];
              break;
            }
          }
          
          // If not found in direct fields, check if it's an object with name/id
          if (!departmentFromToken) {
            const departmentObjFields = ['department', 'dept', 'userDepartment'];
            for (const field of departmentObjFields) {
              if (tokenPayload[field] && typeof tokenPayload[field] === 'object') {
                const deptObj = tokenPayload[field];
                departmentFromToken = deptObj.id || deptObj._id || deptObj.name || deptObj.departmentName;
                if (departmentFromToken) {
                  break;
                }
              }
            }
          }
          
          // If still not found, check all fields for department-like values (IDs that match our department mapping)
          if (!departmentFromToken) {
            const departmentIds = Object.keys(DEPARTMENT_ID_MAP);
            
            for (const [key, value] of Object.entries(tokenPayload)) {
              if (departmentIds.includes(value)) {
                departmentFromToken = value;
                break;
              }
            }
            
          }
          
          // Also check nested objects
          if (!roleFromToken && tokenPayload.user && tokenPayload.user.role) {
            roleFromToken = tokenPayload.user.role;
          }
          
          if (!departmentFromToken && tokenPayload.user && tokenPayload.user.department) {
            departmentFromToken = tokenPayload.user.department;
          }
          
          // Check if user.department is an object
          if (!departmentFromToken && tokenPayload.user && tokenPayload.user.department && typeof tokenPayload.user.department === 'object') {
            const userDept = tokenPayload.user.department;
            departmentFromToken = userDept.id || userDept._id || userDept.name;
          }
          
          // Check profile object
          if (!roleFromToken && tokenPayload.profile && tokenPayload.profile.role) {
            roleFromToken = tokenPayload.profile.role;
          }
          
          if (!departmentFromToken && tokenPayload.profile && tokenPayload.profile.department) {
            departmentFromToken = tokenPayload.profile.department;
          }
          
          // Check data object
          if (!roleFromToken && tokenPayload.data && tokenPayload.data.role) {
            roleFromToken = tokenPayload.data.role;
          }
          
          if (!departmentFromToken && tokenPayload.data && tokenPayload.data.department) {
            departmentFromToken = tokenPayload.data.department;
          }
          
          
        } catch (error) {
        }
      }
      
      if (!hasUserData && !userIdFromToken) {
        throw new Error('Invalid user data received from server');
      }
      
      // Store user data and token
      const userData = {
        email: email.trim(),
        id: data.user?._id || data.user?.id || data.id || data.userId || data._id || userIdFromToken,
        role: roleFromToken || data.user?.role || data.role || 'User', // Prioritize role from token
        department: departmentFromToken || 
                   data.user?.is_user_exists?.department || 
                   data.user?.department || 
                   data.department || 
                   null, // Include department from nested structure
        name: data.user?.name || data.name || email.trim().split('@')[0], // Use email prefix as name if not provided
        subscription_status: data.user?.subscription_status || data.subscription_status,
        ...data.user, // Include any additional user data from API response
        ...data // Include any additional data from API response
      };
      
      // Override role with token role if found (highest priority)
      if (roleFromToken) {
        userData.role = roleFromToken;
      }
      
      // Override department with token department if found (highest priority)
      if (departmentFromToken) {
        userData.department = departmentFromToken;
      }
      
      
      
      // If we still don't have a role, try fallback methods
      if (!userData.role || userData.role === 'User') {
        
        // Fallback: Check if this is a known admin user by email or ID
        const adminEmails = ['admin@trendora.com', 'admin@example.com'];
        const adminIds = ['68d7c56edf7fdc2e353c5e6b']; // Add known admin IDs here
        
        if (adminEmails.includes(userData.email) || adminIds.includes(userData.id)) {
          userData.role = 'Admin';
        } else {
          // Try to fetch from database if endpoint exists
          try {
            const userDetails = await userApiService.getUserDetails(userData.id);
            
            if (userDetails && userDetails.role) {
              userData.role = userDetails.role;
            }
            if (userDetails && userDetails.department) {
              userData.department = userDetails.department;
            }
          } catch (error) {
            // Keep default role if we can't determine it
            userData.role = 'Employee';
          }
        }
      }
      
      // If we still don't have department, try to fetch it from API
      if (!userData.department && userData.id) {
        try {
          const userDetails = await userApiService.getUserDetails(userData.id);
          
          if (userDetails && userDetails.department) {
            userData.department = userDetails.department;
          }
        } catch (error) {
        }
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store token (already extracted above)
      localStorage.setItem('token', token);
      
      console.log('Login successful. Token stored:', token?.substring(0, 20) + '...');
      console.log('Token verification - stored token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('Final user data with role:', userData);
      
      return data;
    } catch (error) {
      console.log('=== Login Error Details ===');
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error message:', error.message);
      console.log('=========================');
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      // First, try to extract message from response data (highest priority)
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Try various possible error message fields
        const possibleMessageFields = [
          'message', 'error', 'msg', 'errorMessage', 'error_message',
          'detail', 'details', 'description'
        ];
        
        for (const field of possibleMessageFields) {
          if (responseData[field] && typeof responseData[field] === 'string') {
            errorMessage = responseData[field];
            console.log(`Found error message in field '${field}':`, errorMessage);
            break;
          }
        }
      }
      
      // Replace generic backend error messages with user-friendly ones
      const genericErrors = [
        'internal server error',
        'Internal server error',
        'Internal Server Error',
        'INTERNAL_SERVER_ERROR',
        'server error',
        'Server error'
      ];
      
      if (genericErrors.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase()))) {
        console.log('Replacing generic backend error with user-friendly message');
        // For 400 status with generic error, it's likely invalid credentials
        if (error.response?.status === 400) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = 'Server error. Please try again later or contact support.';
        }
      }
      
      // If no message found in response, handle by status code
      if (errorMessage === 'Login failed. Please try again.') {
        if (error.response?.status === 400) {
          // Handle validation errors from the server
          const errorData = error.response.data;
          
          if (errorData.errors) {
            // Handle Joi validation errors
            const errors = errorData.errors;
            if (errors.email) {
              errorMessage = 'Please enter a valid email address';
            } else if (errors.password) {
              errorMessage = 'The password cannot be empty';
            } else {
              errorMessage = Object.values(errors)[0] || 'Please check your input';
            }
          } else {
            errorMessage = 'Invalid input. Please check your credentials.';
          }
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response?.status === 404) {
          errorMessage = 'Login service not found';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection';
        } else if (error.message && !error.message.includes('Request failed')) {
          // Use the error message from our validation or other sources (but not generic axios messages)
          errorMessage = error.message;
        }
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
