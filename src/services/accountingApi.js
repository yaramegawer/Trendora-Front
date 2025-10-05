import api from '../api/axios';
import { API_CONFIG } from '../config/api.js';

// Helper function to handle API errors and return user-friendly messages
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('Accounting API Error Details:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
    headers: error.config?.headers
  });

  let errorMessage = defaultMessage;

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    console.error(`Accounting API Error ${status}:`, data);
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Unauthorized. Please log in again.';
        break;
      case 403:
        errorMessage = 'Access denied. Only Admin or Accountant can perform this action.';
        break;
      case 404:
        errorMessage = data.message || 'Invoice not found.';
        break;
      case 409:
        errorMessage = data.message || 'Conflict. This invoice already exists.';
        break;
      case 422:
        errorMessage = data.message || 'Validation error. Please check your input.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Error ${status}: ${defaultMessage}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'Network error. Please check your internet connection.';
    console.error('Network Error:', error.request);
  } else {
    // Something else happened
    console.error('Unexpected Error:', error.message);
    errorMessage = error.message || defaultMessage;
  }

  return errorMessage;
};

// Accounting API functions
export const accountingApi = {
  // Add new invoice
  addInvoice: async (invoiceData) => {
    try {
      console.log('📝 Adding new invoice:', invoiceData);
      const response = await api.post('/accounting/add_invoice', invoiceData);
      console.log('✅ Invoice added successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Invoice created successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create invoice');
      console.error('❌ Error adding invoice:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  // Update existing invoice
  updateInvoice: async (invoiceId, updateData) => {
    try {
      console.log(`📝 Updating invoice ${invoiceId}:`, updateData);
      const response = await api.put(`/accounting/update_invoice/${invoiceId}`, updateData);
      console.log('✅ Invoice updated successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Invoice updated successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update invoice');
      console.error('❌ Error updating invoice:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  // Get all invoices
  getAllInvoices: async () => {
    try {
      console.log('📋 Fetching all invoices...');
      const response = await api.get('/accounting/get_all');
      console.log('✅ Invoices fetched successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Invoices fetched successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch invoices');
      console.error('❌ Error fetching invoices:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      console.log(`🗑️ Deleting invoice ${invoiceId}...`);
      const response = await api.delete(`/accounting/delete_invoice/${invoiceId}`);
      console.log('✅ Invoice deleted successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Invoice deleted successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete invoice');
      console.error('❌ Error deleting invoice:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
};

export default accountingApi;
