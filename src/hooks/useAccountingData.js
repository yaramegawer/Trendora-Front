import { useState, useEffect, useCallback } from 'react';
import { accountingApi } from '../services/accountingApi';

export const useAccountingData = () => {
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Pagination state for invoices
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('all');
  
  // Search state for cross-page search
  const [allInvoices, setAllInvoices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination state for transactions
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [transactionPageSize, setTransactionPageSize] = useState(10);
  
  // Search state for cross-page transaction search
  const [allTransactions, setAllTransactions] = useState([]);
  const [isSearchingTransactions, setIsSearchingTransactions] = useState(false);

  // Fetch all invoices for search (no pagination)
  const fetchAllInvoicesForSearch = useCallback(async (status = currentStatusFilter) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setIsSearching(true);
    
    try {
      // Fetch all invoices with a large limit
      const result = await accountingApi.getAllInvoices(1, 10000, status);
      
      if (result.success) {
        setAllInvoices(result.data || []);
        setInvoices(result.data || []); // Show all initially
        setTotalInvoices(result.data?.length || 0);
        setTotalPages(1); // Single page when searching
        setCurrentPage(1);
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
        setAllInvoices([]);
        setInvoices([]);
        setTotalInvoices(0);
        setTotalPages(0);
      }
    } catch (err) {
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      setAllInvoices([]);
      setInvoices([]);
      setTotalInvoices(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentStatusFilter]);

  // Fetch all invoices with pagination and status filter
  const fetchInvoices = useCallback(async (page = currentPage, limit = pageSize, status = currentStatusFilter) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setIsSearching(false);
    
    try {
      const result = await accountingApi.getAllInvoices(page, limit, status);
      
      if (result.success) {
        setInvoices(result.data || []);
        setAllInvoices([]); // Clear all invoices when not searching
        
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
        setCurrentStatusFilter(status);
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
        setAllInvoices([]);
        setTotalInvoices(0);
        setTotalPages(0);
      }
    } catch (err) {
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      
      // Set empty data on exception
      setInvoices([]);
      setAllInvoices([]);
      setTotalInvoices(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, currentStatusFilter]);

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
      // Error submitting leave request
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
      // Error submitting ticket request
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
      // Error fetching invoice
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchInvoices(page, pageSize, currentStatusFilter);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchInvoices(1, newPageSize, currentStatusFilter);
  };

  const changeStatusFilter = (newStatus) => {
    setCurrentStatusFilter(newStatus);
    fetchInvoices(1, pageSize, newStatus); // Reset to first page when filter changes
  };

  // Transaction Management Functions

  // Fetch all transactions for search (no pagination)
  const fetchAllTransactionsForSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setIsSearchingTransactions(true);
    
    try {
      // Fetch all transactions with a large limit
      const result = await accountingApi.getAllTransactions(1, 10000);
      
      if (result.success) {
        setAllTransactions(result.data || []);
        setTransactions(result.data || []); // Show all initially
        setTotalTransactions(result.data?.length || 0);
        setTransactionTotalPages(1); // Single page when searching
        setTransactionCurrentPage(1);
      } else {
        setError(result.error || 'Failed to fetch transactions');
        setFieldErrors(result.fieldErrors || {});
        setAllTransactions([]);
        setTransactions([]);
        setTotalTransactions(0);
        setTransactionTotalPages(0);
      }
    } catch (err) {
      console.error('❌ Error fetching all transactions for search:', err);
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      setAllTransactions([]);
      setTransactions([]);
      setTotalTransactions(0);
      setTransactionTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all transactions with backend pagination
  const fetchTransactions = useCallback(async (page = transactionCurrentPage, limit = transactionPageSize) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setIsSearchingTransactions(false);
    
    try {
        ('🔄 Fetching transactions - Page:', page, 'Limit:', limit);
      const result = await accountingApi.getAllTransactions(page, limit);
        ('📦 Transaction result:', result);
      
      if (result.success) {
          ('✅ Setting transactions:', result.data?.length, 'items');
          ('📊 Total transactions from API:', result.total);
          ('📄 Total pages from API:', result.totalPages);
        
        setTransactions(result.data || []);
        setAllTransactions([]); // Clear all transactions when not searching
        
        // Update pagination info from API response
        if (result.total !== undefined && result.total > result.data?.length) {
          // Use the total from API if it's greater than current page data
          setTotalTransactions(result.total);
          setTransactionTotalPages(result.totalPages || Math.ceil(result.total / limit));
            ('✅ Using total from API:', result.total);
        } else {
          // Fallback: get accurate total count
            ('⚠️ Getting accurate total count from helper...');
          try {
            const accurateTotal = await accountingApi.getTransactionTotalCount();
            setTotalTransactions(accurateTotal);
            setTransactionTotalPages(Math.ceil(accurateTotal / limit));
              ('✅ Got accurate total from helper:', accurateTotal);
          } catch (totalError) {
            console.error('❌ Could not get accurate total:', totalError);
            setTotalTransactions(result.data?.length || 0);
            setTransactionTotalPages(1);
          }
        }
        
        setTransactionCurrentPage(result.page || page);
          ('✅ State updated - Total:', result.total, 'Pages:', result.totalPages);
      } else {
        setError(result.error || 'Failed to fetch transactions');
        setFieldErrors(result.fieldErrors || {});
        setTransactions([]);
        setTotalTransactions(0);
        setTransactionTotalPages(0);
      }
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      setTransactions([]);
      setTotalTransactions(0);
      setTransactionTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [transactionCurrentPage, transactionPageSize]);

  // Add new transaction
  const addTransaction = async (transactionData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.addTransaction(transactionData);
      if (result.success) {
        // Refresh the transactions list and summary
        await fetchTransactions();
        await fetchSummary();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to add transaction';
      setError(errorMsg);
      setFieldErrors({});
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Update existing transaction
  const updateTransaction = async (transactionId, updateData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.updateTransaction(transactionId, updateData);
      if (result.success) {
        // Refresh the transactions list and summary
        await fetchTransactions();
        await fetchSummary();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to update transaction';
      setError(errorMsg);
      setFieldErrors({});
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.deleteTransaction(transactionId);
      if (result.success) {
        // Remove the transaction from local state
        setTransactions(prevTransactions => 
          prevTransactions.filter(transaction => transaction._id !== transactionId)
        );
        // Refresh summary
        await fetchSummary();
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete transaction';
      setError(errorMsg);
      setFieldErrors({});
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Get single transaction by ID
  const getTransaction = async (transactionId) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.getTransaction(transactionId);
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors || {});
        return { success: false, error: result.error, fieldErrors: result.fieldErrors || {} };
      }
    } catch (err) {
      const errorMsg = 'Failed to fetch transaction';
      setError(errorMsg);
      setFieldErrors({});
      return { success: false, error: errorMsg, fieldErrors: {} };
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounting summary
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await accountingApi.getSummary();
      
      if (result.success) {
        // Map API response to frontend format (snake_case to camelCase)
        setSummary({
          totalRevenue: result.data.total_revenue || 0,
          totalExpenses: result.data.total_expenses || 0,
          netProfit: result.data.net_profit || 0
        });
      } else {
        setError(result.error || 'Failed to fetch summary');
        setFieldErrors(result.fieldErrors || {});
        setSummary({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0
        });
      }
    } catch (err) {
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setFieldErrors({});
      setSummary({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load transactions and summary on component mount
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

  // Transaction pagination functions
  const goToTransactionPage = (page) => {
    if (page >= 1 && page <= transactionTotalPages) {
      fetchTransactions(page, transactionPageSize);
    }
  };

  const changeTransactionPageSize = (newPageSize) => {
    setTransactionPageSize(newPageSize);
    fetchTransactions(1, newPageSize);
  };

  return {
    invoices,
    transactions,
    summary,
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
    changeStatusFilter,
    // Search functions
    allInvoices,
    isSearching,
    fetchAllInvoicesForSearch,
    // Transaction functions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    fetchSummary,
    // Transaction pagination
    transactionCurrentPage,
    transactionTotalPages,
    totalTransactions,
    transactionPageSize,
    goToTransactionPage,
    changeTransactionPageSize,
    // Transaction search functions
    allTransactions,
    isSearchingTransactions,
    fetchAllTransactionsForSearch,
    clearError: () => {
      setError(null);
      setFieldErrors({});
    }
  };
};
