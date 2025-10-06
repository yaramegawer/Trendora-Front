import api from '../api/axios';
import { API_CONFIG } from '../config/api.js';

// Helper function to handle API errors and return user-friendly messages
const handleApiError = (error, defaultMessage = 'An error occurred') => {

  let errorMessage = defaultMessage;

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    
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
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Error ${status}: ${defaultMessage}`;
    }
  } else if (error.request) {
    // Request was made but no response received
('Network Error - No response received:', error.request);
    errorMessage = 'Network error. Please check your internet connection.';
  } else {
    // Something else happened
('Request Setup Error:', error.message);
    errorMessage = error.message || defaultMessage;
  }

  return errorMessage;
};

// Employee API functions
export const employeeApi = {
  // Get all employees
  getAllEmployees: async (page = 1, limit = 10) => {
    try {
('API: Fetching employees from', API_CONFIG.ENDPOINTS.HR.EMPLOYEES_HR_DEPT);
('API: Pagination params - Page:', page, 'Limit:', limit);
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.EMPLOYEES_HR_DEPT, {
        params: { page, limit }
      });
('API: Employees response received:', response.data);
      
      // Debug: Log the actual data structure
      if (response.data && response.data.data && response.data.data.length > 0) {
('Debug - First employee from API:', response.data.data[0]);
('Debug - Employee keys:', Object.keys(response.data.data[0]));
('Debug - Employee values:', Object.values(response.data.data[0]));
('Debug - Full response structure:', JSON.stringify(response.data, null, 2));
      }
      
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
('API: Adding employee with data:', employeeData);
('API: Add URL:', API_CONFIG.ENDPOINTS.HR.EMPLOYEES);
('API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}`);
('API: Request headers will include token');
      
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.EMPLOYEES, employeeData);
('API: Add response status:', response.status);
('API: Add response headers:', response.headers);
('API: Add response data:', response.data);
      
      // Check if the response indicates success
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add employee';
('API: Backend returned success: false:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
('API: Add error details:', error);
('API: Error response:', error.response?.data);
('API: Error status:', error.response?.status);
      
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
('API: Updating employee with ID:', id);
('API: Update URL:', `${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
('API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
('API: Employee data being sent:', employeeData);
      
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`, employeeData);
('API: Update response status:', response.status);
('API: Update response data:', response.data);
      
      // Check if the response indicates success
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update employee';
('API: Backend returned success: false:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
('API: Update error details:', error);
('API: Error response:', error.response?.data);
('API: Error status:', error.response?.status);
      
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
('API: Deleting employee with ID:', id);
('API: Delete URL:', `${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.EMPLOYEES}/${id}`);
('API: Delete response:', response.data);
      return response.data;
    } catch (error) {
('API: Delete error:', error);
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
('🔍 API: Fetching departments from', API_CONFIG.ENDPOINTS.HR.DEPARTMENTS);
('🔍 API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.DEPARTMENTS}`);
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`${API_CONFIG.ENDPOINTS.HR.DEPARTMENTS}?t=${timestamp}`);
('🔍 API: Response status:', response.status);
('🔍 API: Response data:', response.data);
('🔍 API: Response headers:', response.headers);
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to fetch departments';
('❌ API: Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Extract data from the response structure
      if (response.data && response.data.success === true && response.data.data) {
('✅ API: Departments data extracted:', response.data.data);
('✅ API: Number of departments:', response.data.data.length);
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      // Fallback to direct response data (for backward compatibility)
('⚠️ API: Using direct response data:', response.data);
('⚠️ API: Direct response type:', typeof response.data);
('⚠️ API: Direct response is array:', Array.isArray(response.data));
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
('❌ API: Department fetch error:', error);
      const errorMessage = handleApiError(error, 'Failed to fetch departments');
      throw new Error(errorMessage);
    }
  },

  // Add new department
  addDepartment: async (departmentData) => {
    try {
('API: Adding department with data:', departmentData);
('API: Department name being sent:', departmentData.name);
('API: Add department URL:', API_CONFIG.ENDPOINTS.HR.DEPARTMENTS);
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.DEPARTMENTS, departmentData);
('API: Add department response:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add department';
('API: Backend returned success: false:', errorMessage);
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
('API: Backend returned success: false:', errorMessage);
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
('API: Backend returned success: false:', errorMessage);
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
('API: Fetching leaves from', API_CONFIG.ENDPOINTS.HR.LEAVES);
('API: Pagination params - Page:', page, 'Limit:', limit);
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.LEAVES, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
('API: Leaves response received:', response.data);
      
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
('API: Updating leave status with ID:', id);
('API: Leave data being sent:', leaveData);
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.LEAVES}/${id}`, leaveData);
('API: Update leave status response:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update leave status';
('API: Backend returned success: false:', errorMessage);
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
('API: Adding leave with data:', leaveData);
('API: Add leave URL:', API_CONFIG.ENDPOINTS.HR.LEAVES);
      const response = await api.post(API_CONFIG.ENDPOINTS.HR.LEAVES, leaveData);
('API: Add leave response:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to add leave';
('API: Backend returned success: false:', errorMessage);
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
('API: Deleting leave with ID:', id);
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.LEAVES}/${id}`);
('API: Delete leave response:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete leave';
('API: Backend returned success: false:', errorMessage);
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
('API: Fetching payroll from', API_CONFIG.ENDPOINTS.HR.PAYROLL);
('API: Pagination params - Page:', page, 'Limit:', limit);
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.PAYROLL, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
('API: Payroll response received:', response.data);
      
      // Debug: Log the actual data structure
      if (response.data && response.data.data && response.data.data.length > 0) {
('Debug - First payroll record from API:', response.data.data[0]);
('Debug - Payroll keys:', Object.keys(response.data.data[0]));
('Debug - Payroll employeeId field:', response.data.data[0].employeeId);
('Debug - Full response structure:', JSON.stringify(response.data, null, 2));
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
('API: Generating payslip for employee ID:', id);
('API: Payroll data being sent:', payrollData);
      const response = await api.post(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`, payrollData);
('API: Generate payslip response:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to generate payslip';
('API: Backend returned success: false:', errorMessage);
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
('API: Updating payroll with ID:', id);
('API: Payroll data being sent:', payrollData);
('API: Update URL:', `${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
('API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
      
      const response = await api.put(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`, payrollData);
('API: Update payroll response status:', response.status);
('API: Update payroll response headers:', response.headers);
('API: Update payroll response data:', response.data);
('API: Full response object:', response);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to update payroll';
('API: Backend returned success: false:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
('API: Update payroll error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      const errorMessage = handleApiError(error, 'Failed to update payroll');
      throw new Error(errorMessage);
    }
  },

  // Delete payroll
  deletePayroll: async (id) => {
    try {
('API: Deleting payroll with ID:', id);
('API: Delete URL:', `${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
('API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
      
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.PAYROLL}/${id}`);
('API: Delete payroll response status:', response.status);
('API: Delete payroll response data:', response.data);
      
      // Check if the response indicates an error even with 200 status
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete payroll';
('API: Backend returned success: false:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error) {
('API: Delete payroll error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
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
('API: Fetching attendance from', API_CONFIG.ENDPOINTS.HR.ATTENDANCE);
('API: Pagination params - Page:', page, 'Limit:', limit);
      const response = await api.get(API_CONFIG.ENDPOINTS.HR.ATTENDANCE, {
        params: { 
          page, 
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
('API: Attendance response received:', response.data);
      
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
('🔍 API: Deleting attendance record with ID:', id);
('🔍 API: Delete URL:', `${API_CONFIG.ENDPOINTS.HR.ATTENDANCE}/${id}`);
('🔍 API: Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HR.ATTENDANCE}/${id}`);
      
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.HR.ATTENDANCE}/${id}`);
('🔍 API: Delete response status:', response.status);
('🔍 API: Delete response headers:', response.headers);
('🔍 API: Delete response data:', response.data);
      
      // Check if response indicates an error
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Failed to delete attendance record';
('❌ API: Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }
      
('✅ API: Delete successful');
      return response.data;
    } catch (error) {
('❌ API: Delete error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      const errorMessage = handleApiError(error, 'Failed to delete attendance record');
      throw new Error(errorMessage);
    }
  }
};