import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './camerasettingspanel.module.css';

// Camera settings organism interfaces
interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
  capabilities?: MediaTrackCapabilities;
  isDefault: boolean;
  isActive: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  supportsAdjustments: boolean;
}

interface CameraQualitySettings {
  resolution: {
    width: number;
    height: number;
    label: string;
  };
  frameRate: number;
  bitrate: number;
  codec: string;
  aspectRatio: string;
  colorSpace: string;
}

interface CameraEnhancementSettings {
  autoFocus: boolean;
  autoExposure: boolean;
  autoWhiteBalance: boolean;
  noiseReduction: boolean;
  imageStabilization: boolean;
  lowLightEnhancement: boolean;
  hdr: boolean;
  faceDetection: boolean;
  objectRecognition: boolean;
  backgroundBlur: boolean;
}

interface AccessibilitySettings {
  highContrastMode: boolean;
  screenReaderSupport: boolean;
  keyboardNavigationEnhanced: boolean;
  voiceControl: boolean;
  gestureControls: boolean;
  hapticFeedback: boolean;
  audioDescriptions: boolean;
  captionGeneration: boolean;
  colorBlindSupport: string; // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  magnificationSupport: boolean;
}

interface PerformanceSettings {
  enableHardwareAcceleration: boolean;
  targetLatency: number; // milliseconds
  resourcePriority: 'battery' | 'performance' | 'balanced';
  streamOptimization: boolean;
  backgroundProcessing: boolean;
  memoryManagement: 'aggressive' | 'balanced' | 'conservative';
  cpuThrottling: boolean;
  gpuAcceleration: boolean;
}

interface PrivacySettings {
  dataCollection: boolean;
  analyticsEnabled: boolean;
  crashReporting: boolean;
  personalizationData: boolean;
  locationAccess: boolean;
  microphoneAccess: boolean;
  storagePermissions: boolean;
  networkAccess: boolean;
  thirdPartyIntegration: boolean;
  encryptionEnabled: boolean;
}

interface CameraSettingsPanelState {
  devices: CameraDevice[];
  selectedDevice: string | null;
  quality: CameraQualitySettings;
  enhancements: CameraEnhancementSettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  privacy: PrivacySettings;
  presets: Array<{
    id: string;
    name: string;
    description: string;
    settings: Partial<CameraSettingsPanelState>;
    isCustom: boolean;
    lastUsed: number;
  }>;
  isAdvancedMode: boolean;
  isDirty: boolean;
  lastSaved: number;
  validationErrors: Record<string, string>;
}

interface CameraSettingsPanelProps {
  className?: string;
  onSettingsChange?: (settings: Partial<CameraSettingsPanelState>) => void;
  onDeviceChange?: (deviceId: string) => void;
  onPresetApplied?: (presetId: string) => void;
  onSettingsSaved?: (settings: CameraSettingsPanelState) => void;
  onValidationError?: (field: string, error: string) => void;
  accessibilityLevel?: 'AA' | 'AAA';
  allowAdvancedSettings?: boolean;
  enablePresets?: boolean;
  enableRealTimePreview?: boolean;
  restrictedMode?: boolean;
  initialSettings?: Partial<CameraSettingsPanelState>;
  children?: React.ReactNode;
}

export interface CameraSettingsPanelRef {
  // Device management
  refreshDevices: () => Promise<void>;
  selectDevice: (deviceId: string) => Promise<void>;
  getDeviceCapabilities: (deviceId: string) => MediaTrackCapabilities | null;
  
  // Settings management
  getSettings: () => CameraSettingsPanelState;
  updateSettings: (settings: Partial<CameraSettingsPanelState>) => void;
  resetSettings: () => void;
  validateSettings: () => Record<string, string>;
  
  // Presets management
  savePreset: (name: string, description?: string) => string;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  exportPresets: () => string;
  importPresets: (data: string) => boolean;
  
  // Quality adjustment
  setQualityPreset: (preset: 'low' | 'medium' | 'high' | 'ultra' | 'custom') => void;
  getOptimalSettings: () => CameraQualitySettings;
  
  // Accessibility coordination
  applyAccessibilityEnhancements: (level: 'basic' | 'enhanced' | 'maximum') => void;
  getAccessibilityStatus: () => AccessibilitySettings;
  announceSettingsChange: (message: string) => void;
  
