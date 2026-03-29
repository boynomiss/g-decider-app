/**
 * Mood Service Factory
 * 
 * Creates and configures mood analysis services
 */

import { createEntityMoodAnalysisService } from './entity-mood-analysis.service';
import { createPlaceMoodAnalysisService } from './place-mood-analysis.service';
import { MoodAnalysisConfig } from '../../types';
import { getAPIKey } from '../../../../../shared/constants/config/api-keys';

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
  let placesKey = '';
  let naturalLanguageKey: string | undefined;
  
  try {
    placesKey = getAPIKey.places();
  } catch (error) {
    console.error('❌ No Google Places API key available for default mood services');
  }
  
  try {
    naturalLanguageKey = getAPIKey.naturalLanguage();
  } catch (error) {
    console.warn('⚠️ No Google Natural Language API key available for default mood services');
  }
  
  return {
    entity: createEntityMoodService(),
    place: createPlaceMoodService(
      placesKey,
      naturalLanguageKey
    )
  };
} 