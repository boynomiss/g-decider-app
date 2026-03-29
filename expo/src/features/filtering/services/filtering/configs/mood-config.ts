// Mood Configuration - Consolidated Settings
// This file contains all mood-related configurations used across the application

export interface MoodCategory {
  id: 'chill' | 'neutral' | 'hype';
  label: string;
  icon: string;
  scoreRange: { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  socialCompatibility: ('solo' | 'with-bae' | 'barkada')[];
  budgetPreferences: ('P' | 'PP' | 'PPP')[];
  timeCompatibility: ('morning' | 'afternoon' | 'night')[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  energyLevel: 'low' | 'medium' | 'high';
  colorScheme: string;
}

// Single consolidated mood configuration
export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'chill',
    label: 'Chill',
    icon: '😌',
    scoreRange: { min: 0, max: 33.33 },
    description: 'Relaxed and peaceful activities',
    preferredPlaceTypes: [
      'restaurant', 'cafe', 'bar', 'bakery', 'park', 'museum', 'art_gallery', 'movie_theater', 
      'spa', 'zoo', 'aquarium', 'golf_course', 'swimming_pool', 'book_store', 'library', 
      'florist', 'pet_store', 'hair_care', 'beauty_salon', 'hindu_temple', 'church', 
      'mosque', 'synagogue', 'rv_park', 'campground'
    ],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Peaceful cafe reading', 'Museum exploration', 'Park meditation', 
      'Spa relaxation', 'Library study session', 'Art gallery visit'
    ],
    atmosphereKeywords: [
      'peaceful', 'relaxing', 'calm', 'tranquil', 'serene', 'quiet', 'gentle', 'soft',
      'soothing', 'mellow', 'zen', 'meditative', 'contemplative', 'introspective',
      'low-key', 'laid-back', 'easygoing', 'unhurried', 'leisurely', 'restful',
      'cozy', 'intimate', 'warm', 'welcoming', 'comforting', 'nurturing',
      'stress-free', 'unwinding', 'de-stressing', 'mindful', 'centered', 'grounded',
      'peaceful atmosphere', 'relaxation spot', 'quiet space', 'tranquil setting',
      'serene environment', 'calming vibes', 'soothing atmosphere', 'gentle ambiance'
    ],
    energyLevel: 'low',
    colorScheme: 'blue-green'
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: '😐',
    scoreRange: { min: 33.34, max: 66.66 },
    description: 'Balanced and moderate activities',
    preferredPlaceTypes: [
      'restaurant', 'cafe', 'bakery', 'food', 'meal_delivery', 'meal_takeaway', 'liquor_store', 
      'convenience_store', 'supermarket', 'park', 'museum', 'art_gallery', 'gym', 'bowling_alley', 
      'zoo', 'aquarium', 'swimming_pool', 'tourist_attraction', 'shopping_mall', 'clothing_store', 
      'shoe_store', 'department_store', 'electronics_store', 'home_goods_store', 'hardware_store', 
      'jewelry_store', 'sporting_goods_store', 'bicycle_store', 'hair_care', 'beauty_salon', 'university'
    ],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Casual dining', 'Shopping trip', 'Gym workout', 'Movie watching', 
      'Park walk', 'Museum visit', 'Cafe hangout'
    ],
    atmosphereKeywords: [
      'balanced', 'moderate', 'casual', 'comfortable', 'versatile', 'pleasant', 'nice',
      'decent', 'good', 'okay', 'fine', 'average', 'standard', 'conventional',
      'friendly', 'approachable', 'accessible', 'practical', 'functional', 'reliable',
      'steady', 'stable', 'consistent', 'predictable', 'familiar', 'everyday',
      'normal', 'regular', 'routine', 'convenient', 'straightforward', 'simple',
      'well-rounded', 'middle-ground', 'moderate energy', 'casual atmosphere',
      'comfortable setting', 'versatile space', 'pleasant environment', 'nice vibe',
      'decent atmosphere', 'good energy', 'okay vibes', 'fine atmosphere',
      'average energy', 'standard setting', 'conventional atmosphere'
    ],
    energyLevel: 'medium',
    colorScheme: 'yellow-orange'
  },
  {
    id: 'hype',
    label: 'Hype',
    icon: '🔥',
    scoreRange: { min: 66.67, max: 100 },
    description: 'Energetic and exciting activities',
    preferredPlaceTypes: [
      'restaurant', 'bar', 'night_club', 'stadium', 'casino', 'gym', 'bowling_alley', 
      'amusement_park', 'skate_park', 'playground', 'tourist_attraction', 'shopping_mall'
    ],
    socialCompatibility: ['with-bae', 'barkada'],
    budgetPreferences: ['PP', 'PPP'],
    timeCompatibility: ['afternoon', 'night'],
    activitySuggestions: [
      'Nightclub dancing', 'Sports game', 'Amusement park', 'Bowling night', 
      'Bar hopping', 'Casino games', 'Skateboarding'
    ],
    atmosphereKeywords: [
      'energetic', 'exciting', 'lively', 'thrilling', 'dynamic', 'vibrant', 'buzzing',
      'electric', 'amazing', 'incredible', 'fantastic', 'awesome', 'epic', 'legendary',
      'intense', 'powerful', 'strong', 'bold', 'daring', 'adventurous', 'wild',
      'crazy', 'insane', 'mental', 'outrageous', 'extreme', 'radical',
      'pumping', 'jumping', 'bouncing', 'rocking', 'rolling', 'flying', 'soaring',
      'high-energy', 'fast-paced', 'action-packed', 'adrenaline-pumping', 'heart-pounding',
      'mind-blowing', 'jaw-dropping', 'show-stopping', 'crowd-pleasing', 'party atmosphere'
    ],
    energyLevel: 'high',
    colorScheme: 'red-pink'
  }
] as const;

