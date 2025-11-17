import api from "./axios.js";
import { API_CONFIG } from "../config/api.js";

export const salesApi = {
  // Get all customers
  getAllCustomers: async (params = '') => {
    try {
      const url = params ? `${API_CONFIG.ENDPOINTS.SALES.GET_ALL_CUSTOMERS}?${params}` : API_CONFIG.ENDPOINTS.SALES.GET_ALL_CUSTOMERS;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get single customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.SALES.GET_CUSTOMER}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  // Add new customer
  addCustomer: async (customerData) => {
    try {
       ('API: Adding customer with data:', customerData);
       ('API: Endpoint:', API_CONFIG.ENDPOINTS.SALES.ADD_CUSTOMER);
      const response = await api.post(API_CONFIG.ENDPOINTS.SALES.ADD_CUSTOMER, customerData);
       ('API: Add customer response:', response);
      return response.data;
    } catch (error) {
      console.error("API: Error adding customer:", error);
      console.error("API: Error response:", error.response);
      console.error("API: Error status:", error.response?.status);
      console.error("API: Error data:", error.response?.data);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`${API_CONFIG.ENDPOINTS.SALES.UPDATE_CUSTOMER}/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.SALES.DELETE_CUSTOMER}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // Get sales employees
  getSalesEmployees: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SALES.GET_SALES_EMPLOYEES);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales employees:", error);
      throw error;
    }
  },

  // Get follow-ups
  getFollowUps: async (params = '') => {
    try {
      const url = params ? `${API_CONFIG.ENDPOINTS.SALES.GET_FOLLOW_UPS}?${params}` : API_CONFIG.ENDPOINTS.SALES.GET_FOLLOW_UPS;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      throw error;
    }
  },

  // Update follow-up status (mark as contacted)
  updateFollowUpStatus: async (id) => {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.SALES.UPDATE_FOLLOW_UP_STATUS}/${id}`, { id });
      return response.data;
    } catch (error) {
      console.error("Error updating follow-up status:", error);
      throw error;
    }
  },

  // Reschedule follow-up
  rescheduleFollowUp: async (id, newDate) => {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.SALES.RESCHEDULE_FOLLOW_UP}/${id}`, { newDate });
      return response.data;
    } catch (error) {
      console.error("Error rescheduling follow-up:", error);
      throw error;
    }
  },

  // Get My Customers report
  getMyCustomersReport: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SALES.GET_MY_CUSTOMERS_REPORT);
      return response.data;
    } catch (error) {
      console.error("Error fetching My Customers report:", error);
      throw error;
    }
  },

  // Get Team Performance report
  getTeamPerformance: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SALES.TEAM_PERFORMANCE);
      return response.data;
    } catch (error) {
      console.error("Error fetching Team Performance report:", error);
      throw error;
    }
  },

  // Get services demand report
  getServicesDemand: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SALES.SERVICES_DEMAND);
      return response.data;
    } catch (error) {
      console.error("Error fetching services demand:", error);
      throw error;
    }
  },
};
