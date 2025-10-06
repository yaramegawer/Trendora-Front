import React, { memo, useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Grid, Avatar, Stack } from '@mui/material';
import { Dashboard, EventNote } from '@mui/icons-material';
// Removed unused hooks for simplified dashboard
import { useAuth } from '../../contexts/AuthContext';
import SimplePagination from '../common/SimplePagination';
import api from '../../api/axios';


const OverviewDashboard = memo(() => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [userLeaves, setUserLeaves] = useState([]);
    const [userLeavesLoading, setUserLeavesLoading] = useState(false);
    const [userLeavesError, setUserLeavesError] = useState('');
    
    // Pagination state for user leaves
    const [userLeavesCurrentPage, setUserLeavesCurrentPage] = useState(1);
    const [userLeavesPageSize, setUserLeavesPageSize] = useState(10);
    const [userLeavesTotal, setUserLeavesTotal] = useState(0);
    const [userLeavesStatusCounts, setUserLeavesStatusCounts] = useState({
      pending: 0,
      approved: 0,
      rejected: 0
    });
    
    // Removed unused data hooks for simplified dashboard

    // Fetch user leaves with pagination (deferred for better LCP)
    const fetchUserLeaves = async (page = userLeavesCurrentPage, limit = userLeavesPageSize) => {
      setUserLeavesLoading(true);
      setUserLeavesError('');
      try {
        console.log('🔄 Fetching user leaves with pagination - Page:', page, 'Limit:', limit);
        console.log('🔍 User role:', user?.role);
        console.log('🔍 User object:', user);
        
        // Debug token and headers
        const token = localStorage.getItem('token');
        console.log('🔑 Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        console.log('🔑 Full token:', token);
        console.log('🔑 User from localStorage:', localStorage.getItem('user'));
        
        // Try multiple endpoints to find working one
        let leavesData = [];
        let totalLeaves = 0;
        
        // Use the correct dashboard leaves endpoint
        console.log('🔄 Trying /dashboard/leaves endpoint...');
        console.log('🔑 Request will be made to:', `${api.defaults.baseURL}/dashboard/leaves`);
        console.log('🔑 With params:', { page, limit });
        console.log('🔑 With token:', token ? 'YES' : 'NO');
        
        const response = await api.get('/dashboard/leaves', {
          params: { page, limit }
        });
          
        console.log('📡 Dashboard Leaves API Response:', response);
        
        // Process response data
        if (Array.isArray(response.data)) {
          leavesData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          leavesData = response.data.data;
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          leavesData = response.data.data;
        }
        
        totalLeaves = response.data?.total || response.data?.totalLeaves || leavesData.length;
        
        console.log('📊 Final leaves data:', leavesData);
        console.log('📊 Total leaves:', totalLeaves);
        
        setUserLeaves(leavesData);
        setUserLeavesTotal(totalLeaves);
        setUserLeavesCurrentPage(page);
        
        // Calculate status counts from current data
        const statusCounts = {
          pending: leavesData.filter(leave => (leave.status || '').toLowerCase() === 'pending').length,
          approved: leavesData.filter(leave => (leave.status || '').toLowerCase() === 'approved').length,
          rejected: leavesData.filter(leave => (leave.status || '').toLowerCase() === 'rejected').length
        };
        setUserLeavesStatusCounts(statusCounts);
        
        console.log('📊 Status counts:', statusCounts);
        
        } catch (err) {
          console.error('❌ User Leaves API Error:', err);
          console.error('❌ Error details:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              headers: err.config?.headers,
              baseURL: err.config?.baseURL
            }
          });
        
        // Provide more specific error messages but don't block the UI
        let errorMessage = 'Unable to fetch leaves data';
        if (err.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Backend permission issue - showing empty state';
        } else if (err.response?.status === 404) {
          errorMessage = 'Leaves endpoint not found. Please contact support.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        // Set error but don't clear the leaves array completely - show empty state instead
        setUserLeavesError(errorMessage);
        setUserLeaves([]);
        setUserLeavesTotal(0);
      } finally {
        setUserLeavesLoading(false);
      }
    };

    // Handle page change for user leaves
    const handleUserLeavesPageChange = (newPage) => {
      console.log('OverviewDashboard: User leaves page change to:', newPage);
      setUserLeavesCurrentPage(newPage);
      fetchUserLeaves(newPage, userLeavesPageSize);
    };

    // Fetch leaves when component mounts or when leaves tab is selected
    useEffect(() => {
      if (activeTab === 1) { // Leaves tab
        fetchUserLeaves();
      }
    }, [activeTab]);


    // Utility functions for leaves
    const getStatusColor = (status) => {
      switch ((status || '').toLowerCase()) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'default';
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (error) {
        return 'Invalid Date';
      }
    };

  // Removed statistics calculations for simplified dashboard
  
  // Removed activities calculation for simplified dashboard

  // Removed error handling and departments data for simplified dashboard

  return (
    <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1.75rem' }}>
          Welcome back, {user?.name ? user.name.split('.')[0].split(' ')[0] : 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your comprehensive business management dashboard
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => {
            console.log('🔄 Tab changed to:', newValue);
            setActiveTab(newValue);
          }} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          aria-label="dashboard tabs"
        >
          <Tab 
            label="Overview" 
            icon={<Dashboard />} 
            iconPosition="start" 
            id="overview-tab"
            aria-controls="overview-panel"
          />
          <Tab 
            label="My Leaves" 
            icon={<EventNote />} 
            iconPosition="start" 
            id="leaves-tab"
            aria-controls="leaves-panel"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box id="overview-panel" role="tabpanel" aria-labelledby="overview-tab">
          {/* Welcome Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Welcome to Trendora Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Hello, {user?.name ? user.name.split('.')[0].split(' ')[0] : 'User'}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your comprehensive business management platform is ready to help you stay organized and productive.
              </Typography>
            </CardContent>
          </Card>



          {/* Recent Activity Placeholder */}
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <EventNote />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Dashboard accessed successfully
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Dashboard />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Welcome to Trendora Dashboard
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      System initialized
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Leaves Tab */}
      {activeTab === 1 && (
        <Box id="leaves-panel" role="tabpanel" aria-labelledby="leaves-tab">
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            My Leave Requests
          </Typography>
          
          
          {userLeavesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading your leaves...</Typography>
            </Box>
          ) : userLeaves.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <EventNote sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {userLeavesError ? 'Unable to load leave requests' : 'No leave requests found'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userLeavesError 
                    ? 'There was an issue loading your leave data. Please try refreshing the page or contact support if the issue persists.'
                    : "You haven't submitted any leave requests yet."
                  }
                </Typography>
                {userLeavesError && (
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setUserLeavesError('');
                        fetchUserLeaves(userLeavesCurrentPage, userLeavesPageSize);
                      }}
                    >
                      Try Again
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Leaves Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <EventNote />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" gutterBottom variant="h6">
                            Pending
                          </Typography>
                          <Typography variant="h4" component="div">
                            {userLeavesStatusCounts.pending}
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
                          <EventNote />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" gutterBottom variant="h6">
                            Approved
                          </Typography>
                          <Typography variant="h4" component="div">
                            {userLeavesStatusCounts.approved}
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
                          <EventNote />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" gutterBottom variant="h6">
                            Rejected
                          </Typography>
                          <Typography variant="h4" component="div">
                            {userLeavesStatusCounts.rejected}
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
                          <EventNote />
                        </Avatar>
                        <Box>
                          <Typography color="textSecondary" gutterBottom variant="h6">
                            Total
                          </Typography>
                          <Typography variant="h4" component="div">
                            {userLeavesTotal}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Leaves Table */}
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 3 }}>
                    Leave History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Leave Type</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Applied Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userLeaves.map((leave) => (
                          <TableRow key={leave._id || leave.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {leave.leaveType || leave.type || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(leave.startDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(leave.endDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(leave.appliedDate || leave.createdAt || leave.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status || 'Unknown'}
                                color={getStatusColor(leave.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination for User Leaves */}
                  <SimplePagination
                    currentPage={userLeavesCurrentPage}
                    totalPages={Math.ceil(userLeavesTotal / userLeavesPageSize)}
                    totalItems={userLeavesTotal}
                    pageSize={userLeavesPageSize}
                    onPageChange={handleUserLeavesPageChange}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      )}
    </Box>
  );
});

OverviewDashboard.displayName = 'OverviewDashboard';

export default OverviewDashboard;