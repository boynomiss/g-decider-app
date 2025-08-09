/**
 * Data Management Index
 * 
 * Caching services, data conversion, and storage utilities.
 */

// 💾 CACHING
export * from './unified-cache-service';

// 🔄 DATA CONVERSION
export * from './server-data-converter';

// ⚠️ LEGACY (Deprecated but maintained for compatibility)
export * from './enhanced-filtering-with-cache';
export * from './server-filtering-service';

/**
 * Quick Start:
 * 
 * // Main caching service
 * import { unifiedCacheService } from '@/utils/data';
 * 
 * // Data conversion utilities
 * import { convertServerPlaceToPlaceData } from '@/utils/data';
 */