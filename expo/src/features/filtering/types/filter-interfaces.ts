/**
 * Core Filter Interface Types
 * 
 * Defines the fundamental filter types and user-facing interfaces
 */

// =================
// CORE FILTER TYPES
// =================

export type LookingForOption = 'food' | 'activity' | 'something-new';
export type MoodOption = 'chill' | 'neutral' | 'hype';
export type SocialContext = 'solo' | 'with-bae' | 'barkada';
export type TimeOfDay = 'morning' | 'afternoon' | 'night' | 'any';
export type BudgetOption = 'P' | 'PP' | 'PPP' | null;
export type LegacyBudgetOption = '0-2' | '2-3' | '2-4';
export type LoadingState = 'initial' | 'searching' | 'expanding-distance' | 'limit-reach' | 'complete' | 'error';

// =================
// SEARCH INTERFACES
// =================

export interface SearchParams {
  lat: number;
  lng: number;
  lookingFor: LookingForOption;
  mood: number; // Changed from MoodOption to number to accept 0-100 values
  socialContext?: SocialContext;
  budget?: BudgetOption;
  timeOfDay?: TimeOfDay;
  initialRadius?: number;
  maxRadius?: number;
  minResults?: number;
  maxResults?: number;
  apiKey?: string;
  userTimezone?: string;
  strict?: boolean;
  includeMoodAnalysis?: boolean;
}

// =================
// USER FILTERS INTERFACE
// =================

export interface UserFilters {
  category?: LookingForOption;
  mood?: number;
  socialContext?: SocialContext;
  budget?: BudgetOption;
  timeOfDay?: TimeOfDay;
  distance?: number;
  distanceRange?: number; // 0-100 percentage mapped to actual distances
  userLocation?: {
    lat: number;
    lng: number;
  };
}

// =================
// FILTER API BRIDGE TYPES
// =================

export interface ApiReadyFilterData {
  category?: string;
  mood?: number;
  socialContext?: string;
  budget?: string;
  timeOfDay?: string;
  distance?: number;
  distanceRange?: number; // 0-100 percentage mapped to actual distances
  userLocation?: {
    lat: number;
    lng: number;
  };
}

// =================
// DISCOVERY INTERFACES
// =================

export interface DiscoveryFilters {
  category: LookingForOption;
  mood: number;
  socialContext?: SocialContext;
  budget?: BudgetOption;
  timeOfDay?: TimeOfDay;
  distanceRange?: number;
  userLocation: {
    lat: number;
    lng: number;
  };
}

export interface DiscoveryResult {
  success: boolean;
  places: any[];
  error?: string;
  metadata?: {
    totalResults: number;
    source: string;
    cacheHit: boolean;
  };
}

// =================
// SERVICE CONFIGURATION
// =================

export interface FilterServiceConfig {
  useCache: boolean;
  cacheExpiry: number;
  maxResults: number;
  minResults: number;
  defaultRadius: number;
  maxRadius: number;
  enableProgressiveFiltering: boolean;
  enableMoodAnalysis: boolean;
}

export interface FilterApiBridge {
  logCategorySelection(value: string): ApiReadyFilterData;
  logMoodSelection(value: number): ApiReadyFilterData;
  logDistanceSelection(value: number): ApiReadyFilterData;
  logDistanceRangeSelection(value: number): ApiReadyFilterData;
  logBudgetSelection(value: any): ApiReadyFilterData;
  logSocialContextSelection(value: any): ApiReadyFilterData;
  logTimeOfDaySelection(value: number): ApiReadyFilterData;
  consolidateFiltersForApi(filters: any[]): ApiReadyFilterData;
}
