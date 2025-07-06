/**
 * CAMERA INDICATOR ATOM - REAL-TIME CAMERA ACTIVITY & QUALITY VISUALIZATION
 * 
 * Professional camera indicator component with real-time quality monitoring,
 * multiple display modes, frame rate visualization, and comprehensive camera metrics.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './CameraIndicator.module.css';

export interface CameraIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current camera quality metrics (0-100) */
  cameraQuality?: number;
  
  /** Display mode for camera visualization */
  mode?: 'bars' | 'dots' | 'ring' | 'meter' | 'grid';
  
  /** Size of the camera indicator */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /** Whether the indicator is currently active */
  active?: boolean;
  
  /** Current frame rate (FPS) */
  frameRate?: number;
  
  /** Target frame rate for comparison */
  targetFrameRate?: number;
  
  /** Current resolution quality (0-100) */
  resolutionQuality?: number;
  
  /** Lighting quality assessment (0-100) */
  lightingQuality?: number;
  
  /** Focus quality level (0-100) */
  focusQuality?: number;
  
  /** Camera exposure level (0-100, 50 is optimal) */
  exposureLevel?: number;
  
  /** Whether to show frame rate indicator */
  showFrameRate?: boolean;
  
  /** Whether to show resolution quality */
  showResolution?: boolean;
  
  /** Whether to show lighting assessment */
  showLighting?: boolean;
  
  /** Whether to show focus quality */
  showFocus?: boolean;
  
  /** Whether to show exposure meter */
  showExposure?: boolean;
  
  /** Number of quality segments to display */
  segments?: number;
  
  /** Whether to show smooth animations */
  smooth?: boolean;
  
  /** Animation speed multiplier */
  animationSpeed?: number;
  
  /** Quality threshold for warnings */
  qualityThreshold?: number;
  
  /** Custom colors for quality levels */
  qualityColors?: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  
  /** Direction for bar/meter display */
  direction?: 'horizontal' | 'vertical' | 'radial';
  
  /** Real-time camera metrics for detailed analysis */
  cameraMetrics?: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    noise: number;
  };
  
  /** Whether to show camera stabilization indicator */
  showStabilization?: boolean;
  
  /** Camera stabilization quality (0-100) */
  stabilizationQuality?: number;
  
  /** Auto-focus status */
  autoFocusStatus?: 'searching' | 'locked' | 'failed' | 'disabled';
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Whether to provide detailed descriptions */
  provideQualityDescription?: boolean;
  
  /** Callback when quality changes significantly */
  onQualityChange?: (quality: number) => void;
  
  /** Callback when frame rate drops below threshold */
  onFrameRateWarning?: (currentFps: number) => void;
  
  /** Callback when focus quality changes */
  onFocusChange?: (focusQuality: number) => void;
  
  /** Custom width override */
  width?: number;
  
  /** Custom height override */
  height?: number;
  
  /** Whether to auto-scale quality display */
  autoScale?: boolean;
  
  /** Update interval for metrics (milliseconds) */
  updateInterval?: number;
}

/**
 * Enhanced CameraIndicator atom with comprehensive camera quality visualization
 */
