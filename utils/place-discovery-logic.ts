import { PlaceMoodService, PlaceData } from './place-mood-service';
import { CATEGORY_MOOD_MAPPING } from './mood-config';
import { generatePhotoUrls, getOptimizedPhotoUrls, createFrontendPhotoUrls } from './photo-url-generator';
import { googlePlacesClient, googleNaturalLanguageClient } from './google-api-clients';
import { createFrontendContactObject, ContactDetails } from './contact-formatter';

// Types for the discovery logic system
export interface DiscoveryFilters {
  category: 'food' | 'activity' | 'something-new';
  mood: number; // 0-100
  socialContext?: 'solo' | 'with-bae' | 'barkada' | null;
  budget?: 'P' | 'PP' | 'PPP' | null;
  timeOfDay?: 'morning' | 'afternoon' | 'night' | null;
  distanceRange: number; // 0-100 (mapped to actual distances)
  userLocation: {
    lat: number;
    lng: number;
  };
}

export interface AdvertisedPlace extends PlaceData {
  isAdvertised: true;
  advertisementDetails?: {
    campaignId: string;
    impressions: number;
    clickRate: number;
  };
}

export interface DiscoveryResult {
  places: (PlaceData | AdvertisedPlace)[];
  loadingState: LoadingState;
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

export type LoadingState = 
  | 'initial'
  | 'searching'
  | 'expanding-distance'
  | 'limit-reach'
  | 'complete'
  | 'error';

export interface DistanceMapping {
  percentage: number;
  meters: number;
  label: string;
}

// Distance mappings based on your specifications
const DISTANCE_MAPPINGS: DistanceMapping[] = [
  { percentage: 20, meters: 250, label: 'Very Close' },
  { percentage: 40, meters: 1000, label: 'Walking Distance' },
  { percentage: 60, meters: 5000, label: 'Short Car Ride' },
  { percentage: 80, meters: 10000, label: 'Long Car Ride' },
  { percentage: 100, meters: 20000, label: 'As Far as It Gets' }
];

// Google Places category mappings for the three main categories
const CATEGORY_TO_GOOGLE_TYPES: Record<string, string[]> = {
  'food': [
    'restaurant', 'cafe', 'bakery', 'bar', 'meal_delivery', 
    'meal_takeaway', 'food', 'fast_food_restaurant', 
    'pizza_place', 'coffee_shop', 'ice_cream_shop'
  ],
  'activity': [
    'amusement_park', 'aquarium', 'art_gallery', 'bowling_alley',
    'casino', 'gym', 'movie_theater', 'museum', 'night_club',
    'park', 'shopping_mall', 'spa', 'stadium', 'tourist_attraction',
    'zoo', 'karaoke', 'arcade', 'escape_room'
  ],
  'something-new': [
    'art_gallery', 'book_store', 'library', 'museum',
    'performing_arts_theater', 'university', 'cultural_center',
    'workshop', 'cooking_class', 'dance_studio', 'music_venue',
    'comedy_club', 'exhibition', 'festival'
  ]
};

export class PlaceDiscoveryLogic {
  private moodService: PlaceMoodService;
  private googleApiKey: string;
  private advertisedPlaces: AdvertisedPlace[];
  private placePool: PlaceData[] = [];
  private usedPlaceIds: Set<string> = new Set();
  private currentExpansionCount: number = 0;
  private currentRadius: number = 0;
  
  // Configuration constants
  private readonly MAX_EXPANSIONS = 3;
  private readonly EXPANSION_INCREMENT = 500; // meters
  private readonly MIN_PLACES_FOR_EXPANSION = 15;
  private readonly MAX_POOL_SIZE = 12;
  private readonly PLACES_PER_RESULT = 4;
  private readonly ADVERTISED_PLACES_PER_RESULT = 1;

  constructor(
    moodService: PlaceMoodService,
    googleApiKey: string,
    advertisedPlaces: AdvertisedPlace[] = []
  ) {
    this.moodService = moodService;
    this.googleApiKey = googleApiKey;
    this.advertisedPlaces = advertisedPlaces;
  }

