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
  Target,
  Megaphone,
  BarChart3,
  Globe,
  Camera,
  PenTool,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useMarketingEmployees, useMarketingProjects, useMarketingTickets, useMarketingLeaves } from '../../hooks/useMarketingData';
import { marketingCustomerApi } from '../../services/marketingApi';
import SimplePagination from '../common/SimplePagination';

const DigitalMarketingDepartment = () => {
  // Get user from auth context
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Use real API data hooks - MUST be called before any conditional returns
  const marketingEmployeesHook = useMarketingEmployees();
  const { 
    employees, 
    loading: employeesLoading, 
    error: employeesError
  } = marketingEmployeesHook;
  const updateRating = marketingEmployeesHook.updateRating;
  
  // Debug logging for employees
  useEffect(() => {
     ('🔍 Marketing Employees Data:', {
      count: employees.length,
      loading: employeesLoading,
      error: employeesError,
      employees: employees
    });
    
    if (employees.length === 0 && !employeesLoading) {
      console.warn('⚠️ No employees found for Digital Marketing department');
    }
  }, [employees, employeesLoading, employeesError]);
  
  // Filter state for projects (used for filtering customer list)
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [showProjectStatusDropdown, setShowProjectStatusDropdown] = useState(false);

  // State for customer sections
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSections, setShowCustomerSections] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerProjects, setCustomerProjects] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerProjectsLoading, setCustomerProjectsLoading] = useState(false);
  const [customerProjectsCurrentPage, setCustomerProjectsCurrentPage] = useState(1);
  const [customerProjectsPageSize, setCustomerProjectsPageSize] = useState(10);
  const [customerProjectsTotal, setCustomerProjectsTotal] = useState(0);
  
  // State for customer list pagination
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [customersPageSize, setCustomersPageSize] = useState(10);
  const [customersTotal, setCustomersTotal] = useState(0);

  const { 
    projects, 
    totalProjects,
    loading: projectsLoading,
    createProject, 
    updateProject, 
    deleteProject,
    fetchProjects
  } = useMarketingProjects(1, 1000); // Load all projects for counting and customer extraction
  
  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError, 
    createTicket, 
    updateTicket, 
    deleteTicket 
  } = useMarketingTickets();
  
  const { 
    leaves, 
    loading: leavesLoading, 
    error: leavesError, 
    submitLeave 
  } = useMarketingLeaves();

  // All state hooks must be declared before any conditional returns
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planned',
    members: [],
    notes: '',
    startDate: '',
    endDate: '',
    customerName: ''
  });
  
  // State for customer selection mode
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isEditNewCustomer, setIsEditNewCustomer] = useState(false);

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

  // State for ticket submission
  const [showSubmitTicket, setShowSubmitTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // Date validation errors for project forms
  const [newProjectDateErrors, setNewProjectDateErrors] = useState({ start: '', end: '', range: '' });
  const [editProjectDateErrors, setEditProjectDateErrors] = useState({ start: '', end: '', range: '' });

  // Utilities: date validation for project forms
  const validateDates = (startValue, endValue) => {
    const errors = { start: '', end: '', range: '' };
    if (startValue) {
      const d = new Date(startValue);
      if (isNaN(d.getTime())) errors.start = 'Invalid start date';
    }
    if (endValue) {
      const d = new Date(endValue);
      if (isNaN(d.getTime())) errors.end = 'Invalid end date';
    }
    if (startValue && endValue) {
      const s = new Date(startValue);
      const e = new Date(endValue);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s >= e) {
        errors.range = 'End date must be after start date';
      }
    }
    return errors;
  };

  // Check if user has access to Digital Marketing department
  // Since department info is not available in the user object, allow access
  // The backend will handle the actual authorization
  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>
          You must be logged in to access the Digital Marketing department.
        </p>
      </div>
    );
  }
  
  // No longer need to filter all projects - we show customers instead

  // Filter customer projects by search term when in customer view
  // Note: Status filtering is now handled by backend
  const filteredCustomerProjects = (() => {
    if (showCustomerSections && selectedCustomer) {
      let filtered = customerProjects;
      
      // Filter by search term if provided (client-side for quick search)
      if (projectSearchTerm.trim()) {
        filtered = filtered.filter(project => {
          const projectName = project.name || '';
          const projectDescription = project.description || '';
          return projectName.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                 projectDescription.toLowerCase().includes(projectSearchTerm.toLowerCase());
        });
      }
      
      return filtered;
    }
    return customerProjects;
  })();

  // Filter customers based on search term
  const filteredCustomers = (() => {
    if (projectSearchTerm.trim() && customers.length > 0) {
      return customers.filter(customer => {
        const customerName = typeof customer === 'string' ? customer : (customer.name || customer.customerName || customer.title || '');
        return customerName.toLowerCase().includes(projectSearchTerm.toLowerCase());
      });
    }
    return customers;
  })();

  // Search handler
  const handleProjectSearchChange = (searchTerm) => {
    setProjectSearchTerm(searchTerm);
     ('🔍 Search term:', searchTerm);
     ('🔍 Show customer sections:', showCustomerSections);
     ('🔍 Customers:', customers);
  };

  // Status filter handler - refetch customer projects with new status
  const handleProjectStatusFilterChange = async (status) => {
    setProjectStatusFilter(status);
    setShowProjectStatusDropdown(false);
    
    // If we're viewing customer projects, refetch with new status filter
    if (showCustomerSections && selectedCustomer) {
      setCustomerProjectsCurrentPage(1); // Reset to first page when filtering
      const customerName = selectedCustomer.name || selectedCustomer.customerName || selectedCustomer.title;
      await fetchCustomerProjects(customerName, 1, customerProjectsPageSize, status);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers(customersCurrentPage, customersPageSize);
  }, [customersCurrentPage, customersPageSize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectStatusDropdown && !event.target.closest('.project-status-dropdown-container')) {
        setShowProjectStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectStatusDropdown]);

  // Fetch all customers from API with pagination
  const fetchCustomers = async (page = 1, limit = 10) => {
    try {
      setCustomersLoading(true);
       ('🔄 Fetching customers from API... Page:', page, 'Limit:', limit);
      const customersData = await marketingCustomerApi.getAllCustomers(page, limit);
       ('📡 Customers API Response:', customersData);
      
      // Handle backend response format: { success: true, data: [...], total, page, limit, totalPages }
      let customersList = [];
      let totalCustomers = 0;
      
      if (Array.isArray(customersData)) {
        customersList = customersData;
        totalCustomers = customersData.length;
      } else if (customersData && customersData.data && Array.isArray(customersData.data)) {
        customersList = customersData.data;
        totalCustomers = customersData.total || customersData.totalPages * limit || customersData.data.length;
         ('📊 Using backend pagination data:', { total: totalCustomers, page: customersData.page, totalPages: customersData.totalPages });
      } else if (customersData && customersData.success && Array.isArray(customersData.data)) {
        customersList = customersData.data;
        totalCustomers = customersData.total || customersData.totalPages * limit || customersData.data.length;
      }
      
       ('📊 Customers loaded:', customersList.length, 'Total:', totalCustomers);
      setCustomers(customersList);
      setCustomersTotal(totalCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setCustomersTotal(0);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch projects for a specific customer (with pagination and status filter)
  const fetchCustomerProjects = async (customerName, page = 1, pageSize = 10, status = null) => {
    try {
      setCustomerProjectsLoading(true);
        ('🔄 Fetching projects for customer:', customerName, 'Page:', page, 'PageSize:', pageSize, 'Status:', status);
        ('🔄 API Endpoint will be:', `/digitalMarketing/customers/${customerName}/projects`);
      
      // Pass status filter to API
      const projectsData = await marketingCustomerApi.getCustomerProjects(customerName, page, pageSize, status);
        ('📡 Customer Projects API Response:', projectsData);
        ('📡 Response type:', typeof projectsData, 'Is Array:', Array.isArray(projectsData));
      
      // Handle backend response format: { data: [...], total, page, limit, totalPages }
      let projectsList = [];
      let totalProjects = 0;
      
      if (Array.isArray(projectsData)) {
        projectsList = projectsData;
        totalProjects = projectsData.length;
      } else if (projectsData && projectsData.data && Array.isArray(projectsData.data)) {
        projectsList = projectsData.data;
        totalProjects = projectsData.total || projectsData.totalPages * pageSize || projectsData.data.length;
          ('📊 Using backend pagination data:', { total: totalProjects, page: projectsData.page, totalPages: projectsData.totalPages });
      }
      
        ('📊 Customer projects loaded:', projectsList.length, 'Total:', totalProjects);
        ('📊 Setting customerProjectsTotal to:', totalProjects);
        ('📊 customerProjects array will have length:', projectsList.length);
        ('📊 Pagination should show:', !customerProjectsLoading, '&&', projectsList.length > 0);
      
      setCustomerProjects(projectsList);
      setCustomerProjectsTotal(totalProjects);
      
      // Log after state is set to verify
        ('✅ State updated - customerProjects:', projectsList.length, 'customerProjectsTotal:', totalProjects);
      return { projects: projectsList, total: totalProjects };
    } catch (error) {
      console.error('Error fetching customer projects:', error);
      setCustomerProjects([]);
      setCustomerProjectsTotal(0);
      return { projects: [], total: 0 };
    } finally {
      setCustomerProjectsLoading(false);
    }
  };

  // Extract customer name from project (uses customerName field only)
  const extractCustomerFromProject = (project) => {
    // Only use the direct customerName field
    if (project.customerName && project.customerName.trim() !== '') {
      return project.customerName.trim();
    }
    
    return '';
  };
  
  // Handle customer section click
  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSections(true);
    setCustomerProjectsCurrentPage(1); // Reset to first page
    setProjectStatusFilter('all'); // Reset status filter when switching customers
    // Fetch projects for this specific customer using customer name
    const customerName = customer.name || customer.customerName || customer.title;
      ('🔍 Customer object:', customer);
      ('🔍 Extracted customer name:', customerName);
    await fetchCustomerProjects(customerName, 1, customerProjectsPageSize, 'all');
  };
  
  // Handle back to all projects
  const handleBackToAllProjects = () => {
    setSelectedCustomer(null);
    setShowCustomerSections(false);
    setCustomerProjects([]);
    setCustomerProjectsCurrentPage(1);
    setCustomerProjectsTotal(0);
  };

  // Handle customer projects pagination
  const handleCustomerProjectsPageChange = async (newPage) => {
    if (selectedCustomer) {
      setCustomerProjectsCurrentPage(newPage);
      const customerName = selectedCustomer.name || selectedCustomer.customerName || selectedCustomer.title;
      await fetchCustomerProjects(customerName, newPage, customerProjectsPageSize, projectStatusFilter);
    }
  };

  // Handle customers list pagination
  const handleCustomersPageChange = (newPage) => {
    setCustomersCurrentPage(newPage);
  };

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

  // Function to update rating locally (without auto-saving to backend)
  const updateLocalRating = (employeeId, category, value) => {
    const key = `${employeeId}-${category}`;
    setEmployeeRatings(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  // Function to submit rating with note to backend
  const submitRatingWithNote = async (employeeId, note = '') => {
     ('🔍 submitRatingWithNote called with:', { employeeId, note });
     ('🔍 updateRating available:', updateRating, typeof updateRating);
    
    if (typeof updateRating !== 'function') {
      console.error('❌ updateRating is not a function!', updateRating);
      showError('Error: Rating function not available. Please refresh the page.');
      return;
    }
    
    // Get current ratings for this employee
    const efficiency = Math.max(employeeRatings[`${employeeId}-efficiency`] || 1, 1);
    const performance = Math.max(employeeRatings[`${employeeId}-performance`] || 1, 1);
    const teamwork = Math.max(employeeRatings[`${employeeId}-teamwork`] || 1, 1);
    
    try {
      // Use real API to update rating with note
      const ratingData = {
        efficiency: efficiency,
        performance: performance,
        teamwork: teamwork,
        note: note || `Rating updated - Performance: ${performance}, Efficiency: ${efficiency}, Teamwork: ${teamwork}`
      };
      
       ('📤 Sending rating data with note:', ratingData);
       ('📤 Employee ID:', employeeId);
      
      const result = await updateRating(employeeId, ratingData);
       ('✅ Rating update result:', result);
       (`Rating saved with note for employee ${employeeId}`);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Failed to save rating:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error response:', error.response);
      
      // Re-throw the error with original message
      throw error;
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
    // Validate required fields
    if (!newProject.name.trim()) {
      showWarning('Project name is required');
      return;
    }
    // Validate project name minimum length (backend requires min 3 chars)
    if (newProject.name.trim().length < 3) {
      showWarning('Project name must be at least 3 characters');
      return;
    }
    if (!newProject.description.trim()) {
      showWarning('Project description is required');
      return;
    }
    // Validate description maximum length (backend max 500)
    if (newProject.description.trim().length > 500) {
      showWarning('Project description must be at most 500 characters');
      return;
    }
    if (newProject.members.length === 0) {
      showWarning('At least one team member must be selected');
      return;
    }
    
    // Validate date format and logic only if provided (both optional in backend)
    if (newProject.startDate) {
      const startDate = new Date(newProject.startDate);
      if (isNaN(startDate.getTime())) {
        showWarning('Please enter a valid start date');
        return;
      }
    }
    if (newProject.endDate) {
      const endDate = new Date(newProject.endDate);
      if (isNaN(endDate.getTime())) {
        showWarning('Please enter a valid end date');
        return;
      }
    }
    if (newProject.startDate && newProject.endDate) {
      const startDate = new Date(newProject.startDate);
      const endDate = new Date(newProject.endDate);
      if (startDate >= endDate) {
        showWarning('End date must be after start date');
        return;
      }
    }
    
    // Validate status
    const validStatuses = ['planned', 'in_progress', 'on_hold', 'completed'];
    if (!validStatuses.includes(newProject.status)) {
      showWarning('Please select a valid project status');
      return;
    }
    
    // Validate notes maximum length (backend: joi.string().max(1000).allow("").optional())
    if ((newProject.notes || '').length > 1000) {
      showWarning('Notes must be at most 1000 characters');
      return;
    }
    
    try {
      // Use real API to create project
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        status: newProject.status,
        members: newProject.members, // Send the IDs directly, not the full objects
        notes: newProject.notes || '' // Send notes as-is (allow empty string)
      };
      
      // Add customerName field separately (don't mix it into notes)
      if (newProject.customerName) {
        projectData.customerName = newProject.customerName;
      }
      
       ('📤 Sending project data:', projectData);
       ('📤 Members array:', newProject.members);
       ('📤 Members length:', newProject.members.length);
      
      try {
      await createProject(projectData);
      showSuccess('Project created successfully!');
        setNewProject({
          name: '',
          description: '',
          status: 'planned',
          members: [],
          notes: '',
          startDate: '',
          endDate: '',
          customerName: ''
        });
        setShowCreateProject(false);
        setIsNewCustomer(false);
        
        // Refresh projects data
        await fetchProjects();
        // Refresh customers data to update project counts
        await fetchCustomers();
      } catch (customerNameError) {
        // If customerName field is not allowed, retry without it
        if (customerNameError.message && customerNameError.message.includes('customerName') && customerNameError.message.includes('not allowed')) {
         ('🔄 Backend doesn\'t support customerName field yet, retrying without it...');
          const fallbackProjectData = {
            name: newProject.name,
            description: newProject.description,
            startDate: newProject.startDate,
            endDate: newProject.endDate,
            status: newProject.status,
            members: newProject.members,
            notes: newProject.notes || '' // Send notes as-is, don't mix with customer name
          };
          
          await createProject(fallbackProjectData);
          showSuccess('Project created successfully! (Note: Customer name field not supported by backend)');
          setNewProject({
            name: '',
            description: '',
            status: 'planned',
            members: [],
            notes: '',
            startDate: '',
            endDate: '',
            customerName: ''
          });
          setShowCreateProject(false);
          setIsNewCustomer(false);
          
          // Refresh projects data
          await fetchProjects();
          // Refresh customers data to update project counts
          await fetchCustomers();
        } else {
          throw customerNameError;
        }
      }
    } catch (error) {
        console.error('Error creating project:', error);
      showError('Failed to create project: ' + error.message);
    }
  };

  const handleSubmitTicket = async () => {
    // Validate required fields
    if (!newTicket.title.trim()) {
      showWarning('Please select an issue type');
      return;
    }
    
    if (!newTicket.description.trim()) {
      showWarning('Please provide a description');
      return;
    }
    
    if (newTicket.description.trim().length < 10) {
      showWarning('Description must be at least 10 characters long');
      return;
    }
    
    try {
      // Create new ticket (status and department come from backend)
      const ticketData = {
        title: newTicket.title.trim(),
        description: newTicket.description.trim(),
        priority: newTicket.priority
      };
      
       ('📤 Creating ticket:', ticketData);
      await createTicket(ticketData);
      showSuccess('Ticket submitted successfully!');
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium'
      });
      setShowSubmitTicket(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
      showError('Failed to submit ticket: ' + error.message);
    }
  };

  const handleSubmitLeave = async () => {
    // Validate required fields
    if (!newLeave.type) {
      showWarning('Please select a leave type');
      return;
    }
    if (!newLeave.startDate) {
      showWarning('Start date is required');
      return;
    }
    if (!newLeave.endDate) {
      showWarning('End date is required');
      return;
    }
    
    // Validate date logic
    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);
    
    if (startDate >= endDate) {
      showWarning('End date must be after start date');
      return;
    }
    
    try {
      // Use real API to submit leave (employeeId and submittedAt come from token)
      const leaveData = {
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        status: 'pending'
      };
      
       ('📤 Submitting leave data:', leaveData);
      await submitLeave(leaveData);
      showSuccess('Leave request submitted successfully!');
      setNewLeave({
        type: '',
        startDate: '',
        endDate: ''
      });
      setShowLeaveForm(false);
    } catch (error) {
      console.error('Error submitting leave:', error);
      showError('Failed to submit leave: ' + error.message);
    }
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      // Mock ticket update - replace with actual API
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setShowEditTicket(true);
  };

  // Project edit handlers
  const handleEditProject = (project) => {
    // Extract customer name using the hybrid approach
    const customerName = extractCustomerFromProject(project);
    const projectWithCustomer = {
      ...project,
      customerName: customerName
    };
    
    // Check if the customer name exists in the customers list
    const customerExists = customers.some(customer => {
      const existingCustomerName = typeof customer === 'string' ? customer : (customer.name || customer.customerName || customer.title || '');
      return existingCustomerName === customerName;
    });
    
    // If customer doesn't exist in list and has a value, show as new customer input
    setIsEditNewCustomer(!customerExists && customerName !== '');
    
    setEditingProject(projectWithCustomer);
    setShowEditProject(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      // Get the project ID and validate it
      let projectId = editingProject.id || editingProject._id;
      
      // Validate project ID
      if (!projectId) {
        throw new Error('Project ID is missing. Cannot update project.');
      }
      
      // Convert to string if it's not already
      projectId = String(projectId).trim();
      
      // Check if ID looks like a valid MongoDB ObjectId (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(projectId)) {
        // Try to find a valid ID in other possible fields
        const possibleIds = [
          editingProject.id,
          editingProject._id,
          editingProject.projectId,
          editingProject.project_id,
          editingProject.uuid,
          editingProject.guid
        ].filter(id => id && String(id).trim().length > 0);
        
        // Look for a valid ObjectId format
        const validId = possibleIds.find(id => objectIdRegex.test(String(id).trim()));
        if (validId) {
          projectId = String(validId).trim();
        } else {
          throw new Error(`Invalid project ID format: "${projectId}". Expected 24-character hex string.`);
        }
      }
      
      // Filter out fields that are not allowed in update requests
      const allowedFields = ['name', 'description', 'customerName', 'status', 'members', 'notes', 'startDate', 'endDate'];
      const updateData = {};
      
      // Don't include ID in the request body - it's already in the URL
      
      // Include allowed fields in the update data
      allowedFields.forEach(field => {
        if (editingProject.hasOwnProperty(field)) {
          if (field === 'members') {
            // Handle members specially - extract IDs from objects if needed
            if (editingProject.members && editingProject.members.length > 0) {
              // If members are populated objects, extract their IDs
              const memberIds = editingProject.members.map(member => {
                if (typeof member === 'object' && member._id) {
                  return member._id;
                } else if (typeof member === 'object' && member.id) {
                  return member.id;
                } else if (typeof member === 'string') {
                  return member;
                }
                return null;
              }).filter(id => id !== null);
              
              updateData[field] = memberIds;
            } else {
              updateData[field] = editingProject[field];
            }
          } else if (field === 'notes') {
            // Handle notes field specially - allow clearing notes completely
            const originalNotes = editingProject.notes || '';
            
            // Remove existing customer prefix if it exists to get the actual notes content
            const cleanNotes = originalNotes.replace(/^Customer:\s*.*?(?:\n|$)/, '').trim();
            
            // Always use the clean notes (allow empty string to clear the field)
            updateData[field] = cleanNotes;
          } else if (field === 'description' || field === 'name' || field === 'status' || field === 'startDate' || field === 'endDate') {
            // Include these fields as-is (backend handles optionality)
            updateData[field] = editingProject[field];
          } else {
            updateData[field] = editingProject[field];
          }
        }
      });
      
      // Validate name only if provided (backend requires min 3, max 100)
      if (updateData.name !== undefined) {
        const trimmedName = String(updateData.name).trim();
        if (trimmedName.length > 0 && trimmedName.length < 3) {
          throw new Error('Project name must be at least 3 characters');
        }
        if (trimmedName.length > 100) {
          throw new Error('Project name must be at most 100 characters');
        }
      }
      
      // Remove description min; enforce max 500 if provided
      if (updateData.description !== undefined) {
        const trimmedDesc = String(updateData.description).trim();
        if (trimmedDesc.length > 500) {
          throw new Error('Project description must be at most 500 characters');
        }
      }
      
      // Validate notes max 1000 if provided (allow empty string)
      if (updateData.notes !== undefined) {
        if (updateData.notes.length > 1000) {
          throw new Error('Notes must be at most 1000 characters');
        }
      }
      
      // Validate dates if provided: ensure valid dates and end > start
      const hasStart = updateData.startDate !== undefined && String(updateData.startDate).trim() !== '';
      const hasEnd = updateData.endDate !== undefined && String(updateData.endDate).trim() !== '';
      if (hasStart) {
        const s = new Date(updateData.startDate);
        if (isNaN(s.getTime())) {
          throw new Error('Please enter a valid start date');
        }
      }
      if (hasEnd) {
        const e = new Date(updateData.endDate);
        if (isNaN(e.getTime())) {
          throw new Error('Please enter a valid end date');
        }
      }
      if (hasStart && hasEnd) {
        const s = new Date(updateData.startDate);
        const e = new Date(updateData.endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s >= e) {
          throw new Error('End date must be after start date');
        }
      }
      
      // Debug: Log what we're sending
       ('📤 Updating project ID:', projectId);
       ('📤 Update data being sent:', JSON.stringify(updateData, null, 2));
       ('📤 Notes value:', updateData.notes);
       ('📤 Notes length:', updateData.notes?.length || 0);
      
      // Try the update
      await updateProject(projectId, updateData);
      showSuccess('Project updated successfully!');
      setShowEditProject(false);
      setEditingProject(null);
      setIsEditNewCustomer(false);
      
      // Auto-refresh data after update with correct pagination
      await fetchProjects(1, 1000); // Reload all projects
      await fetchCustomers();
      
      // If viewing a specific customer, refresh their projects too
      if (showCustomerSections && selectedCustomer) {
        const customerName = selectedCustomer?.name || selectedCustomer;
        await fetchCustomerProjects(customerName, customerProjectsCurrentPage, customerProjectsPageSize);
      }
      
    } catch (error) {
        console.error('Error updating project:', error);
      
      // If customerName field is not allowed, retry without it
      if (error.message && error.message.includes('customerName') && error.message.includes('not allowed')) {
         ('🔄 Backend doesn\'t support customerName field in updates, retrying without it...');
        
        try {
          // Remove customerName from updateData and ensure it's in notes
          const fallbackUpdateData = { ...updateData };
          delete fallbackUpdateData.customerName;
          
          // Handle notes - allow clearing completely
          const originalNotes = editingProject.notes || '';
          const cleanNotes = originalNotes.replace(/^Customer:\s*.*?(?:\n|$)/, '').trim();
          
          // Always use clean notes (allow empty string to clear the field)
          fallbackUpdateData.notes = cleanNotes;
          
          // Validate notes in fallback too (already trimmed above)
          if (fallbackUpdateData.notes !== undefined) {
            if (fallbackUpdateData.notes.length > 0 && fallbackUpdateData.notes.length < 5) {
              throw new Error('Notes must be at least 5 characters or left empty');
            }
          }
          
           ('📤 Fallback update data:', JSON.stringify(fallbackUpdateData, null, 2));
          
          await updateProject(projectId, fallbackUpdateData);
          showSuccess('Project updated successfully! (Customer name stored in notes)');
          setShowEditProject(false);
          setEditingProject(null);
          setIsEditNewCustomer(false);
          
          // Auto-refresh data after fallback update with correct pagination
          await fetchProjects(1, 1000); // Reload all projects
          await fetchCustomers();
          
          // If viewing a specific customer, refresh their projects too
          if (showCustomerSections && selectedCustomer) {
            const customerName = selectedCustomer?.name || selectedCustomer;
            await fetchCustomerProjects(customerName, customerProjectsCurrentPage, customerProjectsPageSize);
          }
          return;
        } catch (fallbackError) {
          console.error('Error updating project (fallback):', fallbackError);
          showError('Failed to update project: ' + fallbackError.message);
        }
      } else {
        showError('Failed to update project: ' + error.message);
      }
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
      // Use real API to delete project
      await deleteProject(projectId);
      showSuccess('Project deleted successfully!');
      
      // Auto-refresh data after delete with correct pagination
      await fetchProjects(1, 1000); // Reload all projects
      await fetchCustomers();
      
      // If viewing a specific customer, refresh their projects too
      if (showCustomerSections && selectedCustomer) {
        const customerName = selectedCustomer?.name || selectedCustomer;
        await fetchCustomerProjects(customerName, customerProjectsCurrentPage, customerProjectsPageSize);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showError('Failed to delete project: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        // Mock ticket deletion - replace with actual API
        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      } catch (error) {
      console.error('Error deleting ticket:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#1c242e';
      case 'planned': return '#f59e0b';
      case 'on_hold': return '#6b7280';
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
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Team Members</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {employees.length}
                </p>
                <p style={{ fontSize: '8px', color: '#10b981', marginTop: '4px', margin: 0 }}>+15% from last month</p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px'
              }}>
                <Users size={20} color="white" />
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
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Projects</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {totalProjects || projects?.length || 0}
                </p>
                
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px'
              }}>
                <FolderOpen size={20} color="white" />
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
                { id: 'employees', label: 'Team', icon: Users },
                { id: 'projects', label: 'Projects', icon: FolderOpen }
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
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
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
                Digital Marketing Dashboard
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Overview of digital marketing activities and campaign performance
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
                  Add Project
                </button>

                <button
                  onClick={() => setShowSubmitTicket(true)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                >
                  Submit Ticket
                </button>

                <button
                  onClick={() => setShowLeaveForm(true)}
                  style={{
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
                  Submit Leave
                </button>
              </div>
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Digital Marketing Team</h2>
            </div>

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
                          {employee.name || employee.firstName || 'Unknown Employee'}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                          {employee.position || employee.role || 'Digital Marketing Specialist'}
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
                          const note = employeeRatings[`${employeeId}-note`] || '';
                          
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
                          
                          // Submit rating with note to backend
                          await submitRatingWithNote(employeeId, note);
                          
                          // Clear the note field after successful submission
                          const noteKey = `${employeeId}-note`;
                          setEmployeeRatings(prev => ({
                            ...prev,
                            [noteKey]: ''
                          }));
                          
                          showSuccess('Rating submitted successfully!');
                        } catch (error) {
          console.error('Failed to submit rating:', error);
                          showError('Failed to submit rating: ' + error.message);
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Marketing Projects</h2>
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
                        {showCustomerSections ? "Filter Projects" : "Search Projects"}
                      </div>
                      <input
                        type="text"
                        value={projectSearchTerm}
                        onChange={(e) => handleProjectSearchChange(e.target.value)}
                        placeholder={showCustomerSections ? "Search projects..." : "Search by name or description..."}
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

                  {/* Status Filter - Only show when viewing customer projects */}
                  {showCustomerSections && (
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
                  )}

                </div>
              </div>
            </div>

            {projectsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading projects...</div>
              </div>
            ) : showCustomerSections ? (
              // Show projects for selected customer
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={handleBackToAllProjects}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        marginRight: '16px'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      ← Back to All Projects
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      Projects for {selectedCustomer?.name || selectedCustomer}
                    </h3>
                  </div>
                </div>
                
                {customerProjectsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading customer projects...</div>
                  </div>
                ) : filteredCustomerProjects.length > 0 ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredCustomerProjects.map((project) => (
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
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                              <span style={{ fontWeight: '500', marginRight: '8px' }}>📝 Notes:</span>
                              <span>{project.notes}</span>
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
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>
                      {(() => {
                        if (projectSearchTerm.trim()) {
                          return `No projects found matching "${projectSearchTerm}" for ${selectedCustomer?.name || selectedCustomer}.`;
                        } else if (projectStatusFilter === 'all') {
                          return `No projects found for ${selectedCustomer?.name || selectedCustomer}.`;
                        } else {
                          return `No ${projectStatusFilter} projects found for ${selectedCustomer?.name || selectedCustomer}.`;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Customer Projects Pagination - Always show when viewing a customer */}
                {(() => {
                  const shouldShow = !customerProjectsLoading && customerProjects.length > 0;
                    ('🔍 Pagination render check:', {
                    customerProjectsLoading,
                    customerProjectsLength: customerProjects.length,
                    customerProjectsTotal,
                    shouldShow,
                    totalPages: Math.ceil(customerProjectsTotal / customerProjectsPageSize)
                  });
                  return shouldShow;
                })() && (
                  <div style={{ marginTop: '20px' }}>
                    <SimplePagination
                      currentPage={customerProjectsCurrentPage}
                      totalPages={Math.max(1, Math.ceil(customerProjectsTotal / customerProjectsPageSize))}
                      onPageChange={handleCustomerProjectsPageChange}
                      totalItems={customerProjectsTotal}
                      pageSize={customerProjectsPageSize}
                    />
                  </div>
                )}
              </div>
            ) : filteredCustomers.length > 0 ? (
              // Show customer sections
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                    Projects by Customer ({filteredCustomers.length} customers)
                  </h3>
                  {customersLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading customers...</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredCustomers.map((customer, index) => {
                         ('🔍 Customer', index + 1, ':', customer, 'Type:', typeof customer);
                        
                        // Handle both string and object formats
                        let displayName;
                        if (typeof customer === 'string') {
                          displayName = customer;
                        } else if (customer && typeof customer === 'object') {
                          displayName = customer.name || customer.customerName || customer.title || 'Unknown Customer';
                        } else {
                          displayName = 'Unknown Customer';
                        }
                        
                         ('🔍 Customer', index + 1, 'displayName:', displayName);
                        
                        return (
                          <div
                            key={typeof customer === 'string' ? customer : (customer.id || customer._id || index)}
                            onClick={() => handleCustomerClick({ name: displayName })}
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#f1f5f9';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                                {displayName}
                              </h4>
                              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                Click to view projects
                              </p>
                            </div>
                            <div style={{ color: '#6b7280' }}>
                              →
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Customer List Pagination */}
                  {!customersLoading && customers.length > 0 && !projectSearchTerm.trim() && (
                    <div style={{ marginTop: '20px' }}>
                      <SimplePagination
                        currentPage={customersCurrentPage}
                        totalPages={Math.max(1, Math.ceil(customersTotal / customersPageSize))}
                        onPageChange={handleCustomersPageChange}
                        totalItems={customersTotal}
                        pageSize={customersPageSize}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                  {projectSearchTerm.trim() ? `No customers found matching "${projectSearchTerm}".` : 'No customers found. Click "Create Project" to add your first project.'}
                </div>
              </div>
            )}
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
                Create New Marketing Project
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Project Name                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
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
                  {(editProjectDateErrors.start || editProjectDateErrors.range) && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editProjectDateErrors.start || editProjectDateErrors.range}
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description                  </label>
                  <textarea
                    id="project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
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
                  {(editProjectDateErrors.end || editProjectDateErrors.range) && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editProjectDateErrors.end || editProjectDateErrors.range}
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-customer-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Customer Name *
                  </label>
                  {!isNewCustomer ? (
                    <select
                      id="project-customer-name"
                      value={newProject.customerName}
                      onChange={(e) => {
                        if (e.target.value === '__new_customer__') {
                          setIsNewCustomer(true);
                          setNewProject(prev => ({ ...prev, customerName: '' }));
                        } else {
                          setNewProject(prev => ({ ...prev, customerName: e.target.value }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer, index) => {
                        const customerName = typeof customer === 'string' ? customer : (customer.name || customer.customerName || customer.title || '');
                        return (
                          <option key={index} value={customerName}>
                            {customerName}
                          </option>
                        );
                      })}
                      <option value="__new_customer__" style={{ fontStyle: 'italic', borderTop: '1px solid #d1d5db' }}>
                        + Add New Customer
                      </option>
                    </select>
                  ) : (
                    <div>
                      <input
                        id="project-customer-name"
                        type="text"
                        value={newProject.customerName}
                        onChange={(e) => setNewProject(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter new customer name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCustomer(false);
                          setNewProject(prev => ({ ...prev, customerName: '' }));
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ← Back to customer list
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Status                  </label>
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
                    required
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-members" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Team Members                  </label>
                  {employees.length === 0 && !employeesLoading ? (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#dc2626'
                    }}>
                      <strong>⚠️ No team members available</strong>
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#991b1b' }}>
                        {employeesError 
                          ? `Error: ${employeesError}. Please check the browser console for details.`
                          : 'No employees found in the Digital Marketing department. Please ensure employees are assigned to this department in the backend.'}
                      </p>
                    </div>
                  ) : (
                    <>
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
                        required
                        disabled={employeesLoading}
                      >
                        {employeesLoading ? (
                          <option disabled>Loading team members...</option>
                        ) : employees.length === 0 ? (
                          <option disabled>No team members available</option>
                        ) : (
                          employees.map(employee => (
                            <option key={employee.id || employee._id} value={employee.id || employee._id}>
                              {employee.firstName} {employee.lastName}
                            </option>
                          ))
                        )}
                      </select>
                      <small style={{ color: '#6b7280', fontSize: '12px' }}>
                        Hold Ctrl/Cmd to select multiple members
                      </small>
                    </>
                  )}
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
                    Start Date                  </label>
                  <input
                    id="project-start-date"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProject(prev => ({ ...prev, startDate: value }));
                      const errs = validateDates(value, newProject.endDate);
                      setNewProjectDateErrors(errs);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {(newProjectDateErrors.start || newProjectDateErrors.range) && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {newProjectDateErrors.start || newProjectDateErrors.range}
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="project-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    End Date                  </label>
                  <input
                    id="project-end-date"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProject(prev => ({ ...prev, endDate: value }));
                      const errs = validateDates(newProject.startDate, value);
                      setNewProjectDateErrors(errs);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {(newProjectDateErrors.end || newProjectDateErrors.range) && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {newProjectDateErrors.end || newProjectDateErrors.range}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateProject(false);
                      setIsNewCustomer(false);
                      setNewProject({
                        name: '',
                        description: '',
                        status: 'planned',
                        members: [],
                        notes: '',
                        startDate: '',
                        endDate: '',
                        customerName: ''
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
                    Project Name
                  </label>
                  <input
                    id="edit-project-name"
                    type="text"
                    value={editingProject.name || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
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
                  <label htmlFor="edit-project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description                  </label>
                  <textarea
                    id="edit-project-description"
                    value={editingProject.description || ''}
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
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="edit-project-customer-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Customer Name
                  </label>
                  {!isEditNewCustomer ? (
                    <select
                      id="edit-project-customer-name"
                      value={editingProject.customerName || ''}
                      onChange={(e) => {
                        if (e.target.value === '__new_customer__') {
                          setIsEditNewCustomer(true);
                          setEditingProject(prev => ({ ...prev, customerName: '' }));
                        } else {
                          setEditingProject(prev => ({ ...prev, customerName: e.target.value }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer, index) => {
                        const customerName = typeof customer === 'string' ? customer : (customer.name || customer.customerName || customer.title || '');
                        return (
                          <option key={index} value={customerName}>
                            {customerName}
                          </option>
                        );
                      })}
                      <option value="__new_customer__" style={{ fontStyle: 'italic', borderTop: '1px solid #d1d5db' }}>
                        + Add New Customer
                      </option>
                    </select>
                  ) : (
                    <div>
                      <input
                        id="edit-project-customer-name"
                        type="text"
                        value={editingProject.customerName || ''}
                        onChange={(e) => setEditingProject(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter new customer name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditNewCustomer(false);
                          setEditingProject(prev => ({ ...prev, customerName: '' }));
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ← Back to customer list
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="edit-project-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Status                  </label>
                  <select
                    id="edit-project-status"
                    value={editingProject.status || 'planned'}
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
                    Team Members                  </label>
                  {employees.length === 0 && !employeesLoading ? (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#dc2626'
                    }}>
                      <strong>⚠️ No team members available</strong>
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#991b1b' }}>
                        {employeesError 
                          ? `Error: ${employeesError}. Please check the browser console for details.`
                          : 'No employees found in the Digital Marketing department. Please ensure employees are assigned to this department in the backend.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <select
                        id="edit-project-members"
                        multiple
                        value={editingProject.members || []}
                        onChange={(e) => {
                          const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                          setEditingProject(prev => ({ ...prev, members: selectedIds }));
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          minHeight: '80px'
                        }}
                        disabled={employeesLoading}
                      >
                        {employeesLoading ? (
                          <option disabled>Loading team members...</option>
                        ) : employees.length === 0 ? (
                          <option disabled>No team members available</option>
                        ) : (
                          employees.map(employee => (
                            <option key={employee.id || employee._id} value={employee.id || employee._id}>
                              {employee.name || employee.firstName} {employee.lastName || ''}
                            </option>
                          ))
                        )}
                      </select>
                      <small style={{ color: '#6b7280', fontSize: '12px' }}>
                        Hold Ctrl/Cmd to select multiple members
                      </small>
                    </>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="edit-project-start-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Start Date                  </label>
                  <input
                    id="edit-project-start-date"
                    type="date"
                    value={editingProject.startDate || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingProject(prev => ({ ...prev, startDate: value }));
                      const errs = validateDates(value, editingProject.endDate || '');
                      setEditProjectDateErrors(errs);
                    }}
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
                  <label htmlFor="edit-project-end-date" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    End Date                  </label>
                  <input
                    id="edit-project-end-date"
                    type="date"
                    value={editingProject.endDate || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingProject(prev => ({ ...prev, endDate: value }));
                      const errs = validateDates(editingProject.startDate || '', value);
                      setEditProjectDateErrors(errs);
                    }}
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
                  <label htmlFor="edit-project-notes" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Notes
                  </label>
                  <textarea
                    id="edit-project-notes"
                    value={editingProject.notes ? editingProject.notes.replace(/^Customer:\s*.*?(?:\n|$)/, '').trim() : ''}
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
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProject(false);
                      setEditingProject(null);
                      setIsEditNewCustomer(false);
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

        {/* Submit Ticket Modal */}
        {showSubmitTicket && (
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
                Submit New Ticket
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitTicket();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="ticket-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Issue Type                  </label>
                  <select
                    id="ticket-type"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select an issue type</option>
                    <option value="Login Issues">Login Issues</option>
                    <option value="Password Reset">Password Reset</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Email Not Working">Email Not Working</option>
                    <option value="Internet Connection">Internet Connection</option>
                    <option value="WiFi Problems">WiFi Problems</option>
                    <option value="Computer Slow">Computer Slow</option>
                    <option value="Computer Won't Start">Computer Won't Start</option>
                    <option value="Blue Screen Error">Blue Screen Error</option>
                    <option value="Software Installation">Software Installation</option>
                    <option value="Software Not Working">Software Not Working</option>
                    <option value="Printer Issues">Printer Issues</option>
                    <option value="Scanner Problems">Scanner Problems</option>
                    <option value="Database Access">Database Access</option>
                    <option value="File Access Issues">File Access Issues</option>
                    <option value="Network Drive Problems">Network Drive Problems</option>
                    <option value="VPN Connection">VPN Connection</option>
                    <option value="Remote Access Issues">Remote Access Issues</option>
                    <option value="System Updates">System Updates</option>
                    <option value="Antivirus Issues">Antivirus Issues</option>
                    <option value="Browser Problems">Browser Problems</option>
                    <option value="Website Not Loading">Website Not Loading</option>
                    <option value="Performance Issues">Performance Issues</option>
                    <option value="Memory Problems">Memory Problems</option>
                    <option value="Storage Issues">Storage Issues</option>
                    <option value="Backup Problems">Backup Problems</option>
                    <option value="Data Recovery">Data Recovery</option>
                    <option value="Hardware Failure">Hardware Failure</option>
                    <option value="Keyboard Issues">Keyboard Issues</option>
                    <option value="Mouse Problems">Mouse Problems</option>
                    <option value="Monitor Issues">Monitor Issues</option>
                    <option value="Audio Problems">Audio Problems</option>
                    <option value="Camera Not Working">Camera Not Working</option>
                    <option value="Microphone Issues">Microphone Issues</option>
                    <option value="USB Port Problems">USB Port Problems</option>
                    <option value="Bluetooth Issues">Bluetooth Issues</option>
                    <option value="Mobile Device Sync">Mobile Device Sync</option>
                    <option value="Application Crashes">Application Crashes</option>
                    <option value="Data Loss">Data Loss</option>
                    <option value="Permission Issues">Permission Issues</option>
                    <option value="Security Concerns">Security Concerns</option>
                    <option value="Phishing Attempts">Phishing Attempts</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="License Issues">License Issues</option>
                    <option value="Configuration Problems">Configuration Problems</option>
                    <option value="Integration Issues">Integration Issues</option>
                    <option value="API Problems">API Problems</option>
                    <option value="Server Issues">Server Issues</option>
                    <option value="Database Errors">Database Errors</option>
                    <option value="Cloud Service Problems">Cloud Service Problems</option>
                    <option value="Third-party Software">Third-party Software</option>
                    <option value="Mobile App Issues">Mobile App Issues</option>
                    <option value="Web Application Problems">Web Application Problems</option>
                    <option value="Other Technical Issue">Other Technical Issue</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="ticket-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description                  </label>
                  <textarea
                    id="ticket-description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the issue in detail (10-500 characters)"
                    rows={4}
                    minLength={10}
                    maxLength={500}
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
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {newTicket.description.length}/500 characters
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="ticket-priority" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Priority
                  </label>
                  <select
                    id="ticket-priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitTicket(false);
                      setNewTicket({
                        title: '',
                        description: '',
                        priority: 'medium'
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
                    Submit Ticket
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
                Update Campaign Status
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
                      showSuccess('Campaign status updated successfully!');
                      setShowEditTicket(false);
                      setEditingTicket(null);
                    } catch (error) {
                      showError('Failed to update campaign status: ' + error.message);
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
                handleSubmitLeave();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="leave-type" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Leave Type                  </label>
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
                    Start Date                  </label>
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
                    End Date                  </label>
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

      </div>
    </div>
  );
};

export default DigitalMarketingDepartment;
