/**
 * BUTTON ATOM - ENHANCED MULTI-MODAL SUPPORT
 * 
 * Core button component with comprehensive variant system,
 * accessibility features, and multi-modal state support.
 */

import React, { forwardRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  
  /** Size of the button */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Whether the button is in a loading state */
  loading?: boolean;
  
  /** Icon to display before the text */
  icon?: React.ReactNode;
  
  /** Icon to display after the text */
  iconRight?: React.ReactNode;
  
  /** Whether the button should be full width */
  fullWidth?: boolean;
  
  /** Multi-modal context (affects styling and behavior) */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  
  /** ID of element that describes this button */
  ariaDescribedBy?: string;
  
  /** Whether this button controls an expanded element */
  ariaExpanded?: boolean;
  
  /** Whether this button has a popup */
  ariaHasPopup?: boolean;
  
  /** Button content */
  children?: React.ReactNode;
}

/**
 * Enhanced Button atom with multi-modal support and comprehensive accessibility
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  modalityContext,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaHasPopup,
  className = '',
  children,
  ...rest
}, ref) => {
  const computedClassName = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    disabled && styles.disabled,
    modalityContext && styles[modalityContext],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={computedClassName}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg className={styles.spinnerSvg} viewBox="0 0 24 24">
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      )}
      
      {icon && !loading && (
        <span className={styles.iconLeft} aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children && (
        <span className={styles.text}>
          {children}
        </span>
      )}
      
      {iconRight && !loading && (
        <span className={styles.iconRight} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
