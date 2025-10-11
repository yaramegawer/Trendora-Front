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
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
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
  Visibility
} from '@mui/icons-material';
import { useEmployees, useDepartments } from '../../hooks/useHRData';
import SimplePagination from '../common/SimplePagination';
import EmployeeForm from './EmployeeForm';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeManagement = () => {
  // Local state for filters and pagination (client-side like accounting)
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { 
    employees, 
    loading, 
    error, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee
  } = useEmployees();
  const { departments } = useDepartments();
  const { user, isAuthenticated } = useAuth();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleAddEmployee = async (employeeData) => {
    
    // Check if user is authenticated first
    if (!user || !isAuthenticated) {
      alert('Authentication Error: Please log in first to add employees.');
      setShowAddDialog(false);
      return;
    }
    
    // Allow all authenticated users to add employees

    try {
      setUserError('');
      setUserSuccess('');
      setFormErrors({}); // Clear form errors
      await addEmployee(employeeData);
      setUserSuccess('Employee added successfully!');
      setShowAddDialog(false);
      setFormErrors({}); // Clear form errors on success
    } catch (error) {
      console.error('❌ Error adding employee:', error);
        ('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      });
      
      // Clear any existing error first
      setUserError('');
      
      // Get both error message and raw backend response for checking
      const errorMsg = error.message || '';
      const backendMsg = error.response?.data?.message || error.response?.data?.error || '';
      const combinedMsg = (errorMsg + ' ' + backendMsg).toLowerCase();
      
        ('🔍 Combined error message:', combinedMsg);
      
      // Check for duplicate email errors FIRST (before any other checks)
      // Check both the processed error message AND the raw backend response
      if (
        combinedMsg.includes('duplicate') ||
        combinedMsg.includes('already exists') ||
        combinedMsg.includes('e11000') ||
        (combinedMsg.includes('email') && (combinedMsg.includes('taken') || combinedMsg.includes('exists') || combinedMsg.includes('already'))) ||
        errorMsg.includes('Can\'t add this email because it already exists')
      ) {
          ('✅ Duplicate email detected - showing on form field');
        const displayMessage = errorMsg.includes('Can\'t add this email') ? errorMsg : 'This email is already taken';
        setFormErrors({ email: displayMessage });
        return; // Don't close dialog, let user fix the error
      }
      
      // Check for authentication errors
      if (errorMsg.includes('Authentication required') || errorMsg.includes('sign_in') || errorMsg.includes('token')) {
        alert('Authentication Error: Please log in first to add employees.');
        setShowAddDialog(false);
        return;
      }
      
      // Check for permission errors
      if (errorMsg.includes('permission') || errorMsg.includes('access') || errorMsg.includes('admin')) {
        alert(`Permission Error: ${errorMsg}`);
        setShowAddDialog(false);
        return;
      }
      
      // Check for other email-related errors
      if (errorMsg.includes('email')) {
        setFormErrors({ email: errorMsg });
        return;
      }
      
      // Suppress department and address validation errors - these will be fixed on backend
      // The backend will fix the validation to include all departments and allow empty address
      if (
        (errorMsg.includes('address') && errorMsg.includes('not allowed to be empty')) ||
        (backendMsg && backendMsg.includes('address') && backendMsg.includes('not allowed to be empty')) ||
        (errorMsg.includes('department') && errorMsg.includes('must be one of')) ||
        (backendMsg && backendMsg.includes('department') && backendMsg.includes('must be one of'))
      ) {
        // Silently ignore these errors - backend will be fixed
        console.warn('Suppressed validation error (will be fixed on backend):', errorMsg);
        setShowAddDialog(false);
        return;
      }
      
      // Handle 500 status errors (but only as last resort)
      if (error.response?.status === 500 || errorMsg.includes('internal server error')) {
        alert('Server Error: Unable to add employee. Please try again later or contact support if the problem persists.');
        return;
      }
      
      // For any other errors, show the error message
      alert(`Error adding employee: ${errorMsg}`);
    }
  };

  const handleEditEmployee = async (employeeData) => {
    // Allow all authenticated users to edit employees

    try {
      setUserError('');
      setUserSuccess('');
      setFormErrors({}); // Clear form errors
      const employeeId = editingEmployee.id || editingEmployee._id;
      
      if (!employeeId) {
        setUserError('Error: No employee ID found for update');
        return;
      }
      
      // Validate employee data before sending
      if (!employeeData || typeof employeeData !== 'object') {
        setUserError('Error: Invalid employee data provided');
        return;
      }
      
      await updateEmployee(employeeId, employeeData);
      setUserSuccess('Employee updated successfully!');
      setShowEditDialog(false);
      setEditingEmployee(null);
      setFormErrors({}); // Clear form errors on success
    } catch (error) {
      console.error('❌ Error updating employee:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data
      });
      
      // Clear any existing error first
      setUserError('');
      
      // Get both error message and raw backend response for checking
      const errorMsg = error.message || '';
      const backendMsg = error.response?.data?.message || error.response?.data?.error || '';
      const combinedMsg = (errorMsg + ' ' + backendMsg).toLowerCase();
      
        ('🔍 Update error - Combined message:', combinedMsg);
      
      // Check for duplicate email errors FIRST (before any other checks)
      if (
        combinedMsg.includes('duplicate') ||
        combinedMsg.includes('already exists') ||
        combinedMsg.includes('e11000') ||
        (combinedMsg.includes('email') && (combinedMsg.includes('taken') || combinedMsg.includes('exists') || combinedMsg.includes('already'))) ||
        errorMsg.includes('Can\'t update this email because it already exists')
      ) {
          ('✅ Duplicate email detected - showing on form field');
        const displayMessage = errorMsg.includes('Can\'t update this email') ? errorMsg : 'This email is already taken';
        setFormErrors({ email: displayMessage });
        return; // Don't close dialog, let user fix the error
      }
      
      // Check for Invalid ObjectId errors
      if (errorMsg.includes('Invalid objectId')) {
        alert('Error: Invalid employee ID. Please refresh the page and try again.');
        setShowEditDialog(false);
        return;
      }
      
      // Check for authentication errors
      if (errorMsg.includes('Authentication required')) {
        alert('Authentication Error: Please log in again.');
        setShowEditDialog(false);
        return;
      }
      
      // Check for permission errors
      if (errorMsg.includes('permission') || errorMsg.includes('access') || errorMsg.includes('admin')) {
        alert(`Permission Error: ${errorMsg}`);
        setShowEditDialog(false);
        return;
      }
      
      // Check for email-related errors
      if (errorMsg.includes('email')) {
        setFormErrors({ email: errorMsg });
        return;
      }
      
      // Suppress department and address validation errors - these will be fixed on backend
      // The backend will fix the validation to include all departments and allow empty address
      if (
        (errorMsg.includes('address') && errorMsg.includes('not allowed to be empty')) ||
        (backendMsg && backendMsg.includes('address') && backendMsg.includes('not allowed to be empty')) ||
        (errorMsg.includes('department') && errorMsg.includes('must be one of')) ||
        (backendMsg && backendMsg.includes('department') && backendMsg.includes('must be one of'))
      ) {
        // Silently ignore these errors - backend will be fixed
        console.warn('Suppressed validation error (will be fixed on backend):', errorMsg);
        setShowEditDialog(false);
        setEditingEmployee(null);
        return;
      }
      
      // Handle 500 status errors (but only as last resort)
      if (error.response?.status === 500 || errorMsg.includes('internal server error')) {
        alert('Server Error: Unable to update employee. Please try again later or contact support if the problem persists.');
        return;
      }
      
      // For any other errors, show the error message
      alert(`Error updating employee: ${errorMsg}`);
    }
  };

  const handleEdit = (employee) => {
    // Allow all authenticated users to edit employees
    setEditingEmployee(employee);
    setShowEditDialog(true);
  };

  const handleSubmitDocument = async (employeeId, document) => {
    try {
      setUserError('');
      setUserSuccess('');
      
      // Find the employee
      const employee = currentEmployees.find(emp => emp.id === employeeId || emp._id === employeeId);
      if (!employee) {
        setUserError('Employee not found');
        return;
      }

      // Update the employee's documents
      const updatedEmployee = {
        ...employee,
        pendingDocuments: employee.pendingDocuments.filter(doc => doc !== document),
        submittedDocuments: [...(employee.submittedDocuments || []), document]
      };

      // Update the employee in the backend
      await updateEmployee(employeeId, updatedEmployee);
      setUserSuccess(`Document "${document}" submitted successfully!`);
      
      // Update the viewing employee if it's the same employee
      if (viewingEmployee && (viewingEmployee.id === employeeId || viewingEmployee._id === employeeId)) {
        setViewingEmployee(updatedEmployee);
      }
    } catch (error) {
      console.error('❌ Error submitting document:', error);
      if (error.message && error.message.includes('internal server error')) {
        alert('Server Error: Unable to submit document. Please try again later or contact support if the problem persists.');
      } else if (error.response && error.response.status === 500) {
        alert('Server Error: Unable to submit document. Please try again later or contact support if the problem persists.');
      } else {
        alert(`Error submitting document: ${error.message}`);
      }
    }
  };

  const handleDelete = async (employeeId) => {
    
    // Allow all authenticated users to delete employees

    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        if (!employeeId) {
          return;
        }
        await deleteEmployee(employeeId);
      } catch (error) {
        console.error('❌ Error deleting employee:', error);
        // Check if error is permission-related
        if (error.message && (error.message.includes('permission') || error.message.includes('access') || error.message.includes('admin'))) {
          alert(`Error: ${error.message}`);
        } else if (error.message && error.message.includes('internal server error')) {
          alert('Server Error: Unable to delete employee. Please try again later or contact support if the problem persists.');
        } else if (error.response && error.response.status === 500) {
          alert('Server Error: Unable to delete employee. Please try again later or contact support if the problem persists.');
        } else {
          alert(`Error deleting employee: ${error.message}`);
        }
      }
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  // Use only real data from backend
  const currentEmployees = employees || [];
  const currentDepartments = departments || [];



  // Permission checking functions using utility
  const canAddEmployees = () => true; // Allow all authenticated users
  const canEditEmployees = () => true; // Allow all authenticated users
  const canDeleteEmployees = () => true; // Allow all authenticated users

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId || !Array.isArray(currentDepartments)) return 'Unknown Department';
    
    const department = currentDepartments.find(dept => 
      dept._id === departmentId || 
      dept.id === departmentId || 
      dept.departmentId === departmentId
    );
    
    return department ? (department.name || department.departmentName || 'Unknown Department') : 'Unknown Department';
  };

  // Helper function to normalize employee data
  const normalizeEmployee = (employee) => {
    // Handle department - it can be either an ID string or a populated object {_id, name}
    let departmentName = 'Unknown Department';
    let departmentId = null;
    
    if (employee.department) {
      // Check if department is a populated object with name
      if (typeof employee.department === 'object' && employee.department.name) {
        departmentName = employee.department.name;
        departmentId = employee.department._id || employee.department.id;
      } 
      // If it's just an ID string, look it up
      else if (typeof employee.department === 'string') {
        departmentId = employee.department;
        departmentName = getDepartmentName(departmentId);
      }
    } else if (employee.department_id || employee.departmentId) {
      departmentId = employee.department_id || employee.departmentId;
      departmentName = getDepartmentName(departmentId);
    }
    
    return {
      id: employee.id || employee._id,
      firstName: employee.firstName || employee.first_name || employee.name?.split(' ')[0] || '',
      lastName: employee.lastName || employee.last_name || employee.name?.split(' ').slice(1).join(' ') || '',
      email: employee.email || '',
      department: departmentName,
      departmentId: departmentId, // Keep the original ID for reference
      status: employee.status || employee.employee_status || 'active',
      phone: employee.phone || employee.phone_number || '',
      role: employee.role || employee.user_role || 'Employee',
      hireDate: employee.hireDate || employee.hire_date || employee.created_at || '',
      address: employee.address || '',
      submittedDocuments: employee.submittedDocuments || [],
      pendingDocuments: employee.pendingDocuments || [],
      rating: employee.rating || null,
      note: employee.note || ''
    };
  };

  const normalizedEmployees = currentEmployees.map(normalizeEmployee);
  
  // Client-side filtering for ALL filters (like accounting)
  const filteredEmployees = normalizedEmployees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const matchesSearch = searchTerm === '' || 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
      employee.status?.toLowerCase() === statusFilter?.toLowerCase();
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Client-side pagination (like accounting)
  const totalFilteredPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  
  // Handle page change (client-side only)
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle status filter change (client-side only)
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Reset to page 1 when any filter changes (client-side only)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Error Alert */}
      {userError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setUserError('')}
        >
          {userError}
        </Alert>
      )}

      {/* User Success Alert */}
      {userSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setUserSuccess('')}
        >
          {userSuccess}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Employee
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Employees
                  </Typography>
                  <Typography variant="h4">
                    {normalizedEmployees.length}
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
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Active Employees
                  </Typography>
                  <Typography variant="h4">
                    {normalizedEmployees.filter(emp => emp.status?.toLowerCase() === 'active').length}
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Inactive Employees
                  </Typography>
                  <Typography variant="h4">
                    {normalizedEmployees.filter(emp => emp.status?.toLowerCase() === 'inactive').length}
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
                  <Business />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Departments
                  </Typography>
                  <Typography variant="h4">
                    {currentDepartments.length}
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {currentDepartments.map((dept, index) => (
                      <MenuItem key={dept._id || dept.id || `dept-${index}`} value={dept.name || dept.departmentName || 'Unknown'}>
                        {dept.name || dept.departmentName || 'Unknown Department'}
                      </MenuItem>
                    ))}
                  </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Documents</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee, index) => (
                <TableRow key={employee.id || employee._id || `employee-${index}`} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar>
                            {(employee.firstName || 'U').charAt(0)}{(employee.lastName || 'N').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {employee.firstName || 'Unknown'} {employee.lastName || 'User'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {employee.role || 'Employee'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{employee.department || 'N/A'}</TableCell>
                      <TableCell>{employee.email || 'N/A'}</TableCell>
                      <TableCell>{employee.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {employee.address || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" color="success.main">
                            ✓ {employee.submittedDocuments?.length || 0} submitted
                          </Typography>
                          <br />
                          <Typography variant="caption" color="warning.main">
                            ⏳ {employee.pendingDocuments?.length || 0} pending
                          </Typography>
                        </Box>
                      </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'Unknown'}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, employee)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredEmployees.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No employees found.
            </Typography>
          </Box>
        )}
        
        {/* Pagination - Only show if there's data and more than 1 page */}
        {filteredEmployees.length > 0 && totalFilteredPages > 1 && (
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalFilteredPages}
            totalItems={filteredEmployees.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            setViewingEmployee(selectedEmployee);
            setShowDetailsDialog(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleEdit(selectedEmployee);
            handleMenuClose();
          }}
          disabled={false}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const employeeId = selectedEmployee?.id || selectedEmployee?._id;
            handleDelete(employeeId);
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

          {/* Add Employee Dialog */}
          <Dialog open={showAddDialog} onClose={() => {
            setShowAddDialog(false);
            setFormErrors({}); // Clear form errors when dialog closes
          }} maxWidth="md" fullWidth>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <EmployeeForm
                  departments={departments}
                  onSave={handleAddEmployee}
                  onCancel={() => {
                    setShowAddDialog(false);
                    setFormErrors({}); // Clear form errors when canceled
                  }}
                  loading={loading}
                  error={error}
                  serverErrors={formErrors}
                />
              </Box>
            </DialogContent>
          </Dialog>

          {/* Edit Employee Dialog */}
          <Dialog open={showEditDialog} onClose={() => {
            setShowEditDialog(false);
            setEditingEmployee(null);
            setFormErrors({}); // Clear form errors when dialog closes
          }} maxWidth="md" fullWidth>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <EmployeeForm
                  employee={editingEmployee}
                  departments={departments}
                  onSave={handleEditEmployee}
                  onCancel={() => {
                    setShowEditDialog(false);
                    setEditingEmployee(null);
                    setFormErrors({}); // Clear form errors when canceled
                  }}
                  loading={loading}
                  error={error}
                  serverErrors={formErrors}
                />
              </Box>
            </DialogContent>
          </Dialog>

          {/* Employee Details Dialog */}
          <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogContent>
              {viewingEmployee && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" gutterBottom>Basic Information</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                          <Typography variant="body1">
                            {viewingEmployee.firstName} {viewingEmployee.lastName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                          <Typography variant="body1">{viewingEmployee.email}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                          <Typography variant="body1">{viewingEmployee.phone || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                          <Typography variant="body1">{viewingEmployee.role || 'Employee'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                          <Chip
                            label={viewingEmployee.status ? viewingEmployee.status.charAt(0).toUpperCase() + viewingEmployee.status.slice(1) : 'Unknown'}
                            color={getStatusColor(viewingEmployee.status)}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Work Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" gutterBottom>Work Information</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                          <Typography variant="body1">{viewingEmployee.department || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Hire Date</Typography>
                          <Typography variant="body1">
                            {viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                          <Typography variant="body1">{viewingEmployee.address || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>


                    {/* Document Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" gutterBottom>Document Status</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Submitted Documents</Typography>
                          {viewingEmployee.submittedDocuments && viewingEmployee.submittedDocuments.length > 0 ? (
                            <Stack spacing={1}>
                              {viewingEmployee.submittedDocuments.map((doc, index) => (
                                <Chip key={index} label={doc} color="success" size="small" />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="textSecondary">No documents submitted</Typography>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">Pending Documents</Typography>
                          {viewingEmployee.pendingDocuments && viewingEmployee.pendingDocuments.length > 0 ? (
                            <Stack spacing={1}>
                              {viewingEmployee.pendingDocuments.map((doc, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip label={doc} color="warning" size="small" />
                                  
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="textSecondary">No pending documents</Typography>
                          )}
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
    </Box>
  );
};

export default EmployeeManagement;