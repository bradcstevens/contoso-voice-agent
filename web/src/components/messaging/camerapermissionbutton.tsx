"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FiCamera, FiCameraOff, FiAlertTriangle, FiCheck, FiLoader } from 'react-icons/fi';
import clsx from 'clsx';
import styles from './camerapermissionbutton.module.css';

// Enhanced TypeScript interfaces for camera permission states
export type CameraPermissionState = 
  | 'idle' 
  | 'requesting' 
  | 'granted' 
  | 'denied' 
  | 'error';

export interface CameraPermissionButtonProps {
  /** Current permission state */
  state?: CameraPermissionState;
  /** Callback when permission is requested */
  onRequestPermission?: () => void;
  /** Callback when permission state changes */
  onPermissionChange?: (state: CameraPermissionState) => void;
  /** Custom button text for different states */
  text?: {
    idle?: string;
    requesting?: string;
    granted?: string;
    denied?: string;
    error?: string;
  };
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'default' | 'small' | 'large';
  /** Auto-request permission on mount */
  autoRequest?: boolean;
}

// Default text for different states
const DEFAULT_TEXT = {
  idle: 'Enable Camera',
  requesting: 'Requesting Access...',
  granted: 'Camera Ready',
  denied: 'Camera Denied',
  error: 'Camera Error'
};

// Icons for different states
const STATE_ICONS = {
  idle: FiCamera,
  requesting: FiLoader,
  granted: FiCheck,
  denied: FiCameraOff,
  error: FiAlertTriangle
};

// ARIA announcements for screen readers
const ARIA_ANNOUNCEMENTS = {
  idle: 'Camera permission required. Click to enable camera access.',
  requesting: 'Requesting camera permission. Please wait.',
  granted: 'Camera permission granted. Camera is ready for use.',
  denied: 'Camera permission denied. Click to try again or check browser settings.',
  error: 'Camera error occurred. Click to retry or check camera availability.'
};

/**
 * CameraPermissionButton Atom Component
 * 
 * Enhanced camera permission button with comprehensive accessibility,
 * multi-modal integration, and performance optimization.
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Multiple permission states
 * - Touch-optimized for mobile
 * - Dark mode and high contrast support
 * - Reduced motion preferences
 */
export const CameraPermissionButton: React.FC<CameraPermissionButtonProps> = ({
  state = 'idle',
  onRequestPermission,
  onPermissionChange,
  text = {},
  disabled = false,
  className,
  ariaLabel,
  showIcon = true,
  size = 'default',
  autoRequest = false
}) => {
  const [internalState, setInternalState] = useState<CameraPermissionState>(state);
  const [announcement, setAnnouncement] = useState<string>('');

  // Merge custom text with defaults
  const buttonText = { ...DEFAULT_TEXT, ...text };

  // Get current icon component
  const IconComponent = STATE_ICONS[internalState];

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    if (disabled || internalState === 'requesting') return;

    setInternalState('requesting');
    setAnnouncement(ARIA_ANNOUNCEMENTS.requesting);
    
    try {
      // Request camera permission using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } 
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setInternalState('granted');
      setAnnouncement(ARIA_ANNOUNCEMENTS.granted);
      onPermissionChange?.('granted');
      
    } catch (error) {
      console.error('Camera permission error:', error);
      
      // Determine error type for better user feedback
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setInternalState('denied');
          setAnnouncement(ARIA_ANNOUNCEMENTS.denied);
          onPermissionChange?.('denied');
        } else {
          setInternalState('error');
          setAnnouncement(ARIA_ANNOUNCEMENTS.error);
          onPermissionChange?.('error');
        }
      } else {
        setInternalState('error');
        setAnnouncement(ARIA_ANNOUNCEMENTS.error);
        onPermissionChange?.('error');
      }
    }
  }, [disabled, internalState, onPermissionChange]);

  // Handle button click
  const handleClick = useCallback(() => {
    if (internalState === 'granted') {
      // Camera is already granted, possibly trigger camera activation
      onRequestPermission?.();
    } else {
      // Request permission
      handleRequestPermission();
      onRequestPermission?.();
    }
  }, [internalState, handleRequestPermission, onRequestPermission]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Auto-request permission on mount if enabled
  useEffect(() => {
    if (autoRequest && internalState === 'idle') {
      handleRequestPermission();
    }
  }, [autoRequest, internalState, handleRequestPermission]);

  // Update internal state when prop changes
  useEffect(() => {
    setInternalState(state);
    setAnnouncement(ARIA_ANNOUNCEMENTS[state]);
  }, [state]);

  // Generate accessible label
  const accessibleLabel = ariaLabel || ARIA_ANNOUNCEMENTS[internalState];

  // Determine if button should be interactive
  const isInteractive = !disabled && internalState !== 'requesting';

  return (
    <>
      {/* Screen reader announcement region */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Main button */}
      <button
        type="button"
        className={clsx(
          styles.permissionButton,
          styles[internalState],
          styles[size],
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={accessibleLabel}
        aria-describedby={`camera-permission-${internalState}`}
        tabIndex={isInteractive ? 0 : -1}
      >
        {showIcon && (
          <IconComponent 
            className={styles.icon}
            aria-hidden="true"
          />
        )}
        <span>{buttonText[internalState]}</span>
      </button>

      {/* Hidden descriptions for screen readers */}
      <div id={`camera-permission-${internalState}`} className="sr-only">
        {internalState === 'idle' && 'Camera access is required for visual product search. This will open a browser permission dialog.'}
        {internalState === 'requesting' && 'Please allow camera access in the browser permission dialog that appeared.'}
        {internalState === 'granted' && 'Camera access granted successfully. You can now use visual search features.'}
        {internalState === 'denied' && 'Camera access was denied. You can try again or manually enable camera permission in your browser settings.'}
        {internalState === 'error' && 'Camera is not available. Please check that your camera is connected and not being used by another application.'}
      </div>
    </>
  );
};

// Custom hook for camera permission management
export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const requestPermission = useCallback(async (): Promise<CameraPermissionState> => {
    setPermissionState('requesting');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } 
      });
      
      setStream(mediaStream);
      setPermissionState('granted');
      return 'granted';
      
    } catch (error) {
      console.error('Camera permission error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          return 'denied';
        } else {
          setPermissionState('error');
          return 'error';
        }
      }
      
      setPermissionState('error');
      return 'error';
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setPermissionState('idle');
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    permissionState,
    stream,
    requestPermission,
    stopStream,
    isGranted: permissionState === 'granted',
    isRequesting: permissionState === 'requesting',
    hasError: permissionState === 'error' || permissionState === 'denied'
  };
};

export default CameraPermissionButton; 