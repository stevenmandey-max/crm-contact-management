import React, { useState, useEffect, useCallback } from 'react';
import type { FilterCriteria } from '../../types';
import { useFilter } from '../../contexts/FilterContext';
import { debounce } from '../../utils/helpers';
import './TextFilter.css';

interface TextFilterProps {
  field: keyof FilterCriteria;
  placeholder?: string;
  value: string;
  debounceMs?: number;
  minLength?: number;
}

export const TextFilter: React.FC<TextFilterProps> = ({
  field,
  placeholder = 'Enter search term...',
  value,
  debounceMs = 150, // Reduced from 300ms to 150ms
  minLength = 1
}) => {
  const { updateFilter } = useFilter();
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.length >= minLength || searchValue.length === 0) {
        updateFilter(field, searchValue || undefined);
      }
    }, debounceMs),
    [field, updateFilter, minLength, debounceMs]
  );

  // Update input value when prop changes (but don't override user input)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value);
    }
  }, [value, isFocused]);

  // Handle input change with immediate UI update
  const handleInputChange = (newValue: string) => {
    // Immediate UI update for responsive typing
    setInputValue(newValue);
    
    // Debounced filter update
    debouncedUpdate(newValue);
  };

  // Clear input
  const clearInput = () => {
    setInputValue('');
    updateFilter(field, undefined);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateFilter(field, inputValue || undefined);
    }
    
    if (e.key === 'Escape') {
      clearInput();
    }
  };

  const getFieldLabel = (fieldName: keyof FilterCriteria): string => {
    const labels: Partial<Record<keyof FilterCriteria, string>> = {
      nama: 'Name',
      nomorTelepon: 'Phone Number',
      alamat: 'Address',
      provinsi: 'Province',
      agama: 'Religion',
      alasanMenghubungi: 'Reason for Contact',
      dateRange: 'Date Range'
    };
    return labels[fieldName] || fieldName.toString();
  };

  return (
    <div className={`text-filter ${isFocused ? 'focused' : ''} ${inputValue ? 'has-value' : ''}`}>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="filter-input"
          aria-label={`Filter by ${getFieldLabel(field)}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        
        <div className="input-actions">
          {inputValue && (
            <button
              onClick={clearInput}
              className="clear-btn"
              title="Clear filter"
              type="button"
            >
              ✕
            </button>
          )}
          
          <div className="search-icon">
            🔍
          </div>
        </div>
      </div>

      {inputValue && inputValue.length < minLength && (
        <div className="filter-hint">
          Enter at least {minLength} character{minLength > 1 ? 's' : ''} to search
        </div>
      )}

      {inputValue && inputValue.length >= minLength && (
        <div className="filter-status">
          Filtering by {getFieldLabel(field).toLowerCase()}: "{inputValue}"
        </div>
      )}
    </div>
  );
};