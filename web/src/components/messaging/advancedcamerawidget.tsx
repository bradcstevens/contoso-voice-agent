import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { CameraPermissionFlow } from './camerapermissionflow';
import { CameraFeedContainer } from './camerafeedcontainer';
import { CaptureInterface } from './captureinterface';
import { CameraErrorHandler } from './cameraerrorhandler';
import { VisualAnalysisDisplay } from './visualanalysisdisplay';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './advancedcamerawidget.module.css';

// Organism-level interfaces for complex accessibility management
interface OrganismAccessibilityContext {
  landmarks: Map<string, HTMLElement>;
  navigationSequence: string[];
  focusTraps: Map<string, { first: HTMLElement; last: HTMLElement }>;
  liveRegions: Map<string, HTMLElement>;
  errorStates: Map<string, boolean>;
}

interface OrganismPerformanceMetrics {
  initializationTime: number;
  componentLoadTime: number;
  interactionLatency: number;
  endToEndResponseTime: number;
  wcagValidationTime: number;
}

interface OrganismKeyboardNavigation {
  currentContext: 'permission' | 'feed' | 'capture' | 'analysis' | 'error';
  contextSequence: string[];
  shortcuts: Map<string, () => void>;
  customHandlers: Map<string, (event: KeyboardEvent) => boolean>;
}

interface AdvancedCameraWidgetState {
  isInitialized: boolean;
  hasPermission: boolean;
  isCapturing: boolean;
  isAnalyzing: boolean;
  hasError: boolean;
  errorType: string | null;
  currentMode: 'setup' | 'active' | 'analysis' | 'error';
  performanceMetrics: OrganismPerformanceMetrics;
  accessibilityContext: OrganismAccessibilityContext;
  keyboardNavigation: OrganismKeyboardNavigation;
}

interface AdvancedCameraWidgetProps {
  className?: string;
  onPermissionGranted?: () => void;
  onCaptureComplete?: (imageData: string) => void;
  onAnalysisResult?: (result: any) => void;
  onError?: (error: string) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  enforceSLA?: boolean; // 3s end-to-end response SLA
  accessibilityLevel?: 'AA' | 'AAA';
  keyboardNavigationMode?: 'standard' | 'advanced' | 'custom';
  children?: React.ReactNode;
}

export interface AdvancedCameraWidgetRef {
  // Organism-level accessibility controls
  focusLandmark: (landmark: string) => void;
  navigateToContext: (context: string) => void;
  triggerAccessibilityAnnouncement: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Performance monitoring
  getPerformanceMetrics: () => OrganismPerformanceMetrics;
  validateSLA: () => boolean;
  
  // Advanced interactions
  startCapture: () => Promise<void>;
  abortCapture: () => void;
  retryLastAction: () => void;
  
  // Accessibility debugging
  auditAccessibility: () => Promise<any[]>;
  validateKeyboardNavigation: () => boolean;
  getAccessibilityContext: () => OrganismAccessibilityContext;
}

