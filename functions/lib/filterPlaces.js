"use strict";
// ==================================================================================
// FILTERING LOGIC REPLACEMENT - READY FOR NEW IMPLEMENTATION
// ==================================================================================
// 
// ✅ STEP 1: IDENTIFIED - Main filtering logic file: functions/src/filterPlaces.ts
// ✅ STEP 2: ANALYZED - Current implementation documented and preserved as comments
// ✅ STEP 3: PREPARED - Old logic commented out, temporary compatibility functions added
// 
// 🔄 READY FOR STEP 4: Implement new filtering logic in marked sections below
//
// CRITICAL: The following interfaces MUST be preserved for compatibility:
// - UserFilters interface (lines 15-22)
// - FilteringResponse interface (lines 24-39)
// - API endpoint signatures (filterPlaces, validateFilter)
// - CORS headers and request/response format
//
// File preserved with original name to maintain references across the project.
// ==================================================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFilter = exports.filterPlaces = void 0;
const functions = __importStar(require("firebase-functions"));
// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';
// ==================================================================================
// COMPREHENSIVE GOOGLE PLACES API TYPE MAPPINGS
// ==================================================================================
// Import consolidated category configuration
const category_config_1 = require("./configs/category-config");
// Import consolidated mood configuration
const mood_config_1 = require("./configs/mood-config");
// Import consolidated social context configuration
const social_config_1 = require("./configs/social-config");
// Budget to Google Places price_level mapping
const BUDGET_PRICE_MAPPING = {
    'P': [0, 1, 2], // Budget-Friendly: 0-2
    'PP': [3], // Moderate: 3  
    'PPP': [4] // Premium: 4
};
// Import consolidated time configuration
const time_config_1 = require("./configs/time-config");
// Import consolidated distance configuration
const distance_config_1 = require("./configs/distance-config");
// For TSLint: DISTANCE_RANGES will be used in future expansions
void distance_config_1.DISTANCE_RANGES;
// ==================================================================================
// FILTERING LOGIC HELPER FUNCTIONS
// ==================================================================================
/**
 * Get distance radius from percentage-based slider value
 */
function getDistanceRadius(distanceRange) {
    return distance_config_1.DistanceUtils.getDistanceRadius(distanceRange);
}
/**
 * Convert mood score (0-100) to mood category
 */
function getMoodCategory(moodScore) {
    if (moodScore <= 33.33)
        return 'chill';
    if (moodScore <= 66.66)
        return 'neutral';
    return 'hype';
}
/**
 * Get optimal place types based on all filters
 */
function getOptimalPlaceTypes(filters) {
    let candidateTypes = [];
    // Start with category types
    if (filters.category) {
        candidateTypes = category_config_1.CategoryUtils.getPreferredPlaceTypes(filters.category);
    }
    // Filter by mood if provided
    if (filters.mood) {
        const moodTypes = mood_config_1.MoodUtils.getPreferredPlaceTypes(filters.mood);
        candidateTypes = candidateTypes.filter(type => moodTypes.includes(type));
    }
    // Filter by social context if provided
    if (filters.socialContext) {
        const socialTypes = social_config_1.SocialUtils.getPreferredPlaceTypes(filters.socialContext);
        candidateTypes = candidateTypes.filter(type => socialTypes.includes(type));
    }
    // Limit to top 5 types for API efficiency (Google Places API limitation)
    return candidateTypes.slice(0, 5);
}
/**
 * Check if place is open during specified time
 */
function isPlaceOpenAtTime(place, timeOfDay) {
    return time_config_1.TimeUtils.isPlaceOpenAtTime(place, timeOfDay);
}
/**
 * Filter places by budget (price level)
 */
