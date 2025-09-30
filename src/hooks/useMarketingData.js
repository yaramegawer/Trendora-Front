import { useState, useEffect } from 'react';
import { marketingEmployeeApi, marketingProjectApi, marketingTicketApi, marketingLeaveApi } from '../services/marketingApi';

// Custom hook for Marketing employee data management
export const useMarketingEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketingEmployeeApi.getAllEmployees();
      
      // Handle different response formats
      let employeesData = [];
      
      if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response && Array.isArray(response)) {
        employeesData = response;
      }
      
      setEmployees(employeesData);
    } catch (err) {
      console.error('Marketing Employees API Error:', err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (id, ratingData) => {
    console.log('🔍 updateRating called in hook with:', { id, ratingData });
    try {
      const updatedEmployee = await marketingEmployeeApi.updateRating(id, ratingData);
      await fetchEmployees(); // Refresh the list
      return updatedEmployee;
    } catch (err) {
      console.error('Error updating employee rating:', err);
      throw err;
    }
  };

  const getRating = async (id) => {
    try {
      return await marketingEmployeeApi.getRating(id);
    } catch (err) {
      console.error('Error getting employee rating:', err);
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

// Custom hook for Marketing project data management
export const useMarketingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketingProjectApi.getAllProjects();
      
      // Handle different response formats
      let projectsData = [];
      
      if (Array.isArray(response)) {
        projectsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response && Array.isArray(response)) {
        projectsData = response;
      }
      
      setProjects(projectsData);
    } catch (err) {
      console.error('Marketing Projects API Error:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const newProject = await marketingProjectApi.createProject(projectData);
      await fetchProjects(); // Refresh the list
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await marketingProjectApi.updateProject(id, projectData);
      await fetchProjects(); // Refresh the list
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await marketingProjectApi.deleteProject(id);
      await fetchProjects(); // Refresh the list
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

// Custom hook for Marketing ticket data management
export const useMarketingTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketingTicketApi.getAllTickets();
      
      // Handle different response formats
      let ticketsData = [];
      
      if (Array.isArray(response)) {
        ticketsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        ticketsData = response.data;
      } else if (response && Array.isArray(response)) {
        ticketsData = response;
      }
      
      setTickets(ticketsData);
    } catch (err) {
      console.error('Marketing Tickets API Error:', err);
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    try {
      const newTicket = await marketingTicketApi.createTicket(ticketData);
      await fetchTickets(); // Refresh the list
      return newTicket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      const updatedTicket = await marketingTicketApi.updateTicket(id, ticketData);
      await fetchTickets(); // Refresh the list
      return updatedTicket;
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await marketingTicketApi.deleteTicket(id);
      await fetchTickets(); // Refresh the list
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
    createTicket,
    updateTicket,
    deleteTicket
  };
};

// Custom hook for Marketing leave data management
export const useMarketingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketingLeaveApi.getEmployeeLeaves();
      
      // Handle different response formats
      let leavesData = [];
      
      if (Array.isArray(response)) {
        leavesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        leavesData = response.data;
      } else if (response && Array.isArray(response)) {
        leavesData = response;
      }
      
      setLeaves(leavesData);
    } catch (err) {
      console.error('Marketing Leaves API Error:', err);
      setError(err.message);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async (leaveData) => {
    try {
      const newLeave = await marketingLeaveApi.submitEmployeeLeave(leaveData);
      await fetchLeaves(); // Refresh the list
      return newLeave;
    } catch (err) {
      console.error('Error submitting leave:', err);
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const updatedLeave = await marketingLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(); // Refresh the list
      return updatedLeave;
    } catch (err) {
      console.error('Error updating leave status:', err);
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      await marketingLeaveApi.deleteLeave(id);
      await fetchLeaves(); // Refresh the list
    } catch (err) {
      console.error('Error deleting leave:', err);
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
    submitLeave,
    updateLeaveStatus,
    deleteLeave
  };
};