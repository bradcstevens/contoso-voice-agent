/**
 * CAPTURE RING ATOM - CAMERA CAPTURE PROGRESS & EFFECTS VISUALIZATION
 * 
 * Professional capture ring component with progress indicators, capture effects,
 * burst mode support, timer displays, and comprehensive capture feedback.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './CaptureRing.module.css';

export interface CaptureRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current capture progress (0-100) */
  progress?: number;
  
  /** Capture state */
  state?: 'idle' | 'preparing' | 'capturing' | 'processing' | 'complete' | 'error' | 'burst' | 'timer';
  
  /** Capture ring visualization type */
  type?: 'ring' | 'arc' | 'pulse' | 'flash' | 'shutter' | 'timer' | 'burst';
  
  /** Size of the capture ring */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /** Whether capture is currently active */
  active?: boolean;
  
  /** Capture duration in milliseconds */
  duration?: number;
  
  /** Timer countdown value in seconds */
  timerValue?: number;
  
  /** Burst capture count */
  burstCount?: number;
  
  /** Total burst shots */
  burstTotal?: number;
  
  /** Capture quality level (0-100) */
  quality?: number;
  
  /** Whether to show progress percentage */
  showProgress?: boolean;
  
  /** Whether to show timer display */
  showTimer?: boolean;
  
  /** Whether to show burst counter */
  showBurstCount?: boolean;
  
  /** Whether to show quality indicator */
  showQuality?: boolean;
  
  /** Flash intensity (0-1) */
  flashIntensity?: number;
  
  /** Whether to show flash effect */
  showFlash?: boolean;
  
  /** Flash duration in milliseconds */
  flashDuration?: number;
  
  /** Shutter speed display (e.g., "1/60") */
  shutterSpeed?: string;
  
  /** Whether to show shutter speed */
  showShutterSpeed?: boolean;
  
  /** ISO value */
  isoValue?: number;
  
  /** Whether to show ISO display */
  showISO?: boolean;
  
  /** Aperture value (e.g., "f/2.8") */
  aperture?: string;
  
  /** Whether to show aperture display */
  showAperture?: boolean;
  
  /** Whether to use smooth animations */
  smooth?: boolean;
  
  /** Animation speed multiplier */
  animationSpeed?: number;
  
  /** Custom colors for different states */
  stateColors?: {
    idle: string;
    preparing: string;
    capturing: string;
    processing: string;
    complete: string;
    error: string;
    burst: string;
    timer: string;
  };
  
  /** Capture mode */
  mode?: 'single' | 'burst' | 'timer' | 'continuous' | 'hdr' | 'panorama';
  
  /** Whether ring pulsates during capture */
  pulsate?: boolean;
  
  /** Pulse frequency for active states */
  pulseFrequency?: number;
  
  /** Direction of progress animation */
  direction?: 'clockwise' | 'counterclockwise';
  
  /** Custom capture effects */
  effects?: {
    glow?: boolean;
    shadow?: boolean;
    blur?: boolean;
    scale?: boolean;
  };
  
  /** Frame rate for video capture */
  frameRate?: number;
  
  /** Whether to show frame rate indicator */
  showFrameRate?: boolean;
  
  /** Recording duration for video */
  recordingDuration?: number;
  
  /** Maximum recording duration */
  maxDuration?: number;
  
  /** Whether to auto-hide after completion */
  autoHide?: boolean;
  
  /** Auto-hide delay in milliseconds */
  autoHideDelay?: number;
  
  /** Custom ring thickness */
  thickness?: number;
  
  /** Ring gap size for segmented displays */
  gap?: number;
  
  /** Number of segments for burst mode */
  segments?: number;
  
  /** Whether to show completion checkmark */
  showCheckmark?: boolean;
  
  /** Whether to show error icon */
  showErrorIcon?: boolean;
  
  /** Capture metadata display */
  metadata?: {
    timestamp?: string;
    location?: string;
    device?: string;
    fileSize?: string;
  };
  
  /** Whether to show metadata */
  showMetadata?: boolean;
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Whether to provide detailed capture descriptions */
  provideCaptureDescription?: boolean;
  
  /** Callback when capture progress changes */
  onProgressChange?: (progress: number) => void;
  
  /** Callback when capture state changes */
  onStateChange?: (state: string) => void;
  
  /** Callback when capture completes */
  onCaptureComplete?: (duration: number, quality: number) => void;
  
  /** Callback when capture fails */
  onCaptureError?: (error: string) => void;
  
  /** Callback when flash triggers */
  onFlashTrigger?: (intensity: number) => void;
  
  /** Callback when timer reaches zero */
  onTimerComplete?: () => void;
  
  /** Callback when burst sequence completes */
  onBurstComplete?: (count: number) => void;
  
  /** Custom width override */
  width?: number;
  
  /** Custom height override */
  height?: number;
  
  /** Whether ring should be circular or follow aspect ratio */
  circular?: boolean;
  
  /** Ring opacity */
  opacity?: number;
  
  /** Whether to show capture preview */
  showPreview?: boolean;
  
  /** Preview image data URL */
  previewImage?: string;
  
  /** Whether to animate preview */
  animatePreview?: boolean;
}

