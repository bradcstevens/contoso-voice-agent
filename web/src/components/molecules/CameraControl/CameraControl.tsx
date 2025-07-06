import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraIcon } from '../../atoms/CameraIcon/CameraIcon';
import { CameraIndicator } from '../../atoms/CameraIndicator/CameraIndicator';
import { FocusRing } from '../../atoms/FocusRing/FocusRing';
import { CaptureRing } from '../../atoms/CaptureRing/CaptureRing';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './CameraControl.module.css';

export interface CameraMetrics {
  quality: number;
  frameRate: number;
  resolution: string;
  lighting: number;
  focus: number;
  exposure: number;
  stabilization: number;
}

export interface CameraSettings {
  flashMode: 'auto' | 'on' | 'off';
  focusMode: 'auto' | 'manual' | 'macro' | 'infinity';
  captureMode: 'photo' | 'video' | 'burst';
  timer: number; // seconds
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface CameraControlProps {
  /** Current camera state */
  cameraState?: 'idle' | 'recording' | 'capturing' | 'processing' | 'permission' | 'error' | 'disabled';
  /** Camera recording state */
  isRecording?: boolean;
  /** Camera quality metrics (0-100) */
  quality?: number;
  /** Real-time camera metrics */
  metrics?: CameraMetrics;
  /** Camera settings */
  settings?: CameraSettings;
  /** Focus confidence (0-100) */
  focusConfidence?: number;
  /** Focus distance in meters */
  focusDistance?: number;
  /** Capture progress (0-100) */
  captureProgress?: number;
  /** Number of captures taken */
  captureCount?: number;
  /** Maximum captures for burst mode */
  maxCaptures?: number;
  /** Whether flash is active */
  flashActive?: boolean;
  /** Timer countdown value */
  timerCountdown?: number;
  /** Whether camera permissions are granted */
  hasPermission?: boolean;
  /** Whether camera is available */
  cameraAvailable?: boolean;
  /** Current error message */
  errorMessage?: string;
  /** Whether the interface is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  layout?: 'vertical' | 'horizontal' | 'compact' | 'overlay';
  /** Whether to show metrics panel */
  showMetrics?: boolean;
  /** Whether to show settings controls */
  showSettings?: boolean;
  /** Whether to show focus ring */
  showFocus?: boolean;
  /** Whether to show capture ring */
  showCapture?: boolean;
  /** Callback when camera start is requested */
  onCameraStart?: () => void;
  /** Callback when camera stop is requested */
  onCameraStop?: () => void;
  /** Callback when capture is triggered */
  onCapture?: () => void;
  /** Callback when recording is toggled */
  onToggleRecording?: () => void;
  /** Callback when settings change */
  onSettingsChange?: (settings: Partial<CameraSettings>) => void;
  /** Callback when focus is requested */
  onFocusRequest?: (x: number, y: number) => void;
  /** Callback when permission request is needed */
  onPermissionRequest?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * CameraControl Molecule
 * 
 * Professional camera control interface combining CameraIcon, CameraIndicator,
 * FocusRing, and CaptureRing for complete camera management.
 * 
 * Features:
 * - Complete camera state management (idle, recording, capturing, processing)
 * - Real-time quality monitoring with professional metrics
 * - Advanced focus control with confidence scoring and distance measurement
 * - Comprehensive capture system with progress tracking and burst mode
 * - Professional camera settings (flash, focus mode, capture mode, timer)
 * - Permission handling with graceful degradation
 * - Error recovery with user-friendly messaging
 * - WCAG AAA accessibility compliance
 * - Multiple layout options (vertical, horizontal, compact, overlay)
 * - Touch and keyboard interaction support
 * - Screen reader optimization for camera operations
 */
export const CameraControl: React.FC<CameraControlProps> = ({
  cameraState = 'idle',
  isRecording = false,
  quality = 75,
  metrics = {
    quality: 75,
    frameRate: 30,
    resolution: '1920x1080',
    lighting: 80,
    focus: 85,
    exposure: 70,
    stabilization: 90
  },
  settings = {
    flashMode: 'auto',
    focusMode: 'auto',
    captureMode: 'photo',
    timer: 0,
    videoQuality: 'high'
  },
  focusConfidence = 85,
  focusDistance = 2.5,
  captureProgress = 0,
  captureCount = 0,
  maxCaptures = 10,
  flashActive = false,
  timerCountdown = 0,
  hasPermission = true,
  cameraAvailable = true,
  errorMessage = '',
  disabled = false,
  size = 'medium',
  layout = 'vertical',
  showMetrics = true,
  showSettings = false,
  showFocus = true,
  showCapture = true,
  onCameraStart,
  onCameraStop,
  onCapture,
  onToggleRecording,
  onSettingsChange,
  onFocusRequest,
  onPermissionRequest,
  className = '',
  testId = 'camera-control'
}) => {
  // Internal state
  const [localSettings, setLocalSettings] = useState(settings);
  const [lastAction, setLastAction] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Size mapping helper
  const mapSize = (controlSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[controlSize];
  };
  
  const atomSize = mapSize(size);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Handle camera start
  const handleCameraStart = useCallback(() => {
    if (!hasPermission) {
      setLastAction('Camera permission required');
      onPermissionRequest?.();
      return;
    }
    
    if (!cameraAvailable) {
      setLastAction('Camera not available');
      return;
    }
    
    setLastAction('Camera started');
    onCameraStart?.();
  }, [hasPermission, cameraAvailable, onCameraStart, onPermissionRequest]);
  
  // Handle camera stop
  const handleCameraStop = useCallback(() => {
    setLastAction('Camera stopped');
    onCameraStop?.();
  }, [onCameraStop]);
  
  // Handle capture
  const handleCapture = useCallback(() => {
    if (cameraState === 'disabled' || !hasPermission) return;
    
    setIsCapturing(true);
    setLastAction(`${localSettings.captureMode === 'burst' ? 'Burst capture' : 'Photo capture'} started`);
    onCapture?.();
    
    // Reset capturing state after animation
    setTimeout(() => {
      setIsCapturing(false);
      setLastAction(`${localSettings.captureMode === 'burst' ? 'Burst capture' : 'Photo capture'} completed`);
    }, 1000);
  }, [cameraState, hasPermission, localSettings.captureMode, onCapture]);
  
  // Handle recording toggle
  const handleToggleRecording = useCallback(() => {
    if (cameraState === 'disabled' || !hasPermission) return;
    
    const newRecordingState = !isRecording;
    setLastAction(newRecordingState ? 'Recording started' : 'Recording stopped');
    onToggleRecording?.();
  }, [cameraState, hasPermission, isRecording, onToggleRecording]);
  
  // Handle settings change
  const handleSettingsChange = useCallback((key: keyof CameraSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    let changeMessage = '';
    switch (key) {
      case 'flashMode':
        changeMessage = `Flash mode set to ${value}`;
        break;
      case 'focusMode':
        changeMessage = `Focus mode set to ${value}`;
        break;
      case 'captureMode':
        changeMessage = `Capture mode set to ${value}`;
        break;
      case 'timer':
        changeMessage = value > 0 ? `Timer set to ${value} seconds` : 'Timer disabled';
        break;
      case 'videoQuality':
        changeMessage = `Video quality set to ${value}`;
        break;
      default:
        changeMessage = `${key} updated`;
    }
    
    setLastAction(changeMessage);
    onSettingsChange?.(newSettings);
  }, [localSettings, onSettingsChange]);
  
  // Handle focus request from click/touch
  const handleFocusClick = useCallback((event: React.MouseEvent) => {
    if (!showFocus || cameraState === 'disabled' || !hasPermission) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setFocusTarget({ x, y });
    setLastAction(`Focus requested at ${Math.round(x)}%, ${Math.round(y)}%`);
    onFocusRequest?.(x, y);
    
    // Clear focus target after animation
    setTimeout(() => {
      setFocusTarget(null);
    }, 2000);
  }, [showFocus, cameraState, hasPermission, onFocusRequest]);
  
  // Determine current capture state for CaptureRing
  const captureState = isCapturing ? 'capturing' : 
                     captureProgress > 0 ? 'processing' : 
                     'idle';
  
  // Determine focus mode for FocusRing
  const focusMode = localSettings.focusMode;
  
  // Get status message
  const getStatusMessage = () => {
    if (!hasPermission) return 'Camera permission required';
    if (!cameraAvailable) return 'Camera not available';
    if (errorMessage) return errorMessage;
    if (cameraState === 'recording') return 'Recording active';
    if (cameraState === 'capturing') return 'Capturing image';
    if (cameraState === 'processing') return 'Processing capture';
    if (timerCountdown > 0) return `Timer: ${timerCountdown}s`;
    return 'Camera ready';
  };
  
  return (
    <div 
      className={`${styles.cameraControl} ${styles[size]} ${styles[layout]} ${className}`}
      data-testid={testId}
      ref={containerRef}
      onClick={showFocus ? handleFocusClick : undefined}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="camera"
      >
        {lastAction}
      </ScreenReaderText>
      
      <div className={styles.controlContainer}>
        {/* Primary Camera Control */}
        <div className={styles.primaryControl}>
          <div className={styles.cameraIconContainer}>
            <CameraIcon
              state={cameraState}
              size={atomSize}
              recording={isRecording}
              capturing={isCapturing}
              timer={timerCountdown}
              flash={flashActive || localSettings.flashMode === 'on'}
              disabled={disabled}
              className={styles.cameraIcon}
            />
            
            {/* Focus Ring Overlay */}
            {showFocus && (
              <div className={styles.focusOverlay}>
                <FocusRing
                  mode={focusMode}
                  confidence={focusConfidence}
                  distance={focusDistance}
                  size={atomSize}
                  active={cameraState !== 'idle' && cameraState !== 'disabled'}
                  acquiring={cameraState === 'processing'}
                  target={focusTarget}
                  className={styles.focusRing}
                />
              </div>
            )}
            
            {/* Capture Ring Overlay */}
            {showCapture && (
              <div className={styles.captureOverlay}>
                <CaptureRing
                  type="ring"
                  state={captureState}
                  progress={captureProgress}
                  total={localSettings.captureMode === 'burst' ? maxCaptures : 1}
                  captured={captureCount}
                  timer={timerCountdown}
                  size={atomSize}
                  showTimer={localSettings.timer > 0}
                  metadata={{
                    timestamp: new Date().toISOString(),
                    settings: `${localSettings.focusMode} focus, ${localSettings.flashMode} flash`
                  }}
                  className={styles.captureRing}
                />
              </div>
            )}
          </div>
          
          {/* Status Display */}
          <div className={styles.statusDisplay}>
            <span className={styles.statusText}>{getStatusMessage()}</span>
            {quality && (
              <span className={styles.qualityBadge}>
                {quality}% quality
              </span>
            )}
          </div>
        </div>
        
        {/* Camera Metrics */}
        {showMetrics && metrics && (
          <div className={styles.metricsPanel}>
            <h4 className={styles.metricsTitle}>Camera Metrics</h4>
            <CameraIndicator
              mode="bars"
              quality={metrics.quality}
              size={atomSize}
              direction="horizontal"
              segments={5}
              showValues={true}
              className={styles.qualityIndicator}
            />
            
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Frame Rate</span>
                <span className={styles.metricValue}>{metrics.frameRate} fps</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Resolution</span>
                <span className={styles.metricValue}>{metrics.resolution}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Focus</span>
                <span className={styles.metricValue}>{metrics.focus}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Exposure</span>
                <span className={styles.metricValue}>{metrics.exposure}%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Panel */}
        {showSettings && (
          <div className={styles.settingsPanel}>
            <h4 className={styles.settingsTitle}>Camera Settings</h4>
            
            <div className={styles.settingsGrid}>
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Flash Mode</label>
                <select
                  value={localSettings.flashMode}
                  onChange={(e) => handleSettingsChange('flashMode', e.target.value as 'auto' | 'on' | 'off')}
                  disabled={disabled}
                  className={styles.settingSelect}
                  data-testid={`${testId}-flash-mode`}
                >
                  <option value="auto">Auto</option>
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
              
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Focus Mode</label>
                <select
                  value={localSettings.focusMode}
                  onChange={(e) => handleSettingsChange('focusMode', e.target.value as 'auto' | 'manual' | 'macro' | 'infinity')}
                  disabled={disabled}
                  className={styles.settingSelect}
                  data-testid={`${testId}-focus-mode`}
                >
                  <option value="auto">Auto</option>
                  <option value="manual">Manual</option>
                  <option value="macro">Macro</option>
                  <option value="infinity">Infinity</option>
                </select>
              </div>
              
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Capture Mode</label>
                <select
                  value={localSettings.captureMode}
                  onChange={(e) => handleSettingsChange('captureMode', e.target.value as 'photo' | 'video' | 'burst')}
                  disabled={disabled}
                  className={styles.settingSelect}
                  data-testid={`${testId}-capture-mode`}
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="burst">Burst</option>
                </select>
              </div>
              
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Timer</label>
                <select
                  value={localSettings.timer}
                  onChange={(e) => handleSettingsChange('timer', parseInt(e.target.value))}
                  disabled={disabled}
                  className={styles.settingSelect}
                  data-testid={`${testId}-timer`}
                >
                  <option value={0}>Off</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Control Actions */}
        <div className={styles.actions}>
          {!hasPermission ? (
            <Button
              variant="primary"
              size={atomSize}
              onClick={onPermissionRequest}
              disabled={disabled}
              data-testid={`${testId}-permission`}
            >
              <Icon name="camera" size={atomSize} />
              Grant Camera Permission
            </Button>
          ) : cameraState === 'idle' ? (
            <Button
              variant="primary"
              size={atomSize}
              onClick={handleCameraStart}
              disabled={disabled || !cameraAvailable}
              data-testid={`${testId}-start`}
            >
              <Icon name="camera" size={atomSize} />
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                variant={localSettings.captureMode === 'video' ? (isRecording ? 'danger' : 'primary') : 'primary'}
                size={atomSize}
                onClick={localSettings.captureMode === 'video' ? handleToggleRecording : handleCapture}
                disabled={disabled}
                data-testid={`${testId}-capture`}
              >
                <Icon 
                  name={localSettings.captureMode === 'video' ? (isRecording ? 'stop' : 'record') : 'camera'} 
                  size={atomSize} 
                />
                {localSettings.captureMode === 'video' 
                  ? (isRecording ? 'Stop Recording' : 'Start Recording')
                  : (localSettings.captureMode === 'burst' ? 'Burst Capture' : 'Take Photo')
                }
              </Button>
              
              <Button
                variant="secondary"
                size={atomSize}
                onClick={handleCameraStop}
                disabled={disabled}
                data-testid={`${testId}-stop`}
              >
                <Icon name="x" size={atomSize} />
                Stop Camera
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 