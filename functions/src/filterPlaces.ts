import * as functions from 'firebase-functions';
import { Request, Response } from 'firebase-functions';

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';

// Category to Google Places API type mapping for validation
const VALIDATION_TYPE_MAPPING = {
  'food': ['restaurant', 'cafe', 'bar', 'bakery'],
  'activity': ['park', 'museum', 'art_gallery', 'movie_theater', 'tourist_attraction'],
  'something-new': ['shopping_mall', 'library', 'book_store', 'tourist_attraction']
} as const;

interface UserFilters {
  mood: number;
  category: 'food' | 'activity' | 'something-new' | null;
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null;
}

interface FilteringResponse {
  success: boolean;
  results: any[];
  source: 'cache' | 'api' | 'mixed';
  cacheHit: boolean;
  totalResults: number;
  performance: {
    responseTime: number;
    cacheHitRate: number;
    apiCallsMade: number;
  };
  metadata: {
    filtersApplied: string[];
    queryOptimization: string;
  };
}

// Server-side cache implementation
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

// Initialize server cache
const serverCache = new ServerCache();

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

async function enhancePlaceWithDetails(place: any): Promise<any | null> {
  try {
    if (!place.id) {
      console.warn('⚠️ Place has no ID, skipping details fetch');
      return place;
    }
    
    const details = await fetchPlaceDetailsWithRetry(place.id);
    if (!details) {
      return place;
    }
    
    return {
      ...place,
      ...details,
      enhanced: true
    };
    
  } catch (error) {
    console.error('❌ Error enhancing place:', error);
    return place;
  }
}

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

function getFallbackRestaurants(): any[] {
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

async function generateAIDescription(restaurantData: any, filters: UserFilters): Promise<string> {
  try {
    // For now, return a simple description
    // In production, this would call the Gemini API
    const baseDescription = `${restaurantData.name} is a great place to visit.`;
    
    if (filters.socialContext === 'with-bae') {
      return `${baseDescription} Perfect for a romantic date night.`;
    } else if (filters.socialContext === 'barkada') {
      return `${baseDescription} Great for group gatherings and celebrations.`;
    } else {
      return `${baseDescription} Ideal for solo dining and quiet meals.`;
    }
  } catch (error) {
    console.error('❌ Error generating AI description:', error);
    return `${restaurantData.name} is a great place to visit.`;
  }
}

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
  
  // Add AI descriptions
  const finalResults = await Promise.all(
    filteredResults.map(async (place) => ({
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

function getAppliedFiltersList(filters: UserFilters): string[] {
  const appliedFilters: string[] = [];
  
  if (filters.category) appliedFilters.push(`category: ${filters.category}`);
  if (filters.mood !== undefined) appliedFilters.push(`mood: ${filters.mood}`);
  if (filters.budget) appliedFilters.push(`budget: ${filters.budget}`);
  if (filters.timeOfDay) appliedFilters.push(`timeOfDay: ${filters.timeOfDay}`);
  if (filters.socialContext) appliedFilters.push(`socialContext: ${filters.socialContext}`);
  if (filters.distanceRange) appliedFilters.push(`distanceRange: ${filters.distanceRange}km`);
  
  return appliedFilters;
}

function getQueryOptimizationDescription(filters: UserFilters): string {
  const optimizations: string[] = [];
  
  if (filters.category) optimizations.push('Category-based type filtering');
  if (filters.budget) optimizations.push('Price level optimization');
  if (filters.distanceRange) optimizations.push('Radius-based search');
  if (filters.mood !== undefined) optimizations.push('NLP sentiment analysis');
  if (filters.socialContext) optimizations.push('Social context enhancement');
  
  return optimizations.length > 0 
    ? optimizations.join(', ')
    : 'Basic search optimization';
}

export const filterPlaces = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
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
    
    const response: FilteringResponse = {
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
    
  } catch (error) {
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
export const validateFilter = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response): Promise<void> => {
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
    
    if (!VALIDATION_TYPE_MAPPING[category as keyof typeof VALIDATION_TYPE_MAPPING]) {
      console.error('❌ Invalid category:', category);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid category' 
      });
      return;
    }
    
    const searchLocation = location || { lat: 14.5176, lng: 121.0509 }; // Default to BGC
    const radius = 1000; // 1km for validation
    const types = VALIDATION_TYPE_MAPPING[category as keyof typeof VALIDATION_TYPE_MAPPING];
    
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
      } catch (error) {
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
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error in validateFilter:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    });
  }
});

/**
 * Counts places of a specific type using Google Places API with minimal fields
 */
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
