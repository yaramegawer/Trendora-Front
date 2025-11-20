import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Joi from 'joi-browser';
import SimplePagination from '../common/SimplePagination';

// Form field styles
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
  }
};

// Validation schema
const REQUIRED_FIELDS = ['customer_name', 'company_name', 'phone_number', 'services'];

const customerSchema = {
  customer_name: Joi.string()
    .trim()
    .required()
    .label('Customer Name'),
    
  company_name: Joi.string()
    .trim()
    .required()
    .label('Company Name'),
    
  phone_number: Joi.string()
    .regex(/^[0-9]{10,15}$/)
    .trim()
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: 'must be 10-15 digits',
          }
        }
      }
    })
    .label('Phone Number')
    .error(errors => {
      return errors.map(error => {
        if (error.type === 'string.regex.base') {
          return new Error('Phone number must be 10-15 digits');
        }
        if (error.type === 'any.empty') {
          return new Error('Phone number is required');
        }
        return error;
      });
    }),
    
  email: Joi.string()
    .email()
    .optional()
    .allow("", null)
    .label('Email'),
    
  services: Joi.array()
    .items(
      Joi.string().valid(
        "Influencer Marketing",
        "Event Management",
        "Social Media Management",
        "Professional Photography",
        "Lighting Services",
        "Screens & Displays",
        "Digital Advertising"
      )
    )
    .min(1)
    .required()
    .label('Services'),
    
  Budget: Joi.string()
    .optional()
    .allow('')
    .label('Budget'),
    
  status: Joi.string()
    .valid("New", "Contacted", "Proposal Sent", "Negotiating", "Won", "Lost")
    .optional()
    .label('Status'),
    
  Next_Followup_Date: Joi.date()
    .optional()
    .allow("")
    .label('Next Follow-up Date'),
    
  notes: Joi.string()
    .optional()
    .allow("", null)
    .label('Notes'),
    
  assigned_to: Joi.string()
    .optional()
    .allow("", null)
    .label('Assigned To')
};
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Search,
  Phone,
  CalendarToday,
  Edit,
  Delete,
  Add,
  Visibility,
  FilterList,
  Close,
  CheckCircle,
  Schedule,
  MoreVert,
  Email
} from '@mui/icons-material';
import { salesApi } from '../../api/sales.js';
import { API_CONFIG } from '../../config/api.js';
import Toast from '../common/Toast';

