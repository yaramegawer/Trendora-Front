import { useState, useEffect } from "react";
import {
  operationEmployeeApi,
  operationCampaignApi,
  operationLeaveApi,
  operationTicketApi,
} from "../services/operationApi";

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
        // Show user-friendly message instead of technical error
        setError("We couldn't load employees right now. Please try again later.");
      }
    } catch (err) {
      // Show user-friendly message instead of technical error
      setError("We couldn't load employees right now. Please try again later.");
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
      "Raw API response:", response;

      // Check for success in different possible formats
      if (
        response.success ||
        (response.message &&
          response.message.toLowerCase().includes("success")) ||
        (response.status && response.status === "success")
      ) {
        fetchEmployees(); // Refresh data
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      } else {
        return { success: false, message: response.message || "Unknown error" };
      }
    } catch (err) {
      "Error in updateEmployeeRating:", err;
      return {
        success: false,
        message: err.message || "Failed to update rating",
      };
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
      return { success: false, message: err.message || "Failed to get rating" };
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    updateEmployeeRating,
    getEmployeeRating,
  };
};

// Custom hook for Operation campaign data management
export const useOperationCampaigns = (
  page = 1,
  limit = 10,
  statusFilter = "all"
) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [status, setStatus] = useState(statusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCampaigns, setAllCampaigns] = useState([]); // Store all campaigns for search

  const fetchCampaigns = async (
    pageNum = currentPage,
    pageLimit = pageSize,
    statusVal = status,
    search = searchTerm
  ) => {
    try {
      setLoading(true);
      setError(null);
      `Fetching campaigns with pagination - Page: ${pageNum}, Limit: ${pageLimit}, Status: ${statusVal}, Search: ${search}`;

      // If searching, fetch all campaigns at once (use high limit)
      const effectiveLimit = search ? 1000 : pageLimit;
      const effectivePage = search ? 1 : pageNum;

      // Fetch paginated data with status filter
      const response = await operationCampaignApi.getAllCampaigns(
        effectivePage,
        effectiveLimit,
        statusVal
      );

      "📡 Operation Campaigns API Response:", response;

      // Handle backend pagination response format
      let campaignsData = [];
      let totalCount = 0;
      let pageNumber = pageNum;
      let totalPagesCount = 1;

      if (response && response.success) {
        // Backend returns: { success: true, data: [...], total, page, limit, totalPages }
        campaignsData = response.data || [];
        totalCount = response.total || 0;
        pageNumber = response.page || pageNum;
        totalPagesCount = response.totalPages || 1;
      } else if (Array.isArray(response)) {
        // Fallback for array response
        campaignsData = response;
        totalCount = response.length;
      } else if (response && response.data && Array.isArray(response.data)) {
        campaignsData = response.data;
        totalCount = response.total || response.data.length;
      }

      "📊 Campaigns total count:", totalCount;
      "📊 Current page campaigns data:", campaignsData;
      "📊 Total pages:", totalPagesCount;

      // If searching, store all campaigns and filter client-side
      if (search) {
        setAllCampaigns(campaignsData);
        const filtered = campaignsData.filter((campaign) => {
          const matchesSearch =
            search === "" ||
            (campaign.name &&
              campaign.name.toLowerCase().includes(search.toLowerCase())) ||
            (campaign.description &&
              campaign.description
                .toLowerCase()
                .includes(search.toLowerCase())) ||
            (campaign.customerName &&
              campaign.customerName
                .toLowerCase()
                .includes(search.toLowerCase()));
          return matchesSearch;
        });
        "🔍 Filtered campaigns:",
          filtered.length,
          "out of",
          campaignsData.length;
        setCampaigns(filtered);
        setTotalCampaigns(filtered.length);
        setCurrentPage(1);
      } else {
        setCampaigns(campaignsData);
        setTotalCampaigns(totalCount);
        setCurrentPage(pageNumber);
      }

      setPageSize(pageLimit);
      setStatus(statusVal);
      setSearchTerm(search);
    } catch (err) {
      "Error fetching campaigns:", err;
      setError(err.message || "Network Error");
      setCampaigns([]);
      setTotalCampaigns(0);
    } finally {
      setLoading(false);
    }
  };

  // Do not auto-fetch on mount; let the UI trigger fetch when Campaigns tab opens

  const createCampaign = async (campaignData) => {
    try {
      const response = await operationCampaignApi.createCampaign(campaignData);
      if (response.success) {
        fetchCampaigns(currentPage, pageSize, status, searchTerm); // Refresh current page with current status and search
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to create campaign",
      };
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await operationCampaignApi.updateCampaign(
        id,
        campaignData
      );
      if (response.success) {
        fetchCampaigns(currentPage, pageSize, status, searchTerm); // Refresh current page with current status and search
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to update campaign",
      };
    }
  };

  const deleteCampaign = async (id) => {
    try {
      const response = await operationCampaignApi.deleteCampaign(id);
      if (response.success) {
        fetchCampaigns(currentPage, pageSize, status, searchTerm); // Refresh current page with current status and search
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to delete campaign",
      };
    }
  };

  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalCampaigns / pageSize);
    `Operation Campaigns goToPage: pageNum=${pageNum}, totalCampaigns=${totalCampaigns}, pageSize=${pageSize}, maxPages=${maxPages}`;
    if (totalCampaigns === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      `Operation Campaigns goToPage: Fetching page ${pageNum}`;
      fetchCampaigns(pageNum, pageSize, status, searchTerm);
    } else {
      `Operation Campaigns goToPage: Page ${pageNum} is out of range (1-${maxPages})`;
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchCampaigns(1, newPageSize, status, searchTerm);
  };

  const changeStatus = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1); // Reset to first page when changing status
    setSearchTerm(""); // Clear search when changing status
    fetchCampaigns(1, pageSize, newStatus, "");
  };

  const changeSearchTerm = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
    fetchCampaigns(1, pageSize, status, newSearchTerm);
  };

  const nextPage = () => {
    const maxPages = Math.ceil(totalCampaigns / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    campaigns,
    loading,
    error,
    totalCampaigns,
    currentPage,
    status,
    searchTerm,
    totalPages: searchTerm ? 1 : Math.ceil(totalCampaigns / pageSize), // Single page when searching
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    goToPage,
    changePageSize,
    changeStatus,
    changeSearchTerm,
    nextPage,
    prevPage,
  };
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
      const response = await operationLeaveApi.getEmployeeLeaves();

      // Handle different response formats
      let leavesData = [];
      let userDepartment = null;

      if (Array.isArray(response)) {
        leavesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        leavesData = response.data;
        userDepartment = response.department;
        "🏢 User department from response:", userDepartment;
      } else if (response && response.success && Array.isArray(response.data)) {
        leavesData = response.data;
        userDepartment = response.department;
        "🏢 User department from response:", userDepartment;
      }

      // Only show leaves if user is in Operation department
      if (userDepartment) {
        const departmentLower = userDepartment.toLowerCase();
        "🔍 Operation Department: Checking department:",
          userDepartment,
          "->",
          departmentLower;

        // Check for various Operation department name variations - be more specific
        const isOperationDepartment =
          departmentLower === "operation" ||
          departmentLower === "operations" ||
          departmentLower === "operations department" ||
          departmentLower === "operation department" ||
          (departmentLower.includes("operation") &&
            !departmentLower.includes("it"));

        if (!isOperationDepartment) {
          ("🚫 Operation Department: User is not in Operation department, not showing leaves");
          "🚫 Operation Department: User department:",
            userDepartment,
            "Expected: Operation or Operations";
          setLeaves([]);
        } else {
          ("✅ Operation Department: User is in Operation department, showing leaves");
          "📊 Operation Department: Processed employee leaves data:",
            leavesData;
          "📊 Operation Department: Number of leaves found:", leavesData.length;
          setLeaves(leavesData);
        }
      } else {
        ("⚠️ Operation Department: No department info in response, not showing leaves");
        setLeaves([]);
      }
    } catch (err) {
      "Operation Employee Leaves API Error, using empty array:", err.message;
      setError(err.message || "Network Error");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // Do not auto-fetch on mount to avoid unnecessary API calls

  const addLeave = async (leaveData) => {
    try {
      "Adding Operation employee leave:", leaveData;
      const response = await operationLeaveApi.submitEmployeeLeave(leaveData);
      "Operation employee leave add response:", response;

      // Refresh leaves data
      await fetchLeaves();
      return { success: true, data: response.data || response };
    } catch (err) {
      "Error adding Operation employee leave:", err;
      throw err;
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
      return {
        success: false,
        message: err.message || "Failed to update leave",
      };
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
      return {
        success: false,
        message: err.message || "Failed to delete leave",
      };
    }
  };

  return {
    leaves,
    loading,
    error,
    fetchLeaves,
    addLeave,
    updateLeaveStatus,
    deleteLeave,
  };
};

