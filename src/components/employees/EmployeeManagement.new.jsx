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
  ListItemText
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
import { useAuth } from '../../contexts/AuthContext';
import EmployeeForm from './EmployeeForm';
import { canAdd, canEdit, canDelete, showPermissionError } from '../../utils/permissions';

const EmployeeManagement = () => {
  const { employees, loading, error, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { departments } = useDepartments();
  const { user, isAuthenticated } = useAuth();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleAddEmployee = async (employeeData) => {
    console.log('Debug - handleAddEmployee called with data:', employeeData);
    
    // Check if user is authenticated first
    if (!user || !isAuthenticated) {
      alert('Authentication Error: Please log in first to add employees.');
      setShowAddDialog(false);
      return;
    }
    
    if (!canAddEmployees()) {
      showPermissionError('add employees', user);
      setShowAddDialog(false);
      return;
    }

    try {
      console.log('Debug - Calling addEmployee API...');
      await addEmployee(employeeData);
      console.log('Debug - Add successful, closing dialog...');
      setShowAddDialog(false);
      console.log('Debug - Dialog closed, refreshing data...');
    } catch (error) {
      console.error('Error adding employee:', error);
      
      // Check for authentication errors
      if (error.message && (error.message.includes('Authentication required') || error.message.includes('sign_in') || error.message.includes('token'))) {
        alert('Authentication Error: Please log in first to add employees.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.message && (error.message.includes('permission') || error.message.includes('access') || error.message.includes('admin'))) {
        alert(`Permission Error: ${error.message}`);
      } else if (error.message && (error.message.includes('duplicate') || error.message.includes('already exists') || error.message.includes('email') && error.message.includes('taken'))) {
        alert('Can\'t add this email because it already exists');
      } else if (error.message && error.message.includes('E11000') && error.message.includes('duplicate key')) {
        alert('Can\'t add this email because it already exists');
      } else if (error.response && error.response.status === 409) {
        alert('Can\'t add this email because it already exists');
      } else if (error.response && error.response.status === 422 && error.response.data && error.response.data.message && error.response.data.message.includes('email')) {
        alert('Can\'t add this email because it already exists');
      } else if (error.response && error.response.data && error.response.data.message && error.response.data.message.includes('E11000')) {
        alert('Can\'t add this email because it already exists');
      } else {
        alert(`Error adding employee: ${error.message}`);
      }
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    if (!canEditEmployees()) {
      showPermissionError('edit employees', user);
      setShowEditDialog(false);
      setEditingEmployee(null);
      return;
    }

    try {
      const employeeId = editingEmployee.id || editingEmployee._id;
      console.log('Debug - editingEmployee:', editingEmployee);
      console.log('Debug - employeeId extracted:', employeeId);
      console.log('Debug - employeeData to update:', employeeData);
      
      if (!employeeId) {
        console.error('No employee ID found for update');
        alert('Error: No employee ID found for update');
        return;
      }
      
      await updateEmployee(employeeId, employeeData);
      setShowEditDialog(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      
      // Check for specific error types
      if (error.message && error.message.includes('Invalid objectId')) {
        alert('Error: Invalid employee ID. Please refresh the page and try again.');
      } else if (error.message && (error.message.includes('permission') || error.message.includes('access') || error.message.includes('admin'))) {
        alert(`Permission Error: ${error.message}`);
      } else if (error.message && error.message.includes('Authentication required')) {
        alert('Authentication Error: Please log in again.');
      } else if (error.message && (error.message.includes('duplicate') || error.message.includes('already exists') || error.message.includes('email') && error.message.includes('taken'))) {
        alert('Can\'t update this email because it already exists');
      } else if (error.message && error.message.includes('E11000') && error.message.includes('duplicate key')) {
        alert('Can\'t update this email because it already exists');
      } else if (error.response && error.response.status === 409) {
        alert('Can\'t update this email because it already exists');
      } else if (error.response && error.response.status === 422 && error.response.data && error.response.data.message && error.response.data.message.includes('email')) {
        alert('Can\'t update this email because it already exists');
      } else if (error.response && error.response.data && error.response.data.message && error.response.data.message.includes('E11000')) {
        alert('Can\'t update this email because it already exists');
      } else {
        alert(`Error updating employee: ${error.message}`);
      }
    }
  };

  const handleEdit = (employee) => {
    if (!canEditEmployees()) {
      showPermissionError('edit employees', user);
      return;
    }
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
      console.error('Error submitting document:', error);
      setUserError(`Error submitting document: ${error.message}`);
    }
  };

  const handleDelete = async (employeeId) => {
    console.log('Debug - handleDelete called with ID:', employeeId);
    
    if (!canDeleteEmployees()) {
      showPermissionError('delete employees', user);
      return;
    }

    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        if (!employeeId) {
          console.error('No employee ID provided for deletion');
          return;
        }
        console.log('Debug - Calling deleteEmployee with ID:', employeeId);
        await deleteEmployee(employeeId);
        console.log('Debug - Delete successful, refreshing data...');
      } catch (error) {
        console.error('Error deleting employee:', error);
        // Check if error is permission-related
        if (error.message && (error.message.includes('permission') || error.message.includes('access') || error.message.includes('admin'))) {
          alert(`Error: ${error.message}`);
        } else {
          alert(`Error deleting employee: ${error.message}`);
        }
      }
    }
  };

  const handleMenuClick = (event, employee) => {
    console.log('Debug - handleMenuClick called with employee:', employee);
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

  // Debug: Log the actual employee data structure
  console.log('Debug - Raw employees data:', employees);
  console.log('Debug - Current employees:', currentEmployees);
  console.log('Debug - Raw departments data:', departments);
  console.log('Debug - Current departments:', currentDepartments);
  console.log('Debug - Current user:', user);
  console.log('Debug - User role:', user?.role);
  console.log('Debug - User role type:', typeof user?.role);
  if (currentEmployees.length > 0) {
    console.log('Debug - First employee structure:', currentEmployees[0]);
  }
  if (currentDepartments.length > 0) {
    console.log('Debug - First department structure:', currentDepartments[0]);
  }

  // Permission checking functions using utility
  const canAddEmployees = () => canAdd(user);
  const canEditEmployees = () => canEdit(user);
  const canDeleteEmployees = () => canDelete(user);

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
    const departmentId = employee.department || employee.department_id || employee.departmentId;
    const departmentName = getDepartmentName(departmentId);
    
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
  
  const filteredEmployees = normalizedEmployees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         employee.status?.toLowerCase() === statusFilter?.toLowerCase();
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            if (canAddEmployees()) {
              setShowAddDialog(true);
            } else {
              showPermissionError('add');
            }
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
              {filteredEmployees.map((employee, index) => (
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
          disabled={!canEditEmployees()}
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
          disabled={!canDeleteEmployees()}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

          {/* Add Employee Dialog */}
          <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogContent>
              <EmployeeForm
                departments={currentDepartments}
                onSave={handleAddEmployee}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Employee Dialog */}
          <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogContent>
              <EmployeeForm
                departments={currentDepartments}
                employee={editingEmployee}
                onSave={handleUpdateEmployee}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingEmployee(null);
                }}
              />
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleSubmitDocument(viewingEmployee.id || viewingEmployee._id, doc)}
                                    sx={{ minWidth: 'auto', px: 1, py: 0.5 }}
                                  >
                                    Submit
                                  </Button>
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