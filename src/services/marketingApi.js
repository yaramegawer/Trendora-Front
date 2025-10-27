import api from "../api/axios";
import { API_CONFIG } from "../config/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api({ url: endpoint, ...options });

    // Handle backend response format: {success: true, data: [...]}
    if (response.data && response.data.success === true) {
      // If the backend included pagination metadata (total/page/totalPages),
      // return the full response.data object so callers can read total and page info.
      if (
        response.data.total !== undefined ||
        response.data.page !== undefined ||
        response.data.totalPages !== undefined
      ) {
        return response.data;
      }

      return response.data.data !== undefined
        ? response.data.data
        : response.data;
    } else if (response.data && response.data.success === false) {
      // Handle specific "Page not found" errors gracefully
      if (response.data.message === "Page not found") {
        return [];
      }

      throw new Error(response.data.message || "API request failed");
    }

    return response.data || response;
  } catch (error) {
    const status = error.response?.status;
    // Log server error details to help debug 500 responses (temporary)
    try {
      console.error("API call failed:", {
        endpoint: endpoint,
        status,
        data: error.response?.data,
      });
    } catch {
      // ignore logging errors
    }
    const method = options.method || "GET";

    // For POST, PUT, DELETE requests, throw errors so the user knows something went wrong
    // For GET requests, return empty data to prevent UI crashes
    const isMutationRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(
      method.toUpperCase()
    );

    // Provide more specific error messages
    if (status === 404) {
      if (isMutationRequest) {
        throw new Error(error.response?.data?.message || "Resource not found");
      }
      throw new Error(
        "API endpoint not found. Please check if the backend route is properly configured."
      );
    } else if (status === 401) {
      throw new Error("Unauthorized. Please check your authentication.");
    } else if (status === 403) {
      if (isMutationRequest) {
        throw new Error(
          error.response?.data?.message || "Access denied for this department."
        );
      }
      // For GET requests, silently handle 403 errors
      return [];
    } else if (status === 400) {
      if (isMutationRequest) {
        const errorMessage =
          error.response?.data?.message ||
          "Invalid data. Please check your input.";
        throw new Error(errorMessage);
      }
      throw new Error("Bad request. Please check your data format.");
    } else if (status === 500) {
      if (isMutationRequest) {
        throw new Error(
          error.response?.data?.message ||
            "Server error. Please try again later."
        );
      }
      return [];
    } else {
      if (isMutationRequest) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "An error occurred. Please try again."
        );
      }
      throw new Error(`API Error: ${error.message}`);
    }
  }
};

// Employee API functions
export const marketingEmployeeApi = {
  // Get all Marketing employees
  getAllEmployees: async () => {
    // Let apiCall propagate errors so callers (hooks) can handle them as needed
    const response = await apiCall(API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEES);
    "✅ Marketing Employees API Response:", response;
    return response;
  },

  // Update employee rating
  updateRating: async (id, ratingData) => {
    const endpoint = API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEE_RATING.replace(
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
    const endpoint = API_CONFIG.ENDPOINTS.MARKETING.EMPLOYEE_RATING.replace(
      ":id",
      id
    );
    return await apiCall(endpoint);
  },
};

// Project API functions
export const marketingProjectApi = {
  // Get all Marketing projects
  getAllProjects: async (page = 1, limit = 10) => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.PROJECTS, {
        method: "GET",
        params: { page, limit },
      });
    } catch {
      // Return empty array as fallback
      return [];
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.PROJECTS, {
        method: "POST",
        data: projectData,
      });
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error?.response?.status === 403) {
        return [];
      }
      if (error?.message && error.message.includes("Page not found")) {
        throw new Error(
          "Digital Marketing projects endpoint not found. Please check if the backend route is properly configured at /api/digitalMarketing/projects"
        );
      }
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.PROJECTS}/${id}`;

    try {
      return await apiCall(endpoint, {
        method: "PUT",
        data: projectData,
      });
    } catch (error) {
      // Silently handle 403 errors without throwing
      if (error?.response?.status === 403) {
        return [];
      }
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.PROJECTS}/${id}`;
    return await apiCall(endpoint, {
      method: "DELETE",
    });
  },
};

// Ticket API functions
export const marketingTicketApi = {
  // Get all Marketing tickets
  getAllTickets: async () => {
    try {
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.TICKETS);
    } catch {
      return []; // Return empty array as fallback
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.TICKETS, {
      method: "POST",
      data: ticketData,
    });
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: "PUT",
      data: ticketData,
    });
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETING.TICKETS}/${id}`;
    return await apiCall(endpoint, {
      method: "DELETE",
    });
  },
};

// Leave API functions
export const marketingLeaveApi = {
  // Get employee leaves. Supports optional departmentId and server-side status filtering.
  getEmployeeLeaves: async (
    departmentId = null,
    page = 1,
    limit = 10,
    status = null,
    search = null
  ) => {
    try {
      const buildParams = (p = page, l = limit, s = status, q = search) => {
        const params = { page: p, limit: l };
        if (s && s !== "all") params.status = s;
        if (q && String(q).trim().length > 0) params.search = String(q).trim();
        return params;
      };

      // If we have a department-scoped endpoint, try it first
      if (departmentId && API_CONFIG.ENDPOINTS.MARKETING.DEPARTMENT_LEAVES) {
        const endpoint =
          API_CONFIG.ENDPOINTS.MARKETING.DEPARTMENT_LEAVES.replace(
            ":departmentId",
            encodeURIComponent(departmentId)
          );

        try {
          const resp = await api.get(endpoint, { params: buildParams() });
          return resp.data;
        } catch (err) {
          const httpStatus = err.response?.status;
          const data = err.response?.data;
          console.warn(
            "Department-scoped marketing leaves endpoint failed, will attempt fallback:",
            endpoint,
            httpStatus,
            data,
            err
          );

          // If backend indicated missing route (500 'Page not found' or internal server error), fall back
          if (
            httpStatus === 500 &&
            data &&
            (data.error === "Page not found" ||
              (typeof data.message === "string" &&
                data.message.toLowerCase().includes("internal server error")))
          ) {
            return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.LEAVES, {
              method: "GET",
              params: buildParams(),
            });
          }

          // Otherwise rethrow
          throw err;
        }
      }

      // Generic marketing leaves endpoint
      return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.LEAVES, {
        method: "GET",
        params: buildParams(),
      });
    } catch (error) {
      console.error(
        "marketingLeaveApi.getEmployeeLeaves error:",
        error?.response?.status,
        error?.response?.data,
        error
      );
      //throw error;
    }
  },

  // Submit employee leave
  submitEmployeeLeave: async (leaveData) => {
    return await apiCall(API_CONFIG.ENDPOINTS.MARKETING.LEAVES, {
      method: "POST",
      data: leaveData,
    });
  },

  // Update leave status - prefer Digital Marketing endpoint first, then generic marketing, then global
  updateLeaveStatus: async (id, leaveData) => {
    const safeId = encodeURIComponent(id);
    // Try Digital Marketing specific endpoint first if configured
    if (API_CONFIG.ENDPOINTS.MARKETING.UPDATE_LEAVE) {
      const dmEndpoint = API_CONFIG.ENDPOINTS.MARKETING.UPDATE_LEAVE.replace(
        ":id",
        safeId
      );
      try {
        return await apiCall(dmEndpoint, { method: "PUT", data: leaveData });
      } catch (err) {
        // fall through to next option
      }
    }

    // Fallback to generic marketing leaves endpoint
    try {
      const marketingEndpoint = `${API_CONFIG.ENDPOINTS.MARKETING.LEAVES}/${safeId}`;
      return await apiCall(marketingEndpoint, { method: "PUT", data: leaveData });
    } catch (err) {
      // Final fallback to global leaves endpoint
      const globalEndpoint = `/leaves/${safeId}`;
      return await apiCall(globalEndpoint, { method: "PUT", data: leaveData });
    }
  },

  // Delete leave - prefer global /leaves/:id then fall back
  deleteLeave: async (id) => {
    const safeId = encodeURIComponent(id);
    // Try Digital Marketing specific endpoint first
    if (API_CONFIG.ENDPOINTS.MARKETING.DELETE_LEAVE) {
      const dmEndpoint = API_CONFIG.ENDPOINTS.MARKETING.DELETE_LEAVE.replace(
        ":id",
        safeId
      );
      try {
        return await apiCall(dmEndpoint, { method: "DELETE" });
      } catch (err) {
        // fall through to next option
      }
    }

    // Fallback to generic marketing leaves endpoint
    try {
      const marketingEndpoint = `${API_CONFIG.ENDPOINTS.MARKETING.LEAVES}/${safeId}`;
      return await apiCall(marketingEndpoint, { method: "DELETE" });
    } catch (err) {
      // Final fallback to global leaves endpoint
      const globalEndpoint = `/leaves/${safeId}`;
      return await apiCall(globalEndpoint, { method: "DELETE" });
    }
  },
};

// Customer API functions
export const marketingCustomerApi = {
  // Get all customers with pagination
  getAllCustomers: async (page = 1, limit = 10) => {
    try {
      const response = await api({
        url: API_CONFIG.ENDPOINTS.MARKETING.CUSTOMERS,
        method: "GET",
        params: { page, limit },
      });

      "📡 Get All Customers API Response:", response.data;

      // Handle backend response format: { success: true, data: [...], total, page, limit, totalPages }
      if (response.data && response.data.success === true) {
        "✅ Success response detected for customers, returning:",
          {
            dataLength: response.data.data?.length || 0,
            total: response.data.total,
            page: response.data.page,
            totalPages: response.data.totalPages,
          };
        return {
          data: response.data.data || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || limit,
          totalPages: response.data.totalPages || 0,
        };
      } else if (response.data && Array.isArray(response.data)) {
        "⚠️ Array response detected for customers, returning:",
          response.data.length,
          "items";
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          limit: response.data.length,
          totalPages: 1,
        };
      }

      // Silent: Unexpected customers response format
      return { data: [], total: 0, page: 1, limit, totalPages: 0 };
    } catch (error) {
      // Surface error to caller for debugging
      console.error(
        "marketingCustomerApi.getAllCustomers error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  // Get projects for a specific customer (with pagination and status filter)
  getCustomerProjects: async (
    customerName,
    page = 1,
    limit = 10,
    status = null
  ) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.MARKETING.CUSTOMER_PROJECTS.replace(
        ":customerName",
        encodeURIComponent(customerName)
      );

      // Build query params
      const params = { page, limit };
      if (status && status !== "all") {
        params.status = status;
      }

      "🔗 Calling API endpoint:", endpoint, "with params:", params;

      const response = await api({
        url: endpoint,
        method: "GET",
        params,
      });

      "📡 Raw API response:", response.data;

      // Handle backend response format: { success: true, data: [...], total, page, limit, totalPages }
      if (response.data && response.data.success === true) {
        "✅ Success response detected, returning:",
          {
            dataLength: response.data.data?.length || 0,
            total: response.data.total,
            page: response.data.page,
            totalPages: response.data.totalPages,
          };
        return {
          data: response.data.data || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || limit,
          totalPages: response.data.totalPages || 0,
        };
      } else if (response.data && Array.isArray(response.data)) {
        "⚠️ Array response detected, returning:", response.data.length, "items";
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          limit: response.data.length,
          totalPages: 1,
        };
      }

      // Silent: Unexpected response format
      return { data: [], total: 0, page: 1, limit, totalPages: 0 };
    } catch {
      // Silent: Error fetching customer projects
      return { data: [], total: 0, page: 1, limit, totalPages: 0 }; // Return empty array as fallback
    }
  },
};
