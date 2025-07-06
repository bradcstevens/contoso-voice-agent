/**
 * TOUCH CAPTURE BUTTON ATOM - MOBILE-FIRST CAMERA CAPTURE WITH DESKTOP ENHANCEMENTS
 * 
 * Professional touch-optimized capture button with haptic feedback,
 * large touch targets, gesture support, comprehensive accessibility,
 * and enhanced desktop features for professional workflows.
 */

import React, { forwardRef, useCallback, useRef, useState, useEffect } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './TouchCaptureButton.module.css';

export interface TouchCaptureButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current capture state */
  captureState?: 'idle' | 'capturing' | 'processing' | 'success' | 'error';
  
  /** Capture mode */
  mode?: 'photo' | 'video' | 'burst' | 'timer';
  
  /** Size of the capture button */
  size?: 'md' | 'lg' | 'xl' | 'xxl';
  
  /** Visual variant */
  variant?: 'default' | 'primary' | 'professional' | 'minimal';
  
  /** Whether capture is in progress */
  isCapturing?: boolean;
  
  /** Capture progress (0-100) for video/burst mode */
  captureProgress?: number;
  
  /** Timer countdown value */
  timerCountdown?: number;
  
  /** Whether haptic feedback is enabled */
  hapticFeedback?: boolean;
  
  /** Haptic feedback intensity */
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  
  /** Whether to show capture count */
  showCaptureCount?: boolean;
  
  /** Current capture count for burst mode */
  captureCount?: number;
  
  /** Maximum captures for burst mode */
  maxCaptures?: number;
  
  /** Whether button should pulse/animate */
  animate?: boolean;
  
  /** Animation type */
  animationType?: 'pulse' | 'glow' | 'scale' | 'ring';
  
  /** Whether to show progress ring */
  showProgress?: boolean;
  
  /** Custom icon for the capture button */
  captureIcon?: React.ReactNode;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Touch interaction feedback */
  touchFeedback?: 'none' | 'scale' | 'glow' | 'ripple';
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Whether to announce capture state changes */
  announceStateChanges?: boolean;
  
  // Desktop Enhancement Props (NEW)
  /** Whether desktop enhancements are enabled */
  desktopEnhanced?: boolean;
  
  /** Keyboard shortcut for capture */
  keyboardShortcut?: string;
  
  /** Whether to show keyboard shortcut hint */
  showKeyboardHint?: boolean;
  
  /** Desktop interaction mode */
  desktopMode?: 'standard' | 'professional' | 'gaming' | 'accessibility';
  
  /** Whether to enable desktop hover effects */
  desktopHover?: boolean;
  
  /** Desktop-specific capture settings */
  desktopSettings?: {
    enableRightClick?: boolean;
    enableMiddleClick?: boolean;
    enableDoubleClick?: boolean;
    enableDragCapture?: boolean;
    showContextMenu?: boolean;
  };
  
  /** Professional mode settings */
  professionalMode?: {
    showMetadata?: boolean;
    enableBracketCapture?: boolean;
    showHistogram?: boolean;
    enableFocusPeaking?: boolean;
  };
  
  /** Desktop capture quality preset */
  desktopQuality?: 'standard' | 'high' | 'ultra' | 'raw';
  
  /** Whether to enable desktop keyboard navigation */
  desktopKeyboardNav?: boolean;
  
  // Event Handlers
  /** Capture button press handler */
  onCapture?: () => void;
  
  /** Long press handler for alternate capture modes */
  onLongPress?: () => void;
  
  /** Touch start handler */
  onTouchStart?: (event: React.TouchEvent) => void;
  
  /** Touch end handler */
  onTouchEnd?: (event: React.TouchEvent) => void;
  
  /** Capture state change handler */
  onCaptureStateChange?: (state: 'idle' | 'capturing' | 'processing' | 'success' | 'error') => void;
  
  // Desktop Enhancement Handlers (NEW)
  /** Right click handler for desktop context menu */
  onRightClick?: (event: React.MouseEvent) => void;
  
  /** Middle click handler for desktop alternate capture */
  onMiddleClick?: (event: React.MouseEvent) => void;
  
  /** Double click handler for desktop burst mode */
  onDoubleClick?: (event: React.MouseEvent) => void;
  
  /** Keyboard shortcut handler */
  onKeyboardShortcut?: (shortcut: string) => void;
  
  /** Desktop drag start handler */
  onDragStart?: (event: React.DragEvent) => void;
  
  /** Desktop hover state change */
  onDesktopHover?: (isHovering: boolean) => void;
}

