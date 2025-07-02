/**
 * Performance Optimization Suite - Main Entry Point
 * 
 * Integrates GPU rendering, Web Workers, lazy loading, caching, and load testing
 * Provides unified API for Task 1.5 performance optimization implementation
 */

// GPU Rendering
export {
  GPURenderer,
  gpuRenderer,
  processImageGPU,
  processVideoStreamGPU,
  type GPUProcessingOptions,
  type GPUProcessingResult
} from './gpu-renderer';

// Enhanced Web Workers
export {
  WCAGWorkerPool,
  wcagWorkerPool,
  validateWCAGAsync,
  type WCAGValidationTask,
  type WCAGValidationResult,
  type WorkerPoolOptions
} from './wcag-worker-pool';

// Lazy Loading
export {
  lazyLoad,
  PreloadManager,
  preloadManager,
  initializeCameraModules,
  initializeVoiceModules,
  getLazyLoadPerformanceMetrics,
  lazyCamera,
  lazyVoice,
  lazyAccessibility,
  withLazyLoading,
  CAMERA_MODULES,
  VOICE_MODULES,
  type ModuleDefinition,
  type LazyLoadOptions,
  type PreloadStrategy
} from './lazy-loader';

// Caching
export {
  cacheManager,
  cacheFrame,
  getCachedFrame,
  cacheWCAGValidation,
  getCachedWCAGValidation,
  cacheVisualAnalysis,
  getCachedVisualAnalysis,
  generateImageHash,
  MemoryCache,
  IndexedDBCache,
  CameraFrameCache,
  WCAGValidationCache,
  VisualAnalysisCache,
  CacheManager,
  type CacheEntry,
  type CacheOptions,
  type CacheStats
} from './cache-manager';

// Load Testing
export {
  LoadTester,
  loadTester,
  runQuickLoadTest,
  runStressTest,
  DEFAULT_LOAD_TEST_CONFIG,
  STRESS_TEST_CONFIG,
  type LoadTestConfig,
  type LoadTestResult,
  type LoadTestMetrics,
  type UserScenario
} from './load-tester';

/**
 * Performance Configuration
 */
export interface PerformanceConfig {
  gpu: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    targetFPS: number;
  };
  workers: {
    enabled: boolean;
    maxWorkers: number;
    timeout: number;
  };
  caching: {
    enabled: boolean;
    frameCache: boolean;
    wcagCache: boolean;
    analysisCache: boolean;
  };
  lazyLoading: {
    enabled: boolean;
    preloadCritical: boolean;
    preloadStrategy: 'immediate' | 'idle' | 'interaction';
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    performanceThresholds: {
      frameRate: number;
      latency: number;
      memoryUsage: number;
    };
  };
}

/**
 * Global Performance Metrics
 */
export interface GlobalPerformanceMetrics {
  timestamp: number;
  gpu: {
    enabled: boolean;
    fps: number;
    memoryUsage: number;
    processingTime: number;
  };
  workers: {
    activeWorkers: number;
    queuedTasks: number;
    completedTasks: number;
    averageProcessingTime: number;
    errorRate: number;
  };
  cache: {
    frameCache: { hitRate: number; size: number };
    wcagCache: { hitRate: number; size: number };
    analysisCache: { hitRate: number; size: number };
    totalMemoryUsage: number;
  };
  lazyLoading: {
    loadedModules: number;
    preloadedModules: number;
    averageLoadTime: number;
    failureRate: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    networkUsage: number;
  };
}

/**
 * Performance Orchestrator
 * 
 * Central coordinator for all performance optimization features
 */
