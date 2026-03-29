"use strict";
// Social Context Configuration - Consolidated Settings
// This file contains all social context-related configurations used across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtmosphereKeywords = exports.getActivitySuggestions = exports.isCompatibleWithMood = exports.getGroupSize = exports.getSocialContextForAI = exports.getSocialContextMappingsForAPI = exports.getSocialContextMappings = exports.getAllSocialContexts = exports.validateSocialContext = exports.getPreferredPlaceTypes = exports.getSocialContextDisplayText = exports.getSocialContextLabel = exports.isPlaceCompatibleWithSocialContext = exports.getSocialContext = exports.socialOptions = exports.socialContexts = exports.SocialUtils = exports.SOCIAL_CONTEXTS = void 0;
// Single consolidated social context configuration
exports.SOCIAL_CONTEXTS = [
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
];
// Utility functions for social context calculations
class SocialUtils {
    /**
     * Get social context from context ID
     */
    static getSocialContext(contextId) {
        if (!contextId)
            return undefined;
        return exports.SOCIAL_CONTEXTS.find(context => context.id === contextId);
    }
    /**
     * Check if place is compatible with social context
     */
    static isPlaceCompatibleWithSocialContext(place, socialContext) {
        if (!socialContext || !place.types)
            return true;
        const context = SocialUtils.getSocialContext(socialContext);
        if (!context)
            return true;
        return place.types.some((type) => context.preferredPlaceTypes.includes(type));
    }
    /**
     * Get social context label for logging
     */
    static getSocialContextLabel(socialContext) {
        if (!socialContext)
            return 'not-set';
        const context = this.getSocialContext(socialContext);
        return context ? context.label : 'not-set';
    }
    /**
     * Get social context display text with icon
     */
    static getSocialContextDisplayText(socialContext) {
        if (!socialContext)
            return 'Not Set';
        const context = SocialUtils.getSocialContext(socialContext);
        return context ? `${context.icon} ${context.label}` : 'Not Set';
    }
    /**
     * Get preferred place types for social context
     */
    static getPreferredPlaceTypes(socialContext) {
        if (!socialContext)
            return [];
        const context = SocialUtils.getSocialContext(socialContext);
        return context ? context.preferredPlaceTypes : [];
    }
    /**
     * Validate social context is within acceptable values
     */
    static validateSocialContext(socialContext) {
        if (!socialContext)
            return true; // null is valid (no filter)
        return exports.SOCIAL_CONTEXTS.some(context => context.id === socialContext);
    }
    /**
     * Get all social contexts for UI rendering
     */
    static getAllSocialContexts() {
        return [...exports.SOCIAL_CONTEXTS];
    }
    /**
     * Get social context mappings for discovery logic
     */
    static getSocialContextMappings() {
        return exports.SOCIAL_CONTEXTS.map(context => ({
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
        return exports.SOCIAL_CONTEXTS.reduce((acc, context) => {
            acc[context.id] = context.preferredPlaceTypes;
            return acc;
        }, {});
    }
    /**
     * Get social context for AI descriptions
     */
    static getSocialContextForAI(socialContext) {
        if (!socialContext)
            return 'any social setting';
        const contextMap = {
            'solo': 'solo/individual',
            'with-bae': 'couple/romantic',
            'barkada': 'group/social'
        };
        return contextMap[socialContext] || 'any social setting';
    }
    /**
     * Get group size for social context
     */
    static getGroupSize(socialContext) {
        if (!socialContext)
            return null;
        const context = SocialUtils.getSocialContext(socialContext);
        return context ? context.groupSize : null;
    }
    /**
     * Check if social context is compatible with mood
     */
    static isCompatibleWithMood(socialContext, mood) {
        if (!socialContext)
            return true;
        const context = SocialUtils.getSocialContext(socialContext);
        if (!context)
            return true;
        // Convert mood to category
        let moodCategory;
        if (mood <= 33.33)
            moodCategory = 'chill';
        else if (mood <= 66.66)
            moodCategory = 'neutral';
        else
            moodCategory = 'hype';
        return context.moodCompatibility.includes(moodCategory);
    }
    /**
     * Get activity suggestions for social context
     */
    static getActivitySuggestions(socialContext) {
        if (!socialContext)
            return [];
        const context = SocialUtils.getSocialContext(socialContext);
        return context ? context.activitySuggestions : [];
    }
    /**
     * Get atmosphere keywords for social context
     */
    static getAtmosphereKeywords(socialContext) {
        if (!socialContext)
            return [];
        const context = SocialUtils.getSocialContext(socialContext);
        return context ? context.atmosphereKeywords : [];
    }
}
exports.SocialUtils = SocialUtils;
// Export for backward compatibility
exports.socialContexts = exports.SOCIAL_CONTEXTS;
// Derived exports for backward compatibility
exports.socialOptions = exports.SOCIAL_CONTEXTS.map(context => ({
    id: context.id,
    label: context.label,
    icon: context.icon,
    groupSize: context.groupSize,
    placeTypes: context.preferredPlaceTypes,
    description: context.description
}));
// Export utility functions for backward compatibility
exports.getSocialContext = SocialUtils.getSocialContext;
exports.isPlaceCompatibleWithSocialContext = SocialUtils.isPlaceCompatibleWithSocialContext;
exports.getSocialContextLabel = SocialUtils.getSocialContextLabel;
exports.getSocialContextDisplayText = SocialUtils.getSocialContextDisplayText;
exports.getPreferredPlaceTypes = SocialUtils.getPreferredPlaceTypes;
exports.validateSocialContext = SocialUtils.validateSocialContext;
exports.getAllSocialContexts = SocialUtils.getAllSocialContexts;
exports.getSocialContextMappings = SocialUtils.getSocialContextMappings;
exports.getSocialContextMappingsForAPI = SocialUtils.getSocialContextMappingsForAPI;
exports.getSocialContextForAI = SocialUtils.getSocialContextForAI;
exports.getGroupSize = SocialUtils.getGroupSize;
exports.isCompatibleWithMood = SocialUtils.isCompatibleWithMood;
exports.getActivitySuggestions = SocialUtils.getActivitySuggestions;
exports.getAtmosphereKeywords = SocialUtils.getAtmosphereKeywords;
//# sourceMappingURL=social-config.js.map