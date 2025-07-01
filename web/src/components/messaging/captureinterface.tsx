"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FiCamera, FiMic, FiMicOff, FiSettings, FiRotateCw, FiPause, FiPlay } from 'react-icons/fi';
import clsx from 'clsx';
import { CaptureButton, useCaptureButton } from './capturebutton';
import { CameraControlIcon } from './cameracontrolicon';
import styles from './captureinterface.module.css';

// Enhanced TypeScript interfaces for capture interface
export type CaptureMode = 'manual' | 'voice' | 'auto' | 'timer';
export type CaptureState = 'idle' | 'ready' | 'capturing' | 'processing' | 'success' | 'error';
export type VoiceCommandState = 'inactive' | 'listening' | 'processing' | 'recognized';

export interface CaptureInterfaceProps {
  /** Current capture state */
  state?: CaptureState;
  /** Active capture mode */
  mode?: CaptureMode;
  /** Available capture modes */
  availableModes?: CaptureMode[];
  /** Whether voice commands are enabled */
  voiceEnabled?: boolean;
  /** Voice command state */
  voiceState?: VoiceCommandState;
  /** Callback when capture is triggered */
  onCapture?: () => void;
  /** Callback when capture mode changes */
  onModeChange?: (mode: CaptureMode) => void;
  /** Callback when voice toggle changes */
  onVoiceToggle?: (enabled: boolean) => void;
  /** Callback when settings are requested */
  onSettings?: () => void;
  /** Whether interface is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show mode selector */
  showModeSelector?: boolean;
  /** Whether to show voice controls */
  showVoiceControls?: boolean;
  /** Whether to show advanced controls */
  showAdvancedControls?: boolean;
  /** Auto-capture timer duration (seconds) */
  timerDuration?: number;
  /** Voice commands configuration */
  voiceCommands?: {
    capture?: string[];
    pause?: string[];
    resume?: string[];
    settings?: string[];
  };
  /** Haptic feedback enabled */
  hapticEnabled?: boolean;
}

// Default voice commands
const DEFAULT_VOICE_COMMANDS = {
  capture: ['capture', 'take photo', 'snap', 'take picture', 'shoot'],
  pause: ['pause', 'stop', 'wait'],
  resume: ['resume', 'continue', 'start'],
  settings: ['settings', 'options', 'configure']
};

// Mode labels and descriptions
const MODE_CONFIG = {
  manual: {
    label: 'Manual',
    description: 'Click to capture',
    icon: FiCamera
  },
  voice: {
    label: 'Voice',
    description: 'Say "capture" to take photo',
    icon: FiMic
  },
  auto: {
    label: 'Auto',
    description: 'Automatic capture when ready',
    icon: FiRotateCw
  },
  timer: {
    label: 'Timer',
    description: '3-second countdown capture',
    icon: FiPause
  }
};

/**
 * CaptureInterface Molecular Component
 * 
 * Combines capture controls, voice integration, and mode selection
 * into a complete multi-modal capture interface.
 * 
 * Features:
 * - Multi-modal capture (manual, voice, auto, timer)
 * - Voice command recognition
 * - Haptic feedback support
 * - Mode selection interface
 * - Advanced capture controls
 * - Accessibility compliance
 * - Real-time status updates
 */
