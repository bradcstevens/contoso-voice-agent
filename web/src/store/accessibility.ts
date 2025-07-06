import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Accessibility types and interfaces
export interface AccessibilitySettings {
  // WCAG compliance level
  wcagLevel: 'A' | 'AA' | 'AAA';
  
  // Visual accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindnessSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  
  // Screen reader support
  screenReaderMode: boolean;
  announcements: boolean;
  verboseDescriptions: boolean;
  
  // Keyboard navigation
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;
  tabTrapEnabled: boolean;
  
  // Motor accessibility
  largeClickTargets: boolean;
  reducedClickSensitivity: boolean;
  stickyHover: boolean;
  
  // Cognitive accessibility
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  confirmationDialogs: boolean;
  progressIndicators: boolean;
}

export interface FocusManagement {
  currentFocus: string | null;
  focusHistory: string[];
  trapFocus: boolean;
  skipToContent: boolean;
  focusOrder: string[];
  customFocusMap: Record<string, string[]>;
}

export interface ScreenReaderState {
  isActive: boolean;
  currentAnnouncement: string;
  announcementQueue: string[];
  liveRegions: Record<string, string>;
  contextualHelp: Record<string, string>;
}

export interface AccessibilityViolation {
  id: string;
  type: 'color-contrast' | 'focus-management' | 'aria-labels' | 'keyboard-nav' | 'screen-reader';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: string;
  description: string;
  suggestion: string;
  timestamp: number;
  resolved: boolean;
}

export interface AccessibilityState {
  // Settings
  settings: AccessibilitySettings;
  
  // Focus management
  focus: FocusManagement;
  
  // Screen reader
  screenReader: ScreenReaderState;
  
  // Accessibility violations and monitoring
  violations: AccessibilityViolation[];
  monitoring: {
    enabled: boolean;
    autoFix: boolean;
    reportingLevel: 'all' | 'medium-high' | 'high-critical';
  };
  
  // Organism coordination
  coordination: {
    activeOrganisms: string[];
    sharedContext: Record<string, any>;
    crossOrganismFocus: boolean;
  };
  
  // Performance metrics
  performance: {
    focusLatency: number;
    announcementLatency: number;
    navigationEfficiency: number;
  };
}

export interface AccessibilityActions {
  // Settings actions
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  toggleScreenReaderMode: () => void;
  
  // Focus management actions
  setFocus: (elementId: string) => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => void;
  trapFocus: (containerIds: string[]) => void;
  releaseFocusTrap: () => void;
  addToFocusOrder: (elementId: string, position?: number) => void;
  removeFromFocusOrder: (elementId: string) => void;
  
  // Screen reader actions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setLiveRegion: (regionId: string, content: string) => void;
  clearAnnouncements: () => void;
  setContextualHelp: (elementId: string, helpText: string) => void;
  
  // Violation monitoring actions
  addViolation: (violation: Omit<AccessibilityViolation, 'id' | 'timestamp'>) => void;
  resolveViolation: (violationId: string) => void;
  clearViolations: () => void;
  enableMonitoring: () => void;
  disableMonitoring: () => void;
  
  // Coordination actions
  initializeAccessibilityCoordination: (config: any) => void;
  registerOrganism: (organismId: string) => void;
  unregisterOrganism: (organismId: string) => void;
  announceNavigation: (message: string) => void;
  announceSystem: (message: string) => void;
  updateSharedContext: (context: Record<string, any>) => void;
  
  // Performance actions
  recordFocusLatency: (latency: number) => void;
  recordAnnouncementLatency: (latency: number) => void;
  updateNavigationEfficiency: (efficiency: number) => void;
}

export type AccessibilityStore = AccessibilityState & AccessibilityActions;

