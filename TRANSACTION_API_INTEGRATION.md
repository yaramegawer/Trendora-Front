# Transaction API Integration Documentation

## Overview
This document describes the integration of transaction management APIs into the Accounting Department frontend.

## Backend API Endpoints
All endpoints are prefixed with `/api/accounting`:

- **POST** `/add_transaction` - Create a new transaction
- **PUT** `/update_transaction/:_id` - Update an existing transaction
- **GET** `/get_transactions` - Get all transactions
- **DELETE** `/delete_transaction/:id` - Delete a transaction
- **GET** `/get_transaction/:_id` - Get a single transaction by ID
- **GET** `/summary` - Get accounting summary (revenue, expenses, profit, balance)

## Frontend Implementation

### 1. API Service Layer (`src/services/accountingApi.js`)

Added the following transaction management functions:

#### `addTransaction(transactionData)`
Creates a new transaction with the following fields:
- `description` (string): Transaction description
- `amount` (number): Transaction amount
- `type` (string): Either 'income' or 'expense'
- `method` (string): Payment method - visa, wallet, or cash
- `date` (string): Transaction date in ISO format

**Example:**
```javascript
const result = await accountingApi.addTransaction({
  description: 'Client Payment',
  amount: 5000,
  type: 'income',
  method: 'visa',
  date: '2024-01-15'
});
```

#### `updateTransaction(transactionId, updateData)`
Updates an existing transaction by ID.

**Example:**
```javascript
const result = await accountingApi.updateTransaction('transaction_id', {
  description: 'Updated description',
  amount: 6000
});
```

#### `getAllTransactions()`
Fetches all transactions for the current user.

**Returns:**
```javascript
{
  success: true,
  data: [
    {
      _id: 'transaction_id',
      description: 'Transaction description',
      amount: 5000,
      type: 'income',
      date: '2024-01-15',
      createdAt: '2024-01-15T10:00:00Z'
    },
    // ... more transactions
  ]
}
```

#### `getTransaction(transactionId)`
Fetches a single transaction by ID.

#### `deleteTransaction(transactionId)`
Deletes a transaction by ID.

#### `getSummary()`
Fetches accounting summary with aggregated data.

**Returns:**
```javascript
{
  success: true,
  data: {
    totalRevenue: 125430,
    totalExpenses: 89210,
    netProfit: 36220,
    cashBalance: 245890
  }
}
```

### 2. Custom Hook (`src/hooks/useAccountingData.js`)

Added state management and methods for transactions:

#### State
- `transactions` - Array of transaction objects
- `summary` - Object containing financial summary
- `loading` - Loading state
- `error` - Error messages
- `fieldErrors` - Field-specific validation errors

#### Methods
- `fetchTransactions()` - Loads all transactions
- `addTransaction(data)` - Creates a new transaction
- `updateTransaction(id, data)` - Updates a transaction
- `deleteTransaction(id)` - Deletes a transaction
- `getTransaction(id)` - Gets a single transaction
- `fetchSummary()` - Loads financial summary

**Example Usage:**
```javascript
const {
  transactions,
  summary,
  addTransaction,
  deleteTransaction,
  loading
} = useAccountingData();
```

### 3. UI Component (`src/components/accounting/AccountingDepartment.jsx`)

#### Summary Cards
Updated to display real-time data from the API:
- Total Revenue (from summary API)
- Total Expenses (from summary API)
- Net Profit (from summary API)
- Cash Balance (from summary API)

All values are displayed in Egyptian Pounds (EGP) with proper number formatting.

#### Transaction List
Displays all transactions with:
- Description
- Date (formatted)
- Amount (color-coded: green for income, red for expense)
- Type badge (income/expense)
- Delete button

**Features:**
- Shows loading state while fetching data
- Empty state message when no transactions exist
- Real-time updates after adding/deleting transactions
- Confirmation dialog before deletion

