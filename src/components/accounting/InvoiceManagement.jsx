import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
  Receipt,
  MoreVert,
  Print,
  Info
} from '@mui/icons-material';
import { useAccountingData } from '../../hooks/useAccountingData';
import SimplePagination from '../common/SimplePagination';

const InvoiceManagement = ({ onCreateInvoice, onClose }) => {
  const {
    invoices,
    loading,
    error,
    fieldErrors,
    currentPage,
    totalPages,
    totalInvoices,
    pageSize,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    goToPage,
    changePageSize,
    clearError
  } = useAccountingData();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [detailedInvoice, setDetailedInvoice] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [formData, setFormData] = useState({
    invoice_type: 'customer',
    client_name: '',
    description: '',
    amount: '',
    due_date: '',
    status: 'unpaid'
  });
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Handle external create invoice trigger
  useEffect(() => {
    if (onCreateInvoice) {
      handleOpenDialog();
    }
  }, [onCreateInvoice]);

  // Handle external close trigger
  useEffect(() => {
    if (onClose && !openDialog) {
      // Dialog was closed, trigger external close
      onClose();
    }
  }, [openDialog, onClose]);

  const handleOpenDialog = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        invoice_type: invoice.invoice_type || 'customer',
        client_name: invoice.client_name || '',
        description: invoice.description || '',
        amount: invoice.amount || '',
        due_date: invoice.due_date || '',
        status: invoice.status || 'unpaid'
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        invoice_type: 'customer',
        client_name: '',
        description: '',
        amount: '',
        due_date: '',
        status: 'unpaid'
      });
    }
    setFormFieldErrors({});
    setSubmitError('');
    setOpenDialog(true);
    clearError();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInvoice(null);
    setFormData({
      invoice_type: 'customer',
      client_name: '',
      description: '',
      amount: '',
      due_date: '',
      status: 'unpaid'
    });
    setFormFieldErrors({});
    setSubmitError('');
    clearError();
    // Call external close handler if provided
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    // Clear field error when user starts typing
    if (formFieldErrors[field]) {
      setFormFieldErrors(prev => ({
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
      setFormFieldErrors({});

      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      let result;
      if (editingInvoice) {
        result = await updateInvoice(editingInvoice._id, invoiceData);
      } else {
        result = await addInvoice(invoiceData);
      }

      if (result.success) {
        handleCloseDialog();
      } else {
        // Handle backend validation errors
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFormFieldErrors(result.fieldErrors);
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

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(invoiceId);
    }
  };

  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleViewDetails = async () => {
    if (!selectedInvoice || !selectedInvoice._id) {
      console.error('No invoice selected or missing ID');
      return;
    }

    setViewDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');
    setDetailedInvoice(null);
    handleMenuClose();

    try {
      const result = await getInvoice(selectedInvoice._id);
      if (result.success) {
        setDetailedInvoice(result.data);
      } else {
        setDetailsError(result.error || 'Failed to fetch invoice details');
        // Fallback to using the selected invoice data if API fails
        setDetailedInvoice(selectedInvoice);
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setDetailsError('Failed to fetch invoice details');
      // Fallback to using the selected invoice data if API fails
      setDetailedInvoice(selectedInvoice);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePrintInvoice = (invoice) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.client_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; }
          .invoice-title { font-size: 18px; margin-top: 10px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details, .client-details { width: 48%; }
          .invoice-details h3, .client-details h3 { background-color: #f5f5f5; padding: 10px; margin: 0 0 10px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; }
          .amount-section { text-align: right; margin-top: 30px; }
          .total-amount { font-size: 24px; font-weight: bold; color: #1976d2; background-color: #e3f2fd; padding: 15px; display: inline-block; }
          .status-badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; }
          .status-paid { background-color: #4caf50; }
          .status-unpaid { background-color: #ff9800; }
          .status-overdue { background-color: #f44336; }
          .description-section { margin-top: 30px; }
          .description-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1976d2; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Trendora</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-details">
            <h3>INVOICE DETAILS</h3>
            <div class="info-row">
              <span class="info-label">Invoice ID:</span>
              <span>${invoice._id ? invoice._id.substring(0, 12) + '...' : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Type:</span>
              <span>${invoice.invoice_type ? invoice.invoice_type.charAt(0).toUpperCase() + invoice.invoice_type.slice(1) : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Due Date:</span>
              <span>${formatDate(invoice.due_date)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status-badge status-${invoice.status || 'unpaid'}">${(invoice.status || 'unpaid').toUpperCase()}</span>
            </div>
          </div>
          
          <div class="client-details">
            <h3>CLIENT DETAILS</h3>
            <div class="info-row">
              <span class="info-label">Client Name:</span>
              <span>${invoice.client_name || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="description-section">
          <h3>DESCRIPTION</h3>
          <div class="description-box">
            ${invoice.description || 'No description provided'}
          </div>
        </div>
        
        <div class="amount-section">
          <div class="total-amount">
            TOTAL AMOUNT: ${formatCurrency(invoice.amount || 0)}
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for the content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
    
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                clearError();
                fetchInvoices();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Invoices Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID & Type</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No invoices found. Create your first invoice to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice._id ? invoice._id.substring(0, 8) + '...' : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.invoice_type || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice.client_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoice.amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status || 'unpaid'}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(invoice.due_date)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, invoice)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          
          {/* Pagination Controls */}
          {totalInvoices > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2,
              borderTop: '1px solid #e2e8f0'
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {invoices.length} of {totalInvoices} invoices
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Per page</InputLabel>
                <Select
                  value={pageSize}
                  onChange={(e) => changePageSize(e.target.value)}
                  label="Per page"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          
          {/* SimplePagination Component */}
          {totalPages > 1 && (
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalInvoices}
              pageSize={pageSize}
              onPageChange={goToPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
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

            {/* Field errors are now displayed directly on the form fields */}

            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>

            <FormControl fullWidth required error={!!formFieldErrors.invoice_type}>
              <InputLabel>Invoice Type</InputLabel>
              <Select
                value={formData.invoice_type}
                onChange={handleInputChange('invoice_type')}
                label="Invoice Type"
              >
                <MenuItem value="customer">Customer Invoice</MenuItem>
                <MenuItem value="vendor">Vendor Invoice</MenuItem>
              </Select>
              {formFieldErrors.invoice_type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {formFieldErrors.invoice_type}
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
              error={!!formFieldErrors.amount}
              helperText={formFieldErrors.amount || "Invoice amount in Egyptian Pounds (EGP)"}
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
              error={!!formFieldErrors.client_name}
              helperText={formFieldErrors.client_name || "Name of the client or company (3-100 characters)"}
              inputProps={{ minLength: 3, maxLength: 100 }}
            />

            <Divider />

            <Typography variant="h6" gutterBottom>
              Invoice Settings
            </Typography>

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange('due_date')}
              InputLabelProps={{ shrink: true }}
              required
              error={!!formFieldErrors.due_date}
              helperText={formFieldErrors.due_date || "Payment due date for this invoice"}
            />

            <FormControl fullWidth error={!!formFieldErrors.status}>
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
              {formFieldErrors.status && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {formFieldErrors.status}
                </Typography>
              )}
            </FormControl>

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
              error={!!formFieldErrors.description}
              helperText={formFieldErrors.description || "Detailed description of what this invoice covers (max 1000 characters)"}
              inputProps={{ maxLength: 1000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {editingInvoice ? 'Update' : 'Create'} Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Info fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleOpenDialog(selectedInvoice);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handlePrintInvoice(selectedInvoice);
        }}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Invoice</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDelete(selectedInvoice?._id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onClose={() => setViewDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Invoice Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading invoice details...
              </Typography>
            </Box>
          ) : detailsError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {detailsError}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Showing cached data below
              </Typography>
            </Box>
          ) : detailedInvoice ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Invoice Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Invoice ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {detailedInvoice._id ? detailedInvoice._id.substring(0, 12) + '...' : detailedInvoice.id ? detailedInvoice.id.substring(0, 12) + '...' : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Invoice Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {detailedInvoice.invoice_type ? detailedInvoice.invoice_type.charAt(0).toUpperCase() + detailedInvoice.invoice_type.slice(1) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={detailedInvoice.status || 'unpaid'}
                      color={getStatusColor(detailedInvoice.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Due Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(detailedInvoice.due_date || detailedInvoice.dueDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Client Information</Typography>
                <Typography variant="body2" color="text.secondary">Client Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {detailedInvoice.client_name || detailedInvoice.clientName || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Amount</Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(detailedInvoice.amount || 0)}
                </Typography>
              </Box>

              {(detailedInvoice.description || detailedInvoice.Description) && (
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1">
                    {detailedInvoice.description || detailedInvoice.Description}
                  </Typography>
                </Box>
              )}

              {/* Additional fields that might come from the API */}
              {detailedInvoice.createdAt && (
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Additional Information</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Created At</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(detailedInvoice.createdAt)}
                      </Typography>
                    </Grid>
                    {detailedInvoice.updatedAt && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Updated At</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(detailedInvoice.updatedAt)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Stack>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No invoice data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={() => {
              handlePrintInvoice(detailedInvoice || selectedInvoice);
              setViewDetailsOpen(false);
            }}
            disabled={!detailedInvoice && !selectedInvoice}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceManagement;
