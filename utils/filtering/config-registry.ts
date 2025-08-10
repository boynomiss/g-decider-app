/**
 * Filter Configuration Registry
 * 
 * Centralized registry for all filter configurations.
 * Provides single point of access to all filter configs with caching and validation.
 */

import {
  FilterConfigs,
  FilterConfigType,
  BudgetCategory,
  MoodCategory,
  SocialContextConfig,
  TimeCategory,
  CategoryFilter,
  DistanceCategory,
  BudgetOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  LookingForOption
} from '../../types/filtering';

import { FilterValidation } from './filter-core-utils';
import { ConsolidatedFilterLogger } from './filter-logger';

// Import individual config files
import { BUDGET_CATEGORIES } from './configs/budget-config';
import { MOOD_CATEGORIES } from './configs/mood-config';
import { SOCIAL_CONTEXTS } from './configs/social-config';
import { TIME_CATEGORIES } from './configs/time-config';
import { CATEGORY_FILTERS } from './configs/category-config';
import { DISTANCE_CATEGORIES } from './configs/distance-config';

// =================
// CONFIG REGISTRY CLASS
// =================

export class FilterConfigRegistry {
  private static instance: FilterConfigRegistry;
  private configs: FilterConfigs;
  private configCache: Map<string, any> = new Map();
  private initialized: boolean = false;

  private constructor() {
    this.initializeConfigs();
  }

  static getInstance(): FilterConfigRegistry {
    if (!FilterConfigRegistry.instance) {
      FilterConfigRegistry.instance = new FilterConfigRegistry();
    }
    return FilterConfigRegistry.instance;
  }

  /**
   * Initialize all configurations
   */
  private initializeConfigs(): void {
    try {
      this.configs = {
        budget: BUDGET_CATEGORIES as BudgetCategory[],
        mood: MOOD_CATEGORIES as MoodCategory[],
        social: SOCIAL_CONTEXTS as SocialContextConfig[],
        time: TIME_CATEGORIES as TimeCategory[],
        category: CATEGORY_FILTERS as CategoryFilter[],
        distance: DISTANCE_CATEGORIES as DistanceCategory[]
      };

      this.validateConfigs();
      this.buildCache();
      this.initialized = true;

      ConsolidatedFilterLogger.getInstance().info('config-registry', 'Filter configuration registry initialized successfully');
    } catch (error) {
      ConsolidatedFilterLogger.getInstance().error('config-registry', 'Failed to initialize filter configuration registry', error);
      throw error;
    }
  }

