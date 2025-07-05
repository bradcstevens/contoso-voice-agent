import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef,
  ReactNode
} from 'react';
import Chat from './chat';
import { AdvancedCameraWidget } from './advancedcamerawidget';
import { MultiModalOrchestrator } from './multimodalorchestrator';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './cameraenabledchatlayout.module.css';
import { useChatStore } from '@/store/chat';
import usePersistStore from '@/store/usePersistStore';

// Template-level interfaces following compound component pattern
interface CameraEnabledChatLayoutState {
  currentPanel: 'chat' | 'camera' | 'split';
  chatVisible: boolean;
  cameraVisible: boolean;
  isMultiModalActive: boolean;
  layoutMode: 'mobile' | 'tablet' | 'desktop';
  performanceMetrics: {
    templateRenderTime: number;
    stateSyncTime: number;
    accessibilityUpdateTime: number;
    totalResponseTime: number;
  };
  accessibilityContext: {
    currentFocus: string;
    announcementQueue: string[];
    navigationHistory: string[];
  };
}

interface CameraEnabledChatLayoutProps {
  className?: string;
  defaultPanel?: 'chat' | 'camera' | 'split';
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  enableVideoCapture?: boolean;
  enforceSLA?: boolean; // <500ms template render requirement
  accessibilityLevel?: 'AA' | 'AAA';
  onPanelChange?: (panel: 'chat' | 'camera' | 'split') => void;
  onChatMessage?: (message: string) => void;
  onCameraCapture?: (imageData: string) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  children?: ReactNode;
}

export interface CameraEnabledChatLayoutRef {
  // Template-level navigation
  switchToPanel: (panel: 'chat' | 'camera' | 'split') => void;
  focusChat: () => void;
  focusCamera: () => void;
  
  // Multi-modal coordination
  startMultiModalSession: () => void;
  endMultiModalSession: () => void;
  syncModalityStates: () => void;
  
  // Performance monitoring
  getTemplateMetrics: () => any;
  validatePerformanceSLA: () => boolean;
  
  // Accessibility
  announceLayoutChange: (message: string) => void;
  auditTemplateAccessibility: () => Promise<any[]>;
}

// Compound component structure for template composition
interface CameraEnabledChatLayoutComponents {
  Header: React.FC<CameraEnabledChatLayoutHeaderProps>;
  ChatPanel: React.FC<CameraEnabledChatLayoutChatPanelProps>;
  CameraPanel: React.FC<CameraEnabledChatLayoutCameraPanelProps>;
  Controls: React.FC<CameraEnabledChatLayoutControlsProps>;
  Footer: React.FC<CameraEnabledChatLayoutFooterProps>;
}

// Header compound component
interface CameraEnabledChatLayoutHeaderProps {
  children?: ReactNode;
  showPanelSwitcher?: boolean;
  onPanelSwitch?: (panel: 'chat' | 'camera' | 'split') => void;
  currentPanel?: 'chat' | 'camera' | 'split';
}

const CameraEnabledChatLayoutHeader: React.FC<CameraEnabledChatLayoutHeaderProps> = ({
  children,
  showPanelSwitcher = true,
  onPanelSwitch,
  currentPanel = 'split'
}) => {
  const handlePanelSwitch = useCallback((panel: 'chat' | 'camera' | 'split') => {
    onPanelSwitch?.(panel);
  }, [onPanelSwitch]);

  return (
    <header className={styles.templateHeader} role="banner">
      <div className={styles.headerContent}>
        {showPanelSwitcher && (
          <nav className={styles.panelSwitcher} role="navigation" aria-label="Panel navigation">
            <button
              className={`${styles.panelButton} ${currentPanel === 'chat' ? styles.active : ''}`}
              onClick={() => handlePanelSwitch('chat')}
              aria-pressed={currentPanel === 'chat'}
              aria-label="Switch to chat only view"
            >
              Chat
            </button>
            <button
              className={`${styles.panelButton} ${currentPanel === 'camera' ? styles.active : ''}`}
              onClick={() => handlePanelSwitch('camera')}
              aria-pressed={currentPanel === 'camera'}
              aria-label="Switch to camera only view"
            >
              Camera
            </button>
            <button
              className={`${styles.panelButton} ${currentPanel === 'split' ? styles.active : ''}`}
              onClick={() => handlePanelSwitch('split')}
              aria-pressed={currentPanel === 'split'}
              aria-label="Switch to split chat and camera view"
            >
              Both
            </button>
          </nav>
        )}
        {children}
      </div>
    </header>
  );
};

// Chat Panel compound component
interface CameraEnabledChatLayoutChatPanelProps {
  children?: ReactNode;
  visible?: boolean;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  onMessage?: (message: string) => void;
}

