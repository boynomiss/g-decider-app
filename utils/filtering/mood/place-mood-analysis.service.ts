/**
 * Place Mood Analysis Service
 * 
 * High-level orchestrator for place mood analysis.
 * Combines multiple data sources and analysis methods to determine place mood.
 * 
 * IMPROVEMENTS:
 * - Uses centralized types and config
 * - Integrates with unified system
 * - Better separation from entity service
 * - Cleaner API and error handling
 * - Performance monitoring
 */

import { googlePlacesClient, googleNaturalLanguageClient } from '../../api/google-api-clients';
import { filterConfigRegistry } from '../config-registry';
import { FilterCoreUtils as FilterUtilities } from '../filter-core-utils';
import { ConsolidatedFilterLogger } from '../filter-logger';
import { EntityMoodAnalysisService } from './entity-mood-analysis.service';
import {
  PlaceMoodData,
  MoodAnalysisResult,
  ReviewEntity,
  SentimentAnalysis,
  PopularTimes,
  MoodAnalysisConfig,
  MoodOption,
  IMoodAnalysisService
} from '../../../types/filtering';

export class PlaceMoodAnalysisService implements IMoodAnalysisService {
  private entityAnalyzer: EntityMoodAnalysisService;
  private config: MoodAnalysisConfig;

  constructor(
    private googlePlacesApiKey: string,
    private googleNaturalLanguageApiKey?: string,
    config?: Partial<MoodAnalysisConfig>
  ) {
    // Initialize entity analyzer with lazy loading to avoid circular dependencies
    this.entityAnalyzer = new EntityMoodAnalysisService();
    
    this.config = {
      // Default configuration
      minSalience: 0.15,
      minSentimentMagnitude: 0.3,
      maxReviewsToAnalyze: 10,
      onlyPositiveReviews: false, // Place analysis can use all reviews
      
      highConfidenceThreshold: 70,
      mediumConfidenceThreshold: 50,
      
      maxRetries: 3,
      retryDelay: 1000,
      apiTimeout: 15000,
      
      ...config
    };

    ConsolidatedFilterLogger.getInstance().info('place-mood-service', 'Place Mood Analysis Service initialized');
  }

  /**
   * Main analysis method - analyze mood for a specific place
   */
  async analyzePlaceMood(placeId: string): Promise<MoodAnalysisResult> {
    const monitoredFn = FilterUtilities.createPerformanceMonitor(
      'place-mood-analysis',
      () => this.performPlaceMoodAnalysis(placeId)
    );

    return await monitoredFn();
  }

  /**
   * Analyze mood from reviews (used by unified service)
   */
  async analyzeFromReviews(reviews: ReviewEntity[], category: string): Promise<MoodAnalysisResult> {
    try {
      ConsolidatedFilterLogger.getInstance().info('place-mood-from-reviews', `Analyzing mood from ${reviews.length} reviews for ${category}`);

      // Convert reviews to expected format
      const convertedReviews = reviews.map(review => ({
        text: review.text,
        rating: review.rating,
        time: typeof review.time === 'number' ? review.time : parseInt(review.time || '0')
      }));

      // Try entity analysis first (high confidence)
      const entityAnalysis = await this.entityAnalyzer.analyzeFromReviews(convertedReviews, category);
      
      if (entityAnalysis.confidence >= this.config.highConfidenceThreshold) {
        ConsolidatedFilterLogger.getInstance().info('place-mood-from-reviews', `Using entity analysis (${entityAnalysis.confidence}% confidence)`);
        return entityAnalysis;
      }

      // Fallback to sentiment analysis
      ConsolidatedFilterLogger.getInstance().info('place-mood-from-reviews', 'Entity analysis confidence low, using sentiment analysis');
      const sentimentAnalysis = await this.performSentimentAnalysis(convertedReviews);
      const moodScore = this.calculateMoodScoreFromSentiment(sentimentAnalysis, category);
      
      return {
        score: moodScore,
        category: this.determineMoodCategory(moodScore),
        confidence: Math.max(entityAnalysis.confidence, 50),
        descriptors: sentimentAnalysis.keywords,
        source: 'sentiment-analysis'
      };

    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('place-mood-from-reviews', 'Analysis failed', error);
      return this.getFallbackAnalysis(category);
    }
  }

