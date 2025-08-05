// React Native compatible implementation - using REST API instead of SDK
import { googlePlacesClient, googleNaturalLanguageClient } from './google-api-clients';

// Types for the enhanced place discovery system
export interface PlaceData {
  place_id: string;
  name: string;
  address: string;
  category: string;
  user_ratings_total: number;
  rating: number;
  reviews: Review[];
  popular_times?: PopularTimes[];
  current_busyness?: number;
  mood_score?: number;
  final_mood?: string;
  // Enhanced image data - structured for frontend consumption
  photos?: {
    thumbnail: string[];
    medium: string[];
    large: string[];
    count: number;
  };
  // Legacy support
  images?: {
    urls: string[];
    metadata?: {
      totalImages: number;
      authenticImages: number;
      averageConfidence: number;
      sources: string[];
    };
  };
  // Additional fields needed for proper display
  vicinity?: string;
  formatted_address?: string;
  location?: { lat: number; lng: number };
  types?: string[];
  photos?: any[];
  price_level?: number;
  website?: string;
  phone?: string;
  opening_hours?: any;
  geometry?: any;
  description?: string;
  // Enhanced contact information - structured for frontend consumption
  contact?: {
    website?: string;
    phone?: string;
    formattedPhone?: string;
    internationalPhone?: string;
    email?: string;
    hasContact: boolean;
  };
  // Contact actions for frontend
  contactActions?: {
    canCall: boolean;
    canVisitWebsite: boolean;
    callUrl?: string;
    websiteUrl?: string;
  };
  // Additional enhanced fields
  business_status?: string;
  editorial_summary?: string;
}

export interface Review {
  text: string;
  rating: number;
  time: number;
}

export interface PopularTimes {
  day: number;
  data: Array<{
    hour: number;
    busyness: number;
  }>;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to infinity (intensity)
  keywords: string[];
  entities: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
}

export interface MoodConfig {
  chill: string[];
  neutral: string[];
  hype: string[];
}

// Enhanced mood labels
export const MOOD_LABELS: MoodConfig = {
  chill: ['Relaxed', 'Low-Key', 'Cozy', 'Mellow', 'Calm'],
  neutral: ['Pleasant', 'Comfortable', 'Casual', 'Inviting', 'Friendly'],
  hype: ['Vibrant', 'Lively', 'Buzzing', 'Energetic', 'Electric']
};

// Baseline mood mapping for Google Places categories
export const CATEGORY_MOOD_MAPPING: Record<string, number> = {
  // High Hype (80-100)
  'night_club': 90,
  'bar': 85,
  'amusement_park': 88,
  'bowling_alley': 82,
  'casino': 87,
  'stadium': 85,
  
  // Medium-High Hype (65-79)
  'shopping_mall': 70,
  'movie_theater': 68,
  'gym': 72,
  'tourist_attraction': 75,
  'zoo': 73,
  
  // Neutral (40-64)
  'restaurant': 50,
  'store': 45,
  'gas_station': 40,
  'bank': 42,
  'post_office': 41,
  'hospital': 35,
  
  // Medium-Low Chill (25-39)
  'cafe': 30,
  'bakery': 32,
  'book_store': 28,
  'florist': 35,
  'art_gallery': 33,
  
  // High Chill (0-24)
  'library': 15,
  'church': 10,
  'cemetery': 5,
  'spa': 20,
  'park': 22,
  'museum': 18
};

// Keywords that influence mood scoring
export const MOOD_KEYWORDS = {
  hype: [
    'lively', 'buzzing', 'energetic', 'vibrant', 'exciting', 'electric',
    'loud', 'crowded', 'party', 'fun', 'upbeat', 'dynamic', 'active',
    'bustling', 'happening', 'wild', 'crazy', 'intense', 'pumping'
  ],
  chill: [
    'quiet', 'peaceful', 'relaxed', 'calm', 'cozy', 'intimate', 'serene',
    'tranquil', 'mellow', 'laid-back', 'comfortable', 'soothing', 'gentle',
    'soft', 'warm', 'romantic', 'private', 'secluded', 'zen'
  ],
  neutral: [
    'normal', 'average', 'standard', 'typical', 'regular', 'ordinary',
    'balanced', 'moderate', 'decent', 'okay', 'fine', 'acceptable'
  ]
};

export class PlaceMoodService {
  private googlePlacesApiKey: string;
  private googleNaturalLanguageApiKey: string;

