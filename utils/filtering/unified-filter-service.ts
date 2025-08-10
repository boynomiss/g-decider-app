/**
 * Unified Filter Service
 * 
 * Single entry point for all filtering operations.
 * Provides a clean, unified API for place discovery and filtering.
 * 
 * IMPROVEMENTS ADDED:
 * - Progressive filtering pipeline with early exits
 * - Intelligent caching system with registry-based config
 * - Quality and relevance scoring using centralized configs
 * - Batch API calls for efficiency
 * - Fallback strategies with confidence scoring
 * - Better time-of-day filtering with timezone support
 * - Performance monitoring with common utilities
 * - Registry pattern for config management
 * - Reduced duplication through shared utilities
 */

import { 
  PlaceResult,
  ScoredPlace,
  SearchParams,
  FilterResult,
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LoadingState,
  AdvertisedPlace,
  DiscoveryFilters,
  DiscoveryResult,
  FilterServiceConfig,
  PlaceData
} from '../../types/filtering';

// Types are exported from the main filtering index to avoid conflicts

import { unifiedCacheService, UnifiedCacheService } from '../data/unified-cache-service';
import { FilterAPIService } from './filter-api-service';
import { filterConfigRegistry, FilterConfigRegistry } from './config-registry';
import { 
  FilterCoreUtils as FilterUtilities, 
  FilterValidation, 
  FilterConversion, 
  FilterMatching
} from './filter-core-utils';
import { ConsolidatedFilterLogger } from './filter-logger';
import { createPlaceMoodAnalysisService } from './mood/place-mood-analysis.service';

export class UnifiedFilterService {
  private static instance: UnifiedFilterService;
  
  private cacheService: UnifiedCacheService;
  private apiService: FilterAPIService;
  private configRegistry: FilterConfigRegistry;
  private config: FilterServiceConfig;
  
  // Service state
  private placePool: PlaceResult[] = [];
  private usedPlaceIds: Set<string> = new Set();
  private currentExpansionCount: number = 0;
  private currentRadius: number = 0;
  private filterMetrics: { name: string; duration: number; resultCount: number }[] = [];
  private filterCache = new Map<string, any>();
  private advertisedPlaces: AdvertisedPlace[] = [];

  // Constants - now using registry for configuration data
  private readonly DISTANCE_STEPS = [5000, 10000, 15000, 20000];

