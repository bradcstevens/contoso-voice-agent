"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FiCamera, FiCircle, FiLoader, FiCheck, FiMic } from 'react-icons/fi';
import clsx from 'clsx';
import styles from './capturebutton.module.css';

// Enhanced TypeScript interfaces for capture button states
export type CaptureButtonState = 
  | 'idle' 
  | 'ready' 
  | 'capturing' 
  | 'processing'
  | 'success'
  | 'voice-triggered'
  | 'disabled';

export type CaptureMode = 'manual' | 'voice' | 'auto';

export interface CaptureButtonProps {
  /** Current capture button state */
  state?: CaptureButtonState;
  /** Capture mode (manual, voice, auto) */
  mode?: CaptureMode;
  /** Callback when capture is triggered */
  onCapture?: () => void;
  /** Callback when state changes */
  onStateChange?: (state: CaptureButtonState) => void;
  /** Custom button text for different states */
  text?: {
    idle?: string;
    ready?: string;
    capturing?: string;
    processing?: string;
    success?: string;
    voiceTriggered?: string;
    disabled?: string;
  };
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'default' | 'small' | 'large';
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Voice command words that trigger capture */
  voiceCommands?: string[];
  /** Whether to auto-reset after success */
  autoReset?: boolean;
  /** Auto-reset delay in milliseconds */
  autoResetDelay?: number;
}

// Default text for different states
const DEFAULT_TEXT = {
  idle: 'Capture',
  ready: 'Capture Image',
  capturing: 'Capturing...',
  processing: 'Processing...',
  success: 'Captured!',
  voiceTriggered: 'Voice Capture',
  disabled: 'Unavailable'
};

// Icons for different states
const STATE_ICONS = {
  idle: FiCamera,
  ready: FiCircle,
  capturing: FiLoader,
  processing: FiLoader,
  success: FiCheck,
  'voice-triggered': FiMic,
  disabled: FiCamera
};

// ARIA announcements for screen readers
const ARIA_ANNOUNCEMENTS = {
  idle: 'Capture button ready. Click to capture image.',
  ready: 'Camera ready for capture. Click to take photo.',
  capturing: 'Capturing image from camera.',
  processing: 'Processing captured image.',
  success: 'Image captured successfully.',
  'voice-triggered': 'Voice command detected. Capturing image.',
  disabled: 'Capture function is not available.'
};

/**
 * CaptureButton Atom Component
 * 
 * Enhanced capture button with multi-modal input support,
 * haptic feedback, and comprehensive accessibility.
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Multi-modal input (voice, touch, keyboard)
 * - Haptic feedback on supported devices
 * - Voice command recognition
 * - Screen reader announcements
 * - Touch-optimized for mobile
 * - Dark mode and high contrast support
 * - Reduced motion preferences
 */
