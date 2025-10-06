import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { AccountBalance, TrendingUp, AttachMoney, Assessment, Receipt, Timeline, CreditCard, Support, EventNote } from '@mui/icons-material';
import InvoiceManagement from './InvoiceManagement';
import { useAccountingData } from '../../hooks/useAccountingData';
import { useAuth } from '../../contexts/AuthContext';

const AccountingDepartment = () => {
  const { user } = useAuth();
  
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
  const [formData, setFormData] = useState({
    invoice_type: 'customer',
    client_name: '',
    description: '',
    amount: '',
    due_date: '',
    status: 'unpaid'
  });
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: '',
    type: 'income',
    date: new Date().toISOString().split('T')[0]
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [transactionFieldErrors, setTransactionFieldErrors] = useState({});
  const [transactionSubmitError, setTransactionSubmitError] = useState('');

  const { addInvoice } = useAccountingData();

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
      status: 'unpaid'
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

      const transaction = {
        ...transactionData,
        amount: parseFloat(transactionData.amount)
      };

      // For now, we'll just log it since we don't have a transaction API
('New Transaction:', transaction);
      
      // Close dialog and reset form
      setShowTransactionDialog(false);
      setTransactionData({
        description: '',
        amount: '',
        type: 'income',
        date: new Date().toISOString().split('T')[0]
      });
      setTransactionFieldErrors({});
      setTransactionSubmitError('');
      
      // Show success message (you can replace this with a proper notification)
      alert('Transaction created successfully!');
    } catch (err) {
('Error creating transaction:', err);
      setTransactionSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCloseTransactionDialog = () => {
    setShowTransactionDialog(false);
    setTransactionData({
      description: '',
      amount: '',
      type: 'income',
      date: new Date().toISOString().split('T')[0]
    });
    setTransactionFieldErrors({});
    setTransactionSubmitError('');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      p: 3,
      fontSize: '13px'
    }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $125,430
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $89,210
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $36,220
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $245,890
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cash Balance
                  </Typography>
                </Box>
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
                sx={{ py: 1.5, borderRadius: 2, fontSize: '13px' }}
              >
                Record Payment
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
              { id: 'reports', label: 'Reports', icon: Assessment },
              { id: 'analytics', label: 'Analytics', icon: Timeline }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AttachMoney />}
                onClick={() => setShowTransactionDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                New Transaction
              </Button>
            </Box>
            <Stack spacing={2}>
              {[
                { id: 1, description: 'Office Supplies Purchase', amount: '$1,250', type: 'expense', date: '2024-01-15' },
                { id: 2, description: 'Client Payment - Project Alpha', amount: '$5,000', type: 'income', date: '2024-01-14' },
                { id: 3, description: 'Software License Renewal', amount: '$2,400', type: 'expense', date: '2024-01-13' },
                { id: 4, description: 'Consulting Services', amount: '$3,200', type: 'income', date: '2024-01-12' },
              ].map((transaction) => (
                <Box
                  key={transaction.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {transaction.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.date}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: transaction.type === 'income' ? 'success.main' : 'error.main'
                      }}
                    >
                      {transaction.amount}
                    </Typography>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
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
            {Object.keys(fieldErrors).length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Field Errors Found:</strong>
                </Typography>
                {Object.entries(fieldErrors).map(([field, error]) => (
                  <Typography key={field} variant="caption" display="block">
                    {field}: {error}
                  </Typography>
                ))}
              </Alert>
            )}

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
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {fieldErrors.status}
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Financial Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Financial reports and statements will be displayed here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Financial Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Financial analytics and insights will be shown here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* New Transaction Dialog */}
      <Dialog open={showTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            New Transaction
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Error Alert */}
            {transactionSubmitError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setTransactionSubmitError('')}
              >
                {transactionSubmitError}
              </Alert>
            )}

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
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {transactionFieldErrors.type}
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
            Create Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingDepartment;
