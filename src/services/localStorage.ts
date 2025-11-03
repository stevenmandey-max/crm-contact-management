import type { Contact, User, StorageSchema, AppSettings } from '../types';
import { STORAGE_KEYS, STORAGE_VERSION, CONTACT_STATUSES } from '../utils/constants';
import { ContactModel } from '../models/Contact';
import { demoContacts } from '../data/demoContacts';

class LocalStorageService {
  private getStorageData<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      const parsed = JSON.parse(item);

      // Convert date strings back to Date objects for contacts
      if (key === STORAGE_KEYS.CONTACTS && Array.isArray(parsed)) {
        return parsed.map((contact: any) => ({
          ...contact,
          createdAt: new Date(contact.createdAt),
          updatedAt: new Date(contact.updatedAt),
          history: contact.history ? contact.history.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })) : []
        })) as T;
      }

      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return defaultValue;
    }
  }

  private setStorageData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      throw new Error('Storage quota exceeded or storage unavailable');
    }
  }

  // Contact operations
  getContacts(): Contact[] {
    const contacts = this.getStorageData(STORAGE_KEYS.CONTACTS, []);

    // Demo data auto-load disabled for clean testing
    // To enable demo data, call initializeDemoData() manually
    // if (contacts.length === 0) {
    //   this.initializeDemoData();
    //   return this.getStorageData(STORAGE_KEYS.CONTACTS, []);
    // }

    // Migrate old contacts to new format
    return contacts.map((contact: any) => ({
      ...contact,
      nomorTelepon: contact.nomorTelepon || '',
      jenisKelamin: contact.jenisKelamin || 'Laki-laki',
      provinsi: contact.provinsi || contact.kotaKabupaten || '', // Migrate kotaKabupaten to provinsi
      sumber: contact.sumber || 'Lainnya', // Default sumber for migrated contacts
      prioritas: contact.prioritas || 'Sedang',
      history: contact.history || [{
        id: 'migration-' + Date.now(),
        timestamp: contact.createdAt || new Date(),
        action: 'created' as const,
        updatedBy: contact.createdBy || 'system',
        notes: 'Contact migrated to new format'
      }]
    }));
  }

  saveContacts(contacts: Contact[]): void {
    this.setStorageData(STORAGE_KEYS.CONTACTS, contacts);
  }

  addContact(contact: Contact): void {
    const contacts = this.getContacts();
    contacts.push(contact);
    this.saveContacts(contacts);
  }

  updateContact(contactId: string, updatedContact: Partial<Contact>): void {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === contactId);

    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...updatedContact,
        updatedAt: new Date()
      };
      this.saveContacts(contacts);
    }
  }

  // New method to update contact with history tracking
  updateContactWithHistory(contactId: string, updates: Partial<Contact>, updatedBy: string): void {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === contactId);

    if (index !== -1) {
      const contact = contacts[index];

      // Create ContactModel instance to use the update method with history tracking
      const contactModel = ContactModel.fromObject(contact);
      contactModel.update(updates, updatedBy);

      // Update the contact in the array
      contacts[index] = contactModel.toObject();
      this.saveContacts(contacts);
    }
  }

  deleteContact(contactId: string): void {
    const contacts = this.getContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    this.saveContacts(filteredContacts);
  }

  // User operations
  getUsers(): User[] {
    return this.getStorageData(STORAGE_KEYS.USERS, this.getDefaultUsers());
  }

  saveUsers(users: User[]): void {
    this.setStorageData(STORAGE_KEYS.USERS, users);
  }

  getCurrentUser(): User | null {
    return this.getStorageData(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    this.setStorageData(STORAGE_KEYS.CURRENT_USER, user);
  }

  // User credentials management (for demo purposes - in production use proper authentication)
  getUserCredentials(): Array<{ username: string, password: string }> {
    return this.getStorageData('user_credentials', [
      { username: 'admin', password: 'admin123' },
      { username: 'editor', password: 'editor123' }
    ]);
  }

  saveUserCredentials(credentials: Array<{ username: string, password: string }>): void {
    this.setStorageData('user_credentials', credentials);
  }

  addUserCredential(username: string, password: string): void {
    const credentials = this.getUserCredentials();
    const existingIndex = credentials.findIndex(c => c.username === username);

    if (existingIndex !== -1) {
      // Update existing credential
      credentials[existingIndex].password = password;
    } else {
      // Add new credential
      credentials.push({ username, password });
    }

    this.saveUserCredentials(credentials);
  }

  removeUserCredential(username: string): void {
    const credentials = this.getUserCredentials();
    const filteredCredentials = credentials.filter(c => c.username !== username);
    this.saveUserCredentials(filteredCredentials);
  }

  // Settings operations
  getSettings(): AppSettings {
    return this.getStorageData(STORAGE_KEYS.SETTINGS, this.getDefaultSettings());
  }

  saveSettings(settings: AppSettings): void {
    this.setStorageData(STORAGE_KEYS.SETTINGS, settings);
  }

  // Initialize default data
  private getDefaultUsers(): User[] {
    return [
      {
        id: 'admin-1',
        username: 'admin',
        role: 'Admin',
        createdAt: new Date()
      },
      {
        id: 'editor-1',
        username: 'editor',
        role: 'Editor',
        createdAt: new Date()
      }
    ];
  }

  private getDefaultSettings(): AppSettings {
    return {
      contactStatuses: CONTACT_STATUSES,
      exportFormats: ['csv', 'excel'],
      defaultFilters: {}
    };
  }

  // Storage management
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Approximate localStorage limit (5MB for most browsers)
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  // Initialize demo data
  private initializeDemoData(): void {
    console.log('Initializing demo contacts with WhatsApp numbers...');
    this.saveContacts(demoContacts);

    // Also initialize demo service data
    import('./serviceStorage').then(({ serviceStorage }) => {
      serviceStorage.initializeDemoServiceData();
    });
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Clear only contact data (keep users and settings)
  clearContactData(): void {
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    console.log('✅ Contact data cleared');
  }

  // Clear all demo data and start fresh
  clearDemoData(): void {
    this.clearContactData();
    // Also clear service data if exists
    localStorage.removeItem('crm_services');
    localStorage.removeItem('crm_service_sessions');
    console.log('✅ All demo data cleared');
  }

  // Force load demo data (for testing purposes)
  loadDemoData(): void {
    this.initializeDemoData();
    console.log('✅ Demo data loaded');
  }

  // Enhanced contact operations
  getContactById(contactId: string): Contact | null {
    const contacts = this.getContacts();
    return contacts.find(c => c.id === contactId) || null;
  }

  getContactsByUser(userId: string): Contact[] {
    const contacts = this.getContacts();
    return contacts.filter(c => c.createdBy === userId);
  }

  getContactsByStatus(status: string): Contact[] {
    const contacts = this.getContacts();
    return contacts.filter(c => c.statusKontak === status);
  }

  getContactsCount(): number {
    return this.getContacts().length;
  }

  // Enhanced user operations
  getUserById(userId: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  updateUser(userId: string, updatedUser: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      this.saveUsers(users);
    }
  }

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
  }

  // Storage health check
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  getStorageInfo(): {
    isAvailable: boolean;
    usage: { used: number; total: number; percentage: number };
    contactsCount: number;
    usersCount: number;
  } {
    return {
      isAvailable: this.isStorageAvailable(),
      usage: this.getStorageUsage(),
      contactsCount: this.getContactsCount(),
      usersCount: this.getUsers().length
    };
  }

  // Data validation and cleanup
  validateStorageData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate contacts
      const contacts = this.getContacts();
      contacts.forEach((contact, index) => {
        if (!contact.id || !contact.nama || !contact.alamat || !contact.agama ||
          !contact.alasanMenghubungi || !contact.statusKontak) {
          errors.push(`Contact at index ${index} is missing required fields`);
        }
      });

      // Validate users
      const users = this.getUsers();
      users.forEach((user, index) => {
        if (!user.id || !user.username || !user.role) {
          errors.push(`User at index ${index} is missing required fields`);
        }
      });

      // Validate settings
      const settings = this.getSettings();
      if (!settings.contactStatuses || !Array.isArray(settings.contactStatuses)) {
        errors.push('Settings contactStatuses is invalid');
      }

    } catch (error) {
      errors.push(`Storage validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Initialize storage with default data if empty
  initializeStorage(): void {
    if (this.getContacts().length === 0) {
      // Add some sample contacts for demo
      const sampleContacts: Contact[] = [
        {
          id: 'sample-1',
          createdAt: new Date(),
          nama: 'John Doe',
          nomorTelepon: '081234567890',
          jenisKelamin: 'Laki-laki',
          alamat: 'Jl. Contoh No. 123, Jakarta',
          provinsi: 'DKI Jakarta',
          agama: 'Islam',
          alasanMenghubungi: 'Konsultasi produk',
          sumber: 'Website',
          prioritas: 'Tinggi',
          statusKontak: 'New Contact',
          updatedAt: new Date(),
          createdBy: 'admin-1',
          history: [{
            id: 'hist-1',
            timestamp: new Date(),
            action: 'created',
            updatedBy: 'admin-1',
            notes: 'Contact created'
          }]
        },
        {
          id: 'sample-2',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          nama: 'Jane Smith',
          nomorTelepon: '087654321098',
          jenisKelamin: 'Perempuan',
          alamat: 'Jl. Sample No. 456, Bandung',
          provinsi: 'Jawa Barat',
          agama: 'Kristen',
          alasanMenghubungi: 'Keluhan layanan',
          sumber: 'Facebook',
          prioritas: 'Urgent',
          statusKontak: 'In Progress',
          updatedAt: new Date(Date.now() - 86400000),
          createdBy: 'editor-1',
          history: [{
            id: 'hist-2',
            timestamp: new Date(Date.now() - 86400000),
            action: 'created',
            updatedBy: 'editor-1',
            notes: 'Contact created'
          }]
        }
      ];

      this.saveContacts(sampleContacts);
    }

    // Ensure users exist
    if (this.getUsers().length === 0) {
      this.saveUsers(this.getDefaultUsers());
    }

    // Ensure settings exist
    const settings = this.getSettings();
    if (!settings.contactStatuses) {
      this.saveSettings(this.getDefaultSettings());
    }
  }

  // Enhanced backup and restore
  exportBackup(): string {
    const backup: StorageSchema = {
      contacts: this.getContacts(),
      users: this.getUsers(),
      settings: this.getSettings(),
      version: STORAGE_VERSION
    };

    return JSON.stringify(backup, null, 2);
  }

  exportBackupFile(): void {
    try {
      const backupData = this.exportBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `crm-backup-${timestamp}.json`;

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to export backup file');
    }
  }

  importBackup(backupData: string): { success: boolean; message: string; warnings: string[] } {
    const warnings: string[] = [];

    try {
      const backup: StorageSchema = JSON.parse(backupData);

      // Version check
      if (backup.version !== STORAGE_VERSION) {
        warnings.push(`Backup version (${backup.version}) differs from current version (${STORAGE_VERSION})`);
      }

      // Validate backup data structure
      if (!backup.contacts || !Array.isArray(backup.contacts)) {
        throw new Error('Invalid backup: contacts data is missing or invalid');
      }

      if (!backup.users || !Array.isArray(backup.users)) {
        throw new Error('Invalid backup: users data is missing or invalid');
      }

      if (!backup.settings || typeof backup.settings !== 'object') {
        throw new Error('Invalid backup: settings data is missing or invalid');
      }

      // Create backup of current data before importing
      const currentBackup = this.exportBackup();
      this.setStorageData('__recovery_backup__', currentBackup);

      // Import new data
      this.saveContacts(backup.contacts);
      this.saveUsers(backup.users);
      this.saveSettings(backup.settings);

      // Validate imported data
      const validation = this.validateStorageData();
      if (!validation.isValid) {
        warnings.push('Some imported data may be invalid: ' + validation.errors.join(', '));
      }

      return {
        success: true,
        message: 'Backup imported successfully',
        warnings
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during backup import',
        warnings
      };
    }
  }

  importBackupFromFile(file: File): Promise<{ success: boolean; message: string; warnings: string[] }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const backupData = event.target?.result as string;
          const result = this.importBackup(backupData);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            message: 'Failed to read backup file',
            warnings: []
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Error reading backup file',
          warnings: []
        });
      };

      reader.readAsText(file);
    });
  }

  // Recovery functions
  hasRecoveryBackup(): boolean {
    try {
      const recoveryData = localStorage.getItem('__recovery_backup__');
      return recoveryData !== null;
    } catch (error) {
      return false;
    }
  }

  restoreFromRecovery(): { success: boolean; message: string } {
    try {
      const recoveryData = localStorage.getItem('__recovery_backup__');
      if (!recoveryData) {
        return {
          success: false,
          message: 'No recovery backup available'
        };
      }

      const result = this.importBackup(recoveryData);
      if (result.success) {
        localStorage.removeItem('__recovery_backup__');
        return {
          success: true,
          message: 'Data restored from recovery backup'
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restore from recovery backup'
      };
    }
  }

  clearRecoveryBackup(): void {
    localStorage.removeItem('__recovery_backup__');
  }

  // Data corruption detection and repair
  detectCorruption(): { isCorrupted: boolean; issues: string[] } {
    const issues: string[] = [];

    try {
      // Check if localStorage is accessible
      if (!this.isStorageAvailable()) {
        issues.push('LocalStorage is not available');
      }

      // Check data integrity
      const validation = this.validateStorageData();
      if (!validation.isValid) {
        issues.push(...validation.errors);
      }

      // Check for missing critical data
      const contacts = this.getContacts();
      const users = this.getUsers();
      const settings = this.getSettings();

      if (!Array.isArray(contacts)) {
        issues.push('Contacts data is corrupted');
      }

      if (!Array.isArray(users) || users.length === 0) {
        issues.push('Users data is missing or corrupted');
      }

      if (!settings || !settings.contactStatuses) {
        issues.push('Settings data is corrupted');
      }

    } catch (error) {
      issues.push(`Data corruption detected: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isCorrupted: issues.length > 0,
      issues
    };
  }

  repairCorruption(): { success: boolean; message: string; actionsPerformed: string[] } {
    const actionsPerformed: string[] = [];

    try {
      // Try to restore from recovery backup first
      if (this.hasRecoveryBackup()) {
        const recoveryResult = this.restoreFromRecovery();
        if (recoveryResult.success) {
          actionsPerformed.push('Restored data from recovery backup');
          return {
            success: true,
            message: 'Data corruption repaired using recovery backup',
            actionsPerformed
          };
        }
      }

      // If no recovery backup, initialize with defaults
      const corruption = this.detectCorruption();

      if (corruption.issues.includes('Users data is missing or corrupted')) {
        this.saveUsers(this.getDefaultUsers());
        actionsPerformed.push('Restored default users');
      }

      if (corruption.issues.includes('Settings data is corrupted')) {
        this.saveSettings(this.getDefaultSettings());
        actionsPerformed.push('Restored default settings');
      }

      if (corruption.issues.includes('Contacts data is corrupted')) {
        this.saveContacts([]);
        actionsPerformed.push('Reset contacts data (data may be lost)');
      }

      return {
        success: true,
        message: 'Data corruption repaired with default values',
        actionsPerformed
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to repair data corruption',
        actionsPerformed
      };
    }
  }
}

export const localStorageService = new LocalStorageService();