#### Transaction Dialog
Form to create/edit transactions with fields:
- **Description** (required) - Text description of the transaction
- **Amount** (required) - Numeric value (minimum 0)
- **Date** (required) - Date picker with default to today
- **Type** (required) - Dropdown: Income or Expense
- **Payment Method** (required) - Dropdown: Visa, Wallet, or Cash

**Validation:**
- Field-level error display showing errors directly below each field
- Red border on fields with errors
- No form-level summary (errors shown inline only)
- Success notifications

#### Transaction Table View
Displays transactions in a professional table format similar to invoices:
- **Columns**: Description, Amount (color-coded), Type, Method, Date, Actions
- **Pagination**: 
  - Show 5, 10, 25, or 50 transactions per page
  - Navigate between pages with previous/next buttons
  - Display transaction count (e.g., "Showing 1 to 10 of 25 transactions")
- **Actions Menu** (three-dot menu icon):
  - 👁️ View Details - Fetches and displays full transaction details from API
  - ✏️ Edit - Opens edit dialog with pre-filled data
  - 🖨️ Print Transaction - Prints transaction details
  - 🗑️ Delete - Deletes transaction with confirmation
- **Color Coding**: Green for income, Red for expenses
- **Payment Method**: Displayed as outlined chip badges
- **Loading States**: Shows loading indicator while fetching transaction details

## Data Flow

### Creating a Transaction
1. User clicks "New Transaction" button
2. Dialog opens with empty form
3. User fills in transaction details
4. On submit, `addTransaction()` is called
5. API request is sent to backend
6. On success:
   - Transaction list is refreshed
   - Summary is refreshed
   - Dialog closes
   - Success message is shown
7. On error:
   - Error messages are displayed
   - Form remains open for correction

### Deleting a Transaction
1. User clicks "Delete" button on a transaction
2. Confirmation dialog appears
3. On confirm, `deleteTransaction()` is called
4. API request is sent to backend
5. On success:
   - Transaction is removed from local state
   - Summary is refreshed
   - Success message is shown
6. On error:
   - Error message is displayed

### Loading Summary
- Summary is automatically loaded when component mounts
- Summary is refreshed after any transaction is added/updated/deleted
- Displays 0 values if API fails (graceful degradation)

## Error Handling

### API Level
- All API calls return consistent response format:
  ```javascript
  {
    success: boolean,
    data: any,
    error: string,
    fieldErrors: object,
    message: string
  }
  ```
- 403 (Forbidden) errors are handled silently, returning empty data
- Network errors show user-friendly messages

### Component Level
- Loading states prevent duplicate submissions
- Field errors are displayed next to form inputs
- General errors are shown in Alert components
- Confirmation dialogs prevent accidental deletions

## Security

### Authorization
- All requests include JWT token in Authorization header
- Backend validates user access to their own transactions only
- Frontend gracefully handles 401 (Unauthorized) and 403 (Forbidden) responses

### Validation
- Frontend validates required fields
- Backend performs additional validation
- Field errors are mapped and displayed appropriately

## Testing the Integration

### Prerequisites
1. Backend server running at the configured API endpoint
2. User must be logged in with valid token
3. User must have access to Accounting department

### Test Cases

#### 1. Create Transaction
```javascript
// Test data
{
  description: "Test Income Transaction",
  amount: 1000,
  type: "income",
  method: "visa",
  date: "2024-01-15"
}
```

#### 2. Edit Transaction
- Click the three-dot menu icon on any transaction
- Select "Edit" from the menu
- Modify the transaction details
- Click "Update Transaction"
- Verify changes are reflected in the table

#### 3. View Transactions Table
- Navigate to Accounting Department
- Select "Transactions" tab
- Verify transactions are displayed in table format
- Check that amounts are color-coded (green for income, red for expenses)
- Verify payment methods are shown as badges

#### 4. View Transaction Details
- Click the three-dot menu icon on any transaction
- Select "View Details" from the menu
- Verify loading indicator appears while fetching data
- Verify all transaction information is displayed correctly (fetched from GET /get_transaction/:_id)
- Test the print button in the details dialog
- Test error handling by viewing details of a non-existent transaction