// Detailed mood labels for slider (10 levels)
export const MOOD_DETAILED_LABELS = {
  1: { emoji: '😌', text: 'Chill' },
  2: { emoji: '🧘‍♀️', text: 'Zen' },
  3: { emoji: '☕', text: 'Mellow' },
  4: { emoji: '🏞️', text: 'Tranquil' },
  5: { emoji: '👀', text: 'Eager' },
  6: { emoji: '🎶', text: 'Upbeat' },
  7: { emoji: '🥳', text: 'Lively' },
  8: { emoji: '💪', text: 'Pumped' },
  9: { emoji: '🤩', text: 'Thrilled' },
  10: { emoji: '🔥', text: 'Hype' }
} as const;

// Utility functions for mood calculations
export class MoodUtils {
  /**
   * Get mood category from mood score
   */
  static getMoodCategory(moodScore: number): MoodCategory | undefined {
    return MOOD_CATEGORIES.find(category => 
      moodScore >= category.scoreRange.min && moodScore <= category.scoreRange.max
    );
  }

  /**
   * Check if place is compatible with mood
   */
  static isPlaceCompatibleWithMood(place: any, moodScore: number): boolean {
    if (!place.types) return true;
    
    const moodCategory = MoodUtils.getMoodCategory(moodScore);
    if (!moodCategory) return true;
    
    return place.types.some((type: string) => 
      moodCategory.preferredPlaceTypes.includes(type)
    );
  }

  /**
   * Get mood label for logging
   */
  static getMoodLabel(moodScore: number): string {
    const category = this.getMoodCategory(moodScore);
    return category ? category.label : 'Unknown Mood';
  }

  /**
   * Get mood display text with icon
   */
  static getMoodDisplayText(moodScore: number): string {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? `${category.icon} ${category.label}` : 'Unknown Mood';
  }

  /**
   * Get detailed mood label for UI components
   */
  static getDetailedMoodLabel(moodScore: number): { emoji: string; text: string } {
    const level = Math.max(1, Math.min(10, Math.round((moodScore / 100) * 10) || 1));
    return MOOD_DETAILED_LABELS[level as keyof typeof MOOD_DETAILED_LABELS];
  }

  /**
   * Get preferred place types for mood
   */
  static getPreferredPlaceTypes(moodScore: number): string[] {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? category.preferredPlaceTypes : [];
  }

  /**
   * Validate mood score is within acceptable values
   */
  static validateMoodScore(moodScore: number): boolean {
    return moodScore >= 0 && moodScore <= 100;
  }

  /**
   * Get all mood categories for UI rendering
   */
  static getAllMoodCategories(): MoodCategory[] {
    return [...MOOD_CATEGORIES];
  }

  /**
   * Get mood mappings for discovery logic
   */
  static getMoodMappings() {
    return MOOD_CATEGORIES.map(category => ({
      id: category.id,
      label: category.label,
      description: category.description,
      preferredTypes: category.preferredPlaceTypes,
      energyLevel: category.energyLevel
    }));
  }

