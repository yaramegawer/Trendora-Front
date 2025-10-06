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
      throw new Error('Forbidden. You may not have the required permissions.');
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
    return await apiCall(API_CONFIG.ENDPOINTS.IT.EMPLOYEES);
  },

  // Update employee rating
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.EMPLOYEE_RATING.replace(':id', id);
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ratingData
    });
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.EMPLOYEE_RATING.replace(':id', id);
    return await apiCall(endpoint);
  }
};

// Project API functions
export const itProjectApi = {
  // Get all IT projects
  getAllProjects: async (page = 1, limit = 10) => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'GET',
        params: { page, limit }
      });
      return response;
    } catch (error) {
      // Handle specific ObjectId casting errors gracefully
      if (error.message && error.message.includes('Cast to ObjectId failed')) {
        return [];
      }
      
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    console.log('🌐 itProjectApi.createProject called with:', projectData);
    console.log('🌐 API endpoint:', API_CONFIG.ENDPOINTS.IT.PROJECTS);
    console.log('🌐 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IT.PROJECTS}`);
    
    try {
      const result = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'POST',
        data: projectData
      });
      console.log('🌐 itProjectApi.createProject result:', result);
      return result;
    } catch (error) {
      console.error('🌐 itProjectApi.createProject error:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`;
    return await apiCall(endpoint, {
      method: 'PUT',
      data: projectData
    });
  },

  // Delete project
  deleteProject: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};

// Ticket API functions
export const itTicketApi = {
  // Get all IT tickets
  getAllTickets: async (page = 1, limit = 10) => {
    return await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS, {
      method: 'GET',
      params: { page, limit }
    });
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS, {
      method: 'POST',
      data: ticketData
    });
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ticketData
    });
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};

// Leave API functions
export const itLeaveApi = {
  // Get employee leaves
  getEmployeeLeaves: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES);
  },

  // Submit employee leave
  submitEmployeeLeave: async (leaveData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES, {
      method: 'POST',
      data: leaveData
    });
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.LEAVES}/${id}`;
    return await apiCall(endpoint, {
      method: 'PUT',
      data: leaveData
    });
  },

  // Delete leave
  deleteLeave: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.IT.LEAVES}/${id}`;
    return await apiCall(endpoint, {
      method: 'DELETE'
    });
  }
};
