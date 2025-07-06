import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { VoiceControl } from '../../molecules/VoiceControl/VoiceControl';
import { CameraControl } from '../../molecules/CameraControl/CameraControl';
import { MultiModalStatus } from '../../molecules/MultiModalStatus/MultiModalStatus';
import { CoordinationPanel } from '../../molecules/CoordinationPanel/CoordinationPanel';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Badge } from '../../atoms/Badge/Badge';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './MultiModalControlCenter.module.css';

interface ControlLayer {
  id: 'primary' | 'secondary' | 'tertiary';
  name: string;
  description: string;
  visible: boolean;
  permissions: Permission[];
}

interface Permission {
  type: 'emergency' | 'advanced' | 'monitoring' | 'configuration' | 'administration';
  level: 'read' | 'write' | 'execute' | 'admin';
  description: string;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confirmationRequired: boolean;
  executionTime: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
  uptime: number;
  modalityHealth: Map<string, number>;
}

interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  accessLevel: 'operator' | 'supervisor' | 'administrator' | 'emergency';
}

export interface MultiModalControlCenterProps {
  /** Current user role and permissions */
  userRole?: UserRole;
  /** Initial control layer visibility */
  initialLayer?: 'primary' | 'secondary' | 'tertiary';
  /** Professional mode enabled */
  professionalMode?: boolean;
  /** Emergency controls enabled */
  emergencyControlsEnabled?: boolean;
  /** Real-time monitoring enabled */
  realTimeMonitoring?: boolean;
  /** System metrics update interval */
  metricsUpdateInterval?: number;
  /** Voice control configuration */
  voiceConfig?: {
    provider: string;
    pushToTalkMode: boolean;
    autoMute: boolean;
    noiseSuppression: boolean;
  };
  /** Camera control configuration */
  cameraConfig?: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    autoFocus: boolean;
    stabilization: boolean;
    nightMode: boolean;
  };
  /** Emergency protocols */
  emergencyProtocols?: EmergencyProtocol[];
  /** System health thresholds */
  alertThresholds?: {
    cpuUsage: number;
    memoryUsage: number;
    errorRate: number;
    latency: number;
  };
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Theme */
  theme?: 'light' | 'dark' | 'high-contrast';
  /** Layout mode */
  layout?: 'compact' | 'standard' | 'expanded';
  /** Event handlers */
  onEmergencyStop?: () => Promise<void>;
  onSystemOverride?: (reason: string) => Promise<void>;
  onVoiceStateChange?: (state: string) => void;
  onCameraStateChange?: (state: string) => void;
  onMetricsUpdate?: (metrics: SystemMetrics) => void;
  onLayerChange?: (layer: string) => void;
  onAlert?: (alert: { type: string; message: string; severity: string }) => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * MultiModalControlCenter Organism
 * 
 * Professional control center interface with progressive disclosure for multi-modal
 * coordination. Implements layered professional interface with emergency controls
 * and comprehensive system monitoring.
 * 
 * Creative Phase Decision: Option 3 - Layered Professional Interface with Progressive Disclosure
 * Molecular Composition: VoiceControl + CameraControl + MultiModalStatus + CoordinationPanel
 * 
 * Key Features:
 * - Layered control interface with progressive disclosure
 * - Emergency protocols with fail-safe confirmation
 * - Real-time system monitoring and performance metrics
 * - Role-based access control with permission management
 * - Professional multi-modal coordination
 * - Advanced troubleshooting and system administration
 * - WCAG AAA accessibility compliance
 * - Enterprise audit logging and reporting
 */
