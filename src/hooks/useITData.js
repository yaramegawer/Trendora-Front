import { useState, useEffect } from 'react';
import { itEmployeeApi, itProjectApi, itTicketApi, itLeaveApi } from '../services/itApi';

// Custom hook for IT employee data management
export const useITEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await itEmployeeApi.getAllEmployees();
      
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
// Error handled silently
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (id, ratingData) => {
    try {
      const updatedEmployee = await itEmployeeApi.updateRating(id, ratingData);
      await fetchEmployees(); // Refresh the employees list
      return updatedEmployee;
    } catch (err) {
// Error handled silently
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
    updateRating
  };
};

// Custom hook for IT project data management
export const useITProjects = (page = 1, limit = 10) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchProjects = async (pageNum = currentPage, pageLimit = pageSize) => {
    setLoading(true);
    setError(null);
    try {
// Fetching projects with pagination
      
      // Fetch paginated data
      const paginatedResponse = await itProjectApi.getAllProjects(pageNum, pageLimit);
      
// IT Projects API Response processed
      
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
      
      // Use the current page data length as total count if no total is provided
      if (totalCount === 0) {
        totalCount = projectsData.length;
      }
      
// Projects data processed
      
      setProjects(projectsData);
      setTotalProjects(totalCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
// IT Projects API Error handled
      
      // Handle specific ObjectId casting errors silently
      if (err.message && err.message.includes('Cast to ObjectId failed')) {
        setError(null); // Don't set error for this specific case
      } else {
        setError(err.message);
      }
      
      setProjects([]);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
// Creating project
      const newProject = await itProjectApi.createProject(projectData);
// Project created successfully
      await fetchProjects(currentPage, pageSize); // Refresh the current page
// Projects refreshed after creation
      return newProject;
    } catch (err) {
// Error creating project
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await itProjectApi.updateProject(id, projectData);
      await fetchProjects(currentPage, pageSize); // Refresh the current page
      return updatedProject;
    } catch (err) {
// Error updating project
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await itProjectApi.deleteProject(id);
      await fetchProjects(currentPage, pageSize); // Refresh the current page
    } catch (err) {
// Error deleting project
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalProjects / pageSize);
// Navigating to page
    
    // Always allow page changes if totalProjects is 0 (initial state) or if page is in valid range
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
// Fetching page
      fetchProjects(pageNum, pageSize);
    } else {
// Page out of range
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchProjects(1, newPageSize); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalProjects / pageSize)) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    projects,
    loading,
    error,
    totalProjects,
    currentPage,
    pageSize,
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

// Custom hook for IT ticket data management
export const useITTickets = (page = 1, limit = 10) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchTickets = async (pageNum = currentPage, pageLimit = pageSize) => {
    setLoading(true);
    setError(null);
    try {
// Fetching tickets with pagination
      
      // Fetch paginated data only
      const paginatedResponse = await itTicketApi.getAllTickets(pageNum, pageLimit);
      
      // Process paginated data for current page
      let ticketsData = [];
      let totalTicketsCount = 0;
      
      if (Array.isArray(paginatedResponse)) {
        ticketsData = paginatedResponse;
        totalTicketsCount = paginatedResponse.length;
      } else if (paginatedResponse && paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
        ticketsData = paginatedResponse.data;
        totalTicketsCount = paginatedResponse.total || paginatedResponse.data.length;
      } else if (paginatedResponse && paginatedResponse.success && Array.isArray(paginatedResponse.data)) {
        ticketsData = paginatedResponse.data;
        totalTicketsCount = paginatedResponse.total || paginatedResponse.data.length;
      }
      
// Tickets data processed
      
      setTickets(ticketsData);
      setTotalTickets(totalTicketsCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      setError(err.message);
      setTickets([]);
      setTotalTickets(0);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    try {
      const newTicket = await itTicketApi.createTicket(ticketData);
      await fetchTickets(currentPage, pageSize); // Refresh the current page
      return newTicket;
    } catch (err) {
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      const updatedTicket = await itTicketApi.updateTicket(id, ticketData);
      await fetchTickets(currentPage, pageSize); // Refresh the current page
      return updatedTicket;
    } catch (err) {
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await itTicketApi.deleteTicket(id);
      await fetchTickets(currentPage, pageSize); // Refresh the current page
    } catch (err) {
      throw err;
    }
  };

  // Enable automatic API call to fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalTickets / pageSize);
// Navigating to tickets page
    
    // Always allow page changes if totalTickets is 0 (initial state) or if page is in valid range
    if (totalTickets === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
// Fetching tickets page
      fetchTickets(pageNum, pageSize);
    } else {
// Tickets page out of range
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchTickets(1, newPageSize); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalTickets / pageSize)) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    tickets,
    loading,
    error,
    totalTickets,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalTickets / pageSize),
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};

// Custom hook for IT leave data management
export const useITLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await itLeaveApi.getEmployeeLeaves();
      
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
// IT Leaves API Error handled
      setError(err.message);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async (leaveData) => {
    try {
      const newLeave = await itLeaveApi.submitEmployeeLeave(leaveData);
      await fetchLeaves(); // Refresh the list
      return newLeave;
    } catch (err) {
// Error submitting leave
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const updatedLeave = await itLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(); // Refresh the list
      return updatedLeave;
    } catch (err) {
// Error updating leave status
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      await itLeaveApi.deleteLeave(id);
      await fetchLeaves(); // Refresh the list
    } catch (err) {
// Error deleting leave
      throw err;
    }
  };

  // Disabled automatic API call - only fetch when explicitly requested
  // useEffect(() => {
  //   fetchLeaves();
  // }, []);

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