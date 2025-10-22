import { useState, useEffect } from "react";
import {
  marketingEmployeeApi,
  marketingProjectApi,
  marketingTicketApi,
  marketingLeaveApi,
} from "../services/marketingApi";

// Custom hook for Marketing employee data management
export const useMarketingEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      "🔄 Fetching Marketing employees from:",
        "/digitalMarketing/employees/digitalMarketing";
      const response = await marketingEmployeeApi.getAllEmployees();

      // Handle different response formats
      let employeesData = [];

      if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        employeesData = response.data;
      }

      "✅ Marketing Employees loaded:", employeesData.length, "employees";
      setEmployees(employeesData);
    } catch (err) {
      console.error("❌ Marketing Employees API Error:", err);
      const errorMessage = err.message || "Failed to load employees";
      setError(errorMessage);
      setEmployees([]);

      // Provide helpful error message
      if (err.message && err.message.includes("403")) {
        console.error(
          "⚠️ Access Denied: You may not have permission to view Digital Marketing employees"
        );
      } else if (err.message && err.message.includes("404")) {
        console.error(
          "⚠️ Endpoint Not Found: The backend may not have the Digital Marketing employees endpoint configured"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (id, ratingData) => {
    "🔍 updateRating called in hook with:", { id, ratingData };
    try {
      const updatedEmployee = await marketingEmployeeApi.updateRating(
        id,
        ratingData
      );
      await fetchEmployees(); // Refresh the list
      return updatedEmployee;
    } catch (err) {
      "Error updating employee rating:", err;
      throw err;
    }
  };

  const getRating = async (id) => {
    try {
      return await marketingEmployeeApi.getRating(id);
    } catch (err) {
      "Error getting employee rating:", err;
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
    getRating,
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
      `Fetching marketing projects with pagination - Page: ${pageNum}, Limit: ${pageLimit}`;

      // Fetch paginated data
      const paginatedResponse = await marketingProjectApi.getAllProjects(
        pageNum,
        pageLimit
      );

      "📡 Marketing Projects API Response:", paginatedResponse;

      // Process paginated data for current page
      let projectsData = [];
      let totalCount = 0;

      if (Array.isArray(paginatedResponse)) {
        projectsData = paginatedResponse;
        totalCount = paginatedResponse.length; // Fallback to array length
      } else if (
        paginatedResponse &&
        paginatedResponse.data &&
        Array.isArray(paginatedResponse.data)
      ) {
        projectsData = paginatedResponse.data;
        totalCount = paginatedResponse.total || paginatedResponse.data.length;
      } else if (
        paginatedResponse &&
        paginatedResponse.success &&
        Array.isArray(paginatedResponse.data)
      ) {
        projectsData = paginatedResponse.data;
        totalCount = paginatedResponse.total || paginatedResponse.data.length;
      } else if (paginatedResponse && paginatedResponse.total !== undefined) {
        // Handle response with total count
        projectsData = paginatedResponse.data || [];
        totalCount = paginatedResponse.total;
      }

      // If we don't have a total count from the API, fetch all projects to get the count
      if (totalCount === 0 || totalCount === projectsData.length) {
        ("🔄 No total count from API, fetching all projects for total count...");
        const allProjectsResponse = await marketingProjectApi.getAllProjects(
          1,
          1000
        );

        let allProjectsData = [];
        if (Array.isArray(allProjectsResponse)) {
          allProjectsData = allProjectsResponse;
        } else if (
          allProjectsResponse &&
          allProjectsResponse.data &&
          Array.isArray(allProjectsResponse.data)
        ) {
          allProjectsData = allProjectsResponse.data;
        } else if (
          allProjectsResponse &&
          allProjectsResponse.success &&
          Array.isArray(allProjectsResponse.data)
        ) {
          allProjectsData = allProjectsResponse.data;
        }

        totalCount = allProjectsData.length;
      }

      "📊 Marketing projects total count:", totalCount;
      "📊 Current page marketing projects data:", projectsData;

      setProjects(projectsData);
      setTotalProjects(totalCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      "Error fetching marketing projects:", err;
      setError(err.message || "Network Error");
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
      "Error creating project:", err;
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await marketingProjectApi.updateProject(
        id,
        projectData
      );
      fetchProjects(currentPage, pageSize); // Refresh current page
      return updatedProject;
    } catch (err) {
      "Error updating project:", err;
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await marketingProjectApi.deleteProject(id);
      fetchProjects(currentPage, pageSize); // Refresh current page
    } catch (err) {
      "Error deleting project:", err;
      throw err;
    }
  };

  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalProjects / pageSize);
    `Marketing Projects goToPage: pageNum=${pageNum}, totalProjects=${totalProjects}, pageSize=${pageSize}, maxPages=${maxPages}`;
    if (totalProjects === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      `Marketing Projects goToPage: Fetching page ${pageNum}`;
      fetchProjects(pageNum, pageSize);
    } else {
      `Marketing Projects goToPage: Page ${pageNum} is out of range (1-${maxPages})`;
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

  // Intentionally do not auto-run fetchProjects here to avoid hook dependency complexity.
  // Callers should invoke fetchProjects() explicitly when they need to load projects.

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
    prevPage,
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
      }

      setTickets(ticketsData);
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    const newTicket = await marketingTicketApi.createTicket(ticketData);
    await fetchTickets(); // Refresh the list
    return newTicket;
  };

  const updateTicket = async (id, ticketData) => {
    const updatedTicket = await marketingTicketApi.updateTicket(id, ticketData);
    await fetchTickets(); // Refresh the list
    return updatedTicket;
  };

  const deleteTicket = async (id) => {
    await marketingTicketApi.deleteTicket(id);
    await fetchTickets(); // Refresh the list
  };

  // Disabled automatic API call - only fetch when explicitly requested
  // useEffect(() => {
  //   fetchTickets();
  // }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
};

// Custom hook for Marketing leave data management
export const useMarketingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDepartmentId, setLastDepartmentId] = useState(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // fetchLeaves optionally accepts departmentId to call /DigitalMarketingLeaves/:departmentId
  const fetchLeaves = async (departmentId = null, page = 1, limit = 10, status = null, search = null) => {
    setLoading(true);
    setError(null);
    setLastDepartmentId(departmentId);
    try {
      const response = await marketingLeaveApi.getEmployeeLeaves(
        departmentId,
        page,
        limit,
        status,
        search
      );

      // Debug raw response to help trace Postman vs frontend differences
      console.debug("MarketingLeaves raw response:", response);

      // Normalize a variety of response shapes into an array of leaves
      let leavesData = [];
      let respTotal = 0;
      let respPage = page;
      let respTotalPages = 1;

      // If API returned an array directly
      if (Array.isArray(response)) {
        leavesData = response;
        respTotal = response.length;
        respPage = page;
        respTotalPages = Math.max(1, Math.ceil(respTotal / limit));
      } else if (response && Array.isArray(response.data)) {
        // Response like { data: [...], total, page, totalPages }
        leavesData = response.data;
        respTotal =
          response.total !== undefined ? response.total : leavesData.length;
        respPage = response.page !== undefined ? response.page : page;
        respTotalPages =
          response.totalPages !== undefined
            ? response.totalPages
            : Math.max(1, Math.ceil(respTotal / limit));
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        // Nested shape: { data: { data: [...] , total, page, totalPages } }
        leavesData = response.data.data;
        respTotal =
          response.data.total !== undefined
            ? response.data.total
            : leavesData.length;
        respPage = response.data.page !== undefined ? response.data.page : page;
        respTotalPages =
          response.data.totalPages !== undefined
            ? response.data.totalPages
            : Math.max(1, Math.ceil(respTotal / limit));
      } else if (response && Array.isArray(response.leaves)) {
        // Response like { leaves: [...], total, page }
        leavesData = response.leaves;
        respTotal =
          response.total !== undefined ? response.total : leavesData.length;
        respPage = response.page !== undefined ? response.page : page;
        respTotalPages =
          response.totalPages !== undefined
            ? response.totalPages
            : Math.max(1, Math.ceil(respTotal / limit));
      }

      setLeaves(leavesData);

      // Optimization: when using a large limit (client-side mode), skip multi-page accumulation
      if (limit >= 1000) {
        respTotal = leavesData.length;
        respPage = 1;
        respTotalPages = 1;
      } else {
        // If the API didn't provide a meaningful total, attempt lightweight accumulation
        if (
          (respTotal === 0 || respTotal === leavesData.length) &&
          leavesData.length > 0 &&
          limit > 0
        ) {
          const maxPagesFetch = 5; // keep this low to avoid long loading times
          try {
            let accumulated = leavesData.length;
            for (let p = 2; p <= maxPagesFetch; p++) {
              try {
                const pageResp = await marketingLeaveApi.getEmployeeLeaves(
                  departmentId,
                  p,
                  limit,
                  status,
                  search
                );
                let pageItems = 0;
                if (Array.isArray(pageResp)) pageItems = pageResp.length;
                else if (pageResp && Array.isArray(pageResp.data)) pageItems = pageResp.data.length;
                else if (pageResp && Array.isArray(pageResp.leaves)) pageItems = pageResp.leaves.length;

                if (pageItems === 0) break;
                accumulated += pageItems;
                if (pageItems < limit) break;
              } catch {
                break;
              }
            }
            if (accumulated > 0) {
              respTotal = accumulated;
              respTotalPages = Math.max(1, Math.ceil(respTotal / limit));
            }
          } catch {
            // silent
          }
        }
      }

      setTotalLeaves(respTotal);
      setCurrentPage(respPage);
      setTotalPages(respTotalPages);
    } catch (err) {
      // Keep a console error for diagnostics
      console.error("Marketing Leaves API Error:", err);

      const msg = err?.message || "Failed to load leaves";

      // Suppress generic backend errors so the UI shows the empty state like other departments.
      // Examples to suppress: 'API endpoint not found', 'Page not found', 'internal server error', generic 'API Error'.
      const suppress =
        (typeof msg === "string" &&
          (msg.includes("API endpoint not found") ||
            msg.includes("Page not found") ||
            msg.toLowerCase().includes("internal server error") ||
            msg.includes("API Error") ||
            msg.includes("Network Error"))) ||
        false;

      setError(suppress ? null : msg);
      setLeaves([]);
      setTotalLeaves(0);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async (leaveData) => {
    const newLeave = await marketingLeaveApi.submitEmployeeLeave(leaveData);
    await fetchLeaves(lastDepartmentId); // Refresh the list for the current department
    return newLeave;
  };

  const updateLeaveStatus = async (id, leaveData) => {
    const updatedLeave = await marketingLeaveApi.updateLeaveStatus(
      id,
      leaveData
    );
    await fetchLeaves(lastDepartmentId); // Refresh the list for the current department
    return updatedLeave;
  };

  const deleteLeave = async (id) => {
    await marketingLeaveApi.deleteLeave(id);
    await fetchLeaves(lastDepartmentId); // Refresh the list for the current department
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
    deleteLeave,
    totalLeaves,
    currentPage,
    totalPages,
  };
};
