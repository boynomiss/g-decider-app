/**
 * Filter Service Types
 * 
 * Defines service configuration and utility types for filtering
 */

import type { TimeOfDay } from './filter-interfaces';

// =================
// SERVICE INTERFACES
// =================

export interface FilterServiceConfig {
  // Cache settings
  useCache: boolean;
  cacheStrategy: 'cache-first' | 'api-first' | 'hybrid';
  cacheExpiry: number; // milliseconds
  
  // API settings
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  
  // Discovery settings
  minResults: number;
  maxResults: number;
  expansionEnabled: boolean;
  maxExpansions: number;
  expansionIncrement: number; // meters
  
  // Performance settings
  parallelRequests: boolean;
  requestBatching: boolean;
  batchSize: number;
  
  // Filtering settings
  strictMode: boolean;
  confidenceThreshold: number;
  qualityThreshold: number;
  
  // Time settings
  defaultTimezone: string;
  timeRanges: Record<TimeOfDay, {startHour: number; endHour: number}>;
}

// =================
// UTILITY TYPES
// =================

export type FilterValidator<T> = (value: T | null | undefined) => boolean;
export type FilterConverter<T, U> = (value: T) => U;
export type FilterMatcher<T> = (item: any, filter: T) => boolean;

export interface FilterUtilityMethods<T> {
  validate: FilterValidator<T>;
  getLabel: (value: T | null) => string;
  getDisplayText: (value: T | null) => string;
  getPreferredPlaceTypes: (value: T | null) => string[];
}
