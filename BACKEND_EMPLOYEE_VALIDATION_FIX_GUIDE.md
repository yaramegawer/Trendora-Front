# Backend Employee Validation Fix Guide

## Issues to Fix

You need to update your backend Joi validation schema to:
1. Add missing departments: "Digital Marketing" and "Sales"
2. Allow the "address" field to be optional and accept empty strings

## Location

Find your employee validation schema file. It's typically in:
- `models/Employee.js` (Mongoose schema)
- `validators/employeeValidator.js` (Joi validation)
- `routes/employee.js` or `controllers/employeeController.js`

## Required Changes

### 1. Department Field - Add Missing Departments

**Current (Incorrect):**
```javascript
department: Joi.string()
  .valid('HR', 'Accounting', 'IT', 'Administration', 'Operation')
  .required()
```

**Updated (Correct):**
```javascript
department: Joi.string()
  .valid('HR', 'Accounting', 'IT', 'Administration', 'Operation', 'Digital Marketing', 'Sales')
  .required()
```

### 2. Address Field - Allow Empty Strings

**Current (Incorrect):**
```javascript
address: Joi.string()
  .optional()
  .trim()
```

**Updated (Correct):**
```javascript
address: Joi.string()
  .optional()
  .allow('', null)  // Allow empty strings and null
  .trim()
```

Or even simpler:
```javascript
address: Joi.string()
  .allow('', null)  // This makes it optional automatically
```

## Complete Example Schema

Here's what your complete employee validation schema should look like:

```javascript
const Joi = require('joi');

const employeeValidationSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .trim(),
  
  lastName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .trim(),
  
  email: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase(),
  
  department: Joi.string()
    .valid('HR', 'Accounting', 'IT', 'Administration', 'Operation', 'Digital Marketing', 'Sales')
    .required(),
  
  hireDate: Joi.date()
    .required(),
  
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .trim(),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active'),
  
  role: Joi.string()
    .valid('Manager', 'Employee', 'HR', 'IT Staff', 'Accountant')
    .default('Employee'),
  
  address: Joi.string()
    .allow('', null)  // Allow empty strings and null values
    .trim(),
  
  submittedDocuments: Joi.array()
    .items(Joi.string())
    .optional(),
  
  pendingDocuments: Joi.array()
    .items(Joi.string())
    .optional()
});

module.exports = employeeValidationSchema;
```

## Department ID Mapping

Make sure your department IDs are correctly mapped in your backend:

```javascript
const DEPARTMENT_ID_MAP = {
  '68da376594328b3a175633a7': 'IT',
  '68da377194328b3a175633ad': 'HR',
  '68da378594328b3a175633b3': 'Operation',
  '68da378d94328b3a175633b9': 'Sales',
  '68da379894328b3a175633bf': 'Accounting',
  '68da6e0813fe176e91aefd59': 'Digital Marketing'
};
```

## Testing After Fix

After making these changes, test:

### Test 1: Digital Marketing Department
```bash
POST /api/employees
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "Digital Marketing",  // Should work now
  "hireDate": "2024-01-01",
  "phone": "1234567890",
  "role": "Employee"
}
```

### Test 2: Sales Department
```bash
POST /api/employees
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "department": "Sales",  // Should work now
  "hireDate": "2024-01-01",
  "phone": "1234567890",
  "role": "Manager"
}
```

### Test 3: Empty Address
```bash
POST /api/employees
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob@example.com",
  "department": "IT",
  "hireDate": "2024-01-01",
  "phone": "1234567890",
  "role": "IT Staff",
  "address": ""  // Should work now (empty string)
}
```

### Test 4: No Address Field
```bash
POST /api/employees
{
  "firstName": "Alice",
  "lastName": "Williams",
  "email": "alice@example.com",
  "department": "HR",
  "hireDate": "2024-01-01",
  "phone": "1234567890",
  "role": "HR"
  // address field omitted entirely - Should work
}
```

## Common Validation Patterns

If you're using Mongoose and want schema validation:

```javascript
const employeeSchema = new mongoose.Schema({
  // ... other fields ...
  
  department: {
    type: String,
    required: true,
    enum: ['HR', 'Accounting', 'IT', 'Administration', 'Operation', 'Digital Marketing', 'Sales']
  },
  
  address: {
    type: String,
    required: false,  // Optional
    default: ''       // Default to empty string
  }
});
```

## Frontend Departments List

For reference, the frontend has these departments available:
- HR
- IT
- Digital Marketing
- Operation
- Accounting
- Sales

Make sure your backend accepts all of these department names exactly as shown (case-sensitive).

## Expected Behavior After Fix

✅ Can create employees in "Digital Marketing" department  
✅ Can create employees in "Sales" department  
✅ Can create employees without address field  
✅ Can create employees with empty string address  
✅ Manager role works in all departments  

## Need Help?

If you encounter issues after making these changes:
1. Check server logs for detailed error messages
2. Verify the validation schema is being used in the correct route
3. Make sure to restart your backend server after changes
4. Test with Postman/Insomnia to isolate frontend vs backend issues

