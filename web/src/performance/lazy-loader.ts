/**
 * Advanced Lazy Loading System
 * 
 * Implements dynamic module loading with intelligent preloading strategies
 * Optimizes initial bundle size and runtime performance
 */

export interface LazyLoadOptions {
  preload?: boolean;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
  retryAttempts?: number;
  fallback?: () => Promise<any>;
  onLoad?: (module: any) => void;
  onError?: (error: Error) => void;
}

export interface ModuleDefinition {
  name: string;
  importFn: () => Promise<any>;
  dependencies?: string[];
  preloadCondition?: () => boolean;
  criticalPath?: boolean;
}

export interface PreloadStrategy {
  type: 'immediate' | 'idle' | 'viewport' | 'interaction' | 'custom';
  condition?: () => boolean;
  delay?: number;
}

// Module registry for tracking loaded modules
const moduleRegistry = new Map<string, {
  module: any;
  loading: Promise<any> | null;
  loaded: boolean;
  error: Error | null;
  loadTime: number;
  lastAccessed: number;
}>();

// Preload queue with priority handling
const preloadQueue: Array<{ module: ModuleDefinition; priority: number; timestamp: number }> = [];
let isPreloading = false;

/**
 * Core lazy loading function with advanced features
 */
export async function lazyLoad<T = any>(
  moduleDefinition: ModuleDefinition,
  options: LazyLoadOptions = {}
): Promise<T> {
  const startTime = performance.now();
  const { timeout = 5000, retryAttempts = 2, fallback, onLoad, onError } = options;
  
  // Check if module is already loaded
  const existing = moduleRegistry.get(moduleDefinition.name);
  if (existing?.loaded) {
    existing.lastAccessed = Date.now();
    return existing.module;
  }
  
  // Check if module is currently loading
  if (existing?.loading) {
    try {
      const module = await existing.loading;
      existing.lastAccessed = Date.now();
      return module;
    } catch (error) {
      // Continue to retry logic below
    }
  }
  
  // Load dependencies first
  if (moduleDefinition.dependencies?.length) {
    await loadDependencies(moduleDefinition.dependencies);
  }
  
  // Create loading promise with timeout and retry logic
  const loadingPromise = withRetry(
    () => withTimeout(moduleDefinition.importFn(), timeout),
    retryAttempts
  );
  
  // Register loading promise
  moduleRegistry.set(moduleDefinition.name, {
    module: null,
    loading: loadingPromise,
    loaded: false,
    error: null,
    loadTime: 0,
    lastAccessed: Date.now()
  });
  
  try {
    const module = await loadingPromise;
    const loadTime = performance.now() - startTime;
    
    // Update registry
    moduleRegistry.set(moduleDefinition.name, {
      module,
      loading: null,
      loaded: true,
      error: null,
      loadTime,
      lastAccessed: Date.now()
    });
    
    onLoad?.(module);
    
    // Track performance
    trackModulePerformance(moduleDefinition.name, loadTime, true);
    
    return module;
    
  } catch (error) {
    const loadTime = performance.now() - startTime;
    
    // Update registry with error
    moduleRegistry.set(moduleDefinition.name, {
      module: null,
      loading: null,
      loaded: false,
      error: error as Error,
      loadTime,
      lastAccessed: Date.now()
    });
    
    onError?.(error as Error);
    
    // Track performance
    trackModulePerformance(moduleDefinition.name, loadTime, false);
    
    // Try fallback if available
    if (fallback) {
      try {
        const fallbackModule = await fallback();
        return fallbackModule;
      } catch (fallbackError) {
        throw new Error(`Module loading failed and fallback failed: ${(fallbackError as Error).message}`);
      }
    }
    
    throw error;
  }
}

/**
 * Load module dependencies recursively
 */
async function loadDependencies(dependencies: string[]): Promise<void> {
  const loadPromises = dependencies.map(async (depName) => {
    const existing = moduleRegistry.get(depName);
    if (existing?.loaded) return;
    
    // This would typically use a dependency registry
    // For now, we'll assume dependencies are handled externally
    console.warn(`Dependency ${depName} should be loaded first`);
  });
  
  await Promise.all(loadPromises);
}

/**
 * Timeout wrapper for promises
 */
