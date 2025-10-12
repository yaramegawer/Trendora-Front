# 🗄️ Test Data Setup Guide

This guide helps you prepare comprehensive test data for thorough testing of the Trendora application.

---

## 🎯 Purpose
Having consistent, comprehensive test data ensures:
- ✅ Repeatable tests
- ✅ Consistent results across testers
- ✅ Coverage of various scenarios
- ✅ Edge case identification
- ✅ Performance testing with realistic data

---

## 👥 Test User Accounts

### 1. Administrator Account
```json
{
  "email": "admin@trendora.com",
  "password": "Admin@123",
  "role": "Admin",
  "firstName": "Admin",
  "lastName": "User",
  "department": "Administration",
  "status": "Active"
}
```
**Purpose**: Full system access, all CRUD operations

---

### 2. HR Department Account
```json
{
  "email": "hr@trendora.com",
  "password": "HR@123",
  "role": "HR",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "department": "HR",
  "status": "Active"
}
```
**Purpose**: HR operations, employee management, leave approvals

---

### 3. Manager Accounts

#### IT Manager
```json
{
  "email": "manager.it@trendora.com",
  "password": "Manager@123",
  "role": "Manager",
  "firstName": "John",
  "lastName": "Smith",
  "department": "IT",
  "status": "Active"
}
```

#### Marketing Manager
```json
{
  "email": "manager.marketing@trendora.com",
  "password": "Manager@123",
  "role": "Manager",
  "firstName": "Emily",
  "lastName": "Davis",
  "department": "Digital Marketing",
  "status": "Active"
}
```

#### Operations Manager
```json
{
  "email": "manager.ops@trendora.com",
  "password": "Manager@123",
  "role": "Manager",
  "firstName": "Michael",
  "lastName": "Brown",
  "department": "Operation",
  "status": "Active"
}
```

#### Accounting Manager
```json
{
  "email": "manager.accounting@trendora.com",
  "password": "Manager@123",
  "role": "Manager",
  "firstName": "Jennifer",
  "lastName": "Wilson",
  "department": "Accounting",
  "status": "Active"
}
```

#### Sales Manager
```json
{
  "email": "manager.sales@trendora.com",
  "password": "Manager@123",
  "role": "Manager",
  "firstName": "Robert",
  "lastName": "Martinez",
  "department": "Sales",
  "status": "Active"
}
```

---

### 4. IT Staff Account
```json
{
  "email": "itstaff@trendora.com",
  "password": "ITStaff@123",
  "role": "IT Staff",
  "firstName": "David",
  "lastName": "Anderson",
  "department": "IT",
  "status": "Active"
}
```
**Purpose**: IT operations, support tickets, asset management

---

### 5. Regular Employee Accounts

#### Employee 1
```json
{
  "email": "employee1@trendora.com",
  "password": "Employee@123",
  "role": "Employee",
  "firstName": "Alice",
  "lastName": "Thompson",
  "department": "IT",
  "status": "Active"
}
```

#### Employee 2
```json
{
  "email": "employee2@trendora.com",
  "password": "Employee@123",
  "role": "Employee",
  "firstName": "Bob",
  "lastName": "Garcia",
  "department": "Marketing",
  "status": "Active"
}
```

#### Employee 3
```json
{
  "email": "employee3@trendora.com",
  "password": "Employee@123",
  "role": "Employee",
  "firstName": "Carol",
  "lastName": "Rodriguez",
  "department": "Sales",
  "status": "Active"
}
```

#### Employee 4
```json
{
  "email": "employee4@trendora.com",
  "password": "Employee@123",
  "role": "Employee",
  "firstName": "Daniel",
  "lastName": "Lee",
  "department": "Accounting",
  "status": "Active"
}
```

#### Employee 5 (Inactive - for testing status filters)
```json
{
  "email": "inactive@trendora.com",
  "password": "Employee@123",
  "role": "Employee",
  "firstName": "Inactive",
  "lastName": "User",
  "department": "Operation",
  "status": "Inactive"
}
```

---

## 🏢 Department Test Data

### 1. HR Department
```json
{
  "name": "HR",
  "description": "Human Resources Department",
  "departmentHead": "hr@trendora.com",
  "employeeCount": 5,
  "status": "Active"
}
```

### 2. IT Department
```json
{
  "name": "IT",
  "description": "Information Technology Department",
  "departmentHead": "manager.it@trendora.com",
  "employeeCount": 8,
  "status": "Active"
}
```

### 3. Digital Marketing Department
```json
{
  "name": "Digital Marketing",
  "description": "Digital Marketing and Social Media Department",
  "departmentHead": "manager.marketing@trendora.com",
  "employeeCount": 6,
  "status": "Active"
}
```

### 4. Operation Department
```json
{
  "name": "Operation",
  "description": "Operations and Project Management Department",
  "departmentHead": "manager.ops@trendora.com",
  "employeeCount": 7,
  "status": "Active"
}
```

### 5. Accounting Department
```json
{
  "name": "Accounting",
  "description": "Finance and Accounting Department",
  "departmentHead": "manager.accounting@trendora.com",
  "employeeCount": 5,
  "status": "Active"
}
```

### 6. Sales Department
```json
{
  "name": "Sales",
  "description": "Sales and Business Development Department",
  "departmentHead": "manager.sales@trendora.com",
  "employeeCount": 9,
  "status": "Active"
}
```

---

## 🏖️ Leave Request Test Data

### Pending Leave Requests
```json
[
  {
    "employeeId": "employee1@trendora.com",
    "leaveType": "Casual Leave",
    "startDate": "2025-10-20",
    "endDate": "2025-10-22",
    "days": 3,
    "reason": "Family function",
    "status": "Pending",
    "appliedDate": "2025-10-12"
  },
  {
    "employeeId": "employee2@trendora.com",
    "leaveType": "Sick Leave",
    "startDate": "2025-10-15",
    "endDate": "2025-10-16",
    "days": 2,
    "reason": "Medical appointment",
    "status": "Pending",
    "appliedDate": "2025-10-11"
  }
]
```

### Approved Leave Requests
```json
[
  {
    "employeeId": "employee3@trendora.com",
    "leaveType": "Annual Leave",
    "startDate": "2025-09-15",
    "endDate": "2025-09-20",
    "days": 6,
    "reason": "Vacation",
    "status": "Approved",
    "appliedDate": "2025-09-01",
    "approvedBy": "hr@trendora.com",
    "approvedDate": "2025-09-02"
  }
]
```

### Rejected Leave Requests
```json
[
  {
    "employeeId": "employee4@trendora.com",
    "leaveType": "Casual Leave",
    "startDate": "2025-08-25",
    "endDate": "2025-08-27",
    "days": 3,
    "reason": "Personal work",
    "status": "Rejected",
    "appliedDate": "2025-08-20",
    "rejectedBy": "hr@trendora.com",
    "rejectedDate": "2025-08-21",
    "rejectionReason": "Insufficient leave balance"
  }
]
```

---

## 📅 Attendance Test Data

### Current Month Attendance (October 2025)
```json
[
  {
    "employeeId": "employee1@trendora.com",
    "date": "2025-10-01",
    "status": "Present",
    "checkIn": "09:00 AM",
    "checkOut": "05:30 PM",
    "workHours": 8.5
  },
  {
    "employeeId": "employee1@trendora.com",
    "date": "2025-10-02",
    "status": "Present",
    "checkIn": "09:15 AM",
    "checkOut": "05:45 PM",
    "workHours": 8.5
  },
  {
    "employeeId": "employee2@trendora.com",
    "date": "2025-10-01",
    "status": "Leave",
    "leaveType": "Sick Leave"
  },
  {
    "employeeId": "employee3@trendora.com",
    "date": "2025-10-01",
    "status": "Absent",
    "reason": "Unplanned absence"
  }
]
```

---

## 💰 Payroll Test Data

