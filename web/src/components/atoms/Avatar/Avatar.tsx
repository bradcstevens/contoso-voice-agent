/**
 * AVATAR ATOM - ENHANCED USER PROFILE DISPLAY SYSTEM
 * 
 * Comprehensive avatar component with image display, fallback handling,
 * status indicators, accessibility features, and multi-modal support.
 */

import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Avatar.module.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  
  /** Alt text for the image */
  alt?: string;
  
  /** Name for generating initials fallback */
  name?: string;
  
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /** Shape of the avatar */
  shape?: 'circle' | 'square' | 'rounded';
  
  /** Status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  
  /** Whether to show status indicator */
  showStatus?: boolean;
  
  /** Custom fallback content */
  fallback?: React.ReactNode;
  
  /** Custom icon when no image/name is provided */
  icon?: React.ReactNode;
  
  /** Whether the avatar is interactive (clickable) */
  interactive?: boolean;
  
  /** Whether the avatar is disabled */
  disabled?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Multi-modal context for enhanced styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Custom color for initials background */
  color?: string;
  
  /** Custom background color */
  backgroundColor?: string;
  
  /** Border configuration */
  border?: boolean;
  
  /** Border color */
  borderColor?: string;
  
  /** Border width */
  borderWidth?: number;
  
  /** Whether the avatar represents a group */
  isGroup?: boolean;
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  
  /** Role for the avatar element */
  role?: string;
  
  /** Callback when image fails to load */
  onImageError?: (error: React.SyntheticEvent<HTMLImageElement>) => void;
  
  /** Callback when image loads successfully */
  onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Enhanced Avatar atom with comprehensive image display and fallback handling
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  fallback,
  icon,
  interactive = false,
  disabled = false,
  loading = false,
  modalityContext,
  color,
  backgroundColor,
  border = false,
  borderColor,
  borderWidth = 2,
  isGroup = false,
  ariaLabel,
  role = 'img',
  onImageError,
  onImageLoad,
  className = '',
  ...rest
}, ref) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Generate initials from name
  const initials = useMemo(() => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);
  
  // Generate color based on name
  const generatedColor = useMemo(() => {
    if (!name) return '#71717a';
    
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#f97316', '#84cc16', '#06b6d4', '#6366f1'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }, [name]);
  
  // Handle image load events
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.(event);
  }, [onImageLoad]);
  
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(false);
    setImageError(true);
    onImageError?.(event);
  }, [onImageError]);
  
  // Determine what to display
  const shouldShowImage = src && !imageError;
  const shouldShowInitials = !shouldShowImage && initials && !fallback;
  const shouldShowIcon = !shouldShowImage && !initials && !fallback && icon;
  const shouldShowFallback = !shouldShowImage && !initials && !icon && fallback;
  
  // Class computation
  const computedClassName = [
    styles.avatar,
    styles[size],
    styles[shape],
    modalityContext && styles[modalityContext],
    interactive && styles.interactive,
    disabled && styles.disabled,
    loading && styles.loading,
    border && styles.withBorder,
    isGroup && styles.group,
    showStatus && styles.withStatus,
    className
  ].filter(Boolean).join(' ');
  
  // Status indicator class
  const statusClassName = [
    styles.status,
    status && styles[status]
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(backgroundColor && { backgroundColor }),
    ...(borderColor && { borderColor }),
    ...(borderWidth && { borderWidth: `${borderWidth}px` }),
    ...(color && { color })
  };
  
  const initialsStyles = {
    backgroundColor: backgroundColor || generatedColor,
    color: color || '#ffffff'
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'aria-label': ariaLabel || (name ? `${name}'s avatar` : 'User avatar'),
    'role': role,
    'tabIndex': interactive && !disabled ? 0 : undefined,
    'aria-busy': loading,
    'aria-disabled': disabled
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
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
      
      {!loading && (
        <>
          {shouldShowImage && (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className={styles.image}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          )}
          
          {shouldShowInitials && (
            <div 
              className={styles.initials}
              style={initialsStyles}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}
          
          {shouldShowIcon && (
            <div className={styles.icon} aria-hidden="true">
              {icon}
            </div>
          )}
          
          {shouldShowFallback && (
            <div className={styles.fallback} aria-hidden="true">
              {fallback}
            </div>
          )}
        </>
      )}
      
      {showStatus && status && (
        <div 
          className={statusClassName}
          aria-label={`Status: ${status}`}
          role="status"
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
