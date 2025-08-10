// Distance Configuration - Consolidated Settings
// This file contains all distance-related configurations used across the application

export interface DistanceCategory {
  id: string; // Required by config registry
  emoji: string;
  text: string;
  range: [number, number]; // percentage range [min, max]
  distanceMeters: { min: number; max: number };
  distanceKm: { min: number; max: number };
  label: string; // for logging and display
  percentage: number; // for discovery logic
  meters: number; // for discovery logic
}

// Single consolidated distance configuration
export const DISTANCE_CATEGORIES: DistanceCategory[] = [
  { 
    id: 'very-close',
    emoji: '📍', 
    text: 'Very Close', 
    range: [0, 10], 
    distanceMeters: { min: 0, max: 250 },
    distanceKm: { min: 0, max: 0.25 },
    label: 'very-close',
    percentage: 10,
    meters: 250
  },
  { 
    id: 'walking-distance',
    emoji: '🚶‍♀️', 
    text: 'Walking Distance', 
    range: [10, 30], 
    distanceMeters: { min: 250, max: 1000 },
    distanceKm: { min: 0.25, max: 1 },
    label: 'walking-distance',
    percentage: 30,
    meters: 1000
  },
  { 
    id: 'short-drive',
    emoji: '🚗', 
    text: 'Short Drive', 
    range: [30, 70], 
    distanceMeters: { min: 1000, max: 5000 },
    distanceKm: { min: 1, max: 5 },
    label: 'short-drive',
    percentage: 70,
    meters: 5000
  },
  { 
    id: 'long-ride',
    emoji: '🛣️', 
    text: 'Long Car Ride', 
    range: [70, 90], 
    distanceMeters: { min: 5000, max: 10000 },
    distanceKm: { min: 5, max: 10 },
    label: 'long-ride',
    percentage: 90,
    meters: 10000
  },
  { 
    id: 'far',
    emoji: '🚀', 
    text: 'As Far as It Gets', 
    range: [90, 100], 
    distanceMeters: { min: 10000, max: 20000 },
    distanceKm: { min: 10, max: 20 },
    label: 'far',
    percentage: 100,
    meters: 20000
  }
] as const;

// Utility functions for distance calculations
export class DistanceUtils {
  /**
   * Get distance category from percentage value
   */
  static getDistanceCategory(value: number): DistanceCategory {
    const normalizedValue = Math.max(0, Math.min(100, value));
    
    // Handle edge cases
    if (normalizedValue === 0) return DISTANCE_CATEGORIES[0]!; // Very Close
    if (normalizedValue === 100) return DISTANCE_CATEGORIES[4]!; // As Far as It Gets
    
    // Find the appropriate category based on ranges
    for (let i = 0; i < DISTANCE_CATEGORIES.length; i++) {
      const category = DISTANCE_CATEGORIES[i];
      if (category && normalizedValue >= category.range[0] && normalizedValue <= category.range[1]) {
        return category;
      }
    }
    
    // Fallback to first category
    return DISTANCE_CATEGORIES[0]!;
  }

  /**
   * Get distance radius in meters from percentage value
   */
  static getDistanceRadius(distanceRange: number | null): number {
    if (distanceRange === null || distanceRange === undefined) return 5000; // Default 5km radius
    
    const category = this.getDistanceCategory(distanceRange);
    return category.meters;
  }

  /**
   * Get distance label for logging
   */
  static getDistanceLabel(distanceRange: number | null): string {
    if (distanceRange === null || distanceRange === undefined) return 'not-set';
    const category = this.getDistanceCategory(distanceRange);
    return category.label;
  }

  /**
   * Get distance display text with emoji
   */
  static getDistanceDisplayText(distanceRange: number | null): string {
    if (distanceRange === null || distanceRange === undefined) return 'Not Set';
    const category = this.getDistanceCategory(distanceRange);
    return `${category.emoji} ${category.text}`;
  }

  /**
   * Get distance display text for UI components
   */
  static getDistanceLabelForUI(value: number): string {
    const category = this.getDistanceCategory(value);
    return `${category.text} (${category.distanceMeters.min}m-${category.distanceMeters.max}m)`;
  }

  /**
   * Convert distance percentage to meters for discovery logic
   */
  static getDistanceInMeters(percentage: number): number {
    const category = this.getDistanceCategory(percentage);
    return category.meters;
  }

  /**
   * Get distance category for API queries
   */
  static getDistanceCategoryForAPI(value: number): DistanceCategory {
    return this.getDistanceCategory(value);
  }

  /**
   * Validate distance percentage is within acceptable range
   */
  static validateDistancePercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100 && !isNaN(percentage);
  }

  /**
   * Get all distance categories for UI rendering
   */
  static getAllDistanceCategories(): DistanceCategory[] {
    return [...DISTANCE_CATEGORIES];
  }

  /**
   * Get distance mappings for discovery logic (derived from categories)
   */
  static getDistanceMappings() {
    return DISTANCE_CATEGORIES.map(category => ({
      percentage: category.percentage,
      meters: category.meters,
      label: category.text
    }));
  }

  /**
   * Get distance ranges for API calls (derived from categories)
   */
  static getDistanceRanges() {
    const ranges: Record<string, { min: number; max: number }> = {};
    DISTANCE_CATEGORIES.forEach(category => {
      ranges[category.label.toLowerCase().replace(/\s+/g, '-')] = {
        min: category.distanceMeters.min,
        max: category.distanceMeters.max
      };
    });
    return ranges;
  }
}

// Export for backward compatibility
export const distanceCategories = DISTANCE_CATEGORIES;

// Derived exports for backward compatibility
export const DISTANCE_MAPPINGS = DistanceUtils.getDistanceMappings();
export const DISTANCE_RANGES = DistanceUtils.getDistanceRanges();

// Export utility functions for backward compatibility
export const getDistanceCategory = DistanceUtils.getDistanceCategory;
export const getDistanceRadius = DistanceUtils.getDistanceRadius;
export const getDistanceLabel = DistanceUtils.getDistanceLabel; 