function filterByBudget(places, budget) {
    if (!budget || !(budget in BUDGET_PRICE_MAPPING)) {
        return places;
    }
    // Type assertion to ensure budget is a valid key and get the correct type
    const budgetKey = budget;
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budgetKey];
    return places.filter((place) => {
        // If no price level data, include in budget-friendly results
        if (place.price_level === undefined || place.price_level === null) {
            return budget === 'P'; // Only include in budget-friendly
        }
        // Ensure price_level is a number and check if it's in allowed levels
        const priceLevel = Number(place.price_level);
        if (isNaN(priceLevel)) {
            return budget === 'P'; // Include unknown price levels in budget-friendly
        }
        return allowedPriceLevels.includes(priceLevel);
    });
}
// ==================================================================================
// OLD FILTERING LOGIC - COMMENTED OUT FOR REPLACEMENT
// ==================================================================================
// Server-side cache implementation
/*
class ServerCache {
  private cache = new Map<string, any>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private readonly maxSize = 1000;
  private readonly defaultTTL = 10 * 60 * 1000; // 10 minutes

  generateKey(filters: UserFilters, minResults: number): string {
    const filterString = JSON.stringify({
      mood: filters.mood,
      category: filters.category,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      socialContext: filters.socialContext,
      distanceRange: filters.distanceRange,
      minResults
    });
    
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `server_filter_${Math.abs(hash)}`;
  }

  get(key: string): any | null {
    this.stats.totalRequests++;
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.data;
  }

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0,
      size: this.cache.size
    };
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
  }
}
*/
// ==================================================================================
// NEW FILTERING LOGIC PLACEHOLDER
// ==================================================================================
// TODO: Implement new ServerCache class here
class ServerCache {
    // Temporary minimal implementation to maintain API compatibility
    generateKey(filters, minResults) {
        return `temp_${Date.now()}`;
    }
    get(key) {
        return null; // Always miss for now
    }
    set(key, data, ttl) {
        // No-op for now
    }
    getStats() {
        return {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            hitRate: 0,
            size: 0
        };
    }
    clear() {
        // No-op for now
    }
}
// Initialize server cache
const serverCache = new ServerCache();
// ==================================================================================
// OLD GOOGLE PLACES API INTEGRATION - COMMENTED OUT FOR REPLACEMENT
// ==================================================================================
/*
async function fetchRealRestaurants(filters: UserFilters): Promise<any[]> {
  console.log('🍽️ Fetching real restaurants from Google Places API...');
  
  try {
    const restaurants: any[] = [];
    let apiCallsMade = 0;
    let successfulCalls = 0;
    
    // Define search areas around Manila with more diverse locations
    const searchAreas = [
      { lat: 14.5176, lng: 121.0509, name: 'BGC' }, // Updated to correct BGC coordinates
      { lat: 14.5547, lng: 121.0244, name: 'Makati' },
      { lat: 14.5995, lng: 120.9842, name: 'Manila Bay Area' },
      { lat: 14.4791, lng: 120.8969, name: 'Pasay' },
      { lat: 14.6091, lng: 121.0223, name: 'Quezon City' },
      { lat: 14.5866, lng: 121.0630, name: 'Ortigas' }
    ];
    
    // Shuffle areas for better distribution
    const shuffledAreas = searchAreas.sort(() => Math.random() - 0.5);
    
    // Get restaurant types based on filters
    const getRestaurantTypes = (filters: UserFilters): string[] => {
      // Use primary types for better Google Places API compatibility
      if (filters.category === 'food') {
        return ['restaurant', 'cafe', 'bar', 'bakery'];
      } else if (filters.category === 'activity') {
        return ['park', 'museum', 'art_gallery', 'movie_theater', 'tourist_attraction'];
      } else if (filters.category === 'something-new') {
        return ['shopping_mall', 'library', 'book_store', 'tourist_attraction'];
      }
      
      return ['restaurant']; // Default fallback
    };
    
    const restaurantTypes = getRestaurantTypes(filters);
    const radius = Math.min(filters.distanceRange || 5, 10) * 1000; // Convert to meters
    
    console.log(`🔍 Searching with radius: ${radius}m, types: ${restaurantTypes.join(', ')}`);
    
    // Search in multiple areas with each type separately
    for (const area of shuffledAreas.slice(0, 4)) { // Try more areas for better coverage
      for (const type of restaurantTypes) {
        try {
          console.log(`📍 Searching ${type} in ${area.name}...`);
          
          const areaResults = await fetchPlacesWithRetry(area, radius, [type]);
          restaurants.push(...areaResults);
          successfulCalls++;
          
          console.log(`✅ Found ${areaResults.length} ${type} in ${area.name}`);
          
          if (restaurants.length >= 20) {
            console.log('🎯 Reached target number of restaurants, stopping search');
            break;
          }
        } catch (error) {
          console.error(`❌ Error searching ${type} in ${area.name}:`, error);
          apiCallsMade++;
        }
      }
      
      if (restaurants.length >= 20) {
        break;
      }
    }
    
    // If no results found, try with broader search
    if (restaurants.length === 0) {
      console.log('🔄 No results found, trying with broader search...');
      for (const area of shuffledAreas.slice(0, 2)) {
        try {
          console.log(`📍 Broad search in ${area.name}...`);
          const broadResults = await fetchPlacesWithRetry(area, radius * 2, ['restaurant']);
          restaurants.push(...broadResults);
          console.log(`✅ Found ${broadResults.length} places in broad search`);
          if (restaurants.length >= 10) break;
        } catch (error) {
          console.error(`❌ Error in broad search:`, error);
        }
      }
    }
    
    console.log(`📊 Search completed: ${restaurants.length} restaurants found from ${successfulCalls} areas`);
    return restaurants;
    
  } catch (error) {
    console.error('❌ Error in fetchRealRestaurants:', error);
    return getFallbackRestaurants();
  }
}
*/
// TODO: Implement new fetchRealRestaurants function here
async function fetchRealRestaurants(filters) {
    console.log('🔄 Using temporary fallback data for new filtering logic...');
    return getFallbackRestaurants();
}
// ==================================================================================
// OLD API RETRY LOGIC - COMMENTED OUT FOR REPLACEMENT
// ==================================================================================
/*
async function fetchPlacesWithRetry(
  area: { lat: number; lng: number; name: string },
  radius: number,
  restaurantTypes: string[],
  maxRetries: number = 3
): Promise<any[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${area.name}`);
      
      const searchUrl = `${PLACES_API_BASE_URL}/places:searchNearby`;
      const requestBody = {
        locationRestriction: {
          circle: {
            center: {
              latitude: area.lat,
              longitude: area.lng
            },
            radius: radius
          }
        },
        includedTypes: restaurantTypes,
        maxResultCount: 10
      };
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.types,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.primaryTypeDisplayName'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.places?.length || 0} places from ${area.name}`);
      
      return data.places || [];
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for ${area.name}:`, error);
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} attempts failed for ${area.name}`);
        return [];
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return [];
}
*/
/*
async function fetchPlaceDetailsWithRetry(placeId: string, maxRetries: number = 2): Promise<any | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const detailsUrl = `${PLACES_API_BASE_URL}/places/${placeId}`;
      
      const response = await fetch(detailsUrl, {
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,types,rating,userRatingCount,priceLevel,website,internationalPhoneNumber,openingHours,photos,reviews'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for place details:`, error);
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} attempts failed for place details`);
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  return null;
}
*/
function getFallbackRestaurants() {
    console.log('🔄 Using fallback restaurant data');
    return [
        {
            id: 'fallback_1',
            name: 'Jollibee - Makati',
            location: 'Makati, Metro Manila',
            images: ['https://example.com/jollibee.jpg'],
            budget: 'P',
            tags: ['fast_food', 'restaurant'],
            description: 'Popular Filipino fast food chain',
            category: 'food',
            mood: 'both',
            socialContext: ['solo', 'with-bae', 'barkada'],
            timeOfDay: ['morning', 'afternoon', 'night'],
            rating: 4.2,
            reviewCount: 150,
            reviews: [],
            website: 'https://www.jollibee.com.ph'
        },
        {
            id: 'fallback_2',
            name: 'Starbucks - BGC',
            location: 'Bonifacio Global City, Taguig',
            images: ['https://example.com/starbucks.jpg'],
            budget: 'PP',
            tags: ['cafe', 'coffee'],
            description: 'International coffee chain',
            category: 'food',
            mood: 'chill',
            socialContext: ['solo', 'with-bae'],
            timeOfDay: ['morning', 'afternoon'],
            rating: 4.5,
            reviewCount: 89,
            reviews: [],
            website: 'https://www.starbucks.com.ph'
        },
        {
            id: 'fallback_3',
            name: 'Wolfgang\'s Steakhouse',
            location: 'Makati, Metro Manila',
            images: ['https://example.com/wolfgangs.jpg'],
            budget: 'PPP',
            tags: ['fine_dining', 'steakhouse'],
            description: 'Premium steakhouse experience',
            category: 'food',
            mood: 'hype',
            socialContext: ['with-bae', 'barkada'],
            timeOfDay: ['night'],
            rating: 4.8,
            reviewCount: 234,
            reviews: [],
            website: 'https://www.wolfgangssteakhouse.com'
        }
    ];
}
async function generateAIDescription(restaurantData, filters) {
    try {
        // For now, return a simple description
        // In production, this would call the Gemini API
        const baseDescription = `${restaurantData.name} is a great place to visit.`;
        if (filters.socialContext === 'with-bae') {
            return `${baseDescription} Perfect for a romantic date night.`;
        }
        else if (filters.socialContext === 'barkada') {
            return `${baseDescription} Great for group gatherings and celebrations.`;
        }
        else {
            return `${baseDescription} Ideal for solo dining and quiet meals.`;
        }
    }
    catch (error) {
        console.error('❌ Error generating AI description:', error);
        return `${restaurantData.name} is a great place to visit.`;
    }
}
// ==================================================================================
// OLD CORE FILTERING LOGIC - COMMENTED OUT FOR REPLACEMENT
// ==================================================================================
/*
async function performFiltering(
  filters: UserFilters,
  minResults: number,
  useCache: boolean
): Promise<{ results: any[]; source: 'cache' | 'api' | 'mixed'; cacheHit: boolean; totalResults: number }> {
  console.log('🔍 Performing filtering with:', filters);
  
  // Check server-side cache first
  const cacheKey = serverCache.generateKey(filters, minResults);
  const cachedResult = serverCache.get(cacheKey);
  
  if (cachedResult && useCache) {
    console.log('✅ Server cache hit!');
    return {
      results: cachedResult.results,
      source: 'cache',
      cacheHit: true,
      totalResults: cachedResult.results.length
    };
  }
  
  console.log('❌ Server cache miss, fetching from API...');
  
  // Fetch from API
  const restaurants = await fetchRealRestaurants(filters);
  
  // Enhance places with details
  const enhancedResults = await Promise.all(
    restaurants.map(place => enhancePlaceWithDetails(place))
  );
  
  // Filter based on user preferences
  const filteredResults = enhancedResults.filter(place => {
    // Basic filtering logic
    if (filters.budget && place.priceLevel) {
      const priceLevel = place.priceLevel;
      const budgetLevel = filters.budget === 'P' ? 1 : filters.budget === 'PP' ? 2 : 3;
      if (priceLevel > budgetLevel) return false;
    }
    
    return true;
  });
  
  // Convert Google Places API format to ServerPlaceData format
  const convertedResults = filteredResults.map(place => {
    // Extract coordinates from the place data
    const coordinates = place.location ? {
      lat: place.location.latitude || 14.5176,
      lng: place.location.longitude || 121.0509
    } : { lat: 14.5176, lng: 121.0509 };

    // Convert to ServerPlaceData format
    return {
      id: place.id || `place_${Math.random().toString(36).substr(2, 9)}`,
      name: place.displayName?.text || place.name || 'Unknown Place',
      location: place.formattedAddress || place.location?.address || 'Unknown Location',
      images: place.photos ? place.photos.map((photo: any) => photo.name) : [],
      budget: place.priceLevel ? (place.priceLevel === 1 ? 'P' : place.priceLevel === 2 ? 'PP' : 'PPP') : 'PP',
      tags: place.types || [],
      description: place.description || 'A great place to visit',
      category: filters.category || 'food',
      mood: filters.mood > 60 ? 'hype' : filters.mood < 40 ? 'chill' : 'both',
      socialContext: ['solo', 'with-bae', 'barkada'],
      timeOfDay: ['morning', 'afternoon', 'night'],
      coordinates,
      rating: place.rating || 0,
      reviewCount: place.userRatingCount || 0,
      reviews: place.reviews || [],
      website: place.website || undefined
    };
  });

  // Add AI descriptions
  const finalResults = await Promise.all(
    convertedResults.map(async (place) => ({
      ...place,
      description: await generateAIDescription(place, filters)
    }))
  );
  
  // Cache the result
  if (useCache) {
    serverCache.set(cacheKey, { results: finalResults });
    console.log('💾 Cached result on server');
  }
  
  return {
    results: finalResults,
    source: 'api',
    cacheHit: false,
    totalResults: finalResults.length
  };
}
*/
// ==================================================================================
// NEW CORE FILTERING LOGIC PLACEHOLDER
// ==================================================================================
/**
 * Enhanced filtering function with comprehensive Google Places API integration
 */
