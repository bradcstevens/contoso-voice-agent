"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FiEye, FiSearch, FiLoader, FiCheck, FiX, FiZap, FiClock } from 'react-icons/fi';
import clsx from 'clsx';
import { CameraFeedDisplay } from './camerafeeddisplay';
import { CameraStatusIndicator } from './camerastatusindicator';
import { CaptureButton } from './capturebutton';
import { CameraControlIcon } from './cameracontrolicon';
import styles from './visualanalysisdisplay.module.css';

// Enhanced TypeScript interfaces for visual analysis
export type AnalysisState = 
  | 'idle' 
  | 'analyzing' 
  | 'processing' 
  | 'complete' 
  | 'error'
  | 'no_results';

export type AnalysisConfidence = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export interface AnalysisResult {
  id: string;
  type: 'product' | 'object' | 'scene' | 'text' | 'barcode';
  confidence: AnalysisConfidence;
  label: string;
  description?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface VisualAnalysisDisplayProps {
  /** Current analysis state */
  state?: AnalysisState;
  /** Analysis results */
  results?: AnalysisResult[];
  /** Whether to show live analysis overlay */
  showLiveOverlay?: boolean;
  /** Whether to show confidence indicators */
  showConfidence?: boolean;
  /** Whether to show analysis metrics */
  showMetrics?: boolean;
  /** Callback when analysis is triggered */
  onAnalyze?: (imageData: string | Blob) => void;
  /** Callback when result is selected */
  onResultSelect?: (result: AnalysisResult) => void;
  /** Callback when analysis is cleared */
  onClear?: () => void;
  /** Minimum confidence threshold for displaying results */
  minConfidence?: AnalysisConfidence;
  /** Whether analysis is automated on capture */
  autoAnalyze?: boolean;
  /** Analysis timeout in milliseconds */
  analysisTimeout?: number;
  /** Whether interface is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show detailed analysis info */
  showAnalysisDetails?: boolean;
  /** Whether to enable real-time analysis */
  realTimeAnalysis?: boolean;
  /** Real-time analysis interval in milliseconds */
  realTimeInterval?: number;
}

// Confidence level configurations
const CONFIDENCE_CONFIG = {
  very_low: { label: 'Very Low', color: '#ef4444', threshold: 0.2 },
  low: { label: 'Low', color: '#f97316', threshold: 0.4 },
  medium: { label: 'Medium', color: '#eab308', threshold: 0.6 },
  high: { label: 'High', color: '#22c55e', threshold: 0.8 },
  very_high: { label: 'Very High', color: '#059669', threshold: 1.0 }
};

// Analysis type configurations
const ANALYSIS_TYPE_CONFIG = {
  product: {
    label: 'Product',
    icon: FiSearch,
    description: 'Product recognition and details'
  },
  object: {
    label: 'Object',
    icon: FiEye,
    description: 'General object detection'
  },
  scene: {
    label: 'Scene',
    icon: FiEye,
    description: 'Scene understanding'
  },
  text: {
    label: 'Text',
    icon: FiSearch,
    description: 'Text recognition (OCR)'
  },
  barcode: {
    label: 'Barcode',
    icon: FiSearch,
    description: 'Barcode/QR code scanning'
  }
};

/**
 * VisualAnalysisDisplay Molecular Component
 * 
 * Combines camera feed, capture controls, and real-time visual analysis
 * to provide complete multi-modal visual search capabilities.
 * 
 * Features:
 * - Real-time visual analysis overlay
 * - Multi-type detection (products, objects, text, barcodes)
 * - Confidence-based filtering
 * - Bounding box visualization
 * - Analysis metrics and performance
 * - Auto and manual analysis modes
 * - Accessibility compliance
 * - Integration with camera components
 */
export const VisualAnalysisDisplay: React.FC<VisualAnalysisDisplayProps> = ({
  state = 'idle',
  results = [],
  showLiveOverlay = true,
  showConfidence = true,
  showMetrics = false,
  onAnalyze,
  onResultSelect,
  onClear,
  minConfidence = 'medium',
  autoAnalyze = true,
  analysisTimeout = 10000,
  disabled = false,
  className,
  showAnalysisDetails = true,
  realTimeAnalysis = false,
  realTimeInterval = 2000
}) => {
  const [internalState, setInternalState] = useState<AnalysisState>(state);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [analysisMetrics, setAnalysisMetrics] = useState<{
    totalAnalyses: number;
    averageTime: number;
    successRate: number;
  }>({ totalAnalyses: 0, averageTime: 0, successRate: 0 });
  const [announcement, setAnnouncement] = useState<string>('');
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const realTimeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter results by confidence threshold
  const filteredResults = results.filter(result => {
    const resultThreshold = CONFIDENCE_CONFIG[result.confidence].threshold;
    const minThreshold = CONFIDENCE_CONFIG[minConfidence].threshold;
    return resultThreshold >= minThreshold;
  });

  // Handle analysis trigger
  const handleAnalyze = useCallback(async (imageData?: string | Blob) => {
    if (disabled || internalState === 'analyzing') return;

    setInternalState('analyzing');
    setAnalysisStartTime(new Date());
    setAnnouncement('Starting visual analysis...');

    // Set analysis timeout
    analysisTimeoutRef.current = setTimeout(() => {
      if (internalState === 'analyzing') {
        setInternalState('error');
        setAnnouncement('Analysis timed out. Please try again.');
      }
    }, analysisTimeout);

    try {
      // If no image data provided, capture from camera feed
      if (!imageData) {
        imageData = await captureCurrentFrame();
      }

      if (imageData) {
        await onAnalyze?.(imageData);
        // State will be updated via props when analysis completes
      } else {
        throw new Error('No image data available for analysis');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setInternalState('error');
      setAnnouncement('Analysis failed. Please try again.');
    }
  }, [disabled, internalState, analysisTimeout, onAnalyze]);

  // Capture current frame from camera feed
  const captureCurrentFrame = useCallback(async (): Promise<Blob | null> => {
    // This would interface with the camera feed component
    // For now, return null as placeholder
    return null;
  }, []);

  // Handle result selection
  const handleResultSelect = useCallback((result: AnalysisResult) => {
    setSelectedResult(result);
    setAnnouncement(`Selected ${result.type}: ${result.label} (${CONFIDENCE_CONFIG[result.confidence].label} confidence)`);
    onResultSelect?.(result);
  }, [onResultSelect]);

  // Handle clear analysis
  const handleClear = useCallback(() => {
    setInternalState('idle');
    setSelectedResult(null);
    setAnalysisStartTime(null);
    setAnnouncement('Analysis cleared');
    onClear?.();

    // Clear timers
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
  }, [onClear]);

  // Start real-time analysis
  const startRealTimeAnalysis = useCallback(() => {
    if (!realTimeAnalysis || disabled) return;

    realTimeTimerRef.current = setInterval(() => {
      handleAnalyze();
    }, realTimeInterval);
  }, [realTimeAnalysis, disabled, realTimeInterval, handleAnalyze]);

  // Stop real-time analysis
  const stopRealTimeAnalysis = useCallback(() => {
    if (realTimeTimerRef.current) {
      clearInterval(realTimeTimerRef.current);
      realTimeTimerRef.current = null;
    }
  }, []);

  // Update metrics when analysis completes
  useEffect(() => {
    if (internalState === 'complete' && analysisStartTime) {
      const analysisTime = Date.now() - analysisStartTime.getTime();
      setAnalysisMetrics(prev => ({
        totalAnalyses: prev.totalAnalyses + 1,
        averageTime: (prev.averageTime * prev.totalAnalyses + analysisTime) / (prev.totalAnalyses + 1),
        successRate: ((prev.successRate * prev.totalAnalyses) + 1) / (prev.totalAnalyses + 1)
      }));

      // Clear timeout
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    }
  }, [internalState, analysisStartTime]);

  // Update internal state when prop changes
  useEffect(() => {
    setInternalState(state);
    
    if (state === 'complete' && results.length === 0) {
      setInternalState('no_results');
      setAnnouncement('No visual analysis results found');
    } else if (state === 'complete' && results.length > 0) {
      setAnnouncement(`Analysis complete. Found ${filteredResults.length} results`);
    }
  }, [state, results.length, filteredResults.length]);

  // Handle real-time analysis toggle
  useEffect(() => {
    if (realTimeAnalysis) {
      startRealTimeAnalysis();
    } else {
      stopRealTimeAnalysis();
    }

    return () => stopRealTimeAnalysis();
  }, [realTimeAnalysis, startRealTimeAnalysis, stopRealTimeAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      stopRealTimeAnalysis();
    };
  }, [stopRealTimeAnalysis]);

  // Draw bounding boxes on canvas overlay
  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !showLiveOverlay) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes for filtered results
    filteredResults.forEach(result => {
      if (!result.boundingBox) return;

      const { x, y, width, height } = result.boundingBox;
      const confidence = CONFIDENCE_CONFIG[result.confidence];

      // Set drawing style based on confidence
      ctx.strokeStyle = confidence.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = confidence.color + '20'; // Semi-transparent fill

      // Draw bounding box
      ctx.strokeRect(x, y, width, height);
      ctx.fillRect(x, y, width, height);

      // Draw label
      ctx.fillStyle = confidence.color;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(
        `${result.label} (${confidence.label})`,
        x,
        y - 5
      );
    });
  }, [filteredResults, showLiveOverlay]);

  // Update bounding boxes when results change
  useEffect(() => {
    drawBoundingBoxes();
  }, [drawBoundingBoxes]);

  // Render analysis overlay
  const renderAnalysisOverlay = () => {
    if (!showLiveOverlay) return null;

    return (
      <canvas
        ref={canvasRef}
        className={styles.analysisOverlay}
        aria-hidden="true"
      />
    );
  };

  // Render analysis status
  const renderAnalysisStatus = () => {
    return (
      <div className={styles.analysisStatus}>
        <div className={styles.statusContent}>
          {internalState === 'idle' && (
            <>
              <FiEye className={styles.statusIcon} />
              <span>Ready for visual analysis</span>
            </>
          )}
          {internalState === 'analyzing' && (
            <>
              <FiLoader className={clsx(styles.statusIcon, styles.spinning)} />
              <span>Analyzing image...</span>
            </>
          )}
          {internalState === 'processing' && (
            <>
              <FiZap className={styles.statusIcon} />
              <span>Processing results...</span>
            </>
          )}
          {internalState === 'complete' && (
            <>
              <FiCheck className={styles.statusIcon} />
              <span>{filteredResults.length} results found</span>
            </>
          )}
          {internalState === 'no_results' && (
            <>
              <FiSearch className={styles.statusIcon} />
              <span>No results found</span>
            </>
          )}
          {internalState === 'error' && (
            <>
              <FiX className={styles.statusIcon} />
              <span>Analysis failed</span>
            </>
          )}
        </div>

        {realTimeAnalysis && (
          <div className={styles.realTimeIndicator}>
            <span>Real-time analysis active</span>
          </div>
        )}
      </div>
    );
  };

  // Render analysis results
  const renderAnalysisResults = () => {
    if (filteredResults.length === 0) return null;

    return (
      <div className={styles.analysisResults}>
        <h4 className={styles.resultsTitle}>Analysis Results</h4>
        <div className={styles.resultsList}>
          {filteredResults.map((result) => {
            const typeConfig = ANALYSIS_TYPE_CONFIG[result.type];
            const confidenceConfig = CONFIDENCE_CONFIG[result.confidence];
            const TypeIcon = typeConfig.icon;
            const isSelected = selectedResult?.id === result.id;

            return (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className={clsx(
                  styles.resultItem,
                  isSelected && styles.resultSelected
                )}
                aria-label={`${typeConfig.label}: ${result.label} with ${confidenceConfig.label} confidence`}
              >
                <div className={styles.resultIcon}>
                  <TypeIcon />
                </div>

                <div className={styles.resultContent}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultLabel}>{result.label}</span>
                    {showConfidence && (
                      <span 
                        className={styles.confidenceBadge}
                        style={{ backgroundColor: confidenceConfig.color }}
                      >
                        {confidenceConfig.label}
                      </span>
                    )}
                  </div>

                  <div className={styles.resultMeta}>
                    <span className={styles.resultType}>{typeConfig.label}</span>
                    {result.description && (
                      <span className={styles.resultDescription}>
                        {result.description}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render analysis metrics
  const renderAnalysisMetrics = () => {
    if (!showMetrics) return null;

    return (
      <div className={styles.analysisMetrics}>
        <h5 className={styles.metricsTitle}>Performance</h5>
        <div className={styles.metricsList}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Total Analyses:</span>
            <span className={styles.metricValue}>{analysisMetrics.totalAnalyses}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Avg Time:</span>
            <span className={styles.metricValue}>
              {analysisMetrics.averageTime.toFixed(0)}ms
            </span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Success Rate:</span>
            <span className={styles.metricValue}>
              {(analysisMetrics.successRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render analysis controls
  const renderAnalysisControls = () => {
    return (
      <div className={styles.analysisControls}>
        <CaptureButton
          onCapture={() => handleAnalyze()}
          disabled={disabled || internalState === 'analyzing'}
          className={styles.analyzeButton}
        />

        <div className={styles.controlButtons}>
          {internalState !== 'idle' && (
            <CameraControlIcon
              type="refresh"
              onClick={handleClear}
              disabled={disabled}
              showTooltip={true}
              tooltipText="Clear analysis"
              className={styles.clearButton}
            />
          )}

          <CameraControlIcon
            type="settings"
            onClick={() => {}} // Settings handler would be passed as prop
            disabled={disabled}
            showTooltip={true}
            tooltipText="Analysis settings"
            className={styles.settingsButton}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Screen reader announcement region */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Main visual analysis display */}
      <div className={clsx(
        styles.visualAnalysisDisplay,
        styles[internalState],
        disabled && styles.disabled,
        className
      )}>
        {/* Camera feed with overlay */}
        <div className={styles.feedContainer}>
          <CameraFeedDisplay
            className={styles.cameraFeed}
          />
          {renderAnalysisOverlay()}
        </div>

        {/* Analysis status indicator */}
        <div className={styles.statusContainer}>
          <CameraStatusIndicator
            state={internalState}
            displayMode="standard"
            className={styles.statusIndicator}
          />
          {renderAnalysisStatus()}
        </div>

        {/* Analysis controls */}
        <div className={styles.controlsContainer}>
          {renderAnalysisControls()}
        </div>

        {/* Analysis results panel */}
        {showAnalysisDetails && (
          <div className={styles.resultsContainer}>
            {renderAnalysisResults()}
            {renderAnalysisMetrics()}
          </div>
        )}
      </div>
    </>
  );
};

// Custom hook for visual analysis management
export const useVisualAnalysis = () => {
  const [analysisState, setAnalysisState] = useState<{
    state: AnalysisState;
    results: AnalysisResult[];
    selectedResult: AnalysisResult | null;
    isRealTime: boolean;
  }>({
    state: 'idle',
    results: [],
    selectedResult: null,
    isRealTime: false
  });

  const startAnalysis = useCallback(async (imageData: string | Blob) => {
    setAnalysisState(prev => ({ ...prev, state: 'analyzing' }));
    
    // Simulate analysis process
    setTimeout(() => {
      // Mock results for demonstration
      const mockResults: AnalysisResult[] = [
        {
          id: '1',
          type: 'product',
          confidence: 'high',
          label: 'Outdoor Backpack',
          description: 'Heavy-duty hiking backpack',
          boundingBox: { x: 50, y: 50, width: 200, height: 150 },
          timestamp: new Date(),
          metadata: { brand: 'Contoso', price: '$89.99' }
        }
      ];

      setAnalysisState(prev => ({
        ...prev,
        state: 'complete',
        results: mockResults
      }));
    }, 2000);
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisState({
      state: 'idle',
      results: [],
      selectedResult: null,
      isRealTime: false
    });
  }, []);

  const selectResult = useCallback((result: AnalysisResult) => {
    setAnalysisState(prev => ({ ...prev, selectedResult: result }));
  }, []);

  const toggleRealTime = useCallback(() => {
    setAnalysisState(prev => ({ ...prev, isRealTime: !prev.isRealTime }));
  }, []);

  return {
    analysisState,
    startAnalysis,
    clearAnalysis,
    selectResult,
    toggleRealTime,
    isAnalyzing: analysisState.state === 'analyzing',
    hasResults: analysisState.results.length > 0,
    selectedResult: analysisState.selectedResult
  };
};

export default VisualAnalysisDisplay; 