### Monthly Payroll Records
```json
[
  {
    "employeeId": "employee1@trendora.com",
    "month": "September 2025",
    "basicSalary": 50000,
    "allowances": 5000,
    "deductions": 2000,
    "bonus": 3000,
    "netSalary": 56000,
    "status": "Paid",
    "paidDate": "2025-10-01"
  },
  {
    "employeeId": "employee2@trendora.com",
    "month": "September 2025",
    "basicSalary": 45000,
    "allowances": 4500,
    "deductions": 1800,
    "bonus": 0,
    "netSalary": 47700,
    "status": "Paid",
    "paidDate": "2025-10-01"
  },
  {
    "employeeId": "employee3@trendora.com",
    "month": "October 2025",
    "basicSalary": 55000,
    "allowances": 5500,
    "deductions": 2200,
    "bonus": 5000,
    "netSalary": 63300,
    "status": "Pending",
    "paidDate": null
  }
]
```

---

## 💼 Invoice Test Data (Accounting)

### Draft Invoices
```json
[
  {
    "invoiceNumber": "INV-2025-001",
    "clientName": "ABC Corporation",
    "date": "2025-10-10",
    "dueDate": "2025-10-25",
    "items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "rate": 5000,
        "amount": 50000
      }
    ],
    "subtotal": 50000,
    "tax": 9000,
    "total": 59000,
    "status": "Draft"
  }
]
```

### Paid Invoices
```json
[
  {
    "invoiceNumber": "INV-2025-002",
    "clientName": "XYZ Ltd",
    "date": "2025-09-15",
    "dueDate": "2025-09-30",
    "items": [
      {
        "description": "Software Development",
        "quantity": 1,
        "rate": 100000,
        "amount": 100000
      }
    ],
    "subtotal": 100000,
    "tax": 18000,
    "total": 118000,
    "status": "Paid",
    "paidDate": "2025-09-28"
  }
]
```

### Overdue Invoices
```json
[
  {
    "invoiceNumber": "INV-2025-003",
    "clientName": "PQR Industries",
    "date": "2025-08-20",
    "dueDate": "2025-09-05",
    "items": [
      {
        "description": "Marketing Services",
        "quantity": 5,
        "rate": 8000,
        "amount": 40000
      }
    ],
    "subtotal": 40000,
    "tax": 7200,
    "total": 47200,
    "status": "Overdue",
    "daysOverdue": 37
  }
]
```

---

## 💳 Transaction Test Data

### Income Transactions
```json
[
  {
    "transactionId": "TXN-2025-001",
    "date": "2025-09-28",
    "type": "Income",
    "category": "Invoice Payment",
    "amount": 118000,
    "description": "Payment received from XYZ Ltd",
    "reference": "INV-2025-002",
    "paymentMethod": "Bank Transfer"
  },
  {
    "transactionId": "TXN-2025-002",
    "date": "2025-10-05",
    "type": "Income",
    "category": "Service Revenue",
    "amount": 75000,
    "description": "Consulting fees",
    "reference": "INV-2025-004",
    "paymentMethod": "Cheque"
  }
]
```

### Expense Transactions
```json
[
  {
    "transactionId": "TXN-2025-003",
    "date": "2025-10-01",
    "type": "Expense",
    "category": "Payroll",
    "amount": 500000,
    "description": "September salary payments",
    "reference": "PAYROLL-SEP-2025",
    "paymentMethod": "Bank Transfer"
  },
  {
    "transactionId": "TXN-2025-004",
    "date": "2025-10-08",
    "type": "Expense",
    "category": "Office Supplies",
    "amount": 15000,
    "description": "Office supplies purchase",
    "reference": "PO-2025-045",
    "paymentMethod": "Credit Card"
  }
]
```

---

## 🎯 Marketing Campaign Test Data

