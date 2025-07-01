"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FiCamera, FiCameraOff, FiAlertTriangle, FiLoader, FiCheck, FiWifi, FiMic } from 'react-icons/fi';
import clsx from 'clsx';
import styles from './camerastatusindicator.module.css';

// Enhanced TypeScript interfaces for camera status states
export type CameraStatusState = 
  | 'idle' 
  | 'requesting' 
  | 'active' 
  | 'capturing' 
  | 'processing'
  | 'success'
  | 'error'
  | 'voice-active'
  | 'analyzing';

export type StatusDisplayMode = 'minimal' | 'standard' | 'detailed';

export interface CameraStatusIndicatorProps {
  /** Current camera status state */
  state?: CameraStatusState;
  /** Display mode for the indicator */
  displayMode?: StatusDisplayMode;
  /** Callback when status changes */
  onStatusChange?: (state: CameraStatusState) => void;
  /** Additional status message */
  statusMessage?: string;
  /** Whether to show status text */
  showText?: boolean;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Whether to announce status changes */
  announceChanges?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether to show progress for processing states */
  showProgress?: boolean;
  /** Progress value (0-100) for processing states */
  progress?: number;
  /** Whether to enable live status updates */
  liveUpdates?: boolean;
  /** Custom status messages for different states */
  customMessages?: Partial<Record<CameraStatusState, string>>;
}

// Default status messages
const DEFAULT_STATUS_MESSAGES: Record<CameraStatusState, string> = {
  idle: 'Camera inactive',
  requesting: 'Requesting access...',
  active: 'Camera active',
  capturing: 'Capturing image...',
  processing: 'Processing...',
  success: 'Success',
  error: 'Camera error',
  'voice-active': 'Voice command active',
  analyzing: 'Analyzing image...'
};

// Icons for different states
const STATE_ICONS = {
  idle: FiCamera,
  requesting: FiLoader,
  active: FiCamera,
  capturing: FiCamera,
  processing: FiWifi,
  success: FiCheck,
  error: FiAlertTriangle,
  'voice-active': FiMic,
  analyzing: FiWifi
};

// ARIA announcements for screen readers
const ARIA_ANNOUNCEMENTS: Record<CameraStatusState, string> = {
  idle: 'Camera is inactive and ready for activation.',
  requesting: 'Requesting camera permission. Please allow access.',
  active: 'Camera is active and ready for use.',
  capturing: 'Capturing image from camera feed.',
  processing: 'Processing captured image.',
  success: 'Operation completed successfully.',
  error: 'Camera error occurred. Please check permissions and availability.',
  'voice-active': 'Voice command mode is active.',
  analyzing: 'Analyzing captured image for product matches.'
};

/**
 * CameraStatusIndicator Atom Component
 * 
 * Enhanced status indicator with real-time announcements,
 * progress tracking, and comprehensive accessibility.
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Real-time status announcements
 * - Progress tracking for processing states
 * - Multiple display modes
 * - Live status updates
 * - Screen reader support
 * - Touch-optimized for mobile
 * - Dark mode and high contrast support
 * - Reduced motion preferences
 */
