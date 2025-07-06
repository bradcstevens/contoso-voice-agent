/**
 * VOICE STATUS ATOM - COMPREHENSIVE VOICE STATE STATUS
 * 
 * Professional voice status component with multi-language support, detailed state information,
 * accessibility features, and comprehensive voice interaction status management.
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { Icon, IconName } from '../Icon/Icon';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './VoiceStatus.module.css';

export interface VoiceStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current voice state */
  voiceState?: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled' | 'connecting' | 'disconnected';
  
  /** Size of the status display */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical' | 'compact';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'minimal';
  
  /** Whether to show status text */
  showText?: boolean;
  
  /** Whether to show detailed information */
  showDetails?: boolean;
  
  /** Whether to show an icon */
  showIcon?: boolean;
  
  /** Custom status text override */
  statusText?: string;
  
  /** Additional details to display */
  details?: string;
  
  /** Voice connection quality (0-100) */
  connectionQuality?: number;
  
  /** Audio input level (0-100) */
  inputLevel?: number;
  
  /** Audio output level (0-100) */
  outputLevel?: number;
  
  /** Language/locale for status text */
  locale?: string;
  
  /** Whether to show connection quality indicator */
  showConnectionQuality?: boolean;
  
  /** Whether to show audio levels */
  showAudioLevels?: boolean;
  
  /** Connection latency in milliseconds */
  latency?: number;
  
  /** Whether to show latency information */
  showLatency?: boolean;
  
  /** Voice service provider name */
  provider?: string;
  
  /** Whether to show provider information */
  showProvider?: boolean;
  
  /** Error message for error states */
  errorMessage?: string;
  
  /** Whether the status is clickable */
  interactive?: boolean;
  
  /** Callback when status is clicked */
  onStatusClick?: () => void;
  
  /** Custom icon override */
  customIcon?: IconName;
  
  /** Whether to animate state transitions */
  animate?: boolean;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  
  /** Last state change timestamp */
  timestamp?: Date;
  
  /** Whether to auto-hide after duration */
  autoHide?: boolean;
  
  /** Auto-hide duration in milliseconds */
  autoHideDuration?: number;
  
  /** Callback when status auto-hides */
  onAutoHide?: () => void;
}

// Status text translations
const STATUS_TRANSLATIONS = {
  en: {
    idle: 'Voice Ready',
    listening: 'Listening...',
    speaking: 'Speaking',
    processing: 'Processing...',
    muted: 'Muted',
    error: 'Voice Error',
    disabled: 'Voice Disabled',
    connecting: 'Connecting...',
    disconnected: 'Disconnected'
  },
  es: {
    idle: 'Voz Lista',
    listening: 'Escuchando...',
    speaking: 'Hablando',
    processing: 'Procesando...',
    muted: 'Silenciado',
    error: 'Error de Voz',
    disabled: 'Voz Deshabilitada',
    connecting: 'Conectando...',
    disconnected: 'Desconectado'
  },
  fr: {
    idle: 'Voix Prête',
    listening: 'Écoute...',
    speaking: 'Parlant',
    processing: 'Traitement...',
    muted: 'Muet',
    error: 'Erreur Vocale',
    disabled: 'Voix Désactivée',
    connecting: 'Connexion...',
    disconnected: 'Déconnecté'
  },
  de: {
    idle: 'Stimme Bereit',
    listening: 'Höre zu...',
    speaking: 'Sprechen',
    processing: 'Verarbeitung...',
    muted: 'Stumm',
    error: 'Sprachfehler',
    disabled: 'Stimme Deaktiviert',
    connecting: 'Verbinden...',
    disconnected: 'Getrennt'
  }
};

/**
 * Enhanced VoiceStatus atom with comprehensive voice state management
 */
