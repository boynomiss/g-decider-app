/**
 * Mood Analysis Services Index
 * 
 * Centralized export for all mood analysis services and utilities.
 * Provides clean separation between entity analysis and place analysis.
 */

// =================
// MAIN SERVICES
// =================

export {
  EntityMoodAnalysisService,
  entityMoodUtils
} from './entity-mood-analysis.service';

export {
  PlaceMoodAnalysisService,
  placeMoodUtils
} from './place-mood-analysis.service';

// =================
// TYPES (Re-exported from centralized types)
// =================

export type {
  MoodAnalysisResult,
  EntityAnalysisResult,
  ReviewEntity,
  SentimentAnalysis,
  PlaceMoodData,
  PopularTimes,
  EntityMoodInsights,
  MoodAnalysisConfig,
  IMoodAnalysisService,
  IEntityMoodService
} from '../../../types/filtering';

// =================
// CONVENIENCE EXPORTS
// =================

/**
 * Quick access to main mood analysis functionality
 */
export const moodAnalysis = {
  // Entity-level analysis - create new instance
  entity: new EntityMoodAnalysisService(),
  
  // Place-level analysis - create new instance
  place: new PlaceMoodAnalysisService(
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY
  ),
  
  // Utilities
  utils: {
    ...entityMoodUtils,
    ...placeMoodUtils
  }
};

// =================
// FACTORY FUNCTIONS
// =================

/**
 * Create a new EntityMoodAnalysisService instance with custom config
 */
export function createEntityMoodService(config?: Partial<import('../../../types/filtering').MoodAnalysisConfig>) {
  return new EntityMoodAnalysisService(config);
}

/**
 * Create a new PlaceMoodAnalysisService instance with custom config
 */
export function createPlaceMoodService(
  placesApiKey: string,
  naturalLanguageApiKey?: string,
  config?: Partial<import('../../../types/filtering').MoodAnalysisConfig>
) {
  return new PlaceMoodAnalysisService(placesApiKey, naturalLanguageApiKey, config);
}

// =================
// USAGE EXAMPLES
// =================

/**
 * USAGE EXAMPLES:
 * 
 * // Entity-level analysis
 * import { entityMoodAnalysisService } from '@/utils/filtering/mood';
 * 
 * const reviews = [{ text: "Amazing atmosphere!", rating: 5, time: Date.now() }];
 * const result = await entityMoodAnalysisService.analyzeFromReviews(reviews, 'restaurant');
 * 
 * // Place-level analysis
 * import { placeMoodAnalysisService } from '@/utils/filtering/mood';
 * 
 * const placeData = await placeMoodAnalysisService.enhancePlaceWithMood('place_id_123');
 * 
 * // Quick access
 * import { moodAnalysis } from '@/utils/filtering/mood';
 * 
 * const entityResult = await moodAnalysis.entity.analyzeFromReviews(reviews, 'cafe');
 * const placeResult = await moodAnalysis.place.analyzePlaceMood('place_id_456');
 * 
 * // Custom instances
 * import { createPlaceMoodService } from '@/utils/filtering/mood';
 * 
 * const customService = createPlaceMoodService(
 *   'YOUR_PLACES_API_KEY',
 *   'YOUR_NL_API_KEY',
 *   { maxReviewsToAnalyze: 20, highConfidenceThreshold: 80 }
 * );
 */