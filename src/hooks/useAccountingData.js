import { useState, useEffect, useCallback } from 'react';
import { accountingApi } from '../services/accountingApi';

export const useAccountingData = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountingApi.getAllInvoices();
      if (result.success) {
        setInvoices(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new invoice
  const addInvoice = async (invoiceData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountingApi.addInvoice(invoiceData);
      if (result.success) {
        // Refresh the invoices list
        await fetchInvoices();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to add invoice';
      setError(errorMsg);
      console.error('Error adding invoice:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update existing invoice
  const updateInvoice = async (invoiceId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountingApi.updateInvoice(invoiceId, updateData);
      if (result.success) {
        // Refresh the invoices list
        await fetchInvoices();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to update invoice';
      setError(errorMsg);
      console.error('Error updating invoice:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    setLoading(true);
    setError(null);
    
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
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete invoice';
      setError(errorMsg);
      console.error('Error deleting invoice:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    clearError: () => setError(null)
  };
};
