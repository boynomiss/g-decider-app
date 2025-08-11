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
export type BudgetOption = 'P' | 'PP' | 'PPP';
export type LegacyBudgetOption = '0-2' | '2-3' | '2-4';
export type LoadingState = 'initial' | 'searching' | 'expanding-distance' | 'limit-reach' | 'complete' | 'error';

// =================
// SEARCH INTERFACES
// =================

export interface SearchParams {
  lat: number;
  lng: number;
  lookingFor: LookingForOption;
  mood: MoodOption;
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

export interface FilterApiBridge {
  logCategorySelection(value: string): ApiReadyFilterData;
  logMoodSelection(value: number): ApiReadyFilterData;
  logDistanceSelection(value: number): ApiReadyFilterData;
  logDistanceRangeSelection(value: number): ApiReadyFilterData;
  logBudgetSelection(value: any): ApiReadyFilterData;
  logSocialContextSelection(value: any): ApiReadyFilterData;
  logTimeOfDaySelection(value: any): ApiReadyFilterData;
  consolidateFiltersForApi(filters: any[]): ApiReadyFilterData;
}