export class PerformanceOrchestrator {
  private config: PerformanceConfig;
  private isInitialized = false;
  private metricsInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: GlobalPerformanceMetrics[] = [];
  
  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      gpu: {
        enabled: true,
        quality: 'high',
        targetFPS: 30,
        ...config.gpu
      },
      workers: {
        enabled: true,
        maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
        timeout: 200,
        ...config.workers
      },
      caching: {
        enabled: true,
        frameCache: true,
        wcagCache: true,
        analysisCache: true,
        ...config.caching
      },
      lazyLoading: {
        enabled: true,
        preloadCritical: true,
        preloadStrategy: 'idle',
        ...config.lazyLoading
      },
      monitoring: {
        enabled: true,
        metricsInterval: 5000, // 5 seconds
        performanceThresholds: {
          frameRate: 25, // Minimum acceptable FPS
          latency: 200,  // Maximum acceptable latency (ms)
          memoryUsage: 100 * 1024 * 1024 // 100MB threshold
        },
        ...config.monitoring
      }
    };
  }
  
  /**
   * Initialize all performance optimizations
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[Performance] Initializing optimization suite...');
    
    try {
      // Initialize GPU rendering
      if (this.config.gpu.enabled) {
        await this.initializeGPU();
      }
      
      // Initialize Web Workers
      if (this.config.workers.enabled) {
        await this.initializeWorkers();
      }
      
      // Initialize caching
      if (this.config.caching.enabled) {
        await this.initializeCaching();
      }
      
      // Initialize lazy loading
      if (this.config.lazyLoading.enabled) {
        await this.initializeLazyLoading();
      }
      
      // Start monitoring
      if (this.config.monitoring.enabled) {
        this.startMonitoring();
      }
      
      this.isInitialized = true;
      console.log('[Performance] Optimization suite initialized successfully');
      
    } catch (error) {
      console.error('[Performance] Initialization failed:', error);
      throw error;
    }
  }
  
  private async initializeGPU(): Promise<void> {
    try {
      // GPU renderer is auto-initialized
      const gpuMetrics = gpuRenderer.getPerformanceMetrics();
      console.log('[Performance] GPU rendering initialized:', gpuMetrics);
    } catch (error) {
      console.warn('[Performance] GPU initialization failed, falling back to CPU:', error);
      this.config.gpu.enabled = false;
    }
  }
  
  private async initializeWorkers(): Promise<void> {
    try {
      await wcagWorkerPool.initialize();
      console.log('[Performance] Web Workers pool initialized with', this.config.workers.maxWorkers, 'workers');
    } catch (error) {
      console.warn('[Performance] Workers initialization failed:', error);
      this.config.workers.enabled = false;
    }
  }
  
  private async initializeCaching(): Promise<void> {
    try {
      // Cache manager is auto-initialized
      const cacheStats = cacheManager.getGlobalStats();
      console.log('[Performance] Caching system initialized:', cacheStats);
    } catch (error) {
      console.warn('[Performance] Caching initialization failed:', error);
      this.config.caching.enabled = false;
    }
  }
  
  private async initializeLazyLoading(): Promise<void> {
    try {
      // Initialize module preloading based on strategy
      if (this.config.lazyLoading.preloadCritical) {
        initializeCameraModules();
        initializeVoiceModules();
      }
      
      const lazyMetrics = getLazyLoadPerformanceMetrics();
      console.log('[Performance] Lazy loading initialized:', lazyMetrics);
    } catch (error) {
      console.warn('[Performance] Lazy loading initialization failed:', error);
      this.config.lazyLoading.enabled = false;
    }
  }
  
  private startMonitoring(): void {
    // Start periodic metrics collection
    this.metricsInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 100 metrics entries
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
      
      // Check thresholds
      this.checkPerformanceThresholds(metrics);
      
    }, this.config.monitoring.metricsInterval);
    
    // Set up performance observer for detailed metrics
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('contoso-')) {
            console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }
  
  private collectMetrics(): GlobalPerformanceMetrics {
    const timestamp = Date.now();
    
    // GPU metrics
    const gpuMetrics = this.config.gpu.enabled ? gpuRenderer.getPerformanceMetrics() : {
      fps: 0, frameCount: 0, memoryUsage: 0, isProcessing: false
    };
    
    // Worker metrics
    const workerMetrics = this.config.workers.enabled ? wcagWorkerPool.getPerformanceMetrics() : {
      totalWorkers: 0, availableWorkers: 0, busyWorkers: 0, queuedTasks: 0,
      completedTasks: 0, averageProcessingTime: 0, errorRate: 0
    };
    
    // Cache metrics
    const cacheStats = this.config.caching.enabled ? cacheManager.getGlobalStats() : {
      frameCache: { hitRate: 0, currentSize: 0 },
      wcagCache: { hitRate: 0, currentSize: 0 },
      analysisCache: { hitRate: 0, currentSize: 0 },
      totalMemoryUsage: 0
    };
    
    // Lazy loading metrics
    const lazyMetrics = this.config.lazyLoading.enabled ? getLazyLoadPerformanceMetrics() : {
      totalLoads: 0, successfulLoads: 0, failedLoads: 0, averageLoadTime: 0,
      moduleRegistry: new Map(), preloadedModules: new Set()
    };
    
    return {
      timestamp,
      gpu: {
        enabled: this.config.gpu.enabled,
        fps: gpuMetrics.fps,
        memoryUsage: gpuMetrics.memoryUsage,
        processingTime: 0 // Would need to track this
      },
      workers: {
        activeWorkers: workerMetrics.totalWorkers - workerMetrics.availableWorkers,
        queuedTasks: workerMetrics.queuedTasks,
        completedTasks: workerMetrics.completedTasks,
        averageProcessingTime: workerMetrics.averageProcessingTime,
        errorRate: workerMetrics.errorRate
      },
      cache: {
        frameCache: {
          hitRate: cacheStats.frameCache.hitRate || 0,
          size: cacheStats.frameCache.currentSize || 0
        },
        wcagCache: {
          hitRate: cacheStats.wcagCache.hitRate || 0,
          size: cacheStats.wcagCache.currentSize || 0
        },
        analysisCache: {
          hitRate: cacheStats.analysisCache.hitRate || 0,
          size: cacheStats.analysisCache.currentSize || 0
        },
        totalMemoryUsage: cacheStats.totalMemoryUsage
      },
      lazyLoading: {
        loadedModules: lazyMetrics.moduleRegistry.size,
        preloadedModules: lazyMetrics.preloadedModules.size,
        averageLoadTime: lazyMetrics.averageLoadTime,
        failureRate: lazyMetrics.totalLoads > 0 ? lazyMetrics.failedLoads / lazyMetrics.totalLoads : 0
      },
      system: {
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: 0, // Would need more sophisticated monitoring
        networkUsage: 0 // Would need more sophisticated monitoring
      }
    };
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
  
  private checkPerformanceThresholds(metrics: GlobalPerformanceMetrics): void {
    const thresholds = this.config.monitoring.performanceThresholds;
    
    // Check frame rate
    if (this.config.gpu.enabled && metrics.gpu.fps < thresholds.frameRate) {
      console.warn(`[Performance] Low frame rate: ${metrics.gpu.fps} FPS (threshold: ${thresholds.frameRate})`);
    }
    
    // Check memory usage
    if (metrics.cache.totalMemoryUsage > thresholds.memoryUsage) {
      console.warn(`[Performance] High memory usage: ${(metrics.cache.totalMemoryUsage / 1024 / 1024).toFixed(2)}MB (threshold: ${(thresholds.memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // Check worker latency
    if (metrics.workers.averageProcessingTime > thresholds.latency) {
      console.warn(`[Performance] High worker latency: ${metrics.workers.averageProcessingTime}ms (threshold: ${thresholds.latency}ms)`);
    }
  }
  
  /**
   * Get current performance configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }
  
  /**
   * Update performance configuration
   */
  public async updateConfig(newConfig: Partial<PerformanceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isInitialized) {
      // Reinitialize if needed
      await this.initialize();
    }
  }
  
  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): GlobalPerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }
  
  /**
   * Get historical performance metrics
   */
  public getHistoricalMetrics(limit: number = 50): GlobalPerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }
  
  /**
   * Run performance benchmark
   */
  public async runBenchmark(): Promise<{
    gpu: any;
    workers: any;
    cache: any;
    lazyLoading: any;
    overallScore: number;
  }> {
    console.log('[Performance] Running benchmark...');
    
    const benchmark = {
      gpu: await this.benchmarkGPU(),
      workers: await this.benchmarkWorkers(),
      cache: await this.benchmarkCache(),
      lazyLoading: await this.benchmarkLazyLoading(),
      overallScore: 0
    };
    
    // Calculate overall score (0-100)
    benchmark.overallScore = (
      benchmark.gpu.score * 0.3 +
      benchmark.workers.score * 0.25 +
      benchmark.cache.score * 0.25 +
      benchmark.lazyLoading.score * 0.2
    );
    
    console.log('[Performance] Benchmark complete. Overall score:', benchmark.overallScore.toFixed(2));
    
    return benchmark;
  }
  
  private async benchmarkGPU(): Promise<{ score: number; fps: number; latency: number }> {
    if (!this.config.gpu.enabled) {
      return { score: 0, fps: 0, latency: 0 };
    }
    
    // Simple GPU benchmark
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    
    const imageData = new ImageData(canvas.width, canvas.height);
    const iterations = 10;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await processImageGPU(imageData, 'enhance');
    }
    
    const endTime = performance.now();
    const avgLatency = (endTime - startTime) / iterations;
    const estimatedFPS = 1000 / avgLatency;
    
    const score = Math.min(100, Math.max(0, (estimatedFPS / 30) * 100));
    
    return { score, fps: estimatedFPS, latency: avgLatency };
  }
  
  private async benchmarkWorkers(): Promise<{ score: number; throughput: number; latency: number }> {
    if (!this.config.workers.enabled) {
      return { score: 0, throughput: 0, latency: 0 };
    }
    
    // Worker benchmark
    const iterations = 20;
    const startTime = performance.now();
    
    const promises = Array(iterations).fill(null).map(async () => {
      const mockInputs = [
        { type: 'camera', imageData: 'test', altText: 'test', timestamp: Date.now() },
        { type: 'voice', transcript: 'test', timestamp: Date.now() }
      ];
      
      return validateWCAGAsync(mockInputs, [], 'medium');
    });
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgLatency = totalTime / iterations;
    const throughput = iterations / (totalTime / 1000);
    
    const score = Math.min(100, Math.max(0, (throughput / 10) * 100));
    
    return { score, throughput, latency: avgLatency };
  }
  
  private async benchmarkCache(): Promise<{ score: number; hitRate: number; performance: number }> {
    if (!this.config.caching.enabled) {
      return { score: 0, hitRate: 0, performance: 0 };
    }
    
    // Cache benchmark
    const iterations = 100;
    const startTime = performance.now();
    
    // Test cache performance
    for (let i = 0; i < iterations; i++) {
      const key = `test_${i % 10}`; // Reuse keys for hit rate testing
      const data = { test: 'data', index: i };
      
      await cacheFrame(key, data as any);
      await getCachedFrame(key);
    }
    
    const endTime = performance.now();
    const performance = (endTime - startTime) / iterations;
    
    const stats = cacheManager.getGlobalStats();
    const avgHitRate = (stats.frameCache.hitRate + stats.wcagCache.hitRate + stats.analysisCache.hitRate) / 3;
    
    const score = Math.min(100, Math.max(0, avgHitRate * 100));
    
    return { score, hitRate: avgHitRate, performance };
  }
  
  private async benchmarkLazyLoading(): Promise<{ score: number; loadTime: number; successRate: number }> {
    if (!this.config.lazyLoading.enabled) {
      return { score: 0, loadTime: 0, successRate: 0 };
    }
    
    const metrics = getLazyLoadPerformanceMetrics();
    const successRate = metrics.totalLoads > 0 ? metrics.successfulLoads / metrics.totalLoads : 1;
    const loadTime = metrics.averageLoadTime || 0;
    
    const score = Math.min(100, Math.max(0, successRate * 100 - (loadTime / 100)));
    
    return { score, loadTime, successRate };
  }
  
  /**
   * Dispose of performance orchestrator
   */
  public dispose(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Dispose individual systems
    if (this.config.gpu.enabled) {
      gpuRenderer.dispose();
    }
    
    if (this.config.workers.enabled) {
      wcagWorkerPool.dispose();
    }
    
    if (this.config.caching.enabled) {
      cacheManager.dispose();
    }
    
    if (this.config.lazyLoading.enabled) {
      preloadManager.dispose();
    }
    
    this.isInitialized = false;
  }
}

