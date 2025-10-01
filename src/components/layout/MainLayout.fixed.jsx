import React, { useState, Suspense, lazy } from 'react';
import { Stack, Box, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Button, IconButton, CircularProgress, Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../theme';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import logoImage from '../../assets/logo2-removebg-preview.png';

// Lazy load components for better LCP
const HRDepartment = lazy(() => import('../hr/HRDepartment.new'));
const ITDepartment = lazy(() => import('../IT/ITDepartment.styled'));
const DigitalMarketingDepartment = lazy(() => import('../marketing/DigitalMarketingDepartment'));
const OperationDepartment = lazy(() => import('../operation/OperationDepartment.styled'));
const AccountingDepartment = lazy(() => import('../accounting/AccountingDepartment'));
const SalesDepartment = lazy(() => import('../sales/SalesDepartment'));
const OverviewDashboard = lazy(() => import('../dashboard/OverviewDashboard'));
const EmployeeDashboard = lazy(() => import('../dashboard/EmployeeDashboard'));

const drawerWidth = 280;

// Skeleton loading component for better LCP
const DashboardSkeleton = () => (
  <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh' }}>
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={400} height={24} />
    </Box>
    
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" width="25%" height={100} />
        <Skeleton variant="rectangular" width="25%" height={100} />
        <Skeleton variant="rectangular" width="25%" height={100} />
        <Skeleton variant="rectangular" width="25%" height={100} />
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Skeleton variant="rectangular" width="50%" height={200} />
      <Skeleton variant="rectangular" width="50%" height={200} />
    </Box>
    
    <Skeleton variant="rectangular" width="100%" height={150} />
  </Box>
);

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
    { id: 'marketing', label: 'Digital Marketing Department', icon: CampaignOutlinedIcon },
    { id: 'operation', label: 'Operation Department', icon: BusinessCenterOutlinedIcon },
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
    marketing: 'Marketing Department',
    operation: 'Operation Department',
    accounting: 'Accounting Department',
    sales: 'Sales Department',
  };
  return titles[sectionId] || 'Dashboard';
};

const renderContent = (activeSection, userRole) => {
  // For Employee role, always show EmployeeDashboard regardless of activeSection
  if (userRole === 'Employee') {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <EmployeeDashboard />
      </Suspense>
    );
  }
  
  switch (activeSection) {
    case 'dashboard':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <OverviewDashboard />
        </Suspense>
      );
    case 'hr':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <HRDepartment />
        </Suspense>
      );
    case 'it':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <ITDepartment />
        </Suspense>
      );
    case 'marketing':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <DigitalMarketingDepartment />
        </Suspense>
      );
    case 'operation':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <OperationDepartment />
        </Suspense>
      );
    case 'accounting':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <AccountingDepartment />
        </Suspense>
      );
    case 'sales':
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <SalesDepartment />
        </Suspense>
      );
    default:
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <OverviewDashboard />
        </Suspense>
      );
  }
};

const MainLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  
  const userRole = user?.role || 'Employee';
  const menuItems = getMenuItems(userRole);

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
};

export default MainLayout;