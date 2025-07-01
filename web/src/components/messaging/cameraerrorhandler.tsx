"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHelpCircle, FiSettings, FiCamera, FiWifi } from 'react-icons/fi';
import clsx from 'clsx';
import { CameraStatusIndicator } from './camerastatusindicator';
import { CameraControlIcon } from './cameracontrolicon';
import styles from './cameraerrorhandler.module.css';

// Enhanced TypeScript interfaces for camera error handling
export type CameraErrorType = 
  | 'permission_denied'
  | 'device_not_found'
  | 'device_in_use'
  | 'network_error'
  | 'hardware_error'
  | 'browser_unsupported'
  | 'security_error'
  | 'timeout_error'
  | 'unknown_error';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecoveryAction = 'retry' | 'settings' | 'help' | 'reload' | 'contact';

export interface CameraError {
  type: CameraErrorType;
  message: string;
  code?: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  timestamp: Date;
  retryCount?: number;
  context?: Record<string, any>;
}

export interface CameraErrorHandlerProps {
  /** Current error state */
  error?: CameraError | null;
  /** Whether to show detailed error information */
  showDetails?: boolean;
  /** Whether to show recovery actions */
  showRecoveryActions?: boolean;
  /** Available recovery actions */
  availableActions?: RecoveryAction[];
  /** Callback when retry is attempted */
  onRetry?: () => void;
  /** Callback when settings are requested */
  onSettings?: () => void;
  /** Callback when help is requested */
  onHelp?: () => void;
  /** Callback when page reload is requested */
  onReload?: () => void;
  /** Callback when support contact is requested */
  onContact?: () => void;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Maximum retry attempts before showing different options */
  maxRetries?: number;
  /** Whether the error handler is in compact mode */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Custom error messages */
  customMessages?: Partial<Record<CameraErrorType, string>>;
  /** Whether to auto-retry certain errors */
  autoRetry?: boolean;
  /** Auto-retry delay in milliseconds */
  autoRetryDelay?: number;
}

// Default error messages and configurations
const ERROR_CONFIG: Record<CameraErrorType, {
  message: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  actions: RecoveryAction[];
  icon: React.ComponentType<any>;
}> = {
  permission_denied: {
    message: 'Camera permission was denied. Please allow camera access to use visual search features.',
    severity: 'high',
    recoverable: true,
    actions: ['retry', 'settings', 'help'],
    icon: FiCamera
  },
  device_not_found: {
    message: 'No camera device found. Please connect a camera or check your device settings.',
    severity: 'critical',
    recoverable: false,
    actions: ['settings', 'help', 'reload'],
    icon: FiCamera
  },
  device_in_use: {
    message: 'Camera is being used by another application. Please close other apps using the camera.',
    severity: 'medium',
    recoverable: true,
    actions: ['retry', 'help'],
    icon: FiAlertTriangle
  },
  network_error: {
    message: 'Network connection issue. Please check your internet connection and try again.',
    severity: 'medium',
    recoverable: true,
    actions: ['retry', 'reload'],
    icon: FiWifi
  },
  hardware_error: {
    message: 'Camera hardware error detected. Please check your camera connection.',
    severity: 'high',
    recoverable: true,
    actions: ['retry', 'settings', 'help'],
    icon: FiAlertTriangle
  },
  browser_unsupported: {
    message: 'Your browser does not support camera features. Please update your browser or use a supported browser.',
    severity: 'critical',
    recoverable: false,
    actions: ['help', 'contact'],
    icon: FiAlertTriangle
  },
  security_error: {
    message: 'Camera access is blocked due to security settings. Please check your browser security settings.',
    severity: 'high',
    recoverable: true,
    actions: ['settings', 'help'],
    icon: FiSettings
  },
  timeout_error: {
    message: 'Camera request timed out. Please try again or check your camera connection.',
    severity: 'medium',
    recoverable: true,
    actions: ['retry', 'help'],
    icon: FiRefreshCw
  },
  unknown_error: {
    message: 'An unexpected camera error occurred. Please try again or contact support if the problem persists.',
    severity: 'medium',
    recoverable: true,
    actions: ['retry', 'help', 'contact'],
    icon: FiAlertTriangle
  }
};

// Recovery action configurations
const ACTION_CONFIG: Record<RecoveryAction, {
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  primary: boolean;
}> = {
  retry: {
    label: 'Try Again',
    description: 'Attempt to access the camera again',
    icon: FiRefreshCw,
    primary: true
  },
  settings: {
    label: 'Settings',
    description: 'Open browser camera settings',
    icon: FiSettings,
    primary: false
  },
  help: {
    label: 'Get Help',
    description: 'View troubleshooting information',
    icon: FiHelpCircle,
    primary: false
  },
  reload: {
    label: 'Reload Page',
    description: 'Refresh the page and try again',
    icon: FiRefreshCw,
    primary: false
  },
  contact: {
    label: 'Contact Support',
    description: 'Get help from support team',
    icon: FiHelpCircle,
    primary: false
  }
};