const CameraEnabledChatLayoutChatPanel: React.FC<CameraEnabledChatLayoutChatPanelProps> = ({
  children,
  visible = true,
  enableVoice = true,
  enableFileUpload = true,
  onMessage
}) => {
  const chatRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      className={`${styles.chatPanel} ${visible ? styles.visible : styles.hidden}`}
      role="region"
      aria-label="Chat conversation"
      ref={chatRef}
    >
      <div className={styles.chatContainer}>
        <Chat 
          options={{
            video: false, // Handled by camera panel
            file: enableFileUpload
          }}
        />
        {children}
      </div>
    </section>
  );
};

// Camera Panel compound component
interface CameraEnabledChatLayoutCameraPanelProps {
  children?: ReactNode;
  visible?: boolean;
  onCapture?: (imageData: string) => void;
  onError?: (error: string) => void;
}

const CameraEnabledChatLayoutCameraPanel: React.FC<CameraEnabledChatLayoutCameraPanelProps> = ({
  children,
  visible = true,
  onCapture,
  onError
}) => {
  const cameraRef = useRef<any>(null);

  const handleCaptureComplete = useCallback((imageData: string) => {
    onCapture?.(imageData);
  }, [onCapture]);

  const handleError = useCallback((error: string) => {
    onError?.(error);
  }, [onError]);

  return (
    <section 
      className={`${styles.cameraPanel} ${visible ? styles.visible : styles.hidden}`}
      role="region"
      aria-label="Camera interface"
    >
      <div className={styles.cameraContainer}>
        <AdvancedCameraWidget
          ref={cameraRef}
          onCaptureComplete={handleCaptureComplete}
          onError={handleError}
          enforceSLA={true}
          accessibilityLevel="AAA"
          keyboardNavigationMode="advanced"
        />
        {children}
      </div>
    </section>
  );
};

// Controls compound component
interface CameraEnabledChatLayoutControlsProps {
  children?: ReactNode;
  showLayoutControls?: boolean;
  showMultiModalToggle?: boolean;
  onMultiModalToggle?: (active: boolean) => void;
  multiModalActive?: boolean;
}

const CameraEnabledChatLayoutControls: React.FC<CameraEnabledChatLayoutControlsProps> = ({
  children,
  showLayoutControls = true,
  showMultiModalToggle = true,
  onMultiModalToggle,
  multiModalActive = false
}) => {
  return (
    <div className={styles.templateControls} role="toolbar" aria-label="Layout controls">
      {showMultiModalToggle && (
        <button
          className={`${styles.multiModalToggle} ${multiModalActive ? styles.active : ''}`}
          onClick={() => onMultiModalToggle?.(!multiModalActive)}
          aria-pressed={multiModalActive}
          aria-label={multiModalActive ? "Disable multi-modal coordination" : "Enable multi-modal coordination"}
        >
          <span className={styles.toggleIcon}>🔄</span>
          Multi-Modal
        </button>
      )}
      {children}
    </div>
  );
};

// Footer compound component
interface CameraEnabledChatLayoutFooterProps {
  children?: ReactNode;
  showPerformanceMetrics?: boolean;
  performanceMetrics?: any;
}

const CameraEnabledChatLayoutFooter: React.FC<CameraEnabledChatLayoutFooterProps> = ({
  children,
  showPerformanceMetrics = false,
  performanceMetrics
}) => {
  return (
    <footer className={styles.templateFooter} role="contentinfo">
      {showPerformanceMetrics && performanceMetrics && (
        <div className={styles.performanceDisplay} aria-label="Performance metrics">
          <span>Render: {performanceMetrics.templateRenderTime}ms</span>
          <span>Sync: {performanceMetrics.stateSyncTime}ms</span>
          <span>A11y: {performanceMetrics.accessibilityUpdateTime}ms</span>
        </div>
      )}
      {children}
    </footer>
  );
};

