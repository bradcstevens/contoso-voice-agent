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
import { CameraErrorHandler, CameraError, CameraErrorType } from './cameraerrorhandler';
import { MultiModalOrchestrator } from './multimodalorchestrator';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './multimodalerrorlayout.module.css';

// Multi-modal error system interfaces
interface SystemError {
  id: string;
  type: ModalityErrorType;
  modality: 'camera' | 'voice' | 'text' | 'visual_search' | 'network' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  code?: string;
  recoverable: boolean;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  context: Record<string, any>;
  relatedErrors: string[]; // IDs of related errors
  userImpact: 'none' | 'minor' | 'major' | 'blocking';
  recoveryActions: RecoveryActionType[];
}

type ModalityErrorType =
  // Camera errors
  | 'camera_permission_denied'
  | 'camera_device_not_found'
  | 'camera_device_in_use'
  | 'camera_hardware_error'
  // Voice errors  
  | 'voice_permission_denied'
  | 'voice_not_supported'
  | 'voice_connection_failed'
  | 'voice_processing_error'
  // Text/Chat errors
  | 'chat_connection_failed'
  | 'chat_rate_limited'
  | 'chat_service_unavailable'
  // Visual search errors
  | 'visual_search_failed'
  | 'visual_search_timeout'
  | 'visual_search_invalid_image'
  // Network errors
  | 'network_offline'
  | 'network_timeout'
  | 'network_server_error'
  | 'network_rate_limited'
  // System errors
  | 'browser_unsupported'
  | 'memory_limit_exceeded'
  | 'performance_degraded'
  | 'security_violation'
  | 'unknown_system_error';

type RecoveryActionType = 
  | 'retry' 
  | 'fallback_modality' 
  | 'reduced_functionality' 
  | 'manual_intervention'
  | 'system_restart'
  | 'contact_support'
  | 'settings_adjustment'
  | 'refresh_page'
  | 'clear_cache'
  | 'download_offline';

interface ErrorCascade {
  cascadeId: string;
  triggerError: string; // Error ID that triggered the cascade
  affectedModalities: string[];
  cascadeLevel: number; // How many errors deep in the cascade
  mitigationStrategy: 'isolate' | 'failover' | 'graceful_degradation' | 'full_restart';
  isContained: boolean;
}

interface GracefulDegradation {
  degradationLevel: 'none' | 'partial' | 'minimal' | 'text_only';
  availableModalities: string[];
  disabledFeatures: string[];
  alternativeWorkflows: Array<{
    originalFeature: string;
    alternativeApproach: string;
    userGuidance: string;
  }>;
  userNotifications: string[];
}

interface RecoveryPlan {
  planId: string;
  errors: string[]; // Error IDs this plan addresses
  strategy: 'parallel_recovery' | 'sequential_recovery' | 'failover_chain' | 'manual_override';
  steps: Array<{
    stepId: string;
    action: RecoveryActionType;
    targetModality?: string;
    expectedDuration: number;
    isAutomated: boolean;
    successCriteria: string;
    fallbackAction?: RecoveryActionType;
  }>;
  estimatedRecoveryTime: number;
  successProbability: number;
  userConfirmationRequired: boolean;
}

interface MultiModalErrorLayoutState {
  activeErrors: Map<string, SystemError>;
  errorHistory: SystemError[];
  errorCascades: ErrorCascade[];
  gracefulDegradation: GracefulDegradation;
  activeRecoveryPlans: Map<string, RecoveryPlan>;
  systemHealth: {
    overallStatus: 'healthy' | 'degraded' | 'critical' | 'offline';
    modalityStatus: Record<string, 'operational' | 'degraded' | 'failed'>;
    lastHealthCheck: number;
    performanceMetrics: {
      errorRate: number;
      recoverySuccessRate: number;
      averageRecoveryTime: number;
      slaCompliance: boolean;
    };
  };
  userInteractionRequired: {
    hasRequiredActions: boolean;
    pendingConfirmations: string[];
    urgentActions: string[];
    guidanceMessages: string[];
  };
  accessibilityContext: {
    currentFocus: string;
    announcementQueue: string[];
    errorSummary: string;
    recoveryInstructions: string;
    alternativeAccess: string[];
  };
}

