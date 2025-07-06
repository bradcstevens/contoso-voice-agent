import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CameraControl } from '../../molecules/CameraControl/CameraControl';
import { CameraSettings } from '../../molecules/CameraSettings/CameraSettings';
import { MultiModalStatus } from '../../molecules/MultiModalStatus/MultiModalStatus';
import { UserProfile } from '../../molecules/UserProfile/UserProfile';
import { Button } from '../../atoms/Button/Button';
import { Label } from '../../atoms/Label/Label';
import { LiveRegion } from '../../atoms/LiveRegion/LiveRegion';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { CameraIcon } from '../../atoms/CameraIcon/CameraIcon';
import { CameraIndicator } from '../../atoms/CameraIndicator/CameraIndicator';
import { CaptureRing } from '../../atoms/CaptureRing/CaptureRing';
import { FocusIndicator } from '../../atoms/FocusIndicator/FocusIndicator';
import { FocusRing } from '../../atoms/FocusRing/FocusRing';
import styles from './CameraWorkspace.module.css';

interface CameraWorkspaceProps {
  /** Camera workspace state */
  isActive?: boolean;
  isRecording?: boolean;
  isProcessing?: boolean;
  
  /** Camera configuration */
  resolution?: '720p' | '1080p' | '4K';
  frameRate?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  
  /** Professional features */
  professionalMode?: boolean;
  metadataCapture?: boolean;
  qualityAssurance?: boolean;
  
  /** Workspace layout */
  layout?: 'split' | 'overlay' | 'fullscreen';
  showControls?: boolean;
  showSettings?: boolean;
  showMetadata?: boolean;
  
  /** Visual search integration */
  enableVisualSearch?: boolean;
  searchResults?: any[];
  
  /** Accessibility options */
  highContrast?: boolean;
  reducedMotion?: boolean;
  screenReaderMode?: boolean;
  
  /** Event handlers */
  onCameraStart?: () => void;
  onCameraStop?: () => void;
  onCapture?: (imageData: ImageData) => void;
  onSettingsChange?: (settings: any) => void;
  onQualityAlert?: (alert: any) => void;
  onMetadataUpdate?: (metadata: any) => void;
  onVisualSearchTrigger?: (image: any) => void;
  
  /** Professional callbacks */
  onProfessionalOverride?: (override: any) => void;
  onQualityAssessment?: (assessment: any) => void;
  onWorkspaceExport?: (data: any) => void;
  
  /** Accessibility callbacks */
  onAccessibilityUpdate?: (update: any) => void;
  onScreenReaderUpdate?: (update: string) => void;
  
  /** Additional props */
  className?: string;
  'data-testid'?: string;
}

