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

import { unifiedFilterService } from '../../../features/filtering/services/filtering/unified-filtering-system';

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
    results: result,
    source: 'api', // Since unifiedFilterService doesn't return metadata
    cacheHit: false, // Since unifiedFilterService doesn't return cache info
    totalResults: result.length
  };
}