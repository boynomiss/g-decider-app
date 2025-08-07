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
    atmosphereKeywords: ['peaceful', 'relaxing', 'calm', 'tranquil', 'serene'],
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
    atmosphereKeywords: ['balanced', 'moderate', 'casual', 'comfortable', 'versatile'],
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
    atmosphereKeywords: ['energetic', 'exciting', 'lively', 'thrilling', 'dynamic'],
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