// Paginated Operation department leaves (mirrors IT leaves behavior)
// export const useOperationDepartmentLeaves = (page = 1, limit = 10) => {
//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalLeaves, setTotalLeaves] = useState(0);
//   const [currentPage, setCurrentPage] = useState(page);
//   const [pageSize, setPageSize] = useState(limit);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchLeaves = async (pageNum = currentPage, pageLimit = pageSize) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Use provided Operation department ObjectId
//       const response = await operationLeaveApi.getDepartmentLeaves(
//         "68da378594328b3a175633b3",
//         pageNum,
//         pageLimit
//       );

//       let leavesData = [];
//       let totalCount = 0;
//       let currentPageNum = pageNum;
//       let totalPagesNum = 1;

//       if (response && response.leaves && Array.isArray(response.leaves)) {
//         leavesData = response.leaves;
//         totalCount = response.count || response.leaves.length;
//         currentPageNum = response.page || pageNum;
//         totalPagesNum =
//           response.totalPages || Math.ceil(totalCount / pageLimit);
//       } else if (response && response.data && Array.isArray(response.data)) {
//         leavesData = response.data;
//         totalCount = response.total || response.data.length;
//         currentPageNum = response.page || pageNum;
//         totalPagesNum =
//           response.totalPages || Math.ceil(totalCount / pageLimit);
//       } else if (Array.isArray(response)) {
//         leavesData = response;
//         totalCount = response.length;
//         totalPagesNum = Math.ceil(totalCount / pageLimit);
//       }

