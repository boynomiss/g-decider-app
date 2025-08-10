/**
 * Centralized API key configuration
 * 
 * This file manages all API keys used in the application.
 * All keys should be set via environment variables.
 */

export const API_KEYS = {
  // Google Places API (New)
  GOOGLE_PLACES: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  
  // Google Natural Language API
  GOOGLE_NATURAL_LANGUAGE: process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || '',
  
  // Google Gemini API
  GEMINI: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  
  // Firebase API
  FIREBASE: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  
  // Google Cloud Project ID
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT_ID || 'g-decider-backend'
};

/**
 * Validation functions for API keys
 */
export const validateAPIKeys = {
  /**
   * Check if Google Places API is configured
   */
  isPlacesConfigured: (): boolean => {
    return !!API_KEYS.GOOGLE_PLACES && API_KEYS.GOOGLE_PLACES.length > 0;
  },
  
  /**
   * Check if Google Natural Language API is configured
   */
  isNaturalLanguageConfigured: (): boolean => {
    return !!API_KEYS.GOOGLE_NATURAL_LANGUAGE && API_KEYS.GOOGLE_NATURAL_LANGUAGE.length > 0;
  },
  
  /**
   * Check if Google Gemini API is configured
   */
  isGeminiConfigured: (): boolean => {
    return !!API_KEYS.GEMINI && API_KEYS.GEMINI.length > 0;
  },
  
  /**
   * Check if Firebase API is configured
   */
  isFirebaseConfigured: (): boolean => {
    return !!API_KEYS.FIREBASE && API_KEYS.FIREBASE.length > 0;
  },
  
  /**
   * Check if all required APIs are configured
   */
  areAllRequiredConfigured: (): boolean => {
    return validateAPIKeys.isPlacesConfigured();
  }
};

/**
 * Get API key with validation
 */
export const getAPIKey = {
  places: (): string => {
    if (!validateAPIKeys.isPlacesConfigured()) {
      throw new Error('Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
    }
    return API_KEYS.GOOGLE_PLACES;
  },
  
  naturalLanguage: (): string => {
    if (!validateAPIKeys.isNaturalLanguageConfigured()) {
      throw new Error('Google Natural Language API key not configured. Please set EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY');
    }
    return API_KEYS.GOOGLE_NATURAL_LANGUAGE;
  },
  
  gemini: (): string => {
    if (!validateAPIKeys.isGeminiConfigured()) {
      throw new Error('Google Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY');
    }
    return API_KEYS.GEMINI;
  },
  
  firebase: (): string => {
    if (!validateAPIKeys.isFirebaseConfigured()) {
      throw new Error('Firebase API key not configured. Please set EXPO_PUBLIC_FIREBASE_API_KEY');
    }
    return API_KEYS.FIREBASE;
  }
};

export default API_KEYS;
