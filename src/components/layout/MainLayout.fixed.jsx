import React, { useState } from 'react';
import { Stack, Box, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Button, IconButton, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../theme';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HRDepartment from '../hr/HRDepartment.new';
import ITDepartment from '../IT/ITDepartment.styled';
import OperationDepartment from '../operation/OperationDepartment.styled';
import AccountingDepartment from '../accounting/AccountingDepartment';
import SalesDepartment from '../sales/SalesDepartment';
import OverviewDashboard from '../dashboard/OverviewDashboard';
import EmployeeDashboard from '../dashboard/EmployeeDashboard';
import logoImage from '../../assets/logo2-removebg-preview.png';

const drawerWidth = 280;

const getMenuItems = (userRole) => {
  if (userRole === 'Employee') {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
    ];
  }
  
  return [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
    { id: 'hr', label: 'HR Department', icon: PeopleAltOutlinedIcon },
    { id: 'it', label: 'IT Department', icon: ComputerOutlinedIcon },
    { id: 'operation', label: 'Operations Department', icon: BusinessCenterOutlinedIcon },
    { id: 'accounting', label: 'Accounting Department', icon: AccountBalanceOutlinedIcon },
    { id: 'sales', label: 'Sales Department', icon: TrendingUpOutlinedIcon },
  ];
};

const getSectionTitle = (sectionId, userRole) => {
  if (userRole === 'Employee') {
    return 'Employee Dashboard';
  }
  
  const titles = {
    dashboard: 'Dashboard',
    hr: 'HR Department',
    it: 'IT Department',
    operation: 'Operations Department',
    accounting: 'Accounting Department',
    sales: 'Sales Department',
  };
  return titles[sectionId] || 'Dashboard';
};

const renderContent = (activeSection, userRole) => {
  // For Employee role, always show EmployeeDashboard regardless of activeSection
  if (userRole === 'Employee') {
    return <EmployeeDashboard />;
  }
  
  switch (activeSection) {
    case 'dashboard':
      return <OverviewDashboard />;
    case 'hr':
      return <HRDepartment />;
    case 'it':
      return <ITDepartment />;
    case 'operation':
      return <OperationDepartment />;
    case 'accounting':
      return <AccountingDepartment />;
    case 'sales':
      return <SalesDepartment />;
    default:
      return <OverviewDashboard />;
  }
};

const MainLayout = () => {
  try {
    console.log('MainLayout: Component starting to render');
    
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { logout, user } = useAuth();
    
    console.log('MainLayout: User data:', user);
    
    const userRole = user?.role || 'Employee';
    const menuItems = getMenuItems(userRole);
    
    console.log('MainLayout: User role:', userRole);
    console.log('MainLayout: Menu items:', menuItems);

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'grey.50', fontFamily: 'Inter, sans-serif' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarOpen ? drawerWidth : 64,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? drawerWidth : 64,
              boxSizing: 'border-box',
              backgroundColor: '#1c242e',
              borderRight: '1px solid #334155',
              transition: 'width 0.3s ease',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #334155' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {sidebarOpen && (
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                  Trendora
                </Typography>
              )}
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ 
                  color: '#94a3b8', 
                  position: 'absolute',
                  right: 0,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
                }}
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>☰</Box>
              </IconButton>
            </Box>
          </Box>

          <List sx={{ flexGrow: 1, pt: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: activeSection === item.id ? '#334155' : 'transparent',
                    color: activeSection === item.id ? '#ffffff' : '#94a3b8',
                    borderRight: activeSection === item.id ? '3px solid #1c242e' : 'none',
                    '&:hover': {
                      backgroundColor: activeSection === item.id ? '#334155' : '#334155',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <item.icon />
                  </ListItemIcon>
                  {sidebarOpen && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: '1px solid #334155' }}>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                width: '100%',
                color: '#ef4444',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '&:hover': {
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                },
              }}
            >
              {sidebarOpen && 'Logout'}
            </Button>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <img
                  src={logoImage}
                  alt="Trendora Logo"
                  style={{ 
                    height: '40px', 
                    width: 'auto',
                    marginRight: '12px'
                  }}
                />
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '1rem' }}>
                  {getSectionTitle(activeSection, userRole)}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Welcome back!
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Content Area */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
            {renderContent(activeSection, userRole)}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
  } catch (error) {
    console.error('MainLayout: Error rendering component:', error);
    return (
      <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Application Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          There was an error loading the application. Please check the console for details.
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

export default MainLayout;