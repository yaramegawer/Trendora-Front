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
import { attendanceApi } from '../../services/hrApi';

const AttendanceManagement = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch attendance records from API
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching attendance records from API...');
      
      const response = await attendanceApi.getAttendance();
      console.log('🔍 Full API response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      
      // Extract attendance records from response
      let records = [];
      if (response && response.data) {
        console.log('🔍 Response.data:', response.data);
        console.log('🔍 Response.data type:', typeof response.data);
        console.log('🔍 Response.data keys:', Object.keys(response.data || {}));
        
        if (Array.isArray(response.data)) {
          records = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          records = response.data.data;
        } else {
          records = [response.data]; // Single record
        }
      } else if (Array.isArray(response)) {
        records = response;
      } else {
        records = response ? [response] : [];
      }
      
      console.log('🔍 Final records array:', records);
      console.log('🔍 Records length:', records.length);
      if (records.length > 0) {
        console.log('🔍 First record:', records[0]);
        console.log('🔍 First record keys:', Object.keys(records[0] || {}));
        
        // Debug the specific record structure
        const firstRecord = records[0];
        console.log('🔍 First record.data:', firstRecord.data);
        console.log('🔍 First record.data keys:', firstRecord.data ? Object.keys(firstRecord.data) : 'No data property');
        
        if (firstRecord.data && firstRecord.data.url) {
          console.log('✅ URL found in first record.data.url:', firstRecord.data.url);
        } else if (firstRecord.data && firstRecord.data.sheet && firstRecord.data.sheet.url) {
          console.log('✅ URL found in first record.data.sheet.url:', firstRecord.data.sheet.url);
        } else {
          console.log('❌ No URL found in expected locations');
          console.log('🔍 Available properties in first record.data:', firstRecord.data);
          if (firstRecord.data && firstRecord.data.sheet) {
            console.log('🔍 Sheet properties:', firstRecord.data.sheet);
          }
        }
      }
      
      setAttendanceRecords(records);
      setSuccess(`Attendance records loaded successfully! Found ${records.length} records.`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Error fetching attendance records:', error);
      setError(error.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Load attendance records on component mount
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchAttendanceRecords();
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
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Attendance Management
        </Typography>
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
                  console.error('Error loading PDF:', selectedPdfUrl);
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
