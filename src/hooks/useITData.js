import { useState, useEffect } from 'react';
import { itEmployeeApi, itProjectApi, itTicketApi, itLeaveApi } from '../services/itApi';

// Custom hook for IT employee data management
export const useITEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    console.log('🔄 Starting to fetch IT employees...');
    setLoading(true);
    setError(null);
    try {
      const response = await itEmployeeApi.getAllEmployees();
      console.log('📡 IT Employees API Response:', response);
      console.log('📡 Response type:', typeof response);
      console.log('📡 Response isArray:', Array.isArray(response));
      console.log('📡 Response keys:', response ? Object.keys(response) : 'No response');
      console.log('📡 Response.notes:', response?.notes);
      console.log('📡 Response.data length:', response?.data?.length);
      
      // Handle different response formats
      let employeesData = [];
      
      if (Array.isArray(response)) {
        employeesData = response;
        console.log('✅ Using response as array directly');
      } else if (response && response.data && Array.isArray(response.data)) {
        employeesData = response.data;
        console.log('✅ Using response.data as array');
        console.log('📝 Employee notes included directly in data');
      } else if (response && Array.isArray(response)) {
        employeesData = response;
        console.log('✅ Using response as array (fallback)');
      } else {
        console.log('❌ No valid array found in response');
        console.log('❌ Response structure:', JSON.stringify(response, null, 2));
      }
      
      console.log('📊 Processed employees data:', employeesData);
      console.log('📊 Employees count:', employeesData.length);
      if (employeesData.length > 0) {
        console.log('📊 First employee structure:', employeesData[0]);
        console.log('📊 First employee note:', employeesData[0]?.note);
      }
      setEmployees(employeesData);
    } catch (err) {
      console.error('❌ IT Employees API Error:', err);
      console.error('❌ Error details:', err.message);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
      console.log('✅ Finished fetching IT employees');
    }
  };

  const updateRating = async (id, ratingData) => {
    try {
      console.log('Updating employee rating:', id, ratingData);
      const response = await itEmployeeApi.updateRating(id, ratingData);
      console.log('Rating update response:', response);
      
      // Refresh employees data
      await fetchEmployees();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error updating rating:', err);
      throw err;
    }
  };

  const getRating = async (id) => {
    try {
      const response = await itEmployeeApi.getRating(id);
      return response.data || response;
    } catch (err) {
      console.error('Error getting rating:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    updateRating,
    getRating
  };
};

// Custom hook for IT project data management
export const useITProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await itProjectApi.getAllProjects();
      console.log('IT Projects API Response:', response);
      
      // Handle different response formats
      let projectsData = [];
      if (Array.isArray(response)) {
        projectsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response && Array.isArray(response)) {
        projectsData = response;
      }
      
      console.log('Processed projects data:', projectsData);
      setProjects(projectsData);
    } catch (err) {
      console.warn('IT Projects API Error, using empty array:', err.message);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      console.log('Creating project:', projectData);
      const response = await itProjectApi.createProject(projectData);
      console.log('Project creation response:', response);
      
      // Refresh projects data
      await fetchProjects();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      console.log('Updating project:', id, projectData);
      const response = await itProjectApi.updateProject(id, projectData);
      console.log('Project update response:', response);
      
      // Refresh projects data
      await fetchProjects();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      console.log('Deleting project:', id);
      const response = await itProjectApi.deleteProject(id);
      console.log('Project deletion response:', response);
      
      // Refresh projects data
      await fetchProjects();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };
};

// Custom hook for IT ticket data management
export const useITTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await itTicketApi.getAllTickets();
      console.log('IT Tickets API Response:', response);
      
      // Handle different response formats
      let ticketsData = [];
      if (Array.isArray(response)) {
        ticketsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        ticketsData = response.data;
      } else if (response && Array.isArray(response)) {
        ticketsData = response;
      }
      
      console.log('Processed tickets data:', ticketsData);
      setTickets(ticketsData);
    } catch (err) {
      console.warn('IT Tickets API Error, using empty array:', err.message);
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      console.log('Updating ticket:', id, ticketData);
      const response = await itTicketApi.updateTicket(id, ticketData);
      console.log('Ticket update response:', response);
      
      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      console.log('Deleting ticket:', id);
      const response = await itTicketApi.deleteTicket(id);
      console.log('Ticket deletion response:', response);
      
      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error deleting ticket:', err);
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
    updateTicket,
    deleteTicket
  };
};

// Custom hook for IT leave data management
export const useITLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itLeaveApi.getAllLeaves();
      console.log('IT Leaves API Response:', response);
      
      // Handle different response formats
      let leavesData = [];
      if (Array.isArray(response)) {
        leavesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        leavesData = response.data;
      } else if (response && Array.isArray(response)) {
        leavesData = response;
      }
      
      console.log('Processed leaves data:', leavesData);
      setLeaves(leavesData);
    } catch (err) {
      console.warn('IT Leaves API Error, using empty array:', err.message);
      setError(err.message);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const addLeave = async (leaveData) => {
    try {
      console.log('Adding IT leave:', leaveData);
      const response = await itLeaveApi.addLeave(leaveData);
      console.log('IT leave add response:', response);
      
      // Refresh leaves data
      await fetchLeaves();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error adding IT leave:', err);
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      console.log('Updating IT leave status:', id, leaveData);
      const response = await itLeaveApi.updateLeaveStatus(id, leaveData);
      console.log('IT leave update response:', response);
      
      // Refresh leaves data
      await fetchLeaves();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error updating IT leave:', err);
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      console.log('Deleting IT leave:', id);
      const response = await itLeaveApi.deleteLeave(id);
      console.log('IT leave deletion response:', response);
      
      // Refresh leaves data
      await fetchLeaves();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error deleting IT leave:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return {
    leaves,
    loading,
    error,
    fetchLeaves,
    addLeave,
    updateLeaveStatus,
    deleteLeave
  };
};
