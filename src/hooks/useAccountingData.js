import { useState, useEffect, useCallback } from 'react';
import { accountingApi } from '../services/accountingApi';

export const useAccountingData = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all invoices with pagination
  const fetchInvoices = useCallback(async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.getAllInvoices(page, limit);
      
      if (result.success) {
        setInvoices(result.data || []);
        
        // Update pagination info from API response
        if (result.total !== undefined && result.total > result.data?.length) {
          // Use the total from API if it's greater than current page data
          setTotalInvoices(result.total);
          setTotalPages(result.totalPages || Math.ceil(result.total / limit));
        } else {
          // Fallback: get accurate total count
          try {
            const accurateTotal = await accountingApi.getTotalCount();
            setTotalInvoices(accurateTotal);
            setTotalPages(Math.ceil(accurateTotal / limit));
          } catch (totalError) {
            setTotalInvoices(result.data?.length || 0);
            setTotalPages(1);
          }
        }
        
        setCurrentPage(result.page || page);
      } else {
        // Handle specific error cases
        if (result.error && result.error.includes('500')) {
          setError('Server error: Unable to fetch invoices. Please try again later.');
        } else if (result.error && result.error.includes('403')) {
          setError('Access denied: You do not have permission to view invoices.');
        } else {
          setError(result.error || 'Failed to fetch invoices');
        }
        
        setFieldErrors(result.fieldErrors || {});
        
        // Set empty data on error
        setInvoices([]);
        setTotalInvoices(0);
        setTotalPages(0);
      }
    } catch (err) {
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      
      // Set empty data on exception
      setInvoices([]);
      setTotalInvoices(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Add new invoice
  const addInvoice = async (invoiceData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.addInvoice(invoiceData);
      if (result.success) {
        // Refresh the invoices list
        await fetchInvoices();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to add invoice';
      setError(errorMsg);
      setFieldErrors({});
('Error adding invoice:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Update existing invoice
  const updateInvoice = async (invoiceId, updateData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.updateInvoice(invoiceId, updateData);
      if (result.success) {
        // Refresh the invoices list
        await fetchInvoices();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to update invoice';
      setError(errorMsg);
      setFieldErrors({});
('Error updating invoice:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.deleteInvoice(invoiceId);
      if (result.success) {
        // Remove the invoice from local state
        setInvoices(prevInvoices => 
          prevInvoices.filter(invoice => invoice._id !== invoiceId)
        );
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete invoice';
      setError(errorMsg);
      setFieldErrors({});
('Error deleting invoice:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Submit leave request
  const submitLeave = async (leaveData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.addLeave(leaveData);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to submit leave request';
      setError(errorMsg);
      setFieldErrors({});
      console.log('Error submitting leave request:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Submit ticket request
  const submitTicket = async (ticketData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.addTicket(ticketData);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to submit ticket request';
      setError(errorMsg);
      setFieldErrors({});
      console.log('Error submitting ticket request:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Get single invoice by ID
  const getInvoice = async (invoiceId) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.getInvoice(invoiceId);
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to fetch invoice';
      setError(errorMsg);
      setFieldErrors({});
      console.log('Error fetching invoice:', err);
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchInvoices(page, pageSize);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchInvoices(1, newPageSize);
  };

  return {
    invoices,
    loading,
    error,
    fieldErrors,
    currentPage,
    totalPages,
    totalInvoices,
    pageSize,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    submitLeave,
    submitTicket,
    goToPage,
    changePageSize,
    clearError: () => {
      setError(null);
      setFieldErrors({});
    }
  };
};