//       setLeaves(leavesData);
//       setTotalLeaves(totalCount);
//       setCurrentPage(currentPageNum);
//       setPageSize(pageLimit);
//       setTotalPages(totalPagesNum);
//     } catch (err) {
//       if (err.message && !err.message.includes("API Error")) {
//         setError(err.message);
//       } else {
//         setError(null);
//       }
//       setLeaves([]);
//       setTotalLeaves(0);
//       setTotalPages(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateLeaveStatus = async (id, leaveData) => {
//     try {
//       const updatedLeave = await operationLeaveApi.updateLeaveStatus(
//         id,
//         leaveData
//       );
//       await fetchLeaves(currentPage, pageSize);
//       return updatedLeave;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const deleteLeave = async (id) => {
//     try {
//       await operationLeaveApi.deleteLeave(id);
//       await fetchLeaves(currentPage, pageSize);
//     } catch (err) {
//       throw err;
//     }
//   };

//   const goToPage = (pageNum) => {
//     if (totalLeaves === 0 || (pageNum >= 1 && pageNum <= totalPages)) {
//       fetchLeaves(pageNum, pageSize);
//     }
//   };

//   const changePageSize = (newPageSize) => {
//     setPageSize(newPageSize);
//     fetchLeaves(1, newPageSize);
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       goToPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       goToPage(currentPage - 1);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves(currentPage, pageSize);
//   }, []);

