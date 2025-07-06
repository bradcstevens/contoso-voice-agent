import React, { useState, useRef, useCallback, useId } from 'react';
import { Input } from '../../atoms/Input/Input';
import { Icon, IconName } from '../../atoms/Icon/Icon';
import { Label } from '../../atoms/Label/Label';
import { Button } from '../../atoms/Button/Button';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import { FocusIndicator } from '../../atoms/FocusIndicator/FocusIndicator';
import styles from './SearchField.module.css';

export interface SearchFieldProps {
  /** Label text for the search field */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current search value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Callback when search value changes */
  onValueChange?: (value: string) => void;
  /** Callback when search is submitted */
  onSearch?: (value: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show clear button when there's text */
  showClear?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Accessibility label for search button */
  searchButtonLabel?: string;
  /** Accessibility label for clear button */
  clearButtonLabel?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Search suggestions data */
  suggestions?: string[];
  /** Callback when suggestion is selected */
  onSuggestionSelect?: (suggestion: string) => void;
  /** Custom search icon */
  searchIcon?: IconName;
  /** Search field variant */
  variant?: 'default' | 'compact' | 'prominent';
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * SearchField Molecule
 * 
 * Combines Input, Icon, Label, and Button atoms to create a complete search experience.
 * Provides search functionality with optional suggestions, clear button, and accessibility support.
 * 
 * Features:
 * - Controlled and uncontrolled usage patterns
 * - Built-in search and clear functionality
 * - Optional search suggestions with keyboard navigation
 * - WCAG AAA accessibility compliance
 * - Loading and disabled states
 * - Multiple size and variant options
 * - Screen reader announcements for search actions
 * - Focus management with visual indicators
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  label = 'Search',
  placeholder = 'Enter search terms...',
  value,
  defaultValue = '',
  onValueChange,
  onSearch,
  onClear,
  loading = false,
  disabled = false,
  showClear = true,
  size = 'medium',
  searchButtonLabel = 'Search',
  clearButtonLabel = 'Clear search',
  autoFocus = false,
  showSuggestions = false,
  suggestions = [],
  onSuggestionSelect,
  searchIcon = 'search',
  variant = 'default',
  className = '',
  testId = 'search-field'
}) => {
  // Internal state for uncontrolled usage
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchStatus, setSearchStatus] = useState<string>('');
  
  // Refs for DOM manipulation
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  // Generate unique IDs for accessibility
  const fieldId = useId();
  const suggestionsId = useId();
  
  // Size mapping helper
  const mapSize = (searchSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[searchSize];
  };
  
  const atomSize = mapSize(size);
  
  // Get current value (controlled vs uncontrolled)
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue.length > 0;
  
  // Handle value changes
  const handleValueChange = useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    
    // Clear search status when typing
    setSearchStatus('');
    
    // Show suggestions when typing
    if (showSuggestions && newValue.length > 0) {
      setShowSuggestionsList(true);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestionsList(false);
    }
  }, [value, onValueChange, showSuggestions]);
  
  // Handle input change event
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleValueChange(event.target.value);
  }, [handleValueChange]);
  
  // Handle search submission
  const handleSearch = useCallback(() => {
    if (currentValue.trim()) {
      setSearchStatus('Searching...');
      onSearch?.(currentValue.trim());
      setShowSuggestionsList(false);
    }
  }, [currentValue, onSearch]);
  
  // Handle clear action
  const handleClear = useCallback(() => {
    const newValue = '';
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    onClear?.();
    setShowSuggestionsList(false);
    setSearchStatus('');
    inputRef.current?.focus();
  }, [value, onValueChange, onClear]);
  
  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    handleValueChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  }, [handleValueChange, onSuggestionSelect]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[activeSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        setShowSuggestionsList(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  }, [showSuggestionsList, suggestions, activeSuggestionIndex, handleSearch, handleSuggestionSelect]);
  
  // Filter suggestions based on current value
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(currentValue.toLowerCase())
  ).slice(0, 8); // Limit to 8 suggestions
  
  const shouldShowSuggestions = showSuggestions && showSuggestionsList && 
    filteredSuggestions.length > 0 && hasValue;
  
  return (
    <div 
      className={`${styles.searchField} ${styles[size]} ${styles[variant]} ${className}`}
      data-testid={testId}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
      >
        {searchStatus}
      </ScreenReaderText>
      
      <div className={styles.fieldContainer}>
        {/* Label */}
        <Label
          htmlFor={fieldId}
          size={atomSize}
          className={styles.label}
        >
          {label}
        </Label>
        
        {/* Input container with focus indicator */}
        <div className={styles.inputContainer}>
          <FocusIndicator
            type="ring"
            modality="text"
            className={styles.focusIndicator}
          />
          
          {/* Search icon */}
          <Icon
            name={searchIcon}
            size={atomSize}
            className={styles.searchIcon}
            decorative={true}
          />
          
          {/* Input field */}
          <Input
            ref={inputRef}
            id={fieldId}
            type="search"
            value={currentValue}
            placeholder={placeholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoFocus={autoFocus}
            size={atomSize}
            className={styles.input}
            aria-describedby={shouldShowSuggestions ? suggestionsId : undefined}
            aria-expanded={shouldShowSuggestions}
            aria-autocomplete={showSuggestions ? "list" : "none"}
            role={showSuggestions ? "combobox" : undefined}
          />
          
          {/* Action buttons */}
          <div className={styles.actions}>
            {/* Clear button */}
            {showClear && hasValue && !loading && (
              <Button
                variant="ghost"
                size={atomSize}
                onClick={handleClear}
                disabled={disabled}
                className={styles.clearButton}
                aria-label={clearButtonLabel}
                data-testid={`${testId}-clear`}
              >
                <Icon name="x" size={atomSize} decorative={true} />
              </Button>
            )}
            
            {/* Search button */}
            <Button
              variant="primary"
              size={atomSize}
              onClick={handleSearch}
              disabled={disabled || !hasValue}
              loading={loading}
              className={styles.searchButton}
              aria-label={searchButtonLabel}
              data-testid={`${testId}-search`}
            >
              <Icon name="search" size={atomSize} decorative={true} />
            </Button>
          </div>
        </div>
        
        {/* Suggestions dropdown */}
        {shouldShowSuggestions && (
          <ul
            ref={suggestionsRef}
            id={suggestionsId}
            className={styles.suggestions}
            role="listbox"
            aria-label="Search suggestions"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={`${styles.suggestion} ${
                  index === activeSuggestionIndex ? styles.active : ''
                }`}
                role="option"
                aria-selected={index === activeSuggestionIndex}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                <Icon name="search" size="sm" className={styles.suggestionIcon} decorative={true} />
                <span className={styles.suggestionText}>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 