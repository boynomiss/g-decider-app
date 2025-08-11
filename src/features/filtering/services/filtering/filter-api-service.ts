/**
 * Filter API Service
 * 
 * Handles API integration for filter operations
 */

import { UnifiedFilters } from '../../../../services/cache/data/unified-cache-service';
import { PlaceResult, ApiReadyFilterData, ReviewEntity } from '../../types';
import { googlePlacesClient } from '../../../../services/api/api/google-api-clients';

// API configuration
export interface APIConfig {
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  rateLimitDelay: number;
  parallelRequests: boolean;
  maxConcurrentRequests: number;
}

// API statistics
export interface APIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  rateLimitHits: number;
  retryAttempts: number;
}

export class FilterAPIService {
  private config: APIConfig;
  private stats: APIStats;
  private requestQueue: Promise<any>[] = [];

  constructor() {
    this.config = {
      timeout: 10000, // 10 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      rateLimitDelay: 100, // 100ms between requests
      parallelRequests: true,
      maxConcurrentRequests: 5
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      retryAttempts: 0
    };
  }

  /**
   * Search places using Google Places API
   */
  async searchPlaces(filters: UnifiedFilters, radius: number): Promise<PlaceResult[]> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      console.log(`🔍 Searching places with filters:`, filters, `radius: ${radius}m`);

      // Build Google Places query
      const query = this.buildGooglePlacesQuery(filters, radius);
      
      // Execute search with retry logic
      const response = await this.executeWithRetry(async () => {
        if (filters.location) {
          // Parse location (could be coordinates or address)
          let lat: number, lng: number;
          if (typeof filters.location === 'string') {
            // Try to parse as coordinates first
            const coords = filters.location.split(',').map(s => s.trim());
            if (coords.length === 2) {
              lat = parseFloat(coords[0]);
              lng = parseFloat(coords[1]);
            } else {
              // Treat as address and geocode
              const geocodeResult = await this.geocodeAddress(filters.location);
              lat = geocodeResult.lat;
              lng = geocodeResult.lng;
            }
          } else {
            // Location is already coordinates
            const location = filters.location as { lat: number; lng: number };
            lat = location.lat;
            lng = location.lng;
          }
          
          return await googlePlacesClient.searchNearby(
            { lat, lng },
            radius,
            query.includedTypes
          );
        } else {
          return await googlePlacesClient.searchText(
            query.textQuery || '',
            undefined,
            20
          );
        }
      });

      // Transform Google Places response to PlaceData
      const places = await this.transformGooglePlacesResponse(response.places || []);
      
      // Apply additional filtering
      const filteredPlaces = this.applyPostFiltering(places, filters);

      // Update stats
      this.updateStats(true, Date.now() - startTime);
      