  constructor(googlePlacesApiKey: string, googleNaturalLanguageApiKey?: string) {
    this.googlePlacesApiKey = googlePlacesApiKey;
    this.googleNaturalLanguageApiKey = googleNaturalLanguageApiKey || '';
  }

  /**
   * Main function to collect and enhance place data with mood assignment
   */
  async enhancePlaceWithMood(placeId: string): Promise<PlaceData> {
    try {
      console.log(`🔍 Starting mood analysis for place: ${placeId}`);
      
      // Step 1: Get core place data from Google Places API
      const coreData = await this.getCorePlaceData(placeId);
      console.log(`📍 Core data collected for: ${coreData.name}`);
      
      // Step 2: Get real-time data (popular times, current busyness)
      const realTimeData = await this.getRealTimeData(placeId);
      console.log(`⏰ Real-time data collected: busyness ${realTimeData.current_busyness || 'N/A'}`);
      
      // Step 3: Perform sentiment analysis on reviews
      const sentimentData = await this.analyzeSentiment(coreData.reviews || []);
      console.log(`💭 Sentiment analysis complete: score ${sentimentData.score.toFixed(2)}`);
      
      // Step 4: Calculate mood score
      const moodScore = this.calculateMoodScore(coreData, sentimentData, realTimeData);
      console.log(`🎯 Mood score calculated: ${moodScore}`);
      
      // Step 5: Assign final descriptive mood
      const finalMood = this.assignFinalMood(moodScore);
      console.log(`🎭 Final mood assigned: ${finalMood}`);
      
      // Combine all data
      const enhancedPlace: PlaceData = {
        place_id: coreData.place_id || placeId,
        name: coreData.name || 'Unknown Place',
        address: coreData.address || 'Unknown Address',
        category: coreData.category || 'establishment',
        user_ratings_total: coreData.user_ratings_total || 0,
        rating: coreData.rating || 0,
        reviews: coreData.reviews || [],
        ...realTimeData,
        mood_score: moodScore,
        final_mood: finalMood
      };
      
      return enhancedPlace;
      
    } catch (error) {
      console.error(`❌ Error enhancing place ${placeId}:`, error);
      throw error;
    }
  }

  /**
   * Step 1: Collect core place data from Google Places API (New)
   */
  private async getCorePlaceData(placeId: string): Promise<Partial<PlaceData>> {
    try {
      // Use the centralized Google Places client
      const place = await googlePlacesClient.getPlace(placeId, [
        'id', 'displayName', 'formattedAddress', 'types', 'userRatingCount', 'rating', 'reviews'
      ]);
      
      return {
        place_id: place.id,
        name: place.displayName?.text || place.displayName,
        address: place.formattedAddress,
        category: place.types?.[0] || 'establishment',
        user_ratings_total: place.userRatingCount || 0,
        rating: place.rating || 0,
        reviews: place.reviews?.map((review: any) => ({
          text: review.text?.text || review.text,
          rating: review.rating,
          time: new Date(review.publishTime).getTime() / 1000 // Convert to Unix timestamp
        })) || []
      };
      
    } catch (error) {
      console.error('Error fetching core place data (New API):', error);
      throw error;
    }
  }

  /**
   * Step 2: Get real-time data (popular times, current busyness)
   */
  private async getRealTimeData(placeId: string): Promise<Partial<PlaceData>> {
    // Note: Google Places API doesn't directly provide popular times in the standard API
    // This would typically require a third-party service or web scraping
    // For now, we'll simulate this data or use alternative methods
    
    try {
      // Placeholder for real-time data collection
      // In a real implementation, you might use:
      // 1. A third-party service like PopularTimes API
      // 2. Web scraping Google Maps
      // 3. Historical data analysis
      
      const simulatedBusyness = Math.floor(Math.random() * 100);
      
      return {
        current_busyness: simulatedBusyness,
        popular_times: [] // Would be populated with real data
      };
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return {
        current_busyness: undefined,
        popular_times: []
      };
    }
  }

  /**
   * Step 3: Perform sentiment analysis using Google Natural Language API
   */
  private async analyzeSentiment(reviews: Review[]): Promise<SentimentAnalysis> {
    if (!reviews || reviews.length === 0) {
      return {
        score: 0,
        magnitude: 0,
        keywords: [],
        entities: []
      };
    }

    try {
      // Combine recent reviews (last 10) for analysis
      const recentReviews = reviews
        .sort((a, b) => b.time - a.time)
        .slice(0, 10)
        .map(review => review.text)
        .join(' ');

      // Extract mood-relevant keywords first (doesn't require API)
      const keywords = this.extractMoodKeywords(recentReviews);

      // If no Natural Language API key, use keyword-based sentiment analysis
      if (!this.googleNaturalLanguageApiKey) {
        console.log('📝 Using keyword-based sentiment analysis (no API key provided)');
        const keywordSentiment = this.analyzeKeywordSentiment(keywords);
        return {
          score: keywordSentiment.score,
          magnitude: keywordSentiment.magnitude,
          keywords,
          entities: []
        };
      }

      // Use the centralized Google Natural Language client
      const sentimentData = await googleNaturalLanguageClient.analyzeSentiment(recentReviews);

      // Analyze entities (optional, can fail gracefully)
      let entities: any[] = [];
      try {
        const entitiesData = await googleNaturalLanguageClient.analyzeEntities(recentReviews);
        entities = entitiesData.entities || [];
      } catch (entityError) {
        console.warn('Entity analysis failed, continuing without entities:', entityError);
      }

      return {
        score: sentimentData.documentSentiment?.score || 0,
        magnitude: sentimentData.documentSentiment?.magnitude || 0,
        keywords,
        entities: entities.map((entity: any) => ({
          name: entity.name || '',
          type: entity.type || '',
          salience: entity.salience || 0
        }))
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      
      // Fallback to keyword-based analysis
      const recentReviews = reviews
        .sort((a, b) => b.time - a.time)
        .slice(0, 10)
        .map(review => review.text)
        .join(' ');
      
      const keywords = this.extractMoodKeywords(recentReviews);
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
   * Extract mood-relevant keywords from text
   */
  private extractMoodKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];

    // Check for hype keywords
    MOOD_KEYWORDS.hype.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    // Check for chill keywords
    MOOD_KEYWORDS.chill.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    // Check for neutral keywords
    MOOD_KEYWORDS.neutral.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords;
  }

  /**
   * Fallback keyword-based sentiment analysis
   */
  private analyzeKeywordSentiment(keywords: string[]): { score: number; magnitude: number } {
    let positiveCount = 0;
    let negativeCount = 0;
    
    keywords.forEach(keyword => {
      if (MOOD_KEYWORDS.hype.includes(keyword.toLowerCase())) {
        positiveCount++;
      } else if (MOOD_KEYWORDS.chill.includes(keyword.toLowerCase())) {
        // Chill keywords are generally positive but calm
        positiveCount += 0.5;
      }
      
      // Add negative keyword detection if needed
      const negativeWords = ['bad', 'terrible', 'awful', 'disappointing', 'poor', 'worst'];
      if (negativeWords.includes(keyword.toLowerCase())) {
        negativeCount++;
      }
    });
    
    const totalKeywords = keywords.length || 1;
    const score = (positiveCount - negativeCount) / totalKeywords;
    const magnitude = (positiveCount + negativeCount) / totalKeywords;
    
    // Clamp score to -1 to 1 range
    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: Math.max(0, Math.min(1, magnitude))
    };
  }

  /**
   * Step 4: Calculate mood score based on all collected data
   */
  private calculateMoodScore(
    coreData: Partial<PlaceData>,
    sentimentData: SentimentAnalysis,
    realTimeData: Partial<PlaceData>
  ): number {
    // Start with baseline mood from category
    let moodScore = CATEGORY_MOOD_MAPPING[coreData.category || 'establishment'] || 50;
    
    console.log(`🏗️ Baseline mood from category '${coreData.category}': ${moodScore}`);

    // Adjust based on sentiment analysis
    const sentimentAdjustment = this.calculateSentimentAdjustment(sentimentData);
    moodScore += sentimentAdjustment;
    
    console.log(`💭 After sentiment adjustment (+${sentimentAdjustment}): ${moodScore}`);

    // Adjust based on real-time busyness
    const busynessAdjustment = this.calculateBusynessAdjustment(
      realTimeData.current_busyness || 0,
      moodScore
    );
    moodScore += busynessAdjustment;
    
    console.log(`📊 After busyness adjustment (+${busynessAdjustment}): ${moodScore}`);

    // Ensure score stays within bounds (0-100)
    moodScore = Math.max(0, Math.min(100, moodScore));
    
    return Math.round(moodScore);
  }

  /**
   * Calculate sentiment-based mood adjustment
   */
  private calculateSentimentAdjustment(sentimentData: SentimentAnalysis): number {
    let adjustment = 0;

    // Sentiment score adjustment (-1 to 1 scale)
    adjustment += sentimentData.score * 15; // Max ±15 points

    // Keyword-based adjustment
    const hypeKeywords = sentimentData.keywords.filter(k => 
      MOOD_KEYWORDS.hype.includes(k)
    ).length;
    
    const chillKeywords = sentimentData.keywords.filter(k => 
      MOOD_KEYWORDS.chill.includes(k)
    ).length;

    // Each hype keyword adds points, each chill keyword subtracts
    adjustment += (hypeKeywords * 3) - (chillKeywords * 3);

    return Math.round(adjustment);
  }

  /**
   * Calculate busyness-based mood adjustment
   */
  private calculateBusynessAdjustment(busyness: number, currentMoodScore: number): number {
    if (busyness === 0) return 0;

    // High busyness reinforces extreme moods
    if (currentMoodScore > 70) {
      // High mood + high busyness = more hype
      return Math.round((busyness / 100) * 10);
    } else if (currentMoodScore < 30) {
      // Low mood + high busyness = contradiction, moderate the chill
      return Math.round((busyness / 100) * 5);
    } else {
      // Neutral mood + high busyness = slight hype increase
      return Math.round((busyness / 100) * 3);
    }
  }

  /**
   * Step 5: Assign final descriptive mood based on score
   */
  private assignFinalMood(moodScore: number): string {
    if (moodScore >= 70) {
      // Hype moods
      const hypeIndex = Math.floor((moodScore - 70) / 6); // 0-4 range
      return MOOD_LABELS.hype[Math.min(hypeIndex, MOOD_LABELS.hype.length - 1)];
    } else if (moodScore <= 30) {
      // Chill moods
      const chillIndex = Math.floor((30 - moodScore) / 6); // 0-4 range
      return MOOD_LABELS.chill[Math.min(chillIndex, MOOD_LABELS.chill.length - 1)];
    } else {
      // Neutral moods
      const neutralIndex = Math.floor((moodScore - 31) / 8); // 0-4 range
      return MOOD_LABELS.neutral[Math.min(neutralIndex, MOOD_LABELS.neutral.length - 1)];
    }
  }

  /**
   * Batch process multiple places
   */
  async enhanceMultiplePlaces(placeIds: string[]): Promise<PlaceData[]> {
    console.log(`🔄 Starting batch processing of ${placeIds.length} places`);
    
    const results: PlaceData[] = [];
    
    for (let i = 0; i < placeIds.length; i++) {
      const placeId = placeIds[i];
      
      try {
        console.log(`📍 Processing place ${i + 1}/${placeIds.length}: ${placeId}`);
        const enhancedPlace = await this.enhancePlaceWithMood(placeId);
        results.push(enhancedPlace);
        
        // Add delay to respect API rate limits
        if (i < placeIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Failed to process place ${placeId}:`, error);
        // Continue with next place
      }
    }
    
    console.log(`✅ Batch processing complete. Successfully processed ${results.length}/${placeIds.length} places`);
    return results;
  }

  /**
   * Get mood statistics for a set of places
   */
  getMoodStatistics(places: PlaceData[]): {
    total: number;
    chill: number;
    neutral: number;
    hype: number;
    averageScore: number;
  } {
    const stats = {
      total: places.length,
      chill: 0,
      neutral: 0,
      hype: 0,
      averageScore: 0
    };

    let totalScore = 0;

    places.forEach(place => {
      if (place.mood_score !== undefined) {
        totalScore += place.mood_score;
        
        if (place.mood_score >= 70) {
          stats.hype++;
        } else if (place.mood_score <= 30) {
          stats.chill++;
        } else {
          stats.neutral++;
        }
      }
    });

    stats.averageScore = Math.round(totalScore / places.length);

    return stats;
  }
}

// Export utility functions for standalone use
export const moodUtils = {
  /**
   * Get mood category from score
   */
  getMoodCategory: (score: number): 'chill' | 'neutral' | 'hype' => {
    if (score >= 70) return 'hype';
    if (score <= 30) return 'chill';
    return 'neutral';
  },

  /**
   * Get random mood label for category
   */
  getRandomMoodLabel: (category: 'chill' | 'neutral' | 'hype'): string => {
    const labels = MOOD_LABELS[category];
    return labels[Math.floor(Math.random() * labels.length)];
  },

  /**
   * Validate mood score
   */
  validateMoodScore: (score: number): boolean => {
    return score >= 0 && score <= 100;
  }
};