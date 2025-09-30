import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  Divider,
  Avatar
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import logoImage from '../../assets/logo2-removebg-preview.png';

const drawerWidth = 280;

const menuItems = [
  { id: 'hr', label: 'HR Department', icon: PeopleAltOutlinedIcon },
  { id: 'it', label: 'IT Department', icon: ComputerOutlinedIcon },
  { id: 'marketing', label: 'Digital Marketing', icon: CampaignOutlinedIcon },
  { id: 'operation', label: 'Operations', icon: BusinessCenterOutlinedIcon },
  { id: 'accounting', label: 'Accounting', icon: AccountBalanceOutlinedIcon },
];

const Sidebar = ({ currentUser, activeSection, onSectionChange, open = true }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
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
         
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <img 
    src={logoImage} 
    alt="Trendora" 
    style={{ width: '40%' }} 
    className="navbar-logo" 
  />
</div>
        
          
        </Stack>

        {/* Navigation */}
        <List sx={{ flex: 1, p: 2 }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <ListItem key={item.id} disablePadding className="mb-2">
                <ListItemButton
                  onClick={() => onSectionChange(item.id)}
                  className={`rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-main text-white shadow-md' 
                      : 'hover:bg-gray-100'
                  }`}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#1c242e',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: '#24252a',
                      },
                    },
                  }}
                  selected={isActive}
                >
                  <ListItemIcon 
                    className={`min-w-0 mr-3 ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
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

        <Divider />
        
        {/* Footer */}
       
      </Stack>
    </Drawer>
  );
};

export default Sidebar;