import React, { useMemo, memo, useState, useEffect, Suspense } from 'react';
import { Box, Typography, Card, CardContent, Grid, Stack, Avatar, Button, CircularProgress, Alert, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Skeleton } from '@mui/material';
import { Dashboard, People, Computer, BusinessCenter, AccountBalance, TrendingUp, EventNote, Campaign } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

// Lazy load heavy components
const LazyStatsCard = React.lazy(() => import('./components/StatsCard'));
const LazyRecentActivities = React.lazy(() => import('./components/RecentActivities'));
const LazyDepartmentsGrid = React.lazy(() => import('./components/DepartmentsGrid'));

// Optimized data fetching with caching
const useOptimizedData = () => {
  const [data, setData] = useState({
    employees: [],
    departments: [],
    leaves: [],
    payroll: [],
    itProjects: [],
    operationCampaigns: [],
    operationLeaves: [],
    operationEmployees: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only essential data first for LCP
        const [employeesRes, departmentsRes] = await Promise.all([
          api.get('/hr/employees?page=1&limit=10'), // Only first page
          api.get('/hr/departments')
        ]);

        setData(prev => ({
          ...prev,
          employees: employeesRes.data?.data || [],
          departments: departmentsRes.data?.data || [],
          loading: false
        }));

        // Fetch remaining data in background
        setTimeout(async () => {
          try {
            const [leavesRes, payrollRes, itProjectsRes, operationCampaignsRes] = await Promise.all([
              api.get('/hr/leaves?page=1&limit=10'),
              api.get('/hr/payroll?page=1&limit=10'),
              api.get('/it/projects?page=1&limit=10'),
              api.get('/operation/campaigns?page=1&limit=10')
            ]);

            setData(prev => ({
              ...prev,
              leaves: leavesRes.data?.data || [],
              payroll: payrollRes.data?.data || [],
              itProjects: itProjectsRes.data?.data || [],
              operationCampaigns: operationCampaignsRes.data?.data || []
            }));
          } catch (err) {
            console.error('Background data fetch error:', err);
          }
        }, 100);
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };

    fetchData();
  }, []);

  return data;
};

// Skeleton components for better perceived performance
const StatsSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4].map((i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="80%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const OverviewDashboard = memo(() => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const data = useOptimizedData();

  // Memoized calculations
  const statistics = useMemo(() => {
    if (data.loading) return null;

    const totalEmployees = data.employees.length;
    const totalDepartments = data.departments.length;
    const pendingLeaves = data.leaves.filter(leave => leave.status === 'pending').length;
    const totalPayroll = data.payroll.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      totalPayroll
    };
  }, [data]);

  // Early return for loading state
  if (data.loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={400} height={24} />
        </Box>
        <StatsSkeleton />
      </Box>
    );
  }

  // Error state
  if (data.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {data.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Here's what's happening with your organization today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <LazyStatsCard statistics={statistics} />
      </Suspense>

      {/* Recent Activities */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>
          Recent Activities
        </Typography>
        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={200} />}>
          <LazyRecentActivities data={data} />
        </Suspense>
      </Box>

      {/* Departments Grid */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>
          Departments
        </Typography>
        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
          <LazyDepartmentsGrid departments={data.departments} />
        </Suspense>
      </Box>
    </Box>
  );
});

OverviewDashboard.displayName = 'OverviewDashboard';

export default OverviewDashboard;
