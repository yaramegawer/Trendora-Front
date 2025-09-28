import React from 'react';
import { Stack, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import StatsCard from '../common/StatsCard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import { useEmployees, useDepartments, useLeaves, usePayroll } from '../../hooks/useHRData';

const WorkingDashboard = () => {
  const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { leaves, loading: leavesLoading, error: leavesError } = useLeaves();
  const { payroll, loading: payrollLoading, error: payrollError } = usePayroll();


  const monthlyHiringData = [
    { month: 'Jan', hires: 12 },
    { month: 'Feb', hires: 8 },
    { month: 'Mar', hires: 15 },
    { month: 'Apr', hires: 10 },
    { month: 'May', hires: 18 },
    { month: 'Jun', hires: 14 }
  ];

  // Calculate real data from backend
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  const totalDepartments = Array.isArray(departments) ? departments.length : 0;
  const pendingLeaves = Array.isArray(leaves) ? leaves.filter(leave => leave.status === 'pending').length : 0;
  const totalPayroll = Array.isArray(payroll) ? payroll.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;

  const leaveStatusData = Array.isArray(leaves) && leaves.length > 0 ? [
    { label: 'Approved', value: leaves.filter(leave => leave.status === 'approved').length },
    { label: 'Pending', value: leaves.filter(leave => leave.status === 'pending').length },
    { label: 'Rejected', value: leaves.filter(leave => leave.status === 'rejected').length }
  ] : [
    { label: 'Approved', value: 0 },
    { label: 'Pending', value: 0 },
    { label: 'Rejected', value: 0 }
  ];

  // Recent activities based on real data
  const recentActivities = [
    { 
      type: 'employee', 
      message: `Total employees: ${totalEmployees}`, 
      time: 'Current', 
      icon: '👥',
      color: 'primary' 
    },
    { 
      type: 'leave', 
      message: `Pending leaves: ${pendingLeaves}`, 
      time: 'Current', 
      icon: '📋',
      color: 'warning' 
    },
    { 
      type: 'payroll', 
      message: `Total payroll: $${totalPayroll.toLocaleString()}`, 
      time: 'Current', 
      icon: '💰',
      color: 'success' 
    },
  ];

  const salaryRangeData = [
    { range: '40-60k', count: 25 },
    { range: '60-80k', count: 45 },
    { range: '80-100k', count: 35 },
    { range: '100k+', count: 15 }
  ];

  // Loading state
  if (employeesLoading || departmentsLoading || leavesLoading || payrollLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  const hasError = employeesError || departmentsError || leavesError || payrollError;

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome back!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your organization today.
        </Typography>
      </Stack>

      {/* Error Alert */}
      {hasError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some data may not be up to date. Using fallback data.
        </Alert>
      )}

      {/* Stats Cards */}
      <Stack 
        direction="row" 
        spacing={3} 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 3 
        }}
      >
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={PeopleAltOutlinedIcon}
          color="primary"
          trend={{ direction: 'up', percentage: 12 }}
        />
        <StatsCard
          title="Departments"
          value={totalDepartments}
          icon={LocationCityOutlinedIcon}
          color="info"
          trend={{ direction: 'up', percentage: 5 }}
        />
        <StatsCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={EventNoteOutlinedIcon}
          color="warning"
          trend={{ direction: 'down', percentage: 8 }}
        />
        <StatsCard
          title="Total Payroll"
          value={`$${totalPayroll.toLocaleString()}`}
          icon={AttachMoneyOutlinedIcon}
          color="success"
          trend={{ direction: 'up', percentage: 15 }}
        />
      </Stack>

      {/* Charts Section - Using simple visualizations instead of MUI X Charts */}
      <Stack 
        direction="row" 
        spacing={3} 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr' }, 
          gap: 3 
        }}
      >
        {/* Monthly Hiring Trend */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Monthly Hiring Trend
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {monthlyHiringData.map((data, index) => (
              <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ minWidth: 40 }}>
                  {data.month}:
                </Typography>
                <Box 
                  sx={{ 
                    width: `${(data.hires / 20) * 100}%`, 
                    height: 20, 
                    backgroundColor: '#3b82f6',
                    mr: 2,
                    borderRadius: 1
                  }} 
                />
                <Typography variant="body2">{data.hires} hires</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>

      <Stack 
        direction="row" 
        spacing={3} 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
          gap: 3 
        }}
      >
        {/* Leave Status Overview */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Leave Status Overview
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {leaveStatusData.map((data, index) => (
              <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    backgroundColor: index === 0 ? '#059669' : index === 1 ? '#d97706' : '#dc2626',
                    mr: 2,
                    borderRadius: 1
                  }} 
                />
                <Typography variant="body2">
                  {data.label}: {data.value} requests
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Salary Range Distribution */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Salary Range Distribution
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {salaryRangeData.map((data, index) => (
              <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ minWidth: 60 }}>
                  {data.range}:
                </Typography>
                <Box 
                  sx={{ 
                    width: `${(data.count / 50) * 100}%`, 
                    height: 20, 
                    backgroundColor: '#0891b2',
                    mr: 2,
                    borderRadius: 1
                  }} 
                />
                <Typography variant="body2">{data.count} employees</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>

      {/* Recent Activities Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Activities
        </Typography>
        <Stack spacing={2}>
          {recentActivities.map((activity, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: `${activity.color}.50`,
                  color: `${activity.color}.main`,
                  fontSize: '1.2rem'
                }}
              >
                {activity.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {activity.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default WorkingDashboard;
