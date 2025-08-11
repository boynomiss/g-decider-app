/**
 * @deprecated Use UnifiedFilterService instead
 * 
 * This service has been consolidated into the new Unified Filtering System.
 * 
 * OLD:
 * import { serverFilteringService } from '@/utils/server-filtering-service';
 * 
 * NEW:
 * import { unifiedFilterService } from '@/utils/unified-filtering-system';
 */

import { unifiedFilterService } from '../../../features/filtering/services/filtering/unified-filtering-system';

// Backward compatibility wrapper
export const serverFilteringService = {
  async filterPlaces(filters: any, minResults: number = 5, useCache: boolean = true) {
    console.warn('⚠️ serverFilteringService is deprecated. Use unifiedFilterService instead.');
    return await unifiedFilterService.filterPlaces({
      ...filters,
      minResults
    });
  },
  
  getInstance() {
    console.warn('⚠️ serverFilteringService is deprecated. Use unifiedFilterService instead.');
    return this;
  }
};