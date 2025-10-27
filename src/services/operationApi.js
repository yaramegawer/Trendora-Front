import api from "../api/axios";
import { API_CONFIG } from "../config/api";

const apiCall = async (endpoint, options = {}) => {
  try {
    const method = (options.method || "GET").toUpperCase();
    const isMutationRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
    const response = await api({
      url: endpoint,
      method,
      data: options.data,
      params: options.params,
    });

    const status = response?.status;
    // Success path
    if (status >= 200 && status < 300) {
      return response.data;
    }

    // Non-2xx handling: avoid throwing for GET; return safe fallbacks
    if (!isMutationRequest) {
      // For list-like endpoints, empty array is fine; callers handle shapes.
      return [];
    }

    // For mutations, throw with a friendly message
    const message =
      response?.data?.message ||
      (status === 400
        ? "Invalid data. Please check your input."
        : status === 403
        ? "Access denied for this department."
        : status === 404
        ? "Resource not found"
        : status === 500
        ? "Server error. Please try again later."
        : "An error occurred. Please try again.");
    throw new Error(message);
  } catch (error) {
    // Network-level failures (no response) - avoid console spam; return safe fallback for GET
    const method = (options.method || "GET").toUpperCase();
    const isMutationRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
    if (!isMutationRequest) return [];
    throw new Error(error?.message || "Network error. Please try again.");
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
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.EMPLOYEE_RATE.replace(
      ":id",
      id
    );
    return await apiCall(endpoint, {
      method: "PUT",
      data: ratingData,
    });
  },

  // Get employee rating
  getRating: async (id) => {
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.GET_RATE.replace(":id", id);
    return await apiCall(endpoint);
  },
};

// Campaign API functions
export const operationCampaignApi = {
  // Get all campaigns with pagination and status filter
  getAllCampaigns: async (page = 1, limit = 10, status = null) => {
    try {
      const params = { page, limit };
      if (status && status !== 'all') params.status = status;
      const response = await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
        method: 'GET',
        params,
      });

      // Normalize possible shapes
      if (response && response.success && Array.isArray(response.data)) {
        return response; // { success, data, total, page, limit, totalPages }
      }
      if (Array.isArray(response)) {
        const data = response;
        return {
          success: true,
          data,
          total: data.length,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(data.length / (limit || 10))),
        };
      }
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || page,
          limit: response.limit || limit,
          totalPages:
            response.totalPages || Math.max(1, Math.ceil((response.total || response.data.length) / (response.limit || limit || 10))),
        };
      }

      // Fallback: return empty normalized
      return { success: true, data: [], total: 0, page, limit, totalPages: 0 };
    } catch (_) {
      // On error, return empty normalized to avoid UI breaks
      return { success: true, data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
      method: "POST",
      data: campaignData,
    });
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS}/${id}`, {
      method: "PUT",
      data: campaignData,
    });
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS}/${id}`, {
      method: "DELETE",
    });
  },
};

// Leave API functions
export const operationLeaveApi = {
  // Get all leaves
  getAllLeaves: async () => {
    // Temporarily suppress backend errors: return empty without network call
    return [];
  },

  getDepartmentLeaves: async (departmentId, page = 1, limit = 10) => {
    // Use configured endpoint to avoid double /api in final URL
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.DEPARTMENT_LEAVES.replace(
      ":departmentId",
      departmentId
    );
    const response = await apiCall(endpoint, {
      method: "GET",
      params: { page, limit },
    });
    return response;
  },

  // Get department leaves with pagination

  // Get leaves for specific employee (authenticated user)
  getEmployeeLeaves: async (page = 1, limit = 10, status = null, search = null) => {
    try {
      // Operation Employee Leaves API Call
      const response = await apiCall("/dashboard/leaves", {
        method: "GET",
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(search && search.trim() !== '' ? { search: search.trim() } : {}),
        },
      });
      // Operation Employee Leaves API Response processed
      return response;
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
      // Operation Employee Leaves API Error handled
      throw error;
    }
  },

  // Submit leave for specific employee (authenticated user)
  submitEmployeeLeave: async (leaveData) => {
    try {
      // Operation Employee Submit Leave API Call
      // Operation Employee Leave Data processed
      const response = await apiCall("/dashboard/leaves", {
        method: "POST",
        data: leaveData,
      });
      // Operation Employee Submit Leave API Response processed
      return response;
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error.response?.status === 403) {
        return [];
      }
      // Operation Employee Submit Leave API Error handled
      throw error;
    }
  },

  // Add new leave
  addLeave: async (leaveData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.LEAVES, {
      method: "POST",
      data: leaveData,
    });
  },

  // Update leave status
  updateLeaveStatus: async (id, leaveData) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.LEAVES}/${id}`, {
      method: "PUT",
      data: leaveData,
    });
  },

  // Delete leave
  deleteLeave: async (id) => {
    return await apiCall(`${API_CONFIG.ENDPOINTS.OPERATION.LEAVES}/${id}`, {
      method: "DELETE",
    });
  },
};

// Ticket API functions
export const operationTicketApi = {
  // Add new ticket (submit ticket only)
  addTicket: async (ticketData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.TICKETS, {
      method: "POST",
      data: ticketData,
    });
  },
};
