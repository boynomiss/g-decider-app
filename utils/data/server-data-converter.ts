import { PlaceMoodData, ReviewEntity } from '../../types/filtering';
import { ServerPlaceData, ServerFilteringResponse, isValidServerPlaceData, isValidServerFilteringResponse } from '../../types/server-filtering';

/**
 * Converts server place data to client PlaceData format
 */
export function convertServerPlaceToPlaceData(serverPlace: ServerPlaceData): PlaceData {
  // Validate input
  if (!isValidServerPlaceData(serverPlace)) {
    throw new Error(`Invalid server place data: ${JSON.stringify(serverPlace)}`);
  }

  // Convert reviews format
  const convertedReviews: Review[] = (serverPlace.reviews || []).map((review: any) => ({
    author: review.author || 'Anonymous',
    rating: review.rating,
    text: review.text,
    time: typeof review.time === 'number' ? review.time.toString() : review.time
  }));

  // Convert budget to price level
  const priceLevel = serverPlace.budget === 'P' ? 1 : serverPlace.budget === 'PP' ? 2 : 3;

  // Convert mood to mood score
  const moodScore = serverPlace.mood === 'chill' ? 25 : serverPlace.mood === 'hype' ? 75 : 50;

  return {
    place_id: serverPlace.id,
    name: serverPlace.name,
    address: serverPlace.location,
    category: serverPlace.category,
    user_ratings_total: serverPlace.reviewCount || 0,
    rating: serverPlace.rating || 0,
    reviews: convertedReviews,
    images: {
      urls: serverPlace.images || [],
      metadata: {
        totalImages: (serverPlace.images || []).length,
        authenticImages: (serverPlace.images || []).length,
        averageConfidence: 1.0,
        sources: ['server']
      }
    },
    photos: {
      thumbnail: serverPlace.images || [],
      medium: serverPlace.images || [],
      large: serverPlace.images || [],
      count: (serverPlace.images || []).length
    },
    location: serverPlace.coordinates && serverPlace.coordinates.lat !== 0 && serverPlace.coordinates.lng !== 0 
      ? serverPlace.coordinates 
      : { lat: 14.5176, lng: 121.0509 }, // Fallback to BGC coordinates
    website: serverPlace.website,
    description: serverPlace.description,
    vicinity: serverPlace.location !== 'Unknown Location' ? serverPlace.location : 'BGC, Taguig City',
    formatted_address: serverPlace.location !== 'Unknown Location' ? serverPlace.location : 'BGC, Taguig City',
    types: serverPlace.tags || [],
    price_level: priceLevel,
    opening_hours: serverPlace.openHours ? { open_now: true } : undefined,
    mood_score: moodScore,
    final_mood: serverPlace.mood,
    contact: {
      website: serverPlace.website,
      hasContact: !!serverPlace.website
    },
    contactActions: {
      canCall: false,
      canVisitWebsite: !!serverPlace.website,
      websiteUrl: serverPlace.website
    }
  };
}

/**
 * Converts server filtering response to client format
 */
export function convertServerResponse(response: any): {
  placeDataResults: PlaceData[];
  performance: {
    responseTime: number;
    cacheHitRate: number;
    apiCallsMade: number;
  };
  metadata: {
    filtersApplied: string[];
    queryOptimization: string;
    source: 'cache' | 'api' | 'mixed';
    cacheHit: boolean;
    totalResults: number;
  };
} {
  // Validate response structure
  if (!isValidServerFilteringResponse(response)) {
    throw new Error(`Invalid server response format: ${JSON.stringify(response)}`);
  }

  // Convert each place
  const placeDataResults: PlaceData[] = response.results.map((place: ServerPlaceData) => {
    try {
      return convertServerPlaceToPlaceData(place);
    } catch (error) {
      console.error('❌ Error converting place:', place.id, error);
      // Return a fallback place data
      return {
        place_id: place.id || 'unknown',
        name: place.name || 'Unknown Place',
        address: place.location || 'Unknown location',
        category: place.category || 'food',
        user_ratings_total: 0,
        rating: 0,
        reviews: [],
        images: {
          urls: [],
          metadata: {
            totalImages: 0,
            authenticImages: 0,
            averageConfidence: 0,
            sources: ['fallback']
          }
        },
        photos: {
          thumbnail: [],
          medium: [],
          large: [],
          count: 0
        },
        types: [],
        price_level: 2,
        mood_score: 50,
        final_mood: 'neutral',
        contact: {
          hasContact: false
        },
        contactActions: {
          canCall: false,
          canVisitWebsite: false
        }
      };
    }
  });

  return {
    placeDataResults,
    performance: {
      responseTime: response.performance.responseTime,
      cacheHitRate: response.performance.cacheHitRate,
      apiCallsMade: response.performance.apiCallsMade
    },
    metadata: {
      filtersApplied: response.metadata.filtersApplied,
      queryOptimization: response.metadata.queryOptimization,
      source: response.source,
      cacheHit: response.cacheHit,
      totalResults: response.totalResults
    }
  };
}

/**
 * Validates and sanitizes server response
 */
export function validateAndSanitizeResponse(response: any): ServerFilteringResponse {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  if (!response.success) {
    throw new Error(`Server error: ${response.error || 'Unknown error'}`);
  }

  if (!Array.isArray(response.results)) {
    throw new Error('Invalid response: results is not an array');
  }

  // Ensure all required fields exist
  const sanitizedResponse: ServerFilteringResponse = {
    success: response.success,
    results: response.results,
    source: response.source || 'api',
    cacheHit: response.cacheHit || false,
    totalResults: response.totalResults || response.results.length,
    performance: {
      responseTime: response.performance?.responseTime || 0,
      cacheHitRate: response.performance?.cacheHitRate || 0,
      apiCallsMade: response.performance?.apiCallsMade || 0
    },
    metadata: {
      filtersApplied: response.metadata?.filtersApplied || [],
      queryOptimization: response.metadata?.queryOptimization || 'Basic search'
    }
  };

  return sanitizedResponse;
} 