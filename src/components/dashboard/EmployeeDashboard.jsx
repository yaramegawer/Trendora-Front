import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  EventNoteOutlined,
  SupportAgentOutlined,
  SendOutlined,
  CloseOutlined
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { API_CONFIG } from '../../config/api';
import SimplePagination from '../common/SimplePagination';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [leavesError, setLeavesError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [leavesPage, setLeavesPage] = useState(1);
  const [leavesTotal, setLeavesTotal] = useState(0);


  // Leave form state
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'annual'
  });

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // Predefined options for ticket form
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const ticketTitleOptions = [
    { value: 'Login Issues', label: 'Login Issues' },
    { value: 'Password Reset', label: 'Password Reset' },
    { value: 'Account Access', label: 'Account Access' },
    { value: 'Email Not Working', label: 'Email Not Working' },
    { value: 'Internet Connection', label: 'Internet Connection' },
    { value: 'WiFi Problems', label: 'WiFi Problems' },
    { value: 'Computer Slow', label: 'Computer Slow' },
    { value: 'Computer Won\'t Start', label: 'Computer Won\'t Start' },
    { value: 'Blue Screen Error', label: 'Blue Screen Error' },
    { value: 'Software Installation', label: 'Software Installation' },
    { value: 'Software Not Working', label: 'Software Not Working' },
    { value: 'Printer Issues', label: 'Printer Issues' },
    { value: 'Scanner Problems', label: 'Scanner Problems' },
    { value: 'Database Access', label: 'Database Access' },
    { value: 'File Access Issues', label: 'File Access Issues' },
    { value: 'Network Drive Problems', label: 'Network Drive Problems' },
    { value: 'VPN Connection', label: 'VPN Connection' },
    { value: 'Remote Access Issues', label: 'Remote Access Issues' },
    { value: 'System Updates', label: 'System Updates' },
    { value: 'Antivirus Issues', label: 'Antivirus Issues' },
    { value: 'Browser Problems', label: 'Browser Problems' },
    { value: 'Website Not Loading', label: 'Website Not Loading' },
    { value: 'Performance Issues', label: 'Performance Issues' },
    { value: 'Memory Problems', label: 'Memory Problems' },
    { value: 'Storage Issues', label: 'Storage Issues' },
    { value: 'Backup Problems', label: 'Backup Problems' },
    { value: 'Data Recovery', label: 'Data Recovery' },
    { value: 'Hardware Failure', label: 'Hardware Failure' },
    { value: 'Keyboard Issues', label: 'Keyboard Issues' },
    { value: 'Mouse Problems', label: 'Mouse Problems' },
    { value: 'Monitor Issues', label: 'Monitor Issues' },
    { value: 'Audio Problems', label: 'Audio Problems' },
    { value: 'Camera Not Working', label: 'Camera Not Working' },
    { value: 'Microphone Issues', label: 'Microphone Issues' },
    { value: 'USB Port Problems', label: 'USB Port Problems' },
    { value: 'Bluetooth Issues', label: 'Bluetooth Issues' },
    { value: 'Mobile Device Sync', label: 'Mobile Device Sync' },
    { value: 'Application Crashes', label: 'Application Crashes' },
    { value: 'Data Loss', label: 'Data Loss' },
    { value: 'Permission Issues', label: 'Permission Issues' },
    { value: 'Security Concerns', label: 'Security Concerns' },
    { value: 'Phishing Attempts', label: 'Phishing Attempts' },
    { value: 'Suspicious Activity', label: 'Suspicious Activity' },
    { value: 'License Issues', label: 'License Issues' },
    { value: 'Configuration Problems', label: 'Configuration Problems' },
    { value: 'Integration Issues', label: 'Integration Issues' },
    { value: 'API Problems', label: 'API Problems' },
    { value: 'Server Issues', label: 'Server Issues' },
    { value: 'Database Errors', label: 'Database Errors' },
    { value: 'Cloud Service Problems', label: 'Cloud Service Problems' },
    { value: 'Third-party Software', label: 'Third-party Software' },
    { value: 'Mobile App Issues', label: 'Mobile App Issues' },
    { value: 'Web Application Problems', label: 'Web Application Problems' },
    { value: 'Other Technical Issue', label: 'Other Technical Issue' }
  ];

  const handleLeaveSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic authentication check only
    if (!user) {
      alert('You must be logged in to submit a leave request.');
      setError('You must be logged in to submit a leave request.');
      setLoading(false);
      return;
    }

    // Validation
    if (!leaveForm.startDate) {
      alert('Please select a start date.');
      setError('Please select a start date.');
      setLoading(false);
      return;
    }

    if (!leaveForm.endDate) {
      alert('Please select an end date.');
      setError('Please select an end date.');
      setLoading(false);
      return;
    }

    if (!leaveForm.leaveType) {
      alert('Please select a leave type.');
      setError('Please select a leave type.');
      setLoading(false);
      return;
    }

    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      alert('End date must be after start date.');
      setLoading(false);
      return;
    }

    try {
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      // Try to decode the token to see its structure
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const header = JSON.parse(atob(tokenParts[0]));
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 Token header:', header);
            console.log('🔍 Token payload:', payload);
            console.log('🔍 Token payload keys:', Object.keys(payload));
            console.log('🔍 Looking for user ID in token:', payload.user_id || payload.sub || payload.id || payload._id);
          } else {
            console.log('❌ Token is not a valid JWT format');
          }
        } catch (e) {
          console.log('❌ Could not decode token:', e);
        }
      }
      
      const leaveData = {
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        type: leaveForm.leaveType,
        status: 'pending'
      };

      console.log('Submitting leave request:', leaveData);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.DASHBOARD.LEAVES, leaveData);
      
      console.log('Leave request response:', response.data);
      
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to submit leave request');
      }
      
      alert('Leave request submitted successfully!');
      setSuccess('Leave request submitted successfully!');
      setLeaveDialogOpen(false);
      setLeaveForm({
        startDate: '',
        endDate: '',
        leaveType: 'annual'
      });
      
      // Refresh leaves list if leaves tab is active
      if (activeTab === 1) {
        fetchLeaves(leavesPage);
      }
    } catch (err) {
      console.log('Leave submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit leave request. Please try again.';
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic authentication check only
    if (!user) {
      alert('You must be logged in to submit a support ticket.');
      setError('You must be logged in to submit a support ticket.');
      setLoading(false);
      return;
    }

    // Validation
    if (!ticketForm.title) {
      alert('Please select a ticket type.');
      setError('Please select a ticket type.');
      setLoading(false);
      return;
    }

    if (!ticketForm.description) {
      alert('Please enter a description.');
      setError('Please enter a description.');
      setLoading(false);
      return;
    }

    if (ticketForm.description.length < 10) {
      alert('Description must be at least 10 characters long.');
      setError('Description must be at least 10 characters long.');
      setLoading(false);
      return;
    }

    if (ticketForm.description.length > 500) {
      alert('Description must be 500 characters or less.');
      setError('Description must be 500 characters or less.');
      setLoading(false);
      return;
    }

    if (!ticketForm.priority) {
      alert('Please select a priority level.');
      setError('Please select a priority level.');
      setLoading(false);
      return;
    }

    try {
      console.log('User object for ticket:', user);
      console.log('User ID for ticket:', user?.id);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists for ticket:', !!token);
      console.log('Token preview for ticket:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      const ticketData = {
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority
      };

      console.log('Submitting support ticket:', ticketData);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.DASHBOARD.TICKETS, ticketData);
      
      console.log('Ticket submission response:', response.data);
      
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to submit support ticket');
      }
      
      alert('Support ticket submitted successfully!');
      setSuccess('Support ticket submitted successfully!');
      setTicketDialogOpen(false);
      setTicketForm({
        title: '',
        description: '',
        priority: 'medium'
      });
      
      // Refresh tickets list if tickets tab is active
      if (activeTab === 2) {
        fetchTickets(ticketsPage);
      }
    } catch (err) {
      console.log('Ticket submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit support ticket. Please try again.';
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (form, field) => (event) => {
    if (form === 'leave') {
      setLeaveForm(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    } else {
      setTicketForm(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    }
  };

  // Fetch leaves for the logged-in user
  const fetchLeaves = async (page = 1) => {
    setLeavesLoading(true);
    setLeavesError('');
    try {
      console.log('🔄 Fetching user leaves...', { page });
      // Try dashboard leaves endpoint first
      let response;
      try {
        console.log('🔄 Trying /dashboard/leaves endpoint...');
        response = await api.get(`${API_CONFIG.ENDPOINTS.DASHBOARD.LEAVES}?page=${page}&limit=10`);
      } catch (dashboardError) {
        console.log('⚠️ Dashboard leaves endpoint failed, trying HR leaves endpoint...', dashboardError);
        try {
          response = await api.get(`/hr/leaves?page=${page}&limit=10`);
        } catch (hrError) {
          console.log('⚠️ HR leaves endpoint failed, trying operation leaves endpoint...', hrError);
          try {
            response = await api.get(`/operation/leaves?page=${page}&limit=10`);
          } catch (operationError) {
            console.log('⚠️ Operation leaves endpoint failed, trying IT leaves endpoint...', operationError);
            response = await api.get(`/it/leaves?page=${page}&limit=10`);
          }
        }
      }
      console.log('📡 User Leaves API Response:', response);
      
      let leavesData = [];
      let totalCount = 0;
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        leavesData = response.data.data;
        totalCount = response.data.total || response.data.count || leavesData.length;
      } else if (Array.isArray(response.data)) {
        leavesData = response.data;
        totalCount = leavesData.length;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        leavesData = response.data.data;
        totalCount = response.data.total || response.data.count || leavesData.length;
      }
      
      // If totalCount is still just the current page length, we need to determine the actual total
      if (totalCount === leavesData.length) {
        console.log('⚠️ Total count appears to be limited to current page. Determining actual total...');
        
        // If we have less than 10 items and we're on page 1, this is the only page
        if (leavesData.length < 10 && page === 1) {
          totalCount = leavesData.length;
          console.log('📊 Less than 10 items on page 1, this is the only page. Total count:', totalCount);
        }
        // If we have less than 10 items and we're on a page > 1, calculate total from current page
        else if (leavesData.length < 10 && page > 1) {
          totalCount = ((page - 1) * 10) + leavesData.length;
          console.log('📊 Less than 10 items on page', page, ', calculating total from previous pages. Total count:', totalCount);
        }
        // If we have exactly 10 items, there might be more pages
        else if (leavesData.length === 10) {
          // Try to get all leaves to count them accurately (only do this once)
          if (page === 1) {
            console.log('📊 Exactly 10 items on page 1, fetching all leaves to get accurate total...');
            try {
              const allLeavesResponse = await api.get(`${API_CONFIG.ENDPOINTS.DASHBOARD.LEAVES}?page=1&limit=1000`);
              let allLeavesData = [];
              
              if (allLeavesResponse.data && allLeavesResponse.data.success && Array.isArray(allLeavesResponse.data.data)) {
                allLeavesData = allLeavesResponse.data.data;
              } else if (Array.isArray(allLeavesResponse.data)) {
                allLeavesData = allLeavesResponse.data;
              } else if (allLeavesResponse.data && allLeavesResponse.data.data && Array.isArray(allLeavesResponse.data.data)) {
                allLeavesData = allLeavesResponse.data.data;
              }
              
              if (allLeavesData.length > 0) {
                totalCount = allLeavesData.length;
                console.log('📊 Got accurate total count from all leaves:', totalCount);
              } else {
                totalCount = (page * 10) + 1; // Fallback
                console.log('📊 Using fallback estimation:', totalCount);
              }
            } catch (allLeavesError) {
              console.log('⚠️ Could not fetch all leaves, using estimation:', allLeavesError);
              totalCount = (page * 10) + 1; // Fallback
              console.log('📊 Using fallback estimation:', totalCount);
            }
          } else {
            // For pages > 1, use the estimation logic
            totalCount = (page * 10) + 1;
            console.log('📊 Using estimation for page', page, '. Total count:', totalCount);
          }
        }
      }
      
      console.log('📊 Processed user leaves data:', leavesData);
      console.log('📊 Total count from API:', totalCount);
      console.log('📊 Current page:', page);
      console.log('📊 Calculated total pages:', Math.ceil(totalCount / 10));
      
      setLeaves(leavesData);
      setLeavesPage(page);
      setLeavesTotal(totalCount);
    } catch (err) {
      console.log('❌ User Leaves API Error:', err);
      setLeavesError(err.message || 'Failed to fetch leaves');
      setLeaves([]);
    } finally {
      setLeavesLoading(false);
    }
  };

  // Fetch tickets for the logged-in user
  const fetchTickets = async (page = 1) => {
    setTicketsLoading(true);
    setTicketsError('');
    try {
      console.log('🔄 Fetching user tickets...', { page });
      
      const response = await api.get(`${API_CONFIG.ENDPOINTS.DASHBOARD.TICKETS}?page=${page}&limit=10`);
      
      console.log('📡 User Tickets API Response:', response);
      
      let ticketsData = [];
      let totalCount = 0;
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        ticketsData = response.data.data;
        totalCount = response.data.total || response.data.count || response.data.totalCount || ticketsData.length;
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
        totalCount = ticketsData.length;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        ticketsData = response.data.data;
        totalCount = response.data.total || response.data.count || response.data.totalCount || ticketsData.length;
      }
      
      // If totalCount is still just the current page length, we need to determine the actual total
      if (totalCount === ticketsData.length) {
        console.log('⚠️ Total count appears to be limited to current page. Determining actual total...');
        
        // If we have less than 10 items and we're on page 1, this is the only page
        if (ticketsData.length < 10 && page === 1) {
          totalCount = ticketsData.length;
          console.log('📊 Less than 10 items on page 1, this is the only page. Total count:', totalCount);
        }
        // If we have less than 10 items and we're on a page > 1, calculate total from current page
        else if (ticketsData.length < 10 && page > 1) {
          totalCount = ((page - 1) * 10) + ticketsData.length;
          console.log('📊 Less than 10 items on page', page, ', calculating total from previous pages. Total count:', totalCount);
        }
        // If we have exactly 10 items, there might be more pages
        else if (ticketsData.length === 10) {
          // Try to get all tickets to count them accurately (only do this once)
          if (page === 1) {
            console.log('📊 Exactly 10 items on page 1, fetching all tickets to get accurate total...');
            try {
              const allTicketsResponse = await api.get(`${API_CONFIG.ENDPOINTS.DASHBOARD.TICKETS}?page=1&limit=1000`);
              let allTicketsData = [];
              
              if (allTicketsResponse.data && allTicketsResponse.data.success && Array.isArray(allTicketsResponse.data.data)) {
                allTicketsData = allTicketsResponse.data.data;
              } else if (Array.isArray(allTicketsResponse.data)) {
                allTicketsData = allTicketsResponse.data;
              } else if (allTicketsResponse.data && allTicketsResponse.data.data && Array.isArray(allTicketsResponse.data.data)) {
                allTicketsData = allTicketsResponse.data.data;
              }
              
              if (allTicketsData.length > 0) {
                totalCount = allTicketsData.length;
                console.log('📊 Got accurate total count from all tickets:', totalCount);
              } else {
                totalCount = (page * 10) + 1; // Fallback
                console.log('📊 Using fallback estimation:', totalCount);
              }
            } catch (allTicketsError) {
              console.log('⚠️ Could not fetch all tickets, using estimation:', allTicketsError);
              totalCount = (page * 10) + 1; // Fallback
              console.log('📊 Using fallback estimation:', totalCount);
            }
          } else {
            // For pages > 1, use the estimation logic
            totalCount = (page * 10) + 1;
            console.log('📊 Using estimation for page', page, '. Total count:', totalCount);
          }
        }
      }
      
      console.log('📊 Processed user tickets data:', ticketsData);
      console.log('📊 Total count from API:', totalCount);
      console.log('📊 Current page:', page);
      console.log('📊 Calculated total pages:', Math.ceil(totalCount / 10));
      
      setTickets(ticketsData);
      setTicketsPage(page);
      setTicketsTotal(totalCount);
    } catch (err) {
      console.log('❌ User Tickets API Error:', err);
      setTicketsError(err.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Handle ticket pagination
  const handleTicketPageChange = (newPage) => {
    fetchTickets(newPage);
  };

  // Handle leaves pagination
  const handleLeavesPageChange = (newPage) => {
    fetchLeaves(newPage);
  };

  // Fetch leaves when component mounts or when leaves tab is selected
  React.useEffect(() => {
    if (activeTab === 1) { // Leaves tab
      fetchLeaves();
    } else if (activeTab === 2) { // Tickets tab
      fetchTickets();
    }
  }, [activeTab]);

  // Get status color for leave status
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Get status color for ticket status
  const getTicketStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  // Get priority color for tickets
  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: 'grey.50', 
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Welcome back, {user?.name ? user.name.split('.')[0].split(' ')[0] : 'Employee'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit your leave requests and support tickets, and view your submitted requests here.
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          centered
        >
          <Tab label="Submit Requests" />
          <Tab label="My Leaves" />
          <Tab label="My Tickets" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Action Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {/* Submit Leave Card */}
              <Card sx={{ 
                height: 280, 
                width: '800px',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 6 }, 
                transition: 'box-shadow 0.3s' 
              }}>
                <CardContent sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <EventNoteOutlined sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Submit Leave Request
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Request time off for vacation, sick leave, or personal matters
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Submit a leave request with your preferred dates and reason. Your manager will review and approve your request.
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SendOutlined />}
                    onClick={() => setLeaveDialogOpen(true)}
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Submit Leave Request
                  </Button>
                </CardContent>
              </Card>

              {/* Submit Ticket Card */}
              <Card sx={{ 
                height: 280, 
                width: '800px',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 6 }, 
                transition: 'box-shadow 0.3s' 
              }}>
                <CardContent sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                        <SupportAgentOutlined sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Submit Support Ticket
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Get help with technical issues or general inquiries
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Submit a support ticket for any technical issues, questions, or assistance you need. Our support team will respond promptly.
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SendOutlined />}
                    onClick={() => setTicketDialogOpen(true)}
                    color="info"
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Submit Support Ticket
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* My Leaves Tab */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Leave Requests
                </Typography>
                
                {leavesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : leavesError ? (
                  <Alert severity="error">
                    {leavesError}
                  </Alert>
                ) : leaves.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                    No leave requests found.
                  </Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Leave Type</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaves.map((leave, index) => (
                          <TableRow key={leave._id || leave.id || index}>
                            <TableCell>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {leave.type || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDate(leave.startDate)}</TableCell>
                            <TableCell>{formatDate(leave.endDate)}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status || 'Unknown'}
                                color={getStatusColor(leave.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {leave.startDate && leave.endDate ? 
                                Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1 + ' days' : 
                                'N/A'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                {/* Pagination for leaves */}
                {leaves.length > 0 && (
                  <SimplePagination
                    currentPage={leavesPage}
                    totalPages={Math.max(1, Math.ceil(leavesTotal / 10))}
                    totalItems={leavesTotal}
                    pageSize={10}
                    onPageChange={handleLeavesPageChange}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* My Tickets Tab */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Support Tickets
                </Typography>
                
                {ticketsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : ticketsError ? (
                  <Alert severity="error">
                    {ticketsError}
                  </Alert>
                ) : tickets.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                    No support tickets found.
                  </Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tickets.map((ticket, index) => (
                          <TableRow key={ticket._id || ticket.id || index}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {ticket.title || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {ticket.description || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ticket.priority || 'Unknown'}
                                color={getPriorityColor(ticket.priority)}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ticket.status || 'Unknown'}
                                color={getTicketStatusColor(ticket.status)}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                {/* Pagination for tickets */}
                {tickets.length > 0 && (
                  <SimplePagination
                    currentPage={ticketsPage}
                    totalPages={Math.max(1, Math.ceil(ticketsTotal / 10))}
                    totalItems={ticketsTotal}
                    pageSize={10}
                    onPageChange={handleTicketPageChange}
                  />
                )}
                
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Leave Request Dialog */}
      {leaveDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit Leave Request
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLeaveSubmit();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="leave-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Leave Type *
                </label>
                <select
                  id="leave-type"
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, leaveType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="leave-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date *
                </label>
                <input
                  id="leave-start-date"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="leave-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date *
                </label>
                <input
                  id="leave-end-date"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLeaveDialogOpen(false);
                    setLeaveForm({
                      startDate: '',
                      endDate: '',
                      leaveType: 'annual'
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: loading ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Dialog */}
      {ticketDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit New Ticket
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTicketSubmit();
            }}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="ticket-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Issue Type                  </label>
                  <select
                    id="ticket-type"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select an issue type</option>
                    {ticketTitleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="ticket-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description                  </label>
                  <textarea
                    id="ticket-description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the issue in detail (10-500 characters)"
                    rows={4}
                    minLength={10}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    required
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {ticketForm.description.length}/500 characters
                  </div>
                </div>
              
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="ticket-priority" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Priority
                  </label>
                  <select
                    id="ticket-priority"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketDialogOpen(false);
                      setTicketForm({
                        title: '',
                        description: '',
                        priority: 'medium'
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: loading ? '#9ca3af' : '#1c242e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </Box>
  );
};

export default EmployeeDashboard;
