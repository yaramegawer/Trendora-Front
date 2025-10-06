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
('Marketing Employees API Error:', err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (id, ratingData) => {
('🔍 updateRating called in hook with:', { id, ratingData });
    try {
      const updatedEmployee = await marketingEmployeeApi.updateRating(id, ratingData);
      await fetchEmployees(); // Refresh the list
      return updatedEmployee;
    } catch (err) {
('Error updating employee rating:', err);
      throw err;
    }
  };

  const getRating = async (id) => {
    try {
      return await marketingEmployeeApi.getRating(id);
    } catch (err) {
('Error getting employee rating:', err);
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
export const useMarketingProjects = (page = 1, limit = 10) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchProjects = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
(`Fetching marketing projects with pagination - Page: ${pageNum}, Limit: ${pageLimit}`);
      
      // Fetch paginated data
      const paginatedResponse = await marketingProjectApi.getAllProjects(pageNum, pageLimit);
      
('📡 Marketing Projects API Response:', paginatedResponse);
      
      // Process paginated data for current page
      let projectsData = [];
      let totalCount = 0;
      
      if (Array.isArray(paginatedResponse)) {
        projectsData = paginatedResponse;
        totalCount = paginatedResponse.length; // Fallback to array length
      } else if (paginatedResponse && paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
        projectsData = paginatedResponse.data;
        totalCount = paginatedResponse.total || paginatedResponse.data.length;
      } else if (paginatedResponse && paginatedResponse.success && Array.isArray(paginatedResponse.data)) {
        projectsData = paginatedResponse.data;
        totalCount = paginatedResponse.total || paginatedResponse.data.length;
      } else if (paginatedResponse && paginatedResponse.total !== undefined) {
        // Handle response with total count
        projectsData = paginatedResponse.data || [];
        totalCount = paginatedResponse.total;
      }
      
      // If we don't have a total count from the API, fetch all projects to get the count
      if (totalCount === 0 || totalCount === projectsData.length) {
('🔄 No total count from API, fetching all projects for total count...');
        const allProjectsResponse = await marketingProjectApi.getAllProjects(1, 1000);
        
        let allProjectsData = [];
        if (Array.isArray(allProjectsResponse)) {
          allProjectsData = allProjectsResponse;
        } else if (allProjectsResponse && allProjectsResponse.data && Array.isArray(allProjectsResponse.data)) {
          allProjectsData = allProjectsResponse.data;
        } else if (allProjectsResponse && allProjectsResponse.success && Array.isArray(allProjectsResponse.data)) {
          allProjectsData = allProjectsResponse.data;
        }
        
        totalCount = allProjectsData.length;
      }
      
('📊 Marketing projects total count:', totalCount);
('📊 Current page marketing projects data:', projectsData);
      
      setProjects(projectsData);
      setTotalProjects(totalCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
('Error fetching marketing projects:', err);
      setError(err.message || 'Network Error');
      setProjects([]);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const newProject = await marketingProjectApi.createProject(projectData);
      fetchProjects(currentPage, pageSize); // Refresh current page
      return newProject;
    } catch (err) {
('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await marketingProjectApi.updateProject(id, projectData);
      fetchProjects(currentPage, pageSize); // Refresh current page
      return updatedProject;
    } catch (err) {
('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await marketingProjectApi.deleteProject(id);
      fetchProjects(currentPage, pageSize); // Refresh current page
    } catch (err) {
('Error deleting project:', err);
      throw err;
    }
  };

  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalProjects / pageSize);
(`Marketing Projects goToPage: pageNum=${pageNum}, totalProjects=${totalProjects}, pageSize=${pageSize}, maxPages=${maxPages}`);
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
(`Marketing Projects goToPage: Fetching page ${pageNum}`);
      fetchProjects(pageNum, pageSize);
    } else {
(`Marketing Projects goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchProjects(1, newPageSize);
  };

  const nextPage = () => {
    const maxPages = Math.ceil(totalProjects / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    totalProjects,
    currentPage,
    totalPages: Math.ceil(totalProjects / pageSize),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
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
('Marketing Tickets API Error:', err);
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
('Error creating ticket:', err);
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      const updatedTicket = await marketingTicketApi.updateTicket(id, ticketData);
      await fetchTickets(); // Refresh the list
      return updatedTicket;
    } catch (err) {
('Error updating ticket:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await marketingTicketApi.deleteTicket(id);
      await fetchTickets(); // Refresh the list
    } catch (err) {
('Error deleting ticket:', err);
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
('Marketing Leaves API Error:', err);
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
('Error submitting leave:', err);
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const updatedLeave = await marketingLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(); // Refresh the list
      return updatedLeave;
    } catch (err) {
('Error updating leave status:', err);
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      await marketingLeaveApi.deleteLeave(id);
      await fetchLeaves(); // Refresh the list
    } catch (err) {
('Error deleting leave:', err);
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