import api from '../api/axios';
import { API_CONFIG } from '../config/api.js';

// Helper function to handle API errors and return user-friendly messages
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  // handleApiError called

  let errorMessage = defaultMessage;

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    // Server error response processed
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Unauthorized. Please log in again.';
        break;
      case 403:
        // Silently handle 403 errors without throwing
        return [];
      case 404:
        errorMessage = data.message || 'Resource not found.';
        break;
      case 409:
        errorMessage = data.message || 'Conflict. This resource already exists.';
        break;
      case 422:
        errorMessage = data.message || 'Validation error. Please check your input.';
        break;
      case 500:
        // Don't convert to generic message - preserve the actual error message
        // so duplicate email errors can be properly detected
        errorMessage = data.message || data.error || 'Internal server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Error ${status}: ${defaultMessage}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    // Network Error - No response received
    errorMessage = 'Network error. Please check your internet connection.';
  } else {
    // Something else happened
    // Request Setup Error processed
    errorMessage = error.message || defaultMessage;
  }

  // Final error message processed
  return errorMessage;
};

// Employee API functions
export const employeeApi = {
  // Get all employees
  getAllEmployees: async (page = 1, limit = 10) => {
    try {
      
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.EMPLOYEES_HR_DEPT, {
        params: { page, limit }
      });
      
      
      // Debug: Log the actual data structure
     
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch employees';
        throw new Error(errorMessage);
      }
      
      // Return the full response structure for pagination
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch employees');
      throw new Error(errorMessage);
    }
  },

  // Get specific employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch employee details');
      throw new Error(errorMessage);
    }
  },

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      
      
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.EMPLOYEES, employeeData);
      
      
      // Check if the response indicates success
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add employee';
        
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ API: Add employee RAW error:', error);
      console.error('❌ API: Full error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });
      
      // Log the response data in detail
      if (error.response?.data) {
          ('🔍 Response data type:', typeof error.response.data);
          ('🔍 Response data keys:', Object.keys(error.response.data));
          ('🔍 Response data JSON:', JSON.stringify(error.response.data, null, 2));
        
        // Check all possible error fields
          ('🔍 data.message:', error.response.data.message);
          ('🔍 data.error:', error.response.data.error);
          ('🔍 data.msg:', error.response.data.msg);
          ('🔍 data.details:', error.response.data.details);
          ('🔍 data.errorMessage:', error.response.data.errorMessage);
      }
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.message || 'Authentication required. Please log in first.';
        throw new Error(errorMessage);
      }
      
      // IMPORTANT: Check the 'error' field FIRST for duplicate key errors
      // because the backend puts the actual E11000 error in the 'error' field
      // and a generic "internal server error" in the 'message' field
      const backendError = error.response?.data?.error || '';
      const backendMessage = error.response?.data?.message || '';
      const backendMsg = error.response?.data?.msg || '';
      const fallbackMessage = error.message || '';
      
        ('🔍 Backend error field:', backendError);
        ('🔍 Backend message field:', backendMessage);
      
      // First, check if the 'error' field contains duplicate key error
      const lowerBackendError = backendError.toLowerCase();
      const isDuplicateInError = 
        lowerBackendError.includes('e11000') ||
        lowerBackendError.includes('duplicate key') ||
        (lowerBackendError.includes('duplicate') && lowerBackendError.includes('email'));
      
        ('🔍 Is duplicate in error field?', isDuplicateInError);
      
      if (isDuplicateInError) {
          ('✅ Duplicate email detected in error field, throwing specific error');
        throw new Error('Can\'t add this email because it already exists');
      }
      
      // Then check message field for duplicate
      const lowerBackendMessage = backendMessage.toLowerCase();
      const isDuplicateInMessage = 
        lowerBackendMessage.includes('e11000') ||
        lowerBackendMessage.includes('duplicate key') ||
        lowerBackendMessage.includes('already exists') ||
        lowerBackendMessage.includes('already taken') ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('exists')) ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('already')) ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('taken'));
      
        ('🔍 Is duplicate in message field?', isDuplicateInMessage);
      
      if (isDuplicateInMessage) {
          ('✅ Duplicate email detected in message field, throwing specific error');
        throw new Error('Can\'t add this email because it already exists');
      }
      
      // For any other error, prefer a meaningful message over "internal server error"
      let errorMessage = '';
      if (backendError && backendError.trim() && !backendError.toLowerCase().includes('internal server error')) {
        errorMessage = backendError;
      } else if (backendMessage && backendMessage.trim() && !backendMessage.toLowerCase().includes('internal server error')) {
        errorMessage = backendMessage;
      } else if (backendMsg && backendMsg.trim()) {
        errorMessage = backendMsg;
      } else if (fallbackMessage && fallbackMessage.trim()) {
        errorMessage = fallbackMessage;
      }
      
        ('🔍 Final error message to throw:', errorMessage);
      
      // For any other error, throw it as-is if we have a message
      if (errorMessage && errorMessage.trim()) {
          ('⚠️ Throwing backend error message:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Last resort - use handleApiError
      const fallbackErrorMessage = handleApiError(error, 'Failed to add employee');
        ('⚠️ Using fallback error message:', fallbackErrorMessage);
      throw new Error(fallbackErrorMessage);
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
  
      // Validate employee data before sending
      if (!id) {
        throw new Error('Employee ID is required for update');
      }
      
      if (!employeeData || typeof employeeData !== 'object') {
        throw new Error('Employee data is required for update');
      }
      
      // Clean and validate the data - only send fields that the backend expects
      const cleanedData = {
        firstName: employeeData.firstName || employeeData.first_name || '',
        lastName: employeeData.lastName || employeeData.last_name || '',
        email: employeeData.email || '',
        department: employeeData.department || employeeData.departmentId || '',
        status: employeeData.status || 'active',
        phone: employeeData.phone || employeeData.phone_number || '',
        role: employeeData.role || employeeData.user_role || 'Employee',
        hireDate: employeeData.hireDate || employeeData.hire_date || employeeData.created_at || '',
        address: employeeData.address || ''
      };
      
      // Only include documents if they exist and are not empty
      if (employeeData.submittedDocuments && employeeData.submittedDocuments.length > 0) {
        cleanedData.submittedDocuments = employeeData.submittedDocuments;
      }
      if (employeeData.pendingDocuments && employeeData.pendingDocuments.length > 0) {
        cleanedData.pendingDocuments = employeeData.pendingDocuments;
      }
      

      let response;
      try {
        // Try the main employees endpoint first
        response = await api.put(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`, cleanedData);

      } catch (firstError) {

        // Try alternative endpoint if the first one fails
        try {
          response = await api.put(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES_HR_DEPT}/${id}`, cleanedData);
        
        } catch (secondError) {
          
          throw firstError; // Throw the original error
        }
      }
      
      // Check if the response indicates success
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update employee';
       
        throw new Error(errorMessage);
      }
      
     
      return response.data;
    } catch (error) {
      console.error('❌ API: Update employee RAW error:', error);
      console.error('❌ API: Update error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        headers: error.config?.headers
      });
      
      // Handle specific error types
      if (error.response?.data?.message && error.response.data.message.includes('Invalid objectId')) {
        throw new Error('Invalid employee ID. The employee may have been deleted or the ID is corrupted.');
      }
      
      // IMPORTANT: Check the 'error' field FIRST for duplicate key errors
      const backendError = error.response?.data?.error || '';
      const backendMessage = error.response?.data?.message || '';
      const backendMsg = error.response?.data?.msg || '';
      const fallbackMessage = error.message || '';
      
        ('🔍 Update - Backend error field:', backendError);
        ('🔍 Update - Backend message field:', backendMessage);
      
      // First, check if the 'error' field contains duplicate key error
      const lowerBackendError = backendError.toLowerCase();
      const isDuplicateInError = 
        lowerBackendError.includes('e11000') ||
        lowerBackendError.includes('duplicate key') ||
        (lowerBackendError.includes('duplicate') && lowerBackendError.includes('email'));
      
        ('🔍 Update - Is duplicate in error field?', isDuplicateInError);
      
      if (isDuplicateInError) {
          ('✅ Update - Duplicate email detected in error field, throwing specific error');
        throw new Error('Can\'t update this email because it already exists');
      }
      
      // Then check message field for duplicate
      const lowerBackendMessage = backendMessage.toLowerCase();
      const isDuplicateInMessage = 
        lowerBackendMessage.includes('e11000') ||
        lowerBackendMessage.includes('duplicate key') ||
        lowerBackendMessage.includes('already exists') ||
        lowerBackendMessage.includes('already taken') ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('exists')) ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('already')) ||
        (lowerBackendMessage.includes('email') && lowerBackendMessage.includes('taken'));
      
        ('🔍 Update - Is duplicate in message field?', isDuplicateInMessage);
      
      if (isDuplicateInMessage) {
          ('✅ Update - Duplicate email detected in message field, throwing specific error');
        throw new Error('Can\'t update this email because it already exists');
      }
      
      // For any other error, prefer a meaningful message over "internal server error"
      let errorMessage = '';
      if (backendError && backendError.trim() && !backendError.toLowerCase().includes('internal server error')) {
        errorMessage = backendError;
      } else if (backendMessage && backendMessage.trim() && !backendMessage.toLowerCase().includes('internal server error')) {
        errorMessage = backendMessage;
      } else if (backendMsg && backendMsg.trim()) {
        errorMessage = backendMsg;
      } else if (fallbackMessage && fallbackMessage.trim()) {
        errorMessage = fallbackMessage;
      }
      
        ('🔍 Update - Final error message to throw:', errorMessage);
      
      // For any other error, throw it as-is if we have a message
      if (errorMessage && errorMessage.trim()) {
          ('⚠️ Update - Throwing backend error message:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Last resort - use handleApiError
      const fallbackErrorMessage = handleApiError(error, 'Failed to update employee');
        ('⚠️ Update - Using fallback error message:', fallbackErrorMessage);
      throw new Error(fallbackErrorMessage);
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete employee');
      throw new Error(errorMessage);
    }
  }
};

