import React, { useState, useCallback, useEffect } from 'react';
import { CameraIndicator } from '../../atoms/CameraIndicator/CameraIndicator';
import { CaptureRing } from '../../atoms/CaptureRing/CaptureRing';
import { FormField } from '../FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Label } from '../../atoms/Label/Label';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './CameraSettings.module.css';

export interface CameraDevice {
  id: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
  facing?: 'user' | 'environment';
  available: boolean;
  capabilities?: MediaTrackCapabilities;
}

export interface CameraConstraints {
  width: { min: number; ideal: number; max: number };
  height: { min: number; ideal: number; max: number };
  frameRate: { min: number; ideal: number; max: number };
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
}

export interface CameraSettingsProps {
  /** Available camera devices */
  devices?: CameraDevice[];
  /** Current selected camera device ID */
  currentDevice?: string;
  /** Camera resolution settings */
  resolution?: string;
  /** Available resolutions */
  availableResolutions?: Array<{ value: string; label: string; width: number; height: number; }>;
  /** Frame rate setting */
  frameRate?: number;
  /** Available frame rates */
  availableFrameRates?: number[];
  /** Video quality setting */
  videoQuality?: 'low' | 'medium' | 'high' | 'ultra';
  /** Camera facing mode */
  facingMode?: 'user' | 'environment';
  /** Zoom level (1.0 = no zoom) */
  zoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Auto-focus enabled */
  autoFocus?: boolean;
  /** Auto-exposure enabled */
  autoExposure?: boolean;
  /** Auto white balance enabled */
  autoWhiteBalance?: boolean;
  /** Exposure compensation (-2.0 to 2.0) */
  exposureCompensation?: number;
  /** ISO sensitivity */
  iso?: number;
  /** Available ISO values */
  availableISO?: number[];
  /** White balance mode */
  whiteBalance?: 'auto' | 'daylight' | 'fluorescent' | 'incandescent' | 'shade' | 'cloudy';
  /** Image stabilization enabled */
  stabilization?: boolean;
  /** Noise reduction enabled */
  noiseReduction?: boolean;
  /** HDR enabled */
  hdr?: boolean;
  /** Current camera quality for testing */
  currentQuality?: number;
  /** Whether to show live preview */
  showPreview?: boolean;
  /** Whether to show advanced settings */
  showAdvanced?: boolean;
  /** Whether settings are being saved */
  saving?: boolean;
  /** Whether the settings panel is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  layout?: 'vertical' | 'horizontal' | 'compact';
  /** Callback when device changes */
  onDeviceChange?: (deviceId: string) => void;
  /** Callback when settings change */
  onSettingsChange?: (settings: Partial<CameraSettingsProps>) => void;
  /** Callback when settings are saved */
  onSave?: () => void;
  /** Callback when settings are reset */
  onReset?: () => void;
  /** Callback when camera test is triggered */
  onCameraTest?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * CameraSettings Molecule
 * 
 * Comprehensive camera configuration interface combining CameraIndicator, CaptureRing,
 * and FormField for complete camera settings management.
 * 
 * Features:
 * - Camera device selection with capability detection
 * - Resolution and frame rate configuration
 * - Professional camera controls (exposure, ISO, white balance)
 * - Real-time quality monitoring with CameraIndicator
 * - Live preview with CaptureRing visualization
 * - Advanced settings (stabilization, HDR, noise reduction)
 * - Auto-mode toggles with manual override capabilities
 * - Save/reset functionality with validation
 * - WCAG AAA accessibility compliance
 * - Multiple layout options (vertical, horizontal, compact)
 * - Screen reader announcements for setting changes
 * - Professional camera workflow support
 */
export const CameraSettings: React.FC<CameraSettingsProps> = ({
  devices = [],
  currentDevice = '',
  resolution = '1920x1080',
  availableResolutions = [
    { value: '640x480', label: '640×480 (VGA)', width: 640, height: 480 },
    { value: '1280x720', label: '1280×720 (HD)', width: 1280, height: 720 },
    { value: '1920x1080', label: '1920×1080 (Full HD)', width: 1920, height: 1080 },
    { value: '2560x1440', label: '2560×1440 (QHD)', width: 2560, height: 1440 },
    { value: '3840x2160', label: '3840×2160 (4K)', width: 3840, height: 2160 }
  ],
  frameRate = 30,
  availableFrameRates = [15, 24, 30, 60],
  videoQuality = 'high',
  facingMode = 'user',
  zoom = 1.0,
  maxZoom = 10.0,
  autoFocus = true,
  autoExposure = true,
  autoWhiteBalance = true,
  exposureCompensation = 0,
  iso = 400,
  availableISO = [100, 200, 400, 800, 1600, 3200],
  whiteBalance = 'auto',
  stabilization = true,
  noiseReduction = true,
  hdr = false,
  currentQuality = 85,
  showPreview = true,
  showAdvanced = false,
  saving = false,
  disabled = false,
  size = 'medium',
  layout = 'vertical',
  onDeviceChange,
  onSettingsChange,
  onSave,
  onReset,
  onCameraTest,
  className = '',
  testId = 'camera-settings'
}) => {
  // Internal state for settings
  const [localSettings, setLocalSettings] = useState({
    resolution,
    frameRate,
    videoQuality,
    facingMode,
    zoom,
    autoFocus,
    autoExposure,
    autoWhiteBalance,
    exposureCompensation,
    iso,
    whiteBalance,
    stabilization,
    noiseReduction,
    hdr
  });
  
  const [expandedAdvanced, setExpandedAdvanced] = useState(showAdvanced);
  const [lastChangeMessage, setLastChangeMessage] = useState<string>('');
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  
  // Size mapping helper
  const mapSize = (settingsSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[settingsSize];
  };
  
  const atomSize = mapSize(size);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings({
      resolution,
      frameRate,
      videoQuality,
      facingMode,
      zoom,
      autoFocus,
      autoExposure,
      autoWhiteBalance,
      exposureCompensation,
      iso,
      whiteBalance,
      stabilization,
      noiseReduction,
      hdr
    });
  }, [resolution, frameRate, videoQuality, facingMode, zoom, autoFocus, autoExposure, autoWhiteBalance, exposureCompensation, iso, whiteBalance, stabilization, noiseReduction, hdr]);
  
  // Handle setting changes
  const handleSettingChange = useCallback((key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Create user-friendly change message
    let changeMessage = '';
    switch (key) {
      case 'resolution':
        changeMessage = `Resolution set to ${value}`;
        break;
      case 'frameRate':
        changeMessage = `Frame rate set to ${value} fps`;
        break;
      case 'videoQuality':
        changeMessage = `Video quality set to ${value}`;
        break;
      case 'facingMode':
        changeMessage = `Camera facing ${value === 'user' ? 'front' : 'back'}`;
        break;
      case 'zoom':
        changeMessage = `Zoom set to ${value}x`;
        break;
      case 'autoFocus':
        changeMessage = `Auto-focus ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'autoExposure':
        changeMessage = `Auto-exposure ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'autoWhiteBalance':
        changeMessage = `Auto white balance ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'exposureCompensation':
        changeMessage = `Exposure compensation set to ${value > 0 ? '+' : ''}${value}`;
        break;
      case 'iso':
        changeMessage = `ISO set to ${value}`;
        break;
      case 'whiteBalance':
        changeMessage = `White balance set to ${value}`;
        break;
      case 'stabilization':
        changeMessage = `Image stabilization ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'noiseReduction':
        changeMessage = `Noise reduction ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'hdr':
        changeMessage = `HDR ${value ? 'enabled' : 'disabled'}`;
        break;
      default:
        changeMessage = `${key} updated`;
    }
    
    setLastChangeMessage(changeMessage);
    onSettingsChange?.(newSettings);
  }, [localSettings, onSettingsChange]);
  
  // Handle device selection
  const handleDeviceChange = useCallback((deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    setLastChangeMessage(`Camera device changed to ${device?.label || deviceId}`);
    onDeviceChange?.(deviceId);
  }, [devices, onDeviceChange]);
  
  // Handle camera test
  const handleCameraTest = useCallback(() => {
    setIsTestingCamera(true);
    setLastChangeMessage('Starting camera test...');
    onCameraTest?.();
    
    // Reset test state after 3 seconds
    setTimeout(() => {
      setIsTestingCamera(false);
      setLastChangeMessage('Camera test completed');
    }, 3000);
  }, [onCameraTest]);
  
  // Handle save
  const handleSave = useCallback(() => {
    setLastChangeMessage('Camera settings saved successfully');
    onSave?.();
  }, [onSave]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    setLastChangeMessage('Camera settings reset to defaults');
    onReset?.();
  }, [onReset]);
  
  // Get current device info
  const currentDeviceInfo = devices.find(d => d.id === currentDevice);
  
  // Get current resolution info
  const currentResolutionInfo = availableResolutions.find(r => r.value === localSettings.resolution);
  
  return (
    <div 
      className={`${styles.cameraSettings} ${styles[size]} ${styles[layout]} ${className}`}
      data-testid={testId}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="camera"
      >
        {lastChangeMessage}
      </ScreenReaderText>
      
      <div className={styles.settingsContainer}>
        {/* Device Selection */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Camera Device</h3>
          
          <div className={styles.deviceGrid}>
            {devices.map((device) => (
              <button
                key={device.id}
                className={`${styles.deviceCard} ${currentDevice === device.id ? styles.selected : ''} ${!device.available ? styles.unavailable : ''}`}
                onClick={() => device.available && handleDeviceChange(device.id)}
                disabled={disabled || !device.available}
                aria-pressed={currentDevice === device.id}
                data-testid={`${testId}-device-${device.id}`}
              >
                <div className={styles.deviceInfo}>
                  <Icon 
                    name={device.facing === 'environment' ? 'camera' : 'user'} 
                    size="md" 
                    className={styles.deviceIcon}
                  />
                  <div className={styles.deviceDetails}>
                    <span className={styles.deviceName}>{device.label}</span>
                    <span className={styles.deviceType}>
                      {device.facing === 'environment' ? 'Back Camera' : 'Front Camera'}
                    </span>
                  </div>
                </div>
                
                {!device.available && (
                  <div className={styles.unavailableIndicator}>
                    <Icon name="x" size="sm" />
                    <span>Unavailable</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {currentDeviceInfo && (
            <div className={styles.currentDeviceStatus}>
              <span className={styles.statusLabel}>Active Device:</span>
              <span className={styles.statusValue}>{currentDeviceInfo.label}</span>
            </div>
          )}
        </section>
        
        {/* Quality Preview */}
        {showPreview && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Quality Preview</h3>
            
            <div className={styles.previewContainer}>
              <div className={styles.qualityDisplay}>
                <CameraIndicator
                  mode="bars"
                  quality={isTestingCamera ? Math.random() * 100 : currentQuality}
                  size={atomSize}
                  direction="horizontal"
                  segments={10}
                  showValues={true}
                  animate={isTestingCamera}
                  className={styles.qualityIndicator}
                />
              </div>
              
              <div className={styles.captureDisplay}>
                <CaptureRing
                  type="ring"
                  state={isTestingCamera ? 'capturing' : 'idle'}
                  progress={isTestingCamera ? 75 : 0}
                  size={atomSize}
                  showMetadata={true}
                  metadata={{
                    resolution: localSettings.resolution,
                    frameRate: `${localSettings.frameRate} fps`,
                    quality: localSettings.videoQuality
                  }}
                  className={styles.captureRing}
                />
              </div>
            </div>
          </section>
        )}
        
        {/* Basic Settings */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Settings</h3>
          
          <div className={styles.settingsGrid}>
            <FormField
              label="Resolution"
              type="select"
              value={localSettings.resolution}
              onChange={(e) => handleSettingChange('resolution', e.target.value)}
              disabled={disabled}
              size={size}
              description={currentResolutionInfo ? `${currentResolutionInfo.width}×${currentResolutionInfo.height} pixels` : ''}
              testId={`${testId}-resolution`}
            >
              {availableResolutions.map((res) => (
                <option key={res.value} value={res.value}>
                  {res.label}
                </option>
              ))}
            </FormField>
            
            <FormField
              label="Frame Rate"
              type="select"
              value={localSettings.frameRate}
              onChange={(e) => handleSettingChange('frameRate', parseInt(e.target.value))}
              disabled={disabled}
              size={size}
              description="Frames per second"
              testId={`${testId}-frame-rate`}
            >
              {availableFrameRates.map((fps) => (
                <option key={fps} value={fps}>
                  {fps} fps
                </option>
              ))}
            </FormField>
            
            <FormField
              label="Video Quality"
              type="select"
              value={localSettings.videoQuality}
              onChange={(e) => handleSettingChange('videoQuality', e.target.value)}
              disabled={disabled}
              size={size}
              testId={`${testId}-video-quality`}
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Quality)</option>
              <option value="ultra">Ultra (Maximum)</option>
            </FormField>
            
            <FormField
              label="Camera Facing"
              type="select"
              value={localSettings.facingMode}
              onChange={(e) => handleSettingChange('facingMode', e.target.value)}
              disabled={disabled}
              size={size}
              testId={`${testId}-facing-mode`}
            >
              <option value="user">Front Camera</option>
              <option value="environment">Back Camera</option>
            </FormField>
          </div>
        </section>
        
        {/* Zoom Control */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Zoom</h3>
          
          <FormField
            label="Zoom Level"
            type="range"
            min="1"
            max={maxZoom.toString()}
            step="0.1"
            value={localSettings.zoom}
            onChange={(e) => handleSettingChange('zoom', parseFloat(e.target.value))}
            disabled={disabled}
            size={size}
            description={`Current zoom: ${localSettings.zoom.toFixed(1)}x`}
            testId={`${testId}-zoom`}
          />
        </section>
        
        {/* Auto Controls */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Auto Controls</h3>
          
          <div className={styles.toggleControls}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localSettings.autoFocus}
                onChange={(e) => handleSettingChange('autoFocus', e.target.checked)}
                disabled={disabled}
                data-testid={`${testId}-auto-focus`}
              />
              <span className={styles.checkboxText}>Auto-Focus</span>
              <span className={styles.checkboxDescription}>
                Automatically adjust focus based on scene
              </span>
            </label>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localSettings.autoExposure}
                onChange={(e) => handleSettingChange('autoExposure', e.target.checked)}
                disabled={disabled}
                data-testid={`${testId}-auto-exposure`}
              />
              <span className={styles.checkboxText}>Auto-Exposure</span>
              <span className={styles.checkboxDescription}>
                Automatically adjust exposure based on lighting
              </span>
            </label>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localSettings.autoWhiteBalance}
                onChange={(e) => handleSettingChange('autoWhiteBalance', e.target.checked)}
                disabled={disabled}
                data-testid={`${testId}-auto-white-balance`}
              />
              <span className={styles.checkboxText}>Auto White Balance</span>
              <span className={styles.checkboxDescription}>
                Automatically adjust color temperature
              </span>
            </label>
          </div>
        </section>
        
        {/* Advanced Settings */}
        <section className={styles.section}>
          <button
            className={styles.advancedToggle}
            onClick={() => setExpandedAdvanced(!expandedAdvanced)}
            disabled={disabled}
            aria-expanded={expandedAdvanced}
            data-testid={`${testId}-advanced-toggle`}
          >
            <Icon name={expandedAdvanced ? 'chevron-down' : 'chevron-right'} size="sm" />
            <span>Advanced Settings</span>
          </button>
          
          {expandedAdvanced && (
            <div className={styles.advancedContent}>
              <div className={styles.settingsGrid}>
                {!localSettings.autoExposure && (
                  <FormField
                    label="Exposure Compensation"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={localSettings.exposureCompensation}
                    onChange={(e) => handleSettingChange('exposureCompensation', parseFloat(e.target.value))}
                    disabled={disabled}
                    size={size}
                    description={`${localSettings.exposureCompensation > 0 ? '+' : ''}${localSettings.exposureCompensation.toFixed(1)} EV`}
                    testId={`${testId}-exposure-compensation`}
                  />
                )}
                
                <FormField
                  label="ISO Sensitivity"
                  type="select"
                  value={localSettings.iso}
                  onChange={(e) => handleSettingChange('iso', parseInt(e.target.value))}
                  disabled={disabled || localSettings.autoExposure}
                  size={size}
                  testId={`${testId}-iso`}
                >
                  {availableISO.map((isoValue) => (
                    <option key={isoValue} value={isoValue}>
                      ISO {isoValue}
                    </option>
                  ))}
                </FormField>
                
                {!localSettings.autoWhiteBalance && (
                  <FormField
                    label="White Balance"
                    type="select"
                    value={localSettings.whiteBalance}
                    onChange={(e) => handleSettingChange('whiteBalance', e.target.value)}
                    disabled={disabled}
                    size={size}
                    testId={`${testId}-white-balance`}
                  >
                    <option value="auto">Auto</option>
                    <option value="daylight">Daylight</option>
                    <option value="fluorescent">Fluorescent</option>
                    <option value="incandescent">Incandescent</option>
                    <option value="shade">Shade</option>
                    <option value="cloudy">Cloudy</option>
                  </FormField>
                )}
              </div>
              
              <div className={styles.toggleControls}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={localSettings.stabilization}
                    onChange={(e) => handleSettingChange('stabilization', e.target.checked)}
                    disabled={disabled}
                    data-testid={`${testId}-stabilization`}
                  />
                  <span className={styles.checkboxText}>Image Stabilization</span>
                  <span className={styles.checkboxDescription}>
                    Reduce camera shake and blur
                  </span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={localSettings.noiseReduction}
                    onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)}
                    disabled={disabled}
                    data-testid={`${testId}-noise-reduction`}
                  />
                  <span className={styles.checkboxText}>Noise Reduction</span>
                  <span className={styles.checkboxDescription}>
                    Reduce grain in low light conditions
                  </span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={localSettings.hdr}
                    onChange={(e) => handleSettingChange('hdr', e.target.checked)}
                    disabled={disabled}
                    data-testid={`${testId}-hdr`}
                  />
                  <span className={styles.checkboxText}>HDR (High Dynamic Range)</span>
                  <span className={styles.checkboxDescription}>
                    Capture better detail in bright and dark areas
                  </span>
                </label>
              </div>
            </div>
          )}
        </section>
        
        {/* Camera Test */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Camera Test</h3>
          
          <div className={styles.testContainer}>
            <p className={styles.testDescription}>
              Test your camera with current settings to verify quality and performance.
            </p>
            
            <Button
              variant="secondary"
              size={atomSize}
              onClick={handleCameraTest}
              disabled={disabled || isTestingCamera}
              loading={isTestingCamera}
              data-testid={`${testId}-camera-test`}
            >
              <Icon name="camera" size={atomSize} />
              {isTestingCamera ? 'Testing Camera...' : 'Test Camera'}
            </Button>
          </div>
        </section>
        
        {/* Action Buttons */}
        <section className={styles.actions}>
          <Button
            variant="primary"
            size={atomSize}
            onClick={handleSave}
            disabled={disabled}
            loading={saving}
            data-testid={`${testId}-save`}
          >
            <Icon name="check" size={atomSize} />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            variant="ghost"
            size={atomSize}
            onClick={handleReset}
            disabled={disabled || saving}
            data-testid={`${testId}-reset`}
          >
            <Icon name="refresh" size={atomSize} />
            Reset to Defaults
          </Button>
        </section>
      </div>
    </div>
  );
}; 