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
        errorMessage = data.message || 'Internal server error. Please try again later.';
        // Internal Server Error Details logged
        // Return a more user-friendly message for internal server errors
        return 'internal server error';
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
      
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.message || 'Authentication required. Please log in first.';
        throw new Error(errorMessage);
      }
      
      // Handle duplicate email error specifically
      const errorMessage = error.response?.data?.message || error.message || '';
      if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
        throw new Error('Can\'t add this email because it already exists');
      }
      
      // Handle other specific error messages from backend
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      
      const fallbackErrorMessage = handleApiError(error, 'Failed to add employee');
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
        hireDate: employeeData.hireDate || employeeData.hire_date || employeeData.created_at || ''
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
      
      // Handle duplicate email error specifically
      const errorMessage = error.response?.data?.message || error.message || '';
      if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
        throw new Error('Can\'t update this email because it already exists');
      }
      
      // Handle other specific error messages from backend
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      
      const fallbackErrorMessage = handleApiError(error, 'Failed to update employee');
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