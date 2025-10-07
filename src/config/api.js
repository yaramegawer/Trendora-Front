// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://trendora-nine.vercel.app/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    USER: {
      LOGIN: '/user/log_in',
      FORGET_PASSWORD: '/user/forgetPassword',
      RESET_PASSWORD: '/user/resetPassword',
    },
    HR: {
      EMPLOYEES: '/hr/employees',
      EMPLOYEES_HR_DEPT: '/hr/employees/HRDeprt',
      DEPARTMENTS: '/hr/departments',
      LEAVES: '/hr/leaves',
      PAYROLL: '/hr/payroll',
      ATTENDANCE: '/hr/attendance',
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
    },
    MARKETING: {
      EMPLOYEES: '/digitalMarketing/employees/digitalMarketing',
      EMPLOYEE_RATING: '/digitalMarketing/employees/:id/rate',
      GET_RATING: '/digitalMarketing/employees/:id/rate',
      PROJECTS: '/digitalMarketing/projects',
      TICKETS: '/digitalMarketing/tickets',
      LEAVES: '/digitalMarketing/leaves',
      CUSTOMERS: '/digitalMarketing/customers',
      CUSTOMER_PROJECTS: '/digitalMarketing/customers/:customerName/projects',
    },
    ACCOUNTING: {
      ADD_INVOICE: '/accounting/add_invoice',
      UPDATE_INVOICE: '/accounting/update_invoice',
      GET_ALL_INVOICES: '/accounting/get_all',
      DELETE_INVOICE: '/accounting/delete_invoice',
    },
    DASHBOARD: {
      LEAVES: '/dashboard/leaves',
      TICKETS: '/dashboard/tickets',
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
