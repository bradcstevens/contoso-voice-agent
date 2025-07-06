/**
 * FOCUS RING ATOM - ADVANCED CAMERA FOCUS VISUALIZATION
 * 
 * Professional focus ring component with confidence scoring, zone focus,
 * real-time focus adjustment indicators, and comprehensive focus feedback.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './FocusRing.module.css';

export interface FocusRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Focus confidence level (0-100) */
  confidence?: number;
  
  /** Current focus mode */
  mode?: 'auto' | 'manual' | 'macro' | 'infinity' | 'zone' | 'tracking' | 'disabled';
  
  /** Focus ring visualization type */
  type?: 'ring' | 'crosshair' | 'grid' | 'zones' | 'beam' | 'spot';
  
  /** Size of the focus ring */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /** Whether focus is currently active/searching */
  active?: boolean;
  
  /** Whether focus is locked */
  locked?: boolean;
  
  /** Focus adjustment direction (-1 to 1, 0 is neutral) */
  adjustment?: number;
  
  /** Focus distance (0-100, 0 is close, 100 is far) */
  distance?: number;
  
  /** Focus zones for zone focus mode */
  zones?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    active: boolean;
  }>;
  
  /** Center point for focus (0-1 coordinates) */
  centerPoint?: { x: number; y: number };
  
  /** Focus area size multiplier */
  areaSize?: number;
  
  /** Whether to show confidence percentage */
  showConfidence?: boolean;
  
  /** Whether to show distance indicator */
  showDistance?: boolean;
  
  /** Whether to show adjustment indicator */
  showAdjustment?: boolean;
  
  /** Whether to show focus zones */
  showZones?: boolean;
  
  /** Focus speed (for animations) */
  focusSpeed?: number;
  
  /** Whether to use smooth animations */
  smooth?: boolean;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Focus quality threshold for success state */
  qualityThreshold?: number;
  
  /** Custom colors for different confidence levels */
  confidenceColors?: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
    searching: string;
  };
  
  /** Whether focus ring pulsates when searching */
  pulsate?: boolean;
  
  /** Pulse frequency for searching animation */
  pulseFrequency?: number;
  
  /** Whether to show focus direction indicator */
  showDirection?: boolean;
  
  /** Focus direction (-1 is near, 1 is far) */
  direction?: number;
  
  /** Maximum focus ring size */
  maxSize?: number;
  
  /** Minimum focus ring size */
  minSize?: number;
  
  /** Whether to auto-hide when focus is stable */
  autoHide?: boolean;
  
  /** Auto-hide delay in milliseconds */
  autoHideDelay?: number;
  
  /** Custom focus constraints */
  constraints?: {
    minDistance?: number;
    maxDistance?: number;
    allowMacro?: boolean;
    allowInfinity?: boolean;
  };
  
  /** Focus tracking data for tracking mode */
  trackingData?: {
    velocity: { x: number; y: number };
    prediction: { x: number; y: number };
    stability: number;
  };
  
  /** Whether focus is in continuous mode */
  continuous?: boolean;
  
  /** Focus acquisition time in milliseconds */
  acquisitionTime?: number;
  
  /** Whether to show acquisition timer */
  showAcquisitionTime?: boolean;
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Whether to provide detailed focus descriptions */
  provideFocusDescription?: boolean;
  
  /** Callback when focus confidence changes */
  onConfidenceChange?: (confidence: number) => void;
  
  /** Callback when focus is acquired */
  onFocusAcquired?: (confidence: number, distance: number) => void;
  
  /** Callback when focus is lost */
  onFocusLost?: () => void;
  
  /** Callback when focus zone is selected */
  onZoneSelect?: (zoneId: string) => void;
  
  /** Callback when focus adjustment changes */
  onAdjustmentChange?: (direction: number) => void;
  
  /** Custom width override */
  width?: number;
  
  /** Custom height override */
  height?: number;
  
  /** Whether ring should be circular or follow aspect ratio */
  circular?: boolean;
  
  /** Focus ring opacity */
  opacity?: number;
  
  /** Whether to show crosshair center point */
  showCrosshair?: boolean;
  
  /** Grid density for grid type */
  gridDensity?: number;
  
  /** Beam width for beam type */
  beamWidth?: number;
}

/**
 * Enhanced FocusRing atom with professional camera focus visualization
 */
