import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Helper function for API calls (no console errors for GET)
const apiCall = async (endpoint, options = {}) => {
  try {
    const method = (options.method || 'GET').toUpperCase();
    const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const response = await api({ url: endpoint, method, data: options.data, params: options.params });

    const status = response?.status;
    if (status >= 200 && status < 300) {
      return response.data;
    }

    if (!isMutationRequest) {
      // For GET: return empty, suppressing console errors
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    const message =
      response?.data?.message ||
      (status === 400
        ? 'Invalid data. Please check your input.'
        : status === 403
        ? 'Access denied for this department.'
        : status === 404
        ? 'Resource not found'
        : status === 500
        ? 'Server error. Please try again later.'
        : 'An error occurred. Please try again.');
    throw new Error(message);
  } catch (error) {
    const method = (options.method || 'GET').toUpperCase();
    const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    if (!isMutationRequest) {
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    throw new Error(error?.message || 'Network error. Please try again.');
  }
};

// Employee API functions
export const itEmployeeApi = {
  // Get all IT employees
  getAllEmployees: async () => {
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.EMPLOYEES);
    // For non-paginated endpoints, return just the data array
    return response.data || response;
  },

  // Update employee rating
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.EMPLOYEE_RATING.replace(':id', id);
    const response = await apiCall(endpoint, {
      method: 'PUT',
      data: ratingData
    });
    return response.data || response;
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.EMPLOYEE_RATING.replace(':id', id);
    const response = await apiCall(endpoint);
    return response.data || response;
  }
};

// Project API functions
export const itProjectApi = {
  // Get all IT projects with backend pagination, search, and status filter
  getAllProjects: async (page = 1, limit = 10, status = null, search = null) => {
    try {
        ('📁 Getting IT projects:', { page, limit, status, search });
      
      // Create request params
      const params = { page, limit };
      if (status && status !== 'all') {
        params.status = status;
      }
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }
      
        ('📁 Calling API with params:', params);
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'GET',
        params
      });
      
        ('📁 API response received:', response);
      
      // Return the full response to preserve pagination info (total, page, limit, totalPages)
      return response;
    } catch (error) {
      // Silent: Error getting projects
      
      // Handle all errors gracefully - return empty data
      if (error.response?.status === 403 || error.response?.status === 404 || error.response?.status === 500) {
          ('ℹ️ Returning empty projects data due to error:', error.response?.status);
        return { success: true, data: [], total: 0, page: page, limit: limit, totalPages: 0 };
      }
      
      // Handle specific ObjectId casting errors gracefully
      if (error.message && error.message.includes('Cast to ObjectId failed')) {
          ('ℹ️ Returning empty projects data due to ObjectId error');
        return { success: true, data: [], total: 0, page: page, limit: limit, totalPages: 0 };
      }
      
      // For other errors, still return empty data instead of crashing
        ('ℹ️ Returning empty projects data for unknown error');
      return { success: true, data: [], total: 0, page: page, limit: limit, totalPages: 0 };
    }
  },

  // Create new project
  createProject: async (projectData) => {
      // Creating project via API
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
      method: 'POST',
      data: projectData
    });
      // Project created successfully
    return result.data || result;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`;
    const response = await apiCall(endpoint, {
      method: 'PUT',
      data: projectData
    });
    return response.data || response;
  },

  // Delete project
  deleteProject: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`;
    const response = await apiCall(endpoint, {
      method: 'DELETE'
    });
    return response.data || response;
  }
};

// Ticket API functions
export const itTicketApi = {
  // Get all IT tickets with backend pagination and status filter
  getAllTickets: async (page = 1, limit = 10, status = null) => {
    try {
        ('🎫 Getting IT tickets:', { page, limit, status });
      
      // Create request params
      const params = { page, limit };
      if (status && status !== 'all') {
        params.status = status;
      }
      
        ('🎫 Calling API with params:', params);
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS, {
        method: 'GET',
        params
      });
      
        ('🎫 API response received:', response);
      
      // Return the full response to preserve pagination info (total, page, limit, totalPages)
      return response;
    } catch (error) {
      // Silent: Error getting tickets
      
      // Handle all errors gracefully - return empty data
      // The apiCall already handles 403, 404, 500, but just in case
      if (error.response?.status === 403 || error.response?.status === 404 || error.response?.status === 500) {
          ('ℹ️ Returning empty tickets data due to error:', error.response?.status);
        return { success: true, data: [], total: 0, page: page, limit: limit, totalPages: 0 };
      }
      
      // For other errors, still return empty data instead of crashing
        ('ℹ️ Returning empty tickets data for unknown error');
      return { success: true, data: [], total: 0, page: page, limit: limit, totalPages: 0 };
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS, {
      method: 'POST',
      data: ticketData
    });
    return response.data || response;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`;
    const response = await apiCall(endpoint, {
      method: 'PUT',
      data: ticketData
    });
    return response.data || response;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`;
    const response = await apiCall(endpoint, {
      method: 'DELETE'
    });
    return response.data || response;
  }
};

// Leave API functions
export const itLeaveApi = {
  // Get all department leaves
  getDepartmentLeaves: async (departmentId, page = 1, limit = 10) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.DEPARTMENT_LEAVES.replace(':departmentId', departmentId);
    const response = await apiCall(endpoint, {
      method: 'GET',
      params: { page, limit }
    });
    return response;
  },

  // Get employee leaves (fallback method)
  getEmployeeLeaves: async () => {
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES);
    return response;
  },

  // Submit employee leave
  submitEmployeeLeave: async (leaveData) => {
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES, {
      method: 'POST',
      data: leaveData
    });
    return response.data || response;
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.UPDATE_LEAVE.replace(':id', id);
    const response = await apiCall(endpoint, {
      method: 'PUT',
      data: leaveData
    });
    return response.data || response;
  },

  // Delete leave
  deleteLeave: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.DELETE_LEAVE.replace(':id', id);
    const response = await apiCall(endpoint, {
      method: 'DELETE'
    });
    return response.data || response;
  }
};