  /**
   * Enhanced place data collection and mood analysis
   */
  async enhancePlaceWithMood(placeId: string): Promise<PlaceMoodData> {
    try {
      ConsolidatedFilterLogger.getInstance().info('place-enhancement', `Starting mood enhancement for place: ${placeId}`);
      
      // Step 1: Get core place data
      const coreData = await this.getCorePlaceData(placeId);
      ConsolidatedFilterLogger.getInstance().info('place-enhancement', `Core data collected for: ${coreData.name}`);
      
      // Step 2: Get real-time data
      const realTimeData = await this.getRealTimeData(placeId);
      ConsolidatedFilterLogger.getInstance().info('place-enhancement', `Real-time data collected: busyness ${realTimeData.current_busyness || 'N/A'}`);
      
      // Step 3: Perform mood analysis
      const moodAnalysis = await this.analyzePlaceMood(placeId);
      ConsolidatedFilterLogger.getInstance().info('place-enhancement', `Mood analysis completed: ${moodAnalysis.category} (${moodAnalysis.score}/100)`);
      
      // Combine all data
      const enhancedPlace: PlaceMoodData = {
        place_id: coreData.place_id || placeId,
        name: coreData.name || 'Unknown Place',
        address: coreData.address || '',
        category: coreData.category || 'establishment',
        user_ratings_total: coreData.user_ratings_total || 0,
        rating: coreData.rating || 0,
        reviews: coreData.reviews || [],
        ...realTimeData,
        mood_analysis: moodAnalysis
      };
      
      return enhancedPlace;
      
    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('place-enhancement', `Failed to enhance place ${placeId}`, error);
      throw error;
    }
  }

