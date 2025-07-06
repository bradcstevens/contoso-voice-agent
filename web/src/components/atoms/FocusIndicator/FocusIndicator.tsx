/**
 * FOCUS INDICATOR ATOM - ACCESSIBILITY FOCUS MANAGEMENT FOR MULTI-MODAL INTERACTIONS
 * 
 * Professional focus management component providing comprehensive focus visualization,
 * multi-modal focus coordination, and advanced accessibility features.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './FocusIndicator.module.css';

export interface FocusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether focus indicator is currently active */
  active?: boolean;
  
  /** Focus indicator type */
  type?: 'ring' | 'outline' | 'underline' | 'glow' | 'highlight' | 'border' | 'shadow';
  
  /** Size of the focus indicator */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /** Modal context for focus styling */
  modality?: 'voice' | 'camera' | 'text' | 'multimodal' | 'auto';
  
  /** Focus state */
  focusState?: 'idle' | 'focused' | 'active' | 'disabled' | 'error' | 'success';
  
  /** Animation style */
  animation?: 'none' | 'pulse' | 'glow' | 'fade' | 'scale' | 'slide' | 'bounce';
  
  /** Animation speed */
  animationSpeed?: 'slow' | 'normal' | 'fast';
  
  /** Focus origin for animation direction */
  origin?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /** Target element selector for focus management */
  target?: string | HTMLElement;
  
  /** Whether to show focus within child elements */
  focusWithin?: boolean;
  
  /** Whether to trap focus within the component */
  trapFocus?: boolean;
  
  /** Whether to restore focus when trap is released */
  restoreFocus?: boolean;
  
  /** Focus order priority for multi-modal coordination */
  priority?: number;
  
  /** Whether focus indicator is persistent */
  persistent?: boolean;
  
  /** Auto-hide delay in milliseconds */
  autoHideDelay?: number;
  
  /** Custom focus offset from target */
  offset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  
  /** Border radius for focus indicator */
  borderRadius?: number;
  
  /** Border width for focus indicator */
  borderWidth?: number;
  
  /** Whether to use high contrast mode */
  highContrast?: boolean;
  
  /** Whether to reduce motion for accessibility */
  reduceMotion?: boolean;
  
  /** Custom colors for different states */
  stateColors?: {
    idle: string;
    focused: string;
    active: string;
    disabled: string;
    error: string;
    success: string;
  };
  
  /** Focus indicator opacity */
  opacity?: number;
  
  /** Z-index for focus indicator layering */
  zIndex?: number;
  
  /** Whether to show focus for keyboard only */
  keyboardOnly?: boolean;
  
  /** Whether to show focus for mouse interactions */
  mouseEnabled?: boolean;
  
  /** Whether to show focus for touch interactions */
  touchEnabled?: boolean;
  
  /** Whether to show focus for voice commands */
  voiceEnabled?: boolean;
  
  /** Voice command phrase for focus activation */
  voiceCommand?: string;
  
  /** Whether to announce focus changes to screen readers */
  announceChanges?: boolean;
  
  /** Custom announcement text for focus changes */
  announcement?: string;
  
  /** Whether to use ARIA live region for announcements */
  useAriaLive?: boolean;
  
  /** ARIA live region politeness level */
  ariaLivePoliteness?: 'polite' | 'assertive' | 'off';
  
  /** Focus group for coordinated focus management */
  focusGroup?: string;
  
  /** Whether this is the primary focus in a group */
  primaryFocus?: boolean;
  
  /** Focus navigation direction */
  navigationDirection?: 'horizontal' | 'vertical' | 'both' | 'none';
  
  /** Whether to skip this element in tab order */
  skipTabOrder?: boolean;
  
  /** Custom tab index */
  tabIndex?: number;
  
  /** Whether to show focus bounds */
  showBounds?: boolean;
  
  /** Bounds visualization style */
  boundsStyle?: 'solid' | 'dashed' | 'dotted' | 'glow';
  
  /** Whether to show focus path for debugging */
  showFocusPath?: boolean;
  
  /** Focus path color */
  pathColor?: string;
  
  /** Whether to log focus events for debugging */
  debugMode?: boolean;
  
  /** Accessibility label */
  ariaLabel?: string;
  
  /** Accessibility description */
  ariaDescription?: string;
  
  /** Whether to provide detailed focus descriptions */
  provideDetailedDescription?: boolean;
  
  /** Callback when focus is gained */
  onFocus?: (event: FocusEvent, modality: string) => void;
  
  /** Callback when focus is lost */
  onBlur?: (event: FocusEvent) => void;
  
  /** Callback when focus moves within */
  onFocusWithin?: (event: FocusEvent) => void;
  
  /** Callback when focus leaves */
  onFocusLeave?: (event: FocusEvent) => void;
  
  /** Callback when voice command is triggered */
  onVoiceCommand?: (command: string) => void;
  
  /** Callback when focus is trapped */
  onFocusTrapped?: (element: HTMLElement) => void;
  
  /** Callback when focus is restored */
  onFocusRestored?: (element: HTMLElement) => void;
  
  /** Callback for focus navigation */
  onNavigate?: (direction: string, event: KeyboardEvent) => void;
  
  /** Callback when focus indicator becomes active */
  onActivate?: (modality: string) => void;
  
  /** Callback when focus indicator becomes inactive */
  onDeactivate?: () => void;
  
  /** Custom width override */
  width?: number;
  
  /** Custom height override */
  height?: number;
  
  /** Whether to match target element dimensions */
  matchTarget?: boolean;
  
  /** Whether to center on target element */
  centerOnTarget?: boolean;
  
  /** Custom positioning */
  position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
  
  /** Custom CSS properties */
  customProperties?: Record<string, string | number>;
  
  /** Whether to use CSS transforms for positioning */
  useTransforms?: boolean;
  
  /** Performance optimization mode */
  performanceMode?: 'auto' | 'high' | 'balanced' | 'battery';
  
  /** Whether to cache focus calculations */
  cacheCalculations?: boolean;
  
  /** Update frequency for position tracking */
  updateFrequency?: number;
  
  /** Whether to use ResizeObserver for target tracking */
  trackResize?: boolean;
  
  /** Whether to use IntersectionObserver for visibility */
  trackVisibility?: boolean;
  
  /** Intersection threshold for visibility tracking */
  visibilityThreshold?: number;
}

