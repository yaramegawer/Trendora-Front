/**
 * Department authorization utility functions
 */

// Department ID to name mapping based on your database
const DEPARTMENT_ID_MAP = {
  '68da376594328b3a175633a7': 'IT',
  '68da377194328b3a175633ad': 'HR',
  '68da378594328b3a175633b3': 'Operation',
  '68da378d94328b3a175633b9': 'Sales',
  '68da379894328b3a175633bf': 'Accounting',
  '68da6e0813fe176e91aefd59': 'Digital Marketing'
};

/**
 * Get user's department from their role or user data
 * @param {Object} user - User object from AuthContext
 * @returns {string} Department name
 */
export const getUserDepartment = (user) => {
  
  if (!user) return null;
  
  // Check if department is directly stored in user object
  if (user.department) {
    // If department is an ID, map it to name
    if (DEPARTMENT_ID_MAP[user.department]) {
      return DEPARTMENT_ID_MAP[user.department];
    }
    // If department is already a name, return it
    return user.department;
  }
  
  return null;
};

/**
 * Check if user is authorized to access a specific department
 * @param {Object} user - User object from AuthContext
 * @param {string} targetDepartment - Department the user is trying to access
 * @returns {Object} Authorization result with isAuthorized and errorMessage
 */
export const checkDepartmentAccess = (user, targetDepartment) => {
  if (!user) {
    return {
      isAuthorized: false,
      errorMessage: 'You must be logged in to access this department.',
      redirectTo: '/login'
    };
  }
  
  const userDepartment = getUserDepartment(user);
  
  // Only Admin users can access any department
  // Managers are restricted to their own department
  if (user.role === 'Admin' || userDepartment === 'Admin') {
    return {
      isAuthorized: true,
      errorMessage: null,
      redirectTo: null
    };
  }
  
  // Check if user's department matches target department
  if (!userDepartment) {
    return {
      isAuthorized: false,
      errorMessage: 'Unable to determine your department from token. Please contact support.',
      redirectTo: '/dashboard'
    };
  }
  
  if (userDepartment !== targetDepartment) {
    return {
      isAuthorized: false,
      errorMessage: `You are not authorized to access the ${targetDepartment} department. You can only access the ${userDepartment} department.`,
      redirectTo: '/dashboard'
    };
  }
  
  return {
    isAuthorized: true,
    errorMessage: null,
    redirectTo: null
  };
};

/**
 * Department access denied component
 * @param {string} message - Error message to display
 * @param {string} redirectTo - Where to redirect the user
 */
export const DepartmentAccessDenied = ({ message, redirectTo }) => {
  const handleRedirect = () => {
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.history.back();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f9fafb',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          🚫
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#dc2626',
          marginBottom: '16px',
          margin: 0
        }}>
          Access Denied
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.5',
          margin: '0 0 32px 0'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleRedirect}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1c242e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
          >
            {redirectTo === '/login' ? 'Go to Login' : 'Go Back'}
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
