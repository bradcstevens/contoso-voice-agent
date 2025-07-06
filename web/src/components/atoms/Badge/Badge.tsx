/**
 * BADGE ATOM - ENHANCED STATUS & COUNT INDICATOR SYSTEM
 * 
 * Comprehensive badge component with status indicators, count displays,
 * accessibility features, and multi-modal support.
 */

import React, { forwardRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant of the badge */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  
  /** Shape of the badge */
  shape?: 'rounded' | 'pill' | 'square';
  
  /** Content to display in the badge */
  children?: React.ReactNode;
  
  /** Count value for numeric badges */
  count?: number;
  
  /** Maximum count to display before showing "99+" */
  maxCount?: number;
  
  /** Whether to show zero count */
  showZero?: boolean;
  
  /** Icon to display before content */
  icon?: React.ReactNode;
  
  /** Icon to display after content */
  endIcon?: React.ReactNode;
  
  /** Whether the badge is interactive (clickable) */
  interactive?: boolean;
  
  /** Whether the badge is disabled */
  disabled?: boolean;
  
  /** Multi-modal context for enhanced styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Whether the badge should pulse/animate */
  pulse?: boolean;
  
  /** Whether the badge should have a dot style */
  dot?: boolean;
  
  /** Position for floating badges */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  
  /** Whether the badge is purely decorative */
  decorative?: boolean;
  
  /** Custom status text for screen readers */
  statusText?: string;
  
  /** Custom color override */
  customColor?: string;
  
  /** Custom background color override */
  customBackground?: string;
}

/**
 * Enhanced Badge atom with comprehensive status and count display features
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  children,
  count,
  maxCount = 99,
  showZero = false,
  icon,
  endIcon,
  interactive = false,
  disabled = false,
  modalityContext,
  pulse = false,
  dot = false,
  position,
  ariaLabel,
  decorative = false,
  statusText,
  customColor,
  customBackground,
  className = '',
  ...rest
}, ref) => {
  // Determine display content
  let displayContent = children;
  
  if (count !== undefined) {
    if (count === 0 && !showZero) {
      return null; // Don't render badge for zero count unless showZero is true
    }
    
    if (count > maxCount) {
      displayContent = `${maxCount}+`;
    } else {
      displayContent = count.toString();
    }
  }
  
  // Don't render if no content and not a dot badge
  if (!displayContent && !dot && !icon && !endIcon) {
    return null;
  }
  
  // Class computation
  const computedClassName = [
    styles.badge,
    styles[variant],
    styles[size],
    styles[shape],
    modalityContext && styles[modalityContext],
    interactive && styles.interactive,
    disabled && styles.disabled,
    pulse && styles.pulse,
    dot && styles.dot,
    position && styles[position],
    (icon || endIcon) && styles.withIcons,
    className
  ].filter(Boolean).join(' ');
  
  // Custom style computation
  const customStyles = {
    ...(customColor && { color: customColor }),
    ...(customBackground && { backgroundColor: customBackground })
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'aria-label': ariaLabel || (count !== undefined ? `${count} ${statusText || 'items'}` : statusText),
    'aria-hidden': decorative,
    'role': interactive ? 'button' : count !== undefined ? 'status' : 'img',
    'tabIndex': interactive && !disabled ? 0 : undefined,
    'aria-live': count !== undefined ? 'polite' : undefined,
    'aria-atomic': count !== undefined ? 'true' : undefined
  };
  
  return (
    <span
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
      {icon && !dot && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      
      {!dot && displayContent && (
        <span className={styles.content}>
          {displayContent}
        </span>
      )}
      
      {endIcon && !dot && (
        <span className={styles.endIcon} aria-hidden="true">
          {endIcon}
        </span>
      )}
      
      {dot && (
        <span className={styles.dotIndicator} aria-hidden="true" />
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
