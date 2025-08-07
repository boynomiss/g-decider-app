// Filter Configuration Index
// This file provides centralized exports for all filter configurations
// Maintains backward compatibility while organizing filter configs

// Export all filter configurations with explicit re-exports to resolve naming conflicts
export * from './time-config';
export * from './distance-config';

// Explicit re-exports for budget-config to resolve naming conflicts
export {
  BUDGET_CATEGORIES,
  BUDGET_PRICE_MAPPING,
  BudgetCategory,
  BudgetUtils,
  budgetCategories,
  budgetOptions,
  getBudgetCategory,
  filterByBudget,
  getBudgetLabel,
  getBudgetDisplayText,
  validateBudget,
  getAllBudgetCategories,
  getBudgetMappings,
  getBudgetPriceMapping,
  getBudgetContext,
  priceLevelToBudget,
  budgetToPriceLevel,
  isPlaceInBudget,
  getPreferredPlaceTypes as getBudgetPreferredPlaceTypes
} from './budget-config';

// Explicit re-exports for mood-config to resolve naming conflicts
export {
  MOOD_CATEGORIES,
  MOOD_DETAILED_LABELS,
  MoodCategory,
  MoodUtils,
  moodCategories,
  moodOptions,
  getMoodCategory,
  isPlaceCompatibleWithMood,
  getMoodLabel,
  getMoodDisplayText,
  getDetailedMoodLabel,
  validateMoodScore,
  getAllMoodCategories,
  getMoodMappings,
  getMoodMappingsForAPI,
  getMoodContext,
  getEnergyLevel,
  getColorScheme,
  getMoodCategoryId,
  getMoodScoreRange,
  getPreferredPlaceTypes as getMoodPreferredPlaceTypes,
  getActivitySuggestions as getMoodActivitySuggestions,
  getAtmosphereKeywords as getMoodAtmosphereKeywords,
  isCompatibleWithSocialContext as isMoodCompatibleWithSocialContext
} from './mood-config';

// Explicit re-exports for social-config to resolve naming conflicts
export {
  SOCIAL_CONTEXTS,
  SocialContext,
  SocialUtils,
  getSocialContext,
  isPlaceCompatibleWithSocialContext,
  getSocialContextLabel,
  getSocialContextDisplayText,
  validateSocialContext,
  getAllSocialContexts,
  getSocialContextMappings,
  getSocialContextMappingsForAPI,
  getSocialContextForAI,
  getGroupSize,
  getPreferredPlaceTypes as getSocialPreferredPlaceTypes,
  getActivitySuggestions as getSocialActivitySuggestions,
  getAtmosphereKeywords as getSocialAtmosphereKeywords,
  isCompatibleWithMood as isSocialCompatibleWithMood
} from './social-config';

// Explicit re-exports for category-config to resolve naming conflicts
export {
  CATEGORY_FILTERS,
  categoryOptions,
  CategoryFilter,
  CategoryUtils,
  getCategoryFilter,
  isPlaceCompatibleWithCategory,
  getCategoryLabel,
  getCategoryDisplayText,
  validateCategoryId,
  getAllCategoryFilters,
  getCategoryMappings,
  getCategoryMappingsForAPI,
  getCategoryContext,
  getCategoryPriority,
  getSearchKeywords,
  getCategoryByPriority,
  getCategoriesByPriority,
  getPreferredPlaceTypes as getCategoryPreferredPlaceTypes,
  getActivitySuggestions as getCategoryActivitySuggestions,
  getAtmosphereKeywords as getCategoryAtmosphereKeywords,
  isCompatibleWithMood as isCategoryCompatibleWithMood,
  isCompatibleWithSocialContext as isCategoryCompatibleWithSocialContext
} from './category-config';

// Export filter utilities and services
export * from './filter-logger';
export * from './filter-api-bridge';
export * from './filter-validation-service';
export * from './filtering-progress';
export * from './enhanced-filtering-with-cache';
export * from './server-filtering-service'; 