/**
 * Intelligent Caching Layer
 * 
 * Implements multi-level caching for camera feeds, analysis results, and WCAG validations
 * Optimizes performance through strategic cache invalidation and memory management
 */

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  metadata: Record<string, any>;
}

export interface CacheOptions {
  maxAge?: number;          // Maximum age in milliseconds
  maxSize?: number;         // Maximum cache size in bytes
  maxEntries?: number;      // Maximum number of entries
  persistence?: boolean;    // Whether to persist to localStorage
  compression?: boolean;    // Whether to compress large entries
  strategy?: 'lru' | 'lfu' | 'fifo' | 'adaptive';
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  currentSize: number;
  currentEntries: number;
  evictions: number;
  compressionRatio: number;
}

// Cache type definitions
export type CacheType = 'memory' | 'storage' | 'indexeddb' | 'compressed';

/**
 * Base cache implementation with advanced features
 */
export abstract class BaseCache<T = any> {
  protected entries: Map<string, CacheEntry<T>> = new Map();
  protected stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0
  };
  
  constructor(protected options: CacheOptions = {}) {
    this.options = {
      maxAge: 5 * 60 * 1000,      // 5 minutes default
      maxSize: 50 * 1024 * 1024,  // 50MB default
      maxEntries: 1000,           // 1000 entries default
      persistence: false,
      compression: false,
      strategy: 'lru',
      ...options
    };
  }
  
  /**
   * Get value from cache
   */
  public async get(key: string): Promise<T | null> {
    const entry = this.entries.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiry
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    return await this.deserializeValue(entry.value);
  }
  
  /**
   * Set value in cache
   */
  public async set(key: string, value: T, options: Partial<CacheOptions> = {}): Promise<void> {
    const mergedOptions = { ...this.options, ...options };
    const serializedValue = await this.serializeValue(value);
    const size = this.calculateSize(serializedValue);
    
    // Check if we need to evict entries
    await this.ensureCapacity(size);
    
    const entry: CacheEntry<T> = {
      key,
      value: serializedValue,
      timestamp: Date.now(),
      expiry: Date.now() + (mergedOptions.maxAge || this.options.maxAge!),
      accessCount: 1,
      lastAccessed: Date.now(),
      size,
      metadata: {}
    };
    
    this.entries.set(key, entry);
    this.stats.totalSize += size;
    
    // Persist if enabled
    if (mergedOptions.persistence) {
      await this.persistEntry(entry);
    }
  }
  
  /**
   * Delete entry from cache
   */
  public delete(key: string): boolean {
    const entry = this.entries.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.entries.delete(key);
      return true;
    }
    return false;
  }
  
  /**
   * Clear all entries
   */
  public clear(): void {
    this.entries.clear();
    this.stats.totalSize = 0;
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      currentSize: this.stats.totalSize,
      currentEntries: this.entries.size,
      evictions: this.stats.evictions,
      compressionRatio: this.calculateCompressionRatio()
    };
  }
  
  protected abstract serializeValue(value: T): Promise<any>;
  protected abstract deserializeValue(value: any): Promise<T>;
  protected abstract persistEntry(entry: CacheEntry<T>): Promise<void>;
  protected abstract calculateSize(value: any): number;
  
  protected isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiry;
  }
  
  protected async ensureCapacity(newEntrySize: number): Promise<void> {
    const maxSize = this.options.maxSize!;
    const maxEntries = this.options.maxEntries!;
    
    // Check size limit
    while (this.stats.totalSize + newEntrySize > maxSize || this.entries.size >= maxEntries) {
      const evicted = await this.evictEntry();
      if (!evicted) break; // No more entries to evict
    }
  }
  
  protected async evictEntry(): Promise<boolean> {
    if (this.entries.size === 0) return false;
    
    let entryToEvict: CacheEntry<T> | null = null;
    
    switch (this.options.strategy) {
      case 'lru':
        entryToEvict = this.findLRUEntry();
        break;
      case 'lfu':
        entryToEvict = this.findLFUEntry();
        break;
      case 'fifo':
        entryToEvict = this.findFIFOEntry();
        break;
      case 'adaptive':
        entryToEvict = this.findAdaptiveEntry();
        break;
    }
    
    if (entryToEvict) {
      this.delete(entryToEvict.key);
      this.stats.evictions++;
      return true;
    }
    
    return false;
  }
  
  protected findLRUEntry(): CacheEntry<T> | null {
    let oldest: CacheEntry<T> | null = null;
    
    for (const entry of this.entries.values()) {
      if (!oldest || entry.lastAccessed < oldest.lastAccessed) {
        oldest = entry;
      }
    }
    
    return oldest;
  }
  
  protected findLFUEntry(): CacheEntry<T> | null {
    let leastUsed: CacheEntry<T> | null = null;
    
    for (const entry of this.entries.values()) {
      if (!leastUsed || entry.accessCount < leastUsed.accessCount) {
        leastUsed = entry;
      }
    }
    
    return leastUsed;
  }
  
  protected findFIFOEntry(): CacheEntry<T> | null {
    let oldest: CacheEntry<T> | null = null;
    
    for (const entry of this.entries.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
    }
    
    return oldest;
  }
  
  protected findAdaptiveEntry(): CacheEntry<T> | null {
    // Adaptive strategy considers both recency and frequency
    let bestCandidate: CacheEntry<T> | null = null;
    let lowestScore = Infinity;
    
    const now = Date.now();
    
    for (const entry of this.entries.values()) {
      // Calculate composite score (lower is better for eviction)
      const recencyScore = (now - entry.lastAccessed) / (1000 * 60); // Minutes since last access
      const frequencyScore = 1 / Math.max(entry.accessCount, 1); // Inverse of access count
      const ageScore = (now - entry.timestamp) / (1000 * 60 * 60); // Hours since creation
      
      const compositeScore = recencyScore * 0.4 + frequencyScore * 0.4 + ageScore * 0.2;
      
      if (compositeScore < lowestScore) {
        lowestScore = compositeScore;
        bestCandidate = entry;
      }
    }
    
    return bestCandidate;
  }
  
  protected calculateCompressionRatio(): number {
    // This would be implemented in compressed cache subclass
    return 1.0;
  }
}

