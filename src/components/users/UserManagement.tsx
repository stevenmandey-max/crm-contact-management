import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '../../types';
import { localStorageService } from '../../services/localStorage';
import { generateId } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { LogoUploader } from '../branding/LogoUploader';
import './UserManagement.css';

interface UserFormData {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'branding'>('users');
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Editor'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, hasPermission } = useAuth();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = localStorageService.getUsers();
    setUsers(allUsers);
  };

  const handleClearDemoData = () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to clear all demo data?\n\n' +
      'This will remove:\n' +
      '• All demo contacts\n' +
      '• All service data\n' +
      '• All demo history\n\n' +
      'Users and settings will be preserved.\n\n' +
      'This action cannot be undone!'
    );

    if (confirmed) {
      try {
        // Clear demo data using localStorage service
        localStorageService.clearDemoData();
        
        // Show success message
        alert('✅ Demo data cleared successfully!\n\nThe application now starts with clean data for testing.');
        
        // Refresh the page to reflect changes
        window.location.reload();
      } catch (error) {
        console.error('Error clearing demo data:', error);
        alert('❌ Error clearing demo data. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'Editor'
    });
    setErrors({});
    setEditingUser(null);
    setShowAddForm(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else {
      // Check for duplicate username (except when editing)
      const existingUser = users.find(u => 
        u.username.toLowerCase() === formData.username.toLowerCase() && 
        u.id !== editingUser?.id
      );
      if (existingUser) {
        newErrors.username = 'Username already exists';
      }
    }

    // Password validation (only for new users or when changing password)
    if (!editingUser || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 4) {
        newErrors.password = 'Password must be at least 4 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser: User = {
          ...editingUser,
          username: formData.username.trim(),
          role: formData.role
        };

        localStorageService.updateUser(editingUser.id, updatedUser);
        
        // Update password if provided
        if (formData.password) {
          localStorageService.addUserCredential(formData.username.trim(), formData.password);
        }
      } else {
        // Create new user
        const newUser: User = {
          id: generateId(),
          username: formData.username.trim(),
          role: formData.role,
          createdAt: new Date()
        };

        localStorageService.addUser(newUser);
        
        // Add user credentials
        localStorageService.addUserCredential(formData.username.trim(), formData.password);
      }

      loadUsers();
      resetForm();
      
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      role: user.role
    });
    setShowAddForm(true);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      try {
        localStorageService.deleteUser(user.id);
        localStorageService.removeUserCredential(user.username);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (!hasPermission('Admin')) {
    return (
      <div className="user-management-unauthorized">
        <h2>Access Denied</h2>
        <p>Only administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-left">
          <h2>Admin Panel</h2>
          <p>Manage users, settings, and branding</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span>👥</span>
          User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          <span>🎨</span>
          Logo & Branding
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="section-header">
            <div className="header-left">
              <h3>User Management</h3>
              <p>Manage user accounts and permissions</p>
            </div>
            
            <div className="header-actions">
              <button
                onClick={handleClearDemoData}
                className="btn btn-warning"
                title="Clear all demo data for clean testing"
              >
                <span>🧹</span>
                Clear Demo Data
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
                disabled={showAddForm}
              >
                <span>➕</span>
                Add New User
              </button>
            </div>
          </div>

      {showAddForm && (
        <div className="user-form-container">
          <div className="user-form-header">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <button
              onClick={resetForm}
              className="close-btn"
              type="button"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username <span className="required">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter username"
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Role <span className="required">*</span>
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                  className={`form-select ${errors.role ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <span className="error-message">{errors.role}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'} 
                  {!editingUser && <span className="required">*</span>}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                  {(!editingUser || formData.password) && <span className="required">*</span>}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="button-spinner"></span>
                    {editingUser ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingUser ? 'Update User' : 'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-list">
        <div className="users-stats">
          <span>Total Users: {users.length}</span>
          <span>Admins: {users.filter(u => u.role === 'Admin').length}</span>
          <span>Editors: {users.filter(u => u.role === 'Editor').length}</span>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={user.id === currentUser?.id ? 'current-user' : ''}>
                  <td className="user-username">
                    <div className="username-with-indicator">
                      <strong>{user.username}</strong>
                      {user.id === currentUser?.id && (
                        <span className="current-user-badge">You</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="user-created">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="user-actions">
                    <button
                      onClick={() => handleEdit(user)}
                      className="action-btn edit-btn"
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="action-btn delete-btn"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="tab-content">
          <div className="section-header">
            <div className="header-left">
              <h3>Logo & Branding</h3>
              <p>Customize your application's logo and branding</p>
            </div>
          </div>

          <LogoUploader 
            showPreview={true}
            onLogoUpdate={(config) => {
              console.log('Logo updated:', config);
            }}
          />
        </div>
      )}
    </div>
  );
};