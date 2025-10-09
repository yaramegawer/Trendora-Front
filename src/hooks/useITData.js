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

// Custom hook for IT project data management with frontend pagination
export const useITProjects = (page = 1, limit = 10, searchTerm = '', statusFilter = 'all') => {
  const [allProjects, setAllProjects] = useState([]); // Store all projects
  const [projects, setProjects] = useState([]); // Current page projects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);

  const fetchProjects = async (pageNum = currentPage, pageLimit = pageSize, search = currentSearchTerm, status = currentStatusFilter) => {
    // Only fetch from API if we don't have all data yet
    if (allProjects.length === 0 || pageNum === 1) {
      setLoading(true);
      setError(null);
      try {
        
        // Fetch ALL data from backend
        const response = await itProjectApi.getAllProjects();
        
        
        // Extract all projects data
        let allProjectsData = [];
        
        if (Array.isArray(response)) {
          allProjectsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          allProjectsData = response.data;
        }
        
        
        // Store all projects
        setAllProjects(allProjectsData);
        
        // Apply filters BEFORE pagination
        const filteredProjects = allProjectsData.filter(project => {
          // Search filter
          const matchesSearch = search === '' || 
            (project.name && project.name.toLowerCase().includes(search.toLowerCase())) ||
            (project.description && project.description.toLowerCase().includes(search.toLowerCase()));
          
          // Status filter - normalize status by replacing hyphens with underscores for comparison
          const matchesStatus = status === 'all' || 
            (project.status && 
             project.status.toLowerCase().replace(/-/g, '_') === status.toLowerCase().replace(/-/g, '_'));
          
          return matchesSearch && matchesStatus;
        });
        
        setTotalProjects(filteredProjects.length);
        
        // Calculate pagination on frontend with filtered data
        const startIndex = (pageNum - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
        
        
        setProjects(paginatedProjects);
        setCurrentPage(pageNum);
        setPageSize(pageLimit);
        setCurrentSearchTerm(search);
        setCurrentStatusFilter(status);
      } catch (err) {
        // Handle specific ObjectId casting errors silently
        if (err.message && err.message.includes('Cast to ObjectId failed')) {
          setError(null); // Don't set error for this specific case
        } else {
          setError(err.message);
        }
        
        setProjects([]);
        setTotalProjects(0);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    } else {
      // We already have all data, just filter and paginate on frontend
      // Apply filters BEFORE pagination
      const filteredProjects = allProjects.filter(project => {
        // Search filter
        const matchesSearch = search === '' || 
          (project.name && project.name.toLowerCase().includes(search.toLowerCase())) ||
          (project.description && project.description.toLowerCase().includes(search.toLowerCase()));
        
        // Status filter - normalize status by replacing hyphens with underscores for comparison
        const matchesStatus = status === 'all' || 
          (project.status && 
           project.status.toLowerCase().replace(/-/g, '_') === status.toLowerCase().replace(/-/g, '_'));
        
        return matchesSearch && matchesStatus;
      });
      
      setTotalProjects(filteredProjects.length);
      
      const startIndex = (pageNum - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
      
      
      setProjects(paginatedProjects);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      setCurrentSearchTerm(search);
      setCurrentStatusFilter(status);
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
    setCurrentStatusFilter(newFilter);
    fetchProjects(1, pageSize, currentSearchTerm, newFilter); // Reset to first page when filter changes
  };

  // Method to change both filters at once
  const changeFilters = (newSearchTerm, newStatusFilter) => {
    setCurrentSearchTerm(newSearchTerm);
    setCurrentStatusFilter(newStatusFilter);
    fetchProjects(1, pageSize, newSearchTerm, newStatusFilter); // Reset to first page when filters change
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
      fetchProjects(pageNum, pageSize, currentSearchTerm, currentStatusFilter);
    } else {
// Page out of range
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchProjects(1, newPageSize, currentSearchTerm, currentStatusFilter); // Reset to first page when changing page size
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
    changeSearchTerm,
    changeStatusFilter,
    changeFilters,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};

// Custom hook for IT ticket data management with frontend pagination
export const useITTickets = (page = 1, limit = 10, statusFilter = 'all') => {
  const [allTickets, setAllTickets] = useState([]); // Store all tickets
  const [tickets, setTickets] = useState([]); // Current page tickets
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);

  const fetchTickets = async (pageNum = currentPage, pageLimit = pageSize, filter = currentStatusFilter) => {
    // Only fetch from API if we don't have all data yet
    if (allTickets.length === 0 || pageNum === 1) {
      setLoading(true);
      setError(null);
      try {
        
        // Fetch ALL data from backend
        const response = await itTicketApi.getAllTickets();
        
        
        // Extract all tickets data
        let allTicketsData = [];
        
        if (Array.isArray(response)) {
          allTicketsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          allTicketsData = response.data;
        }
        
        
        // Store all tickets
        setAllTickets(allTicketsData);
        
        // Apply status filter BEFORE pagination
        // Normalize status by replacing hyphens with underscores for comparison
        const filteredTickets = filter === 'all' 
          ? allTicketsData 
          : allTicketsData.filter(ticket => 
              ticket.status && 
              ticket.status.toLowerCase().replace(/-/g, '_') === filter.toLowerCase().replace(/-/g, '_'));
        
        setTotalTickets(filteredTickets.length);
        
        // Calculate pagination on frontend with filtered data
        const startIndex = (pageNum - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
        
        
        setTickets(paginatedTickets);
        setCurrentPage(pageNum);
        setPageSize(pageLimit);
        setCurrentStatusFilter(filter);
      } catch (err) {
        setError(err.message);
        setTickets([]);
        setTotalTickets(0);
        setAllTickets([]);
      } finally {
        setLoading(false);
      }
    } else {
      // We already have all data, just filter and paginate on frontend
      // Apply status filter BEFORE pagination
      // Normalize status by replacing hyphens with underscores for comparison
      const filteredTickets = filter === 'all' 
        ? allTickets 
        : allTickets.filter(ticket => 
            ticket.status && 
            ticket.status.toLowerCase().replace(/-/g, '_') === filter.toLowerCase().replace(/-/g, '_'));
      
      setTotalTickets(filteredTickets.length);
      
      const startIndex = (pageNum - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
      
      
      setTickets(paginatedTickets);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      setCurrentStatusFilter(filter);
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
    setCurrentStatusFilter(newFilter);
    fetchTickets(1, pageSize, newFilter); // Reset to first page when filter changes
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
      fetchTickets(pageNum, pageSize, currentStatusFilter);
    } else {
// Tickets page out of range
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchTickets(1, newPageSize, currentStatusFilter); // Reset to first page when changing page size
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