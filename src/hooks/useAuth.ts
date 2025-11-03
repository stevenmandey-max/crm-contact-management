import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../types';

// Main auth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Permission hooks
export const usePermissions = () => {
  const { hasPermission, canManageUsers, canManageContacts, canExportData } = useAuth();
  
  return {
    hasPermission,
    canManageUsers: canManageUsers(),
    canManageContacts: canManageContacts(),
    canExportData: canExportData(),
    isAdmin: hasPermission('Admin'),
    isEditor: hasPermission('Editor')
  };
};

// User info hook
export const useCurrentUser = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  return {
    user: currentUser,
    isAuthenticated,
    userId: currentUser?.id,
    username: currentUser?.username,
    role: currentUser?.role,
    isAdmin: currentUser?.role === 'Admin',
    isEditor: currentUser?.role === 'Editor'
  };
};

// Auth actions hook
export const useAuthActions = () => {
  const { login, logout, clearError } = useAuth();
  
  return {
    login,
    logout,
    clearError
  };
};

// Auth state hook
export const useAuthState = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    error,
    hasError: !!error
  };
};