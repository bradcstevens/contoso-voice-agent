import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Type definitions for the voice agent system
export interface VoiceAgentState {
  // System state
  systemState: 'initializing' | 'ready' | 'error' | 'recovery' | 'maintenance';
  currentMode: 'chat' | 'search' | 'control' | 'user' | 'settings' | 'camera';
  previousMode: string | null;
  
  // Cross-modal communication state
  modalityStates: {
    voice: {
      isActive: boolean;
      isListening: boolean;
      lastInput: any;
      confidence: number;
      error: string | null;
    };
    camera: {
      isActive: boolean;
      isCapturing: boolean;
      lastCapture: any;
      quality: number;
      error: string | null;
    };
    search: {
      isActive: boolean;
      isSearching: boolean;
      lastResults: any[];
      confidence: number;
      error: string | null;
    };
    text: {
      isActive: boolean;
      lastInput: string;
      context: any;
      error: string | null;
    };
  };
  
  // Inter-organism coordination
  coordination: {
    activeOrganisms: string[];
    communicationFlow: {
      source: string;
      target: string;
      data: any;
      timestamp: number;
    }[];
    latency: {
      average: number;
      current: number;
      target: number;
    };
    errors: {
      count: number;
      recent: any[];
    };
  };
  
  // Performance monitoring
  performance: {
    metrics: {
      latency: number;
      throughput: number;
      errorRate: number;
      memoryUsage: number;
      cpuUsage: number;
      frameRate: number;
      networkLatency: number;
    };
    targets: {
      latency: number; // <100ms target
      throughput: number; // 30fps target
      errorRate: number; // <1% target
    };
    alerts: {
      id: string;
      type: 'performance' | 'error' | 'warning';
      message: string;
      timestamp: number;
    }[];
  };
  
  // User preferences and settings
  preferences: {
    professionalMode: boolean;
    debugMode: boolean;
    accessibility: {
      highContrast: boolean;
      reducedMotion: boolean;
      screenReaderMode: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
    voice: {
      language: string;
      pitch: number;
      speed: number;
      volume: number;
    };
    camera: {
      resolution: '720p' | '1080p' | '4K';
      frameRate: number;
      quality: 'low' | 'medium' | 'high' | 'ultra';
    };
  };
  
  // Error recovery
  errorRecovery: {
    hasError: boolean;
    errorType: string | null;
    errorMessage: string | null;
    recoveryOptions: string[];
    autoRecovery: boolean;
  };
}

export interface VoiceAgentActions {
  // System actions
  setSystemState: (state: VoiceAgentState['systemState']) => void;
  setActiveMode: (mode: VoiceAgentState['currentMode']) => void;
  initializeSystem: () => Promise<void>;
  
  // Cross-modal communication actions
  updateModalityState: (modality: keyof VoiceAgentState['modalityStates'], update: Partial<VoiceAgentState['modalityStates'][keyof VoiceAgentState['modalityStates']]>) => void;
  triggerCrossModalCommunication: (source: string, target: string, data: any) => void;
  
  // Voice actions
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  processVoiceInput: (input: any) => void;
  
  // Camera actions
  startCameraCapture: () => void;
  stopCameraCapture: () => void;
  processCameraCapture: (capture: any) => void;
  
  // Search actions
  startVisualSearch: (query?: any) => void;
  processSearchResults: (results: any[]) => void;
  
  // Text actions
  processTextInput: (input: string, context?: any) => void;
  
  // Performance monitoring actions
  updatePerformanceMetrics: (metrics: Partial<VoiceAgentState['performance']['metrics']>) => void;
  addPerformanceAlert: (alert: Omit<VoiceAgentState['performance']['alerts'][0], 'id' | 'timestamp'>) => void;
  clearPerformanceAlerts: () => void;
  
  // User preferences actions
  updatePreferences: (preferences: Partial<VoiceAgentState['preferences']>) => void;
  toggleProfessionalMode: () => void;
  toggleDebugMode: () => void;
  updateAccessibilitySettings: (settings: Partial<VoiceAgentState['preferences']['accessibility']>) => void;
  
  // Error recovery actions
  setError: (errorType: string, errorMessage: string, recoveryOptions?: string[]) => void;
  clearError: () => void;
  attemptRecovery: (method: string) => void;
  