export const CameraIndicator = forwardRef<HTMLDivElement, CameraIndicatorProps>(({
  cameraQuality = 0,
  mode = 'bars',
  size = 'md',
  variant = 'default',
  active = false,
  frameRate = 0,
  targetFrameRate = 30,
  resolutionQuality = 100,
  lightingQuality = 50,
  focusQuality = 0,
  exposureLevel = 50,
  showFrameRate = false,
  showResolution = false,
  showLighting = false,
  showFocus = false,
  showExposure = false,
  segments = 5,
  smooth = true,
  animationSpeed = 1,
  qualityThreshold = 70,
  qualityColors = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444'
  },
  direction = 'vertical',
  cameraMetrics,
  showStabilization = false,
  stabilizationQuality = 100,
  autoFocusStatus = 'disabled',
  ariaLabel,
  provideQualityDescription = false,
  onQualityChange,
  onFrameRateWarning,
  onFocusChange,
  width,
  height,
  autoScale = true,
  updateInterval = 100,
  className = '',
  ...rest
}, ref) => {
  const [displayQuality, setDisplayQuality] = useState(cameraQuality);
  const [segmentQualities, setSegmentQualities] = useState<number[]>(new Array(segments).fill(0));
  const [lastQualityChange, setLastQualityChange] = useState<number>(0);
  const animationRef = useRef<number>();
  const updateTimerRef = useRef<NodeJS.Timeout>();
  
  // Canvas dimensions based on size
  const getDimensions = () => {
    if (width && height) return { width, height };
    
    const sizeMap = {
      xs: { width: 80, height: 20 },
      sm: { width: 120, height: 30 },
      md: { width: 160, height: 40 },
      lg: { width: 200, height: 50 },
      xl: { width: 240, height: 60 }
    };
    
    return sizeMap[size];
  };
  
  const { width: indicatorWidth, height: indicatorHeight } = getDimensions();
  
  // Get quality color based on level
  const getQualityColor = (quality: number): string => {
    if (quality >= 90) return qualityColors.excellent;
    if (quality >= 70) return qualityColors.good;
    if (quality >= 40) return qualityColors.fair;
    return qualityColors.poor;
  };
  
  // Get quality text description
  const getQualityDescription = (quality: number): string => {
    if (quality >= 90) return 'Excellent';
    if (quality >= 70) return 'Good';
    if (quality >= 40) return 'Fair';
    if (quality >= 20) return 'Poor';
    return 'Very Poor';
  };
  
  // Smooth animation for quality level
  useEffect(() => {
    if (!smooth) {
      setDisplayQuality(cameraQuality);
      return;
    }
    
    const animate = () => {
      setDisplayQuality(prev => {
        const diff = cameraQuality - prev;
        const step = diff * 0.1 * animationSpeed;
        const newValue = Math.abs(step) < 0.1 ? cameraQuality : prev + step;
        return Math.max(0, Math.min(100, newValue));
      });
      
      if (Math.abs(displayQuality - cameraQuality) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cameraQuality, smooth, animationSpeed, displayQuality]);
  
  // Update segment qualities for bars/dots mode
  useEffect(() => {
    if (mode === 'bars' || mode === 'dots') {
      const newQualities = new Array(segments).fill(0).map((_, index) => {
        const segmentThreshold = ((index + 1) / segments) * 100;
        return displayQuality >= segmentThreshold ? 100 : 
               displayQuality >= segmentThreshold - (100 / segments) ? 
               ((displayQuality - (segmentThreshold - (100 / segments))) / (100 / segments)) * 100 : 0;
      });
      setSegmentQualities(newQualities);
    }
  }, [displayQuality, segments, mode]);
  
  // Quality change callback with debouncing
  useEffect(() => {
    if (onQualityChange && Math.abs(displayQuality - lastQualityChange) > 5) {
      setLastQualityChange(displayQuality);
      onQualityChange(displayQuality);
    }
  }, [displayQuality, lastQualityChange, onQualityChange]);
  
  // Frame rate monitoring
  useEffect(() => {
    if (onFrameRateWarning && frameRate > 0 && frameRate < targetFrameRate * 0.8) {
      onFrameRateWarning(frameRate);
    }
  }, [frameRate, targetFrameRate, onFrameRateWarning]);
  
  // Focus quality monitoring
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(focusQuality);
    }
  }, [focusQuality, onFocusChange]);
  
  // Class computation
  const computedClassName = [
    styles.cameraIndicator,
    styles[mode],
    styles[size],
    styles[variant],
    styles[direction],
    active && styles.active,
    displayQuality < qualityThreshold && styles.lowQuality,
    autoFocusStatus !== 'disabled' && styles[autoFocusStatus],
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    '--camera-quality': `${displayQuality}%`,
    '--frame-rate': frameRate,
    '--target-frame-rate': targetFrameRate,
    '--resolution-quality': `${resolutionQuality}%`,
    '--lighting-quality': `${lightingQuality}%`,
    '--focus-quality': `${focusQuality}%`,
    '--exposure-level': `${exposureLevel}%`,
    '--stabilization-quality': `${stabilizationQuality}%`,
    '--segments': segments,
    '--animation-speed': animationSpeed,
    '--quality-color': getQualityColor(displayQuality)
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'progressbar',
    'aria-label': ariaLabel || `Camera quality: ${Math.round(displayQuality)}%, ${getQualityDescription(displayQuality)}`,
    'aria-valuenow': Math.round(displayQuality),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-live': 'polite',
    'aria-atomic': 'true'
  };
  
  // Render segments for bars/dots mode
  const renderSegments = () => {
    return segmentQualities.map((quality, index) => {
      const isActive = quality > 0;
      const intensity = quality / 100;
      const segmentColor = getQualityColor(((index + 1) / segments) * 100);
      
      return (
        <div
          key={index}
          className={`${styles.segment} ${isActive ? styles.activeSegment : ''}`}
          style={{
            '--segment-intensity': intensity,
            '--segment-index': index,
            '--segment-color': segmentColor
          }}
          aria-hidden="true"
        />
      );
    });
  };
  
  // Render ring visualization
  const renderRing = () => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (displayQuality / 100) * circumference;
    
    return (
      <svg className={styles.ringSvg} viewBox="0 0 80 80">
        <circle
          className={styles.ringTrack}
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
        />
        <circle
          className={styles.ringProgress}
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ stroke: getQualityColor(displayQuality) }}
        />
        
        {/* Center quality text */}
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.ringText}
          fontSize="12"
          fontWeight="600"
        >
          {Math.round(displayQuality)}
        </text>
      </svg>
    );
  };
  
  // Render meter visualization
  const renderMeter = () => (
    <div className={styles.meter}>
      <div 
        className={styles.meterFill}
        style={{ 
          '--meter-width': `${displayQuality}%`,
          '--meter-color': getQualityColor(displayQuality)
        }}
      />
      <div className={styles.meterText}>
        {Math.round(displayQuality)}%
      </div>
    </div>
  );
  
  // Render grid visualization for detailed metrics
  const renderGrid = () => (
    <div className={styles.grid}>
      {cameraMetrics && Object.entries(cameraMetrics).map(([key, value]) => (
        <div key={key} className={styles.gridItem}>
          <div className={styles.gridLabel}>{key}</div>
          <div 
            className={styles.gridBar}
            style={{ 
              '--bar-width': `${value}%`,
              '--bar-color': getQualityColor(value)
            }}
          />
        </div>
      ))}
    </div>
  );
  
  // Get detailed quality description
  const getDetailedDescription = () => {
    if (!provideQualityDescription) return null;
    
    const qualityText = getQualityDescription(displayQuality);
    const frameRateText = showFrameRate ? `, ${frameRate} FPS` : '';
    const focusText = showFocus && autoFocusStatus !== 'disabled' ? `, focus ${autoFocusStatus}` : '';
    
    return `Camera quality: ${qualityText}${frameRateText}${focusText}`;
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
      {/* Main quality indicator */}
      <div className={styles.mainIndicator}>
        {mode === 'bars' && (
          <div className={styles.segmentsContainer}>
            {renderSegments()}
          </div>
        )}
        
        {mode === 'dots' && (
          <div className={styles.segmentsContainer}>
            {renderSegments()}
          </div>
        )}
        
        {mode === 'ring' && renderRing()}
        
        {mode === 'meter' && renderMeter()}
        
        {mode === 'grid' && renderGrid()}
      </div>
      
      {/* Additional metrics */}
      {(showFrameRate || showResolution || showLighting || showFocus || showExposure || showStabilization) && (
        <div className={styles.additionalMetrics}>
          {/* Frame rate indicator */}
          {showFrameRate && (
            <div className={styles.frameRate}>
              <span className={styles.metricLabel}>FPS:</span>
              <span className={`${styles.metricValue} ${frameRate < targetFrameRate * 0.8 ? styles.warning : ''}`}>
                {frameRate}
              </span>
            </div>
          )}
          
          {/* Resolution quality */}
          {showResolution && (
            <div className={styles.resolution}>
              <span className={styles.metricLabel}>Res:</span>
              <div 
                className={styles.metricBar}
                style={{ 
                  '--metric-width': `${resolutionQuality}%`,
                  '--metric-color': getQualityColor(resolutionQuality)
                }}
              />
            </div>
          )}
          
          {/* Lighting quality */}
          {showLighting && (
            <div className={styles.lighting}>
              <span className={styles.metricLabel}>Light:</span>
              <div 
                className={styles.metricBar}
                style={{ 
                  '--metric-width': `${lightingQuality}%`,
                  '--metric-color': getQualityColor(lightingQuality)
                }}
              />
            </div>
          )}
          
          {/* Focus quality */}
          {showFocus && (
            <div className={styles.focus}>
              <span className={styles.metricLabel}>Focus:</span>
              <div 
                className={styles.metricBar}
                style={{ 
                  '--metric-width': `${focusQuality}%`,
                  '--metric-color': getQualityColor(focusQuality)
                }}
              />
              {autoFocusStatus !== 'disabled' && (
                <span className={`${styles.focusStatus} ${styles[autoFocusStatus]}`}>
                  {autoFocusStatus}
                </span>
              )}
            </div>
          )}
          
          {/* Exposure level */}
          {showExposure && (
            <div className={styles.exposure}>
              <span className={styles.metricLabel}>Exp:</span>
              <div 
                className={styles.exposureMeter}
                style={{ '--exposure-position': `${exposureLevel}%` }}
              >
                <div className={styles.exposureOptimal} />
                <div className={styles.exposureIndicator} />
              </div>
            </div>
          )}
          
          {/* Stabilization quality */}
          {showStabilization && (
            <div className={styles.stabilization}>
              <span className={styles.metricLabel}>Stab:</span>
              <div 
                className={styles.metricBar}
                style={{ 
                  '--metric-width': `${stabilizationQuality}%`,
                  '--metric-color': getQualityColor(stabilizationQuality)
                }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Quality description for screen readers */}
      {provideQualityDescription && (
        <div 
          id={`${rest.id || 'camera'}-description`}
          className={styles.srOnly}
        >
          {getDetailedDescription()}
        </div>
      )}
    </div>
  );
});

CameraIndicator.displayName = 'CameraIndicator';

export default CameraIndicator;
