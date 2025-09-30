import React, { useState } from 'react';
import { Stack, Box, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Breadcrumbs, Link } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../theme';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

const drawerWidth = 280;

const menuItems = [
  { id: 'hr', label: 'HR Department', icon: PeopleAltOutlinedIcon },
  { id: 'it', label: 'IT Department', icon: ComputerOutlinedIcon },
  { id: 'operation', label: 'Operations', icon: BusinessCenterOutlinedIcon },
  { id: 'accounting', label: 'Accounting', icon: AccountBalanceOutlinedIcon },
];

const MinimalMainLayout = ({ currentUser, initialRoute = 'hr' }) => {
  const [activeSection, setActiveSection] = useState(initialRoute);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const getSectionTitle = (section) => {
    const titles = {
      hr: 'HR Department',
      it: 'IT Department',
      operation: 'Operations Department',
      accounting: 'Accounting Department'
    };
    return titles[section] || 'HR Department';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'hr':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">HR Department</Typography>
            <Typography variant="body1">HR content coming soon...</Typography>
          </Box>
        );
      case 'it':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">IT Department</Typography>
            <Typography variant="body1">IT content coming soon...</Typography>
          </Box>
        );
      case 'operation':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">Operations Department</Typography>
            <Typography variant="body1">Operations content coming soon...</Typography>
          </Box>
        );
      case 'accounting':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">Accounting Department</Typography>
            <Typography variant="body1">Accounting content coming soon...</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">HR Department</Typography>
            <Typography variant="body1">HR content coming soon...</Typography>
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
        {/* Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={true}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Stack sx={{ height: '100%' }}>
            {/* Header */}
            <Stack sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Trendora
                </Typography>
              </Box>
            </Stack>

            {/* Navigation */}
            <List sx={{ flex: 1, p: 2 }}>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => handleSectionChange(item.id)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 0, 
                          mr: 3,
                          color: isActive ? 'primary.contrastText' : 'text.secondary'
                        }}
                      >
                        <IconComponent fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isActive ? 600 : 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* Footer */}

          </Stack>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Header */}
          <AppBar 
            position="fixed" 
            elevation={1}
            sx={{ 
              width: `calc(100% - ${drawerWidth}px)`,
              ml: `${drawerWidth}px`,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Toolbar sx={{ minHeight: 64 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {getSectionTitle(activeSection)}
                  </Typography>
                  <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="#">
                      Home
                    </Link>
                    <Typography color="primary" sx={{ fontWeight: 500 }}>
                      {getSectionTitle(activeSection)}
                    </Typography>
                  </Breadcrumbs>
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Welcome, {currentUser?.name || 'User'}
                  </Typography>
                </Stack>
              </Stack>
            </Toolbar>
          </AppBar>

          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              mt: '64px',
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

export default MinimalMainLayout;