  // Coordination actions
  registerOrganism: (organismId: string) => void;
  unregisterOrganism: (organismId: string) => void;
  updateCoordinationLatency: (latency: number) => void;
  recordCoordinationError: (error: any) => void;
}

export type VoiceAgentStore = VoiceAgentState & VoiceAgentActions;

// Initial state
const initialState: VoiceAgentState = {
  systemState: 'initializing',
  currentMode: 'chat',
  previousMode: null,
  
  modalityStates: {
    voice: {
      isActive: false,
      isListening: false,
      lastInput: null,
      confidence: 0,
      error: null,
    },
    camera: {
      isActive: false,
      isCapturing: false,
      lastCapture: null,
      quality: 0,
      error: null,
    },
    search: {
      isActive: false,
      isSearching: false,
      lastResults: [],
      confidence: 0,
      error: null,
    },
    text: {
      isActive: true,
      lastInput: '',
      context: null,
      error: null,
    },
  },
  
  coordination: {
    activeOrganisms: [],
    communicationFlow: [],
    latency: {
      average: 0,
      current: 0,
      target: 100, // <100ms target
    },
    errors: {
      count: 0,
      recent: [],
    },
  },
  
  performance: {
    metrics: {
      latency: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      frameRate: 0,
      networkLatency: 0,
    },
    targets: {
      latency: 100, // <100ms
      throughput: 30, // 30fps
      errorRate: 1, // <1%
    },
    alerts: [],
  },
  
  preferences: {
    professionalMode: false,
    debugMode: false,
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReaderMode: false,
      fontSize: 'medium',
    },
    voice: {
      language: 'en-US',
      pitch: 1,
      speed: 1,
      volume: 0.8,
    },
    camera: {
      resolution: '1080p',
      frameRate: 30,
      quality: 'high',
    },
  },
  
  errorRecovery: {
    hasError: false,
    errorType: null,
    errorMessage: null,
    recoveryOptions: [],
    autoRecovery: true,
  },
};