function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Module loading timeout after ${timeout}ms`)), timeout);
    })
  ]);
}

/**
 * Retry wrapper for promises
 */
async function withRetry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Performance tracking
 */
const performanceMetrics = {
  totalLoads: 0,
  successfulLoads: 0,
  failedLoads: 0,
  averageLoadTime: 0,
  totalLoadTime: 0,
  moduleStats: new Map<string, { loads: number; totalTime: number; failures: number }>()
};

function trackModulePerformance(moduleName: string, loadTime: number, success: boolean): void {
  performanceMetrics.totalLoads++;
  performanceMetrics.totalLoadTime += loadTime;
  performanceMetrics.averageLoadTime = performanceMetrics.totalLoadTime / performanceMetrics.totalLoads;
  
  if (success) {
    performanceMetrics.successfulLoads++;
  } else {
    performanceMetrics.failedLoads++;
  }
  
  // Track per-module stats
  const moduleStats = performanceMetrics.moduleStats.get(moduleName) || { loads: 0, totalTime: 0, failures: 0 };
  moduleStats.loads++;
  moduleStats.totalTime += loadTime;
  if (!success) moduleStats.failures++;
  performanceMetrics.moduleStats.set(moduleName, moduleStats);
}

/**
 * Intelligent preloading system
 */
export class PreloadManager {
  private preloadStrategies: Map<string, PreloadStrategy> = new Map();
  private preloadedModules: Set<string> = new Set();
  private observerInstances: Map<string, IntersectionObserver> = new Map();
  
  /**
   * Register a module for preloading
   */
  public registerPreload(moduleDefinition: ModuleDefinition, strategy: PreloadStrategy): void {
    this.preloadStrategies.set(moduleDefinition.name, strategy);
    
    switch (strategy.type) {
      case 'immediate':
        this.preloadImmediate(moduleDefinition);
        break;
        
      case 'idle':
        this.preloadOnIdle(moduleDefinition, strategy.delay);
        break;
        
      case 'viewport':
        this.preloadOnViewport(moduleDefinition);
        break;
        
      case 'interaction':
        this.preloadOnInteraction(moduleDefinition);
        break;
        
      case 'custom':
        if (strategy.condition) {
          this.preloadOnCondition(moduleDefinition, strategy.condition);
        }
        break;
    }
  }
  
  private preloadImmediate(moduleDefinition: ModuleDefinition): void {
    this.executePreload(moduleDefinition, 'high');
  }
  
  private preloadOnIdle(moduleDefinition: ModuleDefinition, delay: number = 0): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(() => this.executePreload(moduleDefinition, 'low'), delay);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.executePreload(moduleDefinition, 'low'), 100 + delay);
    }
  }
  
  private preloadOnViewport(moduleDefinition: ModuleDefinition): void {
    // Create intersection observer for viewport-based preloading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.executePreload(moduleDefinition, 'medium');
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    
    this.observerInstances.set(moduleDefinition.name, observer);
    
    // Observe relevant elements (this would be configured based on use case)
    const targetElements = document.querySelectorAll('[data-preload-trigger]');
    targetElements.forEach(el => observer.observe(el));
  }
  
  private preloadOnInteraction(moduleDefinition: ModuleDefinition): void {
    const preloadOnce = () => {
      this.executePreload(moduleDefinition, 'high');
      // Remove listeners after first interaction
      document.removeEventListener('mousedown', preloadOnce);
      document.removeEventListener('touchstart', preloadOnce);
      document.removeEventListener('keydown', preloadOnce);
    };
    
    document.addEventListener('mousedown', preloadOnce, { once: true, passive: true });
    document.addEventListener('touchstart', preloadOnce, { once: true, passive: true });
    document.addEventListener('keydown', preloadOnce, { once: true, passive: true });
  }
  
  private preloadOnCondition(moduleDefinition: ModuleDefinition, condition: () => boolean): void {
    const checkCondition = () => {
      if (condition()) {
        this.executePreload(moduleDefinition, 'medium');
      } else {
        // Check again after a delay
        setTimeout(checkCondition, 500);
      }
    };
    
    checkCondition();
  }
  
  private async executePreload(moduleDefinition: ModuleDefinition, priority: 'low' | 'medium' | 'high'): Promise<void> {
    if (this.preloadedModules.has(moduleDefinition.name)) {
      return; // Already preloaded
    }
    
    this.preloadedModules.add(moduleDefinition.name);
    
    try {
      await lazyLoad(moduleDefinition, { 
        priority, 
        onLoad: () => console.log(`Preloaded module: ${moduleDefinition.name}`),
        onError: (error) => console.warn(`Preload failed for ${moduleDefinition.name}:`, error)
      });
    } catch (error) {
      // Remove from preloaded set if failed
      this.preloadedModules.delete(moduleDefinition.name);
      console.warn(`Preload failed for ${moduleDefinition.name}:`, error);
    }
  }
  
  /**
   * Cleanup observers and listeners
   */
  public dispose(): void {
    this.observerInstances.forEach(observer => observer.disconnect());
    this.observerInstances.clear();
    this.preloadStrategies.clear();
    this.preloadedModules.clear();
  }
}

/**
 * Camera and Voice Module Definitions
 */
export const CAMERA_MODULES: Record<string, ModuleDefinition> = {
  advancedCameraWidget: {
    name: 'advancedCameraWidget',
    importFn: () => import('../components/messaging/advancedcamerawidget'),
    criticalPath: true,
    preloadCondition: () => navigator.mediaDevices?.getUserMedia !== undefined
  },
  
  cameraPermissionFlow: {
    name: 'cameraPermissionFlow',
    importFn: () => import('../components/messaging/camerapermissionflow'),
    dependencies: ['advancedCameraWidget'],
    criticalPath: true
  },
  
  cameraFeedDisplay: {
    name: 'cameraFeedDisplay',
    importFn: () => import('../components/messaging/camerafeeddisplay'),
    dependencies: ['advancedCameraWidget'],
    criticalPath: false
  },
  
  captureInterface: {
    name: 'captureInterface',
    importFn: () => import('../components/messaging/captureinterface'),
    dependencies: ['cameraFeedDisplay'],
    criticalPath: false
  },
  
  visualAnalysisDisplay: {
    name: 'visualAnalysisDisplay',
    importFn: () => import('../components/messaging/visualanalysisdisplay'),
    dependencies: ['captureInterface'],
    criticalPath: false
  },
  
  accessibilityFusionLayer: {
    name: 'accessibilityFusionLayer',
    importFn: () => import('../components/messaging/accessibilityfusionlayer'),
    criticalPath: true,
    preloadCondition: () => true // Always needed for accessibility
  }
};

export const VOICE_MODULES: Record<string, ModuleDefinition> = {
  voiceProcessing: {
    name: 'voiceProcessing',
    importFn: () => import('../audio/userealtime'),
    criticalPath: true,
    preloadCondition: () => 'AudioContext' in window
  },
  
  voiceSettings: {
    name: 'voiceSettings',
    importFn: () => import('../components/messaging/voicesettings'),
    dependencies: ['voiceProcessing'],
    criticalPath: false
  },
  
  voiceInput: {
    name: 'voiceInput',
    importFn: () => import('../components/messaging/voiceinput'),
    dependencies: ['voiceProcessing'],
    criticalPath: false
  }
};

// Global preload manager instance
export const preloadManager = new PreloadManager();

/**
 * Initialize camera modules with intelligent preloading
 */
export function initializeCameraModules(): void {
  // Critical path modules - preload immediately
  preloadManager.registerPreload(CAMERA_MODULES.advancedCameraWidget, { type: 'immediate' });
  preloadManager.registerPreload(CAMERA_MODULES.accessibilityFusionLayer, { type: 'immediate' });
  
  // Permission flow - preload on interaction
  preloadManager.registerPreload(CAMERA_MODULES.cameraPermissionFlow, { type: 'interaction' });
  
  // Display and capture - preload on idle
  preloadManager.registerPreload(CAMERA_MODULES.cameraFeedDisplay, { type: 'idle', delay: 100 });
  preloadManager.registerPreload(CAMERA_MODULES.captureInterface, { type: 'idle', delay: 200 });
  
  // Analysis - preload when camera is active
  preloadManager.registerPreload(CAMERA_MODULES.visualAnalysisDisplay, {
    type: 'custom',
    condition: () => document.querySelector('video[autoplay]') !== null
  });
}

/**
 * Initialize voice modules with intelligent preloading
 */
export function initializeVoiceModules(): void {
  // Core voice processing - preload immediately if supported
  preloadManager.registerPreload(VOICE_MODULES.voiceProcessing, {
    type: 'custom',
    condition: () => 'AudioContext' in window && navigator.mediaDevices?.getUserMedia !== undefined
  });
  
  // Voice UI components - preload on interaction
  preloadManager.registerPreload(VOICE_MODULES.voiceSettings, { type: 'interaction' });
  preloadManager.registerPreload(VOICE_MODULES.voiceInput, { type: 'interaction' });
}

/**
 * Get performance metrics for lazy loading
 */
export function getLazyLoadPerformanceMetrics(): typeof performanceMetrics & {
  moduleRegistry: Map<string, any>;
  preloadedModules: Set<string>;
} {
  return {
    ...performanceMetrics,
    moduleRegistry: new Map(moduleRegistry),
    preloadedModules: new Set(preloadManager['preloadedModules'])
  };
}

/**
 * Utility functions for common lazy loading patterns
 */

export const lazyCamera = () => lazyLoad(CAMERA_MODULES.advancedCameraWidget);
export const lazyVoice = () => lazyLoad(VOICE_MODULES.voiceProcessing);
export const lazyAccessibility = () => lazyLoad(CAMERA_MODULES.accessibilityFusionLayer);

/**
 * Component-level lazy loading HOC
 */
export function withLazyLoading<T extends React.ComponentType<any>>(
  moduleDefinition: ModuleDefinition,
  fallbackComponent?: React.ComponentType
): React.ComponentType {
  return React.lazy(async () => {
    const module = await lazyLoad(moduleDefinition);
    return { default: module.default || module };
  });
}
