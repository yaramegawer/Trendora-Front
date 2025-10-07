import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  Person,
  Email,
  Phone,
  Business,
  CalendarToday,
  AttachMoney,
  Print
} from '@mui/icons-material';
import { usePayroll } from '../../hooks/usePayrollData';
import SimplePagination from '../common/SimplePagination';
import { useEmployees } from '../../hooks/useHRData';
import { useAuth } from '../../contexts/AuthContext';
// Authorization removed - all authenticated users can manage payroll

const PayrollStatus = {
  PENDING: 'Pending',
  PROCESSED: 'Processed',
  PAID: 'Paid'
};

// PayrollForm Component
const PayrollForm = ({ payroll, onSave, onCancel, employees = [], loading = false, existingPayroll = [], isInDialog = false }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriod: new Date(),
    baseSalary: '',
    bonuses: '',
    deductions: '',
    overtimeHours: '',
    overtimeRate: '',
    benefits: '',
    taxes: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Check if this is editing existing payroll or creating new one
  const isEditing = !!payroll;

  // Check for duplicate payroll in same month
  const checkDuplicatePayroll = (employeeId, payDate) => {
    if (!employeeId || !payDate) return false;
    
    const payMonth = new Date(payDate).getMonth();
    const payYear = new Date(payDate).getFullYear();
    
    return existingPayroll.some(pay => {
      // Skip current payroll if editing
      if (isEditing && pay._id === payroll._id) return false;
      
      const existingEmployeeId = pay.employee?._id;
      const existingPayDate = new Date(pay.payDate);
      const existingMonth = existingPayDate.getMonth();
      const existingYear = existingPayDate.getFullYear();
      
      return existingEmployeeId === employeeId && 
             existingMonth === payMonth && 
             existingYear === payYear;
    });
  };

  useEffect(() => {
    if (payroll) {
      // Handle different data structures for employee ID
      const employeeId = payroll.employee?._id || 
                        payroll.employee?.id || 
                        payroll.employeeId || 
                        payroll.employee_id || 
                        '';
      
      // Handle different data structures for pay date
      const payDate = payroll.payDate || payroll.pay_date;
      
      // Handle different data structures for salary fields
      const baseSalary = payroll.baseSalary || payroll.base_salary || '';
      const overtimeHours = payroll.overtimeHours || payroll.overtime_hours || '';
      const overtimeRate = payroll.overtimeRate || payroll.overtime_rate || '';
      
      setFormData({
        employeeId: employeeId,
        payPeriod: payDate ? new Date(payDate) : new Date(),
        baseSalary: baseSalary,
        bonuses: payroll.bonuses || '',
        deductions: payroll.deductions || '',
        overtimeHours: overtimeHours,
        overtimeRate: overtimeRate,
        benefits: payroll.benefits || '',
        taxes: payroll.taxes || '',
        status: payroll.status || 'pending'
      });
    }
  }, [payroll]);

  const calculateNetSalary = () => {
    const gross = calculateGrossSalary();
    const deductions = calculateDeductions();
    return gross - deductions;
  };

  const calculateDeductions = () => {
    const deductions = parseFloat(formData.deductions) || 0;
    const taxes = parseFloat(formData.taxes) || 0;
    return deductions + taxes;
  };

  const calculateGrossSalary = () => {
    const baseSalary = parseFloat(formData.baseSalary) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const overtimeHours = parseFloat(formData.overtimeHours) || 0;
    const overtimeRate = parseFloat(formData.overtimeRate) || 0;
    const benefits = parseFloat(formData.benefits) || 0;
    const overtimePay = overtimeHours * overtimeRate;
    return baseSalary + bonuses + overtimePay + benefits;
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee validation (only for new payrolls)
    if (!isEditing) {
      if (!formData.employeeId) {
        newErrors.employeeId = 'Employee is required';
      } else {
        // Validate MongoDB ObjectId format (24 character hex string)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(formData.employeeId)) {
          newErrors.employeeId = 'Invalid employee ID format';
        } else {
          // Check for duplicate payroll in same month
          if (checkDuplicatePayroll(formData.employeeId, formData.payPeriod)) {
            newErrors.employeeId = 'Payroll already exists for this employee in this month';
          }
        }
      }
    }

    // Pay period validation (required for both create and update)
    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay period is required';
    }

    // Base salary validation (required for both create and update)
    if (formData.baseSalary === '' || formData.baseSalary === null || formData.baseSalary === undefined) {
      newErrors.baseSalary = 'Base salary is required';
    } else {
      const numValue = parseFloat(formData.baseSalary);
      if (isNaN(numValue)) {
        newErrors.baseSalary = 'Base salary must be a valid number';
      } else if (numValue < 0) {
        newErrors.baseSalary = 'Base salary cannot be negative';
      } else if (numValue > 999999999 || !Number.isFinite(numValue)) {
        newErrors.baseSalary = 'Base salary is too large (maximum: EGP 999,999,999)';
      } else if (numValue > 0 && numValue < 0.01) {
        newErrors.baseSalary = 'Base salary is too small (minimum: EGP 0.01)';
      }
    }

    // Validate numeric fields (only if they have values)
    const numericFields = ['bonuses', 'deductions', 'overtimeHours', 'overtimeRate', 'benefits', 'taxes'];
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = `${field} must be a number greater than or equal to 0`;
        }
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Temporary debugging
      console.log('PayrollForm: handleSubmit called');
      console.log('PayrollForm: isEditing:', isEditing);
      console.log('PayrollForm: formData:', formData);
      console.log('PayrollForm: onSave exists:', !!onSave);
    
    const isValid = validateForm();
    console.log('PayrollForm: Form is valid:', isValid);
    
    if (!isValid) {
      console.log('PayrollForm: Form validation failed');
      return;
    }
    
    if (!onSave) {
      console.log('PayrollForm: onSave function not provided');
      setSubmitError('Save function not available');
      return;
    }
    
    try {
      setSubmitError('');
      setErrors({});
      
      // Map PayrollForm fields to backend schema
      const backendData = {};

      // Only include fields that have values (since all fields are optional in update schema)
      if (formData.baseSalary !== '' && formData.baseSalary !== null && formData.baseSalary !== undefined) {
        backendData.baseSalary = parseFloat(formData.baseSalary);
      }
      
      if (formData.bonuses !== '' && formData.bonuses !== null && formData.bonuses !== undefined) {
        backendData.bonuses = parseFloat(formData.bonuses);
      }
      
      if (formData.deductions !== '' && formData.deductions !== null && formData.deductions !== undefined) {
        backendData.deductions = parseFloat(formData.deductions);
      }
      
      if (formData.payPeriod) {
        backendData.payDate = formData.payPeriod.toISOString();
      }
      
      if (formData.overtimeHours !== '' && formData.overtimeHours !== null && formData.overtimeHours !== undefined) {
        backendData.overtimeHours = parseFloat(formData.overtimeHours);
      }
      
      if (formData.overtimeRate !== '' && formData.overtimeRate !== null && formData.overtimeRate !== undefined) {
        backendData.overtimeRate = parseFloat(formData.overtimeRate);
      }
      
      if (formData.benefits !== '' && formData.benefits !== null && formData.benefits !== undefined) {
        backendData.benefits = parseFloat(formData.benefits);
      }
      
      if (formData.taxes !== '' && formData.taxes !== null && formData.taxes !== undefined) {
        backendData.taxes = parseFloat(formData.taxes);
      }

      // For new payroll, include employee ID
      if (!isEditing) {
        backendData.id = formData.employeeId;
      }

      // Add status field for update schema (only when editing)
      if (isEditing && formData.status) {
        backendData.status = formData.status;
      }
      
      console.log('PayrollForm: Calling onSave with data:', backendData);
      await onSave(backendData);
      console.log('PayrollForm: onSave completed successfully');
    } catch (error) {
      console.log('PayrollForm: Error in handleSubmit:', error);
      setSubmitError(error.message || 'Failed to save payroll');
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId || emp._id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  const formContent = (
    <Stack spacing={3} className="pt-4">
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
        <Stack spacing={3}>
          {/* Only show employee field for new payrolls */}
          {!isEditing && (
            <FormControl fullWidth required error={!!errors.employeeId}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                label="Employee"
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              </Select>
              {errors.employeeId && (
                <Typography variant="caption" color="error" className="mt-1 ml-3">
                  {errors.employeeId}
                </Typography>
              )}
            </FormControl>
          )}
          
          {/* Show employee info for editing */}
          {isEditing && payroll?.employee && (
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Employee (Cannot be changed)
              </Typography>
              <Typography variant="body1">
                {payroll.employee.firstName} {payroll.employee.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {payroll.employee.email}
              </Typography>
            </Box>
          )}

          <TextField
            label="Pay Period"
            type="date"
            value={formData.payPeriod ? formData.payPeriod.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('payPeriod', new Date(e.target.value))}
            error={!!errors.payPeriod}
            helperText={errors.payPeriod || 'Click to open calendar and select a date'}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Divider />

        <Typography variant="h6" gutterBottom>
          Salary Components
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Base Salary"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleChange('baseSalary', e.target.value)}
            error={!!errors.baseSalary}
            helperText={errors.baseSalary}
            required
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Bonuses"
            type="number"
            value={formData.bonuses}
            onChange={(e) => handleChange('bonuses', e.target.value)}
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Overtime Hours"
            type="number"
            value={formData.overtimeHours}
            onChange={(e) => handleChange('overtimeHours', e.target.value)}
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Overtime Rate (per hour)"
            type="number"
            value={formData.overtimeRate}
            onChange={(e) => handleChange('overtimeRate', e.target.value)}
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Benefits"
            type="number"
            value={formData.benefits}
            onChange={(e) => handleChange('benefits', e.target.value)}
            helperText="Allowances, insurance contributions, etc."
            inputProps={{ min: 0 }}
          />
        </Stack>

        <Divider />

        <Typography variant="h6" gutterBottom>
          Deductions
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Deductions"
            type="number"
            value={formData.deductions}
            onChange={(e) => handleChange('deductions', e.target.value)}
            helperText="General deductions (insurance, etc.)"
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Taxes"
            type="number"
            value={formData.taxes}
            onChange={(e) => handleChange('taxes', e.target.value)}
            helperText="Auto-calculated or manually entered"
            inputProps={{ min: 0 }}
          />
        </Stack>

        {/* Status field for editing */}
        {isEditing && (
          <Stack spacing={3} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payroll Summary
            </Typography>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Base Salary:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    EGP {parseFloat(formData.baseSalary || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Benefits:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +EGP {parseFloat(formData.benefits || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overtime Pay:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +EGP {((parseFloat(formData.overtimeHours || 0) * parseFloat(formData.overtimeRate || 0))).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Bonuses:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +EGP {parseFloat(formData.bonuses || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                Gross Pay: EGP {calculateGrossSalary().toLocaleString()}
              </Typography>
              
              <Divider />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Deductions:
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -EGP {parseFloat(formData.deductions || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Taxes:
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -EGP {parseFloat(formData.taxes || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                Total Deductions: EGP {calculateDeductions().toLocaleString()}
              </Typography>
              
              <Divider sx={{ borderWidth: 2, borderColor: 'primary.main' }} />
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'primary.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" color="white" sx={{ fontWeight: 'bold' }}>
                  Net Pay: EGP {calculateNetSalary().toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
  );

  if (isInDialog) {
    return (
      <form onSubmit={handleSubmit}>
        {formContent}
        <DialogActions className="pt-6">
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="bg-primary-main hover:bg-primary-dark"
            disabled={loading}
          >
            {loading ? 'Saving...' : (payroll ? 'Update Payroll' : 'Generate Payroll')}
          </Button>
        </DialogActions>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {formContent}
      <DialogActions className="pt-6">
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className="bg-primary-main hover:bg-primary-dark"
          disabled={loading}
        >
          {loading ? 'Saving...' : (payroll ? 'Update Payroll' : 'Generate Payroll')}
        </Button>
      </DialogActions>
    </form>
  );
};

const PayrollManagement = () => {
  // Server-side pagination state - declare first
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { 
    payroll, 
    loading, 
    error, 
    totalPayroll,
    generatePayslip, 
    updatePayroll, 
    deletePayroll,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  } = usePayroll(currentPage, pageSize);
  const { employees } = useEmployees();
  const { user } = useAuth();

  // Use only real data from database - no fallback
  const currentPayroll = payroll || [];
  const currentEmployees = employees || [];
  
  // Use payroll records as they come from backend (backend handles sorting)
  const sortedPayroll = currentPayroll;
  
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const handleAddPayroll = async (payrollData) => {
    // Allow all authenticated users to add payroll
    
    try {
      setUserError('');
      setUserSuccess('');
      
      // Use the id field from payrollData (which should be the employee ID)
      await generatePayslip(payrollData.id, payrollData);
      setUserSuccess('Payslip generated successfully!');
      setShowAddDialog(false);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      setUserError(`Failed to generate payslip: ${error.message}`);
    }
  };

  const handleUpdatePayroll = async (payrollData) => {
    try {
      setUserError('');
      setUserSuccess('');
      
      await updatePayroll(editingPayroll._id, payrollData);
      
      setUserSuccess('Payroll updated successfully!');
      setShowEditDialog(false);
      setEditingPayroll(null);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      setUserError(`Failed to update payroll: ${error.message}`);
    }
  };

  const handleEdit = (payroll) => {
    // Allow all authenticated users to edit payroll
    
    setUserError('');
    setUserSuccess('');
    setEditingPayroll(payroll);
    setShowEditDialog(true);
  };

  const handleDelete = async (payrollId) => {
    // Allow all authenticated users to delete payroll
    
    if (!payrollId) {
      setUserError('Invalid payroll ID for deletion');
      return;
    }

    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        setUserError('');
        setUserSuccess('');
        
        console.log('PayrollManagement: Deleting payroll with ID:', payrollId);
        await deletePayroll(payrollId);
        
        setUserSuccess('Payroll deleted successfully!');
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setUserSuccess(''), 3000);
      } catch (error) {
        console.log('PayrollManagement: Error deleting payroll:', error);
        setUserError(`Failed to delete payroll: ${error.message}`);
      }
    }
  };

  const handleAddClick = () => {
    // Allow all authenticated users to add payroll
    
    setUserError('');
    setUserSuccess('');
    setShowAddDialog(true);
  };

  const handleMenuClick = (event, payroll) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayroll(payroll);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayroll(null);
  };

  const handlePrintPayslip = (payroll) => {
    if (!payroll) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Get employee name
    const employeeName = getEmployeeNameFromPayroll(payroll);
    
    // Calculate net pay if not available
    const netPay = payroll.netPay || (payroll.baseSalary + (payroll.bonuses || 0) + ((payroll.overtimeHours || 0) * (payroll.overtimeRate || 0)) + (payroll.benefits || 0) - (payroll.deductions || 0) - (payroll.taxes || 0));
    
    // Create payslip HTML
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - {employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; }
          .payslip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .info-label { font-weight: bold; }
          .earnings, .deductions { margin-bottom: 20px; }
          .earnings h3, .deductions h3 { background-color: #f5f5f5; padding: 10px; margin: 0 0 10px 0; }
          .earnings-row, .deductions-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; padding: 15px 0; border-top: 2px solid #333; margin-top: 20px; }
          .net-pay { background-color: #e3f2fd; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; color: #1976d2; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Trendora Company</div>
          <div class="payslip-title">PAYSLIP</div>
        </div>
        
        <div class="employee-info">
          <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span>{employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Pay Period:</span>
            <span>{formatPayDate(payroll.payDate) || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span>{payroll.status || 'N/A'}</span>
          </div>
        </div>
        
        <div class="earnings">
          <h3>EARNINGS</h3>
          <div class="earnings-row">
            <span>Base Salary</span>
            <span>EGP {(payroll.baseSalary || 0).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Bonuses</span>
            <span>EGP {(payroll.bonuses || 0).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Overtime ({payroll.overtimeHours || 0} hrs × EGP {payroll.overtimeRate || 0})</span>
            <span>EGP {((payroll.overtimeHours || 0) * (payroll.overtimeRate || 0)).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Benefits</span>
            <span>EGP {(payroll.benefits || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Total Earnings</span>
            <span>EGP {((payroll.baseSalary || 0) + (payroll.bonuses || 0) + ((payroll.overtimeHours || 0) * (payroll.overtimeRate || 0)) + (payroll.benefits || 0)).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="deductions">
          <h3>DEDUCTIONS</h3>
          <div class="deductions-row">
            <span>Deductions</span>
            <span>EGP {(payroll.deductions || 0).toLocaleString()}</span>
          </div>
          <div class="deductions-row">
            <span>Taxes</span>
            <span>EGP {(payroll.taxes || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Total Deductions</span>
            <span>EGP {((payroll.deductions || 0) + (payroll.taxes || 0)).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="net-pay">
          NET PAY: EGP {netPay.toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.write(payslipHTML);
    printWindow.document.close();
    
    // Wait for the content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'success';
      case 'processed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Create a mapping function to handle employee ID mismatches
  const createEmployeeMapping = () => {
    const mapping = {};
    
    // Map employees by all possible ID fields
    currentEmployees.forEach(emp => {
      const id = emp.id || emp._id;
      if (id) {
        // Convert id to string and add to mapping
        const idStr = String(id);
        mapping[idStr] = emp;
        // Also create mapping for partial matches (first 8 characters)
        if (idStr.length >= 8) {
          mapping[idStr.substring(0, 8)] = emp;
        }
      }
    });
    
    return mapping;
  };

  const getEmployeeName = (employeeId) => {
    // Safety check for employeeId
    if (!employeeId) {
      return 'Unknown Employee (No ID)';
    }
    
    // Debug: Log employee lookup
    console.log('Looking up employee with ID:', employeeId);
    console.log('Available employees:', currentEmployees.map(emp => ({ id: emp.id || emp._id, name: `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.trim() })));
    
    // Check manual mappings first
    const employeeIdStr = String(employeeId);
    if (employeeMappings[employeeIdStr]) {
      const mappedEmployee = currentEmployees.find(emp => 
        String(emp.id || emp._id) === String(employeeMappings[employeeIdStr])
      );
      if (mappedEmployee) {
        const name = `${mappedEmployee.firstName || mappedEmployee.first_name || ''} ${mappedEmployee.lastName || mappedEmployee.last_name || ''}`.trim();
        return name ? `${name} (Mapped)` : 'Unknown Employee (Mapped)';
      }
    }
    
    // Create employee mapping for better lookup
    const employeeMapping = createEmployeeMapping();
    
    // Try exact match first
    let employee = employeeMapping[employeeIdStr];
    
    // If no exact match, try partial match (first 8 characters)
    if (!employee && employeeIdStr.length >= 8) {
      employee = employeeMapping[employeeIdStr.substring(0, 8)];
    }
    
    // Fallback to original method
    if (!employee) {
      employee = currentEmployees.find(emp => emp.id === employeeId || emp._id === employeeId);
    }
    
    if (employee) {
      const name = `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim();
      console.log('Found employee:', { id: employee.id || employee._id, name });
      return name || 'Unknown Employee';
    }
    
    console.log('No employee found for ID:', employeeIdStr);
    return `Unknown Employee (ID: ${employeeIdStr.substring(0, 8)}...)`;
  };

  // Helper function to get employee name from payroll record (using the nested structure)
  const getEmployeeNameFromPayroll = (payrollRecord) => {
    if (!payrollRecord) {
      return 'Unknown Employee (No Payroll Data)';
    }
    
    // Debug: Log the payroll record structure
    console.log('PayrollRecord structure:', {
      id: payrollRecord.id || payrollRecord._id,
      employeeId: payrollRecord.employeeId,
      employee: payrollRecord.employee,
      keys: Object.keys(payrollRecord)
    });
    
    // Check if employee data is nested in the payroll record
    if (payrollRecord.employee) {
      const employee = payrollRecord.employee;
      const name = `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim();
      
      if (name) {
        return name;
      }
      
      // Fallback to ID lookup if name is not available
      const employeeId = employee._id || employee.id;
      if (employeeId) {
        return getEmployeeName(employeeId);
      }
    }
    
    // Check if employee ID is directly in the payroll record
    const employeeId = payrollRecord.employeeId || payrollRecord.employee_id || payrollRecord.id;
    if (employeeId) {
      return getEmployeeName(employeeId);
    }
    
    // If no employee data at all, try to find by any possible ID field
    const possibleIds = [
      payrollRecord.employee?._id,
      payrollRecord.employee?.id,
      payrollRecord.employeeId,
      payrollRecord.employee_id,
      payrollRecord.id
    ].filter(Boolean);
    
    for (const id of possibleIds) {
      const name = getEmployeeName(id);
      if (name && !name.includes('Unknown Employee')) {
        return name;
      }
    }
    
    return 'Unknown Employee (No Employee Data)';
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
      console.log('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const filteredPayroll = sortedPayroll.filter(pay => {
    // Use the new helper function that handles the nested structure
    const employeeName = getEmployeeNameFromPayroll(pay);
    // Safety check for search term
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch = employeeName.toLowerCase().includes(searchLower);
    
    // Handle status filtering with case-insensitive comparison
    const matchesStatus = statusFilter === 'all' || 
      pay.status?.toLowerCase() === statusFilter?.toLowerCase() ||
      pay.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Server-side pagination - use data from API hooks
  const totalPages = Math.ceil((totalPayroll || 0) / pageSize);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    goToPage(newPage);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    goToPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  // Enhanced employee lookup with better mapping
  const getEmployeeWithMapping = (employeeId) => {
    if (!employeeId) return null;
    
    // Convert employeeId to string for consistent comparison
    const employeeIdStr = String(employeeId);
    
    // Create comprehensive mapping
    const employeeMapping = createEmployeeMapping();
    
    // Try exact match first
    let employee = employeeMapping[employeeIdStr];
    
    // If no exact match, try partial match
    if (!employee && employeeIdStr.length >= 8) {
      employee = employeeMapping[employeeIdStr.substring(0, 8)];
    }
    
    // Fallback to original method
    if (!employee) {
      employee = currentEmployees.find(emp => {
        const empId = String(emp.id || emp._id || '');
        return empId === employeeIdStr;
      });
    }
    
    return employee;
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}


      {/* User Success Message */}
      {userSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setUserSuccess('')}
        >
          {userSuccess}
        </Alert>
      )}

      {/* User Error Message */}
      {userError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setUserError('')}
        >
          {userError}
        </Alert>
      )}


      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Payroll Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
            disabled={false}
          >
            Generate Payroll
          </Button>
        </Box>
      </Box>


      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Payroll
                  </Typography>
                  <Typography variant="h4">
                    EGP {sortedPayroll.reduce((sum, pay) => sum + (pay.netPay || 0), 0).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Paid
                  </Typography>
                  <Typography variant="h4">
                    {sortedPayroll.filter(pay => 
                      pay.status === PayrollStatus.PAID || 
                      pay.status === 'paid' || 
                      pay.status === 'Paid'
                    ).length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {sortedPayroll.filter(pay => 
                      pay.status === PayrollStatus.PENDING || 
                      pay.status === 'pending' || 
                      pay.status === 'Pending'
                    ).length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Employees
                  </Typography>
                  <Typography variant="h4">
                    {currentEmployees.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value={PayrollStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={PayrollStatus.PROCESSED}>Processed</MenuItem>
                  <MenuItem value={PayrollStatus.PAID}>Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Pay Date</TableCell>
                <TableCell>Base Salary</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayroll.map((pay, index) => (
                <TableRow key={`${pay.id || pay._id}-${pay.netPay}-${index}`} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar>
                      {getEmployeeNameFromPayroll(pay).charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {getEmployeeNameFromPayroll(pay)}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                  <TableCell>{formatPayDate(pay.payDate)}</TableCell>
                  <TableCell>EGP {pay.baseSalary?.toLocaleString() || 0}</TableCell>
                  <TableCell>EGP {pay.deductions?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="white" sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 1, display: 'inline-block' }}>
                      EGP {pay.netPay?.toLocaleString() || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pay.status}
                      color={getStatusColor(pay.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, pay)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredPayroll.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No payroll records found.
            </Typography>
          </Box>
        )}
        
        {/* Server-side Pagination - Always visible */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalPayroll}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleEdit(selectedPayroll);
            handleMenuClose();
          }}
          disabled={false}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handlePrintPayslip(selectedPayroll);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Payslip</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDelete(selectedPayroll?.id || selectedPayroll?._id);
            handleMenuClose();
          }}
          disabled={false}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Payroll Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => {
          setUserError('');
          setUserSuccess('');
          setShowAddDialog(false);
        }} 
        maxWidth="md" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent>
          <PayrollForm 
            onSave={handleAddPayroll}
            employees={currentEmployees}
            existingPayroll={sortedPayroll}
            isInDialog={true}
            onCancel={() => {
              setUserError('');
              setUserSuccess('');
              setShowAddDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Payroll Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => {
          setUserError('');
          setUserSuccess('');
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
            employees={currentEmployees}
            existingPayroll={sortedPayroll}
            isInDialog={true}
            onCancel={() => {
              setUserError('');
              setUserSuccess('');
              setShowEditDialog(false);
              setEditingPayroll(null);
            }}
          />
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default PayrollManagement;