### Active Campaigns
```json
[
  {
    "campaignId": "CAMP-2025-001",
    "name": "Fall Product Launch",
    "description": "New product launch campaign for Q4",
    "startDate": "2025-10-01",
    "endDate": "2025-12-31",
    "budget": 100000,
    "spent": 25000,
    "status": "Active",
    "platform": "Multi-channel",
    "assignedTo": ["employee2@trendora.com"],
    "customers": 150,
    "leads": 45,
    "conversions": 12
  }
]
```

### Completed Campaigns
```json
[
  {
    "campaignId": "CAMP-2025-002",
    "name": "Summer Sale 2025",
    "description": "Summer clearance sale campaign",
    "startDate": "2025-06-01",
    "endDate": "2025-08-31",
    "budget": 50000,
    "spent": 48000,
    "status": "Completed",
    "platform": "Social Media",
    "assignedTo": ["employee2@trendora.com"],
    "customers": 200,
    "leads": 80,
    "conversions": 35,
    "roi": "125%"
  }
]
```

---

## 🏭 Project Test Data (Operations)

### Active Projects
```json
[
  {
    "projectId": "PROJ-2025-001",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "startDate": "2025-09-01",
    "endDate": "2025-12-31",
    "status": "In Progress",
    "priority": "High",
    "budget": 200000,
    "spent": 75000,
    "progress": 35,
    "teamMembers": ["employee1@trendora.com", "itstaff@trendora.com"],
    "tasks": 25,
    "completedTasks": 10
  }
]
```

### Completed Projects
```json
[
  {
    "projectId": "PROJ-2025-002",
    "name": "Office Renovation",
    "description": "Renovation of office space",
    "startDate": "2025-07-01",
    "endDate": "2025-09-30",
    "status": "Completed",
    "priority": "Medium",
    "budget": 150000,
    "spent": 145000,
    "progress": 100,
    "teamMembers": ["manager.ops@trendora.com"],
    "tasks": 15,
    "completedTasks": 15,
    "completedDate": "2025-09-28"
  }
]
```

---

## 💻 IT Support Tickets (if implemented)

### Open Tickets
```json
[
  {
    "ticketId": "TICK-2025-001",
    "subject": "Password Reset Request",
    "description": "Unable to access email account",
    "priority": "High",
    "status": "Open",
    "createdBy": "employee1@trendora.com",
    "assignedTo": "itstaff@trendora.com",
    "createdDate": "2025-10-12",
    "category": "Access Issue"
  },
  {
    "ticketId": "TICK-2025-002",
    "subject": "Laptop Running Slow",
    "description": "Laptop performance degraded significantly",
    "priority": "Medium",
    "status": "In Progress",
    "createdBy": "employee2@trendora.com",
    "assignedTo": "itstaff@trendora.com",
    "createdDate": "2025-10-10",
    "category": "Hardware Issue"
  }
]
```

### Closed Tickets
```json
[
  {
    "ticketId": "TICK-2025-003",
    "subject": "Software Installation",
    "description": "Need Adobe Photoshop installed",
    "priority": "Low",
    "status": "Closed",
    "createdBy": "employee2@trendora.com",
    "assignedTo": "itstaff@trendora.com",
    "createdDate": "2025-10-05",
    "closedDate": "2025-10-06",
    "category": "Software Request",
    "resolution": "Software installed successfully"
  }
]
```

---

## 📈 Sales Test Data

### Active Leads
```json
[
  {
    "leadId": "LEAD-2025-001",
    "companyName": "Tech Solutions Inc",
    "contactPerson": "John Doe",
    "email": "john@techsolutions.com",
    "phone": "+1234567890",
    "source": "Website",
    "status": "Qualified",
    "assignedTo": "employee3@trendora.com",
    "value": 50000,
    "probability": 60,
    "createdDate": "2025-10-01"
  }
]
```

### Customers
```json
[
  {
    "customerId": "CUST-2025-001",
    "companyName": "ABC Corporation",
    "contactPerson": "Jane Smith",
    "email": "jane@abc.com",
    "phone": "+1234567891",
    "address": "123 Business St, City",
    "status": "Active",
    "assignedTo": "employee3@trendora.com",
    "totalRevenue": 500000,
    "joinedDate": "2024-01-15"
  }
]
```

