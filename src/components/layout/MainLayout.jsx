import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../theme';
import Sidebar from './Sidebar';
import Header from './Header';
import HRDepartment from '../hr/HRDepartment';
import PlaceholderDepartment from '../departments/PlaceholderDepartment';
import OperationDepartment from '../operation/OperationDepartment.styled';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ITDepartment from '../IT/ITDepartment.styled';

const drawerWidth = 280;

const MainLayout = ({ currentUser, initialRoute = 'hr' }) => {
  const [activeSection, setActiveSection] = useState(initialRoute);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'hr':
        return <HRDepartment />;
      case 'it':
        return (
          <ITDepartment />
        );
      case 'operation':
        return <OperationDepartment />;
      case 'accounting':
        return (
          <PlaceholderDepartment 
            departmentName="Accounting Department"
            description="Accounting department managing financial records, budgets, invoicing, and financial reporting for all marketing projects and client accounts."
            icon={AccountBalanceOutlinedIcon}
          />
        );
      default:
        return <HRDepartment />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          open={sidebarOpen}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: `65%`,
            ml: '1rem',
            mt: '1.5rem',
            mb: '1rem',
            mr: '1rem',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Header */}
          <Header
            currentUser={currentUser}
            activeSection={activeSection}
            onMenuToggle={handleMenuToggle}
            drawerWidth={drawerWidth}
          />

          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              mt: '64px', // Height of AppBar
              backgroundColor: 'background.default',
            }}
          >
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;