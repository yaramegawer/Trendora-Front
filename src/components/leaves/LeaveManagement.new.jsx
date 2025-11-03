import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Stack,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Button,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Search as SearchIcon,
  Event,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { useLeaves, useEmployees } from '../../hooks/useHRData';
import SimplePagination from '../common/SimplePagination';
import { useITEmployees } from '../../hooks/useITData';
import { useAuth } from '../../contexts/AuthContext';
import { canSubmitLeave } from '../../utils/permissions';

const LeaveStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const LeaveType = {
  ANNUAL: 'annual',
  SICK: 'sick',
  UNPAID: 'unpaid',
  EARLY: 'early',
  EMERGENCY: 'emrgency'
};

const LeaveManagement = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  const { 
    leaves, 
    allLeaves,
    loading, 
    error, 
    totalLeaves,
    currentPage,
    pageSize,
    totalPages: hookTotalPages,
    searchTerm,
    isSearching,
    addLeave, 
    updateLeaveStatus, 
    deleteLeave,
    goToPage,
    changePageSize,
    changeStatusFilter,
    performSearch,
    nextPage,
    prevPage
  } = useLeaves(1, 10, statusFilter);
  const { employees: hrEmployees } = useEmployees();
  const { employees: itEmployees } = useITEmployees();
  
  // Combine HR and IT employees for display
  const currentEmployees = [...(hrEmployees || []), ...(itEmployees || [])];
  
  // Debug logging
