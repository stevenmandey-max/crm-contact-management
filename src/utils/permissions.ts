import type { User, UserRole } from '../types';

// Permission constants
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTACTS: 'manage_contacts',
  EXPORT_DATA: 'export_data',
  DELETE_CONTACTS: 'delete_contacts',
  VIEW_ALL_CONTACTS: 'view_all_contacts',
  VIEW_OWN_CONTACTS: 'view_own_contacts',
  EXPORT_ALL_DATA: 'export_all_data',
  EXPORT_OWN_DATA: 'export_own_data',
  VIEW_ALL_SERVICES: 'view_all_services',
  VIEW_OWN_SERVICES: 'view_own_services',
  EDIT_SETTINGS: 'edit_settings'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CONTACTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.EXPORT_ALL_DATA,
    PERMISSIONS.DELETE_CONTACTS,
    PERMISSIONS.VIEW_ALL_CONTACTS,
    PERMISSIONS.VIEW_ALL_SERVICES,
    PERMISSIONS.EDIT_SETTINGS
  ],
  Editor: [
    PERMISSIONS.MANAGE_CONTACTS,
    PERMISSIONS.EXPORT_OWN_DATA,
    PERMISSIONS.VIEW_OWN_CONTACTS,
    PERMISSIONS.VIEW_OWN_SERVICES
  ]
};

// Check if user has specific permission
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.some(permission => hasPermission(user, permission));
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.every(permission => hasPermission(user, permission));
};

// Get all permissions for a user
export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role];
};

// Check if user can perform specific actions
export const canManageUsers = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.MANAGE_USERS);
};

export const canManageContacts = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.MANAGE_CONTACTS);
};

export const canExportData = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.EXPORT_DATA);
};

export const canDeleteContacts = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.DELETE_CONTACTS);
};

export const canViewAllContacts = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_ALL_CONTACTS);
};

export const canEditSettings = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.EDIT_SETTINGS);
};

// Check if user can access specific contact
export const canAccessContact = (user: User | null, contactCreatedBy: string): boolean => {
  if (!user) return false;
  
  // Admin can access all contacts
  if (user.role === 'Admin') return true;
  
  // Editor can only access contacts they created
  if (user.role === 'Editor') return user.username === contactCreatedBy;
  
  return false;
};

// Check if user can edit specific contact
export const canEditContact = (user: User | null, contactCreatedBy: string): boolean => {
  if (!user) return false;
  
  // Admin can edit all contacts
  if (user.role === 'Admin') return true;
  
  // Editor can only edit contacts they created
  if (user.role === 'Editor') return user.username === contactCreatedBy;
  
  return false;
};

// Check if user can access specific service record
export const canAccessService = (user: User | null, serviceUserId: string): boolean => {
  if (!user) return false;
  
  // Admin can access all service records
  if (user.role === 'Admin') return true;
  
  // Editor can only access their own service records
  if (user.role === 'Editor') return user.username === serviceUserId;
  
  return false;
};

// Check if user can view all data or only own data
export const canViewAllData = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_ALL_CONTACTS);
};

export const canViewOwnDataOnly = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_OWN_CONTACTS) && !hasPermission(user, PERMISSIONS.VIEW_ALL_CONTACTS);
};

// Check export permissions
export const canExportAllData = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.EXPORT_ALL_DATA);
};

export const canExportOwnDataOnly = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.EXPORT_OWN_DATA) && !hasPermission(user, PERMISSIONS.EXPORT_ALL_DATA);
};

// Get user role display information
export const getRoleInfo = (role: UserRole) => {
  const roleInfo = {
    Admin: {
      displayName: 'Administrator',
      description: 'Full access to all system features',
      color: '#e74c3c',
      permissions: ROLE_PERMISSIONS.Admin
    },
    Editor: {
      displayName: 'Editor',
      description: 'Can manage own contacts and export own data only',
      color: '#3498db',
      permissions: ROLE_PERMISSIONS.Editor
    }
  };
  
  return roleInfo[role];
};

// Validate if role transition is allowed
export const canChangeRole = (currentUserRole: UserRole, _targetRole: UserRole): boolean => {
  // Only Admin can change roles
  if (currentUserRole !== 'Admin') return false;
  
  // Admin can change to any role
  return true;
};