import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Login } from './Login';
import type { UserRole } from '../../types';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('ProtectedRoute must be used within an AuthProvider');
  }
  
  const { isAuthenticated, isLoading, hasPermission, currentUser } = context;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return fallback || <Login />;
  }

  // Check role-based permissions if required
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>
            You don't have permission to access this page.
          </p>
          <p>
            Required role: <strong>{requiredRole}</strong>
          </p>
          <p>
            Your role: <strong>{currentUser?.role}</strong>
          </p>
          <div className="access-denied-actions">
            <button 
              onClick={() => window.history.back()}
              className="back-button"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

// Higher-order component version
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) => {
  return (props: P) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Role-specific protected route components
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="Admin">
    {children}
  </ProtectedRoute>
);

export const EditorRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="Editor">
    {children}
  </ProtectedRoute>
);

// Component for checking multiple permissions
interface MultiPermissionRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  requireAll?: boolean; // If true, user must have ALL roles (not applicable for single user)
}

export const MultiPermissionRoute: React.FC<MultiPermissionRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('MultiPermissionRoute must be used within an AuthProvider');
  }
  
  const { isAuthenticated, isLoading, currentUser } = context;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Check if user's role is in allowed roles
  const hasAccess = currentUser && allowedRoles.includes(currentUser.role);

  if (!hasAccess) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>
            Allowed roles: <strong>{allowedRoles.join(', ')}</strong>
          </p>
          <p>
            Your role: <strong>{currentUser?.role}</strong>
          </p>
          <div className="access-denied-actions">
            <button 
              onClick={() => window.history.back()}
              className="back-button"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};