const TouchCaptureButton = forwardRef<HTMLButtonElement, TouchCaptureButtonProps>(({
  captureState = 'idle',
  mode = 'photo',
  size = 'xl',
  variant = 'primary',
  isCapturing = false,
  captureProgress = 0,
  timerCountdown = 0,
  hapticFeedback = true,
  hapticIntensity = 'medium',
  showCaptureCount = false,
  captureCount = 0,
  maxCaptures = 10,
  animate = true,
  animationType = 'pulse',
  showProgress = true,
  captureIcon,
  disabled = false,
  touchFeedback = 'scale',
  ariaLabel,
  announceStateChanges = true,
  // Desktop enhancements (NEW)
  desktopEnhanced = true,
  keyboardShortcut = 'Space',
  showKeyboardHint = true,
  desktopMode = 'standard',
  desktopHover = true,
  desktopSettings = {
    enableRightClick: true,
    enableMiddleClick: true,
    enableDoubleClick: true,
    enableDragCapture: false,
    showContextMenu: true
  },
  professionalMode = {
    showMetadata: false,
    enableBracketCapture: false,
    showHistogram: false,
    enableFocusPeaking: false
  },
  desktopQuality = 'high',
  desktopKeyboardNav = true,
  onCapture,
  onLongPress,
  onTouchStart,
  onTouchEnd,
  onCaptureStateChange,
  // Desktop handlers (NEW)
  onRightClick,
  onMiddleClick,
  onDoubleClick,
  onKeyboardShortcut,
  onDragStart,
  onDesktopHover,
  className = '',
  ...rest
}, ref) => {
  // Internal state
  const [isPressed, setIsPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showKeyboardTooltip, setShowKeyboardTooltip] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);
  
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  
  // Detect desktop device
  useEffect(() => {
    const checkDesktopDevice = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches;
      setIsDesktopDevice(!hasCoarsePointer && hasFinePointer && isLargeScreen);
    };
    
    checkDesktopDevice();
    window.addEventListener('resize', checkDesktopDevice);
    return () => window.removeEventListener('resize', checkDesktopDevice);
  }, []);
  
  // Haptic feedback function
  const triggerHapticFeedback = useCallback(() => {
    if (!hapticFeedback || !navigator.vibrate) return;
    
    const intensityMap = {
      light: [5],
      medium: [10],
      heavy: [15]
    };
    
    navigator.vibrate(intensityMap[hapticIntensity]);
  }, [hapticFeedback, hapticIntensity]);
  
  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!desktopEnhanced || !desktopKeyboardNav || !keyboardShortcut) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || !buttonRef.current) return;
      
      const key = event.code === 'Space' ? 'Space' : event.key;
      
      if (key === keyboardShortcut) {
        event.preventDefault();
        event.stopPropagation();
        
        // Visual feedback for keyboard press
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        
        handleCapture();
        onKeyboardShortcut?.(keyboardShortcut);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [desktopEnhanced, desktopKeyboardNav, keyboardShortcut, disabled, onKeyboardShortcut]);
  
  // Handle capture action
  const handleCapture = useCallback(() => {
    if (disabled || isCapturing) return;
    
    triggerHapticFeedback();
    onCapture?.();
    
    // Announce capture action
    if (announceStateChanges && announceRef.current) {
      announceRef.current.textContent = `${mode} capture initiated`;
    }
  }, [disabled, isCapturing, triggerHapticFeedback, onCapture, announceStateChanges, mode]);
  
  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    setIsPressed(true);
    setTouchStartTime(Date.now());
    
    // Set up long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        triggerHapticFeedback();
        onLongPress();
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
    }
    
    onTouchStart?.(event);
  }, [onLongPress, triggerHapticFeedback, onTouchStart]);
  
  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    setIsPressed(false);
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Check if this was a tap (not long press)
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500) {
      handleCapture();
    }
    
    onTouchEnd?.(event);
  }, [longPressTimer, touchStartTime, handleCapture, onTouchEnd]);
  
  // Handle click (for non-touch devices)
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    handleCapture();
  }, [handleCapture]);
  
  // Desktop mouse handlers (NEW)
  const handleMouseEnter = useCallback(() => {
    if (!desktopEnhanced || !desktopHover) return;
    setIsHovering(true);
    onDesktopHover?.(true);
    
    // Show keyboard tooltip on hover
    if (showKeyboardHint && keyboardShortcut) {
      setShowKeyboardTooltip(true);
    }
  }, [desktopEnhanced, desktopHover, onDesktopHover, showKeyboardHint, keyboardShortcut]);
  
  const handleMouseLeave = useCallback(() => {
    if (!desktopEnhanced || !desktopHover) return;
    setIsHovering(false);
    setShowKeyboardTooltip(false);
    onDesktopHover?.(false);
  }, [desktopEnhanced, desktopHover, onDesktopHover]);
  
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (!desktopEnhanced || !desktopSettings?.enableRightClick) {
      event.preventDefault();
      return;
    }
    
    if (desktopSettings.showContextMenu && onRightClick) {
      event.preventDefault();
      onRightClick(event);
    }
  }, [desktopEnhanced, desktopSettings, onRightClick]);
  
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!desktopEnhanced) return;
    
    // Middle click handler
    if (event.button === 1 && desktopSettings?.enableMiddleClick) {
      event.preventDefault();
      onMiddleClick?.(event);
      return;
    }
    
    // Standard mouse down
    if (event.button === 0) {
      setIsPressed(true);
    }
  }, [desktopEnhanced, desktopSettings, onMiddleClick]);
  
  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  const handleDoubleClickEvent = useCallback((event: React.MouseEvent) => {
    if (!desktopEnhanced || !desktopSettings?.enableDoubleClick) return;
    onDoubleClick?.(event);
  }, [desktopEnhanced, desktopSettings, onDoubleClick]);
  
  // Clean up timers
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);
  
  // Generate class names
  const buttonClasses = [
    styles.touchCaptureButton,
    styles[size],
    styles[variant],
    styles[captureState],
    touchFeedback !== 'none' && styles[`touchFeedback${touchFeedback.charAt(0).toUpperCase() + touchFeedback.slice(1)}`],
    isPressed && styles.pressed,
    isCapturing && styles.capturing,
    animate && styles[`animate${animationType.charAt(0).toUpperCase() + animationType.slice(1)}`],
    // Desktop enhancement classes (NEW)
    desktopEnhanced && styles.desktopEnhanced,
    desktopEnhanced && isDesktopDevice && styles[`desktop${desktopMode.charAt(0).toUpperCase() + desktopMode.slice(1)}`],
    isHovering && styles.hovering,
    professionalMode.showMetadata && styles.professionalMetadata,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');
  
  // Generate accessible label
  const accessibleLabel = ariaLabel || `${mode} capture button. ${captureState === 'capturing' ? 'Capturing...' : 'Tap to capture'}${keyboardShortcut && desktopEnhanced ? ` or press ${keyboardShortcut}` : ''}`;
  
  // Progress calculation for ring
  const progressValue = mode === 'video' && isCapturing ? captureProgress : 
                      mode === 'burst' && showCaptureCount ? (captureCount / maxCaptures) * 100 : 0;
  
  return (
    <>
      <button
        ref={ref || buttonRef}
        type="button"
        className={buttonClasses}
        disabled={disabled}
        aria-label={accessibleLabel}
        aria-pressed={isPressed}
        aria-describedby={announceStateChanges ? 'capture-announcements' : undefined}
        data-desktop-enhanced={desktopEnhanced}
        data-keyboard-shortcut={keyboardShortcut}
        data-desktop-mode={desktopMode}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClickEvent}
        style={{
          '--capture-progress': `${progressValue}%`,
          '--timer-countdown': timerCountdown,
        } as React.CSSProperties}
        {...rest}
      >
        {/* Main capture icon */}
        <div className={styles.captureIcon}>
          {captureIcon || (
            <div className={styles.defaultIcon}>
              {mode === 'video' && isCapturing ? (
                <div className={styles.stopIcon} />
              ) : mode === 'burst' ? (
                <div className={styles.burstIcon} />
              ) : (
                <div className={styles.photoIcon} />
              )}
            </div>
          )}
        </div>
        
        {/* Progress ring for video/burst mode */}
        {showProgress && (mode === 'video' || mode === 'burst') && (
          <div className={styles.progressRing}>
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle
                className={styles.progressTrack}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="6"
              />
              <circle
                className={styles.progressBar}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="6"
                strokeDasharray={`${progressValue * 2.827} 282.7`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        )}
        
        {/* Timer countdown display */}
        {timerCountdown > 0 && (
          <div className={styles.timerDisplay}>
            {timerCountdown}
          </div>
        )}
        
        {/* Capture count for burst mode */}
        {showCaptureCount && mode === 'burst' && (
          <div className={styles.captureCounter}>
            {captureCount}/{maxCaptures}
          </div>
        )}
        
        {/* Desktop keyboard shortcut hint (NEW) */}
        {desktopEnhanced && showKeyboardTooltip && keyboardShortcut && (
          <div className={styles.keyboardTooltip}>
            Press {keyboardShortcut}
          </div>
        )}
        
        {/* Professional mode metadata (NEW) */}
        {professionalMode.showMetadata && (
          <div className={styles.professionalMetadata}>
            <div className={styles.qualityIndicator}>{desktopQuality.toUpperCase()}</div>
            {professionalMode.showHistogram && (
              <div className={styles.histogramPreview} />
            )}
          </div>
        )}
        
        {/* Touch feedback ripple */}
        {touchFeedback === 'ripple' && isPressed && (
          <div className={styles.rippleEffect} />
        )}
      </button>
      
      {/* Screen reader announcements */}
      {announceStateChanges && (
        <div
          ref={announceRef}
          id="capture-announcements"
          className={styles.srOnly}
          aria-live="polite"
          aria-atomic="true"
        />
      )}
    </>
  );
});

TouchCaptureButton.displayName = 'TouchCaptureButton';

export { TouchCaptureButton };
export default TouchCaptureButton; 