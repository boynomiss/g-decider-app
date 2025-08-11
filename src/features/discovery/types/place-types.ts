/**
 * Place Types
 * 
 * Defines place data structures and mood analysis interfaces
 */

import type { 
  MoodOption,
  BudgetOption,
  SocialContext,
  TimeOfDay,
  LookingForOption
} from '../../filtering/types';

// =================
// PLACE DATA TYPES
// =================

export interface Suggestion {
  id: string;
  name: string;
  location: string;
  images: string[];
  budget: BudgetOption;
  tags: string[];
  description: string;
  openHours: string;
  discount?: string;
  category: LookingForOption;
  mood: MoodOption;
  socialContext: SocialContext[];
  timeOfDay: TimeOfDay[];
  rating: number;
  reviews: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  website?: string;
  phone?: string;
  price_level?: number;
  types?: string[];
  business_status?: string;
  editorial_summary?: string;
  vicinity?: string;
  formatted_address?: string;
  
  // Legacy mood properties for backward compatibility
  mood_score?: number;
  final_mood?: MoodOption;
}

// =================
// PLACE MOOD DATA TYPES
// =================

export interface PlaceMoodData extends Suggestion {
  // Additional mood-specific properties
  mood_analysis?: MoodAnalysisResult;
  popular_times?: PopularTimes[];
  current_busyness?: number;
  
  // Enhanced image data
  photos?: {
    thumbnail: string[];
    medium: string[];
    large: string[];
    count: number;
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

export interface PopularTimes {
  day: number;
  data: {
    hour: number;
    busyness: number;
  }[];
}

// =================
// MOOD SERVICE INTERFACES
// =================

export interface EntityMoodInsights {
  entities: EntityAnalysisResult[];
  overallSentiment: number;
  dominantEmotions: string[];
}

export interface MoodAnalysisConfig {
  enableEntityAnalysis: boolean;
  enableSentimentAnalysis: boolean;
  enableCategoryMapping: boolean;
  confidenceThreshold: number;
  maxEntities: number;
}

// =================
// MOOD SERVICE INTERFACES
// =================

export interface IMoodAnalysisService {
  analyzeMood(text: string): Promise<MoodAnalysisResult>;
  analyzeEntities(text: string): Promise<EntityAnalysisResult[]>;
}

export interface IEntityMoodService {
  analyzeEntityMood(entities: EntityAnalysisResult[]): Promise<EntityMoodInsights>;
}

export interface PlaceMoodService {
  analyzePlaceMood(place: PlaceMoodData): Promise<MoodAnalysisResult>;
  getPopularTimes(place: PlaceMoodData): PopularTimes[];
  getCurrentBusyness(place: PlaceMoodData): number | null;
}

// =================
// MOOD CONFIGURATION
// =================

export interface MoodConfig {
  // Mood analysis settings
  enableRealTimeAnalysis: boolean;
  enableHistoricalAnalysis: boolean;
  enablePredictiveAnalysis: boolean;
  
  // Performance settings
  analysisTimeout: number;
  maxRetries: number;
  cacheExpiry: number;
  
  // Quality settings
  minConfidence: number;
  minEntitySalience: number;
  maxEntitiesPerAnalysis: number;
}
