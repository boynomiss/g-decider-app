/**
 * Core Filtering Types
 * 
 * Centralized type definitions for the entire filtering system.
 * This file serves as the single source of truth for all filtering-related types.
 */

// =================
// CORE FILTER TYPES
// =================

export type LookingForOption = 'food' | 'activity' | 'something_new';
export type MoodOption = 'chill' | 'neutral' | 'hype';
export type SocialContext = 'solo' | 'withBae' | 'barkada';
export type TimeOfDay = 'morning' | 'afternoon' | 'night' | 'any';
export type BudgetOption = '0-2' | '2-3' | '2-4';
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
  includeMoodAnalysis?: boolean; // Enable mood analysis for results
}

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
  mood_analysis?: MoodAnalysisResult; // Optional mood analysis data
  
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

// =================
// LEGACY COMPATIBILITY TYPES
// =================

export interface AdvertisedPlace extends PlaceResult {
  isAdvertised: true;
  advertisementDetails?: {
    campaignId: string;
    impressions: number;
    clickRate: number;
  };
}

export interface DiscoveryFilters {
  category: 'food' | 'activity' | 'something-new';
  mood: number; // 0-100
  socialContext?: 'solo' | 'with-bae' | 'barkada' | null;
  budget?: 'P' | 'PP' | 'PPP' | null;
  timeOfDay?: 'morning' | 'afternoon' | 'night' | null;
  distanceRange: number; // 0-100 (mapped to actual distances)
  userLocation: {
    lat: number;
    lng: number;
  };
}

export interface DiscoveryResult {
  places: (PlaceResult | AdvertisedPlace)[];
  loadingState: LoadingState;
  expansionInfo?: {
    expansionCount: number;
    finalRadius: number;
    totalPlacesFound: number;
  };
  poolInfo: {
    remainingPlaces: number;
    totalPoolSize: number;
    needsRefresh: boolean;
  };
}

// =================
// CONFIG INTERFACES
// =================

export interface BudgetCategory {
  id: BudgetOption;
  display: string;
  label: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
  description: string;
  preferredPlaceTypes: string[];
}

export interface MoodCategory {
  id: MoodOption;
  label: string;
  icon: string;
  scoreRange: { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  socialCompatibility: SocialContext[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  energyLevel: 'low' | 'medium' | 'high';
  colorScheme: string;
}

export interface SocialContextConfig {
  id: SocialContext;
  label: string;
  icon: string;
  groupSize: number | { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: MoodOption[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
}

export interface TimeCategory {
  id: TimeOfDay;
  label: string;
  icon: string;
  timeRange: { start: string; end: string };
  hourRange: { start: number; end: number };
  description: string;
  preferredPlaceTypes: string[];
}

export interface CategoryFilter {
  id: LookingForOption;
  label: string;
  icon: string;
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: MoodOption[];
  socialCompatibility: SocialContext[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  searchKeywords: string[];
  priority: number;
}

export interface DistanceCategory {
  emoji: string;
  text: string;
  range: [number, number]; // percentage range [min, max]
  distanceMeters: { min: number; max: number };
  distanceKm: { min: number; max: number };
  label: string; // for logging and display
  percentage: number; // for discovery logic
  meters: number; // for discovery logic
}

// =================
// FILTER CONFIG COLLECTION
// =================

export interface FilterConfigs {
  budget: BudgetCategory[];
  mood: MoodCategory[];
  social: SocialContextConfig[];
  time: TimeCategory[];
  category: CategoryFilter[];
  distance: DistanceCategory[];
}

export type FilterConfigType = keyof FilterConfigs;

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

export interface SentimentAnalysis {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to infinity (intensity)
  keywords: string[];
  entities: EntityAnalysisResult[];
}

export interface PlaceMoodData {
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
  // Enhanced contact information
  contact?: {
    website?: string;
    phone?: string;
    formattedPhone?: string;
    internationalPhone?: string;
    email?: string;
    hasContact: boolean;
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
}

export interface PopularTimes {
  day: number;
  data: Array<{
    hour: number;
    busyness: number;
  }>;
}

export interface EntityMoodInsights {
  positiveEntities: string[];
  negativeEntities: string[];
  neutralEntities: string[];
}

export interface MoodAnalysisConfig {
  // Entity analysis settings
  minSalience: number;
  minSentimentMagnitude: number;
  maxReviewsToAnalyze: number;
  onlyPositiveReviews: boolean;
  
  // Confidence thresholds
  highConfidenceThreshold: number;
  mediumConfidenceThreshold: number;
  
  // API settings
  maxRetries: number;
  retryDelay: number;
  apiTimeout: number;
}

// Mood service interfaces
export interface IMoodAnalysisService {
  analyzePlaceMood(placeId: string): Promise<MoodAnalysisResult>;
  analyzeFromReviews(reviews: ReviewEntity[], category: string): Promise<MoodAnalysisResult>;
}

export interface IEntityMoodService {
  analyzeEntities(text: string): Promise<EntityAnalysisResult[]>;
  extractMoodDescriptors(entities: EntityAnalysisResult[]): string[];
  calculateConfidence(entities: EntityAnalysisResult[], reviewCount: number): number;
}