/**
 * Filtering Types
 * 
 * Defines filtering-related interfaces and types
 */

import type { PlaceResult } from '../../../features/filtering/types/filter-results';
import type { 
  ScoredPlace, 
  AdvertisedPlace, 
  FilterResult, 
  ReviewEntity, 
  MoodAnalysisResult, 
  EntityAnalysisResult 
} from '../../../features/filtering/types/filter-results';
import type {
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LegacyBudgetOption,
  SearchParams,
  UserFilters,
  ApiReadyFilterData,
  FilterApiBridge
} from '../../../features/filtering/types/filter-interfaces';

// Re-export all the imported types
export type {
  LookingForOption,
  MoodOption,
  SocialContext,
  TimeOfDay,
  BudgetOption,
  LegacyBudgetOption,
  SearchParams,
  UserFilters,
  ApiReadyFilterData,
  FilterApiBridge
};

// Expose core result types
export type { PlaceResult } from '../../../features/filtering/types/filter-results';

export type {
  ScoredPlace,
  AdvertisedPlace,
  FilterResult,
  ReviewEntity,
  MoodAnalysisResult,
  EntityAnalysisResult
};

// =================
// PLACE DATA TYPES
// =================

export interface PlaceData {
  place_id: string;
  name: string;
  address?: string;
  category: string;
  user_ratings_total: number;
  rating: number;
  reviews: ReviewEntity[];
  popular_times?: PopularTimes[];
  current_busyness?: number;
  mood_analysis?: MoodAnalysisResult;
  
  // Enhanced image data
  photos?: {
    thumbnail: string[];
    medium: string[];
    large: string[];
    count: number;
  };
  
  // Legacy images property for backward compatibility
  images?: {
    urls: string[];
  };
  
  // Enhanced contact information
  contact?: {
    website?: string;
    phone?: string;
    formattedPhone?: string;
    internationalPhone?: string;
    email?: string;
    hasContact: boolean;
  };
  
  // Contact actions for UI interactions
  contactActions?: {
    canCall: boolean;
    canVisitWebsite: boolean;
    callUrl?: string;
    websiteUrl?: string;
  };
  
  // Additional fields
  vicinity?: string;
  formatted_address?: string;
  location?: { lat: number; lng: number };
  types?: string[];
  price_level?: number;
  website?: string;
  phone?: string;
  opening_hours?: any;
  geometry?: any;
  description?: string;
  business_status?: string;
  editorial_summary?: string;
  
  // Legacy mood properties for backward compatibility
  mood_score?: number;
  final_mood?: string;
}

// PlaceMoodData is now defined in src/features/discovery/types/place-types.ts
// This interface has been removed to avoid duplication
// export interface PlaceMoodData extends PlaceData {
//   // Additional mood-specific properties
// }

export interface PopularTimes {
  day: number;
  data: {
    hour: number;
    busyness: number;
  }[];
}

// ReviewEntity is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface ReviewEntity {
//   text: string;
//   rating: number;
//   time: number; // Unix timestamp
//   entities?: EntityAnalysisResult[];
// }

// MoodAnalysisResult is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface MoodAnalysisResult {
//   score: number; // 0-100
//   category: string;
//   confidence: number; // 0-100
//   descriptors: string[];
//   source: 'entity-analysis' | 'sentiment-analysis' | 'category-mapping' | 'fallback';
// }

// EntityAnalysisResult is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface EntityAnalysisResult {
//   name: string;
//   type: string;
//   salience: number;
//   sentiment: {
//     score: number; // -1 to 1
//     magnitude: number; // 0 to infinity
//   };
// }

// =================
// FILTER RESULT TYPES
// =================

// PlaceResult is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface PlaceResult {
//   id: string;
//   name: string;
//   rating: number;
//   user_ratings_total: number;
//   category: string;
//   price_level?: number;
//   vicinity?: string;
//   location?: { lat: number; lng: number };
// }

// ScoredPlace is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface ScoredPlace extends PlaceResult {
//   score: number;
//   matchReasons: string[];
// }

// AdvertisedPlace is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface AdvertisedPlace extends PlaceResult {
//   isAdvertised: boolean;
//   adType?: string;
//   adContent?: string;
// }

// FilterResult is now defined in src/features/filtering/types/filter-results.ts
// This interface has been removed to avoid duplication
// export interface FilterResult {
//   places: ScoredPlace[];
//   totalCount: number;
//   appliedFilters: string[];
//   performance: {
//     totalTime: number;
//     filterTime: number;
//   };
// }

// =================
// DISCOVERY TYPES
// =================

// DiscoveryFilters is now defined in src/features/discovery/types/discovery-interfaces.ts
// This interface has been removed to avoid duplication

// DiscoveryResult is now defined in src/features/discovery/types/discovery-interfaces.ts
// This interface has been removed to avoid duplication
