import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  AdvancedChatInterface,
  ResponsiveAppLayout,
  VisualSearchDashboard,
  MultiModalControlCenter,
  UserDashboard,
  SettingsConsole,
  CameraWorkspace,
  ErrorRecoveryInterface,
} from '../../../components/organisms';
import { useVoiceAgent } from '../../../store/voice-agent';
import { usePerformanceMonitor } from '../../../performance/performance-monitor';
import { useAccessibility } from '../../../store/accessibility';
import styles from './page.module.css';

interface IntegratedVoiceAgentProps {
  initialMode?: 'chat' | 'search' | 'control' | 'user' | 'settings' | 'camera';
  professionalMode?: boolean;
  debugMode?: boolean;
}

type OrganismView = 'chat' | 'search' | 'control' | 'user' | 'settings' | 'camera' | 'dashboard';
type SystemState = 'initializing' | 'ready' | 'error' | 'recovery' | 'maintenance';

export default function IntegratedVoiceAgent({
  initialMode = 'chat',
  professionalMode = false,
  debugMode = false,
}: IntegratedVoiceAgentProps) {
  // Main application state
  const [systemState, setSystemState] = useState<SystemState>('initializing');
  const [currentView, setCurrentView] = useState<OrganismView>(initialMode);
  const [previousView, setPreviousView] = useState<OrganismView | null>(null);
  const [hasSystemError, setHasSystemError] = useState(false);

  // Inter-organism communication state
  const [coordinationState, setCoordinationState] = useState({
    activeModalities: {
      voice: false,
      camera: false,
      search: false,
      text: true,
    },
    crossModalData: {
      lastVoiceInput: null,
      lastImageCapture: null,
      lastSearchResults: null,
      conversationContext: null,
    },
    performanceMetrics: {
      latency: 0,
      throughput: 0,
      errorRate: 0,
    },
  });

  // Organism coordination refs
  const coordinationHub = useRef<{
    chat?: any;
    search?: any;
    control?: any;
    camera?: any;
    user?: any;
    settings?: any;
  }>({});

  // Performance monitoring
  const performanceMonitor = usePerformanceMonitor({
    enabled: true,
    targetLatency: 100, // <100ms requirement
    targetThroughput: 30, // 30fps requirement
    monitorInterval: 1000,
  });

  // Accessibility management
  const accessibilityState = useAccessibility();

  // Voice agent store integration
  const voiceAgentState = useVoiceAgent();

  // System initialization
  useEffect(() => {
    initializeIntegratedSystem();
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (performanceMonitor.isActive) {
      const metrics = performanceMonitor.getMetrics();
      setCoordinationState(prev => ({
        ...prev,
        performanceMetrics: metrics,
      }));
    }
  }, [performanceMonitor.isActive]);

  // Initialize the integrated system
  const initializeIntegratedSystem = useCallback(async () => {
    try {
      performanceMonitor.startTransaction('system-initialization');
      
      // Initialize coordination hub
      coordinationHub.current = {};
      
      // Initialize cross-modal communication
      await initializeCrossModalCommunication();
      
      // Initialize performance monitoring
      await initializePerformanceMonitoring();
      
      // Initialize accessibility framework
      await initializeAccessibilityFramework();
      
      // System ready
      setSystemState('ready');
      performanceMonitor.endTransaction('system-initialization');
      
      announceSystemReady();
    } catch (error) {
      console.error('System initialization failed:', error);
      setSystemState('error');
      setHasSystemError(true);
    }
  }, []);

  // Cross-modal communication initialization
  const initializeCrossModalCommunication = useCallback(async () => {
    // Set up inter-organism communication patterns (from creative phase)
    const communicationPatterns = {
      // Chat → Camera: Voice triggers visual search
      chatToCamera: (voiceInput: any) => {
        if (coordinationHub.current.camera) {
          coordinationHub.current.camera.triggerCapture?.({
            source: 'voice',
            context: voiceInput,
            mode: 'visual-search',
          });
        }
      },
      
      // Camera → Search: Image triggers search
      cameraToSearch: (imageData: any) => {
        if (coordinationHub.current.search) {
          coordinationHub.current.search.performVisualSearch?.({
            image: imageData,
            source: 'camera',
            mode: 'automatic',
          });
        }
      },
      
      // Search → Chat: Results enhance conversation
      searchToChat: (searchResults: any) => {
        if (coordinationHub.current.chat) {
          coordinationHub.current.chat.enhanceContext?.({
            results: searchResults,
            source: 'visual-search',
            confidence: searchResults.confidence,
          });
        }
      },
      
      // Control → All: Professional overrides
      controlToAll: (overrideCommand: any) => {
        Object.values(coordinationHub.current).forEach(organism => {
          if (organism?.handleProfessionalOverride) {
            organism.handleProfessionalOverride(overrideCommand);
          }
        });
      },
    };

    // Store communication patterns globally
    window.voiceAgentCommunication = communicationPatterns;
  }, []);

  // Performance monitoring initialization
  const initializePerformanceMonitoring = useCallback(async () => {
    performanceMonitor.addMetric('organism-coordination', {
      target: 100, // <100ms coordination latency
      critical: true,
    });
    
    performanceMonitor.addMetric('cross-modal-latency', {
      target: 50, // <50ms cross-modal communication
      critical: true,
    });
    
    performanceMonitor.addMetric('ui-responsiveness', {
      target: 16.67, // 60fps UI updates
      critical: false,
    });
  }, []);

  // Accessibility framework initialization
  const initializeAccessibilityFramework = useCallback(async () => {
    // Initialize central accessibility coordination
    accessibilityState.initializeAccessibilityCoordination({
      organisms: ['chat', 'search', 'control', 'camera', 'user', 'settings'],
      wcagLevel: 'AAA',
      screenReaderSupport: true,
      highContrastMode: false,
      reducedMotion: false,
    });
  }, [accessibilityState]);

  // Organism view navigation
  const navigateToView = useCallback((view: OrganismView, context?: any) => {
    performanceMonitor.startTransaction(`navigate-to-${view}`);
    
    setPreviousView(currentView);
    setCurrentView(view);
    
    // Update voice agent state
    voiceAgentState.setActiveMode(view);
    
    // Handle view-specific initialization
    handleViewTransition(view, context);
    
    performanceMonitor.endTransaction(`navigate-to-${view}`);
    
    // Accessibility announcement
    accessibilityState.announceNavigation(`Navigated to ${view} view`);
  }, [currentView, voiceAgentState, accessibilityState]);

  // Handle view transitions
  const handleViewTransition = useCallback((view: OrganismView, context?: any) => {
    switch (view) {
      case 'camera':
        // Prepare camera workspace
        setCoordinationState(prev => ({
          ...prev,
          activeModalities: { ...prev.activeModalities, camera: true },
        }));
        break;
      
      case 'search':
        // Prepare visual search
        setCoordinationState(prev => ({
          ...prev,
          activeModalities: { ...prev.activeModalities, search: true },
        }));
        break;
      
      case 'chat':
        // Prepare chat interface
        setCoordinationState(prev => ({
          ...prev,
          activeModalities: { ...prev.activeModalities, voice: true },
        }));
        break;
      
      case 'control':
        // Professional control center
        if (professionalMode) {
          setCoordinationState(prev => ({
            ...prev,
            activeModalities: {
              voice: true,
              camera: true,
              search: true,
              text: true,
            },
          }));
        }
        break;
    }
  }, [professionalMode]);

  // Cross-modal communication handlers
  const handleVoiceInput = useCallback((voiceData: any) => {
    setCoordinationState(prev => ({
      ...prev,
      crossModalData: {
        ...prev.crossModalData,
        lastVoiceInput: voiceData,
        conversationContext: voiceData.context,
      },
    }));

    // Trigger cross-modal actions based on voice input
    if (voiceData.intent === 'visual-search') {
      navigateToView('camera', { source: 'voice', query: voiceData.text });
    }
  }, [navigateToView]);

  const handleImageCapture = useCallback((imageData: any) => {
    setCoordinationState(prev => ({
      ...prev,
      crossModalData: {
        ...prev.crossModalData,
        lastImageCapture: imageData,
      },
    }));

    // Trigger visual search automatically
    if (window.voiceAgentCommunication?.cameraToSearch) {
      window.voiceAgentCommunication.cameraToSearch(imageData);
    }
  }, []);

  const handleSearchResults = useCallback((searchResults: any) => {
    setCoordinationState(prev => ({
      ...prev,
      crossModalData: {
        ...prev.crossModalData,
        lastSearchResults: searchResults,
      },
    }));

    // Enhance chat context with search results
    if (window.voiceAgentCommunication?.searchToChat) {
      window.voiceAgentCommunication.searchToChat(searchResults);
    }
  }, []);

  // Professional control handlers
  const handleProfessionalOverride = useCallback((override: any) => {
    if (professionalMode && window.voiceAgentCommunication?.controlToAll) {
      window.voiceAgentCommunication.controlToAll(override);
    }
  }, [professionalMode]);

  // Error handling
  const handleSystemError = useCallback((error: Error, errorInfo?: any) => {
    console.error('System error:', error, errorInfo);
    setHasSystemError(true);
    setSystemState('error');
    
    // Performance monitoring
    performanceMonitor.recordError('system-error', {
      error: error.message,
      component: errorInfo?.componentStack || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleErrorRecovery = useCallback((recoveryMethod: string) => {
    setSystemState('recovery');
    
    switch (recoveryMethod) {
      case 'retry':
        // Retry last operation
        initializeIntegratedSystem();
        break;
      
      case 'reset':
        // Reset to initial state
        setCurrentView('chat');
        setCoordinationState({
          activeModalities: { voice: false, camera: false, search: false, text: true },
          crossModalData: { lastVoiceInput: null, lastImageCapture: null, lastSearchResults: null, conversationContext: null },
          performanceMetrics: { latency: 0, throughput: 0, errorRate: 0 },
        });
        setHasSystemError(false);
        setSystemState('ready');
        break;
      
      case 'revert':
        // Revert to previous view
        if (previousView) {
          navigateToView(previousView);
        }
        setHasSystemError(false);
        setSystemState('ready');
        break;
    }
  }, [previousView, navigateToView]);

  // System announcements
  const announceSystemReady = useCallback(() => {
    accessibilityState.announceSystem('Multi-modal voice agent system ready');
  }, [accessibilityState]);

  // Render organism based on current view
  const renderCurrentOrganism = () => {
    const commonProps = {
      professionalMode,
      debugMode,
      coordinationState,
      performanceMetrics: coordinationState.performanceMetrics,
      onCoordinationUpdate: setCoordinationState,
    };

    switch (currentView) {
      case 'chat':
        return (
          <AdvancedChatInterface
            {...commonProps}
            isActive={coordinationState.activeModalities.voice}
            onVoiceInput={handleVoiceInput}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.chat = ref; }}
          />
        );
      
      case 'search':
        return (
          <VisualSearchDashboard
            {...commonProps}
            isActive={coordinationState.activeModalities.search}
            lastImageCapture={coordinationState.crossModalData.lastImageCapture}
            onSearchResults={handleSearchResults}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.search = ref; }}
          />
        );
      
      case 'control':
        return (
          <MultiModalControlCenter
            {...commonProps}
            allModalitiesActive={Object.values(coordinationState.activeModalities).every(Boolean)}
            onProfessionalOverride={handleProfessionalOverride}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.control = ref; }}
          />
        );
      
      case 'camera':
        return (
          <CameraWorkspace
            {...commonProps}
            isActive={coordinationState.activeModalities.camera}
            onImageCapture={handleImageCapture}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.camera = ref; }}
          />
        );
      
      case 'user':
        return (
          <UserDashboard
            {...commonProps}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.user = ref; }}
          />
        );
      
      case 'settings':
        return (
          <SettingsConsole
            {...commonProps}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.settings = ref; }}
          />
        );
      
      default:
        return (
          <AdvancedChatInterface
            {...commonProps}
            onVoiceInput={handleVoiceInput}
            onNavigate={navigateToView}
            ref={(ref) => { coordinationHub.current.chat = ref; }}
          />
        );
    }
  };

  // Error boundary fallback
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <ErrorRecoveryInterface
      hasError={true}
      errorMessage={error.message}
      errorType="system"
      errorSeverity="high"
      professionalMode={professionalMode}
      debugMode={debugMode}
      onRecoveryAttempt={handleErrorRecovery}
      onRetry={resetErrorBoundary}
      onReset={() => {
        resetErrorBoundary();
        handleErrorRecovery('reset');
      }}
      onRevert={() => {
        resetErrorBoundary();
        handleErrorRecovery('revert');
      }}
    />
  );

  if (systemState === 'initializing') {
    return (
      <div className={styles.initializingScreen}>
        <div className={styles.initializingContent}>
          <div className={styles.logo}>🎤</div>
          <h1>Contoso Voice Agent</h1>
          <p>Initializing multi-modal system...</p>
          <div className={styles.loadingIndicator} />
        </div>
      </div>
    );
  }

  if (hasSystemError) {
    return (
      <ErrorRecoveryInterface
        hasError={true}
        errorMessage="System error detected"
        errorType="system"
        errorSeverity="high"
        professionalMode={professionalMode}
        debugMode={debugMode}
        onRecoveryAttempt={handleErrorRecovery}
        onRetry={() => handleErrorRecovery('retry')}
        onReset={() => handleErrorRecovery('reset')}
        onRevert={() => handleErrorRecovery('revert')}
      />
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleSystemError}
      onReset={() => setHasSystemError(false)}
    >
      <div className={styles.integratedVoiceAgent}>
        <ResponsiveAppLayout
          currentView={currentView}
          systemState={systemState}
          coordinationState={coordinationState}
          professionalMode={professionalMode}
          debugMode={debugMode}
          onNavigate={navigateToView}
          performanceMetrics={coordinationState.performanceMetrics}
        >
          {renderCurrentOrganism()}
        </ResponsiveAppLayout>
        
        {/* Performance monitoring overlay */}
        {debugMode && (
          <div className={styles.performanceOverlay}>
            <div className={styles.performanceMetrics}>
              <div>Latency: {coordinationState.performanceMetrics.latency}ms</div>
              <div>Throughput: {coordinationState.performanceMetrics.throughput}fps</div>
              <div>Error Rate: {coordinationState.performanceMetrics.errorRate}%</div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
} 