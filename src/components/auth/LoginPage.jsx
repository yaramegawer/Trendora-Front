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
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ForgetPassword from './ForgetPassword';
import ResetPassword from './ResetPassword';
import logoImage from '../../assets/logo2-removebg-preview.png';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'forget', 'reset'
  const [resetEmail, setResetEmail] = useState('');
  
  // Check for errors in localStorage on component mount (fallback for component re-mounts)
  React.useEffect(() => {
    const storedError = localStorage.getItem('loginError');
    if (storedError && !error) {
      setError(storedError);
      // Clear it from localStorage after displaying
      setTimeout(() => {
        localStorage.removeItem('loginError');
      }, 5000); // Clear after 5 seconds
    }
  }, []);

  // Error display is working - no test needed

  const handleInputChange = (field) => (event) => {
    const newValue = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // Only clear error if user completely clears the field
    if (error && !loading && newValue.length === 0) {
      setError('');
      localStorage.removeItem('loginError');
    }
    
    // Clear success message when user starts typing
    if (success && !loading && newValue.length > 0) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess(false);

      try {
        // Call the login function from context (validation is handled in AuthContext)
        await login({
          email: formData.email,
          password: formData.password
        });
      
      // If we get here, login was successful
      setSuccess(true);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Create more user-friendly error messages
      let errorMessage = err.message || 'Login failed. Please try again.';
      
      // Make error messages more specific and helpful
      if (errorMessage.includes('invalid credentials')) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication failed') || errorMessage.includes('No authentication token')) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (errorMessage.includes('Invalid email or password')) {
        errorMessage = 'The email or password you entered is incorrect. Please try again.';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'This email is not registered in our system. Please contact your administrator.';
      } else if (errorMessage.includes('Network error') || errorMessage.includes('connection')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Access denied') || errorMessage.includes('permission')) {
        errorMessage = 'Access denied. Your account may be disabled or you do not have permission to access this system.';
      } else if (errorMessage.includes('Invalid input') || errorMessage.includes('format')) {
        errorMessage = 'Please check your email format and password requirements.';
      } else if (errorMessage.includes('Invalid response from server')) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (errorMessage.includes('Login failed')) {
        errorMessage = 'Login failed. Please check your credentials and try again.';
      }
      
      // Capitalize the first letter of the error message for better presentation
      if (errorMessage && errorMessage.length > 0) {
        errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
      }
      
      // Store error in localStorage as backup (for component re-mount issues)
      localStorage.setItem('loginError', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgetPassword = () => {
    setCurrentView('forget');
    setError('');
    setSuccess(false);
  };

  const handleForgetPasswordSuccess = (email) => {
    setResetEmail(email);
    setCurrentView('reset');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
    setSuccess(false);
    setResetEmail('');
  };

  const handleResetPasswordSuccess = () => {
    setCurrentView('login');
    setError('');
    setSuccess(true);
    setResetEmail('');
  };

  // Render different views based on currentView state
  if (currentView === 'forget') {
    return <ForgetPassword onBack={handleBackToLogin} onSuccess={handleForgetPasswordSuccess} />;
  }

  if (currentView === 'reset') {
    return <ResetPassword email={resetEmail} onBack={handleBackToLogin} onSuccess={handleResetPasswordSuccess} />;
  }

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
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to Trendora Management System
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
                 Login successful! Redirecting to dashboard...
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
               error={!!(error && (error.includes('email') || error.includes('credentials') || error.includes('registered')))}
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
                   backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                   '& fieldset': {
                     borderColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                     borderWidth: 2,
                   },
                   '&:hover': {
                     backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                   },
                   '&:hover fieldset': {
                     borderColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#334155',
                     borderWidth: 2,
                   },
                   '&.Mui-focused': {
                     backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2' : '#e8f0fe',
                   },
                   '&.Mui-focused fieldset': {
                     borderColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#1c242e',
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
                   backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '&:hover .MuiInputAdornment-root': {
                   backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '&.Mui-focused .MuiInputAdornment-root': {
                   backgroundColor: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                   color: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#64748b',
                 },
                 '& .MuiInputLabel-root': {
                   color: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: error && (error.includes('email') || error.includes('credentials') || error.includes('registered')) ? '#dc2626' : '#1c242e',
                 },
               }}
             />

             <TextField
               fullWidth
               label="Password"
               type={showPassword ? 'text' : 'password'}
               value={formData.password}
               onChange={handleInputChange('password')}
               margin="normal"
               required
               autoComplete="current-password"
               error={!!(error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')))}
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
                   backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2' : '#e8f0fe',
                   '& fieldset': {
                     borderColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#1c242e',
                     borderWidth: 2,
                   },
                   '&:hover': {
                     backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2' : '#e8f0fe',
                   },
                   '&:hover fieldset': {
                     borderColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#334155',
                     borderWidth: 2,
                   },
                   '&.Mui-focused': {
                     backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2' : '#e8f0fe',
                   },
                   '&.Mui-focused fieldset': {
                     borderColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#1c242e',
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
                   backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '&:hover .MuiInputAdornment-root': {
                   backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '&.Mui-focused .MuiInputAdornment-root': {
                   backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2 !important' : '#e8f0fe !important',
                 },
                 '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                   color: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#64748b',
                 },
                 '& .MuiIconButton-root': {
                   backgroundColor: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#fef2f2 !important' : '#e8f0fe !important',
                   borderRadius: '4px',
                 },
                 '& .MuiInputLabel-root': {
                   color: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#1c242e',
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: error && (error.includes('password') || error.includes('credentials') || error.includes('incorrect')) ? '#dc2626' : '#1c242e',
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
                mb: 1,
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
                  Signing in...
                </Box>
              ) : success ? (
                'Login Successful!'
              ) : (
                'Sign in'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleForgetPassword}
              sx={{
                mt: 1,
                mb: 2,
                textTransform: 'none',
                color: '#64748b',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  color: '#1c242e',
                },
              }}
            >
              Forgot Password?
            </Button>
            
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;