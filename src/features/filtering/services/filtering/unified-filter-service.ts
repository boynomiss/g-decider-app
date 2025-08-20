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
  SearchParams,
  FilterResult,
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption
} from '../../../../shared/types/types/filtering';
import type { DiscoveryFilters } from '../../types/filter-interfaces';
import type { PlaceResult, AdvertisedPlace as CoreAdvertisedPlace } from '../../types/filter-results';
type AdvertisedPlace = CoreAdvertisedPlace;

import { 
  ScoredPlace
} from '../../types/filter-results';

// Types are exported from the main filtering index to avoid conflicts

import { unifiedCacheService, UnifiedCacheService } from '../../../../services/cache/data/unified-cache-service';
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
import { getAPIKey } from '../../../../shared/constants/config/api-keys';

// Add these imports to match the UI logic exactly
// Fix the import paths to match the actual directory structure
import { getCategoryFilter } from './configs/category-config';
import { getMoodCategory } from './configs/mood-config';
import { getSocialContext } from './configs/social-config';
import { getBudgetCategory, BUDGET_PRICE_MAPPING } from './configs/budget-config';
import { getTimeCategory } from './configs/time-config';

type TimeRanges = Record<TimeOfDay, { startHour: number; endHour: number }>;

interface FilterServiceConfig {
  useCache: boolean;
  cacheStrategy: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  cacheExpiry: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  minResults: number;
  maxResults: number;
  expansionEnabled: boolean;
  maxExpansions: number;
  expansionIncrement: number;
  parallelRequests: boolean;
  requestBatching: boolean;
  batchSize: number;
  strictMode: boolean;
  confidenceThreshold: number;
  qualityThreshold: number;
  defaultTimezone: string;
  timeRanges: TimeRanges;
}

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

  // Constants - incremental 500m steps starting at default "short drive" (5km)
  private readonly DISTANCE_STEPS = Array.from({ length: 31 }, (_, i) => 5000 + i * 500); // 5km -> 20km by 500m

  // Google Places API wrappers - Updated to use new API with fallback
  private async textSearch(
    query: string, 
    lat: number, 
    lng: number, 
    radius: number, 
    apiKey?: string, 
    minprice?: number, 
    maxprice?: number
  ): Promise<any[]> {
    let key = apiKey;
    if (!key) {
      try {
        key = getAPIKey.places();
      } catch (error) {
        console.error('❌ No Google Places API key available');
        throw new Error('Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
      }
    }
    
    console.log('🔑 textSearch API key check:', {
      hasApiKey: !!key,
      keyLength: key.length,
      keyPrefix: key.substring(0, 10) + '...',
      source: apiKey ? 'parameter' : 'centralized config'
    });
    
    // If budget filtering is needed, prefer legacy API for better price filtering support
    if (minprice !== undefined || maxprice !== undefined) {
      console.log('💰 Budget filtering detected, using legacy API for better price filtering support');
      try {
        return await this.textSearchLegacyAPI(query, lat, lng, radius, key, minprice, maxprice);
      } catch (error) {
        console.warn('⚠️ Legacy API failed, falling back to new API:', error);
        return await this.textSearchNewAPI(query, lat, lng, radius, key, minprice, maxprice);
      }
    }
    
    // Try new Google Places API first, fallback to legacy if it fails
    try {
      return await this.textSearchNewAPI(query, lat, lng, radius, key, minprice, maxprice);
    } catch (error) {
      console.warn('⚠️ New Places API failed, falling back to legacy API:', error);
      return await this.textSearchLegacyAPI(query, lat, lng, radius, key, minprice, maxprice);
    }
  }

  // New Google Places API implementation
  private async textSearchNewAPI(
    query: string, 
    lat: number, 
    lng: number, 
    radius: number, 
    key: string, 
    minprice?: number, 
    maxprice?: number
  ): Promise<any[]> {
    const url = `https://places.googleapis.com/v1/places:searchText`;
    
    const requestBody: any = {
      textQuery: query,
      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng
          },
          radius: radius
        }
      },
      maxResultCount: 20
    };

    // Note: Google Places API v1 doesn't support price filtering in request body
    // We'll filter results after receiving them based on priceLevel field

    console.log('🌐 Making New Google Places API request:', {
      url,
      query,
      locationBias: { lat, lng, radius },
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key.substring(0, 10) + '...',
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.types,places.id,places.location,places.priceLevel,places.userRatingCount,places.regularOpeningHours,places.photos'
      }
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.types,places.id,places.location,places.priceLevel,places.userRatingCount,places.regularOpeningHours,places.photos'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ New Google Places API error response:', {
        status: response.status,
        statusText: response.statusText,
        responseText: text,
        requestUrl: url,
        requestBody: JSON.stringify(requestBody, null, 2)
      });
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
    }

    const json = await response.json();
    let places = json.places || [];

    // Filter by price level if specified (Google Places API v1 doesn't support this in request)
    if (minprice !== undefined || maxprice !== undefined) {
      places = places.filter((place: any) => {
        const placePriceLevel = place.priceLevel;
        if (placePriceLevel === undefined || placePriceLevel === null) {
          return true; // Include places without price level info
        }
        
        if (minprice !== undefined && placePriceLevel < minprice) {
          return false;
        }
        if (maxprice !== undefined && placePriceLevel > maxprice) {
          return false;
        }
        return true;
      });
    }

    // Convert new API format to legacy format for compatibility
    return places.map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || 'Unknown Place',
      formatted_address: place.formattedAddress || 'Unknown Address',
      geometry: {
        location: {
          lat: place.location?.latitude || lat,
          lng: place.location?.longitude || lng
        }
      },
      rating: place.rating || 0,
      user_ratings_total: place.userRatingCount || 0,
      // Don't default to 0 - preserve undefined/null for proper filtering
      price_level: place.priceLevel !== undefined ? place.priceLevel : undefined,
      types: place.types || [],
      opening_hours: place.regularOpeningHours ? {
        open_now: true, // Default to open since we don't have this info
        weekday_text: ['Hours available'] // Placeholder
      } : undefined,
      // Add photos with proper URL generation
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.name, // New API uses 'name' field
        width: photo.widthPx || 400,
        height: photo.heightPx || 400
      })) || []
    }));
  }

  // Legacy Google Places API implementation as fallback
  private async textSearchLegacyAPI(
    query: string, 
    lat: number, 
    lng: number, 
    radius: number, 
    key: string, 
    minprice?: number, 
    maxprice?: number
  ): Promise<any[]> {
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    
    const params = new URLSearchParams({
      query,
      location: `${lat},${lng}`,
      radius: radius.toString(),
      key
    });
    
    if (minprice !== undefined) {
      params.append('minprice', minprice.toString());
    }
    if (maxprice !== undefined) {
      params.append('maxprice', maxprice.toString());
    }
    
    const fullUrl = `${url}?${params.toString()}`;
    
    console.log('🌐 Making Legacy Google Places API request:', {
      url: fullUrl,
      query,
      location: { lat, lng, radius }
    });
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Legacy Google Places API error response:', {
        status: response.status,
        statusText: response.statusText,
        responseText: text,
        requestUrl: fullUrl
      });
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
    }
    
    const json = await response.json();
    
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      console.error('❌ Legacy Google Places API status error:', {
        status: json.status,
        errorMessage: json.error_message,
        results: json.results?.length || 0
      });
      throw new Error(`Google Places API error: ${json.status} - ${json.error_message || 'Unknown error'}`);
    }
    
    return json.results || [];
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

    let key = apiKey;
    if (!key) {
      try {
        key = getAPIKey.places();
      } catch (error) {
        console.error('❌ No Google Places API key available');
        throw new Error('Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
      }
    }
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,regularOpeningHours,reviews,userRatingCount,rating,priceLevel'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Place details API status error:', {
          errorMessage: text,
          placeId,
          status: response.status
        });
        return null;
      }
      
      const result = await response.json();
      
      if (result) {
        // Transform new API response to match legacy format for compatibility
        const transformedResult = {
          place_id: result.id,
          name: result.displayName?.text || result.displayName,
          formatted_address: result.formattedAddress,
          geometry: result.location ? {
            location: {
              lat: result.location.latitude,
              lng: result.location.longitude
            }
          } : undefined,
          opening_hours: result.regularOpeningHours,
          reviews: result.reviews,
          user_ratings_total: result.userRatingCount,
          rating: result.rating,
          price_level: result.priceLevel
        };
        
        this.setCache(cacheKey, transformedResult);
        return transformedResult;
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
   * Enhanced: Build dynamic text search query using EXACT UI logic
   * This ensures 100% alignment between what users see and what gets searched
   */
  private buildDynamicTextSearchQuery(params: SearchParams): string {
    const searchTerms: string[] = [];
    
    // 1. Category-based terms (exact UI logic)
    if (params.lookingFor) {
      const category = getCategoryFilter(params.lookingFor);
      if (category) {
        searchTerms.push(category.label.toLowerCase());
        searchTerms.push(...category.searchKeywords);
      }
    }
    
    // 2. Mood-based terms (exact UI logic) - FIXED: Handle numeric mood values
    if (params.mood !== null) {
      // Convert numeric mood to string category for the UI helper functions
      const mood = getMoodCategory(params.mood);
      if (mood) {
        searchTerms.push(mood.label.toLowerCase());
        searchTerms.push(...mood.atmosphereKeywords);
      }
    }
    
    // 3. Social context terms (exact UI logic)
    if (params.socialContext) {
      const social = getSocialContext(params.socialContext);
      if (social) {
        searchTerms.push(social.label.toLowerCase());
        searchTerms.push(...social.atmosphereKeywords);
      }
    }
    
    // 4. Budget terms (exact UI logic) - REMOVED: Don't limit search by budget terms
    // Budget filtering happens after API call, not during search
    // if (params.budget) {
    //   const budget = getBudgetCategory(params.budget);
    //   if (budget) {
    //     searchTerms.push(budget.label.toLowerCase());
    //     searchTerms.push(...budget.atmosphereKeywords);
    //   }
    // }
    
    // 5. Time-based terms (exact UI logic)
    if (params.timeOfDay) {
      const time = getTimeCategory(params.timeOfDay);
      if (time) {
        searchTerms.push(time.label.toLowerCase());
      }
    }
    
    // 6. Place types from registry (enhanced with UI logic)
    const placeFilters: { budget?: BudgetOption; mood?: MoodOption; socialContext?: SocialContext; timeOfDay?: TimeOfDay; lookingFor?: LookingForOption } = {};
    if (params.mood !== null) placeFilters.mood = this.convertNumericMoodToString(params.mood) as MoodOption;
    if (params.socialContext) placeFilters.socialContext = params.socialContext;
    if (params.budget) placeFilters.budget = params.budget;
    if (params.timeOfDay) placeFilters.timeOfDay = params.timeOfDay;
    if (params.lookingFor) placeFilters.lookingFor = params.lookingFor;
    const placeTypes = this.configRegistry.getPreferredPlaceTypes(placeFilters);
    searchTerms.push(...placeTypes);
    
    // 7. Looking for specific terms (additional enhancement)
    if (params.lookingFor) {
      const lookingForKeywords = this.getLookingForKeywords(params.lookingFor);
      searchTerms.push(...lookingForKeywords);
    }
    
    // Remove duplicates and filter out empty strings (exact UI logic)
    const uniqueTerms = [...new Set(searchTerms)].filter(term => term.trim().length > 0);

    // Rotate/swap tokens with a small seeded randomness for variety per press
    const seed = this.createSeed();
    const rotatedTerms = this.rotateArray(uniqueTerms, Math.floor(seed % Math.max(1, uniqueTerms.length)));

    // Create optimized search strategies for API efficiency
    return this.createOptimizedSearchStrategies(rotatedTerms, params);
  }

  /**
   * Create multiple search strategies for better API coverage
   * Now using the exact terms from UI logic
   */
  private createOptimizedSearchStrategies(terms: string[], params: SearchParams): string {
    const strategies: string[] = [];

    const seed = this.createSeed();
    const shuffledTerms = this.seededShuffle([...terms], seed);

    // Strategy 1: Core category + mood combination (most specific)
    if (params.lookingFor && params.mood !== null) {
      const coreTerms = shuffledTerms.slice(0, 8);
      strategies.push(coreTerms.join(' '));
    }

    // Strategy 2: Atmosphere-focused search (using exact UI terms)
    const atmosphereTerms = shuffledTerms.filter(term =>
      !['restaurant', 'cafe', 'bar', 'park', 'museum'].includes(term)
    ).slice(0, 6);
    if (atmosphereTerms.length > 0) {
      strategies.push(atmosphereTerms.join(' '));
    }

    // Strategy 3: Place type + context combinations
    const placeTypes = shuffledTerms.filter(term =>
      ['restaurant', 'cafe', 'bar', 'park', 'museum', 'gallery', 'theater'].includes(term)
    );
    if (placeTypes.length > 0 && params.mood !== null) {
      const mood = getMoodCategory(params.mood);
      if (mood) {
        const moodTerms = this.seededShuffle([mood.label.toLowerCase(), ...mood.atmosphereKeywords], seed).slice(0, 3);
        placeTypes.forEach(placeType => {
          moodTerms.forEach(moodTerm => {
            strategies.push(`${moodTerm} ${placeType}`);
          });
        });
      }
    }

    // Randomly rotate strategy order slightly to vary token order
    const rotated = this.rotateArray(strategies, Math.floor(seed % Math.max(1, strategies.length)));

    // Limit strategies to avoid API overload
    const limitedStrategies = rotated.slice(0, 5);

    return limitedStrategies.join(' OR ');
  }

  /**
   * Convert numeric mood value (0-100) to string category
   * This matches the logic used in the MoodSlider component
   */
  private convertNumericMoodToString(moodValue: number): 'chill' | 'neutral' | 'hype' {
    if (moodValue <= 33.33) return 'chill';
    if (moodValue <= 66.66) return 'neutral';
    return 'hype';
  }

  // Keep the helper method for "Looking For" since it's not in the UI logic
  private getLookingForKeywords(lookingFor: LookingForOption): string[] {
    const lookingForMap: Record<string, string[]> = {
      'something-new': ['new', 'recently opened', 'just opened', 'latest'],
      'favorite': ['popular', 'favorite', 'well-known', 'established'],
      'hidden-gem': ['hidden gem', 'underrated', 'local favorite', 'secret spot']
    };
    return lookingForMap[lookingFor] || [];
  }

  /**
   * Get mood-specific atmosphere phrases for enhanced search
   */
  private getMoodSpecificPhrases(moodId: string): string[] {
    const moodPhrases: Record<string, string[]> = {
      'chill': [
        'peaceful atmosphere', 'relaxing vibe', 'calm environment', 'tranquil setting',
        'serene space', 'quiet atmosphere', 'gentle ambiance', 'soothing environment',
        'mellow vibes', 'zen atmosphere', 'meditative space', 'contemplative setting',
        'introspective atmosphere', 'low-key vibe', 'laid-back atmosphere', 'easygoing environment',
        'unhurried pace', 'leisurely atmosphere', 'restful space', 'cozy atmosphere',
        'intimate setting', 'warm environment', 'welcoming atmosphere', 'comforting space',
        'nurturing environment', 'stress-free atmosphere', 'unwinding space', 'de-stressing environment',
        'mindful atmosphere', 'centered space', 'grounded environment'
      ],
      'neutral': [
        'balanced atmosphere', 'moderate energy', 'casual vibe', 'comfortable setting',
        'versatile space', 'pleasant environment', 'nice atmosphere', 'decent vibe',
        'good energy', 'okay atmosphere', 'fine environment', 'average energy',
        'standard setting', 'conventional atmosphere', 'well-rounded environment',
        'middle-ground atmosphere', 'moderate energy', 'casual atmosphere', 'comfortable setting',
        'versatile space', 'pleasant environment', 'nice vibe', 'decent atmosphere',
        'good energy', 'okay vibes', 'fine atmosphere', 'average energy', 'standard setting',
        'conventional atmosphere', 'friendly environment', 'approachable atmosphere',
        'accessible setting', 'practical space', 'functional environment', 'reliable atmosphere'
      ],
      'hype': [
        'energetic atmosphere', 'exciting vibe', 'lively environment', 'thrilling setting',
        'dynamic space', 'vibrant atmosphere', 'buzzing environment', 'electric vibe',
        'amazing atmosphere', 'incredible environment', 'fantastic space', 'awesome setting',
        'epic atmosphere', 'legendary environment', 'intense vibe', 'powerful atmosphere',
        'strong energy', 'bold setting', 'daring environment', 'adventurous space',
        'wild atmosphere', 'crazy vibe', 'insane environment', 'outrageous setting',
        'extreme atmosphere', 'radical environment', 'pumping vibe', 'jumping atmosphere',
        'bouncing environment', 'rocking space', 'rolling atmosphere', 'flying vibe',
        'soaring environment', 'high-energy atmosphere', 'fast-paced environment',
        'action-packed space', 'adrenaline-pumping atmosphere', 'heart-pounding environment',
        'mind-blowing atmosphere', 'jaw-dropping space', 'show-stopping environment',
        'crowd-pleasing atmosphere', 'party atmosphere'
      ]
    };

    return moodPhrases[moodId] || [];
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

      // Perform search with filters using built-in fallbacks to avoid empty results
      const results = await this.searchWithFallbacks(params);
      
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
      socialContext, budget, timeOfDay = 'afternoon',
      initialRadius = 5000, maxRadius = 20000, minResults = 8,
      apiKey, userTimezone
      // strict = false
    } = params;

    // Validate parameters using the correct validation method for numeric mood values
    const validation = FilterValidation.validateUnifiedFilters({
      category: lookingFor,
      mood,
      socialContext: socialContext || null,
      budget: budget || null,
      timeOfDay: timeOfDay === 'any' ? 'afternoon' : timeOfDay,
      distanceRange: null
    });

    if (!validation.isValid) {
      ConsolidatedFilterLogger.getInstance().error('search-filters', 'Invalid search parameters', validation.errors);
      return [];
    }

    // Get budget mapping from registry
    const budgetConfig = budget ? this.configRegistry.getConfig('budget', budget) : undefined;
    
    // Use the proper budget price mapping instead of narrow ranges
    // Note: Google Places API v1 doesn't support price filtering in request body
    // We'll filter results after receiving them based on priceLevel field
    const budgetMap = budget ? {
      minprice: Math.min(...(BUDGET_PRICE_MAPPING[budget] || [0, 4])),
      maxprice: Math.max(...(BUDGET_PRICE_MAPPING[budget] || [0, 4]))
    } : undefined;

    // Use the new dynamic text search query builder (100% UI aligned)
    const textQuery = this.buildDynamicTextSearchQuery(params);

    const resultsMap: Map<string, PlaceResult> = new Map();

    // Search loop with incremental 500m expansion
    // Apply slight radius jitter within a safe band (±15%) per request
    const jitterPct = (this.createSeed() % 31) / 1000 - 0.015; // roughly -1.5%..+1.5%
    const jitteredInitial = Math.max(1000, Math.min(maxRadius, Math.round(initialRadius * (1 + jitterPct))));

    let lastRadiusTried = jitteredInitial;
    let radius = jitteredInitial;
    while (radius <= maxRadius) {
      this.currentRadius = radius;
      lastRadiusTried = radius;

      // Try cache first
      const cacheKey = `${textQuery}-${lat}-${lng}-${radius}`;
      const cached = this.getCached<PlaceResult[]>(cacheKey);
      if (cached) {
        cached.forEach(place => resultsMap.set(place.place_id, place));
        if (resultsMap.size >= minResults) break;
      } else {
        // Search API
        const places = await this.textSearch(textQuery, lat, lng, radius, apiKey, budgetMap?.minprice, budgetMap?.maxprice);

        // Debug: Log price levels of returned places
        console.log('🔍 [UnifiedFilterService] Places returned from API:', places.length);
        places.forEach((place, index) => {
          console.log(`🔍 [UnifiedFilterService] Place ${index + 1}: ${place.name}`);
          console.log(`🔍 [UnifiedFilterService] - Original priceLevel: ${place.priceLevel}`);
          console.log(`🔍 [UnifiedFilterService] - Converted price_level: ${place.price_level}`);
          console.log(`🔍 [UnifiedFilterService] - Budget filter: ${budget}, Budget map:`, budgetMap);
        });

        // Process results
        for (const place of places) {
          if (!place || !place.place_id) continue;

          const existing = resultsMap.get(place.place_id);
          const latLng = place.geometry?.location;

          // Generate image URLs from photos
          const imageUrls = place.photos?.map((photo: any) => {
            if (photo.name) {
              const photoRef = photo.name.split('/photos/')[1];
              if (photoRef) {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=600&photoreference=${photoRef}&key=${apiKey}`;
              }
            }
            if (photo.photo_reference) {
              return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=600&photoreference=${photo.photo_reference}&key=${apiKey}`;
            }
            return null;
          }).filter(Boolean) || [];

          console.log(`📸 Processing images for ${place.name}:`, {
            hasPhotos: !!place.photos,
            photoCount: place.photos?.length || 0,
            generatedUrls: imageUrls.length,
            sampleUrl: imageUrls[0] || 'No URLs generated'
          });

          const finalPhotos = imageUrls.length > 0 ? {
            thumbnail: imageUrls as string[],
            medium: imageUrls as string[],
            large: imageUrls as string[],
            count: imageUrls.length as number
          } : undefined;

          console.log(`📸 Final photos structure for ${place.name}:`, {
            hasFinalPhotos: !!finalPhotos,
            photoCount: finalPhotos?.count || 0,
            mediumCount: finalPhotos?.medium?.length || 0,
            sampleMedium: finalPhotos?.medium?.[0] || 'No medium photos'
          });

          const prBase: Omit<PlaceResult, 'photos'> & Partial<Pick<PlaceResult, 'photos'>> = {
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
          if (finalPhotos) {
            prBase.photos = finalPhotos;
          }
          const pr: PlaceResult = prBase as PlaceResult;

          resultsMap.set(place.place_id, pr);
        }

        // Cache results
        this.setCache(cacheKey, Array.from(resultsMap.values()));
      }

      if (resultsMap.size >= minResults) break;

      // Vary expansion step slightly (400-700m) for diversity
      const step = 400 + Math.floor((this.createSeed() % 301));
      radius = Math.min(radius + step, maxRadius);
    }

    // If still not enough results, progressively expand beyond maxRadius up to a hard cap
    if (this.config.expansionEnabled && resultsMap.size < minResults) {
      const hardCap = Math.max(maxRadius, 50000);
      let radius = lastRadiusTried;
      while (radius < hardCap && resultsMap.size < minResults) {
        radius = Math.min(radius + this.config.expansionIncrement, hardCap);
        this.currentRadius = radius;
        this.currentExpansionCount += 1;
        const cacheKey = `${textQuery}-${lat}-${lng}-${radius}`;
        const cached = this.getCached<PlaceResult[]>(cacheKey);
        if (cached) {
          cached.forEach(place => resultsMap.set(place.place_id, place));
          continue;
        }
        try {
          const places = await this.textSearch(textQuery, lat, lng, radius, apiKey, budgetMap?.minprice, budgetMap?.maxprice);
          for (const place of places) {
            if (!place || !place.place_id) continue;
            const existing = resultsMap.get(place.place_id);
            const latLng = place.geometry?.location;
            const basePr: Omit<PlaceResult, 'photos'> & Partial<Pick<PlaceResult, 'photos'>> = {
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
              expanded: true,
              raw: place
            };
            const pr: PlaceResult = basePr as PlaceResult;
            resultsMap.set(place.place_id, pr);
          }
          this.setCache(cacheKey, Array.from(resultsMap.values()));
        } catch (e) {
          console.warn('Radius expansion fetch failed', e);
          break;
        }
      }
    }

    // Apply progressive filtering
    let results = Array.from(resultsMap.values());
    
    // Debug: Log price levels before budget filtering
    console.log('🔍 [UnifiedFilterService] Before budget filtering - Total places:', results.length);
    results.slice(0, 5).forEach((place, index) => {
      console.log(`🔍 [UnifiedFilterService] Place ${index + 1}: ${place.name}, price_level: ${place.price_level}`);
    });
    
    results = await this.monitoredFilter('budget', () => this.applyBudgetFilter(results, budget));
    
    // Debug: Log price levels after budget filtering
    console.log('🔍 [UnifiedFilterService] After budget filtering - Total places:', results.length);
    results.slice(0, 5).forEach((place, index) => {
      console.log(`🔍 [UnifiedFilterService] Place ${index + 1}: ${place.name}, price_level: ${place.price_level}`);
    });
    
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
    console.log('🔍 [applyBudgetFilter] Starting budget filter for budget:', budget);
    console.log('🔍 [applyBudgetFilter] Total places before filtering:', places.length);
    
    if (!budget) {
      console.log('🔍 [applyBudgetFilter] No budget specified, returning all places');
      return places;
    }
    
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budget as keyof typeof BUDGET_PRICE_MAPPING];
    console.log('🔍 [applyBudgetFilter] Allowed price levels for budget', budget, ':', allowedPriceLevels);
    
    if (!allowedPriceLevels) {
      console.log('🔍 [applyBudgetFilter] No allowed price levels found for budget:', budget);
      return places;
    }
    
    // Log price level distribution before filtering
    const priceLevelCounts: Record<string, number> = {};
    places.forEach(place => {
      const level = place.price_level !== undefined ? place.price_level.toString() : 'undefined';
      priceLevelCounts[level] = (priceLevelCounts[level] || 0) + 1;
    });
    console.log('🔍 [applyBudgetFilter] Price level distribution before filtering:', priceLevelCounts);
    
    const filteredPlaces = places.filter(place => {
      // Use the place object directly, not place.raw, since price_level is on the place object
      const matches = FilterMatching.match('priceLevel', place, allowedPriceLevels);
      if (!matches) {
        console.log(`🔍 [applyBudgetFilter] Place ${place.name} (price_level: ${place.price_level}) filtered out`);
      }
      return matches;
    });
    
    console.log('🔍 [applyBudgetFilter] Total places after filtering:', filteredPlaces.length);
    
    // Log price level distribution after filtering
    const filteredPriceLevelCounts: Record<string, number> = {};
    filteredPlaces.forEach(place => {
      const level = place.price_level !== undefined ? place.price_level.toString() : 'undefined';
      filteredPriceLevelCounts[level] = (filteredPriceLevelCounts[level] || 0) + 1;
    });
    console.log('🔍 [applyBudgetFilter] Price level distribution after filtering:', filteredPriceLevelCounts);
    
    return filteredPlaces;
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
    } catch {
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
      mood: this.convertNumericMoodToString(params.mood) as MoodOption,
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
    if (params.lookingFor === 'something-new' && place.tags?.includes('new')) {
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
  async discoverPlaces(filters: DiscoveryFilters): Promise<LegacyDiscoveryResult> {
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
  async getNextBatch(filters: DiscoveryFilters): Promise<LegacyDiscoveryResult> {
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
  private convertToLegacyResult(places: PlaceResult[], filters: DiscoveryFilters): LegacyDiscoveryResult {
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
    const shuffled = this.seededShuffle([...places], this.createSeed());
    return shuffled.slice(0, count);
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

  private createSeed(): number {
    const now = Date.now();
    const rand = Math.floor(Math.random() * 1_000_000);
    return (now ^ rand) >>> 0;
  }

  private seededShuffle<T>(array: T[], seed: number): T[] {
    let s = seed >>> 0;
    const a: T[] = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      const ai = a[i] as T;
      const aj = a[j] as T;
      a[i] = aj as T;
      a[j] = ai as T;
    }
    return a;
  }

  private rotateArray<T>(arr: T[], by: number): T[] {
    if (arr.length === 0) return arr;
    const n = ((by % arr.length) + arr.length) % arr.length;
    return arr.slice(n).concat(arr.slice(0, n));
  }
}

// Export singleton instance
export const unifiedFilterService = UnifiedFilterService.getInstance();

// Types are consumed internally; no re-exports from here to avoid circular type mismatches.

// =================
// LEGACY COMPATIBILITY CLASS
// =================

/**
 * Legacy PlaceDiscoveryLogic class for backward compatibility
 * This class wraps the new UnifiedFilterService to maintain API compatibility
 * 
 * @deprecated Use unifiedFilterService directly instead
 */
// Legacy result type for backward compatibility
interface LegacyDiscoveryResult {
  places: (PlaceResult | AdvertisedPlace)[];
  loadingState: 'loading' | 'complete' | 'error';
  expansionInfo?: {
    expansionCount: number;
    finalRadius: number;
    totalPlacesFound: number;
  };
  poolInfo: {
    remainingPlaces: number;
    totalPoolSize: number;
    needsRefresh: boolean;
  };
}

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
  async discoverPlaces(filters: DiscoveryFilters): Promise<LegacyDiscoveryResult> {
    return this.service.discoverPlaces(filters);
  }

  /**
   * Legacy: Get next batch of results
   */
  async getNextBatch(filters: DiscoveryFilters): Promise<LegacyDiscoveryResult> {
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