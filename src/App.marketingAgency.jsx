import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import MainLayout from './components/layout/MainLayout.fixed';
import LoginPage from './components/auth/LoginPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import theme from './theme';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

// Preload critical components for better LCP
const preloadComponents = () => {
  // Preload dashboard components that are likely to be viewed first
  import('./components/dashboard/OverviewDashboard');
  import('./components/dashboard/EmployeeDashboard');
};

const AppContent = () => {
  try {
    const { isAuthenticated, loading, user } = useAuth();
    
    // Preload critical components after initial render
    useEffect(() => {
      if (isAuthenticated) {
        preloadComponents();
      }
    }, [isAuthenticated]);

    if (loading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          sx={{ backgroundColor: 'grey.50' }}
        >
          <CircularProgress sx={{ color: '#1c242e' }} />
        </Box>
      );
    }

    if (!isAuthenticated) {
      return <LoginPage />;
    }

    return <MainLayout />;
  } catch (error) {
('AppContent: Error rendering component:', error);
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: 'grey.50', p: 3 }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Application Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          There was an error loading the application.
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
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}




export default App;