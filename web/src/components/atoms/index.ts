/**
 * ATOMS INDEX - ENHANCED DESIGN SYSTEM
 * 
 * Central export file for all atomic design system components,
 * including mobile-first camera controls and multi-modal support.
 */

// Core UI Atoms
export { Avatar } from './Avatar/Avatar';
export { Badge } from './Badge/Badge';
export { Button } from './Button/Button';
export { Icon } from './Icon/Icon';
export { Input } from './Input/Input';
export { Label } from './Label/Label';
export { Spinner } from './Spinner/Spinner';

// Camera-Specific Atoms
export { CameraIcon } from './CameraIcon/CameraIcon';
export { CameraIndicator } from './CameraIndicator/CameraIndicator';
export { CaptureRing } from './CaptureRing/CaptureRing';
export { FocusRing } from './FocusRing/FocusRing';

// Voice-Specific Atoms
export { VoiceIcon } from './VoiceIcon/VoiceIcon';
export { VoiceIndicator } from './VoiceIndicator/VoiceIndicator';
export { VoiceStatus } from './VoiceStatus/VoiceStatus';
export { VoiceWaveform } from './VoiceWaveform/VoiceWaveform';

// Accessibility Atoms
export { FocusIndicator } from './FocusIndicator/FocusIndicator';
export { LiveRegion } from './LiveRegion/LiveRegion';
export { ScreenReaderText } from './ScreenReaderText/ScreenReaderText';

// Mobile-First Camera Control Atoms (NEW)
export { TouchCaptureButton } from './TouchCaptureButton/TouchCaptureButton';
export { AdvancedGestureArea } from './GestureArea/GestureArea';

// Type exports
export type { AvatarProps } from './Avatar/Avatar';
export type { BadgeProps } from './Badge/Badge';
export type { ButtonProps } from './Button/Button';
export type { IconProps, IconName } from './Icon/Icon';
export type { InputProps } from './Input/Input';
export type { LabelProps } from './Label/Label';
export type { SpinnerProps } from './Spinner/Spinner';

// Camera atom types
export type { CameraIconProps } from './CameraIcon/CameraIcon';
export type { CameraIndicatorProps } from './CameraIndicator/CameraIndicator';
export type { CaptureRingProps } from './CaptureRing/CaptureRing';
export type { FocusRingProps } from './FocusRing/FocusRing';

// Voice atom types
export type { VoiceIconProps } from './VoiceIcon/VoiceIcon';
export type { VoiceIndicatorProps } from './VoiceIndicator/VoiceIndicator';
export type { VoiceStatusProps } from './VoiceStatus/VoiceStatus';
export type { VoiceWaveformProps } from './VoiceWaveform/VoiceWaveform';

// Accessibility atom types
export type { FocusIndicatorProps } from './FocusIndicator/FocusIndicator';
export type { LiveRegionProps } from './LiveRegion/LiveRegion';
export type { ScreenReaderTextProps } from './ScreenReaderText/ScreenReaderText';

// Mobile-first atom types (NEW)
export type { TouchCaptureButtonProps } from './TouchCaptureButton/TouchCaptureButton';
export type { AdvancedGestureAreaProps } from './GestureArea/GestureArea';

// Atom system configuration
export const AtomSystem = {
  // Core UI
  Avatar: 'Avatar',
  Badge: 'Badge',
  Button: 'Button',
  Icon: 'Icon',
  Input: 'Input',
  Label: 'Label',
  Spinner: 'Spinner',
  
  // Camera
  CameraIcon: 'CameraIcon',
  CameraIndicator: 'CameraIndicator',
  CaptureRing: 'CaptureRing',
  FocusRing: 'FocusRing',
  
  // Voice
  VoiceIcon: 'VoiceIcon',
  VoiceIndicator: 'VoiceIndicator',
  VoiceStatus: 'VoiceStatus',
  VoiceWaveform: 'VoiceWaveform',
  
  // Accessibility
  FocusIndicator: 'FocusIndicator',
  LiveRegion: 'LiveRegion',
  ScreenReaderText: 'ScreenReaderText',
  
  // Mobile-First (NEW)
  TouchCaptureButton: 'TouchCaptureButton',
  GestureArea: 'GestureArea',
} as const;

export type AtomType = keyof typeof AtomSystem; 