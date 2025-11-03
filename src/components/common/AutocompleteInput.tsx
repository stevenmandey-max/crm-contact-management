import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AutocompleteInput.css';

interface AutocompleteInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'text' | 'tel';
  maxLength?: number;
  autoComplete?: string;
  autoCorrect?: string;
  autoCapitalize?: string;
  spellCheck?: boolean;
  showDuplicateWarning?: boolean; // New prop to control duplicate warning
  excludeFromDuplicateCheck?: string; // Value to exclude from duplicate checking (for edit mode)
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  className = '',
  disabled = false,
  type = 'text',
  maxLength,
  autoComplete = 'off',
  autoCorrect = 'off',
  autoCapitalize = 'none',
  spellCheck = false,
  showDuplicateWarning = true, // Default to true for backward compatibility
  excludeFromDuplicateCheck
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  const filterSuggestions = useCallback((inputValue: string) => {
    if (!inputValue.trim()) {
      return [];
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Sort by relevance (starts with input first, then contains)
    return filtered.sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(inputValue.toLowerCase());
      const bStartsWith = b.toLowerCase().startsWith(inputValue.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.localeCompare(b);
    });
  }, [suggestions]);

  // Update filtered suggestions when value or suggestions change
  useEffect(() => {
    const filtered = filterSuggestions(value);
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && value.trim().length > 0);
    setActiveSuggestionIndex(-1);
  }, [value, suggestions, filterSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return;
    onChange(e.target.value);
  };

  // Handle composition events (for IME input)
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    onChange(e.currentTarget.value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          selectSuggestion(filteredSuggestions[activeSuggestionIndex]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;

      case 'Tab':
        // Allow tab to close suggestions
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }, 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    selectSuggestion(suggestion);
  };

  // Check if current value is a duplicate (only if warning is enabled)
  const isDuplicate = showDuplicateWarning && value.trim() && suggestions.some(
    suggestion => suggestion.toLowerCase() === value.toLowerCase() && 
    suggestion.toLowerCase() !== excludeFromDuplicateCheck?.toLowerCase()
  );

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${isDuplicate ? 'duplicate-warning' : ''}`}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <div
              key={suggestion}
              className={`suggestion-item ${
                index === activeSuggestionIndex ? 'active' : ''
              } ${
                suggestion.toLowerCase() === value.toLowerCase() ? 'exact-match' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
            >
              <span className="suggestion-text">{suggestion}</span>
              {showDuplicateWarning && 
               suggestion.toLowerCase() === value.toLowerCase() && 
               suggestion.toLowerCase() !== excludeFromDuplicateCheck?.toLowerCase() && (
                <span className="duplicate-badge">Sudah Ada</span>
              )}
            </div>
          ))}
          
          {filteredSuggestions.length > 5 && (
            <div className="suggestions-more">
              +{filteredSuggestions.length - 5} lainnya...
            </div>
          )}
        </div>
      )}

      {isDuplicate && showDuplicateWarning && (
        <div className="duplicate-warning-text">
          ⚠️ Data ini sudah ada dalam kontak
        </div>
      )}
    </div>
  );
};