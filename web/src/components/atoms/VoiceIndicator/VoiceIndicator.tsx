/**
 * VOICE INDICATOR ATOM - ENHANCED VOICE ACTIVITY VISUALIZATION
 * 
 * Specialized voice activity indicator component with real-time visualization,
 * multiple display modes, sensitivity control, and accessibility features.
 */

import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './VoiceIndicator.module.css';

export interface VoiceIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current voice activity level (0-100) */
  activityLevel?: number;
  
  /** Display mode for voice visualization */
  mode?: 'bars' | 'dots' | 'wave' | 'ring' | 'pulse';
  
  /** Size of the voice indicator */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /** Whether the indicator is currently active */
  active?: boolean;
  
  /** Sensitivity level for voice detection (0-100) */
  sensitivity?: number;
  
  /** Minimum threshold for activity display */
  threshold?: number;
  
  /** Number of bars/dots to display */
  segments?: number;
  
  /** Whether to show smooth animations */
  smooth?: boolean;
  
  /** Animation speed multiplier */
  animationSpeed?: number;
  
  /** Whether to show peak hold effect */
  showPeaks?: boolean;
  
  /** Peak hold duration in milliseconds */
  peakHoldTime?: number;
  
  /** Custom color for active state */
  activeColor?: string;
  
  /** Custom color for inactive state */
  inactiveColor?: string;
  
  /** Direction for bar/wave display */
  direction?: 'horizontal' | 'vertical' | 'radial';
  
  /** Whether to mirror the display (for stereo effect) */
  mirror?: boolean;
  
  /** Real-time audio data array for detailed visualization */
  audioData?: number[];
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Whether this indicator represents microphone input */
  isMicrophone?: boolean;
  
  /** Whether this indicator represents speaker output */
  isSpeaker?: boolean;
  
  /** Callback when activity level changes */
  onActivityChange?: (level: number) => void;
  
  /** Callback when threshold is exceeded */
  onThresholdExceeded?: () => void;
  
  /** Whether to show numeric value */
  showValue?: boolean;
  
  /** Custom range for value display */
  valueRange?: [number, number];
}

/**
 * Enhanced VoiceIndicator atom with comprehensive voice activity visualization
 */
