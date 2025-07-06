import React, { useState, useCallback, useEffect } from 'react';
import { VoiceStatus } from '../../atoms/VoiceStatus/VoiceStatus';
import { CameraIndicator } from '../../atoms/CameraIndicator/CameraIndicator';
import { Badge } from '../../atoms/Badge/Badge';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './MultiModalStatus.module.css';

export interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  quality: number; // 0-100
  latency?: number; // milliseconds
  lastConnected?: Date;
  errorMessage?: string;
}

export interface VoiceStatusData {
  state: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled';
  provider?: string;
  inputLevel?: number; // 0-100
  outputLevel?: number; // 0-100
  connectionQuality?: number; // 0-100
  latency?: number; // milliseconds
  language?: string;
  processing?: boolean;
}

export interface CameraStatusData {
  state: 'idle' | 'recording' | 'capturing' | 'processing' | 'permission' | 'error' | 'disabled';
  quality: number; // 0-100
  frameRate?: number;
  resolution?: string;
  deviceName?: string;
  recording?: boolean;
  capturing?: boolean;
}

export interface SystemHealth {
  cpu: number; // 0-100
  memory: number; // 0-100
  network: number; // 0-100
  battery?: number; // 0-100
  temperature?: number; // celsius
  storage?: number; // 0-100
}

export interface MultiModalStatusProps {
  /** Voice system status */
  voiceStatus?: VoiceStatusData;
  /** Camera system status */
  cameraStatus?: CameraStatusData;
  /** Overall connection status */
  connectionStatus?: ConnectionStatus;
  /** System performance health */
  systemHealth?: SystemHealth;
  /** Current active mode */
  activeMode?: 'voice' | 'camera' | 'multimodal' | 'idle';
  /** Whether voice is available */
  voiceAvailable?: boolean;
  /** Whether camera is available */
  cameraAvailable?: boolean;
  /** Session duration in seconds */
  sessionDuration?: number;
  /** Total interactions count */
  interactionCount?: number;
  /** Error messages */
  errors?: string[];
  /** Warning messages */
  warnings?: string[];
  /** Whether the system is busy processing */
  busy?: boolean;
  /** Whether debug mode is enabled */
  debugMode?: boolean;
  /** Whether to show detailed metrics */
  showMetrics?: boolean;
  /** Whether to show system health */
  showHealth?: boolean;
  /** Whether to show session info */
  showSession?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical' | 'compact' | 'dashboard';
  /** Theme variant */
  variant?: 'default' | 'minimal' | 'detailed' | 'professional';
  /** Callback when voice system is toggled */
  onVoiceToggle?: () => void;
  /** Callback when camera system is toggled */
  onCameraToggle?: () => void;
  /** Callback when debug mode is toggled */
  onDebugToggle?: () => void;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
  /** Callback when system health is requested */
  onHealthCheck?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * MultiModalStatus Molecule
 * 
 * Unified status display for voice and camera coordination, providing comprehensive
 * multi-modal system monitoring and control interface.
 * 
 * Features:
 * - Unified voice and camera status monitoring
 * - Real-time connection quality and latency tracking
 * - System health monitoring (CPU, memory, network, battery)
 * - Session information with duration and interaction tracking
 * - Error and warning message management
 * - Multi-modal coordination status display
 * - Debug mode with detailed metrics
 * - Professional status dashboard layouts
 * - Quick action controls for system components
 * - WCAG AAA accessibility compliance
 * - Multiple layout options (horizontal, vertical, compact, dashboard)
 * - Responsive design with adaptive information density
 * - Screen reader optimization for status changes
 */
export const MultiModalStatus: React.FC<MultiModalStatusProps> = ({
  voiceStatus = {
    state: 'idle',
    inputLevel: 0,
    outputLevel: 75,
    connectionQuality: 90,
    latency: 120,
    language: 'en-US'
  },
  cameraStatus = {
    state: 'idle',
    quality: 85,
    frameRate: 30,
    resolution: '1920x1080'
  },
  connectionStatus = {
    status: 'connected',
    quality: 92,
    latency: 45
  },
  systemHealth = {
    cpu: 35,
    memory: 60,
    network: 88,
    battery: 75
  },
  activeMode = 'idle',
  voiceAvailable = true,
  cameraAvailable = true,
  sessionDuration = 0,
  interactionCount = 0,
  errors = [],
  warnings = [],
  busy = false,
  debugMode = false,
  showMetrics = true,
  showHealth = false,
  showSession = true,
  size = 'medium',
  layout = 'horizontal',
  variant = 'default',
  onVoiceToggle,
  onCameraToggle,
  onDebugToggle,
  onRefresh,
  onHealthCheck,
  className = '',
  testId = 'multimodal-status'
}) => {
  // Internal state
  const [lastStatusUpdate, setLastStatusUpdate] = useState<Date>(new Date());
  const [expandedHealth, setExpandedHealth] = useState(showHealth);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Size mapping helper
  const mapSize = (statusSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[statusSize];
  };
  
  const atomSize = mapSize(size);
  
  // Format session duration
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, []);
  
