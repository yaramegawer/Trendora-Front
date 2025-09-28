import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Breadcrumbs,
  Link,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const Header = ({ 
  currentUser, 
  activeSection, 
  onMenuToggle,
  drawerWidth = 280 
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
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

  const getBreadcrumbs = (section) => {
    return [
      { label: 'Home', href: '#' },
      { label: getSectionTitle(section), href: '#', active: true }
    ];
  };

  return (
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
      <Toolbar className="min-h-16">
        <Stack direction="row" className="items-center justify-between w-full">
          {/* Left Section */}
          <Stack spacing={2}>
            <Typography variant="h6" className="font-semibold">
              {getSectionTitle(activeSection)}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" className="text-sm">
              {getBreadcrumbs(activeSection).map((crumb, index) => (
                <Link
                  key={index}
                  underline="hover"
                  color={crumb.active ? "primary" : "inherit"}
                  href={crumb.href}
                  className={crumb.active ? "font-medium" : ""}
                >
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Stack>

          {/* Right Section */}
          <div className="navbar-right">

          <button className="logout-button">
            
            <span>Logout</span>
          </button>
        </div>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;