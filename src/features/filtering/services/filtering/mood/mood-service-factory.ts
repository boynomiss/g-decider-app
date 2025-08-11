/**
 * Mood Service Factory
 * 
 * Creates and configures mood analysis services
 */

import { createEntityMoodAnalysisService } from './entity-mood-analysis.service';
import { createPlaceMoodAnalysisService } from './place-mood-analysis.service';
import { MoodAnalysisConfig } from '../../types';

/**
 * Create a new EntityMoodAnalysisService instance
 */
export function createEntityMoodService(config?: Partial<MoodAnalysisConfig>): EntityMoodAnalysisService {
  return new EntityMoodAnalysisService(config);
}

/**
 * Create a new PlaceMoodAnalysisService instance
 */
export function createPlaceMoodService(
  placesApiKey: string,
  naturalLanguageApiKey?: string,
  config?: Partial<MoodAnalysisConfig>
): PlaceMoodAnalysisService {
  return new PlaceMoodAnalysisService(placesApiKey, naturalLanguageApiKey, config);
}

/**
 * Create default mood services with environment variables
 */
export function createDefaultMoodServices() {
  return {
    entity: createEntityMoodService(),
    place: createPlaceMoodService(
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
      process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY
    )
  };
} 