/**
 * Enhanced CaptureRing atom with professional camera capture visualization
 */
export const CaptureRing = forwardRef<HTMLDivElement, CaptureRingProps>(({
  progress = 0,
  state = 'idle',
  type = 'ring',
  size = 'md',
  variant = 'default',
  active = false,
  duration = 1000,
  timerValue = 0,
  burstCount = 0,
  burstTotal = 1,
  quality = 100,
  showProgress = false,
  showTimer = false,
  showBurstCount = false,
  showQuality = false,
  flashIntensity = 1,
  showFlash = false,
  flashDuration = 200,
  shutterSpeed = '1/60',
  showShutterSpeed = false,
  isoValue = 100,
  showISO = false,
  aperture = 'f/2.8',
  showAperture = false,
  smooth = true,
  animationSpeed = 1,
  stateColors = {
    idle: '#6b7280',
    preparing: '#f59e0b',
    capturing: '#ef4444',
    processing: '#8b5cf6',
    complete: '#10b981',
    error: '#dc2626',
    burst: '#3b82f6',
    timer: '#06b6d4'
  },
  mode = 'single',
  pulsate = true,
  pulseFrequency = 1.5,
  direction = 'clockwise',
  effects = {
    glow: true,
    shadow: true,
    blur: false,
    scale: true
  },
  frameRate = 30,
  showFrameRate = false,
  recordingDuration = 0,
  maxDuration = 300,
  autoHide = false,
  autoHideDelay = 2000,
  thickness = 4,
  gap = 2,
  segments = 8,
  showCheckmark = true,
  showErrorIcon = true,
  metadata,
  showMetadata = false,
  ariaLabel,
  provideCaptureDescription = false,
  onProgressChange,
  onStateChange,
  onCaptureComplete,
  onCaptureError,
  onFlashTrigger,
  onTimerComplete,
  onBurstComplete,
  width,
  height,
  circular = true,
  opacity = 1,
  showPreview = false,
  previewImage,
  animatePreview = true,
  className = '',
  ...rest
}, ref) => {
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [currentTimer, setCurrentTimer] = useState(timerValue);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [captureStartTime, setCaptureStartTime] = useState<number>(0);
  const animationRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const flashRef = useRef<NodeJS.Timeout>();
  const hideTimerRef = useRef<NodeJS.Timeout>();
  
  // Ring dimensions based on size
  const getDimensions = () => {
    if (width && height) return { width, height };
    
    const sizeMap = {
      xs: { width: 60, height: 60 },
      sm: { width: 80, height: 80 },
      md: { width: 120, height: 120 },
      lg: { width: 160, height: 160 },
      xl: { width: 200, height: 200 }
    };
    
    return sizeMap[size];
  };
  
  const { width: ringWidth, height: ringHeight } = getDimensions();
  
  // Get state color
  const getStateColor = (currentState: string): string => {
    return stateColors[currentState as keyof typeof stateColors] || stateColors.idle;
  };
  
  // Get state description
  const getStateDescription = (currentState: string): string => {
    const descriptions = {
      idle: 'Ready to capture',
      preparing: 'Preparing to capture',
      capturing: 'Capturing image',
      processing: 'Processing capture',
      complete: 'Capture complete',
      error: 'Capture failed',
      burst: 'Burst mode active',
      timer: 'Timer countdown active'
    };
    return descriptions[currentState as keyof typeof descriptions] || 'Unknown state';
  };
  
  // Get mode description
  const getModeDescription = (): string => {
    const modeDescriptions = {
      single: 'Single shot mode',
      burst: 'Burst capture mode',
      timer: 'Timer capture mode',
      continuous: 'Continuous capture mode',
      hdr: 'HDR capture mode',
      panorama: 'Panorama capture mode'
    };
    return modeDescriptions[mode];
  };
  
  // Smooth animation for progress
  useEffect(() => {
    if (!smooth) {
      setDisplayProgress(progress);
      return;
    }
    
    const animate = () => {
      setDisplayProgress(prev => {
        const diff = progress - prev;
        const step = diff * (0.1 * animationSpeed);
        const newValue = Math.abs(step) < 0.1 ? progress : prev + step;
        return Math.max(0, Math.min(100, newValue));
      });
      
      if (Math.abs(displayProgress - progress) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, smooth, animationSpeed, displayProgress]);
  
  // Timer countdown
  useEffect(() => {
    if (state === 'timer' && timerValue > 0) {
      setCurrentTimer(timerValue);
      timerRef.current = setInterval(() => {
        setCurrentTimer(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, timerValue, onTimerComplete]);
  
  // Flash effect
  useEffect(() => {
    if (showFlash && state === 'capturing') {
      setIsFlashing(true);
      if (onFlashTrigger) onFlashTrigger(flashIntensity);
      
      flashRef.current = setTimeout(() => {
        setIsFlashing(false);
      }, flashDuration);
    }
    
    return () => {
      if (flashRef.current) {
        clearTimeout(flashRef.current);
      }
    };
  }, [showFlash, state, flashIntensity, flashDuration, onFlashTrigger]);
  
  // Progress change callback
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(displayProgress);
    }
  }, [displayProgress, onProgressChange]);
  
  // State change callback
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
    
    // Set capture start time for duration tracking
    if (state === 'capturing') {
      setCaptureStartTime(Date.now());
    }
  }, [state, onStateChange]);
  
  // Capture completion detection
  useEffect(() => {
    if (state === 'complete' && captureStartTime > 0) {
      const captureDuration = Date.now() - captureStartTime;
      if (onCaptureComplete) {
        onCaptureComplete(captureDuration, quality);
      }
      setCaptureStartTime(0);
    }
  }, [state, captureStartTime, quality, onCaptureComplete]);
  
  // Burst completion detection
  useEffect(() => {
    if (mode === 'burst' && burstCount >= burstTotal && onBurstComplete) {
      onBurstComplete(burstCount);
    }
  }, [mode, burstCount, burstTotal, onBurstComplete]);
  
  // Error handling
  useEffect(() => {
    if (state === 'error' && onCaptureError) {
      onCaptureError('Capture failed');
    }
  }, [state, onCaptureError]);
  
  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && state === 'complete') {
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    } else {
      setIsVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    }
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [autoHide, state, autoHideDelay]);
  
  // Class computation
  const computedClassName = [
    styles.captureRing,
    styles[type],
    styles[size],
    styles[variant],
    styles[state],
    styles[mode],
    active && styles.active,
    pulsate && (state === 'capturing' || state === 'preparing') && styles.pulsate,
    isFlashing && styles.flashing,
    !isVisible && styles.hidden,
    circular && styles.circular,
    effects.glow && styles.glow,
    effects.shadow && styles.shadow,
    effects.blur && styles.blur,
    effects.scale && styles.scale,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    '--capture-progress': `${displayProgress}%`,
    '--capture-duration': `${duration}ms`,
    '--timer-value': currentTimer,
    '--burst-progress': burstTotal > 0 ? `${(burstCount / burstTotal) * 100}%` : '0%',
    '--quality-level': `${quality}%`,
    '--flash-intensity': flashIntensity,
    '--flash-duration': `${flashDuration}ms`,
    '--animation-speed': animationSpeed,
    '--pulse-frequency': `${pulseFrequency}s`,
    '--ring-width': `${ringWidth}px`,
    '--ring-height': `${ringHeight}px`,
    '--ring-thickness': `${thickness}px`,
    '--ring-gap': `${gap}px`,
    '--segments': segments,
    '--state-color': getStateColor(state),
    '--ring-opacity': opacity,
    '--recording-progress': maxDuration > 0 ? `${(recordingDuration / maxDuration) * 100}%` : '0%'
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'progressbar',
    'aria-label': ariaLabel || `${getModeDescription()}: ${getStateDescription(state)}`,
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-busy': state === 'capturing' || state === 'processing',
    'aria-valuenow': Math.round(displayProgress),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuetext': showProgress ? `${Math.round(displayProgress)}% complete` : getStateDescription(state)
  };
  
  // Calculate SVG path for ring/arc types
  const calculatePath = () => {
    const radius = (Math.min(ringWidth, ringHeight) / 2) - thickness;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (displayProgress / 100) * circumference;
    
    return {
      radius,
      circumference,
      progressOffset,
      center: { x: ringWidth / 2, y: ringHeight / 2 }
    };
  };
  
  // Render progress ring/arc
  const renderProgressRing = () => {
    if (type !== 'ring' && type !== 'arc') return null;
    
    const { radius, circumference, progressOffset, center } = calculatePath();
    const startAngle = type === 'arc' ? -90 : -90;
    const endAngle = type === 'arc' ? 180 : 270;
    
    return (
      <svg className={styles.progressSvg} viewBox={`0 0 ${ringWidth} ${ringHeight}`}>
        {/* Background track */}
        <circle
          className={styles.progressTrack}
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        
        {/* Progress circle */}
        <circle
          className={styles.progressCircle}
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={direction === 'clockwise' ? progressOffset : -progressOffset}
          transform={`rotate(${startAngle} ${center.x} ${center.y})`}
          style={{ stroke: getStateColor(state) }}
        />
        
        {/* Burst segments */}
        {mode === 'burst' && renderBurstSegments(radius, center)}
      </svg>
    );
  };
  
  // Render burst segments
  const renderBurstSegments = (radius: number, center: { x: number; y: number }) => {
    const segmentAngle = 360 / segments;
    const segmentElements = [];
    
    for (let i = 0; i < segments; i++) {
      const angle = i * segmentAngle - 90;
      const isComplete = i < burstCount;
      
      segmentElements.push(
        <circle
          key={i}
          className={`${styles.burstSegment} ${isComplete ? styles.burstComplete : ''}`}
          cx={center.x + radius * 0.8 * Math.cos(angle * Math.PI / 180)}
          cy={center.y + radius * 0.8 * Math.sin(angle * Math.PI / 180)}
          r={3}
          fill={isComplete ? getStateColor(state) : 'rgba(255,255,255,0.3)'}
        />
      );
    }
    
    return segmentElements;
  };
  
  // Render pulse effect
  const renderPulse = () => {
    if (type !== 'pulse') return null;
    
    return (
      <div className={styles.pulse}>
        <div className={styles.pulseRing} />
        <div className={styles.pulseCore} />
      </div>
    );
  };
  
  // Render flash effect
  const renderFlash = () => {
    if (type !== 'flash') return null;
    
    return (
      <div className={styles.flash}>
        <div className={styles.flashOverlay} />
        <div className={styles.flashBurst} />
      </div>
    );
  };
  
  // Render shutter effect
  const renderShutter = () => {
    if (type !== 'shutter') return null;
    
    return (
      <div className={styles.shutter}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={styles.shutterBlade}
            style={{ '--blade-index': i }}
          />
        ))}
      </div>
    );
  };
  
  // Render timer display
  const renderTimer = () => {
    if (type !== 'timer' && !showTimer) return null;
    
    return (
      <div className={styles.timerDisplay}>
        <div className={styles.timerValue}>
          {currentTimer > 0 ? currentTimer : ''}
        </div>
        {type === 'timer' && (
          <div className={styles.timerRing}>
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getStateColor(state)}
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - (currentTimer / timerValue) * 283}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        )}
      </div>
    );
  };
  
  // Render capture indicators
  const renderCaptureIndicators = () => (
    <div className={styles.captureIndicators}>
      {/* Progress indicator */}
      {showProgress && (
        <div className={styles.progressIndicator}>
          <span className={styles.progressValue}>
            {Math.round(displayProgress)}%
          </span>
        </div>
      )}
      
      {/* Burst counter */}
      {showBurstCount && mode === 'burst' && (
        <div className={styles.burstCounter}>
          <span className={styles.burstValue}>
            {burstCount}/{burstTotal}
          </span>
        </div>
      )}
      
      {/* Quality indicator */}
      {showQuality && (
        <div className={styles.qualityIndicator}>
          <div className={styles.qualityLabel}>Quality</div>
          <div 
            className={styles.qualityBar}
            style={{ '--quality-width': `${quality}%` }}
          />
        </div>
      )}
      
      {/* Frame rate for video */}
      {showFrameRate && (
        <div className={styles.frameRateIndicator}>
          {frameRate} FPS
        </div>
      )}
    </div>
  );
  
  // Render camera settings
  const renderCameraSettings = () => {
    if (!showShutterSpeed && !showISO && !showAperture) return null;
    
    return (
      <div className={styles.cameraSettings}>
        {showShutterSpeed && (
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>SS:</span>
            <span className={styles.settingValue}>{shutterSpeed}</span>
          </div>
        )}
        
        {showISO && (
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>ISO:</span>
            <span className={styles.settingValue}>{isoValue}</span>
          </div>
        )}
        
        {showAperture && (
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>Aperture:</span>
            <span className={styles.settingValue}>{aperture}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render completion indicators
  const renderCompletionIndicators = () => (
    <div className={styles.completionIndicators}>
      {/* Success checkmark */}
      {state === 'complete' && showCheckmark && (
        <div className={styles.checkmark}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      
      {/* Error icon */}
      {state === 'error' && showErrorIcon && (
        <div className={styles.errorIcon}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}
    </div>
  );
  
  // Render metadata display
  const renderMetadata = () => {
    if (!showMetadata || !metadata) return null;
    
    return (
      <div className={styles.metadata}>
        {metadata.timestamp && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Time:</span>
            <span className={styles.metadataValue}>{metadata.timestamp}</span>
          </div>
        )}
        
        {metadata.fileSize && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Size:</span>
            <span className={styles.metadataValue}>{metadata.fileSize}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render capture preview
  const renderCapturePreview = () => {
    if (!showPreview || !previewImage) return null;
    
    return (
      <div className={`${styles.capturePreview} ${animatePreview ? styles.animatePreview : ''}`}>
        <img
          src={previewImage}
          alt="Capture preview"
          className={styles.previewImage}
        />
      </div>
    );
  };
  
  // Get detailed capture description
  const getDetailedDescription = () => {
    if (!provideCaptureDescription) return null;
    
    const stateText = getStateDescription(state);
    const modeText = getModeDescription();
    const progressText = showProgress ? `, ${Math.round(displayProgress)}% complete` : '';
    const timerText = showTimer && currentTimer > 0 ? `, ${currentTimer} seconds remaining` : '';
    
    return `${modeText}: ${stateText}${progressText}${timerText}`;
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
      {/* Main capture ring */}
      <div className={styles.captureRingMain}>
        {renderProgressRing()}
        {renderPulse()}
        {renderFlash()}
        {renderShutter()}
        {renderTimer()}
      </div>
      
      {/* Capture indicators */}
      {renderCaptureIndicators()}
      
      {/* Camera settings */}
      {renderCameraSettings()}
      
      {/* Completion indicators */}
      {renderCompletionIndicators()}
      
      {/* Metadata display */}
      {renderMetadata()}
      
      {/* Capture preview */}
      {renderCapturePreview()}
      
      {/* Flash overlay */}
      {isFlashing && (
        <div 
          className={styles.flashOverlay}
          style={{ '--flash-intensity': flashIntensity }}
        />
      )}
      
      {/* Capture description for screen readers */}
      {provideCaptureDescription && (
        <div 
          id={`${rest.id || 'capture'}-description`}
          className={styles.srOnly}
        >
          {getDetailedDescription()}
        </div>
      )}
    </div>
  );
});

CaptureRing.displayName = 'CaptureRing';

export default CaptureRing;
