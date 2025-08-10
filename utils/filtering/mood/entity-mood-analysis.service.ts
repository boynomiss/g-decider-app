/**
 * Entity Mood Analysis Service
 * 
 * Specialized service for analyzing mood from entities extracted from text.
 * This is a lower-level service focused specifically on entity analysis.
 * 
 * IMPROVEMENTS:
 * - Uses centralized types and config
 * - Better error handling and fallbacks
 * - Performance optimizations
 * - Cleaner interface and separation of concerns
 */

import { googleNaturalLanguageClient } from '../../api/google-api-clients';
import { filterConfigRegistry } from '../config-registry';
import { FilterCoreUtils as FilterUtilities } from '../filter-core-utils';
import { ConsolidatedFilterLogger } from '../filter-logger';
import {
  EntityAnalysisResult,
  ReviewEntity,
  MoodAnalysisResult,
  MoodAnalysisConfig,
  EntityMoodInsights,
  MoodOption,
  IEntityMoodService
} from '../../../types/filtering';

export class EntityMoodAnalysisService implements IEntityMoodService {
  private config: MoodAnalysisConfig;

  constructor(config?: Partial<MoodAnalysisConfig>) {
    this.config = {
      // Entity analysis settings
      minSalience: 0.15,
      minSentimentMagnitude: 0.3,
      maxReviewsToAnalyze: 10,
      onlyPositiveReviews: true,
      
      // Confidence thresholds
      highConfidenceThreshold: 70,
      mediumConfidenceThreshold: 50,
      
      // API settings
      maxRetries: 2,
      retryDelay: 500,
      apiTimeout: 10000,
      
      ...config
    };

    ConsolidatedFilterLogger.getInstance().info('entity-mood-service', 'Entity Mood Analysis Service initialized');
  }

  /**
   * Main analysis method - analyze mood from reviews using entity extraction
   */
  async analyzeFromReviews(reviews: ReviewEntity[], placeCategory: string): Promise<MoodAnalysisResult> {
    try {
      ConsolidatedFilterLogger.getInstance().info('entity-mood-analysis', `Starting analysis for ${reviews.length} reviews`);

      // Filter and prepare reviews
      const validReviews = this.filterValidReviews(reviews);
      
      if (validReviews.length < 3) {
        ConsolidatedFilterLogger.getInstance().warn('entity-mood-analysis', 'Too few valid reviews, using fallback');
        return this.getFallbackAnalysis(placeCategory);
      }

      // Extract entities from all reviews
      const allEntities = await this.extractEntitiesFromReviews(validReviews);
      
      if (allEntities.length === 0) {
        ConsolidatedFilterLogger.getInstance().warn('entity-mood-analysis', 'No entities extracted, using fallback');
        return this.getFallbackAnalysis(placeCategory);
      }

      // Calculate entity weights based on review quality
      const entityWeights = this.calculateEntityWeights(allEntities, validReviews);

      // Extract mood descriptors
      const descriptors = this.extractMoodDescriptors(allEntities, entityWeights);

      // Calculate mood score
      const score = this.calculateEntityBasedMoodScore(allEntities, entityWeights, placeCategory);

      // Determine mood category
      const category = this.determineMoodCategory(score);

      // Calculate confidence
      const confidence = this.calculateConfidence(allEntities, validReviews.length);

      const result: MoodAnalysisResult = {
        score,
        category,
        confidence,
        descriptors,
        source: 'entity-analysis'
      };

      ConsolidatedFilterLogger.getInstance().info('entity-mood-analysis', `Analysis completed: ${category} (${score}/100, ${confidence}% confidence)`);
      return result;

    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('entity-mood-analysis', 'Analysis failed', error);
      return this.getFallbackAnalysis(placeCategory);
    }
  }

  /**
   * Analyze entities in text using Google Natural Language API
   */
  async analyzeEntities(text: string): Promise<EntityAnalysisResult[]> {
    const monitoredFn = FilterUtilities.createPerformanceMonitor(
      'entity-analysis',
      () => this.performEntityAnalysis(text)
    );

    return await FilterUtilities.retry(
      monitoredFn,
      this.config.maxRetries,
      this.config.retryDelay
    );
  }

  /**
   * Extract mood descriptors from entities
   */
  extractMoodDescriptors(entities: EntityAnalysisResult[], entityWeights?: Map<string, number>): string[] {
    const descriptors: string[] = [];
    const processedEntities = new Set<string>();

    // Get mood configuration from registry
    const moodConfigs = filterConfigRegistry.getConfigs('mood');
    const allMoodKeywords = moodConfigs.flatMap(config => config.atmosphereKeywords);

    entities.forEach(entity => {
      const entityName = entity.name.toLowerCase();
      const weight = entityWeights?.get(entity.name) || entity.salience;
      
      // Skip if already processed, weight too low, or negative sentiment
      if (processedEntities.has(entityName) || weight < 0.1 || entity.sentiment.score < 0) {
        return;
      }

      // Check if entity matches mood keywords
      if (allMoodKeywords.some(keyword => entityName.includes(keyword.toLowerCase()))) {
        descriptors.push(entity.name);
        processedEntities.add(entityName);
      }
    });

    return descriptors.slice(0, 5); // Top 5 descriptors
  }