export const VoiceIndicator = forwardRef<HTMLDivElement, VoiceIndicatorProps>(({
  activityLevel = 0,
  mode = 'bars',
  size = 'md',
  variant = 'default',
  active = false,
  sensitivity = 50,
  threshold = 10,
  segments = 5,
  smooth = true,
  animationSpeed = 1,
  showPeaks = false,
  peakHoldTime = 1000,
  activeColor,
  inactiveColor,
  direction = 'vertical',
  mirror = false,
  audioData,
  ariaLabel,
  isMicrophone = false,
  isSpeaker = false,
  onActivityChange,
  onThresholdExceeded,
  showValue = false,
  valueRange = [0, 100],
  className = '',
  ...rest
}, ref) => {
  const [displayLevel, setDisplayLevel] = useState(activityLevel);
  const [peakLevel, setPeakLevel] = useState(0);
  const [segmentLevels, setSegmentLevels] = useState<number[]>(new Array(segments).fill(0));
  const peakTimerRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  
  // Calculate adjusted activity level based on sensitivity
  const adjustedLevel = Math.min(100, (activityLevel * (100 / Math.max(1, sensitivity))));
  
  // Smooth animation for activity level
  useEffect(() => {
    if (!smooth) {
      setDisplayLevel(adjustedLevel);
      return;
    }
    
    const animate = () => {
      setDisplayLevel(prev => {
        const diff = adjustedLevel - prev;
        const step = diff * 0.1 * animationSpeed;
        const newValue = Math.abs(step) < 0.1 ? adjustedLevel : prev + step;
        return Math.max(0, Math.min(100, newValue));
      });
      
      if (Math.abs(displayLevel - adjustedLevel) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [adjustedLevel, smooth, animationSpeed, displayLevel]);
  
  // Peak hold logic
  useEffect(() => {
    if (showPeaks && displayLevel > peakLevel) {
      setPeakLevel(displayLevel);
      
      if (peakTimerRef.current) {
        clearTimeout(peakTimerRef.current);
      }
      
      peakTimerRef.current = setTimeout(() => {
        setPeakLevel(0);
      }, peakHoldTime);
    }
  }, [displayLevel, peakLevel, showPeaks, peakHoldTime]);
  
  // Update segment levels for bars/dots mode
  useEffect(() => {
    if (mode === 'bars' || mode === 'dots') {
      const newLevels = new Array(segments).fill(0).map((_, index) => {
        const segmentThreshold = ((index + 1) / segments) * 100;
        return displayLevel >= segmentThreshold ? 100 : 
               displayLevel >= segmentThreshold - (100 / segments) ? 
               ((displayLevel - (segmentThreshold - (100 / segments))) / (100 / segments)) * 100 : 0;
      });
      setSegmentLevels(newLevels);
    }
  }, [displayLevel, segments, mode]);
  
  // Activity change callback
  useEffect(() => {
    if (onActivityChange) {
      onActivityChange(displayLevel);
    }
    
    if (onThresholdExceeded && displayLevel > threshold) {
      onThresholdExceeded();
    }
  }, [displayLevel, threshold, onActivityChange, onThresholdExceeded]);
  
  // Class computation
  const computedClassName = [
    styles.voiceIndicator,
    styles[mode],
    styles[size],
    styles[variant],
    styles[direction],
    active && styles.active,
    mirror && styles.mirror,
    isMicrophone && styles.microphone,
    isSpeaker && styles.speaker,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(activeColor && { '--voice-active-color': activeColor }),
    ...(inactiveColor && { '--voice-inactive-color': inactiveColor }),
    '--activity-level': `${displayLevel}%`,
    '--peak-level': `${peakLevel}%`,
    '--threshold': `${threshold}%`,
    '--segments': segments,
    '--animation-speed': animationSpeed
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'progressbar',
    'aria-label': ariaLabel || `Voice activity: ${Math.round(displayLevel)}%`,
    'aria-valuenow': Math.round(displayLevel),
    'aria-valuemin': valueRange[0],
    'aria-valuemax': valueRange[1],
    'aria-live': 'polite',
    'aria-atomic': 'true'
  };
  
  // Render segments for bars/dots mode
  const renderSegments = () => {
    return segmentLevels.map((level, index) => {
      const isActive = level > 0;
      const intensity = level / 100;
      
      return (
        <div
          key={index}
          className={`${styles.segment} ${isActive ? styles.activeSegment : ''}`}
          style={{
            '--segment-intensity': intensity,
            '--segment-index': index
          }}
          aria-hidden="true"
        />
      );
    });
  };
  
  // Render wave visualization
  const renderWave = () => {
    const dataPoints = audioData || new Array(20).fill(0).map((_, i) => 
      Math.sin((i / 20) * Math.PI * 2 + Date.now() / 200) * displayLevel / 2 + displayLevel / 2
    );
    
    const pathData = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * 100;
      const y = 50 + (point - 50) * 0.8; // Scale and center
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return (
      <svg className={styles.waveSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          className={styles.wavePath}
          d={pathData}
          fill="none"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {showPeaks && peakLevel > 0 && (
          <line
            className={styles.peakLine}
            x1="0"
            y1={50 - (peakLevel - 50) * 0.8}
            x2="100"
            y2={50 - (peakLevel - 50) * 0.8}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    );
  };
  
  // Render ring visualization
  const renderRing = () => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (displayLevel / 100) * circumference;
    
    return (
      <svg className={styles.ringSvg} viewBox="0 0 100 100">
        <circle
          className={styles.ringTrack}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
        />
        <circle
          className={styles.ringProgress}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
        />
        {showPeaks && peakLevel > 0 && (
          <circle
            className={styles.ringPeak}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="2"
            strokeDasharray={`${(peakLevel / 100) * 2} ${circumference}`}
            transform="rotate(-90 50 50)"
          />
        )}
      </svg>
    );
  };
  
  // Render pulse visualization
  const renderPulse = () => (
    <div 
      className={styles.pulseCircle}
      style={{ '--pulse-intensity': displayLevel / 100 }}
      aria-hidden="true"
    />
  );
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      {...accessibilityProps}
      {...rest}
    >
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
      
      {mode === 'wave' && renderWave()}
      
      {mode === 'ring' && renderRing()}
      
      {mode === 'pulse' && renderPulse()}
      
      {showValue && (
        <div className={styles.valueDisplay} aria-hidden="true">
          {Math.round(displayLevel)}%
        </div>
      )}
    </div>
  );
});

VoiceIndicator.displayName = 'VoiceIndicator';

export default VoiceIndicator;