#### 5. Delete Transaction
- Click the three-dot menu icon on any transaction
- Select "Delete" from the menu
- Confirm deletion
- Verify transaction is removed from the table

#### 6. Print Transaction
- Click the three-dot menu icon on any transaction
- Select "Print Transaction" from the menu
- Verify print dialog opens with transaction details

#### 7. Test Pagination
- Create more than 10 transactions
- Verify pagination controls appear
- Navigate to page 2 and verify correct transactions are displayed
- Change page size to 5, 25, or 50 and verify it works
- Verify "Showing X to Y of Z transactions" updates correctly

#### 8. View Summary
- Check summary cards show correct values
- Verify values update after adding/deleting transactions

## Future Enhancements

1. **Filters** - Filter by date range, type, amount, payment method
2. **Search** - Search transactions by description
3. **Export** - Export transactions to CSV/Excel
4. **Charts** - Visual representation of income vs expenses
5. **Categories** - Add transaction categories
6. **Recurring Transactions** - Support for recurring transactions
7. **Attachments** - Ability to attach receipts/documents
8. **Audit Trail** - Track who created/modified transactions
9. **Bulk Actions** - Select multiple transactions for batch operations
10. **Server-Side Pagination** - Move pagination to backend for better performance with large datasets

## Summary API

### Endpoint
`GET /api/accounting/summary`

### Response Format
```json
{
  "total_revenue": 125430,
  "total_expenses": 89210,
  "net_profit": 36220
}
```

### Frontend Mapping
The API returns snake_case keys which are automatically mapped to camelCase:
- `total_revenue` → `totalRevenue`
- `total_expenses` → `totalExpenses`
- `net_profit` → `netProfit`

### Summary Cards
Three cards display at the top of the Accounting Department:

1. **Total Revenue** (Green card with TrendingUp icon)
   - Shows sum of all income transactions
   - Color: Success/Green
   
2. **Total Expenses** (Red card with AttachMoney icon)
   - Shows sum of all expense transactions
   - Color: Error/Red
   
3. **Net Profit** (Blue/Orange card with Assessment icon)
   - Calculated as: Revenue - Expenses
   - Color: Blue if positive, Orange if negative

### Reports Tab
Comprehensive financial reporting dashboard showing:

**Financial Summary**
- Large colored cards for Revenue, Expenses, and Net Profit
- Hover animation (cards lift on hover)

**Financial Breakdown Table**
- Income row with percentage (always 100%)
- Expense row with percentage of revenue
- Net Profit/Loss row with profit/loss indicator

**Key Performance Indicators (KPIs)**
- **Profit Margin**: (Net Profit / Revenue) × 100
- **Expense Ratio**: (Expenses / Revenue) × 100
- **Total Transactions**: Count of all transactions
- **Average Transaction**: (Revenue + Expenses) / Transaction Count

**Report Info**
- Generation timestamp
- Real-time data indicator