export const MultiModalControlCenter: React.FC<MultiModalControlCenterProps> = ({
  userRole = {
    id: 'operator',
    name: 'System Operator',
    permissions: [
      { type: 'emergency', level: 'execute', description: 'Emergency stop access' },
      { type: 'monitoring', level: 'read', description: 'System monitoring access' }
    ],
    accessLevel: 'operator'
  },
  initialLayer = 'primary',
  professionalMode = false,
  emergencyControlsEnabled = true,
  realTimeMonitoring = true,
  metricsUpdateInterval = 1000,
  voiceConfig = {
    provider: 'Azure OpenAI',
    pushToTalkMode: false,
    autoMute: false,
    noiseSuppression: true
  },
  cameraConfig = {
    quality: 'high',
    autoFocus: true,
    stabilization: true,
    nightMode: false
  },
  emergencyProtocols = [
    {
      id: 'emergency-stop',
      name: 'Emergency Stop',
      description: 'Immediately halt all operations',
      severity: 'critical',
      confirmationRequired: true,
      executionTime: 500
    },
    {
      id: 'system-override',
      name: 'System Override',
      description: 'Override automatic controls',
      severity: 'high',
      confirmationRequired: true,
      executionTime: 1000
    }
  ],
  alertThresholds = {
    cpuUsage: 80,
    memoryUsage: 85,
    errorRate: 5,
    latency: 200
  },
  size = 'medium',
  theme = 'light',
  layout = 'standard',
  onEmergencyStop,
  onSystemOverride,
  onVoiceStateChange,
  onCameraStateChange,
  onMetricsUpdate,
  onLayerChange,
  onAlert,
  className = '',
  testId = 'multimodal-control-center'
}) => {
  
  // Control layer state
  const [currentLayer, setCurrentLayer] = useState<'primary' | 'secondary' | 'tertiary'>(initialLayer);
  const [layerHistory, setLayerHistory] = useState<string[]>([initialLayer]);

  // System state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 25,
    memoryUsage: 45,
    networkLatency: 85,
    errorRate: 0.2,
    uptime: 86400,
    modalityHealth: new Map([
      ['voice', 95],
      ['camera', 88],
      ['coordination', 92]
    ])
  });

  // Modality states
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled'>('idle');
  const [cameraState, setCameraState] = useState<'idle' | 'recording' | 'capturing' | 'processing' | 'error'>('idle');
  const [voiceActivityLevel, setVoiceActivityLevel] = useState(0);
  const [cameraQuality, setCameraQuality] = useState(88);

  // Emergency state
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [pendingEmergencyAction, setPendingEmergencyAction] = useState<EmergencyProtocol | null>(null);
  const [systemOverrideActive, setSystemOverrideActive] = useState(false);

  // UI state
  const [statusMessage, setStatusMessage] = useState('System operational');
  const [activeAlerts, setActiveAlerts] = useState<Array<{ id: string; type: string; message: string; severity: string }>>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Layer navigation
  const navigateToLayer = useCallback((layer: 'primary' | 'secondary' | 'tertiary') => {
    if (!hasPermissionForLayer(layer)) {
      setStatusMessage(`Access denied: Insufficient permissions for ${layer} layer`);
      return;
    }

    setCurrentLayer(layer);
    setLayerHistory(prev => [...prev.slice(-4), layer]);
    setStatusMessage(`Switched to ${layer} control layer`);
    onLayerChange?.(layer);
  }, [onLayerChange]);

  // Permission checking
  const hasPermissionForLayer = useCallback((layer: 'primary' | 'secondary' | 'tertiary') => {
    switch (layer) {
      case 'primary':
        return true; // All users can access primary layer
      case 'secondary':
        return userRole.accessLevel === 'supervisor' || 
               userRole.accessLevel === 'administrator' || 
               userRole.accessLevel === 'emergency';
      case 'tertiary':
        return userRole.accessLevel === 'administrator' || 
               userRole.accessLevel === 'emergency';
      default:
        return false;
    }
  }, [userRole.accessLevel]);

  const hasPermission = useCallback((permissionType: string, level: string) => {
    return userRole.permissions.some(p => 
      p.type === permissionType && 
      (p.level === level || p.level === 'admin')
    );
  }, [userRole.permissions]);

  // Emergency protocol execution
  const executeEmergencyProtocol = useCallback(async (protocol: EmergencyProtocol) => {
    if (!hasPermission('emergency', 'execute')) {
      setStatusMessage('Access denied: Emergency execution not authorized');
      return;
    }

    if (protocol.confirmationRequired) {
      setPendingEmergencyAction(protocol);
      setShowConfirmDialog(true);
      return;
    }

    await performEmergencyAction(protocol);
  }, [hasPermission]);

  const performEmergencyAction = useCallback(async (protocol: EmergencyProtocol) => {
    try {
      setEmergencyActive(true);
      setStatusMessage(`Executing ${protocol.name}...`);

      if (protocol.id === 'emergency-stop') {
        await onEmergencyStop?.();
        setVoiceState('disabled');
        setCameraState('idle');
        setStatusMessage('Emergency stop executed');
      } else if (protocol.id === 'system-override') {
        const reason = `User ${userRole.name} initiated system override`;
        await onSystemOverride?.(reason);
        setSystemOverrideActive(true);
        setStatusMessage('System override active');
      }

      // Log emergency action
      console.log(`Emergency Protocol Executed: ${protocol.name} by ${userRole.name}`);
      
    } catch (error) {
      setStatusMessage(`Emergency action failed: ${error}`);
      onAlert?.({
        type: 'emergency-failure',
        message: `Failed to execute ${protocol.name}`,
        severity: 'critical'
      });
    } finally {
      setEmergencyActive(false);
      setShowConfirmDialog(false);
      setPendingEmergencyAction(null);
    }
  }, [userRole.name, onEmergencyStop, onSystemOverride, onAlert]);

  // System monitoring
  useEffect(() => {
    if (!realTimeMonitoring) return;

    const interval = setInterval(() => {
      // Simulate realistic system metrics with some variance
      const newMetrics: SystemMetrics = {
        cpuUsage: Math.max(15, Math.min(95, systemMetrics.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, systemMetrics.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(20, Math.min(300, systemMetrics.networkLatency + (Math.random() - 0.5) * 20)),
        errorRate: Math.max(0, Math.min(10, systemMetrics.errorRate + (Math.random() - 0.5) * 0.5)),
        uptime: systemMetrics.uptime + 1,
        modalityHealth: new Map([
          ['voice', Math.max(70, Math.min(100, systemMetrics.modalityHealth.get('voice')! + (Math.random() - 0.5) * 5))],
          ['camera', Math.max(70, Math.min(100, systemMetrics.modalityHealth.get('camera')! + (Math.random() - 0.5) * 5))],
          ['coordination', Math.max(70, Math.min(100, systemMetrics.modalityHealth.get('coordination')! + (Math.random() - 0.5) * 5))]
        ])
      };

      setSystemMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);

      // Check for alerts
      const newAlerts: Array<{ id: string; type: string; message: string; severity: string }> = [];
      
      if (newMetrics.cpuUsage > alertThresholds.cpuUsage) {
        newAlerts.push({
          id: 'cpu-high',
          type: 'performance',
          message: `High CPU usage: ${newMetrics.cpuUsage.toFixed(1)}%`,
          severity: 'warning'
        });
      }

      if (newMetrics.memoryUsage > alertThresholds.memoryUsage) {
        newAlerts.push({
          id: 'memory-high',
          type: 'performance',
          message: `High memory usage: ${newMetrics.memoryUsage.toFixed(1)}%`,
          severity: 'warning'
        });
      }

      if (newMetrics.networkLatency > alertThresholds.latency) {
        newAlerts.push({
          id: 'latency-high',
          type: 'network',
          message: `High network latency: ${newMetrics.networkLatency.toFixed(0)}ms`,
          severity: 'warning'
        });
      }

      setActiveAlerts(newAlerts);

      // Notify about new alerts
      newAlerts.forEach(alert => {
        onAlert?.(alert);
      });

    }, metricsUpdateInterval);

    return () => clearInterval(interval);
  }, [realTimeMonitoring, metricsUpdateInterval, systemMetrics, alertThresholds, onMetricsUpdate, onAlert]);

  // Voice control configuration
  const voiceControlProps = useMemo(() => ({
    voiceState,
    activityLevel: voiceActivityLevel,
    onStateChange: (newState: typeof voiceState) => {
      setVoiceState(newState);
      setStatusMessage(`Voice ${newState}`);
      onVoiceStateChange?.(newState);
    },
    onPushToTalk: (isPressed: boolean) => {
      setVoiceActivityLevel(isPressed ? 75 : 0);
    },
    onMuteToggle: () => {
      setVoiceState(prev => prev === 'muted' ? 'idle' : 'muted');
    },
    connectionQuality: systemMetrics.modalityHealth.get('voice') || 0,
    audioLevel: voiceActivityLevel,
    latency: systemMetrics.networkLatency,
    provider: voiceConfig.provider,
    pushToTalkMode: voiceConfig.pushToTalkMode,
    disabled: emergencyActive || systemOverrideActive,
    size: size as 'small' | 'medium' | 'large',
    orientation: layout === 'compact' ? 'compact' : 'horizontal',
    showDetailedStatus: currentLayer !== 'primary' || professionalMode,
    showActivityIndicator: true,
    activityIndicatorType: 'bars' as const,
    className: styles.voiceControlCustom
  }), [voiceState, voiceActivityLevel, systemMetrics, voiceConfig, emergencyActive, systemOverrideActive, size, layout, currentLayer, professionalMode, onVoiceStateChange]);

  // Camera control configuration
  const cameraControlProps = useMemo(() => ({
    cameraState,
    quality: cameraQuality,
    settings: {
      flashMode: 'auto' as const,
      focusMode: cameraConfig.autoFocus ? 'auto' as const : 'manual' as const,
      captureMode: 'photo' as const,
      timer: 0,
      videoQuality: cameraConfig.quality as 'low' | 'medium' | 'high' | 'ultra'
    },
    hasPermission: true,
    disabled: emergencyActive,
    size: size as 'small' | 'medium' | 'large',
    layout: layout === 'compact' ? 'compact' : 'vertical',
    showMetrics: currentLayer !== 'primary' || professionalMode,
    showSettings: currentLayer === 'secondary' || currentLayer === 'tertiary',
    onCapture: () => {
      setCameraState('capturing');
      setStatusMessage('Image captured');
      setTimeout(() => setCameraState('idle'), 1000);
    },
    onCameraStart: () => {
      setCameraState('recording');
      setStatusMessage('Camera started');
      onCameraStateChange?.('recording');
    },
    onCameraStop: () => {
      setCameraState('idle');
      setStatusMessage('Camera stopped');
      onCameraStateChange?.('idle');
    },
    className: styles.cameraControlCustom
  }), [cameraState, cameraQuality, cameraConfig, emergencyActive, size, layout, currentLayer, professionalMode, onCameraStateChange]);

  // Multi-modal status configuration
  const statusProps = useMemo(() => ({
    voiceState,
    cameraState: cameraState as any,
    systemHealth: activeAlerts.length > 0 ? 'warning' : 'good',
    connectionQuality: Math.round(Array.from(systemMetrics.modalityHealth.values()).reduce((a, b) => a + b, 0) / systemMetrics.modalityHealth.size),
    latency: systemMetrics.networkLatency,
    realTimeUpdates: realTimeMonitoring,
    updateInterval: metricsUpdateInterval,
    professionalMode,
    showLatencyMetrics: professionalMode,
    showSystemHealth: true,
    size: size === 'small' ? 'small' as const : 'medium' as const,
    compact: layout === 'compact',
    className: styles.statusCustom
  }), [voiceState, cameraState, activeAlerts, systemMetrics, realTimeMonitoring, metricsUpdateInterval, professionalMode, size, layout]);

  // Coordination panel configuration
  const coordinationPanelProps = useMemo(() => ({
    session: {
      id: 'control-center-session',
      started: new Date(),
      duration: systemMetrics.uptime,
      interactions: layerHistory.length,
      mode: {
        type: 'multi-modal' as const,
        priority: 'coordination' as const,
        handoffStrategy: 'manual' as const
      },
      voiceActive: voiceState !== 'idle' && voiceState !== 'disabled',
      cameraActive: cameraState !== 'idle',
      recording: voiceState === 'listening' || cameraState === 'recording',
      capturing: cameraState === 'capturing'
    },
    metrics: {
      responseTime: systemMetrics.networkLatency,
      accuracy: Math.round(Array.from(systemMetrics.modalityHealth.values()).reduce((a, b) => a + b, 0) / systemMetrics.modalityHealth.size),
      bandwidth: 1500,
      cpuUsage: systemMetrics.cpuUsage,
      memoryUsage: systemMetrics.memoryUsage,
      errorRate: systemMetrics.errorRate
    },
    expertMode: currentLayer === 'tertiary',
    showAdvanced: currentLayer !== 'primary',
    layout: layout === 'compact' ? 'compact' as const : 'standard' as const,
    size: size as 'small' | 'medium' | 'large',
    variant: professionalMode ? 'professional' as const : 'standard' as const,
    collapsible: layout === 'compact',
    defaultCollapsed: false,
    className: styles.coordinationPanelCustom
  }), [systemMetrics, layerHistory, voiceState, cameraState, currentLayer, layout, size, professionalMode]);

  return (
    <div 
      className={`${styles.multiModalControlCenter} ${styles[currentLayer]} ${styles[layout]} ${styles[theme]} ${className}`}
      data-testid={testId}
      data-layer={currentLayer}
      data-emergency-active={emergencyActive}
      data-user-role={userRole.accessLevel}
      ref={containerRef}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="high"
        atomic={true}
        immediate={true}
        modality="coordination"
      >
        {statusMessage}
      </ScreenReaderText>

      {/* Emergency Controls - Always Visible */}
      {emergencyControlsEnabled && (
        <div className={styles.emergencyControls}>
          <div className={styles.emergencyHeader}>
            <Icon name="alert-triangle" size="sm" />
            <span className={styles.emergencyTitle}>Emergency Controls</span>
            {emergencyActive && (
              <Badge variant="danger" size="sm" className={styles.emergencyBadge}>
                ACTIVE
              </Badge>
            )}
          </div>
          
          <div className={styles.emergencyActions}>
            {emergencyProtocols.map((protocol) => (
              <Button
                key={protocol.id}
                variant={protocol.severity === 'critical' ? 'danger' : 'warning'}
                size="sm"
                onClick={() => executeEmergencyProtocol(protocol)}
                disabled={!hasPermission('emergency', 'execute') || emergencyActive}
                className={styles.emergencyButton}
                data-testid={`${testId}-${protocol.id}`}
              >
                <Icon name={protocol.severity === 'critical' ? 'alert-circle' : 'alert-triangle'} size="sm" />
                {protocol.name}
              </Button>
            ))}
          </div>
          
          {systemOverrideActive && (
            <div className={styles.overrideIndicator}>
              <Icon name="shield-off" size="sm" />
              <span>System Override Active</span>
            </div>
          )}
        </div>
      )}

      {/* Layer Navigation */}
      <div className={styles.layerNavigation}>
        <div className={styles.layerTabs}>
          <button
            className={`${styles.layerTab} ${currentLayer === 'primary' ? styles.active : ''}`}
            onClick={() => navigateToLayer('primary')}
            disabled={!hasPermissionForLayer('primary')}
            data-testid={`${testId}-primary-layer`}
          >
            <Icon name="layers" size="sm" />
            Primary
          </button>
          <button
            className={`${styles.layerTab} ${currentLayer === 'secondary' ? styles.active : ''}`}
            onClick={() => navigateToLayer('secondary')}
            disabled={!hasPermissionForLayer('secondary')}
            data-testid={`${testId}-secondary-layer`}
          >
            <Icon name="settings" size="sm" />
            Advanced
            {!hasPermissionForLayer('secondary') && (
              <Icon name="lock" size="sm" className={styles.lockIcon} />
            )}
          </button>
          <button
            className={`${styles.layerTab} ${currentLayer === 'tertiary' ? styles.active : ''}`}
            onClick={() => navigateToLayer('tertiary')}
            disabled={!hasPermissionForLayer('tertiary')}
            data-testid={`${testId}-tertiary-layer`}
          >
            <Icon name="monitor" size="sm" />
            Administration
            {!hasPermissionForLayer('tertiary') && (
              <Icon name="lock" size="sm" className={styles.lockIcon} />
            )}
          </button>
        </div>
        
        <div className={styles.userInfo}>
          <Icon name="user" size="sm" />
          <span className={styles.userName}>{userRole.name}</span>
          <Badge variant="secondary" size="sm">
            {userRole.accessLevel}
          </Badge>
        </div>
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className={styles.alertBanner}>
          <div className={styles.alertContent}>
            <Icon name="alert-circle" size="sm" />
            <span>{activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveAlerts([])}
              className={styles.dismissButton}
            >
              Dismiss All
            </Button>
          </div>
        </div>
      )}

      {/* Primary Control Layer */}
      <div className={styles.primaryLayer}>
        <div className={styles.modalityControls}>
          <div className={styles.voiceSection}>
            <h3 className={styles.sectionTitle}>Voice Control</h3>
            <VoiceControl {...voiceControlProps} />
          </div>
          
          <div className={styles.cameraSection}>
            <h3 className={styles.sectionTitle}>Camera Control</h3>
            <CameraControl {...cameraControlProps} />
          </div>
        </div>
        
        <div className={styles.statusSection}>
          <h3 className={styles.sectionTitle}>System Status</h3>
          <MultiModalStatus {...statusProps} />
        </div>
      </div>

      {/* Secondary Control Layer - Advanced Controls */}
      {currentLayer !== 'primary' && (
        <div className={styles.secondaryLayer}>
          <div className={styles.advancedControls}>
            <h3 className={styles.sectionTitle}>Advanced Configuration</h3>
            
            <div className={styles.configurationGrid}>
              <div className={styles.configSection}>
                <h4>Voice Settings</h4>
                <div className={styles.settingGroup}>
                  <label>Noise Suppression</label>
                  <input 
                    type="checkbox" 
                    checked={voiceConfig.noiseSuppression} 
                    disabled={!hasPermission('configuration', 'write')}
                  />
                </div>
                <div className={styles.settingGroup}>
                  <label>Auto Mute</label>
                  <input 
                    type="checkbox" 
                    checked={voiceConfig.autoMute} 
                    disabled={!hasPermission('configuration', 'write')}
                  />
                </div>
              </div>
              
              <div className={styles.configSection}>
                <h4>Camera Settings</h4>
                <div className={styles.settingGroup}>
                  <label>Stabilization</label>
                  <input 
                    type="checkbox" 
                    checked={cameraConfig.stabilization} 
                    disabled={!hasPermission('configuration', 'write')}
                  />
                </div>
                <div className={styles.settingGroup}>
                  <label>Night Mode</label>
                  <input 
                    type="checkbox" 
                    checked={cameraConfig.nightMode} 
                    disabled={!hasPermission('configuration', 'write')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.coordinationSection}>
            <h3 className={styles.sectionTitle}>Coordination Panel</h3>
            <CoordinationPanel {...coordinationPanelProps} />
          </div>
        </div>
      )}

      {/* Tertiary Control Layer - Administration */}
      {currentLayer === 'tertiary' && (
        <div className={styles.tertiaryLayer}>
          <div className={styles.administrationControls}>
            <h3 className={styles.sectionTitle}>System Administration</h3>
            
            <div className={styles.adminGrid}>
              <div className={styles.metricsPanel}>
                <h4>Performance Metrics</h4>
                <div className={styles.metricsList}>
                  <div className={styles.metric}>
                    <span>CPU Usage</span>
                    <span>{systemMetrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.metric}>
                    <span>Memory Usage</span>
                    <span>{systemMetrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.metric}>
                    <span>Network Latency</span>
                    <span>{systemMetrics.networkLatency.toFixed(0)}ms</span>
                  </div>
                  <div className={styles.metric}>
                    <span>Error Rate</span>
                    <span>{systemMetrics.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className={styles.metric}>
                    <span>Uptime</span>
                    <span>{Math.floor(systemMetrics.uptime / 3600)}h</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.auditPanel}>
                <h4>Audit Log</h4>
                <div className={styles.auditEntries}>
                  {layerHistory.slice(-5).map((layer, index) => (
                    <div key={index} className={styles.auditEntry}>
                      <span className={styles.auditTime}>
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span className={styles.auditAction}>
                        Accessed {layer} layer
                      </span>
                      <span className={styles.auditUser}>
                        {userRole.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Confirmation Dialog */}
      {showConfirmDialog && pendingEmergencyAction && (
        <div className={styles.confirmDialog}>
          <div className={styles.dialogContent}>
            <h3>Confirm Emergency Action</h3>
            <p>
              Are you sure you want to execute <strong>{pendingEmergencyAction.name}</strong>?
            </p>
            <p className={styles.dialogDescription}>
              {pendingEmergencyAction.description}
            </p>
            <div className={styles.dialogActions}>
              <Button
                variant="danger"
                onClick={() => performEmergencyAction(pendingEmergencyAction)}
                data-testid={`${testId}-confirm-emergency`}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingEmergencyAction(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiModalControlCenter; 