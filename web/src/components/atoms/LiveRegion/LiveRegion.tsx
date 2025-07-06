/**
 * LIVE REGION ATOM - DYNAMIC ACCESSIBILITY ANNOUNCEMENTS FOR MULTI-MODAL CHANGES
 * 
 * Professional live region component providing dynamic announcements,
 * multi-modal state coordination, and comprehensive accessibility support.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './LiveRegion.module.css';

export interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Live region politeness level */
  politeness?: 'off' | 'polite' | 'assertive';
  
  /** Whether announcements should be atomic */
  atomic?: boolean;
  
  /** Whether the live region is relevant to current context */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  
  /** Live region role */
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer' | 'progressbar';
  
  /** Multi-modal state for contextual announcements */
  modalState?: {
    voice?: {
      status: 'idle' | 'listening' | 'speaking' | 'processing' | 'error';
      quality?: number;
      provider?: string;
      latency?: number;
    };
    camera?: {
      status: 'idle' | 'active' | 'capturing' | 'processing' | 'error';
      resolution?: string;
      fps?: number;
      quality?: number;
    };
    text?: {
      status: 'idle' | 'typing' | 'processing' | 'complete';
      wordCount?: number;
      characters?: number;
    };
    focus?: {
      element?: string;
      modality?: string;
      bounds?: DOMRect;
    };
  };
  
  /** Priority level for announcements */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  
  /** Whether to announce state changes automatically */
  autoAnnounce?: boolean;
  
  /** Debounce delay for rapid changes */
  debounceDelay?: number;
  
  /** Maximum announcement frequency (per second) */
  maxFrequency?: number;
  
  /** Whether to announce coordination between modalities */
  announceCoordination?: boolean;
  
  /** Whether to announce conflicts between modalities */
  announceConflicts?: boolean;
  
  /** Whether to announce handoffs between modalities */
  announceHandoffs?: boolean;
  
  /** Whether to announce focus changes */
  announceFocus?: boolean;
  
  /** Whether to announce errors */
  announceErrors?: boolean;
  
  /** Whether to announce warnings */
  announceWarnings?: boolean;
  
  /** Whether to announce success states */
  announceSuccess?: boolean;
  
  /** Whether to announce progress updates */
  announceProgress?: boolean;
  
  /** Progress update frequency (percentage points) */
  progressFrequency?: number;
  
  /** Whether to announce completion */
  announceCompletion?: boolean;
  
  /** Custom announcement templates */
  templates?: {
    stateChange?: string;
    coordination?: string;
    conflict?: string;
    handoff?: string;
    focus?: string;
    error?: string;
    warning?: string;
    success?: string;
    progress?: string;
    completion?: string;
  };
  
  /** Language code for announcements */
  language?: string;
  
  /** Whether to include timestamps in announcements */
  includeTimestamp?: boolean;
  
  /** Whether to include context information */
  includeContext?: boolean;
  
  /** Whether to use abbreviated announcements */
  abbreviated?: boolean;
  
  /** Maximum announcement length */
  maxLength?: number;
  
  /** Whether to queue announcements */
  queueAnnouncements?: boolean;
  
  /** Maximum queue size */
  maxQueueSize?: number;
  
  /** Queue processing interval (ms) */
  queueInterval?: number;
  
  /** Whether to use multiple live regions for different priorities */
  useMultipleRegions?: boolean;
  
  /** Number of live regions to use */
  regionCount?: number;
  
  /** Whether to rotate between regions */
  rotateRegions?: boolean;
  
  /** Region rotation strategy */
  rotationStrategy?: 'round-robin' | 'priority-based' | 'content-based';
  
  /** Whether to persist announcements for review */
  persistAnnouncements?: boolean;
  
  /** Maximum persisted announcements */
  maxPersistedCount?: number;
  
  /** Whether to filter duplicate announcements */
  filterDuplicates?: boolean;
  
  /** Duplicate detection window (ms) */
  duplicateWindow?: number;
  
  /** Whether to use smart announcement selection */
  smartSelection?: boolean;
  
  /** Smart selection criteria */
  selectionCriteria?: {
    prioritizeErrors?: boolean;
    prioritizeChanges?: boolean;
    minimizeNoise?: boolean;
    adaptToContext?: boolean;
  };
  
  /** Whether to enable voice synthesis for announcements */
  voiceSynthesis?: boolean;
  
  /** Voice synthesis options */
  voiceOptions?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  };
  
  /** Whether to enable haptic feedback */
  hapticFeedback?: boolean;
  
  /** Haptic patterns for different announcement types */
  hapticPatterns?: {
    error?: number[];
    warning?: number[];
    success?: number[];
    info?: number[];
  };
  
  /** Whether to enable visual indicators */
  visualIndicators?: boolean;
  
  /** Visual indicator options */
  visualOptions?: {
    showNotifications?: boolean;
    notificationDuration?: number;
    highlightChanges?: boolean;
    useAnimations?: boolean;
  };
  
  /** Custom filtering function */
  customFilter?: (announcement: string, context: any) => boolean;
  
  /** Custom formatting function */
  customFormatter?: (announcement: string, context: any) => string;
  
  /** Custom priority calculator */
  priorityCalculator?: (context: any) => 'low' | 'medium' | 'high' | 'critical';
  
  /** Callback when announcement is made */
  onAnnounce?: (announcement: string, priority: string, context: any) => void;
  
  /** Callback when state changes */
  onStateChange?: (newState: any, oldState: any) => void;
  
  /** Callback when coordination occurs */
  onCoordination?: (modalities: string[], action: string) => void;
  
  /** Callback when conflict detected */
  onConflict?: (modalities: string[], conflict: string) => void;
  
  /** Callback when handoff occurs */
  onHandoff?: (fromModality: string, toModality: string, context: any) => void;
  
  /** Callback when focus changes */
  onFocusChange?: (element: string, modality: string, bounds?: DOMRect) => void;
  
  /** Callback when error occurs */
  onError?: (error: string, modality: string, context: any) => void;
  
  /** Callback when queue is full */
  onQueueFull?: (droppedAnnouncements: string[]) => void;
  
  /** Whether to enable debug mode */
  debugMode?: boolean;
  
  /** Debug options */
  debugOptions?: {
    logAnnouncements?: boolean;
    showMetrics?: boolean;
    highlightRegions?: boolean;
    trackPerformance?: boolean;
  };
  
  /** Custom live region ID */
  liveRegionId?: string;
  
  /** ARIA label for the live region */
  ariaLabel?: string;
  
  /** ARIA description for the live region */
  ariaDescription?: string;
}

