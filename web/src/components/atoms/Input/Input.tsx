/**
 * INPUT ATOM - ENHANCED FORM INPUT SYSTEM
 * 
 * Comprehensive input component with validation states, accessibility,
 * multi-modal support, and performance optimization.
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant/style */
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
  
  /** Validation state */
  state?: 'default' | 'success' | 'warning' | 'error';
  
  /** Whether the input is in a loading state */
  loading?: boolean;
  
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  
  /** Multi-modal context for enhanced styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Whether the input should take full width */
  fullWidth?: boolean;
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  
  /** ID of element that describes this input */
  ariaDescribedBy?: string;
  
  /** Whether this field is required */
  required?: boolean;
  
  /** Error message to display */
  errorMessage?: string;
  
  /** Helper text to display */
  helperText?: string;
  
  /** Success message to display */
  successMessage?: string;
  
  /** Whether to show character count */
  showCharacterCount?: boolean;
  
  /** Maximum character count */
  maxLength?: number;
  
  /** Custom validation function */
  onValidate?: (value: string) => string | null;
  
  /** Callback for value changes with validation */
  onValueChange?: (value: string, isValid: boolean) => void;
}

/**
 * Enhanced Input atom with comprehensive validation and accessibility
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  state = 'default',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  modalityContext,
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
  required = false,
  errorMessage,
  helperText,
  successMessage,
  showCharacterCount = false,
  maxLength,
  onValidate,
  onValueChange,
  onChange,
  onBlur,
  onFocus,
  value,
  defaultValue,
  className = '',
  ...rest
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const currentValue = value !== undefined ? String(value) : internalValue;
  const isControlled = value !== undefined;
  
  // Determine final state considering validation
  const finalState = validationError ? 'error' : state;
  
  // Character count
  const characterCount = currentValue.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;
  
  // Validation
  const validateValue = useCallback((val: string) => {
    let error: string | null = null;
    
    if (onValidate) {
      error = onValidate(val);
    }
    
    if (!error && required && !val.trim()) {
      error = 'This field is required';
    }
    
    if (!error && maxLength && val.length > maxLength) {
      error = `Maximum ${maxLength} characters allowed`;
    }
    
    setValidationError(error);
    return !error;
  }, [onValidate, required, maxLength]);
  
  // Event handlers
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    const isValid = validateValue(newValue);
    
    if (onValueChange) {
      onValueChange(newValue, isValid);
    }
    
    if (onChange) {
      onChange(event);
    }
  }, [isControlled, validateValue, onValueChange, onChange]);
  
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(event);
    }
  }, [onFocus]);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    validateValue(event.target.value);
    if (onBlur) {
      onBlur(event);
    }
  }, [onBlur, validateValue]);
  
  // Class computation
  const containerClassName = [
    styles.container,
    styles[variant],
    styles[size],
    styles[finalState],
    modalityContext && styles[modalityContext],
    fullWidth && styles.fullWidth,
    isFocused && styles.focused,
    disabled && styles.disabled,
    loading && styles.loading,
    (startIcon || endIcon) && styles.withIcons,
    className
  ].filter(Boolean).join(' ');
  
  const inputClassName = [
    styles.input,
    startIcon && styles.withStartIcon,
    endIcon && styles.withEndIcon
  ].filter(Boolean).join(' ');
  
  // Accessibility attributes
  const accessibilityProps = {
    'aria-label': ariaLabel,
    'aria-describedby': [
      ariaDescribedBy,
      helperText && `${rest.id || 'input'}-helper`,
      errorMessage && `${rest.id || 'input'}-error`,
      successMessage && `${rest.id || 'input'}-success`,
      showCharacterCount && `${rest.id || 'input'}-count`
    ].filter(Boolean).join(' ') || undefined,
    'aria-required': required,
    'aria-invalid': finalState === 'error',
    'aria-busy': loading
  };
  
  // Messages to display
  const displayMessage = validationError || errorMessage || successMessage || helperText;
  const messageType = validationError || errorMessage ? 'error' 
    : successMessage ? 'success' 
    : 'helper';
  
  return (
    <div className={containerClassName}>
      <div className={styles.inputWrapper}>
        {startIcon && (
          <div className={styles.startIcon} aria-hidden="true">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClassName}
          disabled={disabled || loading}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          {...accessibilityProps}
          {...rest}
        />
        
        {loading && (
          <div className={styles.loadingSpinner} aria-hidden="true">
            <svg className={styles.spinner} viewBox="0 0 24 24">
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
        
        {endIcon && !loading && (
          <div className={styles.endIcon} aria-hidden="true">
            {endIcon}
          </div>
        )}
      </div>
      
      {(displayMessage || showCharacterCount) && (
        <div className={styles.messageArea}>
          {displayMessage && (
            <div 
              className={`${styles.message} ${styles[messageType]}`}
              id={`${rest.id || 'input'}-${messageType}`}
              role={messageType === 'error' ? 'alert' : 'status'}
              aria-live={messageType === 'error' ? 'assertive' : 'polite'}
            >
              {displayMessage}
            </div>
          )}
          
          {showCharacterCount && (
            <div 
              className={`${styles.characterCount} ${isOverLimit ? styles.overLimit : ''}`}
              id={`${rest.id || 'input'}-count`}
              aria-live="polite"
            >
              {characterCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