//   return {
//     leaves,
//     loading,
//     error,
//     totalLeaves,
//     currentPage,
//     pageSize,
//     totalPages,
//     fetchLeaves,
//     updateLeaveStatus,
//     deleteLeave,
//     goToPage,
//     changePageSize,
//     nextPage,
//     prevPage,
//   };
// };

// ...existing code...
export const useOperationDepartmentLeaves = (page = 1, limit = 10) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentContext, setDepartmentContext] = useState(null);

  const fetchLeaves = async (
    pageParam = currentPage,
    limitParam = pageSize,
    statusParam = status,
    searchParam = searchTerm
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Avoid department endpoint (causes 404); fetch all leaves directly
      const response = await operationLeaveApi.getAllLeaves();
      let leavesData = [];
      let totalCount = 0;
      let respPage = pageParam;
      let totalPagesCount = 1;

      // Various backend shapes
      if (Array.isArray(response)) {
        // Backend returned only the current page items without totals
        leavesData = response;
        // Infer a lower-bound total count based on current page and limit
        totalCount = Math.max(
          Math.max((pageParam || 1) - 1, 0) * (limitParam || 10) +
            (response.length || 0),
          response.length || 0
        );
        respPage = pageParam;
        // If the page is full, assume at least one more page exists; else current page is the last
        totalPagesCount =
          response.length < (limitParam || 10)
            ? Math.max(1, pageParam)
            : Math.max(2, (pageParam || 1) + 0); // show at least current page and enable Next if full
      } else if (response && Array.isArray(response.data)) {
        leavesData = response.data;
        if (response.department) setDepartmentContext(response.department);
        totalCount =
          response.total || response.totalCount || response.data.length;
        respPage = response.page || respPage;
        totalPagesCount =
          response.totalPages ||
          Math.max(1, Math.ceil(totalCount / limitParam));
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        // Nested: { success, data: { data: [...], total, page, totalPages } }
        leavesData = response.data.data;
        if (response.data.department)
          setDepartmentContext(response.data.department);
        totalCount =
          response.data.total !== undefined
            ? response.data.total
            : leavesData.length;
        respPage =
          response.data.page !== undefined ? response.data.page : respPage;
        totalPagesCount =
          response.data.totalPages !== undefined
            ? response.data.totalPages
            : Math.max(1, Math.ceil(totalCount / limitParam));
      } else if (response && Array.isArray(response.leaves)) {
        leavesData = response.leaves;
        if (response.department) setDepartmentContext(response.department);
        totalCount = response.count || response.total || response.leaves.length;
        respPage = response.page || respPage;
        totalPagesCount =
          response.totalPages ||
          Math.max(1, Math.ceil(totalCount / limitParam));
      }
      // Normalize totals simply.
      if (limitParam >= 1000) {
        // Single large fetch, no further paging
        totalPagesCount = 1;
        respPage = 1;
        totalCount = Array.isArray(leavesData)
          ? leavesData.length
          : totalCount || 0;
      } else {
        totalPagesCount = Math.max(
          1,
          Math.ceil(
            (totalCount || leavesData?.length || 0) / (limitParam || 10)
          )
        );
      }

      if (limitParam >= 1000) {
        // Do not probe more pages to avoid server 500s on page>1
        const allLeaves = [...leavesData];
        setLeaves(allLeaves);
        setTotalLeaves(totalCount || allLeaves.length);
        setCurrentPage(1);
        setPageSize(limitParam);
        setTotalPages(1);
        setStatus(statusParam);
        setSearchTerm(searchParam);
      } else {
        setLeaves(leavesData);
        setTotalLeaves(totalCount);
        setCurrentPage(respPage);
        setPageSize(limitParam);
        setTotalPages(totalPagesCount);
        setStatus(statusParam);
        setSearchTerm(searchParam);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 500) {
        // Treat as empty without surfacing error
        console.log("Operation Employee Leaves API Error (suppressed):", status);
        setError("");
      } else {
        console.log("Operation Employee Leaves API Error:", err?.message || err);
        setError(err?.message || "Network Error");
      }
      setLeaves([]);
      setTotalLeaves(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves(currentPage, pageSize, status, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLeave = async (leaveData) => {
    try {
      const response = await operationLeaveApi.submitEmployeeLeave(leaveData);
      await fetchLeaves(currentPage, pageSize);
      return { success: true, data: response.data || response };
    } catch (err) {
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      const response = await operationLeaveApi.updateLeaveStatus(id, leaveData);
      await fetchLeaves(currentPage, pageSize);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err?.message || "Failed to update leave",
      };
    }
  };

  const deleteLeave = async (id) => {
    try {
      const response = await operationLeaveApi.deleteLeave(id);
      await fetchLeaves(currentPage, pageSize);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err?.message || "Failed to delete leave",
      };
    }
  };

  const goToPage = (pageNum) => {
    const maxPages = Math.max(1, Math.ceil(totalLeaves / pageSize));
    if (totalLeaves === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      fetchLeaves(pageNum, pageSize, status, searchTerm);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchLeaves(1, newPageSize, status, searchTerm);
  };

  const nextPage = () => {
    const maxPages = Math.max(1, Math.ceil(totalLeaves / pageSize));
    if (currentPage < maxPages) goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const changeStatus = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
    fetchLeaves(1, pageSize, newStatus, "");
  };

  const changeSearchTerm = (newSearch) => {
    setSearchTerm(newSearch);
    setCurrentPage(1);
    fetchLeaves(1, pageSize, status, newSearch);
  };

  return {
    leaves,
    loading,
    error,
    totalLeaves,
    currentPage,
    pageSize,
    totalPages,
    departmentContext,
    status,
    searchTerm,
    fetchLeaves,
    addLeave,
    updateLeaveStatus,
    deleteLeave,
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    changeStatus,
    changeSearchTerm,
  };
};

// ...existing code...

// Custom hook for Operation ticket data management
export const useOperationTickets = () => {
  const [tickets, setTickets] = useState([]);
  // ...existing code...
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Tickets fetching removed - return empty array
      const ticketsData = [];
      setTickets(ticketsData);
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const addTicket = async (ticketData) => {
    try {
      "Adding operation ticket:", ticketData;
      const response = await operationTicketApi.addTicket(ticketData);
      "Operation ticket add response:", response;

      // Refresh tickets data
      await fetchTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      throw err;
    }
  };

  // updateTicket and deleteTicket functions removed

  // Disabled automatic API call - only fetch when explicitly requested
  // useEffect(() => {
  //   fetchTickets();
  // }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    addTicket,
  };
};

