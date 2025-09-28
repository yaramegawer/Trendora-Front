import { useState, useEffect } from 'react';
import { operationEmployeeApi, operationCampaignApi, operationLeaveApi } from '../services/operationApi';

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
      const response = await operationLeaveApi.getAllLeaves();
      if (response.success && Array.isArray(response.data)) {
        setLeaves(response.data);
      } else {
        setLeaves([]);
        setError(response.message || 'Failed to fetch Operation leaves');
      }
    } catch (err) {
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
      const response = await operationLeaveApi.addLeave(leaveData);
      if (response.success) {
        fetchLeaves(); // Refresh data
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to add leave' };
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
