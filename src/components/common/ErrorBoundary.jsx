import React from 'react';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
     ('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a DOM-related error
    if (error.message && error.message.includes('removeChild')) {
       ('DOM removeChild error caught by ErrorBoundary');
      // Don't show error UI for DOM errors, just log them
      this.setState({ hasError: false });
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1c242e 50%, #334155 100%)',
            py: 4,
            px: 2
          }}
        >
          <Container maxWidth="sm">
            <Paper 
              elevation={12}
              sx={{ 
                p: 5,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  <ErrorOutline sx={{ fontSize: 48, color: '#ffffff' }} />
                </Box>
              </Box>

              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 2,
                  letterSpacing: '-0.5px'
                }}
              >
                Oops! Something went wrong
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#94a3b8',
                  mb: 4,
                  lineHeight: 1.6,
                  maxWidth: '400px',
                  mx: 'auto'
                }}
              >
                We encountered an unexpected error. Don't worry, this has been logged and we're working on it.
              </Typography>

              {this.state.error?.message && (
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#fca5a5',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      wordBreak: 'break-word'
                    }}
                  >
                    {this.state.error.message}
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Refresh />}
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                      boxShadow: '0 6px 16px rgba(8, 145, 178, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Reload Page
                </Button>

                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<Home />}
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Go Home
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