// Custom hook for Operation recent activities
export const useOperationRecentActivities = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecentActivities = (employees, campaigns, leaves, tickets) => {
    const activities = [];
    const now = new Date();

    // Add recent campaign activities
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      const recentCampaigns = campaigns
        .filter((campaign) => campaign.createdAt || campaign.created_at)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at) -
            new Date(a.createdAt || a.created_at)
        )
        .slice(0, 2);

      recentCampaigns.forEach((campaign) => {
        const campaignName =
          campaign.name ||
          campaign.title ||
          campaign.campaignName ||
          "Untitled Campaign";
        const createdAt = campaign.createdAt || campaign.created_at;
        const timeAgo = createdAt
          ? getTimeAgo(new Date(createdAt))
          : "recently";

        activities.push({
          type: "campaign",
          message: `New campaign created: ${campaignName}`,
          color: "#10b981",
          icon: "CheckCircle",
          timestamp: createdAt,
          timeAgo: timeAgo,
        });
      });

      // Add completed campaigns
      const completedCampaigns = campaigns
        .filter(
          (campaign) =>
            (campaign.status === "completed" ||
              campaign.status === "done" ||
              campaign.status === "finished") &&
            (campaign.updatedAt || campaign.updated_at)
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.updated_at) -
            new Date(a.updatedAt || a.updated_at)
        )
        .slice(0, 1);

      completedCampaigns.forEach((campaign) => {
        const campaignName =
          campaign.name ||
          campaign.title ||
          campaign.campaignName ||
          "Campaign Task";
        const updatedAt = campaign.updatedAt || campaign.updated_at;
        const timeAgo = updatedAt
          ? getTimeAgo(new Date(updatedAt))
          : "recently";

        activities.push({
          type: "task",
          message: `Task completed: ${campaignName}`,
          color: "#f59e0b",
          icon: "Calendar",
          timestamp: updatedAt,
          timeAgo: timeAgo,
        });
      });
    }

    // Add recent employee rating activities
    if (Array.isArray(employees) && employees.length > 0) {
      const recentEmployees = employees
        .filter((employee) => employee.updatedAt || employee.updated_at)
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.updated_at) -
            new Date(a.updatedAt || a.updated_at)
        )
        .slice(0, 1);

      recentEmployees.forEach((employee) => {
        const employeeName =
          employee.firstName && employee.lastName
            ? `${employee.firstName} ${employee.lastName}`
            : employee.name ||
              employee.firstName ||
              employee.lastName ||
              "Employee";
        const updatedAt = employee.updatedAt || employee.updated_at;
        const timeAgo = updatedAt
          ? getTimeAgo(new Date(updatedAt))
          : "recently";

        activities.push({
          type: "employee",
          message: `Employee rating updated: ${employeeName}`,
          color: "#3b82f6",
          icon: "Users",
          timestamp: updatedAt,
          timeAgo: timeAgo,
        });
      });
    }

    // Add recent leave activities
    if (Array.isArray(leaves) && leaves.length > 0) {
      const recentLeaves = leaves
        .filter((leave) => leave.createdAt || leave.created_at)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at) -
            new Date(a.createdAt || a.created_at)
        )
        .slice(0, 1);

      recentLeaves.forEach((leave) => {
        const employeeName =
          leave.employeeName || leave.employee?.name || "Employee";
        const createdAt = leave.createdAt || leave.created_at;
        const timeAgo = createdAt
          ? getTimeAgo(new Date(createdAt))
          : "recently";

        activities.push({
          type: "leave",
          message: `Leave request submitted: ${employeeName}`,
          color: "#8b5cf6",
          icon: "Calendar",
          timestamp: createdAt,
          timeAgo: timeAgo,
        });
      });
    }

    // Add recent ticket activities
    if (Array.isArray(tickets) && tickets.length > 0) {
      const recentTickets = tickets
        .filter((ticket) => ticket.createdAt || ticket.created_at)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at) -
            new Date(a.createdAt || a.created_at)
        )
        .slice(0, 1);

      recentTickets.forEach((ticket) => {
        const ticketTitle = ticket.title || ticket.subject || "Support Ticket";
        const createdAt = ticket.createdAt || ticket.created_at;
        const timeAgo = createdAt
          ? getTimeAgo(new Date(createdAt))
          : "recently";

        activities.push({
          type: "ticket",
          message: `New support ticket: ${ticketTitle}`,
          color: "#ef4444",
          icon: "AlertCircle",
          timestamp: createdAt,
          timeAgo: timeAgo,
        });
      });
    }

    // Sort all activities by timestamp (most recent first) and limit to 6
    return activities
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 6);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const fetchRecentActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all operation data in parallel (tickets removed)
      const [employeesResponse] = await Promise.all([
        operationEmployeeApi.getAllEmployees().catch(() => ({ data: [] })),
      ]);

      // Extract data from responses
      const employees = Array.isArray(employeesResponse)
        ? employeesResponse
        : employeesResponse?.data || employeesResponse?.success
        ? employeesResponse.data
        : [];

      const campaigns = [];

      const leaves = [];

      // Generate recent activities from the data (tickets removed)
      const activities = generateRecentActivities(
        employees,
        campaigns,
        leaves,
        []
      );
      setRecentActivities(activities);

      "Generated recent activities:", activities;
    } catch (err) {
      "Error fetching operation recent activities:", err;
      setError(err.message || "Failed to fetch recent activities");
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  return {
    recentActivities,
    loading,
    error,
    fetchRecentActivities,
  };
};
