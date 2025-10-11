import React, { memo, useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Grid, Avatar, Stack } from '@mui/material';
import { Dashboard, EventNote, EmailOutlined, PhoneOutlined, BusinessOutlined, WorkOutlineOutlined, CalendarTodayOutlined } from '@mui/icons-material';
// Removed unused hooks for simplified dashboard
import { useAuth } from '../../contexts/AuthContext';
import SimplePagination from '../common/SimplePagination';
import api from '../../api/axios';
import { userApiService } from '../../services/userApi';


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
    
    // User profile state
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    
    // Removed unused data hooks for simplified dashboard

    // Fetch user profile
    const fetchUserProfile = async () => {
      setProfileLoading(true);
      setProfileError('');
      try {
        const profile = await userApiService.getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        setProfileError(err.message || 'Failed to fetch user profile');
      } finally {
        setProfileLoading(false);
      }
    };

    // Helper function to get full name
    const getFullName = () => {
      if (profileLoading) return 'Loading...';
      
      const profile = userProfile || user;
      if (!profile) return 'USER';
      
      // Try to get first and last name
      if (profile.firstName && profile.lastName) {
        return `${profile.firstName} ${profile.lastName}`.toUpperCase();
      }
      
      // If name exists, return it as is
      if (profile.name) {
        return profile.name.toUpperCase();
      }
      
      // Fallback to email prefix
      if (profile.email) {
        return profile.email.split('@')[0].toUpperCase();
      }
      
      return 'USER';
    };

    // Fetch user leaves with pagination (deferred for better LCP)
    const fetchUserLeaves = async (page = userLeavesCurrentPage, limit = userLeavesPageSize) => {
      setUserLeavesLoading(true);
      setUserLeavesError('');
      try {
        const token = localStorage.getItem('token');
        
        // Try multiple endpoints to find working one
        let leavesData = [];
        let totalLeaves = 0;
        let allLeavesData = [];
        
        // Use the correct dashboard leaves endpoint
        
        const response = await api.get('/dashboard/leaves', {
          params: { page, limit }
        });
        
        // Process response data
        if (Array.isArray(response.data)) {
          leavesData = response.data;
          // If response.data is an array, check if it's paginated or all data
          if (leavesData.length === limit) {
            // If we got exactly the limit, there might be more data
            // Try to get total count by making another request
            try {
              const countResponse = await api.get('/dashboard/leaves', {
                params: { page: 1, limit: 1000 }
              });
              if (Array.isArray(countResponse.data)) {
                totalLeaves = countResponse.data.length;
                allLeavesData = countResponse.data;
              } else {
                totalLeaves = leavesData.length;
                allLeavesData = leavesData;
              }
            } catch {
              totalLeaves = leavesData.length;
              allLeavesData = leavesData;
            }
          } else {
            // If we got less than the limit, this is all the data
            totalLeaves = leavesData.length;
            allLeavesData = leavesData;
          }
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          leavesData = response.data.data;
          totalLeaves = response.data?.total || response.data?.totalLeaves || response.data?.count || response.data?.totalCount || 0;
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          leavesData = response.data.data;
          totalLeaves = response.data?.total || response.data?.totalLeaves || response.data?.count || response.data?.totalCount || 0;
        }
        
        // If totalLeaves is still 0 or equal to page size, we need to get the actual total
        if (totalLeaves === 0 || (totalLeaves === leavesData.length && leavesData.length === limit)) {
          try {
            const countResponse = await api.get('/dashboard/leaves', {
              params: { page: 1, limit: 1000 }
            });
            
            if (Array.isArray(countResponse.data)) {
              totalLeaves = countResponse.data.length;
              allLeavesData = countResponse.data;
            } else if (countResponse.data && countResponse.data.data && Array.isArray(countResponse.data.data)) {
              totalLeaves = countResponse.data.data.length;
              allLeavesData = countResponse.data.data;
            } else {
              totalLeaves = countResponse.data?.total || countResponse.data?.totalLeaves || countResponse.data?.count || countResponse.data?.totalCount || leavesData.length;
              allLeavesData = leavesData;
            }
          } catch (countError) {
            // If counting fails, use a reasonable estimate
            totalLeaves = leavesData.length;
            allLeavesData = leavesData;
          }
        }
        
        // Fetch all leaves for accurate status counts
        if (!allLeavesData || allLeavesData.length === 0) {
          try {
            const allLeavesResponse = await api.get('/dashboard/leaves', {
              params: { page: 1, limit: 10000 } // Large limit to get all leaves
            });
            
            if (Array.isArray(allLeavesResponse.data)) {
              allLeavesData = allLeavesResponse.data;
            } else if (allLeavesResponse.data && allLeavesResponse.data.data && Array.isArray(allLeavesResponse.data.data)) {
              allLeavesData = allLeavesResponse.data.data;
            } else {
              allLeavesData = leavesData; // Fallback to current page data
            }
          } catch (error) {
            console.warn('Failed to fetch all leaves for status counts, using current page data');
            allLeavesData = leavesData;
          }
        }
        
        setUserLeaves(leavesData);
        setUserLeavesTotal(totalLeaves);
        setUserLeavesCurrentPage(page);
        
        // Calculate status counts from ALL leaves data (not just current page)
        const statusCounts = {
          pending: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'pending').length,
          approved: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'approved').length,
          rejected: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'rejected').length
        };
        setUserLeavesStatusCounts(statusCounts);
        
        } catch (err) {
        
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
      setUserLeavesCurrentPage(newPage);
      fetchUserLeaves(newPage, userLeavesPageSize);
    };

    // Fetch user profile on component mount
    useEffect(() => {
      fetchUserProfile();
    }, []);

    // Fetch leaves when component mounts or when leaves tab is selected
    useEffect(() => {
      if (activeTab === 1) { // Leaves tab
        fetchUserLeaves(userLeavesCurrentPage, userLeavesPageSize);
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
          Welcome back, {getFullName()}!
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
('🔄 Tab changed to:', newValue);
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
          {profileError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {profileError}
            </Alert>
          )}

          {/* User Profile Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Name and Contact Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
                borderRadius: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(30, 60, 114, 0.4)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: '2.5rem',
                        bgcolor: 'white',
                        color: '#1e3c72',
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                      }}
                    >
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 
                       userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() :
                       user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1.5, letterSpacing: 0.5 }}>
                        {getFullName()}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailOutlined sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
                            {userProfile?.email || user?.email || 'N/A'}
                          </Typography>
                        </Box>
                        {userProfile?.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneOutlined sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
                              {userProfile.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Card */}
            {userProfile?.department && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(15, 32, 39, 0.4)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BusinessOutlined sx={{ color: 'white', fontSize: '2.5rem' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 1, fontWeight: 600 }}>
                      Department
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      {typeof userProfile.department === 'string' 
                        ? userProfile.department 
                        : userProfile.department?.name || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Position Card */}
            {userProfile?.position && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(15, 32, 39, 0.4)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <WorkOutlineOutlined sx={{ color: 'white', fontSize: '2.5rem' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 1, fontWeight: 600 }}>
                      Position
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      {userProfile.position}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Hire Date Card */}
            {(userProfile?.joinDate || userProfile?.hireDate || userProfile?.createdAt) && (
              <Grid item xs={12} sm={6} md={userProfile?.position ? 12 : 3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(15, 32, 39, 0.4)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarTodayOutlined sx={{ color: 'white', fontSize: '2.5rem' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 1, fontWeight: 600 }}>
                      Hire Date
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
                       userProfile?.hireDate ? new Date(userProfile.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
                       userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>



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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  
                  {/* Pagination for User Leaves - Only show if there are leaves to paginate */}
                  {userLeavesTotal > 0 && (
                    <SimplePagination
                      currentPage={userLeavesCurrentPage}
                      totalPages={Math.ceil(userLeavesTotal / userLeavesPageSize)}
                      totalItems={userLeavesTotal}
                      pageSize={userLeavesPageSize}
                      onPageChange={handleUserLeavesPageChange}
                    />
                  )}
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