export const CameraStatusIndicator: React.FC<CameraStatusIndicatorProps> = ({
  state = 'idle',
  displayMode = 'standard',
  onStatusChange,
  statusMessage,
  showText = true,
  showIcon = true,
  announceChanges = true,
  className,
  ariaLabel,
  showProgress = false,
  progress = 0,
  liveUpdates = true,
  customMessages = {}
}) => {
  const [internalState, setInternalState] = useState<CameraStatusState>(state);
  const [announcement, setAnnouncement] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Merge custom messages with defaults
  const statusMessages = { ...DEFAULT_STATUS_MESSAGES, ...customMessages };

  // Get current icon component
  const IconComponent = STATE_ICONS[internalState];

  // Handle status change announcements
  useEffect(() => {
    if (announceChanges && state !== internalState) {
      setInternalState(state);
      setAnnouncement(ARIA_ANNOUNCEMENTS[state]);
      setLastUpdateTime(new Date());
      onStatusChange?.(state);
    }
  }, [state, internalState, announceChanges, onStatusChange]);

  // Generate accessible label
  const accessibleLabel = ariaLabel || ARIA_ANNOUNCEMENTS[internalState];

  // Get status text to display
  const getStatusText = useCallback(() => {
    if (statusMessage) return statusMessage;
    return statusMessages[internalState];
  }, [statusMessage, statusMessages, internalState]);

  // Format time since last update
  const getTimeSinceUpdate = useCallback(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdateTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 1) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return 'over 1h ago';
  }, [lastUpdateTime]);

  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress || !['processing', 'analyzing', 'capturing'].includes(internalState)) {
      return null;
    }

    return (
      <div className={styles.progressContainer} aria-hidden="true">
        <div 
          className={styles.progressBar}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    );
  };

  // Render indicator based on display mode
  const renderIndicator = () => {
    switch (displayMode) {
      case 'minimal':
        return (
          <div className={styles.minimalIndicator}>
            {showIcon && (
              <IconComponent 
                className={styles.icon}
                aria-hidden="true"
              />
            )}
          </div>
        );

      case 'detailed':
        return (
          <div className={styles.detailedIndicator}>
            {showIcon && (
              <IconComponent 
                className={styles.icon}
                aria-hidden="true"
              />
            )}
            {showText && (
              <div className={styles.textContainer}>
                <div className={styles.statusText}>
                  {getStatusText()}
                </div>
                {liveUpdates && (
                  <div className={styles.timestampText}>
                    {getTimeSinceUpdate()}
                  </div>
                )}
              </div>
            )}
            {renderProgress()}
          </div>
        );

      default: // standard
        return (
          <div className={styles.standardIndicator}>
            {showIcon && (
              <IconComponent 
                className={styles.icon}
                aria-hidden="true"
              />
            )}
            {showText && (
              <div className={styles.statusText}>
                {getStatusText()}
              </div>
            )}
            {renderProgress()}
          </div>
        );
    }
  };

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
      
      {/* Main status indicator */}
      <div
        className={clsx(
          styles.statusIndicator,
          styles[internalState],
          styles[displayMode],
          className
        )}
        role="status"
        aria-label={accessibleLabel}
        aria-describedby={`camera-status-${internalState}`}
      >
        {renderIndicator()}
      </div>

      {/* Hidden descriptions for screen readers */}
      <div id={`camera-status-${internalState}`} className="sr-only">
        {internalState === 'idle' && 'Camera status indicator showing inactive state. Camera is ready for activation.'}
        {internalState === 'requesting' && 'Camera status indicator showing permission request. Please allow camera access.'}
        {internalState === 'active' && 'Camera status indicator showing active state. Camera is working normally.'}
        {internalState === 'capturing' && 'Camera status indicator showing capture in progress.'}
        {internalState === 'processing' && 'Camera status indicator showing image processing.'}
        {internalState === 'success' && 'Camera status indicator showing successful operation.'}
        {internalState === 'error' && 'Camera status indicator showing error state. Please check camera permissions and availability.'}
        {internalState === 'voice-active' && 'Camera status indicator showing voice command mode is active.'}
        {internalState === 'analyzing' && 'Camera status indicator showing image analysis in progress.'}
      </div>
    </>
  );
};

// Custom hook for camera status management
export const useCameraStatus = () => {
  const [statusState, setStatusState] = useState<CameraStatusState>('idle');
  const [statusHistory, setStatusHistory] = useState<Array<{
    state: CameraStatusState;
    timestamp: Date;
    message?: string;
  }>>([]);
  const [progress, setProgress] = useState<number>(0);

  const updateStatus = useCallback((
    newState: CameraStatusState, 
    message?: string, 
    progressValue?: number
  ) => {
    setStatusState(newState);
    
    if (progressValue !== undefined) {
      setProgress(progressValue);
    }
    
    // Add to history
    setStatusHistory(prev => [
      ...prev,
      {
        state: newState,
        timestamp: new Date(),
        message
      }
    ].slice(-10)); // Keep last 10 status updates
  }, []);

  const resetStatus = useCallback(() => {
    setStatusState('idle');
    setProgress(0);
  }, []);

  const getLastStatusUpdate = useCallback(() => {
    return statusHistory[statusHistory.length - 1] || null;
  }, [statusHistory]);

  return {
    statusState,
    statusHistory,
    progress,
    updateStatus,
    resetStatus,
    getLastStatusUpdate,
    isActive: statusState === 'active',
    isProcessing: ['processing', 'analyzing', 'capturing'].includes(statusState),
    hasError: statusState === 'error',
    isSuccess: statusState === 'success'
  };
};

export default CameraStatusIndicator; 