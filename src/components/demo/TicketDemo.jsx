import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useITTickets } from '../../hooks/useITData';
import { useOperationTickets } from '../../hooks/useOperationData';

const TicketDemo = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('it');
  
  // IT Tickets
  const { 
    tickets: itTickets, 
    loading: itLoading, 
    error: itError 
  } = useITTickets();
  
  // Operation Tickets
  const { 
    tickets: operationTickets, 
    loading: operationLoading, 
    error: operationError 
  } = useOperationTickets();

  const currentTickets = selectedDepartment === 'it' ? itTickets : operationTickets;
  const currentLoading = selectedDepartment === 'it' ? itLoading : operationLoading;
  const currentError = selectedDepartment === 'it' ? itError : operationError;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'resolved':
      case 'completed':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (currentLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentError) {
    return (
      <Alert severity="error">
        Error loading tickets: {currentError}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tickets with Employee Names Demo
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        {selectedDepartment === 'it' ? 'IT Department' : 'Operations Department'} Tickets
      </Typography>
      
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Showing {currentTickets?.length || 0} tickets with populated employee information
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTickets?.map((ticket) => (
              <TableRow key={ticket._id || ticket.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {ticket.title || 'No Title'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {ticket.description || 'No Description'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {ticket.employee ? (
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {ticket.employee.firstName} {ticket.employee.lastName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {ticket.employee.email}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No Employee Data
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ticket.status || 'Unknown'} 
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ticket.priority || 'Unknown'} 
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {ticket.createdAt ? 
                      new Date(ticket.createdAt).toLocaleDateString() : 
                      'Unknown'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {(!currentTickets || currentTickets.length === 0) && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1" color="textSecondary" textAlign="center">
              No tickets found for {selectedDepartment === 'it' ? 'IT' : 'Operations'} department
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
            {JSON.stringify({
              department: selectedDepartment,
              ticketCount: currentTickets?.length || 0,
              sampleTicket: currentTickets?.[0] || null,
              hasEmployeeData: currentTickets?.[0]?.employee ? true : false
            }, null, 2)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TicketDemo;
