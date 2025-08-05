import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters } from '../types/app';

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  filters: UserFilters;
  hash: string;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  cacheSize: number;
  evictions: number;
}

export interface CacheConfig {
  maxSize: number; // Maximum number of entries
  defaultTTL: number; // Default time to live in milliseconds
  maxTTL: number; // Maximum time to live
  minTTL: number; // Minimum time to live
  cleanupInterval: number; // How often to clean up expired entries
  warmingEnabled: boolean; // Whether cache warming is enabled
  compressionEnabled: boolean; // Whether to compress cache entries
}

export class EnhancedCachingService {
  private static instance: EnhancedCachingService;
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    evictions: 0,
    totalResponseTime: 0
  };
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxTTL: 30 * 60 * 1000, // 30 minutes
      minTTL: 1 * 60 * 1000, // 1 minute
      cleanupInterval: 2 * 60 * 1000, // 2 minutes
      warmingEnabled: true,
      compressionEnabled: true
    };
    
    this.startCleanupTimer();
    this.loadCacheFromStorage();
  }

  static getInstance(): EnhancedCachingService {
    if (!EnhancedCachingService.instance) {
      EnhancedCachingService.instance = new EnhancedCachingService();
    }
    return EnhancedCachingService.instance;
  }

  // Generate cache key from filters
  private generateCacheKey(filters: UserFilters, minResults: number): string {
    const filterString = JSON.stringify({
      mood: filters.mood,
      category: filters.category,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      socialContext: filters.socialContext,
      distanceRange: filters.distanceRange,
      minResults
    });
    
    // Create a hash of the filters for consistent keys
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `filter_${Math.abs(hash)}`;
  }

  // Calculate TTL based on filter complexity and usage patterns
  private calculateTTL(filters: UserFilters, accessCount: number): number {
    let ttl = this.config.defaultTTL;
    
    // Adjust TTL based on filter complexity
    const filterCount = Object.values(filters).filter(v => v !== null && v !== undefined).length;
    if (filterCount <= 2) {
      ttl *= 0.5; // Simple filters expire faster
    } else if (filterCount >= 4) {
      ttl *= 1.5; // Complex filters last longer
    }
    
    // Adjust TTL based on access count (popular queries last longer)
    if (accessCount > 5) {
      ttl *= 2;
    } else if (accessCount > 10) {
      ttl *= 3;
    }
    
    // Ensure TTL is within bounds
    return Math.min(Math.max(ttl, this.config.minTTL), this.config.maxTTL);
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Get cache entry
  async get(filters: UserFilters, minResults: number = 5): Promise<any | null> {
    const key = this.generateCacheKey(filters, minResults);
    const entry = this.cache.get(key);
    
    this.stats.totalRequests++;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    // Extend TTL for frequently accessed entries
    if (entry.accessCount % 5 === 0) {
      entry.ttl = this.calculateTTL(entry.filters, entry.accessCount);
    }
    
    return entry.data;
  }

  // Set cache entry
  async set(filters: UserFilters, data: any, minResults: number = 5): Promise<void> {
    const key = this.generateCacheKey(filters, minResults);
    
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.calculateTTL(filters, 1),
      accessCount: 1,
      lastAccessed: Date.now(),
      filters,
      hash: key
    };
    
    this.cache.set(key, entry);
    await this.saveCacheToStorage();
  }

  // Evict least used entries
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count and last accessed time
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount * 0.7 + (Date.now() - a[1].lastAccessed) * 0.3;
      const scoreB = b[1].accessCount * 0.7 + (Date.now() - b[1].lastAccessed) * 0.3;
      return scoreA - scoreB;
    });
    
    // Remove 20% of least used entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  // Invalidate cache entries based on patterns
  async invalidate(pattern: 'all' | 'category' | 'location' | 'budget', value?: any): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      let shouldDelete = false;
      
      switch (pattern) {
        case 'all':
          shouldDelete = true;
          break;
        case 'category':
          shouldDelete = entry.filters.category === value;
          break;
        case 'location':
          // Invalidate based on distance range changes
          shouldDelete = entry.filters.distanceRange !== undefined;
          break;
        case 'budget':
          shouldDelete = entry.filters.budget === value;
          break;
      }
      
      if (shouldDelete) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    await this.saveCacheToStorage();
  }

  // Cache warming for popular queries
  async warmCache(popularFilters: UserFilters[]): Promise<void> {
    if (!this.config.warmingEnabled) return;
    
    console.log('🔥 Warming cache with popular queries...');
    
    for (const filters of popularFilters) {
      try {
        // Pre-fetch popular queries
        const response = await fetch('https://asia-southeast1-g-decider-backend.cloudfunctions.net/filterPlaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters, minResults: 5, useCache: false })
        });
        
        if (response.ok) {
          const data = await response.json();
          await this.set(filters, data);
        }
      } catch (error) {
        console.error('❌ Cache warming failed for filters:', filters, error);
      }
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
    
    const missRate = 1 - hitRate;
    const averageResponseTime = this.stats.totalRequests > 0 
      ? this.stats.totalResponseTime / this.stats.totalRequests 
      : 0;
    
    return {
      totalEntries: this.cache.size,
      hitRate,
      missRate,
      averageResponseTime,
      cacheSize: this.cache.size,
      evictions: this.stats.evictions
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
      this.saveCacheToStorage();
    }
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Save cache to AsyncStorage
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries());
      await AsyncStorage.setItem('filterCache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Failed to save cache to storage:', error);
    }
  }

  // Load cache from AsyncStorage
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('filterCache');
      if (cacheData) {
        const entries = JSON.parse(cacheData);
        this.cache = new Map(entries);
        console.log(`📦 Loaded ${this.cache.size} cache entries from storage`);
      }
    } catch (error) {
      console.error('❌ Failed to load cache from storage:', error);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem('filterCache');
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      evictions: 0,
      totalResponseTime: 0
    };
  }

  // Get popular queries for cache warming
  getPopularQueries(): UserFilters[] {
    const entries = Array.from(this.cache.values());
    
    // Sort by access count and return top queries
    entries.sort((a, b) => b.accessCount - a.accessCount);
    
    return entries.slice(0, 5).map(entry => entry.filters);
  }

  // Destroy instance (for testing)
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const enhancedCachingService = EnhancedCachingService.getInstance(); 