import React, { useState } from 'react';
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
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  Business,
  People,
  Description,
  CalendarToday
} from '@mui/icons-material';
import { useDepartments, useEmployees } from '../../hooks/useHRData';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { canAdd, canEdit, canDelete, showPermissionError } from '../../utils/permissions';

const DepartmentManagement = () => {
  const { departments, loading, error, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { employees } = useEmployees();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form state - simplified to only require name
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddDepartment = async () => {
    if (!canAdd(user)) {
      const errorMsg = showPermissionError('add departments', user);
      showError(errorMsg);
      return;
    }
    
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
('Submitting department:', formData);
      const result = await addDepartment(formData);
('Department added successfully:', result);
      
      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        // Show success message (you can add a snackbar here)
        showSuccess('Department added successfully!');
      }
    } catch (error) {
('Error adding department:', error);
      setSubmitError(error.message || 'Failed to add department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!canEdit(user)) {
      showPermissionError('edit departments', user);
      return;
    }
    
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
('Updating department:', selectedDepartment.id, formData);
      const result = await updateDepartment(selectedDepartment.id, formData);
('Department updated successfully:', result);
      
      if (result.success) {
        setIsEditDialogOpen(false);
        setSelectedDepartment(null);
        resetForm();
        alert('Department updated successfully!');
      }
    } catch (error) {
('Error updating department:', error);
      setSubmitError(error.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!canDelete(user)) {
      showPermissionError('delete departments', user);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(departmentId);
        setAnchorEl(null);
      } catch (error) {
('Error deleting department:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
  };

  const openEditDialog = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name || ''
    });
    setSubmitError(null);
    setIsEditDialogOpen(true);
  };

  // Filter departments based on search term with proper data validation
  const departmentsArray = Array.isArray(departments) ? departments : [];
  const employeesArray = Array.isArray(employees) ? employees : [];
  
  const filteredDepartments = departmentsArray.filter(department => 
    department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getManagerName = (managerId) => {
    const manager = employeesArray.find(emp => emp.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'No Manager';
  };

  const getEmployeeCount = (departmentId) => {
    return employeesArray.filter(emp => emp.departmentId === departmentId).length || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Department Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage organizational departments and structure
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            if (!canAdd(user)) {
              showPermissionError('add departments', user);
              return;
            }
            setSubmitError(null);
            setIsAddDialogOpen(true);
          }}
          disabled={!canAdd(user)}
          sx={{ borderRadius: 2 }}
        >
          Add Department
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading departments: {error.message}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredDepartments.length} departments
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {filteredDepartments.map((department, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={department.id || department._id || `department-${index}`}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {department.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {department.id}
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton
                    onClick={(e) => setAnchorEl({ element: e.currentTarget, department })}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {department.description || 'No description available'}
                </Typography>

                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {getEmployeeCount(department.id)} employees
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Manager: {getManagerName(department.managerId)}
                    </Typography>
                  </Stack>

                  {department.location && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {department.location}
                      </Typography>
                    </Stack>
                  )}

                  {department.budget && (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Budget: ${department.budget.toLocaleString()}
                    </Typography>
                  )}
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={department.status || 'active'}
                    color={getStatusColor(department.status)}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDepartments.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No departments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first department to get started'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl?.element}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            if (!canEdit(user)) {
              showPermissionError('edit departments', user);
              setAnchorEl(null);
              return;
            }
            openEditDialog(anchorEl.department);
            setAnchorEl(null);
          }}
          disabled={!canEdit(user)}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (!canDelete(user)) {
              showPermissionError('delete departments', user);
              setAnchorEl(null);
              return;
            }
            handleDeleteDepartment(anchorEl.department.id);
          }}
          disabled={!canDelete(user)}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                placeholder="Enter department name"
                autoFocus
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleAddDepartment} 
            variant="contained"
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                placeholder="Enter department name"
                autoFocus
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleEditDepartment} 
            variant="contained"
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;