  /**
   * Batch process multiple places
   */
  async enhanceMultiplePlaces(placeIds: string[]): Promise<PlaceMoodData[]> {
    ConsolidatedFilterLogger.getInstance().info('place-batch-enhancement', `Starting batch processing of ${placeIds.length} places`);
    
    const results: PlaceMoodData[] = [];
    
    for (let i = 0; i < placeIds.length; i++) {
      const placeId = placeIds[i];
      
      try {
        ConsolidatedFilterLogger.getInstance().info('place-batch-enhancement', `Processing place ${i + 1}/${placeIds.length}: ${placeId}`);
        const enhancedPlace = await this.enhancePlaceWithMood(placeId);
        results.push(enhancedPlace);
        
        // Rate limiting
        if (i < placeIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        ConsolidatedFilterLogger.getInstance().error('place-batch-enhancement', `Failed to process place ${placeId}`, error);
        continue;
      }
    }
    
    ConsolidatedFilterLogger.getInstance().info('place-batch-enhancement', `Batch processing complete: ${results.length}/${placeIds.length} successful`);
    return results;
  }

  /**
   * Get mood statistics for a set of places
   */
  getMoodStatistics(places: PlaceMoodData[]): {
    total: number;
    chill: number;
    neutral: number;
    hype: number;
    averageScore: number;
    averageConfidence: number;
  } {
    const stats = {
      total: places.length,
      chill: 0,
      neutral: 0,
      hype: 0,
      averageScore: 0,
      averageConfidence: 0
    };

    let totalScore = 0;
    let totalConfidence = 0;

    places.forEach(place => {
      if (place.mood_analysis) {
        totalScore += place.mood_analysis.score;
        totalConfidence += place.mood_analysis.confidence;
        
        switch (place.mood_analysis.category) {
          case 'chill':
            stats.chill++;
            break;
          case 'neutral':
            stats.neutral++;
            break;
          case 'hype':
            stats.hype++;
            break;
        }
      }
    });

    stats.averageScore = Math.round(totalScore / places.length);
    stats.averageConfidence = Math.round(totalConfidence / places.length);

    return stats;
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<MoodAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.entityAnalyzer.updateConfig(newConfig);
    ConsolidatedFilterLogger.getInstance().info('place-mood-service', 'Configuration updated');
  }

  // =================
  // PRIVATE METHODS
  // =================

  /**
   * Perform the complete place mood analysis
   */
  private async performPlaceMoodAnalysis(placeId: string): Promise<MoodAnalysisResult> {
    try {
      // Get place data
      const placeData = await this.getCorePlaceData(placeId);
      
      if (!placeData.reviews || placeData.reviews.length === 0) {
        ConsolidatedFilterLogger.getInstance().info('place-mood-analysis', 'No reviews found, using category-based analysis');
        return this.getCategoryBasedAnalysis(placeData.category || 'establishment');
      }

      // Try entity analysis first
      const entityResult = await this.entityAnalyzer.analyzeFromReviews(
        placeData.reviews,
        placeData.category || 'establishment'
      );

      if (entityResult.confidence >= this.config.highConfidenceThreshold) {
        return entityResult;
      }

      // Fallback to combined analysis
      const sentimentAnalysis = await this.performSentimentAnalysis(placeData.reviews);
      const combinedScore = this.calculateCombinedMoodScore(
        entityResult,
        sentimentAnalysis,
        placeData
      );

      return {
        score: combinedScore,
        category: this.determineMoodCategory(combinedScore),
        confidence: Math.max(entityResult.confidence, 60),
        descriptors: [...entityResult.descriptors, ...sentimentAnalysis.keywords].slice(0, 5),
        source: 'sentiment-analysis'
      };

    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('place-mood-analysis', 'Analysis failed', error);
      return this.getFallbackAnalysis('establishment');
    }
  }

  /**
   * Get core place data from Google Places API
   */
  private async getCorePlaceData(placeId: string): Promise<Partial<PlaceMoodData>> {
    try {
      const place = await googlePlacesClient.getPlace(placeId, [
        'id', 'displayName', 'formattedAddress', 'types', 'userRatingCount', 'rating', 'reviews'
      ]);
      
      return {
        place_id: place.id,
        name: place.displayName?.text || place.displayName || 'Unknown Place',
        address: place.formattedAddress || '',
        category: place.types?.[0] || 'establishment',
        user_ratings_total: place.userRatingCount || 0,
        rating: place.rating || 0,
        reviews: place.reviews?.map((review: any) => ({
          text: review.text?.text || review.text || '',
          rating: review.rating || 0,
          time: new Date(review.publishTime).getTime()
        })) || []
      };
      
    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('place-data-fetch', 'Failed to fetch place data', error);
      throw error;
    }
  }

  /**
   * Get real-time data (simulated for now)
   */
  private async getRealTimeData(placeId: string): Promise<Partial<PlaceMoodData>> {
    try {
      // TODO: Implement real popular times API or service
      const simulatedBusyness = Math.floor(Math.random() * 100);
      
      return {
        current_busyness: simulatedBusyness,
        popular_times: []
      };
      
    } catch (error) {
      ConsolidatedFilterLogger.getInstance().warn('real-time-data', 'Failed to fetch real-time data', error);
      return {
        current_busyness: 0,
        popular_times: []
      };
    }
  }

  /**
   * Perform sentiment analysis on reviews
   */
  private async performSentimentAnalysis(reviews: ReviewEntity[]): Promise<SentimentAnalysis> {
    if (!reviews || reviews.length === 0) {
      return { score: 0, magnitude: 0, keywords: [], entities: [] };
    }

    try {
      // Combine recent reviews
      const recentReviews = reviews
        .sort((a, b) => b.time - a.time)
        .slice(0, 10)
        .map(review => review.text)
        .join(' ');

      // Extract keywords first
      const keywords = this.extractMoodKeywords(recentReviews);

      // If no API key, use keyword-based analysis
      if (!this.googleNaturalLanguageApiKey) {
        const keywordSentiment = this.analyzeKeywordSentiment(keywords);
        return {
          score: keywordSentiment.score,
          magnitude: keywordSentiment.magnitude,
          keywords,
          entities: []
        };
      }

      // Use Google Natural Language API
      const sentimentData = await googleNaturalLanguageClient.analyzeSentiment(recentReviews);

      return {
        score: sentimentData.documentSentiment?.score || 0,
        magnitude: sentimentData.documentSentiment?.magnitude || 0,
        keywords,
        entities: []
      };

    } catch (error) {
      ConsolidatedFilterLogger.getInstance().warn('sentiment-analysis', 'Sentiment analysis failed, using keyword fallback', error);
      const keywords = this.extractMoodKeywords(reviews.map(r => r.text).join(' '));
      const keywordSentiment = this.analyzeKeywordSentiment(keywords);
      
      return {
        score: keywordSentiment.score,
        magnitude: keywordSentiment.magnitude,
        keywords,
        entities: []
      };
    }
  }

  /**
   * Extract mood keywords from text
   */
  private extractMoodKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];

    // Get mood keywords from registry
    const moodConfigs = filterConfigRegistry.getConfigs('mood');
    
