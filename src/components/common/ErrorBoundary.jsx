import React from 'react';
import { Box, Typography, Button } from '@mui/material';

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
            p: 3, 
            textAlign: 'center',
            backgroundColor: 'error.light',
            borderRadius: 2,
            m: 2
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
