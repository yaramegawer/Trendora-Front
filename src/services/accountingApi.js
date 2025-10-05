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
  let fieldErrors = {};

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    console.error(`Accounting API Error ${status}:`, data);
    
    // First, try to extract validation errors regardless of status code
    const extractValidationErrors = (responseData) => {
      const errors = {};
      
      console.log('🔍 Extracting validation errors from:', responseData);
      
      // Check for different validation error formats
      if (responseData.errors && Array.isArray(responseData.errors)) {
        console.log('📋 Found errors array:', responseData.errors);
        responseData.errors.forEach(err => {
          if (err.path || err.field) {
            const fieldName = err.path || err.field;
            errors[fieldName] = err.msg || err.message || err.error || 'Invalid value';
            console.log(`✅ Added field error: ${fieldName} = ${errors[fieldName]}`);
          }
        });
      }
      
      // Check for validationErrors object
      if (responseData.validationErrors && typeof responseData.validationErrors === 'object') {
        console.log('📋 Found validationErrors object:', responseData.validationErrors);
        Object.assign(errors, responseData.validationErrors);
      }
      
      // Check for field-specific errors in the main data object
      if (responseData.fieldErrors && typeof responseData.fieldErrors === 'object') {
        console.log('📋 Found fieldErrors object:', responseData.fieldErrors);
        Object.assign(errors, responseData.fieldErrors);
      }
      
      // Check for individual field errors in the response data
      Object.keys(responseData).forEach(key => {
        if (key.includes('Error') || key.includes('error') || key.includes('validation')) {
          if (typeof responseData[key] === 'string') {
            // Try to extract field name from the error key
            const fieldName = key.replace(/Error|error|validation/gi, '').toLowerCase();
            errors[fieldName] = responseData[key];
            console.log(`✅ Added extracted field error: ${fieldName} = ${errors[fieldName]}`);
          }
        }
      });
      
      // Check for common field validation patterns
      const commonFields = ['client_name', 'amount', 'due_date', 'description', 'invoice_type', 'status'];
      commonFields.forEach(field => {
        if (responseData[field + '_error']) {
          errors[field] = responseData[field + '_error'];
          console.log(`✅ Found ${field}_error:`, errors[field]);
        }
        if (responseData[field + 'Error']) {
          errors[field] = responseData[field + 'Error'];
          console.log(`✅ Found ${field}Error:`, errors[field]);
        }
      });
      
      // If we still don't have field errors but have a message, try to parse it
      if (Object.keys(errors).length === 0 && data.message) {
        console.log('🔍 No field errors found, checking message for validation clues:', data.message);
        
        // Common validation error patterns
        if (data.message.includes('required') || data.message.includes('validation') || data.message.includes('invalid')) {
          // If it's a general validation message, we'll show it as a general error
          console.log('📋 Found general validation message');
        }
      }
      
      console.log('🎯 Final extracted errors:', errors);
      return errors;
    };
    
    // Extract validation errors first
    fieldErrors = extractValidationErrors(data);
    
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
        // Even for 500 errors, check if there are validation details
        if (Object.keys(fieldErrors).length > 0) {
          errorMessage = data.message || 'Validation error. Please check your input.';
        } else {
          errorMessage = 'Server error. Please try again later.';
        }
        break;
      default:
        errorMessage = data.message || `Error ${status}: ${defaultMessage}`;
    }
    
    // If we found field errors, prioritize showing validation message
    if (Object.keys(fieldErrors).length > 0 && status !== 422) {
      errorMessage = 'Please correct the validation errors below.';
    } else if (Object.keys(fieldErrors).length === 0 && data.message && 
               (data.message.includes('required') || data.message.includes('validation') || 
                data.message.includes('invalid') || data.message.includes('must be') ||
                data.message.includes('should be') || data.message.includes('format'))) {
      // If we have a validation-related message but no field errors, show the message
      console.log('📋 Showing validation message as general error:', data.message);
      errorMessage = data.message;
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

  console.log('Final error result:', { errorMessage, fieldErrors });

  return {
    message: errorMessage,
    fieldErrors: fieldErrors
  };
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
      console.error('❌ Raw error from addInvoice:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      
      const errorResult = handleApiError(error, 'Failed to create invoice');
      console.error('❌ Processed error result:', errorResult);
      
      return {
        success: false,
        error: errorResult.message,
        fieldErrors: errorResult.fieldErrors,
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
      const errorResult = handleApiError(error, 'Failed to update invoice');
      console.error('❌ Error updating invoice:', errorResult);
      return {
        success: false,
        error: errorResult.message,
        fieldErrors: errorResult.fieldErrors,
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
      const errorResult = handleApiError(error, 'Failed to fetch invoices');
      console.error('❌ Error fetching invoices:', errorResult);
      return {
        success: false,
        error: errorResult.message,
        fieldErrors: errorResult.fieldErrors,
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
      const errorResult = handleApiError(error, 'Failed to delete invoice');
      console.error('❌ Error deleting invoice:', errorResult);
      return {
        success: false,
        error: errorResult.message,
        fieldErrors: errorResult.fieldErrors,
        data: null
      };
    }
  }
};

export default accountingApi;
