/**
 * Filtering Services Index
 * 
 * All place discovery, filtering, and mood analysis services.
 * This is the main entry point for filtering functionality.
 * 
 * IMPROVEMENTS:
 * - Registry pattern for centralized config management
 * - Shared utilities to reduce duplication
 * - Cleaner separation of concerns
 * - Better performance monitoring
 */

// ===============================
// 🎯 UNIFIED SYSTEM (Recommended)
// ===============================

export * from './unified-filtering-system';
export { unifiedFilterService, UnifiedFilterService } from './unified-filter-service';

// ===============================
// 🏗️ REGISTRY & UTILITIES (New)
// ===============================

// Registry pattern for centralized config management
export {
  filterConfigRegistry,
  FilterConfigRegistry,
  getFilterConfig,
  getFilterConfigs,
  validateFilterValue,
  getFilterDisplayText,
  checkFilterCompatibility
} from './config-registry';

// Shared utilities to reduce duplication
export {
  FilterCoreUtils,
  FilterValidation,
  FilterConversion,
  FilterMatching,
  FilterProgress
} from './filter-core-utils';

// ===============================
// 🔧 CORE SERVICES
// ===============================

export * from './filter-api-service';
export { FilterApiBridge } from './filter-api-service';

// Modern mood analysis services (recommended)
export * from './mood';

// ===============================
// 📋 FILTER CONFIGURATIONS
// ===============================

// Export filter configurations
export {
  BUDGET_CATEGORIES,
  BUDGET_PRICE_MAPPING,
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
} from './configs/budget-config';

export {
  MOOD_CATEGORIES,
  MOOD_DETAILED_LABELS,
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
} from './configs/mood-config';

export {
  SOCIAL_CONTEXTS,
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
} from './configs/social-config';

export {
  CATEGORY_FILTERS,
  categoryOptions,
  getCategoryFilter,
  isPlaceCompatibleWithCategory,
  getCategoryLabel,
  getCategoryDisplayText,
  validateCategoryId,
  getAllCategoryFilters,
  getCategoryMappings,
  getCategoryMappingsForAPI,
  getCategoryContext,
  getPreferredPlaceTypes as getCategoryPreferredPlaceTypes,
  getActivitySuggestions as getCategoryActivitySuggestions,
  getAtmosphereKeywords as getCategoryAtmosphereKeywords,
  isCompatibleWithMood as isCategoryCompatibleWithMood,
  isCompatibleWithSocialContext as isCategoryCompatibleWithSocialContext
} from './configs/category-config';

// ===============================
// ⚠️ LEGACY SERVICES (Deprecated)
// ===============================

// Legacy compatibility - use unified system instead
export { 
  PlaceDiscoveryLogic
} from './unified-filter-service';

// Types are exported from unified system to avoid conflicts

// ===============================
// 📚 USAGE EXAMPLES
// ===============================

// See USAGE_EXAMPLES.md for detailed examples and usage patterns