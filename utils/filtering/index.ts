/**
 * Filtering Services Index
 * 
 * All place discovery, filtering, and mood analysis services.
 * This is the main entry point for filtering functionality.
 * 
 * IMPROVEMENTS:
 * - Registry pattern for centralized config management
 * - Shared utilities to reduce duplication
 * - Cleaner separation of concerns
 * - Better performance monitoring
 */

// ===============================
// 🎯 UNIFIED SYSTEM (Recommended)
// ===============================

export * from './unified-filtering-system';
export { unifiedFilterService, UnifiedFilterService } from './unified-filter-service';

// ===============================
// 🏗️ REGISTRY & UTILITIES (New)
// ===============================

// Registry pattern for centralized config management
export {
  filterConfigRegistry,
  FilterConfigRegistry,
  getFilterConfig,
  getFilterConfigs,
  validateFilterValue,
  getFilterDisplayText,
  checkFilterCompatibility
} from './config-registry';

// Shared utilities to reduce duplication
export {
  FilterUtilities,
  FilterValidation,
  FilterConversion,
  FilterMatching,
  FilterLogger
} from './filter-core-utils';

// ===============================
// 🔧 CORE SERVICES
// ===============================

export * from './filter-api-service';
export { FilterApiBridge } from './filter-api-service';

// Modern mood analysis services (recommended)
export * from './mood';

// ===============================
// 📋 FILTER CONFIGURATIONS
// ===============================

export * from './configs';

// ===============================
// ⚠️ LEGACY SERVICES (Deprecated)
// ===============================

// Legacy compatibility - use unified system instead
export { 
  PlaceDiscoveryLogic, 
  DiscoveryFilters, 
  DiscoveryResult, 
  LoadingState, 
  AdvertisedPlace 
} from './unified-filter-service';

// Legacy utilities (deprecated - use new FilterUtilities instead)
export * from './filter-core-utils';

// ===============================
// 📚 USAGE EXAMPLES
// ===============================

// See USAGE_EXAMPLES.md for detailed examples and usage patterns