// Main template component with compound pattern
const CameraEnabledChatLayoutComponent = forwardRef<CameraEnabledChatLayoutRef, CameraEnabledChatLayoutProps>(
  ({ 
    className = '', 
    defaultPanel = 'split',
    enableVoice = true,
    enableFileUpload = true,
    enableVideoCapture = true,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    onPanelChange,
    onChatMessage,
    onCameraCapture,
    onPerformanceMetric,
    children
  }, ref) => {
    
    // Performance tracking for <500ms template render SLA
    const renderStartTime = useRef<number>(Date.now());
    const mountTime = useRef<number>(Date.now());
    
    // Template state following Enhanced Design Mode architecture
    const [state, setState] = useState<CameraEnabledChatLayoutState>({
      currentPanel: defaultPanel,
      chatVisible: defaultPanel === 'chat' || defaultPanel === 'split',
      cameraVisible: defaultPanel === 'camera' || defaultPanel === 'split',
      isMultiModalActive: false,
      layoutMode: 'desktop',
      performanceMetrics: {
        templateRenderTime: 0,
        stateSyncTime: 0,
        accessibilityUpdateTime: 0,
        totalResponseTime: 0
      },
      accessibilityContext: {
        currentFocus: '',
        announcementQueue: [],
        navigationHistory: []
      }
    });
    
    // Refs for component coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const chatPanelRef = useRef<HTMLDivElement>(null);
    const cameraPanelRef = useRef<HTMLDivElement>(null);
    const orchestratorRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Chat store integration (Zustand)
    const chatState = usePersistStore(useChatStore, (state) => state);
    
    // Responsive layout detection
    const detectLayoutMode = useCallback(() => {
      if (!containerRef.current) return 'desktop';
      
      const width = containerRef.current.clientWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }, []);
    
    // Template-level accessibility announcements
    const announceLayoutChange = useCallback((message: string) => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute('aria-live', 'assertive');
        announcementRef.current.textContent = message;
        
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
    }, []);
    
    // Panel switching with performance tracking
    const switchToPanel = useCallback((panel: 'chat' | 'camera' | 'split') => {
      const switchStart = Date.now();
      
      setState(prev => ({
        ...prev,
        currentPanel: panel,
        chatVisible: panel === 'chat' || panel === 'split',
        cameraVisible: panel === 'camera' || panel === 'split',
        accessibilityContext: {
          ...prev.accessibilityContext,
          navigationHistory: [...prev.accessibilityContext.navigationHistory, panel]
        }
      }));
      
      onPanelChange?.(panel);
      
      // Accessibility announcement
      const panelNames = {
        chat: 'chat only',
        camera: 'camera only', 
        split: 'split view with chat and camera'
      };
      announceLayoutChange(`Switched to ${panelNames[panel]} layout`);
      
      // Performance tracking
      const switchTime = Date.now() - switchStart;
      onPerformanceMetric?.('panel_switch_time', switchTime);
    }, [onPanelChange, announceLayoutChange, onPerformanceMetric]);
    
    // Focus management
    const focusChat = useCallback(() => {
      if (chatPanelRef.current) {
        const chatInput = chatPanelRef.current.querySelector('textarea, input');
        if (chatInput && 'focus' in chatInput) {
          (chatInput as HTMLElement).focus();
        }
      }
    }, []);
    
    const focusCamera = useCallback(() => {
      if (cameraPanelRef.current) {
        const cameraButton = cameraPanelRef.current.querySelector('button');
        if (cameraButton) {
          cameraButton.focus();
        }
      }
    }, []);
    
    // Multi-modal coordination
    const startMultiModalSession = useCallback(() => {
      setState(prev => ({ ...prev, isMultiModalActive: true }));
      announceLayoutChange('Multi-modal coordination activated');
      orchestratorRef.current?.startCoordination?.();
    }, [announceLayoutChange]);
    
    const endMultiModalSession = useCallback(() => {
      setState(prev => ({ ...prev, isMultiModalActive: false }));
      announceLayoutChange('Multi-modal coordination deactivated');
      orchestratorRef.current?.stopCoordination?.();
    }, [announceLayoutChange]);
    
    const syncModalityStates = useCallback(() => {
      const syncStart = Date.now();
      
      // Synchronize states between chat and camera
      if (orchestratorRef.current) {
        orchestratorRef.current.syncStates();
      }
      
      const syncTime = Date.now() - syncStart;
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          stateSyncTime: syncTime
        }
      }));
      
      onPerformanceMetric?.('state_sync_time', syncTime);
    }, [onPerformanceMetric]);
    
    // Template accessibility audit
    const auditTemplateAccessibility = useCallback(async (): Promise<any[]> => {
      const violations: any[] = [];
      
      if (!containerRef.current) return violations;
      
      // Check template-level accessibility requirements
      const container = containerRef.current;
      
      // 1. Verify compound component structure
      const requiredSections = container.querySelectorAll('[role="region"], [role="banner"], [role="contentinfo"]');
      if (requiredSections.length < 2) {
        violations.push({
          rule: 'template_structure',
          severity: 'high',
          message: 'Template missing required ARIA landmarks'
        });
      }
      
      // 2. Check panel navigation
      const panelButtons = container.querySelectorAll('[aria-pressed]');
      if (panelButtons.length === 0) {
        violations.push({
          rule: 'panel_navigation',
          severity: 'medium',
          message: 'Panel navigation buttons missing accessibility attributes'
        });
      }
      
      // 3. Validate focus management
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) {
        violations.push({
          rule: 'focus_management',
          severity: 'critical',
          message: 'No focusable elements in template'
        });
      }
      
      return violations;
    }, []);
    
    // Performance SLA validation (<500ms template render)
    const validatePerformanceSLA = useCallback((): boolean => {
      return state.performanceMetrics.templateRenderTime <= 500;
    }, [state.performanceMetrics.templateRenderTime]);
    
    // Template metrics getter
    const getTemplateMetrics = useCallback(() => {
      return { ...state.performanceMetrics };
    }, [state.performanceMetrics]);
    
    // Layout responsiveness
    useEffect(() => {
      const handleResize = () => {
        const newMode = detectLayoutMode();
        setState(prev => ({ ...prev, layoutMode: newMode }));
      };
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial detection
      
      return () => window.removeEventListener('resize', handleResize);
    }, [detectLayoutMode]);
    
    // Performance monitoring
    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      const totalTime = Date.now() - mountTime.current;
      
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          templateRenderTime: renderTime,
          totalResponseTime: totalTime
        }
      }));
      
      onPerformanceMetric?.('template_render_time', renderTime);
      onPerformanceMetric?.('total_response_time', totalTime);
      
      // SLA validation
      if (enforceSLA && renderTime > 500) {
        console.warn(`[CameraEnabledChatLayout] Template render SLA violation: ${renderTime}ms > 500ms`);
      }
    }, [onPerformanceMetric, enforceSLA]);
    
    // Expose template API
    useImperativeHandle(ref, () => ({
      switchToPanel,
      focusChat,
      focusCamera,
      startMultiModalSession,
      endMultiModalSession,
      syncModalityStates,
      getTemplateMetrics,
      validatePerformanceSLA,
      announceLayoutChange,
      auditTemplateAccessibility
    }));
    
    // Event handlers
    const handleChatMessage = useCallback((message: string) => {
      onChatMessage?.(message);
      if (state.isMultiModalActive) {
        syncModalityStates();
      }
    }, [onChatMessage, state.isMultiModalActive, syncModalityStates]);
    
    const handleCameraCapture = useCallback((imageData: string) => {
      onCameraCapture?.(imageData);
      if (state.isMultiModalActive) {
        syncModalityStates();
      }
    }, [onCameraCapture, state.isMultiModalActive, syncModalityStates]);
    
    const handleMultiModalToggle = useCallback((active: boolean) => {
      if (active) {
        startMultiModalSession();
      } else {
        endMultiModalSession();
      }
    }, [startMultiModalSession, endMultiModalSession]);
    
    // Keyboard navigation for template
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Template-level keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case '1':
              event.preventDefault();
              switchToPanel('chat');
              break;
            case '2':
              event.preventDefault();
              switchToPanel('camera');
              break;
            case '3':
              event.preventDefault();
              switchToPanel('split');
              break;
            case 'm':
              event.preventDefault();
              handleMultiModalToggle(!state.isMultiModalActive);
              break;
          }
        }
      };
      
      if (containerRef.current) {
        containerRef.current.addEventListener('keydown', handleKeyDown);
        return () => {
          containerRef.current?.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [switchToPanel, handleMultiModalToggle, state.isMultiModalActive]);
    
    return (
      <div 
        className={`${styles.templateContainer} ${styles[state.layoutMode]} ${className}`}
        ref={containerRef}
        role="main"
        aria-label="Camera-enabled chat interface"
      >
        {/* Accessibility announcements */}
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
        />
        
        {/* Multi-modal orchestration (hidden but active) */}
        {state.isMultiModalActive && (
          <MultiModalOrchestrator
            ref={orchestratorRef}
            className={styles.hiddenOrchestrator}
          />
        )}
        
        {/* Accessibility fusion layer */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          className={styles.hiddenFusion}
        />
        
        {children}
      </div>
    );
  }
);

// Attach compound components to main component
const CameraEnabledChatLayout = CameraEnabledChatLayoutComponent as typeof CameraEnabledChatLayoutComponent & CameraEnabledChatLayoutComponents;

CameraEnabledChatLayout.Header = CameraEnabledChatLayoutHeader;
CameraEnabledChatLayout.ChatPanel = CameraEnabledChatLayoutChatPanel;
CameraEnabledChatLayout.CameraPanel = CameraEnabledChatLayoutCameraPanel;
CameraEnabledChatLayout.Controls = CameraEnabledChatLayoutControls;
CameraEnabledChatLayout.Footer = CameraEnabledChatLayoutFooter;

CameraEnabledChatLayout.displayName = 'CameraEnabledChatLayout';

export { CameraEnabledChatLayout };
export type { 
  CameraEnabledChatLayoutProps, 
  CameraEnabledChatLayoutRef,
  CameraEnabledChatLayoutHeaderProps,
  CameraEnabledChatLayoutChatPanelProps,
  CameraEnabledChatLayoutCameraPanelProps,
  CameraEnabledChatLayoutControlsProps,
  CameraEnabledChatLayoutFooterProps
};
