/**
 * SPINNER ATOM - ENHANCED LOADING INDICATOR SYSTEM
 * 
 * Comprehensive spinner component with multiple animation types,
 * accessibility features, progress indication, and multi-modal support.
 */

import React, { forwardRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Spinner.module.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Type of spinner animation */
  type?: 'circle' | 'dots' | 'bars' | 'pulse' | 'ring' | 'bounce';
  
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  
  /** Progress value for determinate loading (0-100) */
  progress?: number;
  
  /** Whether this is a determinate progress indicator */
  determinate?: boolean;
  
  /** Label for screen readers */
  label?: string;
  
  /** Additional description for complex loading states */
  description?: string;
  
  /** Multi-modal context for enhanced styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Custom color override */
  color?: string;
  
  /** Whether to show progress percentage text */
  showProgress?: boolean;
  
  /** Whether the spinner should be centered in its container */
  centered?: boolean;
  
  /** Whether to use reduced animation for accessibility */
  reduceMotion?: boolean;
  
  /** Thickness of the spinner stroke/border */
  thickness?: number;
  
  /** Custom track color for ring/circle spinners */
  trackColor?: string;
  
  /** Whether the spinner represents a background process */
  background?: boolean;
}

/**
 * Enhanced Spinner atom with comprehensive loading indication features
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({
  type = 'circle',
  size = 'md',
  variant = 'default',
  speed = 'normal',
  progress,
  determinate = false,
  label = 'Loading',
  description,
  modalityContext,
  color,
  showProgress = false,
  centered = false,
  reduceMotion = false,
  thickness = 2,
  trackColor,
  background = false,
  className = '',
  ...rest
}, ref) => {
  // Determine if this is a progress spinner
  const isProgress = determinate || progress !== undefined;
  const progressValue = Math.min(Math.max(progress || 0, 0), 100);
  
  // Class computation
  const computedClassName = [
    styles.spinner,
    styles[type],
    styles[size],
    styles[variant],
    styles[speed],
    modalityContext && styles[modalityContext],
    centered && styles.centered,
    reduceMotion && styles.reduceMotion,
    background && styles.background,
    isProgress && styles.progress,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(color && { '--spinner-color': color }),
    ...(trackColor && { '--track-color': trackColor }),
    ...(thickness && { '--thickness': `${thickness}px` }),
    ...(isProgress && { '--progress': `${progressValue}%` })
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'status',
    'aria-label': label,
    'aria-describedby': description ? `${rest.id || 'spinner'}-description` : undefined,
    'aria-valuemin': isProgress ? 0 : undefined,
    'aria-valuemax': isProgress ? 100 : undefined,
    'aria-valuenow': isProgress ? progressValue : undefined,
    'aria-live': isProgress ? 'polite' : 'off',
    'aria-busy': 'true'
  };
  
  // Render different spinner types
  const renderSpinnerContent = () => {
    switch (type) {
      case 'circle':
        return (
          <svg className={styles.svg} viewBox="0 0 50 50">
            {trackColor && (
              <circle
                className={styles.track}
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth={thickness}
              />
            )}
            <circle
              className={styles.path}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={isProgress ? undefined : "31.416 31.416"}
              strokeDashoffset={isProgress ? undefined : "31.416"}
              style={isProgress ? {
                strokeDasharray: "125.664",
                strokeDashoffset: `${125.664 - (125.664 * progressValue) / 100}`
              } : undefined}
            />
          </svg>
        );
        
      case 'ring':
        return (
          <svg className={styles.svg} viewBox="0 0 50 50">
            <circle
              className={styles.track}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth={thickness}
            />
            <circle
              className={styles.path}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray="125.664"
              strokeDashoffset={`${125.664 - (125.664 * progressValue) / 100}`}
            />
          </svg>
        );
        
      case 'dots':
        return (
          <div className={styles.dotsContainer}>
            <div className={styles.dot} style={{ animationDelay: '0ms' }} />
            <div className={styles.dot} style={{ animationDelay: '150ms' }} />
            <div className={styles.dot} style={{ animationDelay: '300ms' }} />
          </div>
        );
        
      case 'bars':
        return (
          <div className={styles.barsContainer}>
            <div className={styles.bar} style={{ animationDelay: '0ms' }} />
            <div className={styles.bar} style={{ animationDelay: '100ms' }} />
            <div className={styles.bar} style={{ animationDelay: '200ms' }} />
            <div className={styles.bar} style={{ animationDelay: '300ms' }} />
            <div className={styles.bar} style={{ animationDelay: '400ms' }} />
          </div>
        );
        
      case 'pulse':
        return <div className={styles.pulseCircle} />;
        
      case 'bounce':
        return (
          <div className={styles.bounceContainer}>
            <div className={styles.bounce} style={{ animationDelay: '0ms' }} />
            <div className={styles.bounce} style={{ animationDelay: '160ms' }} />
            <div className={styles.bounce} style={{ animationDelay: '320ms' }} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
      {renderSpinnerContent()}
      
      {showProgress && isProgress && (
        <div className={styles.progressText} aria-hidden="true">
          {Math.round(progressValue)}%
        </div>
      )}
      
      {description && (
        <div 
          id={`${rest.id || 'spinner'}-description`}
          className={styles.description}
        >
          {description}
        </div>
      )}
    </div>
  );
});

Spinner.displayName = 'Spinner';

export default Spinner;