interface MultiModalErrorLayoutProps {
  className?: string;
  errors?: SystemError[];
  enableAutomaticRecovery?: boolean;
  enableGracefulDegradation?: boolean;
  maxConcurrentErrors?: number;
  recoveryTimeoutMs?: number;
  enforceSLA?: boolean; // <500ms template render requirement
  accessibilityLevel?: 'AA' | 'AAA';
  onErrorResolved?: (error: SystemError) => void;
  onRecoveryPlanExecuted?: (plan: RecoveryPlan) => void;
  onDegradationActivated?: (degradation: GracefulDegradation) => void;
  onUserActionRequired?: (actions: string[]) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  children?: ReactNode;
}

export interface MultiModalErrorLayoutRef {
  // Error management
  reportError: (error: Omit<SystemError, 'id' | 'timestamp' | 'retryCount'>) => string;
  resolveError: (errorId: string) => Promise<void>;
  clearAllErrors: () => void;
  
  // Recovery coordination
  executeRecoveryPlan: (planId: string) => Promise<boolean>;
  createCustomRecoveryPlan: (errors: string[], strategy: string) => string;
  getAvailableRecoveryActions: (errorId: string) => RecoveryActionType[];
  
  // System management
  activateGracefulDegradation: (level: string) => void;
  restoreFullFunctionality: () => Promise<boolean>;
  getSystemHealth: () => any;
  
  // Template controls
  focusErrorPanel: () => void;
  focusRecoveryActions: () => void;
  announceSystemStatus: (message: string) => void;
  
  // Performance monitoring
  getErrorMetrics: () => any;
  validatePerformanceSLA: () => boolean;
  
  // Accessibility
  auditErrorAccessibility: () => Promise<any[]>;
}

// Compound component structure for multi-modal error layout
interface MultiModalErrorLayoutComponents {
  Header: React.FC<MultiModalErrorLayoutHeaderProps>;
  ErrorPanel: React.FC<MultiModalErrorLayoutErrorPanelProps>;
  RecoveryPanel: React.FC<MultiModalErrorLayoutRecoveryPanelProps>;
  DegradationPanel: React.FC<MultiModalErrorLayoutDegradationPanelProps>;
  Controls: React.FC<MultiModalErrorLayoutControlsProps>;
  Footer: React.FC<MultiModalErrorLayoutFooterProps>;
}

// Header compound component
interface MultiModalErrorLayoutHeaderProps {
  children?: ReactNode;
  systemHealth?: any;
  showSystemStatus?: boolean;
  showErrorCount?: boolean;
  onSystemRestart?: () => void;
  onContactSupport?: () => void;
}

