import React, { useMemo, memo, useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Stack, Avatar, Button, CircularProgress, Alert, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Dashboard, People, Computer, BusinessCenter, AccountBalance, TrendingUp, EventNote, Campaign } from '@mui/icons-material';
import { useEmployees, useDepartments, useLeaves, usePayroll } from '../../hooks/useHRData';
import { useITProjects } from '../../hooks/useITData';
import { useOperationCampaigns, useOperationLeaves, useOperationEmployees } from '../../hooks/useOperationData';
import { useMarketingProjects, useMarketingTickets } from '../../hooks/useMarketingData';
import { useAuth } from '../../contexts/AuthContext';
import SimplePagination from '../common/SimplePagination';
import api from '../../api/axios';


const OverviewDashboard = memo(() => {
  try {
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
    
    const { 
      employees, 
      loading: employeesLoading, 
      error: employeesError, 
      totalEmployees: totalEmployeesCount 
    } = useEmployees(1, 5); // Load only 5 employees initially for better LCP
    const { 
      departments, 
      loading: departmentsLoading, 
      error: departmentsError 
    } = useDepartments();
    const { 
      leaves, 
      loading: leavesLoading, 
      error: leavesError, 
      totalLeaves: totalLeavesCount 
    } = useLeaves(1, 5); // Load only 5 leaves initially
    const { 
      payroll, 
      loading: payrollLoading, 
      error: payrollError, 
      totalPayroll: totalPayrollCount 
    } = usePayroll(1, 5); // Load only 5 payroll records initially
    const { projects: itProjects, loading: itProjectsLoading, error: itProjectsError } = useITProjects(1, 5); // Load only 5 projects initially
    const { campaigns: operationCampaigns, loading: operationCampaignsLoading, error: operationCampaignsError } = useOperationCampaigns(1, 5); // Load only 5 campaigns initially
    const { leaves: operationLeaves, loading: operationLeavesLoading, error: operationLeavesError } = useOperationLeaves(1, 5); // Load only 5 leaves initially
    const { employees: operationEmployees, loading: operationEmployeesLoading, error: operationEmployeesError } = useOperationEmployees(1, 5); // Load only 5 employees initially
    const { projects: marketingProjects, loading: marketingProjectsLoading, error: marketingProjectsError } = useMarketingProjects(1, 5); // Load only 5 projects initially
    const { tickets: marketingTickets, loading: marketingTicketsLoading, error: marketingTicketsError } = useMarketingTickets(1, 5); // Load only 5 tickets initially

    // Fetch user leaves with pagination (deferred for better LCP)
    const fetchUserLeaves = async (page = userLeavesCurrentPage, limit = userLeavesPageSize) => {
      setUserLeavesLoading(true);
      setUserLeavesError('');
      try {
        console.log('🔄 Fetching user leaves with pagination - Page:', page, 'Limit:', limit);
        
        // First, fetch all leaves to get total count and status counts
        console.log('🔄 Fetching all leaves for total count...');
        const allLeavesResponse = await api.get('/dashboard/leaves', {
          params: { page: 1, limit: 1000 } // Get all leaves
        });
        
        // Then fetch paginated data
        const paginatedResponse = await api.get('/dashboard/leaves', {
          params: { page, limit }
        });
        
        console.log('📡 All Leaves API Response:', allLeavesResponse);
        console.log('📡 Paginated API Response:', paginatedResponse);
        
        // Process all leaves for total count and status counts
        let allLeavesData = [];
        if (Array.isArray(allLeavesResponse.data)) {
          allLeavesData = allLeavesResponse.data;
        } else if (allLeavesResponse.data && allLeavesResponse.data.data && Array.isArray(allLeavesResponse.data.data)) {
          allLeavesData = allLeavesResponse.data.data;
        } else if (allLeavesResponse.data && allLeavesResponse.data.success && Array.isArray(allLeavesResponse.data.data)) {
          allLeavesData = allLeavesResponse.data.data;
        }
        
        // Process paginated data for current page
        let leavesData = [];
        if (Array.isArray(paginatedResponse.data)) {
          leavesData = paginatedResponse.data;
        } else if (paginatedResponse.data && paginatedResponse.data.data && Array.isArray(paginatedResponse.data.data)) {
          leavesData = paginatedResponse.data.data;
        } else if (paginatedResponse.data && paginatedResponse.data.success && Array.isArray(paginatedResponse.data.data)) {
          leavesData = paginatedResponse.data.data;
        }
        
        const totalLeaves = allLeavesData.length;
        
        console.log('📊 All leaves count:', totalLeaves);
        console.log('📊 Current page data:', leavesData);
        
        setUserLeaves(leavesData);
        setUserLeavesTotal(totalLeaves);
        setUserLeavesCurrentPage(page);
        
        // Calculate status counts from all leaves data for accurate counts
        const statusCounts = {
          pending: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'pending').length,
          approved: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'approved').length,
          rejected: allLeavesData.filter(leave => (leave.status || '').toLowerCase() === 'rejected').length
        };
        setUserLeavesStatusCounts(statusCounts);
        
        console.log('📊 Status counts:', statusCounts);
      } catch (err) {
        console.error('❌ User Leaves API Error:', err);
        setUserLeavesError(err.message || 'Failed to fetch leaves');
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

  // Memoized statistics calculations for better performance
  const statistics = useMemo(() => {
    const totalEmployees = totalEmployeesCount || 0;
    const totalDepartments = Array.isArray(departments) ? departments.length : 0; // Departments don't have pagination
    const pendingLeaves = Array.isArray(leaves) ? leaves.filter(leave => leave.status === 'pending').length : 0;
    const totalPayroll = Array.isArray(payroll) ? payroll.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const approvedLeaves = Array.isArray(leaves) ? leaves.filter(leave => leave.status === 'approved').length : 0;
    const rejectedLeaves = Array.isArray(leaves) ? leaves.filter(leave => leave.status === 'rejected').length : 0;
    
    // Calculate employee status statistics from database
    const activeEmployees = Array.isArray(employees) ? employees.filter(employee => 
      employee.status === 'active' || employee.status === 'Active'
    ).length : 0;
    const inactiveEmployees = Array.isArray(employees) ? employees.filter(employee => 
      employee.status === 'inactive' || employee.status === 'Inactive'
    ).length : 0;
    
    // Calculate IT projects statistics
    const totalITProjects = Array.isArray(itProjects) ? itProjects.length : 0;
    const activeITProjects = Array.isArray(itProjects) ? itProjects.filter(project => 
      project.status === 'active' || project.status === 'in-progress' || project.status === 'ongoing'
    ).length : 0;
    const completedITProjects = Array.isArray(itProjects) ? itProjects.filter(project => 
      project.status === 'completed' || project.status === 'done' || project.status === 'finished'
    ).length : 0;
    
    // Calculate Operations campaigns statistics
    const totalOperationCampaigns = Array.isArray(operationCampaigns) ? operationCampaigns.length : 0;
    const activeOperationCampaigns = Array.isArray(operationCampaigns) ? operationCampaigns.filter(campaign => 
      campaign.status === 'active' || campaign.status === 'in-progress' || campaign.status === 'ongoing'
    ).length : 0;
    const completedOperationCampaigns = Array.isArray(operationCampaigns) ? operationCampaigns.filter(campaign => 
      campaign.status === 'completed' || campaign.status === 'done' || campaign.status === 'finished'
    ).length : 0;
    
    // Calculate Accounting statistics (using payroll data)
    const totalTransactions = Array.isArray(payroll) ? payroll.length : 0;
    const pendingTransactions = Array.isArray(payroll) ? payroll.filter(p => p.status === 'pending').length : 0;
    const completedTransactions = Array.isArray(payroll) ? payroll.filter(p => p.status === 'completed' || p.status === 'paid').length : 0;
    
    // Calculate Marketing statistics
    const totalMarketingProjects = Array.isArray(marketingProjects) ? marketingProjects.length : 0;
    const activeMarketingProjects = Array.isArray(marketingProjects) ? marketingProjects.filter(project => 
      project.status === 'active' || project.status === 'in-progress' || project.status === 'ongoing'
    ).length : 0;
    const completedMarketingProjects = Array.isArray(marketingProjects) ? marketingProjects.filter(project => 
      project.status === 'completed' || project.status === 'done' || project.status === 'finished'
    ).length : 0;
    
    // Calculate Marketing tickets statistics
    const totalMarketingTickets = Array.isArray(marketingTickets) ? marketingTickets.length : 0;
    const openMarketingTickets = Array.isArray(marketingTickets) ? marketingTickets.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'pending' || ticket.status === 'in-progress'
    ).length : 0;
    const resolvedMarketingTickets = Array.isArray(marketingTickets) ? marketingTickets.filter(ticket => 
      ticket.status === 'resolved' || ticket.status === 'closed' || ticket.status === 'completed'
    ).length : 0;

    // Calculate Sales statistics (mock data for now - would need sales API)
    const totalLeads = 0; // Would need sales API
    const convertedLeads = 0; // Would need sales API
    const pendingLeads = 0; // Would need sales API

    return {
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      totalPayroll,
      approvedLeaves,
      rejectedLeaves,
      activeEmployees,
      inactiveEmployees,
      totalITProjects,
      activeITProjects,
      completedITProjects,
      totalOperationCampaigns,
      activeOperationCampaigns,
      completedOperationCampaigns,
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      totalMarketingProjects,
      activeMarketingProjects,
      completedMarketingProjects,
      totalMarketingTickets,
      openMarketingTickets,
      resolvedMarketingTickets,
      totalLeads,
      convertedLeads,
      pendingLeads
    };
  }, [employees, departments, leaves, payroll, itProjects, operationCampaigns, marketingProjects, marketingTickets, totalEmployeesCount, totalLeavesCount, totalPayrollCount]);

  const {
    totalEmployees,
    totalDepartments,
    pendingLeaves,
    totalPayroll,
    approvedLeaves,
    rejectedLeaves,
    activeEmployees,
    inactiveEmployees,
    totalITProjects,
    activeITProjects,
    completedITProjects,
    totalOperationCampaigns,
    activeOperationCampaigns,
    completedOperationCampaigns,
    totalTransactions,
    pendingTransactions,
    completedTransactions,
    totalMarketingProjects,
    activeMarketingProjects,
    completedMarketingProjects,
    totalMarketingTickets,
    openMarketingTickets,
    resolvedMarketingTickets,
    totalLeads,
    convertedLeads,
    pendingLeads
  } = statistics;
  
  // Memoized recent activities calculation - limited to 4 activities
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add recent employee activities
    if (totalEmployees > 0) {
      activities.push({
        type: 'employees',
        message: `${totalEmployees} employees currently in the system`,
        color: 'primary.main'
      });
    }
    
    // Add recent leave activities
    if (pendingLeaves > 0) {
      activities.push({
        type: 'leaves',
        message: `${pendingLeaves} leave requests pending approval`,
        color: 'warning.main'
      });
    }
    
    if (approvedLeaves > 0) {
      activities.push({
        type: 'leaves',
        message: `${approvedLeaves} leave requests approved this period`,
        color: 'success.main'
      });
    }
    
    // Add recent project activities
    if (totalITProjects > 0) {
      activities.push({
        type: 'projects',
        message: `${totalITProjects} IT projects in progress`,
        color: 'info.main'
      });
    }
    
    // Add recent campaign activities
    if (totalOperationCampaigns > 0) {
      activities.push({
        type: 'campaigns',
        message: `${totalOperationCampaigns} operation campaigns running`,
        color: 'success.main'
      });
    }
    
    // Add recent payroll activities
    if (totalTransactions > 0) {
      activities.push({
        type: 'payroll',
        message: `${totalTransactions} payroll transactions processed`,
        color: 'warning.main'
      });
    }
    
    // Add department activities
    if (totalDepartments > 0) {
      activities.push({
        type: 'departments',
        message: `${totalDepartments} departments actively managed`,
        color: 'info.main'
      });
    }
    
    // Add operation-specific recent activities
    const recentOperationCampaigns = Array.isArray(operationCampaigns) ? operationCampaigns
      .filter(campaign => campaign.createdAt || campaign.created_at)
      .slice(0, 2) : [];
    
    recentOperationCampaigns.forEach(campaign => {
      const campaignName = campaign.name || campaign.title || campaign.campaignName || 'Untitled Campaign';
      
      activities.push({
        type: 'operation',
        message: `New campaign created: ${campaignName}`,
        color: 'success.main'
      });
    });
    
    // Add operation employee rating activities with real timestamps and employee names
    const recentOperationLeaves = Array.isArray(operationLeaves) ? operationLeaves
      .filter(leave => leave.updatedAt || leave.updated_at)
      .sort((a, b) => new Date(b.updatedAt || b.updated_at) - new Date(a.updatedAt || a.updated_at))
      .slice(0, 1) : [];
    
    recentOperationLeaves.forEach(leave => {
      // Try to find employee name from operation employees data
      let employeeName = 'Employee';
      if (leave.employeeId && Array.isArray(operationEmployees)) {
        const employee = operationEmployees.find(emp => emp._id === leave.employeeId || emp.id === leave.employeeId);
        if (employee) {
          employeeName = employee.firstName && employee.lastName 
            ? `${employee.firstName} ${employee.lastName}`
            : employee.name || employee.firstName || employee.lastName || 'Employee';
        }
      } else {
        employeeName = leave.employeeName || leave.employee?.name || leave.employeeName || 'Employee';
      }
      
      activities.push({
        type: 'operation',
        message: `Employee rating updated: ${employeeName}`,
        color: 'primary.main'
      });
    });
    
    // Add operation task completion activities
    const recentlyCompletedOperationCampaigns = Array.isArray(operationCampaigns) ? operationCampaigns
      .filter(campaign => 
        (campaign.status === 'completed' || campaign.status === 'done' || campaign.status === 'finished') &&
        (campaign.updatedAt || campaign.updated_at)
      )
      .slice(0, 1) : [];
    
    recentlyCompletedOperationCampaigns.forEach(campaign => {
      const campaignName = campaign.name || campaign.title || campaign.campaignName || 'Campaign Task';
      
      activities.push({
        type: 'operation',
        message: `Task completed: ${campaignName}`,
        color: 'success.main'
      });
    });
    
    // Add operation leave activities
    const pendingOperationLeaves = Array.isArray(operationLeaves) ? operationLeaves.filter(leave => leave.status === 'pending').length : 0;
    if (pendingOperationLeaves > 0) {
      activities.push({
        type: 'operation',
        message: `${pendingOperationLeaves} operation leave requests pending`,
        color: 'warning.main'
      });
    }
    
    const approvedOperationLeaves = Array.isArray(operationLeaves) ? operationLeaves.filter(leave => leave.status === 'approved').length : 0;
    if (approvedOperationLeaves > 0) {
      activities.push({
        type: 'operation',
        message: `${approvedOperationLeaves} operation leave requests approved`,
        color: 'success.main'
      });
    }
    
    // Limit to 4 activities
    return activities.slice(0, 4);
  }, [totalEmployees, pendingLeaves, approvedLeaves, totalITProjects, totalOperationCampaigns, totalTransactions, totalDepartments, operationCampaigns, operationLeaves, operationEmployees]);

  // Calculate growth percentage (mock calculation for now)
  const growthPercentage = totalEmployees > 0 ? Math.round((totalEmployees / 100) * 12) : 0;

  // Loading state
  if (employeesLoading || departmentsLoading || leavesLoading || payrollLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Error state - show fallback dashboard with error message
  if (employeesError || departmentsError || leavesError || payrollError) {
    console.log('OverviewDashboard: API Errors detected:', {
      employeesError,
      departmentsError,
      leavesError,
      payrollError
    });
    
    // Check if it's an authentication error
    const isAuthError = [employeesError, departmentsError, leavesError, payrollError].some(
      error => error && (error.includes('Unauthorized') || error.includes('Authentication') || error.includes('sign_in'))
    );
    
    return (
      <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh' }}>
        {/* Header - Optimized for LCP */}
        <Box sx={{ mb: 4 }}>
          <h1 style={{ 
            fontWeight: 'bold', 
            color: '#1e293b', 
            fontSize: '1.75rem',
            margin: '0 0 8px 0',
            lineHeight: '1.2'
          }}>
            Welcome back, {user?.name?.split('.')[0]?.split(' ')[0] || 'User'}!
          </h1>
          <p style={{ 
            color: '#64748b',
            margin: '0',
            fontSize: '1rem'
          }}>
            Your comprehensive business management dashboard
          </p>
        </Box>

        {/* Error Alert */}
        <Alert severity="warning" sx={{ mb: 4 }}>
          {isAuthError 
            ? 'Authentication required. Please log in again to view your data.'
            : 'Some data may not be up to date. Please check your connection.'
          }
        </Alert>
        
        {isAuthError && (
          <Box sx={{ mb: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
            >
              Go to Login
            </Button>
          </Box>
        )}

        {/* Fallback Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total Employees
                    </Typography>
                    <Typography variant="h4" component="div">
                      --
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <BusinessCenter />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total Departments
                    </Typography>
                    <Typography variant="h4" component="div">
                      --
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Pending Leaves
                    </Typography>
                    <Typography variant="h4" component="div">
                      --
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total Payroll
                    </Typography>
                    <Typography variant="h4" component="div">
                      --
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>
    );
  }

  // Dynamic departments based on real data
  const departmentsData = [
    {
      id: 'hr',
      name: 'HR Department',
      icon: People,
      color: 'primary',
      stats: { 
        employees: totalEmployees, 
        active: activeEmployees, 
        pending: inactiveEmployees 
      },
      description: 'Human Resources Management'
    },
    {
      id: 'it',
      name: 'IT Department',
      icon: Computer,
      color: 'info',
      stats: { 
        projects: totalITProjects, 
        active: activeITProjects, 
        completed: completedITProjects 
      },
      description: 'Information Technology'
    },
    {
      id: 'operation',
      name: 'Operations',
      icon: BusinessCenter,
      color: 'success',
      stats: { 
        campaigns: totalOperationCampaigns, 
        active: activeOperationCampaigns, 
        completed: completedOperationCampaigns 
      },
      description: 'Business Operations'
    },
    {
      id: 'accounting',
      name: 'Accounting',
      icon: AccountBalance,
      color: 'warning',
      stats: { 
        transactions: totalTransactions, 
        pending: pendingTransactions, 
        completed: completedTransactions 
      },
      description: 'Financial Management'
    },
    {
      id: 'marketing',
      name: 'Digital Marketing',
      icon: Campaign,
      color: 'secondary',
      stats: { 
        projects: totalMarketingProjects, 
        active: activeMarketingProjects, 
        completed: completedMarketingProjects 
      },
      description: 'Digital Marketing'
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      color: 'error',
      stats: { 
        leads: totalLeads, 
        converted: convertedLeads, 
        pending: pendingLeads 
      },
      description: 'Sales & Marketing'
    }
  ];

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
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
          <Tab label="My Leaves" icon={<EventNote />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Overview Tab - Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Employees
                      </Typography>
                      <Typography variant="h4" component="div">
                        {totalEmployees}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <BusinessCenter />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Departments
                      </Typography>
                      <Typography variant="h4" component="div">
                        {totalDepartments}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <AccountBalance />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Pending Leaves
                      </Typography>
                      <Typography variant="h4" component="div">
                        {pendingLeaves}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Payroll
                      </Typography>
                      <Typography variant="h4" component="div">
                        ${totalPayroll.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Departments Grid */}
          <Grid container spacing={3}>
            {departmentsData.map((dept) => (
              <Grid item xs={12} sm={6} md={4} key={dept.id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${dept.color}.main` }}>
                        <dept.icon />
                      </Avatar>
                    </Stack>
                    
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {dept.description}
                    </Typography>
                    
                    <Stack spacing={1}>
                      {Object.entries(dept.stats).map(([key, value]) => (
                        <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {key}:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recent Activity */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <Stack key={index} direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: activity.color }} />
                <Box>
                  <Typography variant="body2">
                        {activity.message}
                  </Typography>
                </Box>
              </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No recent activity to display. Data will appear as employees and departments are added.
                    </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {/* Leaves Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            My Leave Requests
          </Typography>
          
          {userLeavesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading your leaves...</Typography>
            </Box>
          ) : userLeavesError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {userLeavesError}
            </Alert>
          ) : userLeaves.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <EventNote sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No leave requests found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You haven't submitted any leave requests yet.
                </Typography>
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
  } catch (error) {
    console.error('OverviewDashboard: Error rendering component:', error);
    return (
      <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          There was an error loading the dashboard. Please check the console for details.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Error: {error.message}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </Box>
    );
  }
});

OverviewDashboard.displayName = 'OverviewDashboard';

export default OverviewDashboard;