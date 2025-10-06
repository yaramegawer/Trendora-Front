import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility,
  Download,
  Delete,
  PictureAsPdf,
  Refresh
} from '@mui/icons-material';
import { useAttendance } from '../../hooks/useAttendanceData';
import SimplePagination from '../common/SimplePagination';

const AttendanceManagement = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Use the attendance hook with pagination
  const {
    attendanceRecords: allAttendanceRecords,
    loading,
    error,
    totalRecords,
    currentPage: hookCurrentPage,
    pageSize: hookPageSize,
    totalPages,
    goToPage,
    changePageSize,
    fetchAttendanceRecords,
    deleteAttendance
  } = useAttendance(currentPage, pageSize);

  // Use attendance records as they come from backend (backend handles sorting)
  // Client-side pagination - slice records based on current page
  const startIndex = (hookCurrentPage - 1) * hookPageSize;
  const endIndex = startIndex + hookPageSize;
  const attendanceRecords = allAttendanceRecords.slice(startIndex, endIndex);
  
  // Debug pagination values
('🔍 Attendance Pagination Debug:', {
    totalRecords,
    hookCurrentPage,
    hookPageSize,
    totalPages,
    startIndex,
    endIndex,
    recordsOnPage: attendanceRecords.length,
    allRecordsLength: allAttendanceRecords.length
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load attendance records on component mount
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Auto-refresh attendance records when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
('🔄 Page became visible, refreshing attendance records...');
        fetchAttendanceRecords();
      }
    };

    const handleFocus = () => {
('🔄 Window focused, refreshing attendance records...');
      fetchAttendanceRecords();
    };

    // Listen for visibility changes and window focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAttendanceRecords]);

  // Periodic refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