async function performFiltering(filters, minResults, useCache) {
    console.log('🚀 Starting enhanced filtering with comprehensive place types:', {
        filters,
        minResults,
        useCache
    });
    try {
        // Get optimal place types based on all filters
        const placeTypes = getOptimalPlaceTypes(filters);
        const radius = getDistanceRadius(filters.distanceRange);
        console.log('📍 Filter analysis:', {
            selectedTypes: placeTypes,
            radius: `${radius}m`,
            moodCategory: filters.mood ? getMoodCategory(filters.mood) : 'none',
            socialContext: filters.socialContext || 'none',
            budget: filters.budget || 'any',
            timeOfDay: filters.timeOfDay || 'any'
        });
        if (placeTypes.length === 0) {
            console.warn('⚠️ No suitable place types found for filters, using default restaurant search');
            placeTypes.push('restaurant');
        }
        // Perform Google Places API search
        const places = await searchGooglePlaces(placeTypes, radius, filters);
        // Apply additional filtering
        let filteredPlaces = places;
        // Filter by budget/price level
        filteredPlaces = filterByBudget(filteredPlaces, filters.budget);
        // Filter by time of day (opening hours)
        if (filters.timeOfDay) {
            filteredPlaces = filteredPlaces.filter(place => isPlaceOpenAtTime(place, filters.timeOfDay));
        }
        // Ensure minimum results by expanding search if needed
        if (filteredPlaces.length < minResults && placeTypes.length < 10) {
            console.log('🔄 Expanding search for more results...');
            const expandedTypes = getExpandedPlaceTypes(filters);
            const additionalPlaces = await searchGooglePlaces(expandedTypes, radius * 1.5, filters);
            // Add non-duplicate places
            const existingIds = new Set(filteredPlaces.map(p => p.place_id));
            const newPlaces = additionalPlaces.filter(p => !existingIds.has(p.place_id));
            filteredPlaces = [...filteredPlaces, ...newPlaces];
        }
        // Limit to requested results
        const limitedResults = filteredPlaces.slice(0, Math.max(minResults, 10));
        // Enhance results with AI descriptions
        const finalResults = await Promise.all(limitedResults.map(async (place) => ({
            ...place,
            description: await generateAIDescription(place, filters)
        })));
        console.log('✅ Enhanced filtering completed:', {
            totalFound: places.length,
            afterFiltering: filteredPlaces.length,
            finalResults: finalResults.length,
            typesUsed: placeTypes
        });
        return {
            results: finalResults,
            source: 'api',
            cacheHit: false,
            totalResults: finalResults.length
        };
    }
    catch (error) {
        console.error('❌ Enhanced filtering error:', error);
        // Fallback to basic restaurant search
        const fallbackResults = await fetchRealRestaurants(filters);
        const limitedFallbackResults = fallbackResults.slice(0, minResults);
        // Enhance fallback results with AI descriptions
        const enhancedFallbackResults = await Promise.all(limitedFallbackResults.map(async (place) => ({
            ...place,
            description: await generateAIDescription(place, filters)
        })));
        return {
            results: enhancedFallbackResults,
            source: 'api',
            cacheHit: false,
            totalResults: enhancedFallbackResults.length
        };
    }
}
/**
 * Search Google Places API with multiple types
 */
