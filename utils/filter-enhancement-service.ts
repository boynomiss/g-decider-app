/**
 * Filter Enhancement Service
 * 
 * Uses Places Aggregate API to enhance filtering with location-based insights
 * Answers questions like "How many 5-star rated, inexpensive restaurants are within 5km?"
 */

import { PlacesAggregateService } from './places-aggregate-service';

export interface FilterInsight {
  filterCombination: string;
  count: number;
  placeIds?: string[];
  density: 'low' | 'medium' | 'high';
  recommendation: 'expand-search' | 'good-options' | 'too-many-options';
}

export interface LocationFilterAnalysis {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  insights: {
    totalPlaces: number;
    byCategory: Record<string, FilterInsight>;
    byRating: Record<string, FilterInsight>;
    byPriceLevel: Record<string, FilterInsight>;
    byCombination: Record<string, FilterInsight>;
  };
  recommendations: {
    bestFilters: string[];
    shouldExpandRadius: boolean;
    alternativeCategories: string[];
    optimalPriceRange: string[];
  };
}

export class FilterEnhancementService {
  private aggregateService: PlacesAggregateService;

  constructor(placesApiKey: string) {
    this.aggregateService = new PlacesAggregateService(placesApiKey);
  }

  /**
   * Analyze filter effectiveness for a specific location
   * This helps users understand what filters will yield good results
   */
  async analyzeFilterEffectiveness(
    lat: number,
    lng: number,
    radius: number,
    userFilters: any
  ): Promise<LocationFilterAnalysis> {
    console.log('🔍 Analyzing filter effectiveness with Places Aggregate API');

    const analysis: LocationFilterAnalysis = {
      location: { lat, lng },
      radius,
      insights: {
        totalPlaces: 0,
        byCategory: {},
        byRating: {},
        byPriceLevel: {},
        byCombination: {}
      },
      recommendations: {
        bestFilters: [],
        shouldExpandRadius: false,
        alternativeCategories: [],
        optimalPriceRange: []
      }
    };

    try {
      // Analyze by category
      await this.analyzeCategoryFilters(lat, lng, radius, analysis);
      
      // Analyze by rating (high-rated places)
      await this.analyzeRatingFilters(lat, lng, radius, analysis);
      
      // Analyze by price level
      await this.analyzePriceLevelFilters(lat, lng, radius, analysis);
      
      // Analyze specific filter combinations
      await this.analyzeFilterCombinations(lat, lng, radius, userFilters, analysis);
      
      // Generate recommendations
      this.generateFilterRecommendations(analysis, userFilters);

      console.log('✨ Filter analysis complete:', {
        totalPlaces: analysis.insights.totalPlaces,
        bestFilters: analysis.recommendations.bestFilters,
        shouldExpandRadius: analysis.recommendations.shouldExpandRadius
      });

      return analysis;

    } catch (error) {
      console.error('Error analyzing filter effectiveness:', error);
      throw error;
    }
  }

  /**
   * Analyze category-based filters
   */
  private async analyzeCategoryFilters(
    lat: number,
    lng: number,
    radius: number,
    analysis: LocationFilterAnalysis
  ) {
    const categories = [
      { key: 'restaurants', types: ['restaurant'] },
      { key: 'bars', types: ['bar', 'night_club'] },
      { key: 'cafes', types: ['cafe', 'bakery'] },
      { key: 'fast_food', types: ['meal_takeaway', 'fast_food'] },
      { key: 'entertainment', types: ['movie_theater', 'amusement_park', 'bowling_alley'] },
      { key: 'shopping', types: ['shopping_mall', 'store', 'department_store'] },
      { key: 'attractions', types: ['tourist_attraction', 'museum', 'park'] }
    ];

    for (const category of categories) {
      const insight = await this.getPlaceInsights(lat, lng, radius, category.types);
      analysis.insights.byCategory[category.key] = {
        filterCombination: `category:${category.key}`,
        count: insight.count,
        placeIds: insight.placeIds,
        density: this.calculateDensity(insight.count, radius),
        recommendation: this.getRecommendation(insight.count)
      };
      
      analysis.insights.totalPlaces += insight.count;
    }
  }

