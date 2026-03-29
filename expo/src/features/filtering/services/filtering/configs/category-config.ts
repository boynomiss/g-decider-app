// Category Filter Configuration - Consolidated Settings
// This file contains all category filter-related configurations used across the application

export interface CategoryFilter {
  id: 'food' | 'activity' | 'something-new';
  label: string;
  icon: string;
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: ('chill' | 'neutral' | 'hype')[];
  socialCompatibility: ('solo' | 'with-bae' | 'barkada')[];
  budgetPreferences: ('P' | 'PP' | 'PPP')[];
  timeCompatibility: ('morning' | 'afternoon' | 'night')[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  searchKeywords: string[];
  priority: number;
}

// Single consolidated category filter configuration
export const CATEGORY_FILTERS: CategoryFilter[] = [
  {
    id: 'food',
    label: 'Food',
    icon: '🍔',
    description: 'Restaurants, cafes, and dining experiences',
    preferredPlaceTypes: [
      'restaurant', 'cafe', 'bar', 'bakery', 'food', 'meal_delivery', 
      'meal_takeaway', 'night_club', 'liquor_store', 'convenience_store', 'supermarket'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Fine dining experience', 'Casual cafe visit', 'Bar hopping', 
      'Bakery exploration', 'Food truck hunting', 'Gourmet cooking class'
    ],
    atmosphereKeywords: ['delicious', 'culinary', 'gastronomic', 'tasty', 'flavorful'],
    searchKeywords: ['restaurant', 'cafe', 'food', 'dining', 'eat', 'drink', 'bar'],
    priority: 1
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: '🧩',
    description: 'Entertainment, sports, and recreational activities',
    preferredPlaceTypes: [
      'park', 'museum', 'art_gallery', 'movie_theater', 'stadium', 'casino', 'gym', 'spa', 
      'bowling_alley', 'amusement_park', 'zoo', 'aquarium', 'golf_course', 'skate_park', 
      'swimming_pool', 'playground', 'tourist_attraction', 'book_store', 'shopping_mall', 
      'library', 'clothing_store', 'shoe_store', 'department_store', 'electronics_store', 
      'home_goods_store', 'hardware_store', 'florist', 'jewelry_store', 'sporting_goods_store', 
      'pet_store', 'bicycle_store', 'hair_care', 'beauty_salon', 'university', 'hindu_temple', 
      'church', 'mosque', 'synagogue', 'rv_park', 'campground'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Museum exploration', 'Park adventure', 'Movie night', 'Gym workout', 
      'Shopping spree', 'Art gallery visit', 'Bowling with friends'
    ],
    atmosphereKeywords: ['entertaining', 'engaging', 'fun', 'exciting', 'interactive'],
    searchKeywords: ['activity', 'entertainment', 'fun', 'play', 'explore', 'discover'],
    priority: 2
  },
  {
    id: 'something-new',
    label: 'Something New',
    icon: '✨',
    description: 'Discover unique and unexpected experiences across all categories - new cafes, restaurants, activities, and hidden gems',
    preferredPlaceTypes: [
      // Food & Dining
      'restaurant', 'cafe', 'bar', 'bakery', 'food', 'meal_delivery', 'meal_takeaway', 'night_club', 'liquor_store',
      
      // Entertainment & Activities
      'park', 'museum', 'art_gallery', 'movie_theater', 'stadium', 'casino', 'gym', 'spa', 'bowling_alley', 'amusement_park', 
      'zoo', 'aquarium', 'golf_course', 'skate_park', 'swimming_pool', 'playground', 'tourist_attraction',
      
      // Shopping & Retail
      'shopping_mall', 'book_store', 'clothing_store', 'shoe_store', 'department_store', 'electronics_store', 
      'home_goods_store', 'hardware_store', 'florist', 'jewelry_store', 'sporting_goods_store', 'pet_store', 'bicycle_store',
      
      // Services & Culture
      'library', 'hair_care', 'beauty_salon', 'university', 'hindu_temple', 'church', 'mosque', 'synagogue',
      
      // Outdoor & Adventure
      'rv_park', 'campground', 'convenience_store', 'supermarket'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Try a new restaurant or cafe', 'Discover a hidden park or trail', 'Visit a new museum or gallery',
      'Explore a new neighborhood', 'Visit a cultural center', 'Try a new hobby or activity',
      'Discover local markets', 'Attend a workshop or class', 'Visit historical sites',
      'Find new entertainment venues', 'Explore new shopping areas', 'Try new outdoor activities'
    ],
    atmosphereKeywords: ['unique', 'discovery', 'novel', 'unexpected', 'surprising', 'new', 'fresh', 'different'],
    searchKeywords: ['new', 'discover', 'explore', 'unique', 'different', 'unusual', 'hidden', 'fresh', 'latest'],
    priority: 3
  }
] as const;

// Category options for UI components
export const categoryOptions = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'activity', label: 'Activity', icon: '🧩' },
  { id: 'something-new', label: 'Something\nNEW', icon: '✨' },
] as const;

// Utility functions for category filter calculations
export class CategoryUtils {
  /**
   * Get category filter from category ID
   */
  static getCategoryFilter(categoryId: string | null): CategoryFilter | undefined {
    if (!categoryId) return undefined;
    return CATEGORY_FILTERS.find(category => category.id === categoryId);
  }

  /**
   * Check if place is compatible with category
   */
  static isPlaceCompatibleWithCategory(place: any, categoryId: string | null): boolean {
    if (!categoryId || !place.types) return true;
    
    const category = CategoryUtils.getCategoryFilter(categoryId);
    if (!category) return true;
    
    return place.types.some((type: string) => 
      category.preferredPlaceTypes.includes(type)
    );
  }