// Zustand store with middleware
export const useVoiceAgent = create<VoiceAgentStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // System actions
        setSystemState: (state) => set((draft) => {
          draft.systemState = state;
        }),
        
        setActiveMode: (mode) => set((draft) => {
          draft.previousMode = draft.currentMode;
          draft.currentMode = mode;
        }),
        
        initializeSystem: async () => {
          set((draft) => {
            draft.systemState = 'initializing';
          });
          
          try {
            // Initialize system components
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
            
            set((draft) => {
              draft.systemState = 'ready';
              draft.modalityStates.text.isActive = true;
            });
          } catch (error) {
            set((draft) => {
              draft.systemState = 'error';
              draft.errorRecovery.hasError = true;
              draft.errorRecovery.errorType = 'initialization';
              draft.errorRecovery.errorMessage = 'System initialization failed';
            });
          }
        },
        
        // Cross-modal communication actions
        updateModalityState: (modality, update) => set((draft) => {
          Object.assign(draft.modalityStates[modality], update);
        }),
        
        triggerCrossModalCommunication: (source, target, data) => set((draft) => {
          const communicationEvent = {
            source,
            target,
            data,
            timestamp: Date.now(),
          };
          
          draft.coordination.communicationFlow.push(communicationEvent);
          
          // Keep only last 100 communication events
          if (draft.coordination.communicationFlow.length > 100) {
            draft.coordination.communicationFlow = draft.coordination.communicationFlow.slice(-100);
          }
          
          // Update performance metrics
          const currentTime = Date.now();
          const latency = currentTime - communicationEvent.timestamp;
          draft.coordination.latency.current = latency;
          
          // Update average latency
          const flows = draft.coordination.communicationFlow;
          if (flows.length > 1) {
            const totalLatency = flows.reduce((sum: number, flow: any, index: number) => {
              if (index === 0) return sum;
              return sum + (flows[index].timestamp - flows[index - 1].timestamp);
            }, 0);
            draft.coordination.latency.average = totalLatency / (flows.length - 1);
          }
        }),
        
        // Voice actions
        startVoiceListening: () => set((draft) => {
          draft.modalityStates.voice.isActive = true;
          draft.modalityStates.voice.isListening = true;
          draft.modalityStates.voice.error = null;
        }),
        
        stopVoiceListening: () => set((draft) => {
          draft.modalityStates.voice.isListening = false;
        }),
        
        processVoiceInput: (input) => set((draft) => {
          draft.modalityStates.voice.lastInput = input;
          draft.modalityStates.voice.confidence = input.confidence || 0;
          draft.modalityStates.voice.isListening = false;
          
          // Trigger cross-modal communication if needed
          if (input.intent === 'visual-search') {
            const { triggerCrossModalCommunication } = get();
            triggerCrossModalCommunication('voice', 'camera', {
              type: 'trigger-capture',
              context: input,
            });
          }
        }),
        
        // Camera actions
        startCameraCapture: () => set((draft) => {
          draft.modalityStates.camera.isActive = true;
          draft.modalityStates.camera.isCapturing = true;
          draft.modalityStates.camera.error = null;
        }),
        
        stopCameraCapture: () => set((draft) => {
          draft.modalityStates.camera.isCapturing = false;
        }),
        
        processCameraCapture: (capture) => set((draft) => {
          draft.modalityStates.camera.lastCapture = capture;
          draft.modalityStates.camera.quality = capture.quality || 0;
          draft.modalityStates.camera.isCapturing = false;
          
          // Trigger visual search automatically
          const { triggerCrossModalCommunication } = get();
          triggerCrossModalCommunication('camera', 'search', {
            type: 'visual-search',
            image: capture,
          });
        }),
        
        // Search actions
        startVisualSearch: (query) => set((draft) => {
          draft.modalityStates.search.isActive = true;
          draft.modalityStates.search.isSearching = true;
          draft.modalityStates.search.error = null;
        }),
        
        processSearchResults: (results) => set((draft) => {
          draft.modalityStates.search.lastResults = results;
          draft.modalityStates.search.confidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
          draft.modalityStates.search.isSearching = false;
          
          // Enhance chat context with results
          const { triggerCrossModalCommunication } = get();
          triggerCrossModalCommunication('search', 'chat', {
            type: 'enhance-context',
            results,
          });
        }),
        
        // Text actions
        processTextInput: (input, context) => set((draft) => {
          draft.modalityStates.text.lastInput = input;
          draft.modalityStates.text.context = context;
        }),
        
        // Performance monitoring actions
        updatePerformanceMetrics: (metrics) => set((draft) => {
          Object.assign(draft.performance.metrics, metrics);
          
          // Check for performance alerts
          const { targets } = draft.performance;
          const alerts = [];
          
          if (metrics.latency && metrics.latency > targets.latency) {
            alerts.push({
              type: 'performance' as const,
              message: `High latency detected: ${metrics.latency}ms (target: ${targets.latency}ms)`,
            });
          }
          
          if (metrics.errorRate && metrics.errorRate > targets.errorRate) {
            alerts.push({
              type: 'error' as const,
              message: `High error rate detected: ${metrics.errorRate}% (target: ${targets.errorRate}%)`,
            });
          }
          
          if (metrics.throughput && metrics.throughput < targets.throughput) {
            alerts.push({
              type: 'performance' as const,
              message: `Low throughput detected: ${metrics.throughput}fps (target: ${targets.throughput}fps)`,
            });
          }
          
          // Add alerts
          alerts.forEach(alert => {
            draft.performance.alerts.push({
              id: `alert-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              ...alert,
            });
          });
        }),
        
        addPerformanceAlert: (alert) => set((draft) => {
          draft.performance.alerts.push({
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            ...alert,
          });
        }),
        
        clearPerformanceAlerts: () => set((draft) => {
          draft.performance.alerts = [];
        }),
        
        // User preferences actions
        updatePreferences: (preferences) => set((draft) => {
          Object.assign(draft.preferences, preferences);
        }),
        
        toggleProfessionalMode: () => set((draft) => {
          draft.preferences.professionalMode = !draft.preferences.professionalMode;
        }),
        
        toggleDebugMode: () => set((draft) => {
          draft.preferences.debugMode = !draft.preferences.debugMode;
        }),
        
        updateAccessibilitySettings: (settings) => set((draft) => {
          Object.assign(draft.preferences.accessibility, settings);
        }),
        
        // Error recovery actions
        setError: (errorType, errorMessage, recoveryOptions = ['retry', 'reset']) => set((draft) => {
          draft.errorRecovery.hasError = true;
          draft.errorRecovery.errorType = errorType;
          draft.errorRecovery.errorMessage = errorMessage;
          draft.errorRecovery.recoveryOptions = recoveryOptions;
          draft.systemState = 'error';
        }),
        
        clearError: () => set((draft) => {
          draft.errorRecovery.hasError = false;
          draft.errorRecovery.errorType = null;
          draft.errorRecovery.errorMessage = null;
          draft.errorRecovery.recoveryOptions = [];
          if (draft.systemState === 'error') {
            draft.systemState = 'ready';
          }
        }),
        
        attemptRecovery: (method) => set((draft) => {
          draft.systemState = 'recovery';
          
          switch (method) {
            case 'retry':
              // Reset error state and retry
              draft.errorRecovery.hasError = false;
              draft.systemState = 'ready';
              break;
            
            case 'reset':
              // Reset to initial state
              Object.assign(draft, initialState);
              draft.systemState = 'ready';
              break;
            
            case 'revert':
              // Revert to previous mode
              if (draft.previousMode) {
                draft.currentMode = draft.previousMode as VoiceAgentState['currentMode'];
              }
              draft.errorRecovery.hasError = false;
              draft.systemState = 'ready';
              break;
          }
        }),
        
        // Coordination actions
        registerOrganism: (organismId) => set((draft) => {
          if (!draft.coordination.activeOrganisms.includes(organismId)) {
            draft.coordination.activeOrganisms.push(organismId);
          }
        }),
        
        unregisterOrganism: (organismId) => set((draft) => {
          draft.coordination.activeOrganisms = draft.coordination.activeOrganisms.filter((id: string) => id !== organismId);
        }),
        
        updateCoordinationLatency: (latency) => set((draft) => {
          draft.coordination.latency.current = latency;
          
          // Update average (simple moving average)
          const alpha = 0.1; // Smoothing factor
          draft.coordination.latency.average = (1 - alpha) * draft.coordination.latency.average + alpha * latency;
        }),
        
        recordCoordinationError: (error) => set((draft) => {
          draft.coordination.errors.count += 1;
          draft.coordination.errors.recent.push({
            error,
            timestamp: Date.now(),
          });
          
          // Keep only last 50 errors
          if (draft.coordination.errors.recent.length > 50) {
            draft.coordination.errors.recent = draft.coordination.errors.recent.slice(-50);
          }
        }),
      })),
      {
        name: 'voice-agent-store',
        partialize: (state) => ({
          preferences: state.preferences,
          currentMode: state.currentMode,
        }),
      }
    ),
    {
      name: 'voice-agent-store',
    }
  )
);

// Selectors for commonly used state
export const useSystemState = () => useVoiceAgent(state => state.systemState);
export const useCurrentMode = () => useVoiceAgent(state => state.currentMode);
export const useModalityStates = () => useVoiceAgent(state => state.modalityStates);
export const usePerformanceMetrics = () => useVoiceAgent(state => state.performance.metrics);
export const useCoordinationState = () => useVoiceAgent(state => state.coordination);
export const useErrorState = () => useVoiceAgent(state => state.errorRecovery);
export const usePreferences = () => useVoiceAgent(state => state.preferences);

// Action selectors
export const useVoiceActions = () => useVoiceAgent(state => ({
  startVoiceListening: state.startVoiceListening,
  stopVoiceListening: state.stopVoiceListening,
  processVoiceInput: state.processVoiceInput,
}));

export const useCameraActions = () => useVoiceAgent(state => ({
  startCameraCapture: state.startCameraCapture,
  stopCameraCapture: state.stopCameraCapture,
  processCameraCapture: state.processCameraCapture,
}));

export const useSearchActions = () => useVoiceAgent(state => ({
  startVisualSearch: state.startVisualSearch,
  processSearchResults: state.processSearchResults,
}));

export const useCoordinationActions = () => useVoiceAgent(state => ({
  triggerCrossModalCommunication: state.triggerCrossModalCommunication,
  registerOrganism: state.registerOrganism,
  unregisterOrganism: state.unregisterOrganism,
  updateCoordinationLatency: state.updateCoordinationLatency,
}));

export const useErrorActions = () => useVoiceAgent(state => ({
  setError: state.setError,
  clearError: state.clearError,
  attemptRecovery: state.attemptRecovery,
}));

export const usePerformanceActions = () => useVoiceAgent(state => ({
  updatePerformanceMetrics: state.updatePerformanceMetrics,
  addPerformanceAlert: state.addPerformanceAlert,
  clearPerformanceAlerts: state.clearPerformanceAlerts,
})); 