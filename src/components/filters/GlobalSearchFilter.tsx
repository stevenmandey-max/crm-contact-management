import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFilter } from '../../contexts/FilterContext';
import './GlobalSearchFilter.css';

interface GlobalSearchFilterProps {
  placeholder?: string;
  className?: string;
}

export const GlobalSearchFilter: React.FC<GlobalSearchFilterProps> = ({
  placeholder = "Search by name or phone number...",
  className = ''
}) => {
  const { filters, updateFilter } = useFilter();
  const [searchValue, setSearchValue] = useState(filters.globalSearch || '');
  const [isComposing, setIsComposing] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Custom debounce implementation for better performance
  const debouncedUpdate = useCallback((value: string) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      const trimmedValue = value.trim();
      updateFilter('globalSearch', trimmedValue || undefined);
    }, 200);
  }, [updateFilter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update local state when filter changes externally
  useEffect(() => {
    setSearchValue(filters.globalSearch || '');
  }, [filters.globalSearch]);

  // Handle input change with composition event support
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return; // Don't update during IME composition
    
    const value = e.target.value;
    
    // Use functional update to prevent stale closure issues
    setSearchValue(prev => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev === value) return prev;
      return value;
    });
    
    debouncedUpdate(value);
  }, [isComposing, debouncedUpdate]);

  // Handle composition events (for IME input like Chinese, Japanese, Korean)
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const value = e.currentTarget.value;
    
    setSearchValue(prev => {
      if (prev === value) return prev;
      return value;
    });
    
    debouncedUpdate(value);
  }, [debouncedUpdate]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    updateFilter('globalSearch', undefined);
  }, [updateFilter]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`global-search-filter ${className}`}>
      <div className="search-input-container">
        <div className="search-icon">
          🔍
        </div>
        
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        
        {searchValue && (
          <button
            onClick={handleClear}
            className="clear-search-btn"
            type="button"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      {searchValue && (
        <div className="search-info">
          <span className="search-hint">
            Searching in: <strong>Name</strong> and <strong>Phone Number</strong>
          </span>
        </div>
      )}
    </div>
  );
};