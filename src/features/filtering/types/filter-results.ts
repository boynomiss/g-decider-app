/**
 * Filter Result Types
 * 
 * Defines result interfaces for filtering operations
 */

import type { MoodOption } from './filter-interfaces';

// =================
// PLACE RESULT INTERFACES
// =================

export interface PlaceResult {
  place_id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: any;
  descriptor?: string;
  tags?: string[];
  radiusUsed?: number;
  expanded?: boolean;
  raw?: any;
  mood_analysis?: MoodAnalysisResult;
  
  // Additional properties for filter utilities compatibility
  mood_score?: number; // Legacy mood score (0-100)
  final_mood?: MoodOption; // Legacy mood categorization
  category?: string; // Place category (food, activity, something-new)
  reviews?: ReviewEntity[]; // Reviews for mood analysis
  types?: string[]; // Google Places types
  price_level?: number; // Google Places price level (0-4)
  website?: string; // Place website
  phone?: string; // Place phone number
  location?: { lat: number; lng: number }; // Location coordinates
  business_status?: string; // Google Places business status
  
  // Additional properties for compatibility
  coordinates?: { lat: number; lng: number }; // Alternative location format
  images?: string[] | { urls: string[] }; // Image data for compatibility
}

export interface ScoredPlace extends PlaceResult {
  relevanceScore: number;
  qualityScore: number;
  combinedScore: number;
}

export interface FilterResult {
  passed: boolean;
  confidence: number;
  reason?: string;
}

export interface AdvertisedPlace extends PlaceResult {
  isAdvertised: true;
  advertisementDetails?: {
    campaignId: string;
    impressions: number;
    clickRate: number;
  };
}

// =================
// MOOD ANALYSIS TYPES
// =================

export interface MoodAnalysisResult {
  score: number; // 0-100
  category: MoodOption;
  confidence: number; // 0-100
  descriptors: string[];
  source: 'entity-analysis' | 'sentiment-analysis' | 'category-mapping' | 'fallback';
}

export interface EntityAnalysisResult {
  name: string;
  type: string;
  salience: number;
  sentiment: {
    score: number; // -1 to 1
    magnitude: number; // 0 to infinity
  };
}

export interface ReviewEntity {
  text: string;
  rating: number;
  time: number; // Unix timestamp
  entities?: EntityAnalysisResult[];
}
