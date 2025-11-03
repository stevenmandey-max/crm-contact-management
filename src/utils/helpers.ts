import type { Contact, FilterCriteria } from '../types';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date for display
export const formatDate = (date: Date): string => {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid Date';
  }
};

// Format date for table display (more compact)
export const formatDateCompact = (date: Date): string => {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid Date';
  }
};

// Format date for input fields
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Parse date from string
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Filter contacts based on criteria
export const filterContacts = (contacts: Contact[], filters: FilterCriteria): Contact[] => {
  return contacts.filter(contact => {
    try {
      // Date range filter
      if (filters.dateRange) {
        const contactDate = new Date(contact.createdAt);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        
        if (contactDate < startDate || contactDate > endDate) {
          return false;
        }
      }

      // Global search filter (searches both nama and nomorTelepon)
      if (filters.globalSearch) {
        const searchTerm = filters.globalSearch.toLowerCase();
        const nameMatch = contact.nama?.toLowerCase().includes(searchTerm) || false;
        const phoneMatch = contact.nomorTelepon?.toLowerCase().includes(searchTerm) || false;
        
        // If global search is active, it must match either name or phone
        if (!nameMatch && !phoneMatch) {
          return false;
        }
      }

      // Individual text filters (only apply if globalSearch is not active)
      if (!filters.globalSearch) {
        if (filters.nama && contact.nama && !contact.nama.toLowerCase().includes(filters.nama.toLowerCase())) {
          return false;
        }

        if (filters.nomorTelepon && contact.nomorTelepon && !contact.nomorTelepon.toLowerCase().includes(filters.nomorTelepon.toLowerCase())) {
          return false;
        }
      }

      if (filters.alamat && contact.alamat && !contact.alamat.toLowerCase().includes(filters.alamat.toLowerCase())) {
        return false;
      }

      if (filters.agama && contact.agama && !contact.agama.toLowerCase().includes(filters.agama.toLowerCase())) {
        return false;
      }

      if (filters.alasanMenghubungi && contact.alasanMenghubungi && !contact.alasanMenghubungi.toLowerCase().includes(filters.alasanMenghubungi.toLowerCase())) {
        return false;
      }
    } catch (error) {
      console.error('Error filtering contact:', error, contact);
      return true; // Include contact if there's an error
    }

    // Status filter
    if (filters.statusKontak && filters.statusKontak.length > 0) {
      if (!filters.statusKontak.includes(contact.statusKontak)) {
        return false;
      }
    }

    return true;
  });
};

// Sort contacts by date (newest first)
export const sortContactsByDate = (contacts: Contact[]): Contact[] => {
  return [...contacts].sort((a, b) => {
    try {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      // Handle invalid dates
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error sorting contacts by date:', error);
      return 0;
    }
  });
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};