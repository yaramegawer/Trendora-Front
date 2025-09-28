# Backend Setup Guide

## Quick Setup

1. **Start your backend server** on `http://localhost:3000`
2. **Make sure your API routes are mounted** at `/api/hr`
3. **Enable CORS** for your frontend domain

## Expected API Endpoints

Your backend should have these endpoints:

### Employees
- `GET /api/hr/employees/HRDeprt` - Get all employees
- `GET /api/hr/employees/:id` - Get specific employee
- `POST /api/hr/employees` - Add new employee
- `PUT /api/hr/employees/:id` - Update employee
- `DELETE /api/hr/employees/:id` - Delete employee

### Departments
- `GET /api/hr/departments` - Get all departments
- `POST /api/hr/departments` - Add new department
- `PUT /api/hr/departments/:id` - Update department
- `DELETE /api/hr/departments/:id` - Delete department

### Leaves
- `GET /api/hr/leaves` - Get all leaves
- `POST /api/hr/leaves` - Add new leave
- `PUT /api/hr/leaves/:id` - Update leave
- `DELETE /api/hr/leaves/:id` - Delete leave

### Payroll
- `GET /api/hr/payroll` - Get all payroll
- `POST /api/hr/payroll` - Add new payroll
- `PUT /api/hr/payroll/:id` - Update payroll
- `DELETE /api/hr/payroll/:id` - Delete payroll
- `POST /api/hr/payroll/:id` - Generate payslip

## Testing the Connection

1. Go to the **API Test** tab in the HR Department
2. Click **"Test API Connection"**
3. Check the results to see which endpoints are working

## Common Issues

### "Network Error" or "Connection Refused"
- Backend server is not running
- Wrong port number
- Firewall blocking the connection

### "404 Not Found"
- API routes not properly configured
- Wrong endpoint paths
- Server not running on expected port

### "CORS Error"
- CORS not enabled on backend
- Frontend domain not whitelisted

### "401 Unauthorized"
- Authentication required but not provided
- Invalid or expired token

## Backend Requirements

- Node.js/Express server
- CORS middleware enabled
- Database connected
- All API routes implemented
- Proper error handling
- JSON response format

## Environment Variables

Make sure your backend has:
- `PORT=3000` (or your preferred port)
- Database connection string
- CORS origins configured
