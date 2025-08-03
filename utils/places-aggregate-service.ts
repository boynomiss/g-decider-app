/**
 * Places Aggregate API Service
 * 
 * Uses Google Places Aggregate API to analyze place density, distribution,
 * and provide enhanced data sources for tailored suggestions.
 */

export interface AggregateInsight {
  count: number;
  placeIds?: string[];
}

export interface AreaAnalysis {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  insights: {
    restaurants: AggregateInsight;
    bars: AggregateInsight;
    cafes: AggregateInsight;
    entertainment: AggregateInsight;
    shopping: AggregateInsight;
    attractions: AggregateInsight;
  };
  competitionScore: number;
  diversityScore: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface PlaceRecommendationData {
  placeId: string;
  placeName: string;
  areaScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  nearbyAmenities: string[];
  uniquenessScore: number;
}

export class PlacesAggregateService {
  private apiKey: string;
  private baseUrl = 'https://areainsights.googleapis.com/v1:computeInsights';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyze area around a location to understand place density and characteristics
   */
  async analyzeArea(lat: number, lng: number, radius: number = 1000): Promise<AreaAnalysis | null> {
    try {
      console.log('🔍 Analyzing area with Places Aggregate API:', { lat, lng, radius });

      // Get insights for different place types with fallback handling
      const insightPromises = [
        this.getPlaceInsights(lat, lng, radius, ['restaurant']),
        this.getPlaceInsights(lat, lng, radius, ['bar', 'night_club']),
        this.getPlaceInsights(lat, lng, radius, ['cafe', 'bakery']),
        this.getPlaceInsights(lat, lng, radius, ['movie_theater', 'amusement_park', 'bowling_alley']),
        this.getPlaceInsights(lat, lng, radius, ['shopping_mall', 'store', 'department_store']),
        this.getPlaceInsights(lat, lng, radius, ['tourist_attraction', 'museum', 'park'])
      ];

      const results = await Promise.allSettled(insightPromises);
      
      // Extract results with fallback values
      const [
        restaurants,
        bars,
        cafes,
        entertainment,
        shopping,
        attractions
      ] = results.map(result => 
        result.status === 'fulfilled' ? result.value : { count: 0 }
      );

      // Check if all API calls failed
      const allFailed = results.every(result => result.status === 'rejected');
      if (allFailed) {
        console.warn('All Places Aggregate API calls failed, using estimated values');
        return this.generateFallbackAnalysis(lat, lng, radius);
      }

      // Calculate area scores
      const competitionScore = this.calculateCompetitionScore({
        restaurants, bars, cafes, entertainment, shopping, attractions
      });

      const diversityScore = this.calculateDiversityScore({
        restaurants, bars, cafes, entertainment, shopping, attractions
      });

      const activityLevel = this.determineActivityLevel({
        restaurants, bars, cafes, entertainment, shopping, attractions
      });

      console.log('✅ Places Aggregate API analysis complete:', {
        totalPlaces: restaurants.count + bars.count + cafes.count + entertainment.count + shopping.count + attractions.count,
        competitionScore,
        diversityScore,
        activityLevel
      });

      return {
        location: { lat, lng },
        radius,
        insights: {
          restaurants,
          bars,
          cafes,
          entertainment,
          shopping,
          attractions
        },
        competitionScore,
        diversityScore,
        activityLevel
      };

    } catch (error) {
      console.error('Error analyzing area with Places Aggregate API:', error);
      return this.generateFallbackAnalysis(lat, lng, radius);
    }
  }