/**
 * Memory cache implementation
 */
export class MemoryCache<T = any> extends BaseCache<T> {
  protected async serializeValue(value: T): Promise<T> {
    return value; // No serialization needed for memory cache
  }
  
  protected async deserializeValue(value: T): Promise<T> {
    return value; // No deserialization needed for memory cache
  }
  
  protected async persistEntry(entry: CacheEntry<T>): Promise<void> {
    // Memory cache doesn't persist
  }
  
  protected calculateSize(value: any): number {
    // Rough estimation of object size in memory
    return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
  }
}

/**
 * IndexedDB cache implementation for large data
 */
export class IndexedDBCache<T = any> extends BaseCache<T> {
  private dbName = 'ContosoCacheDB';
  private storeName = 'cache';
  private db: IDBDatabase | null = null;
  
  constructor(options: CacheOptions = {}) {
    super(options);
    this.initDB();
  }
  
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  
  protected async serializeValue(value: T): Promise<any> {
    // IndexedDB can handle most types directly
    return value;
  }
  
  protected async deserializeValue(value: any): Promise<T> {
    return value;
  }
  
  protected async persistEntry(entry: CacheEntry<T>): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(entry.value, entry.key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  protected calculateSize(value: any): number {
    // More accurate size calculation for IndexedDB
    const serialized = JSON.stringify(value);
    return new Blob([serialized]).size;
  }
}

/**
 * Specialized cache for camera frame data
 */
export class CameraFrameCache extends MemoryCache<ImageData | string> {
  constructor() {
    super({
      maxAge: 30 * 1000,        // 30 seconds for frames
      maxSize: 100 * 1024 * 1024, // 100MB for video frames
      maxEntries: 100,          // Limit frame count
      strategy: 'lru'           // LRU for video frames
    });
  }
  
  /**
   * Cache processed frame with timestamp
   */
  public async cacheFrame(
    frameId: string,
    frameData: ImageData | string,
    processingResult?: any
  ): Promise<void> {
    const cacheValue = {
      frameData,
      processingResult,
      timestamp: Date.now()
    };
    
    await this.set(frameId, cacheValue as any);
  }
  
  /**
   * Get cached frame if available and recent
   */
  public async getCachedFrame(frameId: string): Promise<{
    frameData: ImageData | string;
    processingResult?: any;
    timestamp: number;
  } | null> {
    return await this.get(frameId);
  }
}

/**
 * Specialized cache for WCAG validation results
 */
export class WCAGValidationCache extends MemoryCache<any> {
  constructor() {
    super({
      maxAge: 10 * 60 * 1000,   // 10 minutes for validation results
      maxSize: 10 * 1024 * 1024, // 10MB for validation data
      maxEntries: 500,          // Many validation entries
      strategy: 'adaptive'      // Adaptive strategy for varied access patterns
    });
  }
  
  /**
   * Generate cache key for WCAG validation
   */
  private generateValidationKey(inputs: any[], rules: any[]): string {
    const inputHash = this.hashInputs(inputs);
    const rulesHash = this.hashRules(rules);
    return `wcag_${inputHash}_${rulesHash}`;
  }
  
  private hashInputs(inputs: any[]): string {
    // Create a hash of input content for cache key
    const content = inputs.map(input => ({
      type: input.type,
      content: input.content || input.transcript || input.altText || '',
      timestamp: Math.floor(input.timestamp / 1000) // Round to seconds
    }));
    
    return btoa(JSON.stringify(content)).substr(0, 16);
  }
  