const SalesDepartment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesEmployees, setSalesEmployees] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isServerPaginated, setIsServerPaginated] = useState(false);
  const [paginationModeDetermined, setPaginationModeDetermined] = useState(false);

  // Search term state for instant client-side search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const searchTimeoutRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    phone_number: '',
    email: '',
    services: [],
    Budget: '',
    status: 'New',
    Next_Followup_Date: '',
    notes: '',
    assigned_to: ''
  });
  
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [followUpFilter, setFollowUpFilter] = useState('today');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [followUpsError, setFollowUpsError] = useState('');
  
  // Follow-up pagination states
  const [followUpCurrentPage, setFollowUpCurrentPage] = useState(1);
  const [followUpTotalPages, setFollowUpTotalPages] = useState(1);
  const [followUpPageSize] = useState(5);
  const [totalFollowUps, setTotalFollowUps] = useState(0);
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    customerId: null,
    newDate: ''
  });

  // My Customers Report states
  const [myCustomersReport, setMyCustomersReport] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // Team Performance Report states
  const [teamPerformanceData, setTeamPerformanceData] = useState(null);
  const [teamPerformanceLoading, setTeamPerformanceLoading] = useState(false);
  const [teamPerformanceError, setTeamPerformanceError] = useState('');

  // Services Demand Report states
  const [servicesDemandData, setServicesDemandData] = useState(null);
  const [servicesDemandLoading, setServicesDemandLoading] = useState(false);
  const [servicesDemandError, setServicesDemandError] = useState('');

  const statuses = ['New', 'Contacted', 'Proposal Sent', 'Negotiating', 'Won', 'Lost'];
  const availableServices = ['Influencer Marketing', 'Event Management', 'Social Media Management', 'Professional Photography', 'Lighting Services', 'Screens & Displays', 'Digital Advertising'];
  
  // Validation functions
  const formatFieldLabel = (field) =>
    field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const isFieldEmpty = (field) => {
    const value = formData[field];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') return value.trim() === '';
    return value === undefined || value === null || value === '';
  };

  const getFieldError = (field) => {
    if (errors[field]) return errors[field];
    if (formSubmitted && REQUIRED_FIELDS.includes(field) && isFieldEmpty(field)) {
      if (field === 'services') {
        return 'Select at least one service';
      }
      return `${formatFieldLabel(field)} is required`;
    }
    return '';
  };

  const validate = () => {
    const errors = {};
    
    // Required fields that should not be empty in edit mode
    REQUIRED_FIELDS.forEach(field => {
      if (!formData[field] || 
          (Array.isArray(formData[field]) && formData[field].length === 0) ||
          (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        errors[field] = `${formatFieldLabel(field)} is required`;
      }
    });
    
    // Additional validation for email format if provided
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // If there are errors, return them
    if (Object.keys(errors).length > 0) {
      return errors;
    }
    
    // If no basic validation errors, validate the rest with Joi
    const options = { abortEarly: false, allowUnknown: true };
    const { error } = Joi.validate(formData, customerSchema, options);
    
    if (!error) return null;
    
    // Filter out errors for fields that are allowed to be empty
    const validationErrors = {};
    for (let item of error.details) {
      const fieldName = item.path[0];
      // Only include errors for non-empty fields or required fields
      if (!['email', 'notes', 'Next_Followup_Date'].includes(fieldName) || 
          (formData[fieldName] && formData[fieldName].trim() !== '')) {
        validationErrors[fieldName] = item.message;
      }
    }
    
    return Object.keys(validationErrors).length > 0 ? validationErrors : null;
  };

  const validateProperty = ({ name, value }) => {
    // Skip validation for services as it's handled differently
    if (name === 'services') return null;
    
    // Skip validation for fields that are allowed to be empty
    if (['email', 'notes', 'Next_Followup_Date'].includes(name) && (!value || value.trim() === '')) {
      return null;
    }
    
    const obj = { [name]: value };
    const schema = { [name]: customerSchema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message.replace(/"/g, '') : null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    if (name in customerSchema) {
      const errorMessage = validateProperty({ name, value: inputValue });
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleServicesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      services: typeof value === 'string' ? value.split(',') : value,
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.services;
      return newErrors;
    });
  };

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return dateString; // Return as-is if parsing fails
    }
  };

  const fetchSalesEmployees = async () => {
    try {
      const response = await salesApi.getSalesEmployees();
      let employeesData = [];
      
      if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (response.data && response.data.customers && Array.isArray(response.data.customers)) {
          employeesData = response.data.customers;
        } else if (response.customers && Array.isArray(response.customers)) {
          employeesData = response.customers;
        } else if (Array.isArray(response.Data)) {
          employeesData = response.Data; // Backend returns 'Data' (capital D)
        }
      }
      
      // Store full employee objects with both ID and name
      setSalesEmployees(employeesData);
    } catch {
      // Error already handled in fetchCustomers
    }
  };

  const fetchMyCustomersReport = async () => {
    try {
      setReportLoading(true);
      setReportError('');
      
      const response = await salesApi.getMyCustomersReport();
      ('My Customers report response:', response);
      
      // Handle different response formats
      let reportData = [];
      
      if (Array.isArray(response)) {
        reportData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          reportData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          reportData = response.data.data;
        } else if (Array.isArray(response.Data)) {
          reportData = response.Data;
        }
      }
      
      setMyCustomersReport(reportData);
    } catch (error) {
      console.error('Error fetching My Customers report:', error);
      setReportError('Failed to fetch My Customers report. Please try again.');
      setMyCustomersReport([]);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchTeamPerformance = async () => {
    try {
      setTeamPerformanceLoading(true);
      setTeamPerformanceError('');
      
      const response = await salesApi.getTeamPerformance();
      ('Team Performance response:', response);
      
      setTeamPerformanceData(response);
    } catch (error) {
      console.error('Error fetching Team Performance report:', error);
      if (error.response?.status === 404) {
        setTeamPerformanceError('Team Performance endpoint not found on backend. Please implement the /sales/team_performance route.');
      } else {
        setTeamPerformanceError('Failed to fetch Team Performance report. Please try again.');
      }
      setTeamPerformanceData(null);
    } finally {
      setTeamPerformanceLoading(false);
    }
  };

  const fetchServicesDemand = async () => {
    try {
      setServicesDemandLoading(true);
      setServicesDemandError('');
      
      const response = await salesApi.getServicesDemand();
      ('Services Demand response:', response);
      
      setServicesDemandData(response);
    } catch (error) {
      console.error('Error fetching Services Demand report:', error);
      if (error.response?.status === 404) {
        setServicesDemandError('Services Demand endpoint not found on backend. Please implement the /sales/demand route.');
      } else {
        setServicesDemandError('Failed to fetch Services Demand report. Please try again.');
      }
      setServicesDemandData(null);
    } finally {
      setServicesDemandLoading(false);
    }
  };

  const fetchCustomers = useCallback(async (page = 1, limit = pageSize, options = {}) => {
    const { forceClientPagination = false } = options;
    let detectedBackendPagination = false;
    
    try {
      setLoading(true);
      
      // Build query parameters for pagination only
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await salesApi.getAllCustomers(params);
      
      // Debug: Log the response structure
       ('Backend response:', response);
      
      // Handle different response formats
      let customersData = [];
      let paginationData = {};
      
      if (Array.isArray(response)) {
        customersData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          customersData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          customersData = response.data.data;
          paginationData = response.data.pagination || {};
        } else if (response.data && response.data.customers && Array.isArray(response.data.customers)) {
          customersData = response.data.customers;
          paginationData = response.data.pagination || {};
        } else if (response.customers && Array.isArray(response.customers)) {
          customersData = response.customers;
          paginationData = response.pagination || {};
        } else if (Array.isArray(response.Data)) {
          customersData = response.Data;
          paginationData = response.pagination || {};
        }
        
        if (response.pagination) {
          paginationData = response.pagination;
        }
      }
      
      // Final safety check
      if (!customersData || !Array.isArray(customersData)) {
        customersData = [];
      }
      
      // Convert services to array for display
      customersData = customersData.map(customer => ({
        ...customer,
        services: Array.isArray(customer.services) 
          ? customer.services 
          : typeof customer.services === 'string' 
            ? [customer.services] 
            : []
      }));
      
      setCustomers(customersData);
      
      // Update pagination states
      ('Customers data length:', customersData.length);
      ('Page:', page, 'Limit:', limit);
      ('Pagination data from backend:', paginationData);

      detectedBackendPagination = !forceClientPagination && Boolean(
        paginationData &&
        (paginationData.totalPages || paginationData.totalCount || paginationData.total)
      );

      if (detectedBackendPagination) {
        if (paginationData.totalPages) {
          setTotalPages(paginationData.totalPages);
          setTotalCustomers(
            paginationData.totalCount ||
            paginationData.total ||
            paginationData.totalPages * limit
          );
          ('Using backend totalPages - totalPages:', paginationData.totalPages, 'totalCustomers:', paginationData.totalCount || paginationData.total || paginationData.totalPages * limit);
        } else {
          const totalCount = paginationData.totalCount || paginationData.total || customersData.length;
          setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
          setTotalCustomers(totalCount);
          ('Using backend totalCount - totalPages:', Math.max(1, Math.ceil(totalCount / limit)), 'totalCustomers:', totalCount);
        }
        setIsServerPaginated(true);
      } else {
        // No pagination data from backend - be more conservative with estimates
        const currentPageItems = customersData.length;
        ('No backend pagination data, calculating from current page items:', currentPageItems);
        
        if (forceClientPagination) {
          setTotalPages(Math.max(1, Math.ceil(currentPageItems / pageSize)));
          setTotalCustomers(currentPageItems);
          ('Force client pagination - totalPages:', Math.max(1, Math.ceil(currentPageItems / pageSize)), 'totalCustomers:', currentPageItems);
        } else {
          if (currentPageItems === limit && page === 1) {
            // We got a full page on first request, there might be more but don't overestimate
            setTotalPages(2); // Will be updated when user navigates
            setTotalCustomers(currentPageItems); // Start with what we know
            ('Full page on first request - setting totalPages: 2, totalCustomers:', currentPageItems);
          } else if (currentPageItems === limit) {
            // Full page but not first page, there might be more
            setTotalPages(page + 1);
            setTotalCustomers(page * limit); // Conservative estimate
            ('Full page on page', page, '- setting totalPages:', page + 1, 'totalCustomers:', page * limit);
          } else if (currentPageItems < limit) {
            // Less than full page, we're at the end
            setTotalPages(page);
            setTotalCustomers((page - 1) * limit + currentPageItems);
            ('Partial page - setting totalPages:', page, 'totalCustomers:', (page - 1) * limit + currentPageItems);
          } else {
            // Default case - just use what we have
            setTotalPages(1);
            setTotalCustomers(currentPageItems);
            ('Default case - setting totalPages: 1, totalCustomers:', currentPageItems);
          }
        }
        setIsServerPaginated(false);
      }
      setPaginationModeDetermined(true);
      
      setCurrentPage(page);
      setError('');
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers. Please try again.');
      setCustomers([]);
      setTotalPages(1);
      setTotalCustomers(0);
      detectedBackendPagination = false;
    } finally {
      setLoading(false);
    }
    
    return detectedBackendPagination;
  }, [pageSize]);

  const refreshCustomers = useCallback(async () => {
    if (paginationModeDetermined) {
      if (isServerPaginated) {
        await fetchCustomers(1, pageSize);
      } else {
        await fetchCustomers(1, 1000, { forceClientPagination: true });
      }
      return;
    }

    const hasBackendPagination = await fetchCustomers(1, pageSize);
    if (!hasBackendPagination) {
      await fetchCustomers(1, 1000, { forceClientPagination: true });
    }
  }, [fetchCustomers, isServerPaginated, paginationModeDetermined, pageSize]);

  useEffect(() => {
    fetchSalesEmployees();
  }, []);

  // Initial fetch of customers when component mounts or when tab changes to customer list
  useEffect(() => {
    if (activeTab === 0) {
      refreshCustomers();
    }
  }, [activeTab, refreshCustomers]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    if (activeTab === 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, assignedToFilter, activeTab]);

    
    
  // Client-side search and filtering
  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];
    
    return customers.filter(customer => {
      // If search term exists, check if it matches any relevant field
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (customer.customer_name && customer.customer_name.toLowerCase().includes(searchLower)) ||
        (customer.company_name && customer.company_name.toLowerCase().includes(searchLower)) ||
        (customer.phone_number && customer.phone_number.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower));
      
      // Apply status filter if set
      const matchesStatus = !statusFilter || customer.status === statusFilter;
      
      // Apply assigned to filter if set
      const matchesAssignedTo = !assignedToFilter || customer.assigned_to === assignedToFilter;
      
      return matchesSearch && matchesStatus && matchesAssignedTo;
    });
  }, [customers, searchTerm, statusFilter, assignedToFilter]);
  
  // Paginate the filtered customers for display
  const paginatedCustomers = useMemo(() => {
    if (isServerPaginated) {
      return filteredCustomers;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize, isServerPaginated]);

  // Use paginated filtered customers for display
  const displayCustomers = paginatedCustomers;

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#6b7280';
      case 'Contacted': return '#2563eb';
      case 'Proposal Sent': return '#7c3aed';
      case 'Negotiating': return '#ea580c';
      case 'Won': return '#059669';
      case 'Lost': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const handleAddCustomer = () => {
    setIsEditing(false);
    setSelectedCustomer(null);
    setFormData({
      customer_name: '',
      company_name: '',
      phone_number: '',
      email: '',
      services: [],
      Budget: '',
      status: 'New',
      Next_Followup_Date: '',
      notes: '',
      assigned_to: ''
    });
    setErrors({}); // Clear any previous errors
    setFormSubmitted(false);
    setIsFormOpen(true);
  };

  const handleViewDetails = (customer) => {
    setViewingCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleEditCustomer = (customer) => {
    ('Edit customer clicked:', customer);
    setIsEditing(true);
    setSelectedCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || '',
      company_name: customer.company_name || '',
      phone_number: customer.phone_number || '',
      email: customer.email || '',
      services: Array.isArray(customer.services) ? customer.services : [customer.services || ''],
      Budget: customer.Budget || '',
      status: customer.status || 'New',
      Next_Followup_Date: customer.Next_Followup_Date || '',
      notes: customer.notes || '',
      assigned_to: customer.assigned_to || ''
    });
    setErrors({}); // Clear any previous errors
    setFormSubmitted(false);
    ('Form data set:', {
      customer_name: customer.customer_name || '',
      company_name: customer.company_name || '',
      phone_number: customer.phone_number || '',
      email: customer.email || '',
      services: Array.isArray(customer.services) ? customer.services : [customer.services || ''],
      Budget: customer.Budget || '',
      status: customer.status || 'New',
      Next_Followup_Date: customer.Next_Followup_Date || '',
      notes: customer.notes || '',
      assigned_to: customer.assigned_to || ''
    });
    ('Is editing set to:', true);
    ('Opening form dialog...');
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await salesApi.deleteCustomer(customerId);
      await refreshCustomers(); // Refresh list from page 1
      setSnackbar({
        open: true,
        message: 'Customer deleted successfully',
        severity: 'success'
      });
    } catch {
      // Error already handled in handleDeleteCustomer
    }
    setIsFormOpen(false);
    setFormSubmitted(false);
  };

  const handleCloseForm = () => {
    if (loading) return;
    setIsFormOpen(false);
    setFormSubmitted(false);
    setErrors({});
  };

  const handleSaveCustomer = async (e) => {
    if (e) e.preventDefault();
    setFormSubmitted(true);
    
    // First validate phone number format
    const phoneNumber = formData.phone_number;
    const phoneNumberError = validateProperty({ 
      name: 'phone_number', 
      value: phoneNumber 
    });
    
    if (phoneNumberError) {
      setErrors(prev => ({
        ...prev,
        phone_number: phoneNumberError
      }));
      setSnackbar({
        open: true,
        message: 'Please correct the highlighted errors before submitting.',
        severity: 'error'
      });
      const element = document.querySelector('[name="phone_number"]');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Then validate the rest of the form
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields highlighted below.',
        severity: 'error'
      });
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      // Normalize form data before sending
      const normalizedData = {
        customer_name: formData.customer_name.trim(),
        company_name: formData.company_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email ? formData.email.trim() : null,
        services: Array.isArray(formData.services) 
          ? formData.services
              .filter(service => service && service.trim() !== '')
              .map(service => service.trim())
          : formData.services 
            ? [formData.services.trim()]
            : [],
        Budget: formData.Budget ? Number(formData.Budget) : null,
        status: formData.status || 'New',
        Next_Followup_Date: formData.Next_Followup_Date 
          ? new Date(formData.Next_Followup_Date).toISOString() 
          : null,
        notes: formData.notes ? formData.notes.trim() : null,
        assigned_to: formData.assigned_to || null
      };
      
      // Remove Next_Followup_Date if it's an empty string or invalid date
      if (formData.Next_Followup_Date === '' || isNaN(new Date(formData.Next_Followup_Date).getTime())) {
        delete normalizedData.Next_Followup_Date;
      }
      
      ('Submitting customer data:', normalizedData);
      
      if (isEditing && selectedCustomer) {
        const response = await salesApi.updateCustomer(
          selectedCustomer._id || selectedCustomer.id, 
          normalizedData
        );
        
        setSnackbar({
          open: true,
          message: 'Customer updated successfully',
          severity: 'success'
        });
        setIsFormOpen(false);
        setFormSubmitted(false);
      } else {
        const response = await salesApi.addCustomer(normalizedData);
        
        setSnackbar({
          open: true,
          message: 'Customer added successfully',
          severity: 'success'
        });
        setIsFormOpen(false);
        setFormSubmitted(false);
      }
      
      // Refresh the list
      await refreshCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to save customer. Please try again.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerList = () => {
    const clientTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
    const paginationTotalPages = isServerPaginated ? Math.max(1, totalPages) : clientTotalPages;
    const paginationTotalItems = isServerPaginated ? totalCustomers : filteredCustomers.length;
    const shouldShowCustomerPagination = !loading && paginationTotalPages > 1;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Customer Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCustomer}
            sx={{ background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)' }}
          >
            Add New Customer
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          <Button onClick={() => refreshCustomers()} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading customers...</Typography>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}>
                <TextField
                  placeholder="Search by name, company, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: searchTerm && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{ visibility: searchTerm ? 'visible' : 'hidden' }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      paddingRight: 1,
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Contacted">Contacted</MenuItem>
                    <MenuItem value="Proposal Sent">Proposal Sent</MenuItem>
                    <MenuItem value="Negotiating">Negotiating</MenuItem>
                    <MenuItem value="Won">Won</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={assignedToFilter}
                    label="Assigned To"
                    onChange={(e) => setAssignedToFilter(e.target.value)}
                  >
                    <MenuItem value="">All Reps</MenuItem>
                    {salesEmployees.map(emp => (
                      <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.firstName && emp.lastName
                          ? `${emp.firstName} ${emp.lastName}`
                          : emp.firstName || emp.lastName || emp.name || emp.employee_name || emp.fullName || emp.full_name || 'Unknown'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                padding: '16px'
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.2fr 1fr 1.8fr 0.6fr 1.2fr 1.5fr 0.8fr',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '14px',
                  
                }}
              >
                <Box>Customer Name</Box>
                <Box>Company</Box>
                <Box>Phone</Box>
                <Box>Services</Box>
                <Box>Status</Box>
                <Box>Next Follow-up</Box>
                <Box>Assigned To</Box>
                <Box>Actions</Box>
              </Box>

              {displayCustomers.map((customer) => (
                <Box
                  key={customer._id || customer.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.2fr 1fr 1.8fr 0.9fr 1.1fr 1.2fr 0.8fr',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    alignItems: 'center',
                    
                    minHeight: '60px',
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: '#f8fafc' }
                  }}
                >
                  <Box sx={{ fontWeight: 500, color: '#111827', wordBreak: 'break-word' }}>{customer.customer_name || 'N/A'}</Box>
                  <Box sx={{ fontSize: '14px', color: '#374151', wordBreak: 'break-word' }}>{customer.company_name || 'N/A'}</Box>
                  <Box sx={{ fontSize: '14px', color: '#374151' }}>{customer.phone_number || 'N/A'}</Box>
                  <Box sx={{ fontSize: '14px', color: '#374151', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {Array.isArray(customer.services) ? customer.services.join(', ') : customer.services || 'N/A'}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: getStatusColor(customer.status),
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {customer.status || 'N/A'}
                  </Box>
                  <Box sx={{ fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(customer.Next_Followup_Date)}</Box>
                  <Box sx={{ fontSize: '14px', color: '#374151', wordBreak: 'break-word' }}>
                    {(() => {
                      const assignedEmployee = salesEmployees.find(emp => (emp._id || emp.id) === customer.assigned_to);
                      return assignedEmployee
                        ? (assignedEmployee.firstName && assignedEmployee.lastName
                            ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`
                            : assignedEmployee.firstName || assignedEmployee.lastName || assignedEmployee.name || assignedEmployee.employee_name || assignedEmployee.fullName || assignedEmployee.full_name)
                        : customer.assigned_to || 'N/A';
                    })()}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(customer)}
                      sx={{
                        color: '#3b82f6',
                        '&:hover': { backgroundColor: '#eff6ff' }
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCustomer(customer)}
                      sx={{
                        color: '#3b82f6',
                        '&:hover': { backgroundColor: '#eff6ff' }
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCustomer(customer._id || customer.id)}
                      sx={{
                        color: '#ef4444',
                        '&:hover': { backgroundColor: '#fef2f2' }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              {!loading && displayCustomers.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 4, color: '#6b7280' }}>
                  No customers found
                </Box>
              )}

              {shouldShowCustomerPagination && (
                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <SimplePagination
                    currentPage={currentPage}
                    totalPages={paginationTotalPages}
                    totalItems={paginationTotalItems}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      if (isServerPaginated) {
                        fetchCustomers(page, pageSize);
                      } else {
                        setCurrentPage(page);
                      }
                    }}
                    itemLabel="customers"
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch follow-ups from backend
  const fetchFollowUps = async (filter = followUpFilter, page = followUpCurrentPage) => {
    try {
      setFollowUpsLoading(true);
      setFollowUpsError('');
      
      // First fetch all follow-ups to get total count
      const allParams = new URLSearchParams({
        type: filter,
        page: 1,
        limit: 1000 // Get all follow-ups to calculate total
      });
      
      const allResponse = await salesApi.getFollowUps(allParams.toString());
      
      if (allResponse.success && allResponse.data) {
        const allFollowUps = allResponse.data;
        const totalCount = allFollowUps.length;
        
        // Calculate pagination
        const startIndex = (page - 1) * followUpPageSize;
        const endIndex = startIndex + followUpPageSize;
        const paginatedFollowUps = allFollowUps.slice(startIndex, endIndex);
        
        setFollowUps(paginatedFollowUps);
        setTotalFollowUps(totalCount);
        setFollowUpTotalPages(Math.ceil(totalCount / followUpPageSize));
      } else {
        setFollowUps([]);
        setTotalFollowUps(0);
        setFollowUpTotalPages(1);
      }
    } catch {
      // Error already handled in fetchFollowUps
    } finally {
      setFollowUpsLoading(false);
    }
  };

  // Update follow-up status (mark as contacted)
  const handleMarkAsContacted = async (customerId) => {
    try {
      await salesApi.updateFollowUpStatus(customerId);
      setSnackbar({
        open: true,
        message: 'Follow-up marked as contacted',
        severity: 'success'
      });
      // Refresh follow-ups list
      fetchFollowUps();
      // Also refresh customers list to update status
      refreshCustomers();
    } catch {
      // Error already handled in handleMarkAsContacted
    }
  };

  // Reschedule follow-up
  const handleRescheduleFollowUp = async (customerId, newDate) => {
    try {
      await salesApi.rescheduleFollowUp(customerId, newDate);
      setSnackbar({
        open: true,
        message: 'Follow-up rescheduled successfully',
        severity: 'success'
      });
      // Refresh follow-ups list
      fetchFollowUps();
      // Also refresh customers list to update date
      refreshCustomers();
    } catch {
      // Error already handled in handleRescheduleFollowUp
    }
  };

  // Fetch follow-ups when component mounts or filter changes
  useEffect(() => {
    if (activeTab === 1) {
      setFollowUpCurrentPage(1); // Reset to page 1 when filter changes
      fetchFollowUps(followUpFilter, 1);
    }
  }, [activeTab, followUpFilter]);

  // Handle opening reschedule dialog
  const handleOpenRescheduleDialog = (customerId, currentFollowUpDate) => {
    setRescheduleDialog({
      open: true,
      customerId,
      newDate: currentFollowUpDate ? new Date(currentFollowUpDate).toISOString().split('T')[0] : ''
    });
  };

  // Handle closing reschedule dialog
  const handleCloseRescheduleDialog = () => {
    setRescheduleDialog({
      open: false,
      customerId: null,
      newDate: ''
    });
  };

  // Handle reschedule submit
  const handleRescheduleSubmit = () => {
    if (rescheduleDialog.customerId && rescheduleDialog.newDate) {
      handleRescheduleFollowUp(rescheduleDialog.customerId, rescheduleDialog.newDate);
      handleCloseRescheduleDialog();
    }
  };

  const renderFollowUpsDashboard = () => {
    const getFilterConfig = () => {
      switch(followUpFilter) {
        case 'today': 
          return { 
            title: "Today's Follow-ups", 
            color: '#059669', 
            bgColor: '#f8fafc', 
            borderColor: '#e2e8f0',
            textColor: '#6b7280',
            icon: <CalendarToday />
          };
        case 'overdue': 
          return { 
            title: "Overdue Follow-ups", 
            color: '#dc2626', 
            bgColor: '#fef2f2', 
            borderColor: '#fecaca',
            textColor: '#7f1d1d',
            icon: <Schedule />
          };
        case 'upcoming': 
          return { 
            title: "Upcoming Follow-ups", 
            color: '#2563eb', 
            bgColor: '#eff6ff', 
            borderColor: '#bfdbfe',
            textColor: '#1e40af',
            icon: <CalendarToday />
          };
        default: 
          return { 
            title: "Today's Follow-ups", 
            color: '#059669', 
            bgColor: '#f8fafc', 
            borderColor: '#e2e8f0',
            textColor: '#6b7280',
            icon: <CalendarToday />
          };
      }
    };

    const config = getFilterConfig();

    const renderFollowUpItem = (customer) => (
      <Box key={customer._id} sx={{ 
        mb: 2, 
        p: 2, 
        border: '1px solid', 
        borderColor: config.borderColor, 
        borderRadius: 2,
        backgroundColor: config.bgColor,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)'
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
            {customer.customer_name}
          </Typography>
          <Chip 
            label={customer.status} 
            size="small" 
            color={getStatusColor(customer.status)} 
            sx={{ fontWeight: 500 }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {customer.company_name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
          <Phone sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2">{customer.phone_number}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
          <Email sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2">{customer.email}</Typography>
        </Box>
        
        <Typography variant="body2" sx={{ 
          mb: 2, 
          p: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.04)', 
          borderRadius: 1,
          fontStyle: 'italic'
        }}>
          {customer.notes || 'No notes available'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: config.color }}>
          Follow-up: {formatDate(customer.Next_Followup_Date)}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            size="small" 
            startIcon={<CheckCircle />} 
            variant="contained"
            onClick={() => handleMarkAsContacted(customer._id)}
            sx={{
              backgroundColor: config.color,
              '&:hover': {
                backgroundColor: config.color,
                opacity: 0.9
              }
            }}
          >
            Mark as Contacted
          </Button>
          <Button 
            size="small" 
            startIcon={<Schedule />} 
            variant="outlined"
            onClick={() => handleOpenRescheduleDialog(customer._id, customer.Next_Followup_Date)}
            sx={{
              borderColor: config.color,
              color: config.color,
              '&:hover': {
                borderColor: config.color,
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Reschedule
          </Button>
        </Box>
      </Box>
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Follow-ups Dashboard
          </Typography>
          <ToggleButtonGroup
            value={followUpFilter}
            exclusive
            onChange={(e, newFilter) => {
              if (newFilter !== null) {
                setFollowUpFilter(newFilter);
              }
            }}
            size="small"
            sx={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
          >
            <ToggleButton value="today" sx={{ px: 2 }}>
              Today
            </ToggleButton>
            <ToggleButton value="overdue" sx={{ px: 2 }}>
              Overdue
            </ToggleButton>
            <ToggleButton value="upcoming" sx={{ px: 2 }}>
              Upcoming
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {followUpsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : followUpsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {followUpsError}
            <Button onClick={() => fetchFollowUps()} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        ) : (
          <Card elevation={2} sx={{ backgroundColor: config.bgColor, borderColor: config.borderColor, borderWidth: 1, borderStyle: 'solid' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {config.icon}
                <Typography variant="h6" sx={{ color: config.color, fontWeight: 600 }}>
                  {config.title}
                </Typography>
                <Chip 
                  label={followUps.length} 
                  size="small" 
                  sx={{ 
                    backgroundColor: config.color, 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
              </Box>
              
              {followUps.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: config.textColor }}>
                  <Typography variant="body1">
                    No {followUpFilter} follow-ups found
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Great job staying on top of your follow-ups!
                  </Typography>
                </Box>
              ) : (
                followUps.map(renderFollowUpItem)
              )}
              
              {/* Pagination for follow-ups */}
              {followUps.length > 0 && (
                <Box sx={{ 
                  mt: 3, 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <SimplePagination
                    currentPage={followUpCurrentPage}
                    totalPages={followUpTotalPages}
                    totalItems={totalFollowUps}
                    pageSize={followUpPageSize}
                    onPageChange={(page) => {
                      setFollowUpCurrentPage(page);
                      fetchFollowUps(followUpFilter, page);
                    }}
                    itemLabel="follow-ups"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialog.open} onClose={handleCloseRescheduleDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Reschedule Follow-up</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="New Follow-up Date"
              type="date"
              value={rescheduleDialog.newDate}
              onChange={(e) => setRescheduleDialog(prev => ({ ...prev, newDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRescheduleDialog}>Cancel</Button>
            <Button 
              onClick={handleRescheduleSubmit} 
              variant="contained"
              disabled={!rescheduleDialog.newDate}
            >
              Reschedule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Fetch My Customers report when Reports tab becomes active
  useEffect(() => {
    if (activeTab === 2) {
      fetchMyCustomersReport();
      fetchTeamPerformance();
      fetchServicesDemand();
    }
  }, [activeTab]);

  const renderReports = () => {

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount);
    };

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Sales Reports</Typography>
        
        {/* Report 1: My Customers */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#1f2937', fontWeight: 500 }}>
              Report 1: My Customers
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            List of all customers assigned to me, grouped by status with count and total estimated budget per status
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
            Sales Representative: {(() => {
              const currentEmployee = salesEmployees.find(emp => emp._id === myCustomersReport[0]?.assignedTo) || 
                                   salesEmployees.find(emp => emp.id === myCustomersReport[0]?.assignedTo);
              return currentEmployee ? 
                (currentEmployee.firstName && currentEmployee.lastName ? 
                  `${currentEmployee.firstName} ${currentEmployee.lastName}` : 
                  currentEmployee.firstName || currentEmployee.lastName || currentEmployee.name || 'Current User') : 
                'Current User';
            })()}
          </Typography>
          
          {reportError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {reportError}
            </Alert>
          )}
          
          {reportLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : myCustomersReport.length > 0 ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {myCustomersReport.map((statusGroup) => (
                <Box key={statusGroup._id} sx={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  p: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {statusGroup._id}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        label={`${statusGroup.count} customers`} 
                        size="medium" 
                        sx={{ backgroundColor: '#3b82f6', color: 'white' }}
                      />
                      <Chip 
                        label={formatCurrency(statusGroup.totalBudget)} 
                        size="small" 
                        sx={{ backgroundColor: '#10b981', color: 'white' }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Show customers for this status */}
                  {statusGroup.customers && statusGroup.customers.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Customers:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {statusGroup.customers.map(customer => (
                          <Chip
                            key={customer._id}
                            label={`${customer.customer_name} (${customer.company_name})`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '11px' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
              <Typography variant="body1">
                No customer data available. 
              </Typography>
            </Box>
          )}
        </Box>

        {/* Report 2: Team Performance */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#1f2937', fontWeight: 500 }}>
            Report 2: Team Performance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Number of customers by sales rep, number of won deals by sales rep, total estimated value of won deals
          </Typography>
          
          {teamPerformanceError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {teamPerformanceError}
            </Alert>
          )}
          
          {teamPerformanceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : teamPerformanceData ? (
            <Box sx={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sales Representative</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Total Customers</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Won Deals</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      // Combine data from all three arrays
                      const performanceMap = new Map();
                      
                      // Add customer counts
                      if (teamPerformanceData.customers_sales) {
                        teamPerformanceData.customers_sales.forEach(item => {
                          performanceMap.set(item._id, { 
                            customerId: item._id, 
                            totalCustomers: item.count, 
                            wonDeals: 0, 
                            totalValue: 0 
                          });
                        });
                      }
                      
                      // Add won deals counts
                      if (teamPerformanceData.won_deals) {
                        teamPerformanceData.won_deals.forEach(item => {
                          const existing = performanceMap.get(item._id) || { 
                            customerId: item._id, 
                            totalCustomers: 0, 
                            wonDeals: 0, 
                            totalValue: 0 
                          };
                          existing.wonDeals = item.won;
                          performanceMap.set(item._id, existing);
                        });
                      }
                      
                      // Add total values
                      if (teamPerformanceData.won_budget) {
                        teamPerformanceData.won_budget.forEach(item => {
                          const existing = performanceMap.get(item._id) || { 
                            customerId: item._id, 
                            totalCustomers: 0, 
                            wonDeals: 0, 
                            totalValue: 0 
                          };
                          existing.totalValue = item.total;
                          performanceMap.set(item._id, existing);
                        });
                      }
                      
                      return Array.from(performanceMap.values()).map(perf => {
                        const employee = salesEmployees.find(emp => 
                          emp._id === perf.customerId || emp.id === perf.customerId
                        );
                        const repName = employee ? 
                          (employee.firstName && employee.lastName ? 
                            `${employee.firstName} ${employee.lastName}` : 
                            employee.firstName || employee.lastName || employee.name || 'Unknown') : 
                          'Unknown';
                        
                        return (
                          <TableRow key={perf.customerId}>
                            <TableCell>{repName}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={perf.totalCustomers} 
                                size="small" 
                                sx={{ backgroundColor: '#3b82f6', color: 'white' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={perf.wonDeals} 
                                size="small" 
                                sx={{ backgroundColor: '#10b981', color: 'white' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#059669' }}>
                                {formatCurrency(perf.totalValue)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
              <Typography variant="body1">
                No team performance data available. Please check your connection and try again.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Report 3: Services Demand */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#1f2937', fontWeight: 500 }}>
            Report 3: Services Demand
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Count of customers interested in each service, showing which services are most in demand
          </Typography>
          
          {servicesDemandLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : servicesDemandError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {servicesDemandError}
            </Alert>
          ) : servicesDemandData && servicesDemandData.services ? (
            <Box sx={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Service</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Interested Customers</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Demand Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servicesDemandData.services.map((item, index) => {
                      const demandLevel = item.count > 3 ? 'High' : 'Low';
                      const demandColor = item.count > 3 ? '#059669' : '#6b7280';
                      
                      return (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{item._id}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={item.count} 
                              size="small"
                              sx={{ 
                                backgroundColor: '#eff6ff',
                                color: '#1e40af',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={demandLevel}
                              size="small"
                              sx={{ 
                                backgroundColor: demandColor + '20',
                                color: demandColor,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
              <Typography variant="body1">
                No services demand data available. Please check your connection and try again.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1f2937' }}>
        Sales Department
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Customer List" />
        <Tab label="Follow-ups Dashboard" />
        <Tab label="Reports" />
      </Tabs>

      {activeTab === 0 && renderCustomerList()}
      {activeTab === 1 && renderFollowUpsDashboard()}
      {activeTab === 2 && renderReports()}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="md" fullWidth component="form" onSubmit={handleSaveCustomer} noValidate>
        <DialogTitle>
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              error={!!getFieldError('customer_name')}
              helperText={getFieldError('customer_name')}
              required
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: theme => errors.customer_name ? theme.palette.error.main : '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => errors.customer_name ? theme.palette.error.main : '#1976d2',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              error={!!getFieldError('company_name')}
              helperText={getFieldError('company_name')}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: theme => errors.company_name ? theme.palette.error.main : '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => errors.company_name ? theme.palette.error.main : '#1976d2',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={(e) => {
                // Only allow numbers and limit to 15 digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                const event = {
                  target: {
                    name: 'phone_number',
                    value: value
                  }
                };
                handleChange(event);
              }}
              error={!!getFieldError('phone_number')}
              helperText={getFieldError('phone_number') || "Enter 10-15 digits"}
              required
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 15
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: theme => errors.phone_number ? theme.palette.error.main : '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => errors.phone_number ? theme.palette.error.main : '#1976d2',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: theme => errors.email ? theme.palette.error.main : '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => errors.email ? theme.palette.error.main : '#1976d2',
                  },
                },
              }}
            />
            <FormControl fullWidth error={!!getFieldError('services')} required>
              <InputLabel id="services-label">Services</InputLabel>
              <Select
                labelId="services-label"
                id="services-select"
                multiple
                name="services"
                value={formData.services}
                onChange={handleServicesChange}
                error={!!getFieldError('services')}
                label="Services"
                displayEmpty
                renderValue={(selected) => {
                  const servicesError = getFieldError('services');
                  
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  );
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: theme => errors.services ? theme.palette.error.main : '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme => errors.services ? theme.palette.error.main : '#1976d2',
                    },
                  },
                }}
              >
                {availableServices.map((service) => (
                  <MenuItem key={service} value={service}>
                    <Checkbox checked={formData.services.indexOf(service) > -1} />
                    <ListItemText primary={service} />
                  </MenuItem>
                ))}
              </Select>
              {getFieldError('services') && (
                <FormHelperText>{getFieldError('services')}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Estimated Budget"
              name="Budget"
              value={formData.Budget}
              onChange={handleChange}
              error={!!errors.Budget}
              helperText={errors.Budget}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
              sx={textFieldStyle}
            />
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                error={!!errors.status}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Next Follow-up Date"
              name="Next_Followup_Date"
              type="date"
              value={formData.Next_Followup_Date ? formData.Next_Followup_Date.split('T')[0] : ''}
              onChange={handleChange}
              error={!!errors.Next_Followup_Date}
              helperText={errors.Next_Followup_Date}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
              sx={textFieldStyle}
            />
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              error={!!errors.notes}
              helperText={errors.notes}
              disabled={loading}
              sx={textFieldStyle}
            />
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                label="Assigned To"
              >
                {salesEmployees.map((employee) => (
                  <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                    {employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : employee.firstName || employee.lastName || employee.name || employee.employee_name || employee.fullName || employee.full_name || 'Unknown'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseForm} 
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 150, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#115293' } }}
          >
            {isEditing ? 'Update' : 'Add'} Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {viewingCustomer && (
            <Box sx={{ mt: 2 }}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Customer Name</Typography>
                  <Typography variant="body1">{viewingCustomer.customer_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
                  <Typography variant="body1">{viewingCustomer.company_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{viewingCustomer.phone_number}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{viewingCustomer.email}</Typography>
                </Box>
              </Box>

              {/* Business Information */}
              <Typography variant="h6" gutterBottom>Business Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Estimated Budget</Typography>
                  <Typography variant="body1">{viewingCustomer.Budget}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Next Follow-up</Typography>
                  <Typography variant="body1">{formatDate(viewingCustomer.Next_Followup_Date)}</Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="textSecondary">Services</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Array.isArray(viewingCustomer.services) ? viewingCustomer.services.map((service, index) => (
                      <Chip key={index} label={service} size="small" />
                    )) : (
                      <Typography variant="body2">{viewingCustomer.services || 'N/A'}</Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography variant="body1">{viewingCustomer.status}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Assigned To</Typography>
                  <Typography variant="body1">
                    {(() => {
                      const assignedEmployee = salesEmployees.find(emp => (emp._id || emp.id) === viewingCustomer.assigned_to);
                      return assignedEmployee ? (assignedEmployee.firstName && assignedEmployee.lastName ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}` : assignedEmployee.firstName || assignedEmployee.lastName || assignedEmployee.name || assignedEmployee.employee_name || assignedEmployee.fullName || assignedEmployee.full_name) : viewingCustomer.assigned_to || 'N/A';
                    })()}
                  </Typography>
                </Box>
              </Box>

              {/* Additional Information */}
              
                <> 
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>{viewingCustomer.notes}</Typography>
                </>
              
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setShowDetailsDialog(false);
              handleEditCustomer(viewingCustomer);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
          >
            Edit Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Follow-up Dialog */}
      <Dialog open={rescheduleDialog.open} onClose={handleCloseRescheduleDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reschedule Follow-up</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a new date for the follow-up with this customer.
          </Typography>
          <TextField
            fullWidth
            label="New Follow-up Date"
            type="date"
            value={rescheduleDialog.newDate}
            onChange={(e) => setRescheduleDialog(prev => ({ ...prev, newDate: e.target.value }))}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseRescheduleDialog}>Cancel</Button>
          <Button 
            onClick={handleRescheduleSubmit} 
            variant="contained"
            disabled={!rescheduleDialog.newDate}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

 
export default SalesDepartment;