      console.log(`✅ Found ${filteredPlaces.length} places matching filters`);
      return filteredPlaces;

    } catch (error) {
      console.error('❌ API search error:', error);
      this.updateStats(false, Date.now() - startTime);
      return [];
    }
  }

  /**
   * Build Google Places API query parameters
   */
  private buildGooglePlacesQuery(filters: UnifiedFilters, radius: number): {
    includedTypes: string[];
    textQuery: string;
    priceRange?: { min: number; max: number };
    openNow?: boolean;
  } {
    const query: any = {
      includedTypes: this.getPlaceTypes(filters),
      textQuery: this.buildTextQuery(filters)
    };

    // Add budget constraints
    if (filters.budget) {
      query.priceRange = this.getBudgetPriceRange(filters.budget);
    }

    // Add time constraints
    if (filters.timeOfDay) {
      query.openNow = this.shouldFilterByOpenNow(filters.timeOfDay);
    }

    return query;
  }

  /**
   * Get Google Places types based on filters
   */
  private getPlaceTypes(filters: UnifiedFilters): string[] {
    const types: string[] = [];

    // Category-based types
    switch (filters.category) {
      case 'food':
        types.push('restaurant', 'meal_takeaway', 'cafe', 'bakery', 'bar');
        break;
      case 'activity':
        types.push('tourist_attraction', 'amusement_park', 'bowling_alley', 'movie_theater', 'museum');
        break;
      case 'something-new':
        types.push('point_of_interest', 'establishment', 'art_gallery', 'night_club');
        break;
      default:
        types.push('establishment');
    }

    // Social context modifications
    if (filters.socialContext === 'solo') {
      types.push('library', 'park', 'cafe');
    } else if (filters.socialContext === 'barkada') {
      types.push('bowling_alley', 'karaoke', 'amusement_park');
    } else if (filters.socialContext === 'with-bae') {
      types.push('restaurant', 'movie_theater', 'park');
    }

    return Array.from(new Set(types)); // Remove duplicates
  }

  /**
   * Build text query for search
   */
  private buildTextQuery(filters: UnifiedFilters): string {
    const parts: string[] = [];

    // Category
    if (filters.category === 'food') {
      parts.push('restaurant');
    } else if (filters.category === 'activity') {
      parts.push('activity attraction');
    } else if (filters.category === 'something-new') {
      parts.push('new interesting place');
    }

    // Mood-based keywords
    if (filters.mood !== null) {
      if (filters.mood <= 30) {
        parts.push('chill relaxed quiet');
      } else if (filters.mood >= 70) {
        parts.push('lively exciting vibrant');
      } else {
        parts.push('casual friendly');
      }
    }

    // Social context
    if (filters.socialContext === 'solo') {
      parts.push('quiet peaceful');
    } else if (filters.socialContext === 'barkada') {
      parts.push('group friendly fun');
    } else if (filters.socialContext === 'with-bae') {
      parts.push('romantic intimate');
    }

    // Location
    if (filters.location) {
      parts.push(`near ${filters.location}`);
    }

    return parts.join(' ');
  }

  /**
   * Get budget price range for Google Places API
   */
  private getBudgetPriceRange(budget: 'P' | 'PP' | 'PPP'): { min: number; max: number } {
    switch (budget) {
      case 'P':
        return { min: 0, max: 1 };
      case 'PP':
        return { min: 1, max: 2 };
      case 'PPP':
        return { min: 2, max: 4 };
      default:
        return { min: 0, max: 4 };
    }
  }

  /**
   * Check if should filter by open now based on time
   */
  private shouldFilterByOpenNow(timeOfDay: string): boolean {
    const currentHour = new Date().getHours();
    
    switch (timeOfDay) {
      case 'morning':
        return currentHour >= 6 && currentHour < 12;
      case 'afternoon':
        return currentHour >= 12 && currentHour < 18;
      case 'night':
        return currentHour >= 18 || currentHour < 6;
      default:
        return false;
    }
  }

  /**
   * Transform Google Places response to PlaceData format
   */
  private async transformGooglePlacesResponse(places: any[]): Promise<PlaceResult[]> {
    const transformedPlaces: PlaceResult[] = [];

    for (const place of places) {
      try {
        // Ensure location is always defined with fallback coordinates
        const location = place.location ? {
          lat: place.location.latitude || place.geometry?.location?.lat || 0,
          lng: place.location.longitude || place.geometry?.location?.lng || 0
        } : { lat: 14.5176, lng: 121.0509 }; // Fallback to BGC coordinates

        const placeData: PlaceResult = {
          place_id: place.id || place.place_id,
          name: place.displayName?.text || place.name,
          address: place.formattedAddress || place.vicinity || '',
          category: this.inferCategory(place.types || []),
          user_ratings_total: place.userRatingCount || 0,
          rating: place.rating || 0,
          reviews: this.extractReviews(place.reviews || []),
          
          // Location data
          location,
          
          // Additional data
          types: place.types,
          price_level: place.priceLevel,
          website: place.websiteUri,
          phone: place.nationalPhoneNumber || place.internationalPhoneNumber,
          opening_hours: place.currentOpeningHours || place.opening_hours,
          business_status: place.businessStatus,
          
          // Initialize with default mood (will be calculated later)
          mood_score: 50,
          final_mood: 'neutral'
        };

        transformedPlaces.push(placeData);
      } catch (error) {
        console.warn('⚠️ Failed to transform place:', error);
      }
    }

    return transformedPlaces;
  }

  /**
   * Infer category from Google Places types
   */
  private inferCategory(types: string[]): string {
    const foodTypes = ['restaurant', 'meal_takeaway', 'cafe', 'bakery', 'bar', 'food'];
    const activityTypes = ['tourist_attraction', 'amusement_park', 'bowling_alley', 'movie_theater', 'museum'];
    
    if (types.some(type => foodTypes.includes(type))) {
      return 'food';
    } else if (types.some(type => activityTypes.includes(type))) {
      return 'activity';
    } else {
      return 'something-new';
    }
  }

  /**
   * Extract reviews from Google Places response
   */
  private extractReviews(reviews: any[]): ReviewEntity[] {
    return reviews.slice(0, 5).map(review => ({
      text: review.text?.text || review.text || '',
      rating: review.rating || 0,
      time: typeof review.time === 'number' ? review.time : new Date(review.time || Date.now()).getTime()
    }));
  }

  /**
   * Apply additional filtering after API response
   */
  private applyPostFiltering(places: PlaceResult[], filters: UnifiedFilters): PlaceResult[] {
    let filteredPlaces = [...places];

    // Filter by budget if specified
    if (filters.budget) {
      filteredPlaces = filteredPlaces.filter(place => {
        if (!place.price_level) return true; // Include places without price level
        return this.isPriceInBudget(place.price_level, filters.budget!);
      });
    }

    // Filter by rating (basic quality filter)
    filteredPlaces = filteredPlaces.filter(place => (place.rating || 0) >= 3.0 || (place.rating || 0) === 0);

    // Remove places without names
    filteredPlaces = filteredPlaces.filter(place => place.name && place.name.trim().length > 0);

    return filteredPlaces;
  }

  /**
   * Check if price level matches budget
   */
  private isPriceInBudget(priceLevel: number, budget: 'P' | 'PP' | 'PPP'): boolean {
    switch (budget) {
      case 'P':
        return priceLevel <= 1;
      case 'PP':
        return priceLevel >= 1 && priceLevel <= 2;
      case 'PPP':
        return priceLevel >= 2;
      default:
        return true;
    }
  }

  /**
   * Execute API call with retry logic
   */
  private async executeWithRetry<T>(apiCall: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Rate limiting
        if (this.requestQueue.length >= this.config.maxConcurrentRequests) {
          await Promise.race(this.requestQueue);
        }

        const promise = apiCall();
        this.requestQueue.push(promise);
        
        const result = await promise;
        
        // Remove from queue when done
        this.requestQueue = this.requestQueue.filter(p => p !== promise);
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        this.stats.retryAttempts++;
        
        if (attempt < this.config.maxRetries) {
          console.warn(`⚠️ API call failed (attempt ${attempt}/${this.config.maxRetries}), retrying...`);
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('API call failed after all retries');
  }

  /**
   * Update API statistics
   */
  private updateStats(success: boolean, responseTime: number): void {
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // Update average response time using exponential moving average
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * 0.9) + (responseTime * 0.1);
  }

  /**
   * Get API statistics
   */
  getStats(): APIStats {
    return { ...this.stats };
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear statistics
   */
  clearStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      retryAttempts: 0
    };
  }
}

