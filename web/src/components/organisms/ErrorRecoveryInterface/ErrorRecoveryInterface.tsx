import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MultiModalStatus } from '../../molecules/MultiModalStatus/MultiModalStatus';
import { CoordinationPanel } from '../../molecules/CoordinationPanel/CoordinationPanel';
import { FormField } from '../../molecules/FormField/FormField';
import { UserProfile } from '../../molecules/UserProfile/UserProfile';
import { Button } from '../../atoms/Button/Button';
import { Label } from '../../atoms/Label/Label';
import { Input } from '../../atoms/Input/Input';
import { LiveRegion } from '../../atoms/LiveRegion/LiveRegion';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './ErrorRecoveryInterface.module.css';

interface ErrorRecoveryInterfaceProps {
  /** Error recovery state */
  hasError?: boolean;
  isRecovering?: boolean;
  isReporting?: boolean;
  
  /** Error information */
  errorType?: 'system' | 'network' | 'permission' | 'validation' | 'critical';
  errorSeverity?: 'low' | 'medium' | 'high' | 'critical';
  errorMessage?: string;
  errorCode?: string;
  errorTimestamp?: string;
  
  /** Recovery options */
  autoRecovery?: boolean;
  recoverySteps?: string[];
  canRetry?: boolean;
  canReset?: boolean;
  canRevert?: boolean;
  
  /** Professional features */
  professionalMode?: boolean;
  debugMode?: boolean;
  reportingEnabled?: boolean;
  logginEnabled?: boolean;
  
  /** Interface layout */
  layout?: 'compact' | 'standard' | 'detailed';
  showTechnicalDetails?: boolean;
  showRecoveryGuide?: boolean;
  showReportForm?: boolean;
  
  /** Accessibility options */
  highContrast?: boolean;
  reducedMotion?: boolean;
  screenReaderMode?: boolean;
  
  /** Event handlers */
  onRecoveryAttempt?: (method: string) => void;
  onRetry?: () => void;
  onReset?: () => void;
  onRevert?: () => void;
  onReport?: (report: any) => void;
  onErrorDismiss?: () => void;
  
  /** Professional callbacks */
  onDebugExport?: (debugData: any) => void;
  onSystemDiagnostic?: () => void;
  onProfessionalEscalation?: (escalation: any) => void;
  
  /** Accessibility callbacks */
  onAccessibilityUpdate?: (update: any) => void;
  onScreenReaderUpdate?: (update: string) => void;
  
  /** Additional props */
  className?: string;
  'data-testid'?: string;
}

