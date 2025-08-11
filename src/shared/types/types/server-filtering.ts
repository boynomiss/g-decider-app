/**
 * Server Filtering Types
 * 
 * Types for server-side filtering operations
 */

import type { PlaceData } from './filtering';

// =================
// SERVER RESPONSE TYPES
// =================

export interface ServerPlaceData extends PlaceData {
  // Server-specific fields
  serverId?: string;
  processingTime?: number;
  cacheStatus?: 'hit' | 'miss' | 'stale';
}

export interface ServerFilteringResponse {
  results: ServerPlaceData[];
  performance: {
    totalTime: number;
    apiTime: number;
    processingTime: number;
  };
  metadata: {
    totalResults: number;
    filtersApplied: string[];
    cacheStatus: string;
  };
}

// =================
// SERVER FILTER TYPES
// =================

export interface ServerFilterRequest {
  filters: {
    category?: string;
    mood?: number;
    socialContext?: string;
    budget?: string;
    timeOfDay?: string;
    distance?: number;
    distanceRange?: number; // 0-100 percentage mapped to actual distances
    userLocation: {
      lat: number;
      lng: number;
    };
  };
  options?: {
    minResults?: number;
    maxResults?: number;
    useCache?: boolean;
    cacheTimeout?: number;
  };
}

export interface ServerFilterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
