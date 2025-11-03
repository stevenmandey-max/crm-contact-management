import type { User, Contact, ServiceEntry } from '../types';
import { canViewAllData, canAccessContact, canAccessService } from './permissions';

// Filter contacts based on user permissions
export const filterContactsByPermission = (contacts: Contact[], user: User | null): Contact[] => {
  if (!user) return [];
  
  // Admin can see all contacts
  if (canViewAllData(user)) {
    return contacts;
  }
  
  // Editor can only see contacts they created
  return contacts.filter(contact => canAccessContact(user, contact.createdBy));
};

// Filter service entries based on user permissions
export const filterServicesByPermission = (services: ServiceEntry[], user: User | null): ServiceEntry[] => {
  if (!user) return [];
  
  // Admin can see all services
  if (user.role === 'Admin') {
    return services;
  }
  
  // Editor can only see their own services
  return services.filter(service => canAccessService(user, service.userId));
};

// Filter service sessions based on user permissions
export const filterServiceSessionsByPermission = (sessions: any[], user: User | null): any[] => {
  if (!user) return [];
  
  // Admin can see all sessions
  if (user.role === 'Admin') {
    return sessions;
  }
  
  // Editor can only see their own sessions
  return sessions.filter(session => session.userId === user.username);
};

// Get contacts that user can access for dropdowns/selects
export const getAccessibleContacts = (contacts: Contact[], user: User | null): Contact[] => {
  return filterContactsByPermission(contacts, user);
};

// Get users that current user can see in filters (for Admin only)
export const getAccessibleUsers = (users: User[], currentUser: User | null): User[] => {
  if (!currentUser) return [];
  
  // Admin can see all users
  if (currentUser.role === 'Admin') {
    return users;
  }
  
  // Editor can only see themselves
  return users.filter(user => user.username === currentUser.username);
};

// Check if user should see "All Users" option in filters
export const shouldShowAllUsersOption = (user: User | null): boolean => {
  return user?.role === 'Admin';
};

// Get default user filter for current user
export const getDefaultUserFilter = (user: User | null): string => {
  if (!user) return 'all';
  
  // Admin defaults to 'all'
  if (user.role === 'Admin') {
    return 'all';
  }
  
  // Editor defaults to their own username
  return user.username;
};

// Filter dashboard data based on user permissions
export const filterDashboardData = (data: any, user: User | null) => {
  if (!user) return data;
  
  // Admin sees all data
  if (user.role === 'Admin') {
    return data;
  }
  
  // Editor sees filtered data
  return {
    ...data,
    // Filter any arrays in dashboard data
    contacts: data.contacts ? filterContactsByPermission(data.contacts, user) : [],
    services: data.services ? filterServicesByPermission(data.services, user) : [],
    sessions: data.sessions ? filterServiceSessionsByPermission(data.sessions, user) : []
  };
};

// Get export filename with user context
export const getExportFilename = (baseFilename: string, user: User | null): string => {
  if (!user) return baseFilename;
  
  // Admin gets standard filename
  if (user.role === 'Admin') {
    return baseFilename;
  }
  
  // Editor gets filename with their username
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseFilename}_${user.username}_${timestamp}`;
};

// Check if user can see specific data in reports
export const canViewReportData = (user: User | null, dataOwnerId?: string): boolean => {
  if (!user) return false;
  
  // Admin can see all data
  if (user.role === 'Admin') return true;
  
  // Editor can only see their own data
  if (dataOwnerId) {
    return user.username === dataOwnerId;
  }
  
  return false;
};