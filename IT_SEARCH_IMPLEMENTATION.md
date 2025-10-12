# IT Department Search Implementation

## Summary
Successfully implemented **client-side search functionality** for IT department projects with **debouncing** to prevent unnecessary re-renders and API calls.

## Problem
- Backend API does not support search parameter for projects
- User needed search functionality to filter projects by name, description, or notes
- Typing was causing page refresh on every keystroke

## Solution
Implemented a hybrid approach:
- **Backend**: Handles status filtering and provides all projects
- **Frontend**: Handles search filtering and pagination

## Changes Made

### 1. Updated `src/hooks/useITData.js`

#### Added Client-Side Search
- Added `allProjects` state to store all fetched projects
- Created `applyFiltersAndPagination()` function for client-side filtering
- Search filters projects by:
  - Project name
  - Project description  
  - Project notes (case-insensitive)

#### Optimized Fetch Behavior
- **Backend fetch** only when:
  - Initial mount
  - Status filter changes
  - After create/update/delete operations
- **No backend fetch** when:
  - Search term changes (filters existing data)
  - Page changes (paginates existing filtered data)
  - Page size changes (re-paginates existing filtered data)

#### Key Implementation Details
```javascript
// Two separate useEffects:

// 1. Fetch from backend only on status filter change
useEffect(() => {
  fetchProjects(currentPage, pageSize, currentSearchTerm, currentStatusFilter);
}, [currentStatusFilter]);

// 2. Apply client-side filters when search/page/pageSize change
useEffect(() => {
  if (allProjects.length > 0) {
    applyFiltersAndPagination();
  }
}, [currentPage, currentSearchTerm, pageSize, allProjects]);
```

### 2. Updated `src/services/itApi.js`

- Added `search` parameter to `getAllProjects()` function
- Parameter is sent to backend but backend ignores it (ready for future backend implementation)

### 3. Updated `src/components/IT/ITDepartment.styled.jsx`

#### Added Debouncing
- Search now waits 500ms after user stops typing before applying filter
- Prevents page refresh on every keystroke
- Provides smooth user experience

```javascript
useEffect(() => {
  const debounceTimeout = setTimeout(() => {
    projectChangeSearchTerm(projectSearchTerm);
  }, 500);
  
  return () => clearTimeout(debounceTimeout);
}, [projectSearchTerm]);
```

## Features

### ✅ Working Features
1. **Search Functionality**
   - Searches project name, description, and notes
   - Case-insensitive matching
   - Real-time filtering (with 500ms debounce)

2. **Status Filtering**
   - Filters by project status (planned, in_progress, completed, on_hold)
   - Handled by backend

3. **Pagination**
   - Client-side pagination of filtered results
   - Correct page counts and navigation
   - Resets to page 1 when search changes

4. **Performance**
   - No unnecessary backend calls
   - Debounced search input
   - Efficient client-side filtering

### 🔄 How It Works

1. **User changes status filter**
   → Backend fetch with new status
   → Store in `allProjects`
   → Apply current search and pagination

2. **User types in search box**
   → Update local state immediately (UI shows typed text)
   → Wait 500ms (debounce)
   → Apply search filter to `allProjects`
   → Paginate filtered results
   → **No backend call**

3. **User changes page**
   → Update page state
   → Re-paginate filtered results
   → **No backend call**

## Benefits

1. **User Experience**
   - Fast, responsive search
   - No flickering or refreshing while typing
   - Smooth pagination

2. **Performance**
   - Minimal backend API calls
   - Efficient client-side filtering
   - Reduced network traffic

3. **Maintainability**
   - Clear separation of concerns
   - Backend handles data fetching
   - Frontend handles UI filtering
   - Easy to migrate to backend search when available

## Future Migration to Backend Search

When backend implements search functionality:

1. Remove `allProjects` state from hook
2. Change `fetchProjects()` to accept and use search parameter
3. Add `currentSearchTerm` to the backend fetch useEffect dependencies
4. Remove `applyFiltersAndPagination()` function
5. Remove the client-side filtering useEffect

The debouncing in the component can remain unchanged.

## Testing Checklist

- [x] Search filters projects by name
- [x] Search filters projects by description
- [x] Search filters projects by notes
- [x] Search is case-insensitive
- [x] No refresh on every keystroke (debounced)
- [x] Pagination works with search results
- [x] Status filter works with search
- [x] Page resets to 1 when search changes
- [x] No linter errors
- [x] Correct project counts displayed
- [x] No unnecessary backend API calls

## Notes

- Search is currently client-side only (backend doesn't support it yet)
- All projects are fetched from backend (with status filter applied)
- Search and pagination happen on the frontend
- Debounce delay is set to 500ms (adjustable if needed)
- Search checks name, description, and notes fields

## Related Files

- `src/hooks/useITData.js` - Search logic and data management
- `src/services/itApi.js` - API service (ready for backend search)
- `src/components/IT/ITDepartment.styled.jsx` - Search input with debouncing