  /**
   * Main discovery function - returns 4 places + 1 advertised
   */
  async discoverPlaces(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    console.log('🎯 Starting place discovery with filters:', filters);
    
    try {
      // Reset for new discovery session
      this.currentExpansionCount = 0;
      this.currentRadius = this.getDistanceInMeters(filters.distanceRange);
      
      // Start with searching state
      let loadingState: LoadingState = 'searching';
      
      // Collect places with potential expansion
      const collectionResult = await this.collectPlacesWithExpansion(filters);
      
      // Update loading state based on expansion
      if (collectionResult.expansionCount > 0) {
        if (collectionResult.expansionCount >= 2) {
          loadingState = 'limit-reach';
        } else {
          loadingState = 'expanding-distance';
        }
      }
      
      // Analyze filter effectiveness before applying filters
      const filteredPlaces = this.applyFilters(this.placePool, filters);
      let rankedPlaces = this.rankPlaces(filteredPlaces, filters);
      
      const selectedPlaces = this.selectPlaces(rankedPlaces, this.PLACES_PER_RESULT);
      
      const finalPlaces = this.addAdvertisedPlace(selectedPlaces);
      
      selectedPlaces.forEach(place => this.usedPlaceIds.add(place.place_id));
      
      return {
        places: finalPlaces,
        loadingState: 'complete',
        expansionInfo: {
          expansionCount: collectionResult.expansionCount,
          finalRadius: collectionResult.finalRadius,
          totalPlacesFound: collectionResult.totalPlaces
        },
        poolInfo: {
          remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
          totalPoolSize: this.placePool.length,
          needsRefresh: this.needsPoolRefresh()
        }
      };
      
    } catch (error) {
      console.error('❌ Discovery error:', error);
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
   * Get next batch of results from existing pool or expand if needed
   */
  async getNextBatch(filters: DiscoveryFilters): Promise<DiscoveryResult> {
    console.log('🔄 Getting next batch of places');
    
    // Check if we need to refresh the pool
    if (this.needsPoolRefresh()) {
      console.log('🔄 Pool needs refresh, collecting new places');
      return this.discoverPlaces(filters);
    }
    
    // Use existing pool
    const unusedPlaces = this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id));
    const filteredPlaces = this.applyFilters(unusedPlaces, filters);
    const rankedPlaces = this.rankPlaces(filteredPlaces);
    
    // Select places for this result
    const selectedPlaces = this.selectPlaces(rankedPlaces, this.PLACES_PER_RESULT);
    
    // Add advertised place
    const finalPlaces = this.addAdvertisedPlace(selectedPlaces);
    
    // Mark places as used
    selectedPlaces.forEach(place => this.usedPlaceIds.add(place.place_id));
    
    return {
      places: finalPlaces,
      loadingState: 'complete',
      poolInfo: {
        remainingPlaces: this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length,
        totalPoolSize: this.placePool.length,
        needsRefresh: this.needsPoolRefresh()
      }
    };
  }

  /**
   * Collect places with automatic distance expansion if needed
   */
  private async collectPlacesWithExpansion(filters: DiscoveryFilters): Promise<{
    places: PlaceData[];
    expansionCount: number;
    finalRadius: number;
    totalPlaces: number;
  }> {
    let allPlaces: PlaceData[] = [];
    let expansionCount = 0;
    let currentRadius = this.currentRadius;
    
    while (allPlaces.length < this.MIN_PLACES_FOR_EXPANSION && expansionCount < this.MAX_EXPANSIONS) {
      console.log(`📍 Searching with radius: ${currentRadius}m (expansion ${expansionCount})`);
      
      // Search for places at current radius
      const places = await this.searchGooglePlaces(filters, currentRadius);
      
      // Enhance places with mood data
      const enhancedPlaces = await this.enhancePlacesWithMood(places);
      
      // Add new places (avoid duplicates)
      const newPlaces = enhancedPlaces.filter(p => 
        !allPlaces.some(existing => existing.place_id === p.place_id)
      );
      
      allPlaces = [...allPlaces, ...newPlaces];
      
      console.log(`📊 Found ${newPlaces.length} new places, total: ${allPlaces.length}`);
      
      // Check if we need to expand
      if (allPlaces.length < this.MIN_PLACES_FOR_EXPANSION && expansionCount < this.MAX_EXPANSIONS) {
        expansionCount++;
        currentRadius += this.EXPANSION_INCREMENT;
        console.log(`📏 Expanding search radius to ${currentRadius}m`);
      } else {
        break;
      }
    }
    
    // Update pool with collected places (limit to MAX_POOL_SIZE)
    this.placePool = allPlaces.slice(0, this.MAX_POOL_SIZE);
    this.currentExpansionCount = expansionCount;
    this.currentRadius = currentRadius;
    
    return {
      places: this.placePool,
      expansionCount,
      finalRadius: currentRadius,
      totalPlaces: allPlaces.length
    };
  }

