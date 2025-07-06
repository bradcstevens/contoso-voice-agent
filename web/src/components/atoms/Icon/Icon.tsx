/**
 * ICON ATOM - ENHANCED SVG ICON SYSTEM
 * 
 * Comprehensive icon component with accessibility, multi-modal support,
 * and performance optimization for the Contoso Voice Agent design system.
 */

import React, { forwardRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './Icon.module.css';

// Icon name type - extensible for new icons
export type IconName = 
  // Core UI Icons
  | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevron-down'
  | 'check' | 'x' | 'plus' | 'minus' | 'search' | 'filter'
  | 'settings' | 'user' | 'home' | 'menu' | 'more'
  | 'info' | 'warning' | 'error' | 'success'
  | 'eye' | 'eye-off' | 'edit' | 'delete' | 'download' | 'upload'
  
  // Voice-Specific Icons
  | 'microphone' | 'microphone-off' | 'volume' | 'volume-off'
  | 'phone' | 'phone-off' | 'headphones' | 'speaker'
  
  // Camera-Specific Icons  
  | 'camera' | 'camera-off' | 'video' | 'video-off'
  | 'capture' | 'flash' | 'flash-off' | 'focus' | 'zoom-in' | 'zoom-out'
  
  // Multi-Modal Icons
  | 'sync' | 'sync-off' | 'play' | 'pause' | 'stop' | 'record'
  | 'accessibility' | 'keyboard' | 'screen-reader';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Name of the icon to display */
  name: IconName;
  
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
  
  /** Multi-modal context styling */
  modalityContext?: 'voice' | 'camera' | 'text' | 'multimodal';
  
  /** Whether the icon should be interactive (hover effects) */
  interactive?: boolean;
  
  /** Custom color (overrides variant) */
  color?: string;
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  
  /** Whether the icon is purely decorative (aria-hidden) */
  decorative?: boolean;
  
  /** Custom className */
  className?: string;
}

// SVG path definitions for icons
const iconPaths: Record<IconName, string | { path: string; viewBox?: string }> = {
  // Core UI Icons
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-up': 'M18 15l-6-6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'check': 'M20 6L9 17l-5-5',
  'x': 'M18 6L6 18M6 6l12 12',
  'plus': 'M12 5v14m-7-7h14',
  'minus': 'M5 12h14',
  'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  'filter': 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  'settings': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
  'user': 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  'home': 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  'menu': 'M3 12h18M3 6h18M3 18h18',
  'more': 'M12 5v.01M12 12v.01M12 19v.01',
  'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  'error': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'success': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'eye': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  'eye-off': 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22',
  'edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.5 2.5 0 113.54 3.54L11.46 20H7v-4.54l8.04-8.04z',
  'delete': 'M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6',
  'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  'upload': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  
  // Voice-Specific Icons
  'microphone': 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  'microphone-off': 'M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2M15 7h.01M12 19v4M8 23h8',
  'volume': 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93A10 10 0 0122 12a10 10 0 01-2.93 7.07M15.54 8.46A5 5 0 0117 12a5 5 0 01-1.46 3.54',
  'volume-off': 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  'phone': 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  'phone-off': 'M10.68 13.31a16 16 0 01-3.37-3.37M1 1l22 22M16.95 20.87A2 2 0 0115.92 22h-3a2 2 0 01-2-1.72 12.84 12.84 0 01-.7-2.81 2 2 0 01.45-2.11L12 13.09a16 16 0 01-6-6l-1.27 1.27a2 2 0 01-2.11.45 12.84 12.84 0 01-2.81-.7A2 2 0 012 6.08v-3a2 2 0 012.18-2',
  'headphones': 'M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z',
  'speaker': 'M9 12a3 3 0 000 6h3v-6H9zM12 6V4a2 2 0 012-2h1a2 2 0 012 2v2h-3a2 2 0 00-2 2v6a2 2 0 002 2h3v2a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2H9a5 5 0 010-10h3z',
  
  // Camera-Specific Icons
  'camera': 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z',
  'camera-off': 'M1 1l22 22M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9M16 10a4 4 0 01-1.17 2.83',
  'video': 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v8a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
  'video-off': 'M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l7-5v8zM1 1l22 22',
  'capture': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'flash': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'flash-off': 'M17 10h-4l3-8H8.87L7 10.18M13 16v6l8.5-12M1 1l22 22',
  'focus': 'M8 3H5a2 2 0 00-2 2v3m6 0V4m0 0h3m-3 0L9 4M8 21H5a2 2 0 01-2-2v-3m6 0v4m0 0h3m-3 0l-3 4M16 3h3a2 2 0 012 2v3m-6 0V4m0 0h-3m3 0l3 4M16 21h3a2 2 0 002-2v-3m-6 0v4m0 0h-3m3 0l3-4',
  'zoom-in': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6M7 10h6',
  'zoom-out': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6',
  
  // Multi-Modal Icons
  'sync': 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15',
  'sync-off': 'M1 4v6h6M23 20v-6h-6M8.84 8.84a9 9 0 106.32 6.32M1 1l22 22',
  'play': 'M8 5v14l11-7z',
  'pause': 'M6 4h4v16H6V4zM14 4h4v16h-4V4z',
  'stop': 'M5 5h14v14H5z',
  'record': 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 110 8 4 4 0 010-8z',
  'accessibility': 'M12 2a2 2 0 100 4 2 2 0 000-4zM21 9h-6l-2-4-2 4H5l2 4h2v6h6v-6h2l2-4z',
  'keyboard': 'M2 6a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10',
  'screen-reader': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6zM8 21h8M12 17v4'
};

/**
 * Enhanced Icon atom with comprehensive multi-modal support
 */
export const Icon = forwardRef<SVGElement, IconProps>(({
  name,
  size = 'md',
  variant = 'default',
  modalityContext,
  interactive = false,
  color,
  ariaLabel,
  decorative = false,
  className = '',
  ...rest
}, ref) => {
  const iconDefinition = iconPaths[name];
  
  if (!iconDefinition) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const pathData = typeof iconDefinition === 'string' 
    ? iconDefinition 
    : iconDefinition.path;
  
  const viewBox = typeof iconDefinition === 'object' && iconDefinition.viewBox 
    ? iconDefinition.viewBox 
    : '0 0 24 24';

  // Size calculation
  const sizeValue = typeof size === 'number' 
    ? `${size}px` 
    : undefined;

  const computedClassName = [
    styles.icon,
    typeof size === 'string' && styles[size],
    styles[variant],
    modalityContext && styles[modalityContext],
    interactive && styles.interactive,
    className
  ].filter(Boolean).join(' ');

  const svgStyle = {
    ...(color && { color }),
    ...(sizeValue && { width: sizeValue, height: sizeValue })
  };

  return (
    <svg
      ref={ref}
      className={computedClassName}
      style={svgStyle}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel}
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
      {...rest}
    >
      <path d={pathData} />
    </svg>
  );
});

Icon.displayName = 'Icon';

export default Icon;