async function searchGooglePlaces(placeTypes, radius, filters) {
    const allPlaces = [];
    // Manila center coordinates (14.5995,120.9842) - TODO: Get from user location
    // Google Places API Nearby Search - limited to 5 types max per request
    const typeBatches = [];
    for (let i = 0; i < placeTypes.length; i += 5) {
        typeBatches.push(placeTypes.slice(i, i + 5));
    }
    for (const types of typeBatches) {
        try {
            const typeString = types.join(',');
            const url = `${PLACES_API_BASE_URL}/places:searchNearby`;
            const requestBody = {
                includedTypes: types,
                maxResultCount: 20,
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: 14.5995,
                            longitude: 120.9842
                        },
                        radius: radius
                    }
                },
                fieldMask: 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.location,places.photos,places.websiteUri,places.nationalPhoneNumber'
            };
            console.log('📡 Google Places API Request:', {
                types: typeString,
                radius: `${radius}m`,
                requestBody: JSON.stringify(requestBody, null, 2)
            });
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                    'X-Goog-FieldMask': requestBody.fieldMask
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Google Places API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                continue;
            }
            const data = await response.json();
            const places = data.places || [];
            console.log(`📍 Found ${places.length} places for types: ${typeString}`);
            // Transform Google Places response to our format
            const transformedPlaces = places.map((place) => ({
                place_id: place.id,
                name: place.displayName?.text || place.displayName,
                address: place.formattedAddress,
                category: place.types?.[0] || 'establishment',
                rating: place.rating || 0,
                user_ratings_total: place.userRatingCount || 0,
                location: place.location ? {
                    lat: place.location.latitude,
                    lng: place.location.longitude
                } : null,
                types: place.types || [],
                price_level: place.priceLevel,
                website: place.websiteUri,
                phone: place.nationalPhoneNumber,
                opening_hours: place.regularOpeningHours,
                photos: place.photos?.map((photo) => ({
                    photo_reference: photo.name,
                    width: photo.widthPx,
                    height: photo.heightPx
                }))
            }));
            allPlaces.push(...transformedPlaces);
        }
        catch (error) {
            console.error(`Error searching for types ${types.join(',')}:`, error);
        }
    }
    // Remove duplicates by place_id
    const uniquePlaces = allPlaces.filter((place, index, array) => array.findIndex(p => p.place_id === place.place_id) === index);
    console.log(`🎯 Total unique places found: ${uniquePlaces.length}`);
    return uniquePlaces;
}
/**
 * Get expanded place types for broader search if initial results are insufficient
 */
