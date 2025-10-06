import api from '../api/axios';
import { API_CONFIG } from '../config/api';

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
    });
    return response.data;
  } catch (error) {
    // Silently handle 403 errors without throwing
    if (error.response?.status === 403) {
      return [];
    }
    (`Operation API Error to ${endpoint}:`, error);
    throw error;
  }
};

// Employee API functions
export const operationEmployeeApi = {
  // Get all Operation employees
  getAllEmployees: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.EMPLOYEES);
  },

  // Rate employee
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.EMPLOYEE_RATE.replace(':id', id);
    return await apiCall(endpoint, {
      method: 'PUT',
      data: ratingData,
    });
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.GET_RATE.replace(':id', id);
    return await apiCall(endpoint);
  },
};

// Campaign API functions
export const operationCampaignApi = {
  // Get all campaigns
  getAllCampaigns: async (page = 1, limit = 10) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
      method: 'GET',
      params: { page, limit }
    });
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
      method: 'POST',
      data: campaignData,
    });
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS}/${id}`, {
      method: 'PUT',
      data: campaignData,
    });
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Leave API functions
export const operationLeaveApi = {
  // Get all leaves
  getAllLeaves: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.LEAVES);
  },

  // Get leaves for specific employee (authenticated user)
  getEmployeeLeaves: async () => {
    try {
('🌐 Operation Employee Leaves API Call: /dashboard/leaves');
      const response = await apiCall('/dashboard/leaves', {
        method: 'GET',
      });
('📡 Operation Employee Leaves API Response:', response);
      return response;
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
('❌ Operation Employee Leaves API Error:', error);
      throw error;
    }
  },

  // Submit leave for specific employee (authenticated user)
  submitEmployeeLeave: async (leaveData) => {
    try {
('🌐 Operation Employee Submit Leave API Call: /dashboard/leaves');
('📤 Operation Employee Leave Data:', leaveData);
      const response = await apiCall('/dashboard/leaves', {
        method: 'POST',
        data: leaveData,
      });
('📡 Operation Employee Submit Leave API Response:', response);
      return response;
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
('❌ Operation Employee Submit Leave API Error:', error);
      throw error;
    }
  },

  // Add new leave
  addLeave: async (leaveData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.LEAVES, {
      method: 'POST',
      data: leaveData,
    });
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.LEAVES}/${id}`, {
      method: 'PUT',
      data: leaveData,
    });
  },

  // Delete leave
  deleteLeave: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.LEAVES}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Ticket API functions
export const operationTicketApi = {
  // Add new ticket
  addTicket: async (ticketData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.TICKETS, {
      method: 'POST',
      data: ticketData,
    });
  },

  // Get all tickets
  getAllTickets: async () => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.TICKETS);
  },

  // Update ticket status
  updateTicket: async (id, ticketData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.TICKETS}/${id}`, {
      method: 'PUT',
      data: ticketData,
    });
  },

  // Delete ticket
  deleteTicket: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.TICKETS}/${id}`, {
      method: 'DELETE',
    });
  },
};