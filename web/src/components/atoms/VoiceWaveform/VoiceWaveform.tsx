/**
 * VOICE WAVEFORM ATOM - ADVANCED VOICE WAVEFORM VISUALIZATION
 * 
 * Professional-grade voice waveform component with real-time audio visualization,
 * multiple display modes, recording playback, and comprehensive accessibility.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './VoiceWaveform.module.css';

export interface VoiceWaveformProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Real-time audio data array for visualization */
  audioData?: Float32Array | number[];
  
  /** Waveform visualization mode */
  mode?: 'oscilloscope' | 'frequency' | 'spectrum' | 'bars' | 'circular';
  
  /** Size of the waveform display */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant for the waveform */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';
  
  /** Whether the waveform is currently active */
  active?: boolean;
  
  /** Sample rate for audio processing */
  sampleRate?: number;
  
  /** Number of data points to display */
  samples?: number;
  
  /** Gain/amplification factor for the waveform */
  gain?: number;
  
  /** Time scale for waveform display (seconds) */
  timeScale?: number;
  
  /** Whether to show frequency analysis */
  showFrequency?: boolean;
  
  /** Whether to show time markers */
  showTimeMarkers?: boolean;
  
  /** Whether to show amplitude scale */
  showAmplitudeScale?: boolean;
  
  /** Background grid display */
  showGrid?: boolean;
  
  /** Smoothing factor for waveform animation */
  smoothing?: number;
  
  /** Custom colors for multi-channel audio */
  channelColors?: string[];
  
  /** Whether to mirror the waveform (stereo effect) */
  mirror?: boolean;
  
  /** Recording state for playback visualization */
  recordingState?: 'idle' | 'recording' | 'playing' | 'paused';
  
  /** Playback position (0-1) for recorded audio */
  playbackPosition?: number;
  
  /** Recorded audio data for playback visualization */
  recordedData?: Float32Array | number[];
  
  /** Frequency range for spectrum analysis */
  frequencyRange?: [number, number];
  
  /** Whether to use logarithmic scale for frequency */
  logarithmicScale?: boolean;
  
  /** Canvas refresh rate (FPS) */
  refreshRate?: number;
  
  /** Accessibility label for the waveform */
  ariaLabel?: string;
  
  /** Whether to provide audio descriptions */
  provideAudioDescription?: boolean;
  
  /** Callback when audio peaks are detected */
  onPeakDetected?: (peak: number) => void;
  
  /** Callback when silence is detected */
  onSilenceDetected?: () => void;
  
  /** Callback when playback position changes */
  onPlaybackPositionChange?: (position: number) => void;
  
  /** Custom width override */
  width?: number;
  
  /** Custom height override */
  height?: number;
  
  /** Whether to auto-scale amplitude */
  autoScale?: boolean;
  
  /** Zoom level for detailed view */
  zoomLevel?: number;
}

/**
 * Enhanced VoiceWaveform atom with professional audio visualization capabilities
 */
