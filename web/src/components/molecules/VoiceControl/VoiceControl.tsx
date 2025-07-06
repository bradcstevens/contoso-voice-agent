import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceIcon } from '../../atoms/VoiceIcon/VoiceIcon';
import { VoiceIndicator } from '../../atoms/VoiceIndicator/VoiceIndicator';
import { VoiceStatus } from '../../atoms/VoiceStatus/VoiceStatus';
import { Button } from '../../atoms/Button/Button';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import { FocusIndicator } from '../../atoms/FocusIndicator/FocusIndicator';
import styles from './VoiceControl.module.css';

export interface VoiceControlProps {
  /** Current voice state */
  voiceState?: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled';
  /** Voice activity level (0-100) */
  activityLevel?: number;
  /** Callback when voice state should change */
  onStateChange?: (newState: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled') => void;
  /** Callback when push-to-talk button is pressed */
  onPushToTalk?: (isPressed: boolean) => void;
  /** Callback when mute toggle is triggered */
  onMuteToggle?: () => void;
  /** Voice connection quality (0-100) */
  connectionQuality?: number;
  /** Current audio level (0-100) */
  audioLevel?: number;
  /** Connection latency in milliseconds */
  latency?: number;
  /** Voice provider name */
  provider?: string;
  /** Whether push-to-talk mode is enabled */
  pushToTalkMode?: boolean;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical' | 'compact';
  /** Whether to show detailed status information */
  showDetailedStatus?: boolean;
  /** Whether to show voice activity indicator */
  showActivityIndicator?: boolean;
  /** Voice activity indicator type */
  activityIndicatorType?: 'bars' | 'dots' | 'wave' | 'ring' | 'pulse';
  /** Custom voice control label */
  label?: string;
  /** Custom mute button label */
  muteLabel?: string;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * VoiceControl Molecule
 * 
 * Comprehensive voice interaction control combining VoiceIcon, VoiceIndicator, 
 * and VoiceStatus atoms for complete voice interface management.
 * 
 * Features:
 * - Complete voice state management (idle, listening, speaking, processing, etc.)
 * - Real-time activity visualization with multiple indicator types
 * - Push-to-talk and continuous listening modes
 * - Mute/unmute functionality with visual feedback
 * - Connection quality and status monitoring
 * - WCAG AAA accessibility compliance with keyboard support
 * - Multi-layout options (horizontal, vertical, compact)
 * - Detailed status information with audio levels and latency
 * - Screen reader announcements for state changes
 * - Focus management for keyboard navigation
 */
export const VoiceControl: React.FC<VoiceControlProps> = ({
  voiceState = 'idle',
  activityLevel = 0,
  onStateChange,
  onPushToTalk,
  onMuteToggle,
  connectionQuality = 100,
  audioLevel = 0,
  latency = 0,
  provider = 'Azure OpenAI',
  pushToTalkMode = false,
  disabled = false,
  size = 'medium',
  orientation = 'horizontal',
  showDetailedStatus = true,
  showActivityIndicator = true,
  activityIndicatorType = 'bars',
  label = 'Voice Control',
  muteLabel = 'Mute/Unmute',
  className = '',
  testId = 'voice-control'
}) => {
  // Internal state
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);
  const [lastStateChange, setLastStateChange] = useState<string>('');
  
  // Refs
  const pushToTalkRef = useRef<HTMLButtonElement>(null);
  
  // Size mapping helper
  const mapSize = (controlSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[controlSize];
  };
  
  const atomSize = mapSize(size);
  
  // Handle voice activation
  const handleVoiceActivation = useCallback(() => {
    if (disabled) return;
    
    if (pushToTalkMode) {
      // Toggle push-to-talk
      const newPressed = !isPushToTalkPressed;
      setIsPushToTalkPressed(newPressed);
      onPushToTalk?.(newPressed);
      
      // Update voice state based on push-to-talk
      if (newPressed && voiceState === 'idle') {
        onStateChange?.('listening');
        setLastStateChange('Started listening');
      } else if (!newPressed && voiceState === 'listening') {
        onStateChange?.('processing');
        setLastStateChange('Processing voice input');
      }
    } else {
      // Toggle continuous listening
      if (voiceState === 'idle') {
        onStateChange?.('listening');
        setLastStateChange('Started listening');
      } else if (voiceState === 'listening') {
        onStateChange?.('idle');
        setLastStateChange('Stopped listening');
      }
    }
  }, [disabled, pushToTalkMode, isPushToTalkPressed, voiceState, onPushToTalk, onStateChange]);
  
  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (disabled) return;
    
    if (voiceState === 'muted') {
      onStateChange?.('idle');
      setLastStateChange('Voice unmuted');
    } else {
      onStateChange?.('muted');
      setLastStateChange('Voice muted');
    }
    
    onMuteToggle?.();
  }, [disabled, voiceState, onStateChange, onMuteToggle]);
  
  // Handle push-to-talk key events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || !pushToTalkMode) return;
    
    if (event.code === 'Space' && !isPushToTalkPressed) {
      event.preventDefault();
      setIsPushToTalkPressed(true);
      onPushToTalk?.(true);
      
      if (voiceState === 'idle') {
        onStateChange?.('listening');
        setLastStateChange('Push-to-talk activated');
      }
    }
  }, [disabled, pushToTalkMode, isPushToTalkPressed, voiceState, onPushToTalk, onStateChange]);
  
  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (disabled || !pushToTalkMode) return;
    
    if (event.code === 'Space' && isPushToTalkPressed) {
      event.preventDefault();
      setIsPushToTalkPressed(false);
      onPushToTalk?.(false);
      
      if (voiceState === 'listening') {
        onStateChange?.('processing');
        setLastStateChange('Push-to-talk released');
      }
    }
  }, [disabled, pushToTalkMode, isPushToTalkPressed, voiceState, onPushToTalk, onStateChange]);
  
  // Determine button variant based on state
  const getVoiceButtonVariant = () => {
    if (voiceState === 'error') return 'danger';
    if (voiceState === 'listening' || isPushToTalkPressed) return 'primary';
    if (voiceState === 'muted') return 'secondary';
    return 'ghost';
  };
  
  // Get accessibility descriptions
  const getVoiceButtonLabel = () => {
    if (pushToTalkMode) {
      return isPushToTalkPressed 
        ? 'Release to stop recording' 
        : 'Press and hold to record';
    }
    
    switch (voiceState) {
      case 'listening':
        return 'Stop voice input';
      case 'speaking':
        return 'Voice is speaking';
      case 'processing':
        return 'Processing voice input';
      case 'muted':
        return 'Voice is muted';
      case 'error':
        return 'Voice error - click to retry';
      default:
        return 'Start voice input';
    }
  };
  
  const getMuteButtonLabel = () => {
    return voiceState === 'muted' ? 'Unmute voice' : 'Mute voice';
  };
  
  // Clean up push-to-talk on unmount
  useEffect(() => {
    return () => {
      if (isPushToTalkPressed) {
        onPushToTalk?.(false);
      }
    };
  }, [isPushToTalkPressed, onPushToTalk]);
  
  return (
    <div 
      className={`${styles.voiceControl} ${styles[size]} ${styles[orientation]} ${className}`}
      data-testid={testId}
      data-voice-state={voiceState}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="voice"
      >
        {lastStateChange}
      </ScreenReaderText>
      
      <div className={styles.controlsContainer}>
        {/* Voice activation button with indicator */}
        <div className={styles.voiceButtonContainer}>
          <FocusIndicator
            type="ring"
            modality="voice"
            className={styles.focusIndicator}
          />
          
          <Button
            ref={pushToTalkRef}
            variant={getVoiceButtonVariant()}
            size={atomSize}
            onClick={handleVoiceActivation}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            className={styles.voiceButton}
            aria-label={getVoiceButtonLabel()}
            aria-pressed={voiceState === 'listening' || isPushToTalkPressed}
            data-testid={`${testId}-activate`}
          >
                         <VoiceIcon
               voiceState={voiceState}
               size={atomSize}
               showWaves={voiceState === 'listening'}
               animate={true}
               className={styles.voiceIcon}
             />
          </Button>
          
          {/* Activity indicator overlay */}
          {showActivityIndicator && (voiceState === 'listening' || voiceState === 'speaking') && (
            <div className={styles.activityOverlay}>
                             <VoiceIndicator
                 mode={activityIndicatorType}
                 activityLevel={activityLevel}
                 segments={8}
                 direction={orientation === 'vertical' ? 'vertical' : 'horizontal'}
                 smooth={true}
                 size={atomSize}
                 className={styles.activityIndicator}
               />
            </div>
          )}
        </div>
        
        {/* Mute toggle button */}
        <Button
          variant={voiceState === 'muted' ? 'secondary' : 'ghost'}
          size={atomSize}
          onClick={handleMuteToggle}
          disabled={disabled}
          className={styles.muteButton}
          aria-label={getMuteButtonLabel()}
          aria-pressed={voiceState === 'muted'}
          data-testid={`${testId}-mute`}
        >
                     <VoiceIcon
             voiceState={voiceState === 'muted' ? 'muted' : 'idle'}
             size={atomSize}
           />
        </Button>
        
        {/* Detailed status display */}
        {showDetailedStatus && (
          <div className={styles.statusContainer}>
                         <VoiceStatus
               voiceState={voiceState}
               connectionQuality={connectionQuality}
               inputLevel={audioLevel}
               latency={latency}
               provider={provider}
               layout={orientation === 'compact' ? 'compact' : 'horizontal'}
               showTimestamp={false}
               showLatency={latency > 0}
               showConnectionQuality={true}
               showProvider={orientation !== 'compact'}
               locale="en"
               size={atomSize}
               className={styles.voiceStatus}
             />
          </div>
        )}
      </div>
      
      {/* Control instructions for push-to-talk mode */}
      {pushToTalkMode && (
        <div className={styles.instructions}>
          <span className={styles.instructionText}>
            Press Space or click to talk
          </span>
        </div>
      )}
    </div>
  );
}; 