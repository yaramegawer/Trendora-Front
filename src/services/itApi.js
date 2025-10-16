import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
      ('🌐 IT API Call:', { endpoint, options });
    const response = await api({ url: endpoint, ...options });
      ('📥 IT API Response:', response);
    
    // Handle backend response format: {success: true, data: [...], total: X}
    if (response.data && response.data.success === true) {
        ('✅ IT API Success response with pagination:', {
        dataLength: response.data.data?.length,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages
      });
      // Return the full response data object to preserve pagination info (total, page, limit, etc.)
      return response.data;
    } else if (response.data && response.data.success === false) {
      console.error('❌ IT API Error response:', response.data);
      // Handle specific ObjectId casting errors gracefully
      if (response.data.message && response.data.message.includes('Cast to ObjectId failed')) {
        return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
      
      throw new Error(response.data.message || 'API request failed');
    }
    
      ('⚠️ IT API Unexpected response format:', response.data);
    return response.data || response;
  } catch (error) {
    console.error('❌ IT API Error:', error);
    console.error('❌ IT API Error Response:', error.response);
    console.error('❌ IT API Error Data:', error.response?.data);
    console.error('❌ IT API Error Status:', error.response?.status);
    console.error('❌ IT API Error Message:', error.response?.data?.message || error.message);
    
    const status = error.response?.status;
    const method = options.method || 'GET';
      ('🔍 Checking status code:', status, 'Method:', method, 'Type:', typeof status);
    
    // For POST, PUT, DELETE requests, throw errors so the user knows something went wrong
    // For GET requests, return empty data to prevent UI crashes
    const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
    
    if (status === 404) {
      console.error('❌ 404 Not Found - Backend response:', error.response?.data);
      if (isMutationRequest) {
        throw new Error(error.response?.data?.message || 'Resource not found');
      }
        ('ℹ️ Returning empty data for 404 (GET request)');
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    if (status === 401) {
      console.error('❌ 401 Unauthorized - Re-throwing for auth handling');
      throw new Error('Unauthorized. Please check your authentication.');
    }
    
    if (status === 403) {
      if (isMutationRequest) {
        throw new Error(error.response?.data?.message || 'Access denied for this department.');
      }
        ('🔒 403 Forbidden - returning empty data (GET request)');
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    if (status === 400) {
      console.error('❌ 400 Bad Request - Backend response:', error.response?.data);
      if (isMutationRequest) {
        // For mutation requests, throw the error so validation errors are shown
        const errorMessage = error.response?.data?.message || 'Invalid data. Please check your input.';
        throw new Error(errorMessage);
      }
        ('ℹ️ Returning empty data for 400 (GET request)');
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    if (status === 500) {
      console.error('💥 500 Internal Server Error - Backend response:', error.response?.data);
      console.error('💥 Backend error message:', error.response?.data?.message);
      console.error('💥 Backend error details:', error.response?.data?.error);
      if (isMutationRequest) {
        throw new Error(error.response?.data?.message || 'Server error. Please try again later.');
      }
        ('ℹ️ Returning empty data for 500 error (GET request)');
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    // Catch-all: For any other error
    console.error('⚠️ Unhandled error type - status:', status);
    if (isMutationRequest) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred. Please try again.');
    }
      ('ℹ️ Returning empty data for unknown error (GET request)');
    return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
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
      console.error('❌ Error getting projects:', error);
      console.error('❌ Error details:', error.response?.data);
      
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
      console.error('❌ Error getting tickets:', error);
      console.error('❌ Error details:', error.response?.data);
      
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

  // Submit employee leave
  submitEmployeeLeave: async (leaveData) => {
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES, {
      method: 'POST',
      data: leaveData
    });
    return response.data || response;
  },

};
