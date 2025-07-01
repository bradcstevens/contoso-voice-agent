"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiSettings, FiHelpCircle } from 'react-icons/fi';
import clsx from 'clsx';
import { CameraPermissionButton, useCameraPermission, CameraPermissionState } from './camerapermissionbutton';
import styles from './camerapermissionflow.module.css';

// Enhanced TypeScript interfaces for camera permission flow
export type CameraFlowStep = 
  | 'initial' 
  | 'requesting' 
  | 'granted' 
  | 'denied' 
  | 'error'
  | 'help'
  | 'settings';

export interface CameraPermissionFlowProps {
  /** Callback when camera access is successfully granted */
  onCameraGranted?: (stream: MediaStream) => void;
  /** Callback when permission flow completes */
  onFlowComplete?: (success: boolean) => void;
  /** Whether to show help and settings options */
  showAdvancedOptions?: boolean;
  /** Custom error messages */
  errorMessages?: {
    denied?: string;
    notFound?: string;
    notReadable?: string;
    overconstrained?: string;
    security?: string;
    generic?: string;
  };
  /** Additional CSS class name */
  className?: string;
  /** Whether to auto-start the permission flow */
  autoStart?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
}

// Default error messages
const DEFAULT_ERROR_MESSAGES = {
  denied: 'Camera access was denied. Please allow camera permission to use visual search.',
  notFound: 'No camera found. Please connect a camera device to use visual search.',
  notReadable: 'Camera is not accessible. Please close other applications that might be using the camera.',
  overconstrained: 'Camera settings are not supported. Please try with different camera settings.',
  security: 'Camera access is blocked due to security settings. Please enable camera access in your browser.',
  generic: 'Camera is not available. Please check your camera connection and permissions.'
};

// Error type detection helper
const getErrorType = (error: Error): keyof typeof DEFAULT_ERROR_MESSAGES => {
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'denied';
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'notFound';
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'notReadable';
  } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
    return 'overconstrained';
  } else if (error.name === 'SecurityError') {
    return 'security';
  }
  return 'generic';
};

/**
 * CameraPermissionFlow Molecular Component
 * 
 * Orchestrates the complete camera permission request process with comprehensive
 * error handling, user guidance, and recovery options.
 * 
 * Features:
 * - Complete permission flow orchestration
 * - Detailed error handling and recovery
 * - User guidance and help options
 * - Browser settings assistance
 * - Accessibility compliance
 * - Retry mechanisms
 */
