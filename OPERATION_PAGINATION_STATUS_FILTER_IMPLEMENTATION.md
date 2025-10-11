# Operation Department - Backend Pagination & Status Filter Implementation

## Overview
This document outlines the implementation of backend pagination and status filtering for campaigns in the Operation department, following the same pattern used in other departments (IT, HR, Marketing, Accounting).

## Changes Made

### 1. Backend API Service (`src/services/operationApi.js`)

**Updated `getAllCampaigns` method:**
- Added `status` parameter to the API call
- Status filter is now handled by the backend
- Query params include: `page`, `limit`, and `status` (when not 'all')

```javascript
getAllCampaigns: async (page = 1, limit = 10, status = null) => {
  const params = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }
  
  return await apiCall(API_CONFIG.ENDPOINTS.OPERATION.CAMPAIGNS, {
    method: 'GET',
    params
  });
}
```

### 2. Custom Hook (`src/hooks/useOperationData.js`)

**Updated `useOperationCampaigns` hook:**
- Added `statusFilter` parameter to hook initialization
- Added `status` state to track current filter
- Updated `fetchCampaigns` to accept and use status parameter
- Backend now returns pagination metadata: `{ success, data, total, page, limit, totalPages }`
- Added `changeStatus` method to update status filter and reset to page 1
- All CRUD operations now maintain current status filter

**Key Features:**
- **Backend Pagination**: Fetches only the requested page of data
- **Status Filtering**: Backend handles filtering by status (planned, active, paused, completed)
- **Automatic Refresh**: Updates maintain current page and status filter
- **Total Count**: Backend provides accurate total count for filtered results

### 3. Component (`src/components/operation/OperationDepartment.styled.jsx`)

**Updated Campaign Management:**
- Removed client-side status filtering (now handled by backend)
- Kept client-side search filtering (for instant feedback)
- Updated hook initialization to pass status filter
- Simplified pagination logic to use backend-provided data
- Updated UI to show correct counts based on filtering mode

**Filtering Logic:**
```javascript
// Client-side search filter only (instant feedback)
const filteredCampaigns = campaigns.filter(campaign => 
  campaignSearchTerm === '' || 
  campaign.name.includes(campaignSearchTerm) ||
  campaign.description.includes(campaignSearchTerm) ||
  campaign.customerName.includes(campaignSearchTerm)
);

// Use backend-paginated campaigns directly when no search
const displayedCampaigns = campaignSearchTerm ? filteredCampaigns : campaigns;
```

**Pagination:**
- Backend pagination is used when no search term is present
- Pagination is hidden when using client-side search
- Page changes trigger backend API calls with current status filter

### 4. Backend Expected Response Format

The backend should return the following format for paginated campaigns:

```javascript
{
  success: true,
  data: [...],              // Array of campaigns for current page
  total: 150,               // Total count of campaigns (filtered by status)
  page: 2,                  // Current page number
  limit: 10,                // Items per page
  totalPages: 15,           // Total number of pages
  createdAt: "2025-01-15T..."
}
```

## Backend Implementation Reference

Based on the provided backend code, the implementation uses:

1. **api_features class** with:
   - `.filterByStatus()` - Filters campaigns by status
   - `.sort()` - Sorts results
   - `.pagination()` - Handles page and limit

2. **Conditional total count**:
   - When status filter is applied: count only campaigns with that status
   - When status is 'all': count all campaigns in the department

3. **Error handling**:
   - Returns 404 when no campaigns found
   - Returns proper pagination metadata in response

## Status Filter Options

The following status values are supported:
- `all` - Show all campaigns (no status filter)
- `planned` - Show only planned campaigns
- `active` - Show only active campaigns
- `paused` - Show only paused campaigns
- `completed` - Show only completed campaigns

## Benefits

1. **Performance**: Only fetches data for current page, reducing payload size
2. **Scalability**: Works efficiently with large datasets
3. **Consistency**: Follows same pattern as other departments (IT, HR, Marketing, Accounting)
4. **User Experience**: 
   - Instant search feedback (client-side)
   - Proper pagination controls
   - Accurate total counts
   - Status filtering without page reload

## Testing Checklist

- [ ] Campaigns load with default pagination (page 1, limit 10)
- [ ] Page navigation works correctly (next/previous)
- [ ] Status filter updates campaigns and resets to page 1
- [ ] Status filter shows correct total count
- [ ] Search works instantly (client-side)
- [ ] Pagination hidden when searching
- [ ] Creating/updating/deleting campaigns refreshes current page
- [ ] Quick status update maintains current filter
- [ ] Backend returns proper pagination metadata

## Integration with Other Hooks

The `useOperationRecentActivities` hook was also updated to call campaigns API with the new signature:
```javascript
operationCampaignApi.getAllCampaigns(1, 100, 'all')
```

This ensures consistency across all API calls.

