/**
 * Unified Filtering System
 * 
 * Main export file for the consolidated filtering system.
 * Provides single imports for all filtering functionality.
 * 
 * IMPROVEMENTS:
 * - Centralized types in types/filtering.ts
 * - Registry pattern for config management
 * - Shared utilities to reduce duplication
 * - Performance monitoring and logging
 * - Better separation of concerns
 */

// Re-export all core types from centralized location
export {
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LoadingState,
  SearchParams,
  PlaceResult,
  ScoredPlace,
  FilterResult,
  AdvertisedPlace,
  DiscoveryFilters,
  DiscoveryResult,
  FilterServiceConfig,
  BudgetCategory,
  MoodCategory,
  SocialContextConfig,
  TimeCategory,
  CategoryFilter,
  DistanceCategory,
  FilterConfigs,
  FilterConfigType
} from '../../types/filtering';

// Re-export utilities and services
export {
  FilterCoreUtils as FilterUtilities,
  FilterValidation,
  FilterConversion,
  FilterMatching,
  FilterLogger
} from './filter-core-utils';

export {
  filterConfigRegistry,
  FilterConfigRegistry,
  getFilterConfig,
  getFilterConfigs,
  validateFilterValue,
  getFilterDisplayText,
  checkFilterCompatibility
} from './config-registry';

export { unifiedFilterService, UnifiedFilterService } from './unified-filter-service';

// Export mood analysis services
export * from './mood';

// Legacy exports for backward compatibility
export { UnifiedCacheService, unifiedCacheService } from '../data/unified-cache-service';
export { FilterAPIService } from './filter-api-service';

// Legacy type exports
export type { 
  UnifiedCacheEntry, 
  CacheConfig, 
  CacheStats 
} from '../data/unified-cache-service';

export type { 
  APIConfig, 
  APIStats 
} from './filter-api-service';

/**
 * Quick Start Guide:
 * 
 * // Modern usage with registry-based config
 * import { 
 *   unifiedFilterService, 
 *   filterConfigRegistry,
 *   FilterUtilities 
 * } from '@/utils/unified-filtering-system';
 * 
 * const params: SearchParams = {
 *   lat: 37.7749,
 *   lng: -122.4194,
 *   lookingFor: 'food',
 *   mood: 'neutral',
 *   socialContext: 'withBae',
 *   budget: '2-3'
 * };
 * 
 * const results = await unifiedFilterService.searchPlaces(params);
 * console.log(results); // Array of scored places
 * 
 * // Get config data
 * const budgetConfig = filterConfigRegistry.getConfig('budget', '2-3');
 * console.log(budgetConfig?.label); // "Moderate"
 * 
 * // Validate filters
 * const isValid = filterConfigRegistry.validateFilterValue('mood', 'neutral');
 * console.log(isValid); // true
 * 
 * // Check compatibility
 * const compatibility = filterConfigRegistry.checkCompatibility({
 *   mood: 'hype',
 *   socialContext: 'solo',
 *   budget: '0-2'
 * });
 * console.log(compatibility.isCompatible); // false (hype not great for solo)
 * 
 * // Use utilities
 * const distance = FilterUtilities.calculateDistance(
 *   37.7749, -122.4194, // San Francisco
 *   37.7849, -122.4094  // 1 mile north
 * );
 * console.log(distance); // ~1609 meters
 * 
 * // Performance monitoring
 * const monitoredFn = FilterUtilities.createPerformanceMonitor(
 *   'my-operation',
 *   async () => { return 'result'; }
 * );
 * 
 * // Legacy compatibility (deprecated but still works)
 * import { PlaceDiscoveryLogic } from '@/utils/filtering';
 * const legacy = new PlaceDiscoveryLogic(null, 'API_KEY', []);
 * const legacyResult = await legacy.discoverPlaces(filters);
 */