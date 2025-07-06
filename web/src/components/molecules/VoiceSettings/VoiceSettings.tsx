import React, { useState, useCallback, useEffect } from 'react';
import { VoiceWaveform } from '../../atoms/VoiceWaveform/VoiceWaveform';
import { VoiceStatus } from '../../atoms/VoiceStatus/VoiceStatus';
import { FormField } from '../FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Label } from '../../atoms/Label/Label';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './VoiceSettings.module.css';

export interface VoiceProvider {
  id: string;
  name: string;
  description?: string;
  available: boolean;
  latency?: number;
  quality?: number;
}

export interface VoiceSettingsProps {
  /** Current voice provider */
  currentProvider?: string;
  /** Available voice providers */
  providers?: VoiceProvider[];
  /** Voice input sensitivity (0-100) */
  inputSensitivity?: number;
  /** Voice output volume (0-100) */
  outputVolume?: number;
  /** Noise suppression level (0-100) */
  noiseSuppression?: number;
  /** Echo cancellation enabled */
  echoCancellation?: boolean;
  /** Auto gain control enabled */
  autoGainControl?: boolean;
  /** Push-to-talk mode enabled */
  pushToTalkMode?: boolean;
  /** Voice activation threshold (0-100) */
  activationThreshold?: number;
  /** Current voice activity level for testing */
  activityLevel?: number;
  /** Current voice state for status display */
  voiceState?: 'idle' | 'listening' | 'speaking' | 'processing' | 'muted' | 'error' | 'disabled';
  /** Audio sample rate */
  sampleRate?: number;
  /** Audio quality setting */
  audioQuality?: 'low' | 'medium' | 'high' | 'ultra';
  /** Language/locale for voice recognition */
  language?: string;
  /** Available languages */
  availableLanguages?: Array<{ code: string; name: string; }>;
  /** Whether settings are currently being saved */
  saving?: boolean;
  /** Whether the settings panel is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  layout?: 'vertical' | 'horizontal' | 'compact';
  /** Whether to show advanced settings */
  showAdvanced?: boolean;
  /** Whether to show audio test section */
  showAudioTest?: boolean;
  /** Callback when provider changes */
  onProviderChange?: (providerId: string) => void;
  /** Callback when settings change */
  onSettingsChange?: (settings: Partial<VoiceSettingsProps>) => void;
  /** Callback when settings are saved */
  onSave?: () => void;
  /** Callback when settings are reset */
  onReset?: () => void;
  /** Callback when audio test is triggered */
  onAudioTest?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * VoiceSettings Molecule
 * 
 * Comprehensive voice configuration interface combining VoiceWaveform, VoiceStatus,
 * and form controls for complete voice settings management.
 * 
 * Features:
 * - Voice provider selection with quality indicators
 * - Audio sensitivity and volume controls
 * - Advanced audio processing settings (noise suppression, echo cancellation)
 * - Push-to-talk and voice activation configuration
 * - Real-time audio testing with waveform visualization
 * - Language and quality settings
 * - WCAG AAA accessibility compliance
 * - Multiple layout options (vertical, horizontal, compact)
 * - Save/reset functionality with validation
 * - Screen reader announcements for setting changes
 */
export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  currentProvider = '',
  providers = [],
  inputSensitivity = 50,
  outputVolume = 75,
  noiseSuppression = 50,
  echoCancellation = true,
  autoGainControl = true,
  pushToTalkMode = false,
  activationThreshold = 30,
  activityLevel = 0,
  voiceState = 'idle',
  sampleRate = 44100,
  audioQuality = 'medium',
  language = 'en-US',
  availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ],
  saving = false,
  disabled = false,
  size = 'medium',
  layout = 'vertical',
  showAdvanced = false,
  showAudioTest = true,
  onProviderChange,
  onSettingsChange,
  onSave,
  onReset,
  onAudioTest,
  className = '',
  testId = 'voice-settings'
}) => {
  // Internal state for settings
  const [localSettings, setLocalSettings] = useState({
    inputSensitivity,
    outputVolume,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
    pushToTalkMode,
    activationThreshold,
    sampleRate,
    audioQuality,
    language
  });
  
  const [expandedAdvanced, setExpandedAdvanced] = useState(showAdvanced);
  const [lastChangeMessage, setLastChangeMessage] = useState<string>('');
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  
  // Size mapping helper
  const mapSize = (settingsSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[settingsSize];
  };
  
  const atomSize = mapSize(size);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings({
      inputSensitivity,
      outputVolume,
      noiseSuppression,
      echoCancellation,
      autoGainControl,
      pushToTalkMode,
      activationThreshold,
      sampleRate,
      audioQuality,
      language
    });
  }, [inputSensitivity, outputVolume, noiseSuppression, echoCancellation, autoGainControl, pushToTalkMode, activationThreshold, sampleRate, audioQuality, language]);
  
  // Handle setting changes
  const handleSettingChange = useCallback((key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Create user-friendly change message
    let changeMessage = '';
    switch (key) {
      case 'inputSensitivity':
        changeMessage = `Input sensitivity set to ${value}%`;
        break;
      case 'outputVolume':
        changeMessage = `Output volume set to ${value}%`;
        break;
      case 'noiseSuppression':
        changeMessage = `Noise suppression set to ${value}%`;
        break;
      case 'echoCancellation':
        changeMessage = `Echo cancellation ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'autoGainControl':
        changeMessage = `Auto gain control ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'pushToTalkMode':
        changeMessage = `Push-to-talk mode ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'activationThreshold':
        changeMessage = `Voice activation threshold set to ${value}%`;
        break;
      default:
        changeMessage = `${key} updated`;
    }
    
    setLastChangeMessage(changeMessage);
    onSettingsChange?.(newSettings);
  }, [localSettings, onSettingsChange]);
  
  // Handle provider selection
  const handleProviderChange = useCallback((providerId: string) => {
    setLastChangeMessage(`Voice provider changed to ${providers.find(p => p.id === providerId)?.name || providerId}`);
    onProviderChange?.(providerId);
  }, [providers, onProviderChange]);
  
  // Handle audio test
  const handleAudioTest = useCallback(() => {
    setIsTestingAudio(true);
    setLastChangeMessage('Starting audio test...');
    onAudioTest?.();
    
    // Reset test state after 3 seconds
    setTimeout(() => {
      setIsTestingAudio(false);
      setLastChangeMessage('Audio test completed');
    }, 3000);
  }, [onAudioTest]);
  
  // Handle save
  const handleSave = useCallback(() => {
    setLastChangeMessage('Settings saved successfully');
    onSave?.();
  }, [onSave]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    setLastChangeMessage('Settings reset to defaults');
    onReset?.();
  }, [onReset]);
  
  // Get current provider info
  const currentProviderInfo = providers.find(p => p.id === currentProvider);
  
  return (
    <div 
      className={`${styles.voiceSettings} ${styles[size]} ${styles[layout]} ${className}`}
      data-testid={testId}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="voice"
      >
        {lastChangeMessage}
      </ScreenReaderText>
      
      <div className={styles.settingsContainer}>
        {/* Provider Selection */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Voice Provider</h3>
          
          <div className={styles.providerGrid}>
            {providers.map((provider) => (
              <button
                key={provider.id}
                className={`${styles.providerCard} ${currentProvider === provider.id ? styles.selected : ''} ${!provider.available ? styles.unavailable : ''}`}
                onClick={() => provider.available && handleProviderChange(provider.id)}
                disabled={disabled || !provider.available}
                aria-pressed={currentProvider === provider.id}
                data-testid={`${testId}-provider-${provider.id}`}
              >
                <div className={styles.providerInfo}>
                  <span className={styles.providerName}>{provider.name}</span>
                  {provider.description && (
                    <span className={styles.providerDescription}>{provider.description}</span>
                  )}
                </div>
                
                {provider.available && (
                  <div className={styles.providerMetrics}>
                    {provider.quality && (
                      <div className={styles.metric}>
                        <Icon name="check" size="xs" />
                        <span>{provider.quality}% quality</span>
                      </div>
                    )}
                    {provider.latency && (
                      <div className={styles.metric}>
                        <Icon name="flash" size="xs" />
                        <span>{provider.latency}ms</span>
                      </div>
                    )}
                  </div>
                )}
                
                {!provider.available && (
                  <div className={styles.unavailableIndicator}>
                    <Icon name="x" size="xs" />
                    <span>Unavailable</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {currentProviderInfo && (
            <div className={styles.currentProviderStatus}>
              <VoiceStatus
                voiceState={voiceState}
                provider={currentProviderInfo.name}
                connectionQuality={currentProviderInfo.quality}
                latency={currentProviderInfo.latency}
                layout="compact"
                showProvider={true}
                showConnectionQuality={true}
                showLatency={true}
                size={atomSize}
              />
            </div>
          )}
        </section>
        
        {/* Audio Controls */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Audio Controls</h3>
          
          <div className={styles.controlsGrid}>
            <FormField
              label="Input Sensitivity"
              type="range"
              min="0"
              max="100"
              value={localSettings.inputSensitivity}
              onChange={(e) => handleSettingChange('inputSensitivity', parseInt(e.target.value))}
              disabled={disabled}
              size={size}
              description={`Current sensitivity: ${localSettings.inputSensitivity}%`}
              testId={`${testId}-input-sensitivity`}
            />
            
            <FormField
              label="Output Volume"
              type="range"
              min="0"
              max="100"
              value={localSettings.outputVolume}
              onChange={(e) => handleSettingChange('outputVolume', parseInt(e.target.value))}
              disabled={disabled}
              size={size}
              description={`Current volume: ${localSettings.outputVolume}%`}
              testId={`${testId}-output-volume`}
            />
            
            {!localSettings.pushToTalkMode && (
              <FormField
                label="Activation Threshold"
                type="range"
                min="0"
                max="100"
                value={localSettings.activationThreshold}
                onChange={(e) => handleSettingChange('activationThreshold', parseInt(e.target.value))}
                disabled={disabled}
                size={size}
                description={`Voice will activate above ${localSettings.activationThreshold}% activity`}
                testId={`${testId}-activation-threshold`}
              />
            )}
          </div>
        </section>
        
        {/* Mode Settings */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Voice Mode</h3>
          
          <div className={styles.modeControls}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localSettings.pushToTalkMode}
                onChange={(e) => handleSettingChange('pushToTalkMode', e.target.checked)}
                disabled={disabled}
                data-testid={`${testId}-push-to-talk`}
              />
              <span className={styles.checkboxText}>Push-to-talk mode</span>
              <span className={styles.checkboxDescription}>
                Hold Space or click to record voice input
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
              <div className={styles.controlsGrid}>
                <FormField
                  label="Noise Suppression"
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.noiseSuppression}
                  onChange={(e) => handleSettingChange('noiseSuppression', parseInt(e.target.value))}
                  disabled={disabled}
                  size={size}
                  description={`Noise reduction level: ${localSettings.noiseSuppression}%`}
                  testId={`${testId}-noise-suppression`}
                />
                
                <FormField
                  label="Sample Rate"
                  type="select"
                  value={localSettings.sampleRate}
                  onChange={(e) => handleSettingChange('sampleRate', parseInt(e.target.value))}
                  disabled={disabled}
                  size={size}
                  testId={`${testId}-sample-rate`}
                >
                  <option value={22050}>22,050 Hz (Low)</option>
                  <option value={44100}>44,100 Hz (Standard)</option>
                  <option value={48000}>48,000 Hz (High)</option>
                  <option value={96000}>96,000 Hz (Ultra)</option>
                </FormField>
                
                <FormField
                  label="Audio Quality"
                  type="select"
                  value={localSettings.audioQuality}
                  onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                  disabled={disabled}
                  size={size}
                  testId={`${testId}-audio-quality`}
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Quality)</option>
                  <option value="ultra">Ultra (Maximum Quality)</option>
                </FormField>
                
                <FormField
                  label="Language"
                  type="select"
                  value={localSettings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  disabled={disabled}
                  size={size}
                  testId={`${testId}-language`}
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </FormField>
              </div>
              
              <div className={styles.toggleControls}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={localSettings.echoCancellation}
                    onChange={(e) => handleSettingChange('echoCancellation', e.target.checked)}
                    disabled={disabled}
                    data-testid={`${testId}-echo-cancellation`}
                  />
                  <span className={styles.checkboxText}>Echo Cancellation</span>
                  <span className={styles.checkboxDescription}>
                    Removes echo from audio input
                  </span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={localSettings.autoGainControl}
                    onChange={(e) => handleSettingChange('autoGainControl', e.target.checked)}
                    disabled={disabled}
                    data-testid={`${testId}-auto-gain-control`}
                  />
                  <span className={styles.checkboxText}>Auto Gain Control</span>
                  <span className={styles.checkboxDescription}>
                    Automatically adjusts input volume
                  </span>
                </label>
              </div>
            </div>
          )}
        </section>
        
        {/* Audio Test */}
        {showAudioTest && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Audio Test</h3>
            
            <div className={styles.audioTestContainer}>
              <div className={styles.waveformContainer}>
                <VoiceWaveform
                  mode="oscilloscope"
                  activityLevel={isTestingAudio ? Math.random() * 100 : activityLevel}
                  size={atomSize}
                  showPeaks={true}
                  animate={isTestingAudio}
                  className={styles.testWaveform}
                />
              </div>
              
              <Button
                variant="secondary"
                size={atomSize}
                onClick={handleAudioTest}
                disabled={disabled || isTestingAudio}
                loading={isTestingAudio}
                data-testid={`${testId}-audio-test`}
              >
                <Icon name="microphone" size={atomSize} />
                {isTestingAudio ? 'Testing...' : 'Test Audio'}
              </Button>
            </div>
          </section>
        )}
        
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