  /**
   * Get place insights for specific types using Places Aggregate API
   */
  private async getPlaceInsights(
    lat: number, 
    lng: number, 
    radius: number, 
    types: string[]
  ): Promise<AggregateInsight> {
    try {
      const requestBody = {
        insights: ['INSIGHT_COUNT'],
        filter: {
          locationFilter: {
            circle: {
              latLng: {
                latitude: lat,
                longitude: lng
              },
              radius: radius
            }
          },
          typeFilter: {
            includedPrimaryTypes: types
          }
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Places Aggregate API error: ${response.status} - ${errorText}`);
        throw new Error(`Places Aggregate API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        count: parseInt(data.count) || 0,
        placeIds: data.placeIds || []
      };

    } catch (error) {
      console.error('Error getting place insights:', error);
      return { count: 0 };
    }
  }

  /**
   * Get detailed place insights that return place IDs (when count <= 100)
   */
  async getDetailedPlaceInsights(
    lat: number, 
    lng: number, 
    radius: number, 
    types: string[]
  ): Promise<AggregateInsight> {
    try {
      const requestBody = {
        insights: ['INSIGHT_PLACES'],
        filter: {
          locationFilter: {
            circle: {
              latLng: {
                latitude: lat,
                longitude: lng
              },
              radius: radius
            }
          },
          typeFilter: {
            includedPrimaryTypes: types
          }
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Places Aggregate API error: ${response.status} - ${errorText}`);
        throw new Error(`Places Aggregate API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the response structure for INSIGHT_PLACES
      const placeInsights = data.placeInsights || [];
      const placeIds = placeInsights.map((insight: any) => insight.place?.replace('places/', '') || '');
      
      return {
        count: placeIds.length,
        placeIds: placeIds.filter(Boolean)
      };

    } catch (error) {
      console.error('Error getting detailed place insights:', error);
      return { count: 0 };
    }
  }

  /**
   * Calculate competition score based on place density
   */
  private calculateCompetitionScore(insights: Record<string, AggregateInsight>): number {
    const totalPlaces = Object.values(insights).reduce((sum, insight) => sum + insight.count, 0);
    
    // Normalize score (0-100)
    // High density = high competition
    if (totalPlaces === 0) return 0;
    if (totalPlaces < 10) return 25;
    if (totalPlaces < 25) return 50;
    if (totalPlaces < 50) return 75;
    return 100;
  }

  /**
   * Calculate diversity score based on variety of place types
   */
  private calculateDiversityScore(insights: Record<string, AggregateInsight>): number {
    const typesWithPlaces = Object.values(insights).filter(insight => insight.count > 0).length;
    const totalTypes = Object.keys(insights).length;
    
    return Math.round((typesWithPlaces / totalTypes) * 100);
  }

  /**
   * Determine activity level based on total place count
   */
  private determineActivityLevel(insights: Record<string, AggregateInsight>): 'low' | 'medium' | 'high' {
    const totalPlaces = Object.values(insights).reduce((sum, insight) => sum + insight.count, 0);
    
    if (totalPlaces < 15) return 'low';
    if (totalPlaces < 40) return 'medium';
    return 'high';
  }

  /**
   * Generate place recommendations based on area analysis
   */
  async generatePlaceRecommendations(
    placeId: string,
    placeName: string,
    lat: number,
    lng: number,
    userFilters: any
  ): Promise<PlaceRecommendationData | null> {
    try {
      // Analyze the area around this place
      const areaAnalysis = await this.analyzeArea(lat, lng, 500);
      
      if (!areaAnalysis) {
        return null;
      }

      // Calculate area score based on user preferences
      const areaScore = this.calculateAreaScore(areaAnalysis, userFilters);
      
      // Determine competition level for this specific place type
      const competitionLevel = this.getCompetitionLevel(areaAnalysis, userFilters.category);
      
      // Identify nearby amenities
      const nearbyAmenities = this.identifyNearbyAmenities(areaAnalysis);
      
      // Calculate uniqueness score
      const uniquenessScore = this.calculateUniquenessScore(areaAnalysis, userFilters.category);

      return {
        placeId,
        placeName,
        areaScore,
        competitionLevel,
        nearbyAmenities,
        uniquenessScore
      };

    } catch (error) {
      console.error('Error generating place recommendations:', error);
      return null;
    }
  }

  /**
   * Calculate area score based on user preferences
   */
  private calculateAreaScore(areaAnalysis: AreaAnalysis, userFilters: any): number {
    let score = 0;

    // Base score from diversity (more variety = better)
    score += areaAnalysis.diversityScore * 0.3;

    // Activity level preference
    const activityPreference = this.getActivityPreference(userFilters);
    if (areaAnalysis.activityLevel === activityPreference) {
      score += 30;
    } else if (
      (areaAnalysis.activityLevel === 'medium') || 
      (activityPreference === 'medium')
    ) {
      score += 15;
    }

    // Category-specific scoring
    score += this.getCategoryScore(areaAnalysis, userFilters.category);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Get activity preference based on user filters
   */
  private getActivityPreference(userFilters: any): 'low' | 'medium' | 'high' {
    // Map mood to activity preference
    if (userFilters.mood <= 3) return 'low';    // Relaxed/quiet
    if (userFilters.mood <= 7) return 'medium'; // Moderate activity
    return 'high';                              // High energy
  }

  /**
   * Get category-specific score
   */
  private getCategoryScore(areaAnalysis: AreaAnalysis, category: string): number {
    const categoryMap: Record<string, keyof AreaAnalysis['insights']> = {
      'food': 'restaurants',
      'restaurant': 'restaurants',
      'bar': 'bars',
      'cafe': 'cafes',
      'entertainment': 'entertainment',
      'shopping': 'shopping',
      'attraction': 'attractions'
    };

    const insightKey = categoryMap[category];
    if (!insightKey) return 0;

    const count = areaAnalysis.insights[insightKey].count;
    
    // Optimal range scoring (not too few, not too many)
    if (count === 0) return 0;
    if (count < 3) return 10;
    if (count < 8) return 25;
    if (count < 15) return 20;
    return 15; // Too much competition
  }

  /**
   * Get competition level for specific category
   */
  private getCompetitionLevel(areaAnalysis: AreaAnalysis, category: string): 'low' | 'medium' | 'high' {
    const categoryMap: Record<string, keyof AreaAnalysis['insights']> = {
      'food': 'restaurants',
      'restaurant': 'restaurants',
      'bar': 'bars',
      'cafe': 'cafes',
      'entertainment': 'entertainment',
      'shopping': 'shopping',
      'attraction': 'attractions'
    };

    const insightKey = categoryMap[category];
    if (!insightKey) return 'medium';

    const count = areaAnalysis.insights[insightKey].count;
    
    if (count < 5) return 'low';
    if (count < 15) return 'medium';
    return 'high';
  }

  /**
   * Identify nearby amenities
   */
  private identifyNearbyAmenities(areaAnalysis: AreaAnalysis): string[] {
    const amenities: string[] = [];
    
    if (areaAnalysis.insights.restaurants.count > 0) amenities.push('Restaurants');
    if (areaAnalysis.insights.bars.count > 0) amenities.push('Bars');
    if (areaAnalysis.insights.cafes.count > 0) amenities.push('Cafes');
    if (areaAnalysis.insights.entertainment.count > 0) amenities.push('Entertainment');
    if (areaAnalysis.insights.shopping.count > 0) amenities.push('Shopping');
    if (areaAnalysis.insights.attractions.count > 0) amenities.push('Attractions');
    
    return amenities;
  }

  /**
   * Calculate uniqueness score (lower competition = more unique)
   */
  private calculateUniquenessScore(areaAnalysis: AreaAnalysis, category: string): number {
    const competitionLevel = this.getCompetitionLevel(areaAnalysis, category);
    
    switch (competitionLevel) {
      case 'low': return 90;
      case 'medium': return 60;
      case 'high': return 30;
      default: return 50;
    }
  }

  /**
   * Find optimal locations for new places based on gap analysis
   */
  async findOptimalLocations(
    centerLat: number,
    centerLng: number,
    searchRadius: number,
    category: string
  ): Promise<Array<{lat: number, lng: number, score: number}>> {
    try {
      // Create a grid of points to analyze
      const gridPoints = this.generateGridPoints(centerLat, centerLng, searchRadius, 5);
      const locationScores: Array<{lat: number, lng: number, score: number}> = [];

      for (const point of gridPoints) {
        const areaAnalysis = await this.analyzeArea(point.lat, point.lng, 300);
        
        if (areaAnalysis) {
          // Calculate opportunity score (low competition + high activity)
          const competitionLevel = this.getCompetitionLevel(areaAnalysis, category);
          const competitionScore = competitionLevel === 'low' ? 40 : 
                                 competitionLevel === 'medium' ? 25 : 10;
          
          const activityScore = areaAnalysis.activityLevel === 'high' ? 30 :
                               areaAnalysis.activityLevel === 'medium' ? 20 : 10;
          
          const diversityScore = areaAnalysis.diversityScore * 0.3;
          
          const totalScore = competitionScore + activityScore + diversityScore;
          
          locationScores.push({
            lat: point.lat,
            lng: point.lng,
            score: Math.round(totalScore)
          });
        }
      }

      // Return top scoring locations
      return locationScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    } catch (error) {
      console.error('Error finding optimal locations:', error);
      return [];
    }
  }

  /**
   * Generate grid points for analysis
   */
  private generateGridPoints(
    centerLat: number, 
    centerLng: number, 
    radius: number, 
    gridSize: number
  ): Array<{lat: number, lng: number}> {
    const points: Array<{lat: number, lng: number}> = [];
    const latStep = (radius / 111000) / gridSize; // Convert meters to degrees (approx)
    const lngStep = (radius / (111000 * Math.cos(centerLat * Math.PI / 180))) / gridSize;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = centerLat + (i * latStep);
        const lng = centerLng + (j * lngStep);
        points.push({ lat, lng });
      }
    }

    return points;
  }

  /**
   * Generate fallback analysis when Places Aggregate API is not available
   */
  private generateFallbackAnalysis(lat: number, lng: number, radius: number): AreaAnalysis {
    console.log('🔄 Generating fallback area analysis');
    
    // Generate estimated values based on location characteristics
    // This is a simplified estimation - in production you might use local data or other APIs
    const baseCount = Math.floor(radius / 200); // Rough estimate based on radius
    
    const insights = {
      restaurants: { count: Math.floor(baseCount * 1.5) },
      bars: { count: Math.floor(baseCount * 0.8) },
      cafes: { count: Math.floor(baseCount * 1.2) },
      entertainment: { count: Math.floor(baseCount * 0.6) },
      shopping: { count: Math.floor(baseCount * 1.0) },
      attractions: { count: Math.floor(baseCount * 0.4) }
    };

    const competitionScore = this.calculateCompetitionScore(insights);
    const diversityScore = this.calculateDiversityScore(insights);
    const activityLevel = this.determineActivityLevel(insights);

    return {
      location: { lat, lng },
      radius,
      insights,
      competitionScore,
      diversityScore,
      activityLevel
    };
  }
}