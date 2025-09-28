import api from '../api/axios';
import { API_CONFIG } from '../config/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    console.log('🌐 IT API Call:', endpoint, options);
    const response = await api({ url: endpoint, ...options });
    console.log('📡 IT API Raw Response:', response);
    console.log('📡 IT API Response Data:', response.data);
    console.log('📡 IT API Response Status:', response.status);
    
    // Handle backend response format: {success: true, data: [...]}
    if (response.data && response.data.success === true) {
      console.log('✅ Success response, extracting data:', response.data.data);
      console.log('✅ Data type:', typeof response.data.data);
      console.log('✅ Data isArray:', Array.isArray(response.data.data));
      console.log('✅ Data length:', response.data.data?.length);
      return response.data.data || response.data;
    } else if (response.data && response.data.success === false) {
      console.log('❌ Backend returned success: false');
      throw new Error(response.data.message || 'API request failed');
    }
    
    console.log('📤 Returning response data:', response.data);
    return response.data || response;
  } catch (error) {
    console.error('❌ IT API Error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};

// Employee API functions
export const itEmployeeApi = {
  // Get all IT employees
  getAllEmployees: async () => {
    console.log('🚀 IT API: Calling getAllEmployees...');
    console.log('🚀 Endpoint:', API_CONFIG.ENDPOINTS.IT.EMPLOYEES);
    console.log('🚀 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IT.EMPLOYEES}`);
    return await apiCall(API_CONFIG.ENDPOINTS.IT.EMPLOYEES);
  },

  // Update employee rating
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.EMPLOYEE_RATING.replace(':id', id);
    console.log('🔧 IT API updateRating - Endpoint:', endpoint);
    console.log('🔧 IT API updateRating - Data:', ratingData);
    console.log('🔧 IT API updateRating - Full URL:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ratingData,
    });
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.IT.GET_RATING.replace(':id', id);
    return await apiCall(endpoint);
  },

  // Add new employee (placeholder - would need backend implementation)
  addEmployee: async (employeeData) => {
    // This would need to be implemented in the backend
    console.log('Add employee not implemented yet:', employeeData);
    throw new Error('Add employee API not implemented yet');
  },
};

// Project API functions
export const itProjectApi = {
  // Get all projects
  getAllProjects: async () => {
    try {
      console.log('🌐 IT Project API Call: /it/projects (GET)');
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS);
      console.log('📡 IT Project API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Project API Error:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      console.log('🌐 IT Project API Call: /it/projects (POST)');
      console.log('📤 IT Project Data:', projectData);
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.PROJECTS, {
        method: 'POST',
        data: projectData,
      });
      console.log('📡 IT Project API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Project API Error:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      console.log('🌐 IT Project API Call: /it/projects/' + id + ' (PUT)');
      console.log('📤 IT Project Update Data:', projectData);
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`, {
        method: 'PUT',
        data: projectData,
      });
      console.log('📡 IT Project API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Project API Error:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      console.log('🌐 IT Project API Call: /it/projects/' + id + ' (DELETE)');
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.IT.PROJECTS}/${id}`, {
        method: 'DELETE',
      });
      console.log('📡 IT Project API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Project API Error:', error);
      throw error;
    }
  },
};

// Ticket API functions
export const itTicketApi = {
  // Get all tickets
  getAllTickets: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.IT.TICKETS);
  },

  // Update ticket status
  updateTicket: async (id, ticketData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`, {
      method: 'PUT',
      data: ticketData,
    });
  },

  // Delete ticket
  deleteTicket: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.IT.TICKETS}/${id}`, {
      method: 'DELETE',
    });
  },

  // Add new ticket (placeholder - would need backend implementation)
  addTicket: async (ticketData) => {
    // This would need to be implemented in the backend
    console.log('Add ticket not implemented yet:', ticketData);
    throw new Error('Add ticket API not implemented yet');
  },
};

// IT Leave API functions
export const itLeaveApi = {
  // Get all IT leaves
  getAllLeaves: async () => {
    try {
      console.log('🌐 IT Leave API Call: /it/leaves');
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES, {
        method: 'GET',
      });
      console.log('📡 IT Leave API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Leave API Error:', error);
      throw error;
    }
  },

  // Add new IT leave
  addLeave: async (leaveData) => {
    try {
      console.log('🌐 IT Leave API Call: /it/leaves (POST)');
      console.log('📤 IT Leave Data:', leaveData);
      const response = await apiCall(API_CONFIG.ENDPOINTS.IT.LEAVES, {
        method: 'POST',
        data: leaveData,
      });
      console.log('📡 IT Leave API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Leave API Error:', error);
      throw error;
    }
  },

  // Update IT leave status
  updateLeaveStatus: async (id, leaveData) => {
    try {
      console.log('🌐 IT Leave API Call: /it/leaves/' + id + ' (PUT)');
      console.log('📤 IT Leave Update Data:', leaveData);
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.IT.LEAVES}/${id}`, {
        method: 'PUT',
        data: leaveData,
      });
      console.log('📡 IT Leave API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Leave API Error:', error);
      throw error;
    }
  },

  // Delete IT leave
  deleteLeave: async (id) => {
    try {
      console.log('🌐 IT Leave API Call: /it/leaves/' + id + ' (DELETE)');
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.IT.LEAVES}/${id}`, {
        method: 'DELETE',
      });
      console.log('📡 IT Leave API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ IT Leave API Error:', error);
      throw error;
    }
  },
};
