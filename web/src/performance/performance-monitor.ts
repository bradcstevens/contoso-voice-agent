import { useEffect, useRef, useCallback, useState } from 'react';
import { useVoiceAgent } from '../store/voice-agent';

// Performance monitoring interfaces
export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  frameRate: number;
  networkLatency: number;
}

export interface PerformanceTargets {
  latency: number; // <100ms
  throughput: number; // 30fps
  errorRate: number; // <1%
  memoryThreshold: number; // Memory usage threshold
  cpuThreshold: number; // CPU usage threshold
}

export interface PerformanceAlert {
  id: string;
  type: 'latency' | 'throughput' | 'error' | 'memory' | 'cpu' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  targetLatency: number;
  targetThroughput: number;
  monitorInterval: number;
  alertThresholds: {
    latency: number;
    throughput: number;
    errorRate: number;
    memory: number;
    cpu: number;
  };
}

class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private isActive: boolean = false;
  private metrics: PerformanceMetrics;
  private targets: PerformanceTargets;
  private alerts: PerformanceAlert[] = [];
  private transactions: Map<string, number> = new Map();
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private observer: PerformanceObserver | null = null;
  
  constructor(config: PerformanceMonitorConfig) {
    this.config = config;
    this.metrics = {
      latency: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      frameRate: 0,
      networkLatency: 0,
    };
    
    this.targets = {
      latency: config.targetLatency,
      throughput: config.targetThroughput,
      errorRate: config.alertThresholds.errorRate,
      memoryThreshold: config.alertThresholds.memory,
      cpuThreshold: config.alertThresholds.cpu,
    };
    
    if (config.enabled) {
      this.start();
    }
  }
  
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.initializePerformanceObserver();
    this.startMonitoring();
    this.startFrameRateMonitoring();
  }
  
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  private initializePerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          // Monitor navigation timing
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.networkLatency = navEntry.responseEnd - navEntry.requestStart;
          }
          
          // Monitor resource timing
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > this.targets.latency) {
              this.addAlert({
                type: 'latency',
                severity: 'medium',
                message: `Resource load time exceeded threshold: ${resourceEntry.name}`,
                value: resourceEntry.duration,
                threshold: this.targets.latency,
              });
            }
          }
          
          // Monitor user timing (custom transactions)
          if (entry.entryType === 'measure') {
            const duration = entry.duration;
            if (duration > this.targets.latency) {
              this.addAlert({
                type: 'latency',
                severity: duration > this.targets.latency * 2 ? 'high' : 'medium',
                message: `Transaction '${entry.name}' exceeded latency target`,
                value: duration,
                threshold: this.targets.latency,
              });
            }
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
  
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
    }, this.config.monitorInterval);
  }
  
  private startFrameRateMonitoring(): void {
    const updateFrameRate = () => {
      if (!this.isActive) return;
      
      const now = performance.now();
      this.frameCount++;
      
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = now;
      } else if (now - this.lastFrameTime >= 1000) {
        this.metrics.frameRate = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Check frame rate performance
        if (this.metrics.frameRate < this.targets.throughput) {
          this.addAlert({
            type: 'throughput',
            severity: this.metrics.frameRate < this.targets.throughput * 0.5 ? 'high' : 'medium',
            message: 'Frame rate below target',
            value: this.metrics.frameRate,
            threshold: this.targets.throughput,
          });
        }
      }
      
      requestAnimationFrame(updateFrameRate);
    };
    
    requestAnimationFrame(updateFrameRate);
  }
  
  private updateMetrics(): void {
    // Update memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (this.metrics.memoryUsage > this.targets.memoryThreshold) {
        this.addAlert({
          type: 'memory',
          severity: this.metrics.memoryUsage > this.targets.memoryThreshold * 1.5 ? 'high' : 'medium',
          message: 'Memory usage exceeded threshold',
          value: this.metrics.memoryUsage,
          threshold: this.targets.memoryThreshold,
        });
      }
    }
    
    // Estimate CPU usage based on frame timing
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    const expectedFrameTime = 1000 / 60; // 60fps
    this.metrics.cpuUsage = Math.min(100, (deltaTime / expectedFrameTime) * 100);
    
    if (this.metrics.cpuUsage > this.targets.cpuThreshold) {
      this.addAlert({
        type: 'cpu',
        severity: this.metrics.cpuUsage > this.targets.cpuThreshold * 1.5 ? 'high' : 'medium',
        message: 'CPU usage exceeded threshold',
        value: this.metrics.cpuUsage,
        threshold: this.targets.cpuThreshold,
      });
    }
    
    // Update throughput (using frame rate as proxy)
    this.metrics.throughput = this.metrics.frameRate;
    
    // Calculate error rate from recent alerts
    const recentErrors = this.alerts.filter(
      alert => alert.type === 'error' && Date.now() - alert.timestamp < 60000
    );
    this.metrics.errorRate = (recentErrors.length / 60) * 100; // Errors per minute as percentage
  }
  
  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const newAlert: PerformanceAlert = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alert,
    };
    
    this.alerts.push(newAlert);
    
    // Keep only recent alerts (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.alerts = this.alerts.filter(a => a.timestamp > oneHourAgo);
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error('Critical performance alert:', alert);
    } else if (alert.severity === 'high') {
      console.warn('High performance alert:', alert);
    }
  }
  
  // Transaction monitoring
  startTransaction(name: string): void {
    if (!this.isActive) return;
    
    const startTime = performance.now();
    this.transactions.set(name, startTime);
    
    if ('mark' in performance) {
      performance.mark(`${name}-start`);
    }
  }
  
  endTransaction(name: string): number {
    if (!this.isActive) return 0;
    
    const startTime = this.transactions.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.transactions.delete(name);
    
    if ('mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
    
    // Update latency metric with average of recent transactions
    this.metrics.latency = duration;
    
    return duration;
  }
  
  recordError(errorType: string, details: any): void {
    this.addAlert({
      type: 'error',
      severity: 'medium',
      message: `Error recorded: ${errorType}`,
      value: 1,
      threshold: 0,
    });
  }
  
  // Getters
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }
  
  getActiveTransactions(): string[] {
    return Array.from(this.transactions.keys());
  }
  
  isMonitoringActive(): boolean {
    return this.isActive;
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(config: PerformanceMonitorConfig) {
  const [monitor] = useState(() => new PerformanceMonitor(config));
  const updatePerformanceMetrics = useVoiceAgent(state => state.updatePerformanceMetrics);
  const addPerformanceAlert = useVoiceAgent(state => state.addPerformanceAlert);
  
  // Update store with performance metrics
  useEffect(() => {
    if (!monitor.isMonitoringActive()) return;
    
    const updateInterval = setInterval(() => {
      const metrics = monitor.getMetrics();
      updatePerformanceMetrics(metrics);
      
      // Add new alerts to store
      const alerts = monitor.getAlerts();
      const recentAlerts = alerts.filter(alert => Date.now() - alert.timestamp < 1000);
      recentAlerts.forEach(alert => {
        addPerformanceAlert({
          type: 'performance',
          message: alert.message,
        });
      });
    }, config.monitorInterval);
    
    return () => clearInterval(updateInterval);
  }, [monitor, updatePerformanceMetrics, addPerformanceAlert, config.monitorInterval]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      monitor.stop();
    };
  }, [monitor]);
  
  return monitor;
}

