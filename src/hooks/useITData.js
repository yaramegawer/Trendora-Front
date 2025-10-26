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

// Custom hook for IT project data management with backend pagination and client-side search
export const useITProjects = (page = 1, limit = 10, searchTerm = '', statusFilter = 'all') => {
  const [allProjects, setAllProjects] = useState([]); // All projects from backend (for search)
  const [projects, setProjects] = useState([]); // Filtered and paginated projects
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
        ('🔄 Fetching IT projects from backend:', { status });
      
      // Fetch ALL data from backend with status filter only
      // Backend handles status filtering, we handle search and pagination on frontend
      const response = await itProjectApi.getAllProjects(1, 10000, status, null); // Get all with large limit
      
        ('📦 IT Projects API response:', response);
      
      // Handle response format
      let projectsData = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (Array.isArray(response)) {
        projectsData = response;
      }
      
        ('✅ Fetched IT projects from backend:', { count: projectsData.length });
      
      // Store all projects - filtering will be applied by applyFiltersAndPagination
      setAllProjects(projectsData);
    } catch (err) {
      // Silent fail for IT projects fetch
      
      // Handle specific ObjectId casting errors silently
      if (err.message && err.message.includes('Cast to ObjectId failed')) {
        setError(null); // Don't set error for this specific case
      } else if (err.message && err.message.includes('API Error')) {
        setError(null); // Don't show generic API errors to users
      } else {
        setError(err.message);
      }
      
      setAllProjects([]);
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
      // Refetch to get updated list from backend
      await fetchProjects(1, pageSize, currentSearchTerm, currentStatusFilter);
      setCurrentPage(1); // Reset to first page to see the new project
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
      // Refetch to get updated list from backend
      await fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter);
      return updatedProject;
    } catch (err) {
// Error updating project
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await itProjectApi.deleteProject(id);
      // Refetch to get updated list from backend
      await fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter);
    } catch (err) {
// Error deleting project
      throw err;
    }
  };

  // Client-side filtering and pagination (no backend call)
  const applyFiltersAndPagination = () => {
    let filteredProjects = allProjects;
    
    // Apply client-side search filtering
    if (currentSearchTerm && currentSearchTerm.trim() !== '') {
      const searchLower = currentSearchTerm.toLowerCase().trim();
      filteredProjects = allProjects.filter(project => {
        const nameMatch = project.name?.toLowerCase().includes(searchLower);
        const descMatch = project.description?.toLowerCase().includes(searchLower);
        const notesMatch = project.notes?.toLowerCase().includes(searchLower);
        return nameMatch || descMatch || notesMatch;
      });
        ('🔍 Filtered projects by search:', { search: currentSearchTerm, resultCount: filteredProjects.length });
    }
    
    // Calculate pagination
    const totalCount = filteredProjects.length;
    const totalPagesNum = Math.ceil(totalCount / pageSize);
    const actualPage = Math.min(currentPage, totalPagesNum || 1);
    
    // Apply client-side pagination
    const startIndex = (actualPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
    
      ('✅ Applied filters and pagination:', { total: totalCount, page: actualPage, pages: totalPagesNum, showing: paginatedProjects.length });
    
    setProjects(paginatedProjects);
    setTotalProjects(totalCount);
    setTotalPages(totalPagesNum || 1);
    if (actualPage !== currentPage) {
      setCurrentPage(actualPage);
    }
  };

  // Method to change the search term filter
  const changeSearchTerm = (newSearchTerm) => {
    setCurrentSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when search changes
    // Don't call fetchProjects - search is client-side only
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
    setCurrentPage(1);
    // Status change will trigger useEffect to re-fetch
  };

  // Re-fetch from backend ONLY when statusFilter changes (initial mount or status change)
  useEffect(() => {
      ('🔄 useITProjects useEffect triggered (backend fetch):', { currentStatusFilter });
    fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter);
  }, [currentStatusFilter]);
  
  // Re-apply client-side filters when search term or page changes (no backend call)
  useEffect(() => {
    if (allProjects.length > 0) {
        ('🔄 useITProjects applying client-side filters:', { currentPage, currentSearchTerm });
      applyFiltersAndPagination();
    }
  }, [currentPage, currentSearchTerm, pageSize, allProjects]);

  // Pagination functions (client-side only, no backend call)
  const goToPage = (pageNum) => {
    // Always allow page changes if totalProjects is 0 (initial state) or if page is in valid range
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= totalPages)) {
      setCurrentPage(pageNum); // This will trigger applyFiltersAndPagination useEffect
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // This will trigger applyFiltersAndPagination useEffect
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
      // Silent fail for IT tickets fetch
      
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

// Custom hook for IT leave data management with pagination
export const useITLeaves = (page = 1, limit = 10) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaves = async (pageNum = currentPage, pageLimit = pageSize, departmentId = null) => {
    setLoading(true);
    setError(null);
    try {
      // Fetching IT department leaves
      
      // Use the actual IT department ObjectId
      const response = await itLeaveApi.getDepartmentLeaves('68da376594328b3a175633a7', pageNum, pageLimit);
      
      // IT Leaves API response received
      
      // Handle response format
      let leavesData = [];
      let totalCount = 0;
      let currentPageNum = pageNum;
      let totalPagesNum = 1;
      
      if (response && response.leaves && Array.isArray(response.leaves)) {
        leavesData = response.leaves;
        totalCount =
          response.total ||
          response.count ||
          response.totalCount ||
          response.pagination?.total ||
          response.leaves.length;
        currentPageNum = response.page || response.currentPage || pageNum;
        totalPagesNum =
          response.totalPages ||
          response.pages ||
          response.pagination?.totalPages ||
          Math.ceil((totalCount || leavesData.length) / pageLimit);
      } else if (response && response.data && Array.isArray(response.data)) {
        leavesData = response.data;
        totalCount =
          response.total ||
          response.count ||
          response.totalCount ||
          response.pagination?.total ||
          response.data.length;
        currentPageNum = response.page || response.currentPage || pageNum;
        totalPagesNum =
          response.totalPages ||
          response.pages ||
          response.pagination?.totalPages ||
          Math.ceil((totalCount || leavesData.length) / pageLimit);
      } else if (Array.isArray(response)) {
        leavesData = response;
        totalCount = response.length;
      }
      
      if (pageLimit >= 1000) {
        // Do not probe additional pages to avoid backend 404s
        const allLeaves = [...leavesData];
        setLeaves(allLeaves);
        setTotalLeaves(totalCount || allLeaves.length);
        setCurrentPage(1);
        setPageSize(pageLimit);
        setTotalPages(1);
      } else {
        setLeaves(leavesData);
        setTotalLeaves(totalCount);
        setCurrentPage(currentPageNum);
        setPageSize(pageLimit);
        setTotalPages(totalPagesNum);
      }
      
      // Processed IT leaves
      
    } catch (err) {
      // Silent fail for IT leaves fetch
      
      // Set error message only if it's meaningful (not just API errors)
      if (err.message && !err.message.includes('API Error')) {
        setError(err.message);
      } else {
        setError(null); // Don't show generic API errors to users
      }
      
      setLeaves([]);
      setTotalLeaves(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async (leaveData) => {
    try {
      const newLeave = await itLeaveApi.submitEmployeeLeave(leaveData);
      await fetchLeaves(currentPage, pageSize); // Refresh the current page
      return newLeave;
    } catch (err) {
      // Silent fail for submit leave
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const updatedLeave = await itLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(currentPage, pageSize); // Refresh the current page
      return updatedLeave;
    } catch (err) {
      // Silent fail for update leave status
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      await itLeaveApi.deleteLeave(id);
      await fetchLeaves(currentPage, pageSize); // Refresh the current page
    } catch (err) {
      // Silent fail for delete leave
      throw err;
    }
  };

  // Pagination functions
  const goToPage = (pageNum) => {
    if (totalLeaves === 0 || (pageNum >= 1 && pageNum <= totalPages)) {
      fetchLeaves(pageNum, pageSize);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchLeaves(1, newPageSize); // Reset to first page when changing page size
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

  // Initial fetch
  useEffect(() => {
    fetchLeaves(currentPage, pageSize);
  }, []);

  return {
    leaves,
    loading,
    error,
    totalLeaves,
    currentPage,
    pageSize,
    totalPages,
    fetchLeaves,
    submitLeave,
    updateLeaveStatus,
    deleteLeave,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};