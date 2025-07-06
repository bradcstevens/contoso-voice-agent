/**
 * SCREEN READER TEXT ATOM - ENHANCED SCREEN READER CONTENT FOR MULTI-MODAL INTERACTIONS
 * 
 * Professional screen reader component providing enhanced content delivery,
 * multi-modal state announcements, and comprehensive accessibility features.
 */

import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { DesignTokens } from '../../../styles/design-tokens';
import styles from './ScreenReaderText.module.css';

export interface ScreenReaderTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Screen reader text content */
  children?: React.ReactNode;
  
  /** Announcement type */
  type?: 'status' | 'alert' | 'log' | 'marquee' | 'timer' | 'description' | 'landmark' | 'label';
  
  /** Announcement priority level */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  
  /** ARIA live region politeness */
  politeness?: 'off' | 'polite' | 'assertive';
  
  /** Whether announcements should be atomic */
  atomic?: boolean;
  
  /** Modal context for enhanced descriptions */
  modality?: 'voice' | 'camera' | 'text' | 'multimodal' | 'auto';
  
  /** Multi-modal state for contextual announcements */
  modalState?: {
    voice?: {
      status: 'idle' | 'listening' | 'speaking' | 'processing' | 'error';
      quality?: number;
      provider?: string;
    };
    camera?: {
      status: 'idle' | 'active' | 'capturing' | 'processing' | 'error';
      resolution?: string;
      fps?: number;
    };
    text?: {
      status: 'idle' | 'typing' | 'processing' | 'complete';
      wordCount?: number;
    };
  };
  
  /** Whether to provide enhanced descriptions */
  enhanced?: boolean;
  
  /** Whether to include contextual information */
  includeContext?: boolean;
  
  /** Whether to announce changes immediately */
  immediate?: boolean;
  
  /** Debounce delay for frequent updates */
  debounceDelay?: number;
  
  /** Maximum announcement length */
  maxLength?: number;
  
  /** Whether to truncate long announcements */
  truncate?: boolean;
  
  /** Language code for announcements */
  language?: string;
  
  /** Whether to use speech synthesis */
  useSpeechSynthesis?: boolean;
  
  /** Whether to announce state changes */
  announceStateChanges?: boolean;
  
  /** Whether to announce errors */
  announceErrors?: boolean;
  
  /** Whether to announce success states */
  announceSuccess?: boolean;
  
  /** Whether to include timestamps */
  includeTimestamp?: boolean;
  
  /** Whether to group similar announcements */
  groupSimilar?: boolean;
  
  /** Custom announcement templates */
  templates?: {
    voice?: {
      listening?: string;
      speaking?: string;
      processing?: string;
      error?: string;
    };
    camera?: {
      active?: string;
      capturing?: string;
      processing?: string;
      error?: string;
    };
    text?: {
      typing?: string;
      processing?: string;
      complete?: string;
    };
  };
  
  /** Whether to use abbreviated announcements */
  abbreviated?: boolean;
  
  /** Whether to use semantic descriptions */
  semantic?: boolean;
  
  /** Whether to announce keyboard shortcuts */
  announceShortcuts?: boolean;
  
  /** Available keyboard shortcuts */
  shortcuts?: Array<{
    key: string;
    description: string;
    modality?: string;
  }>;
  
  /** Whether to provide help information */
  provideHelp?: boolean;
  
  /** Help content */
  helpContent?: string;
  
  /** Custom ARIA properties */
  ariaProperties?: Record<string, string | number | boolean>;
  
  /** Whether to persist announcements */
  persistAnnouncements?: boolean;
  
  /** Maximum persisted announcements */
  maxPersistedCount?: number;
  
  /** Whether to log announcements for debugging */
  debugMode?: boolean;
  
  /** Callback when announcement is made */
  onAnnounce?: (content: string, type: string, modality: string) => void;
  
  /** Callback when content updates */
  onContentUpdate?: (newContent: string, oldContent: string) => void;
  
  /** Callback when modality changes */
  onModalityChange?: (newModality: string, oldModality: string) => void;
  
  /** Custom announcement element ID */
  announcementId?: string;
  
  /** Whether to clear previous announcements */
  clearPrevious?: boolean;
}

/**
 * Enhanced ScreenReaderText atom with comprehensive multi-modal accessibility
 */
