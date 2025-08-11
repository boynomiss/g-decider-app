"use strict";
// Filter Configuration Index
// This file provides centralized exports for all filter configurations
// Maintains backward compatibility while organizing filter configs
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialContextMappings = exports.getAllSocialContexts = exports.validateSocialContext = exports.getSocialContextDisplayText = exports.getSocialContextLabel = exports.isPlaceCompatibleWithSocialContext = exports.getSocialContext = exports.SocialUtils = exports.SOCIAL_CONTEXTS = exports.isMoodCompatibleWithSocialContext = exports.getMoodAtmosphereKeywords = exports.getMoodActivitySuggestions = exports.getMoodPreferredPlaceTypes = exports.getMoodScoreRange = exports.getMoodCategoryId = exports.getColorScheme = exports.getEnergyLevel = exports.getMoodContext = exports.getMoodMappingsForAPI = exports.getMoodMappings = exports.getAllMoodCategories = exports.validateMoodScore = exports.getDetailedMoodLabel = exports.getMoodDisplayText = exports.getMoodLabel = exports.isPlaceCompatibleWithMood = exports.getMoodCategory = exports.moodOptions = exports.moodCategories = exports.MoodUtils = exports.MOOD_DETAILED_LABELS = exports.MOOD_CATEGORIES = exports.getBudgetPreferredPlaceTypes = exports.isPlaceInBudget = exports.budgetToPriceLevel = exports.priceLevelToBudget = exports.getBudgetContext = exports.getBudgetPriceMapping = exports.getBudgetMappings = exports.getAllBudgetCategories = exports.validateBudget = exports.getBudgetDisplayText = exports.getBudgetLabel = exports.filterByBudget = exports.getBudgetCategory = exports.budgetOptions = exports.budgetCategories = exports.BudgetUtils = exports.BUDGET_PRICE_MAPPING = exports.BUDGET_CATEGORIES = void 0;
exports.isCategoryCompatibleWithSocialContext = exports.isCategoryCompatibleWithMood = exports.getCategoryAtmosphereKeywords = exports.getCategoryActivitySuggestions = exports.getCategoryPreferredPlaceTypes = exports.getCategoriesByPriority = exports.getCategoryByPriority = exports.getSearchKeywords = exports.getCategoryPriority = exports.getCategoryContext = exports.getCategoryMappingsForAPI = exports.getCategoryMappings = exports.getAllCategoryFilters = exports.validateCategoryId = exports.getCategoryDisplayText = exports.getCategoryLabel = exports.isPlaceCompatibleWithCategory = exports.getCategoryFilter = exports.CategoryUtils = exports.categoryOptions = exports.CATEGORY_FILTERS = exports.isSocialCompatibleWithMood = exports.getSocialAtmosphereKeywords = exports.getSocialActivitySuggestions = exports.getSocialPreferredPlaceTypes = exports.getGroupSize = exports.getSocialContextForAI = exports.getSocialContextMappingsForAPI = void 0;
// Export shared filter foundation
__exportStar(require("./filter-foundation"), exports);
// Export all filter configurations with explicit re-exports to resolve naming conflicts
__exportStar(require("./time-config"), exports);
__exportStar(require("./distance-config"), exports);
// Explicit re-exports for budget-config to resolve naming conflicts
var budget_config_1 = require("./budget-config");
Object.defineProperty(exports, "BUDGET_CATEGORIES", { enumerable: true, get: function () { return budget_config_1.BUDGET_CATEGORIES; } });
Object.defineProperty(exports, "BUDGET_PRICE_MAPPING", { enumerable: true, get: function () { return budget_config_1.BUDGET_PRICE_MAPPING; } });
Object.defineProperty(exports, "BudgetUtils", { enumerable: true, get: function () { return budget_config_1.BudgetUtils; } });
Object.defineProperty(exports, "budgetCategories", { enumerable: true, get: function () { return budget_config_1.budgetCategories; } });
Object.defineProperty(exports, "budgetOptions", { enumerable: true, get: function () { return budget_config_1.budgetOptions; } });
Object.defineProperty(exports, "getBudgetCategory", { enumerable: true, get: function () { return budget_config_1.getBudgetCategory; } });
Object.defineProperty(exports, "filterByBudget", { enumerable: true, get: function () { return budget_config_1.filterByBudget; } });
Object.defineProperty(exports, "getBudgetLabel", { enumerable: true, get: function () { return budget_config_1.getBudgetLabel; } });
Object.defineProperty(exports, "getBudgetDisplayText", { enumerable: true, get: function () { return budget_config_1.getBudgetDisplayText; } });
Object.defineProperty(exports, "validateBudget", { enumerable: true, get: function () { return budget_config_1.validateBudget; } });
Object.defineProperty(exports, "getAllBudgetCategories", { enumerable: true, get: function () { return budget_config_1.getAllBudgetCategories; } });
Object.defineProperty(exports, "getBudgetMappings", { enumerable: true, get: function () { return budget_config_1.getBudgetMappings; } });
Object.defineProperty(exports, "getBudgetPriceMapping", { enumerable: true, get: function () { return budget_config_1.getBudgetPriceMapping; } });
Object.defineProperty(exports, "getBudgetContext", { enumerable: true, get: function () { return budget_config_1.getBudgetContext; } });
Object.defineProperty(exports, "priceLevelToBudget", { enumerable: true, get: function () { return budget_config_1.priceLevelToBudget; } });
Object.defineProperty(exports, "budgetToPriceLevel", { enumerable: true, get: function () { return budget_config_1.budgetToPriceLevel; } });
Object.defineProperty(exports, "isPlaceInBudget", { enumerable: true, get: function () { return budget_config_1.isPlaceInBudget; } });
Object.defineProperty(exports, "getBudgetPreferredPlaceTypes", { enumerable: true, get: function () { return budget_config_1.getPreferredPlaceTypes; } });
// Explicit re-exports for mood-config to resolve naming conflicts
var mood_config_1 = require("./mood-config");
Object.defineProperty(exports, "MOOD_CATEGORIES", { enumerable: true, get: function () { return mood_config_1.MOOD_CATEGORIES; } });
Object.defineProperty(exports, "MOOD_DETAILED_LABELS", { enumerable: true, get: function () { return mood_config_1.MOOD_DETAILED_LABELS; } });
Object.defineProperty(exports, "MoodUtils", { enumerable: true, get: function () { return mood_config_1.MoodUtils; } });
Object.defineProperty(exports, "moodCategories", { enumerable: true, get: function () { return mood_config_1.moodCategories; } });
Object.defineProperty(exports, "moodOptions", { enumerable: true, get: function () { return mood_config_1.moodOptions; } });
Object.defineProperty(exports, "getMoodCategory", { enumerable: true, get: function () { return mood_config_1.getMoodCategory; } });
Object.defineProperty(exports, "isPlaceCompatibleWithMood", { enumerable: true, get: function () { return mood_config_1.isPlaceCompatibleWithMood; } });
Object.defineProperty(exports, "getMoodLabel", { enumerable: true, get: function () { return mood_config_1.getMoodLabel; } });
Object.defineProperty(exports, "getMoodDisplayText", { enumerable: true, get: function () { return mood_config_1.getMoodDisplayText; } });
Object.defineProperty(exports, "getDetailedMoodLabel", { enumerable: true, get: function () { return mood_config_1.getDetailedMoodLabel; } });
Object.defineProperty(exports, "validateMoodScore", { enumerable: true, get: function () { return mood_config_1.validateMoodScore; } });
Object.defineProperty(exports, "getAllMoodCategories", { enumerable: true, get: function () { return mood_config_1.getAllMoodCategories; } });
Object.defineProperty(exports, "getMoodMappings", { enumerable: true, get: function () { return mood_config_1.getMoodMappings; } });
Object.defineProperty(exports, "getMoodMappingsForAPI", { enumerable: true, get: function () { return mood_config_1.getMoodMappingsForAPI; } });
Object.defineProperty(exports, "getMoodContext", { enumerable: true, get: function () { return mood_config_1.getMoodContext; } });
Object.defineProperty(exports, "getEnergyLevel", { enumerable: true, get: function () { return mood_config_1.getEnergyLevel; } });
Object.defineProperty(exports, "getColorScheme", { enumerable: true, get: function () { return mood_config_1.getColorScheme; } });
Object.defineProperty(exports, "getMoodCategoryId", { enumerable: true, get: function () { return mood_config_1.getMoodCategoryId; } });
Object.defineProperty(exports, "getMoodScoreRange", { enumerable: true, get: function () { return mood_config_1.getMoodScoreRange; } });
Object.defineProperty(exports, "getMoodPreferredPlaceTypes", { enumerable: true, get: function () { return mood_config_1.getPreferredPlaceTypes; } });
Object.defineProperty(exports, "getMoodActivitySuggestions", { enumerable: true, get: function () { return mood_config_1.getActivitySuggestions; } });
Object.defineProperty(exports, "getMoodAtmosphereKeywords", { enumerable: true, get: function () { return mood_config_1.getAtmosphereKeywords; } });
Object.defineProperty(exports, "isMoodCompatibleWithSocialContext", { enumerable: true, get: function () { return mood_config_1.isCompatibleWithSocialContext; } });
// Explicit re-exports for social-config to resolve naming conflicts
var social_config_1 = require("./social-config");
Object.defineProperty(exports, "SOCIAL_CONTEXTS", { enumerable: true, get: function () { return social_config_1.SOCIAL_CONTEXTS; } });
Object.defineProperty(exports, "SocialUtils", { enumerable: true, get: function () { return social_config_1.SocialUtils; } });
Object.defineProperty(exports, "getSocialContext", { enumerable: true, get: function () { return social_config_1.getSocialContext; } });
Object.defineProperty(exports, "isPlaceCompatibleWithSocialContext", { enumerable: true, get: function () { return social_config_1.isPlaceCompatibleWithSocialContext; } });
Object.defineProperty(exports, "getSocialContextLabel", { enumerable: true, get: function () { return social_config_1.getSocialContextLabel; } });
Object.defineProperty(exports, "getSocialContextDisplayText", { enumerable: true, get: function () { return social_config_1.getSocialContextDisplayText; } });
Object.defineProperty(exports, "validateSocialContext", { enumerable: true, get: function () { return social_config_1.validateSocialContext; } });
Object.defineProperty(exports, "getAllSocialContexts", { enumerable: true, get: function () { return social_config_1.getAllSocialContexts; } });
Object.defineProperty(exports, "getSocialContextMappings", { enumerable: true, get: function () { return social_config_1.getSocialContextMappings; } });
Object.defineProperty(exports, "getSocialContextMappingsForAPI", { enumerable: true, get: function () { return social_config_1.getSocialContextMappingsForAPI; } });
Object.defineProperty(exports, "getSocialContextForAI", { enumerable: true, get: function () { return social_config_1.getSocialContextForAI; } });
Object.defineProperty(exports, "getGroupSize", { enumerable: true, get: function () { return social_config_1.getGroupSize; } });
Object.defineProperty(exports, "getSocialPreferredPlaceTypes", { enumerable: true, get: function () { return social_config_1.getPreferredPlaceTypes; } });
Object.defineProperty(exports, "getSocialActivitySuggestions", { enumerable: true, get: function () { return social_config_1.getActivitySuggestions; } });
Object.defineProperty(exports, "getSocialAtmosphereKeywords", { enumerable: true, get: function () { return social_config_1.getAtmosphereKeywords; } });
Object.defineProperty(exports, "isSocialCompatibleWithMood", { enumerable: true, get: function () { return social_config_1.isCompatibleWithMood; } });
// Explicit re-exports for category-config to resolve naming conflicts
var category_config_1 = require("./category-config");
Object.defineProperty(exports, "CATEGORY_FILTERS", { enumerable: true, get: function () { return category_config_1.CATEGORY_FILTERS; } });
Object.defineProperty(exports, "categoryOptions", { enumerable: true, get: function () { return category_config_1.categoryOptions; } });
Object.defineProperty(exports, "CategoryUtils", { enumerable: true, get: function () { return category_config_1.CategoryUtils; } });
Object.defineProperty(exports, "getCategoryFilter", { enumerable: true, get: function () { return category_config_1.getCategoryFilter; } });
Object.defineProperty(exports, "isPlaceCompatibleWithCategory", { enumerable: true, get: function () { return category_config_1.isPlaceCompatibleWithCategory; } });
Object.defineProperty(exports, "getCategoryLabel", { enumerable: true, get: function () { return category_config_1.getCategoryLabel; } });
Object.defineProperty(exports, "getCategoryDisplayText", { enumerable: true, get: function () { return category_config_1.getCategoryDisplayText; } });
Object.defineProperty(exports, "validateCategoryId", { enumerable: true, get: function () { return category_config_1.validateCategoryId; } });
Object.defineProperty(exports, "getAllCategoryFilters", { enumerable: true, get: function () { return category_config_1.getAllCategoryFilters; } });
Object.defineProperty(exports, "getCategoryMappings", { enumerable: true, get: function () { return category_config_1.getCategoryMappings; } });
Object.defineProperty(exports, "getCategoryMappingsForAPI", { enumerable: true, get: function () { return category_config_1.getCategoryMappingsForAPI; } });
Object.defineProperty(exports, "getCategoryContext", { enumerable: true, get: function () { return category_config_1.getCategoryContext; } });
Object.defineProperty(exports, "getCategoryPriority", { enumerable: true, get: function () { return category_config_1.getCategoryPriority; } });
Object.defineProperty(exports, "getSearchKeywords", { enumerable: true, get: function () { return category_config_1.getSearchKeywords; } });
Object.defineProperty(exports, "getCategoryByPriority", { enumerable: true, get: function () { return category_config_1.getCategoryByPriority; } });
Object.defineProperty(exports, "getCategoriesByPriority", { enumerable: true, get: function () { return category_config_1.getCategoriesByPriority; } });
Object.defineProperty(exports, "getCategoryPreferredPlaceTypes", { enumerable: true, get: function () { return category_config_1.getPreferredPlaceTypes; } });
Object.defineProperty(exports, "getCategoryActivitySuggestions", { enumerable: true, get: function () { return category_config_1.getActivitySuggestions; } });
Object.defineProperty(exports, "getCategoryAtmosphereKeywords", { enumerable: true, get: function () { return category_config_1.getAtmosphereKeywords; } });
Object.defineProperty(exports, "isCategoryCompatibleWithMood", { enumerable: true, get: function () { return category_config_1.isCompatibleWithMood; } });
Object.defineProperty(exports, "isCategoryCompatibleWithSocialContext", { enumerable: true, get: function () { return category_config_1.isCompatibleWithSocialContext; } });
// Export filter utilities and services
// Note: The following services have been consolidated into the unified filtering system:
// - filter-logger (now in FilterUtilities)
// - filter-api-bridge (now in FilterAPIService) 
// - filter-validation-service (now in FilterUtilities)
// - filtering-progress (now in FilterUtilities)
// - enhanced-filtering-with-cache (now in UnifiedFilterService)
// - server-filtering-service (now in UnifiedFilterService)
//
// For new code, use:
// import { unifiedFilterService } from '@/utils/unified-filtering-system'; 
//# sourceMappingURL=index.js.map