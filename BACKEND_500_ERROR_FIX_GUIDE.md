# Backend 500 Error - Fix Guide

## Current Issue

The backend is returning a **500 Internal Server Error** when the frontend calls:
```
GET /api/it/tickets?page=1&limit=10
```

## Frontend Changes Applied ✅

The frontend now **handles 500 errors gracefully**:
- ✅ Shows empty state instead of crashing
- ✅ Logs detailed error information to console
- ✅ Returns empty data: `{ success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 }`

## What You'll See in Console

With the improved logging, you should now see:
```
🎫 Getting IT tickets: {page: 1, limit: 10, status: 'all'}
🎫 Calling API with params: {page: 1, limit: 10}
🌐 IT API Call: {endpoint: '/api/it/tickets', ...}
❌ IT API Error: AxiosError {...}
❌ IT API Error Response: {...}
❌ IT API Error Data: {message: "...", error: "..."}  ← BACKEND ERROR DETAILS
❌ IT API Error Status: 500
❌ IT API Error Message: "..."  ← SPECIFIC ERROR FROM BACKEND
💥 500 Internal Server Error - Backend response: {...}
💥 Backend error message: "..."
💥 Backend error details: "..."
ℹ️ Returning empty data for 500 error - backend needs to be fixed
```

## Backend Issues to Check

The 500 error is coming from the backend. Here are common causes:

### 1. Endpoint Doesn't Exist ❌
**Check:** Does `/api/it/tickets` route exist in your backend?

**Location to check:**
```javascript
// backend/routes/it.routes.js or similar
router.get('/tickets', getAllTickets);
```

### 2. Database Query Error ❌
**Check:** Is the `Ticket` model properly defined? Is the database connected?

**Common errors:**
- `Ticket is not defined`
- `Cannot read property 'find' of undefined`
- Database connection failed

### 3. Missing Department Reference ❌
**Check:** The backend code you shared shows:
```javascript
// This is in the getAllProjects, might be similar issue in getAllTickets
const department = await Department.findOne({ name: "IT" });
if (!department) {
  return next(new Error("IT Department not found", { cause: 404 }));
}
```

**Issue:** If there's no "IT" department in your database, it will fail.

**Solution:** Make sure you have an IT department in your database:
```javascript
// Run this in your database or backend seed script
db.departments.insertOne({
  name: "IT",
  description: "Information Technology Department",
  // ... other fields
});
```

### 4. Tickets Not Associated with IT Department ❌
**Check:** Are there any tickets in your database? Are they associated with the IT department?

**Expected ticket structure:**
```javascript
{
  _id: ObjectId("..."),
  title: "Fix server issue",
  description: "Server is down",
  status: "open",
  priority: "high",
  department: ObjectId("..."), // Reference to IT department
  employee: ObjectId("..."), // Who submitted it
  assignedTo: ObjectId("..."), // Who it's assigned to
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Backend Route Implementation Missing ❌
**Check:** Is `getAllTickets` function implemented in your backend controller?

**Should look like this:**
```javascript
// backend/controllers/it.controller.js
export const getAllTickets = asyncHandler(async(req, res, next) => {
  // Get paginated tickets
  const query = Ticket.find();
  const features = new api_features(query, req.query)
    .filterByStatus()
    .sort()
    .pagination();
  
  const tickets = await features.mongoose_query;

  // Conditional total count based on status
  let totalTickets;
  if (req.query.status && req.query.status !== "all") {
    totalTickets = await Ticket.countDocuments({
      status: req.query.status
    });
  } else {
    totalTickets = await Ticket.countDocuments();
  }

  return res.status(200).json({
    success: true,
    data: tickets,
    total: totalTickets,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    totalPages: Math.ceil(totalTickets / (parseInt(req.query.limit) || 10)),
    createdAt: new Date()
  });
});
```

## How to Debug the Backend Error

### Step 1: Check Backend Logs
Look at your backend console/logs for the actual error:
```
Error: ...
at ...
```

### Step 2: Test Backend Directly
Use Postman or curl to test the endpoint:
```bash
curl -X GET "https://trendora-nine.vercel.app/api/it/tickets?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Check Backend Response
The backend should return:
```json
{
  "success": true,
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

If it returns:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

Then you need to fix the backend issue.

## Quick Fix for Backend

If the endpoint doesn't exist or is broken, here's a minimal working implementation:

```javascript
// backend/routes/it.routes.js
import { Router } from 'express';
import { getAllTickets } from '../controllers/it.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/tickets', auth, getAllTickets);

export default router;
```

```javascript
// backend/controllers/it.controller.js
import Ticket from '../models/ticket.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllTickets = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get total count
    const total = await Ticket.countDocuments(query);
    
    // Get paginated data
    const tickets = await Ticket.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    return res.status(200).json({
      success: true,
      data: tickets,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
});
```

## Expected Behavior Now

With the frontend fixes applied:

✅ **Before:** Frontend crashed with error  
✅ **After:** Frontend shows empty state with message "No tickets found"

✅ **Before:** No visibility into backend error  
✅ **After:** Detailed error logging in console showing exact backend error

✅ **Before:** User sees broken UI  
✅ **After:** User sees empty state UI that's still functional

## Next Steps

1. **Check the new console logs** - Look for "💥 Backend error message:" to see the exact backend error
2. **Fix the backend** - Use the information from the logs to fix the backend issue
3. **Test again** - Once backend is fixed, tickets should appear automatically (no frontend changes needed)

## Summary

- ✅ Frontend now handles 500 errors gracefully
- ✅ Comprehensive error logging added
- ✅ Empty state shown instead of crash
- ⚠️ Backend needs to be fixed (500 error indicates backend problem)
- 📋 Check console logs for specific backend error details

