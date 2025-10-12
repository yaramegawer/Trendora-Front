import { useState, useEffect } from 'react';
import { employeeApi, departmentApi, leaveApi, payrollApi } from '../services/hrApi';

// Custom hook for employee data  
export const useEmployees = (page = 1, limit = 10, statusFilter = 'all') => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);

  const fetchEmployees = async (pageNum = currentPage, pageLimit = pageSize, status = currentStatusFilter) => {
    try {
      setLoading(true);
      setError(null);
('🔍 useEmployees: Fetching ALL employees for client-side filtering');
      
      // Get ALL employees from backend (client-side pagination like accounting)
      const data = await employeeApi.getAllEmployees(1, 1000);
('🔍 useEmployees: API response:', data);
      
      // Handle response structure - get ALL employees
      let allEmployees = [];
      
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          allEmployees = data.data;
        } else if (Array.isArray(data)) {
          allEmployees = data;
        }
      }
      
('🔍 useEmployees: Total employees fetched:', allEmployees.length);
      setTotalEmployees(allEmployees.length);
      setEmployees(allEmployees); // Store ALL for client-side filtering
      
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      setCurrentStatusFilter(status);
('🔍 useEmployees: Final state - storing all employees for client-side filtering');
    } catch (err) {
('Error fetching employees:', err);
      // Silently handle 404 errors (no data found) - this is not a real error
      if (err.message && err.message.includes('No employees found')) {
        setEmployees([]);
        setTotalEmployees(0);
        setError(null); // Don't show error for empty results
      } else {
        setError(err.message || 'Failed to fetch employees');
        setEmployees([]);
        setTotalEmployees(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
('Hook: Adding employee with data:', employeeData);
      const newEmployee = await employeeApi.addEmployee(employeeData);
('Hook: Add successful, refreshing data...');
      // Refresh the entire employee list to ensure we have the latest data
      await fetchEmployees();
('Hook: Data refresh completed');
      return newEmployee;
    } catch (err) {
('Hook: Add employee error:', err);
      
      // Don't set error state for duplicate email errors - they should only show as alerts
      const errorMessage = err.message || '';
      if (!errorMessage.includes('Can\'t add this email because it already exists') && 
          !errorMessage.includes('already exists') && 
          !errorMessage.includes('duplicate') && 
          !errorMessage.includes('E11000')) {
        setError(err.message || 'Failed to add employee');
      }
      
      throw err;
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
('Hook: Updating employee with ID:', id);
      const updatedEmployee = await employeeApi.updateEmployee(id, employeeData);
('Hook: Update successful, refreshing employees data...');
      // Refresh the entire employee list to ensure we have the latest data
      await fetchEmployees();
('Hook: Employee data refresh completed');
      return updatedEmployee;
    } catch (err) {
('Hook: Update employee error:', err);
      
      // Don't set error state for duplicate email errors - they should only show as alerts
      const errorMessage = err.message || '';
      if (!errorMessage.includes('Can\'t update this email because it already exists') && 
          !errorMessage.includes('already exists') && 
          !errorMessage.includes('duplicate') && 
          !errorMessage.includes('E11000')) {
        setError(err.message || 'Failed to update employee');
      }
      
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await employeeApi.deleteEmployee(id);
      // Refresh the entire employee list to ensure we have the latest data
      await fetchEmployees();
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
('🔍 goToPage called with:', pageNum);
    const maxPages = Math.ceil(totalEmployees / pageSize) || 1; // At least 1 page
('🔍 Max pages:', maxPages, 'Total employees:', totalEmployees, 'Page size:', pageSize);
    
    // Ensure pageNum is valid
    if (totalEmployees === 0) {
      // No data, stay on page 1
      fetchEmployees(1, pageSize, currentStatusFilter);
    } else if (pageNum >= 1 && pageNum <= maxPages) {
      fetchEmployees(pageNum, pageSize, currentStatusFilter);
    } else {
      // Invalid page number, go to closest valid page
      const validPage = pageNum < 1 ? 1 : maxPages;
      fetchEmployees(validPage, pageSize, currentStatusFilter);
    }
  };

  const changePageSize = (newPageSize) => {
('🔍 changePageSize called with:', newPageSize);
    setPageSize(newPageSize);
    fetchEmployees(1, newPageSize, currentStatusFilter); // Reset to first page when changing page size
  };

  const changeStatusFilter = (newStatus) => {
('🔍 changeStatusFilter called with:', newStatus);
    setCurrentStatusFilter(newStatus);
    fetchEmployees(1, pageSize, newStatus); // Reset to first page when changing filter
  };

  const nextPage = () => {
('🔍 nextPage called, current page:', currentPage);
    const maxPages = Math.ceil(totalEmployees / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
('🔍 prevPage called, current page:', currentPage);
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    employees,
    loading,
    error,
    totalEmployees,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalEmployees / pageSize),
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
    goToPage,
    changePageSize,
    changeStatusFilter,
    nextPage,
    prevPage
  };
};

// Custom hook for department data
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
('🕐 Fetching departments at:', new Date().toISOString());
      const data = await departmentApi.getAllDepartments();
('🕐 Departments data received at:', new Date().toISOString());
('🕐 Departments data:', data);
('🕐 Number of departments:', data ? data.length : 'null');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
('❌ Error fetching departments:', err);
      setError(err.message || 'Failed to fetch departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (departmentData) => {
    try {
('Hook: Adding department with data:', departmentData);
      const newDepartment = await departmentApi.addDepartment(departmentData);
('Hook: Add successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
('Hook: Department data refresh completed');
      return newDepartment;
    } catch (err) {
('Hook: Add department error:', err);
      setError(err.message || 'Failed to add department');
      throw err;
    }
  };

  const updateDepartment = async (id, departmentData) => {
    try {
('Hook: Updating department with ID:', id);
      const updatedDepartment = await departmentApi.updateDepartment(id, departmentData);
('Hook: Update successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
('Hook: Department data refresh completed');
      return updatedDepartment;
    } catch (err) {
('Hook: Update department error:', err);
      setError(err.message || 'Failed to update department');
      throw err;
    }
  };

  const deleteDepartment = async (id) => {
    try {
('Hook: Deleting department with ID:', id);
      await departmentApi.deleteDepartment(id);
('Hook: Delete successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
('Hook: Department data refresh completed');
    } catch (err) {
('Hook: Delete department error:', err);
      setError(err.message || 'Failed to delete department');
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments
  };
};

// Custom hook for leave data
export const useLeaves = (page = 1, limit = 10, statusFilter = 'all') => {
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]); // Store all leaves for search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchLeaves = async (pageNum = currentPage, pageLimit = pageSize, status = currentStatusFilter) => {
    try {
      setLoading(true);
      setError(null);
('🔍 useLeaves: Fetching leaves with backend pagination');
      
      // Get leaves from backend with pagination and status filter
      const data = await leaveApi.getAllLeaves(pageNum, pageLimit, status);
('🔍 useLeaves: API response:', data);
      
      // Handle response structure
      let leavesData = [];
      let total = 0;
      
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          leavesData = data.data;
          total = data.total || data.totalLeaves || leavesData.length;
        } else if (Array.isArray(data)) {
          leavesData = data;
          total = leavesData.length;
        }
      }
      
('🔍 useLeaves: Total leaves:', total);
      setTotalLeaves(total);
      setLeaves(leavesData);
      
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      setCurrentStatusFilter(status);
('🔍 useLeaves: Final state - totalLeaves:', total);
    } catch (err) {
('Error fetching leaves:', err);
      // Silently handle 404 errors (no data found) - this is not a real error
      if (err.message && err.message.includes('No leaves found')) {
        setLeaves([]);
        setTotalLeaves(0);
        setError(null); // Don't show error for empty results
      } else {
        setError(err.message || 'Failed to fetch leaves');
        setLeaves([]);
        setTotalLeaves(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaves = async (status = currentStatusFilter) => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);
('🔍 useLeaves: Fetching ALL leaves for search');
      
      // Get all leaves from backend
      const data = await leaveApi.getAllLeavesNoPagination(status);
      
      // Handle response structure
      let leavesData = [];
      
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          leavesData = data.data;
        } else if (Array.isArray(data)) {
          leavesData = data;
        }
      }
      
('🔍 useLeaves: All leaves fetched:', leavesData.length);
      setAllLeaves(leavesData);
      setCurrentStatusFilter(status);
    } catch (err) {
('Error fetching all leaves:', err);
      if (err.message && err.message.includes('No leaves found')) {
        setAllLeaves([]);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch leaves');
        setAllLeaves([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addLeave = async (leaveData) => {
    try {
('Hook: Adding leave with data:', leaveData);
      const newLeave = await leaveApi.addLeave(leaveData);
('Hook: Add successful, refreshing leaves data...');
      // Refresh the data based on current mode
      if (isSearching) {
        await fetchAllLeaves();
      } else {
        await fetchLeaves();
      }
('Hook: Leave data refresh completed');
      return newLeave;
    } catch (err) {
('Hook: Add leave error:', err);
      setError(err.message || 'Failed to add leave');
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
('Hook: Updating leave status with ID:', id);
      const updatedLeave = await leaveApi.updateLeaveStatus(id, leaveData);
('Hook: Update successful, refreshing leaves data...');
      // Refresh the data based on current mode
      if (isSearching) {
        await fetchAllLeaves();
      } else {
        await fetchLeaves();
      }
('Hook: Leave data refresh completed');
      return updatedLeave;
    } catch (err) {
('Hook: Update leave status error:', err);
      // Silently handle 403 errors without showing error message
      if (err.response?.status !== 403) {
        setError(err.message || 'Failed to update leave status');
      }
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
('Hook: Deleting leave with ID:', id);
      await leaveApi.deleteLeave(id);
('Hook: Delete successful, refreshing leaves data...');
      // Refresh the data based on current mode
      if (isSearching) {
        await fetchAllLeaves();
      } else {
        await fetchLeaves();
      }
('Hook: Leave data refresh completed');
    } catch (err) {
('Hook: Delete leave error:', err);
      setError(err.message || 'Failed to delete leave');
      throw err;
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Search function
  const performSearch = async (search) => {
('🔍 performSearch called with:', search);
    setSearchTerm(search);
    setCurrentPage(1);
    
    if (search && search.trim() !== '') {
      // When searching, fetch all leaves
      await fetchAllLeaves(currentStatusFilter);
    } else {
      // When not searching, use normal pagination
      setIsSearching(false);
      await fetchLeaves(1, pageSize, currentStatusFilter);
    }
  };

  // Pagination functions
  const goToPage = (pageNum) => {
('🔍 goToPage called with:', pageNum);
    setCurrentPage(pageNum);
    
    // If we're not searching, fetch from backend
    if (!isSearching) {
      const maxPages = Math.ceil(totalLeaves / pageSize) || 1;
      if (totalLeaves === 0) {
        fetchLeaves(1, pageSize, currentStatusFilter);
      } else if (pageNum >= 1 && pageNum <= maxPages) {
        fetchLeaves(pageNum, pageSize, currentStatusFilter);
      } else {
        const validPage = pageNum < 1 ? 1 : maxPages;
        fetchLeaves(validPage, pageSize, currentStatusFilter);
      }
    }
    // If we're searching, the component will handle client-side pagination
  };

  const changePageSize = (newPageSize) => {
('🔍 changePageSize called with:', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1);
    
    if (!isSearching) {
      fetchLeaves(1, newPageSize, currentStatusFilter);
    }
  };

  const changeStatusFilter = (newStatus) => {
('🔍 changeStatusFilter called with:', newStatus);
    setCurrentStatusFilter(newStatus);
    setCurrentPage(1);
    
    if (isSearching) {
      fetchAllLeaves(newStatus);
    } else {
      fetchLeaves(1, pageSize, newStatus);
    }
  };

  const nextPage = () => {
('🔍 nextPage called, current page:', currentPage);
    const maxPages = Math.ceil(totalLeaves / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
('🔍 prevPage called, current page:', currentPage);
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    leaves,
    allLeaves,
    loading,
    error,
    totalLeaves,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalLeaves / pageSize),
    searchTerm,
    isSearching,
    addLeave,
    updateLeaveStatus,
    deleteLeave,
    refetch: fetchLeaves,
    goToPage,
    changePageSize,
    changeStatusFilter,
    performSearch,
    nextPage,
    prevPage
  };
};

// Custom hook for payroll data
export const usePayroll = (page = 1, limit = 10, statusFilter = 'all') => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);

  const fetchPayroll = async (pageNum = currentPage, pageLimit = pageSize, status = currentStatusFilter) => {
    try {
      setLoading(true);
      setError(null);
('🔍 usePayroll: Fetching payroll with backend pagination');
      
      // Get payroll from backend with pagination and status filter
      const data = await payrollApi.getAllPayroll(pageNum, pageLimit, status);
('🔍 usePayroll: API response:', data);
      
      // Handle response structure
      let payrollData = [];
      let total = 0;
      
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          payrollData = data.data;
          total = data.total || data.totalPayroll || payrollData.length;
        } else if (Array.isArray(data)) {
          payrollData = data;
          total = payrollData.length;
        }
      }
      
('🔍 usePayroll: Total payroll:', total);
      setTotalPayroll(total);
      setPayroll(payrollData);
      
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      setCurrentStatusFilter(status);
('🔍 usePayroll: Final state - totalPayroll:', total);
    } catch (err) {
('Error fetching payroll:', err);
      // Silently handle 404 errors (no data found) - this is not a real error
      if (err.message && err.message.includes('No payrolls found')) {
        setPayroll([]);
        setTotalPayroll(0);
        setError(null); // Don't show error for empty results
      } else {
        setError(err.message || 'Failed to fetch payroll');
        setPayroll([]);
        setTotalPayroll(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePayslip = async (id, payrollData) => {
    try {
('Hook: Generating payslip for employee ID:', id);
('Hook: Payroll data:', payrollData);
      const payslip = await payrollApi.generatePayslip(id, payrollData);
('Hook: Payslip generated successfully');
      // Refresh payroll data after successful generation
      await fetchPayroll();
      return payslip;
    } catch (err) {
('Hook: Generate payslip error:', err);
      setError(err.message || 'Failed to generate payslip');
      throw err;
    }
  };

  const updatePayroll = async (id, payrollData) => {
    try {
('Hook: Updating payroll with ID:', id);
('Hook: Payroll data:', payrollData);
      const updatedPayroll = await payrollApi.updatePayroll(id, payrollData);
('Hook: Payroll updated successfully');
      // Refresh payroll data after successful update
      await fetchPayroll();
      return updatedPayroll;
    } catch (err) {
('Hook: Update payroll error:', err);
      setError(err.message || 'Failed to update payroll');
      throw err;
    }
  };

  const deletePayroll = async (id) => {
    try {
('Hook: Deleting payroll with ID:', id);
      await payrollApi.deletePayroll(id);
('Hook: Payroll deleted successfully');
      // Refresh payroll data after successful deletion
      await fetchPayroll();
    } catch (err) {
('Hook: Delete payroll error:', err);
      setError(err.message || 'Failed to delete payroll');
      throw err;
    }
  };

  const getPayslip = async (id) => {
    try {
('Hook: Getting payslip with ID:', id);
      const payslip = await payrollApi.getPayslip(id);
('Hook: Payslip retrieved successfully');
      return payslip;
    } catch (err) {
('Hook: Get payslip error:', err);
      setError(err.message || 'Failed to fetch payslip');
      throw err;
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalPayroll / pageSize) || 1; // At least 1 page
('🔍 goToPage called with:', pageNum);
('🔍 Max pages:', maxPages, 'Total payroll:', totalPayroll, 'Page size:', pageSize);
    
    // Ensure pageNum is valid
    if (totalPayroll === 0) {
      // No data, stay on page 1
      fetchPayroll(1, pageSize, currentStatusFilter);
    } else if (pageNum >= 1 && pageNum <= maxPages) {
      fetchPayroll(pageNum, pageSize, currentStatusFilter);
    } else {
      // Invalid page number, go to closest valid page
      const validPage = pageNum < 1 ? 1 : maxPages;
      fetchPayroll(validPage, pageSize, currentStatusFilter);
    }
  };

  const changePageSize = (newPageSize) => {
('🔍 changePageSize called with:', newPageSize);
    setPageSize(newPageSize);
    fetchPayroll(1, newPageSize, currentStatusFilter); // Reset to first page when changing page size
  };

  const changeStatusFilter = (newStatus) => {
('🔍 changeStatusFilter called with:', newStatus);
    setCurrentStatusFilter(newStatus);
    fetchPayroll(1, pageSize, newStatus); // Reset to first page when changing filter
  };

  const nextPage = () => {
('🔍 nextPage called, current page:', currentPage);
    const maxPages = Math.ceil(totalPayroll / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
('🔍 prevPage called, current page:', currentPage);
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    payroll,
    loading,
    error,
    totalPayroll,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalPayroll / pageSize),
    generatePayslip,
    updatePayroll,
    deletePayroll,
    getPayslip,
    refetch: fetchPayroll,
    goToPage,
    changePageSize,
    changeStatusFilter,
    nextPage,
    prevPage
  };
};