// Initial state
const initialState: AccessibilityState = {
  settings: {
    wcagLevel: 'AAA',
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    colorBlindnessSupport: 'none',
    screenReaderMode: false,
    announcements: true,
    verboseDescriptions: false,
    keyboardNavigation: true,
    focusIndicators: true,
    skipLinks: true,
    tabTrapEnabled: true,
    largeClickTargets: false,
    reducedClickSensitivity: false,
    stickyHover: false,
    simplifiedInterface: false,
    extendedTimeouts: false,
    confirmationDialogs: true,
    progressIndicators: true,
  },
  
  focus: {
    currentFocus: null,
    focusHistory: [],
    trapFocus: false,
    skipToContent: false,
    focusOrder: [],
    customFocusMap: {},
  },
  
  screenReader: {
    isActive: false,
    currentAnnouncement: '',
    announcementQueue: [],
    liveRegions: {},
    contextualHelp: {},
  },
  
  violations: [],
  monitoring: {
    enabled: true,
    autoFix: false,
    reportingLevel: 'medium-high',
  },
  
  coordination: {
    activeOrganisms: [],
    sharedContext: {},
    crossOrganismFocus: false,
  },
  
  performance: {
    focusLatency: 0,
    announcementLatency: 0,
    navigationEfficiency: 100,
  },
};