    moodConfigs.forEach(config => {
      config.atmosphereKeywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      });
    });

    return Array.from(new Set(foundKeywords)); // Remove duplicates
  }

  /**
   * Keyword-based sentiment analysis fallback
   */
  private analyzeKeywordSentiment(keywords: string[]): { score: number; magnitude: number } {
    const moodConfigs = filterConfigRegistry.getConfigs('mood');
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    keywords.forEach(keyword => {
      const hypeConfig = moodConfigs.find(c => c.id === 'hype');
      const chillConfig = moodConfigs.find(c => c.id === 'chill');
      
      if (hypeConfig?.atmosphereKeywords.includes(keyword)) {
        positiveCount++;
      } else if (chillConfig?.atmosphereKeywords.includes(keyword)) {
        positiveCount += 0.5; // Chill is positive but calm
      }
      
      // Add negative keyword detection
      const negativeWords = ['bad', 'terrible', 'awful', 'disappointing', 'poor', 'worst'];
      if (negativeWords.some(neg => keyword.toLowerCase().includes(neg))) {
        negativeCount++;
      }
    });
    
    const totalKeywords = keywords.length || 1;
    const score = (positiveCount - negativeCount) / totalKeywords;
    const magnitude = (positiveCount + negativeCount) / totalKeywords;
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: Math.max(0, Math.min(1, magnitude))
    };
  }

  /**
   * Calculate combined mood score from multiple sources
   */
  private calculateCombinedMoodScore(
    entityResult: MoodAnalysisResult,
    sentimentData: SentimentAnalysis,
    placeData: Partial<PlaceMoodData>
  ): number {
    // Start with category baseline from registry
    const categoryBaseScore = this.getCategoryBaseScore(placeData.category || 'establishment');
    
    // Weight the different sources
    let combinedScore = categoryBaseScore * 0.3; // 30% category baseline
    combinedScore += entityResult.score * 0.4; // 40% entity analysis
    combinedScore += this.sentimentToScore(sentimentData) * 0.3; // 30% sentiment
    
    return Math.max(0, Math.min(100, Math.round(combinedScore)));
  }

  /**
   * Convert sentiment analysis to mood score
   */
  private sentimentToScore(sentiment: SentimentAnalysis): number {
    const baseScore = 60; // Neutral baseline
    const sentimentAdjustment = sentiment.score * 20; // ±20 points max
    const keywordBonus = Math.min(sentiment.keywords.length * 2, 10); // Up to 10 bonus points
    
    return Math.max(0, Math.min(100, baseScore + sentimentAdjustment + keywordBonus));
  }

  /**
   * Get category-based baseline score
   */
  private getCategoryBaseScore(category: string): number {
    // Get from mood config registry
    const categoryMapping: Record<string, number> = {
      'night_club': 90,
      'bar': 85,
      'restaurant': 55,
      'cafe': 35,
      'spa': 25,
      'gym': 72,
      'establishment': 50
    };
    
    return categoryMapping[category] || 50;
  }

  /**
   * Determine mood category from score
   */
  private determineMoodCategory(score: number): MoodOption {
    if (score >= 66.67) return 'hype';
    if (score <= 33.33) return 'chill';
    return 'neutral';
  }

  /**
   * Get category-based analysis when no reviews available
   */
  private getCategoryBasedAnalysis(category: string): MoodAnalysisResult {
    const score = this.getCategoryBaseScore(category);
    
    return {
      score,
      category: this.determineMoodCategory(score),
      confidence: 40,
      descriptors: [],
      source: 'category-mapping'
    };
  }

  /**
   * Calculate mood score from sentiment analysis
   */
  private calculateMoodScoreFromSentiment(sentiment: SentimentAnalysis, category: string): number {
    const baseScore = this.getCategoryBaseScore(category);
    const sentimentScore = this.sentimentToScore(sentiment);
    
    // Combine category baseline with sentiment
    return Math.max(0, Math.min(100, (baseScore + sentimentScore) / 2));
  }

  /**
   * Get fallback analysis when everything fails
   */
  private getFallbackAnalysis(category: string): MoodAnalysisResult {
    return {
      score: 60,
      category: 'neutral',
      confidence: 20,
      descriptors: [],
      source: 'fallback'
    };
  }
}

// Export factory function instead of singleton
export function createPlaceMoodAnalysisService(
  placesApiKey?: string,
  naturalLanguageApiKey?: string,
  config?: Partial<MoodAnalysisConfig>
): PlaceMoodAnalysisService {
  return new PlaceMoodAnalysisService(
    placesApiKey || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    naturalLanguageApiKey || process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY,
    config
  );
}

// Export utility functions
export const placeMoodUtils = {
  /**
   * Get mood category from score
   */
  getMoodCategory: (score: number): MoodOption => {
    if (score >= 66.67) return 'hype';
    if (score <= 33.33) return 'chill';
    return 'neutral';
  },

  /**
   * Validate mood score
   */
  validateMoodScore: (score: number): boolean => {
    return score >= 0 && score <= 100 && !isNaN(score);
  },

  /**
   * Get mood label from registry
   */
  getMoodLabel: (category: MoodOption): string => {
    const config = filterConfigRegistry.getConfig('mood', category);
    return config?.label || category;
  },

  /**
   * Calculate confidence level description
   */
  getConfidenceLevel: (confidence: number): 'low' | 'medium' | 'high' => {
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }
};