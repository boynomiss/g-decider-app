/**
 * @deprecated Use UnifiedFilterService instead
 * 
 * This function has been consolidated into the new Unified Filtering System.
 * 
 * OLD:
 * import { enhancedFilterWithCache } from '@/utils/enhanced-filtering-with-cache';
 * 
 * NEW:
 * import { unifiedFilterService } from '@/utils/unified-filtering-system';
 */

import { unifiedFilterService } from '../filtering/unified-filtering-system';

// Backward compatibility wrapper
export async function enhancedFilterWithCache(
  filters: any,
  minResults: number = 5,
  useCache: boolean = true
) {
  console.warn('⚠️ enhancedFilterWithCache is deprecated. Use unifiedFilterService.filterPlaces() instead.');
  
  const result = await unifiedFilterService.filterPlaces({
    ...filters,
    minResults
  });
  
  return {
    results: result.places,
    source: result.metadata.source,
    cacheHit: result.metadata.cacheHit,
    totalResults: result.metadata.totalResults
  };
}