/**
 * CameraErrorHandler Molecular Component
 * 
 * Provides comprehensive error handling for camera-related issues
 * with graceful recovery options and user guidance.
 * 
 * Features:
 * - Comprehensive error categorization
 * - Recovery action suggestions
 * - Auto-retry capabilities
 * - User guidance and help
 * - Accessibility compliance
 * - Severity-based handling
 * - Context-aware recovery
 */
export const CameraErrorHandler: React.FC<CameraErrorHandlerProps> = ({
  error,
  showDetails = true,
  showRecoveryActions = true,
  availableActions = ['retry', 'settings', 'help'],
  onRetry,
  onSettings,
  onHelp,
  onReload,
  onContact,
  onDismiss,
  maxRetries = 3,
  compact = false,
  className,
  customMessages = {},
  autoRetry = false,
  autoRetryDelay = 2000
}) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const [autoRetryTimer, setAutoRetryTimer] = useState<NodeJS.Timeout | null>(null);

  // Get error configuration
  const getErrorConfig = useCallback((errorType: CameraErrorType) => {
    const config = ERROR_CONFIG[errorType];
    const customMessage = customMessages[errorType];
    
    return {
      ...config,
      message: customMessage || config.message
    };
  }, [customMessages]);

  // Handle retry action
  const handleRetry = useCallback(async () => {
    if (!error || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setAnnouncement(`Retrying camera access (attempt ${retryCount + 1})...`);

    try {
      await onRetry?.();
      setAnnouncement('Retry successful');
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      setAnnouncement('Retry failed. Please try other recovery options.');
    } finally {
      setIsRetrying(false);
    }
  }, [error, isRetrying, retryCount, onRetry]);

  // Handle settings action
  const handleSettings = useCallback(() => {
    setAnnouncement('Opening camera settings guidance');
    onSettings?.();
  }, [onSettings]);

  // Handle help action
  const handleHelp = useCallback(() => {
    setAnnouncement('Opening camera troubleshooting help');
    onHelp?.();
  }, [onHelp]);

  // Handle reload action
  const handleReload = useCallback(() => {
    setAnnouncement('Reloading page...');
    onReload?.();
  }, [onReload]);

  // Handle contact action
  const handleContact = useCallback(() => {
    setAnnouncement('Opening support contact information');
    onContact?.();
  }, [onContact]);

  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    setAnnouncement('Error dismissed');
    onDismiss?.();
    setRetryCount(0);
  }, [onDismiss]);

  // Get action handler
  const getActionHandler = useCallback((action: RecoveryAction) => {
    switch (action) {
      case 'retry': return handleRetry;
      case 'settings': return handleSettings;
      case 'help': return handleHelp;
      case 'reload': return handleReload;
      case 'contact': return handleContact;
      default: return undefined;
    }
  }, [handleRetry, handleSettings, handleHelp, handleReload, handleContact]);

  // Auto-retry logic
  useEffect(() => {
    if (!error || !autoRetry || retryCount >= maxRetries) return;

    const config = getErrorConfig(error.type);
    if (!config.recoverable) return;

    const timer = setTimeout(() => {
      handleRetry();
    }, autoRetryDelay);

    setAutoRetryTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, autoRetry, retryCount, maxRetries, autoRetryDelay, getErrorConfig, handleRetry]);

  // Update announcement when error changes
  useEffect(() => {
    if (error) {
      const config = getErrorConfig(error.type);
      setAnnouncement(`Camera error: ${config.message}`);
    }
  }, [error, getErrorConfig]);

  // Reset retry count when error type changes
  useEffect(() => {
    setRetryCount(0);
  }, [error?.type]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoRetryTimer) {
        clearTimeout(autoRetryTimer);
      }
    };
  }, [autoRetryTimer]);

  // Don't render if no error
  if (!error) return null;

  const config = getErrorConfig(error.type);
  const IconComponent = config.icon;
  const isMaxRetriesReached = retryCount >= maxRetries;

  // Filter available actions based on error type and retry count
  const filteredActions = availableActions.filter(action => {
    if (action === 'retry' && (!config.recoverable || isMaxRetriesReached)) {
      return false;
    }
    return config.actions.includes(action);
  });

  // Render recovery actions
  const renderRecoveryActions = () => {
    if (!showRecoveryActions || filteredActions.length === 0) return null;

    return (
      <div className={styles.recoveryActions}>
        <h4 className={styles.actionsTitle}>Recovery Options:</h4>
        <div className={styles.actionButtons}>
          {filteredActions.map((action) => {
            const actionConfig = ACTION_CONFIG[action];
            const ActionIcon = actionConfig.icon;
            const handler = getActionHandler(action);
            const isDisabled = action === 'retry' && isRetrying;

            return (
              <button
                key={action}
                onClick={handler}
                disabled={isDisabled}
                className={clsx(
                  styles.actionButton,
                  actionConfig.primary && styles.primaryAction,
                  isDisabled && styles.disabled
                )}
                aria-label={`${actionConfig.label}: ${actionConfig.description}`}
                title={actionConfig.description}
              >
                <ActionIcon className={styles.actionIcon} />
                <span>{actionConfig.label}</span>
                {action === 'retry' && isRetrying && (
                  <span className={styles.loadingIndicator}>...</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render error details
  const renderErrorDetails = () => {
    if (!showDetails) return null;

    return (
      <div className={styles.errorDetails}>
        <div className={styles.errorInfo}>
          <span className={styles.errorType}>Error Type: {error.type}</span>
          {error.code && (
            <span className={styles.errorCode}>Code: {error.code}</span>
          )}
          <span className={styles.errorTime}>
            Time: {error.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {retryCount > 0 && (
          <div className={styles.retryInfo}>
            <span>Retry attempts: {retryCount} / {maxRetries}</span>
          </div>
        )}

        {isMaxRetriesReached && (
          <div className={styles.maxRetriesWarning}>
            <FiAlertTriangle className={styles.warningIcon} />
            <span>Maximum retry attempts reached. Please try other recovery options.</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Screen reader announcement region */}
      <div 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Main error handler container */}
      <div className={clsx(
        styles.errorHandler,
        styles[config.severity],
        compact && styles.compact,
        className
      )}>
        {/* Error header */}
        <div className={styles.errorHeader}>
          <div className={styles.errorIcon}>
            <IconComponent aria-hidden="true" />
          </div>
          
          <div className={styles.errorContent}>
            <h3 className={styles.errorTitle}>Camera Error</h3>
            <p className={styles.errorMessage}>{config.message}</p>
          </div>

          {/* Status indicator */}
          <div className={styles.statusIndicator}>
            <CameraStatusIndicator
              state="error"
              displayMode="minimal"
              showText={false}
              className={styles.statusIcon}
            />
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={styles.dismissButton}
              aria-label="Dismiss error"
              title="Dismiss this error"
            >
              ×
            </button>
          )}
        </div>

        {/* Error details */}
        {renderErrorDetails()}

        {/* Recovery actions */}
        {renderRecoveryActions()}

        {/* Auto-retry indicator */}
        {autoRetry && !isMaxRetriesReached && config.recoverable && (
          <div className={styles.autoRetryIndicator}>
            <span>Auto-retrying in {Math.ceil(autoRetryDelay / 1000)} seconds...</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Custom hook for camera error management
export const useCameraErrorHandler = () => {
  const [currentError, setCurrentError] = useState<CameraError | null>(null);
  const [errorHistory, setErrorHistory] = useState<CameraError[]>([]);

  const reportError = useCallback((
    type: CameraErrorType,
    message?: string,
    context?: Record<string, any>
  ) => {
    const config = ERROR_CONFIG[type];
    const error: CameraError = {
      type,
      message: message || config.message,
      severity: config.severity,
      recoverable: config.recoverable,
      timestamp: new Date(),
      retryCount: 0,
      context
    };

    setCurrentError(error);
    setErrorHistory(prev => [...prev, error].slice(-10)); // Keep last 10 errors
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryError = useCallback(() => {
    if (currentError) {
      const updatedError = {
        ...currentError,
        retryCount: (currentError.retryCount || 0) + 1
      };
      setCurrentError(updatedError);
    }
  }, [currentError]);

  const getErrorsByType = useCallback((type: CameraErrorType) => {
    return errorHistory.filter(error => error.type === type);
  }, [errorHistory]);

  const hasRecentError = useCallback((type: CameraErrorType, withinMinutes: number = 5) => {
    const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
    return errorHistory.some(error => 
      error.type === type && error.timestamp > cutoff
    );
  }, [errorHistory]);

  return {
    currentError,
    errorHistory,
    reportError,
    clearError,
    retryError,
    getErrorsByType,
    hasRecentError,
    hasError: Boolean(currentError),
    errorType: currentError?.type,
    errorSeverity: currentError?.severity,
    isRecoverable: currentError?.recoverable ?? false
  };
};

export default CameraErrorHandler; 