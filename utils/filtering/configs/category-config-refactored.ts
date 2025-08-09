// Category Filter Configuration - Refactored with Filter Foundation
// This file demonstrates how to use the shared filter foundation

import { 
  FilterWithDisplay, 
  DisplayFilterUtils, 
  CategoryValue,
  CommonFilterUtils 
} from './filter-foundation';

export interface CategoryFilter extends FilterWithDisplay {
  id: CategoryValue;
  priority: number;
  searchKeywords: string[];
}

// Single consolidated category filter configuration
export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  {
    id: 'food',
    label: 'Food',
    icon: '🍔',
    description: 'Restaurants, cafes, and dining experiences',
    priority: 1,
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
    searchKeywords: ['restaurant', 'cafe', 'food', 'dining', 'eat', 'drink', 'bar']
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: '🧩',
    description: 'Entertainment, sports, and recreational activities',
    priority: 2,
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
    searchKeywords: ['activity', 'entertainment', 'fun', 'play', 'explore', 'discover']
  },
  {
    id: 'something-new',
    label: 'Something New',
    icon: '✨',
    description: 'Discover unique and unexpected experiences',
    priority: 3,
    preferredPlaceTypes: [
      'shopping_mall', 'library', 'book_store', 'clothing_store', 'shoe_store', 
      'department_store', 'electronics_store', 'home_goods_store', 'hardware_store', 
      'florist', 'jewelry_store', 'sporting_goods_store', 'pet_store', 'bicycle_store', 
      'hair_care', 'beauty_salon', 'university', 'hindu_temple', 'church', 'mosque', 
      'synagogue', 'rv_park', 'campground'
    ],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P', 'PP', 'PPP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Explore a new neighborhood', 'Visit a cultural center', 'Try a new hobby', 
      'Discover local markets', 'Attend a workshop', 'Visit historical sites'
    ],
    atmosphereKeywords: ['unique', 'discovery', 'novel', 'unexpected', 'surprising'],
    searchKeywords: ['new', 'discover', 'explore', 'unique', 'different', 'unusual']
  }
] as const;

// Category options for UI components
export const categoryOptions = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'activity', label: 'Activity', icon: '🧩' },
  { id: 'something-new', label: 'Something\nNEW', icon: '✨' },
] as const;

// Refactored utility class using the filter foundation
export class CategoryUtils extends DisplayFilterUtils<CategoryFilter> {
  protected categories = CATEGORY_FILTERS;

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
    const category = CATEGORY_FILTERS.find(cat => cat.id === categoryId);
    return category ? category.priority : null;
  }

  /**
   * Get search keywords for category
   */
  static getSearchKeywords(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = CATEGORY_FILTERS.find(cat => cat.id === categoryId);
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
}

// Create singleton instance
export const categoryUtils = new CategoryUtils();

// Export for backward compatibility
export const categoryFilters = CATEGORY_FILTERS;

// Export utility functions for backward compatibility using the singleton
export const getCategoryFilter = categoryUtils.getCategory.bind(categoryUtils);
export const isPlaceCompatibleWithCategory = categoryUtils.isPlaceCompatibleWithCategory.bind(categoryUtils);
export const getCategoryLabel = categoryUtils.getLabel.bind(categoryUtils);
export const getCategoryDisplayText = categoryUtils.getDisplayText.bind(categoryUtils);
export const getPreferredPlaceTypes = categoryUtils.getPreferredPlaceTypes.bind(categoryUtils);
export const validateCategoryId = categoryUtils.validateValue.bind(categoryUtils);
export const getAllCategoryFilters = categoryUtils.getAllCategories.bind(categoryUtils);
export const getCategoryMappings = CategoryUtils.getCategoryMappings;
export const getCategoryMappingsForAPI = CategoryUtils.getCategoryMappingsForAPI;
export const getCategoryContext = CategoryUtils.getCategoryContext;
export const getCategoryPriority = CategoryUtils.getCategoryPriority;
export const getSearchKeywords = CategoryUtils.getSearchKeywords;
export const getCategoryByPriority = CategoryUtils.getCategoryByPriority;
export const getCategoriesByPriority = CategoryUtils.getCategoriesByPriority;
export const getActivitySuggestions = categoryUtils.getActivitySuggestions.bind(categoryUtils);
export const getAtmosphereKeywords = categoryUtils.getAtmosphereKeywords.bind(categoryUtils);
export const getDisplayTextWithIcon = categoryUtils.getDisplayTextWithIcon.bind(categoryUtils);
export const isCompatibleWithMood = categoryUtils.isCompatibleWithMood.bind(categoryUtils);
export const isCompatibleWithSocialContext = categoryUtils.isCompatibleWithSocialContext.bind(categoryUtils); 