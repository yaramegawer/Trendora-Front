import React from 'react';
import { Stack, Typography, Paper, Card } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const PlaceholderDepartment = ({ departmentName, description, icon: IconComponent }) => {
  return (
    <Stack spacing={4} className="p-6">
      {/* Header */}
      <Stack className="text-center">
        <Stack className="items-center mb-4">
          <Paper 
            elevation={2} 
            className="p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4"
            sx={{ backgroundColor: 'primary.light' }}
          >
            <IconComponent 
              sx={{ fontSize: 48, color: 'primary.main' }}
            />
          </Paper>
        </Stack>
        <Typography variant="h4" className="font-bold mb-2">
          {departmentName}
        </Typography>
        <Typography variant="body1" color="text.secondary" className="max-w-2xl mx-auto">
          {description}
        </Typography>
      </Stack>

      {/* Coming Soon Card */}
      <Card elevation={2} className="p-8 text-center max-w-md mx-auto">
        <Stack spacing={3} className="items-center">
          <ConstructionIcon 
            sx={{ fontSize: 64, color: 'warning.main' }}
          />
          <Stack spacing={1}>
            <Typography variant="h6" className="font-semibold">
              Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This department's dashboard is currently under development. 
              Check back soon for comprehensive management tools and analytics.
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Feature Preview */}
      <Stack spacing={3} className="max-w-4xl mx-auto">
        <Typography variant="h6" className="font-semibold text-center">
          Planned Features
        </Typography>
        <Stack direction="row" spacing={3} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Paper elevation={1} className="p-4 text-center">
            <Typography variant="subtitle2" className="font-medium mb-2">
              Dashboard Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive metrics and KPIs specific to {departmentName.toLowerCase()}
            </Typography>
          </Paper>
          <Paper elevation={1} className="p-4 text-center">
            <Typography variant="subtitle2" className="font-medium mb-2">
              Team Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage team members, roles, and responsibilities
            </Typography>
          </Paper>
          <Paper elevation={1} className="p-4 text-center">
            <Typography variant="subtitle2" className="font-medium mb-2">
              Reporting Tools
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate detailed reports and performance insights
            </Typography>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PlaceholderDepartment;