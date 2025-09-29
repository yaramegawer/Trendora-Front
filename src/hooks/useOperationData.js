import { useState, useEffect } from 'react';
import { operationEmployeeApi, operationCampaignApi, operationLeaveApi, operationTicketApi } from '../services/operationApi';

// Custom hook for Operation employee data management
export const useOperationEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationEmployeeApi.getAllEmployees();
      if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
        setError(response.message || 'Failed to fetch Operation employees');
      }
    } catch (err) {
      setError(err.message || 'Network Error');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const updateEmployeeRating = async (id, ratingData) => {
    try {
      const response = await operationEmployeeApi.updateRating(id, ratingData);
      console.log('Raw API response:', response);
      
      // Check for success in different possible formats
      if (response.success || 
          (response.message && response.message.toLowerCase().includes('success')) ||
          (response.status && response.status === 'success')) {
        fetchEmployees(); // Refresh data
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message || 'Unknown error' };
      }
    } catch (err) {
      console.error('Error in updateEmployeeRating:', err);
      return { success: false, message: err.message || 'Failed to update rating' };
    }
  };

  const getEmployeeRating = async (id) => {
    try {
      const response = await operationEmployeeApi.getRating(id);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to get rating' };
    }
  };

  return { employees, loading, error, fetchEmployees, updateEmployeeRating, getEmployeeRating };
};

// Custom hook for Operation campaign data management
export const useOperationCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationCampaignApi.getAllCampaigns();
      if (response.success && Array.isArray(response.data)) {
        setCampaigns(response.data);
      } else {
        setCampaigns([]);
        setError(response.message || 'Failed to fetch Operation campaigns');
      }
    } catch (err) {
      setError(err.message || 'Network Error');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (campaignData) => {
    try {
      const response = await operationCampaignApi.createCampaign(campaignData);
      if (response.success) {
        fetchCampaigns(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to create campaign' };
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await operationCampaignApi.updateCampaign(id, campaignData);
      if (response.success) {
        fetchCampaigns(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update campaign' };
    }
  };

  const deleteCampaign = async (id) => {
    try {
      const response = await operationCampaignApi.deleteCampaign(id);
      if (response.success) {
        fetchCampaigns(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to delete campaign' };
    }
  };

  return { campaigns, loading, error, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign };
};

// Custom hook for Operation leave data management
export const useOperationLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationLeaveApi.getEmployeeLeaves();
      console.log('Operation Employee Leaves API Response:', response);
      
      // Handle different response formats
      let leavesData = [];
      let userDepartment = null;
      
      if (Array.isArray(response)) {
        leavesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        leavesData = response.data;
        userDepartment = response.department;
        console.log('🏢 User department from response:', userDepartment);
      } else if (response && response.success && Array.isArray(response.data)) {
        leavesData = response.data;
        userDepartment = response.department;
        console.log('🏢 User department from response:', userDepartment);
      }
      
      // Only show leaves if user is in Operation department
      if (userDepartment) {
        const departmentLower = userDepartment.toLowerCase();
        console.log('🔍 Operation Department: Checking department:', userDepartment, '->', departmentLower);
        
        // Check for various Operation department name variations - be more specific
        const isOperationDepartment = departmentLower === 'operation' || 
                                     departmentLower === 'operations' ||
                                     departmentLower === 'operations department' ||
                                     departmentLower === 'operation department' ||
                                     (departmentLower.includes('operation') && !departmentLower.includes('it'));
        
        if (!isOperationDepartment) {
          console.log('🚫 Operation Department: User is not in Operation department, not showing leaves');
          console.log('🚫 Operation Department: User department:', userDepartment, 'Expected: Operation or Operations');
          setLeaves([]);
        } else {
          console.log('✅ Operation Department: User is in Operation department, showing leaves');
          console.log('📊 Operation Department: Processed employee leaves data:', leavesData);
          console.log('📊 Operation Department: Number of leaves found:', leavesData.length);
          setLeaves(leavesData);
        }
      } else {
        console.log('⚠️ Operation Department: No department info in response, not showing leaves');
        setLeaves([]);
      }
    } catch (err) {
      console.warn('Operation Employee Leaves API Error, using empty array:', err.message);
      setError(err.message || 'Network Error');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const addLeave = async (leaveData) => {
    try {
      console.log('Adding Operation employee leave:', leaveData);
      const response = await operationLeaveApi.submitEmployeeLeave(leaveData);
      console.log('Operation employee leave add response:', response);
      
      // Refresh leaves data
      await fetchLeaves();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error adding Operation employee leave:', err);
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const response = await operationLeaveApi.updateLeaveStatus(id, leaveData);
      if (response.success) {
        fetchLeaves(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update leave' };
    }
  };

  const deleteLeave = async (id) => {
    try {
      const response = await operationLeaveApi.deleteLeave(id);
      if (response.success) {
        fetchLeaves(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to delete leave' };
    }
  };

  return { leaves, loading, error, fetchLeaves, addLeave, updateLeaveStatus, deleteLeave };
};

// Custom hook for Operation ticket data management
export const useOperationTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationTicketApi.getAllTickets();
      console.log('Operation Tickets API Response:', response);
      
      // Handle different response formats
      let ticketsData = [];
      if (Array.isArray(response)) {
        ticketsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        ticketsData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        ticketsData = response.data;
      }
      
      console.log('Processed operation tickets data:', ticketsData);
      setTickets(ticketsData);
    } catch (err) {
      console.warn('Operation Tickets API Error, using empty array:', err.message);
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const addTicket = async (ticketData) => {
    try {
      console.log('Adding operation ticket:', ticketData);
      const response = await operationTicketApi.addTicket(ticketData);
      console.log('Operation ticket add response:', response);
      
      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error adding operation ticket:', err);
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      console.log('Updating operation ticket:', id, ticketData);
      const response = await operationTicketApi.updateTicket(id, ticketData);
      console.log('Operation ticket update response:', response);
      
      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error updating operation ticket:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      console.log('Deleting operation ticket:', id);
      const response = await operationTicketApi.deleteTicket(id);
      console.log('Operation ticket deletion response:', response);
      
      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error deleting operation ticket:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    addTicket,
    updateTicket,
    deleteTicket
  };
};
