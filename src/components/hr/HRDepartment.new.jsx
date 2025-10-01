import React, { useState } from 'react';
import { Stack, Typography, Tabs, Tab, Box } from '@mui/material';
import EmployeeManagement from '../employees/EmployeeManagement.new';
import LeaveManagement from '../leaves/LeaveManagement.new';
import PayrollManagement from '../payroll/PayrollManagement.new';
import AttendanceManagement from '../attendance/AttendanceManagement';

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hr-tabpanel-${index}`}
      aria-labelledby={`hr-tab-${index}`}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

const HRDepartment = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Employees', component: <EmployeeManagement /> },
    { label: 'Leaves', component: <LeaveManagement /> },
    { label: 'Payroll', component: <PayrollManagement /> },
    { label: 'Attendance', component: <AttendanceManagement /> }
  ];

  return (
    <Box sx={{ height: '100%', backgroundColor: 'grey.50' }}>
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
       
        
        <Box sx={{ px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="HR department tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
                color: '#64748b',
                '&.Mui-selected': {
                  color: '#1c242e',
                },
                '&:hover': {
                  color: '#1e293b',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1c242e',
                height: 3,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
};

export default HRDepartment;