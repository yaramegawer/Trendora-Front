import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api({ url: endpoint, ...options });
    
    // Handle backend response format: {success: true, data: [...], total: X}
    if (response.data && response.data.success === true) {
      // Return the full response data object to preserve pagination info (total, page, limit, etc.)
      return response.data;
    } else if (response.data && response.data.success === false) {
      // Handle specific ObjectId casting errors gracefully
      if (response.data.message && response.data.message.includes('Cast to ObjectId failed')) {
        return [];
      }
      
      throw new Error(response.data.message || 'API request failed');
    }
    
    return response.data || response;
  } catch (error) {
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check if the backend route is properly configured.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please check your authentication.');
    } else if (error.response?.status === 403) {
      // Silently handle 403 errors without throwing
      return [];
    } else if (error.response?.status === 400) {
      throw new Error('Bad request. Please check your data format.');
    } else {
      throw new Error(`API Error: ${error.message}`);
    }
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
  // Get all IT projects - fetch all data without pagination
  getAllProjects: async () => {
    try {
      // Fetch with a very high limit to get all data
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'GET',
        params: { page: 1, limit: 10000 } // High limit to get all data
      });
      return response;
    } catch (error) {
      console.error('❌ Error getting projects:', error);
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
      // Handle specific ObjectId casting errors gracefully
      if (error.message && error.message.includes('Cast to ObjectId failed')) {
        return [];
      }
      
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
      // Creating project via API
    
    try {
      const result = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'POST',
        data: projectData
      });
      // Project created successfully
      return result.data || result;
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
      // Project creation error handled
      throw error;
    }
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
  // Get all IT tickets - fetch all data without pagination
  getAllTickets: async () => {
    // Fetch with a very high limit to get all data
    const response = await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS, {
      method: 'GET',
      params: { page: 1, limit: 10000 } // High limit to get all data
    });
    return response;
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