---

## 🔧 Setup Instructions

### Method 1: Manual Setup
1. Login as Admin
2. Navigate to each module
3. Create test data using the UI
4. Use the JSON templates above as reference

### Method 2: API/Backend Setup (Recommended)
If you have database access or API endpoints:

1. **Create SQL/MongoDB scripts** with test data
2. **Run migration/seed scripts** to populate database
3. **Verify** data appears in UI

### Method 3: Import Feature (if available)
1. Export templates as CSV/Excel
2. Use import feature in each module
3. Validate imported data

---

## ✅ Verification Checklist

After setting up test data, verify:

- [ ] All test users can login
- [ ] Each role has appropriate access
- [ ] Departments are visible
- [ ] Employees appear in correct departments
- [ ] Leave requests show different statuses
- [ ] Attendance records display
- [ ] Payroll data loads
- [ ] Invoices show different statuses
- [ ] Transactions categorized correctly
- [ ] Campaigns display with data
- [ ] Projects show progress
- [ ] Support tickets (if applicable) visible
- [ ] Sales leads/customers visible

---

## 🎯 Test Scenarios Coverage

With this test data, you can test:

✅ **Filtering**: By status, department, date, etc.
✅ **Search**: By name, email, invoice number, etc.
✅ **Sorting**: By date, amount, status, etc.
✅ **Pagination**: With sufficient records
✅ **CRUD Operations**: Create, Read, Update, Delete
✅ **Validations**: With various data types
✅ **Authorization**: Different roles accessing data
✅ **Workflows**: Leave approval, invoice payment, etc.
✅ **Edge Cases**: Empty states, large numbers, special characters
✅ **Performance**: With realistic data volume

---

## 🔄 Data Maintenance

### Regular Updates
- Update dates to current/future dates
- Reset test passwords regularly
- Clear old test data periodically
- Refresh financial data monthly
- Update campaign dates quarterly

### Data Cleanup
Before major testing cycles:
1. Reset all test passwords
2. Clear pending/draft items
3. Update dates to current period
4. Reset leave balances
5. Clear old notifications

---

## 📊 Test Data Volumes

For performance testing, consider:

### Minimal Data (Smoke Testing)
- 10 employees
- 5 departments
- 10 leave requests
- 5 invoices
- 5 transactions

### Standard Data (Regular Testing)
- 50 employees
- 6 departments
- 50 leave requests
- 25 invoices
- 50 transactions
- 10 campaigns/projects

### Load Testing Data
- 500+ employees
- 10+ departments
- 500+ leave requests
- 200+ invoices
- 500+ transactions
- 50+ campaigns/projects

---

## 🔐 Security Notes

**⚠️ IMPORTANT**:
- ❗ Never use real employee data for testing
- ❗ Never use real financial data
- ❗ Never use real customer information
- ❗ Use clearly identifiable test emails (@trendora.com)
- ❗ Use strong but consistent test passwords
- ❗ Mark test users clearly in the system
- ❗ Separate test and production environments
- ❗ Delete test data before production launch

---

## 📝 Quick Reference Card

Print this for quick access:

```
==========================================
TRENDORA TEST ACCOUNTS QUICK REFERENCE
==========================================

Admin:
  Email: admin@trendora.com
  Pass:  Admin@123

HR:
  Email: hr@trendora.com
  Pass:  HR@123

IT Manager:
  Email: manager.it@trendora.com
  Pass:  Manager@123

Employee:
  Email: employee1@trendora.com
  Pass:  Employee@123

IT Staff:
  Email: itstaff@trendora.com
  Pass:  ITStaff@123

==========================================
DEPARTMENTS: HR, IT, Digital Marketing,
Operation, Accounting, Sales
==========================================
```

---

**Pro Tip**: Keep a copy of all test credentials in a secure password manager or team documentation for easy access by all testers.

**Last Updated**: October 12, 2025  
**Version**: 1.0

