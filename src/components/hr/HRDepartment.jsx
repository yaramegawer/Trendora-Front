import React, { useState } from 'react';
import { Stack, Tabs, Tab, Box } from '@mui/material';
import EmployeeManagement from '../employees/EmployeeManagement';
import DepartmentManagement from '../departments/DepartmentManagement';
import LeaveManagement from '../leaves/LeaveManagement';
import PayrollManagement from '../payroll/PayrollManagement';

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hr-tabpanel-${index}`}
      aria-labelledby={`hr-tab-${index}`}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
};

const HRDepartment = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Stack spacing={0} sx={{ height: '100%' }}>
      {/* Header */}


      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 3 }}
        >
          <Tab label="Employees" id="hr-tab-0" />
          <Tab label="Departments" id="hr-tab-1" />
          <Tab label="Leave Management" id="hr-tab-2" />
          <Tab label="Payroll" id="hr-tab-3" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={activeTab} index={0}>
          <EmployeeManagement />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <DepartmentManagement />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <LeaveManagement />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <PayrollManagement />
        </TabPanel>
      </Box>

    </Stack>
  );
};

export default HRDepartment;