// Specialized hooks for specific performance aspects
export function useLatencyMonitor() {
  const metrics = useVoiceAgent(state => state.performance.metrics);
  const coordination = useVoiceAgent(state => state.coordination);
  
  return {
    current: metrics.latency,
    average: coordination.latency.average,
    target: coordination.latency.target,
    isOverTarget: metrics.latency > coordination.latency.target,
  };
}

export function useThroughputMonitor() {
  const metrics = useVoiceAgent(state => state.performance.metrics);
  const targets = useVoiceAgent(state => state.performance.targets);
  
  return {
    current: metrics.throughput,
    target: targets.throughput,
    frameRate: metrics.frameRate,
    isUnderTarget: metrics.throughput < targets.throughput,
  };
}

export function useErrorRateMonitor() {
  const metrics = useVoiceAgent(state => state.performance.metrics);
  const targets = useVoiceAgent(state => state.performance.targets);
  const coordination = useVoiceAgent(state => state.coordination);
  
  return {
    current: metrics.errorRate,
    target: targets.errorRate,
    totalErrors: coordination.errors.count,
    recentErrors: coordination.errors.recent,
    isOverTarget: metrics.errorRate > targets.errorRate,
  };
}

// Performance optimization utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memory optimization utilities
export function useMemoryOptimization() {
  const cleanupRef = useRef<(() => void)[]>([]);
  
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  }, []);
  
  const runCleanup = useCallback(() => {
    cleanupRef.current.forEach(cleanup => cleanup());
    cleanupRef.current = [];
  }, []);
  
  useEffect(() => {
    return runCleanup;
  }, [runCleanup]);
  
  return { addCleanup, runCleanup };
}

// GPU acceleration utilities
export function enableGPUAcceleration(element: HTMLElement) {
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
}

export function disableGPUAcceleration(element: HTMLElement) {
  element.style.transform = '';
  element.style.backfaceVisibility = '';
  element.style.perspective = '';
}

// Default performance configuration
export const defaultPerformanceConfig: PerformanceMonitorConfig = {
  enabled: true,
  targetLatency: 100, // <100ms requirement
  targetThroughput: 30, // 30fps requirement
  monitorInterval: 1000, // 1 second
  alertThresholds: {
    latency: 150, // Alert if >150ms
    throughput: 20, // Alert if <20fps
    errorRate: 5, // Alert if >5% error rate
    memory: 80, // Alert if >80% memory usage
    cpu: 70, // Alert if >70% CPU usage
  },
}; 