export const AdvancedCameraWidget = forwardRef<AdvancedCameraWidgetRef, AdvancedCameraWidgetProps>(
  ({ 
    className = '', 
    onPermissionGranted,
    onCaptureComplete,
    onAnalysisResult,
    onError,
    onPerformanceMetric,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    keyboardNavigationMode = 'advanced',
    children
  }, ref) => {
    
    // Performance tracking for 3s SLA enforcement
    const performanceStartTime = useRef<number>(Date.now());
    const slaTimer = useRef<NodeJS.Timeout | null>(null);
    const componentMountTime = useRef<number>(Date.now());
    
    // Accessibility context management
    const accessibilityContextRef = useRef<OrganismAccessibilityContext>({
      landmarks: new Map(),
      navigationSequence: [],
      focusTraps: new Map(),
      liveRegions: new Map(),
      errorStates: new Map()
    });
    
    // Complex organism state
    const [state, setState] = useState<AdvancedCameraWidgetState>({
      isInitialized: false,
      hasPermission: false,
      isCapturing: false,
      isAnalyzing: false,
      hasError: false,
      errorType: null,
      currentMode: 'setup',
      performanceMetrics: {
        initializationTime: 0,
        componentLoadTime: 0,
        interactionLatency: 0,
        endToEndResponseTime: 0,
        wcagValidationTime: 0
      },
      accessibilityContext: accessibilityContextRef.current,
      keyboardNavigation: {
        currentContext: 'permission',
        contextSequence: ['permission', 'feed', 'capture', 'analysis'],
        shortcuts: new Map(),
        customHandlers: new Map()
      }
    });
    
    // Organism-level refs for complex navigation
    const containerRef = useRef<HTMLDivElement>(null);
    const permissionFlowRef = useRef<any>(null);
    const feedContainerRef = useRef<any>(null);
    const captureInterfaceRef = useRef<any>(null);
    const analysisDisplayRef = useRef<any>(null);
    const errorHandlerRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // SLA enforcement - 3 second end-to-end response time requirement
    const enforceSLACompliance = useCallback((actionStart: number) => {
      if (!enforceSLA) return;
      
      const slaLimit = 3000; // 3 seconds
      slaTimer.current = setTimeout(() => {
        const elapsed = Date.now() - actionStart;
        if (elapsed > slaLimit) {
          console.warn(`[AdvancedCameraWidget] SLA violation: ${elapsed}ms > ${slaLimit}ms`);
          onPerformanceMetric?.('sla_violation', elapsed);
          
          // Trigger accessibility announcement for SLA violation
          triggerAccessibilityAnnouncement(
            `Performance notice: Operation took ${Math.round(elapsed / 1000)} seconds. Consider refreshing if experiencing delays.`,
            'polite'
          );
        }
      }, slaLimit);
    }, [enforceSLA, onPerformanceMetric]);
    
    // Organism-level accessibility announcements
    const triggerAccessibilityAnnouncement = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute('aria-live', priority);
        announcementRef.current.textContent = message;
        
        // Clear announcement after reading
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
    }, []);
    
    // Advanced keyboard navigation for organism-level components
    const handleOrganismKeyboardNavigation = useCallback((event: KeyboardEvent) => {
      const { currentContext, contextSequence, shortcuts, customHandlers } = state.keyboardNavigation;
      
      // Check for custom handlers first
      const customHandler = customHandlers.get(event.key + (event.ctrlKey ? '+ctrl' : '') + (event.altKey ? '+alt' : ''));
      if (customHandler && customHandler(event)) {
        event.preventDefault();
        return;
      }
      
      // Organism-level shortcuts
      switch (event.key) {
        case 'Tab':
          if (event.ctrlKey) {
            // Ctrl+Tab: Navigate between organism contexts
            event.preventDefault();
            const currentIndex = contextSequence.indexOf(currentContext);
            const nextIndex = event.shiftKey ? 
              (currentIndex - 1 + contextSequence.length) % contextSequence.length :
              (currentIndex + 1) % contextSequence.length;
            const nextContext = contextSequence[nextIndex];
            navigateToContext(nextContext);
            triggerAccessibilityAnnouncement(`Switched to ${nextContext} section`, 'assertive');
          }
          break;
          
        case 'Escape':
          // Reset to initial state or close error states
          if (state.hasError) {
            setState(prev => ({ ...prev, hasError: false, errorType: null, currentMode: 'active' }));
            triggerAccessibilityAnnouncement('Error dismissed, returned to camera interface', 'assertive');
          }
          break;
          
        case 'Enter':
          if (event.ctrlKey || event.metaKey) {
            // Ctrl/Cmd+Enter: Quick capture
            event.preventDefault();
            if (state.hasPermission && !state.isCapturing) {
              startCapture();
            }
          }
          break;
          
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            // Ctrl/Cmd+R: Retry last action
            event.preventDefault();
            retryLastAction();
          }
          break;
          
        case '?':
          if (event.shiftKey) {
            // Shift+?: Show keyboard shortcuts
            event.preventDefault();
            triggerAccessibilityAnnouncement(
              'Keyboard shortcuts: Ctrl+Tab to switch sections, Ctrl+Enter to capture, Ctrl+R to retry, Escape to dismiss errors',
              'assertive'
            );
          }
          break;
      }
    }, [state]);
    
    // Focus landmark navigation
    const focusLandmark = useCallback((landmark: string) => {
      const element = accessibilityContextRef.current.landmarks.get(landmark);
      if (element && element.focus) {
        element.focus();
        triggerAccessibilityAnnouncement(`Focused on ${landmark}`, 'polite');
      }
    }, []);
    
    // Context navigation for organism-level sections
    const navigateToContext = useCallback((context: string) => {
      setState(prev => ({
        ...prev,
        keyboardNavigation: {
          ...prev.keyboardNavigation,
          currentContext: context as any
        }
      }));
      
      // Focus appropriate component based on context
      switch (context) {
        case 'permission':
          permissionFlowRef.current?.focus?.();
          break;
        case 'feed':
          feedContainerRef.current?.focus?.();
          break;
        case 'capture':
          captureInterfaceRef.current?.focus?.();
          break;
        case 'analysis':
          analysisDisplayRef.current?.focus?.();
          break;
        case 'error':
          errorHandlerRef.current?.focus?.();
          break;
      }
    }, []);
    
    // Advanced capture with SLA enforcement
    const startCapture = useCallback(async () => {
      const actionStart = Date.now();
      enforceSLACompliance(actionStart);
      
      try {
        setState(prev => ({ ...prev, isCapturing: true }));
        triggerAccessibilityAnnouncement('Starting camera capture', 'assertive');
        
        // Delegate to capture interface
        await captureInterfaceRef.current?.startCapture?.();
        
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          errorType: 'capture_failed',
          currentMode: 'error'
        }));
        onError?.(error instanceof Error ? error.message : 'Capture failed');
      } finally {
        setState(prev => ({ ...prev, isCapturing: false }));
        
        const endTime = Date.now();
        const totalTime = endTime - actionStart;
        onPerformanceMetric?.('capture_duration', totalTime);
        
        if (slaTimer.current) {
          clearTimeout(slaTimer.current);
        }
      }
    }, [enforceSLACompliance, onError, onPerformanceMetric]);
    
    // Abort capture operation
    const abortCapture = useCallback(() => {
      setState(prev => ({ ...prev, isCapturing: false }));
      captureInterfaceRef.current?.abortCapture?.();
      triggerAccessibilityAnnouncement('Capture aborted', 'assertive');
      
      if (slaTimer.current) {
        clearTimeout(slaTimer.current);
      }
    }, []);
    
    // Retry last action
    const retryLastAction = useCallback(() => {
      if (state.hasError) {
        setState(prev => ({ ...prev, hasError: false, errorType: null }));
        if (state.errorType === 'capture_failed') {
          startCapture();
        }
      }
    }, [state.hasError, state.errorType, startCapture]);
    
    // Accessibility audit function
    const auditAccessibility = useCallback(async (): Promise<any[]> => {
      const violations: any[] = [];
      
      // Check organism-level accessibility requirements
      const container = containerRef.current;
      if (!container) return violations;
      
      // 1. Check for proper landmark structure
      const landmarks = container.querySelectorAll('[role]');
      if (landmarks.length === 0) {
        violations.push({
          rule: 'organism_landmarks',
          severity: 'high',
          message: 'Organism components should have proper landmark roles'
        });
      }
      
      // 2. Validate keyboard navigation
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) {
        violations.push({
          rule: 'keyboard_navigation',
          severity: 'critical',
          message: 'No focusable elements found in organism'
        });
      }
      
      // 3. Check ARIA labeling for complex structures
      const unlabeledElements = container.querySelectorAll(
        'button:not([aria-label]):not([aria-labelledby]), ' +
        'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
        '[role]:not([aria-label]):not([aria-labelledby])'
      );
      if (unlabeledElements.length > 0) {
        violations.push({
          rule: 'aria_labeling',
          severity: 'medium',
          message: `${unlabeledElements.length} elements missing ARIA labels`
        });
      }
      
      return violations;
    }, []);
    
    // Performance metrics getter
    const getPerformanceMetrics = useCallback((): OrganismPerformanceMetrics => {
      return { ...state.performanceMetrics };
    }, [state.performanceMetrics]);
    
    // SLA validation
    const validateSLA = useCallback((): boolean => {
      return state.performanceMetrics.endToEndResponseTime <= 3000;
    }, [state.performanceMetrics.endToEndResponseTime]);
    
    // Initialize organism on mount
    useEffect(() => {
      const initStart = Date.now();
      
      // Set up accessibility context
      const container = containerRef.current;
      if (container) {
        // Register landmarks
        accessibilityContextRef.current.landmarks.set('main', container);
        
        // Set up keyboard event handling
        const keyboardHandler = (event: KeyboardEvent) => {
          handleOrganismKeyboardNavigation(event);
        };
        
        container.addEventListener('keydown', keyboardHandler);
        
        // Initialize performance metrics
        const initTime = Date.now() - initStart;
        const loadTime = Date.now() - componentMountTime.current;
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          performanceMetrics: {
            ...prev.performanceMetrics,
            initializationTime: initTime,
            componentLoadTime: loadTime
          }
        }));
        
        onPerformanceMetric?.('initialization_time', initTime);
        onPerformanceMetric?.('component_load_time', loadTime);
        
        return () => {
          container.removeEventListener('keydown', keyboardHandler);
        };
      }
    }, [handleOrganismKeyboardNavigation, onPerformanceMetric]);
    
    // Expose organism-level API
    useImperativeHandle(ref, () => ({
      focusLandmark,
      navigateToContext,
      triggerAccessibilityAnnouncement,
      getPerformanceMetrics,
      validateSLA,
      startCapture,
      abortCapture,
      retryLastAction,
      auditAccessibility,
      validateKeyboardNavigation: () => {
        return (containerRef.current?.querySelectorAll('[tabindex], button, input, select, textarea')?.length ?? 0) > 0;
      },
      getAccessibilityContext: () => ({ ...accessibilityContextRef.current })
    }));
    
    // Handle molecular component events
    const handlePermissionGranted = useCallback(() => {
      setState(prev => ({ ...prev, hasPermission: true, currentMode: 'active' }));
      onPermissionGranted?.();
      triggerAccessibilityAnnouncement('Camera permission granted, camera interface active', 'assertive');
    }, [onPermissionGranted]);
    
    const handleCaptureComplete = useCallback((imageData: string) => {
      setState(prev => ({ ...prev, isAnalyzing: true, currentMode: 'analysis' }));
      onCaptureComplete?.(imageData);
      triggerAccessibilityAnnouncement('Image captured, starting analysis', 'assertive');
    }, [onCaptureComplete]);
    
    const handleAnalysisResult = useCallback((result: any) => {
      setState(prev => ({ ...prev, isAnalyzing: false }));
      onAnalysisResult?.(result);
      triggerAccessibilityAnnouncement('Analysis complete, results available', 'assertive');
    }, [onAnalysisResult]);
    
    const handleError = useCallback((error: string) => {
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        errorType: error,
        currentMode: 'error'
      }));
      onError?.(error);
      triggerAccessibilityAnnouncement(`Error occurred: ${error}`, 'assertive');
    }, [onError]);
    
    // Render organism with proper accessibility structure
    const renderOrganismContent = useMemo(() => {
      if (!state.isInitialized) {
        return (
          <div className={styles.loading} role="status" aria-label="Loading camera interface">
            <span className="sr-only">Loading advanced camera interface...</span>
          </div>
        );
      }
      
      switch (state.currentMode) {
        case 'setup':
          return (
            <section className={styles.permissionSection} aria-labelledby="permission-heading">
              <h2 id="permission-heading" className="sr-only">Camera Permission Setup</h2>
              <CameraPermissionFlow
                ref={permissionFlowRef}
                onPermissionGranted={handlePermissionGranted}
                onError={handleError}
              />
            </section>
          );
          
        case 'active':
          return (
            <>
              <section className={styles.feedSection} aria-labelledby="feed-heading">
                <h2 id="feed-heading" className="sr-only">Camera Feed</h2>
                <CameraFeedContainer
                  ref={feedContainerRef}
                  onError={handleError}
                />
              </section>
              
              <section className={styles.captureSection} aria-labelledby="capture-heading">
                <h2 id="capture-heading" className="sr-only">Camera Controls</h2>
                <CaptureInterface
                  ref={captureInterfaceRef}
                  onCaptureComplete={handleCaptureComplete}
                  onError={handleError}
                />
              </section>
            </>
          );
          
        case 'analysis':
          return (
            <section className={styles.analysisSection} aria-labelledby="analysis-heading">
              <h2 id="analysis-heading" className="sr-only">Visual Analysis Results</h2>
              <VisualAnalysisDisplay
                ref={analysisDisplayRef}
                onAnalysisResult={handleAnalysisResult}
                onError={handleError}
              />
            </section>
          );
          
        case 'error':
          return (
            <section className={styles.errorSection} aria-labelledby="error-heading">
              <h2 id="error-heading" className="sr-only">Error Recovery</h2>
              <CameraErrorHandler
                ref={errorHandlerRef}
                errorType={state.errorType}
                onRetry={retryLastAction}
                onError={handleError}
              />
            </section>
          );
          
        default:
          return null;
      }
    }, [state, handlePermissionGranted, handleCaptureComplete, handleAnalysisResult, handleError, retryLastAction]);
    
    return (
      <div 
        ref={containerRef}
        className={`${styles.advancedCameraWidget} ${className}`}
        role="main"
        aria-labelledby="widget-heading"
        tabIndex={-1}
      >
        {/* Organism heading */}
        <h1 id="widget-heading" className="sr-only">
          Advanced Camera Interface
        </h1>
        
        {/* Live region for accessibility announcements */}
        <div 
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        
        {/* Performance indicator for SLA monitoring */}
        {enforceSLA && (
          <div className={styles.performanceIndicator} role="status" aria-label="Performance status">
            <span className="sr-only">
              Response time: {state.performanceMetrics.endToEndResponseTime}ms 
              {validateSLA() ? ' (within SLA)' : ' (SLA violation)'}
            </span>
          </div>
        )}
        
        {/* Accessibility fusion layer for organism-level orchestration */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          accessibilityLevel={accessibilityLevel}
          performanceMode="organism"
        />
        
        {/* Organism content */}
        {renderOrganismContent}
        
        {/* Keyboard shortcuts helper */}
        {keyboardNavigationMode === 'advanced' && (
          <div className={styles.keyboardHelp} role="complementary" aria-label="Keyboard shortcuts">
            <span className="sr-only">
              Press Shift+? for keyboard shortcuts. 
              Use Ctrl+Tab to navigate sections, 
              Ctrl+Enter to capture, 
              Ctrl+R to retry actions.
            </span>
          </div>
        )}
        
        {/* Additional organism content */}
        {children}
      </div>
    );
  }
);

AdvancedCameraWidget.displayName = 'AdvancedCameraWidget';

export default AdvancedCameraWidget; 