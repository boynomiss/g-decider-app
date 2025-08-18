/**
 * Centralized API key configuration
 * 
 * This file manages all API keys used in the application.
 * All keys should be set via environment variables.
 */

// Debug environment variables
console.log('🔑 Environment variables debug:', {
  GOOGLE_PLACES: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ? `✅ Present (${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY.substring(0, 10)}...)` : '❌ Missing',
  GOOGLE_NATURAL_LANGUAGE: process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY ? `✅ Present (${process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY.substring(0, 10)}...)` : '❌ Missing',
  GEMINI: process.env.EXPO_PUBLIC_GEMINI_API_KEY ? `✅ Present (${process.env.EXPO_PUBLIC_GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Missing',
  FIREBASE: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? `✅ Present (${process.env.EXPO_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...)` : '❌ Missing'
});

console.log('🔑 Raw environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  allEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('FIREBASE')),
  rawGooglePlacesKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
});

// Additional debugging for the specific key
console.log('🔑 EXPO_PUBLIC_GOOGLE_PLACES_API_KEY direct check:', {
  exists: !!process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
  type: typeof process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
  length: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY?.length || 0,
  value: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
});

// Fallback API key (temporary solution for environment variable issues)
const FALLBACK_GOOGLE_API_KEY = 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';

export const API_KEYS = {
  // Google Places API (New) - with fallback
  GOOGLE_PLACES: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || FALLBACK_GOOGLE_API_KEY,
  
  // Google Natural Language API - with fallback
  GOOGLE_NATURAL_LANGUAGE: process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || FALLBACK_GOOGLE_API_KEY,
  
  // Google Gemini API - with fallback
  GEMINI: process.env.EXPO_PUBLIC_GEMINI_API_KEY || FALLBACK_GOOGLE_API_KEY,
  
  // Firebase API - with fallback
  FIREBASE: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || FALLBACK_GOOGLE_API_KEY,
  
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
    const key = API_KEYS.GOOGLE_PLACES;
    console.log('🔑 getAPIKey.places() called:', {
      keyExists: !!key,
      keyLength: key?.length || 0,
      keyValue: key,
      envVarDirect: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
      envVarExists: !!process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
    });
    
    if (!key || key.length === 0) {
      console.error('❌ Google Places API key validation failed:', {
        key,
        keyType: typeof key,
        keyLength: key?.length,
        envVar: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
        envVarType: typeof process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
      });
      throw new Error('Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
    }
    return key;
  },
  
  naturalLanguage: (): string => {
    const key = API_KEYS.GOOGLE_NATURAL_LANGUAGE;
    console.log('🔑 getAPIKey.naturalLanguage() called, key length:', key?.length || 0);
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
