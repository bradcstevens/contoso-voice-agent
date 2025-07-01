import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { AdvancedCameraWidget, AdvancedCameraWidgetRef } from './advancedcamerawidget';
import { VisualSearchInterface, VisualSearchInterfaceRef } from './visualsearchinterface';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './multimodalorchestrator.module.css';

// Multi-modal organism interfaces
interface ModalityState {
  type: 'voice' | 'camera' | 'text';
  isActive: boolean;
  isAvailable: boolean;
  confidence: number;
  lastActivity: number;
  inputData: any;
  processingTime: number;
  errorState: string | null;
}

interface ModalityConflict {
  conflictId: string;
  conflictingModalities: string[];
  conflictType: 'resource' | 'intent' | 'attention' | 'performance';
  priority: 'high' | 'medium' | 'low';
  resolutionStrategy: string;
  timestamp: number;
  resolved: boolean;
}

interface CrossModalSynchronization {
  syncId: string;
  involvedModalities: string[];
  syncType: 'state' | 'intent' | 'context' | 'feedback';
  syncData: any;
  syncTime: number;
  isComplete: boolean;
  errors: string[];
}

interface PerformanceOrchestration {
  totalLatency: number;
  modalityLatencies: Record<string, number>;
  throughput: number;
  resourceUtilization: Record<string, number>;
  slaCompliance: boolean;
  bottleneckModality: string | null;
  optimizationSuggestions: string[];
}

interface AccessibilityCoordination {
  primaryModality: string;
  fallbackModalities: string[];
  accessibilityMode: 'standard' | 'enhanced' | 'assistive';
  screenReaderAnnouncements: Map<string, string>;
  keyboardNavigationContext: string;
  focusManagement: {
    currentModality: string;
    focusStack: string[];
    trapActive: boolean;
  };
  wcagCompliance: {
    level: 'AA' | 'AAA';
    violations: any[];
    lastValidation: number;
  };
}

interface MultiModalOrchestratorState {
  modalities: Record<string, ModalityState>;
  activeModality: string | null;
  orchestrationMode: 'parallel' | 'sequential' | 'adaptive' | 'conflicted';
  conflicts: ModalityConflict[];
  synchronizations: CrossModalSynchronization[];
  performance: PerformanceOrchestration;
  accessibility: AccessibilityCoordination;
  userPreferences: {
    preferredModality: string;
    accessibilityEnhancements: boolean;
    performanceMode: 'balanced' | 'speed' | 'quality';
    conflictResolution: 'automatic' | 'manual';
  };
  orchestrationHistory: Array<{
    timestamp: number;
    event: string;
    modalities: string[];
    outcome: string;
    performance: any;
  }>;
}

interface MultiModalOrchestratorProps {
  className?: string;
  onModalityChange?: (modality: string, state: ModalityState) => void;
  onConflictResolved?: (conflict: ModalityConflict) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  onAccessibilityIssue?: (issue: string, severity: string) => void;
  enforceSLA?: boolean;
  accessibilityLevel?: 'AA' | 'AAA';
  orchestrationMode?: 'parallel' | 'sequential' | 'adaptive';
  performanceThresholds?: {
    maxLatency: number;
    maxResourceUsage: number;
    minThroughput: number;
  };
  voiceEndpoint?: string;
  enableVoiceModality?: boolean;
  enableCameraModality?: boolean;
  enableTextModality?: boolean;
  children?: React.ReactNode;
}

export interface MultiModalOrchestratorRef {
  // Orchestration controls
  activateModality: (modality: string) => Promise<void>;
  deactivateModality: (modality: string) => Promise<void>;
  switchPrimaryModality: (modality: string) => Promise<void>;
  
  // Conflict resolution
  resolveConflict: (conflictId: string, strategy?: string) => Promise<void>;
  getActiveConflicts: () => ModalityConflict[];
  
