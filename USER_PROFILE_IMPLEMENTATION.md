# User Profile Implementation - Dashboard Header

## Overview
This document describes the implementation of the user profile display in the Employee Dashboard. The profile information is displayed prominently at the top of the dashboard in a beautiful card with gradient header, instead of in a separate tab.

## Backend Endpoint
The backend provides a user profile endpoint that requires authentication:

```
GET /api/user/get_profile
Authorization: Required (JWT token)
```

### Backend Response
The backend returns the employee/user data without the password field:

```javascript
{
  _id: "user_id",
  name: "User Name",
  email: "user@example.com",
  phone: "123-456-7890",
  department: "Department Name" or { name: "Department Name" },
  position: "Job Title",
  role: "Employee/Manager/Admin",
  status: "active",
  address: "User Address",
  emergencyContact: {
    name: "Emergency Contact Name",
    phone: "Emergency Phone"
  },
  joinDate: "2024-01-01",
  createdAt: "2024-01-01",
  // ... other employee fields
}
```

## Frontend Implementation

### 1. API Configuration (`src/config/api.js`)
Added the `GET_PROFILE` endpoint to the USER endpoints configuration:

```javascript
USER: {
  LOGIN: '/user/log_in',
  FORGET_PASSWORD: '/user/forgetPassword',
  RESET_PASSWORD: '/user/resetPassword',
  GET_PROFILE: '/user/get_profile',  // NEW
}
```

### 2. User API Service (`src/services/userApi.js`)
Added `getUserProfile` function to fetch the authenticated user's profile:

```javascript
getUserProfile: async () => {
  // Fetches user profile using JWT token from localStorage
  // Handles authentication errors
  // Returns user profile data
}
```

### 3. Employee Dashboard (`src/components/dashboard/EmployeeDashboard.jsx`)
Enhanced the dashboard with a beautiful profile header card at the top:

#### Features:
- **Header Card**: Profile information is displayed at the top of the dashboard in a card with:
  - Beautiful gradient purple header background
  - Large avatar (120px) with white border and shadow, overlapping the gradient
  - Professional layout with responsive design
- **Auto-fetch**: Profile data is fetched automatically on component mount
- **Comprehensive Display**: Shows all available user information including:
  - Profile picture (avatar with user initial, 120x120px)
  - Name (H4 typography, bold)
  - Email with icon
  - Phone number with icon (if available)
  - Role badge (primary colored chip)
  - Status badge (success/default colored chip)
  - Department with icon (from database)
  - Position/Job title with icon
  - Hire Date with icon (from database - uses joinDate, hireDate, or createdAt)
  - Employee ID with icon
- **Icons**: Material-UI icons for better visual representation:
  - EmailOutlined for email
  - PhoneOutlined for phone
  - BusinessOutlined for department
  - WorkOutlineOutlined for position
  - CalendarTodayOutlined for hire date
  - PersonOutlined for employee ID
- **Responsive**: Grid layout that adapts to different screen sizes (xs, sm, md)
- **Error Handling**: Displays warning alert if profile fetch fails
- **Loading States**: Shows "Loading..." text while fetching data
- **Visual Design**:
  - Gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Avatar positioned with negative margin to overlap gradient
  - Cards with shadows and hover effects
  - Proper spacing and alignment

#### State Management:
```javascript
const [userProfile, setUserProfile] = useState(null);
const [profileLoading, setProfileLoading] = useState(false);
const [profileError, setProfileError] = useState('');
```

#### UI Components:
- Card with gradient header background
- Large Avatar (120x120px) with white border overlapping the gradient
- Material-UI Grid for responsive layout
- Typography components for text display
- Chips for status and role display
- Icons for better visual representation
- Alert component for error messages

## Usage

### For Users:
1. Log in to the application
2. Navigate to the Employee Dashboard
3. View your profile information displayed at the top of the page
4. The profile shows:
   - Your name, email, and phone
   - Your role and status
   - Department and position
   - Hire date
   - Employee ID

### For Developers:
To extend the profile display with new fields:

1. Check if the field is returned by the backend API
2. Add a new Grid item in the profile header section
3. Use appropriate icon from Material-UI icons
4. Follow the existing pattern for consistency

Example:
```jsx
{userProfile?.yourField && (
  <Grid item xs={12} sm={6} md={3}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <YourIcon fontSize="small" color="primary" />
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          Field Label
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {userProfile.yourField}
        </Typography>
      </Box>
    </Box>
  </Grid>
)}
```

#### Important Database Fields:
The implementation retrieves these specific fields from the database:
- **role**: User's role in the system (from database)
- **department**: Department name or department object (from database)
- **hireDate/joinDate**: Employee's hire date (from database, falls back to createdAt)
- **status**: Employee status (active, inactive, etc.) (from database)

## Authentication
The API call automatically includes the JWT token from localStorage in the request headers:
- `Authorization: Bearer ${token}`
- `token: Trendora ${token}`

If the token is invalid or expired:
- User receives a 401 error
- Error message prompts user to log in again

## Error Handling
The implementation handles various error scenarios:
- **401 Unauthorized**: "Authentication required. Please log in again."
- **404 Not Found**: "User profile not found"
- **Network Errors**: Displays appropriate error message
- **Unknown Errors**: "Failed to fetch user profile. Please try again."

## Testing
To test the implementation:

1. Log in with valid credentials
2. Navigate to Employee Dashboard
3. Verify the profile header card is displayed at the top with:
   - Gradient purple background
   - Avatar overlapping the gradient
   - Name, email, and role badge
   - Department, position, hire date, and employee ID
4. Verify all fields from the database are displayed correctly:
   - Role (from DB)
   - Department name (from DB)
   - Hire date (from DB)
   - Status (from DB)
5. Test responsive design (resize window to test mobile/tablet views)
6. Test error scenarios (invalid token, network issues) - should show warning alert
7. Verify loading state shows "Loading..." text

## Future Enhancements
Possible improvements:
- Edit profile functionality
- Profile picture upload
- Change password from dashboard
- Activity history/recent actions
- Download profile as PDF
- Social media links
- Skills and certifications section
- Performance metrics
- Team information

## Files Modified
1. `src/config/api.js` - Added GET_PROFILE endpoint
2. `src/services/userApi.js` - Added getUserProfile function
3. `src/components/dashboard/EmployeeDashboard.jsx` - Added profile tab and display

## Dependencies
- Material-UI components and icons
- React hooks (useState, useEffect)
- Axios (via userApi service)
- JWT token for authentication

