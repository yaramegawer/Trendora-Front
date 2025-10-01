import { useState, useEffect } from 'react';
import { employeeApi, departmentApi, leaveApi, payrollApi } from '../services/hrApi';

// Custom hook for employee data
export const useEmployees = (page = 1, limit = 10) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchEmployees = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 useEmployees: Fetching all employees for client-side pagination');
      
      // Get all employees at once for client-side pagination
      const data = await employeeApi.getAllEmployees(1, 1000); // Get all employees
      console.log('🔍 useEmployees: API response:', data);
      
      // Handle response structure
      let allEmployees = [];
      if (data && typeof data === 'object' && data.data) {
        allEmployees = Array.isArray(data.data) ? data.data : [];
      } else {
        allEmployees = Array.isArray(data) ? data : [];
      }
      
      console.log('🔍 useEmployees: Total employees fetched:', allEmployees.length);
      setTotalEmployees(allEmployees.length);
      setEmployees(allEmployees); // Store all employees for client-side pagination
      
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      console.log('🔍 useEmployees: Final state - totalEmployees:', allEmployees.length);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to fetch employees');
      setEmployees([]);
      setTotalEmployees(0);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      console.log('Hook: Adding employee with data:', employeeData);
      const newEmployee = await employeeApi.addEmployee(employeeData);
      console.log('Hook: Add successful, refreshing data...');
      // Refresh the entire employee list to ensure we have the latest data
      await fetchEmployees();
      console.log('Hook: Data refresh completed');
      return newEmployee;
    } catch (err) {
      console.error('Hook: Add employee error:', err);
      
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
      console.log('Hook: Updating employee with ID:', id);
      const updatedEmployee = await employeeApi.updateEmployee(id, employeeData);
      console.log('Hook: Update successful, refreshing employees data...');
      // Refresh the entire employee list to ensure we have the latest data
      await fetchEmployees();
      console.log('Hook: Employee data refresh completed');
      return updatedEmployee;
    } catch (err) {
      console.error('Hook: Update employee error:', err);
      
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
    console.log('🔍 goToPage called with:', pageNum);
    const maxPages = Math.ceil(totalEmployees / pageSize);
    console.log('🔍 Max pages:', maxPages, 'Total employees:', totalEmployees, 'Page size:', pageSize);
    if (pageNum >= 1 && pageNum <= maxPages) {
      fetchEmployees(pageNum, pageSize);
    }
  };

  const changePageSize = (newPageSize) => {
    console.log('🔍 changePageSize called with:', newPageSize);
    setPageSize(newPageSize);
    fetchEmployees(1, newPageSize); // Reset to first page when changing page size
  };

  const nextPage = () => {
    console.log('🔍 nextPage called, current page:', currentPage);
    const maxPages = Math.ceil(totalEmployees / pageSize);
    if (currentPage < maxPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    console.log('🔍 prevPage called, current page:', currentPage);
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
      console.log('🕐 Fetching departments at:', new Date().toISOString());
      const data = await departmentApi.getAllDepartments();
      console.log('🕐 Departments data received at:', new Date().toISOString());
      console.log('🕐 Departments data:', data);
      console.log('🕐 Number of departments:', data ? data.length : 'null');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching departments:', err);
      setError(err.message || 'Failed to fetch departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (departmentData) => {
    try {
      console.log('Hook: Adding department with data:', departmentData);
      const newDepartment = await departmentApi.addDepartment(departmentData);
      console.log('Hook: Add successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
      console.log('Hook: Department data refresh completed');
      return newDepartment;
    } catch (err) {
      console.error('Hook: Add department error:', err);
      setError(err.message || 'Failed to add department');
      throw err;
    }
  };

  const updateDepartment = async (id, departmentData) => {
    try {
      console.log('Hook: Updating department with ID:', id);
      const updatedDepartment = await departmentApi.updateDepartment(id, departmentData);
      console.log('Hook: Update successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
      console.log('Hook: Department data refresh completed');
      return updatedDepartment;
    } catch (err) {
      console.error('Hook: Update department error:', err);
      setError(err.message || 'Failed to update department');
      throw err;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      console.log('Hook: Deleting department with ID:', id);
      await departmentApi.deleteDepartment(id);
      console.log('Hook: Delete successful, refreshing departments data...');
      // Refresh the entire department list to ensure we have the latest data
      await fetchDepartments();
      console.log('Hook: Department data refresh completed');
    } catch (err) {
      console.error('Hook: Delete department error:', err);
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
export const useLeaves = (page = 1, limit = 10) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchLeaves = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching leaves - Page: ${pageNum}, Limit: ${pageLimit}, Current totalLeaves: ${totalLeaves}`);
      const data = await leaveApi.getAllLeaves(pageNum, pageLimit);
      console.log('Leaves data received:', data);
      
      // Handle paginated response structure
      if (data && typeof data === 'object' && data.data) {
        setLeaves(Array.isArray(data.data) ? data.data : []);
        // Try multiple possible field names for total count
        const totalCount = data.totalLeaves || data.total || data.count || data.totalCount || data.totalItems || 0;
        
        // If no total count provided, estimate based on current page data
        const estimatedTotal = totalCount > 0 ? totalCount : (data.data?.length >= pageLimit ? (pageNum * pageLimit) + 1 : (pageNum - 1) * pageLimit + (data.data?.length || 0));
        setTotalLeaves(estimatedTotal);
      } else {
        // Fallback for non-paginated response
        setLeaves(Array.isArray(data) ? data : []);
        setTotalLeaves(Array.isArray(data) ? data.length : 0);
      }
      
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError(err.message || 'Failed to fetch leaves');
      setLeaves([]);
      setTotalLeaves(0);
    } finally {
      setLoading(false);
    }
  };

  const addLeave = async (leaveData) => {
    try {
      console.log('Hook: Adding leave with data:', leaveData);
      const newLeave = await leaveApi.addLeave(leaveData);
      console.log('Hook: Add successful, refreshing leaves data...');
      // Refresh the entire leave list to ensure we have the latest data
      await fetchLeaves();
      console.log('Hook: Leave data refresh completed');
      return newLeave;
    } catch (err) {
      console.error('Hook: Add leave error:', err);
      setError(err.message || 'Failed to add leave');
      throw err;
    }
  };

  const updateLeaveStatus = async (id, leaveData) => {
    try {
      console.log('Hook: Updating leave status with ID:', id);
      const updatedLeave = await leaveApi.updateLeaveStatus(id, leaveData);
      console.log('Hook: Update successful, refreshing leaves data...');
      // Refresh the entire leave list to ensure we have the latest data
      await fetchLeaves();
      console.log('Hook: Leave data refresh completed');
      return updatedLeave;
    } catch (err) {
      console.error('Hook: Update leave status error:', err);
      setError(err.message || 'Failed to update leave status');
      throw err;
    }
  };

  const deleteLeave = async (id) => {
    try {
      console.log('Hook: Deleting leave with ID:', id);
      await leaveApi.deleteLeave(id);
      console.log('Hook: Delete successful, refreshing leaves data...');
      // Refresh the entire leave list to ensure we have the latest data
      await fetchLeaves();
      console.log('Hook: Leave data refresh completed');
    } catch (err) {
      console.error('Hook: Delete leave error:', err);
      setError(err.message || 'Failed to delete leave');
      throw err;
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalLeaves / pageSize);
    console.log(`goToPage: pageNum=${pageNum}, totalLeaves=${totalLeaves}, pageSize=${pageSize}, maxPages=${maxPages}`);
    
    // Always allow page changes if totalLeaves is 0 (initial state) or if page is in valid range
    // This prevents the issue where totalLeaves might be stale
    if (totalLeaves === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      console.log(`goToPage: Fetching page ${pageNum}`);
      fetchLeaves(pageNum, pageSize);
    } else {
      console.log(`goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchLeaves(1, newPageSize); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalLeaves / pageSize)) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    leaves,
    loading,
    error,
    totalLeaves,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalLeaves / pageSize),
    addLeave,
    updateLeaveStatus,
    deleteLeave,
    refetch: fetchLeaves,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};

// Custom hook for payroll data
export const usePayroll = (page = 1, limit = 10) => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchPayroll = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching payroll with pagination - Page: ${pageNum}, Limit: ${pageLimit}`);
      
      // First, fetch all payroll to get total count
      console.log('🔄 Fetching all payroll for total count...');
      const allPayrollResponse = await payrollApi.getAllPayroll(1, 1000); // Get all payroll
      
      // Then fetch paginated data
      const paginatedResponse = await payrollApi.getAllPayroll(pageNum, pageLimit);
      
      console.log('📡 All Payroll API Response:', allPayrollResponse);
      console.log('📡 Paginated Payroll API Response:', paginatedResponse);
      
      // Process all payroll for total count
      let allPayrollData = [];
      if (Array.isArray(allPayrollResponse)) {
        allPayrollData = allPayrollResponse;
      } else if (allPayrollResponse && allPayrollResponse.data && Array.isArray(allPayrollResponse.data)) {
        allPayrollData = allPayrollResponse.data;
      } else if (allPayrollResponse && allPayrollResponse.success && Array.isArray(allPayrollResponse.data)) {
        allPayrollData = allPayrollResponse.data;
      }
      
      // Process paginated data for current page
      let payrollData = [];
      if (Array.isArray(paginatedResponse)) {
        payrollData = paginatedResponse;
      } else if (paginatedResponse && paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
        payrollData = paginatedResponse.data;
      } else if (paginatedResponse && paginatedResponse.success && Array.isArray(paginatedResponse.data)) {
        payrollData = paginatedResponse.data;
      }
      
      const totalPayrollCount = allPayrollData.length;
      
      console.log('📊 All payroll count:', totalPayrollCount);
      console.log('📊 Current page payroll data:', payrollData);
      
      setPayroll(payrollData);
      setTotalPayroll(totalPayrollCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      console.error('Error fetching payroll:', err);
      setError(err.message || 'Failed to fetch payroll');
      setPayroll([]);
      setTotalPayroll(0);
    } finally {
      setLoading(false);
    }
  };

  const generatePayslip = async (id, payrollData) => {
    try {
      console.log('Hook: Generating payslip for employee ID:', id);
      console.log('Hook: Payroll data:', payrollData);
      const payslip = await payrollApi.generatePayslip(id, payrollData);
      console.log('Hook: Payslip generated successfully');
      // Refresh payroll data after successful generation
      await fetchPayroll();
      return payslip;
    } catch (err) {
      console.error('Hook: Generate payslip error:', err);
      setError(err.message || 'Failed to generate payslip');
      throw err;
    }
  };

  const updatePayroll = async (id, payrollData) => {
    try {
      console.log('Hook: Updating payroll with ID:', id);
      console.log('Hook: Payroll data:', payrollData);
      const updatedPayroll = await payrollApi.updatePayroll(id, payrollData);
      console.log('Hook: Payroll updated successfully');
      // Refresh payroll data after successful update
      await fetchPayroll();
      return updatedPayroll;
    } catch (err) {
      console.error('Hook: Update payroll error:', err);
      setError(err.message || 'Failed to update payroll');
      throw err;
    }
  };

  const deletePayroll = async (id) => {
    try {
      console.log('Hook: Deleting payroll with ID:', id);
      await payrollApi.deletePayroll(id);
      console.log('Hook: Payroll deleted successfully');
      // Refresh payroll data after successful deletion
      await fetchPayroll();
    } catch (err) {
      console.error('Hook: Delete payroll error:', err);
      setError(err.message || 'Failed to delete payroll');
      throw err;
    }
  };

  const getPayslip = async (id) => {
    try {
      console.log('Hook: Getting payslip with ID:', id);
      const payslip = await payrollApi.getPayslip(id);
      console.log('Hook: Payslip retrieved successfully');
      return payslip;
    } catch (err) {
      console.error('Hook: Get payslip error:', err);
      setError(err.message || 'Failed to fetch payslip');
      throw err;
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalPayroll / pageSize);
    console.log(`Payroll goToPage: pageNum=${pageNum}, totalPayroll=${totalPayroll}, pageSize=${pageSize}, maxPages=${maxPages}`);
    
    // Always allow page changes if totalPayroll is 0 (initial state) or if page is in valid range
    // This prevents the issue where totalPayroll might be stale
    if (totalPayroll === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      console.log(`Payroll goToPage: Fetching page ${pageNum}`);
      fetchPayroll(pageNum, pageSize);
    } else {
      console.log(`Payroll goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    fetchPayroll(1, newPageSize); // Reset to first page when changing page size
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalPayroll / pageSize)) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
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
    nextPage,
    prevPage
  };
};