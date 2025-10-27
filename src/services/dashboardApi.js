import api from '../api/axios';
import { API_CONFIG } from '../config/api.js';

// Helper to normalize API errors
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error?.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || defaultMessage;
    // Common auth handling
    if (status === 401) return 'Unauthorized. Please log in again.';
    if (status === 403) return 'Forbidden. You do not have access.';
    if (status === 404) return message || 'Resource not found.';
    if (status === 422) return message || 'Validation error. Please check your input.';
    return message || `${defaultMessage} (HTTP ${status})`;
  }
  if (error?.request) {
    return 'Network error. Please check your internet connection.';
  }
  return error?.message || defaultMessage;
};

export const dashboardApi = {
  // POST /dashboard/advance
  requestAdvance: async ({ amount, payrollMonth }) => {
    try {
      // Basic front-end validation according to provided schema
      if (amount == null || isNaN(Number(amount)) || Number(amount) < 1) {
        throw new Error('Amount must be a number greater than or equal to 1');
      }
      if (!payrollMonth || typeof payrollMonth !== 'string' || !payrollMonth.trim()) {
        throw new Error('Payroll month is required');
      }

      const body = {
        amount: Number(amount),
        payrollMonth: payrollMonth.trim(),
      };

      const res = await api.post(API_CONFIG.ENDPOINTS.DASHBOARD.ADVANCES, body);

      if (res?.data?.success === false) {
        throw new Error(res.data?.message || 'Failed to request advance');
      }

      return res.data;
    } catch (err) {
      throw new Error(handleApiError(err, 'Failed to request advance'));
    }
  },

  // GET /dashboard/advance
  getEmployeeAdvances: async (page = 1, limit = 10) => {
    try {
      const res = await api.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADVANCES, {
        params: { page, limit },
      });

      if (res?.data?.success === false) {
        throw new Error(res.data?.message || 'Failed to fetch advances');
      }

      return res.data;
    } catch (err) {
      throw new Error(handleApiError(err, 'Failed to fetch advances'));
    }
  },
};

export default dashboardApi;