/**
 * Enhanced FocusIndicator atom with comprehensive accessibility focus management
 */
export const FocusIndicator = forwardRef<HTMLDivElement, FocusIndicatorProps>(({
  active = false,
  type = 'ring',
  size = 'md',
  variant = 'default',
  modality = 'auto',
  focusState = 'idle',
  animation = 'fade',
  animationSpeed = 'normal',
  origin = 'center',
  target,
  focusWithin = false,
  trapFocus = false,
  restoreFocus = false,
  priority = 0,
  persistent = false,
  autoHideDelay = 3000,
  offset = { top: 2, right: 2, bottom: 2, left: 2 },
  borderRadius = 4,
  borderWidth = 2,
  highContrast = false,
  reduceMotion = false,
  stateColors = {
    idle: '#6b7280',
    focused: '#3b82f6',
    active: '#1d4ed8',
    disabled: '#9ca3af',
    error: '#dc2626',
    success: '#059669'
  },
  opacity = 1,
  zIndex = 1000,
  keyboardOnly = false,
  mouseEnabled = true,
  touchEnabled = true,
  voiceEnabled = true,
  voiceCommand = 'focus here',
  announceChanges = true,
  announcement = '',
  useAriaLive = true,
  ariaLivePoliteness = 'polite',
  focusGroup = '',
  primaryFocus = false,
  navigationDirection = 'both',
  skipTabOrder = false,
  tabIndex,
  showBounds = false,
  boundsStyle = 'solid',
  showFocusPath = false,
  pathColor = '#3b82f6',
  debugMode = false,
  ariaLabel,
  ariaDescription,
  provideDetailedDescription = false,
  onFocus,
  onBlur,
  onFocusWithin,
  onFocusLeave,
  onVoiceCommand,
  onFocusTrapped,
  onFocusRestored,
  onNavigate,
  onActivate,
  onDeactivate,
  width,
  height,
  matchTarget = false,
  centerOnTarget = false,
  position = 'absolute',
  customProperties = {},
  useTransforms = true,
  performanceMode = 'balanced',
  cacheCalculations = true,
  updateFrequency = 60,
  trackResize = true,
  trackVisibility = true,
  visibilityThreshold = 0.1,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const [isActive, setIsActive] = useState(active);
  const [currentModality, setCurrentModality] = useState(modality);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  
  const indicatorRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimerRef = useRef<number | null>(null);
  const calculationCacheRef = useRef<Map<string, any>>(new Map());
  
  // Detect current modality based on interaction type
  const detectModality = useCallback((event?: Event): string => {
    if (modality !== 'auto') return modality;
    
    if (!event) return 'multimodal';
    
    if (event.type.includes('key')) return 'text';
    if (event.type.includes('mouse') || event.type.includes('click')) return 'camera';
    if (event.type.includes('touch')) return 'camera';
    if (event.type.includes('voice') || event.type.includes('speech')) return 'voice';
    
    return 'multimodal';
  }, [modality]);
  
  // Get target element from selector or element
  const getTargetElement = useCallback((): HTMLElement | null => {
    if (!target) return null;
    
    if (typeof target === 'string') {
      return document.querySelector(target) as HTMLElement;
    }
    
    return target;
  }, [target]);
  
  // Calculate target dimensions and position
  const calculateTargetBounds = useCallback((): DOMRect | null => {
    const element = getTargetElement();
    if (!element) return null;
    
    const cacheKey = `bounds-${element.id || element.className}-${Date.now()}`;
    
    if (cacheCalculations && calculationCacheRef.current.has(cacheKey)) {
      return calculationCacheRef.current.get(cacheKey);
    }
    
    const bounds = element.getBoundingClientRect();
    
    if (cacheCalculations) {
      calculationCacheRef.current.set(cacheKey, bounds);
      // Clean cache after 1 second
      setTimeout(() => calculationCacheRef.current.delete(cacheKey), 1000);
    }
    
    return bounds;
  }, [getTargetElement, cacheCalculations]);
  
  // Update focus indicator position and dimensions
  const updatePosition = useCallback(() => {
    if (!targetElement && !target) return;
    
    const bounds = calculateTargetBounds();
    if (!bounds) return;
    
    const newDimensions = {
      width: matchTarget ? bounds.width : (width || bounds.width + (offset.left || 0) + (offset.right || 0)),
      height: matchTarget ? bounds.height : (height || bounds.height + (offset.top || 0) + (offset.bottom || 0)),
      top: bounds.top - (offset.top || 0),
      left: bounds.left - (offset.left || 0)
    };
    
    if (centerOnTarget) {
      newDimensions.left = bounds.left + (bounds.width / 2) - (newDimensions.width / 2);
      newDimensions.top = bounds.top + (bounds.height / 2) - (newDimensions.height / 2);
    }
    
    setDimensions(newDimensions);
  }, [targetElement, target, calculateTargetBounds, matchTarget, width, height, offset, centerOnTarget]);
  
  // Set up target element observation
  useEffect(() => {
    const element = getTargetElement();
    setTargetElement(element);
    
    if (element && trackResize) {
      observerRef.current = new ResizeObserver(() => {
        updatePosition();
      });
      observerRef.current.observe(element);
    }
    
    if (element && trackVisibility) {
      intersectionObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.intersectionRatio >= visibilityThreshold);
        },
        { threshold: visibilityThreshold }
      );
      intersectionObserverRef.current.observe(element);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [getTargetElement, trackResize, trackVisibility, visibilityThreshold, updatePosition]);
  
  // Update position periodically
  useEffect(() => {
    if (performanceMode === 'high' || performanceMode === 'balanced') {
      const interval = 1000 / updateFrequency;
      updateTimerRef.current = window.setInterval(updatePosition, interval);
      
      return () => {
        if (updateTimerRef.current) {
          clearInterval(updateTimerRef.current);
        }
      };
    }
  }, [updatePosition, updateFrequency, performanceMode]);
  
  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    const detectedModality = detectModality(event);
    setCurrentModality(detectedModality);
    setIsActive(true);
    
    if (lastFocusedElement && restoreFocus) {
      setFocusHistory(prev => [...prev, lastFocusedElement]);
    }
    
    setLastFocusedElement(event.target as HTMLElement);
    
    if (onFocus) {
      onFocus(event, detectedModality);
    }
    
    if (onActivate) {
      onActivate(detectedModality);
    }
    
    if (announceChanges && announceChanges) {
      announceToScreenReader(announcement || `Focus activated in ${detectedModality} mode`);
    }
    
    // Clear hide timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    
    if (debugMode) {
      console.log('FocusIndicator: Focus gained', { modality: detectedModality, target: event.target });
    }
  }, [detectModality, lastFocusedElement, restoreFocus, onFocus, onActivate, announceChanges, announcement, debugMode]);
  
  // Handle blur events
  const handleBlur = useCallback((event: FocusEvent) => {
    if (!persistent) {
      if (autoHideDelay > 0) {
        hideTimerRef.current = setTimeout(() => {
          setIsActive(false);
          if (onDeactivate) onDeactivate();
        }, autoHideDelay);
      } else {
        setIsActive(false);
        if (onDeactivate) onDeactivate();
      }
    }
    
    if (onBlur) {
      onBlur(event);
    }
    
    if (debugMode) {
      console.log('FocusIndicator: Focus lost', { target: event.target });
    }
  }, [persistent, autoHideDelay, onBlur, onDeactivate, debugMode]);
  
  // Handle focus within
  const handleFocusWithin = useCallback((event: FocusEvent) => {
    if (focusWithin) {
      setIsActive(true);
      if (onFocusWithin) {
        onFocusWithin(event);
      }
    }
  }, [focusWithin, onFocusWithin]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, shiftKey, altKey } = event;
    
    // Navigation keys
    if (navigationDirection !== 'none') {
      let direction = '';
      
      if (key === 'ArrowUp' && (navigationDirection === 'vertical' || navigationDirection === 'both')) {
        direction = 'up';
      } else if (key === 'ArrowDown' && (navigationDirection === 'vertical' || navigationDirection === 'both')) {
        direction = 'down';
      } else if (key === 'ArrowLeft' && (navigationDirection === 'horizontal' || navigationDirection === 'both')) {
        direction = 'left';
      } else if (key === 'ArrowRight' && (navigationDirection === 'horizontal' || navigationDirection === 'both')) {
        direction = 'right';
      }
      
      if (direction && onNavigate) {
        event.preventDefault();
        onNavigate(direction, event);
      }
    }
    
    // Focus trap handling
    if (trapFocus && key === 'Tab') {
      handleFocusTrap(event);
    }
    
    // Voice command simulation
    if (voiceEnabled && key === 'F1' && altKey) {
      if (onVoiceCommand) {
        onVoiceCommand(voiceCommand);
      }
    }
  }, [navigationDirection, onNavigate, trapFocus, voiceEnabled, voiceCommand, onVoiceCommand]);
  
  // Handle focus trap
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!targetElement) return;
    
    const focusableElements = targetElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
    
    if (onFocusTrapped && focusableElements.length > 0) {
      onFocusTrapped(document.activeElement as HTMLElement);
    }
  }, [targetElement, onFocusTrapped]);
  
  // Restore focus
  const restoreFocusToLastElement = useCallback(() => {
    if (focusHistory.length > 0) {
      const elementToFocus = focusHistory[focusHistory.length - 1];
      if (elementToFocus && document.contains(elementToFocus)) {
        elementToFocus.focus();
        setFocusHistory(prev => prev.slice(0, -1));
        
        if (onFocusRestored) {
          onFocusRestored(elementToFocus);
        }
      }
    }
  }, [focusHistory, onFocusRestored]);
  
  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    if (!announceChanges || !useAriaLive) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', ariaLivePoliteness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = styles.srOnly;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [announceChanges, useAriaLive, ariaLivePoliteness]);
  
  // Set up event listeners
  useEffect(() => {
    const element = targetElement || indicatorRef.current;
    if (!element) return;
    
    if (keyboardOnly) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    } else {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
      element.addEventListener('focusin', handleFocusWithin);
      element.addEventListener('focusout', handleBlur);
    }
    
    if (navigationDirection !== 'none') {
      element.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('focusin', handleFocusWithin);
      element.removeEventListener('focusout', handleBlur);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetElement, keyboardOnly, handleFocus, handleBlur, handleFocusWithin, handleKeyDown, navigationDirection]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, []);
  
  // Active state management
  useEffect(() => {
    setIsActive(active);
  }, [active]);
  
  // Get state color
  const getStateColor = (state: string): string => {
    return stateColors[state as keyof typeof stateColors] || stateColors.focused;
  };
  
  // Get detailed description
  const getDetailedDescription = (): string => {
    if (!provideDetailedDescription) return '';
    
    const modalityText = currentModality === 'auto' ? 'multi-modal' : currentModality;
    const stateText = isActive ? 'active' : 'inactive';
    const typeText = type;
    
    return `${typeText} focus indicator, ${stateText} in ${modalityText} mode`;
  };
  
  // Class computation
  const computedClassName = [
    styles.focusIndicator,
    styles[type],
    styles[size],
    styles[variant],
    styles[focusState],
    styles[currentModality],
    styles[animation],
    styles[animationSpeed],
    styles[origin],
    isActive && styles.active,
    persistent && styles.persistent,
    highContrast && styles.highContrast,
    reduceMotion && styles.reduceMotion,
    !isVisible && styles.hidden,
    showBounds && styles.showBounds,
    showFocusPath && styles.showFocusPath,
    debugMode && styles.debug,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    '--focus-color': getStateColor(focusState),
    '--focus-width': `${borderWidth}px`,
    '--focus-radius': `${borderRadius}px`,
    '--focus-opacity': opacity,
    '--focus-z-index': zIndex,
    '--animation-speed': animationSpeed === 'slow' ? '600ms' : animationSpeed === 'fast' ? '150ms' : '300ms',
    '--target-width': `${dimensions.width}px`,
    '--target-height': `${dimensions.height}px`,
    '--target-top': `${dimensions.top}px`,
    '--target-left': `${dimensions.left}px`,
    '--offset-top': `${offset.top || 0}px`,
    '--offset-right': `${offset.right || 0}px`,
    '--offset-bottom': `${offset.bottom || 0}px`,
    '--offset-left': `${offset.left || 0}px`,
    '--bounds-color': boundsStyle === 'glow' ? pathColor : 'currentColor',
    '--path-color': pathColor,
    '--priority': priority,
    ...customProperties,
    ...style
  };
  
  // Position styling
  const positionStyles = useTransforms ? {
    transform: `translate(${dimensions.left}px, ${dimensions.top}px)`,
    width: dimensions.width,
    height: dimensions.height
  } : {
    top: dimensions.top,
    left: dimensions.left,
    width: dimensions.width,
    height: dimensions.height
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'presentation',
    'aria-label': ariaLabel || getDetailedDescription(),
    'aria-description': ariaDescription,
    'aria-hidden': !isActive,
    'aria-live': useAriaLive ? ariaLivePoliteness : undefined,
    'tabIndex': skipTabOrder ? -1 : (tabIndex || 0),
    'data-focus-group': focusGroup || undefined,
    'data-primary-focus': primaryFocus || undefined,
    'data-modality': currentModality,
    'data-focus-state': focusState
  };
  
  if (!isActive && !persistent) {
    return null;
  }
  
  return (
    <>
      <div
        ref={ref || indicatorRef}
        className={computedClassName}
        style={{ ...customStyles, ...positionStyles, position }}
        {...accessibilityProps}
        {...rest}
      >
        {/* Focus ring visualization */}
        {type === 'ring' && (
          <div className={styles.focusRing} />
        )}
        
        {/* Focus outline visualization */}
        {type === 'outline' && (
          <div className={styles.focusOutline} />
        )}
        
        {/* Focus underline visualization */}
        {type === 'underline' && (
          <div className={styles.focusUnderline} />
        )}
        
        {/* Focus glow visualization */}
        {type === 'glow' && (
          <div className={styles.focusGlow} />
        )}
        
        {/* Focus highlight visualization */}
        {type === 'highlight' && (
          <div className={styles.focusHighlight} />
        )}
        
        {/* Focus border visualization */}
        {type === 'border' && (
          <div className={styles.focusBorder} />
        )}
        
        {/* Focus shadow visualization */}
        {type === 'shadow' && (
          <div className={styles.focusShadow} />
        )}
        
        {/* Focus bounds */}
        {showBounds && (
          <div className={`${styles.focusBounds} ${styles[boundsStyle]}`} />
        )}
        
        {/* Focus path for debugging */}
        {showFocusPath && (
          <div className={styles.focusPath} />
        )}
        
        {/* Debug information */}
        {debugMode && (
          <div className={styles.debugInfo}>
            <div>Modality: {currentModality}</div>
            <div>State: {focusState}</div>
            <div>Priority: {priority}</div>
            <div>Bounds: {dimensions.width}×{dimensions.height}</div>
          </div>
        )}
      </div>
      
      {/* ARIA live region for announcements */}
      {useAriaLive && announceChanges && (
        <div
          className={styles.srOnly}
          aria-live={ariaLivePoliteness}
          aria-atomic="true"
          role="status"
        >
          {isActive && (announcement || getDetailedDescription())}
        </div>
      )}
    </>
  );
});

FocusIndicator.displayName = 'FocusIndicator';

export default FocusIndicator;
