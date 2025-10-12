import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
    duration: 4000,
  });

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    setNotification({
      open: true,
      message,
      type,
      duration,
    });
  }, []);

  const showSuccess = useCallback((message, duration = 4000) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration = 5000) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration = 4000) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration = 4000) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
      }}
    >
      {children}
      <Toast
        open={notification.open}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