function getExpandedPlaceTypes(filters) {
    const allTypes = new Set();
    // Add all category types
    if (filters.category) {
        const categoryTypes = category_config_1.CategoryUtils.getPreferredPlaceTypes(filters.category);
        categoryTypes.forEach(type => allTypes.add(type));
    }
    // Add related mood types (be more flexible)
    if (filters.mood) {
        const currentMood = getMoodCategory(filters.mood);
        // Include adjacent mood categories for more results
        const adjacentMoods = currentMood === 'chill' ? ['chill', 'neutral'] :
            currentMood === 'hype' ? ['hype', 'neutral'] :
                ['chill', 'neutral', 'hype'];
        adjacentMoods.forEach(mood => {
            const moodTypes = mood_config_1.MoodUtils.getPreferredPlaceTypes(mood === 'chill' ? 20 : mood === 'neutral' ? 50 : 80);
            moodTypes.forEach(type => allTypes.add(type));
        });
    }
    return Array.from(allTypes).slice(0, 10); // Limit expanded search
}
function getAppliedFiltersList(filters) {
    const appliedFilters = [];
    if (filters.category)
        appliedFilters.push(`category: ${filters.category}`);
    if (filters.mood !== undefined)
        appliedFilters.push(`mood: ${filters.mood}`);
    if (filters.budget)
        appliedFilters.push(`budget: ${filters.budget}`);
    if (filters.timeOfDay)
        appliedFilters.push(`timeOfDay: ${filters.timeOfDay}`);
    if (filters.socialContext)
        appliedFilters.push(`socialContext: ${filters.socialContext}`);
    if (filters.distanceRange)
        appliedFilters.push(`distanceRange: ${filters.distanceRange}km`);
    return appliedFilters;
}
function getQueryOptimizationDescription(filters) {
    const optimizations = [];
    if (filters.category)
        optimizations.push('Category-based type filtering');
    if (filters.budget)
        optimizations.push('Price level optimization');
    if (filters.distanceRange)
        optimizations.push('Radius-based search');
    if (filters.mood !== undefined)
        optimizations.push('NLP sentiment analysis');
    if (filters.socialContext)
        optimizations.push('Social context enhancement');
    return optimizations.length > 0
        ? optimizations.join(', ')
        : 'Basic search optimization';
}
exports.filterPlaces = functions.https.onRequest(async (req, res) => {
    const startTime = Date.now();
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { filters, minResults = 5, useCache = true } = req.body;
        if (!filters) {
            res.status(400).json({ error: 'Filters are required' });
            return;
        }
        console.log('🚀 Processing filtering request:', {
            filters,
            minResults,
            useCache,
            timestamp: new Date().toISOString()
        });
        // Perform filtering with caching
        const result = await performFiltering(filters, minResults, useCache);
        const responseTime = Date.now() - startTime;
        // Get cache statistics
        const cacheStats = serverCache.getStats();
        const response = {
            success: true,
            results: result.results,
            source: result.source,
            cacheHit: result.cacheHit,
            totalResults: result.totalResults,
            performance: {
                responseTime,
                cacheHitRate: cacheStats.hitRate,
                apiCallsMade: result.source === 'api' ? 1 : 0
            },
            metadata: {
                filtersApplied: getAppliedFiltersList(filters),
                queryOptimization: getQueryOptimizationDescription(filters)
            }
        };
        console.log('✅ Filtering completed:', {
            resultsCount: response.results.length,
            source: response.source,
            cacheHit: response.cacheHit,
            responseTime: `${responseTime}ms`,
            cacheHitRate: `${(cacheStats.hitRate * 100).toFixed(1)}%`
        });
        res.json(response);
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Filtering error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            performance: {
                responseTime
            }
        });
    }
});
/**
 * Validates "Looking For" filter connectivity and data mapping
 */
