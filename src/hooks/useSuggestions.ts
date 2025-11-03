import { useState, useEffect, useMemo } from 'react';
import { localStorageService } from '../services/localStorage';
import type { Contact } from '../types';

interface SuggestionsData {
  names: string[];
  phoneNumbers: string[];
}

export const useSuggestions = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from localStorage
  useEffect(() => {
    const loadContacts = () => {
      try {
        setIsLoading(true);
        const allContacts = localStorageService.getContacts();
        setContacts(allContacts);
      } catch (error) {
        console.error('Error loading contacts for suggestions:', error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();

    // Listen for storage changes to update suggestions in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crm_contacts') {
        loadContacts();
      }
    };

    // Listen for custom events when contacts are modified
    const handleContactsUpdate = () => {
      loadContacts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contactsUpdated', handleContactsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contactsUpdated', handleContactsUpdate);
    };
  }, []);

  // Generate suggestions from contacts data
  const suggestions: SuggestionsData = useMemo(() => {
    if (isLoading || contacts.length === 0) {
      return { names: [], phoneNumbers: [] };
    }

    // Extract unique names (case-insensitive)
    const namesSet = new Set<string>();
    const phoneNumbersSet = new Set<string>();

    contacts.forEach(contact => {
      // Add names (trim and filter out empty)
      if (contact.nama && contact.nama.trim()) {
        namesSet.add(contact.nama.trim());
      }

      // Add phone numbers (trim and filter out empty)
      if (contact.nomorTelepon && contact.nomorTelepon.trim()) {
        phoneNumbersSet.add(contact.nomorTelepon.trim());
      }
    });

    // Convert to arrays and sort
    const names = Array.from(namesSet).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    const phoneNumbers = Array.from(phoneNumbersSet).sort();

    return { names, phoneNumbers };
  }, [contacts, isLoading]);

  // Helper function to check if a name already exists
  const isNameDuplicate = (name: string): boolean => {
    if (!name.trim()) return false;
    return suggestions.names.some(
      existingName => existingName.toLowerCase() === name.toLowerCase()
    );
  };

  // Helper function to check if a phone number already exists
  const isPhoneNumberDuplicate = (phoneNumber: string): boolean => {
    if (!phoneNumber.trim()) return false;
    return suggestions.phoneNumbers.some(
      existingPhone => existingPhone === phoneNumber.trim()
    );
  };

  // Helper function to find exact contact matches
  const findContactByName = (name: string): Contact | undefined => {
    if (!name.trim()) return undefined;
    return contacts.find(
      contact => contact.nama.toLowerCase() === name.toLowerCase()
    );
  };

  const findContactByPhoneNumber = (phoneNumber: string): Contact | undefined => {
    if (!phoneNumber.trim()) return undefined;
    return contacts.find(
      contact => contact.nomorTelepon === phoneNumber.trim()
    );
  };

  // Helper function to get similar contacts
  const getSimilarContacts = (searchTerm: string, field: 'nama' | 'nomorTelepon'): Contact[] => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return contacts.filter(contact => {
      const fieldValue = contact[field]?.toLowerCase() || '';
      return fieldValue.includes(term);
    });
  };

  return {
    suggestions,
    isLoading,
    isNameDuplicate,
    isPhoneNumberDuplicate,
    findContactByName,
    findContactByPhoneNumber,
    getSimilarContacts,
    refreshSuggestions: () => {
      // Trigger a refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('contactsUpdated'));
    }
  };
};