const MultiModalErrorLayoutHeader: React.FC<MultiModalErrorLayoutHeaderProps> = ({
  children,
  systemHealth,
  showSystemStatus = true,
  showErrorCount = true,
  onSystemRestart,
  onContactSupport
}) => {
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '🚨';
      case 'offline': return '🔴';
      default: return '❓';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'healthy': return styles.statusHealthy;
      case 'degraded': return styles.statusDegraded;
      case 'critical': return styles.statusCritical;
      case 'offline': return styles.statusOffline;
      default: return styles.statusUnknown;
    }
  }, []);

  return (
    <header className={styles.templateHeader} role="banner">
      <div className={styles.headerContent}>
        <div className={styles.systemStatus}>
          <h1 className={styles.headerTitle}>System Status</h1>
          
          {showSystemStatus && systemHealth && (
            <div className={`${styles.statusIndicator} ${getStatusColor(systemHealth.overallStatus)}`}>
              <span className={styles.statusIcon} aria-hidden="true">
                {getStatusIcon(systemHealth.overallStatus)}
              </span>
              <span className={styles.statusText}>
                {systemHealth.overallStatus.charAt(0).toUpperCase() + systemHealth.overallStatus.slice(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.systemActions}>
          {onSystemRestart && (
            <button 
              className={styles.actionButton}
              onClick={onSystemRestart}
              aria-label="Restart system to resolve issues"
            >
              🔄 Restart System
            </button>
          )}
          
          {onContactSupport && (
            <button 
              className={styles.actionButton}
              onClick={onContactSupport}
              aria-label="Contact support for assistance"
            >
              📞 Contact Support
            </button>
          )}
        </div>
        
        {children}
      </div>
    </header>
  );
};

// Error Panel compound component
interface MultiModalErrorLayoutErrorPanelProps {
  children?: ReactNode;
  errors?: SystemError[];
  showErrorDetails?: boolean;
  groupByModality?: boolean;
  onErrorSelect?: (error: SystemError) => void;
  onErrorDismiss?: (errorId: string) => void;
}

const MultiModalErrorLayoutErrorPanel: React.FC<MultiModalErrorLayoutErrorPanelProps> = ({
  children,
  errors = [],
  showErrorDetails = true,
  groupByModality = true,
  onErrorSelect,
  onErrorDismiss
}) => {
  const errorsByModality = useMemo(() => {
    if (!groupByModality) return { all: errors };
    
    return errors.reduce((grouped, error) => {
      const modality = error.modality;
      if (!grouped[modality]) grouped[modality] = [];
      grouped[modality].push(error);
      return grouped;
    }, {} as Record<string, SystemError[]>);
  }, [errors, groupByModality]);

  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity) {
      case 'low': return '🔵';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  }, []);

  const getModalityIcon = useCallback((modality: string) => {
    switch (modality) {
      case 'camera': return '📷';
      case 'voice': return '🎤';
      case 'text': return '💬';
      case 'visual_search': return '🔍';
      case 'network': return '🌐';
      case 'system': return '⚙️';
      default: return '❓';
    }
  }, []);

  const renderError = useCallback((error: SystemError) => (
    <div 
      key={error.id}
      className={`${styles.errorCard} ${styles[error.severity]}`}
      role="alert"
      aria-labelledby={`error-title-${error.id}`}
      aria-describedby={`error-desc-${error.id}`}
    >
      <div className={styles.errorHeader}>
        <div className={styles.errorIcons}>
          <span className={styles.modalityIcon} aria-hidden="true">
            {getModalityIcon(error.modality)}
          </span>
          <span className={styles.severityIcon} aria-hidden="true">
            {getSeverityIcon(error.severity)}
          </span>
        </div>
        
        <div className={styles.errorContent}>
          <h3 id={`error-title-${error.id}`} className={styles.errorTitle}>
            {error.modality.charAt(0).toUpperCase() + error.modality.slice(1)} Error
          </h3>
          <p id={`error-desc-${error.id}`} className={styles.errorMessage}>
            {error.message}
          </p>
        </div>
        
        <div className={styles.errorActions}>
          {onErrorSelect && (
            <button 
              className={styles.selectButton}
              onClick={() => onErrorSelect(error)}
              aria-label={`View details for ${error.modality} error`}
            >
              Details
            </button>
          )}
          
          {onErrorDismiss && error.severity !== 'critical' && (
            <button 
              className={styles.dismissButton}
              onClick={() => onErrorDismiss(error.id)}
              aria-label={`Dismiss ${error.modality} error`}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {showErrorDetails && (
        <div className={styles.errorDetails}>
          <div className={styles.errorMeta}>
            <span>Type: {error.type}</span>
            {error.code && <span>Code: {error.code}</span>}
            <span>Time: {error.timestamp.toLocaleTimeString()}</span>
            {error.retryCount > 0 && (
              <span>Retries: {error.retryCount}/{error.maxRetries}</span>
            )}
          </div>
          
          <div className={styles.errorImpact}>
            <span className={`${styles.impactBadge} ${styles[error.userImpact]}`}>
              Impact: {error.userImpact}
            </span>
            <span className={styles.recoverableBadge}>
              {error.recoverable ? 'Recoverable' : 'Requires intervention'}
            </span>
          </div>
        </div>
      )}
    </div>
  ), [showErrorDetails, getSeverityIcon, getModalityIcon, onErrorSelect, onErrorDismiss]);

  return (
    <section 
      className={styles.errorPanel}
      role="region"
      aria-label="System errors"
    >
      <div className={styles.errorContainer}>
        {errors.length === 0 ? (
          <div className={styles.noErrors} role="status">
            <span className={styles.noErrorsIcon}>✅</span>
            <h3>No Active Errors</h3>
            <p>All systems are operating normally.</p>
          </div>
        ) : (
          <div className={styles.errorsList}>
            {Object.entries(errorsByModality).map(([modality, modalityErrors]) => (
              <div key={modality} className={styles.modalityGroup}>
                {groupByModality && modality !== 'all' && (
                  <h3 className={styles.modalityTitle}>
                    <span className={styles.modalityIcon}>
                      {getModalityIcon(modality)}
                    </span>
                    {modality.charAt(0).toUpperCase() + modality.slice(1)} Errors
                    <span className={styles.errorCount}>({modalityErrors.length})</span>
                  </h3>
                )}
                
                {modalityErrors.map(renderError)}
              </div>
            ))}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
};

// Recovery Panel compound component
interface MultiModalErrorLayoutRecoveryPanelProps {
  children?: ReactNode;
  recoveryPlans?: RecoveryPlan[];
  activeRecovery?: string | null;
  onExecuteRecovery?: (planId: string) => void;
  onCreateCustomPlan?: () => void;
}

const MultiModalErrorLayoutRecoveryPanel: React.FC<MultiModalErrorLayoutRecoveryPanelProps> = ({
  children,
  recoveryPlans = [],
  activeRecovery = null,
  onExecuteRecovery,
  onCreateCustomPlan
}) => {
  const getRecoveryIcon = useCallback((strategy: string) => {
    switch (strategy) {
      case 'parallel_recovery': return '⚡';
      case 'sequential_recovery': return '📋';
      case 'failover_chain': return '🔄';
      case 'manual_override': return '👤';
      default: return '🔧';
    }
  }, []);

  const renderRecoveryPlan = useCallback((plan: RecoveryPlan) => (
    <div 
      key={plan.planId}
      className={`${styles.recoveryPlan} ${activeRecovery === plan.planId ? styles.active : ''}`}
    >
      <div className={styles.planHeader}>
        <div className={styles.planInfo}>
          <h4 className={styles.planTitle}>
            <span className={styles.strategyIcon}>
              {getRecoveryIcon(plan.strategy)}
            </span>
            {plan.strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          <div className={styles.planStats}>
            <span>⏱️ {Math.round(plan.estimatedRecoveryTime / 1000)}s</span>
            <span>�� {Math.round(plan.successProbability * 100)}%</span>
            <span>📝 {plan.steps.length} steps</span>
          </div>
        </div>
        
        <div className={styles.planActions}>
          {onExecuteRecovery && (
            <button 
              className={styles.executeButton}
              onClick={() => onExecuteRecovery(plan.planId)}
              disabled={activeRecovery !== null}
              aria-label={`Execute ${plan.strategy} recovery plan`}
            >
              {activeRecovery === plan.planId ? 'Running...' : 'Execute'}
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.planSteps}>
        {plan.steps.map((step, index) => (
          <div key={step.stepId} className={styles.recoveryStep}>
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepContent}>
              <span className={styles.stepAction}>
                {step.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {step.targetModality && (
                <span className={styles.stepTarget}>→ {step.targetModality}</span>
              )}
              <span className={styles.stepDuration}>
                (~{Math.round(step.expectedDuration / 1000)}s)
              </span>
            </div>
            <div className={styles.stepType}>
              {step.isAutomated ? '🤖 Auto' : '👤 Manual'}
            </div>
          </div>
        ))}
      </div>
      
      {plan.userConfirmationRequired && (
        <div className={styles.confirmationRequired}>
          ⚠️ This plan requires user confirmation before execution
        </div>
      )}
    </div>
  ), [activeRecovery, getRecoveryIcon, onExecuteRecovery]);

  return (
    <section 
      className={styles.recoveryPanel}
      role="region"
      aria-label="Recovery options"
    >
      <div className={styles.recoveryContainer}>
        <div className={styles.recoveryHeader}>
          <h3>Recovery Plans</h3>
          {onCreateCustomPlan && (
            <button 
              className={styles.createPlanButton}
              onClick={onCreateCustomPlan}
              aria-label="Create custom recovery plan"
            >
              ➕ Custom Plan
            </button>
          )}
        </div>
        
        {recoveryPlans.length === 0 ? (
          <div className={styles.noRecoveryPlans}>
            <p>No recovery plans available. System may require manual intervention.</p>
          </div>
        ) : (
          <div className={styles.plansList}>
            {recoveryPlans.map(renderRecoveryPlan)}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
};

// Degradation Panel compound component
interface MultiModalErrorLayoutDegradationPanelProps {
  children?: ReactNode;
  degradation?: GracefulDegradation;
  onActivateDegradation?: (level: string) => void;
  onRestoreFullFunctionality?: () => void;
}

const MultiModalErrorLayoutDegradationPanel: React.FC<MultiModalErrorLayoutDegradationPanelProps> = ({
  children,
  degradation,
  onActivateDegradation,
  onRestoreFullFunctionality
}) => {
  const getDegradationColor = useCallback((level: string) => {
    switch (level) {
      case 'none': return styles.degradationNone;
      case 'partial': return styles.degradationPartial;
      case 'minimal': return styles.degradationMinimal;
      case 'text_only': return styles.degradationTextOnly;
      default: return styles.degradationUnknown;
    }
  }, []);

  if (!degradation || degradation.degradationLevel === 'none') {
    return null;
  }

  return (
    <section 
      className={styles.degradationPanel}
      role="region"
      aria-label="System degradation status"
    >
      <div className={styles.degradationContainer}>
        <div className={styles.degradationHeader}>
          <h3>Graceful Degradation Active</h3>
          <div className={`${styles.degradationLevel} ${getDegradationColor(degradation.degradationLevel)}`}>
            Level: {degradation.degradationLevel.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        
        <div className={styles.degradationStatus}>
          <div className={styles.availableModalities}>
            <h4>Available Features:</h4>
            <ul>
              {degradation.availableModalities.map(modality => (
                <li key={modality} className={styles.availableModality}>
                  ✅ {modality.charAt(0).toUpperCase() + modality.slice(1)}
                </li>
              ))}
            </ul>
          </div>
          
          {degradation.disabledFeatures.length > 0 && (
            <div className={styles.disabledFeatures}>
              <h4>Temporarily Disabled:</h4>
              <ul>
                {degradation.disabledFeatures.map(feature => (
                  <li key={feature} className={styles.disabledFeature}>
                    ❌ {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {degradation.alternativeWorkflows.length > 0 && (
          <div className={styles.alternativeWorkflows}>
            <h4>Alternative Workflows:</h4>
            {degradation.alternativeWorkflows.map((workflow, index) => (
              <div key={index} className={styles.workflow}>
                <div className={styles.workflowTitle}>
                  {workflow.originalFeature} → {workflow.alternativeApproach}
                </div>
                <div className={styles.workflowGuidance}>
                  {workflow.userGuidance}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className={styles.degradationActions}>
          {onRestoreFullFunctionality && (
            <button 
              className={styles.restoreButton}
              onClick={onRestoreFullFunctionality}
              aria-label="Attempt to restore full functionality"
            >
              🔄 Restore Full Functionality
            </button>
          )}
        </div>
        
        {children}
      </div>
    </section>
  );
};

// Controls compound component  
interface MultiModalErrorLayoutControlsProps {
  children?: ReactNode;
  onClearAllErrors?: () => void;
  onRefreshSystem?: () => void;
  onExportErrorLog?: () => void;
  hasActiveErrors?: boolean;
}

const MultiModalErrorLayoutControls: React.FC<MultiModalErrorLayoutControlsProps> = ({
  children,
  onClearAllErrors,
  onRefreshSystem,
  onExportErrorLog,
  hasActiveErrors = false
}) => {
  return (
    <div className={styles.templateControls} role="toolbar" aria-label="Error management controls">
      <div className={styles.controlsLeft}>
        {onClearAllErrors && hasActiveErrors && (
          <button 
            className={styles.controlButton}
            onClick={onClearAllErrors}
            aria-label="Clear all resolved errors"
          >
            🗑️ Clear Errors
          </button>
        )}
        
        {onRefreshSystem && (
          <button 
            className={styles.controlButton}
            onClick={onRefreshSystem}
            aria-label="Refresh system status"
          >
            🔄 Refresh
          </button>
        )}
      </div>
      
      <div className={styles.controlsRight}>
        {onExportErrorLog && (
          <button 
            className={styles.controlButton}
            onClick={onExportErrorLog}
            aria-label="Export error log for analysis"
          >
            📋 Export Log
          </button>
        )}
      </div>
      
      {children}
    </div>
  );
};

// Footer compound component
interface MultiModalErrorLayoutFooterProps {
  children?: ReactNode;
  systemHealth?: any;
  showPerformanceMetrics?: boolean;
  showLastUpdate?: boolean;
}

const MultiModalErrorLayoutFooter: React.FC<MultiModalErrorLayoutFooterProps> = ({
  children,
  systemHealth,
  showPerformanceMetrics = true,
  showLastUpdate = true
}) => {
  return (
    <footer className={styles.templateFooter} role="contentinfo">
      <div className={styles.footerContent}>
        {showPerformanceMetrics && systemHealth?.performanceMetrics && (
          <div className={styles.performanceMetrics}>
            <span>Error Rate: {(systemHealth.performanceMetrics.errorRate * 100).toFixed(1)}%</span>
            <span>Recovery Rate: {(systemHealth.performanceMetrics.recoverySuccessRate * 100).toFixed(1)}%</span>
            <span>Avg Recovery: {systemHealth.performanceMetrics.averageRecoveryTime}ms</span>
            <span className={systemHealth.performanceMetrics.slaCompliance ? styles.slaCompliant : styles.slaViolation}>
              SLA: {systemHealth.performanceMetrics.slaCompliance ? '✅' : '❌'}
            </span>
          </div>
        )}
        
        {showLastUpdate && systemHealth?.lastHealthCheck && (
          <div className={styles.lastUpdate}>
            Last updated: {new Date(systemHealth.lastHealthCheck).toLocaleTimeString()}
          </div>
        )}
        
        {children}
      </div>
    </footer>
  );
};

// Main template component with compound pattern
const MultiModalErrorLayoutComponent = forwardRef<MultiModalErrorLayoutRef, MultiModalErrorLayoutProps>(
  ({ 
    className = '', 
    errors = [],
    enableAutomaticRecovery = true,
    enableGracefulDegradation = true,
    maxConcurrentErrors = 10,
    recoveryTimeoutMs = 30000,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    onErrorResolved,
    onRecoveryPlanExecuted,
    onDegradationActivated,
    onUserActionRequired,
    onPerformanceMetric,
    children
  }, ref) => {
    
    // Performance tracking for <500ms template render SLA
    const renderStartTime = useRef<number>(Date.now());
    const mountTime = useRef<number>(Date.now());
    
    // Template state following Enhanced Design Mode architecture
    const [state, setState] = useState<MultiModalErrorLayoutState>({
      activeErrors: new Map(),
      errorHistory: [],
      errorCascades: [],
      gracefulDegradation: {
        degradationLevel: 'none',
        availableModalities: ['camera', 'voice', 'text', 'visual_search'],
        disabledFeatures: [],
        alternativeWorkflows: [],
        userNotifications: []
      },
      activeRecoveryPlans: new Map(),
      systemHealth: {
        overallStatus: 'healthy',
        modalityStatus: {
          camera: 'operational',
          voice: 'operational',
          text: 'operational',
          visual_search: 'operational',
          network: 'operational',
          system: 'operational'
        },
        lastHealthCheck: Date.now(),
        performanceMetrics: {
          errorRate: 0,
          recoverySuccessRate: 1,
          averageRecoveryTime: 0,
          slaCompliance: true
        }
      },
      userInteractionRequired: {
        hasRequiredActions: false,
        pendingConfirmations: [],
        urgentActions: [],
        guidanceMessages: []
      },
      accessibilityContext: {
        currentFocus: '',
        announcementQueue: [],
        errorSummary: '',
        recoveryInstructions: '',
        alternativeAccess: []
      }
    });
    
    // Refs for component coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const errorPanelRef = useRef<HTMLDivElement>(null);
    const recoveryPanelRef = useRef<HTMLDivElement>(null);
    const orchestratorRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Initialize with provided errors
    useEffect(() => {
      if (errors.length > 0) {
        const errorMap = new Map();
        errors.forEach(error => {
          const fullError: SystemError = {
            ...error,
            id: error.id || `error_${Date.now()}_${Math.random()}`,
            timestamp: error.timestamp || new Date(),
            retryCount: error.retryCount || 0
          };
          errorMap.set(fullError.id, fullError);
        });
        
        setState(prev => ({
          ...prev,
          activeErrors: errorMap
        }));
      }
    }, [errors]);

    // Template-level accessibility announcements
    const announceSystemStatus = useCallback((message: string) => {
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

    // Report new error to the system
    const reportError = useCallback((errorData: Omit<SystemError, 'id' | 'timestamp' | 'retryCount'>): string => {
      const errorId = `error_${Date.now()}_${Math.random()}`;
      const error: SystemError = {
        ...errorData,
        id: errorId,
        timestamp: new Date(),
        retryCount: 0
      };
      
      setState(prev => {
        const newActiveErrors = new Map(prev.activeErrors);
        newActiveErrors.set(errorId, error);
        
        return {
          ...prev,
          activeErrors: newActiveErrors,
          errorHistory: [...prev.errorHistory, error].slice(-100), // Keep last 100 errors
          systemHealth: {
            ...prev.systemHealth,
            modalityStatus: {
              ...prev.systemHealth.modalityStatus,
              [error.modality]: error.severity === 'critical' ? 'failed' : 'degraded'
            },
            overallStatus: error.severity === 'critical' ? 'critical' : 'degraded'
          }
        };
      });
      
      announceSystemStatus(`New ${error.severity} error in ${error.modality}: ${error.message}`);
      return errorId;
    }, [announceSystemStatus]);

    // Resolve error and clean up
    const resolveError = useCallback(async (errorId: string): Promise<void> => {
      const error = state.activeErrors.get(errorId);
      if (!error) return;
      
      setState(prev => {
        const newActiveErrors = new Map(prev.activeErrors);
        newActiveErrors.delete(errorId);
        
        // Update system health if no more errors in this modality
        const hasOtherModalityErrors = Array.from(newActiveErrors.values())
          .some(e => e.modality === error.modality);
        
        const newModalityStatus = { ...prev.systemHealth.modalityStatus };
        if (!hasOtherModalityErrors) {
          newModalityStatus[error.modality] = 'operational';
        }
        
        const hasAnyCriticalErrors = Array.from(newActiveErrors.values())
          .some(e => e.severity === 'critical');
        
        const overallStatus = hasAnyCriticalErrors ? 'critical' :
          newActiveErrors.size > 0 ? 'degraded' : 'healthy';
        
        return {
          ...prev,
          activeErrors: newActiveErrors,
          systemHealth: {
            ...prev.systemHealth,
            modalityStatus: newModalityStatus,
            overallStatus
          }
        };
      });
      
      onErrorResolved?.(error);
      announceSystemStatus(`${error.modality} error resolved`);
    }, [state.activeErrors, onErrorResolved, announceSystemStatus]);

    // Performance monitoring
    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      
      setState(prev => ({
        ...prev,
        systemHealth: {
          ...prev.systemHealth,
          performanceMetrics: {
            ...prev.systemHealth.performanceMetrics,
            slaCompliance: renderTime <= 500
          }
        }
      }));
      
      onPerformanceMetric?.('template_render_time', renderTime);
      
      // SLA validation
      if (enforceSLA && renderTime > 500) {
        console.warn(`[MultiModalErrorLayout] Template render SLA violation: ${renderTime}ms > 500ms`);
      }
    }, [onPerformanceMetric, enforceSLA]);

    // Focus management
    const focusErrorPanel = useCallback(() => {
      if (errorPanelRef.current) {
        const firstError = errorPanelRef.current.querySelector('[role="alert"]');
        if (firstError && 'focus' in firstError) {
          (firstError as HTMLElement).focus();
        }
      }
    }, []);

    const focusRecoveryActions = useCallback(() => {
      if (recoveryPanelRef.current) {
        const firstButton = recoveryPanelRef.current.querySelector('button');
        if (firstButton) {
          firstButton.focus();
        }
      }
    }, []);

    // Expose template API
    useImperativeHandle(ref, () => ({
      reportError,
      resolveError,
      clearAllErrors: () => setState(prev => ({ ...prev, activeErrors: new Map() })),
      executeRecoveryPlan: async () => false, // TODO: Implement
      createCustomRecoveryPlan: () => '', // TODO: Implement
      getAvailableRecoveryActions: () => [], // TODO: Implement
      activateGracefulDegradation: () => {}, // TODO: Implement
      restoreFullFunctionality: async () => false, // TODO: Implement
      getSystemHealth: () => state.systemHealth,
      focusErrorPanel,
      focusRecoveryActions,
      announceSystemStatus,
      getErrorMetrics: () => state.systemHealth.performanceMetrics,
      validatePerformanceSLA: () => state.systemHealth.performanceMetrics.slaCompliance,
      auditErrorAccessibility: async () => [] // TODO: Implement
    }));

    const activeErrorsArray = Array.from(state.activeErrors.values());

    return (
      <div 
        className={`${styles.templateContainer} ${className}`}
        ref={containerRef}
        role="main"
        aria-label="Multi-modal error management interface"
      >
        {/* Accessibility announcements */}
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
        />
        
        {/* Multi-modal orchestration (hidden but active) */}
        <MultiModalOrchestrator
          ref={orchestratorRef}
          className={styles.hiddenOrchestrator}
        />
        
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
const MultiModalErrorLayout = MultiModalErrorLayoutComponent as typeof MultiModalErrorLayoutComponent & MultiModalErrorLayoutComponents;

MultiModalErrorLayout.Header = MultiModalErrorLayoutHeader;
MultiModalErrorLayout.ErrorPanel = MultiModalErrorLayoutErrorPanel;
MultiModalErrorLayout.RecoveryPanel = MultiModalErrorLayoutRecoveryPanel;
MultiModalErrorLayout.DegradationPanel = MultiModalErrorLayoutDegradationPanel;
MultiModalErrorLayout.Controls = MultiModalErrorLayoutControls;
MultiModalErrorLayout.Footer = MultiModalErrorLayoutFooter;

MultiModalErrorLayout.displayName = 'MultiModalErrorLayout';

export { MultiModalErrorLayout };
export type { 
  MultiModalErrorLayoutProps, 
  MultiModalErrorLayoutRef,
  MultiModalErrorLayoutHeaderProps,
  MultiModalErrorLayoutErrorPanelProps,
  MultiModalErrorLayoutRecoveryPanelProps,
  MultiModalErrorLayoutDegradationPanelProps,
  MultiModalErrorLayoutControlsProps,
  MultiModalErrorLayoutFooterProps,
  SystemError,
  ModalityErrorType,
  RecoveryActionType,
  ErrorCascade,
  GracefulDegradation,
  RecoveryPlan
};
