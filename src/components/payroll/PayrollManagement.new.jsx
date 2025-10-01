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
  Avatar
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
import { canAdd, canEdit, canDelete, showPermissionError } from '../../utils/permissions';

const PayrollStatus = {
  PENDING: 'Pending',
  PROCESSED: 'Processed',
  PAID: 'Paid'
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
    if (!canAdd(user)) {
      showPermissionError('add payroll', user);
      return;
    }
    
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
    if (!canEdit(user)) {
      showPermissionError('edit payroll', user);
      return;
    }
    
    setUserError('');
    setUserSuccess('');
    setEditingPayroll(payroll);
    setShowEditDialog(true);
  };

  const handleDelete = async (payrollId) => {
    if (!canDelete(user)) {
      showPermissionError('delete payroll', user);
      return;
    }
    
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
        console.error('PayrollManagement: Error deleting payroll:', error);
        setUserError(`Failed to delete payroll: ${error.message}`);
      }
    }
  };

  const handleAddClick = () => {
    if (!canAdd(user)) {
      showPermissionError('add payroll', user);
      return;
    }
    
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
        <title>Payslip - ${employeeName}</title>
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
            <span>${employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Pay Period:</span>
            <span>${formatPayDate(payroll.payDate) || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span>${payroll.status || 'N/A'}</span>
          </div>
        </div>
        
        <div class="earnings">
          <h3>EARNINGS</h3>
          <div class="earnings-row">
            <span>Base Salary</span>
            <span>$${(payroll.baseSalary || 0).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Bonuses</span>
            <span>$${(payroll.bonuses || 0).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Overtime (${payroll.overtimeHours || 0} hrs × $${payroll.overtimeRate || 0})</span>
            <span>$${((payroll.overtimeHours || 0) * (payroll.overtimeRate || 0)).toLocaleString()}</span>
          </div>
          <div class="earnings-row">
            <span>Benefits</span>
            <span>$${(payroll.benefits || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Total Earnings</span>
            <span>$${((payroll.baseSalary || 0) + (payroll.bonuses || 0) + ((payroll.overtimeHours || 0) * (payroll.overtimeRate || 0)) + (payroll.benefits || 0)).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="deductions">
          <h3>DEDUCTIONS</h3>
          <div class="deductions-row">
            <span>Deductions</span>
            <span>$${(payroll.deductions || 0).toLocaleString()}</span>
          </div>
          <div class="deductions-row">
            <span>Taxes</span>
            <span>$${(payroll.taxes || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Total Deductions</span>
            <span>$${((payroll.deductions || 0) + (payroll.taxes || 0)).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="net-pay">
          NET PAY: $${netPay.toLocaleString()}
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
      return name || 'Unknown Employee';
    }
    
    return `Unknown Employee (ID: ${employeeIdStr.substring(0, 8)}...)`;
  };

  // Helper function to get employee name from payroll record (using the nested structure)
  const getEmployeeNameFromPayroll = (payrollRecord) => {
    if (!payrollRecord || !payrollRecord.employee) {
      return 'Unknown Employee (No Employee Data)';
    }
    
    const employee = payrollRecord.employee;
    const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    
    if (name) {
      return name;
    }
    
    // Fallback to ID lookup if name is not available
    return getEmployeeName(employee._id);
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

  const filteredPayroll = currentPayroll.filter(pay => {
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
            disabled={!canAdd(user)}
          >
            Generate Payroll
          </Button>
        </Box>
      </Box>


      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                    ${currentPayroll.reduce((sum, pay) => sum + (pay.netPay || 0), 0).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    {currentPayroll.filter(pay => 
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

        <Grid item xs={12} sm={6} md={3}>
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
                    {currentPayroll.filter(pay => 
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

        <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
                  <TableCell>${pay.baseSalary?.toLocaleString() || 0}</TableCell>
                  <TableCell>${pay.deductions?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="white" sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 1, display: 'inline-block' }}>
                      ${pay.netPay?.toLocaleString() || 0}
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
            if (!canEdit(user)) {
              showPermissionError('edit payroll', user);
              handleMenuClose();
              return;
            }
            handleEdit(selectedPayroll);
            handleMenuClose();
          }}
          disabled={!canEdit(user)}
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
            if (!canDelete(user)) {
              showPermissionError('delete payroll', user);
              handleMenuClose();
              return;
            }
            handleDelete(selectedPayroll?.id || selectedPayroll?._id);
            handleMenuClose();
          }}
          disabled={!canDelete(user)}
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
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Payroll form functionality will be implemented here.
                The PayrollForm component was removed as it was unused.
              </Typography>
            </Box>
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
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Edit payroll form functionality will be implemented here.
                The PayrollForm component was removed as it was unused.
              </Typography>
            </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default PayrollManagement;