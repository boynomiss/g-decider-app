import { getCachedPlaces, cachePlaces, searchCachedPlaces, QueryParams, CachedPlace } from './firebase-cache';
import { UserFilters } from '../types/app';

/**
 * Enhanced Filtering System with Firebase Caching
 * 
 * This module integrates Firebase caching with the existing filtering logic.
 * It first checks the cache for existing results before making expensive
 * external API calls, significantly improving performance and reducing costs.
 */

/**
 * Convert UserFilters to QueryParams for caching
 */
function convertFiltersToQueryParams(filters: UserFilters): QueryParams {
  return {
    mood: filters.mood,
    category: filters.category,
    budget: filters.budget,
    timeOfDay: filters.timeOfDay,
    socialContext: filters.socialContext,
    distanceRange: filters.distanceRange
  };
}

/**
 * Convert CachedPlace back to the format expected by the app
 */
function convertCachedPlaceToAppFormat(cachedPlace: CachedPlace): any {
  return {
    id: cachedPlace.id,
    name: cachedPlace.name,
    location: cachedPlace.location,
    images: cachedPlace.images,
    budget: cachedPlace.budget,
    tags: cachedPlace.tags,
    description: cachedPlace.description,
    category: cachedPlace.category,
    mood: cachedPlace.mood,
    socialContext: cachedPlace.socialContext,
    timeOfDay: cachedPlace.timeOfDay,
    coordinates: cachedPlace.coordinates,
    rating: cachedPlace.rating,
    reviewCount: cachedPlace.reviewCount,
    website: cachedPlace.website,
    phone: cachedPlace.phone
  };
}

/**
 * Enhanced filtering with cache-first approach
 * @param filters User filters
 * @param minResults Minimum number of results required
 * @param useCache Whether to use cache (default: true)
 * @returns Promise with filtered results
 */
export async function enhancedFilterWithCache(
  filters: UserFilters,
  minResults: number = 5,
  useCache: boolean = true
): Promise<{
  results: any[];
  source: 'cache' | 'api' | 'mixed';
  cacheHit: boolean;
  totalResults: number;
}> {
  console.log('🚀 Starting enhanced filtering with cache...');

  if (!useCache) {
    console.log('⚠️  Cache disabled, proceeding with API calls only');
    return {
      results: await callExternalAPIs(filters),
      source: 'api',
      cacheHit: false,
      totalResults: 0
    };
  }

  try {
    // Step 1: Try exact cache match
    console.log('🔍 Step 1: Checking cache for exact match...');
    const queryParams = convertFiltersToQueryParams(filters);
    const cachedResults = await getCachedPlaces(queryParams, minResults);

    if (cachedResults && cachedResults.length >= minResults) {
      console.log(`✅ Cache hit! Found ${cachedResults.length} exact matches`);
      const convertedResults = cachedResults.map(convertCachedPlaceToAppFormat);
      
      return {
        results: convertedResults,
        source: 'cache',
        cacheHit: true,
        totalResults: cachedResults.length
      };
    }

    // Step 2: Try fuzzy cache match
    console.log('🔍 Step 2: Checking cache for fuzzy match...');
    const fuzzyCachedResults = await searchCachedPlaces(queryParams, minResults);

    if (fuzzyCachedResults && fuzzyCachedResults.length >= minResults) {
      console.log(`✅ Fuzzy cache hit! Found ${fuzzyCachedResults.length} similar matches`);
      const convertedResults = fuzzyCachedResults.map(convertCachedPlaceToAppFormat);
      
      return {
        results: convertedResults,
        source: 'cache',
        cacheHit: true,
        totalResults: fuzzyCachedResults.length
      };
    }

    // Step 3: Call external APIs and cache results
    console.log('🔍 Step 3: No cache hit, calling external APIs...');
    const apiResults = await callExternalAPIs(filters);
    
    if (apiResults.length > 0) {
      console.log(`📦 Caching ${apiResults.length} new results...`);
      await cachePlaces(apiResults, queryParams);
    }

    return {
      results: apiResults,
      source: 'api',
      cacheHit: false,
      totalResults: apiResults.length
    };

  } catch (error) {
    console.error('❌ Error in enhanced filtering:', error);
    
    // Fallback to API calls only
    console.log('🔄 Falling back to API calls only...');
    const apiResults = await callExternalAPIs(filters);
    
    return {
      results: apiResults,
      source: 'api',
      cacheHit: false,
      totalResults: apiResults.length
    };
  }
}

