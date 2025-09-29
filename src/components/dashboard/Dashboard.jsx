import React from 'react';
import { Stack, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import StatsCard from '../common/StatsCard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import { useEmployees, useDepartments, useLeaves, usePayroll } from '../../hooks/useHRData';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { leaves, loading: leavesLoading, error: leavesError } = useLeaves();
  const { payroll, loading: payrollLoading, error: payrollError } = usePayroll();

  // Calculate real data from backend
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  const totalDepartments = Array.isArray(departments) ? departments.length : 0;
  const pendingLeaves = Array.isArray(leaves) ? leaves.filter(leave => leave.status === 'pending').length : 0;
  const totalPayroll = Array.isArray(payroll) ? payroll.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;

  // Chart data based on real data
  const departmentData = Array.isArray(departments) && departments.length > 0 ? 
    departments.map(dept => ({
      label: dept.name || 'Unknown',
      value: 1 // Each department counts as 1 for now
    })) : [];

  const leaveStatusData = Array.isArray(leaves) && leaves.length > 0 ? [
    { label: 'Approved', value: leaves.filter(leave => leave.status === 'approved').length },
    { label: 'Pending', value: leaves.filter(leave => leave.status === 'pending').length },
    { label: 'Rejected', value: leaves.filter(leave => leave.status === 'rejected').length }
  ] : [
    { label: 'Approved', value: 0 },
    { label: 'Pending', value: 0 },
    { label: 'Rejected', value: 0 }
  ];

  // Loading state
  if (employeesLoading || departmentsLoading || leavesLoading || payrollLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome back{user?.name ? `, ${user.name.split('.')[0].split(' ')[0]}` : ''}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your organization today.
        </Typography>
      </Stack>

      {/* Stats Cards */}
      <Stack direction="row" spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={PeopleAltOutlinedIcon}
          color="primary"
        />
        <StatsCard
          title="Departments"
          value={totalDepartments}
          icon={LocationCityOutlinedIcon}
          color="info"
        />
        <StatsCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={EventNoteOutlinedIcon}
          color="warning"
        />
        <StatsCard
          title="Total Payroll"
          value={`$${totalPayroll.toLocaleString()}`}
          icon={AttachMoneyOutlinedIcon}
          color="success"
        />
      </Stack>

      {/* Charts Section */}
      <Stack direction="row" spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Department Distribution */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Department Distribution
          </Typography>
          {departmentData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: departmentData,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                },
              ]}
              height={300}
              slotProps={{
                legend: {
                  direction: 'column',
                  position: { vertical: 'middle', horizontal: 'right' },
                  padding: 0,
                },
              }}
            />
          ) : (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No departments data available</Typography>
            </Box>
          )}
        </Paper>

        {/* Leave Status Overview */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Leave Status Overview
          </Typography>
          {leaveStatusData.some(data => data.value > 0) ? (
            <PieChart
              series={[
                {
                  data: leaveStatusData,
                  innerRadius: 50,
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              height={300}
              colors={['#059669', '#d97706', '#dc2626']}
            />
          ) : (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No leave data available</Typography>
            </Box>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
};

export default Dashboard;