## API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "description": "Client Payment",
    "amount": 5000,
    "type": "income",
    "method": "visa",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Transaction created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Please correct the validation errors below.",
  "fieldErrors": {
    "amount": "Amount must be greater than 0",
    "description": "Description is required"
  }
}
```

## Troubleshooting

### Transactions Not Loading
1. Check browser console for errors
2. Verify API endpoint is correct in `src/config/api.js`
3. Verify user token is valid
4. Check backend server is running
5. Verify user has access to Accounting department

### Cannot Create Transaction
1. Check all required fields are filled
2. Verify amount is a valid number
3. Check network tab for API response
4. Review field errors displayed on form

### Summary Shows Zero Values
1. Check if transactions exist
2. Verify summary API endpoint is working
3. Check backend calculation logic
4. Review browser console for errors

## Related Files

- `src/services/accountingApi.js` - API service functions
- `src/hooks/useAccountingData.js` - React hook for state management
- `src/components/accounting/AccountingDepartment.jsx` - Main UI component
- `src/api/axios.js` - Axios configuration
- `src/config/api.js` - API configuration

## Change Log

### Version 1.4 (Current)
- ✅ Implemented backend pagination for transactions (using page & limit query params)
- ✅ Exact same pagination logic as invoices for consistency
- ✅ Fallback mechanism: If backend doesn't return total count, fetches with limit=1000 to get accurate count
- ✅ Helper function: `getTransactionTotalCount()` to get accurate total
- ✅ Backend now handles pagination with skip and limit logic
- ✅ Added "2 per page" option to test pagination (as per backend default limit)
- ✅ Transaction pagination state managed separately from invoice pagination
- ✅ Fixed SimplePagination rendering by passing all required props:
  - currentPage, totalPages, totalItems, pageSize, onPageChange
- ✅ Pagination now visible with proper page navigation controls
- ✅ Shows "25 items total" with First/Prev/1/2/3/Next/Last buttons
- ✅ Removed debug info display (showing X to Y of Z)
- ✅ Added payment method field to invoice forms (both quick create and invoice management)
- ✅ Payment methods in invoices: Visa, Wallet, Cash (matching transactions)
- ✅ Invoice form layout: Status, Method (vertical stack below), then Due Date
- ✅ Invoice table: Added Method column between Status and Due Date
- ✅ Invoice details view: Shows payment method
- ✅ Invoice print: Includes payment method in printed output
- ✅ Real-time transaction count from backend
- ✅ Enhanced console logging for debugging pagination issues

### Version 1.3
- ✅ Connected Reports tab to summary API (GET /accounting/summary)
- ✅ Display real-time financial data from database
- ✅ Removed Cash Balance card (only showing Revenue, Expenses, Net Profit)
- ✅ Updated summary cards to use 3-column layout
- ✅ Professional card design (consistent across top and Reports tab):
  - Left border accent (4px thick - green for revenue, red for expenses, blue/orange for profit)
  - Clean typography with uppercase labels
  - Small icons (16px) at bottom for minimal design
  - Hover effects (shadow and lift animation)
  - Minimal and corporate aesthetic
  - Consistent design language throughout the application
- ✅ Comprehensive financial reports with:
  - Financial Summary overview cards (matching top summary design)
  - Detailed breakdown table with percentages
  - Key Performance Indicators (KPIs)
  - Profit Margin, Expense Ratio, Transaction Count, Average Transaction
- ✅ Added refresh button for summary data
- ✅ Real-time report generation timestamp
- ✅ Snake_case to camelCase mapping for API data
- ✅ Removed Analytics tab (streamlined to: Transactions, Invoices, Reports)

### Version 1.2
- ✅ Connected view details to GET transaction by ID API
- ✅ Added pagination to transaction table (5, 10, 25, 50 per page)
- ✅ Display transaction count and page info
- ✅ Added loading states for fetching transaction details
- ✅ Improved error handling for failed API calls with fallback
- ✅ Fixed view details layout to vertical stack (all fields one under another)
- ✅ Enhanced print transaction to use hidden iframe (no new tabs)
- ✅ Professional transaction receipt design with company branding
- ✅ Added refresh button for manual transaction reload
- ✅ Enhanced pagination visibility with info bar
- ✅ Added comprehensive console logging for debugging

### Version 1.1
- ✅ Upgraded transaction UI to table view (similar to invoices)
- ✅ Added three-dot action menu for transactions
- ✅ Implemented edit transaction functionality
- ✅ Added view transaction details dialog
- ✅ Implemented print transaction feature
- ✅ Updated payment methods to: Visa, Wallet, Cash
- ✅ Professional table layout with color-coded amounts
- ✅ Improved UX with inline field errors only

### Version 1.0
- ✅ Integrated all 6 transaction API endpoints
- ✅ Added transaction CRUD operations
- ✅ Implemented summary API
- ✅ Real-time data display
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Delete confirmation
- ✅ Success/error notifications

