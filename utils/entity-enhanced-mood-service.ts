import { googleNaturalLanguageClient } from './google-api-clients';
import { ENTITY_ENHANCED_MOOD_LABELS, ENTITY_ANALYSIS_CONFIG, MOOD_RANGES } from './mood-config';

export interface EntityAnalysisResult {
  name: string;
  type: string;
  salience: number;
  sentiment: {
    score: number;
    magnitude: number;
  };
}

export interface ReviewEntity {
  text: string;
  rating: number;
  time: number;
  entities?: EntityAnalysisResult[];
}

export interface EntityMoodAnalysis {
  moodScore: number;
  moodCategory: 'chill' | 'neutral' | 'hype';
  extractedDescriptors: string[];
  confidence: number;
  entityInsights: {
    positiveEntities: string[];
    negativeEntities: string[];
    neutralEntities: string[];
  };
}

export class EntityEnhancedMoodService {
  private maxRetries: number = 2; // Reduced for cost optimization
  private retryDelay: number = 500; // Reduced for cost optimization

  constructor() {
    console.log('✅ Entity Enhanced Mood Service initialized (React Native compatible)');
  }

  /**
   * Analyze place reviews using entity analysis to extract mood descriptors
   */
  async analyzePlaceMoodFromReviews(
    reviews: ReviewEntity[],
    placeCategory: string
  ): Promise<EntityMoodAnalysis> {
    try {
      console.log('🔍 Starting entity-enhanced mood analysis...');

      // Filter and prepare reviews for analysis
      const validReviews = this.filterValidReviews(reviews);
      
      if (validReviews.length < 3) {
        console.log('⚠️ Too few valid reviews, using fallback mood analysis');
        return this.getFallbackMoodAnalysis(placeCategory);
      }

      // Analyze entities from all reviews
      const allEntities: EntityAnalysisResult[] = [];
      const entityWeights: Map<string, number> = new Map();

      for (const review of validReviews) {
        try {
          const entities = await this.analyzeEntities(review.text);
          const reviewWeight = this.calculateReviewWeight(review);
          
          entities.forEach(entity => {
            allEntities.push(entity);
            const currentWeight = entityWeights.get(entity.name) || 0;
            entityWeights.set(entity.name, currentWeight + (entity.salience * reviewWeight));
          });
        } catch (error) {
          console.warn(`⚠️ Failed to analyze review: ${error}`);
        }
      }

      // Extract mood descriptors from entities
      const extractedDescriptors = this.extractMoodDescriptors(allEntities, entityWeights);
      
      // Calculate mood score based on entity analysis
      const moodScore = this.calculateEntityBasedMoodScore(allEntities, entityWeights, placeCategory);
      
      // Determine mood category
      const moodCategory = this.determineMoodCategory(moodScore);
      
      // Calculate confidence based on entity quality and quantity
      const confidence = this.calculateConfidence(allEntities, validReviews.length);

      // Categorize entities by sentiment
      const entityInsights = this.categorizeEntitiesBySentiment(allEntities);

      const result: EntityMoodAnalysis = {
        moodScore,
        moodCategory,
        extractedDescriptors,
        confidence,
        entityInsights
      };

      console.log('✅ Entity-enhanced mood analysis completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Entity-enhanced mood analysis error:', error);
      return this.getFallbackMoodAnalysis(placeCategory);
    }
  }

  /**
   * Analyze entities in text using Google Natural Language API (React Native compatible)
   */
  private async analyzeEntities(text: string): Promise<EntityAnalysisResult[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Truncate text to reduce API costs
        const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;
        
        // Use the React Native compatible client
        const result = await googleNaturalLanguageClient.analyzeEntities(truncatedText);
        const entities = result.entities || [];

        const analysisResult: EntityAnalysisResult[] = entities
          .filter((entity: any) => 
            entity.salience && entity.salience >= 0.15 && // Increased threshold for cost optimization
            ENTITY_ANALYSIS_CONFIG.RELEVANT_ENTITY_TYPES.includes(String(entity.type))
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

        return analysisResult;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Entity analysis attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }
    
    console.warn('⚠️ Entity analysis failed, returning empty result');
    return [];
  }

  /**
   * Filter reviews that are suitable for entity analysis - ONLY POSITIVE REVIEWS
   */
  private filterValidReviews(reviews: ReviewEntity[]): ReviewEntity[] {
    return reviews
      .filter(review => 
        review.text && 
        review.text.length >= 20 && // Increased minimum length
        review.rating >= 4 && // Only consider positive reviews (4+ stars)
        review.text.length <= 500 // Truncate very long reviews
      )
      .sort((a, b) => {
        // Prioritize recent, high-rated reviews
        const aScore = (a.rating * 0.6) + (this.getRecencyScore(a.time) * 0.4);
        const bScore = (b.rating * 0.6) + (this.getRecencyScore(b.time) * 0.4);
        return bScore - aScore;
      })
      .slice(0, 10); // 50% reduction: 20 → 10 reviews
  }

  /**
   * Calculate review weight based on recency and rating
   */
  private calculateReviewWeight(review: ReviewEntity): number {
    const recencyScore = this.getRecencyScore(review.time);
    const ratingWeight = review.rating / 5;
    return recencyScore * ratingWeight;
  }

  /**
   * Get recency score for a review
   */
  private getRecencyScore(time: number): number {
    const now = Date.now();
    const daysOld = (now - time) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysOld / 30)); // 30-day window
  }

  /**
   * Extract mood descriptors from analyzed entities - ONLY POSITIVE ENTITIES
   */
  private extractMoodDescriptors(
    entities: EntityAnalysisResult[], 
    entityWeights: Map<string, number>
  ): string[] {
    const descriptors: string[] = [];
    const processedEntities = new Set<string>();

    entities.forEach(entity => {
      const entityName = entity.name.toLowerCase();
      const weight = entityWeights.get(entity.name) || 0;
      
      // Skip if already processed, weight is too low, or entity has negative sentiment
      if (processedEntities.has(entityName) || weight < 0.1 || entity.sentiment.score < 0) {
        return;
      }

      // Only consider entities with positive sentiment
      if (entity.sentiment.score > 0 && entity.sentiment.magnitude >= ENTITY_ANALYSIS_CONFIG.MIN_SENTIMENT_MAGNITUDE) {
        
        // Check if entity name matches positive mood indicator keywords
        const positiveKeywords = [
          ...ENTITY_ANALYSIS_CONFIG.MOOD_INDICATOR_KEYWORDS.hype,
          ...ENTITY_ANALYSIS_CONFIG.MOOD_INDICATOR_KEYWORDS.chill,
          ...ENTITY_ANALYSIS_CONFIG.MOOD_INDICATOR_KEYWORDS.neutral
        ];
        
        if (positiveKeywords.some(keyword => entityName.includes(keyword))) {
          descriptors.push(entity.name);
          processedEntities.add(entityName);
        }

        // Check entity-enhanced mood labels (all positive)
        for (const [moodType, labelData] of Object.entries(ENTITY_ENHANCED_MOOD_LABELS)) {
          const allKeywords = [
            ...labelData.adjectives,
            ...labelData.nouns,
            ...labelData.phrases
          ];
          
          if (allKeywords.some(keyword => entityName.includes(keyword))) {
            descriptors.push(entity.name);
            processedEntities.add(entityName);
            break;
          }
        }
      }
    });

    return descriptors.slice(0, 5); // Limit to top 5 descriptors
  }

  /**
   * Calculate mood score based on entity analysis - ONLY POSITIVE ENTITIES
   */
  private calculateEntityBasedMoodScore(
    entities: EntityAnalysisResult[],
    entityWeights: Map<string, number>,
    placeCategory: string
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Only consider entities with positive sentiment
    const positiveEntities = entities.filter(entity => 
      entity.sentiment.score > 0 && 
      entity.sentiment.magnitude >= ENTITY_ANALYSIS_CONFIG.MIN_SENTIMENT_MAGNITUDE
    );

    positiveEntities.forEach(entity => {
      const weight = entityWeights.get(entity.name) || 0;
      const entityTypeWeight = ENTITY_ANALYSIS_CONFIG.ENTITY_TYPE_WEIGHTS[entity.type as keyof typeof ENTITY_ANALYSIS_CONFIG.ENTITY_TYPE_WEIGHTS] || 0.5;
      
      // Calculate entity sentiment impact (only positive)
      const sentimentImpact = entity.sentiment.score * entity.sentiment.magnitude;
      const adjustedWeight = weight * entityTypeWeight;
      
      totalScore += sentimentImpact * adjustedWeight;
      totalWeight += adjustedWeight;
    });

    // Convert to 0-100 scale with positive bias
    let moodScore = 60; // Slightly positive baseline
    
    if (totalWeight > 0) {
      const averageSentiment = totalScore / totalWeight;
      // Convert from 0 to 1 range to 50 to 100 range (positive only)
      moodScore = 50 + (averageSentiment * 50);
    }

    // Ensure score is within bounds and has positive bias
    return Math.max(50, Math.min(100, Math.round(moodScore)));
  }

  /**
   * Determine mood category based on score
   */
  private determineMoodCategory(moodScore: number): 'chill' | 'neutral' | 'hype' {
    if (moodScore >= MOOD_RANGES.HYPE.min) return 'hype';
    if (moodScore >= MOOD_RANGES.NEUTRAL.min) return 'neutral';
    return 'chill';
  }

  /**
   * Calculate confidence based on entity quality and quantity
   */
  private calculateConfidence(entities: EntityAnalysisResult[], reviewCount: number): number {
    if (entities.length === 0) return 0;
    
    // Base confidence on number of high-quality entities
    const highQualityEntities = entities.filter(entity => 
      entity.salience >= 0.15 && 
      entity.sentiment.magnitude >= ENTITY_ANALYSIS_CONFIG.MIN_SENTIMENT_MAGNITUDE
    );
    
    const entityQualityScore = Math.min(100, (highQualityEntities.length / 3) * 100);
    const reviewQuantityScore = Math.min(100, (reviewCount / 5) * 100);
    
    // Weighted average
    return Math.round((entityQualityScore * 0.7) + (reviewQuantityScore * 0.3));
  }

  /**
   * Categorize entities by sentiment - ONLY POSITIVE ENTITIES
   */
  private categorizeEntitiesBySentiment(entities: EntityAnalysisResult[]): {
    positiveEntities: string[];
    negativeEntities: string[];
    neutralEntities: string[];
  } {
    const positiveEntities: string[] = [];
    const neutralEntities: string[] = [];

    entities.forEach(entity => {
      const sentimentScore = entity.sentiment.score;
      const magnitude = entity.sentiment.magnitude;
      
      if (magnitude >= ENTITY_ANALYSIS_CONFIG.MIN_SENTIMENT_MAGNITUDE) {
        if (sentimentScore > 0.2) {
          positiveEntities.push(entity.name);
        } else if (sentimentScore >= 0) {
          neutralEntities.push(entity.name);
        }
        // Skip negative entities entirely
      }
    });

    return {
      positiveEntities: positiveEntities.slice(0, 5),
      negativeEntities: [], // Never return negative entities
      neutralEntities: neutralEntities.slice(0, 5)
    };
  }

  /**
   * Get fallback mood analysis when entity analysis fails
   */
  private getFallbackMoodAnalysis(placeCategory: string): EntityMoodAnalysis {
    console.log('📝 Using fallback mood analysis');
    
    // Simple category-based fallback
    const categoryMoodMap: Record<string, { score: number; category: 'chill' | 'neutral' | 'hype' }> = {
      'restaurant': { score: 65, category: 'neutral' },
      'bar': { score: 75, category: 'hype' },
      'cafe': { score: 55, category: 'chill' },
      'nightclub': { score: 85, category: 'hype' },
      'spa': { score: 45, category: 'chill' },
      'gym': { score: 70, category: 'hype' }
    };

    const fallback = categoryMoodMap[placeCategory] || { score: 60, category: 'neutral' };

    return {
      moodScore: fallback.score,
      moodCategory: fallback.category,
      extractedDescriptors: [],
      confidence: 30,
      entityInsights: {
        positiveEntities: [],
        negativeEntities: [],
        neutralEntities: []
      }
    };
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(maxRetries: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
}

// Export utility functions for standalone use
export const entityMoodUtils = {
  /**
   * Get entity-enhanced mood labels for a category
   */
  getEntityMoodLabels: (category: 'chill' | 'neutral' | 'hype') => {
    return ENTITY_ENHANCED_MOOD_LABELS[category];
  },

  /**
   * Check if a word is a mood indicator
   */
  isMoodIndicator: (word: string, moodType: 'hype' | 'chill' | 'neutral'): boolean => {
    const keywords = ENTITY_ANALYSIS_CONFIG.MOOD_INDICATOR_KEYWORDS[moodType];
    return keywords.some(keyword => word.toLowerCase().includes(keyword));
  },

  /**
   * Get entity type weight
   */
  getEntityTypeWeight: (entityType: string): number => {
    return ENTITY_ANALYSIS_CONFIG.ENTITY_TYPE_WEIGHTS[entityType as keyof typeof ENTITY_ANALYSIS_CONFIG.ENTITY_TYPE_WEIGHTS] || 0.5;
  }
}; 