  private hashRules(rules: any[]): string {
    const ruleIds = rules.map(rule => rule.id || rule.criterion).sort();
    return btoa(JSON.stringify(ruleIds)).substr(0, 8);
  }
  
  /**
   * Cache WCAG validation result
   */
  public async cacheValidation(
    inputs: any[],
    rules: any[],
    result: any
  ): Promise<void> {
    const key = this.generateValidationKey(inputs, rules);
    await this.set(key, result);
  }
  
  /**
   * Get cached WCAG validation result
   */
  public async getCachedValidation(
    inputs: any[],
    rules: any[]
  ): Promise<any | null> {
    const key = this.generateValidationKey(inputs, rules);
    return await this.get(key);
  }
}

/**
 * Specialized cache for visual analysis results
 */
export class VisualAnalysisCache extends IndexedDBCache<any> {
  constructor() {
    super({
      maxAge: 60 * 60 * 1000,   // 1 hour for analysis results
      maxSize: 200 * 1024 * 1024, // 200MB for analysis data
      maxEntries: 1000,         // Many analysis results
      strategy: 'lfu',          // LFU for analysis results (frequently used objects)
      persistence: true,        // Persist analysis results
      compression: true         // Compress large analysis data
    });
  }
  
  /**
   * Cache visual analysis result with image hash
   */
  public async cacheAnalysis(
    imageHash: string,
    analysisResult: any
  ): Promise<void> {
    const key = `analysis_${imageHash}`;
    await this.set(key, analysisResult);
  }
  
  /**
   * Get cached visual analysis result
   */
  public async getCachedAnalysis(imageHash: string): Promise<any | null> {
    const key = `analysis_${imageHash}`;
    return await this.get(key);
  }
  
  /**
   * Generate hash for image data
   */
  public generateImageHash(imageData: ImageData | string): string {
    if (typeof imageData === 'string') {
      // For base64 strings, use a portion as hash
      return btoa(imageData.substr(0, 100)).substr(0, 16);
    } else {
      // For ImageData, sample pixels for hash
      const { data, width, height } = imageData;
      const samples = [];
      const step = Math.floor(data.length / 100); // Sample 100 points
      
      for (let i = 0; i < data.length; i += step) {
        samples.push(data[i]);
      }
      
      return btoa(String.fromCharCode(...samples.slice(0, 50))).substr(0, 16);
    }
  }
}

/**
 * Cache manager coordinating all cache types
 */
export class CacheManager {
  public readonly frameCache = new CameraFrameCache();
  public readonly wcagCache = new WCAGValidationCache();
  public readonly analysisCache = new VisualAnalysisCache();
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startCleanupProcess();
  }
  
  /**
   * Start periodic cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }
  
  /**
   * Cleanup expired entries across all caches
   */
  public cleanup(): void {
    this.frameCache.clear();
    // WCAG and analysis caches handle their own expiry
  }
  
  /**
   * Get performance metrics from all caches
   */
  public getGlobalStats(): {
    frameCache: CacheStats;
    wcagCache: CacheStats;
    analysisCache: CacheStats;
    totalMemoryUsage: number;
  } {
    const frameStats = this.frameCache.getStats();
    const wcagStats = this.wcagCache.getStats();
    const analysisStats = this.analysisCache.getStats();
    
    return {
      frameCache: frameStats,
      wcagCache: wcagStats,
      analysisCache: analysisStats,
      totalMemoryUsage: frameStats.currentSize + wcagStats.currentSize + analysisStats.currentSize
    };
  }
  
  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.frameCache.clear();
    this.wcagCache.clear();
    this.analysisCache.clear();
  }
  
  /**
   * Dispose of cache manager
   */
  public dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

/**
 * Utility functions for cache operations
 */
export async function cacheFrame(frameId: string, frameData: ImageData | string, processingResult?: any): Promise<void> {
  return cacheManager.frameCache.cacheFrame(frameId, frameData, processingResult);
}

export async function getCachedFrame(frameId: string): Promise<any | null> {
  return cacheManager.frameCache.getCachedFrame(frameId);
}

export async function cacheWCAGValidation(inputs: any[], rules: any[], result: any): Promise<void> {
  return cacheManager.wcagCache.cacheValidation(inputs, rules, result);
}

export async function getCachedWCAGValidation(inputs: any[], rules: any[]): Promise<any | null> {
  return cacheManager.wcagCache.getCachedValidation(inputs, rules);
}

export async function cacheVisualAnalysis(imageHash: string, analysisResult: any): Promise<void> {
  return cacheManager.analysisCache.cacheAnalysis(imageHash, analysisResult);
}

export async function getCachedVisualAnalysis(imageHash: string): Promise<any | null> {
  return cacheManager.analysisCache.getCachedAnalysis(imageHash);
}

export function generateImageHash(imageData: ImageData | string): string {
  return cacheManager.analysisCache.generateImageHash(imageData);
}
