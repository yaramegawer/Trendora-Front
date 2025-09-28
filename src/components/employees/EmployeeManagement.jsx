import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import StatusChip from '../common/StatusChip';
import EmployeeForm from './EmployeeForm';
import { useEmployees, useDepartments } from '../../hooks/useHRData';

// helpers
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString();
};

const formatCurrency = (value) => {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const EmployeeStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const EmployeeManagement = () => {
  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const { departments, loading: departmentsLoading } = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter employees
  const filteredEmployees = (employees || []).filter((employee) => {
    if (!employee) return false;

    const matchesSearch =
      (employee.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' ||
      (employee.department && employee.department.name === departmentFilter);

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setOpenDialog(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setOpenDialog(true);
  };

  const handleDeleteEmployee = async (id) => {
    setActionLoading(true);
    const result = await deleteEmployee(id);
    if (!result.success) {
      console.error('Failed to delete employee:', result.error);
    }
    setActionLoading(false);
  };

  const handleSaveEmployee = async (employeeData) => {
    setActionLoading(true);
    let result;

    if (editingEmployee) {
      result = await updateEmployee(editingEmployee._id, employeeData);
    } else {
      result = await addEmployee(employeeData);
    }

    if (result.success) {
      setOpenDialog(false);
    } else {
      console.error('Failed to save employee:', result.error);
    }
    setActionLoading(false);
  };

  const columns = [
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (params) => {
        const firstName = params?.row?.firstName || '';
        const lastName = params?.row?.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      valueGetter: (params) => params?.row?.email || 'N/A',
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 180,
      valueGetter: (params) => params?.row?.position || 'N/A',
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      valueGetter: (params) => params?.row?.department?.name || 'N/A',
    },
    {
      field: 'hireDate',
      headerName: 'Hire Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value || 0),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <StatusChip status={params.value || 'inactive'} type="employee" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEditEmployee(params?.row)}
            className="text-blue-600 hover:bg-blue-50"
            disabled={!params?.row}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteEmployee(params?.row?._id)}
            className="text-red-600 hover:bg-red-50"
            disabled={!params?.row?._id}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={4} className="p-6">
      {/* Header */}
      <Stack direction="row" className="items-center justify-between">
        <Stack>
          <Typography variant="h5" className="font-bold">
            Employee Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization's employees
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEmployee}
          className="bg-primary-main hover:bg-primary-dark"
        >
          Add Employee
        </Button>
      </Stack>

      {/* Filters */}
      <Paper elevation={1} className="p-4">
        <Stack direction="row" spacing={3} className="items-center">
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="flex-1 max-w-md"
          />

          <FormControl size="small" className="min-w-32">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-40">
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {(departments || []).map((dept) => (
                <MenuItem key={dept._id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={2}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          getRowId={(row) => row._id}
          loading={employeesLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          className="min-h-96"
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            },
          }}
        />
      </Paper>

      {/* Employee Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <EmployeeForm
            employee={editingEmployee}
            departments={departments || []}
            onSave={handleSaveEmployee}
            onCancel={() => setOpenDialog(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default EmployeeManagement;