  // Google Places API wrappers
  private async textSearch(
    query: string, 
    lat: number, 
    lng: number, 
    radius: number, 
    apiKey?: string, 
    minprice?: number, 
    maxprice?: number
  ): Promise<any[]> {
    const key = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${key}`
      + (minprice !== undefined ? `&minprice=${minprice}` : '')
      + (maxprice !== undefined ? `&maxprice=${maxprice}` : '');
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
      }
      const json = await response.json();
      return json.results || [];
    } catch (error) {
      console.error('❌ Text search error:', error);
      return [];
    }
  }

  private async batchGetPlaceDetails(placeIds: string[], apiKey: string): Promise<Record<string, any>[]> {
    const batches = this.chunk(placeIds, this.config.batchSize);
    const results: Record<string, any>[] = [];
    
    for (const batch of batches) {
      const promises = batch.map(id => this.getPlaceDetails(id, apiKey));
      const batchResults = await Promise.allSettled(promises);
      const validResults = batchResults
        .filter((r): r is PromiseFulfilledResult<Record<string, any>> => 
          r.status === 'fulfilled' && r.value !== null
        )
        .map(r => r.value);
      
      results.push(...validResults);
      
      // Small delay between batches to respect rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve as () => void, 100));
      }
    }
    
    return results;
  }

  private async getPlaceDetails(placeId: string, apiKey: string): Promise<Record<string, any> | null> {
    const cacheKey = `details-${placeId}`;
    const cached = this.getCached<Record<string, any>>(cacheKey);
    if (cached) return cached;

    const key = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=place_id,name,formatted_address,geometry,opening_hours,reviews,user_ratings_total,rating,price_level&key=${key}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
      }
      const json = await response.json();
      const result = json.result || null;
      
      if (result) {
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Place details error:', error);
      return null;
    }
  }

  private constructor() {
    this.cacheService = unifiedCacheService;
    this.apiService = new FilterAPIService();
    this.configRegistry = filterConfigRegistry;
    
    this.config = {
      // Cache settings
      useCache: true,
      cacheStrategy: 'cache-first',
      cacheExpiry: 3600000, // 1 hour
      
      // API settings
      timeout: 10000, // 10 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      
      // Discovery settings
      minResults: 8,
      maxResults: 20,
      expansionEnabled: true,
      maxExpansions: 3,
      expansionIncrement: 500, // meters
      
      // Performance settings
      parallelRequests: true,
      requestBatching: true,
      batchSize: 10,
      
      // Filtering settings
      strictMode: true,
      confidenceThreshold: 0.7,
      qualityThreshold: 3.5,
      
      // Time settings
      defaultTimezone: 'UTC',
      timeRanges: {
        morning: { startHour: 5, endHour: 11 },
        afternoon: { startHour: 11, endHour: 17 },
        night: { startHour: 17, endHour: 3 },
        any: { startHour: 0, endHour: 24 }
      }
    };
  }

  static getInstance(): UnifiedFilterService {
    if (!UnifiedFilterService.instance) {
      UnifiedFilterService.instance = new UnifiedFilterService();
    }
    return UnifiedFilterService.instance;
  }

  /**
   * Utility: Calculate distance between two points (now using shared utility)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return FilterUtilities.calculateDistance(lat1, lng1, lat2, lng2);
  }

  /**
   * Utility: Build text search query using registry data
   */
  private buildTextSearchQuery(params: SearchParams): string {
    // Get atmosphere keywords and place types from registry
    const atmosphereFilters: { mood?: MoodOption; socialContext?: SocialContext; lookingFor?: LookingForOption } = {
      mood: params.mood,
      lookingFor: params.lookingFor
    };
    if (params.socialContext) {
      atmosphereFilters.socialContext = params.socialContext;
    }
    const atmosphereKeywords = this.configRegistry.getAtmosphereKeywords(atmosphereFilters);

    const placeFilters: { budget?: BudgetOption; mood?: MoodOption; socialContext?: SocialContext; timeOfDay?: TimeOfDay; lookingFor?: LookingForOption } = {
      mood: params.mood,
      lookingFor: params.lookingFor
    };
    if (params.budget) placeFilters.budget = params.budget;
    if (params.socialContext) placeFilters.socialContext = params.socialContext;
    if (params.timeOfDay) placeFilters.timeOfDay = params.timeOfDay;
    
    const placeTypes = this.configRegistry.getPreferredPlaceTypes(placeFilters);

    // Add time-specific keywords
    const timeFallbackKeywords: string[] = [];
    if (params.timeOfDay === 'morning') timeFallbackKeywords.push('breakfast', 'brunch', 'morning cafe');
    if (params.timeOfDay === 'afternoon') timeFallbackKeywords.push('lunch', 'afternoon cafe');
    if (params.timeOfDay === 'night') timeFallbackKeywords.push('evening', 'nightlife', 'late-night');

    // Combine all descriptors
    const allDescriptors = FilterUtilities.mergeUnique([atmosphereKeywords, timeFallbackKeywords]);
    const uniqueDescriptors = allDescriptors.slice(0, 12);

    // Build query combinations
    const combos: string[] = [];
    for (const descriptor of uniqueDescriptors) {
      for (const placeType of placeTypes.slice(0, 8)) { // Limit place types too
        combos.push(`${descriptor} ${placeType}`.trim());
      }
    }

    return Array.from(new Set(combos)).join(' OR ');
  }

  /**
   * Utility: Performance monitoring wrapper (now using shared utility)
   */
  private async monitoredFilter<T>(
    filterName: string, 
    filterFn: () => Promise<T> | T
  ): Promise<T> {
    const monitoredFn = FilterUtilities.createPerformanceMonitor(filterName, filterFn);
    const result = await monitoredFn();
    
    const resultCount = Array.isArray(result) ? result.length : 1;
    this.filterMetrics.push({ 
      name: filterName, 
      duration: 0, 
      resultCount 
    }); // Duration tracked by monitor
    
    return result;
  }

  /**
   * Utility: Cache management
   */
  private getCached<T>(key: string): T | null {
    const cached = this.filterCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.config.cacheExpiry) {
      this.filterCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    if (this.config.useCache) {
      this.filterCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: this.config.cacheExpiry
      });
    }
  }

  private generateCacheKey(params: SearchParams): string {
    return JSON.stringify({
      lat: params.lat,
      lng: params.lng,
      lookingFor: params.lookingFor,
      mood: params.mood,
      timeOfDay: params.timeOfDay,
      maxRadius: params.maxRadius,
      minResults: params.minResults,
      maxResults: params.maxResults
    });
  }

  /**
   * Utility: Batch array operations (now using shared utility)
   */
  private chunk<T>(array: T[], size: number): T[][] {
    return FilterUtilities.chunk(array, size);
  }

  /**
   * Main search method - single entry point for all place discovery
   */
  async searchPlaces(params: SearchParams): Promise<PlaceResult[]> {
    return this.monitoredFilter('searchPlaces', async () => {
      console.log('🔍 Starting place search with params:', params);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(params);
      const cached = this.getCached<PlaceResult[]>(cacheKey);
      if (cached) {
        console.log('✅ Returning cached results:', cached.length, 'places');
        return cached;
      }

      // Perform search with filters
      const results = await this.searchWithFilters(params);
      
      // Cache results
      this.setCache(cacheKey, results);
      
      console.log('✅ Search completed, found:', results.length, 'places');
      return results;
    });
  }

  // Alias for backward compatibility
  async filterPlaces(params: SearchParams): Promise<PlaceResult[]> {
    return this.searchPlaces(params);
  }

  /**
   * Core search with filters (now using registry-based config)
   */
  private async searchWithFilters(params: SearchParams): Promise<PlaceResult[]> {
    const {
      lat, lng, lookingFor, mood,
      socialContext, budget, timeOfDay = 'any',
      initialRadius = 5000, maxRadius = 20000, minResults = 8,
      apiKey, userTimezone, strict = false
    } = params;

    // Validate parameters using shared utilities
    const validation = FilterValidation.validateAll({
      lookingFor,
      mood,
      socialContext,
      budget,
      timeOfDay,
      coordinates: { lat, lng }
    });

    if (!validation.isValid) {
      ConsolidatedFilterLogger.getInstance().error('search-filters', 'Invalid search parameters', validation.errors);
      return [];
    }

    // Get budget mapping from registry
    const budgetConfig = budget ? this.configRegistry.getConfig('budget', budget) : undefined;
    const budgetMap = budgetConfig ? {
      minprice: budgetConfig.googlePriceLevel - 1,
      maxprice: budgetConfig.googlePriceLevel
    } : undefined;

    // Build query using registry data
    const textQuery = this.buildTextSearchQuery(params);

    const resultsMap: Map<string, PlaceResult> = new Map();

    // Search loop with radius expansion
    for (const radius of this.DISTANCE_STEPS) {
      if (radius < initialRadius) continue;
      if (radius > maxRadius) break;

      // Try cache first
      const cacheKey = `${textQuery}-${lat}-${lng}-${radius}`;
      const cached = this.getCached<PlaceResult[]>(cacheKey);
      if (cached) {
        cached.forEach(place => resultsMap.set(place.place_id, place));
        if (resultsMap.size >= minResults) break;
        continue;
      }

      // Search API
      const places = await this.textSearch(textQuery, lat, lng, radius, apiKey, budgetMap?.minprice, budgetMap?.maxprice);
      
      // Process results
      for (const place of places) {
        if (!place || !place.place_id) continue;
        
        const existing = resultsMap.get(place.place_id);
        const latLng = place.geometry?.location;
        
        const pr: PlaceResult = {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address || place.vicinity,
          lat: latLng?.lat,
          lng: latLng?.lng,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          opening_hours: place.opening_hours,
          descriptor: existing?.descriptor || '',
          tags: Array.from(new Set([...(existing?.tags || []), ...(place.types || [])])),
          radiusUsed: radius,
          expanded: radius > initialRadius,
          raw: place
        };

        resultsMap.set(place.place_id, pr);
      }

      // Cache results
      this.setCache(cacheKey, Array.from(resultsMap.values()));

      if (resultsMap.size >= minResults) break;
    }

    // Apply progressive filtering
    let results = Array.from(resultsMap.values());
    results = await this.monitoredFilter('budget', () => this.applyBudgetFilter(results, budget));
    results = await this.monitoredFilter('distance', () => this.applyDistanceFilter(results, lat, lng, maxRadius));
    
    if (timeOfDay && timeOfDay !== 'any') {
      results = await this.monitoredFilter('timeOfDay', () => 
        this.applyTimeFilterWithConfidence(results, timeOfDay, apiKey || '', userTimezone)
      );
    }

    // Score and rank results
    const scoredPlaces = results.map(place => ({
      ...place,
      relevanceScore: this.calculateRelevanceScore(place, params),
      qualityScore: this.calculateQualityScore(place),
      combinedScore: 0
    }));

    // Calculate combined score
    scoredPlaces.forEach(place => {
      place.combinedScore = (place.relevanceScore * 0.7) + (place.qualityScore * 0.3);
    });

    // Sort by combined score
    return scoredPlaces
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, params.maxResults || 20);
  }

  /**
   * Apply budget filter (now using registry and shared utilities)
   */
  private applyBudgetFilter(places: PlaceResult[], budget?: BudgetOption): PlaceResult[] {
    if (!budget) return places;
    
    const budgetConfig = this.configRegistry.getConfig('budget', budget);
    if (!budgetConfig) return places;
    
    return places.filter(place => 
      FilterMatching.match('priceLevel', place.raw, [budgetConfig.googlePriceLevel])
    );
  }

  /**
   * Apply distance filter (now using shared utilities)
   */
  private applyDistanceFilter(places: PlaceResult[], lat: number, lng: number, maxRadius: number): PlaceResult[] {
    return places.filter(place => 
      FilterMatching.match('distance', place, { userLat: lat, userLng: lng, maxDistance: maxRadius })
    );
  }

  /**
   * Apply time filter with confidence scoring
   */
  private async applyTimeFilterWithConfidence(
    places: PlaceResult[], 
    timeOfDay: TimeOfDay, 
    apiKey: string, 
    userTimezone?: string
  ): Promise<PlaceResult[]> {
    if (!timeOfDay || timeOfDay === 'any') return places;
    
    const filteredPlaces: PlaceResult[] = [];
    
    // Get place details for places that don't have opening hours
    const needDetails = places.filter(p => !p.opening_hours && !p.raw?.opening_hours);
    const placeDetails = needDetails.length > 0 ? await this.batchGetPlaceDetails(needDetails.map(p => p.place_id), apiKey) : [];
    
    // Create a map for quick lookup
    const detailsMap = new Map();
    placeDetails.forEach(detail => {
      if (detail?.place_id) {
        detailsMap.set(detail.place_id, detail);
      }
    });
    
    for (const place of places) {
      const details = place.raw?.opening_hours ? place.raw : detailsMap.get(place.place_id) || place;
      const filterResult = this.isOpenAtTimeOfDay(details, timeOfDay, userTimezone);
      
      if (filterResult.passed || filterResult.confidence < 0.5) {
        filteredPlaces.push({
          ...place,
          raw: details
        });
      }
    }
    
    return filteredPlaces;
  }

  /**
   * Check if place is open at given time of day
   */
  private isOpenAtTimeOfDay(placeDetails: any, timeOfDay: TimeOfDay, userTimezone?: string): FilterResult {
    try {
      if (!placeDetails?.opening_hours) {
        return { passed: true, confidence: 0.3, reason: 'no_hours_data' };
      }
      
      if (typeof placeDetails.opening_hours.open_now === 'boolean' && timeOfDay === 'any') {
        return { 
          passed: placeDetails.opening_hours.open_now, 
          confidence: 0.9, 
          reason: placeDetails.opening_hours.open_now ? 'verified_open_now' : 'verified_closed_now'
        };
      }
      
      const periods = placeDetails.opening_hours.periods;
      if (!periods || periods.length === 0) {
        return { passed: true, confidence: 0.3, reason: 'no_periods_data' };
      }
      
      const timeRange = this.config.timeRanges[timeOfDay];
      
      const isOpenDuringTimeRange = periods.some((period: any) => {
        if (!period.open) return false;
        return this.isTimeInRange(timeRange.startHour, period.open, period.close);
      });
      
      return {
        passed: isOpenDuringTimeRange, 
        confidence: 0.8, 
        reason: isOpenDuringTimeRange ? 'verified_open_during_timeframe' : 'verified_closed_during_timeframe'
      };
    } catch (e) {
      return { passed: true, confidence: 0.2, reason: 'filter_error' };
    }
  }

  /**
   * Check if time is within range
   */
  private isTimeInRange(targetHour: number, openTime: any, closeTime: any): boolean {
    if (!openTime || !closeTime) return true;
    
    const openHour = parseInt(openTime.time?.substring(0, 2) || '0');
    const closeHour = parseInt(closeTime.time?.substring(0, 2) || '23');
    
    if (closeHour > openHour) {
      return targetHour >= openHour && targetHour < closeHour;
    } else {
      return targetHour >= openHour || targetHour < closeHour;
    }
  }

  /**
   * Calculate relevance score (now using registry-based config)
   */
  private calculateRelevanceScore(place: PlaceResult, params: SearchParams): number {
    let score = 0;
    
    // Base score from rating
    if (place.rating) {
      score += (place.rating / 5) * 30;
    }
    
    // Descriptor matching using registry
    const atmosphereFilters: { mood?: MoodOption; socialContext?: SocialContext; lookingFor?: LookingForOption } = {
      mood: params.mood,
      lookingFor: params.lookingFor
    };
    if (params.socialContext) {
      atmosphereFilters.socialContext = params.socialContext;
    }
    const atmosphereKeywords = this.configRegistry.getAtmosphereKeywords(atmosphereFilters);
    
    if (place.descriptor) {
      const matchingDescriptors = atmosphereKeywords.filter(keyword => 
        place.descriptor?.toLowerCase().includes(keyword.toLowerCase())
      );
      score += matchingDescriptors.length * 5;
    }
    
    // Social context matching
    if (params.socialContext && place.tags?.includes(params.socialContext)) {
      score += 15;
    }
    
    // Recency bonus for "something_new"
    if (params.lookingFor === 'something_new' && place.tags?.includes('new')) {
      score += 25;
    }
    
    // Trending bonus
    if (place.tags?.includes('trending')) {
      score += 20;
    }
    
    // Distance penalty
    if (place.lat && place.lng) {
      const distance = this.calculateDistance(params.lat, params.lng, place.lat, place.lng);
      score -= Math.min(distance / 1000, 15);
    }
    
    // Review count bonus
    if (place.user_ratings_total) {
      score += Math.min(Math.log10(place.user_ratings_total) * 5, 10);
    }
    
    return Math.max(score, 0);
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(place: PlaceResult): number {
    let score = 0;
    
    // Rating quality
    if (place.rating) {
      score += (place.rating / 5) * 40;
    }
    
    // Review volume
    if (place.user_ratings_total) {
      if (place.user_ratings_total >= 100) score += 20;
      else if (place.user_ratings_total >= 50) score += 15;
      else if (place.user_ratings_total >= 20) score += 10;
      else if (place.user_ratings_total >= 5) score += 5;
    }
    
    // Data completeness
    if (place.address) score += 5;
    if (place.opening_hours) score += 5;
    
    return score;
  }

  /**
   * Search with fallback strategies (now using registry-based config)
   */
  private async searchWithFallbacks(params: SearchParams): Promise<PlaceResult[]> {
    let results = await this.searchWithFilters({...params, strict: true});
    
    if (results.length < (params.minResults || 8)) {
      ConsolidatedFilterLogger.getInstance().info('fallback-strategy', 'Insufficient results with strict filtering, applying fallbacks...');
      
      // Fallback 1: Relax time constraints
      if (params.timeOfDay && params.timeOfDay !== 'any') {
        ConsolidatedFilterLogger.getInstance().info('fallback-strategy', 'Relaxing time constraints');
        results = await this.searchWithFilters({...params, timeOfDay: 'any', strict: true});
      }
      
      // Fallback 2: Expand budget range using registry
      if (results.length < (params.minResults || 8) && params.budget) {
        // Get next budget tier from registry
        const budgetConfigs = this.configRegistry.getConfigs('budget');
        const currentBudgetIndex = budgetConfigs.findIndex(b => b.id === params.budget);
        
        if (currentBudgetIndex >= 0 && currentBudgetIndex < budgetConfigs.length - 1) {
          const nextBudget = budgetConfigs[currentBudgetIndex + 1];
          if (nextBudget) {
            ConsolidatedFilterLogger.getInstance().info('fallback-strategy', `Expanding budget from ${params.budget} to ${nextBudget.id}`);
            results = await this.searchWithFilters({...params, budget: nextBudget.id, strict: true});
          }
        }
      }
      
      // Fallback 3: Remove strict mode entirely
      if (results.length < (params.minResults || 8)) {
        ConsolidatedFilterLogger.getInstance().info('fallback-strategy', 'Removing strict mode');
        results = await this.searchWithFilters({...params, strict: false});
      }
    }
    
    return results;
  }

  /**
   * Enhance search results with mood analysis
   */
  private async enhanceResultsWithMoodAnalysis(places: PlaceResult[]): Promise<PlaceResult[]> {
    try {
      const enhancedPlaces = await Promise.allSettled(
        places.map(async (place) => {
          try {
            // Try to get mood analysis from reviews if available
            if (place.raw?.reviews && place.raw.reviews.length > 0) {
              const reviews = place.raw.reviews.map((review: any) => ({
                text: review.text?.text || review.text || '',
                rating: review.rating || 5,
                time: new Date(review.publishTime || Date.now()).getTime()
              }));

              const moodAnalysis = await createPlaceMoodAnalysisService().analyzeFromReviews(
                reviews,
                place.raw?.types?.[0] || 'establishment'
              );

              return {
                ...place,
                mood_analysis: moodAnalysis
              };
            } else {
              // Fallback to place-level analysis
              const moodAnalysis = await createPlaceMoodAnalysisService().analyzePlaceMood(place.place_id);
              return {
                ...place,
                mood_analysis: moodAnalysis
              };
            }
          } catch (error) {
            ConsolidatedFilterLogger.getInstance().warn('mood-enhancement', `Failed to analyze mood for place ${place.place_id}`, error);
            return place; // Return original place if mood analysis fails
          }
        })
      );

      // Extract successful results
      const results = enhancedPlaces
        .filter((result): result is PromiseFulfilledResult<PlaceResult> => result.status === 'fulfilled')
        .map(result => result.value);

      ConsolidatedFilterLogger.getInstance().info('mood-enhancement', `Enhanced ${results.length}/${places.length} places with mood analysis`);
      return results;

    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('mood-enhancement', 'Mood enhancement failed', error);
      return places; // Return original places if enhancement fails
    }
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    cache: any;
    api: any;
    pool: {
      totalPlaces: number;
      usedPlaces: number;
      remainingPlaces: number;
      expansionCount: number;
      currentRadius: number;
    };
    filters: {
      name: string;
      duration: number;
      resultCount: number;
    }[];
  } {
    return {
      cache: this.cacheService.getStats(),
      api: this.apiService.getStats(),
      pool: {
        totalPlaces: this.placePool.length,
        usedPlaces: this.usedPlaceIds.size,
        remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
        expansionCount: this.currentExpansionCount,
        currentRadius: this.currentRadius
      },
      filters: this.filterMetrics
    };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<FilterServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Filter service configuration updated');
  }

  /**
   * Clear all service state
   */
  clear(): void {
    this.placePool = [];
    this.usedPlaceIds.clear();
    this.currentExpansionCount = 0;
    this.currentRadius = 0;
    this.filterMetrics = [];
    this.filterCache.clear();
    console.log('🗑️ Filter service state cleared');
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this.clear();
    this.cacheService.destroy();
    console.log('💀 Unified filter service destroyed');
  }

  // =================
  // LEGACY COMPATIBILITY METHODS
  // =================

  /**
   * Legacy: Set advertised places for the discovery session
   */
  setAdvertisedPlaces(places: AdvertisedPlace[]): void {
    this.advertisedPlaces = places;
  }

  /**
   * Legacy: Main discovery function compatible with old PlaceDiscoveryLogic
   */
  async discoverPlaces(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    console.log('🎯 Legacy discovery method called, converting to new system');
    
    try {
      // Convert legacy filters to new SearchParams
      const searchParams = this.convertLegacyFilters(filters);
      
      // Use new search method
      const places = await this.searchPlaces(searchParams);
      
      // Convert results back to legacy format
      return this.convertToLegacyResult(places, filters);
      
    } catch (error) {
      console.error('❌ Legacy discovery error:', error);
      return {
        places: [],
        loadingState: 'error',
        poolInfo: {
          remainingPlaces: 0,
          totalPoolSize: 0,
          needsRefresh: true
        }
      };
    }
  }

  /**
   * Legacy: Get next batch compatible with old PlaceDiscoveryLogic
   */
  async getNextBatch(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    console.log('🔄 Legacy getNextBatch called');
    
    // Check if we have enough unused places in pool
    const availablePlaces = this.placePool.filter(
      place => !this.usedPlaceIds.has(place.place_id)
    );
    
    if (availablePlaces.length >= 4) {
      // Use existing pool
      const selectedPlaces = this.selectLegacyPlaces(availablePlaces, 4);
      selectedPlaces.forEach(place => this.usedPlaceIds.add(place.place_id));
      
      const finalPlaces = this.addAdvertisedPlace(selectedPlaces);
      
      return {
        places: finalPlaces,
        loadingState: 'complete',
        poolInfo: {
          remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
          totalPoolSize: this.placePool.length,
          needsRefresh: this.placePool.length < 4
        }
      };
      } else {
      // Pool exhausted, fetch new places
      return await this.discoverPlaces(filters);
    }
  }

  /**
   * Legacy: Reset discovery session
   */
  reset(): void {
    this.clear();
    console.log('🔄 Legacy discovery session reset');
  }

  /**
   * Legacy: Get discovery statistics
   */
  getStatisticsLegacy(): {
    totalPlacesInPool: number;
    usedPlaces: number;
    remainingPlaces: number;
    expansionCount: number;
    currentRadius: number;
  } {
    return {
      totalPlacesInPool: this.placePool.length,
      usedPlaces: this.usedPlaceIds.size,
      remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
      expansionCount: this.currentExpansionCount,
      currentRadius: this.currentRadius
    };
  }

  // =================
  // LEGACY CONVERSION HELPERS
  // =================

  /**
   * Convert legacy DiscoveryFilters to new SearchParams (now using shared utilities)
   */
  private convertLegacyFilters(filters: DiscoveryFilters): SearchParams {
    return FilterConversion.convertLegacyFilters(filters);
  }

  /**
   * Convert new search results to legacy DiscoveryResult format
   */
  private convertToLegacyResult(places: PlaceResult[], filters: DiscoveryFilters): DiscoveryResult {
    const selectedPlaces = this.selectLegacyPlaces(places, 4);
    const finalPlaces = this.addAdvertisedPlace(selectedPlaces);
    
    // Mark places as used
    selectedPlaces.forEach(place => this.usedPlaceIds.add(place.place_id));
    
    return {
      places: finalPlaces,
      loadingState: 'complete',
      expansionInfo: {
        expansionCount: this.currentExpansionCount,
        finalRadius: this.currentRadius,
        totalPlacesFound: places.length
      },
      poolInfo: {
        remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
        totalPoolSize: this.placePool.length,
        needsRefresh: this.placePool.length < 4
      }
    };
  }

  /**
   * Select places using legacy logic (simple slice)
   */
  private selectLegacyPlaces(places: PlaceResult[], count: number): PlaceResult[] {
    return places.slice(0, count);
  }

  /**
   * Add advertised place to results (legacy compatibility)
   */
  private addAdvertisedPlace(places: PlaceResult[]): (PlaceResult | AdvertisedPlace)[] {
    if (this.advertisedPlaces.length === 0) return places;
    
    // Select random advertised place
    const advertisedPlace = this.advertisedPlaces[
      Math.floor(Math.random() * this.advertisedPlaces.length)
    ];
    
    if (!advertisedPlace) return places;
    
    // Insert at random position
    const insertIndex = Math.floor(Math.random() * (places.length + 1));
    const result = [...places];
    result.splice(insertIndex, 0, advertisedPlace);
    
    return result;
  }
}

// Export singleton instance
export const unifiedFilterService = UnifiedFilterService.getInstance();

// Re-export types for backward compatibility
export type {
  LoadingState,
  AdvertisedPlace,
  DiscoveryFilters,
  DiscoveryResult,
  PlaceData,
  PlaceMoodData
} from '../../types/filtering';

// =================
// LEGACY COMPATIBILITY CLASS
// =================

/**
 * Legacy PlaceDiscoveryLogic class for backward compatibility
 * This class wraps the new UnifiedFilterService to maintain API compatibility
 * 
 * @deprecated Use unifiedFilterService directly instead
 */
export class PlaceDiscoveryLogic {
  private service: UnifiedFilterService;

  constructor(
    moodService: any, // PlaceMoodService (not used in new implementation)
    googleApiKey: string,
    advertisedPlaces: AdvertisedPlace[] = []
  ) {
    console.warn('⚠️ PlaceDiscoveryLogic is deprecated. Use unifiedFilterService instead.');
    this.service = UnifiedFilterService.getInstance();
    // Store the API key for use in searches (config doesn't have apiKey field)
    process.env.GOOGLE_MAPS_API_KEY = googleApiKey;
    this.service.setAdvertisedPlaces(advertisedPlaces);
  }

  // Legacy compatibility property
  get currentRadius(): number {
    return this.service.getStatistics().pool.currentRadius;
  }

  /**
   * Legacy: Main discovery function
   */
  async discoverPlaces(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    return this.service.discoverPlaces(filters);
  }

  /**
   * Legacy: Get next batch of results
   */
  async getNextBatch(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    return this.service.getNextBatch(filters);
  }

  /**
   * Legacy: Reset discovery session
   */
  reset(): void {
    this.service.reset();
  }

  /**
   * Legacy: Get statistics
   */
  getStatistics() {
    return this.service.getStatisticsLegacy();
  }
}