  /**
   * Search Google Places API (New) with comprehensive filter support
   */
  private async searchGooglePlaces(
    filters: DiscoveryFilters, 
    radius: number
  ): Promise<Partial<PlaceData>[]> {
    const types = CATEGORY_TO_GOOGLE_TYPES[filters.category] || [];
    
    console.log('🌍 Searching places near location (Enhanced Places API):', {
      coordinates: filters.userLocation,
      radius,
      category: filters.category,
      filters: {
        mood: filters.mood,
        budget: filters.budget,
        socialContext: filters.socialContext,
        timeOfDay: filters.timeOfDay
      }
    });
    
    // Build comprehensive request body with all six filters
    const requestBody: any = {
      includedTypes: this.buildIncludedTypes(filters),
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: filters.userLocation.lat,
            longitude: filters.userLocation.lng
          },
          radius: radius
        }
      },
      languageCode: 'en'
    };

    // Add price level filtering (Budget filter)
    const priceLevel = this.mapBudgetToPriceLevel(filters.budget);
    if (priceLevel) {
      requestBody.minPrice = priceLevel.min;
      requestBody.maxPrice = priceLevel.max;
    }

    // Add time-based filtering (Time of Day filter)
    if (filters.timeOfDay) {
      requestBody.openNow = true; // Prefer places that are currently open
    }

    // Add text query for enhanced social context matching
    if (filters.socialContext) {
      const contextQuery = this.buildSocialContextQuery(filters.socialContext, filters.category);
      if (contextQuery) {
        requestBody.textQuery = contextQuery;
      }
    }

    try {
      const places = await googlePlacesClient.searchNearby(
        filters.userLocation,
        radius,
        requestBody.includedTypes
      );
      
      if (!places || places.length === 0) {
        console.warn('Google Places API (New): No places found');
        return [];
      }

      console.log('✅ Found places with Enhanced API:', places.length);
      
      // Transform places with enhanced image processing and reviews
      const transformedPlaces = await Promise.all(
        places.map((place: any) => this.transformGooglePlaceEnhanced(place))
      );
      
      return transformedPlaces;
      
    } catch (error) {
      console.error('❌ Google Places search error (Enhanced API):', error);
      return [];
    }
  }

  /**
   * Build includedTypes based on category and social context
   */
  private buildIncludedTypes(filters: DiscoveryFilters): string[] {
    const baseTypes = CATEGORY_TO_GOOGLE_TYPES[filters.category] || [];
    
    // Enhance types based on social context
    if (filters.socialContext) {
      const socialEnhancement = this.getSocialContextTypes(filters.socialContext, filters.category);
      return [...new Set([...baseTypes, ...socialEnhancement])].slice(0, 10); // Limit to 10 types
    }
    
    return baseTypes.slice(0, 5); // Limit to 5 primary types
  }

  /**
   * Map social context to appropriate place types
   */
  private getSocialContextTypes(socialContext: string, category: string): string[] {
    const socialMapping: Record<string, Record<string, string[]>> = {
      'solo': {
        'food': ['cafe', 'coffee_shop', 'library', 'book_store'],
        'activity': ['museum', 'art_gallery', 'park', 'gym', 'spa'],
        'something-new': ['library', 'book_store', 'art_gallery', 'museum']
      },
      'with-bae': {
        'food': ['restaurant', 'cafe', 'wine_bar', 'rooftop_lounge'],
        'activity': ['movie_theater', 'park', 'spa', 'art_gallery'],
        'something-new': ['art_gallery', 'museum', 'cultural_center', 'wine_tasting']
      },
      'barkada': {
        'food': ['restaurant', 'bar', 'karaoke', 'buffet'],
        'activity': ['bowling_alley', 'karaoke', 'amusement_park', 'arcade'],
        'something-new': ['escape_room', 'cooking_class', 'group_activity']
      }
    };

    return socialMapping[socialContext]?.[category] || [];
  }

  /**
   * Build text query for social context enhancement
   */
  private buildSocialContextQuery(socialContext: string, category: string): string | null {
    const queryMapping: Record<string, Record<string, string>> = {
      'solo': {
        'food': 'quiet cafe peaceful solo dining',
        'activity': 'peaceful relaxing individual',
        'something-new': 'quiet learning individual experience'
      },
      'with-bae': {
        'food': 'romantic intimate couple dining',
        'activity': 'romantic couple date night',
        'something-new': 'romantic couple experience'
      },
      'barkada': {
        'food': 'group dining family style sharing',
        'activity': 'group activity friends entertainment',
        'something-new': 'group experience team activity'
      }
    };

    return queryMapping[socialContext]?.[category] || null;
  }

  /**
   * Map budget filter to Google Places price levels
   */
  private mapBudgetToPriceLevel(budget?: 'P' | 'PP' | 'PPP' | null): { min: number; max: number } | null {
    if (!budget) return null;
    
    const priceMapping = {
      'P': { min: 0, max: 1 },     // Free to Inexpensive
      'PP': { min: 1, max: 2 },    // Inexpensive to Moderate
      'PPP': { min: 2, max: 4 }    // Moderate to Very Expensive
    };
    
    return priceMapping[budget];
  }

  /**
   * Enhanced transformation method with comprehensive data processing
   */
  private async transformGooglePlaceEnhanced(place: any): Promise<Partial<PlaceData>> {
    try {
      // Extract basic place data
      const basicData = await this.transformGooglePlaceNew(place);
      
      // Get detailed place information including reviews, photos, and contact details
      const detailedPlace = await googlePlacesClient.getPlace(place.id, [
        'id', 'displayName', 'formattedAddress', 'types', 'userRatingCount', 
        'rating', 'reviews', 'photos', 'regularOpeningHours', 'websiteUri',
        'nationalPhoneNumber', 'internationalPhoneNumber', 'priceLevel',
        'location', 'businessStatus', 'editorialSummary'
      ]);
      
      // Extract reviews for sentiment analysis
      const reviews = this.extractReviews(detailedPlace.reviews);
      
      // Perform NLP sentiment analysis on reviews for mood scoring
      const sentimentData = await this.analyzeReviewSentiment(reviews);
      
      // Calculate mood score based on sentiment analysis
      const moodScore = this.calculateMoodFromSentiment(sentimentData, basicData);
      
      // Process photos for frontend consumption
      const photoUrls = createFrontendPhotoUrls(detailedPlace.photos, {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 400, height: 300 },
        large: { width: 800, height: 600 },
        maxPhotos: 8
      });
      
      // Process contact details for frontend consumption
      const contactInfo = createFrontendContactObject(detailedPlace);
      
      return {
        ...basicData,
        reviews,
        mood_score: moodScore,
        final_mood: this.assignFinalMood(moodScore),
        // Enhanced photo URLs ready for frontend
        photos: photoUrls,
        // Enhanced contact information
        contact: contactInfo.contact,
        contactActions: contactInfo.actions,
        // Legacy fields for backward compatibility
        website: detailedPlace.websiteUri,
        phone: detailedPlace.nationalPhoneNumber || detailedPlace.internationalPhoneNumber,
        // Enhanced opening hours
        opening_hours: detailedPlace.regularOpeningHours,
        // Additional useful data
        business_status: detailedPlace.businessStatus,
        editorial_summary: detailedPlace.editorialSummary?.text
      } as PlaceData;
      
      } catch (error) {
      console.error('❌ Error in enhanced transformation:', error);
      // Fallback to basic transformation
      return this.transformGooglePlaceNew(place);
    }
  }

  /**
   * Extract and format reviews from Google Places API response
   */
  private extractReviews(reviewsData: any[]): Array<{ text: string; rating: number; time: number }> {
    if (!reviewsData || !Array.isArray(reviewsData)) {
      return [];
    }
    
    return reviewsData.slice(0, 10).map(review => ({
      text: review.text?.text || review.text || '',
      rating: review.rating || 0,
      time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : Date.now() / 1000
    }));
  }

  /**
   * Analyze review sentiment using Google Natural Language API
   */
  private async analyzeReviewSentiment(reviews: Array<{ text: string; rating: number; time: number }>): Promise<{
    score: number;
    magnitude: number;
    keywordSentiment: { positive: number; negative: number; neutral: number };
  }> {
    if (!reviews || reviews.length === 0) {
      return { score: 0, magnitude: 0, keywordSentiment: { positive: 0, negative: 0, neutral: 0 } };
    }

    try {
      // Combine recent reviews for analysis
      const recentReviews = reviews
        .sort((a, b) => b.time - a.time)
        .slice(0, 5)
        .map(review => review.text)
        .filter(text => text.length > 10)
        .join(' ');

      if (!recentReviews) {
        return { score: 0, magnitude: 0, keywordSentiment: { positive: 0, negative: 0, neutral: 0 } };
      }

      // Use centralized Natural Language client
      if (googleNaturalLanguageClient.isAvailable()) {
        const sentimentResult = await googleNaturalLanguageClient.analyzeSentiment(recentReviews);
        
        return {
          score: sentimentResult.documentSentiment?.score || 0,
          magnitude: sentimentResult.documentSentiment?.magnitude || 0,
          keywordSentiment: this.extractKeywordSentiment(recentReviews)
        };
      } else {
        // Fallback to keyword-based sentiment analysis
        console.log('📝 Using keyword-based sentiment analysis (NLP API unavailable)');
        return {
          score: 0,
          magnitude: 0,
          keywordSentiment: this.extractKeywordSentiment(recentReviews)
        };
      }
      
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      // Fallback to rating-based sentiment
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const normalizedScore = (avgRating - 3) / 2; // Convert 1-5 rating to -1 to 1 scale
      
      return {
        score: normalizedScore,
        magnitude: Math.abs(normalizedScore),
        keywordSentiment: { positive: 0, negative: 0, neutral: 1 }
      };
    }
  }

  /**
   * Extract keyword-based sentiment from text
   */
  private extractKeywordSentiment(text: string): { positive: number; negative: number; neutral: number } {
    const positiveKeywords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'awesome', 'delicious', 'friendly', 'clean', 'comfortable'];
    const negativeKeywords = ['terrible', 'awful', 'horrible', 'disgusting', 'dirty', 'rude', 'slow', 'expensive', 'disappointing', 'worst', 'hate', 'never'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positive = 0, negative = 0, neutral = 0;
    
    words.forEach(word => {
      if (positiveKeywords.some(keyword => word.includes(keyword))) {
        positive++;
      } else if (negativeKeywords.some(keyword => word.includes(keyword))) {
        negative++;
      } else {
        neutral++;
      }
    });
    
    const total = positive + negative + neutral;
    return {
      positive: total > 0 ? positive / total : 0,
      negative: total > 0 ? negative / total : 0,
      neutral: total > 0 ? neutral / total : 0
    };
  }

  /**
   * Calculate mood score from sentiment analysis
   */
  private calculateMoodFromSentiment(
    sentimentData: { score: number; magnitude: number; keywordSentiment: any },
    placeData: Partial<PlaceData>
  ): number {
    // Base score from sentiment (convert -1 to 1 range to 0-100)
    let moodScore = ((sentimentData.score + 1) / 2) * 100;
    
    // Adjust based on magnitude (higher magnitude = more confident score)
    const magnitudeWeight = Math.min(sentimentData.magnitude, 1);
    moodScore = (moodScore * magnitudeWeight) + (50 * (1 - magnitudeWeight));
    
    // Adjust based on rating if available
    if (placeData.rating && placeData.rating > 0) {
      const ratingScore = ((placeData.rating - 1) / 4) * 100; // Convert 1-5 to 0-100
      moodScore = (moodScore * 0.7) + (ratingScore * 0.3); // Weight sentiment more than rating
    }
    
    // Adjust based on keyword sentiment
    const keywordWeight = sentimentData.keywordSentiment.positive - sentimentData.keywordSentiment.negative;
    moodScore += keywordWeight * 10; // Small adjustment based on keywords
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(moodScore)));
  }

  /**
   * Assign final mood category based on score
   */
  private assignFinalMood(moodScore: number): string {
    if (moodScore >= 70) return 'hype';
    if (moodScore >= 40) return 'neutral';
    return 'chill';
  }

  /**
   * Enhance places with mood data using integrated NLP analysis
   */
  private async enhancePlacesWithMood(places: Partial<PlaceData>[]): Promise<PlaceData[]> {
    // Places are already enhanced with mood data in transformGooglePlaceEnhanced
    // This method now serves as a final validation and fallback
    const enhancedPlaces: PlaceData[] = [];
    
    for (const place of places) {
      try {
        // Ensure all required fields are present
        const validatedPlace: PlaceData = {
          place_id: place.place_id || '',
          name: place.name || 'Unknown Place',
          address: place.address || place.formatted_address || 'Unknown Address',
          category: place.category || 'establishment',
          user_ratings_total: place.user_ratings_total || 0,
          rating: place.rating || 0,
          reviews: place.reviews || [],
          mood_score: place.mood_score || 50,
          final_mood: place.final_mood || 'neutral',
          // Enhanced photo URLs for frontend
          photos: place.photos || {
            thumbnail: [],
            medium: [],
            large: [],
            count: 0
          },
          // Enhanced contact information for frontend
          contact: place.contact || {
            hasContact: false
          },
          contactActions: place.contactActions || {
            canCall: false,
            canVisitWebsite: false
          },
          // Legacy and additional fields
          images: place.images,
          website: place.website,
          phone: place.phone,
          opening_hours: place.opening_hours,
          types: place.types,
          price_level: place.price_level,
          location: place.location,
          geometry: place.geometry,
          business_status: place.business_status,
          editorial_summary: place.editorial_summary
        };
        
        enhancedPlaces.push(validatedPlace);
        
      } catch (error) {
        console.error('❌ Error validating enhanced place:', error);
        // Skip invalid places
      }
    }
    
    return enhancedPlaces;
  }

  /**
   * Apply filters with progressive relaxation logic
   */
  private applyFilters(places: PlaceData[], filters: DiscoveryFilters): PlaceData[] {
    console.log(`🔍 Applying filters to ${places.length} places`);
    
    // Try strict filtering first
    let filteredPlaces = this.applyStrictFilters(places, filters);
    console.log(`📊 Strict filtering: ${filteredPlaces.length} places remain`);
    
    // If we have enough places, return them
    if (filteredPlaces.length >= 4) {
      return filteredPlaces;
    }
    
    // If not enough places, progressively relax filters
    console.log('🔄 Not enough places found, applying progressive filtering...');
    filteredPlaces = this.applyProgressiveFiltering(places, filters);
    
    return filteredPlaces;
  }

  /**
   * Apply strict filters (must match)
   */
  private applyStrictFilters(places: PlaceData[], filters: DiscoveryFilters): PlaceData[] {
    return places.filter(place => {
      // STRICT: Category (already filtered by Google API)
      // Category is implicitly matched through Google Places types
      
      // STRICT: Distance (already handled by radius in API call)
      // Distance is implicitly matched through locationRestriction
      
      // STRICT: Budget (if specified)
      if (filters.budget && !this.isBudgetAcceptable(place, filters.budget)) {
        console.log(`❌ Budget filter failed for ${place.name}: expected ${filters.budget}, got price level ${place.price_level}`);
        return false;
      }
      
      // STRICT: Mood (must be within acceptable range)
      if (!this.isMoodAcceptable(place.mood_score || 50, filters.mood)) {
        console.log(`❌ Mood filter failed for ${place.name}: place mood ${place.mood_score}, user mood ${filters.mood}`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Progressive filtering with relaxed constraints
   */
  private applyProgressiveFiltering(places: PlaceData[], filters: DiscoveryFilters): PlaceData[] {
    // Step 1: Relax mood filter (expand acceptable range)
    let filteredPlaces = places.filter(place => {
      // Keep budget filter strict
      if (filters.budget && !this.isBudgetAcceptable(place, filters.budget)) {
        return false;
      }
      
      // Relax mood filter - accept wider range
      if (!this.isMoodAcceptableRelaxed(place.mood_score || 50, filters.mood)) {
        return false;
      }
      
      return true;
    });
    
    console.log(`🔄 Step 1 - Relaxed mood: ${filteredPlaces.length} places`);
    if (filteredPlaces.length >= 4) {
      return filteredPlaces;
    }
    
    // Step 2: Relax budget filter
    filteredPlaces = places.filter(place => {
      // Relax budget filter - accept adjacent price levels
      if (filters.budget && !this.isBudgetAcceptableRelaxed(place, filters.budget)) {
        return false;
      }
      
      // Keep relaxed mood filter
      if (!this.isMoodAcceptableRelaxed(place.mood_score || 50, filters.mood)) {
        return false;
      }
      
      return true;
    });
    
    console.log(`🔄 Step 2 - Relaxed budget: ${filteredPlaces.length} places`);
    if (filteredPlaces.length >= 4) {
      return filteredPlaces;
    }
    
    // Step 3: Accept all places with basic quality threshold
    filteredPlaces = places.filter(place => {
      // Only filter out places with very poor ratings
      if (place.rating && place.rating < 2.0) {
        return false;
      }
      
      return true;
    });
    
    console.log(`🔄 Step 3 - Basic quality: ${filteredPlaces.length} places`);
    return filteredPlaces;
  }

  /**
   * Check if mood is within acceptable range (strict)
   */
  private isMoodAcceptable(placeMood: number, userMood: number): boolean {
    // Convert user mood (0-100) to category
    const userMoodCategory = this.getMoodCategory(userMood);
    const placeMoodCategory = this.getMoodCategory(placeMood);
    
    // Strict matching: exact category match or neutral
    if (userMoodCategory === placeMoodCategory) return true;
    if (userMoodCategory === 'neutral' || placeMoodCategory === 'neutral') return true;
    
    // For strict filtering, allow small range
    const moodDifference = Math.abs(placeMood - userMood);
    return moodDifference <= 20; // Within 20 points for strict
  }

  /**
   * Check if mood is within acceptable range (relaxed)
   */
  private isMoodAcceptableRelaxed(placeMood: number, userMood: number): boolean {
    // More lenient mood matching
    const moodDifference = Math.abs(placeMood - userMood);
    return moodDifference <= 40; // Within 40 points for relaxed
  }

  /**
   * Check if place matches budget filter (strict)
   */
  private isBudgetAcceptable(place: PlaceData, budget: 'P' | 'PP' | 'PPP'): boolean {
    // Use actual price_level from Google Places API if available
    if (place.price_level !== undefined && place.price_level !== null) {
      const budgetLevel = this.getPriceLevel(budget);
      return place.price_level <= budgetLevel;
    }
    
    // Fallback to estimation based on category
    const estimatedPriceLevel = this.estimatePriceLevel(place.category);
    const budgetLevel = this.getPriceLevel(budget);
    
    return estimatedPriceLevel <= budgetLevel;
  }

  /**
   * Check if place matches budget filter (relaxed)
   */
  private isBudgetAcceptableRelaxed(place: PlaceData, budget: 'P' | 'PP' | 'PPP'): boolean {
    // Use actual price_level from Google Places API if available
    if (place.price_level !== undefined && place.price_level !== null) {
      const budgetLevel = this.getPriceLevel(budget);
      // Allow one level higher than requested budget
      return place.price_level <= budgetLevel + 1;
    }
    
    // Fallback to estimation with relaxed matching
    const estimatedPriceLevel = this.estimatePriceLevel(place.category);
    const budgetLevel = this.getPriceLevel(budget);
    
    return estimatedPriceLevel <= budgetLevel + 1;
  }

  /**
   * Rank places by comprehensive scoring including user preferences
   */
  private rankPlaces(places: PlaceData[], filters?: DiscoveryFilters): PlaceData[] {
    return places.sort((a, b) => {
      // Calculate comprehensive scores
      const aScore = this.calculateComprehensiveScore(a, filters);
      const bScore = this.calculateComprehensiveScore(b, filters);
      
      return bScore - aScore;
    });
  }

  /**
   * Calculate comprehensive place score including user preferences
   */
  private calculateComprehensiveScore(place: PlaceData, filters?: DiscoveryFilters): number {
    let score = 0;
    
    // Base score from rating and review count (40% weight)
    const baseScore = this.calculatePlaceScore(place);
    score += baseScore * 0.4;
    
    // Mood alignment score (30% weight)
    if (filters && place.mood_score) {
      const moodAlignment = this.calculateMoodAlignment(place.mood_score, filters.mood);
      score += moodAlignment * 0.3;
    }
    
    // Social context alignment (15% weight)
    if (filters?.socialContext) {
      const socialAlignment = this.calculateSocialContextAlignment(place, filters.socialContext);
      score += socialAlignment * 0.15;
    }
    
    // Time of day alignment (10% weight)
    if (filters?.timeOfDay && place.opening_hours) {
      const timeAlignment = this.calculateTimeAlignment(place, filters.timeOfDay);
      score += timeAlignment * 0.1;
    }
    
    // Budget alignment bonus (5% weight)
    if (filters?.budget) {
      const budgetAlignment = this.calculateBudgetAlignment(place, filters.budget);
      score += budgetAlignment * 0.05;
    }
    
    return score;
  }

  /**
   * Calculate mood alignment score (0-100)
   */
  private calculateMoodAlignment(placeMood: number, userMood: number): number {
    const difference = Math.abs(placeMood - userMood);
    // Convert difference to alignment score (closer = higher score)
    return Math.max(0, 100 - (difference * 2));
  }

  /**
   * Calculate social context alignment score (0-100)
   */
  private calculateSocialContextAlignment(place: PlaceData, socialContext: string): number {
    // Get social context keywords for this place type
    const contextKeywords = this.getSocialContextKeywords(socialContext);
    
    // Check if place types match social context preferences
    const placeTypes = place.types || [];
    let alignmentScore = 50; // Base score
    
    // Boost score for matching types
    const matchingTypes = placeTypes.filter(type => 
      contextKeywords.some(keyword => type.includes(keyword))
    );
    
    alignmentScore += (matchingTypes.length * 10);
    
    // Check reviews for social context indicators
    if (place.reviews && place.reviews.length > 0) {
      const reviewText = place.reviews.slice(0, 5).map(r => r.text).join(' ').toLowerCase();
      const contextMatches = contextKeywords.filter(keyword => 
        reviewText.includes(keyword.toLowerCase())
      );
      
      alignmentScore += (contextMatches.length * 5);
    }
    
    return Math.min(100, alignmentScore);
  }

  /**
   * Get keywords associated with social context
   */
  private getSocialContextKeywords(socialContext: string): string[] {
    const keywordMapping: Record<string, string[]> = {
      'solo': ['quiet', 'peaceful', 'individual', 'solo', 'alone', 'study', 'reading', 'meditation'],
      'with-bae': ['romantic', 'intimate', 'couple', 'date', 'cozy', 'private', 'candlelit', 'wine'],
      'barkada': ['group', 'friends', 'party', 'loud', 'fun', 'sharing', 'social', 'gathering', 'celebration']
    };
    
    return keywordMapping[socialContext] || [];
  }

  /**
   * Calculate time alignment score (0-100)
   */
  private calculateTimeAlignment(place: PlaceData, timeOfDay: string): number {
    // This would ideally check actual opening hours
    // For now, return base score with some logic
    let score = 50; // Base score
    
    // If place has opening hours data, analyze it
    if (place.opening_hours) {
      // This would require parsing Google's opening hours format
      // For now, assume places are generally open during requested times
      score = 75;
    }
    
    // Boost score for places that are typically good for specific times
    const placeTypes = place.types || [];
    const timePreferences: Record<string, string[]> = {
      'morning': ['cafe', 'coffee_shop', 'bakery', 'breakfast_restaurant'],
      'afternoon': ['restaurant', 'museum', 'park', 'shopping_mall'],
      'night': ['bar', 'night_club', 'restaurant', 'movie_theater']
    };
    
    const preferredTypes = timePreferences[timeOfDay] || [];
    const matchingTypes = placeTypes.filter(type => 
      preferredTypes.some(preferred => type.includes(preferred))
    );
    
    score += (matchingTypes.length * 10);
    
    return Math.min(100, score);
  }

  /**
   * Calculate budget alignment score (0-100)
   */
  private calculateBudgetAlignment(place: PlaceData, budget: 'P' | 'PP' | 'PPP'): number {
    const budgetLevel = this.getPriceLevel(budget);
    const placeLevel = place.price_level || this.estimatePriceLevel(place.category);
    
    // Perfect match gets 100, adjacent levels get lower scores
    const difference = Math.abs(placeLevel - budgetLevel);
    
    if (difference === 0) return 100;
    if (difference === 1) return 70;
    if (difference === 2) return 40;
    return 20;
  }

  /**
   * Calculate weighted score for ranking
   */
  private calculatePlaceScore(place: PlaceData): number {
    const rating = place.rating || 0;
    const reviewCount = place.user_ratings_total || 0;
    
    // Weight rating by review count (logarithmic scale)
    const reviewWeight = Math.log10(reviewCount + 1) / 4; // Normalize to 0-1
    const weightedRating = rating * (0.7 + 0.3 * reviewWeight);
    
    // Add mood match bonus
    const moodBonus = place.mood_score ? 0.1 : 0;
    
    return weightedRating + moodBonus;
  }

  /**
   * Select places using ranked random selection
   */
  private selectPlaces(rankedPlaces: PlaceData[], count: number): PlaceData[] {
    const selected: PlaceData[] = [];
    const availablePlaces = [...rankedPlaces];
    
    while (selected.length < count && availablePlaces.length > 0) {
      // Use weighted random selection favoring higher-ranked places
      const index = this.weightedRandomIndex(availablePlaces.length);
      const place = availablePlaces[index];
      
      selected.push(place);
      availablePlaces.splice(index, 1);
    }
    
    return selected;
  }

  /**
   * Weighted random selection (favors lower indices)
   */
  private weightedRandomIndex(length: number): number {
    // Create weights that favor lower indices
    const weights = Array.from({ length }, (_, i) => Math.pow(2, length - i - 1));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }
    
    return length - 1; // Fallback
  }

  /**
   * Add advertised place to results
   */
  private addAdvertisedPlace(places: PlaceData[]): (PlaceData | AdvertisedPlace)[] {
    if (this.advertisedPlaces.length === 0) return places;
    
    // Select random advertised place
    const advertisedPlace = this.advertisedPlaces[
      Math.floor(Math.random() * this.advertisedPlaces.length)
    ];
    
    // Insert at random position
    const insertIndex = Math.floor(Math.random() * (places.length + 1));
    const result = [...places];
    result.splice(insertIndex, 0, advertisedPlace);
    
    return result;
  }

  /**
   * Check if pool needs refresh
   */
  private needsPoolRefresh(): boolean {
    const unusedCount = this.placePool.filter(p => !this.usedPlaceIds.has(p.place_id)).length;
    return unusedCount < this.PLACES_PER_RESULT;
  }

  /**
   * Convert distance percentage to meters
   */
  private getDistanceInMeters(percentage: number): number {
    // Find the appropriate distance mapping
    for (let i = DISTANCE_MAPPINGS.length - 1; i >= 0; i--) {
      if (percentage >= DISTANCE_MAPPINGS[i].percentage - 10) {
        return DISTANCE_MAPPINGS[i].meters;
      }
    }
    return DISTANCE_MAPPINGS[0].meters;
  }

  /**
   * Get mood category from score
   */
  private getMoodCategory(score: number): 'chill' | 'neutral' | 'hype' {
    if (score >= 70) return 'hype';
    if (score <= 30) return 'chill';
    return 'neutral';
  }

  /**
   * Get price level from budget
   */
  private getPriceLevel(budget: 'P' | 'PP' | 'PPP'): number {
    switch (budget) {
      case 'P': return 1;
      case 'PP': return 2;
      case 'PPP': return 3;
      default: return 2;
    }
  }

  /**
   * Estimate price level from category
   */
  private estimatePriceLevel(category: string): number {
    const highEndCategories = ['fine_dining_restaurant', 'spa', 'resort', 'casino'];
    const budgetCategories = ['fast_food_restaurant', 'food_truck', 'street_food'];
    
    if (highEndCategories.includes(category)) return 3;
    if (budgetCategories.includes(category)) return 1;
    return 2;
  }

  /**
   * Reset the discovery session
   */
  reset(): void {
    this.placePool = [];
    this.usedPlaceIds.clear();
    this.currentExpansionCount = 0;
    this.currentRadius = 0;
    console.log('🔄 Discovery session reset');
  }

  /**
   * Get current session statistics
   */
  getStatistics(): {
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

  /**
   * Answer specific filter questions using Places Aggregate API
   * e.g., "How many 5-star rated, inexpensive restaurants are within 5km?"
   */


  /**
   * Get comprehensive filter analysis for a location
   */


  /**
   * Transform Google Places API (New) response to our PlaceData format
   * Enhanced with high-quality image processing
   */
  private async transformGooglePlaceNew(place: any): Promise<Partial<PlaceData> & { 
    geometry?: any; 
    price_level?: number; 
    business_status?: string; 
    types?: string[]; 
    photos?: any[]; 
    opening_hours?: any; 
    website?: string; 
    formatted_phone_number?: string; 
    international_phone_number?: string; 
  }> {
    const coordinates = place.location ? {
      lat: place.location.latitude,
      lng: place.location.longitude
    } : undefined;

    // Generate enhanced images using the new system
    let enhancedImages;
    try {
      const { generateAuthenticPhotoUrls } = await import('./photo-url-generator');
      
      const placeInfo = {
        placeName: place.displayName?.text || place.displayName || 'Unknown Place',
        placeAddress: place.formattedAddress,
        placeTypes: place.types || ['establishment'],
        coordinates
      };

      const authenticPhotos = await generateAuthenticPhotoUrls(
        place.photos || [],
        placeInfo,
        800, // maxWidth
        600, // maxHeight
        4,   // minPhotos - ENSURE MINIMUM 4 IMAGES
        8    // maxPhotos
      );

      enhancedImages = {
        urls: authenticPhotos.map(photo => photo.url),
        metadata: {
          totalImages: authenticPhotos.length,
          authenticImages: authenticPhotos.filter(photo => photo.isAuthentic).length,
          averageConfidence: authenticPhotos.reduce((sum, photo) => sum + photo.confidence, 0) / authenticPhotos.length,
          sources: Array.from(new Set(authenticPhotos.map(photo => photo.source)))
        }
      };

      console.log(`📸 Enhanced ${authenticPhotos.length} images for ${placeInfo.placeName} with avg confidence ${enhancedImages.metadata.averageConfidence.toFixed(1)}`);
    } catch (error) {
      console.warn('Failed to generate enhanced images, using basic photos:', error);
      // Fallback to basic photo processing
      enhancedImages = {
        urls: place.photos?.slice(0, 4).map((photo: any) => 
          `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&maxHeightPx=600&key=${this.googleApiKey}`
        ) || [],
        metadata: {
          totalImages: place.photos?.length || 0,
          authenticImages: place.photos?.length || 0,
          averageConfidence: 85,
          sources: ['google_places']
        }
      };
    }

    return {
      place_id: place.id,
      name: place.displayName?.text || place.displayName,
      address: place.formattedAddress,
      category: place.types?.[0] || 'establishment',
      rating: place.rating || 0,
      user_ratings_total: place.userRatingCount || 0,
      reviews: [], // Will be populated by mood service if needed
      images: enhancedImages, // Enhanced image data with minimum 4 high-quality images
      // Fix location mapping for proper display
      vicinity: place.shortFormattedAddress || place.formattedAddress,
      formatted_address: place.formattedAddress,
      location: coordinates,
      types: place.types || [],
      price_level: place.priceLevel,
      website: place.websiteUri,
      description: place.editorialSummary?.text || `${place.displayName?.text || place.displayName} is a great place to visit.`,
      // Additional fields for compatibility with existing code
      geometry: {
        location: coordinates
      },
      business_status: place.businessStatus,
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.name,
        width: photo.widthPx,
        height: photo.heightPx
      })),
      opening_hours: place.regularOpeningHours ? {
        open_now: place.regularOpeningHours.openNow,
        weekday_text: place.regularOpeningHours.weekdayDescriptions
      } : undefined,
      formatted_phone_number: place.nationalPhoneNumber,
      international_phone_number: place.internationalPhoneNumber
    };
  }
}