  // Performance monitoring
  getPerformanceMetrics: () => PerformanceOrchestration;
  optimizePerformance: () => Promise<void>;
  validateSLA: () => boolean;
  
  // Cross-modal coordination
  synchronizeModalities: (modalities: string[], data: any) => Promise<string>;
  broadcastToModalities: (message: any, exclude?: string[]) => void;
  
  // Accessibility coordination
  announceModalityChange: (message: string, priority?: 'polite' | 'assertive') => void;
  getAccessibilityContext: () => AccessibilityCoordination;
  auditAccessibilityCompliance: () => Promise<any[]>;
  
  // State management
  getOrchestratorState: () => MultiModalOrchestratorState;
  resetOrchestrator: () => void;
}

export const MultiModalOrchestrator = forwardRef<MultiModalOrchestratorRef, MultiModalOrchestratorProps>(
  ({ 
    className = '', 
    onModalityChange,
    onConflictResolved,
    onPerformanceMetric,
    onAccessibilityIssue,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    orchestrationMode = 'adaptive',
    performanceThresholds = {
      maxLatency: 3000,
      maxResourceUsage: 80,
      minThroughput: 10
    },
    voiceEndpoint = '/api/voice',
    enableVoiceModality = true,
    enableCameraModality = true,
    enableTextModality = true,
    children
  }, ref) => {
    
    // Component refs for organism coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const cameraWidgetRef = useRef<AdvancedCameraWidgetRef>(null);
    const visualSearchRef = useRef<VisualSearchInterfaceRef>(null);
    const voiceInterfaceRef = useRef<any>(null); // Will be implemented separately
    const textInterfaceRef = useRef<any>(null); // Will be implemented separately
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Performance tracking
    const orchestrationStartTime = useRef<number>(Date.now());
    const lastPerformanceCheck = useRef<number>(Date.now());
    const slaViolationCount = useRef<number>(0);
    
    // Multi-modal orchestrator state
    const [state, setState] = useState<MultiModalOrchestratorState>({
      modalities: {
        voice: {
          type: 'voice',
          isActive: false,
          isAvailable: enableVoiceModality,
          confidence: 0,
          lastActivity: 0,
          inputData: null,
          processingTime: 0,
          errorState: null
        },
        camera: {
          type: 'camera',
          isActive: false,
          isAvailable: enableCameraModality,
          confidence: 0,
          lastActivity: 0,
          inputData: null,
          processingTime: 0,
          errorState: null
        },
        text: {
          type: 'text',
          isActive: false,
          isAvailable: enableTextModality,
          confidence: 0,
          lastActivity: 0,
          inputData: null,
          processingTime: 0,
          errorState: null
        }
      },
      activeModality: null,
      orchestrationMode,
      conflicts: [],
      synchronizations: [],
      performance: {
        totalLatency: 0,
        modalityLatencies: {},
        throughput: 0,
        resourceUtilization: {},
        slaCompliance: true,
        bottleneckModality: null,
        optimizationSuggestions: []
      },
      accessibility: {
        primaryModality: 'camera', // Default to camera for visual interface
        fallbackModalities: ['voice', 'text'],
        accessibilityMode: 'enhanced',
        screenReaderAnnouncements: new Map(),
        keyboardNavigationContext: 'orchestrator',
        focusManagement: {
          currentModality: 'camera',
          focusStack: [],
          trapActive: false
        },
        wcagCompliance: {
          level: accessibilityLevel,
          violations: [],
          lastValidation: Date.now()
        }
      },
      userPreferences: {
        preferredModality: 'camera',
        accessibilityEnhancements: true,
        performanceMode: 'balanced',
        conflictResolution: 'automatic'
      },
      orchestrationHistory: []
    });
    
    // Cross-modal conflict detection and resolution
    const detectConflicts = useCallback((newModalityStates: Record<string, ModalityState>): ModalityConflict[] => {
      const conflicts: ModalityConflict[] = [];
      const activeModalities = Object.entries(newModalityStates)
        .filter(([_, modality]) => modality.isActive)
        .map(([name, _]) => name);
      
      // Resource conflicts (multiple modalities competing for CPU/GPU)
      if (activeModalities.length > 2) {
        conflicts.push({
          conflictId: `resource_${Date.now()}`,
          conflictingModalities: activeModalities,
          conflictType: 'resource',
          priority: 'high',
          resolutionStrategy: 'prioritize_highest_confidence',
          timestamp: Date.now(),
          resolved: false
        });
      }
      
      // Intent conflicts (ambiguous user intent across modalities)
      const highConfidenceModalities = activeModalities.filter(
        name => newModalityStates[name].confidence > 0.8
      );
      if (highConfidenceModalities.length > 1) {
        conflicts.push({
          conflictId: `intent_${Date.now()}`,
          conflictingModalities: highConfidenceModalities,
          conflictType: 'intent',
          priority: 'medium',
          resolutionStrategy: 'combine_inputs',
          timestamp: Date.now(),
          resolved: false
        });
      }
      
      // Performance conflicts (SLA violations)
      const totalLatency = Object.values(newModalityStates)
        .reduce((sum, modality) => sum + modality.processingTime, 0);
      if (totalLatency > performanceThresholds.maxLatency) {
        conflicts.push({
          conflictId: `performance_${Date.now()}`,
          conflictingModalities: activeModalities,
          conflictType: 'performance',
          priority: 'high',
          resolutionStrategy: 'optimize_slowest_modality',
          timestamp: Date.now(),
          resolved: false
        });
      }
      
      return conflicts;
    }, [performanceThresholds.maxLatency]);
    
    // Resolve conflicts automatically or manually
    const resolveConflict = useCallback(async (conflictId: string, strategy?: string) => {
      const conflict = state.conflicts.find(c => c.conflictId === conflictId);
      if (!conflict || conflict.resolved) return;
      
      const resolutionStrategy = strategy || conflict.resolutionStrategy;
      
      try {
        switch (resolutionStrategy) {
          case 'prioritize_highest_confidence':
            // Deactivate lower confidence modalities
            const highestConfidence = Math.max(
              ...conflict.conflictingModalities.map(name => state.modalities[name].confidence)
            );
            const primaryModality = conflict.conflictingModalities.find(
              name => state.modalities[name].confidence === highestConfidence
            );
            
            if (primaryModality) {
              await switchPrimaryModality(primaryModality);
              conflict.conflictingModalities
                .filter(name => name !== primaryModality)
                .forEach(name => deactivateModality(name));
            }
            break;
            
          case 'combine_inputs':
            // Create cross-modal synchronization
            await synchronizeModalities(
              conflict.conflictingModalities,
              { type: 'intent_combination', timestamp: Date.now() }
            );
            break;
            
          case 'optimize_slowest_modality':
            // Optimize performance of slowest modality
            await optimizePerformance();
            break;
        }
        
        // Mark conflict as resolved
        setState(prev => ({
          ...prev,
          conflicts: prev.conflicts.map(c => 
            c.conflictId === conflictId ? { ...c, resolved: true } : c
          ),
          orchestrationHistory: [
            ...prev.orchestrationHistory,
            {
              timestamp: Date.now(),
              event: 'conflict_resolved',
              modalities: conflict.conflictingModalities,
              outcome: `Resolved using ${resolutionStrategy}`,
              performance: prev.performance
            }
          ]
        }));
        
        onConflictResolved?.(conflict);
        announceModalityChange(`Conflict resolved: ${resolutionStrategy}`, 'polite');
        
      } catch (error) {
        console.error('[MultiModalOrchestrator] Conflict resolution failed:', error);
        onAccessibilityIssue?.(`Conflict resolution failed: ${error}`, 'high');
      }
    }, [state.conflicts, state.modalities, onConflictResolved, onAccessibilityIssue]);
    
    // Cross-modal synchronization
    const synchronizeModalities = useCallback(async (
      modalities: string[], 
      data: any
    ): Promise<string> => {
      const syncId = `sync_${Date.now()}`;
      const syncStart = Date.now();
      
      try {
        const synchronization: CrossModalSynchronization = {
          syncId,
          involvedModalities: modalities,
          syncType: data.type || 'state',
          syncData: data,
          syncTime: syncStart,
          isComplete: false,
          errors: []
        };
        
        setState(prev => ({
          ...prev,
          synchronizations: [...prev.synchronizations, synchronization]
        }));
        
        // Perform synchronization based on type
        switch (data.type) {
          case 'state':
            // Synchronize state across modalities
            modalities.forEach(modalityName => {
              const modality = state.modalities[modalityName];
              if (modality && modality.isActive) {
                // Update modality state
                setState(prev => ({
                  ...prev,
                  modalities: {
                    ...prev.modalities,
                    [modalityName]: {
                      ...prev.modalities[modalityName],
                      lastActivity: Date.now(),
                      inputData: data.syncData
                    }
                  }
                }));
              }
            });
            break;
            
          case 'intent_combination':
            // Combine intents from multiple modalities
            const combinedIntent = modalities.reduce((combined, modalityName) => {
              const modality = state.modalities[modalityName];
              if (modality && modality.inputData) {
                combined[modalityName] = {
                  data: modality.inputData,
                  confidence: modality.confidence,
                  timestamp: modality.lastActivity
                };
              }
              return combined;
            }, {} as any);
            
            // Process combined intent
            console.log('[MultiModalOrchestrator] Combined intent:', combinedIntent);
            break;
            
          case 'context':
            // Share context across modalities
            broadcastToModalities({
              type: 'context_update',
              context: data.context,
              timestamp: Date.now()
            });
            break;
            
          case 'feedback':
            // Provide feedback across modalities
            broadcastToModalities({
              type: 'feedback',
              feedback: data.feedback,
              timestamp: Date.now()
            });
            break;
        }
        
        // Mark synchronization as complete
        const syncDuration = Date.now() - syncStart;
        setState(prev => ({
          ...prev,
          synchronizations: prev.synchronizations.map(s => 
            s.syncId === syncId ? { ...s, isComplete: true, syncTime: syncDuration } : s
          )
        }));
        
        onPerformanceMetric?.('sync_duration', syncDuration);
        return syncId;
        
      } catch (error) {
        console.error('[MultiModalOrchestrator] Synchronization failed:', error);
        setState(prev => ({
          ...prev,
          synchronizations: prev.synchronizations.map(s => 
            s.syncId === syncId ? { ...s, errors: [...s.errors, error.message] } : s
          )
        }));
        throw error;
      }
    }, [state.modalities, onPerformanceMetric]);
    
    // Broadcast messages to modalities
    const broadcastToModalities = useCallback((message: any, exclude: string[] = []) => {
      Object.keys(state.modalities).forEach(modalityName => {
        if (exclude.includes(modalityName)) return;
        
        const modality = state.modalities[modalityName];
        if (!modality.isActive) return;
        
        // Send message to specific modality
        switch (modalityName) {
          case 'camera':
            // Send to camera widget
            if (cameraWidgetRef.current) {
              console.log('[MultiModalOrchestrator] Broadcasting to camera:', message);
            }
            break;
            
          case 'voice':
            // Send to voice interface
            if (voiceInterfaceRef.current) {
              console.log('[MultiModalOrchestrator] Broadcasting to voice:', message);
            }
            break;
            
          case 'text':
            // Send to text interface
            if (textInterfaceRef.current) {
              console.log('[MultiModalOrchestrator] Broadcasting to text:', message);
            }
            break;
        }
      });
    }, [state.modalities]);
    
    // Activate specific modality
    const activateModality = useCallback(async (modality: string) => {
      const activationStart = Date.now();
      
      try {
        if (!state.modalities[modality]?.isAvailable) {
          throw new Error(`Modality ${modality} is not available`);
        }
        
        setState(prev => ({
          ...prev,
          modalities: {
            ...prev.modalities,
            [modality]: {
              ...prev.modalities[modality],
              isActive: true,
              lastActivity: Date.now(),
              processingTime: 0,
              errorState: null
            }
          },
          orchestrationHistory: [
            ...prev.orchestrationHistory,
            {
              timestamp: Date.now(),
              event: 'modality_activated',
              modalities: [modality],
              outcome: 'success',
              performance: { activationTime: Date.now() - activationStart }
            }
          ]
        }));
        
        // Activate specific modality component
        switch (modality) {
          case 'camera':
            // Camera widget is always active
            break;
          case 'voice':
            // Activate voice interface
            break;
          case 'text':
            // Activate text interface
            break;
        }
        
        const activationTime = Date.now() - activationStart;
        onPerformanceMetric?.('modality_activation_time', activationTime);
        onModalityChange?.(modality, state.modalities[modality]);
        
        announceModalityChange(`${modality} modality activated`, 'polite');
        
      } catch (error) {
        setState(prev => ({
          ...prev,
          modalities: {
            ...prev.modalities,
            [modality]: {
              ...prev.modalities[modality],
              errorState: error.message
            }
          }
        }));
        
        onAccessibilityIssue?.(`Failed to activate ${modality}: ${error.message}`, 'medium');
        throw error;
      }
    }, [state.modalities, onPerformanceMetric, onModalityChange, onAccessibilityIssue]);
    
    // Deactivate specific modality
    const deactivateModality = useCallback(async (modality: string) => {
      setState(prev => ({
        ...prev,
        modalities: {
          ...prev.modalities,
          [modality]: {
            ...prev.modalities[modality],
            isActive: false,
            confidence: 0,
            inputData: null,
            errorState: null
          }
        },
        orchestrationHistory: [
          ...prev.orchestrationHistory,
          {
            timestamp: Date.now(),
            event: 'modality_deactivated',
            modalities: [modality],
            outcome: 'success',
            performance: {}
          }
        ]
      }));
      
      onModalityChange?.(modality, state.modalities[modality]);
      announceModalityChange(`${modality} modality deactivated`, 'polite');
    }, [state.modalities, onModalityChange]);
    
    // Switch primary modality
    const switchPrimaryModality = useCallback(async (modality: string) => {
      if (!state.modalities[modality]?.isAvailable) {
        throw new Error(`Cannot switch to unavailable modality: ${modality}`);
      }
      
      const previousPrimary = state.accessibility.primaryModality;
      
      setState(prev => ({
        ...prev,
        activeModality: modality,
        accessibility: {
          ...prev.accessibility,
          primaryModality: modality,
          keyboardNavigationContext: modality,
          focusManagement: {
            ...prev.accessibility.focusManagement,
            currentModality: modality,
            focusStack: [modality, ...prev.accessibility.focusManagement.focusStack.filter(m => m !== modality)]
          }
        }
      }));
      
      // Ensure the new primary modality is active
      if (!state.modalities[modality].isActive) {
        await activateModality(modality);
      }
      
      // Focus the appropriate component
      switch (modality) {
        case 'camera':
          cameraWidgetRef.current?.focusLandmark?.('main');
          break;
        case 'voice':
          voiceInterfaceRef.current?.focus?.();
          break;
        case 'text':
          textInterfaceRef.current?.focus?.();
          break;
      }
      
      announceModalityChange(
        `Primary modality switched from ${previousPrimary} to ${modality}`, 
        'assertive'
      );
    }, [state.modalities, state.accessibility.primaryModality, activateModality]);
    
    // Performance optimization
    const optimizePerformance = useCallback(async () => {
      const optimizationStart = Date.now();
      
      try {
        // Identify bottleneck modality
        const modalityLatencies = Object.entries(state.modalities)
          .filter(([_, modality]) => modality.isActive)
          .map(([name, modality]) => ({ name, latency: modality.processingTime }))
          .sort((a, b) => b.latency - a.latency);
        
        const bottleneck = modalityLatencies[0];
        
        setState(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            bottleneckModality: bottleneck?.name || null,
            optimizationSuggestions: [
              `Optimize ${bottleneck?.name} modality (${bottleneck?.latency}ms latency)`,
              'Consider reducing concurrent modality processing',
              'Enable performance mode for better resource allocation'
            ]
          }
        }));
        
        // Apply optimizations
        if (bottleneck && bottleneck.latency > performanceThresholds.maxLatency / 2) {
          // Temporarily reduce quality for faster processing
          console.log(`[MultiModalOrchestrator] Optimizing ${bottleneck.name} modality`);
        }
        
        const optimizationTime = Date.now() - optimizationStart;
        onPerformanceMetric?.('optimization_time', optimizationTime);
        
      } catch (error) {
        console.error('[MultiModalOrchestrator] Performance optimization failed:', error);
      }
    }, [state.modalities, state.performance, performanceThresholds.maxLatency, onPerformanceMetric]);
    
    // Accessibility announcements
    const announceModalityChange = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute('aria-live', priority);
        announcementRef.current.textContent = message;
        
        // Clear announcement after reading
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
      
      // Update accessibility context
      setState(prev => ({
        ...prev,
        accessibility: {
          ...prev.accessibility,
          screenReaderAnnouncements: new Map(prev.accessibility.screenReaderAnnouncements)
            .set(Date.now().toString(), message)
        }
      }));
    }, []);
    
    // Orchestrator keyboard navigation
    const handleOrchestratorKeyboard = useCallback((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Tab':
          if (event.ctrlKey && event.altKey) {
            // Ctrl+Alt+Tab: Switch between modalities
            event.preventDefault();
            const availableModalities = Object.entries(state.modalities)
              .filter(([_, modality]) => modality.isAvailable)
              .map(([name, _]) => name);
            
            const currentIndex = availableModalities.indexOf(state.accessibility.primaryModality);
            const nextIndex = (currentIndex + 1) % availableModalities.length;
            const nextModality = availableModalities[nextIndex];
            
            switchPrimaryModality(nextModality);
          }
          break;
          
        case 'Escape':
          // Escape: Reset to default modality
          if (event.ctrlKey) {
            event.preventDefault();
            switchPrimaryModality(state.userPreferences.preferredModality);
          }
          break;
          
        case 'p':
          if (event.ctrlKey && event.altKey) {
            // Ctrl+Alt+P: Performance optimization
            event.preventDefault();
            optimizePerformance();
            announceModalityChange('Performance optimization initiated', 'polite');
          }
          break;
          
        case 's':
          if (event.ctrlKey && event.altKey) {
            // Ctrl+Alt+S: Synchronize all active modalities
            event.preventDefault();
            const activeModalities = Object.entries(state.modalities)
              .filter(([_, modality]) => modality.isActive)
              .map(([name, _]) => name);
            
            if (activeModalities.length > 1) {
              synchronizeModalities(activeModalities, {
                type: 'state',
                timestamp: Date.now()
              });
              announceModalityChange('Cross-modal synchronization initiated', 'polite');
            }
          }
          break;
      }
    }, [state.modalities, state.accessibility.primaryModality, state.userPreferences.preferredModality, 
        switchPrimaryModality, optimizePerformance, synchronizeModalities]);
    
    // Initialize orchestrator
    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('keydown', handleOrchestratorKeyboard);
        return () => container.removeEventListener('keydown', handleOrchestratorKeyboard);
      }
    }, [handleOrchestratorKeyboard]);
    
    // Monitor performance and conflicts
    useEffect(() => {
      const performanceInterval = setInterval(() => {
        const now = Date.now();
        
        // Update performance metrics
        const totalLatency = Object.values(state.modalities)
          .reduce((sum, modality) => sum + modality.processingTime, 0);
        
        const slaCompliance = totalLatency <= performanceThresholds.maxLatency;
        if (!slaCompliance) {
          slaViolationCount.current++;
        }
        
        setState(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            totalLatency,
            slaCompliance,
            modalityLatencies: Object.fromEntries(
              Object.entries(prev.modalities).map(([name, modality]) => [name, modality.processingTime])
            )
          }
        }));
        
        // Check for conflicts
        const newConflicts = detectConflicts(state.modalities);
        if (newConflicts.length > 0) {
          setState(prev => ({
            ...prev,
            conflicts: [...prev.conflicts, ...newConflicts]
          }));
          
          // Auto-resolve conflicts if enabled
          if (state.userPreferences.conflictResolution === 'automatic') {
            newConflicts.forEach(conflict => {
              resolveConflict(conflict.conflictId);
            });
          }
        }
        
        onPerformanceMetric?.('total_latency', totalLatency);
        onPerformanceMetric?.('sla_compliance', slaCompliance ? 1 : 0);
        
      }, 1000);
      
      return () => clearInterval(performanceInterval);
    }, [state.modalities, state.userPreferences.conflictResolution, 
        performanceThresholds.maxLatency, detectConflicts, resolveConflict, onPerformanceMetric]);
    
    // Expose orchestrator API
    useImperativeHandle(ref, () => ({
      activateModality,
      deactivateModality,
      switchPrimaryModality,
      resolveConflict,
      getActiveConflicts: () => state.conflicts.filter(c => !c.resolved),
      getPerformanceMetrics: () => ({ ...state.performance }),
      optimizePerformance,
      validateSLA: () => state.performance.slaCompliance,
      synchronizeModalities,
      broadcastToModalities,
      announceModalityChange,
      getAccessibilityContext: () => ({ ...state.accessibility }),
      auditAccessibilityCompliance: async () => {
        // Accessibility audit implementation
        return [];
      },
      getOrchestratorState: () => ({ ...state }),
      resetOrchestrator: () => {
        setState(prev => ({
          ...prev,
          conflicts: [],
          synchronizations: [],
          orchestrationHistory: [],
          performance: {
            ...prev.performance,
            totalLatency: 0,
            slaCompliance: true,
            bottleneckModality: null
          }
        }));
      }
    }));
    
    // Render orchestrator interface
    const renderModalityInterface = useMemo(() => {
      switch (state.accessibility.primaryModality) {
        case 'camera':
          return (
            <div className={styles.modalityContainer}>
              <AdvancedCameraWidget
                ref={cameraWidgetRef}
                accessibilityLevel={accessibilityLevel}
                enforceSLA={enforceSLA}
                onPerformanceMetric={onPerformanceMetric}
              />
            </div>
          );
          
        case 'voice':
          return (
            <div className={styles.modalityContainer}>
              <div className={styles.voicePlaceholder}>
                Voice Interface Component
                {/* Voice interface component will be integrated here */}
              </div>
            </div>
          );
          
        case 'text':
          return (
            <div className={styles.modalityContainer}>
              <div className={styles.textPlaceholder}>
                Text Interface Component
                {/* Text interface component will be integrated here */}
              </div>
            </div>
          );
          
        default:
          return null;
      }
    }, [state.accessibility.primaryModality, accessibilityLevel, enforceSLA, onPerformanceMetric]);
    
    return (
      <div 
        ref={containerRef}
        className={`${styles.multiModalOrchestrator} ${className}`}
        role="main"
        aria-labelledby="orchestrator-heading"
        tabIndex={-1}
        data-orchestration-mode={state.orchestrationMode}
        data-active-modality={state.accessibility.primaryModality}
      >
        {/* Orchestrator heading */}
        <h1 id="orchestrator-heading" className="sr-only">
          Multi-Modal Interface Orchestrator
        </h1>
        
        {/* Accessibility announcements */}
        <div 
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        
        {/* Orchestrator status bar */}
        <div className={styles.statusBar} role="status" aria-live="polite">
          <div className={styles.statusInfo}>
            <span className={styles.primaryModality}>
              Primary: {state.accessibility.primaryModality}
            </span>
            <span className={styles.activeModalities}>
              Active: {Object.entries(state.modalities)
                .filter(([_, modality]) => modality.isActive)
                .map(([name, _]) => name)
                .join(', ') || 'None'}
            </span>
            <span className={styles.performanceIndicator}>
              Latency: {state.performance.totalLatency}ms
              {state.performance.slaCompliance ? ' ✓' : ' ⚠️'}
            </span>
          </div>
          
          {state.conflicts.filter(c => !c.resolved).length > 0 && (
            <div className={styles.conflictIndicator} role="alert">
              {state.conflicts.filter(c => !c.resolved).length} conflicts detected
            </div>
          )}
        </div>
        
        {/* Modality selector */}
        <nav className={styles.modalitySelector} aria-label="Modality selection">
          {Object.entries(state.modalities).map(([name, modality]) => (
            <button
              key={name}
              className={`${styles.modalityButton} ${
                state.accessibility.primaryModality === name ? styles.active : ''
              } ${!modality.isAvailable ? styles.disabled : ''}`}
              onClick={() => modality.isAvailable && switchPrimaryModality(name)}
              disabled={!modality.isAvailable}
              aria-pressed={state.accessibility.primaryModality === name}
              aria-label={`Switch to ${name} modality ${modality.isActive ? '(active)' : '(inactive)'}`}
            >
              <span className={styles.modalityIcon}>
                {name === 'camera' && '📷'}
                {name === 'voice' && '🎤'}
                {name === 'text' && '💬'}
              </span>
              <span className={styles.modalityLabel}>{name}</span>
              {modality.isActive && <span className={styles.activeIndicator} />}
              {modality.errorState && <span className={styles.errorIndicator} />}
            </button>
          ))}
        </nav>
        
        {/* Accessibility fusion layer */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          accessibilityLevel={accessibilityLevel}
          performanceMode="organism"
        />
        
        {/* Primary modality interface */}
        <div className={styles.primaryInterface}>
          {renderModalityInterface}
        </div>
        
        {/* Performance monitoring panel */}
        {state.userPreferences.performanceMode !== 'balanced' && (
          <div className={styles.performancePanel} role="complementary">
            <h3>Performance Monitoring</h3>
            <div className={styles.performanceMetrics}>
              <div>Total Latency: {state.performance.totalLatency}ms</div>
              <div>SLA Compliance: {state.performance.slaCompliance ? 'Yes' : 'No'}</div>
              <div>Bottleneck: {state.performance.bottleneckModality || 'None'}</div>
              <div>Active Conflicts: {state.conflicts.filter(c => !c.resolved).length}</div>
            </div>
          </div>
        )}
        
        {/* Keyboard shortcuts help */}
        <div className={styles.keyboardHelp} role="complementary" aria-label="Keyboard shortcuts">
          <span className="sr-only">
            Keyboard shortcuts: Ctrl+Alt+Tab to switch modalities, 
            Ctrl+Alt+P for performance optimization, 
            Ctrl+Alt+S to synchronize modalities, 
            Ctrl+Escape to reset to preferred modality.
          </span>
        </div>
        
        {/* Additional content */}
        {children}
      </div>
    );
  }
);

MultiModalOrchestrator.displayName = 'MultiModalOrchestrator';

export default MultiModalOrchestrator; 