export const CameraPermissionFlow: React.FC<CameraPermissionFlowProps> = ({
  onCameraGranted,
  onFlowComplete,
  showAdvancedOptions = true,
  errorMessages = {},
  className,
  autoStart = false,
  compact = false
}) => {
  const [currentStep, setCurrentStep] = useState<CameraFlowStep>('initial');
  const [errorType, setErrorType] = useState<keyof typeof DEFAULT_ERROR_MESSAGES>('generic');
  const [retryCount, setRetryCount] = useState(0);
  const [announcement, setAnnouncement] = useState<string>('');

  // Use camera permission hook
  const { 
    permissionState, 
    stream, 
    requestPermission, 
    stopStream, 
    isGranted, 
    hasError 
  } = useCameraPermission();

  // Merge custom error messages with defaults
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...errorMessages };

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    setCurrentStep('requesting');
    setAnnouncement('Requesting camera permission...');
    
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        setCurrentStep('granted');
        setAnnouncement('Camera access granted successfully.');
        onFlowComplete?.(true);
        
        // Provide stream to parent component
        if (stream) {
          onCameraGranted?.(stream);
        }
      } else {
        handlePermissionError(result);
      }
    } catch (error) {
      console.error('Camera permission flow error:', error);
      handlePermissionError('error');
    }
  }, [requestPermission, stream, onCameraGranted, onFlowComplete]);

  // Handle permission errors
  const handlePermissionError = useCallback((state: CameraPermissionState) => {
    if (state === 'denied') {
      setCurrentStep('denied');
      setErrorType('denied');
      setAnnouncement('Camera permission denied. Please see options below to resolve.');
    } else {
      setCurrentStep('error');
      setErrorType('generic');
      setAnnouncement('Camera error occurred. Please see options below to resolve.');
    }
    onFlowComplete?.(false);
  }, [onFlowComplete]);

  // Handle retry attempt
  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    setAnnouncement('Retrying camera permission request...');
    
    // Reset any existing streams
    stopStream();
    
    // Wait a moment before retrying
    setTimeout(() => {
      handleRequestPermission();
    }, 500);
  }, [handleRequestPermission, stopStream]);

  // Handle help request
  const handleShowHelp = useCallback(() => {
    setCurrentStep('help');
    setAnnouncement('Showing camera help information.');
  }, []);

  // Handle settings request
  const handleShowSettings = useCallback(() => {
    setCurrentStep('settings');
    setAnnouncement('Showing camera settings guidance.');
  }, []);

  // Handle back to main flow
  const handleBackToMain = useCallback(() => {
    setCurrentStep(hasError ? 'error' : 'initial');
    setAnnouncement('Returned to camera permission options.');
  }, [hasError]);

  // Auto-start permission flow if enabled
  useEffect(() => {
    if (autoStart && currentStep === 'initial') {
      handleRequestPermission();
    }
  }, [autoStart, currentStep, handleRequestPermission]);

  // Update step based on permission state
  useEffect(() => {
    if (permissionState === 'granted' && currentStep !== 'granted') {
      setCurrentStep('granted');
    } else if (permissionState === 'denied' && currentStep !== 'denied') {
      setCurrentStep('denied');
      setErrorType('denied');
    } else if (permissionState === 'error' && currentStep !== 'error') {
      setCurrentStep('error');
      setErrorType('generic');
    }
  }, [permissionState, currentStep]);

  // Render help content
  const renderHelpContent = () => (
    <div className={styles.helpContent}>
      <h3>Camera Permission Help</h3>
      <div className={styles.helpSection}>
        <h4>Why do we need camera access?</h4>
        <p>Camera access allows you to take photos of products for visual search and identification.</p>
      </div>
      <div className={styles.helpSection}>
        <h4>How to enable camera access:</h4>
        <ol>
          <li>Click the camera icon in your browser's address bar</li>
          <li>Select "Always allow" for camera access</li>
          <li>Refresh the page if needed</li>
        </ol>
      </div>
      <div className={styles.helpSection}>
        <h4>Troubleshooting:</h4>
        <ul>
          <li>Check that your camera is connected properly</li>
          <li>Close other applications using the camera</li>
          <li>Try refreshing the page</li>
          <li>Check browser permissions in settings</li>
        </ul>
      </div>
      <button 
        onClick={handleBackToMain}
        className={styles.backButton}
        aria-label="Return to camera permission options"
      >
        Back to Camera Setup
      </button>
    </div>
  );

  // Render settings guidance
  const renderSettingsContent = () => (
    <div className={styles.settingsContent}>
      <h3>Browser Settings Guidance</h3>
      <div className={styles.settingsSection}>
        <h4>Chrome/Edge:</h4>
        <ol>
          <li>Click the three dots menu → Settings</li>
          <li>Go to Privacy and Security → Site Settings</li>
          <li>Click Camera and allow access for this site</li>
        </ol>
      </div>
      <div className={styles.settingsSection}>
        <h4>Firefox:</h4>
        <ol>
          <li>Click the three lines menu → Settings</li>
          <li>Go to Privacy & Security → Permissions</li>
          <li>Click Camera settings and allow access</li>
        </ol>
      </div>
      <div className={styles.settingsSection}>
        <h4>Safari:</h4>
        <ol>
          <li>Go to Safari → Preferences → Websites</li>
          <li>Click Camera in the left sidebar</li>
          <li>Set this website to "Allow"</li>
        </ol>
      </div>
      <button 
        onClick={handleBackToMain}
        className={styles.backButton}
        aria-label="Return to camera permission options"
      >
        Back to Camera Setup
      </button>
    </div>
  );

  // Render error content with recovery options
  const renderErrorContent = () => (
    <div className={styles.errorContent}>
      <div className={styles.errorIcon}>
        <FiAlertTriangle aria-hidden="true" />
      </div>
      <h3>Camera Access Issue</h3>
      <p className={styles.errorMessage}>
        {messages[errorType]}
      </p>
      <div className={styles.errorActions}>
        <button 
          onClick={handleRetry}
          className={styles.retryButton}
          aria-label={`Retry camera permission request (attempt ${retryCount + 1})`}
        >
          <FiRefreshCw aria-hidden="true" />
          Try Again
        </button>
        {showAdvancedOptions && (
          <>
            <button 
              onClick={handleShowHelp}
              className={styles.helpButton}
              aria-label="Show camera permission help"
            >
              <FiHelpCircle aria-hidden="true" />
              Get Help
            </button>
            <button 
              onClick={handleShowSettings}
              className={styles.settingsButton}
              aria-label="Show browser settings guidance"
            >
              <FiSettings aria-hidden="true" />
              Browser Settings
            </button>
          </>
        )}
      </div>
      {retryCount > 2 && (
        <div className={styles.persistentError}>
          <p>Still having trouble? Try refreshing the page or checking your browser's camera settings.</p>
        </div>
      )}
    </div>
  );

  // Render success content
  const renderSuccessContent = () => (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <FiRefreshCw aria-hidden="true" />
      </div>
      <h3>Camera Ready</h3>
      <p>Camera access granted successfully. You can now use visual search features.</p>
    </div>
  );

  return (
    <>
      {/* Screen reader announcement region */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Main flow container */}
      <div className={clsx(
        styles.permissionFlow,
        compact && styles.compact,
        className
      )}>
        {/* Initial state - show permission button */}
        {currentStep === 'initial' && (
          <div className={styles.initialState}>
            <CameraPermissionButton
              onRequestPermission={handleRequestPermission}
              autoRequest={false}
              size={compact ? 'small' : 'default'}
              className={styles.permissionButton}
            />
            {!compact && (
              <p className={styles.description}>
                Enable camera access to use visual product search and identification features.
              </p>
            )}
          </div>
        )}

        {/* Requesting state */}
        {currentStep === 'requesting' && (
          <div className={styles.requestingState}>
            <CameraPermissionButton
              state="requesting"
              disabled={true}
              size={compact ? 'small' : 'default'}
              className={styles.permissionButton}
            />
          </div>
        )}

        {/* Success state */}
        {currentStep === 'granted' && renderSuccessContent()}

        {/* Error states */}
        {(currentStep === 'denied' || currentStep === 'error') && renderErrorContent()}

        {/* Help content */}
        {currentStep === 'help' && renderHelpContent()}

        {/* Settings content */}
        {currentStep === 'settings' && renderSettingsContent()}
      </div>
    </>
  );
};

// Custom hook for camera permission flow management
export const useCameraPermissionFlow = () => {
  const [flowState, setFlowState] = useState<CameraFlowStep>('initial');
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [hasStream, setHasStream] = useState(false);

  const handleFlowComplete = useCallback((success: boolean) => {
    setIsFlowComplete(true);
    setFlowState(success ? 'granted' : 'error');
  }, []);

  const handleCameraGranted = useCallback((stream: MediaStream) => {
    setHasStream(true);
    setFlowState('granted');
  }, []);

  const resetFlow = useCallback(() => {
    setFlowState('initial');
    setIsFlowComplete(false);
    setHasStream(false);
  }, []);

  return {
    flowState,
    isFlowComplete,
    hasStream,
    handleFlowComplete,
    handleCameraGranted,
    resetFlow,
    isGranted: flowState === 'granted',
    hasError: flowState === 'denied' || flowState === 'error'
  };
};

export default CameraPermissionFlow; 