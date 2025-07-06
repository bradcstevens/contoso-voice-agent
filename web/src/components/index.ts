/**
 * COMPONENTS INDEX - BARREL EXPORTS FOR TREE-SHAKING
 * 
 * Central export point for all components following atomic design methodology.
 * Enables efficient tree-shaking and organized imports.
 */

// ===========================
// ATOMS - Basic Building Blocks
// ===========================

// Phase 1: Core Atoms (COMPLETE)
export { Button } from './atoms/Button/Button';
export { Icon } from './atoms/Icon/Icon';
export { Input } from './atoms/Input/Input';
export { Label } from './atoms/Label/Label';
export { Badge } from './atoms/Badge/Badge';
export { Avatar } from './atoms/Avatar/Avatar';
export { Spinner } from './atoms/Spinner/Spinner';

// Phase 2: Multi-Modal Atoms (IN PROGRESS)
// Voice atoms - COMPLETE (4/4)
export { VoiceIcon } from './atoms/VoiceIcon/VoiceIcon';
export { VoiceIndicator } from './atoms/VoiceIndicator/VoiceIndicator';
export { VoiceWaveform } from './atoms/VoiceWaveform/VoiceWaveform';
export { VoiceStatus } from './atoms/VoiceStatus/VoiceStatus';

// Camera atoms - COMPLETE (4/4) ✅
export { CameraIcon } from './atoms/CameraIcon/CameraIcon';
export { CameraIndicator } from './atoms/CameraIndicator/CameraIndicator';
export { FocusRing } from './atoms/FocusRing/FocusRing';
export { CaptureRing } from './atoms/CaptureRing/CaptureRing';

// Accessibility atoms - COMPLETE (3/3) ✅
export { FocusIndicator } from './atoms/FocusIndicator/FocusIndicator';
export { ScreenReaderText } from './atoms/ScreenReaderText/ScreenReaderText';
export { LiveRegion } from './atoms/LiveRegion/LiveRegion';

// ===========================
// TYPE EXPORTS
// ===========================

// Phase 1: Core Atom Types
export type { ButtonProps } from './atoms/Button/Button';
export type { IconProps, IconName } from './atoms/Icon/Icon';
export type { InputProps } from './atoms/Input/Input';
export type { LabelProps } from './atoms/Label/Label';
export type { BadgeProps } from './atoms/Badge/Badge';
export type { AvatarProps } from './atoms/Avatar/Avatar';
export type { SpinnerProps } from './atoms/Spinner/Spinner';

// Phase 2: Multi-Modal Atom Types
export type { VoiceIconProps } from './atoms/VoiceIcon/VoiceIcon';
export type { VoiceIndicatorProps } from './atoms/VoiceIndicator/VoiceIndicator';
export type { VoiceWaveformProps } from './atoms/VoiceWaveform/VoiceWaveform';
export type { VoiceStatusProps } from './atoms/VoiceStatus/VoiceStatus';
export type { CameraIconProps } from './atoms/CameraIcon/CameraIcon';
export type { CameraIndicatorProps } from './atoms/CameraIndicator/CameraIndicator';
export type { FocusRingProps } from './atoms/FocusRing/FocusRing';
export type { CaptureRingProps } from './atoms/CaptureRing/CaptureRing';
export type { FocusIndicatorProps } from './atoms/FocusIndicator/FocusIndicator';
export type { ScreenReaderTextProps } from './atoms/ScreenReaderText/ScreenReaderText';
export type { LiveRegionProps } from './atoms/LiveRegion/LiveRegion';

// ===========================
// MOLECULES - Functional Components
// ===========================

// Core molecules (to be implemented)
// export { SearchField } from './molecules/SearchField/SearchField';
// export { FormField } from './molecules/FormField/FormField';
// export { UserProfile } from './molecules/UserProfile/UserProfile';

// Voice interface molecules (to be implemented)
// export { VoiceControl } from './molecules/VoiceControl/VoiceControl';
// export { VoiceSettings } from './molecules/VoiceSettings/VoiceSettings';

// Camera interface molecules (to be implemented)
// export { CameraControl } from './molecules/CameraControl/CameraControl';
// export { CameraSettings } from './molecules/CameraSettings/CameraSettings';

// Multi-modal coordination molecules (to be implemented)
// export { MultiModalStatus } from './molecules/MultiModalStatus/MultiModalStatus';
// export { CoordinationPanel } from './molecules/CoordinationPanel/CoordinationPanel';

// ===========================
// ORGANISMS - Complex UI Sections
// ===========================

// Core interface organisms (existing components to be refactored)
// export { HeaderNavigation } from './organisms/HeaderNavigation/HeaderNavigation';
// export { ChatInterface } from './organisms/ChatInterface/ChatInterface';
// export { FooterInformation } from './organisms/FooterInformation/FooterInformation';

// Voice interface organisms (existing components to be refactored)
// export { VoiceCallInterface } from './organisms/VoiceCallInterface/VoiceCallInterface';
// export { VoiceSettingsPanel } from './organisms/VoiceSettingsPanel/VoiceSettingsPanel';

// Camera interface organisms (existing components to be refactored)
// export { CameraViewfinder } from './organisms/CameraViewfinder/CameraViewfinder';
// export { CameraSettingsPanel } from './organisms/CameraSettingsPanel/CameraSettingsPanel';

// Multi-modal coordination organisms (existing components to be refactored)
// export { MultiModalInterface } from './organisms/MultiModalInterface/MultiModalInterface';
// export { AccessibilityCenter } from './organisms/AccessibilityCenter/AccessibilityCenter';

