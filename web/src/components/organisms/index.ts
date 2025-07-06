// Organism components directory ready for Phase 4 development

// Phase 4 Organism Exports
export { default as AdvancedChatInterface } from './AdvancedChatInterface/AdvancedChatInterface';
export { default as ResponsiveAppLayout } from './ResponsiveAppLayout/ResponsiveAppLayout';
export { VisualSearchDashboard } from './VisualSearchDashboard/VisualSearchDashboard';
export { MultiModalControlCenter } from './MultiModalControlCenter/MultiModalControlCenter';
export { default as UserDashboard } from './UserDashboard/UserDashboard';
export { default as SettingsConsole } from './SettingsConsole/SettingsConsole';
export { CameraWorkspace } from './CameraWorkspace/CameraWorkspace';
export { ErrorRecoveryInterface } from './ErrorRecoveryInterface/ErrorRecoveryInterface';

// Organism type definitions
export type { VisualSearchDashboardProps } from './VisualSearchDashboard/VisualSearchDashboard';
export type { MultiModalControlCenterProps } from './MultiModalControlCenter/MultiModalControlCenter';
export type { UserDashboardProps } from './UserDashboard/UserDashboard';
export type { SettingsConsoleProps } from './SettingsConsole/SettingsConsole';
export type { CameraWorkspaceProps } from './CameraWorkspace/CameraWorkspace';
export type { ErrorRecoveryInterfaceProps } from './ErrorRecoveryInterface/ErrorRecoveryInterface';

// Export organism system
export const OrganismSystem = {
  AdvancedChatInterface: 'AdvancedChatInterface',
  ResponsiveAppLayout: 'ResponsiveAppLayout',
  VisualSearchDashboard: 'VisualSearchDashboard',
  MultiModalControlCenter: 'MultiModalControlCenter',
  UserDashboard: 'UserDashboard',
  SettingsConsole: 'SettingsConsole',
  CameraWorkspace: 'CameraWorkspace',
  ErrorRecoveryInterface: 'ErrorRecoveryInterface',
} as const;

export type OrganismType = keyof typeof OrganismSystem;
