/**
 * VOICE ICON ATOM - ENHANCED VOICE INTERACTION INDICATOR
 * 
 * Specialized voice icon component with state visualization, activity feedback,
 * voice detection integration, and comprehensive accessibility for voice interfaces.
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { Icon, IconName } from '../Icon/Icon';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './VoiceIcon.module.css';

export interface VoiceIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Voice interaction state */
  voiceState?: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled';
  
  /** Size of the voice icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /** Whether the icon is interactive (clickable) */
  interactive?: boolean;
  
  /** Voice activity level (0-100) for visual feedback */
  activityLevel?: number;
  
  /** Whether to show animated voice waves */
  showWaves?: boolean;
  
  /** Number of wave rings to display */
  waveCount?: number;
  
  /** Whether to pulse during voice activity */
  pulse?: boolean;
  
  /** Custom icon override for specific states */
  customIcon?: IconName;
  
  /** Whether to show status indicator */
  showStatus?: boolean;
  
  /** Accessibility label for current voice state */
  voiceStateLabel?: string;
  
  /** Whether the voice icon is currently active */
  active?: boolean;
  
  /** Callback when voice icon is clicked */
  onVoiceToggle?: () => void;
  
  /** Callback when voice state changes */
  onVoiceStateChange?: (state: string) => void;
  
  /** Custom color for active state */
  activeColor?: string;
  
  /** Custom color for inactive state */
  inactiveColor?: string;
  
  /** Whether to animate on state changes */
  animate?: boolean;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Whether this is a push-to-talk button */
  pushToTalk?: boolean;
  
  /** Whether voice detection is enabled */
  voiceDetection?: boolean;
  
  /** Voice activation threshold */
  activationThreshold?: number;
}

/**
 * Enhanced VoiceIcon atom with comprehensive voice interaction support
 */
export const VoiceIcon = forwardRef<HTMLDivElement, VoiceIconProps>(({
  voiceState = 'idle',
  size = 'md',
  interactive = false,
  activityLevel = 0,
  showWaves = false,
  waveCount = 3,
  pulse = false,
  customIcon,
  showStatus = true,
  voiceStateLabel,
  active = false,
  onVoiceToggle,
  onVoiceStateChange,
  activeColor,
  inactiveColor,
  animate = true,
  animationDuration = 300,
  pushToTalk = false,
  voiceDetection = false,
  activationThreshold = 50,
  className = '',
  ...rest
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activityLevel);
  
  // Determine the appropriate icon based on voice state
  const getVoiceIcon = (): IconName => {
    if (customIcon) return customIcon;
    
    switch (voiceState) {
      case 'listening':
        return 'microphone';
      case 'speaking':
        return 'volume';
      case 'processing':
        return 'sync';
      case 'muted':
        return 'microphone-off';
      case 'error':
        return 'x';
      case 'disabled':
        return 'microphone-off';
      default:
        return 'microphone';
    }
  };
  
  // Update activity level
  useEffect(() => {
    if (voiceDetection && voiceState === 'listening') {
      // Simulate voice activity detection
      const interval = setInterval(() => {
        const newActivity = Math.random() * 100;
        setCurrentActivity(newActivity);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setCurrentActivity(activityLevel);
    }
  }, [voiceDetection, voiceState, activityLevel]);
  
  // Handle voice state changes
  useEffect(() => {
    if (onVoiceStateChange) {
      onVoiceStateChange(voiceState);
    }
  }, [voiceState, onVoiceStateChange]);
  
  // Handle push-to-talk functionality
  const handleMouseDown = () => {
    if (pushToTalk && interactive) {
      setIsPressed(true);
      onVoiceToggle?.();
    }
  };
  
  const handleMouseUp = () => {
    if (pushToTalk && interactive) {
      setIsPressed(false);
      onVoiceToggle?.();
    }
  };
  
  const handleClick = () => {
    if (!pushToTalk && interactive) {
      onVoiceToggle?.();
    }
  };
  
  // Keyboard support for push-to-talk
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (pushToTalk && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      setIsPressed(true);
      onVoiceToggle?.();
    }
  };
  
  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (pushToTalk && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      setIsPressed(false);
      onVoiceToggle?.();
    }
  };
  
  // Class computation
  const computedClassName = [
    styles.voiceIcon,
    styles[size],
    styles[voiceState],
    interactive && styles.interactive,
    active && styles.active,
    pulse && styles.pulse,
    animate && styles.animate,
    showWaves && styles.withWaves,
    pushToTalk && styles.pushToTalk,
    isPressed && styles.pressed,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(activeColor && { '--voice-active-color': activeColor }),
    ...(inactiveColor && { '--voice-inactive-color': inactiveColor }),
    ...(animationDuration && { '--animation-duration': `${animationDuration}ms` }),
    '--activity-level': `${currentActivity}%`,
    '--activation-threshold': `${activationThreshold}%`
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': interactive ? 'button' : 'img',
    'aria-label': voiceStateLabel || `Voice ${voiceState}${pushToTalk ? ' (push to talk)' : ''}`,
    'aria-pressed': pushToTalk ? isPressed : active,
    'tabIndex': interactive ? 0 : undefined,
    'aria-describedby': showStatus ? `${rest.id || 'voice'}-status` : undefined,
    'aria-live': voiceDetection ? 'polite' : undefined
  };
  
  // Generate wave rings
  const renderWaves = () => {
    if (!showWaves || voiceState === 'idle' || voiceState === 'muted' || voiceState === 'disabled') {
      return null;
    }
    
    return Array.from({ length: waveCount }, (_, index) => (
      <div
        key={index}
        className={styles.wave}
        style={{
          animationDelay: `${index * 200}ms`,
          '--wave-scale': `${1 + (index * 0.3)}`
        }}
      />
    ));
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Handle mouse leave to reset state
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      {...accessibilityProps}
      {...rest}
    >
      {/* Wave rings for voice activity */}
      {renderWaves()}
      
      {/* Main voice icon */}
      <Icon
        name={getVoiceIcon()}
        size={size}
        className={styles.icon}
        aria-hidden="true"
      />
      
      {/* Activity indicator */}
      {voiceDetection && currentActivity > activationThreshold && (
        <div 
          className={styles.activityIndicator}
          style={{ '--activity-intensity': `${currentActivity / 100}` }}
          aria-hidden="true"
        />
      )}
      
      {/* Status indicator */}
      {showStatus && (
        <div 
          className={`${styles.status} ${styles[voiceState]}`}
          aria-hidden="true"
        />
      )}
      
      {/* Screen reader status */}
      {showStatus && (
        <div 
          id={`${rest.id || 'voice'}-status`}
          className={styles.srOnly}
        >
          Voice {voiceState}
          {voiceDetection && currentActivity > activationThreshold && ', voice detected'}
          {pushToTalk && isPressed && ', recording'}
        </div>
      )}
    </div>
  );
});

VoiceIcon.displayName = 'VoiceIcon';

export default VoiceIcon;
