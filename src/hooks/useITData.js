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

// Custom hook for IT project data management with backend pagination
export const useITProjects = (page = 1, limit = 10, searchTerm = '', statusFilter = 'all') => {
  const [projects, setProjects] = useState([]); // Current page projects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async (pageNum = currentPage, pageLimit = pageSize, search = currentSearchTerm, status = currentStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
        ('🔄 Fetching IT projects from backend:', { pageNum, pageLimit, status });
      
      // Fetch data from backend with pagination and status filter
      // Backend handles all filtering - no client-side filtering
      const response = await itProjectApi.getAllProjects(pageNum, pageLimit, status);
      
        ('📦 IT Projects API response:', response);
      
      // Handle response format
      let projectsData = [];
      let totalCount = 0;
      let currentPageNum = pageNum;
      let totalPagesNum = 1;
      
      if (response && response.data && Array.isArray(response.data)) {
        projectsData = response.data;
        totalCount = response.total || response.data.length;
        currentPageNum = response.page || pageNum;
        totalPagesNum = response.totalPages || Math.ceil(totalCount / pageLimit);
      } else if (Array.isArray(response)) {
        projectsData = response;
        totalCount = response.length;
      }
      
        ('✅ Processed IT projects:', { count: projectsData.length, total: totalCount, pages: totalPagesNum });
      
      setProjects(projectsData);
      setTotalProjects(totalCount);
      setCurrentPage(currentPageNum);
      setPageSize(pageLimit);
      setCurrentSearchTerm(search);
      setCurrentStatusFilter(status);
      setTotalPages(totalPagesNum);
    } catch (err) {
      console.error('❌ Error fetching IT projects:', err);
      console.error('❌ Error type:', err.constructor.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      // Handle specific ObjectId casting errors silently
      if (err.message && err.message.includes('Cast to ObjectId failed')) {
        setError(null); // Don't set error for this specific case
      } else if (err.message && err.message.includes('API Error')) {
        setError(null); // Don't show generic API errors to users
      } else {
        setError(err.message);
      }
      
      setProjects([]);
      setTotalProjects(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
// Creating project
      const newProject = await itProjectApi.createProject(projectData);
// Project created successfully
      await fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter); // Refresh the current page
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
      await fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter); // Refresh the current page
      return updatedProject;
    } catch (err) {
// Error updating project
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await itProjectApi.deleteProject(id);
      await fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter); // Refresh the current page
    } catch (err) {
// Error deleting project
      throw err;
    }
  };

  // Method to change the search term filter
  const changeSearchTerm = (newSearchTerm) => {
    setCurrentSearchTerm(newSearchTerm);
    fetchProjects(1, pageSize, newSearchTerm, currentStatusFilter); // Reset to first page when filter changes
  };

  // Method to change the status filter
  const changeStatusFilter = (newFilter) => {
      ('🔄 Changing project status filter to:', newFilter);
    setCurrentPage(1); // Reset to first page
    setCurrentStatusFilter(newFilter); // This will trigger useEffect to re-fetch
  };

  // Method to change both filters at once
  const changeFilters = (newSearchTerm, newStatusFilter) => {
    setCurrentSearchTerm(newSearchTerm);
    setCurrentStatusFilter(newStatusFilter);
    fetchProjects(1, pageSize, newSearchTerm, newStatusFilter); // Reset to first page when filters change
  };

  // Re-fetch when page, pageSize, or statusFilter changes
  useEffect(() => {
      ('🔄 useITProjects useEffect triggered:', { currentPage, pageSize, currentStatusFilter });
    fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter);
  }, [currentPage, pageSize, currentStatusFilter]);

  // Pagination functions
  const goToPage = (pageNum) => {
    // Always allow page changes if totalProjects is 0 (initial state) or if page is in valid range
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= totalPages)) {
      fetchProjects(pageNum, pageSize, currentSearchTerm, currentStatusFilter);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchProjects(1, newPageSize, currentSearchTerm, currentStatusFilter); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
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
    totalPages,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    changeSearchTerm,
    changeStatusFilter,
    changeFilters,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};

