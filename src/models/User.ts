import type { User, UserRole } from '../types';
import { generateId } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

export class UserModel implements User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;

  constructor(
    username: string,
    role: UserRole,
    id?: string,
    createdAt?: Date
  ) {
    this.id = id || generateId();
    this.username = username.trim().toLowerCase();
    this.role = role;
    this.createdAt = createdAt || new Date();
  }

  // Static method to validate user data
  static validate(userData: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.username || userData.username.trim() === '') {
      errors.push('Username is required');
    } else if (userData.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (userData.username.length > 20) {
      errors.push('Username must be less than 20 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (!userData.role) {
      errors.push('Role is required');
    } else if (!Object.values(USER_ROLES).includes(userData.role as UserRole)) {
      errors.push('Invalid role. Must be Admin or Editor');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Static method to create from plain object
  static fromObject(obj: any): UserModel {
    return new UserModel(
      obj.username,
      obj.role,
      obj.id,
      obj.createdAt ? new Date(obj.createdAt) : undefined
    );
  }

  // Static method to create from JSON string
  static fromJSON(json: string): UserModel {
    try {
      const obj = JSON.parse(json);
      return UserModel.fromObject(obj);
    } catch (error) {
      throw new Error('Invalid JSON format for User');
    }
  }

  // Instance method to validate this user
  validate(): { isValid: boolean; errors: string[] } {
    return UserModel.validate(this);
  }

  // Check if user has specific permission
  hasPermission(requiredRole: UserRole): boolean {
    // Admin has all permissions
    if (this.role === USER_ROLES.ADMIN) return true;

    // Editor has limited permissions
    if (this.role === USER_ROLES.EDITOR && requiredRole === USER_ROLES.EDITOR) return true;

    return false;
  }

  // Check specific permissions
  canManageUsers(): boolean {
    return this.role === USER_ROLES.ADMIN;
  }

  canManageContacts(): boolean {
    return this.role === USER_ROLES.ADMIN || this.role === USER_ROLES.EDITOR;
  }

  canExportData(): boolean {
    return this.role === USER_ROLES.ADMIN || this.role === USER_ROLES.EDITOR;
  }

  canDeleteContacts(): boolean {
    return this.role === USER_ROLES.ADMIN;
  }

  // Get user display name
  getDisplayName(): string {
    return this.username.charAt(0).toUpperCase() + this.username.slice(1);
  }

  // Get role display name
  getRoleDisplayName(): string {
    return this.role === USER_ROLES.ADMIN ? 'Administrator' : 'Editor';
  }

  // Convert to plain object
  toObject(): User {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      createdAt: this.createdAt
    };
  }

  // Convert to JSON string
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  // Check if user account is new (created within last 7 days)
  isNewUser(): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }
}

// Factory functions for creating users
export const createUser = (username: string, role: UserRole): UserModel => {
  return new UserModel(username, role);
};

export const createUserFromData = (data: Partial<User>): UserModel | null => {
  const validation = UserModel.validate(data);
  if (!validation.isValid) {
    return null;
  }

  return new UserModel(
    data.username!,
    data.role!,
    data.id,
    data.createdAt
  );
};

// Helper function to check if username is available
export const isUsernameAvailable = (username: string, existingUsers: User[], excludeUserId?: string): boolean => {
  return !existingUsers.some(user =>
    user.username.toLowerCase() === username.toLowerCase() &&
    user.id !== excludeUserId
  );
};