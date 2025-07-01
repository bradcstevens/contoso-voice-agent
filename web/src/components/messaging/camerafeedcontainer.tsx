"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FiMaximize, FiMinimize, FiSettings, FiRotateCw, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import clsx from 'clsx';
import { CameraFeedDisplay, useCameraFeed } from './camerafeeddisplay';
import { CameraStatusIndicator, useCameraStatus } from './camerastatusindicator';
import { CameraControlIcon, useCameraControls } from './cameracontrolicon';
import styles from './camerafeedcontainer.module.css';

// Enhanced TypeScript interfaces for camera feed container
export type CameraFeedContainerMode = 'embedded' | 'floating' | 'fullscreen';
export type CameraFeedQuality = 'low' | 'medium' | 'high' | 'auto';

export interface CameraFeedContainerProps {
  /** Camera stream to display */
  stream?: MediaStream | null;
  /** Display mode for the container */
  mode?: CameraFeedContainerMode;
  /** Quality setting for the camera feed */
  quality?: CameraFeedQuality;
  /** Whether controls are visible */
  showControls?: boolean;
  /** Whether status indicator is visible */
  showStatus?: boolean;
  /** Whether to allow fullscreen toggle */
  allowFullscreen?: boolean;
  /** Whether to show quality controls */
  showQualityControls?: boolean;
  /** Callback when fullscreen state changes */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /** Callback when settings are requested */
  onSettingsRequest?: () => void;
  /** Callback when video recording starts/stops */
  onRecordingChange?: (isRecording: boolean) => void;
  /** Additional CSS class name */
  className?: string;
  /** Whether the container is disabled */
  disabled?: boolean;
  /** Aspect ratio for the video display */
  aspectRatio?: '4:3' | '16:9' | '1:1' | 'auto';
  /** Whether to mirror the video horizontally */
  mirrored?: boolean;
  /** Performance optimization settings */
  performanceMode?: 'balanced' | 'quality' | 'performance';
}

// Quality settings for different modes
const QUALITY_SETTINGS = {
  low: { width: 640, height: 480, frameRate: 15 },
  medium: { width: 1280, height: 720, frameRate: 24 },
  high: { width: 1920, height: 1080, frameRate: 30 },
  auto: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
};

// Performance settings
const PERFORMANCE_SETTINGS = {
  balanced: { encodingType: 'balanced', latency: 'interactive' },
  quality: { encodingType: 'quality', latency: 'playback' },
  performance: { encodingType: 'performance', latency: 'interactive' }
};

/**
 * CameraFeedContainer Molecular Component
 * 
 * Combines CameraFeedDisplay, CameraStatusIndicator, and CameraControlIcon
 * into a complete video display interface with controls and status.
 * 
 * Features:
 * - Real-time video display with controls
 * - Status indicator integration
 * - Fullscreen support
 * - Quality controls
 * - Performance optimization
 * - Accessibility compliance
 * - Multiple display modes
 */
