import { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  FolderOpen, 
  Plus, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Edit3,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Code,
  Monitor,
  Database,
  Cloud,
  Wifi,
  Server,
  Upload,
  FileText,
  Calendar
} from 'lucide-react';
import { useITEmployees, useITProjects, useITTickets, useITLeaves } from '../../hooks/useITData';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { itLeaveApi } from '../../services/itApi';
import { dashboardApi } from '../../services/dashboardApi';
import SimplePagination from '../common/SimplePagination';
import ITLeavesManagement from './ITLeavesManagement';

const ITDepartment = () => {
  // Get user from auth context
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Check if user has access to IT department
  // Since department info is not available in the user object, allow access
  // The backend will handle the actual authorization
  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>
          You must be logged in to access the IT department.
        </p>
      </div>
    );
  }
  
  // Pagination state
  const [projectsCurrentPage, setProjectsCurrentPage] = useState(1);
  const [ticketsCurrentPage, setTicketsCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter state for tickets
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Check if ticket filters are active
  const hasActiveTicketFilters = ticketStatusFilter !== 'all';
  
  // Filter state for projects
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [showProjectStatusDropdown, setShowProjectStatusDropdown] = useState(false);
  
  // PDF Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  
  // Use real API data with pagination
  const { employees, loading: employeesLoading, error: employeesError, updateRating } = useITEmployees();
  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError, 
    totalProjects,
    currentPage: projectsPage,
    totalPages: projectsTotalPages,
    goToPage: projectsGoToPage,
    changeSearchTerm: projectChangeSearchTerm,
    changeStatusFilter: projectChangeStatusFilter,
    createProject, 
    updateProject, 
    deleteProject
  } = useITProjects(projectsCurrentPage, pageSize, projectSearchTerm, projectStatusFilter);
  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError,
    totalTickets,
    currentPage: ticketsPage,
    totalPages: ticketsTotalPages,
    goToPage: ticketsGoToPage,
    changeStatusFilter,
    updateTicket, 
    deleteTicket
  } = useITTickets(ticketsCurrentPage, pageSize, ticketStatusFilter);
  const { submitLeave } = useITLeaves();

  // Tickets are already filtered by the hook, no need for additional filtering
  const filteredTickets = Array.isArray(tickets) ? tickets : [];

  // Projects are already filtered and paginated by the hook, no need for additional filtering
  const filteredProjects = Array.isArray(projects) ? projects : [];
  
  // Check if filters are active
  const hasActiveProjectFilters = projectSearchTerm !== '' || projectStatusFilter !== 'all';

  // Tickets are already filtered and paginated by the hook
  const ticketsToDisplay = filteredTickets;

  // Projects are already filtered and paginated by the hook
  const projectsToDisplay = filteredProjects;

  // Pagination handlers
  const handleProjectsPageChange = (newPage) => {
('IT Department Styled: Projects page change to:', newPage);
    setProjectsCurrentPage(newPage);
    
    // Hook handles both filtering and pagination
    projectsGoToPage(newPage);
  };

  

  const handleTicketsPageChange = (newPage) => {
('IT Department Styled: Tickets page change to:', newPage);
    setTicketsCurrentPage(newPage);
    
    // Hook handles both filtering and pagination
    ticketsGoToPage(newPage);
  };

  const handleStatusFilterChange = (status) => {
    setTicketStatusFilter(status);
    setTicketsCurrentPage(1); // Reset to first page when filter changes
    changeStatusFilter(status); // Use the hook's filter method to filter across all pages
  };

  // Attendance Sheet Upload Functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is a valid attendance sheet format
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!validTypes.includes(file.type)) {
        setUploadError('Please select a valid attendance sheet file (PDF, Excel, or CSV).');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first.');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setUploadError('Please sign in first to upload attendance sheets.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('sheet', selectedFile);

      // Get token from localStorage (this is how the app stores it)
      const token = localStorage.getItem('token');
      
      // Debug: Log authentication status
('🔍 Upload Debug Info:');
('  - localStorage keys:', Object.keys(localStorage));
('  - token value:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
('  - user from AuthContext:', user);
('  - isAuthenticated from AuthContext:', user ? 'User object exists' : 'No user object');
      
      if (!token) {
        const availableKeys = Object.keys(localStorage);
('❌ No token found in localStorage');
('❌ Available localStorage keys:', availableKeys);
('❌ User object:', user);
        throw new Error(`Please sign in first. No authentication token found. Available localStorage keys: ${availableKeys.join(', ')}`);
      }
      
('✅ Token found, proceeding with upload...');

      // Get the correct API base URL
      const baseURL = import.meta.env.VITE_API_URL || 'https://trendora-nine.vercel.app/api';
      const uploadURL = `${baseURL}/it/attendance`;
      
('🔍 Upload URL:', uploadURL);
('🔍 Base URL:', baseURL);
      
      // Prepare headers (same format as axios interceptor)
      const headers = {
        // Don't set Content-Type header, let browser set it with boundary for FormData
        // Use both header formats like the axios interceptor does
        'Authorization': `Bearer ${token}`,
        'token': `Trendora ${token}`,
      };
      
('🔍 Request headers:', headers);
('🔍 Token (first 20 chars):', token.substring(0, 20) + '...');
      
      // Upload to the API endpoint
      const response = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Create a file URL for display (fallback for preview)
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // Add to uploaded files list
      const newFile = {
        id: Date.now(),
        name: selectedFile.name,
        size: selectedFile.size,
        uploadDate: new Date().toISOString(),
        url: fileUrl,
        type: selectedFile.type,
        serverResponse: result // Store server response for reference
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);
      setSelectedFile(null);
      setUploadSuccess(`Attendance sheet "${selectedFile.name}" uploaded successfully!`);
      
      
      // Clear success message after 3 seconds (if refresh doesn't happen)
      setTimeout(() => setUploadSuccess(null), 3000);
      
    } catch (error) {
('Upload error:', error);
      setUploadError(`Failed to upload attendance sheet: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewPdf = (fileUrl) => {
    setSelectedPdfUrl(fileUrl);
    setShowPdfViewer(true);
  };

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
    setUploadSuccess('File deleted successfully!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProjectSearchChange = (searchTerm) => {
    setProjectSearchTerm(searchTerm);
    // Don't call API here - let useEffect handle it with debouncing
  };

  const handleProjectStatusFilterChange = (status) => {
    setProjectStatusFilter(status);
    setProjectsCurrentPage(1); // Reset to first page when filter changes
    projectChangeStatusFilter(status); // Use the hook's filter method to filter across all pages
  };

  // Sync component page state with hook page state
  useEffect(() => {
    if (projectsPage !== projectsCurrentPage) {
      setProjectsCurrentPage(projectsPage);
    }
  }, [projectsPage]);

  // Debounce search functionality - wait 500ms after user stops typing
  useEffect(() => {
    // Skip the debounce on initial mount (when search is empty and hasn't been touched)
    // Only debounce after user starts typing
    const debounceTimeout = setTimeout(() => {
       ('🔍 Search term changed to:', projectSearchTerm);
      projectChangeSearchTerm(projectSearchTerm); // This will update the hook state and trigger refetch via useEffect
    }, 500); // Wait 500ms after last keystroke

    return () => clearTimeout(debounceTimeout); // Clean up timeout on unmount or when searchTerm changes
  }, [projectSearchTerm]); // Only trigger when projectSearchTerm changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
      if (showProjectStatusDropdown && !event.target.closest('.project-status-dropdown-container')) {
        setShowProjectStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown, showProjectStatusDropdown]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planned',
    members: [],
    notes: '',
    startDate: '',
    endDate: ''
  });
  const [newProjectFieldErrors, setNewProjectFieldErrors] = useState({ name: '', description: '' });



  // State for employee ratings
  const [employeeRatings, setEmployeeRatings] = useState({});
  
  // State for forms
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // State for project editing
  const [editingProject, setEditingProject] = useState(null);
  const [showEditProject, setShowEditProject] = useState(false);
  
  // State for ticket editing
  const [editingTicket, setEditingTicket] = useState(null);
  const [showEditTicket, setShowEditTicket] = useState(false);
  
  // State for leave form
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ amount: '', payrollMonth: '' });
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [advanceError, setAdvanceError] = useState('');
  const [existingAdvances, setExistingAdvances] = useState([]);
  const [advancesLoading, setAdvancesLoading] = useState(false);
  
  const handleCreateAdvance = async () => {
    try {
      setAdvanceLoading(true);
      setAdvanceError('');
      if (!advanceForm.amount || Number(advanceForm.amount) < 1) {
        setAdvanceError('Amount must be at least 1.');
        return;
      }
      if (!advanceForm.payrollMonth) {
        setAdvanceError('Payroll month is required.');
        return;
      }
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const raw = String(advanceForm.payrollMonth).trim();
      let monthLabel = raw;
      if (/^\d{4}-\d{2}$/.test(raw)) {
        const idx = Math.max(0, Math.min(11, parseInt(raw.split('-')[1], 10) - 1));
        monthLabel = monthNames[idx];
      }
      const hasDuplicate = (existingAdvances || []).some(a => ((a?.payrollMonth || '') + '').toLowerCase() === (monthLabel + '').toLowerCase());
      if (hasDuplicate) {
        setAdvanceError('You can request only one advance per month.');
        return;
      }
      const payload = { amount: Number(advanceForm.amount), payrollMonth: monthLabel };
      const res = await dashboardApi.requestAdvance(payload);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to request advance');
      }
      showSuccess('Advance request submitted successfully!');
      setAdvanceForm({ amount: '', payrollMonth: '' });
      setShowAdvanceForm(false);
    } catch (error) {
      const msg = error?.message || 'Failed to request advance';
      showError(msg);
      setAdvanceError(msg);
    } finally {
      setAdvanceLoading(false);
    }
  };

  useEffect(() => {
    const fetchExistingAdvances = async () => {
      try {
        setAdvancesLoading(true);
        setAdvanceError('');
        const res = await dashboardApi.getEmployeeAdvances(1, 1000);
        let list = [];
        if (res && res.success && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          list = res.data;
        }
        setExistingAdvances(list);
      } catch (_) {
        // ignore fetch errors for duplicate check
      } finally {
        setAdvancesLoading(false);
      }
    };
    if (showAdvanceForm) {
      fetchExistingAdvances();
    }
  }, [showAdvanceForm]);
  
  // Debug logging
('IT Department - showEmployeeForm:', showEmployeeForm);
('IT Department - editingEmployee:', editingEmployee);

  // Function to get rating for a specific employee and category
  const getRating = (employeeId, category) => {
    // First try to get from local state
    const key = `${employeeId}-${category}`;
    const localRating = employeeRatings[key];
    if (localRating !== undefined) {
      return localRating;
    }
    
    // If not in local state, try to get from database
    const employee = employees.find(emp => (emp.id || emp._id) === employeeId);
    if (employee && employee.rating && typeof employee.rating === 'object') {
      return Math.max(employee.rating[category] || 1, 1);
    }
    
    return 1; // Default to 1 if not set (minimum required by backend)
  };

  // Function to get average rating for an employee
  const getAverageRating = (employeeId) => {
    const performance = getRating(employeeId, 'performance');
    const efficiency = getRating(employeeId, 'efficiency');
    const teamwork = getRating(employeeId, 'teamwork');
    return Math.round((performance + efficiency + teamwork) / 3);
  };

  // Function to get employee name from leave object or ID
  const getEmployeeName = (leave) => {
    // Check if employee is populated in the leave object
    if (leave.employee && leave.employee.firstName && leave.employee.lastName) {
      return `${leave.employee.firstName} ${leave.employee.lastName}`;
    }
    
    // Fallback to employeeId lookup if populate didn't work
    const employeeId = leave.employeeId || leave;
    const employee = employees.find(emp => (emp.id || emp._id) === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee ID: ${employeeId}`;
  };

  // Function to update rating and save to backend
  const updateLocalRating = async (employeeId, category, value) => {
    const key = `${employeeId}-${category}`;
    setEmployeeRatings(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
    
    // Get current ratings for this employee
    const currentRatings = employeeRatings;
    const updatedRatings = {
      ...currentRatings,
      [key]: parseInt(value)
    };
    
    // Extract individual ratings (ensure minimum value of 1)
    const efficiency = Math.max(updatedRatings[`${employeeId}-efficiency`] || 1, 1);
    const performance = Math.max(updatedRatings[`${employeeId}-performance`] || 1, 1);
    const teamwork = Math.max(updatedRatings[`${employeeId}-teamwork`] || 1, 1);
    
    // Auto-save to backend with all three required fields
    try {
      await updateRating(employeeId, {
        efficiency: efficiency,
        performance: performance,
        teamwork: teamwork
      });
(`Rating saved to backend: ${category} = ${value} for employee ${employeeId}`);
    } catch (error) {
('Failed to save rating to backend:', error);
    }
  };

  const getOverallRating = (employee) => {
    // Use the rating data from the database (employee.rating object)
    if (employee.rating && typeof employee.rating === 'object') {
      const efficiency = employee.rating.efficiency || 0;
      const performance = employee.rating.performance || 0;
      const teamwork = employee.rating.teamwork || 0;
      return Math.round((efficiency + performance + teamwork) / 3);
    }
    
    // Fallback to local ratings if database rating not available
    if (!employee.ratings || !Array.isArray(employee.ratings)) return 0;
    const total = employee.ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0);
    return Math.round(total / employee.ratings.length) || 0;
  };

  // Star rating component
  const StarRating = ({ rating, maxRating = 5 }) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#fbbf24' : '#d1d5db',
            fontSize: '14px',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {stars}
        <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>
          ({rating}/5)
        </span>
      </span>
    );
  };

  const handleCreateProject = async () => {
('🚀 Starting project creation process...');
('📝 New project data:', newProject);
    // Inline field validation for name/description (show messages under inputs instead of toast)
    const fieldErrors = { name: '', description: '' };
    const trimmedName = (newProject.name || '').trim();
    const trimmedDescription = (newProject.description || '').trim();
    if (!trimmedName) {
      fieldErrors.name = 'Project name is required';
    } else if (trimmedName.length < 3) {
      fieldErrors.name = 'Project name must be at least 3 characters long';
    }
    if (!trimmedDescription) {
      fieldErrors.description = 'Project description is required';
    } else if (trimmedDescription.length < 3) {
      fieldErrors.description = 'Project description must be at least 3 characters long';
    }
    if (fieldErrors.name || fieldErrors.description) {
      setNewProjectFieldErrors(fieldErrors);
      return; // stop submit; errors will be shown inline
    }
    
    // Comprehensive validation for required fields
    const validationErrors = [];
    
    // name/description handled inline above
    
    // Validate that at least one team member is selected
    if (!newProject.members || newProject.members.length === 0) {
      validationErrors.push('At least one team member must be selected');
    }
    
    // Validate date range if both dates are provided
    if (newProject.startDate && newProject.endDate) {
      const startDate = new Date(newProject.startDate);
      const endDate = new Date(newProject.endDate);
      
      if (endDate < startDate) {
        validationErrors.push('End date cannot be before start date');
      }
    }
    
    // Show all validation errors
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => showWarning(error));
      return;
    }
    
    try {
      // Filter data to only include allowed fields per backend schema
      const createData = {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        status: newProject.status,
        notes: newProject.notes?.trim() || '',
        ...(newProject.startDate && { startDate: newProject.startDate }),
        ...(newProject.endDate && { endDate: newProject.endDate })
      };
      
      // Extract member IDs from the members array
      if (newProject.members && newProject.members.length > 0) {
        const memberIds = newProject.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return member._id;
          } else if (typeof member === 'string') {
            return member;
          }
          return null;
        }).filter(id => id !== null);
        
        if (memberIds.length > 0) {
          createData.members = memberIds;
        }
      }
      
