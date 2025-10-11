import { useState, useEffect } from 'react';
import { payrollApi } from '../services/hrApi';

export const usePayroll = (page = 1, limit = 10) => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchPayroll = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError('');
      console.log(`usePayrollData: Fetching payroll with pagination - Page: ${pageNum}, Limit: ${pageLimit}`);
      
      // Fetch all payroll data for client-side pagination
      console.log('usePayrollData: Fetching all payroll data...');
      const allPayrollResponse = await payrollApi.getAllPayroll(1, 1000); // Get all payroll
      
      console.log('usePayrollData: All Payroll API Response:', allPayrollResponse);
      
      // Process all payroll data
      let allPayrollData = [];
      if (Array.isArray(allPayrollResponse)) {
        allPayrollData = allPayrollResponse;
      } else if (allPayrollResponse && allPayrollResponse.data && Array.isArray(allPayrollResponse.data)) {
        allPayrollData = allPayrollResponse.data;
      } else if (allPayrollResponse && allPayrollResponse.success && Array.isArray(allPayrollResponse.data)) {
        allPayrollData = allPayrollResponse.data;
      }
      
      const totalPayrollCount = allPayrollData.length;
      
      console.log('usePayrollData: All payroll count:', totalPayrollCount);
      console.log('usePayrollData: All payroll data:', allPayrollData);
      
      // Store ALL payroll data for client-side pagination
      setPayroll(allPayrollData);
      setTotalPayroll(totalPayrollCount);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
    } catch (err) {
      console.log('usePayrollData: Error fetching payroll:', err);
      setError(err.message || 'Failed to fetch payroll data');
      setPayroll([]);
      setTotalPayroll(0);
    } finally {
      setLoading(false);
    }
  };

  const generatePayslip = async (employeeId, payrollData) => {
    try {
      const newPayslip = await payrollApi.generatePayslip(employeeId, payrollData);
      // Refresh the entire payroll list to ensure we have the latest data
      await fetchPayroll();
      return newPayslip;
    } catch (err) {
      setError(err.message || 'Failed to generate payslip');
      throw err;
    }
  };

  const updatePayroll = async (id, payrollData) => {
    try {
      const updatedPayroll = await payrollApi.updatePayroll(id, payrollData);
      // Refresh the entire payroll list to ensure we have the latest data
      await fetchPayroll();
      return updatedPayroll;
    } catch (err) {
      setError(err.message || 'Failed to update payroll');
      throw err;
    }
  };

  const deletePayroll = async (id) => {
    try {
      await payrollApi.deletePayroll(id);
      // Refresh the entire payroll list to ensure we have the latest data
      await fetchPayroll();
    } catch (err) {
      setError(err.message || 'Failed to delete payroll');
      throw err;
    }
  };

  const getPayslip = async (id) => {
    try {
      const payslip = await payrollApi.getPayslip(id);
      return payslip;
    } catch (err) {
      setError(err.message || 'Failed to fetch payslip');
      throw err;
    }
  };

  // Pagination functions
  const goToPage = (pageNum) => {
    const maxPages = Math.ceil(totalPayroll / pageSize);
    console.log(`usePayrollData goToPage: pageNum=${pageNum}, totalPayroll=${totalPayroll}, pageSize=${pageSize}, maxPages=${maxPages}`);
    
    // Always allow page changes if totalPayroll is 0 (initial state) or if page is in valid range
    // This prevents the issue where totalPayroll might be stale
    if (totalPayroll === 0 || (pageNum >= 1 && pageNum <= maxPages)) {
      console.log(`usePayrollData goToPage: Fetching page ${pageNum}`);
      fetchPayroll(pageNum, pageSize);
    } else {
      console.log(`usePayrollData goToPage: Page ${pageNum} is out of range (1-${maxPages})`);
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

  useEffect(() => {
    fetchPayroll();
  }, []);

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
    fetchPayroll,
    goToPage,
    changePageSize,
    nextPage,
    prevPage
  };
};