export const CaptureInterface: React.FC<CaptureInterfaceProps> = ({
  state = 'idle',
  mode = 'manual',
  availableModes = ['manual', 'voice', 'auto'],
  voiceEnabled = false,
  voiceState = 'inactive',
  onCapture,
  onModeChange,
  onVoiceToggle,
  onSettings,
  disabled = false,
  className,
  showModeSelector = true,
  showVoiceControls = true,
  showAdvancedControls = false,
  timerDuration = 3,
  voiceCommands = {},
  hapticEnabled = true
}) => {
  const [internalState, setInternalState] = useState<CaptureState>(state);
  const [internalMode, setInternalMode] = useState<CaptureMode>(mode);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(voiceEnabled);
  const [announcement, setAnnouncement] = useState<string>('');
  const [timerCount, setTimerCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Merge voice commands with defaults
  const commands = { ...DEFAULT_VOICE_COMMANDS, ...voiceCommands };

  // Use capture button hook
  const {
    captureState,
    handleCapture: handleButtonCapture,
    handleVoiceCommand,
    resetCapture,
    isReady: isCaptureReady,
    isProcessing: isCaptureProcessing
  } = useCaptureButton();

  // Handle capture request
  const handleCapture = useCallback(async () => {
    if (disabled || internalState === 'capturing') return;

    setInternalState('capturing');
    setAnnouncement('Capturing image...');

    try {
      // Handle different capture modes
      switch (internalMode) {
        case 'timer':
          await handleTimerCapture();
          break;
        case 'voice':
          if (isVoiceActive) {
            await handleVoiceCapture();
          } else {
            await handleManualCapture();
          }
          break;
        case 'auto':
          await handleAutoCapture();
          break;
        default: // manual
          await handleManualCapture();
          break;
      }
    } catch (error) {
      console.error('Capture error:', error);
      setInternalState('error');
      setAnnouncement('Capture failed. Please try again.');
    }
  }, [disabled, internalState, internalMode, isVoiceActive]);

  // Handle manual capture
  const handleManualCapture = useCallback(async () => {
    // Trigger haptic feedback if enabled
    if (hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    onCapture?.();
    setInternalState('success');
    setAnnouncement('Image captured successfully');

    // Reset to ready state after brief success indication
    setTimeout(() => {
      setInternalState('ready');
    }, 1000);
  }, [onCapture, hapticEnabled]);

  // Handle timer capture
  const handleTimerCapture = useCallback(async () => {
    setTimerCount(timerDuration);
    setAnnouncement(`Timer started: ${timerDuration} seconds`);

    timerRef.current = setInterval(() => {
      setTimerCount(prev => {
        const newCount = prev - 1;
        if (newCount > 0) {
          setAnnouncement(`Capturing in ${newCount}...`);
        } else {
          setAnnouncement('Capturing now!');
          clearInterval(timerRef.current!);
          handleManualCapture();
        }
        return newCount;
      });
    }, 1000);
  }, [timerDuration, handleManualCapture]);

  // Handle voice capture
  const handleVoiceCapture = useCallback(async () => {
    setAnnouncement('Voice command captured image');
    await handleManualCapture();
  }, [handleManualCapture]);

  // Handle auto capture
  const handleAutoCapture = useCallback(async () => {
    setAnnouncement('Auto capture triggered');
    await handleManualCapture();
  }, [handleManualCapture]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: CaptureMode) => {
    if (!availableModes.includes(newMode)) return;

    setInternalMode(newMode);
    setAnnouncement(`Capture mode changed to ${newMode}`);
    onModeChange?.(newMode);

    // Clear any active timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerCount(0);
    }

    // Update voice state based on mode
    if (newMode === 'voice' && !isVoiceActive) {
      setIsVoiceActive(true);
      onVoiceToggle?.(true);
    }
  }, [availableModes, onModeChange, onVoiceToggle, isVoiceActive]);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    const newVoiceState = !isVoiceActive;
    setIsVoiceActive(newVoiceState);
    setAnnouncement(newVoiceState ? 'Voice commands enabled' : 'Voice commands disabled');
    onVoiceToggle?.(newVoiceState);
  }, [isVoiceActive, onVoiceToggle]);

  // Handle settings request
  const handleSettings = useCallback(() => {
    setAnnouncement('Opening capture settings');
    onSettings?.();
  }, [onSettings]);

  // Listen for voice commands
  useEffect(() => {
    if (!isVoiceActive || voiceState !== 'recognized') return;

    // This would integrate with actual voice recognition
    // For now, we'll use the handleVoiceCommand from the capture button
    handleVoiceCommand();
  }, [isVoiceActive, voiceState, handleVoiceCommand]);

  // Update internal state when prop changes
  useEffect(() => {
    setInternalState(state);
  }, [state]);

  // Update internal mode when prop changes
  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  // Update voice state when prop changes
  useEffect(() => {
    setIsVoiceActive(voiceEnabled);
  }, [voiceEnabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Render mode selector
  const renderModeSelector = () => {
    if (!showModeSelector || availableModes.length <= 1) return null;

    return (
      <div className={styles.modeSelector}>
        <span className={styles.modeLabel}>Mode:</span>
        <div className={styles.modeButtons}>
          {availableModes.map((modeOption) => {
            const config = MODE_CONFIG[modeOption];
            return (
              <button
                key={modeOption}
                onClick={() => handleModeChange(modeOption)}
                className={clsx(
                  styles.modeButton,
                  internalMode === modeOption && styles.modeButtonActive
                )}
                aria-label={`Set capture mode to ${config.label}: ${config.description}`}
                disabled={disabled}
                title={config.description}
              >
                <config.icon className={styles.modeIcon} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render voice controls
  const renderVoiceControls = () => {
    if (!showVoiceControls) return null;

    return (
      <div className={styles.voiceControls}>
        <CameraControlIcon
          type="mic-toggle"
          isActive={isVoiceActive}
          onClick={handleVoiceToggle}
          disabled={disabled}
          showTooltip={true}
          tooltipText={isVoiceActive ? 'Disable voice commands' : 'Enable voice commands'}
          className={styles.voiceToggle}
        />
        {isVoiceActive && (
          <div className={styles.voiceStatus}>
            <span className={clsx(
              styles.voiceIndicator,
              styles[voiceState]
            )}>
              {voiceState === 'listening' && 'Listening...'}
              {voiceState === 'processing' && 'Processing...'}
              {voiceState === 'recognized' && 'Command recognized'}
              {voiceState === 'inactive' && 'Voice ready'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render advanced controls
  const renderAdvancedControls = () => {
    if (!showAdvancedControls) return null;

    return (
      <div className={styles.advancedControls}>
        <CameraControlIcon
          type="settings"
          onClick={handleSettings}
          disabled={disabled}
          showTooltip={true}
          tooltipText="Capture settings"
          className={styles.settingsButton}
        />
      </div>
    );
  };

  // Render timer display
  const renderTimerDisplay = () => {
    if (internalMode !== 'timer' || timerCount === 0) return null;

    return (
      <div className={styles.timerDisplay}>
        <div className={styles.timerCount}>
          {timerCount}
        </div>
        <div className={styles.timerLabel}>
          seconds
        </div>
      </div>
    );
  };

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

      {/* Main capture interface */}
      <div className={clsx(
        styles.captureInterface,
        styles[internalState],
        styles[internalMode],
        disabled && styles.disabled,
        className
      )}>
        {/* Mode selector */}
        {renderModeSelector()}

        {/* Main capture area */}
        <div className={styles.captureArea}>
          {/* Timer display overlay */}
          {renderTimerDisplay()}

          {/* Primary capture button */}
          <CaptureButton
            mode={internalMode}
            onCapture={handleCapture}
            disabled={disabled || internalState === 'capturing'}
            hapticEnabled={hapticEnabled}
            voiceEnabled={isVoiceActive}
            autoReset={true}
            className={styles.captureButton}
          />

          {/* Capture status */}
          <div className={styles.captureStatus}>
            {internalState === 'capturing' && 'Capturing...'}
            {internalState === 'processing' && 'Processing...'}
            {internalState === 'success' && 'Success!'}
            {internalState === 'error' && 'Error occurred'}
            {internalState === 'ready' && MODE_CONFIG[internalMode].description}
            {internalState === 'idle' && 'Ready to capture'}
          </div>
        </div>

        {/* Controls panel */}
        <div className={styles.controlsPanel}>
          {renderVoiceControls()}
          {renderAdvancedControls()}
        </div>
      </div>
    </>
  );
};

// Custom hook for capture interface management
export const useCaptureInterface = () => {
  const [interfaceState, setInterfaceState] = useState<{
    state: CaptureState;
    mode: CaptureMode;
    voiceEnabled: boolean;
    voiceState: VoiceCommandState;
  }>({
    state: 'idle',
    mode: 'manual',
    voiceEnabled: false,
    voiceState: 'inactive'
  });

  const updateState = useCallback((updates: Partial<typeof interfaceState>) => {
    setInterfaceState(prev => ({ ...prev, ...updates }));
  }, []);

  const triggerCapture = useCallback(async () => {
    setInterfaceState(prev => ({ ...prev, state: 'capturing' }));
    
    // Simulate capture process
    setTimeout(() => {
      setInterfaceState(prev => ({ ...prev, state: 'success' }));
      setTimeout(() => {
        setInterfaceState(prev => ({ ...prev, state: 'ready' }));
      }, 1000);
    }, 500);
  }, []);

  const changeMode = useCallback((mode: CaptureMode) => {
    setInterfaceState(prev => ({ ...prev, mode }));
  }, []);

  const toggleVoice = useCallback(() => {
    setInterfaceState(prev => ({ 
      ...prev, 
      voiceEnabled: !prev.voiceEnabled,
      voiceState: !prev.voiceEnabled ? 'inactive' : 'inactive'
    }));
  }, []);

  const resetInterface = useCallback(() => {
    setInterfaceState({
      state: 'idle',
      mode: 'manual',
      voiceEnabled: false,
      voiceState: 'inactive'
    });
  }, []);

  return {
    interfaceState,
    updateState,
    triggerCapture,
    changeMode,
    toggleVoice,
    resetInterface,
    isCapturing: interfaceState.state === 'capturing',
    isReady: interfaceState.state === 'ready' || interfaceState.state === 'idle',
    hasVoice: interfaceState.voiceEnabled
  };
};

export default CaptureInterface; 