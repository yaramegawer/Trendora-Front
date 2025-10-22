import api from "../api/axios";
import { API_CONFIG } from "../config/api";

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const method = options.method || "GET";

    // For POST, PUT, DELETE requests, throw errors so the user knows something went wrong
    // For GET requests, return empty data to prevent UI crashes
    const isMutationRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(
      method.toUpperCase()
    );

    // Handle 403 errors
    if (status === 403) {
      if (isMutationRequest) {
        throw new Error(
          error.response?.data?.message || "Access denied for this department."
        );
      }
      // For GET requests, silently handle 403 errors
      return [];
    }

    // Handle 400 validation errors
    if (status === 400) {
      if (isMutationRequest) {
        const errorMessage =
          error.response?.data?.message ||
          "Invalid data. Please check your input.";
        throw new Error(errorMessage);
      }
      return [];
    }

    // Handle 404 errors
    if (status === 404) {
      if (isMutationRequest) {
        throw new Error(error.response?.data?.message || "Resource not found");
      }
      return [];
    }

    // Handle 500 errors
    if (status === 500) {
      if (isMutationRequest) {
        throw new Error(
          error.response?.data?.message ||
            "Server error. Please try again later."
        );
      }
      return [];
    }

    // For mutations, throw the error; for GET, return empty data
    if (isMutationRequest) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again."
      );
    }

    // Operation API Error handled - returning empty for GET
    return [];
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
    const params = { page, limit };
    if (status && status !== "all") {
      params.status = status;
    }

    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
      method: "GET",
      params,
    });
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
    return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.LEAVES);
  },

  getDepartmentLeaves: async (departmentId, page = 1, limit = 10) => {
    const endpoint = API_CONFIG.ENDPOINTS.OPERATION.LEAVES.replace(
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
