/**
 * CAMERA ICON ATOM - ENHANCED CAMERA INTERACTION INDICATOR
 * 
 * Specialized camera icon component with state visualization, activity feedback,
 * permission handling, and comprehensive accessibility for camera interfaces.
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { Icon, IconName } from '../Icon/Icon';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './CameraIcon.module.css';

export interface CameraIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera interaction state */
  cameraState?: 'idle' | 'recording' | 'capturing' | 'processing' | 'permission' | 'error' | 'disabled';
  
  /** Size of the camera icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /** Whether the icon is interactive (clickable) */
  interactive?: boolean;
  
  /** Whether to show animated camera effects */
  showEffects?: boolean;
  
  /** Whether to show focus ring animation */
  showFocusRing?: boolean;
  
  /** Whether to pulse during camera activity */
  pulse?: boolean;
  
  /** Custom icon override for specific states */
  customIcon?: IconName;
  
  /** Whether to show status indicator */
  showStatus?: boolean;
  
  /** Accessibility label for current camera state */
  cameraStateLabel?: string;
  
  /** Whether the camera icon is currently active */
  active?: boolean;
  
  /** Callback when camera icon is clicked */
  onCameraToggle?: () => void;
  
  /** Callback when camera state changes */
  onCameraStateChange?: (state: string) => void;
  
  /** Custom color for active state */
  activeColor?: string;
  
  /** Custom color for inactive state */
  inactiveColor?: string;
  
  /** Whether to animate on state changes */
  animate?: boolean;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Whether this is a capture button */
  captureMode?: boolean;
  
  /** Whether camera permission is granted */
  hasPermission?: boolean;
  
  /** Current recording duration in seconds */
  recordingDuration?: number;
  
  /** Whether to show recording timer */
  showTimer?: boolean;
  
  /** Flash mode indicator */
  flashMode?: 'auto' | 'on' | 'off';
  
  /** Whether camera is currently focused */
  focused?: boolean;
  
  /** Focus confidence level (0-100) */
  focusConfidence?: number;
}

/**
 * Enhanced CameraIcon atom with comprehensive camera interaction support
 */
export const CameraIcon = forwardRef<HTMLDivElement, CameraIconProps>(({
  cameraState = 'idle',
  size = 'md',
  interactive = false,
  showEffects = false,
  showFocusRing = false,
  pulse = false,
  customIcon,
  showStatus = true,
  cameraStateLabel,
  active = false,
  onCameraToggle,
  onCameraStateChange,
  activeColor,
  inactiveColor,
  animate = true,
  animationDuration = 300,
  captureMode = false,
  hasPermission = false,
  recordingDuration = 0,
  showTimer = false,
  flashMode = 'auto',
  focused = false,
  focusConfidence = 0,
  className = '',
  ...rest
}, ref) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  
  // Determine the appropriate icon based on camera state
  const getCameraIcon = (): IconName => {
    if (customIcon) return customIcon;
    
    switch (cameraState) {
      case 'recording':
        return 'video';
      case 'capturing':
        return 'capture';
      case 'processing':
        return 'sync';
      case 'permission':
        return 'camera-off';
      case 'error':
        return 'x';
      case 'disabled':
        return 'camera-off';
      default:
        return 'camera';
    }
  };
  
  // Handle camera state changes
  useEffect(() => {
    if (onCameraStateChange) {
      onCameraStateChange(cameraState);
    }
  }, [cameraState, onCameraStateChange]);
  
  // Handle capture animation
  useEffect(() => {
    if (cameraState === 'capturing' && showEffects) {
      setIsCapturing(true);
      setFlashEffect(true);
      
      const timer = setTimeout(() => {
        setIsCapturing(false);
        setFlashEffect(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [cameraState, showEffects]);
  
  // Handle camera toggle
  const handleClick = () => {
    if (interactive) {
      onCameraToggle?.();
    }
  };
  
  // Keyboard support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === ' ' || event.key === 'Enter') && interactive) {
      event.preventDefault();
      onCameraToggle?.();
    }
  };
  
  // Class computation
  const computedClassName = [
    styles.cameraIcon,
    styles[size],
    styles[cameraState],
    interactive && styles.interactive,
    active && styles.active,
    pulse && styles.pulse,
    animate && styles.animate,
    showEffects && styles.withEffects,
    showFocusRing && styles.withFocusRing,
    captureMode && styles.captureMode,
    focused && styles.focused,
    isCapturing && styles.capturing,
    flashEffect && styles.flash,
    className
  ].filter(Boolean).join(' ');
  
  // Custom styling
  const customStyles = {
    ...(activeColor && { '--camera-active-color': activeColor }),
    ...(inactiveColor && { '--camera-inactive-color': inactiveColor }),
    ...(animationDuration && { '--animation-duration': `${animationDuration}ms` }),
    '--focus-confidence': `${focusConfidence}%`,
    '--recording-duration': recordingDuration
  };
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': interactive ? 'button' : 'img',
    'aria-label': cameraStateLabel || `Camera ${cameraState}${captureMode ? ' (capture)' : ''}`,
    'aria-pressed': interactive ? active : undefined,
    'tabIndex': interactive ? 0 : undefined,
    'aria-describedby': showStatus ? `${rest.id || 'camera'}-status` : undefined,
    'aria-live': cameraState === 'recording' ? 'polite' : undefined
  };
  
  // Format recording duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
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
      {/* Focus ring for camera focus */}
      {showFocusRing && focused && (
        <div 
          className={styles.focusRing}
          style={{ '--focus-strength': focusConfidence / 100 }}
          aria-hidden="true"
        />
      )}
      
      {/* Flash effect overlay */}
      {flashEffect && (
        <div className={styles.flashOverlay} aria-hidden="true" />
      )}
      
      {/* Main camera icon */}
      <Icon
        name={getCameraIcon()}
        size={size}
        className={styles.icon}
        aria-hidden="true"
      />
      
      {/* Flash mode indicator */}
      {flashMode !== 'auto' && (
        <div className={`${styles.flashIndicator} ${styles[flashMode]}`} aria-hidden="true">
          <Icon
            name={flashMode === 'on' ? 'flash' : 'flash-off'}
            size="xs"
          />
        </div>
      )}
      
      {/* Recording timer */}
      {showTimer && cameraState === 'recording' && recordingDuration > 0 && (
        <div className={styles.timer} aria-hidden="true">
          {formatDuration(recordingDuration)}
        </div>
      )}
      
      {/* Status indicator */}
      {showStatus && (
        <div 
          className={`${styles.status} ${styles[cameraState]}`}
          aria-hidden="true"
        />
      )}
      
      {/* Permission overlay */}
      {!hasPermission && cameraState === 'permission' && (
        <div className={styles.permissionOverlay} aria-hidden="true">
          <Icon name="warning" size="xs" />
        </div>
      )}
      
      {/* Screen reader status */}
      {showStatus && (
        <div 
          id={`${rest.id || 'camera'}-status`}
          className={styles.srOnly}
        >
          Camera {cameraState}
          {cameraState === 'recording' && recordingDuration > 0 && `, recording for ${formatDuration(recordingDuration)}`}
          {focused && `, focused`}
          {!hasPermission && `, permission required`}
        </div>
      )}
    </div>
  );
});

CameraIcon.displayName = 'CameraIcon';

export default CameraIcon;
