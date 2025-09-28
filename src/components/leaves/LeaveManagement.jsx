import React, { useState } from 'react';
import {
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, LineChart } from '@mui/x-charts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { formatDate, LeaveStatus, LeaveType } from '../../data/hrMockData';
import StatusChip from '../common/StatusChip';
import { useLeaves } from '../../hooks/useHRData';

const LeaveManagement = () => {
  const { 
    leaves, 
    loading: leavesLoading, 
    error: leavesError,
    updateLeaveStatus,
    deleteLeave 
  } = useLeaves();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, leave: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Filter leaves safely
  const filteredLeaves = leaves.filter(leave => {
    const firstName = leave?.employee?.firstName || '';
    const lastName = leave?.employee?.lastName || '';
    const email = leave?.employee?.email || '';
    const reason = leave?.reason || '';

    const matchesSearch = 
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.leaveType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusUpdate = async (leaveId, newStatus) => {
    setActionLoading(true);
    const result = await updateLeaveStatus(leaveId, newStatus);
    if (!result.success) console.error('Failed to update leave status:', result.error);
    setActionLoading(false);
  };

  const handleDeleteClick = (leave) => {
    setDeleteDialog({ open: true, leave });
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    const result = await deleteLeave(deleteDialog.leave?._id);
    if (result.success) setDeleteDialog({ open: false, leave: null });
    else console.error('Failed to delete leave:', result.error);
    setActionLoading(false);
  };

  // Chart data
  const statusData = [
    { label: 'Approved', value: leaves.filter(l => l.status === LeaveStatus.APPROVED).length },
    { label: 'Pending', value: leaves.filter(l => l.status === LeaveStatus.PENDING).length },
    { label: 'Rejected', value: leaves.filter(l => l.status === LeaveStatus.REJECTED).length }
  ];

  const monthlyLeaveData = [
    { month: 'Jan', count: 8 },
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 10 },
    { month: 'May', count: 18 },
    { month: 'Jun', count: 14 }
  ];

  // Columns with safe checks
  const columns = [
    {
      field: 'employeeName',
      headerName: 'Employee',
      width: 200,
      valueGetter: (params) => {
        const employee = params?.row?.employee;
        if (!employee) return '';
        return `${employee.firstName} ${employee.lastName}`;
      },
    },
    {
      field: 'leaveType',
      headerName: 'Type',
      width: 120,
      valueFormatter: (params) => {
        const value = params?.value || '';
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      valueFormatter: (params) => formatDate(params?.value),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueFormatter: (params) => formatDate(params?.value),
    },
    {
      field: 'appliedDate',
      headerName: 'Applied Date',
      width: 120,
      valueFormatter: (params) => formatDate(params?.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <StatusChip status={params?.value} type="leave" />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const row = params?.row;
        if (!row) return null;
        return (
          <Stack direction="row" spacing={1}>
            {row.status === LeaveStatus.PENDING && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleStatusUpdate(row._id, LeaveStatus.APPROVED)}
                  className="text-green-600 hover:bg-green-50"
                  title="Approve"
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleStatusUpdate(row._id, LeaveStatus.REJECTED)}
                  className="text-red-600 hover:bg-red-50"
                  title="Reject"
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </>
            )}
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row)}
              className="text-red-600 hover:bg-red-50"
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack spacing={4} className="p-6">
      {/* Header */}
      <Stack>
        <Typography variant="h5" className="font-bold">Leave Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage employee leave requests and approvals
        </Typography>
      </Stack>

      {/* Charts */}
      <Stack direction="row" spacing={3} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">Leave Status Distribution</Typography>
          <PieChart
            series={[{ data: statusData, innerRadius: 50, outerRadius: 100, paddingAngle: 2, cornerRadius: 4 }]}
            height={300}
            colors={['#059669', '#d97706', '#dc2626']}
          />
        </Paper>

        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">Monthly Leave Trends</Typography>
          <LineChart
            xAxis={[{ scaleType: 'point', data: monthlyLeaveData.map(d => d.month) }]}
            series={[{ data: monthlyLeaveData.map(d => d.count), color: '#0891b2', curve: 'linear' }]}
            height={300}
            grid={{ vertical: true, horizontal: true }}
          />
        </Paper>
      </Stack>

      {/* Filters */}
      <Paper elevation={1} className="p-4">
        <Stack direction="row" spacing={3} className="items-center">
          <TextField
            placeholder="Search leaves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <SearchIcon className="text-gray-400 mr-2" /> }}
            className="flex-1 max-w-md"
          />
          <FormControl size="small" className="min-w-32">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select 
              labelId="status-filter-label"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value={LeaveStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={LeaveStatus.APPROVED}>Approved</MenuItem>
              <MenuItem value={LeaveStatus.REJECTED}>Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" className="min-w-32">
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select 
              labelId="type-filter-label"
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value={LeaveType.VACATION}>Vacation</MenuItem>
              <MenuItem value={LeaveType.SICK}>Sick</MenuItem>
              <MenuItem value={LeaveType.PERSONAL}>Personal</MenuItem>
              <MenuItem value={LeaveType.MATERNITY}>Maternity</MenuItem>
              <MenuItem value={LeaveType.PATERNITY}>Paternity</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={2}>
        <DataGrid
          rows={filteredLeaves}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          className="min-h-96"
          sx={{
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
          }}
        />
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, leave: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this leave request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, leave: null })} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default LeaveManagement;