/**
 * Call external APIs (placeholder for existing filtering logic)
 * This should be replaced with your actual API calling logic
 */
async function callExternalAPIs(filters: UserFilters): Promise<any[]> {
  console.log('🌐 Calling external APIs with filters:', filters);
  
  // This is a placeholder - replace with your actual API calling logic
  // For now, we'll simulate API calls with mock data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock API results
  const mockResults = [
    {
      id: `api_place_${Date.now()}_1`,
      name: 'API Restaurant 1',
      location: 'API Location 1',
      images: ['api_image_1.jpg'],
      budget: 'PP' as const,
      tags: ['api', 'restaurant'],
      description: 'An API restaurant',
      category: 'food' as const,
      mood: 'chill' as const,
      socialContext: ['solo'] as const,
      timeOfDay: ['afternoon'] as const,
      rating: 4.5,
      reviewCount: 100
    },
    {
      id: `api_place_${Date.now()}_2`,
      name: 'API Restaurant 2',
      location: 'API Location 2',
      images: ['api_image_2.jpg'],
      budget: 'PPP' as const,
      tags: ['api', 'fine-dining'],
      description: 'A fine dining API restaurant',
      category: 'food' as const,
      mood: 'hype' as const,
      socialContext: ['with-bae'] as const,
      timeOfDay: ['night'] as const,
      rating: 4.8,
      reviewCount: 200
    }
  ];

  console.log(`✅ API calls completed, got ${mockResults.length} results`);
  return mockResults;
}

/**
 * Get cache statistics for monitoring
 */
export async function getCachePerformanceStats(): Promise<{
  cacheHitRate: number;
  averageResponseTime: number;
  totalRequests: number;
  cacheSize: number;
}> {
  // This would integrate with your actual monitoring system
  // For now, return mock statistics
  return {
    cacheHitRate: 0.75, // 75% cache hit rate
    averageResponseTime: 150, // 150ms average response time
    totalRequests: 1000,
    cacheSize: 500
  };
}

/**
 * Test the enhanced filtering system
 */
export async function testEnhancedFiltering(): Promise<void> {
  console.log('🧪 Testing Enhanced Filtering with Cache\n');

  try {
    // Test 1: Test with cache enabled
    console.log('1️⃣ Testing enhanced filtering with cache enabled...');
    const testFilters: UserFilters = {
      mood: 50,
      category: 'food',
      budget: 'PP',
      timeOfDay: 'afternoon',
      socialContext: 'solo',
      distanceRange: 5
    };

    const result1 = await enhancedFilterWithCache(testFilters, 3, true);
    console.log(`✅ Cache test completed:`);
    console.log(`   Source: ${result1.source}`);
    console.log(`   Cache hit: ${result1.cacheHit}`);
    console.log(`   Results: ${result1.results.length}\n`);

    // Test 2: Test with cache disabled
    console.log('2️⃣ Testing enhanced filtering with cache disabled...');
    const result2 = await enhancedFilterWithCache(testFilters, 3, false);
    console.log(`✅ No-cache test completed:`);
    console.log(`   Source: ${result2.source}`);
    console.log(`   Cache hit: ${result2.cacheHit}`);
    console.log(`   Results: ${result2.results.length}\n`);

    // Test 3: Test performance stats
    console.log('3️⃣ Testing performance statistics...');
    const stats = await getCachePerformanceStats();
    console.log(`✅ Performance stats:`);
    console.log(`   Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   Average response time: ${stats.averageResponseTime}ms`);
    console.log(`   Total requests: ${stats.totalRequests}`);
    console.log(`   Cache size: ${stats.cacheSize} entries\n`);

    console.log('🎉 Enhanced Filtering test completed successfully!');

  } catch (error) {
    console.error('❌ Enhanced Filtering test failed:', error);
    throw error;
  }
}

// Export for testing
if (require.main === module) {
  testEnhancedFiltering();
} 