  /**
   * Validate all configurations
   */
  private validateConfigs(): void {
    const errors: string[] = [];

    // Validate each config type
    for (const [type, configs] of Object.entries(this.configs)) {
      if (!Array.isArray(configs)) {
        errors.push(`${type} config is not an array`);
        continue;
      }

      configs.forEach((config, index) => {
        if (!config.id) {
          errors.push(`${type}[${index}] missing id`);
        }
        if (!config.label) {
          errors.push(`${type}[${index}] missing label`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Config validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Build lookup cache for fast access
   */
  private buildCache(): void {
    this.configCache.clear();

    // Build lookups for each config type
    for (const [type, configs] of Object.entries(this.configs)) {
      const lookup = new Map();
      configs.forEach((config: any) => {
        lookup.set(config.id, config);
      });
      this.configCache.set(`${type}_lookup`, lookup);
    }

    // Build specialized lookups
    this.buildSpecializedCaches();
  }

  /**
   * Build specialized cache lookups
   */
  private buildSpecializedCaches(): void {
    // Mood score range lookup
    const moodRangeLookup = new Map();
    this.configs.mood.forEach(mood => {
      for (let score = mood.scoreRange.min; score <= mood.scoreRange.max; score++) {
        moodRangeLookup.set(score, mood);
      }
    });
    this.configCache.set('mood_score_lookup', moodRangeLookup);

    // Distance range lookup
    const distanceRangeLookup = new Map();
    this.configs.distance.forEach(distance => {
      for (let pct = distance.range[0]; pct <= distance.range[1]; pct++) {
        distanceRangeLookup.set(pct, distance);
      }
    });
    this.configCache.set('distance_range_lookup', distanceRangeLookup);

    // Place type to configs lookup
    const placeTypeToConfigs = new Map();
    ['budget', 'mood', 'social', 'time', 'category'].forEach(configType => {
      const configs = this.configs[configType as keyof FilterConfigs];
      configs.forEach((config: any) => {
        if (config.preferredPlaceTypes) {
          config.preferredPlaceTypes.forEach((placeType: string) => {
            if (!placeTypeToConfigs.has(placeType)) {
              placeTypeToConfigs.set(placeType, new Set());
            }
            placeTypeToConfigs.get(placeType).add({ type: configType, config });
          });
        }
      });
    });
    this.configCache.set('place_type_lookup', placeTypeToConfigs);
  }

  // =================
  // PUBLIC API METHODS
  // =================

  /**
   * Get all configs for a specific type
   */
  getConfigs<T extends FilterConfigType>(type: T): FilterConfigs[T] {
    this.ensureInitialized();
    return this.configs[type];
  }

  /**
   * Get specific config by type and id
   */
  getConfig<T extends FilterConfigType>(type: T, id: string): FilterConfigs[T][0] | undefined {
    this.ensureInitialized();
    const lookup = this.configCache.get(`${type}_lookup`);
    return lookup?.get(id);
  }

  /**
   * Get mood config by score (0-100)
   */
  getMoodByScore(score: number): MoodCategory | undefined {
    this.ensureInitialized();
    const lookup = this.configCache.get('mood_score_lookup');
    return lookup?.get(Math.round(score));
  }

  /**
   * Get distance config by percentage (0-100)
   */
  getDistanceByPercentage(percentage: number): DistanceCategory | undefined {
    this.ensureInitialized();
    const lookup = this.configCache.get('distance_range_lookup');
    return lookup?.get(Math.round(percentage));
  }

  /**
   * Get all configs that support a specific place type
   */
  getConfigsByPlaceType(placeType: string): Array<{ type: string; config: any }> {
    this.ensureInitialized();
    const lookup = this.configCache.get('place_type_lookup');
    const results = lookup?.get(placeType);
    return results ? Array.from(results) : [];
  }

  /**
   * Get preferred place types for specific filter values
   */
  getPreferredPlaceTypes(filters: {
    budget?: BudgetOption;
    mood?: MoodOption;
    socialContext?: SocialContext;
    timeOfDay?: TimeOfDay;
    lookingFor?: LookingForOption;
  }): string[] {
    this.ensureInitialized();
    
    const allTypes: string[] = [];

    if (filters.budget) {
      const config = this.getConfig('budget', filters.budget);
      if (config) allTypes.push(...config.preferredPlaceTypes);
    }

    if (filters.mood) {
      const config = this.getConfig('mood', filters.mood);
      if (config) allTypes.push(...config.preferredPlaceTypes);
    }

    if (filters.socialContext) {
      const config = this.getConfig('social', filters.socialContext);
      if (config) allTypes.push(...config.preferredPlaceTypes);
    }

    if (filters.timeOfDay && filters.timeOfDay !== 'any') {
      const config = this.getConfig('time', filters.timeOfDay);
      if (config) allTypes.push(...config.preferredPlaceTypes);
    }

    if (filters.lookingFor) {
      const config = this.getConfig('category', filters.lookingFor);
      if (config) allTypes.push(...config.preferredPlaceTypes);
    }

    // Remove duplicates and return
    return Array.from(new Set(allTypes));
  }

  /**
   * Get all atmosphere keywords for specific filter values
   */
  getAtmosphereKeywords(filters: {
    mood?: MoodOption;
    socialContext?: SocialContext;
    lookingFor?: LookingForOption;
  }): string[] {
    this.ensureInitialized();
    
    const allKeywords: string[] = [];

    if (filters.mood) {
      const config = this.getConfig('mood', filters.mood);
      if (config?.atmosphereKeywords) allKeywords.push(...config.atmosphereKeywords);
    }

    if (filters.socialContext) {
      const config = this.getConfig('social', filters.socialContext);
      if (config?.atmosphereKeywords) allKeywords.push(...config.atmosphereKeywords);
    }

    if (filters.lookingFor) {
      const config = this.getConfig('category', filters.lookingFor);
      if (config?.atmosphereKeywords) allKeywords.push(...config.atmosphereKeywords);
    }

    return Array.from(new Set(allKeywords));
  }

  /**
   * Get all activity suggestions for specific filter values
   */
  getActivitySuggestions(filters: {
    mood?: MoodOption;
    socialContext?: SocialContext;
    lookingFor?: LookingForOption;
  }): string[] {
    this.ensureInitialized();
    
    const allSuggestions: string[] = [];

    if (filters.mood) {
      const config = this.getConfig('mood', filters.mood);
      if (config?.activitySuggestions) allSuggestions.push(...config.activitySuggestions);
    }

    if (filters.socialContext) {
      const config = this.getConfig('social', filters.socialContext);
      if (config?.activitySuggestions) allSuggestions.push(...config.activitySuggestions);
    }

    if (filters.lookingFor) {
      const config = this.getConfig('category', filters.lookingFor);
      if (config?.activitySuggestions) allSuggestions.push(...config.activitySuggestions);
    }

    return Array.from(new Set(allSuggestions));
  }

  /**
   * Check compatibility between filter values
   */
  checkCompatibility(filters: {
    mood?: MoodOption | number;
    socialContext?: SocialContext;
    budget?: BudgetOption;
    timeOfDay?: TimeOfDay;
    lookingFor?: LookingForOption;
  }): { isCompatible: boolean; issues: string[] } {
    this.ensureInitialized();
    
    const issues: string[] = [];

    // Convert mood score to mood option if needed
    let moodOption: MoodOption | undefined;
    if (typeof filters.mood === 'number') {
      const moodConfig = this.getMoodByScore(filters.mood);
      moodOption = moodConfig?.id;
    } else {
      moodOption = filters.mood;
    }

    // Check mood-social compatibility
    if (moodOption && filters.socialContext) {
      const moodConfig = this.getConfig('mood', moodOption);
      if (moodConfig && !moodConfig.socialCompatibility.includes(filters.socialContext)) {
        issues.push(`${moodOption} mood not compatible with ${filters.socialContext} social context`);
      }
    }

    // Check mood-budget compatibility
    if (moodOption && filters.budget) {
      const moodConfig = this.getConfig('mood', moodOption);
      if (moodConfig && !moodConfig.budgetPreferences.includes(filters.budget)) {
        issues.push(`${moodOption} mood not optimal for ${filters.budget} budget`);
      }
    }

    // Check mood-time compatibility
    if (moodOption && filters.timeOfDay && filters.timeOfDay !== 'any') {
      const moodConfig = this.getConfig('mood', moodOption);
      if (moodConfig && !moodConfig.timeCompatibility.includes(filters.timeOfDay)) {
        issues.push(`${moodOption} mood not optimal for ${filters.timeOfDay} time`);
      }
    }

    return {
      isCompatible: issues.length === 0,
      issues
    };
  }

  /**
   * Get display text for filter value
   */
  getDisplayText(type: FilterConfigType, id: string): string {
    this.ensureInitialized();
    
    const config = this.getConfig(type, id);
    if (!config) return 'Unknown';

    // Handle different display formats
    if ('icon' in config && 'label' in config) {
      return `${config.icon} ${config.label}`;
    }
    if ('display' in config && 'label' in config) {
      return `${config.display} ${config.label}`;
    }
    if ('emoji' in config && 'text' in config) {
      return `${config.emoji} ${config.text}`;
    }
    
    return config.label || config.id || 'Unknown';
  }

  /**
   * Validate filter value
   */
  validateFilterValue(type: FilterConfigType, value: any): boolean {
    this.ensureInitialized();
    
    if (value === null || value === undefined) return true;
    
    const config = this.getConfig(type, value);
    return config !== undefined;
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    initialized: boolean;
    configCounts: Record<FilterConfigType, number>;
    cacheSize: number;
    memoryUsage: string;
  } {
    return {
      initialized: this.initialized,
      configCounts: {
        budget: this.configs.budget.length,
        mood: this.configs.mood.length,
        social: this.configs.social.length,
        time: this.configs.time.length,
        category: this.configs.category.length,
        distance: this.configs.distance.length
      },
      cacheSize: this.configCache.size,
      memoryUsage: `${Math.round(JSON.stringify(this.configs).length / 1024)}KB`
    };
  }

  /**
   * Refresh registry (reload configs)
   */
  refresh(): void {
    ConsolidatedFilterLogger.getInstance().info('config-registry', 'Refreshing filter configuration registry');
    this.initialized = false;
    this.configCache.clear();
    this.initializeConfigs();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.configCache.clear();
    this.buildCache();
    ConsolidatedFilterLogger.getInstance().info('config-registry', 'Filter configuration cache cleared and rebuilt');
  }

  /**
   * Ensure registry is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Filter configuration registry not initialized');
    }
  }
}

// =================
// SINGLETON INSTANCE
// =================

export const filterConfigRegistry = FilterConfigRegistry.getInstance();

// =================
// CONVENIENCE METHODS
// =================

/**
 * Quick access to get config
 */
export function getFilterConfig<T extends FilterConfigType>(
  type: T,
  id: string
): FilterConfigs[T][0] | undefined {
  return filterConfigRegistry.getConfig(type, id);
}

/**
 * Quick access to get all configs of a type
 */
export function getFilterConfigs<T extends FilterConfigType>(type: T): FilterConfigs[T] {
  return filterConfigRegistry.getConfigs(type);
}

/**
 * Quick access to validate filter value
 */
export function validateFilterValue(type: FilterConfigType, value: any): boolean {
  return filterConfigRegistry.validateFilterValue(type, value);
}

/**
 * Quick access to get display text
 */
export function getFilterDisplayText(type: FilterConfigType, id: string): string {
  return filterConfigRegistry.getDisplayText(type, id);
}

/**
 * Quick access to check compatibility
 */
export function checkFilterCompatibility(filters: {
  mood?: MoodOption | number;
  socialContext?: SocialContext;
  budget?: BudgetOption;
  timeOfDay?: TimeOfDay;
  lookingFor?: LookingForOption;
}): { isCompatible: boolean; issues: string[] } {
  return filterConfigRegistry.checkCompatibility(filters);
}

// =================
// BACKWARD COMPATIBILITY
// =================

// Legacy method names
export const getConfig = getFilterConfig;
export const getConfigs = getFilterConfigs;
export const validateConfig = validateFilterValue;
export const getDisplayText = getFilterDisplayText;
export const checkCompatibility = checkFilterCompatibility;

// Export registry instance for direct access
export default filterConfigRegistry;