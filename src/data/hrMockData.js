import { useState, useEffect } from "react";
import api from "../api/axios";
import { API_CONFIG } from "../config/api.js";

// --- EMPLOYEES HOOK ---
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get(API_CONFIG.ENDPOINTS.HR.EMPLOYEES_HR_DEPT);
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const addEmployee = async (employeeData) => {
    try {
      const res = await api.post("/employees", employeeData);
      setEmployees((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const res = await api.put(`/employees/${id}`, employeeData);
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === id ? res.data : emp))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { employees, loading, error, addEmployee, updateEmployee, deleteEmployee };
};

// --- DEPARTMENTS HOOK ---
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get(API_CONFIG.ENDPOINTS.HR.DEPARTMENTS);
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return { departments, loading, error };
};
