import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Stack, 
  Avatar, 
  Chip, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  InputAdornment
} from '@mui/material';
import { 
  AccountBalance, 
  TrendingUp, 
  AttachMoney, 
  Assessment, 
  Receipt, 
  CreditCard, 
  Support, 
  EventNote,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Print,
  Search,
  Clear,
  Refresh
} from '@mui/icons-material';
import InvoiceManagement from './InvoiceManagement';
import { useAccountingData } from '../../hooks/useAccountingData';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import SimplePagination from '../common/SimplePagination';

const AccountingDepartment = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Add global CSS to prevent list-style issues
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .accounting-department ul,
      .accounting-department ol,
      .accounting-department li {
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .accounting-department * {
        list-style: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Check if user has access to Accounting department
  // Since department info is not available in the user object, allow access
  // The backend will handle the actual authorization
  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You must be logged in to access the Accounting department.
        </Typography>
      </Box>
    );
  }

  const [activeTab, setActiveTab] = useState('transactions');
  const [triggerCreateInvoice, setTriggerCreateInvoice] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [detailedTransaction, setDetailedTransaction] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [formData, setFormData] = useState({
    invoice_type: 'customer',
    client_name: '',
    description: '',
    amount: '',
    due_date: '',
    status: 'unpaid',
    method: 'cash'
  });
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: '',
    type: 'income',
    method: 'cash',
    date: new Date().toISOString().split('T')[0]
  });
  const [leaveData, setLeaveData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    leave_hour: ''
  });
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [transactionFieldErrors, setTransactionFieldErrors] = useState({});
  const [transactionSubmitError, setTransactionSubmitError] = useState('');
  const [leaveFieldErrors, setLeaveFieldErrors] = useState({});
  const [leaveSubmitError, setLeaveSubmitError] = useState('');
  const [ticketFieldErrors, setTicketFieldErrors] = useState({});
  const [ticketSubmitError, setTicketSubmitError] = useState('');
  
  // Transaction search state
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');

  const { 
    addInvoice, 
    submitLeave, 
    submitTicket, 
    addTransaction,
    updateTransaction,
    getTransaction,
    transactions,
    summary,
    deleteTransaction,
    fetchTransactions,
    fetchSummary,
    loading,
    transactionCurrentPage,
    transactionTotalPages,
    totalTransactions,
    transactionPageSize,
    goToTransactionPage,
    changeTransactionPageSize,
    allTransactions,
    isSearchingTransactions,
    fetchAllTransactionsForSearch
  } = useAccountingData();

  // Add React useEffect for debugging - AFTER hook declaration
  React.useEffect(() => {
      ('🔍 Transactions loaded:', transactions.length);
      ('📊 Transaction data:', transactions);
      ('📄 Pagination state:', {
      currentPage: transactionCurrentPage,
      totalPages: transactionTotalPages,
      totalTransactions,
      pageSize: transactionPageSize
    });
  }, [transactions, transactionCurrentPage, transactionTotalPages, totalTransactions, transactionPageSize]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError('');
      setFieldErrors({});

      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const result = await addInvoice(invoiceData);
      if (result.success) {
        setShowInvoiceDialog(false);
        setFormData({
          invoice_type: 'customer',
          client_name: '',
          description: '',
          amount: '',
          due_date: '',
          status: 'unpaid'
        });
        setFieldErrors({});
        setSubmitError('');
      } else {
        // Handle backend validation errors
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.error) {
          setSubmitError(result.error);
        }
      }
    } catch (err) {
('Error submitting invoice:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setShowInvoiceDialog(false);
    setFormData({
      invoice_type: 'customer',
      client_name: '',
      description: '',
      amount: '',
      due_date: '',
      status: 'unpaid',
      method: 'cash'
    });
    setFieldErrors({});
    setSubmitError('');
  };

  const handleTransactionInputChange = (field) => (event) => {
    setTransactionData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    // Clear field error when user starts typing
    if (transactionFieldErrors[field]) {
      setTransactionFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error when user makes changes
    if (transactionSubmitError) {
      setTransactionSubmitError('');
    }
  };

  const handleTransactionSubmit = async () => {
    try {
      setTransactionSubmitError('');
      setTransactionFieldErrors({});

      // Validate required fields before submission
      const errors = {};
      if (!transactionData.description || transactionData.description.trim() === '') {
        errors.description = 'Description is required';
      }
      if (!transactionData.amount || transactionData.amount === '' || parseFloat(transactionData.amount) <= 0) {
        errors.amount = 'Amount must be greater than 0';
      }
      if (!transactionData.date) {
        errors.date = 'Date is required';
      }
      if (!transactionData.type) {
        errors.type = 'Transaction type is required';
      }
      if (!transactionData.method) {
        errors.method = 'Payment method is required';
      }

      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        setTransactionFieldErrors(errors);
        return;
      }

      const transaction = {
        ...transactionData,
        amount: parseFloat(transactionData.amount)
      };

        ('Submitting transaction:', transaction);
      
      let result;
      if (editingTransaction) {
        result = await updateTransaction(editingTransaction._id, transaction);
      } else {
        result = await addTransaction(transaction);
      }
        ('Transaction result:', result);
      
      if (result.success) {
      // Close dialog and reset form
      setShowTransactionDialog(false);
        setEditingTransaction(null);
      setTransactionData({
        description: '',
        amount: '',
        type: 'income',
          method: 'cash',
        date: new Date().toISOString().split('T')[0]
      });
      setTransactionFieldErrors({});
      setTransactionSubmitError('');
      
        // Clear search and refresh transactions
        setTransactionSearchTerm('');
        
        // Show success message
        showSuccess(`Transaction ${editingTransaction ? 'updated' : 'created'} successfully!`);
      } else {
        // Handle backend validation errors
          ('Backend validation errors:', result.fieldErrors);
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setTransactionFieldErrors(result.fieldErrors);
        }
        if (result.error) {
          setTransactionSubmitError(result.error);
        }
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      setTransactionSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCloseTransactionDialog = () => {
    setShowTransactionDialog(false);
    setEditingTransaction(null);
    setTransactionData({
      description: '',
      amount: '',
      type: 'income',
      method: 'cash',
      date: new Date().toISOString().split('T')[0]
    });
    setTransactionFieldErrors({});
    setTransactionSubmitError('');
  };

  // Transaction menu handlers
  const handleMenuClick = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleViewTransactionDetails = async () => {
    if (!selectedTransaction || !selectedTransaction._id) {
      console.error('No transaction selected or missing ID');
      return;
    }

    setViewDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');
    setDetailedTransaction(null);
    handleMenuClose();

    try {
      const result = await getTransaction(selectedTransaction._id);
      if (result.success) {
        setDetailedTransaction(result.data);
      } else {
        setDetailsError(result.error || 'Failed to fetch transaction details');
        // Fallback to using the selected transaction data if API fails
        setDetailedTransaction(selectedTransaction);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setDetailsError('Failed to fetch transaction details');
      // Fallback to using the selected transaction data if API fails
      setDetailedTransaction(selectedTransaction);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      setEditingTransaction(selectedTransaction);
      setTransactionData({
        description: selectedTransaction.description || '',
        amount: selectedTransaction.amount || '',
        type: selectedTransaction.type || 'income',
        method: selectedTransaction.method || 'cash',
        date: selectedTransaction.date ? new Date(selectedTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setShowTransactionDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteTransaction = async () => {
    // Close menu immediately
    handleMenuClose();
    if (selectedTransaction && window.confirm('Are you sure you want to delete this transaction?')) {
      const result = await deleteTransaction(selectedTransaction._id);
     
      if (result.success) {
        // Clear search and refresh transactions
        setTransactionSearchTerm('');
        showSuccess('Transaction deleted successfully!');
      } else {
        showError('Failed to delete transaction: ' + result.error);
      }
    }
  };

  const handlePrintTransaction = () => {
    const transaction = detailedTransaction || selectedTransaction;
    if (transaction) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transaction - ${transaction.description}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 20px; list-style: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body * { list-style: none !important; }
            ul, ol, li { list-style: none !important; margin: 0; padding: 0; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #333; }
            .transaction-title { font-size: 18px; color: #666; margin-top: 10px; }
            .transaction-info { margin: 30px 0; }
            .detail-row { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; list-style: none !important; }
            .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
            .value { font-size: 16px; color: #333; }
            .amount { font-size: 24px; font-weight: bold; }
            .amount.income { color: #2e7d32; }
            .amount.expense { color: #c62828; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            @media print { 
              body { margin: 0; list-style: none; } 
              body * { list-style: none !important; }
              ul, ol, li { list-style: none !important; margin: 0; padding: 0; }
              .no-print { display: none; }
              .detail-row { list-style: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Trendora</div>
            <div class="transaction-title">TRANSACTION RECEIPT</div>
          </div>
          
          <div class="transaction-info">
            <div class="detail-row">
              <span class="label">Description</span>
              <span class="value">${transaction.description}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Amount</span>
              <span class="value amount ${transaction.type}">EGP ${transaction.amount?.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Type</span>
              <span class="value">${transaction.type.toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Payment Method</span>
              <span class="value">${transaction.method.toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date</span>
              <span class="value">${new Date(transaction.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            ${transaction.createdAt ? `
            <div class="detail-row">
              <span class="label">Created At</span>
              <span class="value">${new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for your business</p>
            <p>This is a computer-generated receipt</p>
          </div>
        </body>
        </html>
      `;
      
      // Create iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(printContent);
      doc.close();
      
      // Wait for content to load, then print
      iframe.contentWindow.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Remove iframe immediately after print dialog closes
          iframe.contentWindow.onafterprint = () => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          };
          
          // Fallback: Remove iframe after 3 seconds as backup
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        } catch (error) {
          console.error('Error during print:', error);
          // Clean up iframe on error
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      };
    }
    handleMenuClose();
  };

  // Leave handlers
  const handleLeaveInputChange = (field) => (event) => {
    setLeaveData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    if (leaveFieldErrors[field]) {
      setLeaveFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (leaveSubmitError) {
      setLeaveSubmitError('');
    }
  };

  const handleLeaveSubmit = async () => {
    // Validate form
    const errors = {};
    const isEarly = leaveData.type === 'early';
    if (!leaveData.type) errors.type = 'Leave type is required';
    if (!leaveData.startDate) errors.startDate = 'Start date is required';
    if (!isEarly && !leaveData.endDate) errors.endDate = 'End date is required';
    
    // Validate dates
    if (!isEarly && leaveData.startDate && leaveData.endDate) {
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      if (startDate > endDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setLeaveFieldErrors(errors);
      return;
    }
    
    setLeaveFieldErrors({});
    
    try {
      const payload = {
        ...leaveData,
        endDate: isEarly ? leaveData.startDate : leaveData.endDate,
      };
      if (leaveData.leave_hour !== '' && !isNaN(leaveData.leave_hour)) {
        payload.leave_hours = Math.max(0, Number(leaveData.leave_hour));
      }
      delete payload.leave_hour;
      const result = await submitLeave(payload);
      if (result.success) {
        showSuccess('Leave request submitted successfully!');
        setLeaveData({
          type: '',
          startDate: '',
          endDate: '',
          leave_hour: ''
        });
        setShowLeaveDialog(false);
      } else {
        showError('Failed to submit leave request: ' + (result.error || result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showError('Failed to submit leave request: ' + error.message);
    }
  };

  const handleCloseLeaveDialog = () => {
    setShowLeaveDialog(false);
    setLeaveData({
      type: '',
      startDate: '',
      endDate: '',
      leave_hour: ''
    });
    setLeaveFieldErrors({});
    setLeaveSubmitError('');
  };

  // Ticket handlers
  const handleTicketInputChange = (field) => (event) => {
    setTicketData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    if (ticketFieldErrors[field]) {
      setTicketFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (ticketSubmitError) {
      setTicketSubmitError('');
    }
  };

  const handleTicketSubmit = async () => {
    // Validate that a valid issue type is selected
    if (ticketData.title === '') {
      showWarning('Please select an issue type');
      return;
    }

    // Validate user ID exists
    if (!user || !user.id) {
      showError('User authentication error. Please log in again.');
      return;
    }

    // Validate description length
    if (ticketData.description.length < 10 || ticketData.description.length > 500) {
      showWarning('Description must be between 10 and 500 characters');
      return;
    }

    // Prepare data according to backend schema
    const ticketDataToSubmit = {
      title: ticketData.title.trim(),
      description: ticketData.description.trim(),
      priority: ticketData.priority
    };

    try {
       ('Creating ticket:', ticketDataToSubmit);
      const result = await submitTicket(ticketDataToSubmit);
      
      if (result.success) {
        showSuccess('Ticket created successfully!');
        setTicketData({
          title: '',
          description: '',
          priority: 'medium'
        });
        setShowTicketDialog(false);
      } else {
        // If there are field errors, show them in the UI
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setTicketFieldErrors(result.fieldErrors);
          setTicketSubmitError(result.error || 'Please correct the validation errors below.');
        } else {
          // If no field errors, show general error
          showError('Failed to create ticket: ' + (result.error || result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showError('Failed to create ticket: ' + error.message);
    }
  };

  const handleCloseTicketDialog = () => {
    setShowTicketDialog(false);
    setTicketData({
      title: '',
      description: '',
      priority: 'medium'
    });
    setTicketFieldErrors({});
    setTicketSubmitError('');
  };

  // Transaction search handlers
  const handleTransactionSearchChange = (event) => {
    const searchValue = event.target.value;
    setTransactionSearchTerm(searchValue);

    // If search term is empty, return to paginated view
    if (!searchValue.trim()) {
      fetchTransactions();
      return;
    }

    // If we haven't fetched all transactions yet, fetch them
    if (!isSearchingTransactions && allTransactions.length === 0) {
      fetchAllTransactionsForSearch();
    }
  };

  const handleClearTransactionSearch = () => {
    setTransactionSearchTerm('');
    fetchTransactions(); // Return to paginated view
  };

  // Filter transactions based on search term
  const getFilteredTransactions = () => {
    if (!transactionSearchTerm.trim()) {
      return transactions;
    }

    // Search across all transactions if we have them
    const transactionsToSearch = isSearchingTransactions && allTransactions.length > 0 
      ? allTransactions 
      : transactions;

    const searchLower = transactionSearchTerm.toLowerCase();
    
    return transactionsToSearch.filter(transaction => {
      return (
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.type?.toLowerCase().includes(searchLower) ||
        transaction.method?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower) ||
        new Date(transaction.date).toLocaleDateString().toLowerCase().includes(searchLower)
      );
    });
  };

  // Get the displayed transactions
  const displayedTransactions = getFilteredTransactions();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      p: 3,
      fontSize: '13px'
    }}
    className="accounting-department"
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Accounting Department
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Financial management and accounting operations
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ 
            height: '100%',
            borderLeft: 4,
            borderColor: 'success.main',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                    Total Revenue
                  </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  EGP {summary.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                    Income
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ 
            height: '100%',
            borderLeft: 4,
            borderColor: 'error.main',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                  Total Expenses
                  </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  EGP {summary.totalExpenses?.toLocaleString() || '0'}
                  </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AttachMoney sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                    Expenses
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ 
            height: '100%',
            borderLeft: 4,
            borderColor: summary.netProfit >= 0 ? 'info.main' : 'warning.main',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                  Net Profit
                  </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                }}>
                  EGP {summary.netProfit?.toLocaleString() || '0'}
                  </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Assessment sx={{ 
                    fontSize: 16, 
                    color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                  }} />
                  <Typography variant="caption" sx={{ 
                    fontWeight: 500,
                    color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                  }}>
                    {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AttachMoney />}
                onClick={() => setShowTransactionDialog(true)}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                New Transaction
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUp />}
                onClick={() => setShowInvoiceDialog(true)}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                Generate Invoice
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                onClick={() => setActiveTab('reports')}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                View Reports
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Support />}
                onClick={() => setShowTicketDialog(true)}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                Submit Ticket
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EventNote />}
                onClick={() => setShowLeaveDialog(true)}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                Submit Leave
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 0.5 }}>
          <Box sx={{
            display: 'flex',
            gap: 0.25,
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            p: 0.5
          }}>
            {[
              { id: 'transactions', label: 'Transactions', icon: Receipt },
              { id: 'invoices', label: 'Invoices', icon: AttachMoney },
              { id: 'reports', label: 'Reports', icon: Assessment }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                startIcon={<tab.icon />}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  backgroundColor: activeTab === tab.id ? '#1c242e' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: 500,
                  fontSize: '12px',
                  textTransform: 'none',
                  minHeight: 'auto',
                  '&:hover': {
                    backgroundColor: activeTab === tab.id ? '#1c242e' : 'action.hover'
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: 0.75,
                    '& svg': {
                      fontSize: '14px'
                    }
                  }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Transactions
            </Typography>

            {/* Search Bar with New Transaction Button */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Search transactions by description, type, method, amount, or date..."
                    value={transactionSearchTerm}
                    onChange={handleTransactionSearchChange}
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ color: 'text.secondary', mr: 1 }} />
                      ),
                      endAdornment: transactionSearchTerm && (
                        <IconButton
                          size="small"
                          onClick={handleClearTransactionSearch}
                          sx={{ mr: -1 }}
                        >
                          <Clear />
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                  />
                  {isSearchingTransactions && transactionSearchTerm && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Searching across all {totalTransactions} transactions...
                    </Typography>
                  )}
                  {transactionSearchTerm && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Found {displayedTransactions.length} result{displayedTransactions.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AttachMoney />}
                  onClick={() => {
                    setEditingTransaction(null);
                    setShowTransactionDialog(true);
                  }}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    px: 3
                  }}
                >
                  New Transaction
                </Button>
              </Stack>
            </Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading transactions...
                    </Typography>
              </Box>
            ) : displayedTransactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {transactionSearchTerm 
                    ? `No transactions found matching "${transactionSearchTerm}"`
                    : 'No transactions found. Create your first transaction using the button above.'}
                    </Typography>
                  </Box>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedTransactions.map((transaction) => (
                        <TableRow 
                          key={transaction._id}
                          sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: transaction.type === 'income' ? 'success.main' : 'error.main'
                      }}
                    >
                              EGP {transaction.amount?.toLocaleString()}
                    </Typography>
                          </TableCell>
                          <TableCell>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.method}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, transaction)}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination - Hide when searching */}
                {!transactionSearchTerm && (
                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <SimplePagination
                      currentPage={transactionCurrentPage}
                      totalPages={transactionTotalPages}
                      totalItems={totalTransactions}
                      pageSize={transactionPageSize}
                      onPageChange={(page) => {
                          ('📄 Page changed to:', page);
                        goToTransactionPage(page);
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <InvoiceManagement onCreateInvoice={triggerCreateInvoice} />
      )}

      {/* Quick Create Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            Create New Invoice
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Error Alert */}
            {submitError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setSubmitError('')}
              >
                {submitError}
              </Alert>
            )}

            {/* Debug: Show field errors */}
            {/* Field errors are now displayed directly on the form fields */}

            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>

            <FormControl fullWidth required error={!!fieldErrors.invoice_type}>
              <InputLabel>Invoice Type</InputLabel>
              <Select
                value={formData.invoice_type}
                onChange={handleInputChange('invoice_type')}
                label="Invoice Type"
              >
                <MenuItem value="customer">Customer Invoice</MenuItem>
                <MenuItem value="vendor">Vendor Invoice</MenuItem>
              </Select>
              {fieldErrors.invoice_type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {fieldErrors.invoice_type}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              required
              error={!!fieldErrors.amount}
              helperText={fieldErrors.amount || "Invoice amount in Egyptian Pounds (EGP)"}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <Divider />

            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>

            <TextField
              fullWidth
              label="Client Name"
              value={formData.client_name}
              onChange={handleInputChange('client_name')}
              required
              error={!!fieldErrors.client_name}
              helperText={fieldErrors.client_name || "Name of the client or company (3-100 characters)"}
              inputProps={{ minLength: 3, maxLength: 100 }}
            />

            <Divider />

            <Typography variant="h6" gutterBottom>
              Invoice Settings
            </Typography>

            <FormControl fullWidth error={!!fieldErrors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleInputChange('status')}
                label="Status"
              >
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
              {fieldErrors.status && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                  {fieldErrors.status}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!fieldErrors.method}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.method}
                onChange={handleInputChange('method')}
                label="Payment Method"
              >
                <MenuItem value="visa">Visa</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
              {fieldErrors.method && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                  {fieldErrors.method}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange('due_date')}
              InputLabelProps={{ shrink: true }}
              required
              error={!!fieldErrors.due_date}
              helperText={fieldErrors.due_date || "Payment due date for this invoice"}
            />

            <Divider />

            <Typography variant="h6" gutterBottom>
              Description & Notes
            </Typography>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Detailed description of services or products, terms and conditions, payment instructions..."
              error={!!fieldErrors.description}
              helperText={fieldErrors.description || "Detailed description of what this invoice covers (max 1000 characters)"}
              inputProps={{ maxLength: 1000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {activeTab === 'reports' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Financial Reports & Summary
            </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                    ('🔄 Refreshing summary data');
                  fetchSummary();
                }}
                sx={{ borderRadius: 2 }}
              >
                Refresh Data
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body2" color="text.secondary">
                  Loading financial data...
            </Typography>
              </Box>
            ) : (
              <Stack spacing={4}>
                {/* Summary Overview */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Financial Summary
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        height: '100%',
                        borderLeft: 4,
                        borderColor: 'success.main',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                              Total Revenue
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                              EGP {summary.totalRevenue?.toLocaleString() || '0'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                Income
                              </Typography>
                            </Stack>
                          </Stack>
          </CardContent>
        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        height: '100%',
                        borderLeft: 4,
                        borderColor: 'error.main',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                              Total Expenses
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                              EGP {summary.totalExpenses?.toLocaleString() || '0'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <AttachMoney sx={{ fontSize: 16, color: 'error.main' }} />
                              <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                                Expenses
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        height: '100%',
                        borderLeft: 4,
                        borderColor: summary.netProfit >= 0 ? 'info.main' : 'warning.main',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                              Net Profit
                            </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 700, 
                              color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                            }}>
                              EGP {summary.netProfit?.toLocaleString() || '0'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Assessment sx={{ 
                                fontSize: 16, 
                                color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                              }} />
                              <Typography variant="caption" sx={{ 
                                fontWeight: 500,
                                color: summary.netProfit >= 0 ? 'info.main' : 'warning.main'
                              }}>
                                {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Detailed Breakdown */}
                <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Financial Breakdown
            </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>Category</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '16px' }}>Amount (EGP)</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '16px' }}>Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ '&:hover': { bgcolor: 'success.50' } }}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip label="Income" color="success" size="small" />
                              <Typography>Total Revenue</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 600, color: 'success.main', fontSize: '16px' }}>
                              {summary.totalRevenue?.toLocaleString() || '0'}
            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>
                              100%
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow sx={{ '&:hover': { bgcolor: 'error.50' } }}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip label="Expense" color="error" size="small" />
                              <Typography>Total Expenses</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 600, color: 'error.main', fontSize: '16px' }}>
                              {summary.totalExpenses?.toLocaleString() || '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>
                              {summary.totalRevenue > 0 
                                ? ((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(1) 
                                : '0'}%
                            </Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow sx={{ bgcolor: 'grey.50', borderTop: '2px solid', borderColor: 'divider' }}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
                              Net Profit/Loss
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              sx={{ 
                                fontWeight: 700, 
                                fontSize: '18px',
                                color: summary.netProfit >= 0 ? 'success.main' : 'error.main'
                              }}
                            >
                              {summary.netProfit?.toLocaleString() || '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={summary.netProfit >= 0 ? 'Profit' : 'Loss'}
                              color={summary.netProfit >= 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Additional Metrics */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Key Performance Indicators
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Profit Margin
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {summary.totalRevenue > 0 
                            ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(1) 
                            : '0'}%
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Expense Ratio
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {summary.totalRevenue > 0 
                            ? ((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(1) 
                            : '0'}%
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Transactions
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {transactions.length}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Avg Transaction
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          EGP {transactions.length > 0 
                            ? ((summary.totalRevenue + summary.totalExpenses) / transactions.length).toFixed(0)
                            : '0'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Report Generation Info */}
                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Assessment color="primary" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Report Generated: {new Date().toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Data is updated in real-time from your transactions
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Details
            </Typography>

            <TextField
              fullWidth
              label="Description"
              value={transactionData.description}
              onChange={handleTransactionInputChange('description')}
              required
              error={!!transactionFieldErrors.description}
              helperText={transactionFieldErrors.description || "Description of the transaction"}
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={transactionData.amount}
              onChange={handleTransactionInputChange('amount')}
              required
              error={!!transactionFieldErrors.amount}
              helperText={transactionFieldErrors.amount || "Transaction amount in Egyptian Pounds (EGP)"}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={transactionData.date}
              onChange={handleTransactionInputChange('date')}
              InputLabelProps={{ shrink: true }}
              required
              error={!!transactionFieldErrors.date}
              helperText={transactionFieldErrors.date || "Transaction date"}
            />

            <FormControl fullWidth required error={!!transactionFieldErrors.type}>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={transactionData.type}
                onChange={handleTransactionInputChange('type')}
                label="Transaction Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
              {transactionFieldErrors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                  {transactionFieldErrors.type}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!transactionFieldErrors.method}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={transactionData.method}
                onChange={handleTransactionInputChange('method')}
                label="Payment Method"
              >
                <MenuItem value="visa">Visa</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
              {transactionFieldErrors.method && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                  {transactionFieldErrors.method}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button
            onClick={handleTransactionSubmit}
            variant="contained"
          >
            {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Form Modal */}
      {showLeaveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                Submit Leave Request
              </h3>
              <button
                onClick={handleCloseLeaveDialog}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLeaveSubmit();
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="leave-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Leave Type
                </label>
                <select
                  id="leave-type"
                  value={leaveData.type}
                  onChange={handleLeaveInputChange('type')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${leaveFieldErrors.type ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="early">Early Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
                {leaveFieldErrors.type && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {leaveFieldErrors.type}
                  </div>
                )}
              </div>

              {leaveData.type === 'early' && (
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="leave-hours" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Leave Hours 
                  </label>
                  <input
                    id="leave-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveData.leave_hour}
                    onChange={handleLeaveInputChange('leave_hour')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${leaveFieldErrors.leave_hour ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="leave-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  {leaveData.type === 'early' ? 'Date' : 'Start Date'}
                </label>
                <input
                  type="date"
                  id="leave-start-date"
                  value={leaveData.startDate}
                  onChange={handleLeaveInputChange('startDate')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${leaveFieldErrors.startDate ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
                {leaveFieldErrors.startDate && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {leaveFieldErrors.startDate}
                  </div>
                )}
              </div>
              
              {leaveData.type !== 'early' && (
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="leave-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    id="leave-end-date"
                    value={leaveData.endDate}
                    onChange={handleLeaveInputChange('endDate')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${leaveFieldErrors.endDate ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                  {leaveFieldErrors.endDate && (
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                      {leaveFieldErrors.endDate}
                    </div>
                  )}
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleCloseLeaveDialog}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: loading ? '#9ca3af' : '#059669',
                    color: 'white',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit New Ticket
            </h3>
            
            {/* Error Alert */}
            {ticketSubmitError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {ticketSubmitError}
              </div>
            )}

            {/* Field errors are now displayed directly on the form fields */}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTicketSubmit();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="ticket-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Issue Type *
                </label>
                <select
                  id="ticket-type"
                  value={ticketData.title}
                  onChange={handleTicketInputChange('title')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${ticketFieldErrors.title ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select an issue type</option>
                  <option value="Login Issues">Login Issues</option>
                  <option value="Password Reset">Password Reset</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Email Not Working">Email Not Working</option>
                  <option value="Internet Connection">Internet Connection</option>
                  <option value="WiFi Problems">WiFi Problems</option>
                  <option value="Computer Slow">Computer Slow</option>
                  <option value="Computer Won't Start">Computer Won't Start</option>
                  <option value="Blue Screen Error">Blue Screen Error</option>
                  <option value="Software Installation">Software Installation</option>
                  <option value="Software Not Working">Software Not Working</option>
                  <option value="Printer Issues">Printer Issues</option>
                  <option value="Scanner Problems">Scanner Problems</option>
                  <option value="Database Access">Database Access</option>
                  <option value="File Access Issues">File Access Issues</option>
                  <option value="Network Drive Problems">Network Drive Problems</option>
                  <option value="VPN Connection">VPN Connection</option>
                  <option value="Remote Access Issues">Remote Access Issues</option>
                  <option value="System Updates">System Updates</option>
                  <option value="Antivirus Issues">Antivirus Issues</option>
                  <option value="Browser Problems">Browser Problems</option>
                  <option value="Website Not Loading">Website Not Loading</option>
                  <option value="Performance Issues">Performance Issues</option>
                  <option value="Memory Problems">Memory Problems</option>
                  <option value="Storage Issues">Storage Issues</option>
                  <option value="Backup Problems">Backup Problems</option>
                  <option value="Data Recovery">Data Recovery</option>
                  <option value="Hardware Failure">Hardware Failure</option>
                  <option value="Keyboard Issues">Keyboard Issues</option>
                  <option value="Mouse Problems">Mouse Problems</option>
                  <option value="Monitor Issues">Monitor Issues</option>
                  <option value="Audio Problems">Audio Problems</option>
                  <option value="Camera Not Working">Camera Not Working</option>
                  <option value="Microphone Issues">Microphone Issues</option>
                  <option value="USB Port Problems">USB Port Problems</option>
                  <option value="Bluetooth Issues">Bluetooth Issues</option>
                  <option value="Mobile Device Sync">Mobile Device Sync</option>
                  <option value="Application Crashes">Application Crashes</option>
                  <option value="Data Loss">Data Loss</option>
                  <option value="Permission Issues">Permission Issues</option>
                  <option value="Security Concerns">Security Concerns</option>
                  <option value="Phishing Attempts">Phishing Attempts</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="License Issues">License Issues</option>
                  <option value="Configuration Problems">Configuration Problems</option>
                  <option value="Integration Issues">Integration Issues</option>
                  <option value="API Problems">API Problems</option>
                  <option value="Server Issues">Server Issues</option>
                  <option value="Database Errors">Database Errors</option>
                  <option value="Cloud Service Problems">Cloud Service Problems</option>
                  <option value="Third-party Software">Third-party Software</option>
                  <option value="Mobile App Issues">Mobile App Issues</option>
                  <option value="Web Application Problems">Web Application Problems</option>
                  <option value="Other Technical Issue">Other Technical Issue</option>
                </select>
                {ticketFieldErrors.title && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {ticketFieldErrors.title}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="ticket-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  id="ticket-description"
                  value={ticketData.description}
                  onChange={handleTicketInputChange('description')}
                  placeholder="Describe the issue in detail (10-500 characters)"
                  rows={4}
                  minLength={10}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${ticketFieldErrors.description ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {ticketData.description.length}/500 characters
                </div>
                {ticketFieldErrors.description && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {ticketFieldErrors.description}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="ticket-priority" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={ticketData.priority}
                  onChange={handleTicketInputChange('priority')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${ticketFieldErrors.priority ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {ticketFieldErrors.priority && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {ticketFieldErrors.priority}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseTicketDialog}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewTransactionDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditTransaction}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePrintTransaction}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Transaction</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteTransaction}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Transaction Details Dialog */}
      <Dialog open={viewDetailsOpen} onClose={() => setViewDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            Transaction Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Stack alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Loading transaction details...
                </Typography>
              </Stack>
            </Box>
          ) : detailsError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {detailsError}
            </Alert>
          ) : detailedTransaction ? (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {detailedTransaction.description}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Amount
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: detailedTransaction.type === 'income' ? 'success.main' : 'error.main'
                    }}
                  >
                    EGP {detailedTransaction.amount?.toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Chip
                    label={detailedTransaction.type}
                    color={detailedTransaction.type === 'income' ? 'success' : 'error'}
                    size="medium"
                  />
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Payment Method
                  </Typography>
                  <Chip
                    label={detailedTransaction.method}
                    variant="outlined"
                    size="medium"
                  />
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {detailedTransaction.date ? new Date(detailedTransaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Typography>
                </Box>

                {detailedTransaction.createdAt && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Created At
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(detailedTransaction.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button 
            variant="contained"
            startIcon={<Print />}
            onClick={() => {
              handlePrintTransaction();
              setViewDetailsOpen(false);
            }}
            disabled={!detailedTransaction}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingDepartment;
