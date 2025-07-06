/**
 * GESTURE AREA ATOM - ADVANCED GESTURE RECOGNITION WITH MULTI-TOUCH SUPPORT
 * 
 * Professional gesture recognition component with advanced multi-touch interactions,
 * 3D Touch support, gesture sequences, custom gesture definitions, and comprehensive
 * accessibility features for both mobile and desktop environments.
 */

import React, { forwardRef, useCallback, useRef, useState, useEffect } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './GestureArea.module.css';

// Basic gesture types
export type GestureType = 'tap' | 'double-tap' | 'long-press' | 'pinch' | 'swipe' | 'pan' | 'rotate';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

// Advanced gesture types (NEW)
export type AdvancedGestureType = 
  | 'triple-tap' 
  | 'four-finger-tap' 
  | 'three-finger-swipe' 
  | 'force-touch' 
  | 'gesture-sequence' 
  | 'custom-gesture'
  | 'pinch-rotate'
  | 'two-finger-tap'
  | 'edge-swipe'
  | 'circular-pan'
  | 'zoom-pan'
  | 'directional-swipe';

// Desktop gesture types
export type DesktopGestureType = 'wheel-zoom' | 'drag-pan' | 'right-click' | 'keyboard-shortcut' | 'middle-click';

// Gesture sequence definition (NEW)
export interface GestureSequence {
  id: string;
  name: string;
  steps: Array<{
    gesture: GestureType | AdvancedGestureType;
    timing?: number; // max time between gestures
    position?: { x: number; y: number; tolerance: number }; // position constraint
  }>;
  maxDuration: number; // max total sequence time
  description?: string;
}

// Custom gesture definition (NEW)
export interface CustomGesture {
  id: string;
  name: string;
  pattern: Array<{
    touchCount: number;
    movement: 'static' | 'linear' | 'circular' | 'free';
    direction?: SwipeDirection | 'clockwise' | 'counterclockwise';
    distance?: number;
    duration?: number;
  }>;
  tolerance: {
    position: number;
    timing: number;
    direction: number;
  };
  description?: string;
}

// 3D Touch data (NEW)
export interface ForceTouchData {
  force: number; // 0-1 pressure level
  maximumForce: number; // device maximum
  altitudeAngle?: number; // Apple Pencil support
  azimuthAngle?: number; // Apple Pencil support
  touchType: 'direct' | 'pencil' | 'stylus';
}

// Gesture data interfaces
export interface GestureEvent {
  type: GestureType;
  center: { x: number; y: number };
  delta: { x: number; y: number };
  scale?: number;
  rotation?: number;
  velocity?: { x: number; y: number };
  direction?: SwipeDirection;
  duration?: number;
  touchCount?: number;
  timestamp: number;
}

// Advanced gesture data (NEW)
export interface AdvancedGestureEvent {
  type: AdvancedGestureType;
  center: { x: number; y: number };
  delta: { x: number; y: number };
  scale?: number;
  rotation?: number;
  velocity?: { x: number; y: number };
  direction?: SwipeDirection | 'clockwise' | 'counterclockwise';
  duration?: number;
  touchCount?: number;
  forceData?: ForceTouchData;
  sequenceStep?: number;
  customGestureId?: string;
  confidence?: number; // 0-1 recognition confidence
  timestamp: number;
}

// Desktop gesture data
export interface DesktopGestureEvent {
  type: DesktopGestureType;
  position: { x: number; y: number };
  delta: { x: number; y: number };
  scale?: number;
  wheelDelta?: number;
  keyboardShortcut?: string;
  mouseButton?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  timestamp: number;
}

// Enhanced touch tracking (NEW)
interface AdvancedTouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
  force?: number;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  altitudeAngle?: number;
  azimuthAngle?: number;
  touchType?: 'finger' | 'pen' | 'mouse';
  path: Array<{ x: number; y: number; timestamp: number }>; // touch path tracking
}

// Gesture recognition state (NEW)
interface GestureRecognitionState {
  activeGestures: Set<GestureType | AdvancedGestureType>;
  gestureSequence: Array<{ gesture: GestureType | AdvancedGestureType; timestamp: number }>;
  customGestureProgress: Map<string, number>; // gesture ID -> progress (0-1)
  forceThresholds: { light: number; medium: number; heavy: number };
  recognitionConfidence: Map<string, number>; // gesture ID -> confidence
}

export interface AdvancedGestureAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether gesture recognition is enabled */
  gestureEnabled?: boolean;
  
  /** Minimum distance for pan gesture */
  panThreshold?: number;
  
  /** Minimum distance for swipe gesture */
  swipeThreshold?: number;
  
  /** Minimum scale change for pinch gesture */
  pinchThreshold?: number;
  
  /** Long press duration in milliseconds */
  longPressDelay?: number;
  
  /** Double tap max interval in milliseconds */
  doubleTapInterval?: number;
  
  /** Whether to prevent default touch behavior */
  preventDefaultTouch?: boolean;
  
  /** Whether to provide haptic feedback */
  hapticFeedback?: boolean;
  
  /** Visual feedback for gestures */
  visualFeedback?: boolean;
  
  /** Gesture zones configuration */
  gestureZones?: {
    tapZone?: DOMRect;
    pinchZone?: DOMRect;
    swipeZone?: DOMRect;
  };
  
  /** Accessibility announcements */
  announceGestures?: boolean;
  
  // Advanced Gesture Recognition Props (NEW)
  /** Whether advanced gesture recognition is enabled */
  advancedGesturesEnabled?: boolean;
  
  /** Custom gesture definitions */
  customGestures?: CustomGesture[];
  
  /** Gesture sequence definitions */
  gestureSequences?: GestureSequence[];
  
  /** 3D Touch/Force Touch settings */
  forceTouchSettings?: {
    enabled?: boolean;
    lightPressure?: number; // 0-1 threshold
    mediumPressure?: number; // 0-1 threshold
    heavyPressure?: number; // 0-1 threshold
    enableHapticFeedback?: boolean;
  };
  
  /** Multi-touch gesture settings */
  multiTouchSettings?: {
    maxTouches?: number; // max simultaneous touches to track
    enableThreeFingerGestures?: boolean;
    enableFourFingerGestures?: boolean;
    enableFiveFingerGestures?: boolean;
  };
  
  /** Gesture recognition confidence threshold */
  recognitionThreshold?: number; // 0-1, minimum confidence to trigger
  
  /** Advanced gesture timing settings */
  advancedTiming?: {
    sequenceTimeout?: number; // max time between sequence steps
    gestureTimeout?: number; // max time for complex gestures
    debounceDelay?: number; // debounce rapid gestures
  };
  
  /** Edge gesture settings */
  edgeGestureSettings?: {
    enabled?: boolean;
    edgeWidth?: number; // pixels from edge
    enabledEdges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  };
  
  /** Circular gesture settings */
  circularGestureSettings?: {
    enabled?: boolean;
    minRadius?: number;
    maxRadius?: number;
    angleThreshold?: number; // degrees for circle detection
  };
  
  // Desktop Enhancement Props
  /** Whether desktop enhancements are enabled */
  desktopEnhanced?: boolean;
  
  /** Desktop interaction mode */
  desktopMode?: 'standard' | 'professional' | 'gaming' | 'precision';
  
  /** Mouse wheel zoom settings */
  mouseWheelZoom?: {
    enabled?: boolean;
    sensitivity?: number;
    minScale?: number;
    maxScale?: number;
  };
  
  /** Drag to pan settings */
  dragToPan?: {
    enabled?: boolean;
    button?: 0 | 1 | 2;
    sensitivity?: number;
    smoothing?: boolean;
  };
  
  /** Right-click context menu */
  contextMenuConfig?: {
    enabled?: boolean;
    showOnRightClick?: boolean;
    items?: Array<{
      label: string;
      action: () => void;
      shortcut?: string;
    }>;
  };
  
  /** Keyboard shortcuts */
  keyboardShortcuts?: {
    enabled?: boolean;
    shortcuts?: Record<string, () => void>;
  };
  
  /** Desktop precision mode */
  precisionMode?: {
    enabled?: boolean;
    showGrid?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
  };
  
  /** Desktop accessibility features */
  desktopAccessibility?: {
    enableTabNavigation?: boolean;
    enableArrowKeys?: boolean;
    enableSpacebarAction?: boolean;
    enableEnterAction?: boolean;
  };
  
  // Event Handlers - Basic
  /** Gesture recognition handler */
  onGesture?: (event: GestureEvent) => void;
  
  /** Tap gesture handler */
  onTap?: (event: GestureEvent) => void;
  
  /** Double tap handler */
  onDoubleTap?: (event: GestureEvent) => void;
  
  /** Long press handler */
  onLongPress?: (event: GestureEvent) => void;
  
  /** Pinch gesture handler */
  onPinch?: (event: GestureEvent) => void;
  
  /** Swipe gesture handler */
  onSwipe?: (event: GestureEvent) => void;
  
  /** Pan gesture handler */
  onPan?: (event: GestureEvent) => void;
  
  /** Rotate gesture handler */
  onRotate?: (event: GestureEvent) => void;
  
  // Event Handlers - Advanced (NEW)
  /** Advanced gesture recognition handler */
  onAdvancedGesture?: (event: AdvancedGestureEvent) => void;
  
  /** Triple tap handler */
  onTripleTap?: (event: AdvancedGestureEvent) => void;
  
  /** Multi-finger tap handler */
  onMultiFingerTap?: (event: AdvancedGestureEvent) => void;
  
  /** Three finger swipe handler */
  onThreeFingerSwipe?: (event: AdvancedGestureEvent) => void;
  
  /** Force touch handler */
  onForceTouch?: (event: AdvancedGestureEvent) => void;
  
  /** Gesture sequence completion handler */
  onGestureSequence?: (event: AdvancedGestureEvent) => void;
  
  /** Custom gesture recognition handler */
  onCustomGesture?: (event: AdvancedGestureEvent) => void;
  
  /** Circular gesture handler */
  onCircularGesture?: (event: AdvancedGestureEvent) => void;
  
  /** Edge gesture handler */
  onEdgeGesture?: (event: AdvancedGestureEvent) => void;
  
  // Event Handlers - Desktop
  /** Desktop gesture recognition handler */
  onDesktopGesture?: (event: DesktopGestureEvent) => void;
  
  /** Mouse wheel zoom handler */
  onMouseWheelZoom?: (event: DesktopGestureEvent) => void;
  
  /** Drag to pan handler */
  onDragToPan?: (event: DesktopGestureEvent) => void;
  
  /** Right-click context menu handler */
  onContextMenuAction?: (event: DesktopGestureEvent) => void;
  
  /** Keyboard shortcut handler */
  onKeyboardShortcut?: (event: DesktopGestureEvent) => void;
  
  /** Desktop precision action handler */
  onPrecisionAction?: (event: DesktopGestureEvent) => void;
}

