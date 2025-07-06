import React, { useState, useCallback, useId, forwardRef } from 'react';
import { Input } from '../../atoms/Input/Input';
import { Label } from '../../atoms/Label/Label';
import { Icon } from '../../atoms/Icon/Icon';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import { FocusIndicator } from '../../atoms/FocusIndicator/FocusIndicator';
import styles from './FormField.module.css';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text for the form field */
  label: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Field variant */
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  /** Validation state */
  state?: 'default' | 'success' | 'warning' | 'error';
  /** Helper text to display below the field */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether to show the required indicator */
  showRequiredIndicator?: boolean;
  /** Custom required indicator */
  requiredIndicator?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  /** Multi-modal context */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Custom validation function */
  onValidate?: (value: string) => string | null;
  /** Callback for value changes with validation */
  onValueChange?: (value: string, isValid: boolean) => void;
  /** Field description for accessibility */
  description?: string;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * FormField Molecule
 * 
 * Combines Input and Label atoms to create a complete form field with validation,
 * helper text, error handling, and accessibility features.
 * 
 * Features:
 * - Comprehensive validation with custom validators
 * - Required field indicators and validation
 * - Helper text and error/success messages
 * - Character count display
 * - WCAG AAA accessibility compliance
 * - Loading and disabled states
 * - Multi-modal context support
 * - Focus management with visual indicators
 * - Screen reader announcements for validation states
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  size = 'medium',
  variant = 'default',
  state = 'default',
  helperText,
  errorMessage,
  successMessage,
  required = false,
  showRequiredIndicator = true,
  requiredIndicator,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  modalityContext,
  showCharacterCount = false,
  onValidate,
  onValueChange,
  onChange,
  description,
  className = '',
  testId = 'form-field',
  value,
  defaultValue,
  ...rest
}, ref) => {
  // Internal state
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  
  // Generate unique IDs
  const fieldId = useId();
  const helperId = useId();
  const errorId = useId();
  const descriptionId = useId();
  
  // Size mapping helper
  const mapSize = (formSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[formSize];
  };
  
  const atomSize = mapSize(size);
  
  // Get current value
  const currentValue = value !== undefined ? String(value) : internalValue;
  const isControlled = value !== undefined;
  
  // Validate value
  const validateValue = useCallback((val: string): boolean => {
    let error: string | null = null;
    
    // Custom validation
    if (onValidate) {
      error = onValidate(val);
    }
    
    // Required validation
    if (!error && required && !val.trim()) {
      error = 'This field is required';
    }
    
    // Max length validation (handled by Input atom)
    if (!error && rest.maxLength && val.length > rest.maxLength) {
      error = `Maximum ${rest.maxLength} characters allowed`;
    }
    
    setValidationError(error);
    return !error;
  }, [onValidate, required, rest.maxLength]);
  
  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    // Only validate after first interaction or if field has been touched
    const shouldValidate = hasBeenTouched || newValue.length === 0;
    const isValid = shouldValidate ? validateValue(newValue) : true;
    
    if (onValueChange) {
      onValueChange(newValue, isValid);
    }
    
    if (onChange) {
      onChange(event);
    }
  }, [isControlled, hasBeenTouched, validateValue, onValueChange, onChange]);
  
  // Handle blur (validate when user leaves field)
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setHasBeenTouched(true);
    validateValue(event.target.value);
    
    if (rest.onBlur) {
      rest.onBlur(event);
    }
  }, [validateValue, rest]);
  
  // Determine final state
  const finalState = validationError ? 'error' : state;
  
  // Determine message to display
  const displayMessage = validationError || errorMessage || successMessage || helperText;
  const messageType = validationError || errorMessage ? 'error' 
    : successMessage ? 'success'
    : finalState === 'warning' ? 'warning'
    : 'helper';
  
  // Get status icon
  const getStatusIcon = () => {
    if (loading) return null;
    
    switch (finalState) {
      case 'success':
        return <Icon name="check" size={atomSize} className={styles.statusIcon} />;
      case 'error':
        return <Icon name="x" size={atomSize} className={styles.statusIcon} />;
      case 'warning':
        return <Icon name="warning" size={atomSize} className={styles.statusIcon} />;
      default:
        return endIcon;
    }
  };
  
  const statusIcon = getStatusIcon();
  
  // Accessibility attributes
  const ariaDescribedBy = [
    description && descriptionId,
    displayMessage && (messageType === 'error' ? errorId : helperId),
    showCharacterCount && `${fieldId}-count`
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div 
      className={`${styles.formField} ${styles[size]} ${styles[variant]} ${styles[finalState]} ${className}`}
      data-testid={testId}
    >
      {/* Screen reader announcements for validation */}
      <ScreenReaderText 
        type="alert"
        priority="high"
        atomic={true}
        immediate={true}
      >
        {validationError}
      </ScreenReaderText>
      
      <div className={styles.fieldContainer}>
        {/* Label */}
        <Label
          htmlFor={fieldId}
          size={atomSize}
          required={required}
          showRequiredIndicator={showRequiredIndicator}
          requiredIndicator={requiredIndicator}
          disabled={disabled}
          modalityContext={modalityContext}
          className={styles.label}
        >
          {label}
        </Label>
        
        {/* Description */}
        {description && (
          <div 
            id={descriptionId}
            className={styles.description}
          >
            {description}
          </div>
        )}
        
        {/* Input container with focus indicator */}
        <div className={styles.inputContainer}>
          <FocusIndicator
            type="ring"
            modality={modalityContext || 'text'}
            className={styles.focusIndicator}
          />
          
          {/* Input field */}
          <Input
            ref={ref}
            id={fieldId}
            value={currentValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            loading={loading}
            size={atomSize}
            variant={variant}
            state={finalState}
            startIcon={startIcon}
            endIcon={statusIcon}
            modalityContext={modalityContext}
            showCharacterCount={showCharacterCount}
            aria-describedby={ariaDescribedBy}
            aria-required={required}
            aria-invalid={finalState === 'error'}
            className={styles.input}
            {...rest}
          />
        </div>
        
        {/* Message area */}
        {displayMessage && (
          <div 
            id={messageType === 'error' ? errorId : helperId}
            className={`${styles.message} ${styles[messageType]}`}
            role={messageType === 'error' ? 'alert' : 'status'}
            aria-live={messageType === 'error' ? 'assertive' : 'polite'}
          >
            {messageType === 'error' && (
              <Icon name="error" size="sm" className={styles.messageIcon} />
            )}
            {messageType === 'success' && (
              <Icon name="success" size="sm" className={styles.messageIcon} />
            )}
            {messageType === 'warning' && (
              <Icon name="warning" size="sm" className={styles.messageIcon} />
            )}
            <span className={styles.messageText}>{displayMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField'; 