export const VoiceWaveform = forwardRef<HTMLDivElement, VoiceWaveformProps>(({
  audioData,
  mode = 'oscilloscope',
  size = 'md',
  variant = 'default',
  active = false,
  sampleRate = 44100,
  samples = 1024,
  gain = 1,
  timeScale = 1,
  showFrequency = false,
  showTimeMarkers = false,
  showAmplitudeScale = false,
  showGrid = false,
  smoothing = 0.8,
  channelColors = ['#10b981', '#3b82f6'],
  mirror = false,
  recordingState = 'idle',
  playbackPosition = 0,
  recordedData,
  frequencyRange = [20, 20000],
  logarithmicScale = false,
  refreshRate = 60,
  ariaLabel,
  provideAudioDescription = false,
  onPeakDetected,
  onSilenceDetected,
  onPlaybackPositionChange,
  width,
  height,
  autoScale = true,
  zoomLevel = 1,
  className = '',
  ...rest
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentPeak, setCurrentPeak] = useState(0);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout>();
  const [smoothedData, setSmoothedData] = useState<number[]>([]);
  
  // Canvas dimensions based on size
  const getDimensions = () => {
    if (width && height) return { width, height };
    
    const sizeMap = {
      xs: { width: 120, height: 40 },
      sm: { width: 200, height: 60 },
      md: { width: 320, height: 80 },
      lg: { width: 480, height: 120 },
      xl: { width: 640, height: 160 }
    };
    
    return sizeMap[size];
  };
  
  const { width: canvasWidth, height: canvasHeight } = getDimensions();
  
  // Process audio data for visualization
  const processAudioData = useCallback((data: Float32Array | number[]) => {
    if (!data || data.length === 0) return [];
    
    const processedData = Array.from(data);
    
    // Apply gain
    const gainedData = processedData.map(sample => sample * gain);
    
    // Auto-scaling
    if (autoScale) {
      const maxAmplitude = Math.max(...gainedData.map(Math.abs));
      if (maxAmplitude > 0) {
        const scaleFactor = 0.9 / maxAmplitude;
        return gainedData.map(sample => sample * scaleFactor);
      }
    }
    
    return gainedData;
  }, [gain, autoScale]);
  
  // Smooth data for animation
  const applySmoothihg = useCallback((newData: number[], oldData: number[]) => {
    if (oldData.length === 0) return newData;
    
    return newData.map((value, index) => {
      const oldValue = oldData[index] || 0;
      return oldValue * smoothing + value * (1 - smoothing);
    });
  }, [smoothing]);
  
  // Draw oscilloscope mode
  const drawOscilloscope = useCallback((ctx: CanvasRenderingContext2D, data: number[]) => {
    if (data.length === 0) return;
    
    const centerY = canvasHeight / 2;
    const stepX = canvasWidth / data.length;
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    data.forEach((sample, index) => {
      const x = index * stepX;
      const y = centerY + (sample * centerY * 0.8);
      ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    
    // Mirror effect for stereo
    if (mirror) {
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      data.forEach((sample, index) => {
        const x = index * stepX;
        const y = centerY - (sample * centerY * 0.8);
        ctx.lineTo(x, y);
      });
      
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [canvasWidth, canvasHeight, mirror]);
  
  // Draw frequency spectrum
  const drawSpectrum = useCallback((ctx: CanvasRenderingContext2D, data: number[]) => {
    if (data.length === 0) return;
    
    const barWidth = canvasWidth / data.length;
    const maxHeight = canvasHeight * 0.8;
    
    data.forEach((magnitude, index) => {
      const barHeight = Math.abs(magnitude) * maxHeight;
      const x = index * barWidth;
      const y = canvasHeight - barHeight;
      
      // Gradient for frequency bars
      const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
      gradient.addColorStop(0, channelColors[0]);
      gradient.addColorStop(1, channelColors[1] || channelColors[0]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [canvasWidth, canvasHeight, channelColors]);
  
  // Draw circular waveform
  const drawCircular = useCallback((ctx: CanvasRenderingContext2D, data: number[]) => {
    if (data.length === 0) return;
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.3;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    
    ctx.beginPath();
    
    data.forEach((sample, index) => {
      const angle = (index / data.length) * Math.PI * 2;
      const radius = baseRadius + (Math.abs(sample) * (maxRadius - baseRadius));
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
  }, [canvasWidth, canvasHeight]);
  
  // Draw grid background
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += canvasWidth / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += canvasHeight / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }, [canvasWidth, canvasHeight]);
  
  // Draw time markers
  const drawTimeMarkers = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    const timeStep = timeScale / 5; // 5 markers across the display
    
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * canvasWidth;
      const time = (i * timeStep).toFixed(2);
      ctx.fillText(`${time}s`, x, canvasHeight - 5);
    }
  }, [canvasWidth, canvasHeight, timeScale]);
  
  // Draw amplitude scale
  const drawAmplitudeScale = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    
    const levels = ['-1', '-0.5', '0', '0.5', '1'];
    levels.forEach((level, index) => {
      const y = (index / (levels.length - 1)) * canvasHeight;
      ctx.fillText(level, 5, y);
    });
  }, [canvasHeight]);
  
  // Draw playback position indicator
  const drawPlaybackIndicator = useCallback((ctx: CanvasRenderingContext2D) => {
    if (recordingState !== 'playing' && recordingState !== 'paused') return;
    
    const x = playbackPosition * canvasWidth;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }, [canvasWidth, canvasHeight, playbackPosition, recordingState]);
  
  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid
    if (showGrid) {
      drawGrid(ctx);
    }
    
    // Get data to visualize
    const dataToVisualize = recordingState === 'playing' && recordedData
      ? Array.from(recordedData)
      : audioData ? processAudioData(audioData) : [];
    
    // Apply smoothing
    const currentSmoothedData = applySmoothihg(dataToVisualize, smoothedData);
    setSmoothedData(currentSmoothedData);
    
    // Set drawing style
    ctx.strokeStyle = variant === 'gradient' 
      ? (() => {
          const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
          gradient.addColorStop(0, channelColors[0]);
          gradient.addColorStop(1, channelColors[1] || channelColors[0]);
          return gradient;
        })()
      : `var(--voice-${variant}-color, ${channelColors[0]})`;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw waveform based on mode
    switch (mode) {
      case 'oscilloscope':
        drawOscilloscope(ctx, currentSmoothedData);
        break;
      case 'spectrum':
      case 'bars':
        drawSpectrum(ctx, currentSmoothedData);
        break;
      case 'circular':
        drawCircular(ctx, currentSmoothedData);
        break;
      default:
        drawOscilloscope(ctx, currentSmoothedData);
    }
    
    // Draw overlays
    if (showTimeMarkers) {
      drawTimeMarkers(ctx);
    }
    
    if (showAmplitudeScale) {
      drawAmplitudeScale(ctx);
    }
    
    if (recordingState === 'playing' || recordingState === 'paused') {
      drawPlaybackIndicator(ctx);
    }
    
    // Peak detection
    if (currentSmoothedData.length > 0) {
      const peak = Math.max(...currentSmoothedData.map(Math.abs));
      setCurrentPeak(peak);
      
      if (onPeakDetected && peak > 0.1) {
        onPeakDetected(peak);
      }
      
      // Silence detection
      if (peak < 0.01) {
        if (!silenceTimer) {
          const timer = setTimeout(() => {
            onSilenceDetected?.();
          }, 1000);
          setSilenceTimer(timer);
        }
      } else {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(undefined);
        }
      }
    }
  }, [
    canvasWidth, canvasHeight, audioData, recordedData, recordingState, playbackPosition,
    mode, variant, channelColors, showGrid, showTimeMarkers, showAmplitudeScale,
    processAudioData, applySmoothihg, smoothedData, drawGrid, drawOscilloscope,
    drawSpectrum, drawCircular, drawTimeMarkers, drawAmplitudeScale, drawPlaybackIndicator,
    onPeakDetected, onSilenceDetected, silenceTimer
  ]);
  
  // Animation loop
  useEffect(() => {
    if (!active) return;
    
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, render]);
  
  // Single render when not active
  useEffect(() => {
    if (!active) {
      render();
    }
  }, [render, active]);
  
  // Cleanup timers
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);
  
  // Class computation
  const computedClassName = [
    styles.voiceWaveform,
    styles[size],
    styles[variant],
    styles[mode],
    active && styles.active,
    recordingState !== 'idle' && styles[recordingState],
    className
  ].filter(Boolean).join(' ');
  
  // Accessibility attributes
  const accessibilityProps = {
    'role': 'img',
    'aria-label': ariaLabel || `Voice waveform visualization, current peak: ${Math.round(currentPeak * 100)}%`,
    'aria-live': active ? 'polite' : undefined,
    'aria-describedby': provideAudioDescription ? `${rest.id || 'waveform'}-description` : undefined
  };
  
  // Audio description
  const getAudioDescription = () => {
    if (!provideAudioDescription) return null;
    
    const peakLevel = currentPeak > 0.8 ? 'very high' :
                     currentPeak > 0.5 ? 'high' :
                     currentPeak > 0.2 ? 'medium' :
                     currentPeak > 0.05 ? 'low' : 'very low';
    
    return `Voice activity level: ${peakLevel}. Recording state: ${recordingState}.`;
  };
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      {...accessibilityProps}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={styles.canvas}
        aria-hidden="true"
      />
      
      {/* Audio description for screen readers */}
      {provideAudioDescription && (
        <div 
          id={`${rest.id || 'waveform'}-description`}
          className={styles.srOnly}
        >
          {getAudioDescription()}
        </div>
      )}
    </div>
  );
});

VoiceWaveform.displayName = 'VoiceWaveform';

export default VoiceWaveform;
