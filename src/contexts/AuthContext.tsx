import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { authService } from '../services/auth';

// Auth state interface
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: currentUser });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const user = await authService.login(username, password);
      
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Username atau password salah' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login gagal';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still dispatch logout to clear state
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check permissions
  const hasPermission = (requiredRole: 'Admin' | 'Editor'): boolean => {
    return authService.hasPermission(requiredRole);
  };

  const canManageUsers = (): boolean => {
    return authService.canManageUsers();
  };

  const canManageContacts = (): boolean => {
    return authService.canManageContacts();
  };

  const canExportData = (): boolean => {
    return authService.canExportData();
  };

  // Context value
  const contextValue: AuthContextType = {
    currentUser: state.currentUser,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    // Additional properties for enhanced functionality
    isLoading: state.isLoading,
    error: state.error,
    clearError,
    hasPermission,
    canManageUsers,
    canManageContacts,
    canExportData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Note: useAuth hook is now in hooks/useAuth.ts to avoid circular dependencies

// HOC for protected components
// HOCs are now available in ProtectedRoute.tsx to avoid circular dependencies