/**
 * FilterApiBridge Implementation
 * 
 * Provides logging and consolidation methods for filter operations.
 * This bridges the gap between the old FilterApiBridge interface and the new system.
 */
export class FilterApiBridge {
  /**
   * Log category selection and return API-ready filter data
   */
  static logCategorySelection(value: string): ApiReadyFilterData {
    console.log('📊 Logging category selection:', value);
    return {
      category: value
    };
  }

  /**
   * Log mood selection and return API-ready filter data
   */
  static logMoodSelection(value: number): ApiReadyFilterData {
    console.log('📊 Logging mood selection:', value);
    return {
      mood: value
    };
  }

  /**
   * Log distance selection and return API-ready filter data
   */
  static logDistanceSelection(value: number): ApiReadyFilterData {
    console.log('📊 Logging distance selection:', value);
    return {
      distance: value
    };
  }

  /**
   * Log budget selection and return API-ready filter data
   */
  static logBudgetSelection(value: any): ApiReadyFilterData {
    console.log('📊 Logging budget selection:', value);
    return {
      budget: value
    };
  }

  /**
   * Log social context selection and return API-ready filter data
   */
  static logSocialContextSelection(value: any): ApiReadyFilterData {
    console.log('📊 Logging social context selection:', value);
    return {
      socialContext: value
    };
  }

  /**
   * Log time of day selection and return API-ready filter data
   */
  static logTimeOfDaySelection(value: any): ApiReadyFilterData {
    console.log('📊 Logging time of day selection:', value);
    return {
      timeOfDay: value
    };
  }

  /**
   * Consolidate multiple filters for API consumption
   */
  static consolidateFiltersForApi(filters: any[]): ApiReadyFilterData {
    console.log('📊 Consolidating filters for API:', filters);
    
    const consolidated: ApiReadyFilterData = {};

    filters.forEach(filter => {
      if (filter.category) consolidated.category = filter.category;
      if (filter.mood !== undefined) consolidated.mood = filter.mood;
      if (filter.socialContext) consolidated.socialContext = filter.socialContext;
      if (filter.budget) consolidated.budget = filter.budget;
      if (filter.timeOfDay) consolidated.timeOfDay = filter.timeOfDay;
      if (filter.distance !== undefined) consolidated.distance = filter.distance;
      if (filter.userLocation) consolidated.userLocation = filter.userLocation;
    });

    return consolidated;
  }
}

// Add geocodeAddress method to FilterAPIService
export class FilterAPIServiceWithGeocoding extends FilterAPIService {
  /**
   * Geocode an address to coordinates
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      // Use Google Geocoding API to convert address to coordinates
      const response = await googlePlacesClient.geocode(address);
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      throw new Error('No geocoding results found');
    } catch (error) {
      console.error('Geocoding error:', error);
      // Return default coordinates (could be user's last known location)
      return { lat: 0, lng: 0 };
    }
  }
}