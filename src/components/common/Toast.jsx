import React, { useEffect } from 'react';
import { Box, Alert, AlertTitle, Snackbar, Slide } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const SlideTransition = (props) => {
  return <Slide {...props} direction="down" />;
};

const Toast = ({ open, message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    if (open && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 24 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 24 }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ fontSize: 24 }} />;
    }
  };

  const getSeverity = () => {
    return type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info';
  };

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        marginTop: '16px', // Higher position on the page
        marginRight: '16px', // Space from right edge
        '& .MuiSnackbar-root': {
          top: '16px',
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={getSeverity()}
        icon={getIcon()}
        variant="filled"
        sx={{
          minWidth: '320px',
          maxWidth: '500px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          fontSize: '1rem',
          fontWeight: 500,
          borderRadius: '12px',
          '& .MuiAlert-icon': {
            fontSize: '24px',
            alignItems: 'center',
          },
          '& .MuiAlert-message': {
            padding: '8px 0',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiAlert-action': {
            paddingTop: '4px',
          },
          animation: 'slideInDown 0.3s ease-out',
          '@keyframes slideInDown': {
            '0%': {
              transform: 'translateY(-100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;

