"use strict";
// Filter Foundation - Shared types and utilities across all filter configurations
// This file provides common interfaces and base classes to reduce code duplication
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonFilterUtils = exports.DisplayFilterUtils = exports.ActivityFilterUtils = exports.CompatibilityFilterUtils = exports.PlaceTypeFilterUtils = exports.BaseFilterUtils = void 0;
// Base utility class for common filter operations
class BaseFilterUtils {
    /**
     * Get category from ID
     */
    getCategory(id) {
        if (!id)
            return undefined;
        return this.categories.find(category => category.id === id);
    }
    /**
     * Validate value is within acceptable values
     */
    validateValue(value) {
        if (!value)
            return true; // null is valid (no filter)
        return this.categories.some(category => category.id === value);
    }
    /**
     * Get display text for UI
     */
    getDisplayText(value) {
        if (!value)
            return 'Not Set';
        const category = this.getCategory(value);
        return category ? category.label : 'Not Set';
    }
    /**
     * Get label for logging
     */
    getLabel(value) {
        if (!value)
            return 'not-set';
        const category = this.getCategory(value);
        return category ? category.label.toLowerCase().replace(/\s+/g, '-') : 'not-set';
    }
    /**
     * Get all categories for UI rendering
     */
    getAllCategories() {
        return [...this.categories];
    }
    /**
     * Get category mappings for discovery logic
     */
    getCategoryMappings() {
        return this.categories.map(category => ({
            id: category.id,
            label: category.label,
            description: category.description
        }));
    }
}
exports.BaseFilterUtils = BaseFilterUtils;
// Enhanced utility class for filters with place types
class PlaceTypeFilterUtils extends BaseFilterUtils {
    /**
     * Get preferred place types for category
     */
    getPreferredPlaceTypes(categoryId) {
        if (!categoryId)
            return [];
        const category = this.getCategory(categoryId);
        return category ? category.preferredPlaceTypes : [];
    }
    /**
     * Check if place is compatible with category
     */
    isPlaceCompatibleWithCategory(place, categoryId) {
        if (!categoryId || !place.types)
            return true;
        const category = this.getCategory(categoryId);
        if (!category)
            return true;
        return place.types.some((type) => category.preferredPlaceTypes.includes(type));
    }
    /**
     * Get category mappings for API calls
     */
    getCategoryMappingsForAPI() {
        return this.categories.reduce((acc, category) => {
            acc[category.id] = category.preferredPlaceTypes;
            return acc;
        }, {});
    }
}
exports.PlaceTypeFilterUtils = PlaceTypeFilterUtils;
// Enhanced utility class for filters with compatibility
class CompatibilityFilterUtils extends PlaceTypeFilterUtils {
    /**
     * Check if category is compatible with mood
     */
    isCompatibleWithMood(categoryId, mood) {
        if (!categoryId || !this.hasMoodCompatibility())
            return true;
        const category = this.getCategory(categoryId);
        if (!category || !category.moodCompatibility)
            return true;
        // Convert mood to category
        let moodCategory;
        if (mood <= 33.33)
            moodCategory = 'chill';
        else if (mood <= 66.66)
            moodCategory = 'neutral';
        else
            moodCategory = 'hype';
        return category.moodCompatibility.includes(moodCategory);
    }
    /**
     * Check if category is compatible with social context
     */
    isCompatibleWithSocialContext(categoryId, socialContext) {
        if (!categoryId || !socialContext || !this.hasSocialCompatibility())
            return true;
        const category = this.getCategory(categoryId);
        if (!category || !category.socialCompatibility)
            return true;
        return category.socialCompatibility.includes(socialContext);
    }
    /**
     * Check if category is compatible with budget
     */
    isCompatibleWithBudget(categoryId, budget) {
        if (!categoryId || !budget || !this.hasBudgetPreferences())
            return true;
        const category = this.getCategory(categoryId);
        if (!category || !category.budgetPreferences)
            return true;
        return category.budgetPreferences.includes(budget);
    }
    /**
     * Check if category is compatible with time
     */
    isCompatibleWithTime(categoryId, timeOfDay) {
        if (!categoryId || !timeOfDay || !this.hasTimeCompatibility())
            return true;
        const category = this.getCategory(categoryId);
        if (!category || !category.timeCompatibility)
            return true;
        return category.timeCompatibility.includes(timeOfDay);
    }
    // Helper methods to check if compatibility properties exist
    hasMoodCompatibility() {
        return this.categories.some(cat => 'moodCompatibility' in cat);
    }
    hasSocialCompatibility() {
        return this.categories.some(cat => 'socialCompatibility' in cat);
    }
    hasBudgetPreferences() {
        return this.categories.some(cat => 'budgetPreferences' in cat);
    }
    hasTimeCompatibility() {
        return this.categories.some(cat => 'timeCompatibility' in cat);
    }
}
exports.CompatibilityFilterUtils = CompatibilityFilterUtils;
// Enhanced utility class for filters with activities
class ActivityFilterUtils extends CompatibilityFilterUtils {
    /**
     * Get activity suggestions for category
     */
    getActivitySuggestions(categoryId) {
        if (!categoryId)
            return [];
        const category = this.getCategory(categoryId);
        return category ? category.activitySuggestions : [];
    }
    /**
     * Get atmosphere keywords for category
     */
    getAtmosphereKeywords(categoryId) {
        if (!categoryId)
            return [];
        const category = this.getCategory(categoryId);
        return category ? category.atmosphereKeywords : [];
    }
}
exports.ActivityFilterUtils = ActivityFilterUtils;
// Enhanced utility class for filters with display properties
class DisplayFilterUtils extends ActivityFilterUtils {
    /**
     * Get display text with icon/display symbol
     */
    getDisplayTextWithIcon(value) {
        if (!value)
            return 'Not Set';
        const category = this.getCategory(value);
        if (!category)
            return 'Not Set';
        if (category.icon && category.display) {
            return `${category.icon} ${category.display} ${category.label}`;
        }
        else if (category.icon) {
            return `${category.icon} ${category.label}`;
        }
        else if (category.display) {
            return `${category.display} ${category.label}`;
        }
        return category.label;
    }
}
exports.DisplayFilterUtils = DisplayFilterUtils;
// Utility functions for common filter operations
class CommonFilterUtils {
    /**
     * Create a filter summary string
     */
    static createFilterSummary(context) {
        const parts = [];
        if (context.mood !== undefined) {
            parts.push(`Mood: ${context.mood}`);
        }
        if (context.budget) {
            parts.push(`Budget: ${context.budget}`);
        }
        if (context.socialContext) {
            parts.push(`Social: ${context.socialContext}`);
        }
        if (context.timeOfDay) {
            parts.push(`Time: ${context.timeOfDay}`);
        }
        if (context.category) {
            parts.push(`Category: ${context.category}`);
        }
        if (context.distance !== undefined) {
            parts.push(`Distance: ${context.distance}%`);
        }
        return parts.length > 0 ? parts.join(', ') : 'No filters applied';
    }
    /**
     * Validate filter context
     */
    static validateFilterContext(context) {
        const errors = [];
        const warnings = [];
        if (context.mood !== undefined && (context.mood < 0 || context.mood > 100)) {
            errors.push('Mood must be between 0 and 100');
        }
        if (context.distance !== undefined && (context.distance < 0 || context.distance > 100)) {
            errors.push('Distance must be between 0 and 100');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Merge filter contexts
     */
    static mergeFilterContexts(...contexts) {
        return contexts.reduce((merged, context) => ({
            ...merged,
            ...context
        }), {});
    }
}
exports.CommonFilterUtils = CommonFilterUtils;
//# sourceMappingURL=filter-foundation.js.map