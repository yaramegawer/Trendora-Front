import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Computer,
  BugReport,
  Security,
  CloudQueue,
  Code,
  Settings,
  CheckCircle,
  Warning,
  Error,
  Person
} from '@mui/icons-material';
import { useITEmployees, useITProjects, useITTickets } from '../../hooks/useITData';
import { useAuth } from '../../contexts/AuthContext';
import { canAdd, canEdit, canDelete, showPermissionError } from '../../utils/permissions';

const ITDepartment = () => {
  // Use real API data
  const { employees, loading: employeesLoading, error: employeesError } = useITEmployees();
  const { projects, loading: projectsLoading, error: projectsError } = useITProjects();
  const { tickets, loading: ticketsLoading, error: ticketsError } = useITTickets();
  const { user } = useAuth();

  // Mock data for IT systems (since there's no API for this yet)
  const [systems] = useState([
    { id: 1, name: 'Main Server', status: 'online', uptime: '99.9%', lastUpdate: '2 min ago' },
    { id: 2, name: 'Database Server', status: 'online', uptime: '99.8%', lastUpdate: '5 min ago' },
    { id: 3, name: 'Web Server', status: 'warning', uptime: '95.2%', lastUpdate: '1 hour ago' },
    { id: 4, name: 'Email Server', status: 'online', uptime: '99.5%', lastUpdate: '10 min ago' },
    { id: 5, name: 'Backup System', status: 'offline', uptime: '0%', lastUpdate: '2 hours ago' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'offline': return <Error />;
      default: return <Computer />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            IT Department
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Information Technology Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Settings />} sx={{ borderRadius: 2 }}>
          System Settings
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Computer />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Array.isArray(employees) ? employees.length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IT Employees
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <BugReport />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Array.isArray(tickets) ? tickets.filter(t => t.status === 'open' || t.status === 'pending').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Tickets
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
                  <Code />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Array.isArray(projects) ? projects.length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
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
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    98.5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Uptime
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Systems Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            System Status
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>System Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>Last Update</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {systems.map((system) => (
                  <TableRow key={system.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Computer />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {system.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={system.status}
                        color={getStatusColor(system.status)}
                        icon={getStatusIcon(system.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {system.uptime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {system.lastUpdate}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Settings />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* IT Employees */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            IT Employees
          </Typography>
          {employeesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : employeesError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading employees: {employeesError}
            </Alert>
          ) : Array.isArray(employees) && employees.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Efficiency</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Teamwork</TableCell>
                    <TableCell>Overall Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => {
                    const efficiency = employee.efficiency || 0;
                    const performance = employee.performance || 0;
                    const teamwork = employee.teamwork || 0;
                    const overallRating = Math.round((efficiency + performance + teamwork) / 3);
                    
                    return (
                      <TableRow key={employee.id || employee._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {employee.name || employee.firstName + ' ' + employee.lastName || 'Unknown Employee'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.email || employee.position || 'IT Employee'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={efficiency} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2">{efficiency}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={performance} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2">{performance}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={teamwork} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2">{teamwork}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${overallRating}%`}
                            color={overallRating >= 80 ? 'success' : overallRating >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              No employees found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Tickets and Projects */}
      <Grid container spacing={3}>
        {/* Support Tickets */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Support Tickets
              </Typography>
              {ticketsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : ticketsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error loading tickets: {ticketsError}
                </Alert>
              ) : Array.isArray(tickets) && tickets.length > 0 ? (
                <Stack spacing={2}>
                  {tickets.map((ticket) => (
                    <Box
                      key={ticket.id || ticket._id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            {ticket.title || ticket.name || 'Untitled Ticket'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned to: {ticket.assignee || ticket.assignedTo || 'Unassigned'}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={ticket.priority || 'medium'}
                            color={getPriorityColor(ticket.priority || 'medium')}
                            size="small"
                          />
                          <Chip
                            label={ticket.status || 'open'}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  No tickets found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Projects */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Active Projects
              </Typography>
              {projectsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : projectsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error loading projects: {projectsError}
                </Alert>
              ) : Array.isArray(projects) && projects.length > 0 ? (
                <Stack spacing={2}>
                  {projects.map((project) => (
                    <Box
                      key={project.id || project._id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                        {project.name || project.title || 'Untitled Project'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Deadline: {project.deadline || project.dueDate || 'No deadline set'}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.progress || project.completion || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={project.progress || project.completion || 0} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Team: {project.team ? project.team.join(', ') : (project.assignedTo || 'Unassigned')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  No projects found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ITDepartment;
