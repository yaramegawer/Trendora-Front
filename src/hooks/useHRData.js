import { useState, useEffect } from 'react';
import { employeeApi, departmentApi, leaveApi, payrollApi } from '../services/hrApi';

// Custom hook for employee data
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching employees...');
      const data = await employeeApi.getAllEmployees();
      console.log('Employees data received:', data);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to fetch employees');
      setEmployees([]);
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
      setError(err.message || 'Failed to add employee');
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
      setError(err.message || 'Failed to update employee');
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

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
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
      console.log('Fetching departments...');
      const data = await departmentApi.getAllDepartments();
      console.log('Departments data received:', data);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
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
export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveApi.getAllLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch leaves');
      setLeaves([]);
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

  return {
    leaves,
    loading,
    error,
    addLeave,
    updateLeaveStatus,
    deleteLeave,
    refetch: fetchLeaves
  };
};

// Custom hook for payroll data
export const usePayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await payrollApi.getAllPayroll();
      setPayroll(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payroll');
      setPayroll([]);
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

  useEffect(() => {
    fetchPayroll();
  }, []);

  return {
    payroll,
    loading,
    error,
    generatePayslip,
    updatePayroll,
    deletePayroll,
    refetch: fetchPayroll
  };
};