  // Performance optimization
  optimizeForPerformance: () => void;
  getBenchmarkResults: () => Promise<any>;
  
  // State management
  saveSettings: () => Promise<void>;
  hasUnsavedChanges: () => boolean;
  revertChanges: () => void;
}

export const CameraSettingsPanel = forwardRef<CameraSettingsPanelRef, CameraSettingsPanelProps>(
  ({ 
    className = '', 
    onSettingsChange,
    onDeviceChange,
    onPresetApplied,
    onSettingsSaved,
    onValidationError,
    accessibilityLevel = 'AAA',
    allowAdvancedSettings = true,
    enablePresets = true,
    enableRealTimePreview = true,
    restrictedMode = false,
    initialSettings = {},
    children
  }, ref) => {
    
    // Component refs for accessibility and focus management
    const containerRef = useRef<HTMLDivElement>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    const deviceSelectRef = useRef<HTMLSelectElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // Settings state with default values
    const [state, setState] = useState<CameraSettingsPanelState>({
      devices: [],
      selectedDevice: null,
      quality: {
        resolution: { width: 1280, height: 720, label: 'HD 720p' },
        frameRate: 30,
        bitrate: 2000,
        codec: 'VP8',
        aspectRatio: '16:9',
        colorSpace: 'sRGB'
      },
      enhancements: {
        autoFocus: true,
        autoExposure: true,
        autoWhiteBalance: true,
        noiseReduction: true,
        imageStabilization: false,
        lowLightEnhancement: false,
        hdr: false,
        faceDetection: false,
        objectRecognition: false,
        backgroundBlur: false
      },
      accessibility: {
        highContrastMode: false,
        screenReaderSupport: true,
        keyboardNavigationEnhanced: true,
        voiceControl: false,
        gestureControls: false,
        hapticFeedback: false,
        audioDescriptions: false,
        captionGeneration: false,
        colorBlindSupport: 'none',
        magnificationSupport: false
      },
      performance: {
        enableHardwareAcceleration: true,
        targetLatency: 100,
        resourcePriority: 'balanced',
        streamOptimization: true,
        backgroundProcessing: false,
        memoryManagement: 'balanced',
        cpuThrottling: false,
        gpuAcceleration: true
      },
      privacy: {
        dataCollection: false,
        analyticsEnabled: false,
        crashReporting: true,
        personalizationData: false,
        locationAccess: false,
        microphoneAccess: false,
        storagePermissions: true,
        networkAccess: true,
        thirdPartyIntegration: false,
        encryptionEnabled: true
      },
      presets: [
        {
          id: 'preset_quality',
          name: 'High Quality',
          description: 'Optimized for best visual quality',
          settings: {
            quality: {
              resolution: { width: 1920, height: 1080, label: 'Full HD 1080p' },
              frameRate: 60,
              bitrate: 5000,
              codec: 'H264',
              aspectRatio: '16:9',
              colorSpace: 'sRGB'
            }
          },
          isCustom: false,
          lastUsed: 0
        },
        {
          id: 'preset_performance',
          name: 'Performance',
          description: 'Optimized for low latency and smooth performance',
          settings: {
            quality: {
              resolution: { width: 1280, height: 720, label: 'HD 720p' },
              frameRate: 30,
              bitrate: 1500,
              codec: 'VP8',
              aspectRatio: '16:9',
              colorSpace: 'sRGB'
            },
            performance: {
              targetLatency: 50,
              resourcePriority: 'performance'
            }
          },
          isCustom: false,
          lastUsed: 0
        },
        {
          id: 'preset_accessibility',
          name: 'Accessibility Enhanced',
          description: 'Optimized for accessibility and assistive technologies',
          settings: {
            accessibility: {
              highContrastMode: true,
              screenReaderSupport: true,
              keyboardNavigationEnhanced: true,
              audioDescriptions: true,
              captionGeneration: true,
              magnificationSupport: true
            }
          },
          isCustom: false,
          lastUsed: 0
        }
      ],
      isAdvancedMode: false,
      isDirty: false,
      lastSaved: Date.now(),
      validationErrors: {},
      ...initialSettings
    });
    
    // Device enumeration and management
    const refreshDevices = useCallback(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        const deviceList: CameraDevice[] = await Promise.all(
          videoDevices.map(async (device, index) => {
            const capabilities = await getDeviceCapabilities(device.deviceId);
            
            return {
              deviceId: device.deviceId,
              label: device.label || `Camera ${index + 1}`,
              kind: device.kind,
              groupId: device.groupId,
              capabilities,
              isDefault: index === 0,
              isActive: device.deviceId === state.selectedDevice,
              quality: 'medium',
              supportsAdjustments: !!capabilities
            };
          })
        );
        
        setState(prev => ({
          ...prev,
          devices: deviceList,
          selectedDevice: prev.selectedDevice || (deviceList[0]?.deviceId || null)
        }));
        
        announceSettingsChange(`${deviceList.length} camera devices detected`);
        
      } catch (error) {
        console.error('[CameraSettingsPanel] Device enumeration failed:', error);
        onValidationError?.('devices', `Failed to enumerate devices: ${error.message}`);
      }
    }, [state.selectedDevice, onValidationError]);
    
    // Get device capabilities
    const getDeviceCapabilities = useCallback(async (deviceId: string): Promise<MediaTrackCapabilities | null> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } }
        });
        
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        // Clean up stream
        track.stop();
        stream.getTracks().forEach(track => track.stop());
        
        return capabilities;
      } catch (error) {
        console.warn('[CameraSettingsPanel] Failed to get capabilities for device:', deviceId, error);
        return null;
      }
    }, []);
    
    // Select camera device
    const selectDevice = useCallback(async (deviceId: string) => {
      const device = state.devices.find(d => d.deviceId === deviceId);
      if (!device) {
        onValidationError?.('device', 'Invalid device selected');
        return;
      }
      
      setState(prev => ({
        ...prev,
        selectedDevice: deviceId,
        devices: prev.devices.map(d => ({
          ...d,
          isActive: d.deviceId === deviceId
        })),
        isDirty: true
      }));
      
      onDeviceChange?.(deviceId);
      announceSettingsChange(`Selected camera: ${device.label}`);
    }, [state.devices, onDeviceChange, onValidationError]);
    
    // Settings validation
    const validateSettings = useCallback((): Record<string, string> => {
      const errors: Record<string, string> = {};
      
      // Validate resolution
      if (state.quality.resolution.width < 320 || state.quality.resolution.height < 240) {
        errors.resolution = 'Resolution must be at least 320x240';
      }
      
      // Validate frame rate
      if (state.quality.frameRate < 1 || state.quality.frameRate > 120) {
        errors.frameRate = 'Frame rate must be between 1 and 120 fps';
      }
      
      // Validate bitrate
      if (state.quality.bitrate < 100 || state.quality.bitrate > 50000) {
        errors.bitrate = 'Bitrate must be between 100 and 50000 kbps';
      }
      
      // Validate latency target
      if (state.performance.targetLatency < 10 || state.performance.targetLatency > 5000) {
        errors.latency = 'Target latency must be between 10 and 5000 milliseconds';
      }
      
      // Cross-validation: high quality with performance mode
      if (state.quality.resolution.width > 1920 && state.performance.resourcePriority === 'battery') {
        errors.compatibility = 'High resolution not compatible with battery optimization';
      }
      
      setState(prev => ({ ...prev, validationErrors: errors }));
      
      // Report validation errors
      Object.entries(errors).forEach(([field, error]) => {
        onValidationError?.(field, error);
      });
      
      return errors;
    }, [state.quality, state.performance, onValidationError]);
    
    // Quality presets
    const setQualityPreset = useCallback((preset: 'low' | 'medium' | 'high' | 'ultra' | 'custom') => {
      let qualitySettings: CameraQualitySettings;
      
      switch (preset) {
        case 'low':
          qualitySettings = {
            resolution: { width: 640, height: 480, label: 'SD 480p' },
            frameRate: 15,
            bitrate: 500,
            codec: 'VP8',
            aspectRatio: '4:3',
            colorSpace: 'sRGB'
          };
          break;
        case 'medium':
          qualitySettings = {
            resolution: { width: 1280, height: 720, label: 'HD 720p' },
            frameRate: 30,
            bitrate: 2000,
            codec: 'VP8',
            aspectRatio: '16:9',
            colorSpace: 'sRGB'
          };
          break;
        case 'high':
          qualitySettings = {
            resolution: { width: 1920, height: 1080, label: 'Full HD 1080p' },
            frameRate: 30,
            bitrate: 5000,
            codec: 'H264',
            aspectRatio: '16:9',
            colorSpace: 'sRGB'
          };
          break;
        case 'ultra':
          qualitySettings = {
            resolution: { width: 3840, height: 2160, label: '4K UHD' },
            frameRate: 60,
            bitrate: 15000,
            codec: 'H264',
            aspectRatio: '16:9',
            colorSpace: 'Rec2020'
          };
          break;
        default:
          return; // Custom preset - no changes
      }
      
      setState(prev => ({
        ...prev,
        quality: qualitySettings,
        isDirty: true
      }));
      
      announceSettingsChange(`Applied ${preset} quality preset`);
      onSettingsChange?.({ quality: qualitySettings });
    }, [onSettingsChange]);
    
    // Accessibility enhancements
    const applyAccessibilityEnhancements = useCallback((level: 'basic' | 'enhanced' | 'maximum') => {
      let accessibilitySettings: Partial<AccessibilitySettings>;
      
      switch (level) {
        case 'basic':
          accessibilitySettings = {
            screenReaderSupport: true,
            keyboardNavigationEnhanced: true
          };
          break;
        case 'enhanced':
          accessibilitySettings = {
            screenReaderSupport: true,
            keyboardNavigationEnhanced: true,
            highContrastMode: true,
            audioDescriptions: true,
            captionGeneration: true
          };
          break;
        case 'maximum':
          accessibilitySettings = {
            screenReaderSupport: true,
            keyboardNavigationEnhanced: true,
            highContrastMode: true,
            voiceControl: true,
            gestureControls: true,
            hapticFeedback: true,
            audioDescriptions: true,
            captionGeneration: true,
            magnificationSupport: true
          };
          break;
      }
      
      setState(prev => ({
        ...prev,
        accessibility: {
          ...prev.accessibility,
          ...accessibilitySettings
        },
        isDirty: true
      }));
      
      announceSettingsChange(`Applied ${level} accessibility enhancements`);
    }, []);
    
    // Performance optimization
    const optimizeForPerformance = useCallback(() => {
      const optimizedSettings: Partial<CameraSettingsPanelState> = {
        quality: {
          resolution: { width: 1280, height: 720, label: 'HD 720p' },
          frameRate: 30,
          bitrate: 1500,
          codec: 'VP8',
          aspectRatio: '16:9',
          colorSpace: 'sRGB'
        },
        performance: {
          enableHardwareAcceleration: true,
          targetLatency: 50,
          resourcePriority: 'performance',
          streamOptimization: true,
          backgroundProcessing: false,
          memoryManagement: 'aggressive',
          cpuThrottling: false,
          gpuAcceleration: true
        },
        enhancements: {
          ...state.enhancements,
          imageStabilization: false,
          lowLightEnhancement: false,
          hdr: false,
          faceDetection: false,
          objectRecognition: false,
          backgroundBlur: false
        }
      };
      
      setState(prev => ({
        ...prev,
        ...optimizedSettings,
        isDirty: true
      }));
      
      announceSettingsChange('Applied performance optimization');
      onSettingsChange?.(optimizedSettings);
    }, [state.enhancements, onSettingsChange]);
    
    // Preset management
    const savePreset = useCallback((name: string, description: string = ''): string => {
      const presetId = `preset_${Date.now()}`;
      const newPreset = {
        id: presetId,
        name,
        description,
        settings: {
          quality: state.quality,
          enhancements: state.enhancements,
          accessibility: state.accessibility,
          performance: state.performance,
          privacy: state.privacy
        },
        isCustom: true,
        lastUsed: Date.now()
      };
      
      setState(prev => ({
        ...prev,
        presets: [...prev.presets, newPreset],
        isDirty: true
      }));
      
      announceSettingsChange(`Saved preset: ${name}`);
      return presetId;
    }, [state.quality, state.enhancements, state.accessibility, state.performance, state.privacy]);
    
    // Load preset
    const loadPreset = useCallback((presetId: string) => {
      const preset = state.presets.find(p => p.id === presetId);
      if (!preset) {
        onValidationError?.('preset', 'Preset not found');
        return;
      }
      
      setState(prev => ({
        ...prev,
        ...preset.settings,
        presets: prev.presets.map(p => 
          p.id === presetId ? { ...p, lastUsed: Date.now() } : p
        ),
        isDirty: true
      }));
      
      onPresetApplied?.(presetId);
      announceSettingsChange(`Applied preset: ${preset.name}`);
    }, [state.presets, onPresetApplied, onValidationError]);
    
    // Settings persistence
    const saveSettings = useCallback(async () => {
      try {
        const errors = validateSettings();
        if (Object.keys(errors).length > 0) {
          throw new Error('Validation errors prevent saving');
        }
        
        // Save to localStorage
        localStorage.setItem('cameraSettings', JSON.stringify(state));
        
        setState(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: Date.now()
        }));
        
        onSettingsSaved?.(state);
        announceSettingsChange('Settings saved successfully');
        
      } catch (error) {
        console.error('[CameraSettingsPanel] Failed to save settings:', error);
        onValidationError?.('save', `Failed to save settings: ${error.message}`);
      }
    }, [state, validateSettings, onSettingsSaved, onValidationError]);
    
    // Settings announcement
    const announceSettingsChange = useCallback((message: string) => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
        
        // Clear announcement after reading
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
    }, []);
    
    // Keyboard shortcuts
    const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
      if (!allowAdvancedSettings) return;
      
      switch (event.key) {
        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            saveSettings();
          }
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setState(prev => ({ ...prev, ...initialSettings }));
            announceSettingsChange('Settings reset to defaults');
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const presets = ['low', 'medium', 'high', 'ultra'];
            const preset = presets[parseInt(event.key) - 1] as any;
            if (preset) {
              setQualityPreset(preset);
            }
          }
          break;
      }
    }, [allowAdvancedSettings, saveSettings, initialSettings, setQualityPreset]);
    
    // Initialize component
    useEffect(() => {
      refreshDevices();
      
      // Load saved settings
      try {
        const saved = localStorage.getItem('cameraSettings');
        if (saved) {
          const savedSettings = JSON.parse(saved);
          setState(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.warn('[CameraSettingsPanel] Failed to load saved settings:', error);
      }
      
      // Setup keyboard shortcuts
      const container = containerRef.current;
      if (container) {
        container.addEventListener('keydown', handleKeyboardShortcuts);
        return () => container.removeEventListener('keydown', handleKeyboardShortcuts);
      }
    }, [refreshDevices, handleKeyboardShortcuts]);
    
    // Settings change notifications
    useEffect(() => {
      if (state.isDirty) {
        onSettingsChange?.(state);
      }
    }, [state, onSettingsChange]);
    
    // Expose API
    useImperativeHandle(ref, () => ({
      refreshDevices,
      selectDevice,
      getDeviceCapabilities: (deviceId: string) => {
        const device = state.devices.find(d => d.deviceId === deviceId);
        return device?.capabilities || null;
      },
      getSettings: () => ({ ...state }),
      updateSettings: (settings: Partial<CameraSettingsPanelState>) => {
        setState(prev => ({ ...prev, ...settings, isDirty: true }));
      },
      resetSettings: () => {
        setState(prev => ({ ...prev, ...initialSettings, isDirty: true }));
      },
      validateSettings,
      savePreset,
      loadPreset,
      deletePreset: (presetId: string) => {
        setState(prev => ({
          ...prev,
          presets: prev.presets.filter(p => p.id !== presetId),
          isDirty: true
        }));
      },
      exportPresets: () => JSON.stringify(state.presets),
      importPresets: (data: string) => {
        try {
          const presets = JSON.parse(data);
          setState(prev => ({ ...prev, presets, isDirty: true }));
          return true;
        } catch {
          return false;
        }
      },
      setQualityPreset,
      getOptimalSettings: () => ({ ...state.quality }),
      applyAccessibilityEnhancements,
      getAccessibilityStatus: () => ({ ...state.accessibility }),
      announceSettingsChange,
      optimizeForPerformance,
      getBenchmarkResults: async () => ({}), // Placeholder for performance benchmarking
      saveSettings,
      hasUnsavedChanges: () => state.isDirty,
      revertChanges: () => {
        try {
          const saved = localStorage.getItem('cameraSettings');
          if (saved) {
            const savedSettings = JSON.parse(saved);
            setState(prev => ({ ...prev, ...savedSettings, isDirty: false }));
          }
        } catch (error) {
          setState(prev => ({ ...prev, ...initialSettings, isDirty: false }));
        }
      }
    }));
    
    // Render settings sections
    const renderDeviceSelection = useMemo(() => (
      <section className={styles.settingsSection} aria-labelledby="device-section-heading">
        <h3 id="device-section-heading" className={styles.sectionHeading}>
          Camera Device
        </h3>
        
        <div className={styles.deviceSelector}>
          <label htmlFor="device-select" className={styles.label}>
            Select Camera Device
          </label>
          <select 
            id="device-select"
            ref={deviceSelectRef}
            className={styles.select}
            value={state.selectedDevice || ''}
            onChange={(e) => selectDevice(e.target.value)}
            aria-describedby="device-help"
          >
            {state.devices.length === 0 && (
              <option value="" disabled>No cameras detected</option>
            )}
            {state.devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label} {device.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
          <div id="device-help" className={styles.helpText}>
            Select the camera device you want to use for video capture
          </div>
        </div>
        
        <button 
          type="button"
          className={styles.button}
          onClick={refreshDevices}
          aria-label="Refresh camera device list"
        >
          🔄 Refresh Devices
        </button>
      </section>
    ), [state.devices, state.selectedDevice, selectDevice, refreshDevices]);
    
    const renderQualitySettings = useMemo(() => (
      <section className={styles.settingsSection} aria-labelledby="quality-section-heading">
        <h3 id="quality-section-heading" className={styles.sectionHeading}>
          Video Quality
        </h3>
        
        <div className={styles.qualityPresets}>
          <div className={styles.presetButtons} role="group" aria-label="Quality presets">
            {(['low', 'medium', 'high', 'ultra'] as const).map(preset => (
              <button
                key={preset}
                type="button"
                className={`${styles.presetButton} ${
                  state.quality.resolution.label.toLowerCase().includes(preset) ? styles.active : ''
                }`}
                onClick={() => setQualityPreset(preset)}
                aria-pressed={state.quality.resolution.label.toLowerCase().includes(preset)}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {state.isAdvancedMode && (
          <div className={styles.advancedQuality}>
            <div className={styles.settingRow}>
              <label htmlFor="resolution-width" className={styles.label}>
                Resolution
              </label>
              <div className={styles.resolutionInputs}>
                <input
                  id="resolution-width"
                  type="number"
                  className={styles.numberInput}
                  value={state.quality.resolution.width}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    quality: {
                      ...prev.quality,
                      resolution: {
                        ...prev.quality.resolution,
                        width: parseInt(e.target.value)
                      }
                    },
                    isDirty: true
                  }))}
                  min="320"
                  max="3840"
                  aria-label="Width in pixels"
                />
                <span className={styles.separator}>×</span>
                <input
                  type="number"
                  className={styles.numberInput}
                  value={state.quality.resolution.height}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    quality: {
                      ...prev.quality,
                      resolution: {
                        ...prev.quality.resolution,
                        height: parseInt(e.target.value)
                      }
                    },
                    isDirty: true
                  }))}
                  min="240"
                  max="2160"
                  aria-label="Height in pixels"
                />
              </div>
            </div>
            
            <div className={styles.settingRow}>
              <label htmlFor="frame-rate" className={styles.label}>
                Frame Rate (fps)
              </label>
              <input
                id="frame-rate"
                type="number"
                className={styles.numberInput}
                value={state.quality.frameRate}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  quality: { ...prev.quality, frameRate: parseInt(e.target.value) },
                  isDirty: true
                }))}
                min="1"
                max="120"
              />
            </div>
            
            <div className={styles.settingRow}>
              <label htmlFor="bitrate" className={styles.label}>
                Bitrate (kbps)
              </label>
              <input
                id="bitrate"
                type="number"
                className={styles.numberInput}
                value={state.quality.bitrate}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  quality: { ...prev.quality, bitrate: parseInt(e.target.value) },
                  isDirty: true
                }))}
                min="100"
                max="50000"
              />
            </div>
          </div>
        )}
      </section>
    ), [state.quality, state.isAdvancedMode, setQualityPreset]);
    
    return (
      <div 
        ref={containerRef}
        className={`${styles.cameraSettingsPanel} ${className}`}
        role="region"
        aria-labelledby="settings-panel-heading"
        tabIndex={-1}
      >
        {/* Panel heading */}
        <header className={styles.panelHeader}>
          <h2 id="settings-panel-heading" className={styles.panelHeading}>
            Camera Settings
          </h2>
          
          {enablePresets && (
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setState(prev => ({ ...prev, isAdvancedMode: !prev.isAdvancedMode }))}
                aria-pressed={state.isAdvancedMode}
                aria-label={`${state.isAdvancedMode ? 'Hide' : 'Show'} advanced settings`}
              >
                {state.isAdvancedMode ? '📊 Basic' : '⚙️ Advanced'}
              </button>
            </div>
          )}
        </header>
        
        {/* Accessibility announcements */}
        <div 
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        
        {/* Accessibility fusion layer */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          accessibilityLevel={accessibilityLevel}
          performanceMode="organism"
        />
        
        {/* Validation errors */}
        {Object.keys(state.validationErrors).length > 0 && (
          <div className={styles.validationErrors} role="alert">
            <h4>Configuration Issues:</h4>
            <ul>
              {Object.entries(state.validationErrors).map(([field, error]) => (
                <li key={field}>{field}: {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Settings content */}
        <div className={styles.settingsContent}>
          {renderDeviceSelection}
          {renderQualitySettings}
          
          {/* Additional settings sections would go here */}
          {state.isAdvancedMode && (
            <>
              <section className={styles.settingsSection}>
                <h3 className={styles.sectionHeading}>Performance</h3>
                <div className={styles.settingRow}>
                  <label htmlFor="target-latency" className={styles.label}>
                    Target Latency (ms)
                  </label>
                  <input
                    id="target-latency"
                    type="number"
                    className={styles.numberInput}
                    value={state.performance.targetLatency}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      performance: { ...prev.performance, targetLatency: parseInt(e.target.value) },
                      isDirty: true
                    }))}
                    min="10"
                    max="5000"
                  />
                </div>
              </section>
              
              <section className={styles.settingsSection}>
                <h3 className={styles.sectionHeading}>Accessibility</h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={state.accessibility.screenReaderSupport}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, screenReaderSupport: e.target.checked },
                        isDirty: true
                      }))}
                    />
                    Screen Reader Support
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={state.accessibility.highContrastMode}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, highContrastMode: e.target.checked },
                        isDirty: true
                      }))}
                    />
                    High Contrast Mode
                  </label>
                </div>
              </section>
            </>
          )}
        </div>
        
        {/* Panel footer */}
        <footer className={styles.panelFooter}>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => setState(prev => ({ ...prev, ...initialSettings, isDirty: true }))}
              disabled={!state.isDirty}
            >
              Reset
            </button>
            
            <button
              type="button"
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={saveSettings}
              disabled={!state.isDirty || Object.keys(state.validationErrors).length > 0}
              aria-describedby="save-help"
            >
              Save Settings
            </button>
          </div>
          
          <div id="save-help" className={styles.footerHelp}>
            {state.isDirty ? 'You have unsaved changes' : `Last saved: ${new Date(state.lastSaved).toLocaleString()}`}
          </div>
        </footer>
        
        {/* Keyboard shortcuts help */}
        <div className={styles.keyboardHelp} role="complementary" aria-label="Keyboard shortcuts">
          <span className="sr-only">
            Keyboard shortcuts: Ctrl+S to save, Ctrl+R to reset, Ctrl+1-4 for quality presets.
          </span>
        </div>
        
        {/* Additional content */}
        {children}
      </div>
    );
  }
);

CameraSettingsPanel.displayName = 'CameraSettingsPanel';

export default CameraSettingsPanel; 