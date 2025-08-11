"use strict";
// Budget Configuration - Consolidated Settings
// This file contains all budget-related configurations used across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaceInBudget = exports.budgetToPriceLevel = exports.priceLevelToBudget = exports.getBudgetContext = exports.getBudgetPriceMapping = exports.getBudgetMappings = exports.getAllBudgetCategories = exports.validateBudget = exports.getPreferredPlaceTypes = exports.getBudgetDisplayText = exports.getBudgetLabel = exports.filterByBudget = exports.getBudgetCategory = exports.budgetOptions = exports.budgetCategories = exports.BudgetUtils = exports.BUDGET_PRICE_MAPPING = exports.BUDGET_CATEGORIES = void 0;
// Single consolidated budget configuration
exports.BUDGET_CATEGORIES = [
    {
        id: 'P',
        display: '₱',
        label: 'Budget-Friendly',
        priceRange: { min: 0, max: 500 },
        googlePriceLevel: 1,
        description: 'Affordable dining and activities',
        preferredPlaceTypes: ['cafe', 'bakery', 'food', 'meal_takeaway', 'convenience_store', 'supermarket'],
        atmosphereKeywords: ['casual', 'simple', 'basic', 'affordable', 'no-frills']
    },
    {
        id: 'PP',
        display: '₱₱',
        label: 'Moderate',
        priceRange: { min: 500, max: 1500 },
        googlePriceLevel: 2,
        description: 'Mid-range dining and experiences',
        preferredPlaceTypes: ['restaurant', 'cafe', 'bar', 'movie_theater', 'museum', 'art_gallery'],
        atmosphereKeywords: ['comfortable', 'pleasant', 'decent', 'moderate', 'balanced']
    },
    {
        id: 'PPP',
        display: '₱₱₱',
        label: 'Premium',
        priceRange: { min: 1500, max: 5000 },
        googlePriceLevel: 3,
        description: 'High-end dining and luxury experiences',
        preferredPlaceTypes: ['restaurant', 'bar', 'night_club', 'spa', 'casino', 'hotel'],
        atmosphereKeywords: ['luxurious', 'elegant', 'sophisticated', 'premium', 'exclusive']
    }
];
// Budget to Google Places price_level mapping for backend filtering
exports.BUDGET_PRICE_MAPPING = {
    'P': [0, 1, 2], // Budget-Friendly: 0-2
    'PP': [3], // Moderate: 3  
    'PPP': [4] // Premium: 4
};
// Utility functions for budget calculations
class BudgetUtils {
    /**
     * Get budget category from budget ID
     */
    static getBudgetCategory(budgetId) {
        if (!budgetId)
            return undefined;
        return exports.BUDGET_CATEGORIES.find(category => category.id === budgetId);
    }
    /**
     * Filter places by budget (price level)
     */
    static filterByBudget(places, budget) {
        if (!budget || !exports.BUDGET_PRICE_MAPPING[budget]) {
            return places;
        }
        const allowedPriceLevels = exports.BUDGET_PRICE_MAPPING[budget];
        if (!allowedPriceLevels) {
            return places;
        }
        return places.filter((place) => {
            // If no price level data, include in budget-friendly results
            if (place.price_level === undefined || place.price_level === null) {
                return budget === 'P'; // Only include in budget-friendly
            }
            return allowedPriceLevels.includes(place.price_level);
        });
    }
    /**
     * Get budget label for logging
     */
    static getBudgetLabel(budget) {
        if (!budget)
            return 'not-set';
        const category = this.getBudgetCategory(budget);
        return category ? category.label : 'not-set';
    }
    /**
     * Get budget display text with icon
     */
    static getBudgetDisplayText(budget) {
        if (!budget)
            return 'Not Set';
        const category = this.getBudgetCategory(budget);
        return category ? `${category.display} ${category.label}` : 'Not Set';
    }
    /**
     * Get preferred place types for budget level
     */
    static getPreferredPlaceTypes(budget) {
        if (!budget)
            return [];
        const category = this.getBudgetCategory(budget);
        return category ? category.preferredPlaceTypes : [];
    }
    /**
     * Validate budget is within acceptable values
     */
    static validateBudget(budget) {
        if (!budget)
            return true; // null is valid (no filter)
        return exports.BUDGET_CATEGORIES.some(category => category.id === budget);
    }
    /**
     * Get all budget categories for UI rendering
     */
    static getAllBudgetCategories() {
        return [...exports.BUDGET_CATEGORIES];
    }
    /**
     * Get budget mappings for discovery logic
     */
    static getBudgetMappings() {
        return exports.BUDGET_CATEGORIES.map(category => ({
            id: category.id,
            label: category.label,
            description: category.description,
            preferredTypes: category.preferredPlaceTypes,
            priceRange: category.priceRange,
            googlePriceLevel: category.googlePriceLevel
        }));
    }
    /**
     * Get budget price mapping for API calls
     */
    static getBudgetPriceMapping() {
        return exports.BUDGET_PRICE_MAPPING;
    }
    /**
     * Get budget context for AI descriptions
     */
    static getBudgetContext(budget) {
        if (!budget)
            return 'any budget range';
        const budgetMap = {
            'P': 'budget-friendly',
            'PP': 'moderate-priced',
            'PPP': 'premium'
        };
        return budgetMap[budget] || 'any budget range';
    }
    /**
     * Convert Google Places price level to budget category
     */
    static priceLevelToBudget(priceLevel) {
        if (priceLevel === null || priceLevel === undefined)
            return 'PP'; // Default to moderate
        if (priceLevel <= 2)
            return 'P'; // Budget-friendly
        if (priceLevel === 3)
            return 'PP'; // Moderate
        return 'PPP'; // Premium
    }
    /**
     * Convert budget to Google Places price level
     */
    static budgetToPriceLevel(budget) {
        if (!budget)
            return null;
        const category = this.getBudgetCategory(budget);
        return category ? category.googlePriceLevel : null;
    }
    /**
     * Check if place fits within budget
     */
    static isPlaceInBudget(place, budget) {
        if (!budget)
            return true; // No budget filter
        const placePriceLevel = place.price_level;
        if (placePriceLevel === null || placePriceLevel === undefined) {
            return budget === 'P'; // Only include in budget-friendly if no price data
        }
        const allowedPriceLevels = exports.BUDGET_PRICE_MAPPING[budget];
        if (!allowedPriceLevels) {
            return false;
        }
        return allowedPriceLevels.includes(placePriceLevel);
    }
}
exports.BudgetUtils = BudgetUtils;
// Export for backward compatibility
exports.budgetCategories = exports.BUDGET_CATEGORIES;
// Derived exports for backward compatibility
exports.budgetOptions = exports.BUDGET_CATEGORIES.map(category => ({
    display: category.display,
    value: category.id,
    label: category.label,
    priceRange: category.priceRange,
    googlePriceLevel: category.googlePriceLevel
}));
// Export utility functions for backward compatibility
exports.getBudgetCategory = BudgetUtils.getBudgetCategory;
exports.filterByBudget = BudgetUtils.filterByBudget;
exports.getBudgetLabel = BudgetUtils.getBudgetLabel;
exports.getBudgetDisplayText = BudgetUtils.getBudgetDisplayText;
exports.getPreferredPlaceTypes = BudgetUtils.getPreferredPlaceTypes;
exports.validateBudget = BudgetUtils.validateBudget;
exports.getAllBudgetCategories = BudgetUtils.getAllBudgetCategories;
exports.getBudgetMappings = BudgetUtils.getBudgetMappings;
exports.getBudgetPriceMapping = BudgetUtils.getBudgetPriceMapping;
exports.getBudgetContext = BudgetUtils.getBudgetContext;
exports.priceLevelToBudget = BudgetUtils.priceLevelToBudget;
exports.budgetToPriceLevel = BudgetUtils.budgetToPriceLevel;
exports.isPlaceInBudget = BudgetUtils.isPlaceInBudget;
//# sourceMappingURL=budget-config.js.map