('📤 Creating project with filtered data:', createData);
('🔗 API endpoint:', '/it/projects');
('🔑 Auth token present:', !!localStorage.getItem('token'));
      
      const result = await createProject(createData);
('✅ Project creation result:', result);
      
      showSuccess('Project created successfully!');
      setNewProject({
        name: '',
        description: '',
        status: 'planned',
        members: [],
        notes: '',
        startDate: '',
        endDate: ''
      });
      setShowCreateProject(false);
    } catch (error) {
('❌ Error creating project:', error);
('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      // Use the error message from the backend or provide a user-friendly fallback
      let errorMessage = 'Failed to create project';
      
      if (error.message) {
        // The error message from the backend is already formatted
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please check your authentication.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied for this department.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all required fields are filled correctly.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showError(errorMessage);
    }
  };

  const handleUpdateRating = async (employeeId, newRating) => {
    try {
      await updateRating(employeeId, { rating: newRating });
    } catch (error) {
('Error updating rating:', error);
    }
  };


  // Leave form handlers


  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      // Only send status updates as per backend schema
      if (updates.status) {
        await updateTicket(ticketId, { status: updates.status });
      }
    } catch (error) {
('Error updating ticket:', error);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setShowEditTicket(true);
  };

  // Project edit handlers
  const handleEditProject = (project) => {
('Editing project:', project);
('Project ID:', project.id || project._id);
    setEditingProject(project);
    setShowEditProject(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    // Get and validate project ID
    const projectId = editingProject.id || editingProject._id;
    if (!projectId) {
      showError('Project ID is missing. Cannot update project.');
      return;
    }

    // Comprehensive validation for required fields
    const validationErrors = [];
    
    if (!editingProject.name || !editingProject.name.trim()) {
      validationErrors.push('Project name is required');
    } else if (editingProject.name.trim().length < 3) {
      validationErrors.push('Project name must be at least 3 characters long');
    }
    
    if (!editingProject.description || !editingProject.description.trim()) {
      validationErrors.push('Project description is required');
    } else if (editingProject.description.trim().length < 3) {
      validationErrors.push('Project description must be at least 3 characters long');
    }
    
    // Validate that at least one team member is selected
    if (!editingProject.members || editingProject.members.length === 0) {
      validationErrors.push('At least one team member must be selected');
    }
    
    // Validate date range if both dates are provided
    if (editingProject.startDate && editingProject.endDate) {
      const startDate = new Date(editingProject.startDate);
      const endDate = new Date(editingProject.endDate);
      
      if (endDate < startDate) {
        validationErrors.push('End date cannot be before start date');
      }
    }
    
    // Show all validation errors
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => showWarning(error));
      return;
    }

    try {
      // Filter data to only include allowed fields per backend schema
      const updateData = {
        name: editingProject.name.trim(),
        description: editingProject.description.trim(),
        status: editingProject.status,
        notes: editingProject.notes?.trim() || '',
        ...(editingProject.startDate && { startDate: editingProject.startDate }),
        ...(editingProject.endDate && { endDate: editingProject.endDate })
      };
      
      // Extract member IDs from the members array
      if (editingProject.members && Array.isArray(editingProject.members) && editingProject.members.length > 0) {
        const memberIds = editingProject.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return member._id;
          } else if (typeof member === 'string') {
            return member;
          }
          return null;
        }).filter(id => id !== null);
        
        if (memberIds.length > 0) {
          updateData.members = memberIds;
        }
      }
      