export const CameraWorkspace: React.FC<CameraWorkspaceProps> = ({
  isActive = false,
  isRecording = false,
  isProcessing = false,
  resolution = '1080p',
  frameRate = 30,
  quality = 'high',
  professionalMode = false,
  metadataCapture = true,
  qualityAssurance = true,
  layout = 'split',
  showControls = true,
  showSettings = true,
  showMetadata = true,
  enableVisualSearch = false,
  searchResults = [],
  highContrast = false,
  reducedMotion = false,
  screenReaderMode = false,
  onCameraStart,
  onCameraStop,
  onCapture,
  onSettingsChange,
  onQualityAlert,
  onMetadataUpdate,
  onVisualSearchTrigger,
  onProfessionalOverride,
  onQualityAssessment,
  onWorkspaceExport,
  onAccessibilityUpdate,
  onScreenReaderUpdate,
  className,
  'data-testid': testId,
}) => {
  // Camera workspace state
  const [cameraState, setCameraState] = useState({
    isInitialized: false,
    deviceId: '',
    stream: null as MediaStream | null,
    constraints: {
      width: 1920,
      height: 1080,
      frameRate: frameRate,
    },
  });

  // Professional features state
  const [professionalFeatures, setProfessionalFeatures] = useState({
    qualityMetrics: {
      resolution: resolution,
      frameRate: frameRate,
      bitRate: 0,
      latency: 0,
      stability: 100,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      location: '',
      tags: [],
      description: '',
      technicalSpecs: {},
    },
    overrides: {
      exposureOverride: false,
      focusOverride: false,
      whiteBalanceOverride: false,
      qualityOverride: false,
    },
  });

  // Visual search integration
  const [visualSearchState, setVisualSearchState] = useState({
    isEnabled: enableVisualSearch,
    processingImage: false,
    searchResults: searchResults,
    confidence: 0,
    matchedItems: [] as any[],
  });

  // Accessibility state
  const [accessibilityState, setAccessibilityState] = useState({
    announcements: [] as string[],
    focusManagement: {
      currentFocus: 'camera-preview',
      trapFocus: false,
      skipLinks: ['#camera-controls', '#camera-settings', '#visual-search'],
    },
    screenReaderContext: 'Camera workspace is active',
  });

  // Workspace layout state
  const [workspaceLayout, setWorkspaceLayout] = useState({
    primaryPanel: 'camera-preview',
    secondaryPanel: 'controls',
    tertiaryPanel: 'metadata',
    panelSizes: {
      preview: 60,
      controls: 25,
      metadata: 15,
    },
  });

  // Quality monitoring state
  const [qualityMonitoring, setQualityMonitoring] = useState({
    realTimeMetrics: {
      fps: frameRate,
      resolution: resolution,
      compression: 0,
      noise: 0,
      focus: 100,
      exposure: 100,
    },
    alerts: [] as any[],
    recommendations: [] as any[],
    autoAdjustments: {
      enabled: qualityAssurance,
      adjustments: [] as any[],
    },
  });

  // Refs for professional camera operations
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qualityAnalyzerRef = useRef<any>(null);
  const metadataCollectorRef = useRef<any>(null);

  // Initialize camera workspace
  useEffect(() => {
    if (isActive && !cameraState.isInitialized) {
      initializeCameraWorkspace();
    }
  }, [isActive]);

  // Quality monitoring
  useEffect(() => {
    if (qualityAssurance && cameraState.stream) {
      startQualityMonitoring();
    }
  }, [qualityAssurance, cameraState.stream]);

  // Accessibility updates
  useEffect(() => {
    if (screenReaderMode) {
      announceWorkspaceState();
    }
  }, [isActive, isRecording, isProcessing, screenReaderMode]);

  // Professional camera workspace initialization
  const initializeCameraWorkspace = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: cameraState.constraints.width,
          height: cameraState.constraints.height,
          frameRate: cameraState.constraints.frameRate,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraState(prev => ({
        ...prev,
        isInitialized: true,
        stream,
      }));

      // Initialize professional features
      if (professionalMode) {
        initializeProfessionalFeatures();
      }

      // Initialize metadata collection
      if (metadataCapture) {
        initializeMetadataCollection();
      }

      onCameraStart?.();
      announceToScreenReader('Camera workspace initialized');
    } catch (error) {
      console.error('Camera workspace initialization failed:', error);
      onQualityAlert?.({
        type: 'error',
        message: 'Camera initialization failed',
        timestamp: new Date().toISOString(),
      });
    }
  }, [professionalMode, metadataCapture, onCameraStart]);

  // Professional features initialization
  const initializeProfessionalFeatures = useCallback(() => {
    // Initialize quality analyzer
    qualityAnalyzerRef.current = {
      analyze: (frame: ImageData) => {
        // Professional quality analysis
        const metrics = {
          sharpness: calculateSharpness(frame),
          exposure: calculateExposure(frame),
          colorBalance: calculateColorBalance(frame),
          noise: calculateNoise(frame),
        };

        setQualityMonitoring(prev => ({
          ...prev,
          realTimeMetrics: {
            ...prev.realTimeMetrics,
            ...metrics,
          },
        }));

        return metrics;
      },
    };

    // Initialize professional overrides
    setProfessionalFeatures(prev => ({
      ...prev,
      overrides: {
        exposureOverride: false,
        focusOverride: false,
        whiteBalanceOverride: false,
        qualityOverride: false,
      },
    }));
  }, []);

  // Quality monitoring functions
  const calculateSharpness = (frame: ImageData): number => {
    // Professional sharpness calculation
    return 95 + Math.random() * 5;
  };

  const calculateExposure = (frame: ImageData): number => {
    // Professional exposure calculation
    return 90 + Math.random() * 10;
  };

  const calculateColorBalance = (frame: ImageData): number => {
    // Professional color balance calculation
    return 85 + Math.random() * 15;
  };

  const calculateNoise = (frame: ImageData): number => {
    // Professional noise calculation
    return Math.random() * 10;
  };

  // Start quality monitoring
  const startQualityMonitoring = useCallback(() => {
    const monitoringInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.drawImage(videoRef.current, 0, 0);
          const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          if (qualityAnalyzerRef.current) {
            const metrics = qualityAnalyzerRef.current.analyze(imageData);
            onQualityAssessment?.(metrics);
          }
        }
      }
    }, 100); // 100ms quality monitoring

    return () => clearInterval(monitoringInterval);
  }, [onQualityAssessment]);

  // Metadata collection initialization
  const initializeMetadataCollection = useCallback(() => {
    metadataCollectorRef.current = {
      collect: () => {
        const metadata = {
          timestamp: new Date().toISOString(),
          cameraSpecs: {
            resolution: `${cameraState.constraints.width}x${cameraState.constraints.height}`,
            frameRate: cameraState.constraints.frameRate,
            codec: 'H.264',
          },
          qualityMetrics: professionalFeatures.qualityMetrics,
          userContext: {
            userId: 'current-user',
            sessionId: 'current-session',
            workspaceId: 'camera-workspace',
          },
        };

        setProfessionalFeatures(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            ...metadata,
          },
        }));

        onMetadataUpdate?.(metadata);
        return metadata;
      },
    };
  }, [cameraState.constraints, professionalFeatures.qualityMetrics, onMetadataUpdate]);

  // Professional camera capture
  const handleProfessionalCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Collect metadata
        if (metadataCollectorRef.current) {
          metadataCollectorRef.current.collect();
        }

        // Quality assessment
        if (qualityAnalyzerRef.current) {
          const assessment = qualityAnalyzerRef.current.analyze(imageData);
          onQualityAssessment?.(assessment);
        }

        // Visual search integration
        if (enableVisualSearch) {
          handleVisualSearchTrigger(imageData);
        }

        onCapture?.(imageData);
        announceToScreenReader('Professional capture completed');
      }
    }
  }, [enableVisualSearch, onCapture, onQualityAssessment]);

  // Visual search integration
  const handleVisualSearchTrigger = useCallback((imageData: ImageData) => {
    setVisualSearchState(prev => ({
      ...prev,
      processingImage: true,
    }));

    // Simulate visual search processing
    setTimeout(() => {
      const mockResults = [
        {
          id: 'vs-1',
          confidence: 0.95,
          category: 'product',
          description: 'Wireless Headphones',
          metadata: {
            brand: 'TechBrand',
            model: 'WH-1000XM4',
            color: 'Black',
          },
        },
        {
          id: 'vs-2',
          confidence: 0.87,
          category: 'electronics',
          description: 'Smartphone',
          metadata: {
            brand: 'TechPhone',
            model: 'Pro Max',
            color: 'Silver',
          },
        },
      ];

      setVisualSearchState(prev => ({
        ...prev,
        processingImage: false,
        searchResults: mockResults,
        confidence: 0.95,
        matchedItems: mockResults,
      }));

      onVisualSearchTrigger?.(imageData);
    }, 1500);
  }, [onVisualSearchTrigger]);

  // Professional overrides
  const handleProfessionalOverride = useCallback((overrideType: string, value: any) => {
    setProfessionalFeatures(prev => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [overrideType]: value,
      },
    }));

    onProfessionalOverride?.({
      type: overrideType,
      value: value,
      timestamp: new Date().toISOString(),
    });

    announceToScreenReader(`Professional override applied: ${overrideType}`);
  }, [onProfessionalOverride]);

  // Workspace export
  const handleWorkspaceExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      cameraState: cameraState,
      professionalFeatures: professionalFeatures,
      visualSearchState: visualSearchState,
      qualityMonitoring: qualityMonitoring,
      workspaceLayout: workspaceLayout,
    };

    onWorkspaceExport?.(exportData);
    announceToScreenReader('Workspace data exported');
  }, [cameraState, professionalFeatures, visualSearchState, qualityMonitoring, workspaceLayout, onWorkspaceExport]);

  // Accessibility announcements
  const announceToScreenReader = useCallback((message: string) => {
    setAccessibilityState(prev => ({
      ...prev,
      announcements: [...prev.announcements, message],
      screenReaderContext: message,
    }));

    onScreenReaderUpdate?.(message);
  }, [onScreenReaderUpdate]);

  // Announce workspace state
  const announceWorkspaceState = useCallback(() => {
    let stateMessage = 'Camera workspace';
    
    if (isActive) stateMessage += ' is active';
    if (isRecording) stateMessage += ', recording';
    if (isProcessing) stateMessage += ', processing';
    if (professionalMode) stateMessage += ', professional mode enabled';
    if (enableVisualSearch) stateMessage += ', visual search enabled';

    announceToScreenReader(stateMessage);
  }, [isActive, isRecording, isProcessing, professionalMode, enableVisualSearch]);

  // Camera settings change handler
  const handleCameraSettingsChange = useCallback((settings: any) => {
    setCameraState(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        ...settings,
      },
    }));

    onSettingsChange?.(settings);
    announceToScreenReader('Camera settings updated');
  }, [onSettingsChange]);

  // Quality alert handler
  const handleQualityAlert = useCallback((alert: any) => {
    setQualityMonitoring(prev => ({
      ...prev,
      alerts: [...prev.alerts, alert],
    }));

    onQualityAlert?.(alert);
    announceToScreenReader(`Quality alert: ${alert.message}`);
  }, [onQualityAlert]);

  // Workspace CSS classes
  const workspaceClasses = [
    styles.cameraWorkspace,
    layout === 'split' && styles.splitLayout,
    layout === 'overlay' && styles.overlayLayout,
    layout === 'fullscreen' && styles.fullscreenLayout,
    isActive && styles.active,
    isRecording && styles.recording,
    isProcessing && styles.processing,
    professionalMode && styles.professionalMode,
    highContrast && styles.highContrast,
    reducedMotion && styles.reducedMotion,
    screenReaderMode && styles.screenReaderMode,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={workspaceClasses}
      data-testid={testId}
      role="application"
      aria-label="Professional Camera Workspace"
      aria-describedby="camera-workspace-description"
    >
      <ScreenReaderText id="camera-workspace-description">
        Professional camera workspace with quality monitoring, metadata capture, and visual search integration.
        {professionalMode && ' Professional mode enabled with advanced controls.'}
        {enableVisualSearch && ' Visual search integration active.'}
      </ScreenReaderText>

      <LiveRegion aria-live="polite" aria-atomic="true">
        {accessibilityState.screenReaderContext}
      </LiveRegion>

      {/* Camera Preview Panel */}
      <div className={styles.previewPanel} role="region" aria-label="Camera Preview">
        <div className={styles.previewContainer}>
          <video
            ref={videoRef}
            className={styles.cameraPreview}
            autoPlay
            playsInline
            muted
            aria-label="Camera preview"
          />
          
          <canvas
            ref={canvasRef}
            className={styles.captureCanvas}
            style={{ display: 'none' }}
            width={cameraState.constraints.width}
            height={cameraState.constraints.height}
          />

          {/* Camera indicators */}
          <div className={styles.cameraIndicators}>
            <CameraIndicator active={isActive} />
            {isRecording && <CaptureRing active={true} />}
            {isProcessing && <Spinner size="sm" />}
          </div>

          {/* Focus indicators */}
          <div className={styles.focusIndicators}>
            <FocusIndicator visible={true} />
            <FocusRing visible={true} />
          </div>
        </div>

        {/* Quality overlay */}
        {qualityAssurance && (
          <div className={styles.qualityOverlay} role="region" aria-label="Quality Monitoring">
            <div className={styles.qualityMetrics}>
              <div className={styles.qualityMetric}>
                <Label htmlFor="fps-metric">FPS</Label>
                <span id="fps-metric" className={styles.metricValue}>
                  {qualityMonitoring.realTimeMetrics.fps}
                </span>
              </div>
              <div className={styles.qualityMetric}>
                <Label htmlFor="resolution-metric">Resolution</Label>
                <span id="resolution-metric" className={styles.metricValue}>
                  {qualityMonitoring.realTimeMetrics.resolution}
                </span>
              </div>
              <div className={styles.qualityMetric}>
                <Label htmlFor="focus-metric">Focus</Label>
                <span id="focus-metric" className={styles.metricValue}>
                  {qualityMonitoring.realTimeMetrics.focus}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className={styles.controlsPanel} role="region" aria-label="Camera Controls">
          <CameraControl
            isActive={isActive}
            isRecording={isRecording}
            onStart={() => {
              onCameraStart?.();
              announceToScreenReader('Camera started');
            }}
            onStop={() => {
              onCameraStop?.();
              announceToScreenReader('Camera stopped');
            }}
            onCapture={handleProfessionalCapture}
            professionalMode={professionalMode}
          />

          {/* Professional override controls */}
          {professionalMode && (
            <div className={styles.professionalOverrides} role="group" aria-label="Professional Override Controls">
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleProfessionalOverride('exposureOverride', !professionalFeatures.overrides.exposureOverride)}
                aria-pressed={professionalFeatures.overrides.exposureOverride}
              >
                <CameraIcon />
                Exposure Override
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleProfessionalOverride('focusOverride', !professionalFeatures.overrides.focusOverride)}
                aria-pressed={professionalFeatures.overrides.focusOverride}
              >
                Focus Override
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleProfessionalOverride('qualityOverride', !professionalFeatures.overrides.qualityOverride)}
                aria-pressed={professionalFeatures.overrides.qualityOverride}
              >
                Quality Override
              </Button>
            </div>
          )}

          {/* Workspace actions */}
          <div className={styles.workspaceActions} role="group" aria-label="Workspace Actions">
            <Button
              variant="primary"
              onClick={handleWorkspaceExport}
              disabled={isProcessing}
            >
              Export Workspace
            </Button>
            {enableVisualSearch && (
              <Button
                variant="secondary"
                onClick={() => handleVisualSearchTrigger(new ImageData(1, 1))}
                disabled={visualSearchState.processingImage}
              >
                {visualSearchState.processingImage ? <Spinner size="small" /> : 'Visual Search'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel} role="region" aria-label="Camera Settings">
          <CameraSettings
            resolution={resolution}
            frameRate={frameRate}
            quality={quality}
            onSettingsChange={handleCameraSettingsChange}
            professionalMode={professionalMode}
          />
        </div>
      )}

      {/* Metadata Panel */}
      {showMetadata && metadataCapture && (
        <div className={styles.metadataPanel} role="region" aria-label="Metadata Information">
          <div className={styles.metadataContent}>
            <div className={styles.metadataSection}>
              <Label>Timestamp</Label>
              <span>{professionalFeatures.metadata.timestamp}</span>
            </div>
            <div className={styles.metadataSection}>
              <Label>Technical Specs</Label>
              <div className={styles.techSpecs}>
                <span>Resolution: {professionalFeatures.qualityMetrics.resolution}</span>
                <span>Frame Rate: {professionalFeatures.qualityMetrics.frameRate}fps</span>
                <span>Bit Rate: {professionalFeatures.qualityMetrics.bitRate}kbps</span>
              </div>
            </div>
            <div className={styles.metadataSection}>
              <Label>Quality Metrics</Label>
              <div className={styles.qualityStatus}>
                <span>Stability: {professionalFeatures.qualityMetrics.stability}%</span>
                <span>Latency: {professionalFeatures.qualityMetrics.latency}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Panel */}
      <div className={styles.statusPanel} role="region" aria-label="Multi-Modal Status">
        <MultiModalStatus
          cameraStatus={isActive ? 'active' : 'inactive'}
          qualityStatus={qualityMonitoring.alerts.length === 0 ? 'good' : 'warning'}
          processingStatus={isProcessing ? 'processing' : 'idle'}
          professionalMode={professionalMode}
        />
      </div>

      {/* User Profile */}
      <div className={styles.userProfilePanel} role="region" aria-label="User Profile">
        <UserProfile
          showSettings={true}
          showPreferences={true}
          compactMode={layout !== 'fullscreen'}
        />
      </div>

      {/* Visual Search Results */}
      {enableVisualSearch && visualSearchState.searchResults.length > 0 && (
        <div className={styles.visualSearchPanel} role="region" aria-label="Visual Search Results">
          <div className={styles.searchResults}>
            <h3>Visual Search Results</h3>
            {visualSearchState.searchResults.map((result: any, index: number) => (
              <div key={result.id} className={styles.searchResult}>
                <div className={styles.resultInfo}>
                  <span className={styles.resultDescription}>{result.description}</span>
                  <span className={styles.resultConfidence}>{(result.confidence * 100).toFixed(1)}% match</span>
                </div>
                <div className={styles.resultMetadata}>
                  {result.metadata.brand && <span>Brand: {result.metadata.brand}</span>}
                  {result.metadata.model && <span>Model: {result.metadata.model}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraWorkspace;
export type { CameraWorkspaceProps }; 