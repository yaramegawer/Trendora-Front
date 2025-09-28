import { useState, useEffect } from 'react';
import { payrollApi } from '../services/hrApi';

export const usePayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payrollApi.getAllPayroll();
      setPayroll(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payroll data');
      setPayroll([]);
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
    getPayslip,
    fetchPayroll
  };
};
