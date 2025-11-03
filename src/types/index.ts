// Core data types for CRM Contact Management System

export type ContactStatus = 'New Contact' | 'In Progress' | 'Follow Up' | 'Completed';

export type UserRole = 'Admin' | 'Editor';

export type Gender = 'Laki-laki' | 'Perempuan';

export type Priority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Urgent';

export type Sumber = 'Parabola' | 'IndiHome' | 'Youtube' | 'Facebook' | 'Instagram' | 'Website' | 'Search Engine' | 'Layanan Doa';

export type StatusPernikahan = 'Menikah' | 'Tidak Menikah';

export type MediaKomunikasi = 'WhatsApp Chat' | 'WhatsApp Call' | 'Telepon' | 'SMS';

export type Mission = 'NSM' | 'CSM' | 'SSM' | 'JBC' | 'JC' | 'WJC' | 'CJM' | 'EJC' | 'NTM' | 'WKR' | 'EKM';

// Service Tracking Types
export interface ServiceEntry {
  id: string;
  contactId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  duration: number; // in minutes
  serviceType: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Real-time Service Session for timer tracking
export interface ServiceSession {
  id: string;
  contactId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  status: 'active' | 'completed' | 'paused';
  serviceDate: string; // YYYY-MM-DD for grouping
  serviceHour: number; // 0-23 for hourly tracking
  lastActivity?: Date; // For crash recovery
}

export interface ServiceMetrics {
  contactId: string;
  userId: string;
  serviceCount: number; // unique service days
  totalDuration: number; // total minutes
  firstService: Date;
  lastService: Date;
  averageDuration: number;
  servicesThisMonth: number;
  durationThisMonth: number;
}



export interface ServiceValidationRules {
  maxDurationPerSession: number; // 8 hours = 480 minutes
  maxDurationPerDay: number; // 16 hours = 960 minutes
  maxFutureDate: number; // cannot log future services
  maxPastDate: number; // cannot log services older than 1 year
}

export interface ServiceAnalyticsFilters {
  userId?: string;
  contactId?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  sortBy: 'serviceCount' | 'totalDuration' | 'lastService';
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
}

export interface ContactHistoryEntry {
  id: string;
  timestamp: Date;
  action: 'created' | 'updated' | 'status_changed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  updatedBy: string;
  notes?: string;
}



export interface ServiceSummary {
  contactId: string;
  totalServiceDays: number;
  totalServiceHours: number;
  activeUsers: number;
  lastServiceDate?: Date;
  lastServiceUser?: string;
  monthlyTrend: Array<{
    month: string;
    serviceCount: number;
    duration: number;
  }>;
}

export interface Contact {
  id: string;
  createdAt: Date;
  nama: string;
  nomorTelepon: string;
  jenisKelamin: Gender;
  usia?: number;
  profesi?: string;
  statusPernikahan?: StatusPernikahan;
  mediaKomunikasi?: MediaKomunikasi;
  mission?: string;
  alamat: string;
  provinsi: string;
  kabKota?: string; // New field for Kabupaten/Kota
  uni?: string; // Will be auto-selected (WIUM/CIUM/EIUC)
  agama: string;
  subAgama?: string; // Sub-category for religion (e.g., Protestant churches)
  alasanMenghubungi: string;
  sumber: Sumber;
  prioritas: Priority;
  statusKontak: ContactStatus;
  updatedAt: Date;
  createdBy: string;
  history: ContactHistoryEntry[];
  // Service tracking fields
  totalServiceDays?: number;
  totalServiceHours?: number;
  lastServiceDate?: Date;
  // Real-time service session
  activeSession?: ServiceSession;
  serviceCount?: number;
  averageServiceTime?: number; // in minutes
  lastServiceUser?: string;
}

export interface FilterCriteria {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  globalSearch?: string; // Combined search for nama and nomorTelepon
  nama?: string;
  nomorTelepon?: string;
  jenisKelamin?: Gender[];
  alamat?: string;
  provinsi?: string;
  agama?: string;
  alasanMenghubungi?: string;
  sumber?: Sumber[];
  prioritas?: Priority[];
  statusKontak?: ContactStatus[];
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    startDate?: Date;
    endDate?: Date;
  };
  includeFields: (keyof Contact)[];
}

export interface StorageSchema {
  contacts: Contact[];
  users: User[];
  settings: AppSettings;
  version: string;
}

export interface AppSettings {
  contactStatuses: string[];
  exportFormats: string[];
  defaultFilters: FilterCriteria;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Context interfaces
export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  hasPermission: (requiredRole: 'Admin' | 'Editor') => boolean;
  canManageUsers: () => boolean;
  canManageContacts: () => boolean;
  canExportData: () => boolean;
}

export interface FilterContextType {
  filters: FilterCriteria;
  updateFilter: (key: keyof FilterCriteria, value: any) => void;
  clearFilters: () => void;
  filteredContacts: Contact[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  filterCount: number;
  filterSummary: string[];
  refreshContacts: () => void;
  applyFilters: () => void;
  resetFilters: () => void;
  applyQuickFilter: (filterType: 'recent' | 'thisWeek' | 'thisMonth' | 'byStatus', value?: any) => void;
  searchContacts: (searchTerm: string) => void;
  totalContacts: number;
  filteredCount: number;
}

export interface ExportService {
  exportContacts: (contacts: Contact[], options: ExportOptions) => void;
  generateFileName: (options: ExportOptions) => string;
}