// Department API functions
export const departmentApi = {
  // Get all departments
  getAllDepartments: async () => {
    try {
     // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`${API_CONFIG.ENDPOINTS.HR.DEPARTMENTS}?t=${timestamp}`);
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch departments';
        throw new Error(errorMessage);
      }
      
      // Extract data from the response structure
      if (response.data && response.data.success === true && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      // Fallback to direct response data (for backward compatibility)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch departments');
      throw new Error(errorMessage);
    }
  },

  // Add new department
  addDepartment: async (departmentData) => {
    try {
      
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.DEPARTMENTS, departmentData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add department';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to add department');
      throw new Error(errorMessage);
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.DEPARTMENTS}/${id}`, departmentData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update department';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update department');
      throw new Error(errorMessage);
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.DEPARTMENTS}/${id}`);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete department';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete department');
      throw new Error(errorMessage);
    }
  }
};

// Leave API functions
export const leaveApi = {
  // Get all leaves
  getAllLeaves: async (page = 1, limit = 10) => {
    try {
      
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.LEAVES, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch leaves';
        throw new Error(errorMessage);
      }
      
      // Return the full response structure for pagination
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch leaves');
      throw new Error(errorMessage);
    }
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    try {
      
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.LEAVES}/${id}`, leaveData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update leave status';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update leave status');
      throw new Error(errorMessage);
    }
  },

  // Add new leave
  addLeave: async (leaveData) => {
    try {
      
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.LEAVES, leaveData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add leave';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to add leave');
      throw new Error(errorMessage);
    }
  },

  // Delete leave
  deleteLeave: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.LEAVES}/${id}`);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete leave';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete leave');
      throw new Error(errorMessage);
    }
  }
};