// Zustand store with middleware
export const useAccessibility = create<AccessibilityStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Settings actions
        updateSettings: (settings) => set((draft) => {
          Object.assign(draft.settings, settings);
        }),
        
        toggleHighContrast: () => set((draft) => {
          draft.settings.highContrast = !draft.settings.highContrast;
          
          // Apply high contrast to document
          if (draft.settings.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
          } else {
            document.documentElement.removeAttribute('data-high-contrast');
          }
        }),
        
        toggleReducedMotion: () => set((draft) => {
          draft.settings.reducedMotion = !draft.settings.reducedMotion;
          
          // Apply reduced motion to document
          if (draft.settings.reducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
          } else {
            document.documentElement.removeAttribute('data-reduced-motion');
          }
        }),
        
        setFontSize: (size) => set((draft) => {
          draft.settings.fontSize = size;
          
          // Apply font size to document
          document.documentElement.setAttribute('data-font-size', size);
        }),
        
        toggleScreenReaderMode: () => set((draft) => {
          draft.settings.screenReaderMode = !draft.settings.screenReaderMode;
          draft.screenReader.isActive = draft.settings.screenReaderMode;
          
          // Apply screen reader mode to document
          if (draft.settings.screenReaderMode) {
            document.documentElement.setAttribute('data-screen-reader-mode', 'true');
          } else {
            document.documentElement.removeAttribute('data-screen-reader-mode');
          }
        }),
        
        // Focus management actions
        setFocus: (elementId) => set((draft) => {
          const startTime = performance.now();
          
          // Update focus state
          if (draft.focus.currentFocus) {
            draft.focus.focusHistory.push(draft.focus.currentFocus);
          }
          draft.focus.currentFocus = elementId;
          
          // Keep focus history manageable
          if (draft.focus.focusHistory.length > 10) {
            draft.focus.focusHistory = draft.focus.focusHistory.slice(-10);
          }
          
          // Actually focus the element
          const element = document.getElementById(elementId);
          if (element) {
            element.focus();
            
            // Record focus latency
            const latency = performance.now() - startTime;
            draft.performance.focusLatency = latency;
          }
        }),
        
        moveFocus: (direction) => set((draft) => {
          const { focusOrder, currentFocus } = draft.focus;
          
          if (focusOrder.length === 0) return;
          
          const currentIndex = currentFocus ? focusOrder.indexOf(currentFocus) : -1;
          let nextIndex = currentIndex;
          
          switch (direction) {
            case 'next':
              nextIndex = (currentIndex + 1) % focusOrder.length;
              break;
            case 'previous':
              nextIndex = currentIndex > 0 ? currentIndex - 1 : focusOrder.length - 1;
              break;
            case 'first':
              nextIndex = 0;
              break;
            case 'last':
              nextIndex = focusOrder.length - 1;
              break;
          }
          
          const nextElementId = focusOrder[nextIndex];
          if (nextElementId) {
            const { setFocus } = get();
            setFocus(nextElementId);
          }
        }),
        
        trapFocus: (containerIds) => set((draft) => {
          draft.focus.trapFocus = true;
          draft.focus.focusOrder = containerIds;
        }),
        
        releaseFocusTrap: () => set((draft) => {
          draft.focus.trapFocus = false;
        }),
        
        addToFocusOrder: (elementId, position) => set((draft) => {
          const { focusOrder } = draft.focus;
          
          // Remove if already exists
          const existingIndex = focusOrder.indexOf(elementId);
          if (existingIndex !== -1) {
            focusOrder.splice(existingIndex, 1);
          }
          
          // Add at specified position or end
          if (position !== undefined && position >= 0 && position <= focusOrder.length) {
            focusOrder.splice(position, 0, elementId);
          } else {
            focusOrder.push(elementId);
          }
        }),
        
        removeFromFocusOrder: (elementId) => set((draft) => {
          const index = draft.focus.focusOrder.indexOf(elementId);
          if (index !== -1) {
            draft.focus.focusOrder.splice(index, 1);
          }
        }),
        
        // Screen reader actions
        announce: (message, priority = 'polite') => set((draft) => {
          const startTime = performance.now();
          
          if (priority === 'assertive') {
            draft.screenReader.currentAnnouncement = message;
            draft.screenReader.announcementQueue = [message];
          } else {
            draft.screenReader.announcementQueue.push(message);
          }
          
          // Process announcement queue
          if (draft.screenReader.announcementQueue.length === 1) {
            draft.screenReader.currentAnnouncement = message;
            
            // Create or update live region
            const liveRegion = document.getElementById('accessibility-live-region');
            if (liveRegion) {
              liveRegion.textContent = message;
              liveRegion.setAttribute('aria-live', priority);
            }
            
            // Record announcement latency
            const latency = performance.now() - startTime;
            draft.performance.announcementLatency = latency;
          }
        }),
        
        setLiveRegion: (regionId, content) => set((draft) => {
          draft.screenReader.liveRegions[regionId] = content;
          
          // Update DOM live region
          const element = document.getElementById(regionId);
          if (element) {
            element.textContent = content;
          }
        }),
        
        clearAnnouncements: () => set((draft) => {
          draft.screenReader.currentAnnouncement = '';
          draft.screenReader.announcementQueue = [];
        }),
        
        setContextualHelp: (elementId, helpText) => set((draft) => {
          draft.screenReader.contextualHelp[elementId] = helpText;
          
          // Update DOM element with aria-describedby
          const element = document.getElementById(elementId);
          if (element) {
            const helpId = `${elementId}-help`;
            element.setAttribute('aria-describedby', helpId);
            
            // Create or update help element
            let helpElement = document.getElementById(helpId);
            if (!helpElement) {
              helpElement = document.createElement('div');
              helpElement.id = helpId;
              helpElement.className = 'sr-only';
              document.body.appendChild(helpElement);
            }
            helpElement.textContent = helpText;
          }
        }),
        
        // Violation monitoring actions
        addViolation: (violation) => set((draft) => {
          const newViolation: AccessibilityViolation = {
            id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            resolved: false,
            ...violation,
          };
          
          draft.violations.push(newViolation);
          
          // Log violations based on reporting level
          const { reportingLevel } = draft.monitoring;
          const shouldReport = 
            reportingLevel === 'all' ||
            (reportingLevel === 'medium-high' && ['medium', 'high', 'critical'].includes(violation.severity)) ||
            (reportingLevel === 'high-critical' && ['high', 'critical'].includes(violation.severity));
          
          if (shouldReport) {
            console.warn('Accessibility violation detected:', newViolation);
          }
        }),
        
        resolveViolation: (violationId) => set((draft) => {
          const violation = draft.violations.find((v) => v.id === violationId);
          if (violation) {
            violation.resolved = true;
          }
        }),
        
        clearViolations: () => set((draft) => {
          draft.violations = [];
        }),
        
        enableMonitoring: () => set((draft) => {
          draft.monitoring.enabled = true;
        }),
        
        disableMonitoring: () => set((draft) => {
          draft.monitoring.enabled = false;
        }),
        
        // Coordination actions
        initializeAccessibilityCoordination: (config) => set((draft) => {
          draft.coordination.activeOrganisms = config.organisms || [];
          draft.settings.wcagLevel = config.wcagLevel || 'AAA';
          draft.settings.screenReaderMode = config.screenReaderSupport || false;
          draft.settings.highContrast = config.highContrastMode || false;
          draft.settings.reducedMotion = config.reducedMotion || false;
          
          // Apply settings to document
          if (draft.settings.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
          }
          if (draft.settings.reducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
          }
          if (draft.settings.screenReaderMode) {
            document.documentElement.setAttribute('data-screen-reader-mode', 'true');
          }
        }),
        
        registerOrganism: (organismId) => set((draft) => {
          if (!draft.coordination.activeOrganisms.includes(organismId)) {
            draft.coordination.activeOrganisms.push(organismId);
          }
        }),
        
        unregisterOrganism: (organismId) => set((draft) => {
          draft.coordination.activeOrganisms = draft.coordination.activeOrganisms.filter(
            (id: string) => id !== organismId
          );
        }),
        
        announceNavigation: (message) => set((draft) => {
          const { announce } = get();
          announce(`Navigation: ${message}`, 'polite');
        }),
        
        announceSystem: (message) => set((draft) => {
          const { announce } = get();
          announce(`System: ${message}`, 'assertive');
        }),
        
        updateSharedContext: (context) => set((draft) => {
          Object.assign(draft.coordination.sharedContext, context);
        }),
        
        // Performance actions
        recordFocusLatency: (latency) => set((draft) => {
          draft.performance.focusLatency = latency;
        }),
        
        recordAnnouncementLatency: (latency) => set((draft) => {
          draft.performance.announcementLatency = latency;
        }),
        
        updateNavigationEfficiency: (efficiency) => set((draft) => {
          draft.performance.navigationEfficiency = efficiency;
        }),
      })),
      {
        name: 'accessibility-store',
        partialize: (state) => ({
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'accessibility-store',
    }
  )
);

