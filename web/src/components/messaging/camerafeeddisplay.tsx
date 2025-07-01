"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCamera, FiCameraOff, FiAlertTriangle, FiLoader, FiWifi } from 'react-icons/fi';
import clsx from 'clsx';
import styles from './camerafeeddisplay.module.css';

// Enhanced TypeScript interfaces for camera feed states
export type CameraFeedState = 
  | 'idle' 
  | 'requesting' 
  | 'active' 
  | 'capturing' 
  | 'processing'
  | 'error';

export interface CameraFeedDisplayProps {
  /** Current camera feed state */
  state?: CameraFeedState;
  /** Media stream from camera */
  stream?: MediaStream | null;
  /** Callback when capture is requested */
  onCapture?: () => void;
  /** Callback when feed state changes */
  onStateChange?: (state: CameraFeedState) => void;
  /** Whether the feed should auto-play */
  autoPlay?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether to show status indicator */
  showStatusIndicator?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Placeholder text for different states */
  placeholderText?: {
    idle?: string;
    requesting?: string;
    error?: string;
  };
  /** Whether feed is clickable for capture */
  clickToCapture?: boolean;
  /** Target frame rate for optimization */
  targetFrameRate?: number;
}

// Default placeholder text for different states
const DEFAULT_PLACEHOLDER_TEXT = {
  idle: 'Camera not active',
  requesting: 'Requesting camera access...',
  error: 'Camera not available'
};

// Icons for different states
const STATE_ICONS = {
  idle: FiCamera,
  requesting: FiLoader,
  active: FiCamera,
  capturing: FiCamera,
  processing: FiWifi,
  error: FiAlertTriangle
};

// ARIA announcements for screen readers
const ARIA_ANNOUNCEMENTS = {
  idle: 'Camera feed not active. Camera is ready for activation.',
  requesting: 'Requesting camera access. Please wait.',
  active: 'Camera feed is active and displaying live video.',
  capturing: 'Capturing image from camera feed.',
  processing: 'Processing captured image. Please wait.',
  error: 'Camera error occurred. Camera feed is not available.'
};

/**
 * CameraFeedDisplay Atom Component
 * 
 * Enhanced camera feed display with comprehensive accessibility,
 * real-time video processing, and performance optimization.
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - 30fps video feed optimization
 * - Screen reader announcements
 * - Multiple camera states
 * - Touch-optimized for mobile
 * - Dark mode and high contrast support
 * - Reduced motion preferences
 * - Memory leak prevention
 */
