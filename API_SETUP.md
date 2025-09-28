# HR API Connection Setup

This document explains how to connect the HR frontend to your backend API.

## Backend Requirements

Your backend should have the following endpoints available:

### Base URL
- Default: `http://localhost:3000/api`
- Configurable via `VITE_API_URL` environment variable

### Required Endpoints

#### Employee Management
- `GET /hr/employees` - Get all employees
- `GET /hr/employees/:id` - Get employee by ID
- `POST /hr/employees` - Create new employee
- `PUT /hr/employees/:id` - Update employee
- `DELETE /hr/employees/:id` - Delete employee

#### Department Management
- `GET /hr/departments` - Get all departments
- `POST /hr/departments` - Create new department
- `PUT /hr/departments/:id` - Update department
- `DELETE /hr/departments/:id` - Delete department

#### Leave Management
- `GET /hr/leaves` - Get all leaves
- `PUT /hr/leaves/:id` - Update leave status
- `DELETE /hr/leaves/:id` - Delete leave

#### Payroll Management
- `GET /hr/payroll` - Get all payroll records
- `POST /hr/payroll/:employeeId` - Generate payslip
- `PUT /hr/payroll/:id` - Update payroll
- `GET /hr/payroll/employee/:employeeId` - Get payslip for employee

## Response Format

All API endpoints should return data in the following format:

```json
{
  "data": [...], // Array of items or single item
  "message": "Success message", // Optional
  "success": true // Optional
}
```

## Authentication

The frontend supports Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_TOKEN_KEY=authToken
```

## Testing the Connection

1. Start your backend server
2. Open the HR Department page
3. Click the "Test API Connection" button
4. Check the console for detailed results

## Fallback Behavior

If the backend is not available, the frontend will:
1. Show a warning message
2. Fall back to mock data
3. Continue to function with local state management

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure your backend allows requests from the frontend origin
2. **404 Error**: Verify the endpoint URLs match exactly
3. **Authentication Error**: Check if the token is valid and properly formatted
4. **Network Error**: Ensure the backend is running and accessible

### Debug Steps

1. Check browser console for error messages
2. Verify backend is running on the correct port
3. Test endpoints directly with tools like Postman
4. Check network tab in browser dev tools

## API Configuration

The API configuration is centralized in `src/config/api.js`. You can modify:
- Base URL
- Timeout settings
- Endpoint paths

## Mock Data

Mock data is available in `src/data/hrMockData.js` and will be used as fallback when the API is unavailable.
