import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  DialogActions,
  Typography,
  Grid
} from '@mui/material';

// Constants matching backend validation
const EmployeeStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const Roles = [
  'Manager',
  'Employee', 
  'HR',
  'IT Staff',
  'Accountant'
];

const DocumentTypes = [
  'ID Copy',
  'Passport Copy',
  'Birth Certificate',
  'Educational Certificates',
  'Previous Employment Letter',
  'Medical Certificate',
  'Bank Account Details',
  'Emergency Contact Form',
  'Tax Declaration Form',
  'Insurance Form',
  'Contract Agreement',
  'NDA Agreement'
];

const EmployeeForm = ({ employee, onSave, onCancel, loading = false, departments = [], serverErrors = {} }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    hireDate: '',
    phone: '',
    status: EmployeeStatus.ACTIVE,
    role: 'Employee',
    address: '',
    submittedDocuments: [],
    pendingDocuments: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      // Handle department field - if it's a MongoDB ID, we need to map it to department name
      let departmentValue = employee.department || '';
      
      // If department is a MongoDB ID (24 character hex string), try to find the department name
      if (departmentValue && departmentValue.length === 24 && /^[0-9a-fA-F]+$/.test(departmentValue)) {
        // Try to find the department name from the departments array
        const foundDept = departments.find(dept => dept._id === departmentValue || dept.id === departmentValue);
        departmentValue = foundDept ? foundDept.name : '';
      }
      
      // Handle hire date format - convert from ISO string to yyyy-MM-dd format
      let hireDateValue = employee.hireDate || '';
      if (hireDateValue && hireDateValue.includes('T')) {
        // Convert ISO date string to yyyy-MM-dd format
        hireDateValue = hireDateValue.split('T')[0];
      }
      
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        department: departmentValue,
        hireDate: hireDateValue,
        phone: employee.phone || '',
        status: employee.status || EmployeeStatus.ACTIVE,
        role: employee.role || 'Employee',
        address: employee.address || '',
        submittedDocuments: employee.submittedDocuments || [],
        pendingDocuments: employee.pendingDocuments || []
      });
    } else {
      // Reset form when no employee is provided
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        hireDate: '',
        phone: '',
        status: EmployeeStatus.ACTIVE,
        role: 'Employee',
        address: '',
        submittedDocuments: [],
        pendingDocuments: []
      });
    }
  }, [employee, departments]);

  // Merge server errors with form validation errors
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(prev => ({
        ...prev,
        ...serverErrors
      }));
    }
  }, [serverErrors]);

  const validateForm = () => {
    const newErrors = {};

    // firstName: min 3, max 50, required
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must not exceed 50 characters';
    }

    // lastName: min 3, max 50, required
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 3) {
      newErrors.lastName = 'Last name must be at least 3 characters';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must not exceed 50 characters';
    }

    // email: valid email, required
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }


    // department: required
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // hireDate: required
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }

    // phone: pattern /^[0-9]{10,15}$/, required
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addDocument = (type, document) => {
    if (document && !formData[type].includes(document)) {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [type]: [...prev[type], document]
        };
        
        // If adding to submitted documents, remove from pending documents
        if (type === 'submittedDocuments') {
          newFormData.pendingDocuments = prev.pendingDocuments.filter(doc => doc !== document);
        }
        
        // If adding to pending documents, remove from submitted documents
        if (type === 'pendingDocuments') {
          newFormData.submittedDocuments = prev.submittedDocuments.filter(doc => doc !== document);
        }
        
        return newFormData;
      });
    }
  };

  const removeDocument = (type, document) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(doc => doc !== document)
    }));
  };

  const submitDocument = (document) => {
    // Remove from pending documents
    setFormData(prev => ({
      ...prev,
      pendingDocuments: prev.pendingDocuments.filter(doc => doc !== document),
      submittedDocuments: [...prev.submittedDocuments, document]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Send only fields allowed by backend validation schema
      const dataToSend = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        department: formData.department,
        hireDate: formData.hireDate,
        phone: formData.phone.trim(),
        status: formData.status,
        role: formData.role
      };
      
      // Handle address field (backend: joi.string().min(5).max(200).allow("").optional())
      // Always include address field to allow clearing it with empty string
      const trimmedAddress = formData.address ? formData.address.trim() : '';
      if (trimmedAddress.length > 0 && trimmedAddress.length < 5) {
        // If address has content, validate minimum length
        throw new Error('Address must be at least 5 characters or left empty');
      }
      // Always send address (empty string or valid content)
      dataToSend.address = trimmedAddress;
      
      // Only include documents if they exist and are not empty
      if (formData.submittedDocuments && formData.submittedDocuments.length > 0) {
        dataToSend.submittedDocuments = formData.submittedDocuments;
      }
      if (formData.pendingDocuments && formData.pendingDocuments.length > 0) {
        dataToSend.pendingDocuments = formData.pendingDocuments;
      }
      
      onSave(dataToSend);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} className="pt-4">
        {/* Name Fields */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
            fullWidth
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
            fullWidth
            inputProps={{ maxLength: 50 }}
          />
        </Stack>

        {/* Email */}
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          required
          fullWidth
        />


        {/* Department and Role */}
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth required error={!!errors.department}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              label="Department"
            >
              {departments.map((dept, index) => {
                const deptName = dept.name || dept.departmentName || dept;
                const deptId = dept._id || dept.id || `dept-${index}`;
                return (
                  <MenuItem key={deptId} value={deptName}>
                    {deptName}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.department && (
              <Typography variant="caption" color="error" className="mt-1 ml-3">
                {errors.department}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role || 'Employee'}
              onChange={(e) => handleChange('role', e.target.value)}
              label="Role"
            >
              {Roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Phone and Hire Date */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone || '10-15 digits only'}
            required
            fullWidth
            inputProps={{ pattern: '[0-9]{10,15}', maxLength: 15 }}
          />
          <TextField
            label="Hire Date"
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleChange('hireDate', e.target.value)}
            error={!!errors.hireDate}
            helperText={errors.hireDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {/* Status */}
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status || EmployeeStatus.ACTIVE}
            onChange={(e) => handleChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value={EmployeeStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={EmployeeStatus.INACTIVE}>Inactive</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Address Section */}
      <Typography variant="h6" className="mt-6 mb-4" style={{ fontSize: '16px', fontWeight: '600' }}>
        Address Information (Optional)
      </Typography>
      <TextField
        label="Address (Optional)"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder="Enter complete address (street, city, state, zip code, country)"
        inputProps={{ maxLength: 200 }}
        helperText={`${formData.address.length}/200 characters`}
      />

      {/* Document Tracking Section */}
      <Typography variant="h6" className="mt-6 mb-4" style={{ fontSize: '16px', fontWeight: '600' }}>
        Document Tracking
      </Typography>
      <Stack spacing={3}>
        {/* Submitted Documents */}
        <div>
          <Typography variant="subtitle2" className="mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
            Submitted Documents
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {formData.submittedDocuments.map((doc, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {doc}
                <button
                  type="button"
                  onClick={() => removeDocument('submittedDocuments', doc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    marginLeft: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <FormControl fullWidth>
            <InputLabel>Add Submitted Document</InputLabel>
            <Select
              value=""
              onChange={(e) => addDocument('submittedDocuments', e.target.value)}
              label="Add Submitted Document"
            >
              {DocumentTypes.filter(doc => 
                !formData.submittedDocuments.includes(doc) && 
                !formData.pendingDocuments.includes(doc)
              ).map((doc) => (
                <MenuItem key={doc} value={doc}>
                  {doc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Pending Documents */}
        <div>
          <Typography variant="subtitle2" className="mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
            Pending Documents
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {formData.pendingDocuments.map((doc, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {doc}
                <button
                  type="button"
                  onClick={() => submitDocument(doc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    marginLeft: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    marginRight: '2px'
                  }}
                  title="Submit document"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => removeDocument('pendingDocuments', doc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    marginLeft: '2px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title="Remove document"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <FormControl fullWidth>
            <InputLabel>Add Pending Document</InputLabel>
            <Select
              value=""
              onChange={(e) => addDocument('pendingDocuments', e.target.value)}
              label="Add Pending Document"
            >
              {DocumentTypes.filter(doc => 
                !formData.pendingDocuments.includes(doc) && 
                !formData.submittedDocuments.includes(doc)
              ).map((doc) => (
                <MenuItem key={doc} value={doc}>
                  {doc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Stack>

      <DialogActions className="pt-6">
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className="bg-primary-main hover:bg-primary-dark"
          disabled={loading}
        >
          {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default EmployeeForm;