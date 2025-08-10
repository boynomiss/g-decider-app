/**
 * Unified Cache Service
 * 
 * Consolidates 3 separate caching implementations:
 * - EnhancedCachingService (in-memory)
 * - Firebase Cache (persistent)
 * - Enhanced Filtering Cache (hybrid)
 * 
 * Provides a single, efficient caching layer for all filtering operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirebaseClient, getClientFirestore } from '../api/firebase-client';

// Unified interfaces
export interface UnifiedCacheEntry {
  id: string;
  data: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  hash: string;
  filters: UnifiedFilters;
  source: 'memory' | 'storage' | 'firestore';
  size: number; // Approximate size in bytes
}

export interface UnifiedFilters {
  category: 'food' | 'activity' | 'something-new' | null;
  mood: number | null; // 0-100
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null; // 0-100
  location?: string;
  minResults?: number;
}

export interface CacheConfig {
  // Memory cache settings
  memoryMaxSize: number; // Max entries in memory
  memoryTTL: number; // Default TTL for memory cache
  
  // Storage cache settings
  storageMaxSize: number; // Max entries in async storage
  storageTTL: number; // Default TTL for storage cache
  
  // Firestore cache settings
  firestoreMaxSize: number; // Max entries in firestore
  firestoreTTL: number; // Default TTL for firestore cache
  
  // Performance settings
  cleanupInterval: number; // How often to clean up expired entries
  compressionEnabled: boolean; // Whether to compress large entries
  autoEviction: boolean; // Whether to auto-evict old entries
}

export interface CacheStats {
  memory: {
    entries: number;
    hitRate: number;
    size: number;
  };
  storage: {
    entries: number;
    hitRate: number;
    size: number;
  };
  firestore: {
    entries: number;
    hitRate: number;
    size: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    averageResponseTime: number;
  };
}

export class UnifiedCacheService {
  private static instance: UnifiedCacheService;
  
  // Three-tier cache system
  private memoryCache: Map<string, UnifiedCacheEntry> = new Map();
  private storageCache: Map<string, UnifiedCacheEntry> = new Map();
  private firestoreCache: any; // Firestore reference
  
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      memoryMaxSize: 50, // 50 entries in memory (fastest)
      memoryTTL: 5 * 60 * 1000, // 5 minutes
      
      storageMaxSize: 200, // 200 entries in storage (medium)
      storageTTL: 30 * 60 * 1000, // 30 minutes
      
      firestoreMaxSize: 1000, // 1000 entries in firestore (persistent)
      firestoreTTL: 24 * 60 * 60 * 1000, // 24 hours
      
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      compressionEnabled: true,
      autoEviction: true
    };

    this.stats = {
      memory: { entries: 0, hitRate: 0, size: 0 },
      storage: { entries: 0, hitRate: 0, size: 0 },
      firestore: { entries: 0, hitRate: 0, size: 0 },
      overall: { totalHits: 0, totalMisses: 0, hitRate: 0, averageResponseTime: 0 }
    };

    this.initializeFirestore();
    this.startCleanupTimer();
    this.loadStorageCache();
  }

  static getInstance(): UnifiedCacheService {
    if (!UnifiedCacheService.instance) {
      UnifiedCacheService.instance = new UnifiedCacheService();
    }
    return UnifiedCacheService.instance;
  }

  /**
   * Initialize Firestore connection
   */
  private async initializeFirestore(): Promise<void> {
    try {
      initializeFirebaseClient();
      const db = getClientFirestore();
      // Use client SDK syntax - collection() is not available in client SDK
      // For now, disable Firestore cache until we implement proper client-side caching
      this.firestoreCache = null;
      console.log('✅ Firestore cache disabled (client SDK limitation)');
    } catch (error) {
      console.warn('⚠️ Firestore cache initialization failed:', error);
      this.firestoreCache = null;
    }
  }

  /**
   * Generate consistent cache key from filters
   */
  private generateCacheKey(filters: UnifiedFilters, minResults: number = 5): string {
    const normalizedFilters = {
      category: filters.category,
      mood: filters.mood,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      socialContext: filters.socialContext,
      distanceRange: filters.distanceRange,
      location: filters.location?.toLowerCase().trim(),
      minResults
    };

    const filterString = JSON.stringify(normalizedFilters, Object.keys(normalizedFilters).sort());
    
    // Create a stable hash
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `unified_filter_${Math.abs(hash)}`;
  }

  /**
   * Calculate TTL based on filter complexity and cache tier
   */
  private calculateTTL(filters: UnifiedFilters, tier: 'memory' | 'storage' | 'firestore'): number {
    const baseTTL = this.config[`${tier}TTL`];
    
    // Adjust TTL based on filter complexity
    const filterCount = Object.values(filters).filter(v => v !== null && v !== undefined).length;
    
    let multiplier = 1;
    if (filterCount <= 2) {
      multiplier = 0.7; // Simple filters expire faster
    } else if (filterCount >= 4) {
      multiplier = 1.3; // Complex filters last longer
    }
    
    return Math.floor(baseTTL * multiplier);
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: UnifiedCacheEntry): boolean {
    return Date.now() > (entry.timestamp + entry.ttl);
  }

  /**
   * Get data from unified cache (three-tier lookup)
   */
  async get(filters: UnifiedFilters, minResults: number = 5): Promise<any | null> {
    const startTime = Date.now();
    const key = this.generateCacheKey(filters, minResults);

    try {
      // Tier 1: Memory cache (fastest)
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        memoryEntry.accessCount++;
        memoryEntry.lastAccessed = Date.now();
        this.stats.memory.hitRate = this.updateHitRate(this.stats.memory.hitRate, true);
        this.stats.overall.totalHits++;
        
        console.log(`🚀 Memory cache hit for key: ${key}`);
        return memoryEntry.data;
      }

      // Tier 2: Storage cache (medium speed)
      const storageEntry = this.storageCache.get(key);
      if (storageEntry && !this.isExpired(storageEntry)) {
        // Promote to memory cache
        storageEntry.source = 'memory';
        storageEntry.accessCount++;
        storageEntry.lastAccessed = Date.now();
        
        this.memoryCache.set(key, storageEntry);
        this.evictIfNeeded('memory');
        
        this.stats.storage.hitRate = this.updateHitRate(this.stats.storage.hitRate, true);
        this.stats.overall.totalHits++;
        
        console.log(`💾 Storage cache hit for key: ${key} (promoted to memory)`);
        return storageEntry.data;
      }

      // Tier 3: Firestore cache (persistent but slower)
      if (this.firestoreCache) {
        const firestoreDoc = await this.firestoreCache.doc(key).get();
        if (firestoreDoc.exists) {
          const firestoreEntry = firestoreDoc.data() as UnifiedCacheEntry;
          if (!this.isExpired(firestoreEntry)) {
            // Promote to memory and storage caches
            firestoreEntry.source = 'memory';
            firestoreEntry.accessCount++;
            firestoreEntry.lastAccessed = Date.now();
            
            this.memoryCache.set(key, firestoreEntry);
            this.storageCache.set(key, firestoreEntry);
            
            this.evictIfNeeded('memory');
            this.evictIfNeeded('storage');
            
            this.stats.firestore.hitRate = this.updateHitRate(this.stats.firestore.hitRate, true);
            this.stats.overall.totalHits++;
            
            console.log(`☁️ Firestore cache hit for key: ${key} (promoted to memory & storage)`);
            return firestoreEntry.data;
          }
        }
      }

      // Cache miss
      this.stats.overall.totalMisses++;
      this.updateOverallStats(Date.now() - startTime);
      
      console.log(`❌ Cache miss for key: ${key}`);
      return null;

    } catch (error) {
      console.error('❌ Cache get error:', error);
      this.stats.overall.totalMisses++;
      return null;
    }
  }

  /**
   * Set data in unified cache (write to all tiers)
   */
  async set(filters: UnifiedFilters, data: any, minResults: number = 5): Promise<void> {
    const key = this.generateCacheKey(filters, minResults);
    const timestamp = Date.now();
    const dataSize = this.estimateSize(data);

    try {
      // Create cache entries for each tier
      const memoryEntry: UnifiedCacheEntry = {
        id: key,
        data,
        timestamp,
        ttl: this.calculateTTL(filters, 'memory'),
        accessCount: 1,
        lastAccessed: timestamp,
        hash: key,
        filters,
        source: 'memory',
        size: dataSize
      };

      const storageEntry: UnifiedCacheEntry = {
        ...memoryEntry,
        ttl: this.calculateTTL(filters, 'storage'),
        source: 'storage'
      };

      const firestoreEntry: UnifiedCacheEntry = {
        ...memoryEntry,
        ttl: this.calculateTTL(filters, 'firestore'),
        source: 'firestore'
      };

      // Write to all tiers
      this.memoryCache.set(key, memoryEntry);
      this.storageCache.set(key, storageEntry);

      // Write to Firestore asynchronously
      if (this.firestoreCache) {
        this.firestoreCache.doc(key).set(firestoreEntry).catch((error: any) => {
          console.warn('⚠️ Firestore cache write failed:', error);
        });
      }

      // Save storage cache to AsyncStorage
      this.saveStorageCache();

      // Evict if needed
      this.evictIfNeeded('memory');
      this.evictIfNeeded('storage');

      // Update stats
      this.updateCacheStats();

      console.log(`✅ Cache set for key: ${key} (${dataSize} bytes)`);

    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidate(pattern: 'all' | 'category' | 'location' | 'budget', value?: any): Promise<void> {
    console.log(`🗑️ Invalidating cache with pattern: ${pattern}`);

    try {
      if (pattern === 'all') {
        this.memoryCache.clear();
        this.storageCache.clear();
        await AsyncStorage.removeItem('unified_storage_cache');
        
        if (this.firestoreCache) {
          const snapshot = await this.firestoreCache.get();
          const batch = this.firestoreCache.firestore.batch();
          snapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
          await batch.commit();
        }
      } else {
        // Selective invalidation
        const keysToDelete: string[] = [];
        
        this.memoryCache.forEach((entry, key) => {
          if (this.matchesPattern(entry.filters, pattern, value)) {
            keysToDelete.push(key);
          }
        });

        keysToDelete.forEach(key => {
          this.memoryCache.delete(key);
          this.storageCache.delete(key);
        });

        this.saveStorageCache();

        // Firestore selective invalidation
        if (this.firestoreCache && keysToDelete.length > 0) {
          const batch = this.firestoreCache.firestore.batch();
          keysToDelete.forEach(key => {
            batch.delete(this.firestoreCache.doc(key));
          });
          await batch.commit();
        }
      }

      this.updateCacheStats();
      console.log(`✅ Cache invalidation complete: ${pattern}`);

    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }

  /**
   * Check if filters match invalidation pattern
   */
  private matchesPattern(filters: UnifiedFilters, pattern: string, value: any): boolean {
    switch (pattern) {
      case 'category':
        return filters.category === value;
      case 'location':
        return filters.location?.toLowerCase().includes(value?.toLowerCase()) ?? false;
      case 'budget':
        return filters.budget === value;
      default:
        return false;
    }
  }

  /**
   * Evict entries if cache is over capacity
   */
  private evictIfNeeded(tier: 'memory' | 'storage'): void {
    const cache = tier === 'memory' ? this.memoryCache : this.storageCache;
    const maxSize = this.config[`${tier}MaxSize`];

    if (cache.size <= maxSize) return;

    // Evict least recently used entries
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const toEvict = entries.slice(0, cache.size - maxSize);
    toEvict.forEach(([key]) => cache.delete(key));

    console.log(`🗑️ Evicted ${toEvict.length} entries from ${tier} cache`);
  }

  /**
   * Update hit rate using exponential moving average
   */
  private updateHitRate(currentRate: number, isHit: boolean): number {
    const alpha = 0.1; // Smoothing factor
    return currentRate * (1 - alpha) + (isHit ? 1 : 0) * alpha;
  }

  /**
   * Update overall statistics
   */
  private updateOverallStats(responseTime: number): void {
    const total = this.stats.overall.totalHits + this.stats.overall.totalMisses;
    this.stats.overall.hitRate = this.stats.overall.totalHits / total;
    
    // Update average response time
    this.stats.overall.averageResponseTime = 
      (this.stats.overall.averageResponseTime * 0.9) + (responseTime * 0.1);
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(): void {
    this.stats.memory.entries = this.memoryCache.size;
    this.stats.storage.entries = this.storageCache.size;
    
    // Calculate cache sizes
    this.stats.memory.size = Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);
    this.stats.storage.size = Array.from(this.storageCache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  /**
   * Load storage cache from AsyncStorage
   */
  private async loadStorageCache(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('unified_storage_cache');
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        Object.entries(parsedCache).forEach(([key, entry]) => {
          this.storageCache.set(key, entry as UnifiedCacheEntry);
        });
        console.log(`📱 Loaded ${this.storageCache.size} entries from storage cache`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load storage cache:', error);
    }
  }

  /**
   * Save storage cache to AsyncStorage
   */
  private async saveStorageCache(): Promise<void> {
    try {
      const cacheData = Object.fromEntries(this.storageCache);
      await AsyncStorage.setItem('unified_storage_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ Failed to save storage cache:', error);
    }
  }

  /**
   * Start cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    // Clean memory cache
    this.memoryCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    });

    // Clean storage cache
    this.storageCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.storageCache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
      this.saveStorageCache();
      this.updateCacheStats();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateCacheStats();
    return { ...this.stats };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Cache configuration updated');
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    await this.invalidate('all');
    console.log('🗑️ All caches cleared');
  }

  /**
   * Destroy cache service and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.memoryCache.clear();
    this.storageCache.clear();
    console.log('💀 Unified cache service destroyed');
  }
}

// Export singleton instance
export const unifiedCacheService = UnifiedCacheService.getInstance();