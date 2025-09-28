import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  Button,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const DepartmentForm = ({ department, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        status: department.status || 'active'
      });
    }
  }, [department]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.status) {
      newErrors.status = 'Department status is required';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} className="pt-4">
        <TextField
          label="Department Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
        />

        <FormControl fullWidth error={!!errors.status}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
          {errors.status && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
              {errors.status}
            </Typography>
          )}
        </FormControl>

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
          {loading ? 'Saving...' : (department ? 'Update Department' : 'Add Department')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default DepartmentForm;