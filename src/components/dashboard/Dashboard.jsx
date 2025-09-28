import React from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import StatsCard from '../common/StatsCard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import { mockStore } from '../../data/mockData';
import { useEmployees, useDepartments, useLeaves } from '../../hooks/useHRData';

const Dashboard = () => {
  const { dashboardStats } = mockStore;
  const { employees } = useEmployees();
  const { departments } = useDepartments();
  const { leaves } = useLeaves();

  // Chart data
  const departmentData = departments.map(dept => ({
    label: dept.name,
    value: dept.employeeCount
  }));

  const monthlyHiringData = [
    { month: 'Jan', hires: 12 },
    { month: 'Feb', hires: 8 },
    { month: 'Mar', hires: 15 },
    { month: 'Apr', hires: 10 },
    { month: 'May', hires: 18 },
    { month: 'Jun', hires: 14 }
  ];

  const leaveStatusData = [
    { label: 'Approved', value: 45 },
    { label: 'Pending', value: 12 },
    { label: 'Rejected', value: 8 }
  ];

  const salaryRangeData = [
    { range: '40-60k', count: 25 },
    { range: '60-80k', count: 45 },
    { range: '80-100k', count: 35 },
    { range: '100k+', count: 15 }
  ];

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome back, {mockStore.user.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your organization today.
        </Typography>
      </Stack>

      {/* Stats Cards */}
      <Stack direction="row" spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        <StatsCard
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          icon={PeopleAltOutlinedIcon}
          color="primary"
          trend={{ direction: 'up', percentage: 12 }}
        />
        <StatsCard
          title="Departments"
          value={dashboardStats.totalDepartments}
          icon={LocationCityOutlinedIcon}
          color="info"
          trend={{ direction: 'up', percentage: 5 }}
        />
        <StatsCard
          title="Pending Leaves"
          value={dashboardStats.pendingLeaves}
          icon={EventNoteOutlinedIcon}
          color="warning"
          trend={{ direction: 'down', percentage: 8 }}
        />
        <StatsCard
          title="Monthly Payroll"
          value={dashboardStats.monthlyPayroll}
          icon={AttachMoneyOutlinedIcon}
          color="success"
          trend={{ direction: 'up', percentage: 15 }}
        />
      </Stack>

      {/* Charts Section */}
      <Stack direction="row" spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Department Distribution */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Department Distribution
          </Typography>
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
        </Paper>

        {/* Monthly Hiring Trend */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Monthly Hiring Trend
          </Typography>
          <LineChart
            xAxis={[{ 
              scaleType: 'point', 
              data: monthlyHiringData.map(d => d.month) 
            }]}
            series={[
              {
                data: monthlyHiringData.map(d => d.hires),
                color: '#1c242e',
                curve: 'linear'
              },
            ]}
            height={300}
            grid={{ vertical: true, horizontal: true }}
          />
        </Paper>
      </Stack>

      <Stack direction="row" spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Leave Status Overview */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Leave Status Overview
          </Typography>
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
        </Paper>

        {/* Salary Range Distribution */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Salary Range Distribution
          </Typography>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: salaryRangeData.map(d => d.range) 
            }]}
            series={[
              {
                data: salaryRangeData.map(d => d.count),
                color: '#0891b2'
              },
            ]}
            height={300}
            grid={{ horizontal: true }}
          />
        </Paper>
      </Stack>
    </Stack>
  );
};

export default Dashboard;