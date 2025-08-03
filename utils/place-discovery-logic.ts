import { PlaceMoodService, PlaceData } from './place-mood-service';
import { CATEGORY_MOOD_MAPPING } from './mood-config';
import { EnhancedPlaceScoringService, EnhancedPlaceScore } from './enhanced-place-scoring';
import { FilterEnhancementService, LocationFilterAnalysis } from './filter-enhancement-service';
import { generatePhotoUrls, getOptimizedPhotoUrls } from './photo-url-generator';

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
  enhancedScores?: EnhancedPlaceScore[];
  contextualInsights?: {
    areaAnalysis?: any;
    bloggerInsights?: any;
    aggregateData?: any;
  };
  filterAnalysis?: LocationFilterAnalysis;
  filterRecommendations?: {
    shouldExpandRadius: boolean;
    betterFilters: string[];
    alternativeCategories: string[];
    estimatedResults: number;
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
  private enhancedScoringService?: EnhancedPlaceScoringService;
  private filterEnhancementService?: FilterEnhancementService;
  
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
    advertisedPlaces: AdvertisedPlace[] = [],
    bloggerApiKey?: string
  ) {
    this.moodService = moodService;
    this.googleApiKey = googleApiKey;
    this.advertisedPlaces = advertisedPlaces;
    
    // Initialize enhanced scoring if Blogger API key is provided
    if (bloggerApiKey) {
      this.enhancedScoringService = new EnhancedPlaceScoringService(
        bloggerApiKey,
        googleApiKey
      );
      console.log('🎯 Enhanced place scoring enabled with Blogger API and Places Aggregate API');
    }
    
    // Initialize filter enhancement service (always available with Places API)
    this.filterEnhancementService = new FilterEnhancementService(googleApiKey);
    console.log('🔍 Filter enhancement enabled with Places Aggregate API');
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
      let filterAnalysis: LocationFilterAnalysis | undefined;
      try {
        if (this.filterEnhancementService) {
          console.log('🔍 Analyzing filter effectiveness for current location');
          filterAnalysis = await this.filterEnhancementService.analyzeFilterEffectiveness(
            filters.userLocation.lat,
            filters.userLocation.lng,
            this.currentRadius,
            filters
          );
        }
      } catch (error) {
        console.warn('Filter analysis failed, continuing with basic discovery:', error);
      }

      // Apply filters and rank places
      const filteredPlaces = this.applyFilters(this.placePool, filters);
      let rankedPlaces = this.rankPlaces(filteredPlaces);
      let enhancedScores: EnhancedPlaceScore[] | undefined;
      
      // Use enhanced scoring if available
      if (this.enhancedScoringService && filteredPlaces.length > 0) {
        console.log('🎯 Applying enhanced scoring with contextual data');
        try {
          enhancedScores = await this.enhancedScoringService.enhancePlaceScores(
            filteredPlaces,
            filters
          );
          
          // Re-rank based on enhanced scores
          rankedPlaces = enhancedScores
            .map(score => filteredPlaces.find(p => p.place_id === score.placeId))
            .filter(Boolean) as PlaceData[];
            
          console.log('✨ Enhanced scoring applied to', enhancedScores.length, 'places');
        } catch (error) {
          console.error('Error applying enhanced scoring, falling back to basic ranking:', error);
        }
      }
      
      // Select places for this result
      const selectedPlaces = this.selectPlaces(rankedPlaces, this.PLACES_PER_RESULT);
      
      // Add advertised place
      const finalPlaces = this.addAdvertisedPlace(selectedPlaces);
      
      // Mark places as used
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
        },
        enhancedScores: enhancedScores?.filter(score => 
          selectedPlaces.some(p => p.place_id === score.placeId)
        ),
        contextualInsights: enhancedScores ? {
          areaAnalysis: 'Enhanced area analysis applied',
          bloggerInsights: 'Contextual insights from blog content',
          aggregateData: 'Place density and competition analysis'
        } : undefined,
        filterAnalysis,
        filterRecommendations: filterAnalysis ? {
          shouldExpandRadius: filterAnalysis.recommendations.shouldExpandRadius,
          betterFilters: filterAnalysis.recommendations.bestFilters,
          alternativeCategories: filterAnalysis.recommendations.alternativeCategories,
          estimatedResults: filterAnalysis.insights.totalPlaces
        } : undefined
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
   * Search Google Places API (New) with specific filters
   */
  private async searchGooglePlaces(
    filters: DiscoveryFilters, 
    radius: number
  ): Promise<Partial<PlaceData>[]> {
    const types = CATEGORY_TO_GOOGLE_TYPES[filters.category] || [];
    
    console.log('🌍 Searching places near location (New Places API):', {
      coordinates: filters.userLocation,
      radius,
      category: filters.category,
      types
    });
    
    // Build request body for new Places API
    const requestBody: any = {
      includedTypes: types.slice(0, 1), // New API uses includedTypes array, limit to 1 primary type
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

    // Note: Price level filtering is not directly supported in the new Places API
    // The filtering will be done after receiving the results in the applyFilters method

    try {
      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.businessStatus,places.types,places.photos,places.regularOpeningHours,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API (New) error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.places) {
        console.warn('Google Places API (New): No places found');
        return [];
      }

      console.log('✅ Found places with New API:', data.places.length);
      
      // Transform places with enhanced image processing (async)
      const transformedPlaces = await Promise.all(
        data.places.map((place: any) => this.transformGooglePlaceNew(place))
      );
      
      return transformedPlaces;
      
    } catch (error) {
      console.error('❌ Google Places search error (New API):', error);
      return [];
    }
  }

  /**
   * Enhance places with mood data
   */
  private async enhancePlacesWithMood(places: Partial<PlaceData>[]): Promise<PlaceData[]> {
    const enhancedPlaces: PlaceData[] = [];
    
    for (const place of places) {
      if (!place.place_id) continue;
      
      try {
        const enhanced = await this.moodService.enhancePlaceWithMood(place.place_id);
        enhancedPlaces.push(enhanced);
      } catch (error) {
        console.error(`❌ Failed to enhance place ${place.place_id}:`, error);
        // Continue with basic data if enhancement fails
        if (place.name && place.place_id) {
          enhancedPlaces.push({
            ...place as PlaceData,
            mood_score: 50, // Default neutral score
            final_mood: 'Balanced'
          });
        }
      }
    }
    
    return enhancedPlaces;
  }

  /**
   * Apply filters based on strict/flexible priority
   */
  private applyFilters(places: PlaceData[], filters: DiscoveryFilters): PlaceData[] {
    return places.filter(place => {
      // STRICT: Category (already filtered by Google API, but double-check)
      // Category is implicitly matched through Google Places types
      
      // STRICT: Mood (must be within acceptable range)
      if (!this.isMoodAcceptable(place.mood_score || 50, filters.mood)) {
        return false;
      }
      
      // STRICT: Budget
      if (filters.budget && !this.isBudgetAcceptable(place, filters.budget)) {
        return false;
      }
      
      // FLEXIBLE: Social context (prefer but don't exclude)
      // Applied in ranking, not filtering
      
      // FLEXIBLE: Time of day (prefer open places)
      // Already handled by Google API opennow parameter
      
      return true;
    });
  }

  /**
   * Check if mood is within acceptable range
   */
  private isMoodAcceptable(placeMood: number, userMood: number): boolean {
    // Convert user mood (0-100) to category
    const userMoodCategory = this.getMoodCategory(userMood);
    const placeMoodCategory = this.getMoodCategory(placeMood);
    
    // Allow same category or adjacent categories
    if (userMoodCategory === placeMoodCategory) return true;
    
    // Allow some flexibility
    if (userMoodCategory === 'neutral') return true; // Neutral accepts all
    if (placeMoodCategory === 'neutral') return true; // Neutral places work for all
    
    // For extreme moods, allow some range
    const moodDifference = Math.abs(placeMood - userMood);
    return moodDifference <= 30; // Within 30 points
  }

  /**
   * Check if place matches budget filter
   */
  private isBudgetAcceptable(place: PlaceData, budget: 'P' | 'PP' | 'PPP'): boolean {
    // This would typically use Google's price_level field
    // For now, we'll estimate based on category
    const estimatedPriceLevel = this.estimatePriceLevel(place.category);
    const budgetLevel = this.getPriceLevel(budget);
    
    return estimatedPriceLevel <= budgetLevel;
  }

  /**
   * Rank places by rating and other factors
   */
  private rankPlaces(places: PlaceData[]): PlaceData[] {
    return places.sort((a, b) => {
      // Primary sort by rating (weighted by review count)
      const aScore = this.calculatePlaceScore(a);
      const bScore = this.calculatePlaceScore(b);
      
      return bScore - aScore;
    });
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
  async answerFilterQuestion(
    lat: number,
    lng: number,
    radius: number,
    question: {
      category?: string[];
      minRating?: number;
      priceLevel?: string;
      openNow?: boolean;
    }
  ): Promise<{
    count: number;
    placeIds?: string[];
    interpretation: string;
    recommendation: string;
  } | null> {
    if (!this.filterEnhancementService) {
      console.warn('Filter enhancement service not available');
      return null;
    }

    try {
      return await this.filterEnhancementService.answerFilterQuestion(
        lat,
        lng,
        radius,
        question
      );
    } catch (error) {
      console.error('Error answering filter question:', error);
      return null;
    }
  }

  /**
   * Get comprehensive filter analysis for a location
   */
  async getFilterAnalysis(
    lat: number,
    lng: number,
    radius: number,
    userFilters: any
  ): Promise<LocationFilterAnalysis | null> {
    if (!this.filterEnhancementService) {
      console.warn('Filter enhancement service not available');
      return null;
    }

    try {
      return await this.filterEnhancementService.analyzeFilterEffectiveness(
        lat,
        lng,
        radius,
        userFilters
      );
    } catch (error) {
      console.error('Error getting filter analysis:', error);
      return null;
    }
  }

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