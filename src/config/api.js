// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    USER: {
      LOGIN: '/user/log_in',
    },
    HR: {
      EMPLOYEES: '/hr/employees',
      EMPLOYEES_HR_DEPT: '/hr/employees/HRDeprt',
      DEPARTMENTS: '/hr/departments',
      LEAVES: '/hr/leaves',
      PAYROLL: '/hr/payroll',
    },
    IT: {
      EMPLOYEES: '/it/employees/ITDeprt',
      EMPLOYEE_RATING: '/it/employees/:id/rating',
      GET_RATING: '/it/employee/:id/rating',
      PROJECTS: '/it/projects',
      TICKETS: '/it/tickets',
      LEAVES: '/it/leaves',
    },
    OPERATION: {
      EMPLOYEES: '/operation/employees/operationDept',
      EMPLOYEE_RATE: '/operation/employees/:id/rate',
      GET_RATE: '/operation/employees/:id/rate',
      CAMPAIGNS: '/operation/campaigns',
      LEAVES: '/operation/leaves',
      TICKETS: '/operation/tickets',
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
