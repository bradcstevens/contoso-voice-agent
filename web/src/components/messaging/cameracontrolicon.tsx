"use client";

import React, { useCallback, useState } from 'react';
import { 
  FiCamera, 
  FiCameraOff, 
  FiSettings, 
  FiRotateCw, 
  FiZoomIn, 
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiGrid,
  FiSun,
  FiMoon,
  FiMic,
  FiMicOff
} from 'react-icons/fi';
import clsx from 'clsx';
import styles from './cameracontrolicon.module.css';

// Enhanced TypeScript interfaces for camera control icons
export type CameraControlType = 
  | 'camera-toggle'
  | 'settings'
  | 'rotate'
  | 'zoom-in'
  | 'zoom-out'
  | 'fullscreen'
  | 'grid'
  | 'brightness'
  | 'mic-toggle'
  | 'custom';

export type IconState = 'default' | 'active' | 'disabled' | 'hover';

export interface CameraControlIconProps {
  /** Type of camera control */
  type?: CameraControlType;
  /** Current icon state */
  state?: IconState;
  /** Whether the control is active/toggled */
  isActive?: boolean;
  /** Callback when icon is clicked */
  onClick?: () => void;
  /** Callback when state changes */
  onStateChange?: (state: IconState) => void;
  /** Custom icon component (for type='custom') */
  customIcon?: React.ComponentType<any>;
  /** Additional CSS class name */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether the icon is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'default' | 'large';
  /** Whether to show tooltip on hover */
  showTooltip?: boolean;
  /** Custom tooltip text */
  tooltipText?: string;
  /** Whether icon should animate on interaction */
  animate?: boolean;
}

// Default ARIA labels for different control types
const DEFAULT_ARIA_LABELS: Record<CameraControlType, string> = {
  'camera-toggle': 'Toggle camera on/off',
  'settings': 'Open camera settings',
  'rotate': 'Rotate camera view',
  'zoom-in': 'Zoom in',
  'zoom-out': 'Zoom out',
  'fullscreen': 'Toggle fullscreen mode',
  'grid': 'Toggle grid overlay',
  'brightness': 'Adjust brightness',
  'mic-toggle': 'Toggle microphone on/off',
  'custom': 'Camera control'
};

// Icons for different control types
const CONTROL_ICONS: Record<CameraControlType, React.ComponentType<any>> = {
  'camera-toggle': FiCamera,
  'settings': FiSettings,
  'rotate': FiRotateCw,
  'zoom-in': FiZoomIn,
  'zoom-out': FiZoomOut,
  'fullscreen': FiMaximize,
  'grid': FiGrid,
  'brightness': FiSun,
  'mic-toggle': FiMic,
  'custom': FiCamera
};

// Alternative icons for active states
const ACTIVE_ICONS: Partial<Record<CameraControlType, React.ComponentType<any>>> = {
  'camera-toggle': FiCameraOff,
  'fullscreen': FiMinimize,
  'brightness': FiMoon,
  'mic-toggle': FiMicOff
};

// Tooltip text for different control types
const DEFAULT_TOOLTIPS: Record<CameraControlType, string> = {
  'camera-toggle': 'Camera',
  'settings': 'Settings',
  'rotate': 'Rotate',
  'zoom-in': 'Zoom In',
  'zoom-out': 'Zoom Out',
  'fullscreen': 'Fullscreen',
  'grid': 'Grid',
  'brightness': 'Brightness',
  'mic-toggle': 'Microphone',
  'custom': 'Control'
};

/**
 * CameraControlIcon Atom Component
 * 
 * Enhanced camera control icon with proper ARIA labeling,
 * interactive states, and visual enhancements.
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Multiple control types with appropriate icons
 * - Interactive states (hover, active, disabled)
 * - Tooltip support
 * - Animation options
 * - Keyboard navigation
 * - Touch-optimized for mobile
 * - Dark mode and high contrast support
 * - Reduced motion preferences
 */