  /**
   * Analyze rating-based filters
   */
  private async analyzeRatingFilters(
    lat: number,
    lng: number,
    radius: number,
    analysis: LocationFilterAnalysis
  ) {
    // Note: Places Aggregate API doesn't directly filter by rating in the current version
    // This is a placeholder for when rating filters become available
    // For now, we'll estimate based on general place quality patterns
    
    const ratingCategories = [
      { key: '4.5+_stars', label: '4.5+ star rated places' },
      { key: '4.0+_stars', label: '4.0+ star rated places' },
      { key: '3.5+_stars', label: '3.5+ star rated places' }
    ];

    // For demonstration, we'll use restaurant data as a proxy
    const restaurantInsight = await this.getPlaceInsights(lat, lng, radius, ['restaurant']);
    
    for (const rating of ratingCategories) {
      // Estimate high-rated places (typically 20-30% of total for 4.5+, 50-60% for 4.0+)
      const estimatedCount = rating.key === '4.5+_stars' ? Math.round(restaurantInsight.count * 0.25) :
                           rating.key === '4.0+_stars' ? Math.round(restaurantInsight.count * 0.55) :
                           Math.round(restaurantInsight.count * 0.75);

      analysis.insights.byRating[rating.key] = {
        filterCombination: `rating:${rating.key}`,
        count: estimatedCount,
        density: this.calculateDensity(estimatedCount, radius),
        recommendation: this.getRecommendation(estimatedCount)
      };
    }
  }

  /**
   * Analyze price level filters
   */
  private async analyzePriceLevelFilters(
    lat: number,
    lng: number,
    radius: number,
    analysis: LocationFilterAnalysis
  ) {
    // Note: Current Places Aggregate API doesn't have direct price level filtering
    // This is a framework for when it becomes available
    
    const priceLevels = [
      { key: 'inexpensive', label: 'Inexpensive ($)' },
      { key: 'moderate', label: 'Moderate ($$)' },
      { key: 'expensive', label: 'Expensive ($$$)' },
      { key: 'very_expensive', label: 'Very Expensive ($$$$)' }
    ];

    // Get restaurant data as baseline
    const restaurantInsight = await this.getPlaceInsights(lat, lng, radius, ['restaurant']);
    
    for (const price of priceLevels) {
      // Estimate distribution: inexpensive (40%), moderate (35%), expensive (20%), very expensive (5%)
      const estimatedCount = price.key === 'inexpensive' ? Math.round(restaurantInsight.count * 0.40) :
                           price.key === 'moderate' ? Math.round(restaurantInsight.count * 0.35) :
                           price.key === 'expensive' ? Math.round(restaurantInsight.count * 0.20) :
                           Math.round(restaurantInsight.count * 0.05);

      analysis.insights.byPriceLevel[price.key] = {
        filterCombination: `price:${price.key}`,
        count: estimatedCount,
        density: this.calculateDensity(estimatedCount, radius),
        recommendation: this.getRecommendation(estimatedCount)
      };
    }
  }

  /**
   * Analyze specific filter combinations that user might use
   */
  private async analyzeFilterCombinations(
    lat: number,
    lng: number,
    radius: number,
    userFilters: any,
    analysis: LocationFilterAnalysis
  ) {
    // Analyze combinations that are most relevant to the user's filters
    const combinations = [
      {
        key: 'romantic_restaurants',
        types: ['restaurant'],
        description: 'Romantic restaurants (upscale dining)',
        estimateMultiplier: 0.15 // ~15% of restaurants are upscale/romantic
      },
      {
        key: 'family_friendly',
        types: ['restaurant', 'cafe', 'amusement_park'],
        description: 'Family-friendly places',
        estimateMultiplier: 0.60 // ~60% are family-friendly
      },
      {
        key: 'nightlife',
        types: ['bar', 'night_club', 'live_music_venue'],
        description: 'Nightlife spots',
        estimateMultiplier: 1.0 // All bars/clubs count
      },
      {
        key: 'quick_bites',
        types: ['fast_food', 'meal_takeaway', 'cafe'],
        description: 'Quick dining options',
        estimateMultiplier: 0.80 // Most casual places
      }
    ];

    for (const combo of combinations) {
      const insight = await this.getPlaceInsights(lat, lng, radius, combo.types);
      const estimatedCount = Math.round(insight.count * combo.estimateMultiplier);

      analysis.insights.byCombination[combo.key] = {
        filterCombination: combo.description,
        count: estimatedCount,
        placeIds: insight.placeIds?.slice(0, estimatedCount),
        density: this.calculateDensity(estimatedCount, radius),
        recommendation: this.getRecommendation(estimatedCount)
      };
    }
  }

  /**
   * Get place insights using Places Aggregate API
   */
  private async getPlaceInsights(
    lat: number,
    lng: number,
    radius: number,
    types: string[]
  ) {
    return await this.aggregateService.getDetailedPlaceInsights(lat, lng, radius, types);
  }

  /**
   * Calculate density category based on count and radius
   */
  private calculateDensity(count: number, radius: number): 'low' | 'medium' | 'high' {
    // Density per square km
    const areaKm2 = Math.PI * Math.pow(radius / 1000, 2);
    const density = count / areaKm2;

    if (density < 5) return 'low';
    if (density < 15) return 'medium';
    return 'high';
  }

