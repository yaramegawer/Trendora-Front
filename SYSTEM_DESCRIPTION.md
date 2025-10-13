# Trendora Business Management System - Detailed Description

## Executive Summary

**Trendora** is a comprehensive, multi-department business management platform designed for enterprise-level organizations. The system provides role-based access control (RBAC), department-specific modules, and streamlined workflows for various business operations including HR management, IT operations, digital marketing, operations management, accounting, and sales.

The system is built as a **Single Page Application (SPA)** using React with Material-UI and Tailwind CSS, communicating with a RESTful backend API through JWT-based authentication.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Authentication and Authorization Flow](#authentication-and-authorization-flow)
4. [Department Modules](#department-modules)
5. [Core Features](#core-features)
6. [Data Flow](#data-flow)
7. [API Structure](#api-structure)
8. [User Workflows](#user-workflows)
9. [Technical Stack](#technical-stack)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React SPA - Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Context │  │ Notification │  │ Theme/UI     │         │
│  │ (State Mgmt) │  │ Context      │  │ Components   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Main Layout                            │  │
│  │  ┌──────────┐ ┌─────────────────────────────────────┐   │  │
│  │  │ Sidebar  │ │     Content Area (Dynamic)           │   │  │
│  │  │ Menu     │ │  - Dashboard                         │   │  │
│  │  │          │ │  - Department Modules                │   │  │
│  │  └──────────┘ └─────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS (REST API)
                           │ JWT Token Authentication
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND API LAYER                            │
│                 (Node.js/Express - RESTful)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Service │  │ User Service │  │ Dept Services│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │  - Authorization & Validation                            │  │
│  │  - Data Processing                                       │  │
│  │  - Department-Specific Operations                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     DATABASE LAYER                               │
│                    (MongoDB/NoSQL)                               │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                   │
│  - Users, Employees, Departments                                │
│  - Leaves, Tickets, Projects                                    │
│  - Invoices, Transactions, Campaigns                            │
│  - Attendance, Payroll                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 System Components

#### Frontend Components
- **Authentication Layer**: Login, password reset, session management
- **Layout Components**: Sidebar navigation, app bar, main content area
- **Department Modules**: 6 specialized department interfaces
- **Dashboard Components**: Overview and employee-specific dashboards
- **Common Components**: Forms, tables, pagination, dialogs, notifications
- **Context Providers**: Authentication state, notifications, theme

#### Backend Components (API)
- **Authentication Service**: JWT token generation, validation
- **User Management Service**: User CRUD operations, role management
- **Department Services**: HR, IT, Marketing, Operation, Accounting, Sales
- **Authorization Middleware**: Role and department-based access control
- **Data Validation**: Input validation, business rule enforcement

#### Database Schema
- **Users Collection**: Authentication and profile data
- **Employees Collection**: Employee records with department assignments
- **Departments Collection**: Department definitions and hierarchies
- **Leaves Collection**: Leave requests and approvals
- **Tickets Collection**: Support tickets by department
- **Projects Collection**: IT and Marketing project tracking
- **Invoices Collection**: Financial invoicing data
- **Attendance Collection**: Employee attendance records
- **Payroll Collection**: Payroll processing data

---

## 2. User Roles and Permissions

### 2.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                          ADMIN                               │
│  • Full system access                                       │
│  • All department access                                    │
│  • User and role management                                 │
│  • System configuration                                     │
│  • All CRUD operations                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┐
        │                         │              │
┌───────▼────────┐  ┌────────────▼─────┐  ┌────▼────────────┐
│   HR ROLE      │  │  MANAGER ROLE     │  │ IT STAFF ROLE   │
│ • HR Dept      │  │ • Assigned Dept   │  │ • IT Dept       │
│ • Employee Mgmt│  │ • Team Management │  │ • Support       │
│ • Leave Mgmt   │  │ • Dept Operations │  │ • IT Operations │
│ • Payroll      │  │ • Approvals       │  │ • Ticket Mgmt   │
│ • Attendance   │  │ • Reports         │  │ • Asset Mgmt    │
└────────────────┘  └───────────────────┘  └─────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┐
        │                         │              │
┌───────▼────────────┐  ┌─────────▼─────────┐  ┌──▼──────────┐
│ DEPARTMENT MANAGER │  │ SALES/MARKETING   │  │ ACCOUNTING  │
│ (Digital Marketing,│  │ STAFF             │  │ STAFF       │
│  Operations,       │  │ • Sales/Marketing │  │ • Accounting│
│  Accounting, Sales)│  │   Dept Access     │  │   Dept      │
│ • Dept-specific    │  │ • Customer Mgmt   │  │ • Invoices  │
│   operations       │  │ • Lead Tracking   │  │ • Financial │
└────────────────────┘  └───────────────────┘  └─────────────┘
                     │
        ┌────────────┴────────────────────────┐
        │                                     │
┌───────▼──────────┐              ┌──────────▼────────┐
│  EMPLOYEE ROLE   │              │  GUEST/PUBLIC     │
│ • Own Dashboard  │              │ • Login only      │
│ • Leave Request  │              │ • No access       │
│ • Ticket Submit  │              └───────────────────┘
│ • View Own Data  │
└──────────────────┘
```

### 2.2 Permission Matrix

| Feature/Module | Admin | Manager | HR | IT Staff | Employee |
|----------------|-------|---------|----|---------|---------| 
| **Dashboard Access** | ✅ All | ✅ Assigned | ✅ Own | ✅ Own | ✅ Own |
| **Employee Management** | ✅ All | ❌ | ✅ All | ❌ | ❌ |
| **Department Access** | ✅ All | ✅ Assigned | ✅ HR Only | ✅ IT Only | ❌ |
| **Leave Approval** | ✅ | ✅ (Dept) | ✅ | ❌ | ❌ |
| **Leave Request** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ticket Management** | ✅ | ✅ (Dept) | ❌ | ✅ (IT) | ❌ |
| **Ticket Creation** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Payroll Management** | ✅ | ❌ | ✅ | ❌ | ❌ (View only) |
| **Invoice Management** | ✅ | ✅ (Accounting) | ❌ | ❌ | ❌ |
| **User Role Management** | ✅ | ❌ | ✅ (Limited) | ❌ | ❌ |
| **System Configuration** | ✅ | ❌ | ❌ | ❌ | ❌ |

### 2.3 Department-Specific Roles

**Department ID Mapping:**
```javascript
{
  '68da376594328b3a175633a7': 'IT',
  '68da377194328b3a175633ad': 'HR',
  '68da378594328b3a175633b3': 'Operation',
  '68da378d94328b3a175633b9': 'Sales',
  '68da379894328b3a175633bf': 'Accounting',
  '68da6e0813fe176e91aefd59': 'Digital Marketing'
}
```

---

## 3. Authentication and Authorization Flow

### 3.1 Complete Authentication Flow

```
┌──────────────┐
│   USER       │
│ Opens App    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Check Session       │
│  (localStorage)      │
└──────┬───────────────┘
       │
       ├─── Session Valid? ───No───► ┌─────────────┐
       │                              │ Login Page  │
       │                              └──────┬──────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Enter Credentials   │
       │                              │ - Email             │
       │                              │ - Password          │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Frontend Validation │
       │                              │ - Email format      │
       │                              │ - Required fields   │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ POST /api/user/     │
       │                              │      log_in         │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Backend Validates   │
       │                              │ - Credentials       │
       │                              │ - Account status    │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Generate JWT Token  │
       │                              │ - user_id           │
       │                              │ - role              │
       │                              │ - department        │
       │                              │ - expiry            │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Return Token + User │
       │                              │ Data to Frontend    │
       │                              └──────┬──────────────┘
       │                                     │
       │                              ┌──────▼──────────────┐
       │                              │ Store in localStorage│
       │                              │ - token             │
       │                              │ - user object       │
       │                              │ - isAuthenticated   │
       │                              └──────┬──────────────┘
       │                                     │
       └─────────────────────────────────────┘
                     │
                     ▼
       ┌──────────────────────────┐
       │ Decode JWT to Extract:   │
       │ - User ID                │
       │ - Role (Admin/Manager/   │
       │   HR/Employee)           │
       │ - Department ID          │
       │ - Permissions            │
       └──────┬───────────────────┘
              │
              ▼
       ┌──────────────────────────┐
       │ Determine Dashboard Type │
       │ Based on Role:           │
       └──────┬───────────────────┘
              │
       ┌──────┴──────┐
       │             │
   Employee?     Admin/Manager?
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  Employee   │  │  Overview   │
│  Dashboard  │  │  Dashboard  │
└─────────────┘  └─────────────┘
```

### 3.2 Authorization Flow (Per Request)

```
User Clicks Menu Item (e.g., "IT Department")
    │
    ▼
┌──────────────────────────────────────┐
│ Frontend: Check Department Access    │
│ - getUserDepartment(user)            │
│ - checkDepartmentAccess(user, 'IT')  │
└──────┬───────────────────────────────┘
       │
   Authorized? ────No────► ┌──────────────────┐
       │                    │ Show Access      │
       │                    │ Denied Message   │
       │                    │ (with reason)    │
       │                    └──────────────────┘
       │
      Yes
       │
       ▼
┌──────────────────────────────────────┐
│ Load Department Component             │
│ (e.g., ITDepartment.jsx)             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Component Makes API Request           │
│ GET /api/it/employees                 │
│ Header: Authorization: Bearer <token> │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Validate JWT Token          │
│ - Verify signature                   │
│ - Check expiration                   │
│ - Extract user info                  │
└──────┬───────────────────────────────┘
       │
   Valid? ────No────► ┌──────────────────┐
       │               │ Return 401       │
       │               │ Unauthorized     │
       │               └──────────────────┘
       │
      Yes
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Check Department Access     │
│ - User's department vs. requested    │
│ - Admin users bypass check           │
└──────┬───────────────────────────────┘
       │
   Authorized? ────No────► ┌──────────────────┐
       │                    │ Return 403       │
       │                    │ Forbidden        │
       │                    └──────────────────┘
       │
      Yes
       │
       ▼
┌──────────────────────────────────────┐
│ Process Request & Return Data        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Frontend: Display Data               │
└──────────────────────────────────────┘
```

### 3.3 Session Management

**Token Storage:**
- JWT token stored in `localStorage` with key: `token`
- User object stored with key: `user`
- Auth status flag with key: `isAuthenticated`

**Token Lifecycle:**
1. Generated on successful login
2. Included in all API requests (Authorization header)
3. Validated by backend on each request
4. Expires based on backend configuration
5. Cleared on logout or invalid state

**Logout Flow:**
```
User Clicks Logout
    │
    ▼
Clear localStorage
    - Remove 'token'
    - Remove 'user'
    - Remove 'isAuthenticated'
    │
    ▼
Update AuthContext State
    - setUser(null)
    - setIsAuthenticated(false)
    │
    ▼
Redirect to Login Page
```

---

## 4. Department Modules

### 4.1 HR Department Module

**Purpose:** Comprehensive human resources management

**Key Features:**

1. **Employee Management**
   - View all employees (paginated list)
   - Add new employees (with validation)
   - Edit employee details
   - Deactivate/activate employees
   - Search and filter employees
   - Department assignment

2. **Leave Management**
   - View all leave requests
   - Approve/reject leave requests
   - Track leave balances
   - Leave history
   - Leave types: Annual, Sick, Unpaid
   - Date range filtering

3. **Attendance Management**
   - Mark daily attendance
   - View attendance records
   - Filter by employee/date
   - Attendance reports
   - Late/early tracking

4. **Payroll Management**
   - Process monthly payroll
   - Salary calculations
   - Deductions and bonuses
   - Payroll history
   - Generate payslips
   - Export payroll data

5. **Department Management**
   - Create/edit departments
   - Assign department heads
   - Department structure

**API Endpoints:**
- `/api/hr/employees` - Employee CRUD
- `/api/hr/employees/HRDeprt` - HR dept employees
- `/api/hr/leaves` - Leave management
- `/api/hr/payroll` - Payroll operations
- `/api/hr/attendance` - Attendance tracking
- `/api/hr/departments` - Department management

---

### 4.2 IT Department Module

**Purpose:** IT operations, support, and asset management

**Key Features:**

1. **Employee Management (IT)**
   - View IT department employees
   - Performance ratings
   - Skill tracking
   - Certification management

2. **Support Ticket System**
   - Create support tickets
   - Assign tickets to IT staff
   - Track ticket status (Open, In Progress, Resolved, Closed)
   - Priority levels (Low, Medium, High, Critical)
   - Ticket history and comments
   - Resolution time tracking

3. **Project Management**
   - IT project tracking
   - Project status monitoring
   - Resource allocation
   - Timeline management

4. **Asset Management**
   - Hardware inventory
   - Software licenses
   - Asset assignment to employees
   - Maintenance schedules
   - Asset lifecycle tracking

5. **Leave Management (IT Staff)**
   - IT staff leave requests
   - Leave approval workflow

**API Endpoints:**
- `/api/it/employees/ITDeprt` - IT employees
- `/api/it/tickets` - Support tickets
- `/api/it/projects` - Project management
- `/api/it/leaves` - Leave management
- `/api/it/employees/:id/rating` - Performance ratings

---

### 4.3 Digital Marketing Department Module

**Purpose:** Marketing campaigns and customer engagement

**Key Features:**

1. **Campaign Management**
   - Create marketing campaigns
   - Campaign status tracking
   - Budget management
   - Performance metrics
   - ROI tracking

2. **Customer Management**
   - Customer database
   - Customer segmentation
   - Customer project associations
   - Engagement history

3. **Project Management**
   - Marketing projects
   - Project-customer mapping
   - Deliverable tracking
   - Timeline management

4. **Team Management**
   - Team member listing
   - Role assignments
   - Performance ratings
   - Workload distribution

5. **Ticket System (Marketing)**
   - Marketing-related support tickets
   - Client request tracking
   - Issue resolution

**API Endpoints:**
- `/api/digitalMarketing/employees/digitalMarketing` - Team members
- `/api/digitalMarketing/projects` - Marketing projects
- `/api/digitalMarketing/customers` - Customer management
- `/api/digitalMarketing/customers/:customerName/projects` - Customer projects
- `/api/digitalMarketing/tickets` - Support tickets
- `/api/digitalMarketing/leaves` - Leave management
- `/api/digitalMarketing/employees/:id/rate` - Employee ratings

---

### 4.4 Operation Department Module

**Purpose:** Operational processes and workflow management

**Key Features:**

1. **Employee Management (Operations)**
   - Operations team members
   - Performance ratings
   - Skill assessment
   - Resource allocation

2. **Project/Task Management**
   - Operational projects
   - Task assignments
   - Status tracking (Pending, In Progress, Completed, On Hold)
   - Priority management
   - Deadline tracking

3. **Workflow Management**
   - Process definitions
   - Workflow automation
   - Efficiency metrics
   - Bottleneck identification

4. **Resource Management**
   - Resource allocation
   - Capacity planning
   - Utilization tracking

5. **Ticket System (Operations)**
   - Operational issue tracking
   - Process improvement requests
   - Status filters

**API Endpoints:**
- `/api/operation/employees/operationDept` - Operations employees
- `/api/operation/campaigns` - Projects/campaigns
- `/api/operation/tickets` - Support tickets
- `/api/operation/leaves` - Leave management
- `/api/operation/employees/:id/rate` - Employee ratings

---

### 4.5 Accounting Department Module

**Purpose:** Financial management and invoicing

**Key Features:**

1. **Invoice Management**
   - Create invoices
   - Edit invoice details
   - Delete invoices
   - Invoice status tracking (Draft, Sent, Paid, Overdue, Cancelled)
   - Auto-generate invoice numbers
   - Invoice line items
   - Tax calculations
   - Discount application
   - Payment tracking

2. **Financial Tracking**
   - Revenue tracking
   - Expense monitoring
   - Account balances
   - Financial summaries

3. **Client Management**
   - Client invoice history
   - Payment history
   - Outstanding balances
   - Client statements

4. **Reporting**
   - Financial reports
   - Income statements
   - Tax reports
   - Aging reports

**API Endpoints:**
- `/api/accounting/add_invoice` - Create invoice
- `/api/accounting/update_invoice` - Update invoice
- `/api/accounting/get_all` - Get all invoices (with pagination)
- `/api/accounting/get_invoice` - Get single invoice
- `/api/accounting/delete_invoice` - Delete invoice

**Invoice Data Structure:**
```javascript
{
  invoiceNumber: "INV-2025-001",
  clientName: "Client Name",
  clientEmail: "client@example.com",
  invoiceDate: "2025-01-15",
  dueDate: "2025-02-15",
  items: [
    {
      description: "Service/Product",
      quantity: 1,
      unitPrice: 1000,
      total: 1000
    }
  ],
  subtotal: 1000,
  tax: 100,
  discount: 50,
  total: 1050,
  status: "Sent",
  notes: "Payment terms..."
}
```

---

### 4.6 Sales Department Module

**Purpose:** Sales tracking and customer relationship management

**Key Features:**

1. **Sales Pipeline**
   - Lead tracking
   - Opportunity management
   - Deal stages
   - Win/loss tracking
   - Sales forecasting

2. **Customer Management**
   - Customer database
   - Contact information
   - Customer history
   - Purchase history
   - Customer segmentation

3. **Sales Reporting**
   - Sales metrics
   - Revenue reports
   - Performance tracking
   - Target vs. actual
   - Sales analytics

4. **Lead Management**
   - Lead capture
   - Lead qualification
   - Lead assignment
   - Follow-up tracking
   - Conversion tracking

**API Endpoints:**
- `/api/sales/leads` - Lead management
- `/api/sales/customers` - Customer management
- `/api/sales/orders` - Order tracking
- `/api/sales/reports` - Sales reporting

---

## 5. Core Features

### 5.1 Dashboard System

#### Overview Dashboard (Admin/Manager)
- **Purpose:** High-level view of organizational metrics
- **Components:**
  - Key performance indicators (KPIs)
  - Department summaries
  - Recent activities
  - Quick actions
  - Charts and graphs
  - Pending approvals
  - System notifications

#### Employee Dashboard
- **Purpose:** Personal workspace for employees
- **Components:**
  - Personal information display
  - Leave balance and history
  - Submit leave requests
  - Submit support tickets
  - View ticket status
  - Upcoming holidays
  - Company announcements
  - Personal performance metrics

### 5.2 Leave Management System

**Complete Leave Workflow:**

```
Employee Submits Leave Request
    │
    ▼
┌─────────────────────────────┐
│ Fill Leave Request Form     │
│ - Leave Type                │
│ - Start Date                │
│ - End Date                  │
│ - Reason                    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Frontend Validation         │
│ - Date validation           │
│ - Required fields           │
│ - Leave balance check       │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Submit to Backend           │
│ POST /api/[dept]/leaves     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Backend Authorization       │
│ - Verify department match   │
│ - Check permissions         │
└─────────────┬───────────────┘
              │
        Authorized?
              │
    ┌─────────┴─────────┐
   Yes                  No
    │                    │
    ▼                    ▼
┌───────────┐    ┌──────────────┐
│ Save to   │    │ Return 403   │
│ Database  │    │ Forbidden    │
└─────┬─────┘    └──────────────┘
      │
      ▼
┌─────────────────────────────┐
│ Status: PENDING             │
│ Notify HR/Manager           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ HR/Manager Reviews Request  │
└─────────────┬───────────────┘
              │
     ┌────────┴────────┐
     │                 │
  Approve?          Reject?
     │                 │
     ▼                 ▼
┌──────────┐    ┌──────────────┐
│ Status:  │    │ Status:      │
│ APPROVED │    │ REJECTED     │
└────┬─────┘    └──────┬───────┘
     │                 │
     └────────┬────────┘
              │
              ▼
┌─────────────────────────────┐
│ Notify Employee             │
│ Update Leave Balance        │
└─────────────────────────────┘
```

**Leave Types:**
- **Annual Leave:** Paid vacation days
- **Sick Leave:** Medical-related absences
- **Unpaid Leave:** Without pay
- **Emergency Leave:** Urgent situations

**Leave Statuses:**
- **Pending:** Awaiting approval
- **Approved:** Approved by manager/HR
- **Rejected:** Declined with reason
- **Cancelled:** Cancelled by employee

### 5.3 Support Ticket System

**Ticket Workflow:**

```
User Creates Ticket
    │
    ▼
┌─────────────────────────────┐
│ Fill Ticket Form            │
│ - Type (IT/HR/Other)        │
│ - Subject                   │
│ - Description               │
│ - Priority                  │
│ - Department                │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Submit to Backend           │
│ POST /api/[dept]/tickets    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Backend Authorization       │
│ - Verify user permissions   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Create Ticket               │
│ Status: OPEN                │
│ Assign Ticket Number        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Route to Department         │
│ (IT/HR/Operation/etc.)      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Department Staff Views      │
│ Status: IN PROGRESS         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Staff Works on Resolution   │
│ - Add comments              │
│ - Update status             │
│ - Request more info         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Issue Resolved              │
│ Status: RESOLVED            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ User Confirmation           │
│ Status: CLOSED              │
└─────────────────────────────┘
```

**Ticket Priorities:**
- **Low:** Non-urgent issues
- **Medium:** Standard priority
- **High:** Urgent issues
- **Critical:** Business-critical issues

**Ticket Statuses:**
- **Open:** Newly created
- **Assigned:** Assigned to staff member
- **In Progress:** Being worked on
- **Waiting:** Waiting for user response
- **Resolved:** Solution provided
- **Closed:** Confirmed closed

### 5.4 Search and Pagination

**Search Features:**
- Real-time search with debouncing (300ms delay)
- Search by: name, email, ID, status
- Case-insensitive matching
- Highlight search results

**Pagination:**
- Configurable items per page (10, 25, 50, 100)
- Page navigation (First, Previous, Next, Last)
- Total count display
- Page number display
- Maintains state across navigation

**Filter Features:**
- Multi-criteria filtering
- Department filters
- Status filters
- Date range filters
- Combine filters with search
- Clear all filters

### 5.5 Form Validation

**Client-Side Validation:**
- Required field validation
- Email format validation
- Phone number format
- Date validation (past dates, date ranges)
- Number validation (min/max)
- Text length validation
- Real-time field validation
- Form-level validation on submit

**Server-Side Validation:**
- Data type validation
- Business rule validation
- Duplicate detection
- Referential integrity
- Authorization validation
- Returns detailed error messages

### 5.6 Notification System

**Toast Notifications:**
- Success messages (green)
- Error messages (red)
- Warning messages (orange)
- Info messages (blue)
- Auto-dismiss after 5 seconds
- Manual close option
- Stack multiple notifications
- Position: top-right

**Notification Triggers:**
- Successful operations (save, update, delete)
- Error conditions
- Authorization failures
- Validation errors
- Network errors
- Session expiration
- Data loading states

---

## 6. Data Flow

### 6.1 General Data Flow Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌────────┐      ┌────────┐      ┌────────┐
│ User   │      │  API   │      │Context │
│ Input  │      │Service │      │Provider│
└───┬────┘      └───┬────┘      └───┬────┘
    │               │               │
    │    Validate   │               │
    ├──────────────►│               │
    │               │               │
    │    API Call   │               │
    │   (with JWT)  │               │
    │◄──────────────┤               │
    │               │               │
    │               │  HTTP Request │
    │               │  +JWT Token   │
    │               ├───────────────┼────────────┐
    │               │               │            │
    └───────────────┴───────────────┴────────────┤
                                                 │
┌────────────────────────────────────────────────▼────┐
│                 BACKEND API LAYER                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. JWT Token Validation                      │  │
│  │    - Verify signature                        │  │
│  │    - Check expiration                        │  │
│  │    - Extract user payload                    │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │ 2. Authorization Check                       │  │
│  │    - Verify role permissions                 │  │
│  │    - Check department access                 │  │
│  │    - Validate business rules                 │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │ 3. Input Validation                          │  │
│  │    - Data type checking                      │  │
│  │    - Required fields                         │  │
│  │    - Format validation                       │  │
│  │    - Business logic validation               │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │ 4. Business Logic Processing                 │  │
│  │    - Data transformation                     │  │
│  │    - Calculations                            │  │
│  │    - Status updates                          │  │
│  │    - Related data handling                   │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
└─────────────────┼────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│               DATABASE LAYER                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 5. Database Operations                       │  │
│  │    - Query execution                         │  │
│  │    - CRUD operations                         │  │
│  │    - Transaction management                  │  │
│  │    - Indexing & optimization                 │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
└─────────────────┼────────────────────────────────────┘
                  │
                  │ (Response flows back up)
                  │
┌─────────────────▼────────────────────────────────────┐
│               BACKEND API LAYER                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 6. Format Response                           │  │
│  │    - Data serialization                      │  │
│  │    - Add metadata (pagination, etc.)         │  │
│  │    - Error formatting                        │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
└─────────────────┼────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│               FRONTEND LAYER                         │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 7. Handle Response                           │  │
│  │    - Update state                            │  │
│  │    - Update UI                               │  │
│  │    - Show notifications                      │  │
│  │    - Error handling                          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6.2 Example: Employee Creation Flow

```
HR User Fills Employee Form
    │
    ▼
Frontend Validation
    - All required fields present?
    - Email format valid?
    - Date of birth valid?
    - Phone number format?
    │
    ▼
Prepare Request Data
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "department": "68da376594328b3a175633a7",
  "role": "Employee",
  "dateOfBirth": "1990-01-15",
  "startDate": "2025-01-01",
  "address": {...},
  "salary": 50000
}
    │
    ▼
POST /api/hr/employees
Headers: {
  Authorization: "Bearer eyJhbGciOi...",
  Content-Type: "application/json"
}
    │
    ▼
Backend Receives Request
    │
    ▼
Extract JWT Token from Header
Decode Token → User Info
{
  user_id: "...",
  role: "HR",
  department: "68da377194328b3a175633ad"
}
    │
    ▼
Authorization Check
    - Is user HR or Admin? ✓
    - Can user add employees? ✓
    │
    ▼
Validate Request Data
    - Email not already registered? ✓
    - Department exists? ✓
    - Salary within range? ✓
    - Valid phone format? ✓
    │
    ▼
Process Business Logic
    - Hash password (if provided)
    - Generate employee ID
    - Set default leave balances
    - Assign default permissions
    │
    ▼
Save to Database
INSERT INTO employees
    │
    ▼
Create Related Records
    - Initialize leave balance
    - Create attendance record
    - Setup user account
    │
    ▼
Format Response
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {...},
    "id": "..."
  }
}
    │
    ▼
Return to Frontend (200 OK)
    │
    ▼
Frontend Handles Response
    - Update employee list
    - Show success notification
    - Close form dialog
    - Refresh data table
```

---

## 7. API Structure

### 7.1 Base Configuration

**Base URL:** `https://trendora-nine.vercel.app/api`

**Request Headers:**
```javascript
{
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

### 7.2 API Endpoint Categories

#### User & Authentication APIs
```
POST   /api/user/log_in              - User login
POST   /api/user/forgetPassword      - Request password reset
POST   /api/user/resetPassword       - Reset password
GET    /api/user/get_profile         - Get user profile
```

#### HR Department APIs
```
GET    /api/hr/employees             - Get all employees
POST   /api/hr/employees             - Create employee
PUT    /api/hr/employees/:id         - Update employee
DELETE /api/hr/employees/:id         - Delete employee
GET    /api/hr/employees/HRDeprt     - Get HR dept employees

GET    /api/hr/departments           - Get departments
POST   /api/hr/departments           - Create department
PUT    /api/hr/departments/:id       - Update department

GET    /api/hr/leaves                - Get leave requests
POST   /api/hr/leaves                - Create leave request
PUT    /api/hr/leaves/:id            - Update leave (approve/reject)
DELETE /api/hr/leaves/:id            - Delete leave

GET    /api/hr/payroll               - Get payroll records
POST   /api/hr/payroll               - Process payroll

GET    /api/hr/attendance            - Get attendance records
POST   /api/hr/attendance            - Mark attendance
```

#### IT Department APIs
```
GET    /api/it/employees/ITDeprt     - Get IT employees
POST   /api/it/employees/:id/rating  - Rate IT employee
GET    /api/it/employee/:id/rating   - Get employee rating

GET    /api/it/projects              - Get IT projects
POST   /api/it/projects              - Create project
PUT    /api/it/projects/:id          - Update project

GET    /api/it/tickets               - Get support tickets
POST   /api/it/tickets               - Create ticket
PUT    /api/it/tickets/:id           - Update ticket

GET    /api/it/leaves                - Get leave requests
POST   /api/it/leaves                - Submit leave request
```

#### Digital Marketing Department APIs
```
GET    /api/digitalMarketing/employees/digitalMarketing  - Get marketing team
POST   /api/digitalMarketing/employees/:id/rate          - Rate employee
GET    /api/digitalMarketing/employees/:id/rate          - Get rating

GET    /api/digitalMarketing/projects                    - Get projects
POST   /api/digitalMarketing/projects                    - Create project
PUT    /api/digitalMarketing/projects/:id                - Update project

GET    /api/digitalMarketing/customers                   - Get customers
POST   /api/digitalMarketing/customers                   - Create customer
GET    /api/digitalMarketing/customers/:name/projects    - Get customer projects

GET    /api/digitalMarketing/tickets                     - Get tickets
POST   /api/digitalMarketing/tickets                     - Create ticket

GET    /api/digitalMarketing/leaves                      - Get leaves
POST   /api/digitalMarketing/leaves                      - Submit leave
```

#### Operation Department APIs
```
GET    /api/operation/employees/operationDept   - Get operations team
POST   /api/operation/employees/:id/rate        - Rate employee
GET    /api/operation/employees/:id/rate        - Get rating

GET    /api/operation/campaigns                 - Get projects/campaigns
POST   /api/operation/campaigns                 - Create campaign
PUT    /api/operation/campaigns/:id             - Update campaign

GET    /api/operation/tickets                   - Get tickets
POST   /api/operation/tickets                   - Create ticket

GET    /api/operation/leaves                    - Get leaves
POST   /api/operation/leaves                    - Submit leave
```

#### Accounting Department APIs
```
POST   /api/accounting/add_invoice              - Create invoice
PUT    /api/accounting/update_invoice           - Update invoice
GET    /api/accounting/get_all                  - Get all invoices (paginated)
GET    /api/accounting/get_invoice              - Get specific invoice
DELETE /api/accounting/delete_invoice           - Delete invoice
```

#### Dashboard APIs
```
GET    /api/dashboard/leaves                    - Get dashboard leaves
GET    /api/dashboard/tickets                   - Get dashboard tickets
```

### 7.3 Common Response Formats

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    // Error details
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10
  }
}
```

---

## 8. User Workflows

### 8.1 Admin Workflow

**Daily Operations:**
1. Login → Overview Dashboard
2. Review system metrics
3. Check pending approvals across all departments
4. Review support tickets
5. Manage user accounts and permissions
6. Access any department as needed
7. Generate reports
8. Configure system settings
9. Logout

**User Management:**
```
Admin Dashboard
    ↓
Navigate to HR Department
    ↓
Click "Add Employee"
    ↓
Fill Employee Form
    - Personal Info
    - Department Assignment
    - Role Selection
    - Salary (if applicable)
    ↓
Assign Permissions
    ↓
Save Employee
    ↓
Confirmation
```

### 8.2 HR Manager Workflow

**Daily Operations:**
1. Login → Overview Dashboard
2. Navigate to HR Department
3. Review pending leave requests
4. Approve/reject leaves
5. Check attendance records
6. Process payroll (monthly)
7. Manage employee records
8. Generate HR reports
9. Logout

**Leave Approval Workflow:**
```
Login
    ↓
Navigate to HR Department
    ↓
Select "Leave Management"
    ↓
View Pending Leaves
    ↓
Review Leave Details
    - Employee name
    - Leave type
    - Dates
    - Reason
    - Leave balance
    ↓
Decision
    ├─ Approve → Update status → Notify employee
    └─ Reject → Add reason → Notify employee
    ↓
Update Leave Balance (if approved)
```

### 8.3 IT Staff Workflow

**Daily Operations:**
1. Login → IT Dashboard
2. View assigned support tickets
3. Prioritize tickets
4. Work on tickets
5. Update ticket status
6. Communicate with users
7. Close resolved tickets
8. Submit own leave requests
9. Logout

**Ticket Resolution Workflow:**
```
Login to IT Department
    ↓
View Open Tickets
    ↓
Select Ticket
    ↓
Review Issue Details
    - Ticket type
    - Description
    - Priority
    - Reporter
    ↓
Update Status to "In Progress"
    ↓
Work on Resolution
    ↓
Add Comments/Updates
    ↓
Test Solution
    ↓
Update Status to "Resolved"
    ↓
Notify User
    ↓
User Confirms → Close Ticket
```

### 8.4 Manager Workflow (Department Manager)

**Daily Operations:**
1. Login → Overview Dashboard
2. Navigate to assigned department
3. Review team performance
4. Manage department projects
5. Approve team leave requests
6. Review team tickets
7. Monitor department metrics
8. Submit own leave/tickets
9. Logout

### 8.5 Employee Workflow

**Daily Operations:**
1. Login → Employee Dashboard
2. View personal information
3. Check leave balance
4. Submit leave request (if needed)
5. Submit support ticket (if needed)
6. View leave/ticket status
7. Check company announcements
8. Logout

**Leave Request Workflow:**
```
Login to Employee Dashboard
    ↓
Click "Submit Leave Request"
    ↓
Fill Leave Form
    - Leave Type (Annual/Sick/Unpaid)
    - Start Date
    - End Date
    - Reason
    ↓
Check Leave Balance
    ↓
Submit Request
    ↓
Request sent to HR/Manager
    ↓
Status: PENDING
    ↓
Wait for Approval
    ↓
Receive Notification
    - Approved → Leave confirmed
    - Rejected → Reason provided
```

**Support Ticket Workflow:**
```
Login to Employee Dashboard
    ↓
Click "Submit Support Ticket"
    ↓
Fill Ticket Form
    - Ticket Type
    - Subject
    - Description (10-500 characters)
    - Priority Level
    ↓
Submit Ticket
    ↓
Ticket routed to IT Department
    ↓
Receive Ticket Number
    ↓
Track Status
    - Open
    - In Progress
    - Resolved
    ↓
Confirm Resolution → Closed
```

---

## 9. Technical Stack

### 9.1 Frontend Technologies

**Core Framework:**
- **React 18.3.1** - UI library
- **Vite 6.2.0** - Build tool and dev server

**UI Framework:**
- **Material-UI (MUI) 7.3.2** - Component library
  - @mui/material - Core components
  - @mui/icons-material - Icon library
  - @mui/x-data-grid - Advanced data tables
  - @mui/x-charts - Charting library
  - @mui/x-date-pickers - Date/time pickers
- **Tailwind CSS 4.1.13** - Utility-first CSS

**State Management:**
- **React Context API** - Global state (Auth, Notifications)
- **Redux Toolkit 2.9.0** - Advanced state management (if needed)

**Routing:**
- **React Router 7.9.1** - Client-side routing
- **React Router DOM 7.9.1** - DOM bindings

**HTTP Client:**
- **Axios 1.12.2** - API communication

**Date Handling:**
- **date-fns 4.1.0** - Date manipulation

**Icons:**
- **Lucide React 0.544.0** - Icon library
- **MUI Icons** - Material icons

**Styling:**
- **Emotion (@emotion/react, @emotion/styled)** - CSS-in-JS
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### 9.2 Backend Technologies (Based on API Structure)

**Backend Framework:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework (assumed)

**Database:**
- **MongoDB** - NoSQL database (based on ID format)

**Authentication:**
- **JSON Web Tokens (JWT)** - Token-based authentication

**Hosting:**
- **Vercel** - Deployment platform (based on API URL)

### 9.3 Development Tools

**Code Quality:**
- **ESLint 9.21.0** - Linting
- **Rollup 4.44.1** - Module bundler

**Build Tools:**
- **Vite** - Fast build tool
- **@vitejs/plugin-react 4.7.0** - React plugin for Vite

**Package Management:**
- **npm** - Package manager

### 9.4 Application Structure

```
trendora-front/
│
├── src/
│   ├── api/
│   │   └── axios.js                 # Axios instance configuration
│   │
│   ├── assets/                      # Static assets (images, fonts)
│   │
│   ├── components/
│   │   ├── accounting/              # Accounting module components
│   │   ├── attendance/              # Attendance components
│   │   ├── auth/                    # Login, password reset
│   │   ├── common/                  # Reusable components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── departments/             # Department management
│   │   ├── employees/               # Employee management
│   │   ├── hr/                      # HR department
│   │   ├── IT/                      # IT department
│   │   ├── layout/                  # Layout components (sidebar, header)
│   │   ├── leaves/                  # Leave management
│   │   ├── marketing/               # Marketing department
│   │   ├── operation/               # Operations department
│   │   ├── payroll/                 # Payroll components
│   │   └── sales/                   # Sales department
│   │
│   ├── config/
│   │   └── api.js                   # API endpoint configuration
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx          # Authentication state
│   │   └── NotificationContext.jsx   # Notification state
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAccountingData.js
│   │   ├── useHRData.js
│   │   ├── useITData.js
│   │   ├── useMarketingData.js
│   │   └── useOperationData.js
│   │
│   ├── services/                    # API service functions
│   │   ├── accountingApi.js
│   │   ├── hrApi.js
│   │   ├── itApi.js
│   │   ├── marketingApi.js
│   │   ├── operationApi.js
│   │   └── userApi.js
│   │
│   ├── utils/                       # Utility functions
│   │   ├── departmentAuth.jsx       # Department authorization
│   │   └── permissions.js           # Permission checks
│   │
│   ├── App.marketingAgency.jsx     # Main app component
│   ├── index.css                    # Global styles
│   └── theme.js                     # MUI theme configuration
│
├── public/                          # Public static files
│
├── dist/                            # Production build output
│
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── postcss.config.js                # PostCSS configuration
└── eslint.config.js                 # ESLint configuration
```

### 9.5 Security Features

**Frontend Security:**
- JWT token storage in localStorage
- Token included in all API requests
- Client-side route protection
- Role-based UI rendering
- Input sanitization
- XSS protection

**Backend Security (Expected):**
- JWT token validation on all protected routes
- Token expiration and refresh
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Department-based authorization
- Input validation and sanitization
- SQL injection protection (via MongoDB)
- Rate limiting
- CORS configuration
- HTTPS enforcement

### 9.6 Performance Optimizations

**Frontend:**
- Lazy loading of route components
- Code splitting
- Component memoization
- Image optimization
- Bundle size optimization
- Caching strategies
- Debounced search inputs
- Virtualized lists for large datasets
- Skeleton loading screens

**Backend:**
- Database indexing
- Query optimization
- Response caching
- Pagination for large datasets
- Compression
- CDN for static assets

---

## 10. Key Workflows Summary

### 10.1 Authentication & Session

1. **Login** → Validate credentials → Generate JWT → Store token → Redirect to dashboard
2. **Session Check** → Verify token from localStorage → Validate with backend → Load user data
3. **Logout** → Clear localStorage → Clear context state → Redirect to login

### 10.2 Department Access

1. **Menu Click** → Check department authorization → Load if authorized OR show error
2. **API Request** → Include JWT token → Backend validates token & department → Return data OR 403

### 10.3 Employee Management

1. **List Employees** → GET request → Display with pagination → Search/filter capabilities
2. **Add Employee** → Fill form → Validate → POST request → Refresh list → Show notification
3. **Edit Employee** → Load data → Update form → Validate → PUT request → Refresh → Notify
4. **Delete Employee** → Confirm → DELETE request → Refresh list → Notify

### 10.4 Leave Management

1. **Employee Submit** → Fill form → Validate dates → POST to dept → Status: PENDING
2. **HR/Manager Review** → View pending → Review details → Approve/Reject → Notify employee
3. **Track Status** → View in dashboard → Real-time status updates

### 10.5 Support Tickets

1. **Create Ticket** → Fill form → Submit to dept → Assigned ticket number
2. **IT/Staff Process** → View tickets → Assign → Work on → Update status → Resolve
3. **Track & Close** → User views status → Confirms resolution → Ticket closed

### 10.6 Invoice Management

1. **Create Invoice** → Fill details → Add line items → Calculate totals → Save → Status: Draft
2. **Send Invoice** → Update status → Send to client → Status: Sent
3. **Track Payment** → Mark as paid → Status: Paid → Update records

---

## 11. System Diagrams Reference

### 11.1 Recommended Flowcharts

For your workflow and flowchart generation, consider creating:

1. **System Architecture Diagram** - Shows all layers and components
2. **Authentication Flow Diagram** - Complete login/logout flow
3. **Authorization Flow Diagram** - How permissions are checked
4. **Department Access Flowchart** - Decision tree for department access
5. **Leave Request Workflow** - End-to-end leave process
6. **Support Ticket Workflow** - Complete ticket lifecycle
7. **Employee Management Workflow** - CRUD operations
8. **API Request/Response Flow** - Data flow from UI to database and back
9. **User Role Decision Tree** - Shows what each role can access
10. **Data Model Diagram** - Database schema relationships

### 11.2 Key Decision Points for Flowcharts

**Authentication:**
- Is user logged in?
- Is token valid?
- What is user role?
- Which dashboard to show?

**Authorization:**
- What is user's role?
- What is user's department?
- Can user access this department?
- Can user perform this action?

**Data Operations:**
- Is input valid?
- Does user have permission?
- Does record exist?
- Are there conflicts?
- Is operation successful?

---

## 12. Conclusion

Trendora is a comprehensive enterprise management system with:

- **6 Department Modules:** HR, IT, Digital Marketing, Operations, Accounting, Sales
- **5 User Roles:** Admin, Manager, HR, IT Staff, Employee
- **Core Features:** Authentication, Authorization, Leave Management, Support Tickets, Employee Management, Invoicing
- **Modern Tech Stack:** React, Material-UI, Tailwind, Node.js, MongoDB
- **Security:** JWT-based authentication, role-based access control, department-level authorization
- **Scalability:** Modular architecture, API-driven, paginated data

The system is designed for medium to large organizations requiring department-specific workflows with robust access control and comprehensive business process management.

---

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**Prepared For:** Workflow and Flowchart Generation

