/**
 * Enhanced Place Scoring Service
 * 
 * Combines data from Blogger API and Places Aggregate API to provide
 * more contextual and tailored place scoring and recommendations.
 */

import { BloggerContextService, PlaceContextData } from './blogger-context-service';
import { PlacesAggregateService, PlaceRecommendationData, AreaAnalysis } from './places-aggregate-service';
import { PlaceData } from './place-mood-service';

export interface EnhancedPlaceScore {
  placeId: string;
  placeName: string;
  baseScore: number;
  contextScore: number;
  aggregateScore: number;
  finalScore: number;
  insights: {
    contextualMatch: boolean;
    areaCharacteristics: string[];
    competitionLevel: 'low' | 'medium' | 'high';
    uniquenessFactors: string[];
    recommendationReasons: string[];
  };
  sources: {
    bloggerContext?: PlaceContextData;
    aggregateData?: PlaceRecommendationData;
    areaAnalysis?: AreaAnalysis;
  };
}

export interface ScoringWeights {
  baseScore: number;      // Original place score weight
  contextScore: number;   // Blogger context weight
  aggregateScore: number; // Places aggregate weight
  userPreferences: number; // User filter matching weight
}

export class EnhancedPlaceScoringService {
  private bloggerService: BloggerContextService;
  private aggregateService: PlacesAggregateService;
  
  // Default scoring weights
  private defaultWeights: ScoringWeights = {
    baseScore: 0.4,      // 40% - original place data
    contextScore: 0.25,  // 25% - contextual insights
    aggregateScore: 0.25, // 25% - area analysis
    userPreferences: 0.1  // 10% - user preference bonus
  };

  constructor(bloggerApiKey: string, placesApiKey: string) {
    this.bloggerService = new BloggerContextService(bloggerApiKey);
    this.aggregateService = new PlacesAggregateService(placesApiKey);
  }