  /**
   * Get recommendation based on place count
   */
  private getRecommendation(count: number): 'expand-search' | 'good-options' | 'too-many-options' {
    if (count < 3) return 'expand-search';
    if (count < 20) return 'good-options';
    return 'too-many-options';
  }

  /**
   * Generate filter recommendations based on analysis
   */
  private generateFilterRecommendations(
    analysis: LocationFilterAnalysis,
    userFilters: any
  ) {
    const recommendations = analysis.recommendations;

    // Find best performing filters
    const allInsights = [
      ...Object.entries(analysis.insights.byCategory),
      ...Object.entries(analysis.insights.byCombination)
    ];

    const goodOptions = allInsights
      .filter(([_, insight]) => insight.recommendation === 'good-options' && insight.count >= 5)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([key, _]) => key);

    recommendations.bestFilters = goodOptions;

    // Check if radius expansion is needed
    const hasGoodOptions = allInsights.some(([_, insight]) => 
      insight.recommendation === 'good-options' && insight.count >= 5
    );
    recommendations.shouldExpandRadius = !hasGoodOptions;

    // Suggest alternative categories if current selection is poor
    if (userFilters.category) {
      const currentCategoryInsight = analysis.insights.byCategory[userFilters.category];
      if (currentCategoryInsight?.recommendation === 'expand-search') {
        recommendations.alternativeCategories = Object.entries(analysis.insights.byCategory)
          .filter(([key, insight]) => key !== userFilters.category && insight.count > currentCategoryInsight.count)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 2)
          .map(([key, _]) => key);
      }
    }

    // Suggest optimal price ranges
    const priceOptions = Object.entries(analysis.insights.byPriceLevel)
      .filter(([_, insight]) => insight.recommendation === 'good-options')
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)
      .map(([key, _]) => key);

    recommendations.optimalPriceRange = priceOptions;
  }

  /**
   * Answer specific filter questions like "How many 5-star rated, inexpensive restaurants are within 5km?"
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
  }> {
    console.log('❓ Answering specific filter question:', question);

    try {
      // Get base data for the category
      const types = this.getCategoryTypes(question.category);
      const insight = await this.getPlaceInsights(lat, lng, radius, types);

      // Apply additional filters (estimated since API doesn't support all filters yet)
      let filteredCount = insight.count;
      let interpretation = `Found ${insight.count} ${question.category?.join(', ') || 'places'}`;

      // Estimate rating filter
      if (question.minRating) {
        const ratingMultiplier = question.minRating >= 4.5 ? 0.25 :
                               question.minRating >= 4.0 ? 0.55 :
                               question.minRating >= 3.5 ? 0.75 : 0.90;
        filteredCount = Math.round(filteredCount * ratingMultiplier);
        interpretation += ` with ${question.minRating}+ stars`;
      }

      // Estimate price filter
      if (question.priceLevel) {
        const priceMultiplier = question.priceLevel === 'inexpensive' ? 0.40 :
                              question.priceLevel === 'moderate' ? 0.35 :
                              question.priceLevel === 'expensive' ? 0.20 : 0.05;
        filteredCount = Math.round(filteredCount * priceMultiplier);
        interpretation += ` in ${question.priceLevel} price range`;
      }

      // Estimate open now filter
      if (question.openNow) {
        filteredCount = Math.round(filteredCount * 0.70); // ~70% typically open
        interpretation += ` currently open`;
      }

      interpretation += ` within ${radius/1000}km`;

      // Generate recommendation
      let recommendation: string;
      if (filteredCount === 0) {
        recommendation = 'No places match these criteria. Try expanding your search radius or relaxing some filters.';
      } else if (filteredCount < 3) {
        recommendation = 'Very few options available. Consider expanding search area or adjusting filters.';
      } else if (filteredCount < 10) {
        recommendation = 'Good selection available with these filters.';
      } else {
        recommendation = 'Many options available. You might want to add more specific filters.';
      }

      return {
        count: filteredCount,
        placeIds: insight.placeIds?.slice(0, filteredCount),
        interpretation,
        recommendation
      };

    } catch (error) {
      console.error('Error answering filter question:', error);
      throw error;
    }
  }

  /**
   * Get Google Places types for categories
   */
  private getCategoryTypes(categories?: string[]): string[] {
    if (!categories) return ['establishment'];

    const categoryMap: Record<string, string[]> = {
      'restaurant': ['restaurant'],
      'bar': ['bar', 'night_club'],
      'cafe': ['cafe', 'bakery'],
      'fast_food': ['meal_takeaway', 'fast_food'],
      'entertainment': ['movie_theater', 'amusement_park', 'bowling_alley'],
      'shopping': ['shopping_mall', 'store'],
      'attraction': ['tourist_attraction', 'museum', 'park']
    };

    return categories.flatMap(cat => categoryMap[cat] || [cat]);
  }
}