import type { User } from '../types';
import { localStorageService } from './localStorage';

class AuthService {
  // Simple authentication for prototype - in production this would be more secure
  async login(username: string, password: string): Promise<User | null> {
    const users = localStorageService.getUsers();
    
    // Check against stored users with their passwords
    const userCredentials = localStorageService.getUserCredentials();
    
    const isValidCredential = userCredentials.some(
      cred => cred.username === username && cred.password === password
    );
    
    if (isValidCredential) {
      const user = users.find(u => u.username === username);
      if (user) {
        localStorageService.setCurrentUser(user);
        return user;
      }
    }
    
    return null;
  }

  logout(): void {
    localStorageService.setCurrentUser(null);
  }

  getCurrentUser(): User | null {
    return localStorageService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasPermission(requiredRole: 'Admin' | 'Editor'): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    // Admin has all permissions, Editor has limited permissions
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Editor' && requiredRole === 'Editor') return true;
    
    return false;
  }

  canManageUsers(): boolean {
    return this.hasPermission('Admin');
  }

  canManageContacts(): boolean {
    return this.hasPermission('Editor'); // Both Admin and Editor can manage contacts
  }

  canExportData(): boolean {
    return this.hasPermission('Editor'); // Both Admin and Editor can export
  }
}

export const authService = new AuthService();