('HR Leave Management - Leaves data from backend:', leaves);
  
  // Debounced search - only triggers after user stops typing for 1 second
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        performSearch(localSearchTerm);
      }
    }, 1000); // 1 second delay after user stops typing
    
    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, performSearch]);
  
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [deletingLeave, setDeletingLeave] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  
  // Add leave form state
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    leave_hour: ''
  });

  

  const handleAddLeave = async () => {
    // Allow all authenticated users to add leaves
    
    try {
      setUserError('');
      setUserSuccess('');
      
      // Validate form
      if (!leaveForm.employeeId || !leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate) {
        setUserError('Please fill in all required fields');
        return;
      }
      
      // Validate dates
      const startDate = new Date(leaveForm.startDate);
      const endDate = new Date(leaveForm.endDate);
      if (startDate >= endDate) {
        setUserError('End date must be after start date');
        return;
      }
      
      const leaveData = {
        employeeId: leaveForm.employeeId,
        type: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason || '',
        status: 'pending'
      };
      if (leaveForm.leave_hour !== '' && !isNaN(leaveForm.leave_hour)) {
        leaveData.leave_hours = Math.max(0, Number(leaveForm.leave_hour));
      }
      
('Frontend: Adding leave with data:', leaveData);
      await addLeave(leaveData);
      setUserSuccess('Leave request submitted successfully!');
      setShowAddDialog(false);
      setLeaveForm({
        employeeId: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
('Error adding leave:', error);
      // Silently handle 403 errors without showing error message
      if (error.response?.status !== 403) {
        setUserError(`Failed to submit leave request: ${error.message}`);
      }
    }
  };

  const handleStatusUpdate = async () => {
    // Allow all authenticated users to update leave status
    
    try {
      setUserError('');
      setUserSuccess('');
      // Convert status to lowercase for backend compatibility
      const statusToSend = newStatus.toLowerCase();
('Frontend: Converting status for backend:', { original: newStatus, converted: statusToSend });
      await updateLeaveStatus(editingLeave.id || editingLeave._id, { status: statusToSend });
      setUserSuccess(`Leave status updated to "${newStatus}" successfully!`);
      setShowStatusDialog(false);
      setEditingLeave(null);
      setNewStatus('');
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
('Error updating leave status:', error);
      // Silently handle 403 errors without showing error message
      if (error.response?.status !== 403) {
        setUserError(`Failed to update leave status: ${error.message}`);
      }
    }
  };

  const handleEditStatus = (leave) => {
    setUserError('');
    setUserSuccess('');
    setEditingLeave(leave);
    setNewStatus(leave.status);
    setShowStatusDialog(true);
  };

  const handleDeleteClick = (leave) => {
    // Allow all authenticated users to delete leaves
    
    setUserError('');
    setUserSuccess('');
    setDeletingLeave(leave);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setUserError('');
      setUserSuccess('');
      await deleteLeave(deletingLeave.id || deletingLeave._id);
      setUserSuccess(`Leave request for "${getEmployeeName(deletingLeave)}" deleted successfully!`);
      setShowDeleteDialog(false);
      setDeletingLeave(null);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (error) {
('Error deleting leave:', error);
      // Silently handle 403 errors without showing error message
      if (error.response?.status !== 403) {
        setUserError(`Failed to delete leave request: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'success';
      case LeaveStatus.REJECTED:
        return 'error';
      case LeaveStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEmployeeName = (leave) => {
    // Safety check for undefined or null leave object
    if (!leave) {
      return 'Unknown Employee';
    }

    // Check if employee is populated in the leave object
    if (leave.employee && leave.employee.firstName && leave.employee.lastName) {
      return `${leave.employee.firstName} ${leave.employee.lastName}`;
    }
    
    // Fallback to employeeId lookup if populate didn't work
    if (leave.employeeId) {
      const employee = currentEmployees.find(emp => emp.id === leave.employeeId || emp._id === leave.employeeId);
      if (employee) {
        return `${employee.firstName} ${employee.lastName}`;
      }
    }
    
('Employee not found for leave:', leave);
    return `Unknown Employee (ID: ${leave.employeeId || 'N/A'})`;
  };

  // When searching, filter all leaves client-side
  // When not searching, use backend-paginated leaves
  const getFilteredAndPaginatedLeaves = () => {
    if (isSearching && localSearchTerm.trim() !== '') {
      // Client-side search on all leaves
      const filtered = allLeaves.filter(leave => {
        const matchesSearch = 
          getEmployeeName(leave).toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          (leave.leaveType || leave.type || '').toLowerCase().includes(localSearchTerm.toLowerCase());
        return matchesSearch;
      });
      
      // Client-side pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginated = filtered.slice(startIndex, endIndex);
      
      return {
        leaves: paginated,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize)
      };
    } else {
      // Backend pagination
      return {
        leaves: leaves || [],
        total: totalLeaves,
        totalPages: hookTotalPages
      };
    }
  };

  const { leaves: paginatedLeaves, total: displayTotal, totalPages: displayTotalPages } = getFilteredAndPaginatedLeaves();

  // Clamp current page when data/page count changes (e.g., after delete/update or search/filter)
  React.useEffect(() => {
    const maxPages = Math.max(1, displayTotalPages || 1);
    if (currentPage > maxPages) {
      goToPage(maxPages);
    } else if (currentPage < 1) {
      goToPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayTotalPages]);

  // Debug logging
('🔍 Pagination Debug:', {
    currentPage,
    displayTotalPages,
    paginatedLeavesLength: paginatedLeaves.length,
    displayTotal,
    isSearching,
    localSearchTerm,
    pageSize,
    leavesLength: leaves.length,
    allLeavesLength: allLeaves.length
  });
  
  // Handle page change
  const handlePageChange = (newPage) => {
(`🔍 LeaveManagement: handlePageChange called with page ${newPage}`);
    goToPage(newPage);
  };

  // Handle status filter change - call backend
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    changeStatusFilter(newStatus);
  };

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
          Leave Management
        </Typography>
      </Box>


      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Search (searches all pages)"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search by employee name or leave type..."
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
                helperText={isSearching ? "Searching across all pages..." : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status Filter</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Leave Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeaves.map((leave) => (
                <TableRow key={leave.id || leave._id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {getEmployeeName(leave).charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {getEmployeeName(leave)}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{leave.leaveType || leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{(leave.leave_hours ?? leave.leave_hour) ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={getStatusColor(leave.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditStatus(leave)}
                      title="Update Status"
                      disabled={false}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(leave)}
                      title="Delete Leave"
                      color="error"
                      disabled={false}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {paginatedLeaves.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No leave requests found.
            </Typography>
          </Box>
        )}
        
        {/* Pagination - Only show if there's data and more than 1 page */}
        {displayTotal > 0 && displayTotalPages > 1 && (
          <SimplePagination
            currentPage={currentPage}
            totalPages={displayTotalPages}
            totalItems={displayTotal}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {/* Update Status Dialog */}
      <Dialog 
        open={showStatusDialog} 
        onClose={() => setShowStatusDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Update Leave Status</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Employee: {editingLeave && getEmployeeName(editingLeave)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leave Type: {editingLeave?.leaveType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Status: {editingLeave?.status}
            </Typography>
            
          <FormControl fullWidth>
            <InputLabel id="new-status-label">New Status</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
                <MenuItem value={LeaveStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={LeaveStatus.APPROVED}>Approved</MenuItem>
                <MenuItem value={LeaveStatus.REJECTED}>Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!newStatus || newStatus === editingLeave?.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        disableRestoreFocus
      >
        <DialogTitle>Delete Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the leave request for "{deletingLeave && getEmployeeName(deletingLeave)}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Submit Leave Request</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">Employee *</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={leaveForm.employeeId}
              onChange={(e) => setLeaveForm({...leaveForm, employeeId: e.target.value})}
              label="Employee *"
            >
                {currentEmployees.map((employee) => (
                  <MenuItem key={employee.id || employee._id} value={employee.id || employee._id}>
                    {employee.firstName} {employee.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          <FormControl fullWidth>
            <InputLabel id="leave-type-label">Leave Type *</InputLabel>
            <Select
              labelId="leave-type-label"
              id="leave-type-select"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
              label="Leave Type *"
            >
                <MenuItem value={LeaveType.ANNUAL}>Annual</MenuItem>
                <MenuItem value={LeaveType.SICK}>Sick</MenuItem>
                <MenuItem value={LeaveType.UNPAID}>Unpaid</MenuItem>
                <MenuItem value={LeaveType.EARLY}>Early</MenuItem>
                <MenuItem value={LeaveType.EMERGENCY}>Emergency</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Start Date *"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="End Date *"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Leave Hours (Optional)"
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={leaveForm.leave_hour}
              onChange={(e) => setLeaveForm({...leaveForm, leave_hour: e.target.value})}
            />

            <TextField
              fullWidth
              label="Reason (Optional)"
              multiline
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
              placeholder="Please provide a reason for your leave request..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddLeave} 
            variant="contained"
            disabled={false}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;