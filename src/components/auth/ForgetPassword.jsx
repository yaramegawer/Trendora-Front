import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  ArrowBack
} from '@mui/icons-material';
import { userApiService } from '../../services/userApi';
import logoImage from '../../assets/logo2-removebg-preview.png';

const ForgetPassword = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    const newValue = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // Clear error when user starts typing
    if (error && !loading && newValue.length === 0) {
      setError('');
    }
    
    // Clear success message when user starts typing
    if (success && !loading && newValue.length > 0) {
      setSuccess(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate email
      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }
      
      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call forget password API
      await userApiService.forgetPassword(formData.email.trim());
      
      setSuccess(true);
      setFormData({ email: '' });
      
      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(formData.email.trim());
        }
      }, 2000);
      
    } catch (err) {
      console.error('Forget password error:', err);
      
      let errorMessage = err.message || 'Failed to send reset code. Please try again.';
      
      // Make error messages more specific
      if (errorMessage.includes('not found')) {
        errorMessage = 'This email is not registered in our system.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 3,
        px: { xs: 2, sm: 3, lg: 4 }
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                mx: 'auto',
                mb: 2,
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={logoImage}
                alt="Company Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you a reset code
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  '& .MuiAlert-icon': {
                    color: '#dc2626'
                  },
                  '& .MuiAlert-message': {
                    color: '#991b1b',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  '& .MuiAlert-icon': {
                    color: '#16a34a'
                  },
                  '& .MuiAlert-message': {
                    color: '#166534',
                    fontWeight: 500
                  }
                }}
              >
                Reset code sent! Check your email and click "Reset Password" to continue.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              error={!!(error && (error.includes('email') || error.includes('registered')))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                  '& fieldset': {
                    borderColor: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                  '&:hover': {
                    backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                  },
                  '&:hover fieldset': {
                    borderColor: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#334155',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1c242e',
                  '&::selection': {
                    backgroundColor: '#f1f5f9',
                    color: '#1c242e',
                  },
                  '&::-moz-selection': {
                    backgroundColor: '#f1f5f9',
                    color: '#1c242e',
                  },
                },
                '& .MuiInputAdornment-root': {
                  backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                },
                '&:hover .MuiInputAdornment-root': {
                  backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                },
                '&.Mui-focused .MuiInputAdornment-root': {
                  backgroundColor: error && (error.includes('email') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  color: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#64748b',
                },
                '& .MuiInputLabel-root': {
                  color: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: error && (error.includes('email') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: error ? '#dc2626' : success ? '#16a34a' : '#1c242e',
                '&:hover': {
                  backgroundColor: error ? '#b91c1c' : success ? '#15803d' : '#334155',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                '&:disabled': {
                  backgroundColor: '#94a3b8',
                  transform: 'none',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Sending reset code...
                </Box>
              ) : success ? (
                'Reset code sent!'
              ) : (
                'Send Reset Code'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{
                mt: 1,
                textTransform: 'none',
                color: '#64748b',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  color: '#1c242e',
                },
              }}
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgetPassword;
