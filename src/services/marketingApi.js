import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api({ url: endpoint, ...options });
    
    // Handle backend response format: {success: true, data: [...]}
    if (response.data && response.data.success === true) {
      return response.data.data || response.data;
    } else if (response.data && response.data.success === false) {
      // Handle specific "Page not found" errors gracefully
      if (response.data.message === 'Page not found') {
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
      throw new Error('Forbidden. You may not have the required permissions (Admin role required).');
    } else if (error.response?.status === 400) {
      throw new Error('Bad request. Please check your data format.');
    } else {
      throw new Error(`API Error: ${error.message}`);
    }
  }
};

// Employee API functions
export const marketingEmployeeApi = {
  // Get all Marketing employees
  getAllEmployees: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEES);
  },

  // Update employee rating
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEE_RATING.replace(':id', id);
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ratingData
    });
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEE_RATING.replace(':id', id);
    return await apiCall(endpoint);
  }
};

// Project API functions
export const marketingProjectApi = {
  // Get all Marketing projects
  getAllProjects: async (page = 1, limit = 10) => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.PROJECTS, {
        method: 'GET',
        params: { page, limit }
      });
    } catch (error) {
      // Return empty array as fallback
      return [];
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.PROJECTS, {
        method: 'POST',
        data: projectData
      });
    } catch (error) {
      if (error.message.includes('Page not found')) {
        throw new Error('Digital Marketing projects endpoint not found. Please check if the backend route is properly configured at /api/digitalMarketing/projects');
      }
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.PROJECTS}/${id}`;
    
    try {
      return await apiCall(endpoint, {
        method: 'PUT',
        data: projectData
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.PROJECTS}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};

// Ticket API functions
export const marketingTicketApi = {
  // Get all Marketing tickets
  getAllTickets: async () => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.TICKETS);
    } catch (error) {
      return []; // Return empty array as fallback
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.TICKETS, {
      method: 'POST',
      data: ticketData
    });
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ticketData
    });
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};

// Leave API functions
export const marketingLeaveApi = {
  // Get employee leaves
  getEmployeeLeaves: async () => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.LEAVES);
    } catch (error) {
      return []; // Return empty array as fallback
    }
  },

  // Submit employee leave
  submitEmployeeLeave: async (leaveData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.LEAVES, {
      method: 'POST',
      data: leaveData
    });
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.LEAVES}/${id}`;
    return await apiCall(endpoint, {
      method: 'PUT',
      data: leaveData
    });
  },

  // Delete leave
  deleteLeave: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.LEAVES}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};