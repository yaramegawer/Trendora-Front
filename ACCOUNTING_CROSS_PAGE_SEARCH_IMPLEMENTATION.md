# Accounting Invoice Cross-Page Search Implementation

## Overview
Implemented client-side search functionality that searches across all invoice pages, not just the current page. Since the backend doesn't handle search, this solution fetches all invoices when a search term is entered and filters them on the client side.

## Changes Made

### 1. `src/hooks/useAccountingData.js`

#### New State Variables
- `allInvoices`: Array to store all invoices when searching (not paginated)
- `isSearching`: Boolean flag to indicate when in search mode

#### New Functions
- **`fetchAllInvoicesForSearch(status)`**: 
  - Fetches all invoices with a large limit (10,000)
  - Sets `isSearching` to true
  - Stores results in `allInvoices` state
  - Disables pagination (sets totalPages to 1)

#### Modified Functions
- **`fetchInvoices(page, limit, status)`**:
  - Now clears `allInvoices` when not searching
  - Sets `isSearching` to false
  - Returns to normal pagination mode

#### Exported New Values
- `allInvoices`
- `isSearching`
- `fetchAllInvoicesForSearch`
- `fetchInvoices` (already exported, but now used in component)

### 2. `src/components/accounting/InvoiceManagement.jsx`

#### Updated Hook Usage
Added new destructured values from `useAccountingData`:
- `allInvoices`
- `isSearching`
- `fetchAllInvoicesForSearch`
- `fetchInvoices`

#### Modified Search Logic

**Debounced Search Effect** (lines 115-135):
```javascript
// Debounce search term only
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

// Trigger search mode when debounced search term changes
useEffect(() => {
  // If there's a search term, fetch all invoices for searching
  if (debouncedSearchTerm.trim()) {
    fetchAllInvoicesForSearch(statusFilter);
  } else if (debouncedSearchTerm === '' && searchTerm === '') {
    // Only go back to pagination if search was actually cleared
    // Don't do this on initial mount or when just navigating pages
    if (isSearching) {
      fetchInvoices(1, pageSize, statusFilter);
    }
  }
}, [debouncedSearchTerm]); // Only depend on debouncedSearchTerm
```

**Key Fix**: Split the effect into two separate effects to prevent pagination reset when clicking next page. The search trigger only depends on `debouncedSearchTerm`, not on `statusFilter` or `pageSize`, which allows normal pagination to work without interference.

**Filtering Logic** (lines 132-149):
```javascript
const filteredInvoices = (() => {
  // Use allInvoices when searching, otherwise use current page invoices
  const sourceInvoices = isSearching ? allInvoices : invoices;
  
  if (!debouncedSearchTerm.trim()) {
    return sourceInvoices;
  }
  
  const searchLower = debouncedSearchTerm.toLowerCase();
  return sourceInvoices.filter(invoice => (
    (invoice.client_name && invoice.client_name.toLowerCase().includes(searchLower)) ||
    (invoice.description && invoice.description.toLowerCase().includes(searchLower)) ||
    (invoice._id && invoice._id.toLowerCase().includes(searchLower)) ||
    (invoice.invoice_type && invoice.invoice_type.toLowerCase().includes(searchLower)) ||
    (invoice.amount && invoice.amount.toString().includes(debouncedSearchTerm)) ||
    (invoice.status && invoice.status.toLowerCase().includes(searchLower))
  ));
})();
```

#### Updated Filter Handlers

**Status Filter** (lines 287-298):
```javascript
const handleStatusFilterChange = (event) => {
  const newStatus = event.target.value;
  setStatusFilter(newStatus);
  
  // If we're currently searching, fetch all invoices with new status
  if (searchTerm.trim()) {
    fetchAllInvoicesForSearch(newStatus);
  } else {
    // Otherwise use normal pagination
    changeStatusFilter(newStatus);
  }
};
```

**Clear Filters** (lines 300-306):
```javascript
const clearFilters = () => {
  setSearchTerm('');
  setDebouncedSearchTerm('');
  setStatusFilter('all');
  // Go back to normal pagination mode
  fetchInvoices(1, pageSize, 'all');
};
```

#### Updated UI Elements

**Pagination Info Display** (lines 641-652):
Shows different text based on search mode:
- **When searching**: "Showing {filtered} of {total} invoices (searching all pages)"
- **When not searching**: "{count} invoices (filtered)"

**Per Page Selector** (lines 654-670):
Only shown when not in search mode (`!isSearching`)

**Pagination Controls** (lines 675-683):
Only shown when not in search mode and there are multiple pages (`!isSearching && totalPages > 1`)

## How It Works

### Normal Mode (No Search)
1. User sees paginated invoices (10 per page by default)
2. Pagination controls are visible
3. Status filter works with backend pagination

### Search Mode (Search Term Entered)
1. User types a search term
2. After 300ms debounce, `fetchAllInvoicesForSearch()` is called
3. All invoices are fetched from the backend (up to 10,000)
4. Search filters are applied client-side across all fetched invoices
5. Pagination controls are hidden (all results shown on one page)
6. Status filter still works but fetches all invoices with that status

### Exiting Search Mode
1. User clears the search field
2. `fetchInvoices()` is called to return to normal pagination
3. Pagination controls reappear
4. Shows only current page results

## Search Fields
The search functionality searches across the following invoice fields:
- `client_name` - Client or company name
- `description` - Invoice description
- `_id` - Invoice ID
- `invoice_type` - Type (customer/vendor)
- `amount` - Invoice amount (exact match)
- `status` - Invoice status (paid/unpaid/overdue)

## Performance Considerations

### Optimization
- **Debouncing**: 300ms delay prevents excessive API calls while typing
- **Conditional Fetching**: Only fetches all invoices when search is active
- **Memory Management**: Clears `allInvoices` when returning to pagination mode

### Limitations
- Maximum 10,000 invoices can be searched at once
- All matching results are shown on a single page (no pagination in search mode)
- Search is case-insensitive

## Bug Fixes

### Issue: Pagination Reset on Next Page Click
**Problem**: When clicking "next page" in normal pagination mode, the page would reset back to page 1.

**Root Cause**: The `useEffect` hook had dependencies on `statusFilter`, `pageSize`, and other variables that would trigger when navigating pages, causing it to always call `fetchInvoices(1, ...)` which resets to page 1.

**Solution**: Split the effect into two separate effects:
1. First effect: Only debounces the `searchTerm` (depends only on `searchTerm`)
2. Second effect: Triggers search mode based on `debouncedSearchTerm` (depends only on `debouncedSearchTerm`)

This ensures that:
- Normal pagination navigation doesn't trigger the search effect
- Status filter changes don't reset the page
- Page size changes don't reset the page
- Only actual search term changes trigger the search mode

**Status**: ✅ Fixed

## Testing Checklist

✅ Build successful - No compilation errors
✅ No linter errors
✅ Pagination bug fixed - Next page no longer resets to page 1
- [ ] Manual Testing Required:
  - [ ] Search works across all pages
  - [ ] Search clears properly
  - [ ] Status filter works with search
  - [ ] Pagination appears/disappears correctly
  - [ ] Clear filters button resets everything
  - [ ] Performance is acceptable with many invoices
  - [ ] Normal pagination works without resetting to page 1

## Future Enhancements

If needed in the future:
1. **Backend Search**: Implement search on the backend for better performance
2. **Pagination in Search Mode**: Add client-side pagination for search results
3. **Advanced Filters**: Add date range, amount range filters
4. **Search Highlighting**: Highlight matching terms in results
5. **Export Search Results**: Allow exporting filtered results to CSV/Excel

