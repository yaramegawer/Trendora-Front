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
      console.error('IT Employees API Error:', err);
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
      console.error('Error updating employee rating:', err);
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
      console.log(`useITProjects: Fetching projects with pagination - Page: ${pageNum}, Limit: ${pageLimit}`);
      
      // Fetch paginated data
      const paginatedResponse = await itProjectApi.getAllProjects(pageNum, pageLimit);
      
      console.log('useITProjects: IT Projects API Response:', paginatedResponse);
      
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
        console.log('useITProjects: No total count from API, fetching all projects for total count...');
        const allProjectsResponse = await itProjectApi.getAllProjects(1, 1000);
        
        let allProjectsData = [];
        if (Array.isArray(allProjectsResponse)) {
          allProjectsData = allProjectsResponse;
        } else if (allProjectsResponse && allProjectsResponse.data && Array.isArray(allProjectsResponse.data)) {
          allProjectsData = allProjectsResponse.data;
        } else if (allProjectsResponse && allProjectsResponse.success && Array.isArray(allProjectsResponse.data)) {
          allProjectsData = allProjectsResponse.data;
        }
        
        totalCount = allProjectsData.length;
        console.log('useITProjects: Total projects count from all data:', totalCount);
      }
      
      console.log('useITProjects: IT projects total count:', totalCount);
      console.log('useITProjects: Current page projects data:', projectsData);
      
      setProjects(projectsData);
      setTotalProjects(totalCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      console.warn('IT Projects API Error, using empty array:', err.message);
      
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
      console.log('🔧 useITProjects - createProject called with:', projectData);
      const newProject = await itProjectApi.createProject(projectData);
      console.log('🔧 useITProjects - API response:', newProject);
      await fetchProjects(currentPage, pageSize); // Refresh the current page
      console.log('🔧 useITProjects - Projects refreshed after creation');
      return newProject;
    } catch (err) {
      console.error('❌ useITProjects - Error creating project:', err);
      console.error('❌ useITProjects - Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await itProjectApi.updateProject(id, projectData);
      await fetchProjects(currentPage, pageSize); // Refresh the current page
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await itProjectApi.deleteProject(id);
      await fetchProjects(currentPage, pageSize); // Refresh the current page
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalProjects / pageSize);
    console.log(`useITProjects goToPage: pageNum=${pageNum}, totalProjects=${totalProjects}, pageSize=${pageSize}, maxPages=${maxPages}`);
    
    // Always allow page changes if totalProjects is 0 (initial state) or if page is in valid range
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      console.log(`useITProjects goToPage: Fetching page ${pageNum}`);
      fetchProjects(pageNum, pageSize);
    } else {
      console.log(`useITProjects goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
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
      console.log(`useITTickets: Fetching tickets with pagination - Page: ${pageNum}, Limit: ${pageLimit}`);
      
      // First, fetch all tickets to get total count
      console.log('useITTickets: Fetching all tickets for total count...');
      const allTicketsResponse = await itTicketApi.getAllTickets(1, 1000); // Get all tickets
      
      // Then fetch paginated data
      const paginatedResponse = await itTicketApi.getAllTickets(pageNum, pageLimit);
      
      console.log('useITTickets: All Tickets API Response:', allTicketsResponse);
      console.log('useITTickets: Paginated Tickets API Response:', paginatedResponse);
      
      // Process all tickets for total count
      let allTicketsData = [];
      if (Array.isArray(allTicketsResponse)) {
        allTicketsData = allTicketsResponse;
      } else if (allTicketsResponse && allTicketsResponse.data && Array.isArray(allTicketsResponse.data)) {
        allTicketsData = allTicketsResponse.data;
      } else if (allTicketsResponse && allTicketsResponse.success && Array.isArray(allTicketsResponse.data)) {
        allTicketsData = allTicketsResponse.data;
      }
      
      // Process paginated data for current page
      let ticketsData = [];
      if (Array.isArray(paginatedResponse)) {
        ticketsData = paginatedResponse;
      } else if (paginatedResponse && paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
        ticketsData = paginatedResponse.data;
      } else if (paginatedResponse && paginatedResponse.success && Array.isArray(paginatedResponse.data)) {
        ticketsData = paginatedResponse.data;
      }
      
      const totalTicketsCount = allTicketsData.length;
      
      console.log('useITTickets: All tickets count:', totalTicketsCount);
      console.log('useITTickets: Current page tickets data:', ticketsData);
      
      setTickets(ticketsData);
      setTotalTickets(totalTicketsCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      console.error('IT Tickets API Error:', err);
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
      console.error('Error creating ticket:', err);
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      const updatedTicket = await itTicketApi.updateTicket(id, ticketData);
      await fetchTickets(currentPage, pageSize); // Refresh the current page
      return updatedTicket;
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await itTicketApi.deleteTicket(id);
      await fetchTickets(currentPage, pageSize); // Refresh the current page
    } catch (err) {
      console.error('Error deleting ticket:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalTickets / pageSize);
    console.log(`useITTickets goToPage: pageNum=${pageNum}, totalTickets=${totalTickets}, pageSize=${pageSize}, maxPages=${maxPages}`);
    
    // Always allow page changes if totalTickets is 0 (initial state) or if page is in valid range
    if (totalTickets === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      console.log(`useITTickets goToPage: Fetching page ${pageNum}`);
      fetchTickets(pageNum, pageSize);
    } else {
      console.log(`useITTickets goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
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
      console.error('IT Leaves API Error:', err);
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
      console.error('Error submitting leave:', err);
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const updatedLeave = await itLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(); // Refresh the list
      return updatedLeave;
    } catch (err) {
      console.error('Error updating leave status:', err);
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      await itLeaveApi.deleteLeave(id);
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