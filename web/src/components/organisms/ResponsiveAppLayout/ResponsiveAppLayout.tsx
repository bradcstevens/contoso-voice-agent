import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserProfile } from '../../molecules/UserProfile/UserProfile';
import { CoordinationPanel } from '../../molecules/CoordinationPanel/CoordinationPanel';
import { MultiModalStatus } from '../../molecules/MultiModalStatus/MultiModalStatus';
import { FormField } from '../../molecules/FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Badge } from '../../atoms/Badge/Badge';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './ResponsiveAppLayout.module.css';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  disabled?: boolean;
  requiresProfessional?: boolean;
}

interface LayoutState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  currentView: string;
  adaptiveMode: 'desktop' | 'tablet' | 'mobile';
  professionalMode: boolean;
  notificationCount: number;
}

interface SystemStatus {
  health: 'excellent' | 'good' | 'warning' | 'error';
  uptime: number;
  lastSync: Date;
  activeUsers: number;
  systemLoad: number;
}

export interface ResponsiveAppLayoutProps {
  /** Application name */
  appName?: string;
  /** Current user */
  user?: {
    name: string;
    avatar?: string;
    email: string;
    role: string;
    permissions: string[];
  };
  /** Navigation items */
  navigationItems?: NavigationItem[];
  /** Current active navigation item */
  activeNavItem?: string;
  /** Application content */
  children: React.ReactNode;
  /** Professional mode for enterprise features */
  professionalMode?: boolean;
  /** Show coordination panel */
  showCoordination?: boolean;
  /** Show system status */
  showSystemStatus?: boolean;
  /** Layout variant */
  variant?: 'default' | 'minimal' | 'professional' | 'kiosk';
  /** Initial sidebar state */
  defaultSidebarCollapsed?: boolean;
  /** Enable adaptive behavior */
  adaptiveLayout?: boolean;
  /** System status data */
  systemStatus?: SystemStatus;
  /** Search functionality */
  searchEnabled?: boolean;
  /** Quick actions enabled */
  quickActionsEnabled?: boolean;
  /** Notification system */
  notificationsEnabled?: boolean;
  /** Theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** Event handlers */
  onNavigate?: (item: NavigationItem) => void;
  onSearch?: (query: string) => void;
  onUserProfileUpdate?: (user: any) => void;
  onSystemStatusClick?: () => void;
  onSettingsOpen?: () => void;
  onNotificationClick?: (id: string) => void;
  onThemeToggle?: () => void;
  onLogout?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * ResponsiveAppLayout Organism
 * 
 * Main application shell with adaptive navigation and professional features.
 * Provides complete application infrastructure with responsive design across
 * desktop, tablet, and mobile devices.
 * 
 * Molecular Composition: UserProfile + CoordinationPanel + MultiModalStatus + FormField
 * 
 * Key Features:
 * - Responsive design with adaptive navigation patterns
 * - Professional application shell with status monitoring
 * - WCAG AAA accessibility-compliant navigation and layout
 * - Multi-modal coordination integration
 * - Professional user management and settings
 * - Real-time system status monitoring
 * - Adaptive layout based on screen size and usage patterns
 * - Progressive disclosure for professional features
 */
export const ResponsiveAppLayout: React.FC<ResponsiveAppLayoutProps> = ({
  appName = 'Contoso Voice Agent',
  user = {
    name: 'User',
    avatar: '',
    email: 'user@example.com',
    role: 'user',
    permissions: []
  },
  navigationItems = [
    { id: 'chat', label: 'Chat', icon: 'message-circle', path: '/chat' },
    { id: 'search', label: 'Visual Search', icon: 'camera', path: '/search' },
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings', requiresProfessional: true }
  ],
  activeNavItem = 'chat',
  children,
  professionalMode = false,
  showCoordination = true,
  showSystemStatus = true,
  variant = 'default',
  defaultSidebarCollapsed = false,
  adaptiveLayout = true,
  systemStatus = {
    health: 'good',
    uptime: 3600000,
    lastSync: new Date(),
    activeUsers: 1,
    systemLoad: 35
  },
  searchEnabled = true,
  quickActionsEnabled = true,
  notificationsEnabled = true,
  theme = 'light',
  size = 'medium',
  onNavigate,
  onSearch,
  onUserProfileUpdate,
  onSystemStatusClick,
  onSettingsOpen,
  onNotificationClick,
  onThemeToggle,
  onLogout,
  className = '',
  testId = 'responsive-app-layout'
}) => {
  
  // Layout state management
  const [layoutState, setLayoutState] = useState<LayoutState>({
    sidebarCollapsed: defaultSidebarCollapsed,
    mobileMenuOpen: false,
    currentView: activeNavItem,
    adaptiveMode: 'desktop',
    professionalMode,
    notificationCount: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Adaptive layout detection
  useEffect(() => {
    if (!adaptiveLayout) return;

    const updateAdaptiveMode = () => {
      const width = window.innerWidth;
      let newMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
      
      if (width < 768) {
        newMode = 'mobile';
      } else if (width < 1024) {
        newMode = 'tablet';
      }

      setLayoutState(prev => ({
        ...prev,
        adaptiveMode: newMode,
        sidebarCollapsed: newMode === 'mobile' ? true : prev.sidebarCollapsed,
        mobileMenuOpen: newMode !== 'mobile' ? false : prev.mobileMenuOpen
      }));
    };

    updateAdaptiveMode();
    window.addEventListener('resize', updateAdaptiveMode);
    return () => window.removeEventListener('resize', updateAdaptiveMode);
  }, [adaptiveLayout]);

  // Filter navigation items based on permissions
  const visibleNavigationItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (item.requiresProfessional && !professionalMode) return false;
      if (item.disabled) return false;
      return true;
    });
  }, [navigationItems, professionalMode]);

  // Handle navigation
  const handleNavigate = useCallback((item: NavigationItem) => {
    setLayoutState(prev => ({
      ...prev,
      currentView: item.id,
      mobileMenuOpen: false
    }));
    
    setStatusMessage(`Navigated to ${item.label}`);
    onNavigate?.(item);
  }, [onNavigate]);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }));
    
    setStatusMessage(layoutState.sidebarCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed');
  }, [layoutState.sidebarCollapsed]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setStatusMessage(`Searching for: ${query}`);
    onSearch?.(query);
  }, [onSearch]);

  // User profile configuration
  const userProfileProps = useMemo(() => ({
    user,
    editable: true,
    showStats: professionalMode,
    compact: layoutState.adaptiveMode === 'mobile',
    size: size as 'small' | 'medium' | 'large',
    onUpdate: onUserProfileUpdate,
    className: styles.userProfileCustom
  }), [user, professionalMode, layoutState.adaptiveMode, size, onUserProfileUpdate]);

  // Coordination panel configuration (for professional mode)
  const coordinationPanelProps = useMemo(() => ({
    session: {
      id: 'main-session',
      started: new Date(),
      duration: Math.floor(systemStatus.uptime / 1000),
      interactions: 0,
      mode: {
        type: 'standby' as const,
        priority: 'balanced' as const,
        handoffStrategy: 'auto' as const
      },
      voiceActive: false,
      cameraActive: false,
      recording: false,
      capturing: false
    },
    metrics: {
      responseTime: 150,
      accuracy: 95,
      bandwidth: 1200,
      cpuUsage: systemStatus.systemLoad,
      memoryUsage: 45,
      errorRate: 1
    },
    expertMode: professionalMode,
    showAdvanced: professionalMode,
    layout: 'compact' as const,
    size: size as 'small' | 'medium' | 'large',
    variant: 'minimal' as const,
    collapsible: true,
    defaultCollapsed: layoutState.adaptiveMode === 'mobile',
    className: styles.coordinationPanelCustom
  }), [systemStatus, professionalMode, size, layoutState.adaptiveMode]);

  // Multi-modal status configuration
  const statusProps = useMemo(() => ({
    voiceState: 'idle' as const,
    cameraState: 'idle' as const,
    systemHealth: systemStatus.health,
    connectionQuality: 92,
    latency: 85,
    realTimeUpdates: true,
    updateInterval: 5000, // Less frequent for layout status
    professionalMode,
    showLatencyMetrics: false,
    showSystemHealth: showSystemStatus,
    size: 'small' as const,
    compact: true,
    className: styles.statusCustom
  }), [systemStatus.health, professionalMode, showSystemStatus]);

  // Search field configuration
  const searchFieldProps = useMemo(() => ({
    label: 'Search',
    placeholder: 'Search application...',
    value: searchQuery,
    onChange: setSearchQuery,
    onSubmit: handleSearch,
    searchMode: 'instant' as const,
    size: layoutState.adaptiveMode === 'mobile' ? 'small' : 'medium',
    disabled: !searchEnabled,
    className: styles.searchFieldCustom
  }), [searchQuery, handleSearch, layoutState.adaptiveMode, searchEnabled]);

  // Format uptime
  const formatUptime = useCallback((ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }, []);

  return (
    <div 
      className={`${styles.appLayout} ${styles[variant]} ${styles[layoutState.adaptiveMode]} ${styles[theme]} ${layoutState.sidebarCollapsed ? styles.sidebarCollapsed : ''} ${className}`}
      data-testid={testId}
      data-professional={professionalMode}
      data-adaptive-mode={layoutState.adaptiveMode}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={false}
        modality="text"
      >
        {statusMessage}
      </ScreenReaderText>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          
          {/* Mobile menu toggle */}
          {layoutState.adaptiveMode === 'mobile' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className={styles.mobileMenuToggle}
              aria-label="Toggle navigation menu"
              data-testid={`${testId}-mobile-menu-toggle`}
            >
              <Icon name="menu" size="md" />
            </Button>
          )}

          {/* App branding */}
          <div className={styles.branding}>
            <h1 className={styles.appName}>{appName}</h1>
            {professionalMode && (
              <Badge variant="success" size="sm" className={styles.professionalBadge}>
                Professional
              </Badge>
            )}
          </div>

          {/* Header search (desktop/tablet) */}
          {searchEnabled && layoutState.adaptiveMode !== 'mobile' && (
            <div className={styles.headerSearch}>
              <FormField {...searchFieldProps} />
            </div>
          )}

          {/* Header status */}
          <div className={styles.headerStatus}>
            {showSystemStatus && (
              <MultiModalStatus {...statusProps} />
            )}
          </div>

          {/* Header controls */}
          <div className={styles.headerControls}>
            
            {/* Notifications */}
            {notificationsEnabled && layoutState.notificationCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNotificationClick?.('all')}
                className={styles.notificationButton}
                aria-label={`${layoutState.notificationCount} notifications`}
              >
                <Icon name="bell" size="sm" />
                <Badge variant="danger" size="sm" className={styles.notificationBadge}>
                  {layoutState.notificationCount}
                </Badge>
              </Button>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className={styles.themeToggle}
              aria-label="Toggle theme"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsOpen}
              className={styles.settingsButton}
              aria-label="Open settings"
            >
              <Icon name="settings" size="sm" />
            </Button>

            {/* Sidebar toggle (desktop/tablet) */}
            {layoutState.adaptiveMode !== 'mobile' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSidebarToggle}
                className={styles.sidebarToggle}
                aria-label={layoutState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                data-testid={`${testId}-sidebar-toggle`}
              >
                <Icon name={layoutState.sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'} size="sm" />
              </Button>
            )}

          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        
        {/* Sidebar Navigation */}
        <nav 
          className={`${styles.sidebar} ${layoutState.mobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          aria-label="Main navigation"
        >
          <div className={styles.sidebarContent}>
            
            {/* Mobile search */}
            {searchEnabled && layoutState.adaptiveMode === 'mobile' && (
              <div className={styles.mobileSearch}>
                <FormField {...searchFieldProps} />
              </div>
            )}

            {/* Navigation items */}
            <ul className={styles.navigationList}>
              {visibleNavigationItems.map((item) => (
                <li key={item.id} className={styles.navigationItem}>
                  <button
                    className={`${styles.navigationButton} ${item.id === layoutState.currentView ? styles.active : ''}`}
                    onClick={() => handleNavigate(item)}
                    disabled={item.disabled}
                    aria-current={item.id === layoutState.currentView ? 'page' : undefined}
                    data-testid={`${testId}-nav-${item.id}`}
                  >
                    <Icon name={item.icon} size="sm" className={styles.navigationIcon} />
                    {!layoutState.sidebarCollapsed && (
                      <span className={styles.navigationLabel}>{item.label}</span>
                    )}
                    {item.badge && !layoutState.sidebarCollapsed && (
                      <Badge variant="info" size="sm" className={styles.navigationBadge}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Sidebar footer with user profile */}
            <div className={styles.sidebarFooter}>
              <UserProfile {...userProfileProps} />
              
              {/* Professional coordination panel */}
              {professionalMode && showCoordination && !layoutState.sidebarCollapsed && (
                <div className={styles.sidebarCoordination}>
                  <CoordinationPanel {...coordinationPanelProps} />
                </div>
              )}
            </div>

          </div>
        </nav>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {children}
        </main>

      </div>

      {/* Mobile menu overlay */}
      {layoutState.mobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={handleMobileMenuToggle}
          aria-hidden="true"
        />
      )}

    </div>
  );
};

export default ResponsiveAppLayout; 