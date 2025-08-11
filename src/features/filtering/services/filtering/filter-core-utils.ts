/**
 * Filter Core Utilities
 * 
 * Core utility functions for filter operations
 */

import { UnifiedFilters } from '../../../../services/cache/data/unified-cache-service';
import {
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LegacyBudgetOption,
  SearchParams
} from '../../types/filter-interfaces';

// =================
// INTERFACES
// =================

export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedFilters: UnifiedFilters;
}

export interface FilteringStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  resultsCount?: number;
}

// =================
// TYPE DEFINITIONS
// =================

type FilterValidator<T> = (value: T) => boolean;
type FilterMatcher<T> = (place: any, filter: T) => boolean;

// Legacy interfaces for backward compatibility
interface DiscoveryFilters {
  category?: string;
  mood?: number;
  socialContext?: string;
  budget?: string;
  timeOfDay?: string;
  distance?: number;
  userLocation?: {
    lat: number;
    lng: number;
  };
}

// =================
// VALIDATION UTILITIES
// =================

export class FilterValidation {
  static readonly VALIDATORS: Record<string, FilterValidator<any>> = {
    lookingFor: (value: LookingForOption | null) => 
      !value || ['food', 'activity', 'something-new'].includes(value),
    
    mood: (value: MoodOption | null) => 
      !value || ['chill', 'neutral', 'hype'].includes(value),
    
    socialContext: (value: SocialContext | null) => 
      !value || ['solo', 'with-bae', 'barkada'].includes(value),
    
    timeOfDay: (value: TimeOfDay | null) => 
      !value || ['morning', 'afternoon', 'night', 'any'].includes(value),
    
    budget: (value: BudgetOption | null) => 
      !value || ['P', 'PP', 'PPP'].includes(value),
    
    moodScore: (value: number | null) => 
      value === null || (typeof value === 'number' && value >= 0 && value <= 100),
    
    distanceRange: (value: number | null) => 
      value === null || (typeof value === 'number' && value >= 0 && value <= 100),
    
    coordinates: (coords: { lat: number; lng: number }) => 
      typeof coords.lat === 'number' && typeof coords.lng === 'number' && 
      coords.lat >= -90 && coords.lat <= 90 && coords.lng >= -180 && coords.lng <= 180
  };

  static validate<T>(type: keyof typeof FilterValidation.VALIDATORS, value: T): boolean {
    const validator = FilterValidation.VALIDATORS[type];
    return validator ? validator(value) : true;
  }

