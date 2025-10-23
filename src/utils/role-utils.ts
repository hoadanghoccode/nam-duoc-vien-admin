// Utility functions for role checking

export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  return userRoles.includes(requiredRole);
};

export const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

export const hasAllRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.every(role => userRoles.includes(role));
};

// Common role names
export const ROLES = {
  ADMIN: "Admin",
  USER: "User",
  DOCTOR: "Doctor",
} as const;

