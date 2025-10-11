# Employee Address Validation Fix

## Problem
When editing an employee, the error **"address" is not allowed to be empty** was occurring even though the address field is optional in the backend validation.

## Root Cause
The issue was in `src/services/hrApi.js` at line 241:

```javascript
address: employeeData.address || ''
```

This code was sending an empty string `''` to the backend when no address was provided. Joi's `.optional()` validator only allows the field to be **omitted entirely**, not to be an empty string. The `.min(5)` constraint then failed because an empty string has 0 characters.

## Solution Applied (Frontend Fix)
Modified `src/services/hrApi.js` in the `updateEmployee` function to only include the address field when it has valid content:

```javascript
// Only include address if it has actual content (min 5 chars per backend validation)
if (employeeData.address && employeeData.address.trim().length >= 5) {
  cleanedData.address = employeeData.address.trim();
}
```

This ensures:
- Empty or whitespace-only addresses are completely omitted from the request
- Only addresses with at least 5 characters (backend minimum) are sent
- The field is trimmed to remove extra whitespace

## Alternative Solution (Backend Fix)
If you prefer to fix this on the backend instead, modify your Joi validation schema:

### Current Backend Validation:
```javascript
address: joi.string().min(5).max(200).optional(),
```

### Fixed Backend Validation:
```javascript
address: joi.string().min(5).max(200).allow('', null).optional(),
```

This allows the address field to be:
- Omitted entirely (`.optional()`)
- An empty string (`.allow('')`)
- A null value (`.allow(null)`)
- Or a valid string with 5-200 characters

## Testing
After this fix, you should be able to:
1. ✅ Edit an employee without providing an address
2. ✅ Edit an employee with a valid address (5+ characters)
3. ✅ Clear an existing address during editing
4. ✅ Add new employees without an address

## Files Modified
- `src/services/hrApi.js` - Fixed the `updateEmployee` function to conditionally include address field

## Notes
- The `addEmployee` function was already handling this correctly via the `EmployeeForm` component (lines 240-246)
- The frontend form already has validation to ensure addresses are either empty or at least 5 characters
- This fix aligns the API service behavior with the backend validation requirements