export const ScreenReaderText = forwardRef<HTMLDivElement, ScreenReaderTextProps>(({
  children,
  type = 'status',
  priority = 'medium',
  politeness = 'polite',
  atomic = true,
  modality = 'auto',
  modalState,
  enhanced = false,
  includeContext = false,
  immediate = false,
  debounceDelay = 300,
  maxLength = 200,
  truncate = false,
  language = 'en',
  useSpeechSynthesis = false,
  announceStateChanges = true,
  announceErrors = true,
  announceSuccess = true,
  includeTimestamp = false,
  groupSimilar = true,
  templates = {},
  abbreviated = false,
  semantic = false,
  announceShortcuts = false,
  shortcuts = [],
  provideHelp = false,
  helpContent = '',
  ariaProperties = {},
  persistAnnouncements = false,
  maxPersistedCount = 10,
  debugMode = false,
  onAnnounce,
  onContentUpdate,
  onModalityChange,
  announcementId,
  clearPrevious = false,
  className = '',
  ...rest
}, ref) => {
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentModality, setCurrentModality] = useState(modality);
  const [announcementHistory, setAnnouncementHistory] = useState<Array<{
    content: string;
    timestamp: number;
    modality: string;
    type: string;
  }>>([]);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastAnnouncementRef = useRef<{ content: string; timestamp: number } | null>(null);
  const announcementCountRef = useRef(0);
  
  // Detect current modality
  const detectModality = useCallback((): string => {
    if (modality !== 'auto') return modality;
    
    if (modalState) {
      const activeModalities = [];
      if (modalState.voice?.status !== 'idle') activeModalities.push('voice');
      if (modalState.camera?.status !== 'idle') activeModalities.push('camera');
      if (modalState.text?.status !== 'idle') activeModalities.push('text');
      
      if (activeModalities.length === 0) return 'text';
      if (activeModalities.length === 1) return activeModalities[0];
      return 'multimodal';
    }
    
    return 'text';
  }, [modality, modalState]);
  
  // Format timestamp
  const formatTimestamp = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)} seconds ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    return `${Math.floor(diff / 3600000)} hours ago`;
  }, []);
  
  // Truncate content if needed
  const truncateContent = useCallback((content: string): string => {
    if (!truncate || content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }, [truncate, maxLength]);
  
  // Format content with context
  const formatContentWithContext = useCallback((content: string): string => {
    let formattedContent = content;
    
    // Include context if requested
    if (includeContext && modalState) {
      const contextParts = [];
      
      if (modalState.voice?.status !== 'idle') {
        contextParts.push(`Voice: ${modalState.voice.status}`);
      }
      if (modalState.camera?.status !== 'idle') {
        contextParts.push(`Camera: ${modalState.camera.status}`);
      }
      if (modalState.text?.status !== 'idle') {
        contextParts.push(`Text: ${modalState.text.status}`);
      }
      
      if (contextParts.length > 0) {
        formattedContent += ` [${contextParts.join(', ')}]`;
      }
    }
    
    // Add timestamp if requested
    if (includeTimestamp) {
      const timestamp = formatTimestamp(Date.now());
      if (timestamp) {
        formattedContent += ` (${timestamp})`;
      }
    }
    
    // Truncate if needed
    formattedContent = truncateContent(formattedContent);
    
    return formattedContent;
  }, [includeContext, modalState, includeTimestamp, formatTimestamp, truncateContent]);
  
  // Generate template-based content
  const generateTemplateContent = useCallback((templateKey: string, variables: Record<string, any> = {}): string => {
    const modalityTemplates = templates[currentModality as keyof typeof templates];
    let template = modalityTemplates?.[templateKey as keyof typeof modalityTemplates];
    
    if (!template) {
      template = `${variables.modality || currentModality} ${variables.state || templateKey}`;
    }
    
    let content = template;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    
    return content;
  }, [templates, currentModality]);
  
  // Check if announcement should be grouped
  const shouldGroupAnnouncement = useCallback((content: string): boolean => {
    if (!groupSimilar || !lastAnnouncementRef.current) return false;
    
    const timeDiff = Date.now() - lastAnnouncementRef.current.timestamp;
    const contentSimilar = lastAnnouncementRef.current.content === content;
    
    return timeDiff < 1000 && contentSimilar;
  }, [groupSimilar]);
  
  // Make announcement
  const makeAnnouncement = useCallback((content: string, force = false) => {
    if (!content) return;
    
    const formattedContent = formatContentWithContext(content);
    
    // Check for grouping
    if (!force && shouldGroupAnnouncement(formattedContent)) {
      if (debugMode) {
        console.log('ScreenReaderText: Grouped similar announcement', formattedContent);
      }
      return;
    }
    
    // Clear previous if requested
    if (clearPrevious) {
      setCurrentContent('');
      setTimeout(() => setCurrentContent(formattedContent), 50);
    } else {
      setCurrentContent(formattedContent);
    }
    
    // Add to history
    if (persistAnnouncements) {
      setAnnouncementHistory(prev => {
        const newHistory = [...prev, {
          content: formattedContent,
          timestamp: Date.now(),
          modality: currentModality,
          type
        }];
        
        if (newHistory.length > maxPersistedCount) {
          return newHistory.slice(-maxPersistedCount);
        }
        
        return newHistory;
      });
    }
    
    // Update last announcement reference
    lastAnnouncementRef.current = {
      content: formattedContent,
      timestamp: Date.now()
    };
    
    // Speech synthesis
    if (useSpeechSynthesis && window.speechSynthesis) {
      if (speechUtteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(formattedContent);
      utterance.lang = language;
      
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
    
    // Callbacks
    if (onAnnounce) onAnnounce(formattedContent, type, currentModality);
    
    // Debug logging
    if (debugMode) {
      console.log('ScreenReaderText: Announcement made', {
        content: formattedContent,
        type,
        modality: currentModality,
        priority,
        politeness
      });
    }
    
    announcementCountRef.current++;
  }, [formatContentWithContext, shouldGroupAnnouncement, clearPrevious, persistAnnouncements, maxPersistedCount, currentModality, type, useSpeechSynthesis, language, onAnnounce, debugMode, priority, politeness]);
  
  // Debounced announcement
  const debouncedAnnouncement = useCallback((content: string, force = false) => {
    if (immediate || force) {
      makeAnnouncement(content, force);
      return;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      makeAnnouncement(content, force);
      debounceTimerRef.current = null;
    }, debounceDelay);
  }, [immediate, makeAnnouncement, debounceDelay]);
  
  // Handle children content changes
  useEffect(() => {
    if (children) {
      const content = typeof children === 'string' ? children : String(children);
      debouncedAnnouncement(content);
    }
  }, [children, debouncedAnnouncement]);
  
  // Handle modal state changes
  useEffect(() => {
    if (!announceStateChanges || !modalState) return;
    
    let stateContent = '';
    
    const voiceState = modalState.voice;
    if (voiceState?.status && voiceState.status !== 'idle') {
      stateContent = generateTemplateContent(voiceState.status, {
        modality: 'voice',
        state: voiceState.status,
        quality: voiceState.quality,
        provider: voiceState.provider
      });
    }
    
    const cameraState = modalState.camera;
    if (cameraState?.status && cameraState.status !== 'idle') {
      stateContent = generateTemplateContent(cameraState.status, {
        modality: 'camera',
        state: cameraState.status,
        resolution: cameraState.resolution,
        fps: cameraState.fps
      });
    }
    
    const textState = modalState.text;
    if (textState?.status && textState.status !== 'idle') {
      stateContent = generateTemplateContent(textState.status, {
        modality: 'text',
        state: textState.status,
        wordCount: textState.wordCount
      });
    }
    
    if (stateContent) {
      debouncedAnnouncement(stateContent);
    }
  }, [modalState, announceStateChanges, generateTemplateContent, debouncedAnnouncement]);
  
  // Handle modality changes
  useEffect(() => {
    const newModality = detectModality();
    if (newModality !== currentModality) {
      const oldModality = currentModality;
      setCurrentModality(newModality);
      
      if (onModalityChange) {
        onModalityChange(newModality, oldModality);
      }
      
      if (debugMode) {
        console.log('ScreenReaderText: Modality changed', { from: oldModality, to: newModality });
      }
    }
  }, [detectModality, currentModality, onModalityChange, debugMode]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (speechUtteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Get accessibility attributes
  const getAccessibilityAttributes = useCallback(() => {
    const attributes: Record<string, any> = {
      'aria-live': priority === 'critical' ? 'assertive' : politeness,
      'aria-atomic': atomic,
      'role': type,
      'lang': language,
      ...ariaProperties
    };
    
    return attributes;
  }, [politeness, atomic, type, language, ariaProperties, priority]);
  
  // Class computation
  const computedClassName = [
    styles.screenReaderText,
    styles[type],
    styles[priority],
    styles[currentModality],
    enhanced && styles.enhanced,
    semantic && styles.semantic,
    useSpeechSynthesis && styles.speechEnabled,
    debugMode && styles.debug,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      ref={ref}
      className={computedClassName}
      id={announcementId}
      data-modality={currentModality}
      data-type={type}
      data-priority={priority}
      {...rest}
    >
      <div
        className={styles.announcementRegion}
        {...getAccessibilityAttributes()}
      >
        {currentContent}
      </div>
      
      {/* Persistent announcement history */}
      {persistAnnouncements && announcementHistory.length > 0 && (
        <div className={styles.announcementHistory} aria-hidden="true">
          {announcementHistory.map((announcement, index) => (
            <div key={index} className={styles.historyItem}>
              <span className={styles.historyTimestamp}>
                {formatTimestamp(announcement.timestamp)}
              </span>
              <span className={styles.historyContent}>
                {announcement.content}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Help content */}
      {provideHelp && helpContent && (
        <div className={styles.helpContent} role="complementary">
          {helpContent}
        </div>
      )}
      
      {/* Keyboard shortcuts */}
      {announceShortcuts && shortcuts.length > 0 && (
        <div className={styles.shortcuts} role="complementary">
          <h3>Available shortcuts:</h3>
          <ul>
            {shortcuts.map((shortcut, index) => (
              <li key={index}>
                <kbd>{shortcut.key}</kbd>: {shortcut.description}
                {shortcut.modality && <span> (for {shortcut.modality})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Debug information */}
      {debugMode && (
        <div className={styles.debugInfo} aria-hidden="true">
          <div>Announcements: {announcementCountRef.current}</div>
          <div>Current Modality: {currentModality}</div>
          <div>Type: {type}</div>
          <div>Priority: {priority}</div>
          <div>Politeness: {politeness}</div>
        </div>
      )}
    </div>
  );
});

ScreenReaderText.displayName = 'ScreenReaderText';

export default ScreenReaderText; 