  /**
   * Calculate confidence based on entity quality and quantity
   */
  calculateConfidence(entities: EntityAnalysisResult[], reviewCount: number): number {
    if (entities.length === 0) return 0;
    
    // High-quality entities (strong salience and sentiment)
    const highQualityEntities = entities.filter(entity => 
      entity.salience >= this.config.minSalience && 
      entity.sentiment.magnitude >= this.config.minSentimentMagnitude
    );
    
    // Calculate scores
    const entityQualityScore = Math.min(100, (highQualityEntities.length / 3) * 100);
    const reviewQuantityScore = Math.min(100, (reviewCount / 5) * 100);
    
    // Weighted average: entity quality is more important
    return Math.round((entityQualityScore * 0.7) + (reviewQuantityScore * 0.3));
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<MoodAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    ConsolidatedFilterLogger.getInstance().info('entity-mood-service', 'Configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): MoodAnalysisConfig {
    return { ...this.config };
  }

  // =================
  // PRIVATE METHODS
  // =================

  /**
   * Perform the actual entity analysis with API call
   */
  private async performEntityAnalysis(text: string): Promise<EntityAnalysisResult[]> {
    // Truncate text to reduce API costs
    const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;
    
    // Use the React Native compatible client
    const result = await googleNaturalLanguageClient.analyzeEntities(truncatedText);
    const entities = result.entities || [];

    return entities
      .filter((entity: any) => 
        entity.salience >= this.config.minSalience &&
        entity.type && ['PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'WORK_OF_ART', 'CONSUMER_GOOD', 'OTHER'].includes(String(entity.type))
      )
      .map((entity: any) => ({
        name: entity.name || '',
        type: String(entity.type) || 'UNKNOWN',
        salience: entity.salience || 0,
        sentiment: {
          score: entity.sentiment?.score || 0,
          magnitude: entity.sentiment?.magnitude || 0
        }
      }));
  }

  /**
   * Filter reviews suitable for entity analysis
   */
  private filterValidReviews(reviews: ReviewEntity[]): ReviewEntity[] {
    return reviews
      .filter(review => 
        review.text && 
        review.text.length >= 20 && 
        (!this.config.onlyPositiveReviews || review.rating >= 4) &&
        review.text.length <= 500
      )
      .sort((a, b) => {
        // Prioritize recent, high-rated reviews
        const aScore = (a.rating * 0.6) + (this.getRecencyScore(a.time) * 0.4);
        const bScore = (b.rating * 0.6) + (this.getRecencyScore(b.time) * 0.4);
        return bScore - aScore;
      })
      .slice(0, this.config.maxReviewsToAnalyze);
  }

  /**
   * Extract entities from multiple reviews
   */
  private async extractEntitiesFromReviews(reviews: ReviewEntity[]): Promise<EntityAnalysisResult[]> {
    const allEntities: EntityAnalysisResult[] = [];

    for (const review of reviews) {
      try {
        const entities = await this.analyzeEntities(review.text);
        allEntities.push(...entities);
        
        // Small delay to respect rate limits
                  await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        ConsolidatedFilterLogger.getInstance().warn('entity-extraction', `Failed to analyze review: ${error}`);
        continue;
      }
    }

    return allEntities;
  }

  /**
   * Calculate entity weights based on review quality
   */
  private calculateEntityWeights(entities: EntityAnalysisResult[], reviews: ReviewEntity[]): Map<string, number> {
    const entityWeights = new Map<string, number>();

    entities.forEach(entity => {
      // Find the review this entity came from (approximation)
      const relevantReview = reviews.find(review => 
        review.text.toLowerCase().includes(entity.name.toLowerCase())
      );

      if (relevantReview) {
        const reviewWeight = this.calculateReviewWeight(relevantReview);
        const currentWeight = entityWeights.get(entity.name) || 0;
        entityWeights.set(entity.name, currentWeight + (entity.salience * reviewWeight));
      } else {
        entityWeights.set(entity.name, entity.salience);
      }
    });

    return entityWeights;
  }

  /**
   * Calculate review weight based on rating and recency
   */
  private calculateReviewWeight(review: ReviewEntity): number {
    const recencyScore = this.getRecencyScore(review.time);
    const ratingWeight = review.rating / 5;
    return recencyScore * ratingWeight;
  }

  /**
   * Get recency score for a review (0-1, recent = higher)
   */
  private getRecencyScore(time: number): number {
    const now = Date.now();
    const daysOld = (now - time) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysOld / 30)); // 30-day window
  }

  /**
   * Calculate mood score based on entity analysis
   */
  private calculateEntityBasedMoodScore(
    entities: EntityAnalysisResult[],
    entityWeights: Map<string, number>,
    placeCategory: string
  ): number {
    // Start with category-based baseline from registry
    const categoryConfig = filterConfigRegistry.getConfig('category', 'food'); // Default fallback
    const baselineScore = 60; // Neutral baseline

    let totalScore = 0;
    let totalWeight = 0;

    // Only consider entities with positive sentiment
    const positiveEntities = entities.filter(entity => 
      entity.sentiment.score > 0 && 
      entity.sentiment.magnitude >= this.config.minSentimentMagnitude
    );

    positiveEntities.forEach(entity => {
      const weight = entityWeights.get(entity.name) || entity.salience;
      const entityTypeWeight = this.getEntityTypeWeight(entity.type);
      
      // Calculate sentiment impact
      const sentimentImpact = entity.sentiment.score * entity.sentiment.magnitude;
      const adjustedWeight = weight * entityTypeWeight;
      
      totalScore += sentimentImpact * adjustedWeight;
      totalWeight += adjustedWeight;
    });

    // Calculate final score
    let moodScore = baselineScore;
    
    if (totalWeight > 0) {
      const averageSentiment = totalScore / totalWeight;
      // Convert from 0-1 range to 50-100 range (positive bias)
      moodScore = 50 + (averageSentiment * 50);
    }

    return Math.max(0, Math.min(100, Math.round(moodScore)));
  }

  /**
   * Get entity type weight from configuration
   */
  private getEntityTypeWeight(entityType: string): number {
    const weights: Record<string, number> = {
      'PERSON': 1.0,
      'ORGANIZATION': 0.8,
      'LOCATION': 0.6,
      'EVENT': 1.2,
      'WORK_OF_ART': 0.9,
      'CONSUMER_GOOD': 0.7,
      'OTHER': 0.5
    };
    
    return weights[entityType] || 0.5;
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
   * Get fallback analysis when entity analysis fails
   */
  private getFallbackAnalysis(placeCategory: string): MoodAnalysisResult {
    ConsolidatedFilterLogger.getInstance().info('entity-mood-fallback', `Using fallback analysis for category: ${placeCategory}`);
    
    // Simple category-based fallback
    const categoryMoodMap: Record<string, { score: number; category: MoodOption }> = {
      'restaurant': { score: 65, category: 'neutral' },
      'bar': { score: 75, category: 'hype' },
      'cafe': { score: 55, category: 'chill' },
      'nightclub': { score: 85, category: 'hype' },
      'spa': { score: 45, category: 'chill' },
      'gym': { score: 70, category: 'hype' }
    };

    const fallback = categoryMoodMap[placeCategory] || { score: 60, category: 'neutral' };

    return {
      score: fallback.score,
      category: fallback.category,
      confidence: 30,
      descriptors: [],
      source: 'fallback'
    };
  }
}

// Export factory function instead of singleton
export function createEntityMoodAnalysisService(config?: Partial<MoodAnalysisConfig>): EntityMoodAnalysisService {
  return new EntityMoodAnalysisService(config);
}

// Export utility functions
export const entityMoodUtils = {
  /**
   * Check if a word is a mood indicator
   */
  isMoodIndicator: (word: string, moodType: MoodOption): boolean => {
    const moodConfig = filterConfigRegistry.getConfig('mood', moodType);
    return moodConfig?.atmosphereKeywords.some(keyword => 
      word.toLowerCase().includes(keyword.toLowerCase())
    ) || false;
  },

  /**
   * Get entity type weight
   */
  getEntityTypeWeight: (entityType: string): number => {
    const weights: Record<string, number> = {
      'PERSON': 1.0,
      'ORGANIZATION': 0.8,
      'LOCATION': 0.6,
      'EVENT': 1.2,
      'WORK_OF_ART': 0.9,
      'CONSUMER_GOOD': 0.7,
      'OTHER': 0.5
    };
    
    return weights[entityType] || 0.5;
  },

  /**
   * Validate entity analysis result
   */
  validateEntityResult: (result: EntityAnalysisResult): boolean => {
    return !!(result.name && 
             result.type && 
             typeof result.salience === 'number' && 
             result.salience >= 0 &&
             typeof result.sentiment?.score === 'number' &&
             typeof result.sentiment?.magnitude === 'number');
  }
};