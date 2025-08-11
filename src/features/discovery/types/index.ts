/**
 * Discovery Types Index
 * 
 * Centralized export of all discovery-related types
 */

// Discovery interfaces
export type {
  DiscoveryFilters,
  DiscoveryResult,
  ScrapedDeal,
  ScrapedAttraction,
  ScrapingSource,
  ScrapingConfig,
  UseScrapingServiceReturn
} from './discovery-interfaces';

// Place types
export type {
  Suggestion,
  PlaceMoodData,
  PopularTimes,
  EntityMoodInsights,
  MoodAnalysisConfig,
  IMoodAnalysisService,
  IEntityMoodService,
  PlaceMoodService,
  MoodConfig
} from './place-types';

// Type alias for backward compatibility
import type { PlaceMoodData } from './place-types';
export type PlaceData = PlaceMoodData;

// Re-export from filtering types for compatibility
export type {
  PlaceResult,
  AdvertisedPlace,
  LoadingState
} from '../../filtering/types';
