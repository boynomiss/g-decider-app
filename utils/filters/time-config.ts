// Time Configuration - Consolidated Settings
// This file contains all time-related configurations used across the application

export interface TimeCategory {
  id: 'morning' | 'afternoon' | 'night';
  label: string;
  icon: string;
  timeRange: { start: string; end: string };
  hourRange: { start: number; end: number };
  description: string;
  preferredPlaceTypes: string[];
}

// Single consolidated time configuration
export const TIME_CATEGORIES: TimeCategory[] = [
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
] as const;

// Utility functions for time calculations
export class TimeUtils {
  /**
   * Get time category from time ID
   */
  static getTimeCategory(timeId: string | null): TimeCategory | undefined {
    if (!timeId) return undefined;
    return TIME_CATEGORIES.find(category => category.id === timeId);
  }

  /**
   * Check if place is open during specified time
   */
  static isPlaceOpenAtTime(place: any, timeOfDay: string | null): boolean {
    if (!timeOfDay || !place.opening_hours?.periods) return true;
    
    const category = this.getTimeCategory(timeOfDay);
    if (!category) return true;
    
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
  static getTimeLabel(timeOfDay: string | null): string {
    if (!timeOfDay) return 'not-set';
    const category = this.getTimeCategory(timeOfDay);
    return category ? category.label : 'not-set';
  }

  /**
   * Get time display text with icon
   */
  static getTimeDisplayText(timeOfDay: string | null): string {
    if (!timeOfDay) return 'Not Set';
    const category = this.getTimeCategory(timeOfDay);
    return category ? `${category.icon} ${category.label}` : 'Not Set';
  }

  /**
   * Get preferred place types for time of day
   */
  static getPreferredPlaceTypes(timeOfDay: string | null): string[] {
    if (!timeOfDay) return [];
    const category = this.getTimeCategory(timeOfDay);
    return category ? category.preferredPlaceTypes : [];
  }

  /**
   * Validate time of day is within acceptable values
   */
  static validateTimeOfDay(timeOfDay: string | null): boolean {
    if (!timeOfDay) return true; // null is valid (no filter)
    return TIME_CATEGORIES.some(category => category.id === timeOfDay);
  }

  /**
   * Get all time categories for UI rendering
   */
  static getAllTimeCategories(): TimeCategory[] {
    return [...TIME_CATEGORIES];
  }

  /**
   * Get time mappings for discovery logic
   */
  static getTimeMappings() {
    return TIME_CATEGORIES.map(category => ({
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
    return TIME_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = category.hourRange;
      return acc;
    }, {} as Record<string, { start: number; end: number }>);
  }

  /**
   * Get time context for AI descriptions
   */
  static getTimeContext(timeOfDay: string | null): string {
    if (!timeOfDay) return 'any time of day';
    
    const timeMap = {
      'morning': 'morning/breakfast',
      'afternoon': 'afternoon/lunch',
      'night': 'evening/dinner'
    };
    return timeMap[timeOfDay as keyof typeof timeMap] || 'any time of day';
  }
}

// Export for backward compatibility
export const timeCategories = TIME_CATEGORIES;

// Derived exports for backward compatibility
export const timeOptions = TIME_CATEGORIES.map(category => ({
  id: category.id,
  label: category.label,
  timeRange: category.timeRange,
  description: category.description
}));

// Export utility functions for backward compatibility
export const getTimeCategory = TimeUtils.getTimeCategory;
export const isPlaceOpenAtTime = TimeUtils.isPlaceOpenAtTime;
export const getTimeLabel = TimeUtils.getTimeLabel;
export const getTimeDisplayText = TimeUtils.getTimeDisplayText;
export const getPreferredPlaceTypes = TimeUtils.getPreferredPlaceTypes;
export const validateTimeOfDay = TimeUtils.validateTimeOfDay;
export const getAllTimeCategories = TimeUtils.getAllTimeCategories;
export const getTimeMappings = TimeUtils.getTimeMappings;
export const getTimeRanges = TimeUtils.getTimeRanges;
export const getTimeContext = TimeUtils.getTimeContext; 