  // Get overall system status
  const getOverallStatus = useCallback(() => {
    if (errors.length > 0) return 'error';
    if (warnings.length > 0) return 'warning';
    if (busy) return 'processing';
    if (connectionStatus.status === 'disconnected') return 'disconnected';
    if (connectionStatus.status === 'connecting') return 'connecting';
    if (activeMode === 'idle') return 'idle';
    return 'active';
  }, [errors, warnings, busy, connectionStatus.status, activeMode]);
  
  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'processing': return 'info';
      case 'disconnected': return 'neutral';
      case 'connecting': return 'info';
      case 'active': return 'success';
      default: return 'neutral';
    }
  }, []);
  
  // Handle status updates
  useEffect(() => {
    setLastStatusUpdate(new Date());
    
    // Create status message
    let message = '';
    if (errors.length > 0) {
      message = `${errors.length} error${errors.length > 1 ? 's' : ''} detected`;
    } else if (warnings.length > 0) {
      message = `${warnings.length} warning${warnings.length > 1 ? 's' : ''} active`;
    } else if (busy) {
      message = 'System processing...';
    } else if (activeMode === 'multimodal') {
      message = 'Multi-modal session active';
    } else if (activeMode === 'voice') {
      message = 'Voice session active';
    } else if (activeMode === 'camera') {
      message = 'Camera session active';
    } else {
      message = 'System ready';
    }
    
    setStatusMessage(message);
  }, [voiceStatus, cameraStatus, connectionStatus, errors, warnings, busy, activeMode]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setStatusMessage('Refreshing status...');
    onRefresh?.();
    setTimeout(() => {
      setStatusMessage('Status updated');
    }, 1000);
  }, [onRefresh]);
  
  const overallStatus = getOverallStatus();
  const statusColor = getStatusColor(overallStatus);
  
  return (
    <div 
      className={`${styles.multiModalStatus} ${styles[size]} ${styles[layout]} ${styles[variant]} ${className}`}
      data-testid={testId}
      data-status={overallStatus}
      data-mode={activeMode}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="multimodal"
      >
        {statusMessage}
      </ScreenReaderText>
      
      <div className={styles.statusContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>System Status</h3>
            <Badge 
              variant={statusColor as any} 
              size={atomSize}
              className={styles.statusBadge}
            >
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </div>
          
          <div className={styles.actions}>
            {onDebugToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDebugToggle}
                className={`${styles.actionButton} ${debugMode ? styles.active : ''}`}
                data-testid={`${testId}-debug-toggle`}
              >
                <Icon name="settings" size="sm" />
                {debugMode ? 'Hide Debug' : 'Debug'}
              </Button>
            )}
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className={styles.actionButton}
                data-testid={`${testId}-refresh`}
              >
                <Icon name="refresh" size="sm" />
                Refresh
              </Button>
            )}
          </div>
        </div>
        
        {/* Main Status Display */}
        <div className={styles.mainStatus}>
          {/* Voice Status */}
          <div className={styles.modalitySection}>
            <div className={styles.modalityHeader}>
              <Icon name="microphone" size="sm" className={styles.modalityIcon} />
              <span className={styles.modalityTitle}>Voice</span>
              <Badge 
                variant={voiceAvailable ? 'success' : 'neutral'} 
                size="sm"
                className={styles.availabilityBadge}
              >
                {voiceAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            
            {voiceAvailable && (
              <div className={styles.modalityContent}>
                <VoiceStatus
                  voiceState={voiceStatus.state}
                  inputLevel={voiceStatus.inputLevel}
                  outputLevel={voiceStatus.outputLevel}
                  connectionQuality={voiceStatus.connectionQuality}
                  latency={voiceStatus.latency}
                  provider={voiceStatus.provider}
                  locale={voiceStatus.language}
                  layout="compact"
                  showProvider={variant === 'detailed' || variant === 'professional'}
                  showConnectionQuality={showMetrics}
                  showLatency={showMetrics}
                  size={atomSize}
                  className={styles.voiceStatus}
                />
                
                {onVoiceToggle && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onVoiceToggle}
                    className={styles.toggleButton}
                    data-testid={`${testId}-voice-toggle`}
                  >
                    <Icon name={voiceStatus.state === 'disabled' ? 'play' : 'pause'} size="xs" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Camera Status */}
          <div className={styles.modalitySection}>
            <div className={styles.modalityHeader}>
              <Icon name="camera" size="sm" className={styles.modalityIcon} />
              <span className={styles.modalityTitle}>Camera</span>
              <Badge 
                variant={cameraAvailable ? 'success' : 'neutral'} 
                size="sm"
                className={styles.availabilityBadge}
              >
                {cameraAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            
            {cameraAvailable && (
              <div className={styles.modalityContent}>
                <div className={styles.cameraStatusContent}>
                  <CameraIndicator
                    mode="meter"
                    quality={cameraStatus.quality}
                    size={atomSize}
                    direction="horizontal"
                    segments={5}
                    showValues={showMetrics}
                    className={styles.cameraIndicator}
                  />
                  
                  {showMetrics && (
                    <div className={styles.cameraMetrics}>
                      <span className={styles.metric}>{cameraStatus.frameRate} fps</span>
                      <span className={styles.metric}>{cameraStatus.resolution}</span>
                      {cameraStatus.deviceName && (
                        <span className={styles.metric}>{cameraStatus.deviceName}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {onCameraToggle && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onCameraToggle}
                    className={styles.toggleButton}
                    data-testid={`${testId}-camera-toggle`}
                  >
                    <Icon name={cameraStatus.state === 'disabled' ? 'play' : 'pause'} size="xs" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Connection Status */}
          <div className={styles.connectionSection}>
            <div className={styles.connectionHeader}>
              <Icon name="wifi" size="sm" className={styles.connectionIcon} />
              <span className={styles.connectionTitle}>Connection</span>
            </div>
            
            <div className={styles.connectionContent}>
              <div className={styles.connectionMetrics}>
                <div className={styles.connectionMetric}>
                  <span className={styles.metricLabel}>Quality</span>
                  <span className={styles.metricValue}>{connectionStatus.quality}%</span>
                </div>
                {connectionStatus.latency && (
                  <div className={styles.connectionMetric}>
                    <span className={styles.metricLabel}>Latency</span>
                    <span className={styles.metricValue}>{connectionStatus.latency}ms</span>
                  </div>
                )}
              </div>
              
              <Badge 
                variant={connectionStatus.status === 'connected' ? 'success' : 
                        connectionStatus.status === 'connecting' ? 'info' : 'danger'} 
                size="sm"
              >
                {connectionStatus.status.charAt(0).toUpperCase() + connectionStatus.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Session Information */}
        {showSession && (
          <div className={styles.sessionSection}>
            <div className={styles.sessionHeader}>
              <Icon name="clock" size="sm" className={styles.sessionIcon} />
              <span className={styles.sessionTitle}>Session</span>
            </div>
            
            <div className={styles.sessionContent}>
              <div className={styles.sessionMetrics}>
                <div className={styles.sessionMetric}>
                  <span className={styles.metricLabel}>Duration</span>
                  <span className={styles.metricValue}>{formatDuration(sessionDuration)}</span>
                </div>
                <div className={styles.sessionMetric}>
                  <span className={styles.metricLabel}>Interactions</span>
                  <span className={styles.metricValue}>{interactionCount}</span>
                </div>
                <div className={styles.sessionMetric}>
                  <span className={styles.metricLabel}>Mode</span>
                  <span className={styles.metricValue}>{activeMode}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* System Health */}
        {(showHealth || expandedHealth) && (
          <div className={styles.healthSection}>
            <button
              className={styles.healthHeader}
              onClick={() => setExpandedHealth(!expandedHealth)}
              aria-expanded={expandedHealth}
              data-testid={`${testId}-health-toggle`}
            >
              <Icon name="activity" size="sm" className={styles.healthIcon} />
              <span className={styles.healthTitle}>System Health</span>
              <Icon name={expandedHealth ? 'chevron-down' : 'chevron-right'} size="sm" />
            </button>
            
            {expandedHealth && (
              <div className={styles.healthContent}>
                <div className={styles.healthMetrics}>
                  <div className={styles.healthMetric}>
                    <span className={styles.metricLabel}>CPU</span>
                    <div className={styles.metricBar}>
                      <div 
                        className={styles.metricProgress}
                        style={{ width: `${systemHealth.cpu}%` }}
                        data-level={systemHealth.cpu > 80 ? 'high' : systemHealth.cpu > 60 ? 'medium' : 'low'}
                      />
                    </div>
                    <span className={styles.metricValue}>{systemHealth.cpu}%</span>
                  </div>
                  
                  <div className={styles.healthMetric}>
                    <span className={styles.metricLabel}>Memory</span>
                    <div className={styles.metricBar}>
                      <div 
                        className={styles.metricProgress}
                        style={{ width: `${systemHealth.memory}%` }}
                        data-level={systemHealth.memory > 80 ? 'high' : systemHealth.memory > 60 ? 'medium' : 'low'}
                      />
                    </div>
                    <span className={styles.metricValue}>{systemHealth.memory}%</span>
                  </div>
                  
                  <div className={styles.healthMetric}>
                    <span className={styles.metricLabel}>Network</span>
                    <div className={styles.metricBar}>
                      <div 
                        className={styles.metricProgress}
                        style={{ width: `${systemHealth.network}%` }}
                        data-level={systemHealth.network > 80 ? 'high' : systemHealth.network > 60 ? 'medium' : 'low'}
                      />
                    </div>
                    <span className={styles.metricValue}>{systemHealth.network}%</span>
                  </div>
                  
                  {systemHealth.battery && (
                    <div className={styles.healthMetric}>
                      <span className={styles.metricLabel}>Battery</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricProgress}
                          style={{ width: `${systemHealth.battery}%` }}
                          data-level={systemHealth.battery > 80 ? 'high' : systemHealth.battery > 20 ? 'medium' : 'low'}
                        />
                      </div>
                      <span className={styles.metricValue}>{systemHealth.battery}%</span>
                    </div>
                  )}
                </div>
                
                {onHealthCheck && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHealthCheck}
                    className={styles.healthCheckButton}
                    data-testid={`${testId}-health-check`}
                  >
                    <Icon name="activity" size="sm" />
                    Run Health Check
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Errors and Warnings */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className={styles.alertsSection}>
            {errors.map((error, index) => (
              <div key={`error-${index}`} className={styles.alert} data-type="error">
                <Icon name="alert-circle" size="sm" className={styles.alertIcon} />
                <span className={styles.alertMessage}>{error}</span>
              </div>
            ))}
            
            {warnings.map((warning, index) => (
              <div key={`warning-${index}`} className={styles.alert} data-type="warning">
                <Icon name="alert-triangle" size="sm" className={styles.alertIcon} />
                <span className={styles.alertMessage}>{warning}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Debug Information */}
        {debugMode && (
          <div className={styles.debugSection}>
            <div className={styles.debugHeader}>
              <Icon name="code" size="sm" className={styles.debugIcon} />
              <span className={styles.debugTitle}>Debug Information</span>
            </div>
            
            <div className={styles.debugContent}>
              <div className={styles.debugItem}>
                <span className={styles.debugLabel}>Last Update:</span>
                <span className={styles.debugValue}>{lastStatusUpdate.toLocaleTimeString()}</span>
              </div>
              <div className={styles.debugItem}>
                <span className={styles.debugLabel}>Voice State:</span>
                <span className={styles.debugValue}>{voiceStatus.state}</span>
              </div>
              <div className={styles.debugItem}>
                <span className={styles.debugLabel}>Camera State:</span>
                <span className={styles.debugValue}>{cameraStatus.state}</span>
              </div>
              <div className={styles.debugItem}>
                <span className={styles.debugLabel}>Connection:</span>
                <span className={styles.debugValue}>{connectionStatus.status}</span>
              </div>
              <div className={styles.debugItem}>
                <span className={styles.debugLabel}>Active Mode:</span>
                <span className={styles.debugValue}>{activeMode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 