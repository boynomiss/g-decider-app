/**
 * Shared Types Index
 * 
 * Re-exports all types from feature-specific type files
 * This maintains backward compatibility while organizing types by feature
 */

// =================
// FEATURE-SPECIFIC TYPES
// =================

// Filtering types
export type * from '../../../features/filtering/types';

// Discovery types
export type * from '../../../features/discovery/types';

// Auth types
export type * from '../../../features/auth/types';

// Booking types
export type * from '../../../features/booking/types';

// Saved places types
export type * from '../../../features/saved-places/types';

// Monetization types
export type * from '../../../features/monetization/types';

// =================
// SERVICE TYPES (Re-exported to avoid duplication)
// =================

// Cache service types (including UnifiedFilters)
export type { UnifiedFilters } from '../../../services/cache/data/unified-cache-service';

// =================
// SHARED TYPES (Cross-cutting)
// =================

export type * from './shared-types';
export type * from './server-filtering';
