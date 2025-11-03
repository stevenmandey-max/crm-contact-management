import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Contact, FilterCriteria, FilterContextType } from '../types';
import { localStorageService } from '../services/localStorage';
import { filterContacts, sortContactsByDate } from '../utils/helpers';
import { filterContactsByPermission } from '../utils/dataFilters';
import { useAuth } from '../hooks/useAuth';

// Filter state interface
interface FilterState {
  filters: FilterCriteria;
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
}

// Filter actions - simplified
type FilterAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'UPDATE_FILTER'; payload: { key: keyof FilterCriteria; value: any } }
  | { type: 'CLEAR_FILTERS' };

// Initial state
const initialState: FilterState = {
  filters: {},
  contacts: [],
  isLoading: false,
  error: null
};

// Reducer - simplified without filtering logic
const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_CONTACTS':
      const sortedContacts = sortContactsByDate(action.payload);
      return {
        ...state,
        contacts: sortedContacts,
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_FILTER':
      const newFilters = {
        ...state.filters,
        [action.payload.key]: action.payload.value
      };
      
      // Remove empty filters
      Object.keys(newFilters).forEach(key => {
        const value = newFilters[key as keyof FilterCriteria];
        if (value === '' || value === null || value === undefined || 
            (Array.isArray(value) && value.length === 0)) {
          delete newFilters[key as keyof FilterCriteria];
        }
      });
      
      return {
        ...state,
        filters: newFilters
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {}
      };
    
    default:
      return state;
  }
};

// Create context
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Filter provider component
interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const { currentUser } = useAuth();

  // Calculate filtered contacts with useMemo - this is the key fix!
  const filteredContacts = useMemo(() => {
    if (!state.contacts.length) {
      return [];
    }
    
    if (!currentUser) {
      return [];
    }
    
    // First apply permission filtering
    const permissionFiltered = filterContactsByPermission(state.contacts, currentUser);
    
    // Then apply regular filters
    return filterContacts(permissionFiltered, state.filters);
  }, [state.contacts, state.filters, currentUser]);

  // Load contacts on mount and when user changes
  useEffect(() => {
    loadContacts();
  }, [currentUser]);

  const loadContacts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const contacts = localStorageService.getContacts();
      dispatch({ type: 'SET_CONTACTS', payload: contacts });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { key, value } });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const applyFilters = () => {
    // No-op since filtering is automatic with useMemo
  };

  const resetFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const refreshContacts = () => {
    loadContacts();
  };

  // Computed values
  const hasActiveFilters = Object.keys(state.filters).length > 0;
  const filterCount = filteredContacts.length;
  const totalContacts = state.contacts.length;
  const filteredCount = filteredContacts.length;
  
  const filterSummary = Object.entries(state.filters).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: ${value.join(', ')}`;
    }
    return `${key}: ${value}`;
  });

  const applyQuickFilter = (filterType: 'recent' | 'thisWeek' | 'thisMonth' | 'byStatus', value?: any) => {
    const now = new Date();
    switch (filterType) {
      case 'recent':
        const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        updateFilter('dateRange', { startDate: recentDate, endDate: now });
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        updateFilter('dateRange', { startDate: weekStart, endDate: new Date() });
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        updateFilter('dateRange', { startDate: monthStart, endDate: new Date() });
        break;
      case 'byStatus':
        if (value) {
          updateFilter('statusKontak', [value]);
        }
        break;
    }
  };

  const searchContacts = (searchTerm: string) => {
    updateFilter('globalSearch', searchTerm);
  };

  // Context value with computed filteredContacts
  const contextValue: FilterContextType = {
    filters: state.filters,
    filteredContacts, // Use computed value from useMemo
    isLoading: state.isLoading,
    error: state.error,
    hasActiveFilters,
    filterCount,
    filterSummary,
    totalContacts,
    filteredCount,
    updateFilter,
    clearFilters,
    applyFilters,
    resetFilters,
    refreshContacts,
    applyQuickFilter,
    searchContacts
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook to use filter context
export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};