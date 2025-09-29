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
  MenuItem
} from '@mui/material';
import {
  EventNoteOutlined,
  SupportAgentOutlined,
  SendOutlined,
  CloseOutlined
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


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
    { value: 'technical', label: 'Technical Issue' },
    { value: 'hardware', label: 'Hardware Problem' },
    { value: 'software', label: 'Software Issue' },
    { value: 'network', label: 'Network Problem' },
    { value: 'account', label: 'Account Access' },
    { value: 'general', label: 'General Support' },
    { value: 'login', label: 'Login Problems' },
    { value: 'permissions', label: 'Permission Issues' },
    { value: 'data', label: 'Data Access' },
    { value: 'system', label: 'System Error' }
  ];

  const handleLeaveSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if user is authenticated and loaded
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
      
      const response = await api.post('/operation/leaves', leaveData);
      
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
    } catch (err) {
      console.error('Leave submission error:', err);
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

    // Check if user is authenticated and loaded
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
      
      const response = await api.post('/operation/tickets', ticketData);
      
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
    } catch (err) {
      console.error('Ticket submission error:', err);
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

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: 'grey.50', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Welcome back, {user?.name ? user.name.split('.')[0].split(' ')[0] : 'Employee'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit your leave requests and support tickets here.
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

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ maxWidth: 800, justifyContent: 'center' }}>
        {/* Submit Leave Card */}
        <Grid item xs={12} md={9} sx={{ display: 'flex' }}>
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
        </Grid>

        {/* Submit Ticket Card */}
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
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
        </Grid>
      </Grid>


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
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit New Ticket
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTicketSubmit();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="ticket-title" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Title *
                </label>
                <select
                  id="ticket-title"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select ticket type</option>
                  {ticketTitleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="ticket-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
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
                  {ticketForm.description.length}/500 characters (minimum 10)
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