  /**
   * Get mood mappings for API calls
   */
  static getMoodMappingsForAPI() {
    return MOOD_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = category.preferredPlaceTypes;
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * Get mood context for AI descriptions
   */
  static getMoodContext(moodScore: number): string {
    const category = MoodUtils.getMoodCategory(moodScore);
    if (!category) return 'any mood';
    
    const moodMap = {
      'chill': 'relaxed/peaceful',
      'neutral': 'balanced/moderate',
      'hype': 'energetic/exciting'
    };
    return moodMap[category.id] || 'any mood';
  }

  /**
   * Get energy level for mood
   */
  static getEnergyLevel(moodScore: number): 'low' | 'medium' | 'high' | null {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? category.energyLevel : null;
  }

  /**
   * Check if mood is compatible with social context
   */
  static isCompatibleWithSocialContext(moodScore: number, socialContext: string | null): boolean {
    if (!socialContext) return true;
    
    const moodCategory = MoodUtils.getMoodCategory(moodScore);
    if (!moodCategory) return true;
    
    return moodCategory.socialCompatibility.includes(socialContext as any);
  }

  /**
   * Get activity suggestions for mood
   */
  static getActivitySuggestions(moodScore: number): string[] {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? category.activitySuggestions : [];
  }

  /**
   * Get atmosphere keywords for mood
   */
  static getAtmosphereKeywords(moodScore: number): string[] {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? category.atmosphereKeywords : [];
  }

  /**
   * Get color scheme for mood
   */
  static getColorScheme(moodScore: number): string | null {
    const category = MoodUtils.getMoodCategory(moodScore);
    return category ? category.colorScheme : null;
  }

  /**
   * Convert mood score to category ID
   */
  static getMoodCategoryId(moodScore: number): 'chill' | 'neutral' | 'hype' {
    if (moodScore <= 33.33) return 'chill';
    if (moodScore <= 66.66) return 'neutral';
    return 'hype';
  }

  /**
   * Get mood score range for category
   */
  static getMoodScoreRange(categoryId: string): { min: number; max: number } | null {
    const category = MOOD_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.scoreRange : null;
  }
}

// Export for backward compatibility
export const moodCategories = MOOD_CATEGORIES;

// Derived exports for backward compatibility
export const moodOptions = MOOD_CATEGORIES.map(category => ({
  id: category.id,
  label: category.label,
  icon: category.icon,
  scoreRange: category.scoreRange,
  description: category.description,
  preferredTypes: category.preferredPlaceTypes
}));

// Export utility functions for backward compatibility
export const getMoodCategory = MoodUtils.getMoodCategory;
export const isPlaceCompatibleWithMood = MoodUtils.isPlaceCompatibleWithMood;
export const getMoodLabel = MoodUtils.getMoodLabel;
export const getMoodDisplayText = MoodUtils.getMoodDisplayText;
export const getDetailedMoodLabel = MoodUtils.getDetailedMoodLabel;
export const getPreferredPlaceTypes = MoodUtils.getPreferredPlaceTypes;
export const validateMoodScore = MoodUtils.validateMoodScore;
export const getAllMoodCategories = MoodUtils.getAllMoodCategories;
export const getMoodMappings = MoodUtils.getMoodMappings;
export const getMoodMappingsForAPI = MoodUtils.getMoodMappingsForAPI;
export const getMoodContext = MoodUtils.getMoodContext;
export const getEnergyLevel = MoodUtils.getEnergyLevel;
export const isCompatibleWithSocialContext = MoodUtils.isCompatibleWithSocialContext;
export const getActivitySuggestions = MoodUtils.getActivitySuggestions;
export const getAtmosphereKeywords = MoodUtils.getAtmosphereKeywords;
export const getColorScheme = MoodUtils.getColorScheme;
export const getMoodCategoryId = MoodUtils.getMoodCategoryId;
export const getMoodScoreRange = MoodUtils.getMoodScoreRange;

// Entity Enhanced Mood System Constants
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
  
  // Mood indicator keywords for different mood types
  MOOD_INDICATOR_KEYWORDS: {
    hype: ['amazing', 'incredible', 'electric', 'vibrant', 'energetic', 'lively', 'exciting', 'buzzing'],
    chill: ['peaceful', 'relaxing', 'calm', 'serene', 'tranquil', 'quiet', 'cozy', 'mellow'],
    neutral: ['pleasant', 'comfortable', 'nice', 'decent', 'good', 'okay', 'fine', 'average']
  }
};

export const MOOD_RANGES = {
  CHILL: { min: 0, max: 33.33 },
  NEUTRAL: { min: 33.34, max: 66.66 },
  HYPE: { min: 66.67, max: 100 }
};

export const ENTITY_ENHANCED_MOOD_LABELS = {
  chill: {
    adjectives: ['Relaxed', 'Low-Key', 'Cozy', 'Mellow', 'Calm', 'Peaceful', 'Serene', 'Tranquil'],
    nouns: ['peace', 'calm', 'relaxation', 'serenity', 'comfort', 'coziness'],
    phrases: ['peaceful atmosphere', 'relaxed vibe', 'calm environment', 'tranquil setting']
  },
  neutral: {
    adjectives: ['Pleasant', 'Comfortable', 'Casual', 'Inviting', 'Friendly', 'Nice', 'Decent'],
    nouns: ['comfort', 'friendliness', 'pleasantness', 'hospitality'],
    phrases: ['pleasant experience', 'comfortable setting', 'friendly atmosphere', 'inviting space']
  },
  hype: {
    adjectives: ['Vibrant', 'Lively', 'Buzzing', 'Energetic', 'Electric', 'Amazing', 'Incredible'],
    nouns: ['energy', 'excitement', 'vibrancy', 'electricity', 'buzz', 'thrill'],
    phrases: ['electric atmosphere', 'vibrant energy', 'buzzing crowd', 'lively scene']
  }
};

// Category to mood mapping - moved from place-mood-service for centralization
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
  'aquarium': 71,
  
  // Neutral (40-64)
  'restaurant': 55,
  'store': 50,
  'school': 45,
  'hospital': 40,
  'bank': 42,
  'post_office': 43,
  'gas_station': 45,
  'pharmacy': 48,
  'supermarket': 52,
  
  // Low-Medium Chill (25-39)
  'cafe': 35,
  'book_store': 25,
  'library': 20,
  'museum': 30,
  'art_gallery': 32,
  'park': 38,
  'church': 28,
  'spa': 25,
  
  // Default for unknown categories
  'establishment': 50
};