// ===========================
// LEGACY EXPORTS (EXISTING COMPONENTS)
// ===========================

// These exports provide backward compatibility while we migrate to atomic design
// They will be removed once migration is complete

// Messaging components (to be refactored into atomic structure)
export { default as Chat } from './messaging/chat';
export { default as Voice } from './messaging/voice';
export { default as VoiceInput } from './messaging/voiceinput';
export { default as VoiceSettings } from './messaging/voicesettings';
export { default as Message } from './messaging/message';
export { default as Content } from './messaging/content';
export { default as TypeWriter } from './messaging/typewriter';
export { default as Waiting } from './messaging/waiting';

// Camera components (to be refactored into atomic structure)
export { default as AdvancedCameraWidget } from './messaging/advancedcamerawidget';
export { default as CameraFeedDisplay } from './messaging/camerafeeddisplay';
export { default as CameraFeedContainer } from './messaging/camerafeedcontainer';
export { default as CameraSettingsPanel } from './messaging/camerasettingspanel';
export { default as CameraStatusIndicator } from './messaging/camerastatusindicator';
export { default as CameraControlIcon } from './messaging/cameracontrolicon';
export { default as CaptureButton } from './messaging/capturebutton';
export { default as CaptureInterface } from './messaging/captureinterface';
export { default as CameraPermissionButton } from './messaging/camerapermissionbutton';
export { default as CameraPermissionFlow } from './messaging/camerapermissionflow';
export { default as CameraErrorHandler } from './messaging/cameraerrorhandler';

// Layout components (to be refactored into templates)
export { default as CameraEnabledChatLayout } from './messaging/cameraenabledchatlayout';
export { default as VisualSearchResultsLayout } from './messaging/visualsearchresultslayout';
export { default as MultiModalErrorLayout } from './messaging/multimodalerrorlayout';
export { default as VoiceCallInterfaceLayout } from './messaging/voicecallinterfacelayout';

// Multi-modal coordination (to be refactored into organisms)
export { default as MultiModalOrchestrator } from './messaging/multimodalorchestrator';
export { default as AccessibilityFusionLayer } from './messaging/accessibilityfusionlayer';
export { default as VisualSearchInterface } from './messaging/visualsearchinterface';
export { default as VisualAnalysisDisplay } from './messaging/visualanalysisdisplay';

// Basic layout components
export { default as Section } from './section';
export { default as Block } from './block';
export { default as Header } from './header';
export { default as Footer } from './footer';

// ===========================
// COMPONENT CATEGORIES
// ===========================

/**
 * Component discovery helpers for development
 */
export const COMPONENT_CATEGORIES = {
  atoms: {
    description: 'Basic building blocks that cannot be broken down further',
    core: ['Button', 'Icon', 'Input', 'Label', 'Badge', 'Avatar', 'Spinner'],
    voice: ['VoiceIcon', 'VoiceIndicator', 'VoiceWaveform', 'VoiceStatus'], // Phase 2 voice atoms - COMPLETE
    camera: ['CameraIcon', 'CameraIndicator', 'FocusRing', 'CaptureRing'], // Phase 2 camera atoms - COMPLETE (4/4) ✅
    accessibility: ['FocusIndicator', 'ScreenReaderText', 'LiveRegion'] // Phase 2 accessibility atoms - COMPLETE (3/3) ✅
  },
  molecules: {
    description: 'Functional components made of multiple atoms',
    components: [] // Will populate as we create molecules
  },
  organisms: {
    description: 'Complex UI sections with business logic',
    components: [] // Will populate as we create organisms
  },
  legacy: {
    description: 'Existing components being migrated to atomic design',
    components: [
      'Chat', 'Voice', 'VoiceInput', 'AdvancedCameraWidget', 
      'CameraEnabledChatLayout', 'MultiModalOrchestrator'
    ]
  }
};

/**
 * Migration status tracker
 */
export const MIGRATION_STATUS = {
  phase1: {
    description: 'Core Atoms - Foundation Components',
    status: 'COMPLETE',
    completed: ['Button', 'Icon', 'Input', 'Label', 'Badge', 'Avatar', 'Spinner'],
    total: 7,
    progress: '100%'
  },
  phase2: {
    description: 'Multi-Modal Atoms - Voice, Camera, Accessibility',
    status: 'COMPLETE',
    completed: ['VoiceIcon', 'VoiceIndicator', 'VoiceWaveform', 'VoiceStatus', 'CameraIcon', 'CameraIndicator', 'FocusRing', 'CaptureRing', 'FocusIndicator', 'ScreenReaderText', 'LiveRegion'],
    inProgress: [],
    pending: [],
    total: 11,
    progress: '100%'
  },
  phase3: {
    description: 'Molecules - Functional Components',
    status: 'PENDING',
    completed: [],
    pending: [
      'SearchField', 'FormField', 'UserProfile',
      'VoiceControl', 'VoiceSettings', 'CameraControl', 'CameraSettings',
      'MultiModalStatus', 'CoordinationPanel'
    ],
    total: 9,
    progress: '0%'
  },
  phase4: {
    description: 'Legacy Migration - Existing Component Refactoring',
    status: 'PENDING',
    completed: [],
    pending: [
      'ChatInterface', 'VoiceCallInterface', 'CameraViewfinder',
      'HeaderNavigation', 'FooterInformation', 'AccessibilityCenter'
    ],
    total: 56, // Total messaging components to migrate
    progress: '0%'
  }
};
