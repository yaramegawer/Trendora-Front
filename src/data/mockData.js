// Mock data for HR Dashboard
export const mockStore = {
  user: {
    firstName: "John",
    lastName: "Doe",
    role: "HR Manager"
  },
  dashboardStats: {
    totalEmployees: 156,
    totalDepartments: 8,
    pendingLeaves: 12,
    monthlyPayroll: 125000
  }
};

// Mock data for employees
export const mockEmployees = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    position: "Software Engineer",
    department: "IT",
    salary: 75000,
    hireDate: "2023-01-15",
    status: "active"
  },
  {
    _id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    position: "HR Manager",
    department: "HR",
    salary: 85000,
    hireDate: "2022-06-01",
    status: "active"
  },
  {
    _id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@company.com",
    position: "Marketing Specialist",
    department: "Marketing",
    salary: 65000,
    hireDate: "2023-03-10",
    status: "active"
  }
];

// Mock data for departments
export const mockDepartments = [
  {
    _id: "1",
    name: "Human Resources",
    description: "Manages employee relations and policies",
    employeeCount: 12,
    manager: "Jane Smith"
  },
  {
    _id: "2",
    name: "Information Technology",
    description: "Handles all technical infrastructure",
    employeeCount: 25,
    manager: "John Doe"
  },
  {
    _id: "3",
    name: "Marketing",
    description: "Promotes company products and services",
    employeeCount: 18,
    manager: "Mike Johnson"
  }
];

// Mock data for leaves
export const mockLeaves = [
  {
    _id: "1",
    employeeId: "1",
    employeeName: "John Doe",
    type: "Annual Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    status: "pending",
    reason: "Family vacation"
  },
  {
    _id: "2",
    employeeId: "2",
    employeeName: "Jane Smith",
    type: "Sick Leave",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    status: "approved",
    reason: "Medical appointment"
  }
];

// Mock data for payroll
export const mockPayrolls = [
  {
    _id: "1",
    employeeId: "1",
    employeeName: "John Doe",
    month: "January 2024",
    basicSalary: 75000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 78000,
    status: "paid"
  },
  {
    _id: "2",
    employeeId: "2",
    employeeName: "Jane Smith",
    month: "January 2024",
    basicSalary: 85000,
    allowances: 3000,
    deductions: 1500,
    netSalary: 86500,
    status: "paid"
  }
];

// Utility function for currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