// Selectors for commonly used state
export const useAccessibilitySettings = () => useAccessibility(state => state.settings);
export const useFocusManagement = () => useAccessibility(state => state.focus);
export const useScreenReaderState = () => useAccessibility(state => state.screenReader);
export const useAccessibilityViolations = () => useAccessibility(state => state.violations);
export const useAccessibilityPerformance = () => useAccessibility(state => state.performance);

// Action selectors
export const useAccessibilityActions = () => useAccessibility(state => ({
  updateSettings: state.updateSettings,
  toggleHighContrast: state.toggleHighContrast,
  toggleReducedMotion: state.toggleReducedMotion,
  setFontSize: state.setFontSize,
  toggleScreenReaderMode: state.toggleScreenReaderMode,
}));

export const useFocusActions = () => useAccessibility(state => ({
  setFocus: state.setFocus,
  moveFocus: state.moveFocus,
  trapFocus: state.trapFocus,
  releaseFocusTrap: state.releaseFocusTrap,
  addToFocusOrder: state.addToFocusOrder,
  removeFromFocusOrder: state.removeFromFocusOrder,
}));

export const useScreenReaderActions = () => useAccessibility(state => ({
  announce: state.announce,
  setLiveRegion: state.setLiveRegion,
  clearAnnouncements: state.clearAnnouncements,
  setContextualHelp: state.setContextualHelp,
}));

export const useAccessibilityMonitoring = () => useAccessibility(state => ({
  violations: state.violations,
  monitoring: state.monitoring,
  addViolation: state.addViolation,
  resolveViolation: state.resolveViolation,
  clearViolations: state.clearViolations,
  enableMonitoring: state.enableMonitoring,
  disableMonitoring: state.disableMonitoring,
}));

// Utility functions for accessibility
export function checkColorContrast(foreground: string, background: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, this would use proper color parsing and WCAG contrast formulas
  return 4.5; // Placeholder - should calculate actual contrast ratio
}

export function validateFocusOrder(elements: HTMLElement[]): boolean {
  // Check if elements can be focused in logical order
  return elements.every(element => 
    element.tabIndex >= 0 || 
    ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase())
  );
}

export function generateARIALabel(element: HTMLElement, context?: string): string {
  // Generate appropriate ARIA label based on element type and context
  const tagName = element.tagName.toLowerCase();
  const textContent = element.textContent?.trim() || '';
  
  if (context) {
    return `${textContent} ${context}`;
  }
  
  switch (tagName) {
    case 'button':
      return textContent || 'Button';
    case 'input':
      const type = element.getAttribute('type') || 'text';
      return `${textContent} ${type} input`;
    default:
      return textContent || tagName;
  }
}

// Initialize accessibility on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Create main live region if it doesn't exist
    if (!document.getElementById('accessibility-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    
    // Add skip link if it doesn't exist
    if (!document.getElementById('skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-content';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only sr-only-focusable';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  });
} 