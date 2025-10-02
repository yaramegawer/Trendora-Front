import { useState, useEffect } from 'react';
import { attendanceApi } from '../services/hrApi';

// Custom hook for attendance data management with pagination
export const useAttendance = (page = 1, limit = 10) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);

  const fetchAttendanceRecords = async (pageNum = currentPage, pageLimit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 useAttendance: Fetching all attendance records for client-side pagination');
      
      // Get all attendance records at once for client-side pagination (like employees)
      const data = await attendanceApi.getAttendance(1, 1000); // Get all records
      console.log('🔍 useAttendance: API response:', data);
      
      // Handle response structure - similar to other APIs
      let allRecords = [];
      
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          allRecords = data.data;
        } else if (data.success && data.data && Array.isArray(data.data)) {
          allRecords = data.data;
        } else if (Array.isArray(data)) {
          allRecords = data;
        } else {
          // Single record or different structure
          allRecords = data ? [data] : [];
        }
      } else if (Array.isArray(data)) {
        allRecords = data;
      }
      
      console.log('🔍 useAttendance: Total records fetched:', allRecords.length);
      
      setAttendanceRecords(allRecords); // Store all records for client-side pagination
      setTotalRecords(allRecords.length);
      setCurrentPage(pageNum);
      setPageSize(pageLimit);
      
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError(err.message || 'Failed to fetch attendance records');
      setAttendanceRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions - client-side pagination
  const goToPage = (pageNum) => {
    console.log('🔍 goToPage called with:', pageNum);
    const maxPages = Math.ceil(totalRecords / pageSize);
    console.log('🔍 Max pages:', maxPages, 'Total records:', totalRecords, 'Page size:', pageSize);
    if (pageNum >= 1 && pageNum <= maxPages) {
      setCurrentPage(pageNum);
    }
  };

  const changePageSize = (newPageSize) => {
    console.log('🔍 changePageSize called with:', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const nextPage = () => {
    console.log('🔍 nextPage called, current page:', currentPage);
    const maxPages = Math.ceil(totalRecords / pageSize);
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

  const deleteAttendance = async (id) => {
    try {
      console.log('Hook: Deleting attendance record with ID:', id);
      await attendanceApi.deleteAttendance(id);
      console.log('Hook: Delete successful, refreshing attendance records...');
      // Refresh the attendance records after deletion
      await fetchAttendanceRecords();
      console.log('Hook: Attendance records refresh completed');
    } catch (err) {
      console.error('Hook: Delete attendance error:', err);
      setError(err.message || 'Failed to delete attendance record');
      throw err;
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  return {
    attendanceRecords,
    loading,
    error,
    totalRecords,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    fetchAttendanceRecords,
    deleteAttendance
  };
};