export const CaptureButton: React.FC<CaptureButtonProps> = ({
  state = 'idle',
  mode = 'manual',
  onCapture,
  onStateChange,
  text = {},
  disabled = false,
  className,
  ariaLabel,
  showIcon = true,
  size = 'default',
  enableHaptics = true,
  voiceCommands = ['capture', 'take photo', 'snap', 'click'],
  autoReset = true,
  autoResetDelay = 2000
}) => {
  const [internalState, setInternalState] = useState<CaptureButtonState>(state);
  const [announcement, setAnnouncement] = useState<string>('');
  const [isListeningForVoice, setIsListeningForVoice] = useState<boolean>(false);

  // Merge custom text with defaults
  const buttonText = { ...DEFAULT_TEXT, ...text };

  // Get current icon component
  const IconComponent = STATE_ICONS[internalState];

  // Haptic feedback function
  const triggerHaptics = useCallback(() => {
    if (enableHaptics && 'vibrate' in navigator) {
      // Short vibration for capture feedback
      navigator.vibrate(50);
    }
  }, [enableHaptics]);

  // Handle capture action
  const handleCapture = useCallback(() => {
    if (disabled || internalState === 'capturing' || internalState === 'processing') {
      return;
    }

    setInternalState('capturing');
    setAnnouncement(ARIA_ANNOUNCEMENTS.capturing);
    onStateChange?.('capturing');
    
    // Trigger haptic feedback
    triggerHaptics();
    
    // Call capture callback
    onCapture?.();
  }, [disabled, internalState, onCapture, onStateChange, triggerHaptics]);

  // Handle button click
  const handleClick = useCallback(() => {
    if (mode === 'manual' || mode === 'auto') {
      handleCapture();
    }
  }, [mode, handleCapture]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Voice command detection
  useEffect(() => {
    if (mode === 'voice' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.toLowerCase().trim();
          
          // Check if any voice command matches
          const isVoiceCommand = voiceCommands.some(command => 
            transcript.includes(command.toLowerCase())
          );
          
          if (isVoiceCommand) {
            setInternalState('voice-triggered');
            setAnnouncement(ARIA_ANNOUNCEMENTS['voice-triggered']);
            
            // Trigger capture after brief delay
            setTimeout(() => {
              handleCapture();
            }, 300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        setIsListeningForVoice(false);
      };

      if (internalState === 'ready') {
        recognition.start();
        setIsListeningForVoice(true);
      }

      return () => {
        recognition.stop();
        setIsListeningForVoice(false);
      };
    }
  }, [mode, voiceCommands, internalState, handleCapture]);

  // Auto-reset after success
  useEffect(() => {
    if (autoReset && internalState === 'success') {
      const timer = setTimeout(() => {
        setInternalState('ready');
        setAnnouncement(ARIA_ANNOUNCEMENTS.ready);
        onStateChange?.('ready');
      }, autoResetDelay);

      return () => clearTimeout(timer);
    }
  }, [autoReset, autoResetDelay, internalState, onStateChange]);

  // Update internal state when prop changes
  useEffect(() => {
    setInternalState(state);
    setAnnouncement(ARIA_ANNOUNCEMENTS[state]);
  }, [state]);

  // Generate accessible label
  const accessibleLabel = ariaLabel || ARIA_ANNOUNCEMENTS[internalState];

  // Determine if button should be interactive
  const isInteractive = !disabled && internalState !== 'capturing' && internalState !== 'processing';

  // Get button text for current state
  const currentText = buttonText[internalState as keyof typeof buttonText] || buttonText.idle;

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
      
      {/* Main capture button */}
      <button
        type="button"
        className={clsx(
          styles.captureButton,
          styles[internalState],
          styles[size],
          styles[mode],
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={accessibleLabel}
        aria-describedby={`capture-button-${internalState}`}
        tabIndex={isInteractive ? 0 : -1}
        data-voice-listening={isListeningForVoice}
      >
        {showIcon && (
          <IconComponent 
            className={styles.icon}
            aria-hidden="true"
          />
        )}
        <span className={styles.text}>{currentText}</span>
        
        {mode === 'voice' && isListeningForVoice && (
          <div className={styles.voiceIndicator} aria-hidden="true" />
        )}
      </button>

      {/* Hidden descriptions for screen readers */}
      <div id={`capture-button-${internalState}`} className="sr-only">
        {internalState === 'idle' && 'Capture button is ready. Click to capture an image from the camera.'}
        {internalState === 'ready' && 'Camera is ready for capture. Click button or use voice command to take photo.'}
        {internalState === 'capturing' && 'Image capture is in progress. Please wait.'}
        {internalState === 'processing' && 'Captured image is being processed for analysis.'}
        {internalState === 'success' && 'Image captured successfully. Ready for next capture.'}
        {internalState === 'voice-triggered' && 'Voice command detected. Capturing image automatically.'}
        {internalState === 'disabled' && 'Capture function is currently unavailable. Please check camera permissions.'}
      </div>
    </>
  );
};

// Custom hook for capture button management
export const useCaptureButton = () => {
  const [buttonState, setButtonState] = useState<CaptureButtonState>('idle');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('manual');
  const [lastCaptureTime, setLastCaptureTime] = useState<number | null>(null);

  const initializeCapture = useCallback((mode: CaptureMode = 'manual') => {
    setCaptureMode(mode);
    setButtonState('ready');
  }, []);

  const triggerCapture = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (buttonState !== 'ready') {
        resolve(false);
        return;
      }

      setButtonState('capturing');
      
      // Simulate capture process
      setTimeout(() => {
        setButtonState('processing');
        
        setTimeout(() => {
          setButtonState('success');
          setLastCaptureTime(Date.now());
          resolve(true);
        }, 500);
      }, 200);
    });
  }, [buttonState]);

  const resetCapture = useCallback(() => {
    setButtonState('ready');
  }, []);

  const disableCapture = useCallback(() => {
    setButtonState('disabled');
  }, []);

  return {
    buttonState,
    captureMode,
    lastCaptureTime,
    initializeCapture,
    triggerCapture,
    resetCapture,
    disableCapture,
    isReady: buttonState === 'ready',
    isCapturing: buttonState === 'capturing' || buttonState === 'processing',
    isSuccess: buttonState === 'success',
    isDisabled: buttonState === 'disabled'
  };
};

export default CaptureButton; 