  /**
   * Generate enhanced scores for a list of places
   */
  async enhancePlaceScores(
    places: PlaceData[],
    userFilters: any,
    weights: Partial<ScoringWeights> = {}
  ): Promise<EnhancedPlaceScore[]> {
    console.log('🎯 Enhancing place scores with contextual data for', places.length, 'places');

    const scoringWeights = { ...this.defaultWeights, ...weights };
    const enhancedScores: EnhancedPlaceScore[] = [];

    for (const place of places) {
      try {
        const enhancedScore = await this.scoreSinglePlace(place, userFilters, scoringWeights);
        if (enhancedScore) {
          enhancedScores.push(enhancedScore);
        }
      } catch (error) {
        console.error(`Error scoring place ${place.name}:`, error);
        // Fallback to basic scoring
        enhancedScores.push(this.createFallbackScore(place));
      }
    }

    // Sort by final score
    return enhancedScores.sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Score a single place with enhanced data and robust error handling
   */
  private async scoreSinglePlace(
    place: PlaceData,
    userFilters: any,
    weights: ScoringWeights
  ): Promise<EnhancedPlaceScore | null> {
    console.log(`🎯 Scoring place: ${place.name}`);
    
    // Get base score (existing rating-based score)
    const baseScore = this.calculateBaseScore(place);
    console.log(`📊 Base score for ${place.name}: ${baseScore}`);

    // Get contextual data from Blogger API with error handling
    let bloggerContext = null;
    try {
      bloggerContext = await this.bloggerService.getPlaceContext(
        place.name,
        place.address
      );
      console.log(`📚 Blogger context for ${place.name}: ${bloggerContext ? 'Available' : 'Not available'}`);
    } catch (error) {
      console.warn(`⚠️ Blogger context failed for ${place.name}:`, error);
    }

    // Get aggregate data from Places Aggregate API with error handling
    let aggregateData = null;
    try {
      aggregateData = await this.getAggregateData(place, userFilters);
      console.log(`🏢 Aggregate data for ${place.name}: ${aggregateData ? 'Available' : 'Not available'}`);
    } catch (error) {
      console.warn(`⚠️ Aggregate data failed for ${place.name}:`, error);
    }

    // Calculate component scores
    const contextScore = this.calculateContextScore(bloggerContext, userFilters);
    const aggregateScore = this.calculateAggregateScore(aggregateData);
    const userPreferenceBonus = this.calculateUserPreferenceBonus(
      bloggerContext,
      aggregateData,
      userFilters
    );

    console.log(`📈 Scores for ${place.name}: base=${baseScore}, context=${contextScore}, aggregate=${aggregateScore}, bonus=${userPreferenceBonus}`);

    // Calculate weighted final score
    const finalScore = Math.round(
      (baseScore * weights.baseScore) +
      (contextScore * weights.contextScore) +
      (aggregateScore * weights.aggregateScore) +
      (userPreferenceBonus * weights.userPreferences)
    );

    // Generate insights
    const insights = this.generateInsights(
      place,
      bloggerContext,
      aggregateData,
      userFilters
    );

    const enhancedScore = {
      placeId: place.place_id,
      placeName: place.name,
      baseScore,
      contextScore,
      aggregateScore,
      finalScore: Math.min(finalScore, 100),
      insights,
      sources: {
        bloggerContext: bloggerContext || undefined,
        aggregateData: aggregateData || undefined
      }
    };

    console.log(`✅ Final enhanced score for ${place.name}: ${enhancedScore.finalScore}`);
    return enhancedScore;
  }

  /**
   * Calculate base score from existing place data
   */
  private calculateBaseScore(place: PlaceData): number {
    let score = 0;

    // Rating component (0-50 points)
    if (place.rating && place.rating > 0) {
      score += (place.rating / 5) * 50;
    }

    // Review count component (0-30 points)
    if (place.user_ratings_total) {
      const reviewScore = Math.min(place.user_ratings_total / 100, 1) * 30;
      score += reviewScore;
    }

    // Category relevance (0-20 points)
    score += 20; // Base relevance since place was already filtered

    return Math.round(score);
  }

  /**
   * Get aggregate data for a place with enhanced error handling
   */
  private async getAggregateData(
    place: PlaceData,
    userFilters: any
  ): Promise<PlaceRecommendationData | null> {
    try {
      // Extract coordinates from place data
      // This assumes place has geometry.location or similar
      const lat = (place as any).geometry?.location?.lat;
      const lng = (place as any).geometry?.location?.lng;

      if (!lat || !lng) {
        console.warn(`No coordinates found for place ${place.name}, skipping aggregate analysis`);
        return null;
      }

      console.log(`🎯 Getting aggregate data for ${place.name} at (${lat}, ${lng})`);
      
      const aggregateData = await this.aggregateService.generatePlaceRecommendations(
        place.place_id,
        place.name,
        lat,
        lng,
        userFilters
      );

      if (aggregateData) {
        console.log(`✅ Aggregate data retrieved for ${place.name}`);
      } else {
        console.log(`⚠️ No aggregate data available for ${place.name}`);
      }

      return aggregateData;
    } catch (error) {
      console.error(`❌ Error getting aggregate data for ${place.name}:`, error);
      return null;
    }
  }

  /**
   * Calculate context score from Blogger data
   */
  private calculateContextScore(
    context: PlaceContextData | null,
    userFilters: any
  ): number {
    if (!context) return 0;

    let score = 0;

    // Base score from relevance
    score += context.relevanceScore * 0.5;

    // Filter matching bonus
    if (this.bloggerService.matchesUserFilters(context, userFilters)) {
      score += 25;
    }

    // Rich insights bonus
    const totalInsights = Object.values(context.contextualInsights).flat().length;
    score += Math.min(totalInsights * 2, 15);

    return Math.round(Math.min(score, 100));
  }

  /**
   * Calculate aggregate score from Places Aggregate data
   */
  private calculateAggregateScore(data: PlaceRecommendationData | null): number {
    if (!data) return 0;

    let score = 0;

    // Area score component
    score += data.areaScore * 0.6;

    // Uniqueness bonus
    score += data.uniquenessScore * 0.3;

    // Amenity diversity bonus
    score += Math.min(data.nearbyAmenities.length * 2, 10);

    return Math.round(Math.min(score, 100));
  }

  /**
   * Calculate user preference bonus
   */
  private calculateUserPreferenceBonus(
    context: PlaceContextData | null,
    aggregate: PlaceRecommendationData | null,
    userFilters: any
  ): number {
    let bonus = 0;

    // Context matching bonus
    if (context && this.bloggerService.matchesUserFilters(context, userFilters)) {
      bonus += 50;
    }

    // Competition preference bonus
    if (aggregate) {
      const preferredCompetition = this.getPreferredCompetitionLevel(userFilters);
      if (aggregate.competitionLevel === preferredCompetition) {
        bonus += 30;
      }
    }

    return Math.round(Math.min(bonus, 100));
  }

  /**
   * Get preferred competition level based on user filters
   */
  private getPreferredCompetitionLevel(userFilters: any): 'low' | 'medium' | 'high' {
    // Adventurous users might prefer unique (low competition) places
    if (userFilters.mood >= 8) return 'low';
    
    // Social users might prefer popular (high competition) areas
    if (userFilters.socialContext === 'friends' || userFilters.socialContext === 'family') {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Generate insights for the enhanced score
   */
  private generateInsights(
    place: PlaceData,
    context: PlaceContextData | null,
    aggregate: PlaceRecommendationData | null,
    userFilters: any
  ): EnhancedPlaceScore['insights'] {
    const insights: EnhancedPlaceScore['insights'] = {
      contextualMatch: false,
      areaCharacteristics: [],
      competitionLevel: 'medium',
      uniquenessFactors: [],
      recommendationReasons: []
    };

    // Contextual matching
    if (context) {
      insights.contextualMatch = this.bloggerService.matchesUserFilters(context, userFilters);
      
      if (context.contextualInsights.atmosphere.length > 0) {
        insights.areaCharacteristics.push(...context.contextualInsights.atmosphere);
      }
    }

    // Aggregate insights
    if (aggregate) {
      insights.competitionLevel = aggregate.competitionLevel;
      insights.areaCharacteristics.push(...aggregate.nearbyAmenities);

      if (aggregate.uniquenessScore > 70) {
        insights.uniquenessFactors.push('Unique location with low competition');
      }

      if (aggregate.areaScore > 80) {
        insights.uniquenessFactors.push('Excellent area characteristics');
      }
    }

    // Generate recommendation reasons
    insights.recommendationReasons = this.generateRecommendationReasons(
      place,
      context,
      aggregate,
      userFilters
    );

    return insights;
  }

  /**
   * Generate recommendation reasons
   */
  private generateRecommendationReasons(
    place: PlaceData,
    context: PlaceContextData | null,
    aggregate: PlaceRecommendationData | null,
    userFilters: any
  ): string[] {
    const reasons: string[] = [];

    // Rating-based reasons
    if (place.rating >= 4.5) {
      reasons.push('Highly rated by customers');
    }

    // Context-based reasons
    if (context && context.relevanceScore > 70) {
      reasons.push('Great reviews and blog mentions');
    }

    if (context && context.contextualInsights.mood.length > 0) {
      const mood = context.contextualInsights.mood[0];
      reasons.push(`Perfect for ${mood} experiences`);
    }

    // Aggregate-based reasons
    if (aggregate) {
      if (aggregate.competitionLevel === 'low') {
        reasons.push('Hidden gem with less crowds');
      }

      if (aggregate.nearbyAmenities.length >= 3) {
        reasons.push('Great area with lots to do nearby');
      }

      if (aggregate.uniquenessScore > 80) {
        reasons.push('Unique location worth discovering');
      }
    }

    // Filter-specific reasons
    if (userFilters.socialContext === 'couple' && context?.contextualInsights.mood.includes('romantic')) {
      reasons.push('Perfect for romantic dates');
    }

    if (userFilters.timeOfDay === 'evening' && context?.contextualInsights.timeOfDay.includes('evening')) {
      reasons.push('Great evening atmosphere');
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * Create fallback score when enhanced scoring fails
   */
  private createFallbackScore(place: PlaceData): EnhancedPlaceScore {
    const baseScore = this.calculateBaseScore(place);
    
    return {
      placeId: place.place_id,
      placeName: place.name,
      baseScore,
      contextScore: 0,
      aggregateScore: 0,
      finalScore: baseScore,
      insights: {
        contextualMatch: false,
        areaCharacteristics: [],
        competitionLevel: 'medium',
        uniquenessFactors: [],
        recommendationReasons: ['Based on ratings and reviews']
      },
      sources: {}
    };
  }

  /**
   * Get area analysis for a location
   */
  async getAreaAnalysis(lat: number, lng: number, radius: number = 1000): Promise<AreaAnalysis | null> {
    return await this.aggregateService.analyzeArea(lat, lng, radius);
  }

  /**
   * Find optimal locations for business analysis
   */
  async findOptimalLocations(
    centerLat: number,
    centerLng: number,
    searchRadius: number,
    category: string
  ): Promise<Array<{lat: number, lng: number, score: number}>> {
    return await this.aggregateService.findOptimalLocations(
      centerLat,
      centerLng,
      searchRadius,
      category
    );
  }
}