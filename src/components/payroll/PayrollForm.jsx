import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Box
} from '@mui/material';
import CustomDatePicker from './CustomDatePicker';

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

    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay period is required';
    }

    if (formData.baseSalary === '' || formData.baseSalary === null || formData.baseSalary === undefined) {
      newErrors.baseSalary = 'Base salary is required';
    } else if (parseFloat(formData.baseSalary) < 0) {
      newErrors.baseSalary = 'Base salary must be 0 or greater';
    }

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
      
      // Map PayrollForm fields to backend schema (using camelCase as backend expects)
      const backendData = {
        baseSalary: parseFloat(formData.baseSalary) || 0,
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        payDate: formData.payPeriod.toISOString(),
        overtimeHours: parseFloat(formData.overtimeHours) || 0,
        overtimeRate: parseFloat(formData.overtimeRate) || 0,
        benefits: parseFloat(formData.benefits) || 0,
        taxes: parseFloat(formData.taxes) || 0
        // Note: netPay is calculated by the backend automatically
      };

      // For new payroll, include employee ID
      if (!isEditing) {
        backendData.id = formData.employeeId;
      }

      // Add status field for update schema (only when editing)
      if (isEditing) {
        backendData.status = formData.status;
      }
      
      console.log('PayrollForm: Calling onSave with data:', backendData);
      await onSave(backendData);
      console.log('PayrollForm: onSave completed successfully');
    } catch (error) {
      console.error('PayrollForm: Error in handleSubmit:', error);
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

          <CustomDatePicker
            label="Pay Period"
            value={formData.payPeriod}
            onChange={(date) => handleChange('payPeriod', date)}
            error={!!errors.payPeriod}
            helperText={errors.payPeriod || 'Click to open calendar and select a date'}
            fullWidth={true}
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
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Base Salary:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${parseFloat(formData.baseSalary || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Benefits:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +${parseFloat(formData.benefits || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Overtime Pay:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +${((parseFloat(formData.overtimeHours || 0) * parseFloat(formData.overtimeRate || 0))).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bonuses:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +${parseFloat(formData.bonuses || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                Gross Pay: ${calculateGrossSalary().toLocaleString()}
              </Typography>
              
              <Divider />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Deductions:
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -${parseFloat(formData.deductions || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Taxes:
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -${parseFloat(formData.taxes || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                Total Deductions: ${calculateDeductions().toLocaleString()}
              </Typography>
              
              <Divider sx={{ borderWidth: 2, borderColor: 'primary.main' }} />
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'primary.light', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" color="white" sx={{ fontWeight: 'bold' }}>
                  Net Pay: ${calculateNetSalary().toLocaleString()}
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

export default PayrollForm;