('Updating project with ID:', projectId);
('Updating project with filtered data:', updateData);
      await updateProject(projectId, updateData);
      showSuccess('Project updated successfully!');
      setShowEditProject(false);
      setEditingProject(null);
    } catch (error) {
('Error updating project:', error);
      
      // Use the error message from the backend or provide a user-friendly fallback
      let errorMessage = 'Failed to update project';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please check your authentication.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied for this department.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all required fields are filled correctly.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showError(errorMessage);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) {
      showError('Project ID is missing. Cannot delete project.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
('Deleting project with ID:', projectId);
      await deleteProject(projectId);
      showSuccess('Project deleted successfully!');
    } catch (error) {
('Error deleting project:', error);
      showError('Failed to delete project: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
      } catch (error) {
('Error deleting ticket:', error);
      }
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Leave form handler
  const handleCreateLeave = async () => {
    try {
('IT Department: Submitting leave request with data:', newLeave);
      
      if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
        showWarning('Please fill in all required fields');
        return;
      }

      // Validate date range
      const startDate = new Date(newLeave.startDate);
      const endDate = new Date(newLeave.endDate);
      
      if (startDate >= endDate) {
        showWarning('End date must be after start date');
        return;
      }

      const leaveData = {
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        status: 'pending'
      };

('IT Department: Calling itLeaveApi.submitEmployeeLeave with:', leaveData);
      const result = await itLeaveApi.submitEmployeeLeave(leaveData);
('IT Department: Leave submission result:', result);
      
      // The API returns data directly on success, or throws error on failure
      showSuccess('Leave request submitted successfully!');
      setNewLeave({
        type: '',
        startDate: '',
        endDate: ''
      });
      setShowLeaveForm(false);
    } catch (error) {
('IT Department: Error creating leave:', error);
('IT Department: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error occurred';
      showError('Failed to submit leave request: ' + errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#1c242e';
      case 'Planning': return '#f59e0b';
      case 'On Hold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px'
    }}>

      <div style={{ padding: '32px' }}>
        {/* Enhanced Stats Cards with Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Employees</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                </p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px',
                position: 'relative'
              }}>
                <Users size={20} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {Array.isArray(employees) ? employees.length : 0}
                </div>
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Tickets</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {ticketsLoading ? '...' : totalTickets || 0}
                </p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px',
                position: 'relative'
              }}>
                <Ticket size={20} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {totalTickets || 0}
                </div>
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[40, 35, 45, 30, 25, 20, 15].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #ef4444, #f87171)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Projects</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {projectsLoading ? '...' : totalProjects || 0}
                </p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px',
                position: 'relative'
              }}>
                <FolderOpen size={20} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {totalProjects || 0}
                </div>
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[55, 60, 65, 70, 75, 80, 85].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #10b981, #34d399)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

        </div>


        {/* Enhanced Navigation Tabs */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '8px'
          }}>
            <nav style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'employees', label: 'Employees', icon: Users },
                { id: 'tickets', label: 'Tickets', icon: Ticket },
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'leaves', label: 'Leaves', icon: Calendar }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#1c242e' : 'transparent',
                      color: isActive ? 'white' : '#6b7280',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }
                    }}
                  >
                    <IconComponent size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                IT Dashboard
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Overview of IT department activities and quick actions
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowCreateProject(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0e7490'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0891b2'}
                >
                  <FolderOpen size={16} />
                  New Project
                </button>

                <button
                  onClick={() => setShowLeaveForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  <Plus size={16} />
                  Submit Leave
                </button>

                <button
                  onClick={() => setShowAdvanceForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
                >
                  <Plus size={16} />
                  Request Advance
                </button>

        <button
          onClick={() => document.getElementById('pdf-upload').click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#0891b2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0e7490'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0891b2'}
        >
          <Upload size={16} />
          Upload Attendance Sheet
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            
          </div>
        )}

      {showAdvanceForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Request Advance
            </h3>
            {advancesLoading && (
              <div style={{
                marginBottom: '12px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                Checking existing requests...
              </div>
            )}
            {advanceError && (
              <div style={{
                marginBottom: '12px',
                padding: '10px 12px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                {advanceError}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); if (!advanceLoading) handleCreateAdvance(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="advance-amount" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Amount *
                </label>
                <input
                  id="advance-amount"
                  type="number"
                  min="1"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="advance-month" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Payroll Month *
                </label>
                <input
                  id="advance-month"
                  type="month"
                  value={advanceForm.payrollMonth}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, payrollMonth: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanceForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advanceLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: advanceLoading ? 'not-allowed' : 'pointer',
                    opacity: advanceLoading ? 0.8 : 1
                  }}
                >
                  {advanceLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {activeTab === 'employees' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>IT Employees</h2>
            </div>


            {employeesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading employees...</div>
              </div>
            ) : employeesError ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#ef4444' }}>Error: {employeesError}</div>
              </div>
            ) : Array.isArray(employees) && employees.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {employees.map((employee) => {
                  const rating = getOverallRating(employee);
                  return (
                    <div key={employee.id || employee._id} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#1c242e';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(28, 36, 46, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                            { employee.firstName+' ' + employee.lastName || 'Unknown Employee'}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            {employee.position || employee.role || 'IT Specialist'}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                            Average: {rating}/5
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        {/* Performance Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Performance</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'performance')}/5
                            </span>
                          </div>
                          <input
                            id={`performance-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'performance')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-performance`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
(`Performance rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                        </div>

                        {/* Efficiency Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Efficiency</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'efficiency')}/5
                            </span>
                          </div>
                          <input
                            id={`efficiency-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'efficiency')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-efficiency`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
(`Efficiency rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                        </div>

                        {/* Teamwork Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Teamwork</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'teamwork')}/5
                            </span>
                          </div>
                          <input
                            id={`teamwork-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'teamwork')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-teamwork`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
(`Teamwork rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                      </div>

                        {/* Note Field */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Note (Optional)</span>
                          </div>
                          <textarea
                            id={`rating-note-${employee.id || employee._id}`}
                            placeholder="Add a note about this rating... (minimum 2 characters)"
                            value={employeeRatings[`${employee.id || employee._id}-note`] || ''}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-note`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: value
                              }));
                            }}
                            style={{
                              width: '100%',
                              minHeight: '60px',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                              resize: 'vertical',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                            minLength={0}
                            maxLength={500}
                          />
                          <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
                            {(employeeRatings[`${employee.id || employee._id}-note`] || '').length}/500
                          </div>
                          
                          {/* Display Submitted Note under the input field */}
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>Submitted Note:</span>
                            </div>
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: '#f0f9ff',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              fontStyle: 'italic',
                              minHeight: '40px'
                            }}>
                              {employee.note || 'No note submitted yet'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          flex: 1,
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const employeeId = employee.id || employee._id;
                          
                          // Get current ratings for this employee
                          const efficiency = getRating(employeeId, 'efficiency');
                          const performance = getRating(employeeId, 'performance');
                          const teamwork = getRating(employeeId, 'teamwork');
                          
                          try {
                            // Backend expects efficiency, performance, teamwork, and optional note
                            // Employee ID is already in the URL path
                            const note = employeeRatings[`${employeeId}-note`] || '';
                            
                            // Note validation removed - backend will handle validation
                            
                            // Validate rating values
                            if (!efficiency || !performance || !teamwork) {
                              showWarning('Please provide all rating values before submitting.');
                              return;
                            }

                            if (efficiency < 1 || efficiency > 5 || 
                                performance < 1 || performance > 5 || 
                                teamwork < 1 || teamwork > 5) {
                              showWarning('Rating values must be between 1 and 5.');
                              return;
                            }
                            
                            const employeeName = employee?.firstName || employee?.name || employee?.employeeName || 'Employee';
                            const autoNote = `Rating updated for ${employeeName} - Performance: ${performance}, Efficiency: ${efficiency}, Teamwork: ${teamwork}`;
                            const finalNote = note || autoNote;
                            
('Note length check:');
('- User note:', note);
('- Auto note:', autoNote);
('- Final note:', finalNote);
('- Final note length:', finalNote.length);
                            
                            // Final validation removed - backend will handle validation
                            
                            const ratingData = {
                              efficiency: efficiency,
                              performance: performance,
                              teamwork: teamwork,
                              note: finalNote
                            };
                            
('Sending rating data:', ratingData);
                            await updateRating(employeeId, ratingData);
(`Rating submitted for ${employee.name || employee.firstName}:`, ratingData);
                            
                            // Clear the note field after successful submission
                            const noteKey = `${employeeId}-note`;
                            setEmployeeRatings(prev => ({
                              ...prev,
                              [noteKey]: ''
                            }));
                            
                            showSuccess('Rating submitted successfully!');
                            
                            // Note: The employee data will be refreshed on next page load
                            // The note will appear after page refresh
                          } catch (error) {
('Failed to submit rating:', error);
('Error details:', error.message);
('Error response:', error.response);
('Error status:', error.response?.status);
('Error data:', error.response?.data);
                            
                            // Provide more specific error message
                            let errorMessage = 'Failed to submit rating. Please try again.';
                            if (error.response?.data?.message) {
                              errorMessage = `Failed to submit rating: ${error.response.data.message}`;
                            } else if (error.message) {
                              errorMessage = `Failed to submit rating: ${error.message}`;
                            }
                            showError(errorMessage);
                          }
                        }}
                        >
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No employees found</div>
              </div>
            )}
          </div>
        )}

        {/* Similar styled content for tickets and projects tabs would go here */}
        {activeTab === 'tickets' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Support Tickets</h2>
            </div>

            {/* Status Filter */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                padding: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ 
                      position: 'relative',
                      display: 'inline-block',
                      width: '100%'
                    }}>
                      <div style={{ 
                        position: 'absolute',
                        top: '-8px',
                        left: '12px',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        zIndex: 1
                      }}>
                        Status Filter
                      </div>
                      <div className="status-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                        <div
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 12px center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px 16px',
                            paddingRight: '40px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {ticketStatusFilter === 'all' ? 'All Tickets' : 
                           ticketStatusFilter === 'open' ? 'Open' :
                           ticketStatusFilter === 'in_progress' ? 'In Progress' :
                           ticketStatusFilter === 'resolved' ? 'Resolved' :
                           ticketStatusFilter === 'closed' ? 'Closed' : 'All Tickets'}
                        </div>
                        
                        {showStatusDropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            marginTop: '4px',
                            overflow: 'hidden'
                          }}>
                            {[
                              { value: 'all', label: 'All Tickets' },
                              { value: 'open', label: 'Open' },
                              { value: 'in_progress', label: 'In Progress' },
                              { value: 'resolved', label: 'Resolved' },
                              { value: 'closed', label: 'Closed' }
                            ].map((option) => (
                              <div
                                key={option.value}
                                onClick={() => {
                                  handleStatusFilterChange(option.value);
                                  setShowStatusDropdown(false);
                                }}
                                style={{
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  color: '#374151',
                                  fontSize: '14px',
                                  fontWeight: '400',
                                  backgroundColor: ticketStatusFilter === option.value ? '#f9fafb' : '#ffffff',
                                  transition: 'background-color 0.2s ease',
                                  borderBottom: '1px solid #f3f4f6'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = ticketStatusFilter === option.value ? '#f9fafb' : '#ffffff';
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', alignSelf: 'flex-end', marginBottom: '4px' }}>
                    Showing {tickets.length} of {totalTickets} tickets
                  </div>
                </div>
              </div>
            </div>
            {ticketsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading tickets...</div>
              </div>
            ) : ticketsToDisplay.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {ticketsToDisplay.map((ticket) => (
                  <div key={ticket.id || ticket._id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                        {ticket.title || 'Support Ticket'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                        {ticket.description || 'No description available'}
                      </p>
                      {ticket.employee && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                          Submitted by: {ticket.employee.firstName} {ticket.employee.lastName}
                          {ticket.employee.email && ` (${ticket.employee.email})`}
                        </p>
                      )}
                      {(ticket.createdAt || ticket.created_at || ticket.submittedDate) && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                          <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                          Created: {new Date(ticket.createdAt || ticket.created_at || ticket.submittedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getPriorityColor(ticket.priority) + '20',
                        color: getPriorityColor(ticket.priority)
                      }}>
                        {ticket.priority || 'Medium'}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: ticket.status === 'resolved' ? '#10b981' : ticket.status === 'in_progress' ? '#f59e0b' : '#6b7280',
                        color: 'white'
                      }}>
                        {ticket.status || 'open'}
                      </span>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#1c242e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEditTicket(ticket)}
                      >
                        Edit
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteTicket(ticket.id || ticket._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasActiveTicketFilters ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No tickets found for the selected status filter</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  Try changing the status filter or clear it to see all tickets
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No tickets found</div>
              </div>
            )}
            
            {/* Pagination for Tickets */}
            {ticketsToDisplay.length > 0 && ticketsTotalPages > 1 && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <SimplePagination
                  currentPage={ticketsCurrentPage}
                  totalPages={ticketsTotalPages}
                  totalItems={totalTickets}
                  pageSize={pageSize}
                  onPageChange={handleTicketsPageChange}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Projects</h2>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Showing {projects.length} of {totalProjects} projects
                </div>
              </div>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: '#1c242e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => setShowCreateProject(true)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
              >
                <Plus size={16} />
                New Project
              </button>
            </div>

            {/* Search and Filter Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                padding: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Search Bar */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ 
                      position: 'relative',
                      display: 'inline-block',
                      width: '100%'
                    }}>
                      <div style={{ 
                        position: 'absolute',
                        top: '-8px',
                        left: '12px',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        zIndex: 1
                      }}>
                        Search Projects
                      </div>
                      <input
                        type="text"
                        value={projectSearchTerm}
                        onChange={(e) => handleProjectSearchChange(e.target.value)}
                        placeholder="Search by name or description..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#ffffff',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '400',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#9ca3af';
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ 
                      position: 'relative',
                      display: 'inline-block',
                      width: '100%'
                    }}>
                      <div style={{ 
                        position: 'absolute',
                        top: '-8px',
                        left: '12px',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        zIndex: 1
                      }}>
                        Status Filter
                      </div>
                      <div className="project-status-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                        <div
                          onClick={() => setShowProjectStatusDropdown(!showProjectStatusDropdown)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 12px center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px 16px',
                            paddingRight: '40px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {projectStatusFilter === 'all' ? 'All Projects' : 
                           projectStatusFilter === 'planned' ? 'Planned' :
                           projectStatusFilter === 'in_progress' ? 'In Progress' :
                           projectStatusFilter === 'completed' ? 'Completed' :
                           projectStatusFilter === 'on_hold' ? 'On Hold' : 'All Projects'}
                        </div>
                        
                        {showProjectStatusDropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            marginTop: '4px',
                            overflow: 'hidden'
                          }}>
                            {[
                              { value: 'all', label: 'All Projects' },
                              { value: 'planned', label: 'Planned' },
                              { value: 'in_progress', label: 'In Progress' },
                              { value: 'completed', label: 'Completed' },
                              { value: 'on_hold', label: 'On Hold' }
                            ].map((option) => (
                              <div
                                key={option.value}
                                onClick={() => {
                                  handleProjectStatusFilterChange(option.value);
                                  setShowProjectStatusDropdown(false);
                                }}
                                style={{
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  color: '#374151',
                                  fontSize: '14px',
                                  fontWeight: '400',
                                  backgroundColor: projectStatusFilter === option.value ? '#f9fafb' : '#ffffff',
                                  transition: 'background-color 0.2s ease',
                                  borderBottom: '1px solid #f3f4f6'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = projectStatusFilter === option.value ? '#f9fafb' : '#ffffff';
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div style={{ fontSize: '12px', color: '#6b7280', alignSelf: 'flex-end', marginBottom: '4px' }}>
                    Showing {projects.length} of {totalProjects} projects
                  </div>
                </div>
              </div>
            </div>

            {projectsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading projects...</div>
              </div>
            ) : projectsToDisplay.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {projectsToDisplay.map((project) => (
                  <div key={project.id || project._id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                        {project.name || 'Project'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {project.description || 'No description available'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(project.status) + '20',
                          color: getStatusColor(project.status)
                        }}>
                          {project.status || 'Planning'}
                        </span>
                      </div>
                      {(project.startDate || project.endDate) && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          {project.startDate && (
                            <span style={{ marginRight: '16px' }}>
                              📅 Start: {new Date(project.startDate).toLocaleDateString()}
                        </span>
                          )}
                          {project.endDate && (
                            <span>
                              📅 End: {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                      )}
                      {project.members && project.members.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500', marginRight: '8px' }}>👥 Team:</span>
                          <span>
                            {project.members.map((member, index) => (
                              <span key={member._id || member.id || index}>
                                {member.firstName} {member.lastName}
                                {index < project.members.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                      {project.notes && (
                        <div style={{ 
                          marginTop: '12px', 
                          padding: '12px', 
                          backgroundColor: 'transparent',
                          border: '1px solid #ffc107',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#856404'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📝</span>
                            <span>Note:</span>
                          </div>
                          <div style={{ lineHeight: '1.5' }}>
                            {project.notes}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#1c242e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteProject(project.id || project._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasActiveProjectFilters ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No projects found matching your search or filter criteria</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  Try changing your search term or filter to see more projects
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No projects found</div>
              </div>
            )}
            
            {/* Pagination for Projects */}
            {projectsToDisplay.length > 0 && projectsTotalPages > 1 && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <SimplePagination
                  currentPage={projectsCurrentPage}
                  totalPages={projectsTotalPages}
                  totalItems={totalProjects}
                  pageSize={pageSize}
                  onPageChange={handleProjectsPageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <ITLeavesManagement />
          </div>
        )}

      </div>


      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
('Form submitted for employee:', editingEmployee);
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-employee-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Name
                </label>
                <input
                  id="edit-employee-name"
                  type="text"
                  defaultValue={editingEmployee?.name || editingEmployee?.firstName || ''}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-employee-email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  id="edit-employee-email"
                  type="email"
                  defaultValue={editingEmployee?.email || ''}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-employee-department" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Department
                </label>
                <input
                  id="edit-employee-department"
                  type="text"
                  defaultValue={editingEmployee?.department || 'IT'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Project Form Modal */}
      {showCreateProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Create New Project
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateProject();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Project Name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={newProject.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProject(prev => ({ ...prev, name: value }));
                    const trimmed = (value || '').trim();
                    setNewProjectFieldErrors(prev => ({
                      ...prev,
                      name: !trimmed
                        ? 'Project name is required'
                        : trimmed.length < 3
                          ? 'Project name must be at least 3 characters long'
                          : ''
                    }));
                  }}
                  placeholder="Enter project name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
                {newProjectFieldErrors.name && (
                  <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {newProjectFieldErrors.name}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProject(prev => ({ ...prev, description: value }));
                    const trimmed = (value || '').trim();
                    setNewProjectFieldErrors(prev => ({
                      ...prev,
                      description: !trimmed
                        ? 'Project description is required'
                        : trimmed.length < 3
                          ? 'Project description must be at least 3 characters long'
                          : ''
                    }));
                  }}
                  placeholder="Enter project description"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required
                />
                {newProjectFieldErrors.description && (
                  <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {newProjectFieldErrors.description}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  id="project-status"
                  value={newProject.status}
                  onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-members" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Team Members
                </label>
                <select
                  id="project-members"
                  multiple
                  value={newProject.members}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProject(prev => ({ ...prev, members: selectedOptions }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                >
                  {employees.map(employee => (
                    <option key={employee.id || employee._id} value={employee.id || employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Hold Ctrl/Cmd to select multiple members
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-notes" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  id="project-notes"
                  value={newProject.notes}
                  onChange={(e) => setNewProject(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter project notes (optional)"
                  rows={3}
                  maxLength={1000}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  {newProject.notes.length}/1000 characters
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  id="project-start-date"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date
                </label>
                <input
                  id="project-end-date"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProject(false);
                    setNewProject({
                      name: '',
                      description: '',
                      status: 'planned',
                      members: [],
                      notes: '',
                      startDate: '',
                      endDate: ''
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && editingProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Edit Project
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProject();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Project Name *
                </label>
                <input
                  id="edit-project-name"
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  id="edit-project-description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  id="edit-project-status"
                  value={editingProject.status}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-members" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Team Members
                </label>
                <select
                  id="edit-project-members"
                  multiple
                  value={editingProject.members || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setEditingProject(prev => ({ ...prev, members: selectedOptions }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                >
                  {employees.map(employee => (
                    <option key={employee.id || employee._id} value={employee.id || employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Hold Ctrl/Cmd to select multiple members
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-notes" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  id="edit-project-notes"
                  value={editingProject.notes || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter project notes (optional)"
                  rows={3}
                  maxLength={1000}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  {(editingProject.notes || '').length}/1000 characters
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-project-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  id="edit-project-start-date"
                  type="date"
                  value={editingProject.startDate || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="edit-project-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date
                </label>
                <input
                  id="edit-project-end-date"
                  type="date"
                  value={editingProject.endDate || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProject(false);
                    setEditingProject(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditTicket && editingTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Update Ticket Status
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                <strong>Title:</strong> {editingTicket.title}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                <strong>Description:</strong> {editingTicket.description}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                <strong>Current Status:</strong> {editingTicket.status || 'open'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="ticket-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                New Status
              </label>
              <select
                id="ticket-status"
                value={editingTicket.status || 'open'}
                onChange={(e) => setEditingTicket(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditTicket(false);
                  setEditingTicket(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleUpdateTicket(editingTicket.id || editingTicket._id, { status: editingTicket.status });
                    showSuccess('Ticket status updated successfully!');
                    setShowEditTicket(false);
                    setEditingTicket(null);
                  } catch (error) {
                    showError('Failed to update ticket status: ' + error.message);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Form Modal */}
      {showLeaveForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit Leave Request
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateLeave();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="leave-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Leave Type *
                </label>
                <select
                  id="leave-type"
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="leave-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date *
                </label>
                <input
                  id="leave-start-date"
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="leave-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date *
                </label>
                <input
                  id="leave-end-date"
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* PDF Upload Dialog */}
      {selectedFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Upload Attendance Sheet
            </h3>
            
            {/* File Preview */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={32} color="#059669" />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {formatFileSize(selectedFile.size)} • Attendance Sheet
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {uploadError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {uploadError}
              </div>
            )}
            
            {uploadSuccess && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#059669',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {uploadSuccess}
              </div>
            )}

            {/* Upload Progress */}
            {uploadLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #0891b2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Uploading file...
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadError(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: uploadLoading ? '#9ca3af' : '#0891b2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: uploadLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Dialog */}
      {showPdfViewer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '0',
            width: '95%',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={24} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  PDF Viewer
                </h3>
              </div>
              <button
                onClick={() => setShowPdfViewer(false)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, padding: '0' }}>
              <iframe
                src={selectedPdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '0 0 8px 8px' }}
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files Section */}
      {uploadedFiles.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          maxWidth: '400px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 100
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Upload size={16} />
            Uploaded Files
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uploadedFiles.map((file) => (
              <div key={file.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <FileText size={16} color="#dc2626" />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => handleViewPdf(file.url)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                  title="View PDF"
                >
                  👁️
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ITDepartment;
