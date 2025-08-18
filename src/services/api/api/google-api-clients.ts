/**
 * Google API Clients Configuration and Initialization
 * 
 * This module provides centralized configuration and initialization for Google APIs
 * used in the application, specifically:
 * - Google Places API (New)
 * - Google Cloud Natural Language API
 * 
 * The implementation uses REST API calls for React Native compatibility
 * instead of the Node.js SDKs which are not compatible with React Native.
 */

import { getAPIKey, validateAPIKeys } from '../../../shared/constants/config/api-keys';

// Environment variables for API keys - lazy loaded to avoid initialization errors
const getGooglePlacesKey = () => {
  try {
    return getAPIKey.places();
  } catch {
    return '';
  }
};

const getGoogleNaturalLanguageKey = () => {
  try {
    return getAPIKey.naturalLanguage();
  } catch {
    return '';
  }
};

const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'g-decider-backend';

// API Endpoints
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';
const NATURAL_LANGUAGE_API_BASE_URL = 'https://language.googleapis.com/v1';

/**
 * Google Places API (New) Client Configuration
 */
export class GooglePlacesClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getGooglePlacesKey();
    this.baseUrl = PLACES_API_BASE_URL;
  }

  /**
   * Get place details by place ID
   */
  async getPlace(placeId: string, fieldMask: string[] = ['id', 'displayName', 'formattedAddress', 'types', 'userRatingCount', 'rating', 'reviews']): Promise<any> {
    const url = `${this.baseUrl}/places/${placeId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fieldMask.join(',')
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }

  /**
   * Search for places using text query
   */
  async searchText(query: string, locationBias?: { lat: number; lng: number }, maxResults: number = 20): Promise<any> {
    const url = `${this.baseUrl}/places:searchText`;
    
    const requestBody: any = {
      textQuery: query,
      maxResultCount: maxResults
    };

    if (locationBias) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: locationBias.lat,
            longitude: locationBias.lng
          },
          radius: 50000 // 50km radius
        }
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.userRatingCount,places.rating,places.priceLevel,places.photos'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearby(center: { lat: number; lng: number }, radius: number = 5000, includedTypes?: string[]): Promise<any> {
    const url = `${this.baseUrl}/places:searchNearby`;
    
    const requestBody: any = {
      locationRestriction: {
        circle: {
          center: {
            latitude: center.lat,
            longitude: center.lng
          },
          radius: radius
        }
      },
      maxResultCount: 20
    };

    if (includedTypes && includedTypes.length > 0) {
      requestBody.includedTypes = includedTypes;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.userRatingCount,places.rating,places.priceLevel,places.photos'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching nearby places:', error);
      throw error;
    }
  }

  /**
   * Get photo media URL
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400, maxHeight: number = 400): string {
    return `${this.baseUrl}/${photoReference}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${this.apiKey}`;
  }
}

/**
 * Google Cloud Natural Language API Client Configuration
 * Uses REST API for React Native compatibility
 */
export class GoogleNaturalLanguageClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getGoogleNaturalLanguageKey();
    this.baseUrl = NATURAL_LANGUAGE_API_BASE_URL;
  }

  /**
   * Check if Natural Language API is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Google Natural Language API key not configured');
    }

    const url = `${this.baseUrl}/documents:analyzeSentiment?key=${this.apiKey}`;
    
    const requestBody = {
      document: {
        content: text,
        type: 'PLAIN_TEXT'
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Natural Language API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  /**
   * Analyze entities in text
   */
  async analyzeEntities(text: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Google Natural Language API key not configured');
    }

    const url = `${this.baseUrl}/documents:analyzeEntities?key=${this.apiKey}`;
    
    const requestBody = {
      document: {
        content: text,
        type: 'PLAIN_TEXT'
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Natural Language API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing entities:', error);
      throw error;
    }
  }
}

/**
 * Singleton instances for easy access throughout the application
 */
export const googlePlacesClient = new GooglePlacesClient();
export const googleNaturalLanguageClient = new GoogleNaturalLanguageClient();

/**
 * Configuration object for easy access to API settings
 */
export const GoogleAPIConfig = {
  get placesApiKey() { return getGooglePlacesKey(); },
  get naturalLanguageApiKey() { return getGoogleNaturalLanguageKey(); },
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  endpoints: {
    places: PLACES_API_BASE_URL,
    naturalLanguage: NATURAL_LANGUAGE_API_BASE_URL
  }
};

/**
 * Utility function to validate API configuration
 */
export function validateGoogleAPIConfig(): {
  placesAPI: boolean;
  naturalLanguageAPI: boolean;
  allConfigured: boolean;
} {
  const placesAPI = validateAPIKeys.isPlacesConfigured();
  const naturalLanguageAPI = validateAPIKeys.isNaturalLanguageConfigured();
  
  return {
    placesAPI,
    naturalLanguageAPI,
    allConfigured: placesAPI && naturalLanguageAPI
  };
}