// Global performance orchestrator instance
export const performanceOrchestrator = new PerformanceOrchestrator();

/**
 * Initialize performance optimizations with default configuration
 */
export async function initializePerformanceOptimizations(config?: Partial<PerformanceConfig>): Promise<void> {
  if (config) {
    await performanceOrchestrator.updateConfig(config);
  }
  await performanceOrchestrator.initialize();
}

/**
 * Get current performance status
 */
export function getPerformanceStatus(): {
  initialized: boolean;
  config: PerformanceConfig;
  currentMetrics: GlobalPerformanceMetrics | null;
} {
  return {
    initialized: performanceOrchestrator['isInitialized'],
    config: performanceOrchestrator.getConfig(),
    currentMetrics: performanceOrchestrator.getCurrentMetrics()
  };
}

/**
 * Performance utility functions
 */
export function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T>;
export function measurePerformance<T>(name: string, fn: () => T): T;
export function measurePerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
  const measureName = `contoso-${name}`;
  performance.mark(`${measureName}-start`);
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      performance.mark(`${measureName}-end`);
      performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
    });
  } else {
    performance.mark(`${measureName}-end`);
    performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
    return result;
  }
}

/**
 * Export default configuration for easy setup
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  gpu: {
    enabled: true,
    quality: 'high',
    targetFPS: 30
  },
  workers: {
    enabled: true,
    maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
    timeout: 200
  },
  caching: {
    enabled: true,
    frameCache: true,
    wcagCache: true,
    analysisCache: true
  },
  lazyLoading: {
    enabled: true,
    preloadCritical: true,
    preloadStrategy: 'idle'
  },
  monitoring: {
    enabled: true,
    metricsInterval: 5000,
    performanceThresholds: {
      frameRate: 25,
      latency: 200,
      memoryUsage: 100 * 1024 * 1024
    }
  }
};

// Export testing framework
export * from '../testing';
export { testingOrchestrator } from '../testing';