export const FocusRing = forwardRef<HTMLDivElement, FocusRingProps>(({
  confidence = 0,
  mode = 'auto',
  type = 'ring',
  size = 'md',
  variant = 'default',
  active = false,
  locked = false,
  adjustment = 0,
  distance = 50,
  zones = [],
  centerPoint = { x: 0.5, y: 0.5 },
  areaSize = 1,
  showConfidence = false,
  showDistance = false,
  showAdjustment = false,
  showZones = false,
  focusSpeed = 1,
  smooth = true,
  animationDuration = 300,
  qualityThreshold = 70,
  confidenceColors = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444',
    searching: '#8b5cf6'
  },
  pulsate = true,
  pulseFrequency = 1.5,
  showDirection = false,
  direction = 0,
  maxSize = 200,
  minSize = 50,
  autoHide = false,
  autoHideDelay = 3000,
  constraints = {},
  trackingData,
  continuous = false,
  acquisitionTime = 0,
  showAcquisitionTime = false,
  ariaLabel,
  provideFocusDescription = false,
  onConfidenceChange,
  onFocusAcquired,
  onFocusLost,
  onZoneSelect,
  onAdjustmentChange,
  width,
  height,
  circular = true,
  opacity = 1,
  showCrosshair = false,
  gridDensity = 3,
  beamWidth = 4,
  className = '',
  ...rest
}, ref) => {
  const [displayConfidence, setDisplayConfidence] = useState(confidence);
  const [isVisible, setIsVisible] = useState(true);
  const [acquisitionTimer, setAcquisitionTimer] = useState(0);
  const [lastFocusEvent, setLastFocusEvent] = useState<number>(0);
  const animationRef = useRef<number>();
  const hideTimerRef = useRef<NodeJS.Timeout>();
  const acquisitionRef = useRef<NodeJS.Timeout>();
  
  // Ring dimensions based on size
  const getDimensions = () => {
    if (width && height) return { width, height };
    
    const sizeMap = {
      xs: { width: 40, height: 40 },
      sm: { width: 60, height: 60 },
      md: { width: 80, height: 80 },
      lg: { width: 120, height: 120 },
      xl: { width: 160, height: 160 }
    };
    
    return sizeMap[size];
  };
  
  const { width: ringWidth, height: ringHeight } = getDimensions();
  
  // Get confidence color based on level
  const getConfidenceColor = (conf: number): string => {
    if (active && !locked) return confidenceColors.searching;
    if (conf >= 90) return confidenceColors.excellent;
    if (conf >= 70) return confidenceColors.good;
    if (conf >= 40) return confidenceColors.fair;
    return confidenceColors.poor;
  };
  
  // Get focus mode description
  const getFocusModeDescription = (): string => {
    const modeDescriptions = {
      auto: 'Automatic focus',
      manual: 'Manual focus',
      macro: 'Macro focus for close subjects',
      infinity: 'Infinity focus for distant subjects',
      zone: 'Zone focus with multiple areas',
      tracking: 'Subject tracking focus',
      disabled: 'Focus disabled'
    };
    return modeDescriptions[mode];
  };
  
  // Get confidence level description
  const getConfidenceDescription = (conf: number): string => {
    if (active && !locked) return 'Searching for focus';
    if (conf >= 90) return 'Excellent focus';
    if (conf >= 70) return 'Good focus';
    if (conf >= 40) return 'Fair focus';
    if (conf >= 20) return 'Poor focus';
    return 'No focus detected';
  };
  
  // Smooth animation for confidence level
  useEffect(() => {
    if (!smooth) {
      setDisplayConfidence(confidence);
      return;
    }
    
    const animate = () => {
      setDisplayConfidence(prev => {
        const diff = confidence - prev;
        const step = diff * (0.1 * focusSpeed);
        const newValue = Math.abs(step) < 0.1 ? confidence : prev + step;
        return Math.max(0, Math.min(100, newValue));
      });
      
      if (Math.abs(displayConfidence - confidence) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [confidence, smooth, focusSpeed, displayConfidence]);
  
  // Confidence change callback
  useEffect(() => {
    if (onConfidenceChange && Math.abs(displayConfidence - lastFocusEvent) > 5) {
      setLastFocusEvent(displayConfidence);
      onConfidenceChange(displayConfidence);
    }
  }, [displayConfidence, lastFocusEvent, onConfidenceChange]);
  
  // Focus acquisition detection
  useEffect(() => {
    if (locked && displayConfidence >= qualityThreshold && onFocusAcquired) {
      onFocusAcquired(displayConfidence, distance);
    } else if (!locked && displayConfidence < qualityThreshold && onFocusLost) {
      onFocusLost();
    }
  }, [locked, displayConfidence, qualityThreshold, distance, onFocusAcquired, onFocusLost]);
  
  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && locked && displayConfidence >= qualityThreshold) {
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
  }, [autoHide, locked, displayConfidence, qualityThreshold, autoHideDelay]);
  
  // Acquisition timer
  useEffect(() => {
    if (active && !locked) {
      const startTime = Date.now();
      acquisitionRef.current = setInterval(() => {
        setAcquisitionTimer(Date.now() - startTime);
      }, 10);
    } else {
      if (acquisitionRef.current) {
        clearInterval(acquisitionRef.current);
      }
      setAcquisitionTimer(acquisitionTime);
    }
    
    return () => {
      if (acquisitionRef.current) {
        clearInterval(acquisitionRef.current);
      }
    };
  }, [active, locked, acquisitionTime]);
  
  // Zone selection handler
  const handleZoneClick = useCallback((zoneId: string) => {
    if (onZoneSelect) {
      onZoneSelect(zoneId);
    }
  }, [onZoneSelect]);
  
  // Adjustment change handler
  useEffect(() => {
    if (onAdjustmentChange && adjustment !== 0) {
      onAdjustmentChange(adjustment);
    }
  }, [adjustment, onAdjustmentChange]);
  
  // Class computation
  const computedClassName = [
    styles.focusRing,
    styles[type],
    styles[size],
    styles[variant],
    styles[mode],
    active && styles.active,
    locked && styles.locked,
    displayConfidence >= qualityThreshold && styles.focused,
    displayConfidence < 20 && styles.noFocus,
    pulsate && active && !locked && styles.pulsate,
    !isVisible && styles.hidden,
    continuous && styles.continuous,
    circular && styles.circular,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    '--focus-confidence': `${displayConfidence}%`,
    '--focus-adjustment': adjustment,
    '--focus-distance': `${distance}%`,
    '--focus-speed': focusSpeed,
    '--animation-duration': `${animationDuration}ms`,
    '--pulse-frequency': `${pulseFrequency}s`,
    '--area-size': areaSize,
    '--center-x': centerPoint.x,
    '--center-y': centerPoint.y,
    '--ring-width': `${ringWidth}px`,
    '--ring-height': `${ringHeight}px`,
    '--max-size': `${maxSize}px`,
    '--min-size': `${minSize}px`,
    '--confidence-color': getConfidenceColor(displayConfidence),
    '--ring-opacity': opacity,
    '--grid-density': gridDensity,
    '--beam-width': `${beamWidth}px`,
    '--direction': direction
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'status',
    'aria-label': ariaLabel || `${getFocusModeDescription()}: ${getConfidenceDescription(displayConfidence)}`,
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-busy': active && !locked,
    'aria-valuenow': Math.round(displayConfidence),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuetext': `Focus confidence: ${Math.round(displayConfidence)}%`
  };
  
  // Render focus zones
  const renderZones = () => {
    if (!showZones || zones.length === 0) return null;
    
    return zones.map((zone) => (
      <div
        key={zone.id}
        className={`${styles.focusZone} ${zone.active ? styles.activeZone : ''}`}
        style={{
          left: `${zone.x * 100}%`,
          top: `${zone.y * 100}%`,
          width: `${zone.width * 100}%`,
          height: `${zone.height * 100}%`,
          '--zone-confidence': `${zone.confidence}%`,
          '--zone-color': getConfidenceColor(zone.confidence)
        }}
        onClick={() => handleZoneClick(zone.id)}
        role="button"
        tabIndex={0}
        aria-label={`Focus zone ${zone.id}: ${zone.confidence}% confidence`}
      />
    ));
  };
  
  // Render crosshair
  const renderCrosshair = () => {
    if (!showCrosshair && type !== 'crosshair') return null;
    
    return (
      <div className={styles.crosshair}>
        <div className={styles.crosshairHorizontal} />
        <div className={styles.crosshairVertical} />
        <div className={styles.crosshairCenter} />
      </div>
    );
  };
  
  // Render grid
  const renderGrid = () => {
    if (type !== 'grid') return null;
    
    const gridLines = [];
    for (let i = 1; i < gridDensity; i++) {
      const position = (i / gridDensity) * 100;
      gridLines.push(
        <div
          key={`h-${i}`}
          className={styles.gridLineHorizontal}
          style={{ top: `${position}%` }}
        />,
        <div
          key={`v-${i}`}
          className={styles.gridLineVertical}
          style={{ left: `${position}%` }}
        />
      );
    }
    
    return <div className={styles.grid}>{gridLines}</div>;
  };
  
  // Render beam
  const renderBeam = () => {
    if (type !== 'beam') return null;
    
    return (
      <div 
        className={styles.beam}
        style={{
          '--beam-rotation': `${direction * 90}deg`
        }}
      />
    );
  };
  
  // Render spot
  const renderSpot = () => {
    if (type !== 'spot') return null;
    
    return <div className={styles.spot} />;
  };
  
  // Render confidence indicator
  const renderConfidenceIndicator = () => {
    if (!showConfidence) return null;
    
    return (
      <div className={styles.confidenceIndicator}>
        <span className={styles.confidenceValue}>
          {Math.round(displayConfidence)}%
        </span>
        <div className={styles.confidenceBar}>
          <div 
            className={styles.confidenceBarFill}
            style={{ width: `${displayConfidence}%` }}
          />
        </div>
      </div>
    );
  };
  
  // Render distance indicator
  const renderDistanceIndicator = () => {
    if (!showDistance) return null;
    
    return (
      <div className={styles.distanceIndicator}>
        <div className={styles.distanceLabel}>Distance</div>
        <div className={styles.distanceScale}>
          <div className={styles.distanceNear}>Near</div>
          <div 
            className={styles.distanceMarker}
            style={{ left: `${distance}%` }}
          />
          <div className={styles.distanceFar}>Far</div>
        </div>
      </div>
    );
  };
  
  // Render adjustment indicator
  const renderAdjustmentIndicator = () => {
    if (!showAdjustment || adjustment === 0) return null;
    
    const adjustmentDirection = adjustment > 0 ? 'far' : 'near';
    const adjustmentIntensity = Math.abs(adjustment);
    
    return (
      <div className={`${styles.adjustmentIndicator} ${styles[adjustmentDirection]}`}>
        <div className={styles.adjustmentArrow} />
        <div 
          className={styles.adjustmentBar}
          style={{ '--adjustment-intensity': adjustmentIntensity }}
        />
      </div>
    );
  };
  
  // Render direction indicator
  const renderDirectionIndicator = () => {
    if (!showDirection || direction === 0) return null;
    
    return (
      <div className={styles.directionIndicator}>
        <div 
          className={styles.directionArrow}
          style={{ '--direction-rotation': `${direction * 180}deg` }}
        />
      </div>
    );
  };
  
  // Render acquisition timer
  const renderAcquisitionTimer = () => {
    if (!showAcquisitionTime || acquisitionTimer === 0) return null;
    
    return (
      <div className={styles.acquisitionTimer}>
        {(acquisitionTimer / 1000).toFixed(1)}s
      </div>
    );
  };
  
  // Render tracking prediction
  const renderTrackingPrediction = () => {
    if (mode !== 'tracking' || !trackingData) return null;
    
    return (
      <div 
        className={styles.trackingPrediction}
        style={{
          left: `${trackingData.prediction.x * 100}%`,
          top: `${trackingData.prediction.y * 100}%`,
          '--tracking-stability': trackingData.stability
        }}
      >
        <div className={styles.predictionIndicator} />
        <div className={styles.velocityVector}>
          <div 
            className={styles.velocityLine}
            style={{
              '--velocity-x': trackingData.velocity.x,
              '--velocity-y': trackingData.velocity.y
            }}
          />
        </div>
      </div>
    );
  };
  
  // Get detailed focus description
  const getDetailedDescription = () => {
    if (!provideFocusDescription) return null;
    
    const modeText = getFocusModeDescription();
    const confidenceText = getConfidenceDescription(displayConfidence);
    const distanceText = showDistance ? `, distance ${Math.round(distance)}%` : '';
    const lockText = locked ? ', focus locked' : '';
    
    return `${modeText}: ${confidenceText}${distanceText}${lockText}`;
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
      {/* Main focus ring */}
      <div className={styles.focusRingMain}>
        {type === 'ring' && (
          <div className={styles.ring}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
          </div>
        )}
        
        {renderCrosshair()}
        {renderGrid()}
        {renderBeam()}
        {renderSpot()}
      </div>
      
      {/* Focus zones */}
      {renderZones()}
      
      {/* Tracking prediction */}
      {renderTrackingPrediction()}
      
      {/* Indicators */}
      {renderConfidenceIndicator()}
      {renderDistanceIndicator()}
      {renderAdjustmentIndicator()}
      {renderDirectionIndicator()}
      {renderAcquisitionTimer()}
      
      {/* Focus description for screen readers */}
      {provideFocusDescription && (
        <div 
          id={`${rest.id || 'focus'}-description`}
          className={styles.srOnly}
        >
          {getDetailedDescription()}
        </div>
      )}
    </div>
  );
});

FocusRing.displayName = 'FocusRing';

export default FocusRing;