export const VoiceStatus = forwardRef<HTMLDivElement, VoiceStatusProps>(({
  voiceState = 'idle',
  size = 'md',
  layout = 'horizontal',
  variant = 'default',
  showText = true,
  showDetails = false,
  showIcon = true,
  statusText,
  details,
  connectionQuality = 100,
  inputLevel = 0,
  outputLevel = 0,
  locale = 'en',
  showConnectionQuality = false,
  showAudioLevels = false,
  latency = 0,
  showLatency = false,
  provider,
  showProvider = false,
  errorMessage,
  interactive = false,
  onStatusClick,
  customIcon,
  animate = true,
  animationDuration = 300,
  showTimestamp = false,
  timestamp,
  autoHide = false,
  autoHideDuration = 5000,
  onAutoHide,
  className = '',
  ...rest
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastStateChange, setLastStateChange] = useState<Date>(timestamp || new Date());
  
  // Get localized status text
  const getStatusText = () => {
    if (statusText) return statusText;
    
    const translations = STATUS_TRANSLATIONS[locale as keyof typeof STATUS_TRANSLATIONS] || STATUS_TRANSLATIONS.en;
    return translations[voiceState] || voiceState;
  };
  
  // Get appropriate icon for voice state
  const getStateIcon = (): IconName => {
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
      case 'connecting':
        return 'wifi';
      case 'disconnected':
        return 'wifi-off';
      default:
        return 'microphone';
    }
  };
  
  // Format connection quality
  const getConnectionQualityText = () => {
    if (connectionQuality >= 80) return 'Excellent';
    if (connectionQuality >= 60) return 'Good';
    if (connectionQuality >= 40) return 'Fair';
    if (connectionQuality >= 20) return 'Poor';
    return 'Very Poor';
  };
  
  // Format latency display
  const getLatencyText = () => {
    return `${latency}ms`;
  };
  
  // Format timestamp
  const getTimestampText = () => {
    if (!timestamp && !lastStateChange) return '';
    
    const time = timestamp || lastStateChange;
    return time.toLocaleTimeString(locale, { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Handle state changes
  useEffect(() => {
    if (!timestamp) {
      setLastStateChange(new Date());
    }
  }, [voiceState, timestamp]);
  
  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide || voiceState === 'error') return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      onAutoHide?.();
    }, autoHideDuration);
    
    return () => clearTimeout(timer);
  }, [voiceState, autoHide, autoHideDuration, onAutoHide]);
  
  // Handle click
  const handleClick = () => {
    if (interactive) {
      onStatusClick?.();
    }
  };
  
  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (interactive && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      onStatusClick?.();
    }
  };
  
  // Class computation
  const computedClassName = [
    styles.voiceStatus,
    styles[size],
    styles[layout],
    styles[variant],
    styles[voiceState],
    interactive && styles.interactive,
    animate && styles.animate,
    !isVisible && styles.hidden,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(animationDuration && { '--animation-duration': `${animationDuration}ms` }),
    '--connection-quality': `${connectionQuality}%`,
    '--input-level': `${inputLevel}%`,
    '--output-level': `${outputLevel}%`
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': interactive ? 'button' : 'status',
    'aria-label': `Voice status: ${getStatusText()}${connectionQuality < 100 ? `, connection quality: ${getConnectionQualityText()}` : ''}`,
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'tabIndex': interactive ? 0 : undefined
  };
  
  if (!isVisible) return null;
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      style={customStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...accessibilityProps}
      {...rest}
    >
      {/* Main status content */}
      <div className={styles.content}>
        {/* Icon */}
        {showIcon && (
          <div className={styles.iconContainer}>
            <Icon
              name={getStateIcon()}
              size={size === 'xs' ? 'xs' : size === 'xl' ? 'lg' : 'sm'}
              className={styles.icon}
              aria-hidden="true"
            />
          </div>
        )}
        
        {/* Text content */}
        {showText && (
          <div className={styles.textContainer}>
            <div className={styles.statusText}>
              {getStatusText()}
            </div>
            
            {showDetails && details && (
              <div className={styles.details}>
                {details}
              </div>
            )}
            
            {voiceState === 'error' && errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        {showTimestamp && (
          <div className={styles.timestamp}>
            {getTimestampText()}
          </div>
        )}
      </div>
      
      {/* Additional information */}
      {(showConnectionQuality || showAudioLevels || showLatency || showProvider) && (
        <div className={styles.additionalInfo}>
          {/* Connection quality */}
          {showConnectionQuality && (
            <div className={styles.connectionQuality}>
              <Icon name="wifi" size="xs" aria-hidden="true" />
              <span>{getConnectionQualityText()}</span>
              <div 
                className={styles.qualityBar}
                style={{ '--quality': `${connectionQuality}%` }}
                aria-hidden="true"
              />
            </div>
          )}
          
          {/* Audio levels */}
          {showAudioLevels && (inputLevel > 0 || outputLevel > 0) && (
            <div className={styles.audioLevels}>
              {inputLevel > 0 && (
                <div className={styles.inputLevel}>
                  <Icon name="microphone" size="xs" aria-hidden="true" />
                  <div 
                    className={styles.levelBar}
                    style={{ '--level': `${inputLevel}%` }}
                    aria-label={`Input level: ${inputLevel}%`}
                  />
                </div>
              )}
              
              {outputLevel > 0 && (
                <div className={styles.outputLevel}>
                  <Icon name="volume" size="xs" aria-hidden="true" />
                  <div 
                    className={styles.levelBar}
                    style={{ '--level': `${outputLevel}%` }}
                    aria-label={`Output level: ${outputLevel}%`}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Latency */}
          {showLatency && latency > 0 && (
            <div className={styles.latency}>
              <Icon name="timer" size="xs" aria-hidden="true" />
              <span>{getLatencyText()}</span>
            </div>
          )}
          
          {/* Provider */}
          {showProvider && provider && (
            <div className={styles.provider}>
              <span>{provider}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

VoiceStatus.displayName = 'VoiceStatus';

export default VoiceStatus;
