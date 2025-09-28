import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Stack, Avatar, Button } from '@mui/material';
import { Dashboard, People, Computer, BusinessCenter, AccountBalance, TrendingUp } from '@mui/icons-material';

const OverviewDashboard = () => {
  const departments = [
    {
      id: 'hr',
      name: 'HR Department',
      icon: People,
      color: 'primary',
      stats: { employees: 45, active: 42, pending: 3 },
      description: 'Human Resources Management'
    },
    {
      id: 'it',
      name: 'IT Department',
      icon: Computer,
      color: 'info',
      stats: { systems: 12, active: 11, maintenance: 1 },
      description: 'Information Technology'
    },
    {
      id: 'operation',
      name: 'Operations',
      icon: BusinessCenter,
      color: 'success',
      stats: { projects: 8, active: 6, completed: 2 },
      description: 'Business Operations'
    },
    {
      id: 'accounting',
      name: 'Accounting',
      icon: AccountBalance,
      color: 'warning',
      stats: { transactions: 156, pending: 12, completed: 144 },
      description: 'Financial Management'
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      color: 'error',
      stats: { leads: 89, converted: 23, pending: 66 },
      description: 'Sales & Marketing'
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1.75rem' }}>
          Welcome to Trendora
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your comprehensive business management dashboard
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Employees
                  </Typography>
                  <Typography variant="h4" component="div">
                    245
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <BusinessCenter />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Active Projects
                  </Typography>
                  <Typography variant="h4" component="div">
                    18
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    $2.4M
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Growth
                  </Typography>
                  <Typography variant="h4" component="div">
                    +12%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments.map((dept) => (
          <Grid item xs={12} sm={6} md={4} key={dept.id}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${dept.color}.main` }}>
                    <dept.icon />
                  </Avatar>
                  <Button
                    variant="contained"
                    color={dept.color}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    View Details
                  </Button>
                </Stack>
                
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                  {dept.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dept.description}
                </Typography>
                
                <Stack spacing={1}>
                  {Object.entries(dept.stats).map(([key, value]) => (
                    <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Recent Activity
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Box>
                <Typography variant="body2">
                  New employee John Doe joined HR Department
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Box>
                <Typography variant="body2">
                  Project "Website Redesign" completed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  4 hours ago
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
              <Box>
                <Typography variant="body2">
                  Monthly payroll processed for 245 employees
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 day ago
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
              <Box>
                <Typography variant="body2">
                  IT system maintenance completed successfully
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 days ago
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverviewDashboard;