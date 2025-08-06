/**
 * Configuration file for the Place Mood System
 * This file contains all the configurable parameters for mood assignment
 */

// API Configuration
export const API_CONFIG = {
  // Rate limiting (milliseconds between requests)
  RATE_LIMIT_DELAY: 100,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Batch processing
  MAX_BATCH_SIZE: 20,
  
  // Timeout settings (milliseconds)
  REQUEST_TIMEOUT: 10000,
};

// Mood Score Ranges
export const MOOD_RANGES = {
  HYPE: { min: 70, max: 100 },
  NEUTRAL: { min: 31, max: 69 },
  CHILL: { min: 0, max: 30 }
};

// Enhanced mood labels with more variety
export const MOOD_LABELS = {
  chill: [
    'Relaxed', 'Low-Key', 'Cozy', 'Mellow', 'Calm',
    'Peaceful', 'Tranquil', 'Serene', 'Laid-back', 'Intimate'
  ],
  neutral: [
    'Balanced', 'Standard', 'Casual', 'Average', 'Steady',
    'Moderate', 'Regular', 'Comfortable', 'Decent', 'Typical'
  ],
  hype: [
    'Vibrant', 'Lively', 'Buzzing', 'Energetic', 'Electric',
    'Dynamic', 'Exciting', 'Thrilling', 'Pumping', 'Wild'
  ]
};

// Entity Analysis Enhanced Mood Labels
// These are extracted from actual review entities and provide more authentic descriptors
export const ENTITY_ENHANCED_MOOD_LABELS = {
  chill: {
    // Adjectives commonly found in reviews for chill places
    adjectives: [
      'cozy', 'peaceful', 'quiet', 'serene', 'tranquil', 'calm', 'relaxing',
      'intimate', 'romantic', 'charming', 'quaint', 'rustic', 'homely',
      'comfortable', 'welcoming', 'warm', 'gentle', 'soft', 'mellow',
      'laid-back', 'casual', 'unpretentious', 'simple', 'minimalist'
    ],
    // Nouns that indicate chill atmosphere
    nouns: [
      'oasis', 'retreat', 'sanctuary', 'haven', 'escape', 'hideaway',
      'nook', 'corner', 'spot', 'place', 'space', 'area', 'zone'
    ],
    // Phrases that suggest chill vibes
    phrases: [
      'perfect for', 'great for', 'ideal for', 'wonderful for',
      'amazing for', 'excellent for', 'fantastic for'
    ]
  },
  neutral: {
    // Adjectives for balanced, moderate places
    adjectives: [
      'decent', 'good', 'nice', 'pleasant', 'adequate', 'satisfactory',
      'reasonable', 'fair', 'standard', 'typical', 'normal', 'regular',
      'convenient', 'accessible', 'practical', 'functional', 'reliable'
    ],
    // Nouns for neutral places
    nouns: [
      'option', 'choice', 'alternative', 'place', 'spot', 'location',
      'venue', 'establishment', 'facility', 'service'
    ],
    // Phrases for neutral descriptions
    phrases: [
      'does the job', 'gets the job done', 'meets expectations',
      'satisfies needs', 'fulfills requirements', 'serves its purpose'
    ]
  },
  hype: {
    // Adjectives for energetic, exciting places
    adjectives: [
      'vibrant', 'lively', 'energetic', 'exciting', 'thrilling', 'amazing',
      'incredible', 'fantastic', 'awesome', 'electric', 'pumping', 'wild',
      'crazy', 'insane', 'intense', 'dynamic', 'bustling', 'happening',
      'trendy', 'hip', 'cool', 'popular', 'hot', 'buzzing', 'bustling'
    ],
    // Nouns for hype places
    nouns: [
      'spot', 'place', 'venue', 'destination', 'hotspot', 'scene',
      'atmosphere', 'vibe', 'energy', 'excitement', 'thrill'
    ],
    // Phrases for hype descriptions
    phrases: [
      'must visit', 'worth checking out', 'definitely go', 'highly recommend',
      'absolutely amazing', 'incredible experience', 'unforgettable'
    ]
  }
};

// Entity Analysis Configuration
export const ENTITY_ANALYSIS_CONFIG = {
  // Minimum salience score for entities to be considered
  MIN_SALIENCE: 0.1,
  
  // Minimum sentiment magnitude for entity sentiment to be considered
  MIN_SENTIMENT_MAGNITUDE: 0.3,
  
  // Entity types to focus on for mood analysis
  RELEVANT_ENTITY_TYPES: [
    'PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'WORK_OF_ART',
    'CONSUMER_GOOD', 'OTHER'
  ],
  
  // Keywords that indicate mood (ONLY POSITIVE KEYWORDS)
  MOOD_INDICATOR_KEYWORDS: {
    hype: [
      'amazing', 'incredible', 'fantastic', 'awesome', 'excellent',
      'outstanding', 'brilliant', 'perfect', 'wonderful', 'marvelous',
      'spectacular', 'phenomenal', 'extraordinary', 'exceptional',
      'electric', 'pumping', 'wild', 'crazy', 'insane', 'intense',
      'dynamic', 'bustling', 'happening', 'trendy', 'hip', 'cool',
      'popular', 'hot', 'buzzing', 'lively', 'energetic', 'exciting',
      'thrilling', 'vibrant'
    ],
    chill: [
      'peaceful', 'calm', 'quiet', 'serene', 'tranquil', 'relaxing',
      'soothing', 'gentle', 'soft', 'mellow', 'laid-back', 'casual',
      'cozy', 'intimate', 'romantic', 'charming', 'quaint', 'rustic',
      'homely', 'comfortable', 'welcoming', 'warm', 'unpretentious',
      'simple', 'minimalist', 'zen', 'blissful', 'meditative'
    ],
    neutral: [
      'decent', 'good', 'nice', 'pleasant', 'adequate', 'satisfactory',
      'reasonable', 'fair', 'standard', 'typical', 'normal', 'regular',
      'convenient', 'accessible', 'practical', 'functional', 'reliable',
      'solid', 'consistent', 'acceptable', 'fine', 'okay'
    ]
  },
  
  // Weight multipliers for different entity types
  ENTITY_TYPE_WEIGHTS: {
    'PERSON': 1.0,        // People mentioned in reviews
    'ORGANIZATION': 0.8,   // Business names, brands
    'LOCATION': 0.6,       // Place names, landmarks
    'EVENT': 1.2,          // Events, activities (higher weight)
    'WORK_OF_ART': 0.9,    // Creative works, performances
    'CONSUMER_GOOD': 0.7,  // Products, services
    'OTHER': 0.5           // Other entities
  },
  
  // Review text processing
  REVIEW_PROCESSING: {
    // Minimum review length to analyze
    MIN_REVIEW_LENGTH: 10,
    
    // Maximum reviews to analyze per place
    MAX_REVIEWS_TO_ANALYZE: 20,
    
    // Recent review weight multiplier (recent reviews count more)
    RECENT_REVIEW_WEIGHT: 1.5,
    
    // Older review weight multiplier
    OLD_REVIEW_WEIGHT: 0.8
  }
};

// Comprehensive category to mood mapping
export const CATEGORY_MOOD_MAPPING: Record<string, number> = {
  // Entertainment & Nightlife (High Hype: 80-95)
  'night_club': 92,
  'bar': 88,
  'casino': 90,
  'bowling_alley': 85,
  'amusement_park': 93,
  'stadium': 87,
  'movie_theater': 75,
  'concert_hall': 89,
  'dance_club': 94,
  
  // Active & Sports (Medium-High Hype: 70-85)
  'gym': 78,
  'sports_complex': 82,
  'swimming_pool': 76,
  'tennis_court': 74,
  'golf_course': 65,
  'rock_climbing_gym': 83,
  'martial_arts_school': 77,
  
  // Shopping & Commercial (Medium Hype: 60-75)
  'shopping_mall': 72,
  'department_store': 65,
  'electronics_store': 63,
  'clothing_store': 68,
  'jewelry_store': 58,
  'furniture_store': 55,
  'car_dealership': 62,
  
  // Food & Dining (Variable: 45-80)
  'restaurant': 60,
  'fast_food_restaurant': 55,
  'fine_dining_restaurant': 65,
  'pizza_place': 70,
  'sushi_restaurant': 58,
  'steakhouse': 67,
  'seafood_restaurant': 62,
  'vegetarian_restaurant': 52,
  'food_truck': 73,
  'rooftop_restaurant': 75,
  
  // Cafes & Casual Dining (Medium-Low: 35-55)
  'cafe': 45,
  'coffee_shop': 42,
  'bakery': 48,
  'ice_cream_shop': 52,
  'juice_bar': 46,
  'tea_house': 38,
  'breakfast_restaurant': 50,
  
  // Services & Professional (Low-Medium: 35-50)
  'bank': 35,
  'post_office': 32,
  'government_office': 28,
  'law_firm': 30,
  'accounting_firm': 33,
  'insurance_agency': 31,
  'real_estate_agency': 40,
  'travel_agency': 48,
  
  // Health & Wellness (Variable: 25-60)
  'hospital': 25,
  'pharmacy': 30,
  'dentist': 28,
  'veterinarian': 35,
  'spa': 40,
  'beauty_salon': 45,
  'massage_therapist': 38,
  'yoga_studio': 42,
  'meditation_center': 20,
  
  // Education & Culture (Low-Medium: 25-45)
  'school': 40,
  'university': 45,
  'library': 18,
  'museum': 35,
  'art_gallery': 38,
  'cultural_center': 42,
  'community_college': 43,
  
  // Religious & Spiritual (Very Low: 5-25)
  'church': 15,
  'mosque': 12,
  'temple': 14,
  'synagogue': 13,
  'monastery': 8,
  'meditation_retreat': 10,
  
  // Nature & Outdoor (Low-Medium: 20-50)
  'park': 35,
  'botanical_garden': 32,
  'zoo': 55,
  'aquarium': 48,
  'beach': 45,
  'hiking_trail': 40,
  'campground': 38,
  'scenic_lookout': 42,
  
  // Accommodation (Medium: 45-65)
  'hotel': 50,
  'resort': 65,
  'hostel': 58,
  'bed_and_breakfast': 45,
  'vacation_rental': 52,
  
  // Transportation (Low: 25-40)
  'airport': 35,
  'train_station': 38,
  'bus_station': 32,
  'subway_station': 30,
  'taxi_stand': 28,
  'parking_garage': 25,
  
  // Default fallback
  'establishment': 50,
  'point_of_interest': 45,
  'premise': 40
};

// Keywords that influence mood scoring with weights
export const MOOD_KEYWORDS = {
  hype: {
    // High impact keywords (weight: 4-5)
    'electric': 5, 'pumping': 5, 'wild': 5, 'crazy': 5, 'insane': 5,
    'amazing': 4, 'incredible': 4, 'fantastic': 4, 'awesome': 4,
    
    // Medium-high impact (weight: 3)
    'lively': 3, 'buzzing': 3, 'energetic': 3, 'vibrant': 3, 'exciting': 3,
    'dynamic': 3, 'thrilling': 3, 'intense': 3, 'active': 3, 'bustling': 3,
    
    // Medium impact (weight: 2)
    'fun': 2, 'upbeat': 2, 'happening': 2, 'loud': 2, 'crowded': 2,
    'party': 2, 'celebration': 2, 'festival': 2, 'event': 2,
    
    // Low impact (weight: 1)
    'busy': 1, 'popular': 1, 'trendy': 1, 'hip': 1, 'modern': 1
  },
  
  chill: {
    // High impact keywords (weight: 4-5)
    'zen': 5, 'tranquil': 5, 'serene': 5, 'meditative': 5, 'blissful': 5,
    'peaceful': 4, 'calming': 4, 'soothing': 4, 'relaxing': 4,
    
    // Medium-high impact (weight: 3)
    'quiet': 3, 'calm': 3, 'mellow': 3, 'cozy': 3, 'intimate': 3,
    'comfortable': 3, 'gentle': 3, 'soft': 3, 'warm': 3, 'romantic': 3,
    
    // Medium impact (weight: 2)
    'laid-back': 2, 'casual': 2, 'low-key': 2, 'private': 2, 'secluded': 2,
    'hidden': 2, 'tucked-away': 2, 'charming': 2, 'quaint': 2,
    
    // Low impact (weight: 1)
    'nice': 1, 'pleasant': 1, 'lovely': 1, 'pretty': 1, 'cute': 1
  },
  
  neutral: {
    // These keywords maintain neutral scoring (weight: 0-1)
    'normal': 0, 'average': 0, 'standard': 0, 'typical': 0, 'regular': 0,
    'ordinary': 0, 'decent': 1, 'okay': 1, 'fine': 1, 'acceptable': 1,
    'good': 1, 'solid': 1, 'reliable': 1, 'consistent': 1
  }
};

// Sentiment analysis weights
export const SENTIMENT_WEIGHTS = {
  // Base sentiment score multiplier
  SENTIMENT_MULTIPLIER: 15, // Max ±15 points from sentiment
  
  // Keyword impact
  KEYWORD_BASE_IMPACT: 2, // Base points per keyword
  KEYWORD_MAX_IMPACT: 20, // Maximum total keyword impact
  
  // Magnitude consideration
  MAGNITUDE_THRESHOLD: 0.5, // Minimum magnitude to consider sentiment
  MAGNITUDE_BOOST: 1.2, // Multiplier for high magnitude sentiment
};

// Busyness impact configuration
export const BUSYNESS_CONFIG = {
  // Thresholds for busyness levels
  LOW_BUSYNESS: 30,
  MEDIUM_BUSYNESS: 60,
  HIGH_BUSYNESS: 80,
  
  // Impact multipliers based on current mood
  HYPE_REINFORCEMENT: 0.15, // 15% boost for hype places when busy
  NEUTRAL_BOOST: 0.08, // 8% boost for neutral places when busy
  CHILL_CONTRADICTION: 0.05, // 5% boost for chill places when busy (contradiction)
  
  // Maximum busyness impact
  MAX_BUSYNESS_IMPACT: 15
};

// Review analysis configuration
export const REVIEW_CONFIG = {
  // Number of recent reviews to analyze
  MAX_REVIEWS_TO_ANALYZE: 15,
  
  // Minimum review length to consider
  MIN_REVIEW_LENGTH: 10,
  
  // Review recency weights (days)
  RECENCY_WEIGHTS: {
    VERY_RECENT: { days: 7, weight: 1.0 },   // Last week
    RECENT: { days: 30, weight: 0.8 },       // Last month
    MODERATE: { days: 90, weight: 0.6 },     // Last 3 months
    OLD: { days: 365, weight: 0.4 },         // Last year
    VERY_OLD: { days: Infinity, weight: 0.2 } // Older than a year
  }
};

// Error handling configuration
export const ERROR_CONFIG = {
  // Retry configuration for API calls
  MAX_API_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  EXPONENTIAL_BACKOFF: true,
  
  // Fallback values when APIs fail
  FALLBACK_SENTIMENT_SCORE: 0,
  FALLBACK_BUSYNESS: 50,
  FALLBACK_MOOD_SCORE: 50,
  
  // Timeout values
  PLACES_API_TIMEOUT: 10000,
  NATURAL_LANGUAGE_API_TIMEOUT: 15000
};

// Logging configuration
export const LOGGING_CONFIG = {
  // Log levels
  ENABLE_DEBUG_LOGS: true,
  ENABLE_PERFORMANCE_LOGS: true,
  ENABLE_ERROR_LOGS: true,
  
  // Log prefixes
  DEBUG_PREFIX: '🔍',
  INFO_PREFIX: '📍',
  WARNING_PREFIX: '⚠️',
  ERROR_PREFIX: '❌',
  SUCCESS_PREFIX: '✅',
  PERFORMANCE_PREFIX: '⏱️'
};

// Export utility functions for configuration
export const configUtils = {
  /**
   * Get mood range for a given category
   */
  getMoodRange: (category: 'chill' | 'neutral' | 'hype') => {
    return MOOD_RANGES[category.toUpperCase() as keyof typeof MOOD_RANGES];
  },

  /**
   * Check if a score falls within a mood category
   */
  isInMoodRange: (score: number, category: 'chill' | 'neutral' | 'hype'): boolean => {
    const range = configUtils.getMoodRange(category);
    return score >= range.min && score <= range.max;
  },

  /**
   * Get keyword weight for mood calculation
   */
  getKeywordWeight: (keyword: string, moodType: 'hype' | 'chill' | 'neutral'): number => {
    const keywords = MOOD_KEYWORDS[moodType];
    return keywords[keyword as keyof typeof keywords] || 0;
  },

  /**
   * Get baseline mood score for a place category
   */
  getBaselineMoodScore: (category: string): number => {
    return CATEGORY_MOOD_MAPPING[category] || CATEGORY_MOOD_MAPPING['establishment'];
  },

  /**
   * Validate mood score is within acceptable range
   */
  validateMoodScore: (score: number): boolean => {
    return score >= 0 && score <= 100 && !isNaN(score);
  }
};