  static validateAll(values: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [key, value] of Object.entries(values)) {
      if (!this.validate(key, value)) {
        errors.push(`Invalid ${key}: ${value}`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Comprehensive filter validation for UnifiedFilters
   */
  static validateUnifiedFilters(filters: UnifiedFilters): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const normalizedFilters: UnifiedFilters = { ...filters };

    // Validate category
    if (filters.category && !this.isValidCategory(filters.category)) {
      errors.push(`Invalid category: ${filters.category}`);
    }

    // Validate and normalize mood
    if (filters.mood !== null) {
      if (typeof filters.mood !== 'number' || filters.mood < 0 || filters.mood > 100) {
        if (typeof filters.mood === 'number') {
          normalizedFilters.mood = Math.max(0, Math.min(100, filters.mood));
          warnings.push(`Mood normalized from ${filters.mood} to ${normalizedFilters.mood}`);
        } else {
          errors.push(`Invalid mood value: ${filters.mood}`);
        }
      }
    }

    // Validate budget
    if (filters.budget && !this.isValidBudget(filters.budget)) {
      errors.push(`Invalid budget: ${filters.budget}`);
    }

    // Validate time of day
    if (filters.timeOfDay && !this.isValidTimeOfDay(filters.timeOfDay)) {
      errors.push(`Invalid time of day: ${filters.timeOfDay}`);
    }

    // Validate social context
    if (filters.socialContext && !this.isValidSocialContext(filters.socialContext)) {
      errors.push(`Invalid social context: ${filters.socialContext}`);
    }

    // Validate and normalize distance range
    if (filters.distanceRange !== null) {
      if (typeof filters.distanceRange !== 'number' || filters.distanceRange < 0 || filters.distanceRange > 100) {
        if (typeof filters.distanceRange === 'number') {
          normalizedFilters.distanceRange = Math.max(0, Math.min(100, filters.distanceRange));
          warnings.push(`Distance range normalized from ${filters.distanceRange} to ${normalizedFilters.distanceRange}`);
        } else {
          errors.push(`Invalid distance range: ${filters.distanceRange}`);
        }
      }
    }

    // Validate location if present
    if (filters.location) {
      // Location is a string in UnifiedFilters, not coordinates
      // No validation needed for string location
    }

    // Validate filter combinations
    this.validateFilterCombinations(normalizedFilters, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalizedFilters
    };
  }

  private static validateFilterCombinations(filters: UnifiedFilters, warnings: string[]): void {
    // Check for potentially conflicting filters
    if (filters.mood !== null && filters.category === 'food') {
      if (filters.mood < 30 && filters.timeOfDay === 'night') {
        warnings.push('Low mood with night time might limit food options');
      }
    }

    if (filters.budget === 'P' && filters.socialContext === 'barkada') {
      warnings.push('Low budget with group context might limit options');
    }
  }

  private static isValidCategory(category: string): boolean {
    return ['food', 'activity', 'something-new'].includes(category);
  }

  private static isValidBudget(budget: string): boolean {
    return ['P', 'PP', 'PPP'].includes(budget);
  }

  private static isValidTimeOfDay(timeOfDay: string): boolean {
    return ['morning', 'afternoon', 'night', 'any'].includes(timeOfDay);
  }

  private static isValidSocialContext(socialContext: string): boolean {
    return ['solo', 'with-bae', 'barkada'].includes(socialContext);
  }

  private static isValidCoordinates(location: { lat: number; lng: number }): boolean {
    return typeof location.lat === 'number' && typeof location.lng === 'number' &&
           location.lat >= -90 && location.lat <= 90 &&
           location.lng >= -180 && location.lng <= 180;
  }
}

// =================
// CONVERSION UTILITIES
// =================

export class FilterConversion {
  static readonly CONVERTERS = {
    legacyToNew: {
      category: (category: string): LookingForOption => {
        if (category === 'something-new') return 'something-new';
        return category as LookingForOption;
      },
      
      mood: (moodScore: number): MoodOption => {
        if (moodScore <= 33.33) return 'chill';
        if (moodScore <= 66.66) return 'neutral';
        return 'hype';
      },
      
      socialContext: (social: string | null | undefined): SocialContext | undefined => {
        if (social === 'with-bae') return 'with-bae';
        if (social === 'solo' || social === 'barkada') return social;
        return undefined;
      },
      
      budget: (budget: string | null | undefined): LegacyBudgetOption | undefined => {
        const mapping: Record<string, LegacyBudgetOption> = {
          'P': '0-2',
          'PP': '2-3',
          'PPP': '2-4'
        };
        return budget ? mapping[budget] : undefined;
      },
      
      timeOfDay: (time: string | null | undefined): TimeOfDay => {
        if (!time) return 'any';
        return time as TimeOfDay;
      }
    },
    
    newToLegacy: {
      category: (lookingFor: LookingForOption): string => {
        if (lookingFor === 'something-new') return 'something-new';
        return lookingFor;
      },
      
      mood: (mood: MoodOption): number => {
        const mapping: Record<MoodOption, number> = {
          'chill': 25,
          'neutral': 50,
          'hype': 85
        };
        const result = mapping[mood];
        return result !== undefined ? result : 50; // Default to neutral if undefined
      },
      
      socialContext: (social: SocialContext | undefined): string | null => {
        if (social === 'with-bae') return 'with-bae';
        return social || null;
      },
      
      budget: (budget: LegacyBudgetOption | undefined): string | null => {
        const mapping: Record<LegacyBudgetOption, string> = {
          '0-2': 'P',
          '2-3': 'PP',
          '2-4': 'PPP'
        };
        return budget ? mapping[budget] : null;
      }
    }
  };

  static convertLegacyFilters(filters: DiscoveryFilters): SearchParams {
    if (!filters.userLocation) {
      throw new Error('User location is required for filter conversion');
    }

    const searchParams: SearchParams = {
      lat: filters.userLocation.lat,
      lng: filters.userLocation.lng,
      lookingFor: this.CONVERTERS.legacyToNew.category(filters.category || 'food'),
      mood: this.CONVERTERS.legacyToNew.mood(filters.mood || 50),
      timeOfDay: this.CONVERTERS.legacyToNew.timeOfDay(filters.timeOfDay),
      maxRadius: Math.min(20000, Math.max(1000, ((filters.distance || 50) / 100) * 20000)),
      minResults: 4,
      maxResults: 20
    };

    // Add apiKey only if it exists
    if (process.env.GOOGLE_MAPS_API_KEY) {
      searchParams.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    // Add optional properties only if they have values
    const socialContext = this.CONVERTERS.legacyToNew.socialContext(filters.socialContext);
    if (socialContext) {
      searchParams.socialContext = socialContext;
    }

    const legacyBudget = this.CONVERTERS.legacyToNew.budget(filters.budget);
    if (legacyBudget) {
      // Convert legacy budget format to new format
      const budgetMapping: Record<LegacyBudgetOption, BudgetOption> = {
        '0-2': 'P',
        '2-3': 'PP',
        '2-4': 'PPP'
      };
      searchParams.budget = budgetMapping[legacyBudget];
    }

    return searchParams;
  }
}

// =================
// MATCHING UTILITIES
// =================

export class FilterMatching {
  static readonly MATCHERS: Record<string, FilterMatcher<any>> = {
    placeTypes: (place: any, allowedTypes: string[]) => {
      if (!place.types || !Array.isArray(place.types)) return true;
      return place.types.some((type: string) => allowedTypes.includes(type));
    },
    
    rating: (place: any, minRating: number) => {
      if (!place.rating) return true;
      return place.rating >= minRating;
    },
    
    priceLevel: (place: any, allowedLevels: number[]) => {
      if (place.price_level === null || place.price_level === undefined) return true;
      return allowedLevels.includes(place.price_level);
    },
    
    distance: (place: any, params: { userLat: number; userLng: number; maxDistance: number }) => {
      if (!place.lat || !place.lng) return true;
      const distance = FilterCoreUtils.calculateDistance(params.userLat, params.userLng, place.lat, place.lng);
      return distance <= params.maxDistance;
    }
  };

  static match<T>(type: keyof typeof FilterMatching.MATCHERS, place: any, filter: T): boolean {
    const matcher = FilterMatching.MATCHERS[type];
    return matcher ? matcher(place, filter) : true;
  }

  // Matching helper methods for UnifiedFilters
  static isCategoryMatch(place: any, category: string): boolean {
    return place.category === category;
  }

  static isMoodMatch(place: any, mood: number): boolean {
    if (!place.mood_score) return true; // Include places without mood scores
    
    // Allow 30-point tolerance for mood matching
    return Math.abs(place.mood_score - mood) <= 30;
  }

  static isBudgetMatch(place: any, budget: string): boolean {
    if (!place.price_level) return true; // Include places without price levels
    
    switch (budget) {
      case 'P': return place.price_level <= 1;
      case 'PP': return place.price_level >= 1 && place.price_level <= 2;
      case 'PPP': return place.price_level >= 2;
      default: return true;
    }
  }

  static isSocialContextMatch(place: any, socialContext: string): boolean {
    // This would need to be enhanced with place-specific social context data
    // For now, return true (all places match all social contexts)
    return true;
  }
}

// =================
// CORE UTILITIES
// =================

export class FilterCoreUtils {
  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get distance in meters from percentage
   */
  static getDistanceInMeters(distancePercentage: number | null): number {
    if (distancePercentage === null) return 2000; // Default 2km

    // Map 0-100 percentage to 500m-10km range
    const minDistance = 500; // 500 meters
    const maxDistance = 10000; // 10 kilometers
    
    return Math.round(minDistance + (distancePercentage / 100) * (maxDistance - minDistance));
  }

  /**
   * Normalize string for comparison (lowercase, trim, remove extra spaces)
   */
  static normalizeString(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Get safe value or default
   */
  static getSafeValue<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue;
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge arrays and remove duplicates
   */
  static mergeUnique<T>(arrays: T[][]): T[] {
    const merged = arrays.flat();
    return Array.from(new Set(merged));
  }

  /**
   * Check if value is in range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Map value from one range to another
   */
  static mapRange(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    const fromRange = fromMax - fromMin;
    const toRange = toMax - toMin;
    const scaled = (value - fromMin) / fromRange;
    return toMin + (scaled * toRange);
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Remove duplicate places
   */
  static removeDuplicates(places: any[]): any[] {
    const seen = new Set<string>();
    return places.filter(place => {
      const key = place.place_id || `${place.name}-${place.address}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Apply filters to places
   */
  static applyFilters(places: any[], filters: UnifiedFilters): any[] {
    let filteredPlaces = [...places];

    // Apply category filter
    if (filters.category) {
      filteredPlaces = filteredPlaces.filter(place => 
        FilterMatching.isCategoryMatch(place, filters.category!)
      );
    }

    // Apply mood filter
    if (filters.mood !== null) {
      filteredPlaces = filteredPlaces.filter(place => 
        FilterMatching.isMoodMatch(place, filters.mood!)
      );
    }

    // Apply budget filter
    if (filters.budget) {
      filteredPlaces = filteredPlaces.filter(place => 
        FilterMatching.isBudgetMatch(place, filters.budget!)
      );
    }

    // Apply social context filter
    if (filters.socialContext) {
      filteredPlaces = filteredPlaces.filter(place => 
        FilterMatching.isSocialContextMatch(place, filters.socialContext!)
      );
    }

    return filteredPlaces;
  }

  /**
   * Rank places based on filters and relevance
   */
  static rankPlaces(places: any[], filters: UnifiedFilters): any[] {
    return places
      .map(place => ({
        place,
        score: this.calculateRelevanceScore(place, filters)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.place);
  }

  /**
   * Calculate relevance score for ranking
   */
  private static calculateRelevanceScore(place: any, filters: UnifiedFilters): number {
    let score = 0;

    // Base rating score (0-40 points)
    score += (place.rating || 0) * 8;

    // Review count bonus (0-20 points)
    const reviewCount = place.user_ratings_total || 0;
    score += Math.min(20, reviewCount / 10);

    // Mood alignment (0-20 points)
    if (filters.mood !== null && place.mood_score !== undefined) {
      const moodDiff = Math.abs(filters.mood - place.mood_score);
      score += Math.max(0, 20 - (moodDiff / 5));
    }

    // Category exact match bonus (0-10 points)
    if (filters.category && FilterMatching.isCategoryMatch(place, filters.category)) {
      score += 10;
    }

    // Budget match bonus (0-10 points)
    if (filters.budget && FilterMatching.isBudgetMatch(place, filters.budget)) {
      score += 10;
    }

    return score;
  }

  /**
   * Get list of applied filters for logging
   */
  static getAppliedFilters(filters: UnifiedFilters): string[] {
    const applied: string[] = [];

    if (filters.category) applied.push(`category:${filters.category}`);
    if (filters.mood !== null) applied.push(`mood:${filters.mood}`);
    if (filters.budget) applied.push(`budget:${filters.budget}`);
    if (filters.timeOfDay) applied.push(`time:${filters.timeOfDay}`);
    if (filters.socialContext) applied.push(`social:${filters.socialContext}`);
    if (filters.distanceRange !== null) applied.push(`distance:${filters.distanceRange}`);

    return applied;
  }

  /**
   * Get query optimization strategy
   */
  static getQueryOptimization(filters: UnifiedFilters): string {
    const appliedCount = this.getAppliedFilters(filters).length;
    
    if (appliedCount <= 2) {
      return 'simple';
    } else if (appliedCount <= 4) {
      return 'optimized';
    } else {
      return 'complex';
    }
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) break;
        
        const backoffDelay = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Create performance monitor wrapper
   */
  static createPerformanceMonitor<T>(
    name: string,
    fn: (...args: any[]) => Promise<T> | T
  ): (...args: any[]) => Promise<T> {
    return async (...args: any[]): Promise<T> => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const duration = performance.now() - start;
        
        if (duration > 1000) {
          console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`❌ Failed operation: ${name} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }
}

// =================
// PROGRESS TRACKING
// =================

export class FilterProgress {
  private static readonly FILTERING_STEPS: FilteringStep[] = [
    {
      step: 1,
      name: 'Validation',
      description: 'Validating filter parameters',
      status: 'pending'
    },
    {
      step: 2,
      name: 'Conversion',
      description: 'Converting filters to search format',
      status: 'pending'
    },
    {
      step: 3,
      name: 'Matching',
      description: 'Matching places to filters',
      status: 'pending'
    },
    {
      step: 4,
      name: 'Ranking',
      description: 'Ranking results by relevance',
      status: 'pending'
    },
    {
      step: 5,
      name: 'Optimization',
      description: 'Applying query optimizations',
      status: 'pending'
    }
  ];

  static updateProgress(stepNumber: number, status: FilteringStep['status'], resultsCount?: number): FilteringStep[] {
    return FilterProgress.FILTERING_STEPS.map(step => {
      if (step.step === stepNumber) {
        return { ...step, status, ...(resultsCount !== undefined && { resultsCount }) };
      }
      return step;
    });
  }

  static getFilteringSteps(): FilteringStep[] {
    return [...FilterProgress.FILTERING_STEPS];
  }
}

// =================
// EXPORTS
// =================

export {
  FilterValidation as Validation,
  FilterConversion as Conversion,
  FilterMatching as Matching,
  FilterCoreUtils as Utils,
  FilterProgress as Progress
};

// Backward compatibility exports
export const validateFilter = FilterValidation.validate;
export const validateUnifiedFilters = FilterValidation.validateUnifiedFilters;
export const convertLegacyFilters = FilterConversion.convertLegacyFilters;
export const matchPlace = FilterMatching.match;
export const calculateDistance = FilterCoreUtils.calculateDistance;
export const getDistanceInMeters = FilterCoreUtils.getDistanceInMeters;
export const removeDuplicates = FilterCoreUtils.removeDuplicates;
export const applyFilters = FilterCoreUtils.applyFilters;
export const rankPlaces = FilterCoreUtils.rankPlaces;
export const getAppliedFilters = FilterCoreUtils.getAppliedFilters;
export const getQueryOptimization = FilterCoreUtils.getQueryOptimization;
export const updateProgress = FilterProgress.updateProgress;
export const getFilteringSteps = FilterProgress.getFilteringSteps; 