export const CameraControlIcon: React.FC<CameraControlIconProps> = ({
  type = 'camera-toggle',
  state = 'default',
  isActive = false,
  onClick,
  onStateChange,
  customIcon,
  className,
  ariaLabel,
  disabled = false,
  size = 'default',
  showTooltip = false,
  tooltipText,
  animate = true
}) => {
  const [internalState, setInternalState] = useState<IconState>(state);
  const [showTooltipState, setShowTooltipState] = useState<boolean>(false);

  // Get the appropriate icon component
  const getIconComponent = useCallback(() => {
    if (type === 'custom' && customIcon) {
      return customIcon;
    }
    
    // Use active icon if available and control is active
    if (isActive && ACTIVE_ICONS[type]) {
      return ACTIVE_ICONS[type]!;
    }
    
    return CONTROL_ICONS[type];
  }, [type, isActive, customIcon]);

  const IconComponent = getIconComponent();

  // Handle click
  const handleClick = useCallback(() => {
    if (disabled) return;
    
    setInternalState('active');
    onClick?.();
    
    // Reset state after animation
    if (animate) {
      setTimeout(() => {
        setInternalState(disabled ? 'disabled' : 'default');
      }, 150);
    }
  }, [disabled, onClick, animate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Handle mouse events for tooltip
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setInternalState('hover');
      setShowTooltipState(true);
      onStateChange?.('hover');
    }
  }, [disabled, onStateChange]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled) {
      setInternalState('default');
      setShowTooltipState(false);
      onStateChange?.('default');
    }
  }, [disabled, onStateChange]);

  // Generate accessible label
  const accessibleLabel = ariaLabel || DEFAULT_ARIA_LABELS[type];

  // Get tooltip text
  const getTooltipText = useCallback(() => {
    if (tooltipText) return tooltipText;
    return DEFAULT_TOOLTIPS[type];
  }, [tooltipText, type]);

  // Determine if icon should be interactive
  const isInteractive = !disabled;

  return (
    <div className={styles.iconContainer}>
      {/* Main control icon */}
      <button
        type="button"
        className={clsx(
          styles.controlIcon,
          styles[type],
          styles[internalState],
          styles[size],
          {
            [styles.active]: isActive,
            [styles.disabled]: disabled,
            [styles.animate]: animate
          },
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        aria-label={accessibleLabel}
        aria-pressed={type === 'camera-toggle' || type === 'mic-toggle' ? isActive : undefined}
        tabIndex={isInteractive ? 0 : -1}
      >
        <IconComponent 
          className={styles.icon}
          aria-hidden="true"
        />
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div 
          className={styles.tooltip}
          role="tooltip"
          aria-hidden="true"
        >
          {getTooltipText()}
        </div>
      )}
    </div>
  );
};

// Custom hook for camera control management
export const useCameraControls = () => {
  const [controls, setControls] = useState<Record<string, boolean>>({
    camera: false,
    microphone: false,
    fullscreen: false,
    grid: false,
    brightness: false
  });

  const toggleControl = useCallback((controlType: string) => {
    setControls(prev => ({
      ...prev,
      [controlType]: !prev[controlType]
    }));
  }, []);

  const setControl = useCallback((controlType: string, value: boolean) => {
    setControls(prev => ({
      ...prev,
      [controlType]: value
    }));
  }, []);

  const resetControls = useCallback(() => {
    setControls({
      camera: false,
      microphone: false,
      fullscreen: false,
      grid: false,
      brightness: false
    });
  }, []);

  return {
    controls,
    toggleControl,
    setControl,
    resetControls,
    isCameraActive: controls.camera,
    isMicrophoneActive: controls.microphone,
    isFullscreenActive: controls.fullscreen,
    isGridActive: controls.grid,
    isBrightnessActive: controls.brightness
  };
};

export default CameraControlIcon; 