// Payroll API functions
export const payrollApi = {
  // Get all payroll
  getAllPayroll: async (page = 1, limit = 10) => {
    try {
      
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.PAYROLL, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      // Debug: Log the actual data structure
      if (response.data && response.data.data && response.data.data.length > 0) {
      }
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch payroll';
        throw new Error(errorMessage);
      }
      
      // Return the full response structure for pagination
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch payroll');
      throw new Error(errorMessage);
    }
  },

  // Get specific payslip
  getPayslip: async (id) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch payslip');
      throw new Error(errorMessage);
    }
  },

  // Generate payslip
  generatePayslip: async (id, payrollData) => {
    try {
      const response = await api.post(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`, payrollData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to generate payslip';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to generate payslip');
      throw new Error(errorMessage);
    }
  },

  // Update payroll
  updatePayroll: async (id, payrollData) => {
    try {
      
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`, payrollData);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update payroll';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      
      const errorMessage = handleApiError(error, 'Failed to update payroll');
      throw new Error(errorMessage);
    }
  },

  // Delete payroll
  deletePayroll: async (id) => {
    try {
      
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete payroll';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
      
      const errorMessage = handleApiError(error, 'Failed to delete payroll');
      throw new Error(errorMessage);
    }
  }
};

// Attendance API functions
export const attendanceApi = {
  // Get all attendance records with pagination
  getAttendance: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.ATTENDANCE, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch attendance records';
        throw new Error(errorMessage);
      }
      
      // Return the full response structure for pagination
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch attendance records');
      throw new Error(errorMessage);
    }
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    try {
      
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.ATTENDANCE}/${id}`);
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete attendance record';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
    
      const errorMessage = handleApiError(error, 'Failed to delete attendance record');
      throw new Error(errorMessage);
    }
  }
};