('🔄 Periodic refresh: fetching attendance records...');
      fetchAttendanceRecords();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchAttendanceRecords]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAttendanceRecords();
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    goToPage(page);
  };

  // Delete handlers
  const handleDeleteClick = (record) => {
('🔍 Frontend: Delete button clicked');
('🔍 Frontend: Full record object:', record);
('🔍 Frontend: Record keys:', Object.keys(record || {}));
('🔍 Frontend: Record._id:', record._id);
('🔍 Frontend: Record.id:', record.id);
('🔍 Frontend: Record.sheet:', record.sheet);
    if (record.sheet) {
('🔍 Frontend: Record.sheet keys:', Object.keys(record.sheet || {}));
('🔍 Frontend: Record.sheet._id:', record.sheet._id);
('🔍 Frontend: Record.sheet.id:', record.sheet.id);
    }
    
    setRecordToDelete(record);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      setDeleting(true);
      setSuccess('');
      
('🔍 Frontend: Starting delete process');
('🔍 Frontend: Record to delete:', recordToDelete);
      
      // Extract the record ID from the record structure
      // Try multiple possible locations for the ID
      const recordId = recordToDelete._id || 
                      recordToDelete.id || 
                      recordToDelete.sheet?._id || 
                      recordToDelete.sheet?.id;
('🔍 Frontend: Extracted record ID:', recordId);
('🔍 Frontend: All possible IDs:', {
        'record._id': recordToDelete._id,
        'record.id': recordToDelete.id,
        'record.sheet._id': recordToDelete.sheet?._id,
        'record.sheet.id': recordToDelete.sheet?.id
      });
      
      if (!recordId) {
('❌ Frontend: No record ID found');
        setSuccess('Cannot delete: Record ID not found');
        setTimeout(() => setSuccess(null), 3000);
        setDeleteDialog(false);
        setRecordToDelete(null);
        return;
      }

('🔍 Frontend: Calling deleteAttendance with ID:', recordId);
      await deleteAttendance(recordId);
('✅ Frontend: Delete successful');
      setSuccess('Attendance record deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
('❌ Frontend: Error deleting attendance record:', error);
('❌ Frontend: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setSuccess(`Error: ${error.message || 'Failed to delete attendance record'}`);
      setTimeout(() => setSuccess(null), 5000);
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
      setRecordToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setRecordToDelete(null);
  };

  // Handle PDF viewing
  const handleViewPdf = (fileUrl) => {
    // Check if URL is valid
    if (!fileUrl || fileUrl === '#') {
      setError('No file URL available for viewing');
      return;
    }
    
    setSelectedPdfUrl(fileUrl);
    setViewDialog(true);
  };

  // Handle file download
  const handleDownload = (file) => {
    let fileUrl = file.url || file.fileUrl;
    let fileName = file.name || file.fileName || 'attendance-record';
    let fileId = file.id || '';
    
    // Check if we have a Cloudinary URL
    if (!fileUrl || !fileUrl.includes('cloudinary.com')) {
      setError('No valid file URL available for download');
      return;
    }
    
    // Use file ID as filename if available
    const downloadFileName = fileId ? `${fileId}.pdf` : fileName;
    
    try {
      // Create download link for Cloudinary URL
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = downloadFileName;
      link.target = '_blank';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Downloading ${downloadFileName} from Cloudinary...`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(`Failed to download ${downloadFileName}. Please try again.`);
    }
  };

  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      // Revoke object URL to free memory
      const fileToDelete = prev.find(file => file.id === fileId);
      if (fileToDelete) {
        URL.revokeObjectURL(fileToDelete.url);
      }
      return updated;
    });
    setSuccess('File deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'grey.50', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
            Attendance Management
          </Typography>
          {!loading && totalRecords > 0 && (
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              {totalRecords} attendance record{totalRecords !== 1 ? 's' : ''} found
            </Typography>
          )}
        </Box>
        <Button
          onClick={handleRefresh}
          variant="outlined"
          startIcon={<Refresh />}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Stack>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}


      {/* Uploaded Files Section */}
      <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
            Uploaded Attendance Files
          </Typography>
          
          {!loading && uploadedFiles.length === 0 && attendanceRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PictureAsPdf sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                No attendance files uploaded yet.
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>
                Upload a PDF file to get started.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {/* Display API-fetched attendance records */}
              {!loading && attendanceRecords.map((record, index) => {
                // Extract data from the sheet field (actual API structure)
                const recordData = record.sheet;
                
                // Extract URL and ID from sheet structure
                // Structure: { sheet: { id: "Trendora/attendance/file_fg1vwl", url: "https://res.cloudinary.com/..." } }
                const fileUrl = recordData?.url;
                const fileId = recordData?.id;
                
                // Use fixed filename for all attendance records
                let fileName = recordData?.originalName;
                if (!fileName) {
                  fileName = `Attendance Record ${index + 1}`;
                }
                
                const fileSize = recordData?.fileSize;
                const createdAt = record?.createdAt || record?.created_at || recordData?.createdAt || recordData?.created_at || recordData?.uploadDate;
                const employeeName = recordData?.employeeName;
                
                return (
                  <Paper
                    key={fileId || record._id || record.id || `api-${index}`}
                    sx={{
                      p: 2,
                      border: '1px solid #e2e8f0',
                      '&:hover': { backgroundColor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PictureAsPdf sx={{ color: '#dc2626', fontSize: 28 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                          {fileName}
                        </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {fileSize ? `${formatFileSize(fileSize)} • ` : ''}
                        Created At: {formatDate(createdAt)}
                      </Typography>
                      {employeeName && (
                        <Typography variant="body2" sx={{ color: '#059669', mt: 0.5 }}>
                          Employee: {employeeName}
                        </Typography>
                      )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View PDF">
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewPdf(fileUrl);
                            }}
                            sx={{ color: '#0891b2' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownload({ 
                                url: fileUrl, 
                                name: fileName,
                                id: fileId
                              });
                            }}
                            sx={{ color: '#059669' }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(record);
                            }}
                            sx={{ color: '#dc2626' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
              
              {/* Display locally uploaded files */}
              {uploadedFiles.map((file) => (
                <Paper
                  key={file.id}
                  sx={{
                    p: 2,
                    border: '1px solid #e2e8f0',
                    '&:hover': { backgroundColor: '#f8fafc' },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PictureAsPdf sx={{ color: '#dc2626', fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {formatFileSize(file.size)} • Created At: {formatDate(file.uploadDate)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View PDF">
                        <IconButton
                          onClick={() => handleViewPdf(file.url)}
                          sx={{ color: '#0891b2' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          onClick={() => handleDownload(file)}
                          sx={{ color: '#059669' }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteFile(file.id)}
                          sx={{ color: '#dc2626' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && allAttendanceRecords.length > 0 && (
        <SimplePagination
          currentPage={hookCurrentPage}
          totalPages={totalPages}
          totalItems={totalRecords}
          pageSize={hookPageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 600 }}>
            Delete Attendance Record
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </Typography>
          {recordToDelete && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                Record Details:
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                File: {recordToDelete.sheet?.originalName || 'Attendance Record'}
              </Typography>
              {recordToDelete.sheet?.employeeName && (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Employee: {recordToDelete.sheet.employeeName}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            disabled={deleting}
            sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ 
              backgroundColor: '#dc2626', 
              '&:hover': { backgroundColor: '#b91c1c' },
              '&:disabled': { backgroundColor: '#fca5a5' }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Viewing Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PictureAsPdf sx={{ color: '#dc2626' }} />
            <Typography variant="h6">Attendance PDF Viewer</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {selectedPdfUrl ? (
              <iframe
                src={selectedPdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="PDF Viewer"
                onError={() => {
('Error loading PDF:', selectedPdfUrl);
                  setError('Failed to load PDF. Please try downloading the file instead.');
                }}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6" color="error">
                  No PDF URL available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The file URL could not be loaded for viewing.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;
