# Digital Marketing Customers Pagination Implementation

## Overview
Successfully implemented pagination for the "Get All Customers" list in the Digital Marketing department, matching the backend pagination structure.

## Backend Implementation Reference
The backend endpoint now handles pagination with the following structure:

```javascript
// GET /api/digitalMarketing/customers
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const customers = await Project.distinct("customerName");
  const paginatedCustomers = customers.slice(skip, skip + limit);

  if (!customers.length)
    return next(new Error("No customers found", { cause: 404 }));

  res.status(200).json({
    success: true,
    data: paginatedCustomers,
    total: customers.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(customers.length / limit),
    createdAt: new Date(),
  });
});
```

## Frontend Changes

### 1. Component State (`src/components/marketing/DigitalMarketingDepartment.jsx`)

Added three new state variables for customer list pagination:

```javascript
// State for customer list pagination
const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
const [customersPageSize, setCustomersPageSize] = useState(10);
const [customersTotal, setCustomersTotal] = useState(0);
```

### 2. Updated `fetchCustomers` Function

Modified to accept pagination parameters and handle paginated response:

```javascript
// Fetch all customers from API with pagination
const fetchCustomers = async (page = 1, limit = 10) => {
  try {
    setCustomersLoading(true);
    const customersData = await marketingCustomerApi.getAllCustomers(page, limit);
    
    // Handle backend response format: { success: true, data: [...], total, page, limit, totalPages }
    let customersList = [];
    let totalCustomers = 0;
    
    if (customersData && customersData.data && Array.isArray(customersData.data)) {
      customersList = customersData.data;
      totalCustomers = customersData.total || customersData.totalPages * limit || customersData.data.length;
    }
    
    setCustomers(customersList);
    setCustomersTotal(totalCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    setCustomers([]);
    setCustomersTotal(0);
  } finally {
    setCustomersLoading(false);
  }
};
```

### 3. Updated `useEffect` Hook

Modified to trigger fetch when pagination changes:

```javascript
// Fetch customers on component mount
useEffect(() => {
  fetchCustomers(customersCurrentPage, customersPageSize);
}, [customersCurrentPage, customersPageSize]);
```

### 4. Added Pagination Handler

```javascript
// Handle customers list pagination
const handleCustomersPageChange = (newPage) => {
  setCustomersCurrentPage(newPage);
};
```

### 5. Added Pagination UI Component

Added `SimplePagination` component after the customer list:

```jsx
{/* Customer List Pagination */}
{!customersLoading && customers.length > 0 && !projectSearchTerm.trim() && (
  <div style={{ marginTop: '20px' }}>
    <SimplePagination
      currentPage={customersCurrentPage}
      totalPages={Math.max(1, Math.ceil(customersTotal / customersPageSize))}
      onPageChange={handleCustomersPageChange}
      totalItems={customersTotal}
      pageSize={customersPageSize}
    />
  </div>
)}
```

**Pagination Display Logic:**
- Only shows when customers are loaded (`!customersLoading`)
- Only shows when customers exist (`customers.length > 0`)
- Hidden when searching (`!projectSearchTerm.trim()`)
- Hidden when viewing a specific customer's projects

### 6. API Service Update (`src/services/marketingApi.js`)

Updated the `getAllCustomers` function to support pagination:

```javascript
// Get all customers with pagination
getAllCustomers: async (page = 1, limit = 10) => {
  try {
    const response = await api({
      url: API_CONFIG.ENDPOINTS.MARKETING.CUSTOMERS,
      method: 'GET',
      params: { page, limit }
    });
    
    // Handle backend response format: { success: true, data: [...], total, page, limit, totalPages }
    if (response.data && response.data.success === true) {
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || limit,
        totalPages: response.data.totalPages || 0
      };
    }
    
    return { data: [], total: 0, page: 1, limit, totalPages: 0 };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { data: [], total: 0, page: 1, limit, totalPages: 0 };
  }
}
```

## Features

### ✅ Pagination Controls
- Navigate through customer pages using Previous/Next buttons
- Page number display (e.g., "Page 1 of 5")
- Total items count display
- Automatic page calculation based on total customers

### ✅ Default Settings
- **Page Size:** 10 customers per page
- **Initial Page:** Page 1

### ✅ User Experience
- Pagination resets to page 1 when component mounts
- Loading states handled properly
- Empty state messages when no customers found
- Pagination hidden during search to show all filtered results
- Smooth transitions between pages

### ✅ Consistent with Existing Implementation
- Follows the same pattern as customer projects pagination
- Uses the existing `SimplePagination` component
- Maintains consistent styling with the rest of the application

## API Endpoint

**Endpoint:** `GET /api/digitalMarketing/customers`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": ["Customer 1", "Customer 2", ...],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "createdAt": "2025-10-13T..."
}
```

## Testing

### Build Verification
✅ Project builds successfully without errors
✅ No linter errors in modified files

### Test Scenarios
1. **Initial Load:** Page 1 with 10 customers displays correctly
2. **Page Navigation:** Can navigate between pages using pagination controls
3. **Total Count:** Displays correct total customer count
4. **Empty State:** Shows appropriate message when no customers exist
5. **Loading State:** Shows loading indicator while fetching
6. **Search Filter:** Pagination hides when searching, shows all filtered results
7. **Customer View:** Pagination hides when viewing a specific customer's projects

## Files Modified

1. `src/components/marketing/DigitalMarketingDepartment.jsx`
   - Added pagination state variables
   - Updated `fetchCustomers` function
   - Added `handleCustomersPageChange` function
   - Updated `useEffect` hook
   - Added pagination UI component

2. `src/services/marketingApi.js`
   - Updated `getAllCustomers` function to support pagination parameters
   - Added proper response handling for paginated data

## Notes

- The pagination only applies to the customer list view, not the search results
- The backend performs array slicing for pagination (`customers.slice(skip, skip + limit)`)
- Customer projects continue to have their own separate pagination
- The implementation maintains consistency with other department pagination patterns

## Future Enhancements

Consider these potential improvements:
1. Add page size selector (10, 25, 50, 100 items per page)
2. Add "Go to page" input for direct page navigation
3. Add URL query parameters to maintain pagination state on refresh
4. Add keyboard navigation for pagination controls
5. Add loading skeleton for better UX during page transitions

---

**Implementation Date:** October 13, 2025  
**Status:** ✅ Complete and Tested