export const CameraFeedContainer: React.FC<CameraFeedContainerProps> = ({
  stream,
  mode = 'embedded',
  quality = 'auto',
  showControls = true,
  showStatus = true,
  allowFullscreen = true,
  showQualityControls = false,
  onFullscreenChange,
  onSettingsRequest,
  onRecordingChange,
  className,
  disabled = false,
  aspectRatio = '16:9',
  mirrored = false,
  performanceMode = 'balanced'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<CameraFeedQuality>(quality);
  const [isRecording, setIsRecording] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use camera feed hook
  const {
    feedState,
    stream: feedStream,
    error: feedError,
    startFeed,
    stopFeed,
    captureFrame,
    isActive: isFeedActive,
    isRequesting: isFeedRequesting,
    hasError: hasFeedError,
    isCapturing: isFeedCapturing
  } = useCameraFeed(30); // 30fps target frame rate

  // Use camera status hook
  const {
    statusState: currentStatus,
    statusHistory,
    progress: statusProgress,
    updateStatus,
    resetStatus,
    getLastStatusUpdate,
    isActive: isStatusActive,
    isProcessing: isStatusProcessing,
    hasError: hasStatusError,
    isSuccess: isStatusSuccess
  } = useCameraStatus();

  // Use camera controls hook
  const {
    controls,
    toggleControl,
    setControl,
    resetControls,
    isCameraActive,
    isMicrophoneActive,
    isFullscreenActive,
    isGridActive,
    isBrightnessActive
  } = useCameraControls();

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current || !allowFullscreen) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
      setAnnouncement('Fullscreen mode not available');
    }
  }, [isFullscreen, allowFullscreen]);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality: CameraFeedQuality) => {
    setCurrentQuality(newQuality);
    setAnnouncement(`Video quality changed to ${newQuality}`);
    
    // Update camera constraints if stream is available
    if (stream && videoRef.current) {
      const settings = QUALITY_SETTINGS[newQuality];
      // Apply new quality settings to the stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.applyConstraints) {
        videoTrack.applyConstraints({
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate
        }).catch(error => {
          console.error('Failed to apply quality constraints:', error);
          setAnnouncement('Failed to change video quality');
        });
      }
    }
  }, [stream]);

  // Handle recording toggle
  const handleRecordingToggle = useCallback(() => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    setAnnouncement(newRecordingState ? 'Recording started' : 'Recording stopped');
    onRecordingChange?.(newRecordingState);
    
    // Update status
    updateStatus(
      newRecordingState ? 'processing' : 'active', 
      newRecordingState ? 'Video recording started' : 'Video recording stopped'
    );
  }, [isRecording, onRecordingChange, updateStatus]);

  // Handle settings request
  const handleSettingsRequest = useCallback(() => {
    setAnnouncement('Opening camera settings');
    onSettingsRequest?.();
  }, [onSettingsRequest]);

  // Handle camera feed events
  const handleFeedStateChange = useCallback((state: any) => {
    updateStatus(state, `Camera feed state: ${state}`);
  }, [updateStatus]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      onFullscreenChange?.(isCurrentlyFullscreen);
      setAnnouncement(isCurrentlyFullscreen ? 'Entered fullscreen mode' : 'Exited fullscreen mode');
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  // Update status when stream changes
  useEffect(() => {
    if (stream) {
      updateStatus('active', 'Camera stream connected successfully');
    } else {
      updateStatus('idle', 'Camera stream disconnected');
    }
  }, [stream, updateStatus]);

  // Generate control buttons
  const renderControls = () => {
    if (!showControls) return null;

    const controls = [
      // Fullscreen toggle
      allowFullscreen && {
        type: 'fullscreen',
        icon: isFullscreen ? FiMinimize : FiMaximize,
        label: isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen',
        onClick: handleFullscreenToggle,
        enabled: true
      },
      
      // Settings
      onSettingsRequest && {
        type: 'settings',
        icon: FiSettings,
        label: 'Camera settings',
        onClick: handleSettingsRequest,
        enabled: true
      },
      
      // Recording toggle (if supported)
      onRecordingChange && {
        type: 'record',
        icon: FiRotateCw,
        label: isRecording ? 'Stop recording' : 'Start recording',
        onClick: handleRecordingToggle,
        enabled: Boolean(stream),
        active: isRecording
      }
    ].filter(Boolean);

    return (
      <div className={styles.controls}>
        {controls.map((control: any) => (
          <CameraControlIcon
            key={control.type}
            controlType={control.type}
            icon={control.icon}
            onClick={control.onClick}
            disabled={!control.enabled}
            active={control.active}
                         tooltip={control.label}
             size="default"
             className={styles.controlButton}
          />
        ))}
      </div>
    );
  };

  // Generate quality controls
  const renderQualityControls = () => {
    if (!showQualityControls) return null;

    const qualities: CameraFeedQuality[] = ['low', 'medium', 'high', 'auto'];

    return (
      <div className={styles.qualityControls}>
        <span className={styles.qualityLabel}>Quality:</span>
        {qualities.map((qualityOption) => (
          <button
            key={qualityOption}
            onClick={() => handleQualityChange(qualityOption)}
            className={clsx(
              styles.qualityButton,
              currentQuality === qualityOption && styles.qualityButtonActive
            )}
            aria-label={`Set video quality to ${qualityOption}`}
            disabled={disabled}
          >
            {qualityOption}
          </button>
        ))}
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

      {/* Main container */}
      <div
        ref={containerRef}
        className={clsx(
          styles.feedContainer,
          styles[mode],
          styles[aspectRatio.replace(':', 'x')],
          isFullscreen && styles.fullscreen,
          disabled && styles.disabled,
          className
        )}
        role="region"
        aria-label="Camera feed display"
      >
        {/* Camera feed display */}
        <div className={styles.feedWrapper}>
          <CameraFeedDisplay
            ref={videoRef}
            stream={stream}
            state={feedState}
            onStateChange={handleFeedStateChange}
            onError={handleFeedError}
            mirrored={mirrored}
            aspectRatio={aspectRatio}
            quality={currentQuality}
            className={styles.feedDisplay}
            disabled={disabled}
          />
          
          {/* Overlay controls */}
          {renderControls()}
          
          {/* Status indicator */}
          {showStatus && (
            <div className={styles.statusWrapper}>
              <CameraStatusIndicator
                status={currentStatus}
                displayMode="minimal"
                showProgress={isRecording}
                className={styles.statusIndicator}
              />
            </div>
          )}
        </div>

        {/* Bottom controls panel */}
        <div className={styles.controlsPanel}>
          {renderQualityControls()}
          
          {/* Performance info (debug mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className={styles.debugInfo}>
              <span>FPS: {frameRate}</span>
              <span>Resolution: {resolution}</span>
              <span>Mode: {performanceMode}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Custom hook for camera feed container management
export const useCameraFeedContainer = () => {
  const [containerState, setContainerState] = useState<{
    mode: CameraFeedContainerMode;
    quality: CameraFeedQuality;
    isFullscreen: boolean;
    isRecording: boolean;
    stream: MediaStream | null;
  }>({
    mode: 'embedded',
    quality: 'auto',
    isFullscreen: false,
    isRecording: false,
    stream: null
  });

  const updateContainerState = useCallback((updates: Partial<typeof containerState>) => {
    setContainerState(prev => ({ ...prev, ...updates }));
  }, []);

  const setStream = useCallback((stream: MediaStream | null) => {
    setContainerState(prev => ({ ...prev, stream }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setContainerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const setQuality = useCallback((quality: CameraFeedQuality) => {
    setContainerState(prev => ({ ...prev, quality }));
  }, []);

  const toggleRecording = useCallback(() => {
    setContainerState(prev => ({ ...prev, isRecording: !prev.isRecording }));
  }, []);

  const resetContainer = useCallback(() => {
    setContainerState({
      mode: 'embedded',
      quality: 'auto',
      isFullscreen: false,
      isRecording: false,
      stream: null
    });
  }, []);

  return {
    containerState,
    updateContainerState,
    setStream,
    toggleFullscreen,
    setQuality,
    toggleRecording,
    resetContainer,
    isActive: Boolean(containerState.stream),
    hasVideo: Boolean(containerState.stream?.getVideoTracks().length)
  };
};

export default CameraFeedContainer; 