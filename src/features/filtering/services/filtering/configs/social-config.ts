// Social Context Configuration - Consolidated Settings
// This file contains all social context-related configurations used across the application

export interface SocialContext {
  id: 'solo' | 'with-bae' | 'barkada';
  label: string;
  icon: string;
  groupSize: number | { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: ('chill' | 'neutral' | 'hype')[];
  budgetPreferences: ('P' | 'PP' | 'PPP')[];
  timeCompatibility: ('morning' | 'afternoon' | 'night')[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
}

// Single consolidated social context configuration
export const SOCIAL_CONTEXTS: SocialContext[] = [
  {
    id: 'solo',
    label: 'Solo',
    icon: '🧍',
    groupSize: 1,
    description: 'Individual activities and quiet spaces',
    preferredPlaceTypes: [
      'cafe', 'bakery', 'food', 'meal_takeaway', 'park', 'museum', 'art_gallery', 
      'library', 'book_store', 'gym', 'spa', 'golf_course', 'swimming_pool', 
      'zoo', 'aquarium', 'university', 'hair_care', 'beauty_salon', 'supermarket', 
      'liquor_store', 'convenience_store'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Reading at a cozy cafe', 'Museum exploration', 'Park meditation', 
      'Gym workout', 'Spa relaxation', 'Library study session'
    ],
    atmosphereKeywords: ['quiet', 'peaceful', 'introspective', 'relaxing', 'focused']
  },
  {
    id: 'with-bae',
    label: 'With Bae',
    icon: '❤️',
    groupSize: 2,
    description: 'Romantic activities for couples',
    preferredPlaceTypes: [
      'restaurant', 'cafe', 'movie_theater', 'park', 'spa', 'art_gallery', 
      'museum', 'zoo', 'aquarium', 'tourist_attraction', 'shopping_mall'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    budgetPreferences: ['PP', 'PPP'],
    timeCompatibility: ['afternoon', 'night'],
    activitySuggestions: [
      'Romantic dinner', 'Movie date', 'Park walk', 'Spa day', 
      'Art gallery visit', 'Shopping together'
    ],
    atmosphereKeywords: ['romantic', 'intimate', 'cozy', 'elegant', 'special']
  },
  {
    id: 'barkada',
    label: 'Barkada',
    icon: '🎉',
    groupSize: { min: 3, max: 8 },
    description: 'Group activities and social gatherings',
    preferredPlaceTypes: [
      'restaurant', 'cafe', 'bar', 'stadium', 'casino', 'bowling_alley', 
      'amusement_park', 'skate_park', 'shopping_mall', 'night_club', 
      'playground', 'tourist_attraction', 'campground', 'rv_park'
    ],
    moodCompatibility: ['neutral', 'hype'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['afternoon', 'night'],
    activitySuggestions: [
      'Group dinner', 'Karaoke night', 'Bowling', 'Amusement park', 
      'Bar hopping', 'Shopping spree', 'Sports game'
    ],
    atmosphereKeywords: ['lively', 'energetic', 'fun', 'social', 'exciting']
  }
] as const;

// Utility functions for social context calculations
export class SocialUtils {
  /**
   * Get social context from context ID
   */
  static getSocialContext(contextId: string | null): SocialContext | undefined {
    if (!contextId) return undefined;
    return SOCIAL_CONTEXTS.find(context => context.id === contextId);
  }

  /**
   * Check if place is compatible with social context
   */
  static isPlaceCompatibleWithSocialContext(place: any, socialContext: string | null): boolean {
    if (!socialContext || !place.types) return true;
    
    const context = SocialUtils.getSocialContext(socialContext);
    if (!context) return true;
    
    return place.types.some((type: string) => 
      context.preferredPlaceTypes.includes(type)
    );
  }

  /**
   * Get social context label for logging
   */
  static getSocialContextLabel(socialContext: string | null): string {
    if (!socialContext) return 'not-set';
    const context = this.getSocialContext(socialContext);
    return context ? context.label : 'not-set';
  }

  /**
   * Get social context display text with icon
   */
  static getSocialContextDisplayText(socialContext: string | null): string {
    if (!socialContext) return 'Not Set';
    const context = SocialUtils.getSocialContext(socialContext);
    return context ? `${context.icon} ${context.label}` : 'Not Set';
  }

  /**
   * Get preferred place types for social context
   */
  static getPreferredPlaceTypes(socialContext: string | null): string[] {
    if (!socialContext) return [];
    const context = SocialUtils.getSocialContext(socialContext);
    return context ? context.preferredPlaceTypes : [];
  }

  /**
   * Validate social context is within acceptable values
   */
  static validateSocialContext(socialContext: string | null): boolean {
    if (!socialContext) return true; // null is valid (no filter)
    return SOCIAL_CONTEXTS.some(context => context.id === socialContext);
  }

  /**
   * Get all social contexts for UI rendering
   */
  static getAllSocialContexts(): SocialContext[] {
    return [...SOCIAL_CONTEXTS];
  }

  /**
   * Get social context mappings for discovery logic
   */
  static getSocialContextMappings() {
    return SOCIAL_CONTEXTS.map(context => ({
      id: context.id,
      label: context.label,
      description: context.description,
      preferredTypes: context.preferredPlaceTypes,
      groupSize: context.groupSize
    }));
  }

  /**
   * Get social context mappings for API calls
   */
  static getSocialContextMappingsForAPI() {
    return SOCIAL_CONTEXTS.reduce((acc, context) => {
      acc[context.id] = context.preferredPlaceTypes;
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * Get social context for AI descriptions
   */
  static getSocialContextForAI(socialContext: string | null): string {
    if (!socialContext) return 'any social setting';
    
    const contextMap = {
      'solo': 'solo/individual',
      'with-bae': 'couple/romantic',
      'barkada': 'group/social'
    };
    return contextMap[socialContext as keyof typeof contextMap] || 'any social setting';
  }

  /**
   * Get group size for social context
   */
  static getGroupSize(socialContext: string | null): number | { min: number; max: number } | null {
    if (!socialContext) return null;
    const context = SocialUtils.getSocialContext(socialContext);
    return context ? context.groupSize : null;
  }

  /**
   * Check if social context is compatible with mood
   */
  static isCompatibleWithMood(socialContext: string | null, mood: number): boolean {
    if (!socialContext) return true;
    
    const context = SocialUtils.getSocialContext(socialContext);
    if (!context) return true;
    
    // Convert mood to category
    let moodCategory: 'chill' | 'neutral' | 'hype';
    if (mood <= 33.33) moodCategory = 'chill';
    else if (mood <= 66.66) moodCategory = 'neutral';
    else moodCategory = 'hype';
    
    return context.moodCompatibility.includes(moodCategory);
  }

  /**
   * Get activity suggestions for social context
   */
  static getActivitySuggestions(socialContext: string | null): string[] {
    if (!socialContext) return [];
    const context = SocialUtils.getSocialContext(socialContext);
    return context ? context.activitySuggestions : [];
  }

  /**
   * Get atmosphere keywords for social context
   */
  static getAtmosphereKeywords(socialContext: string | null): string[] {
    if (!socialContext) return [];
    const context = SocialUtils.getSocialContext(socialContext);
    return context ? context.atmosphereKeywords : [];
  }
}

// Export for backward compatibility
export const socialContexts = SOCIAL_CONTEXTS;

// Derived exports for backward compatibility
export const socialOptions = SOCIAL_CONTEXTS.map(context => ({
  id: context.id,
  label: context.label,
  icon: context.icon,
  groupSize: context.groupSize,
  placeTypes: context.preferredPlaceTypes,
  description: context.description
}));

// Export utility functions for backward compatibility
export const getSocialContext = SocialUtils.getSocialContext;
export const isPlaceCompatibleWithSocialContext = SocialUtils.isPlaceCompatibleWithSocialContext;
export const getSocialContextLabel = SocialUtils.getSocialContextLabel;
export const getSocialContextDisplayText = SocialUtils.getSocialContextDisplayText;
export const getPreferredPlaceTypes = SocialUtils.getPreferredPlaceTypes;
export const validateSocialContext = SocialUtils.validateSocialContext;
export const getAllSocialContexts = SocialUtils.getAllSocialContexts;
export const getSocialContextMappings = SocialUtils.getSocialContextMappings;
export const getSocialContextMappingsForAPI = SocialUtils.getSocialContextMappingsForAPI;
export const getSocialContextForAI = SocialUtils.getSocialContextForAI;
export const getGroupSize = SocialUtils.getGroupSize;
export const isCompatibleWithMood = SocialUtils.isCompatibleWithMood;
export const getActivitySuggestions = SocialUtils.getActivitySuggestions;
export const getAtmosphereKeywords = SocialUtils.getAtmosphereKeywords; 