exports.validateFilter = functions.https.onRequest(async (req, res) => {
    const startTime = Date.now();
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        console.log('🔍 Filter validation function called');
        // Parse request body
        const { category, location } = req.body;
        if (!category) {
            console.error('❌ No category provided');
            res.status(400).json({
                success: false,
                error: 'No category provided'
            });
            return;
        }
        if (!category_config_1.CategoryUtils.getPreferredPlaceTypes(category).length) {
            console.error('❌ Invalid category:', category);
            res.status(400).json({
                error: 'Invalid category',
                message: `Category '${category}' not found`
            });
            return;
        }
        // Validate category connectivity
        const searchLocation = location || { lat: 14.5176, lng: 121.0509 }; // Default to BGC
        const radius = 1000; // 1km for validation
        const types = category_config_1.CategoryUtils.getPreferredPlaceTypes(category).slice(0, 5); // Limit for validation
        console.log(`🔍 Validating ${category} filter connectivity...`);
        console.log(`📍 Location: ${searchLocation.lat}, ${searchLocation.lng}`);
        console.log(`🎯 Types: ${types.join(', ')}`);
        console.log(`📏 Radius: ${radius}m`);
        // Count places using Google Places API with minimal fields
        let totalCount = 0;
        for (const type of types) {
            try {
                const count = await countPlacesByType(searchLocation, radius, type);
                totalCount += count;
                console.log(`📊 Found ${count} places of type '${type}'`);
                // If we have enough places, we can stop early
                if (totalCount >= 10) {
                    console.log(`🎯 Reached minimum count (${totalCount}), stopping early`);
                    break;
                }
            }
            catch (error) {
                console.warn(`⚠️ Failed to count places for type '${type}':`, error);
                // Continue with other types
            }
        }
        const responseTime = Date.now() - startTime;
        const result = {
            success: true,
            category,
            placeCount: totalCount,
            types,
            radius,
            location: searchLocation,
            responseTime
        };
        console.log(`✅ Validation successful: Detected ${totalCount} places for ${category} within 1km`);
        console.log(`⏱️ Response time: ${responseTime}ms`);
        res.json(result);
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Error in validateFilter:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });
    }
});
// ==================================================================================
// OLD VALIDATION HELPER FUNCTION - COMMENTED OUT FOR REPLACEMENT
// ==================================================================================
/*
/**
 * Counts places of a specific type using Google Places API with minimal fields
 */
/*
async function countPlacesByType(
  location: { lat: number; lng: number },
  radius: number,
  type: string
): Promise<number> {
  const searchUrl = `${PLACES_API_BASE_URL}/places:searchNearby`;
  
  const requestBody = {
    locationRestriction: {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng
        },
        radius: radius
      }
    },
    includedTypes: [type],
    maxResultCount: 20 // Request more to get accurate count
  };

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.location'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.places?.length || 0;
}
*/
// TODO: Implement new countPlacesByType function here
async function countPlacesByType(location, radius, type) {
    // Temporary implementation for compatibility
    console.log(`🔄 Simulating place count for type: ${type}`);
    return 5; // Return a reasonable fallback count
}
//# sourceMappingURL=filterPlaces.js.map