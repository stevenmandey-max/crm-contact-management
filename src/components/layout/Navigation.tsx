import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ExportButton } from '../export/ExportButton';
import { localStorageService } from '../../services/localStorage';
import { Logo } from '../branding/Logo';
import './Navigation.css';

interface NavigationProps {
  currentView: 'dashboard' | 'contacts' | 'add-contact' | 'service-tracking' | 'users';
  onViewChange: (view: 'dashboard' | 'contacts' | 'add-contact' | 'service-tracking' | 'users') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange
}) => {
  const { currentUser, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      view: 'dashboard' as const
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: '👥',
      view: 'contacts' as const
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: '➕',
      view: 'add-contact' as const
    },
    {
      id: 'service-tracking',
      label: 'Service Tracking',
      icon: '📊',
      view: 'service-tracking' as const
    },

    ...(hasPermission('Admin') ? [{
      id: 'users',
      label: 'User Management',
      icon: '👤',
      view: 'users' as const
    }] : [])
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <Logo variant="header" size="auto" alt="Hopeline Care Logo" />
          <div className="nav-logo-text">
            <h1>Hopeline Care</h1>
            <span>Contact Management</span>
          </div>
        </div>
      </div>

      <div className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.view)}
            className={`nav-item ${currentView === item.view ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-user">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{currentUser?.username}</div>
            <div className="user-role">{currentUser?.role}</div>
          </div>
        </div>

        <div className="user-permissions">
          <div className="permission-item">
            <span className="permission-label">Manage Contacts:</span>
            <span className={`permission-status ${hasPermission('Editor') ? 'allowed' : 'denied'}`}>
              {hasPermission('Editor') ? '✅' : '❌'}
            </span>
          </div>
          <div className="permission-item">
            <span className="permission-label">Manage Users:</span>
            <span className={`permission-status ${hasPermission('Admin') ? 'allowed' : 'denied'}`}>
              {hasPermission('Admin') ? '✅' : '❌'}
            </span>
          </div>
        </div>

        <div className="nav-export">
          <ExportButton 
            contacts={localStorageService.getContacts()}
            variant="secondary"
            size="small"
          />
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <span>🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};