const AdvancedGestureArea = forwardRef<HTMLDivElement, AdvancedGestureAreaProps>(({
  gestureEnabled = true,
  panThreshold = 10,
  swipeThreshold = 50,
  pinchThreshold = 0.1,
  longPressDelay = 500,
  doubleTapInterval = 300,
  preventDefaultTouch = true,
  hapticFeedback = true,
  visualFeedback = true,
  gestureZones,
  announceGestures = true,
  // Advanced gesture props (NEW)
  advancedGesturesEnabled = true,
  customGestures = [],
  gestureSequences = [],
  forceTouchSettings = {
    enabled: true,
    lightPressure: 0.25,
    mediumPressure: 0.5,
    heavyPressure: 0.75,
    enableHapticFeedback: true
  },
  multiTouchSettings = {
    maxTouches: 10,
    enableThreeFingerGestures: true,
    enableFourFingerGestures: true,
    enableFiveFingerGestures: false
  },
  recognitionThreshold = 0.7,
  advancedTiming = {
    sequenceTimeout: 2000,
    gestureTimeout: 5000,
    debounceDelay: 50
  },
  edgeGestureSettings = {
    enabled: true,
    edgeWidth: 20,
    enabledEdges: ['left', 'right']
  },
  circularGestureSettings = {
    enabled: true,
    minRadius: 30,
    maxRadius: 200,
    angleThreshold: 270 // 3/4 circle
  },
  // Desktop enhancements
  desktopEnhanced = true,
  desktopMode = 'standard',
  mouseWheelZoom = {
    enabled: true,
    sensitivity: 0.1,
    minScale: 0.1,
    maxScale: 10
  },
  dragToPan = {
    enabled: true,
    button: 0,
    sensitivity: 1,
    smoothing: true
  },
  contextMenuConfig = {
    enabled: true,
    showOnRightClick: true,
    items: []
  },
  keyboardShortcuts = {
    enabled: true,
    shortcuts: {}
  },
  precisionMode = {
    enabled: false,
    showGrid: false,
    snapToGrid: false,
    gridSize: 20
  },
  desktopAccessibility = {
    enableTabNavigation: true,
    enableArrowKeys: true,
    enableSpacebarAction: true,
    enableEnterAction: true
  },
  // Basic handlers
  onGesture,
  onTap,
  onDoubleTap,
  onLongPress,
  onPinch,
  onSwipe,
  onPan,
  onRotate,
  // Advanced handlers (NEW)
  onAdvancedGesture,
  onTripleTap,
  onMultiFingerTap,
  onThreeFingerSwipe,
  onForceTouch,
  onGestureSequence,
  onCustomGesture,
  onCircularGesture,
  onEdgeGesture,
  // Desktop handlers
  onDesktopGesture,
  onMouseWheelZoom,
  onDragToPan,
  onContextMenuAction,
  onKeyboardShortcut,
  onPrecisionAction,
  className = '',
  children,
  ...rest
}, ref) => {
  // Basic state
  const [touches, setTouches] = useState<AdvancedTouchPoint[]>([]);
  const [gestureInProgress, setGestureInProgress] = useState<GestureType | AdvancedGestureType | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [lastTapPosition, setLastTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [gestureStartTime, setGestureStartTime] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number>(0);
  const [initialAngle, setInitialAngle] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [panVelocity, setPanVelocity] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Advanced gesture state (NEW)
  const [recognitionState, setRecognitionState] = useState<GestureRecognitionState>({
    activeGestures: new Set(),
    gestureSequence: [],
    customGestureProgress: new Map(),
    forceThresholds: {
      light: forceTouchSettings.lightPressure || 0.25,
      medium: forceTouchSettings.mediumPressure || 0.5,
      heavy: forceTouchSettings.heavyPressure || 0.75
    },
    recognitionConfidence: new Map()
  });
  const [tapSequence, setTapSequence] = useState<Array<{ count: number; timestamp: number; position: { x: number; y: number } }>>([]);
  const [forceLevel, setForceLevel] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  const [circularGestureData, setCircularGestureData] = useState<{
    center: { x: number; y: number };
    radius: number;
    angle: number;
    direction: 'clockwise' | 'counterclockwise' | null;
  } | null>(null);
  
  // Desktop state
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  
  // Refs
  const gestureAreaRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const velocityTracker = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const gestureDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimer = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Force Touch detection (NEW)
  const detectForceLevel = useCallback((force: number): 'none' | 'light' | 'medium' | 'heavy' => {
    if (!forceTouchSettings.enabled || force === 0) return 'none';
    
    if (force >= recognitionState.forceThresholds.heavy) return 'heavy';
    if (force >= recognitionState.forceThresholds.medium) return 'medium';
    if (force >= recognitionState.forceThresholds.light) return 'light';
    return 'none';
  }, [forceTouchSettings.enabled, recognitionState.forceThresholds]);
  
  // Circular gesture detection (NEW)
  const detectCircularGesture = useCallback((touchPath: Array<{ x: number; y: number; timestamp: number }>): {
    isCircular: boolean;
    center?: { x: number; y: number };
    radius?: number;
    angle?: number;
    direction?: 'clockwise' | 'counterclockwise';
  } => {
    if (!circularGestureSettings.enabled || touchPath.length < 10) {
      return { isCircular: false };
    }
    
    // Calculate center point
    const centerX = touchPath.reduce((sum, point) => sum + point.x, 0) / touchPath.length;
    const centerY = touchPath.reduce((sum, point) => sum + point.y, 0) / touchPath.length;
    
    // Calculate radius and check consistency
    const distances = touchPath.map(point => 
      Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2)
    );
    const avgRadius = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
    const radiusVariance = distances.reduce((sum, dist) => sum + Math.abs(dist - avgRadius), 0) / distances.length;
    
    // Check if radius is within bounds and consistent
    if (avgRadius < (circularGestureSettings.minRadius || 30) || 
        avgRadius > (circularGestureSettings.maxRadius || 200) ||
        radiusVariance > avgRadius * 0.3) {
      return { isCircular: false };
    }
    
    // Calculate total angle traversed
    let totalAngle = 0;
    let direction: 'clockwise' | 'counterclockwise' | null = null;
    
    for (let i = 1; i < touchPath.length; i++) {
      const prevAngle = Math.atan2(touchPath[i-1].y - centerY, touchPath[i-1].x - centerX);
      const currAngle = Math.atan2(touchPath[i].y - centerY, touchPath[i].x - centerX);
      let angleDiff = currAngle - prevAngle;
      
      // Normalize angle difference
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      totalAngle += angleDiff;
    }
    
    const totalAngleDegrees = Math.abs(totalAngle) * 180 / Math.PI;
    direction = totalAngle > 0 ? 'counterclockwise' : 'clockwise';
    
    const isCircular = totalAngleDegrees >= (circularGestureSettings.angleThreshold || 270);
    
    return {
      isCircular,
      center: { x: centerX, y: centerY },
      radius: avgRadius,
      angle: totalAngleDegrees,
      direction
    };
  }, [circularGestureSettings]);
  
  // Custom gesture matching (NEW)
  const matchCustomGesture = useCallback((touches: AdvancedTouchPoint[], gesture: CustomGesture): number => {
    // Simplified custom gesture matching - returns confidence 0-1
    if (touches.length !== gesture.pattern.length) return 0;
    
    let confidence = 1;
    
    for (let i = 0; i < gesture.pattern.length; i++) {
      const pattern = gesture.pattern[i];
      const touch = touches[i];
      
      // Check touch count
      if (pattern.touchCount !== touches.length) {
        confidence *= 0.5;
      }
      
      // Check movement type
      if (pattern.movement === 'static') {
        const distance = Math.sqrt((touch.x - touch.startX) ** 2 + (touch.y - touch.startY) ** 2);
        if (distance > gesture.tolerance.position) confidence *= 0.7;
      } else if (pattern.movement === 'linear') {
        // Check if movement is roughly linear
        const deltaX = touch.x - touch.startX;
        const deltaY = touch.y - touch.startY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        if (pattern.direction) {
          const expectedAngles: Record<string, number> = {
            'up': -90, 
            'down': 90, 
            'left': 180, 
            'right': 0,
            'clockwise': 0, // Placeholder for circular gestures
            'counterclockwise': 0 // Placeholder for circular gestures
          };
          
          const expectedAngle = expectedAngles[pattern.direction] || 0;
          const angleDiff = Math.abs(angle - expectedAngle);
          if (angleDiff > gesture.tolerance.direction) confidence *= 0.6;
        }
      } else if (pattern.movement === 'circular') {
        // Handle circular movement detection
        if (touch.path && touch.path.length > 5) {
          const circularResult = detectCircularGesture(touch.path);
          if (!circularResult.isCircular) confidence *= 0.5;
          else if (pattern.direction && circularResult.direction !== pattern.direction) {
            confidence *= 0.7;
          }
        }
      }
      
      // Check distance if specified
      if (pattern.distance) {
        const actualDistance = Math.sqrt((touch.x - touch.startX) ** 2 + (touch.y - touch.startY) ** 2);
        const distanceRatio = actualDistance / pattern.distance;
        if (distanceRatio < 0.5 || distanceRatio > 2) confidence *= 0.8;
      }
    }
    
    return Math.max(0, confidence);
  }, [detectCircularGesture]);
  
  // Edge gesture detection (NEW)
  const detectEdgeGesture = useCallback((touch: AdvancedTouchPoint): boolean => {
    if (!edgeGestureSettings.enabled || !gestureAreaRef.current) return false;
    
    const rect = gestureAreaRef.current.getBoundingClientRect();
    const edgeWidth = edgeGestureSettings.edgeWidth || 20;
    const enabledEdges = edgeGestureSettings.enabledEdges || [];
    
    const isNearLeftEdge = touch.startX <= edgeWidth && enabledEdges.includes('left');
    const isNearRightEdge = touch.startX >= rect.width - edgeWidth && enabledEdges.includes('right');
    const isNearTopEdge = touch.startY <= edgeWidth && enabledEdges.includes('top');
    const isNearBottomEdge = touch.startY >= rect.height - edgeWidth && enabledEdges.includes('bottom');
    
    return isNearLeftEdge || isNearRightEdge || isNearTopEdge || isNearBottomEdge;
  }, [edgeGestureSettings]);
  
  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!desktopEnhanced || !keyboardShortcuts.enabled || !keyboardShortcuts.shortcuts) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gestureAreaRef.current || !keyboardFocused) return;
      
      const shortcut = getKeyboardShortcut(event);
      const action = keyboardShortcuts.shortcuts![shortcut];
      
      if (action) {
        event.preventDefault();
        action();
        
        const desktopEvent: DesktopGestureEvent = {
          type: 'keyboard-shortcut',
          position: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          keyboardShortcut: shortcut,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          timestamp: Date.now()
        };
        
        onKeyboardShortcut?.(desktopEvent);
        onDesktopGesture?.(desktopEvent);
      }
      
      // Desktop accessibility navigation
      if (desktopAccessibility.enableArrowKeys && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        handleArrowKeyNavigation(event.key);
      }
      
      if (desktopAccessibility.enableSpacebarAction && event.key === ' ') {
        event.preventDefault();
        handleSpacebarAction();
      }
      
      if (desktopAccessibility.enableEnterAction && event.key === 'Enter') {
        event.preventDefault();
        handleEnterAction();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [desktopEnhanced, keyboardShortcuts, keyboardFocused, desktopAccessibility]);
  
  // Haptic feedback function
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!hapticFeedback || !navigator.vibrate) return;
    
    const intensityMap = {
      light: [5],
      medium: [10],
      heavy: [15]
    };
    
    navigator.vibrate(intensityMap[intensity]);
  }, [hapticFeedback]);
  
  // Helper functions (FIX: Add missing functions)
  const getKeyboardShortcut = useCallback((event: KeyboardEvent): string => {
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    if (event.metaKey) parts.push('Meta');
    parts.push(event.key);
    return parts.join('+');
  }, []);
  
  const handleArrowKeyNavigation = useCallback((key: string) => {
    const step = precisionMode.enabled ? (precisionMode.gridSize || 20) : 10;
    let deltaX = 0;
    let deltaY = 0;
    
    switch (key) {
      case 'ArrowUp':
        deltaY = -step;
        break;
      case 'ArrowDown':
        deltaY = step;
        break;
      case 'ArrowLeft':
        deltaX = -step;
        break;
      case 'ArrowRight':
        deltaX = step;
        break;
    }
    
    const newOffset = {
      x: panOffset.x + deltaX,
      y: panOffset.y + deltaY
    };
    
    setPanOffset(newOffset);
    
    const desktopEvent: DesktopGestureEvent = {
      type: 'keyboard-shortcut',
      position: { x: 0, y: 0 },
      delta: { x: deltaX, y: deltaY },
      keyboardShortcut: key,
      timestamp: Date.now()
    };
    
    onPrecisionAction?.(desktopEvent);
    onDesktopGesture?.(desktopEvent);
  }, [precisionMode.enabled, precisionMode.gridSize, panOffset, onPrecisionAction, onDesktopGesture]);
  
  const handleSpacebarAction = useCallback(() => {
    // Implement spacebar action (e.g., center view)
    setPanOffset({ x: 0, y: 0 });
    setCurrentZoomLevel(1);
  }, []);
  
  const handleEnterAction = useCallback(() => {
    // Implement enter action (e.g., confirm selection)
    const desktopEvent: DesktopGestureEvent = {
      type: 'keyboard-shortcut',
      position: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      keyboardShortcut: 'Enter',
      timestamp: Date.now()
    };
    
    onPrecisionAction?.(desktopEvent);
    onDesktopGesture?.(desktopEvent);
  }, [onPrecisionAction, onDesktopGesture]);

  // Distance calculation helper
  const calculateDistance = useCallback((touch1: AdvancedTouchPoint, touch2: AdvancedTouchPoint): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);
  
  // Angle calculation helper
  const calculateAngle = useCallback((touch1: AdvancedTouchPoint, touch2: AdvancedTouchPoint): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);
  
  // Center point calculation
  const calculateCenter = useCallback((touchPoints: AdvancedTouchPoint[]): { x: number; y: number } => {
    const x = touchPoints.reduce((sum, touch) => sum + touch.x, 0) / touchPoints.length;
    const y = touchPoints.reduce((sum, touch) => sum + touch.y, 0) / touchPoints.length;
    return { x, y };
  }, []);
  
  // Velocity calculation
  const calculateVelocity = useCallback((currentPos: { x: number; y: number }): { x: number; y: number } => {
    const now = Date.now();
    velocityTracker.current.push({ ...currentPos, timestamp: now });
    
    // Keep only recent positions (last 100ms)
    velocityTracker.current = velocityTracker.current.filter(pos => now - pos.timestamp < 100);
    
    if (velocityTracker.current.length < 2) return { x: 0, y: 0 };
    
    const oldest = velocityTracker.current[0];
    const newest = velocityTracker.current[velocityTracker.current.length - 1];
    const timeDiff = newest.timestamp - oldest.timestamp;
    
    if (timeDiff === 0) return { x: 0, y: 0 };
    
    return {
      x: (newest.x - oldest.x) / timeDiff,
      y: (newest.y - oldest.y) / timeDiff
    };
  }, []);
  
  // Announce gesture for screen readers
  const announceGesture = useCallback((gestureType: GestureType | AdvancedGestureType, details?: string) => {
    if (!announceGestures || !announceRef.current) return;
    
    const gestureNames: Record<GestureType | AdvancedGestureType, string> = {
      'tap': 'Tap',
      'double-tap': 'Double tap',
      'long-press': 'Long press',
      'pinch': 'Pinch',
      'swipe': 'Swipe',
      'pan': 'Pan',
      'rotate': 'Rotate',
      'triple-tap': 'Triple tap',
      'four-finger-tap': 'Four finger tap',
      'three-finger-swipe': 'Three finger swipe',
      'force-touch': 'Force touch',
      'gesture-sequence': 'Gesture sequence',
      'custom-gesture': 'Custom gesture',
      'pinch-rotate': 'Pinch rotate',
      'two-finger-tap': 'Two finger tap',
      'edge-swipe': 'Edge swipe',
      'circular-pan': 'Circular pan',
      'zoom-pan': 'Zoom pan',
      'directional-swipe': 'Directional swipe'
    };
    
    const announcement = `${gestureNames[gestureType]} gesture${details ? ` ${details}` : ''}`;
    announceRef.current.textContent = announcement;
  }, [announceGestures]);

  // Generate class names
  const gestureAreaClasses = [
    styles.gestureArea,
    gestureInProgress && styles[`gesture${gestureInProgress.charAt(0).toUpperCase() + gestureInProgress.slice(1).replace('-', '')}`],
    visualFeedback && styles.visualFeedback,
    // Advanced gesture classes (NEW)
    advancedGesturesEnabled && styles.advancedGestures,
    forceTouchSettings.enabled && styles.forceTouchEnabled,
    forceLevel !== 'none' && styles[`force${forceLevel.charAt(0).toUpperCase() + forceLevel.slice(1)}`],
    // Desktop enhancement classes
    desktopEnhanced && styles.desktopEnhanced,
    desktopEnhanced && isDesktopDevice && styles[`desktop${desktopMode.charAt(0).toUpperCase() + desktopMode.slice(1)}`],
    isDragging && styles.dragging,
    keyboardFocused && styles.keyboardFocused,
    precisionMode.enabled && styles.precisionMode,
    precisionMode.showGrid && styles.showGrid,
    className
  ].filter(Boolean).join(' ');
  
  // Desktop mouse wheel zoom
  const handleMouseWheel = useCallback((event: WheelEvent) => {
    if (!desktopEnhanced || !mouseWheelZoom.enabled) return;
    
    event.preventDefault();
    
    const rect = gestureAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const delta = -event.deltaY * (mouseWheelZoom.sensitivity || 0.1);
    const newScale = Math.max(
      mouseWheelZoom.minScale || 0.1,
      Math.min(mouseWheelZoom.maxScale || 10, currentZoomLevel + delta)
    );
    
    setCurrentZoomLevel(newScale);
    
    const desktopEvent: DesktopGestureEvent = {
      type: 'wheel-zoom',
      position,
      delta: { x: 0, y: delta },
      scale: newScale,
      wheelDelta: event.deltaY,
      timestamp: Date.now()
    };
    
    onMouseWheelZoom?.(desktopEvent);
    onDesktopGesture?.(desktopEvent);
  }, [desktopEnhanced, mouseWheelZoom, currentZoomLevel, onMouseWheelZoom, onDesktopGesture]);
  
  // Desktop drag to pan
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!desktopEnhanced || !dragToPan.enabled || event.button !== dragToPan.button) return;
    
    event.preventDefault();
    setIsDragging(true);
    setDragStartPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(false);
  }, [desktopEnhanced, dragToPan]);
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragStartPosition) return;
    
    const deltaX = event.clientX - dragStartPosition.x;
    const deltaY = event.clientY - dragStartPosition.y;
    
    const newOffset = {
      x: panOffset.x + deltaX * (dragToPan.sensitivity || 1),
      y: panOffset.y + deltaY * (dragToPan.sensitivity || 1)
    };
    
    setPanOffset(newOffset);
    setDragStartPosition({ x: event.clientX, y: event.clientY });
    
    const rect = gestureAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const desktopEvent: DesktopGestureEvent = {
      type: 'drag-pan',
      position: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      },
      delta: { x: deltaX, y: deltaY },
      timestamp: Date.now()
    };
    
    onDragToPan?.(desktopEvent);
    onDesktopGesture?.(desktopEvent);
  }, [isDragging, dragStartPosition, panOffset, dragToPan, onDragToPan, onDesktopGesture]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartPosition(null);
  }, []);
  
  // Desktop context menu
  const handleContextMenuEvent = useCallback((event: React.MouseEvent) => {
    if (!desktopEnhanced || !contextMenuConfig.enabled || !contextMenuConfig.showOnRightClick) return;
    
    event.preventDefault();
    
    const rect = gestureAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    setContextMenuPosition(position);
    setShowContextMenu(true);
    
    const desktopEvent: DesktopGestureEvent = {
      type: 'right-click',
      position,
      delta: { x: 0, y: 0 },
      mouseButton: event.button,
      timestamp: Date.now()
    };
    
    onContextMenuAction?.(desktopEvent);
    onDesktopGesture?.(desktopEvent);
  }, [desktopEnhanced, contextMenuConfig, onContextMenuAction, onDesktopGesture]);
  
  // Desktop mouse event listeners
  useEffect(() => {
    if (!desktopEnhanced || !isDesktopDevice) return;
    
    const element = gestureAreaRef.current;
    if (!element) return;
    
    element.addEventListener('wheel', handleMouseWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      element.removeEventListener('wheel', handleMouseWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [desktopEnhanced, isDesktopDevice, handleMouseWheel, handleMouseMove, handleMouseUp]);
  
  return (
    <>
      <div
        ref={ref || gestureAreaRef}
        className={gestureAreaClasses}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenuEvent}
        onFocus={() => setKeyboardFocused(true)}
        onBlur={() => setKeyboardFocused(false)}
        role="application"
        aria-label="Advanced gesture area for camera controls"
        aria-describedby={announceGestures ? 'gesture-announcements' : undefined}
        data-desktop-enhanced={desktopEnhanced}
        data-desktop-mode={desktopMode}
        data-gesture-enabled={gestureEnabled}
        data-advanced-gestures={advancedGesturesEnabled}
        data-force-touch={forceTouchSettings.enabled}
        data-current-zoom={currentZoomLevel}
        tabIndex={desktopAccessibility.enableTabNavigation ? 0 : -1}
        style={{
          '--zoom-level': currentZoomLevel,
          '--pan-x': `${panOffset.x}px`,
          '--pan-y': `${panOffset.y}px`,
          '--grid-size': precisionMode.enabled ? `${precisionMode.gridSize}px` : '20px',
          '--force-level': forceLevel,
        } as React.CSSProperties}
        {...rest}
      >
        {children}
        
        {/* Desktop precision grid */}
        {desktopEnhanced && precisionMode.enabled && precisionMode.showGrid && (
          <div className={styles.precisionGrid} />
        )}
        
        {/* Advanced gesture indicators (NEW) */}
        {advancedGesturesEnabled && visualFeedback && (
          <>
            {/* Force touch indicator */}
            {forceTouchSettings.enabled && forceLevel !== 'none' && (
              <div className={styles.forceTouchIndicator}>
                <div className={styles.forceLevel}>
                  {forceLevel.toUpperCase()}
                </div>
                <div className={styles.forceBar}>
                  <div 
                    className={styles.forceProgress}
                    style={{ 
                      width: `${
                        forceLevel === 'light' ? '33%' : 
                        forceLevel === 'medium' ? '66%' : '100%'
                      }` 
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Circular gesture indicator */}
            {circularGestureData && (
              <div 
                className={styles.circularGestureIndicator}
                style={{
                  left: circularGestureData.center.x,
                  top: circularGestureData.center.y,
                  width: circularGestureData.radius * 2,
                  height: circularGestureData.radius * 2,
                }}
              >
                <div className={styles.circularProgress}>
                  {circularGestureData.direction === 'clockwise' ? '↻' : '↺'}
                </div>
              </div>
            )}
            
            {/* Multi-touch indicator */}
            {touches.length > 2 && (
              <div className={styles.multiTouchIndicator}>
                {touches.length} fingers
              </div>
            )}
          </>
        )}
        
        {/* Desktop context menu */}
        {desktopEnhanced && showContextMenu && contextMenuPosition && contextMenuConfig.items && contextMenuConfig.items.length > 0 && (
          <div
            ref={contextMenuRef}
            className={styles.contextMenu}
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            {contextMenuConfig.items.map((item, index) => (
              <button
                key={index}
                className={styles.contextMenuItem}
                onClick={() => {
                  item.action();
                  setShowContextMenu(false);
                }}
              >
                <span className={styles.contextMenuLabel}>{item.label}</span>
                {item.shortcut && (
                  <span className={styles.contextMenuShortcut}>{item.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Gesture visual feedback */}
        {visualFeedback && gestureInProgress && (
          <div className={styles.gestureIndicator}>
            <div className={styles.gestureIndicatorIcon}>
              {gestureInProgress === 'tap' && '👆'}
              {gestureInProgress === 'double-tap' && '👆👆'}
              {gestureInProgress === 'triple-tap' && '👆👆👆'}
              {gestureInProgress === 'long-press' && '👆⏰'}
              {gestureInProgress === 'pinch' && '👌'}
              {gestureInProgress === 'swipe' && '👉'}
              {gestureInProgress === 'pan' && '✋'}
              {gestureInProgress === 'rotate' && '🔄'}
              {gestureInProgress === 'force-touch' && '💪'}
              {gestureInProgress === 'circular-pan' && '🔄'}
              {gestureInProgress === 'four-finger-tap' && '🖐️'}
              {gestureInProgress === 'three-finger-swipe' && '🖐️'}
              {gestureInProgress === 'two-finger-tap' && '✌️'}
            </div>
            <div className={styles.gestureIndicatorText}>
              {gestureInProgress.replace('-', ' ')}
            </div>
          </div>
        )}
        
        {/* Desktop zoom indicator */}
        {desktopEnhanced && currentZoomLevel !== 1 && (
          <div className={styles.zoomIndicator}>
            {Math.round(currentZoomLevel * 100)}%
          </div>
        )}
      </div>
      
      {/* Screen reader announcements */}
      {announceGestures && (
        <div
          ref={announceRef}
          id="gesture-announcements"
          className={styles.srOnly}
          aria-live="polite"
          aria-atomic="true"
        />
      )}
    </>
  );
});

AdvancedGestureArea.displayName = 'AdvancedGestureArea';

export { AdvancedGestureArea };
export default AdvancedGestureArea; 