export const ErrorRecoveryInterface: React.FC<ErrorRecoveryInterfaceProps> = ({
  hasError = false,
  isRecovering = false,
  isReporting = false,
  errorType = 'system',
  errorSeverity = 'medium',
  errorMessage = 'An unexpected error occurred',
  errorCode = 'ERR_UNKNOWN',
  errorTimestamp = new Date().toISOString(),
  autoRecovery = true,
  recoverySteps = [],
  canRetry = true,
  canReset = true,
  canRevert = false,
  professionalMode = false,
  debugMode = false,
  reportingEnabled = true,
  logginEnabled = true,
  layout = 'standard',
  showTechnicalDetails = false,
  showRecoveryGuide = true,
  showReportForm = false,
  highContrast = false,
  reducedMotion = false,
  screenReaderMode = false,
  onRecoveryAttempt,
  onRetry,
  onReset,
  onRevert,
  onReport,
  onErrorDismiss,
  onDebugExport,
  onSystemDiagnostic,
  onProfessionalEscalation,
  onAccessibilityUpdate,
  onScreenReaderUpdate,
  className,
  'data-testid': testId,
}) => {
  // Error recovery state
  const [recoveryState, setRecoveryState] = useState({
    currentStep: 0,
    totalSteps: recoverySteps.length,
    completedSteps: [],
    failedSteps: [],
    recoveryMethod: 'auto',
    recoveryProgress: 0,
  });

  // Error analysis state
  const [errorAnalysis, setErrorAnalysis] = useState({
    errorId: `ERR_${Date.now()}`,
    errorSeverity: errorSeverity,
    errorCategory: errorType,
    errorContext: {
      userAgent: navigator.userAgent,
      timestamp: errorTimestamp,
      sessionId: 'current-session',
      userId: 'current-user',
    },
    systemState: {
      connectivity: 'online',
      permissions: 'granted',
      resources: 'available',
      performance: 'normal',
    },
  });

  // Recovery options state
  const [recoveryOptions, setRecoveryOptions] = useState({
    autoRecovery: {
      enabled: autoRecovery,
      progress: 0,
      attempts: 0,
      maxAttempts: 3,
    },
    manualRecovery: {
      steps: recoverySteps,
      currentStep: 0,
      guidedMode: true,
    },
    professionalActions: {
      diagnosticMode: debugMode,
      escalationAvailable: professionalMode,
      debugExportReady: false,
    },
  });

  // Reporting state
  const [reportingState, setReportingState] = useState({
    isEnabled: reportingEnabled,
    reportType: 'standard',
    reportData: {
      description: '',
      reproductionSteps: '',
      expectedBehavior: '',
      actualBehavior: '',
      userImpact: errorSeverity,
    },
    attachments: {
      includeSystemInfo: true,
      includeErrorLogs: true,
      includeUserActions: true,
      includeScreenshot: false,
    },
  });

  // Accessibility state
  const [accessibilityState, setAccessibilityState] = useState({
    announcements: [] as string[],
    focusManagement: {
      currentFocus: 'error-message',
      errorFocusTrap: true,
      skipLinks: ['#recovery-actions', '#error-details', '#report-form'],
    },
    screenReaderContext: hasError ? `Error detected: ${errorMessage}` : 'No errors',
  });

  // Professional diagnostic state
  const [diagnosticState, setDiagnosticState] = useState({
    systemHealth: {
      cpu: 85,
      memory: 72,
      network: 98,
      storage: 67,
    },
    errorContext: {
      stackTrace: '',
      componentTree: '',
      stateSnapshot: {},
      performanceMetrics: {},
    },
    recoveryMetrics: {
      successRate: 95,
      averageRecoveryTime: 2500,
      commonIssues: [],
    },
  });

  // Refs for error recovery operations
  const recoveryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const diagnosticWorkerRef = useRef<any>(null);
  const reportFormRef = useRef<HTMLFormElement>(null);

  // Auto-recovery initialization
  useEffect(() => {
    if (hasError && autoRecovery && !isRecovering) {
      startAutoRecovery();
    }
  }, [hasError, autoRecovery]);

  // Error analysis
  useEffect(() => {
    if (hasError) {
      analyzeError();
      announceError();
    }
  }, [hasError, errorMessage, errorCode, errorSeverity]);

  // Professional diagnostic monitoring
  useEffect(() => {
    if (professionalMode && debugMode) {
      initializeDiagnosticMonitoring();
    }
  }, [professionalMode, debugMode]);

  // Accessibility updates
  useEffect(() => {
    if (screenReaderMode) {
      announceRecoveryState();
    }
  }, [isRecovering, recoveryState.currentStep, screenReaderMode]);

  // Auto-recovery implementation
  const startAutoRecovery = useCallback(async () => {
    setRecoveryState(prev => ({
      ...prev,
      recoveryMethod: 'auto',
      recoveryProgress: 0,
    }));

    try {
      announceToScreenReader('Starting automatic recovery');
      
      // Simulate auto-recovery steps
      for (let step = 0; step < 3; step++) {
        setRecoveryState(prev => ({
          ...prev,
          currentStep: step + 1,
          recoveryProgress: ((step + 1) / 3) * 100,
        }));

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (step === 2) {
          // Simulate successful recovery
          setRecoveryState(prev => ({
            ...prev,
            completedSteps: [...prev.completedSteps, step],
          }));
          
          onRecoveryAttempt?.('auto-recovery');
          announceToScreenReader('Automatic recovery completed successfully');
        }
      }
    } catch (error) {
      setRecoveryState(prev => ({
        ...prev,
        failedSteps: [...prev.failedSteps, prev.currentStep],
      }));
      
      announceToScreenReader('Automatic recovery failed');
    }
  }, [onRecoveryAttempt]);

  // Error analysis
  const analyzeError = useCallback(() => {
    const analysis = {
      errorId: `ERR_${Date.now()}`,
      errorSeverity: errorSeverity,
      errorCategory: errorType,
      errorContext: {
        userAgent: navigator.userAgent,
        timestamp: errorTimestamp,
        sessionId: 'current-session',
        userId: 'current-user',
        errorMessage: errorMessage,
        errorCode: errorCode,
      },
      systemState: {
        connectivity: navigator.onLine ? 'online' : 'offline',
        permissions: 'checking',
        resources: 'available',
        performance: 'normal',
      },
    };

    setErrorAnalysis(analysis);
    
    // Professional diagnostic collection
    if (professionalMode) {
      collectDiagnosticData();
    }
  }, [errorType, errorSeverity, errorMessage, errorCode, errorTimestamp, professionalMode]);

  // Professional diagnostic monitoring
  const initializeDiagnosticMonitoring = useCallback(() => {
    diagnosticWorkerRef.current = {
      collectSystemMetrics: () => {
        return {
          cpu: 85 + Math.random() * 10,
          memory: 70 + Math.random() * 15,
          network: 95 + Math.random() * 5,
          storage: 65 + Math.random() * 10,
        };
      },
      
      generateStackTrace: () => {
        return `Error Stack Trace:
  at ErrorRecoveryInterface (ErrorRecoveryInterface.tsx:${Math.floor(Math.random() * 100)})
  at Component (Component.tsx:${Math.floor(Math.random() * 50)})
  at App (App.tsx:${Math.floor(Math.random() * 20)})`;
      },
      
      captureStateSnapshot: () => {
        return {
          errorState: recoveryState,
          analysisState: errorAnalysis,
          reportingState: reportingState,
          timestamp: new Date().toISOString(),
        };
      },
    };

    // Update diagnostic data periodically
    const diagnosticInterval = setInterval(() => {
      if (diagnosticWorkerRef.current) {
        setDiagnosticState(prev => ({
          ...prev,
          systemHealth: diagnosticWorkerRef.current.collectSystemMetrics(),
          errorContext: {
            ...prev.errorContext,
            stackTrace: diagnosticWorkerRef.current.generateStackTrace(),
            stateSnapshot: diagnosticWorkerRef.current.captureStateSnapshot(),
          },
        }));
      }
    }, 2000);

    return () => clearInterval(diagnosticInterval);
  }, [recoveryState, errorAnalysis, reportingState]);

  // Collect diagnostic data
  const collectDiagnosticData = useCallback(() => {
    if (diagnosticWorkerRef.current) {
      const diagnosticData = {
        systemMetrics: diagnosticWorkerRef.current.collectSystemMetrics(),
        errorStackTrace: diagnosticWorkerRef.current.generateStackTrace(),
        stateSnapshot: diagnosticWorkerRef.current.captureStateSnapshot(),
        timestamp: new Date().toISOString(),
      };

      setDiagnosticState(prev => ({
        ...prev,
        errorContext: {
          ...prev.errorContext,
          ...diagnosticData,
        },
        professionalActions: {
          ...prev.professionalActions,
          debugExportReady: true,
        },
      }));
    }
  }, []);

  // Manual recovery methods
  const handleRetry = useCallback(() => {
    announceToScreenReader('Retrying operation');
    onRetry?.();
    onRecoveryAttempt?.('retry');
  }, [onRetry, onRecoveryAttempt]);

  const handleReset = useCallback(() => {
    announceToScreenReader('Resetting to default state');
    onReset?.();
    onRecoveryAttempt?.('reset');
  }, [onReset, onRecoveryAttempt]);

  const handleRevert = useCallback(() => {
    if (canRevert) {
      announceToScreenReader('Reverting to previous state');
      onRevert?.();
      onRecoveryAttempt?.('revert');
    }
  }, [canRevert, onRevert, onRecoveryAttempt]);

  // Professional actions
  const handleDebugExport = useCallback(() => {
    const debugData = {
      errorAnalysis: errorAnalysis,
      diagnosticState: diagnosticState,
      recoveryState: recoveryState,
      reportingState: reportingState,
      timestamp: new Date().toISOString(),
    };

    onDebugExport?.(debugData);
    announceToScreenReader('Debug data exported');
  }, [errorAnalysis, diagnosticState, recoveryState, reportingState, onDebugExport]);

  const handleSystemDiagnostic = useCallback(() => {
    announceToScreenReader('Running system diagnostic');
    collectDiagnosticData();
    onSystemDiagnostic?.();
  }, [onSystemDiagnostic]);

  const handleProfessionalEscalation = useCallback(() => {
    const escalationData = {
      errorAnalysis: errorAnalysis,
      recoveryAttempts: recoveryState,
      systemDiagnostics: diagnosticState,
      userImpact: reportingState.reportData.userImpact,
      timestamp: new Date().toISOString(),
    };

    onProfessionalEscalation?.(escalationData);
    announceToScreenReader('Error escalated to professional support');
  }, [errorAnalysis, recoveryState, diagnosticState, reportingState, onProfessionalEscalation]);

  // Error reporting
  const handleErrorReport = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    const reportData = {
      ...reportingState.reportData,
      errorAnalysis: errorAnalysis,
      systemInfo: diagnosticState.systemHealth,
      attachments: reportingState.attachments,
      timestamp: new Date().toISOString(),
    };

    onReport?.(reportData);
    announceToScreenReader('Error report submitted');
  }, [reportingState, errorAnalysis, diagnosticState, onReport]);

  // Report data updates
  const updateReportData = useCallback((field: string, value: string) => {
    setReportingState(prev => ({
      ...prev,
      reportData: {
        ...prev.reportData,
        [field]: value,
      },
    }));
  }, []);

  // Accessibility announcements
  const announceToScreenReader = useCallback((message: string) => {
    setAccessibilityState(prev => ({
      ...prev,
      announcements: [...prev.announcements, message],
      screenReaderContext: message,
    }));

    onScreenReaderUpdate?.(message);
  }, [onScreenReaderUpdate]);

  // Announce error
  const announceError = useCallback(() => {
    let errorAnnouncement = `Error detected: ${errorMessage}`;
    
    if (errorSeverity === 'critical') {
      errorAnnouncement = `Critical error: ${errorMessage}`;
    } else if (errorSeverity === 'high') {
      errorAnnouncement = `High priority error: ${errorMessage}`;
    }
    
    if (autoRecovery) {
      errorAnnouncement += '. Automatic recovery will begin shortly.';
    }

    announceToScreenReader(errorAnnouncement);
  }, [errorMessage, errorSeverity, autoRecovery]);

  // Announce recovery state
  const announceRecoveryState = useCallback(() => {
    if (isRecovering) {
      const progressMessage = `Recovery in progress: ${recoveryState.recoveryProgress}% complete`;
      announceToScreenReader(progressMessage);
    }
  }, [isRecovering, recoveryState.recoveryProgress]);

  // Error dismissal
  const handleErrorDismiss = useCallback(() => {
    onErrorDismiss?.();
    announceToScreenReader('Error dismissed');
  }, [onErrorDismiss]);

  // Get error severity icon
  const getErrorIcon = () => {
    switch (errorSeverity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '❗';
    }
  };

  // Get error severity color
  const getSeverityColor = () => {
    switch (errorSeverity) {
      case 'critical':
        return 'var(--color-error)';
      case 'high':
        return 'var(--color-warning)';
      case 'medium':
        return 'var(--color-info)';
      case 'low':
        return 'var(--color-success)';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  // Error recovery CSS classes
  const errorRecoveryClasses = [
    styles.errorRecoveryInterface,
    layout === 'compact' && styles.compactLayout,
    layout === 'standard' && styles.standardLayout,
    layout === 'detailed' && styles.detailedLayout,
    hasError && styles.hasError,
    isRecovering && styles.recovering,
    isReporting && styles.reporting,
    professionalMode && styles.professionalMode,
    debugMode && styles.debugMode,
    highContrast && styles.highContrast,
    reducedMotion && styles.reducedMotion,
    screenReaderMode && styles.screenReaderMode,
    className,
  ].filter(Boolean).join(' ');

  if (!hasError) {
    return (
      <div
        className={styles.noError}
        data-testid={testId}
        role="status"
        aria-label="No errors detected"
      >
        <ScreenReaderText>System operating normally - no errors detected</ScreenReaderText>
        <MultiModalStatus
          cameraStatus="active"
          voiceStatus="active"
          searchStatus="ready"
          professionalMode={professionalMode}
        />
      </div>
    );
  }

  return (
    <div
      className={errorRecoveryClasses}
      data-testid={testId}
      role="alert"
      aria-label="Error Recovery Interface"
      aria-describedby="error-recovery-description"
    >
      <ScreenReaderText id="error-recovery-description">
        Error recovery interface for handling system errors and providing guided recovery workflows.
        {professionalMode && ' Professional mode enabled with advanced diagnostic capabilities.'}
        {debugMode && ' Debug mode active with detailed system information.'}
      </ScreenReaderText>

      <LiveRegion aria-live="assertive" aria-atomic="true">
        {accessibilityState.screenReaderContext}
      </LiveRegion>

      {/* Error Information Panel */}
      <div className={styles.errorPanel} role="region" aria-label="Error Information">
        <div className={styles.errorHeader}>
          <div className={styles.errorIcon} style={{ color: getSeverityColor() }}>
            {getErrorIcon()}
          </div>
          <div className={styles.errorInfo}>
            <h2 className={styles.errorTitle}>
              {errorSeverity.charAt(0).toUpperCase() + errorSeverity.slice(1)} Error Detected
            </h2>
            <p className={styles.errorMessage}>{errorMessage}</p>
            <div className={styles.errorMeta}>
              <span className={styles.errorCode}>Code: {errorCode}</span>
              <span className={styles.errorTime}>
                {new Date(errorTimestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleErrorDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </Button>
        </div>

        {/* Technical Details */}
        {showTechnicalDetails && professionalMode && (
          <div className={styles.technicalDetails} role="region" aria-label="Technical Details">
            <h3>Technical Information</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <Label>Error ID</Label>
                <span>{errorAnalysis.errorId}</span>
              </div>
              <div className={styles.detailItem}>
                <Label>Category</Label>
                <span>{errorAnalysis.errorCategory}</span>
              </div>
              <div className={styles.detailItem}>
                <Label>Session ID</Label>
                <span>{errorAnalysis.errorContext.sessionId}</span>
              </div>
              <div className={styles.detailItem}>
                <Label>User Agent</Label>
                <span className={styles.truncated}>{errorAnalysis.errorContext.userAgent}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recovery Actions Panel */}
      <div className={styles.recoveryPanel} role="region" aria-label="Recovery Actions">
        <h3>Recovery Options</h3>
        
        {/* Auto Recovery Status */}
        {isRecovering && (
          <div className={styles.recoveryProgress} role="region" aria-label="Recovery Progress">
            <div className={styles.progressInfo}>
              <span>Automatic Recovery in Progress</span>
              <span>{recoveryState.recoveryProgress.toFixed(0)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${recoveryState.recoveryProgress}%` }}
              />
            </div>
            <div className={styles.progressDetails}>
              Step {recoveryState.currentStep} of {recoveryState.totalSteps}
            </div>
          </div>
        )}

        {/* Manual Recovery Actions */}
        <div className={styles.recoveryActions} role="group" aria-label="Recovery Actions">
          {canRetry && (
            <Button
              variant="primary"
              onClick={handleRetry}
              disabled={isRecovering}
            >
              <Icon name="refresh" />
              Retry Operation
            </Button>
          )}
          
          {canReset && (
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isRecovering}
            >
              <Icon name="reset" />
              Reset to Default
            </Button>
          )}
          
          {canRevert && (
            <Button
              variant="secondary"
              onClick={handleRevert}
              disabled={isRecovering}
            >
              <Icon name="undo" />
              Revert Changes
            </Button>
          )}
        </div>

        {/* Professional Actions */}
        {professionalMode && (
          <div className={styles.professionalActions} role="group" aria-label="Professional Actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSystemDiagnostic}
            >
              Run Diagnostic
            </Button>
            
            {diagnosticState.professionalActions.debugExportReady && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDebugExport}
              >
                Export Debug Data
              </Button>
            )}
            
            <Button
              variant="warning"
              size="sm"
              onClick={handleProfessionalEscalation}
            >
              Escalate to Support
            </Button>
          </div>
        )}
      </div>

      {/* Recovery Guide */}
      {showRecoveryGuide && recoverySteps.length > 0 && (
        <div className={styles.recoveryGuide} role="region" aria-label="Recovery Guide">
          <h3>Recovery Steps</h3>
          <ol className={styles.recoverySteps}>
            {recoverySteps.map((step, index) => (
              <li 
                key={index}
                className={[
                  styles.recoveryStep,
                  index < recoveryState.currentStep && styles.completed,
                  index === recoveryState.currentStep && styles.current,
                ].filter(Boolean).join(' ')}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepText}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* System Status */}
      <div className={styles.statusPanel} role="region" aria-label="System Status">
        <MultiModalStatus
          cameraStatus={hasError ? 'error' : 'active'}
          voiceStatus={hasError ? 'error' : 'active'}
          searchStatus={hasError ? 'error' : 'ready'}
          professionalMode={professionalMode}
        />
      </div>

      {/* Professional Diagnostics */}
      {debugMode && professionalMode && (
        <div className={styles.diagnosticPanel} role="region" aria-label="System Diagnostics">
          <h3>System Diagnostics</h3>
          <div className={styles.diagnosticMetrics}>
            <div className={styles.metricItem}>
              <Label>CPU Usage</Label>
              <span>{diagnosticState.systemHealth.cpu.toFixed(1)}%</span>
            </div>
            <div className={styles.metricItem}>
              <Label>Memory Usage</Label>
              <span>{diagnosticState.systemHealth.memory.toFixed(1)}%</span>
            </div>
            <div className={styles.metricItem}>
              <Label>Network</Label>
              <span>{diagnosticState.systemHealth.network.toFixed(1)}%</span>
            </div>
            <div className={styles.metricItem}>
              <Label>Storage</Label>
              <span>{diagnosticState.systemHealth.storage.toFixed(1)}%</span>
            </div>
          </div>
          
          {diagnosticState.errorContext.stackTrace && (
            <div className={styles.stackTrace}>
              <h4>Stack Trace</h4>
              <pre className={styles.codeBlock}>
                {diagnosticState.errorContext.stackTrace}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Error Reporting Form */}
      {showReportForm && reportingEnabled && (
        <div className={styles.reportPanel} role="region" aria-label="Error Report">
          <h3>Report Error</h3>
          <form ref={reportFormRef} onSubmit={handleErrorReport} className={styles.reportForm}>
            <FormField
              label="Description"
              required
              value={reportingState.reportData.description}
              onChange={(value) => updateReportData('description', value)}
              placeholder="Describe what happened"
            />
            
            <FormField
              label="Steps to Reproduce"
              value={reportingState.reportData.reproductionSteps}
              onChange={(value) => updateReportData('reproductionSteps', value)}
              placeholder="List the steps that led to this error"
              multiline
            />
            
            <FormField
              label="Expected Behavior"
              value={reportingState.reportData.expectedBehavior}
              onChange={(value) => updateReportData('expectedBehavior', value)}
              placeholder="What should have happened?"
            />
            
            <FormField
              label="Actual Behavior"
              value={reportingState.reportData.actualBehavior}
              onChange={(value) => updateReportData('actualBehavior', value)}
              placeholder="What actually happened?"
            />

            <div className={styles.reportActions}>
              <Button
                type="submit"
                variant="primary"
                disabled={isReporting || !reportingState.reportData.description}
              >
                {isReporting ? <Spinner size="sm" /> : 'Submit Report'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReportingState(prev => ({ ...prev, reportType: 'standard' }))}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coordination Panel */}
      <div className={styles.coordinationPanel} role="region" aria-label="Error Coordination">
        <CoordinationPanel
          systemStatus={hasError ? 'error' : 'operational'}
          recoveryStatus={isRecovering ? 'active' : 'standby'}
          professionalMode={professionalMode}
        />
      </div>

      {/* User Profile */}
      <div className={styles.userProfilePanel} role="region" aria-label="User Profile">
        <UserProfile
          showPreferences={true}
          compactMode={layout === 'compact'}
        />
      </div>
    </div>
  );
};

export default ErrorRecoveryInterface;
export type { ErrorRecoveryInterfaceProps }; 