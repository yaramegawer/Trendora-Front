import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import DepartmentForm from './DepartmentForm';
import { useDepartments } from '../../hooks/useHRData';

const DepartmentManagement = () => {
  const { 
    departments, 
    loading, 
    error, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useDepartments();

  // Use only real data from database - no fallback
  const currentDepartments = departments || [];
  
  // Debug: Log what we're actually rendering
  console.log('🔍 DepartmentManagement Render Debug:');
  console.log('  - departments from hook:', departments);
  console.log('  - currentDepartments:', currentDepartments);
  console.log('  - currentDepartments.length:', currentDepartments.length);
  console.log('  - loading:', loading);
  console.log('  - error:', error);
  
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const handleAddDepartment = async (departmentData) => {
    try {
      setUserError('');
      setUserSuccess('');
      await addDepartment(departmentData);
      setUserSuccess(`Department "${departmentData.name}" added successfully!`);
      setShowAddDialog(false);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding department:', error);
      setUserError(`Failed to add department: ${error.message}`);
    }
  };

  const handleUpdateDepartment = async (departmentData) => {
    try {
      setUserError('');
      setUserSuccess('');
      await updateDepartment(editingDepartment._id, departmentData);
      setUserSuccess(`Department "${departmentData.name}" updated successfully!`);
      setShowEditDialog(false);
      setEditingDepartment(null);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating department:', error);
      setUserError(`Failed to update department: ${error.message}`);
    }
  };

  const handleEdit = (department) => {
    setUserError('');
    setUserSuccess('');
    setEditingDepartment(department);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (department) => {
    setUserError('');
    setUserSuccess('');
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setUserError('');
    setUserSuccess('');
    setShowAddDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (departmentToDelete) {
      try {
        setUserError('');
        setUserSuccess('');
        await deleteDepartment(departmentToDelete._id);
        setUserSuccess(`Department "${departmentToDelete.name}" deleted successfully!`);
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setUserSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting department:', error);
        setUserError(`Failed to delete department: ${error.message}`);
      }
    }
  };

  const filteredDepartments = currentDepartments.filter(dept => 
    dept && dept.name && dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Debug: Log filtered departments
  console.log('🔍 Filtered Departments Debug:');
  console.log('  - searchTerm:', searchTerm);
  console.log('  - filteredDepartments:', filteredDepartments);
  console.log('  - filteredDepartments.length:', filteredDepartments.length);


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      {/* User Success Message */}
      {userSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {userSuccess}
        </Alert>
      )}

      {/* User Error Message */}
      {userError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {userError}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Department Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Department
        </Button>
      </Box>

      {/* Stats Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Departments
              </Typography>
                  <Typography variant="h4">
                    {currentDepartments.length}
                  </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Search departments"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />
          }}
        />
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading departments...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && currentDepartments.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No departments found. Click "Add Department" to create your first department.
        </Alert>
      )}

      {/* Departments Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department Name</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department._id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {department.name ? department.name.charAt(0) : '?'}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {department.name || 'Unknown Department'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(department)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(department)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredDepartments.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No departments found.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Add Department Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Add Department</DialogTitle>
        <DialogContent>
          <DepartmentForm
            onSave={handleAddDepartment}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <DepartmentForm
            department={editingDepartment}
            onSave={handleUpdateDepartment}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingDepartment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{departmentToDelete?.name || 'this department'}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;