/**
 * Enhanced LiveRegion atom with comprehensive multi-modal accessibility
 */
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(({
  politeness = 'polite',
  atomic = true,
  relevant = 'all',
  role = 'status',
  modalState,
  priority = 'medium',
  autoAnnounce = true,
  debounceDelay = 300,
  maxFrequency = 3,
  announceCoordination = true,
  announceConflicts = true,
  announceHandoffs = true,
  announceFocus = false,
  announceErrors = true,
  announceWarnings = true,
  announceSuccess = true,
  announceProgress = false,
  progressFrequency = 10,
  announceCompletion = true,
  templates = {},
  language = 'en',
  includeTimestamp = false,
  includeContext = true,
  abbreviated = false,
  maxLength = 150,
  queueAnnouncements = true,
  maxQueueSize = 10,
  queueInterval = 1000,
  useMultipleRegions = false,
  regionCount = 3,
  rotateRegions = false,
  rotationStrategy = 'round-robin',
  persistAnnouncements = false,
  maxPersistedCount = 20,
  filterDuplicates = true,
  duplicateWindow = 2000,
  smartSelection = true,
  selectionCriteria = {
    prioritizeErrors: true,
    prioritizeChanges: true,
    minimizeNoise: true,
    adaptToContext: true
  },
  voiceSynthesis = false,
  voiceOptions = {},
  hapticFeedback = false,
  hapticPatterns = {},
  visualIndicators = false,
  visualOptions = {},
  customFilter,
  customFormatter,
  priorityCalculator,
  onAnnounce,
  onStateChange,
  onCoordination,
  onConflict,
  onHandoff,
  onFocusChange,
  onError,
  onQueueFull,
  debugMode = false,
  debugOptions = {},
  liveRegionId,
  ariaLabel = 'Live announcements',
  ariaDescription = 'Dynamic updates from the application',
  className = '',
  children,
  ...rest
}, ref) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('');
  const [announcementQueue, setAnnouncementQueue] = useState<Array<{
    content: string;
    priority: string;
    timestamp: number;
    context: any;
  }>>([]);
  const [announcementHistory, setAnnouncementHistory] = useState<Array<{
    content: string;
    priority: string;
    timestamp: number;
    modality: string;
  }>>([]);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [metrics, setMetrics] = useState({
    totalAnnouncements: 0,
    errorCount: 0,
    warningCount: 0,
    successCount: 0,
    queueOverflows: 0,
    averageProcessingTime: 0
  });
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queueTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncementRef = useRef<{ content: string; timestamp: number } | null>(null);
  const performanceTimerRef = useRef<number | null>(null);
  const frequencyTrackerRef = useRef<number[]>([]);
  
  // Detect multi-modal state changes
  const detectStateChanges = useCallback((prevState: any, currentState: any) => {
    const changes: Array<{ modality: string; change: string; details?: any }> = [];
    
    if (modalState) {
      // Voice state changes
      if (modalState.voice && prevState?.voice?.status !== modalState.voice.status) {
        changes.push({
          modality: 'voice',
          change: `status changed to ${modalState.voice.status}`,
          details: modalState.voice
        });
      }
      
      // Camera state changes
      if (modalState.camera && prevState?.camera?.status !== modalState.camera.status) {
        changes.push({
          modality: 'camera',
          change: `status changed to ${modalState.camera.status}`,
          details: modalState.camera
        });
      }
      
      // Text state changes
      if (modalState.text && prevState?.text?.status !== modalState.text.status) {
        changes.push({
          modality: 'text',
          change: `status changed to ${modalState.text.status}`,
          details: modalState.text
        });
      }
      
      // Focus changes
      if (modalState.focus && prevState?.focus?.element !== modalState.focus.element) {
        changes.push({
          modality: 'focus',
          change: `focus moved to ${modalState.focus.element}`,
          details: modalState.focus
        });
      }
    }
    
    return changes;
  }, [modalState]);
  
  // Detect multi-modal coordination
  const detectCoordination = useCallback(() => {
    if (!modalState) return null;
    
    const activeModalities = [];
    if (modalState.voice?.status !== 'idle') activeModalities.push('voice');
    if (modalState.camera?.status !== 'idle') activeModalities.push('camera');
    if (modalState.text?.status !== 'idle') activeModalities.push('text');
    
    if (activeModalities.length > 1) {
      return {
        modalities: activeModalities,
        action: 'coordinating'
      };
    }
    
    return null;
  }, [modalState]);
  
  // Detect conflicts
  const detectConflicts = useCallback() => {
    if (!modalState) return null;
    
    const conflicts = [];
    
    // Voice and text conflict
    if (modalState.voice?.status === 'listening' && modalState.text?.status === 'typing') {
      conflicts.push({
        modalities: ['voice', 'text'],
        conflict: 'simultaneous input'
      });
    }
    
    // Camera and focus conflict
    if (modalState.camera?.status === 'capturing' && modalState.focus?.modality === 'keyboard') {
      conflicts.push({
        modalities: ['camera', 'focus'],
        conflict: 'input method conflict'
      });
    }
    
    return conflicts.length > 0 ? conflicts[0] : null;
  }, [modalState]);
  
  // Format announcement content
  const formatAnnouncement = useCallback((content: string, context: any) => {
    let formatted = content;
    
    // Apply custom formatter
    if (customFormatter) {
      formatted = customFormatter(formatted, context);
    }
    
    // Apply templates
    const template = templates[context.type as keyof typeof templates];
    if (template) {
      formatted = template.replace('{content}', formatted);
    }
    
    // Include context if requested
    if (includeContext && context.modality) {
      formatted = `${context.modality}: ${formatted}`;
    }
    
    // Include timestamp if requested
    if (includeTimestamp) {
      const timestamp = new Date().toLocaleTimeString();
      formatted = `${formatted} (${timestamp})`;
    }
    
    // Abbreviate if needed
    if (abbreviated && formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }
    
    return formatted;
  }, [customFormatter, templates, includeContext, includeTimestamp, abbreviated, maxLength]);
  
  // Calculate announcement priority
  const calculatePriority = useCallback((context: any) => {
    if (priorityCalculator) {
      return priorityCalculator(context);
    }
    
    if (context.type === 'error') return 'critical';
    if (context.type === 'warning') return 'high';
    if (context.type === 'success') return 'medium';
    if (context.type === 'conflict') return 'high';
    if (context.type === 'coordination') return 'medium';
    
    return priority;
  }, [priorityCalculator, priority]);
  
  // Check if announcement should be filtered
  const shouldFilter = useCallback((content: string, context: any) => {
    // Custom filter
    if (customFilter && !customFilter(content, context)) {
      return true;
    }
    
    // Frequency limiting
    const now = Date.now();
    frequencyTrackerRef.current = frequencyTrackerRef.current.filter(t => now - t < 1000);
    if (frequencyTrackerRef.current.length >= maxFrequency) {
      return true;
    }
    
    // Duplicate filtering
    if (filterDuplicates && lastAnnouncementRef.current) {
      const timeDiff = now - lastAnnouncementRef.current.timestamp;
      if (timeDiff < duplicateWindow && lastAnnouncementRef.current.content === content) {
        return true;
      }
    }
    
    // Smart selection criteria
    if (smartSelection && selectionCriteria) {
      if (selectionCriteria.minimizeNoise && context.type === 'info' && frequencyTrackerRef.current.length > 1) {
        return true;
      }
    }
    
    return false;
  }, [customFilter, maxFrequency, filterDuplicates, duplicateWindow, smartSelection, selectionCriteria]);
  
  // Add announcement to queue
  const queueAnnouncement = useCallback((content: string, announcementPriority: string, context: any) => {
    if (shouldFilter(content, context)) {
      return;
    }
    
    const announcement = {
      content: formatAnnouncement(content, context),
      priority: announcementPriority,
      timestamp: Date.now(),
      context
    };
    
    setAnnouncementQueue(prev => {
      const newQueue = [...prev, announcement];
      
      // Sort by priority
      newQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      });
      
      // Limit queue size
      if (newQueue.length > maxQueueSize) {
        const dropped = newQueue.slice(maxQueueSize);
        if (onQueueFull) {
          onQueueFull(dropped.map(d => d.content));
        }
        setMetrics(m => ({ ...m, queueOverflows: m.queueOverflows + 1 }));
        return newQueue.slice(0, maxQueueSize);
      }
      
      return newQueue;
    });
  }, [shouldFilter, formatAnnouncement, maxQueueSize, onQueueFull]);
  
  // Process announcement queue
  const processQueue = useCallback(() => {
    setAnnouncementQueue(prev => {
      if (prev.length === 0) return prev;
      
      const nextAnnouncement = prev[0];
      const remaining = prev.slice(1);
      
      // Make announcement
      setCurrentAnnouncement(nextAnnouncement.content);
      
      // Update frequency tracking
      frequencyTrackerRef.current.push(Date.now());
      
      // Update last announcement
      lastAnnouncementRef.current = {
        content: nextAnnouncement.content,
        timestamp: nextAnnouncement.timestamp
      };
      
      // Add to history
      if (persistAnnouncements) {
        setAnnouncementHistory(prevHistory => {
          const newHistory = [...prevHistory, {
            content: nextAnnouncement.content,
            priority: nextAnnouncement.priority,
            timestamp: nextAnnouncement.timestamp,
            modality: nextAnnouncement.context.modality || 'system'
          }];
          
          if (newHistory.length > maxPersistedCount) {
            return newHistory.slice(-maxPersistedCount);
          }
          
          return newHistory;
        });
      }
      
      // Voice synthesis
      if (voiceSynthesis && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(nextAnnouncement.content);
        if (voiceOptions.rate) utterance.rate = voiceOptions.rate;
        if (voiceOptions.pitch) utterance.pitch = voiceOptions.pitch;
        if (voiceOptions.volume) utterance.volume = voiceOptions.volume;
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
      }
      
      // Haptic feedback
      if (hapticFeedback && navigator.vibrate && hapticPatterns[nextAnnouncement.context.type as keyof typeof hapticPatterns]) {
        navigator.vibrate(hapticPatterns[nextAnnouncement.context.type as keyof typeof hapticPatterns] || [100]);
      }
      
      // Callbacks
      if (onAnnounce) {
        onAnnounce(nextAnnouncement.content, nextAnnouncement.priority, nextAnnouncement.context);
      }
      
      // Update metrics
      setMetrics(m => ({
        ...m,
        totalAnnouncements: m.totalAnnouncements + 1,
        errorCount: nextAnnouncement.context.type === 'error' ? m.errorCount + 1 : m.errorCount,
        warningCount: nextAnnouncement.context.type === 'warning' ? m.warningCount + 1 : m.warningCount,
        successCount: nextAnnouncement.context.type === 'success' ? m.successCount + 1 : m.successCount
      }));
      
      // Debug logging
      if (debugMode && debugOptions.logAnnouncements) {
        console.log('LiveRegion: Announced', nextAnnouncement);
      }
      
      return remaining;
    });
  }, [persistAnnouncements, maxPersistedCount, voiceSynthesis, voiceOptions, language, hapticFeedback, hapticPatterns, onAnnounce, debugMode, debugOptions]);
  
  // Make immediate announcement
  const announce = useCallback((content: string, context: any = {}) => {
    const announcementPriority = calculatePriority(context);
    
    if (queueAnnouncements) {
      queueAnnouncement(content, announcementPriority, context);
    } else {
      const formattedContent = formatAnnouncement(content, context);
      setCurrentAnnouncement(formattedContent);
      
      if (onAnnounce) {
        onAnnounce(formattedContent, announcementPriority, context);
      }
    }
  }, [calculatePriority, queueAnnouncements, queueAnnouncement, formatAnnouncement, onAnnounce]);
  
  // Handle modal state changes
  const prevModalStateRef = useRef(modalState);
  useEffect(() => {
    if (!autoAnnounce || !modalState) return;
    
    const changes = detectStateChanges(prevModalStateRef.current, modalState);
    
    changes.forEach(change => {
      let content = '';
      
      switch (change.modality) {
        case 'voice':
          if (announceErrors && change.change.includes('error')) {
            content = `Voice ${change.change}`;
          } else if (announceSuccess && change.change.includes('speaking')) {
            content = `Voice ${change.change}`;
          } else {
            content = `Voice ${change.change}`;
          }
          break;
        case 'camera':
          if (announceErrors && change.change.includes('error')) {
            content = `Camera ${change.change}`;
          } else if (announceSuccess && change.change.includes('capturing')) {
            content = `Camera ${change.change}`;
          } else {
            content = `Camera ${change.change}`;
          }
          break;
        case 'text':
          content = `Text input ${change.change}`;
          break;
        case 'focus':
          if (announceFocus) {
            content = `Focus ${change.change}`;
          }
          break;
      }
      
      if (content) {
        announce(content, {
          type: change.change.includes('error') ? 'error' : 
                change.change.includes('complete') ? 'success' : 'info',
          modality: change.modality,
          details: change.details
        });
      }
    });
    
    // Check for coordination
    if (announceCoordination) {
      const coordination = detectCoordination();
      if (coordination) {
        announce(`Coordinating ${coordination.modalities.join(' and ')}`, {
          type: 'coordination',
          modalities: coordination.modalities
        });
        
        if (onCoordination) {
          onCoordination(coordination.modalities, coordination.action);
        }
      }
    }
    
    // Check for conflicts
    if (announceConflicts) {
      const conflict = detectConflicts();
      if (conflict) {
        announce(`Conflict detected: ${conflict.conflict}`, {
          type: 'conflict',
          modalities: conflict.modalities,
          conflict: conflict.conflict
        });
        
        if (onConflict) {
          onConflict(conflict.modalities, conflict.conflict);
        }
      }
    }
    
    prevModalStateRef.current = modalState;
  }, [modalState, autoAnnounce, detectStateChanges, announceErrors, announceSuccess, announceFocus, announceCoordination, announceConflicts, detectCoordination, detectConflicts, announce, onCoordination, onConflict]);
  
  // Queue processing timer
  useEffect(() => {
    if (queueAnnouncements) {
      queueTimerRef.current = setInterval(processQueue, queueInterval);
      
      return () => {
        if (queueTimerRef.current) {
          clearInterval(queueTimerRef.current);
        }
      };
    }
  }, [queueAnnouncements, processQueue, queueInterval]);
  
  // Region rotation
  useEffect(() => {
    if (rotateRegions && useMultipleRegions) {
      rotationTimerRef.current = setInterval(() => {
        setActiveRegionIndex(prev => (prev + 1) % regionCount);
      }, 3000);
      
      return () => {
        if (rotationTimerRef.current) {
          clearInterval(rotationTimerRef.current);
        }
      };
    }
  }, [rotateRegions, useMultipleRegions, regionCount]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (queueTimerRef.current) clearInterval(queueTimerRef.current);
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, []);
  
  // Get live region attributes
  const getLiveRegionAttributes = () => {
    return {
      'aria-live': priority === 'critical' ? 'assertive' : politeness,
      'aria-atomic': atomic,
      'aria-relevant': relevant,
      'role': role,
      'aria-label': ariaLabel,
      'aria-description': ariaDescription,
      'lang': language
    };
  };
  
  // Render multiple regions if requested
  const renderLiveRegions = () => {
    if (!useMultipleRegions) {
      return (
        <div
          className={styles.liveRegion}
          {...getLiveRegionAttributes()}
        >
          {currentAnnouncement}
        </div>
      );
    }
    
    return Array.from({ length: regionCount }).map((_, index) => (
      <div
        key={index}
        className={`${styles.liveRegion} ${index === activeRegionIndex ? styles.active : styles.inactive}`}
        {...getLiveRegionAttributes()}
        aria-hidden={index !== activeRegionIndex}
      >
        {index === activeRegionIndex ? currentAnnouncement : ''}
      </div>
    ));
  };
  
  // Class computation
  const computedClassName = [
    styles.liveRegion,
    styles[priority],
    styles[role],
    debugMode && styles.debug,
    visualIndicators && styles.visualIndicators,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      id={liveRegionId}
      data-priority={priority}
      data-role={role}
      data-politeness={politeness}
      {...rest}
    >
      {renderLiveRegions()}
      
      {/* Children content */}
      {children}
      
      {/* Visual notifications */}
      {visualIndicators && visualOptions.showNotifications && currentAnnouncement && (
        <div className={styles.visualNotification}>
          <div className={styles.notificationContent}>
            {currentAnnouncement}
          </div>
        </div>
      )}
      
      {/* Announcement history */}
      {persistAnnouncements && announcementHistory.length > 0 && (
        <div className={styles.announcementHistory} aria-hidden="true">
          <h3>Recent Announcements</h3>
          <ul>
            {announcementHistory.map((announcement, index) => (
              <li key={index} className={styles.historyItem}>
                <span className={styles.timestamp}>
                  {new Date(announcement.timestamp).toLocaleTimeString()}
                </span>
                <span className={styles.modality}>{announcement.modality}</span>
                <span className={styles.content}>{announcement.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Debug information */}
      {debugMode && debugOptions.showMetrics && (
        <div className={styles.debugMetrics} aria-hidden="true">
          <h3>Live Region Metrics</h3>
          <div>Total Announcements: {metrics.totalAnnouncements}</div>
          <div>Errors: {metrics.errorCount}</div>
          <div>Warnings: {metrics.warningCount}</div>
          <div>Success: {metrics.successCount}</div>
          <div>Queue Overflows: {metrics.queueOverflows}</div>
          <div>Queue Size: {announcementQueue.length}</div>
          <div>Active Region: {activeRegionIndex + 1}/{regionCount}</div>
        </div>
      )}
    </div>
  );
});

LiveRegion.displayName = 'LiveRegion';

export default LiveRegion; 