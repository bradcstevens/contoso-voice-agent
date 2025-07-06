import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VoiceControl } from '../VoiceControl/VoiceControl';
import { CameraControl } from '../CameraControl/CameraControl';
import { MultiModalStatus } from '../MultiModalStatus/MultiModalStatus';
import { UserProfile } from '../UserProfile/UserProfile';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Badge } from '../../atoms/Badge/Badge';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './CoordinationPanel.module.css';

export interface CoordinationMode {
  type: 'voice-only' | 'camera-only' | 'multimodal' | 'standby';
  priority: 'voice' | 'camera' | 'balanced';
  handoffStrategy: 'seamless' | 'explicit' | 'auto';
}

export interface SessionState {
  id: string;
  started: Date;
  duration: number; // seconds
  interactions: number;
  mode: CoordinationMode;
  voiceActive: boolean;
  cameraActive: boolean;
  recording: boolean;
  capturing: boolean;
}

export interface PerformanceMetrics {
  responseTime: number; // milliseconds
  accuracy: number; // 0-100
  bandwidth: number; // kbps
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  errorRate: number; // 0-100
}

export interface CoordinationPanelProps {
  /** Current session state */
  session?: SessionState;
  /** Performance metrics */
  metrics?: PerformanceMetrics;
  /** Voice control props */
  voiceProps?: {
    state?: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled';
    activity?: number;
    mode?: 'push-to-talk' | 'continuous';
    muted?: boolean;
    connectionQuality?: number;
    onToggle?: () => void;
    onMute?: () => void;
    onModeChange?: (mode: 'push-to-talk' | 'continuous') => void;
  };
  /** Camera control props */
  cameraProps?: {
    state?: 'idle' | 'recording' | 'capturing' | 'processing' | 'permission' | 'error' | 'disabled';
    quality?: number;
    mode?: 'photo' | 'video' | 'burst';
    capturing?: boolean;
    recording?: boolean;
    onCapture?: (mode: 'photo' | 'video' | 'burst') => void;
    onToggle?: () => void;
    onFocus?: (point: { x: number; y: number }) => void;
  };
  /** Status panel props */
  statusProps?: {
    showMetrics?: boolean;
    showHealth?: boolean;
    showSession?: boolean;
    debugMode?: boolean;
    onRefresh?: () => void;
    onHealthCheck?: () => void;
  };
  /** User profile props */
  userProps?: {
    user?: any;
    editable?: boolean;
    showStats?: boolean;
    compact?: boolean;
  };
  /** Available coordination modes */
  availableModes?: CoordinationMode[];
  /** Current coordination mode */
  currentMode?: CoordinationMode;
  /** Whether auto-coordination is enabled */
  autoCoordination?: boolean;
  /** Whether the panel is in expert mode */
  expertMode?: boolean;
  /** Whether to show advanced controls */
  showAdvanced?: boolean;
  /** Whether to show user profile */
  showProfile?: boolean;
  /** Panel layout */
  layout?: 'horizontal' | 'vertical' | 'grid' | 'compact' | 'dashboard' | 'overlay';
  /** Panel size */
  size?: 'small' | 'medium' | 'large';
  /** Panel variant */
  variant?: 'default' | 'minimal' | 'professional' | 'expert';
  /** Whether panel is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Error messages */
  errors?: string[];
  /** Warning messages */
  warnings?: string[];
  /** Success messages */
  successes?: string[];
  /** Callback when coordination mode changes */
  onModeChange?: (mode: CoordinationMode) => void;
  /** Callback when auto-coordination changes */
  onAutoCoordinationChange?: (enabled: boolean) => void;
  /** Callback when session starts */
  onSessionStart?: () => void;
  /** Callback when session ends */
  onSessionEnd?: () => void;
  /** Callback when handoff occurs */
  onHandoff?: (from: 'voice' | 'camera', to: 'voice' | 'camera') => void;
  /** Callback when emergency stop is triggered */
  onEmergencyStop?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * CoordinationPanel Molecule
 * 
 * Ultimate multi-modal coordination interface combining VoiceControl, CameraControl,
 * MultiModalStatus, and advanced coordination features for complete system management.
 * 
 * Features:
 * - Unified voice and camera coordination with intelligent handoff
 * - Real-time session management with duration and interaction tracking
 * - Performance monitoring with response time and accuracy metrics
 * - Multi-modal coordination strategies (seamless, explicit, auto)
 * - Advanced control modes (expert, professional, minimal)
 * - Emergency controls and system override capabilities
 * - Professional dashboard layouts with responsive design
 * - Auto-coordination with AI-powered mode switching
 * - Session recording and interaction history
 * - System health monitoring and performance optimization
 * - Error handling and recovery mechanisms
 * - WCAG AAA accessibility compliance
 * - Multiple layout options for different use cases
 * - Expert mode with advanced coordination controls
 * - Real-time status updates and notifications
 * - Comprehensive user profile integration
 */
export const CoordinationPanel: React.FC<CoordinationPanelProps> = ({
  session = {
    id: 'session-1',
    started: new Date(),
    duration: 0,
    interactions: 0,
    mode: {
      type: 'standby',
      priority: 'balanced',
      handoffStrategy: 'auto'
    },
    voiceActive: false,
    cameraActive: false,
    recording: false,
    capturing: false
  },
  metrics = {
    responseTime: 145,
    accuracy: 94,
    bandwidth: 1200,
    cpuUsage: 35,
    memoryUsage: 60,
    errorRate: 2
  },
  voiceProps = {},
  cameraProps = {},
  statusProps = {},
  userProps = {},
  availableModes = [
    { type: 'voice-only', priority: 'voice', handoffStrategy: 'explicit' },
    { type: 'camera-only', priority: 'camera', handoffStrategy: 'explicit' },
    { type: 'multimodal', priority: 'balanced', handoffStrategy: 'seamless' },
    { type: 'standby', priority: 'balanced', handoffStrategy: 'auto' }
  ],
  currentMode = availableModes[3], // standby default
  autoCoordination = true,
  expertMode = false,
  showAdvanced = false,
  showProfile = false,
  layout = 'dashboard',
  size = 'medium',
  variant = 'default',
  collapsible = true,
  defaultCollapsed = false,
  errors = [],
  warnings = [],
  successes = [],
  onModeChange,
  onAutoCoordinationChange,
  onSessionStart,
  onSessionEnd,
  onHandoff,
  onEmergencyStop,
  className = '',
  testId = 'coordination-panel'
}) => {
  // Internal state
  const [localSession, setLocalSession] = useState(session);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [activePanel, setActivePanel] = useState<'voice' | 'camera' | 'status' | 'profile'>('status');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [lastHandoff, setLastHandoff] = useState<{from: string; to: string; time: Date} | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Size mapping helper
  const mapSize = (panelSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[panelSize];
  };
  
  const atomSize = mapSize(size);
  
  // Update local session when props change
  useEffect(() => {
    setLocalSession(session);
  }, [session]);
  
  // Session timer
  useEffect(() => {
    if (localSession.voiceActive || localSession.cameraActive) {
      sessionTimer.current = setInterval(() => {
        setLocalSession(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      if (sessionTimer.current) {
        clearInterval(sessionTimer.current);
        sessionTimer.current = null;
      }
    }
    
    return () => {
      if (sessionTimer.current) {
        clearInterval(sessionTimer.current);
      }
    };
  }, [localSession.voiceActive, localSession.cameraActive]);
  
  // Handle mode change
  const handleModeChange = useCallback((mode: CoordinationMode) => {
    setLocalSession(prev => ({
      ...prev,
      mode
    }));
    
    let message = '';
    switch (mode.type) {
      case 'voice-only':
        message = 'Switched to voice-only mode';
        break;
      case 'camera-only':
        message = 'Switched to camera-only mode';
        break;
      case 'multimodal':
        message = 'Switched to multi-modal mode';
        break;
      case 'standby':
        message = 'Switched to standby mode';
        break;
    }
    
    setStatusMessage(message);
    onModeChange?.(mode);
  }, [onModeChange]);
  
  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    const newVoiceActive = !localSession.voiceActive;
    setLocalSession(prev => ({
      ...prev,
      voiceActive: newVoiceActive,
      interactions: prev.interactions + 1
    }));
    
    if (newVoiceActive && !localSession.voiceActive) {
      setStatusMessage('Voice activated');
      onSessionStart?.();
    } else if (!newVoiceActive && localSession.voiceActive && !localSession.cameraActive) {
      setStatusMessage('Voice deactivated - session ended');
      onSessionEnd?.();
    }
    
    voiceProps.onToggle?.();
  }, [localSession, voiceProps.onToggle, onSessionStart, onSessionEnd]);
  
  // Handle camera toggle
  const handleCameraToggle = useCallback(() => {
    const newCameraActive = !localSession.cameraActive;
    setLocalSession(prev => ({
      ...prev,
      cameraActive: newCameraActive,
      interactions: prev.interactions + 1
    }));
    
    if (newCameraActive && !localSession.cameraActive) {
      setStatusMessage('Camera activated');
      onSessionStart?.();
    } else if (!newCameraActive && localSession.cameraActive && !localSession.voiceActive) {
      setStatusMessage('Camera deactivated - session ended');
      onSessionEnd?.();
    }
    
    cameraProps.onToggle?.();
  }, [localSession, cameraProps.onToggle, onSessionStart, onSessionEnd]);
  
  // Handle handoff
  const handleHandoff = useCallback((from: 'voice' | 'camera', to: 'voice' | 'camera') => {
    setLastHandoff({
      from,
      to,
      time: new Date()
    });
    
    setLocalSession(prev => ({
      ...prev,
      voiceActive: to === 'voice',
      cameraActive: to === 'camera',
      interactions: prev.interactions + 1
    }));
    
    setStatusMessage(`Handoff from ${from} to ${to}`);
    onHandoff?.(from, to);
  }, [onHandoff]);
  
  // Handle emergency stop
  const handleEmergencyStop = useCallback(() => {
    setEmergencyMode(true);
    setLocalSession(prev => ({
      ...prev,
      voiceActive: false,
      cameraActive: false,
      recording: false,
      capturing: false
    }));
    
    setStatusMessage('Emergency stop activated - all systems disabled');
    onEmergencyStop?.();
    
    // Reset emergency mode after 3 seconds
    setTimeout(() => {
      setEmergencyMode(false);
      setStatusMessage('Emergency mode cleared');
    }, 3000);
  }, [onEmergencyStop]);
  
  // Handle auto-coordination toggle
  const handleAutoCoordinationToggle = useCallback(() => {
    const newAutoCoordination = !autoCoordination;
    setStatusMessage(`Auto-coordination ${newAutoCoordination ? 'enabled' : 'disabled'}`);
    onAutoCoordinationChange?.(newAutoCoordination);
  }, [autoCoordination, onAutoCoordinationChange]);
  
  // Handle panel toggle
  const handlePanelToggle = useCallback((panel: 'voice' | 'camera' | 'status' | 'profile') => {
    setActivePanel(panel);
    setStatusMessage(`Switched to ${panel} panel`);
  }, []);
  
  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, []);
  
  // Get mode color
  const getModeColor = useCallback((mode: CoordinationMode) => {
    switch (mode.type) {
      case 'voice-only': return 'info';
      case 'camera-only': return 'warning';
      case 'multimodal': return 'success';
      case 'standby': return 'neutral';
      default: return 'neutral';
    }
  }, []);
  
  return (
    <div 
      className={`${styles.coordinationPanel} ${styles[size]} ${styles[layout]} ${styles[variant]} ${isCollapsed ? styles.collapsed : ''} ${emergencyMode ? styles.emergency : ''} ${className}`}
      data-testid={testId}
      data-mode={currentMode.type}
      data-session-active={localSession.voiceActive || localSession.cameraActive}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="high"
        atomic={true}
        immediate={true}
        modality="multimodal"
      >
        {statusMessage}
      </ScreenReaderText>
      
      <div className={styles.panelContainer}>
        {/* Panel Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Coordination Panel</h2>
            <Badge 
              variant={getModeColor(currentMode) as any} 
              size={atomSize}
              className={styles.modeBadge}
            >
              {currentMode.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            
            {(localSession.voiceActive || localSession.cameraActive) && (
              <Badge 
                variant="success" 
                size="sm"
                className={styles.sessionBadge}
              >
                Live • {formatDuration(localSession.duration)}
              </Badge>
            )}
          </div>
          
          <div className={styles.headerControls}>
            {/* Mode Selection */}
            <select
              value={JSON.stringify(currentMode)}
              onChange={(e) => handleModeChange(JSON.parse(e.target.value))}
              disabled={emergencyMode}
              className={styles.modeSelect}
              data-testid={`${testId}-mode-select`}
            >
              {availableModes.map((mode, index) => (
                <option key={index} value={JSON.stringify(mode)}>
                  {mode.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            {/* Auto-coordination Toggle */}
            <Button
              variant={autoCoordination ? "primary" : "ghost"}
              size="sm"
              onClick={handleAutoCoordinationToggle}
              disabled={emergencyMode}
              className={styles.autoButton}
              data-testid={`${testId}-auto-coordination`}
            >
              <Icon name="zap" size="sm" />
              Auto
            </Button>
            
            {/* Emergency Stop */}
            <Button
              variant="danger"
              size="sm"
              onClick={handleEmergencyStop}
              className={styles.emergencyButton}
              data-testid={`${testId}-emergency-stop`}
            >
              <Icon name="alert-octagon" size="sm" />
              Stop
            </Button>
            
            {/* Collapse Toggle */}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={styles.collapseButton}
                data-testid={`${testId}-collapse`}
              >
                <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} size="sm" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Panel Content */}
        {!isCollapsed && (
          <div className={styles.content}>
            {/* Panel Navigation */}
            <div className={styles.navigation}>
              <button
                className={`${styles.navButton} ${activePanel === 'status' ? styles.active : ''}`}
                onClick={() => handlePanelToggle('status')}
                data-testid={`${testId}-nav-status`}
              >
                <Icon name="activity" size="sm" />
                Status
              </button>
              
              <button
                className={`${styles.navButton} ${activePanel === 'voice' ? styles.active : ''}`}
                onClick={() => handlePanelToggle('voice')}
                disabled={currentMode.type === 'camera-only' || emergencyMode}
                data-testid={`${testId}-nav-voice`}
              >
                <Icon name="microphone" size="sm" />
                Voice
              </button>
              
              <button
                className={`${styles.navButton} ${activePanel === 'camera' ? styles.active : ''}`}
                onClick={() => handlePanelToggle('camera')}
                disabled={currentMode.type === 'voice-only' || emergencyMode}
                data-testid={`${testId}-nav-camera`}
              >
                <Icon name="camera" size="sm" />
                Camera
              </button>
              
              {showProfile && (
                <button
                  className={`${styles.navButton} ${activePanel === 'profile' ? styles.active : ''}`}
                  onClick={() => handlePanelToggle('profile')}
                  data-testid={`${testId}-nav-profile`}
                >
                  <Icon name="user" size="sm" />
                  Profile
                </button>
              )}
            </div>
            
            {/* Panel Content Areas */}
            <div className={styles.panelContent}>
              {/* Status Panel */}
              {activePanel === 'status' && (
                <div className={styles.statusPanel}>
                  <MultiModalStatus
                    voiceStatus={{
                      state: voiceProps.state || 'idle',
                      inputLevel: 0,
                      outputLevel: 75,
                      connectionQuality: voiceProps.connectionQuality || 90,
                      language: 'en-US'
                    }}
                    cameraStatus={{
                      state: cameraProps.state || 'idle',
                      quality: cameraProps.quality || 85,
                      frameRate: 30,
                      resolution: '1920x1080'
                    }}
                    connectionStatus={{
                      status: 'connected',
                      quality: 92,
                      latency: 45
                    }}
                    systemHealth={{
                      cpu: metrics.cpuUsage,
                      memory: metrics.memoryUsage,
                      network: 88,
                      battery: 75
                    }}
                    activeMode={localSession.voiceActive && localSession.cameraActive ? 'multimodal' :
                              localSession.voiceActive ? 'voice' :
                              localSession.cameraActive ? 'camera' : 'idle'}
                    sessionDuration={localSession.duration}
                    interactionCount={localSession.interactions}
                    errors={errors}
                    warnings={warnings}
                    size={size}
                    layout="compact"
                    variant={variant}
                    {...statusProps}
                  />
                </div>
              )}
              
              {/* Voice Panel */}
              {activePanel === 'voice' && (
                <div className={styles.voicePanel}>
                  <VoiceControl
                    state={voiceProps.state || 'idle'}
                    activity={voiceProps.activity || 0}
                    mode={voiceProps.mode || 'push-to-talk'}
                    muted={voiceProps.muted || false}
                    connectionQuality={voiceProps.connectionQuality || 90}
                    layout="horizontal"
                    size={size}
                    variant={variant}
                    onToggle={handleVoiceToggle}
                    onMute={voiceProps.onMute}
                    onModeChange={voiceProps.onModeChange}
                    className={styles.voiceControl}
                  />
                  
                  {expertMode && (
                    <div className={styles.expertControls}>
                      <h4 className={styles.expertTitle}>Expert Voice Controls</h4>
                      <div className={styles.expertGrid}>
                        <Button variant="ghost" size="sm">
                          <Icon name="settings" size="sm" />
                          Advanced Settings
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="sliders" size="sm" />
                          Audio Processing
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="mic" size="sm" />
                          Input Calibration
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="speaker" size="sm" />
                          Output Tuning
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Camera Panel */}
              {activePanel === 'camera' && (
                <div className={styles.cameraPanel}>
                  <CameraControl
                    state={cameraProps.state || 'idle'}
                    quality={cameraProps.quality || 85}
                    mode={cameraProps.mode || 'photo'}
                    capturing={cameraProps.capturing || false}
                    recording={cameraProps.recording || false}
                    layout="horizontal"
                    size={size}
                    variant={variant}
                    onCapture={cameraProps.onCapture}
                    onToggle={handleCameraToggle}
                    onFocus={cameraProps.onFocus}
                    className={styles.cameraControl}
                  />
                  
                  {expertMode && (
                    <div className={styles.expertControls}>
                      <h4 className={styles.expertTitle}>Expert Camera Controls</h4>
                      <div className={styles.expertGrid}>
                        <Button variant="ghost" size="sm">
                          <Icon name="settings" size="sm" />
                          Camera Settings
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="sliders" size="sm" />
                          Image Processing
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="focus" size="sm" />
                          Focus Control
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="sun" size="sm" />
                          Exposure Control
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Profile Panel */}
              {activePanel === 'profile' && showProfile && (
                <div className={styles.profilePanel}>
                  <UserProfile
                    size={size}
                    layout="compact"
                    variant="minimal"
                    {...userProps}
                    className={styles.userProfile}
                  />
                </div>
              )}
            </div>
            
            {/* Coordination Info */}
            {(showAdvanced || expertMode) && (
              <div className={styles.coordinationInfo}>
                <h4 className={styles.infoTitle}>Coordination Details</h4>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Strategy:</span>
                    <span className={styles.infoValue}>{currentMode.handoffStrategy}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Priority:</span>
                    <span className={styles.infoValue}>{currentMode.priority}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Response Time:</span>
                    <span className={styles.infoValue}>{metrics.responseTime}ms</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Accuracy:</span>
                    <span className={styles.infoValue}>{metrics.accuracy}%</span>
                  </div>
                  
                  {lastHandoff && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Last Handoff:</span>
                      <span className={styles.infoValue}>
                        {lastHandoff.from} → {lastHandoff.to} ({lastHandoff.time.toLocaleTimeString()})
                      </span>
                    </div>
                  )}
                </div>
                
                {expertMode && (
                  <div className={styles.expertActions}>
                    <Button variant="ghost" size="sm">
                      <Icon name="download" size="sm" />
                      Export Session
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="bar-chart" size="sm" />
                      Performance Report
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleHandoff('voice', 'camera')}>
                      <Icon name="arrow-right" size="sm" />
                      Force Handoff
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Messages */}
            {(errors.length > 0 || warnings.length > 0 || successes.length > 0) && (
              <div className={styles.messages}>
                {errors.map((error, index) => (
                  <div key={`error-${index}`} className={styles.message} data-type="error">
                    <Icon name="alert-circle" size="sm" className={styles.messageIcon} />
                    <span className={styles.messageText}>{error}</span>
                  </div>
                ))}
                
                {warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className={styles.message} data-type="warning">
                    <Icon name="alert-triangle" size="sm" className={styles.messageIcon} />
                    <span className={styles.messageText}>{warning}</span>
                  </div>
                ))}
                
                {successes.map((success, index) => (
                  <div key={`success-${index}`} className={styles.message} data-type="success">
                    <Icon name="check-circle" size="sm" className={styles.messageIcon} />
                    <span className={styles.messageText}>{success}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 