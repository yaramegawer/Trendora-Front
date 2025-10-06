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
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import { userApiService } from '../../services/userApi';
import logoImage from '../../assets/logo2-removebg-preview.png';

const ResetPassword = ({ email, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: email || '',
    password: '',
    confirmPassword: '',
    forgetCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validatePassword = (password) => {
    // Password must be at least 8 characters with uppercase, lowercase, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!formData.password.trim()) {
      throw new Error('Password is required');
    }
    
    if (!validatePassword(formData.password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and special character');
    }
    
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (!formData.forgetCode.trim()) {
      throw new Error('Reset code is required');
    }
    
    if (formData.forgetCode.length !== 5) {
      throw new Error('Reset code must be exactly 5 characters');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      validateForm();

      // Call reset password API
      await userApiService.resetPassword(formData);
      
      setSuccess(true);
      
      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (err) {
('Reset password error:', err);
      
      let errorMessage = err.message || 'Failed to reset password. Please try again.';
      
      // Make error messages more specific
      if (errorMessage.includes('code')) {
        errorMessage = 'Invalid or expired reset code. Please check your email for the correct code.';
      } else if (errorMessage.includes('not found') || errorMessage.includes('expired')) {
        errorMessage = 'Email not found or reset code has expired. Please request a new code.';
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              Enter your new password and the reset code from your email
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
                Password reset successful! Redirecting to login...
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
              disabled={!!email} // Disable if email is passed from forget password
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
                  backgroundColor: '#e8f0fe',
                  '& fieldset': {
                    borderColor: '#1c242e',
                    borderWidth: 2,
                  },
                  '&:hover': {
                    backgroundColor: '#e8f0fe',
                  },
                  '&:hover fieldset': {
                    borderColor: '#334155',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#e8f0fe',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1c242e',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1c242e',
                },
                '& .MuiInputAdornment-root': {
                  backgroundColor: '#e8f0fe !important',
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  color: '#64748b',
                },
                '& .MuiInputLabel-root': {
                  color: '#1c242e',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1c242e',
                },
              }}
            />

            <TextField
              fullWidth
              label="Reset Code"
              type="text"
              value={formData.forgetCode}
              onChange={handleInputChange('forgetCode')}
              margin="normal"
              required
              placeholder="Enter 5-digit code"
              inputProps={{ maxLength: 5 }}
              error={!!(error && error.includes('code'))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: error && error.includes('code') ? '#fef2f2' : '#e8f0fe',
                  '& fieldset': {
                    borderColor: error && error.includes('code') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                  '&:hover': {
                    backgroundColor: error && error.includes('code') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&:hover fieldset': {
                    borderColor: error && error.includes('code') ? '#dc2626' : '#334155',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: error && error.includes('code') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error && error.includes('code') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1c242e',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  letterSpacing: '0.2em',
                },
                '& .MuiInputLabel-root': {
                  color: error && error.includes('code') ? '#dc2626' : '#1c242e',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: error && error.includes('code') ? '#dc2626' : '#1c242e',
                },
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              autoComplete="new-password"
              error={!!(error && error.includes('password'))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: error && error.includes('password') ? '#fef2f2' : '#e8f0fe',
                  '& fieldset': {
                    borderColor: error && error.includes('password') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                  '&:hover': {
                    backgroundColor: error && error.includes('password') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&:hover fieldset': {
                    borderColor: error && error.includes('password') ? '#dc2626' : '#334155',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: error && error.includes('password') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error && error.includes('password') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1c242e',
                },
                '& .MuiInputAdornment-root': {
                  backgroundColor: error && error.includes('password') ? '#fef2f2 !important' : '#e8f0fe !important',
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  color: error && error.includes('password') ? '#dc2626' : '#64748b',
                },
                '& .MuiInputLabel-root': {
                  color: error && error.includes('password') ? '#dc2626' : '#1c242e',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: error && error.includes('password') ? '#dc2626' : '#1c242e',
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              required
              autoComplete="new-password"
              error={!!(error && error.includes('match'))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: error && error.includes('match') ? '#fef2f2' : '#e8f0fe',
                  '& fieldset': {
                    borderColor: error && error.includes('match') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                  '&:hover': {
                    backgroundColor: error && error.includes('match') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&:hover fieldset': {
                    borderColor: error && error.includes('match') ? '#dc2626' : '#334155',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: error && error.includes('match') ? '#fef2f2' : '#e8f0fe',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error && error.includes('match') ? '#dc2626' : '#1c242e',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1c242e',
                },
                '& .MuiInputAdornment-root': {
                  backgroundColor: error && error.includes('match') ? '#fef2f2 !important' : '#e8f0fe !important',
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  color: error && error.includes('match') ? '#dc2626' : '#64748b',
                },
                '& .MuiInputLabel-root': {
                  color: error && error.includes('match') ? '#dc2626' : '#1c242e',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: error && error.includes('match') ? '#dc2626' : '#1c242e',
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
                  Resetting password...
                </Box>
              ) : success ? (
                'Password reset successful!'
              ) : (
                'Reset Password'
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

export default ResetPassword;