  /**
   * Get category label for logging
   */
  static getCategoryLabel(categoryId: string | null): string {
    if (!categoryId) return 'not-set';
    const category = this.getCategoryFilter(categoryId);
    return category ? category.label : 'not-set';
  }

  /**
   * Get category display text with icon
   */
  static getCategoryDisplayText(categoryId: string | null): string {
    if (!categoryId) return 'Not Set';
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? `${category.icon} ${category.label}` : 'Not Set';
  }

  /**
   * Get preferred place types for category
   */
  static getPreferredPlaceTypes(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? category.preferredPlaceTypes : [];
  }

  /**
   * Validate category ID is within acceptable values
   */
  static validateCategoryId(categoryId: string | null): boolean {
    if (!categoryId) return true; // null is valid (no filter)
    return CATEGORY_FILTERS.some(category => category.id === categoryId);
  }

  /**
   * Get all category filters for UI rendering
   */
  static getAllCategoryFilters(): CategoryFilter[] {
    return [...CATEGORY_FILTERS];
  }

  /**
   * Get category mappings for discovery logic
   */
  static getCategoryMappings() {
    return CATEGORY_FILTERS.map(category => ({
      id: category.id,
      label: category.label,
      description: category.description,
      preferredTypes: category.preferredPlaceTypes,
      priority: category.priority
    }));
  }

  /**
   * Get category mappings for API calls
   */
  static getCategoryMappingsForAPI() {
    return CATEGORY_FILTERS.reduce((acc, category) => {
      acc[category.id] = category.preferredPlaceTypes;
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * Get category context for AI descriptions
   */
  static getCategoryContext(categoryId: string | null): string {
    if (!categoryId) return 'any category';
    
    const categoryMap = {
      'food': 'food/dining',
      'activity': 'activity/entertainment',
      'something-new': 'discovery/exploration'
    };
    return categoryMap[categoryId as keyof typeof categoryMap] || 'any category';
  }

  /**
   * Get priority for category
   */
  static getCategoryPriority(categoryId: string | null): number | null {
    if (!categoryId) return null;
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? category.priority : null;
  }

  /**
   * Check if category is compatible with mood
   */
  static isCompatibleWithMood(categoryId: string | null, mood: number): boolean {
    if (!categoryId) return true;
    
    const category = CategoryUtils.getCategoryFilter(categoryId);
    if (!category) return true;
    
    // Convert mood to category
    let moodCategory: 'chill' | 'neutral' | 'hype';
    if (mood <= 33.33) moodCategory = 'chill';
    else if (mood <= 66.66) moodCategory = 'neutral';
    else moodCategory = 'hype';
    
    return category.moodCompatibility.includes(moodCategory);
  }

  /**
   * Check if category is compatible with social context
   */
  static isCompatibleWithSocialContext(categoryId: string | null, socialContext: string | null): boolean {
    if (!categoryId || !socialContext) return true;
    
    const category = CategoryUtils.getCategoryFilter(categoryId);
    if (!category) return true;
    
    return category.socialCompatibility.includes(socialContext as any);
  }

  /**
   * Get activity suggestions for category
   */
  static getActivitySuggestions(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? category.activitySuggestions : [];
  }

  /**
   * Get atmosphere keywords for category
   */
  static getAtmosphereKeywords(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? category.atmosphereKeywords : [];
  }

  /**
   * Get search keywords for category
   */
  static getSearchKeywords(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = CategoryUtils.getCategoryFilter(categoryId);
    return category ? category.searchKeywords : [];
  }

  /**
   * Get category by priority
   */
  static getCategoryByPriority(priority: number): CategoryFilter | undefined {
    return CATEGORY_FILTERS.find(category => category.priority === priority);
  }

  /**
   * Get all categories sorted by priority
   */
  static getCategoriesByPriority(): CategoryFilter[] {
    return [...CATEGORY_FILTERS].sort((a, b) => a.priority - b.priority);
  }
}

// Export for backward compatibility
export const categoryFilters = CATEGORY_FILTERS;

// Export utility functions for backward compatibility
export const getCategoryFilter = CategoryUtils.getCategoryFilter;
export const isPlaceCompatibleWithCategory = CategoryUtils.isPlaceCompatibleWithCategory;
export const getCategoryLabel = CategoryUtils.getCategoryLabel;
export const getCategoryDisplayText = CategoryUtils.getCategoryDisplayText;
export const getPreferredPlaceTypes = CategoryUtils.getPreferredPlaceTypes;
export const validateCategoryId = CategoryUtils.validateCategoryId;
export const getAllCategoryFilters = CategoryUtils.getAllCategoryFilters;
export const getCategoryMappings = CategoryUtils.getCategoryMappings;
export const getCategoryMappingsForAPI = CategoryUtils.getCategoryMappingsForAPI;
export const getCategoryContext = CategoryUtils.getCategoryContext;
export const getCategoryPriority = CategoryUtils.getCategoryPriority;
export const isCompatibleWithMood = CategoryUtils.isCompatibleWithMood;
export const isCompatibleWithSocialContext = CategoryUtils.isCompatibleWithSocialContext;
export const getActivitySuggestions = CategoryUtils.getActivitySuggestions;
export const getAtmosphereKeywords = CategoryUtils.getAtmosphereKeywords;
export const getSearchKeywords = CategoryUtils.getSearchKeywords;
export const getCategoryByPriority = CategoryUtils.getCategoryByPriority;
export const getCategoriesByPriority = CategoryUtils.getCategoriesByPriority; 