export const CameraFeedDisplay: React.FC<CameraFeedDisplayProps> = ({
  state = 'idle',
  stream,
  onCapture,
  onStateChange,
  autoPlay = true,
  className,
  ariaLabel,
  showStatusIndicator = true,
  errorMessage,
  placeholderText = {},
  clickToCapture = true,
  targetFrameRate = 30
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalState, setInternalState] = useState<CameraFeedState>(state);
  const [announcement, setAnnouncement] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Merge custom placeholder text with defaults
  const placeholder = { ...DEFAULT_PLACEHOLDER_TEXT, ...placeholderText };

  // Get current icon component
  const IconComponent = STATE_ICONS[internalState];

  // Handle video element setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream && internalState === 'active') {
      video.srcObject = stream;
      
      if (autoPlay) {
        video.play().then(() => {
          setIsVideoPlaying(true);
          setAnnouncement(ARIA_ANNOUNCEMENTS.active);
        }).catch((error) => {
          console.error('Video play error:', error);
          setInternalState('error');
          setAnnouncement(ARIA_ANNOUNCEMENTS.error);
          onStateChange?.('error');
        });
      }
    } else {
      video.srcObject = null;
      setIsVideoPlaying(false);
    }

    // Cleanup function
    return () => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, internalState, autoPlay, onStateChange]);

  // Handle click to capture
  const handleClick = useCallback(() => {
    if (clickToCapture && internalState === 'active' && isVideoPlaying) {
      setInternalState('capturing');
      setAnnouncement(ARIA_ANNOUNCEMENTS.capturing);
      onCapture?.();
      
      // Reset to active state after capture animation
      setTimeout(() => {
        setInternalState('active');
        setAnnouncement(ARIA_ANNOUNCEMENTS.active);
      }, 200);
    }
  }, [clickToCapture, internalState, isVideoPlaying, onCapture]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Update internal state when prop changes
  useEffect(() => {
    setInternalState(state);
    setAnnouncement(ARIA_ANNOUNCEMENTS[state]);
  }, [state]);

  // Generate accessible label
  const accessibleLabel = ariaLabel || ARIA_ANNOUNCEMENTS[internalState];

  // Determine if feed should be interactive
  const isInteractive = clickToCapture && internalState === 'active' && isVideoPlaying;

  // Render placeholder content
  const renderPlaceholder = () => {
    if (internalState === 'error') {
      return (
        <div className={styles.errorState}>
          <IconComponent className={styles.icon} aria-hidden="true" />
          <div className={styles.text}>
            {errorMessage || 'Camera not available'}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.placeholder}>
        <IconComponent className={styles.icon} aria-hidden="true" />
        <div className={styles.text}>
          {placeholder[internalState as keyof typeof placeholder] || placeholder.idle}
        </div>
        {internalState === 'requesting' && (
          <div className={styles.subtext}>
            Please allow camera access in your browser
          </div>
        )}
      </div>
    );
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
      
      {/* Main camera feed container */}
      <div
        className={clsx(
          styles.feedContainer,
          styles[internalState],
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isInteractive ? 0 : -1}
        role={isInteractive ? "button" : "img"}
        aria-label={accessibleLabel}
        aria-describedby={`camera-feed-${internalState}`}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          className={clsx(
            styles.videoElement,
            isVideoPlaying ? styles.active : styles.loading
          )}
          autoPlay={autoPlay}
          muted
          playsInline
          width="640"
          height="360"
          aria-hidden={!isVideoPlaying}
        />

        {/* Status indicator */}
        {showStatusIndicator && (
          <div 
            className={clsx(styles.statusIndicator, styles[internalState])}
            aria-hidden="true"
          />
        )}

        {/* Overlay for non-active states */}
        <div 
          className={clsx(
            styles.overlay,
            (internalState === 'active' && isVideoPlaying) ? styles.hidden : styles.visible
          )}
        >
          {renderPlaceholder()}
        </div>
      </div>

      {/* Hidden descriptions for screen readers */}
      <div id={`camera-feed-${internalState}`} className="sr-only">
        {internalState === 'idle' && 'Camera feed is not active. Activate camera to see live video feed.'}
        {internalState === 'requesting' && 'Camera access is being requested. Please allow camera access in your browser.'}
        {internalState === 'active' && 'Camera feed is active and showing live video. Click to capture an image.'}
        {internalState === 'capturing' && 'Image is being captured from the camera feed.'}
        {internalState === 'processing' && 'Captured image is being processed for analysis.'}
        {internalState === 'error' && 'Camera feed error. Please check that your camera is available and not being used by another application.'}
      </div>
    </>
  );
};

// Custom hook for camera feed management
export const useCameraFeed = (targetFrameRate: number = 30) => {
  const [feedState, setFeedState] = useState<CameraFeedState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startFeed = useCallback(async (): Promise<CameraFeedState> => {
    setFeedState('requesting');
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: targetFrameRate }
        } 
      });
      
      setStream(mediaStream);
      setFeedState('active');
      return 'active';
      
    } catch (error) {
      console.error('Camera feed error:', error);
      
      let errorMessage = 'Camera not available';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application';
        }
      }
      
      setError(errorMessage);
      setFeedState('error');
      return 'error';
    }
  }, [targetFrameRate]);

  const stopFeed = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setFeedState('idle');
      setError(null);
    }
  }, [stream]);

  const captureFrame = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!stream || feedState !== 'active') {
        resolve(null);
        return;
      }

      setFeedState('capturing');
      
      const video = document.createElement('video');
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setFeedState('active');
          resolve(dataUrl);
        } else {
          setFeedState('error');
          setError('Failed to capture image');
          resolve(null);
        }
      };
    });
  }, [stream, feedState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    feedState,
    stream,
    error,
    startFeed,
    stopFeed,
    captureFrame,
    isActive: feedState === 'active',
    isRequesting: feedState === 'requesting',
    hasError: feedState === 'error',
    isCapturing: feedState === 'capturing'
  };
};

export default CameraFeedDisplay; 