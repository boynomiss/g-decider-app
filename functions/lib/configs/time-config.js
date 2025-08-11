"use strict";
// Time Configuration - Consolidated Settings
// This file contains all time-related configurations used across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeContext = exports.getTimeRanges = exports.getTimeMappings = exports.getAllTimeCategories = exports.validateTimeOfDay = exports.getPreferredPlaceTypes = exports.getTimeDisplayText = exports.getTimeLabel = exports.isPlaceOpenAtTime = exports.getTimeCategory = exports.timeOptions = exports.timeCategories = exports.TimeUtils = exports.TIME_CATEGORIES = void 0;
// Single consolidated time configuration
exports.TIME_CATEGORIES = [
    {
        id: 'morning',
        label: 'Morning',
        icon: '🌅',
        timeRange: { start: '04:00', end: '12:00' },
        hourRange: { start: 4, end: 11 },
        description: 'Early morning activities and breakfast spots',
        preferredPlaceTypes: ['cafe', 'bakery', 'restaurant', 'park', 'gym']
    },
    {
        id: 'afternoon',
        label: 'Afternoon',
        icon: '☀️',
        timeRange: { start: '12:00', end: '18:00' },
        hourRange: { start: 12, end: 17 },
        description: 'Lunch, shopping, and daytime activities',
        preferredPlaceTypes: ['restaurant', 'museum', 'art_gallery', 'shopping_mall', 'park']
    },
    {
        id: 'night',
        label: 'Night',
        icon: '🌙',
        timeRange: { start: '18:00', end: '04:00' },
        hourRange: { start: 18, end: 3 },
        description: 'Dinner, nightlife, and evening entertainment',
        preferredPlaceTypes: ['restaurant', 'bar', 'night_club', 'movie_theater', 'casino']
    }
];
// Utility functions for time calculations
class TimeUtils {
    /**
     * Get time category from time ID
     */
    static getTimeCategory(timeId) {
        if (!timeId)
            return undefined;
        return exports.TIME_CATEGORIES.find(category => category.id === timeId);
    }
    /**
     * Check if place is open during specified time
     */
    static isPlaceOpenAtTime(place, timeOfDay) {
        if (!timeOfDay || !place.opening_hours?.periods)
            return true;
        const category = this.getTimeCategory(timeOfDay);
        if (!category)
            return true;
        const now = new Date();
        const currentHour = now.getHours();
        const { start, end } = category.hourRange;
        // Handle overnight time ranges (night: 18:00-3:59)
        if (start > end) {
            return currentHour >= start || currentHour <= end;
        }
        return currentHour >= start && currentHour <= end;
    }
    /**
     * Get time label for logging
     */
    static getTimeLabel(timeOfDay) {
        if (!timeOfDay)
            return 'not-set';
        const category = this.getTimeCategory(timeOfDay);
        return category ? category.label : 'not-set';
    }
    /**
     * Get time display text with icon
     */
    static getTimeDisplayText(timeOfDay) {
        if (!timeOfDay)
            return 'Not Set';
        const category = this.getTimeCategory(timeOfDay);
        return category ? `${category.icon} ${category.label}` : 'Not Set';
    }
    /**
     * Get preferred place types for time of day
     */
    static getPreferredPlaceTypes(timeOfDay) {
        if (!timeOfDay)
            return [];
        const category = this.getTimeCategory(timeOfDay);
        return category ? category.preferredPlaceTypes : [];
    }
    /**
     * Validate time of day is within acceptable values
     */
    static validateTimeOfDay(timeOfDay) {
        if (!timeOfDay)
            return true; // null is valid (no filter)
        return exports.TIME_CATEGORIES.some(category => category.id === timeOfDay);
    }
    /**
     * Get all time categories for UI rendering
     */
    static getAllTimeCategories() {
        return [...exports.TIME_CATEGORIES];
    }
    /**
     * Get time mappings for discovery logic
     */
    static getTimeMappings() {
        return exports.TIME_CATEGORIES.map(category => ({
            id: category.id,
            label: category.label,
            description: category.description,
            preferredTypes: category.preferredPlaceTypes
        }));
    }
    /**
     * Get time ranges for API calls
     */
    static getTimeRanges() {
        return exports.TIME_CATEGORIES.reduce((acc, category) => {
            acc[category.id] = category.hourRange;
            return acc;
        }, {});
    }
    /**
     * Get time context for AI descriptions
     */
    static getTimeContext(timeOfDay) {
        if (!timeOfDay)
            return 'any time of day';
        const timeMap = {
            'morning': 'morning/breakfast',
            'afternoon': 'afternoon/lunch',
            'night': 'evening/dinner'
        };
        return timeMap[timeOfDay] || 'any time of day';
    }
}
exports.TimeUtils = TimeUtils;
// Export for backward compatibility
exports.timeCategories = exports.TIME_CATEGORIES;
// Derived exports for backward compatibility
exports.timeOptions = exports.TIME_CATEGORIES.map(category => ({
    id: category.id,
    label: category.label,
    timeRange: category.timeRange,
    description: category.description
}));
// Export utility functions for backward compatibility
exports.getTimeCategory = TimeUtils.getTimeCategory;
exports.isPlaceOpenAtTime = TimeUtils.isPlaceOpenAtTime;
exports.getTimeLabel = TimeUtils.getTimeLabel;
exports.getTimeDisplayText = TimeUtils.getTimeDisplayText;
exports.getPreferredPlaceTypes = TimeUtils.getPreferredPlaceTypes;
exports.validateTimeOfDay = TimeUtils.validateTimeOfDay;
exports.getAllTimeCategories = TimeUtils.getAllTimeCategories;
exports.getTimeMappings = TimeUtils.getTimeMappings;
exports.getTimeRanges = TimeUtils.getTimeRanges;
exports.getTimeContext = TimeUtils.getTimeContext;
//# sourceMappingURL=time-config.js.map