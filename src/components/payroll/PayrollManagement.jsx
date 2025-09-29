import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
  People,
  TrendingUp
} from '@mui/icons-material';
import { usePayroll } from '../../hooks/usePayrollData';
import { useEmployees } from '../../hooks/useHRData';
import PayrollForm from './PayrollForm';

const PayrollManagement = () => {
  const { 
    payroll, 
    loading, 
    error, 
    generatePayslip,
    updatePayroll, 
    deletePayroll,
    getPayslip 
  } = usePayroll();
  const { employees } = useEmployees();

  // Use real data from backend
  const currentPayroll = payroll || [];
  const currentEmployees = employees || [];
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [viewingPayroll, setViewingPayroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Helper function to get employee name
  const getEmployeeName = (employeeId) => {
    const employee = currentEmployees.find(emp => emp.id === employeeId || emp._id === employeeId);
    return employee ? `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim() : 'Unknown Employee';
  };

  // Format date for display
  const formatPayDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Format as "Jul 31, 2025" (Month Day, Year)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Helper function to calculate net pay
  const calculateNetPay = (payrollItem) => {
    const baseSalary = Number(payrollItem.baseSalary || payrollItem.base_salary || 0);
    const bonuses = Number(payrollItem.bonuses || 0);
    const overtimeHours = Number(payrollItem.overtimeHours || payrollItem.overtime_hours || 0);
    const overtimeRate = Number(payrollItem.overtimeRate || payrollItem.overtime_rate || 0);
    const benefits = Number(payrollItem.benefits || 0);
    const deductions = Number(payrollItem.deductions || 0);
    const taxes = Number(payrollItem.taxes || 0);

    return baseSalary + bonuses + (overtimeHours * overtimeRate) + benefits - deductions - taxes;
  };

  // Filter payroll data
  const filteredPayroll = currentPayroll.filter(item => {
    const employeeName = getEmployeeName(item.employeeId || item.employee_id || item.id);
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddClick = () => {
    setUserError('');
    setUserSuccess('');
    setEditingPayroll(null);
    setShowAddDialog(true);
  };

  const handleEdit = (payrollItem) => {
    console.log('PayrollManagement: handleEdit called with payrollItem:', payrollItem);
    console.log('PayrollManagement: payrollItem keys:', Object.keys(payrollItem));
    console.log('PayrollManagement: payrollItem ID fields:', {
      id: payrollItem.id,
      _id: payrollItem._id,
      employeeId: payrollItem.employeeId,
      employee_id: payrollItem.employee_id
    });
    
    setUserError('');
    setUserSuccess('');
    setEditingPayroll(payrollItem);
    setShowEditDialog(true);
  };

  const handleView = async (payrollItem) => {
    try {
      setUserError('');
      setUserSuccess('');
      const payslipData = await getPayslip(payrollItem.id || payrollItem._id);
      setViewingPayroll(payslipData);
      setShowViewDialog(true);
    } catch (error) {
      console.error('Error fetching payslip:', error);
      setUserError(`Failed to fetch payslip: ${error.message}`);
    }
  };

  const handleDeleteClick = (payrollItem) => {
    setUserError('');
    setUserSuccess('');
    setEditingPayroll(payrollItem);
  };

  const handleDeleteConfirm = async () => {
    try {
      setUserError('');
      setUserSuccess('');
      await deletePayroll(editingPayroll.id || editingPayroll._id);
      setUserSuccess(`Payroll record for "${getEmployeeName(editingPayroll.employeeId || editingPayroll.employee_id)}" deleted successfully!`);
      setEditingPayroll(null);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting payroll:', error);
      setUserError(`Failed to delete payroll record: ${error.message}`);
    }
  };

  const handleAddPayroll = async (payrollData) => {
    try {
      setUserError('');
      setUserSuccess('');
      await generatePayslip(payrollData.id, payrollData);
      setUserSuccess(`Payslip generated for "${getEmployeeName(payrollData.id)}" successfully!`);
      setShowAddDialog(false);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      console.error('Error generating payslip:', error);
      setUserError(`Failed to generate payslip: ${error.message}`);
    }
  };

  const handleUpdatePayroll = async (payrollData) => {
    try {
      console.log('=== PAYROLL MANAGEMENT UPDATE START ===');
      console.log('PayrollManagement: handleUpdatePayroll called with:', payrollData);
      console.log('PayrollManagement: editingPayroll:', editingPayroll);
      
      // Try to find the correct payroll ID
      const payrollId = editingPayroll.id || editingPayroll._id;
      console.log('PayrollManagement: payroll ID to use:', payrollId);
      console.log('PayrollManagement: all editingPayroll fields:', Object.keys(editingPayroll));
      
      if (!payrollId) {
        console.error('PayrollManagement: No payroll ID found!');
        throw new Error('Payroll ID not found in editing payroll data');
      }
      
      setUserError('');
      setUserSuccess('');
      
      console.log('PayrollManagement: About to call updatePayroll with ID:', payrollId);
      const result = await updatePayroll(payrollId, payrollData);
      console.log('PayrollManagement: updatePayroll result:', result);
      console.log('=== PAYROLL MANAGEMENT UPDATE SUCCESS ===');
      
      setUserSuccess(`Payroll record for "${getEmployeeName(editingPayroll.employeeId || editingPayroll.employee_id || editingPayroll.id)}" updated successfully!`);
      setShowEditDialog(false);
      setEditingPayroll(null);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      console.error('=== PAYROLL MANAGEMENT UPDATE ERROR ===');
      console.error('PayrollManagement: Error updating payroll:', error);
      console.error('PayrollManagement: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      setUserError(`Failed to update payroll record: ${error.message}`);
    }
  };

  // Calculate statistics
  const totalPayroll = filteredPayroll.reduce((sum, item) => sum + calculateNetPay(item), 0);
  const averagePayroll = filteredPayroll.length > 0 ? totalPayroll / filteredPayroll.length : 0;
  const totalEmployees = currentEmployees.length;

  if (loading) {
        return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Payroll Management
          </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
          sx={{ minWidth: 150 }}
        >
          Generate Payslip
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {userSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setUserSuccess('')}
        >
          {userSuccess}
        </Alert>
      )}
      
      {userError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setUserError('')}
        >
          {userError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    ${totalPayroll.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payroll
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    ${averagePayroll.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Pay
          </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    {filteredPayroll.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payroll Records
          </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    {totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
          <TextField
          fullWidth
          placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Payroll Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Bonuses</TableCell>
              <TableCell>Overtime</TableCell>
              <TableCell>Benefits</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Taxes</TableCell>
              <TableCell>Net Pay</TableCell>
              <TableCell>Pay Period</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayroll.map((item) => {
              const netPay = calculateNetPay(item);
              return (
                <TableRow key={item.id || item._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {getEmployeeName(item.employeeId || item.employee_id || item.id)}
                    </Typography>
                  </TableCell>
                  <TableCell>${Number(item.baseSalary || item.base_salary || 0).toFixed(2)}</TableCell>
                  <TableCell>${Number(item.bonuses || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    ${((Number(item.overtimeHours || item.overtime_hours || 0)) * (Number(item.overtimeRate || item.overtime_rate || 0))).toFixed(2)}
                  </TableCell>
                  <TableCell>${Number(item.benefits || 0).toFixed(2)}</TableCell>
                  <TableCell>${Number(item.deductions || 0).toFixed(2)}</TableCell>
                  <TableCell>${Number(item.taxes || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ${netPay.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatPayDate(item.payDate || item.pay_date)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleView(item)}
                      title="View Payslip"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEdit(item)}
                      title="Edit Payroll"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(item)}
                      title="Delete Payroll"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Payslip Form */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)} 
        maxWidth="md" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent>
          <PayrollForm
            onSave={handleAddPayroll}
            onCancel={() => setShowAddDialog(false)}
            employees={currentEmployees}
            existingPayroll={currentPayroll}
            isInDialog={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Payslip Form */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => {
          setShowEditDialog(false);
          setEditingPayroll(null);
        }}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Edit Payroll</DialogTitle>
        <DialogContent>
          <PayrollForm
            payroll={editingPayroll}
            onSave={handleUpdatePayroll}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingPayroll(null);
            }}
            employees={currentEmployees}
            loading={loading}
            existingPayroll={currentPayroll}
            isInDialog={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Payslip Dialog */}
      <Dialog 
        open={showViewDialog} 
        onClose={() => setShowViewDialog(false)}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Payslip Details</DialogTitle>
        <DialogContent>
          {viewingPayroll && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {getEmployeeName(viewingPayroll.employeeId || viewingPayroll.employee_id)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Base Salary:</strong> ${Number(viewingPayroll.baseSalary || viewingPayroll.base_salary || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Bonuses:</strong> ${Number(viewingPayroll.bonuses || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Overtime Hours:</strong> {Number(viewingPayroll.overtimeHours || viewingPayroll.overtime_hours || 0)}</Typography>
                  <Typography variant="body2"><strong>Overtime Rate:</strong> ${Number(viewingPayroll.overtimeRate || viewingPayroll.overtime_rate || 0).toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Benefits:</strong> ${Number(viewingPayroll.benefits || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Deductions:</strong> ${Number(viewingPayroll.deductions || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Taxes:</strong> ${Number(viewingPayroll.taxes || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Net Pay:</strong> ${calculateNetPay(viewingPayroll).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!editingPayroll && !showAddDialog && !showEditDialog} 
        onClose={() => setEditingPayroll(null)}
        disableRestoreFocus
      >
        <DialogTitle>Delete Payroll Record</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the payroll record for "{editingPayroll && getEmployeeName(editingPayroll.employeeId || editingPayroll.employee_id)}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPayroll(null)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollManagement;