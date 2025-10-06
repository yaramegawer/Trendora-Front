// Permission utility functions
export const checkPermission = (user, requiredRoles = ['Admin', 'HR']) => {
  if (!user || !user.role) {
    return false;
  }

  // Handle role as object or string
  let userRole = user.role;
  if (typeof userRole === 'object' && userRole !== null) {
    // If role is an object, look for role name in common fields
    userRole = userRole.role || userRole.roleName || userRole.name || userRole.userRole;
  }

  // Debug logging
  ('Permission Debug - User object:', user);
  ('Permission Debug - Raw user.role:', user.role);
  ('Permission Debug - Processed userRole:', userRole);
  ('Permission Debug - Required roles:', requiredRoles);
  ('Permission Debug - Has permission:', requiredRoles.includes(userRole));

  return requiredRoles.includes(userRole);
};

export const canAdd = (user) => checkPermission(user, ['Admin', 'HR']);
export const canEdit = (user) => checkPermission(user, ['Admin', 'HR']);
export const canDelete = (user) => checkPermission(user, ['Admin', 'HR']);
export const canView = (user) => checkPermission(user, ['Admin', 'HR', 'Manager']);

// Leave submission is available to all authenticated employees
export const canSubmitLeave = (user) => {
  return user && user.id; // Just check if user is authenticated
};

// Admin-only operations (project creation, campaign creation)
export const canCreateProjects = (user) => checkPermission(user, ['Admin']);
export const canCreateCampaigns = (user) => checkPermission(user, ['Admin']);

export const getRoleName = (user) => {
  if (!user || !user.role) {
    return 'User';
  }

  // Handle role as object or string
  let userRole = user.role;
  if (typeof userRole === 'object' && userRole !== null) {
    // If role is an object, look for role name in common fields
    userRole = userRole.role || userRole.roleName || userRole.name || userRole.userRole;
  }

  // Debug logging
  ('getRoleName Debug - User object:', user);
  ('getRoleName Debug - Raw user.role:', user.role);
  ('getRoleName Debug - Final role name:', userRole);

  return userRole || 'User';
};

export const showPermissionError = (action, user) => {
  const userRole = getRoleName(user);
  alert(`Access Denied: Only Admin or HR can ${action}. Your role: ${userRole}`);
};