// Custom hook for IT ticket data management with backend pagination
export const useITTickets = (page = 1, limit = 10, statusFilter = 'all') => {
  const [tickets, setTickets] = useState([]); // Current page tickets
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async (pageNum = currentPage, pageLimit = pageSize, filter = currentStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
        ('🔄 Fetching IT tickets from backend:', { pageNum, pageLimit, filter });
      
      // Fetch data from backend with pagination and status filter
      // Backend handles all filtering - no client-side filtering
      const response = await itTicketApi.getAllTickets(pageNum, pageLimit, filter);
      
        ('📦 IT Tickets API response:', response);
      
      // Handle response format
      let ticketsData = [];
      let totalCount = 0;
      let currentPageNum = pageNum;
      let totalPagesNum = 1;
      
      if (response && response.data && Array.isArray(response.data)) {
        ticketsData = response.data;
        totalCount = response.total || response.data.length;
        currentPageNum = response.page || pageNum;
        totalPagesNum = response.totalPages || Math.ceil(totalCount / pageLimit);
      } else if (Array.isArray(response)) {
        ticketsData = response;
        totalCount = response.length;
      }
      
        ('✅ Processed IT tickets:', { count: ticketsData.length, total: totalCount, pages: totalPagesNum });
      
      setTickets(ticketsData);
      setTotalTickets(totalCount);
      setCurrentPage(currentPageNum);
      setPageSize(pageLimit);
      setCurrentStatusFilter(filter);
      setTotalPages(totalPagesNum);
    } catch (err) {
      console.error('❌ Error fetching IT tickets:', err);
      console.error('❌ Error type:', err.constructor.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      // Set error message only if it's meaningful (not just API errors)
      if (err.message && !err.message.includes('API Error')) {
        setError(err.message);
      } else {
        setError(null); // Don't show generic API errors to users
      }
      
      setTickets([]);
      setTotalTickets(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    try {
      const newTicket = await itTicketApi.createTicket(ticketData);
      await fetchTickets(currentPage, pageSize, currentStatusFilter); // Refresh the current page
      return newTicket;
    } catch (err) {
      throw err;
    }
  };

  const updateTicket = async (id, ticketData) => {
    try {
      const updatedTicket = await itTicketApi.updateTicket(id, ticketData);
      await fetchTickets(currentPage, pageSize, currentStatusFilter); // Refresh the current page
      return updatedTicket;
    } catch (err) {
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await itTicketApi.deleteTicket(id);
      await fetchTickets(currentPage, pageSize, currentStatusFilter); // Refresh the current page
    } catch (err) {
      throw err;
    }
  };

  // Method to change the status filter
  const changeStatusFilter = (newFilter) => {
      ('🔄 Changing ticket status filter to:', newFilter);
    setCurrentPage(1); // Reset to first page
    setCurrentStatusFilter(newFilter); // This will trigger useEffect to re-fetch
  };

  // Re-fetch when page, pageSize, or statusFilter changes
  useEffect(() => {
      ('🔄 useITTickets useEffect triggered:', { currentPage, pageSize, currentStatusFilter });
    fetchTickets(currentPage, pageSize, currentStatusFilter);
  }, [currentPage, pageSize, currentStatusFilter]);

  // Pagination functions
  const goToPage = (pageNum) => {
    // Always allow page changes if totalTickets is 0 (initial state) or if page is in valid range
    if (totalTickets === 0 || (pageNum >= 1 && pageNum <= totalPages)) {
      fetchTickets(pageNum, pageSize, currentStatusFilter);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchTickets(1, newPageSize, currentStatusFilter); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
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
    totalPages,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    goToPage,
    changePageSize,
    changeStatusFilter,
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