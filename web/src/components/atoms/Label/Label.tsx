/**
 * LABEL ATOM - ENHANCED FORM LABEL SYSTEM
 * 
 * Comprehensive label component with accessibility features,
 * required indicators, multi-modal support, and proper form associations.
 */

import React, { forwardRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Label.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Size of the label */
  size?: 'sm' | 'md' | 'lg';
  
  /** Visual weight/importance */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  
  /** Whether the associated field is required */
  required?: boolean;
  
  /** Custom required indicator */
  requiredIndicator?: React.ReactNode;
  
  /** Whether to show the required indicator */
  showRequiredIndicator?: boolean;
  
  /** Whether the field is disabled */
  disabled?: boolean;
  
  /** Multi-modal context for enhanced styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Icon to display before the label text */
  icon?: React.ReactNode;
  
  /** Icon to display after the label text */
  endIcon?: React.ReactNode;
  
  /** Additional description or helper text */
  description?: string;
  
  /** Whether the label should be visually hidden but accessible to screen readers */
  srOnly?: boolean;
  
  /** Tooltip text for additional context */
  tooltip?: string;
  
  /** ID of the element this label describes */
  htmlFor?: string;
  
  /** Content of the label */
  children?: React.ReactNode;
}

/**
 * Enhanced Label atom with comprehensive accessibility and form integration
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(({
  size = 'md',
  weight = 'medium',
  variant = 'default',
  required = false,
  requiredIndicator,
  showRequiredIndicator = true,
  disabled = false,
  modalityContext,
  icon,
  endIcon,
  description,
  srOnly = false,
  tooltip,
  htmlFor,
  className = '',
  children,
  ...rest
}, ref) => {
  const computedClassName = [
    styles.label,
    styles[size],
    styles[weight],
    styles[variant],
    modalityContext && styles[modalityContext],
    disabled && styles.disabled,
    srOnly && styles.srOnly,
    className
  ].filter(Boolean).join(' ');

  // Default required indicator
  const defaultRequiredIndicator = (
    <span className={styles.requiredIndicator} aria-label="required">
      *
    </span>
  );

  // Show required indicator logic
  const shouldShowRequired = required && showRequiredIndicator;
  const finalRequiredIndicator = requiredIndicator || defaultRequiredIndicator;

  return (
    <div className={styles.container}>
      <label
        ref={ref}
        className={computedClassName}
        htmlFor={htmlFor}
        title={tooltip}
        {...rest}
      >
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        
        <span className={styles.text}>
          {children}
          {shouldShowRequired && finalRequiredIndicator}
        </span>
        
        {endIcon && (
          <span className={styles.endIcon} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </label>
      
      {description && (
        <div 
          className={styles.description}
          id={htmlFor ? `${htmlFor}-description` : undefined}
        >
          {description}
        </div>
      )}
    </div>
  );
});

Label.displayName = 'Label';

export default Label;
