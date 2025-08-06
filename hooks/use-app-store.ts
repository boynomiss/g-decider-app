import React, { useState, useCallback, useRef, useEffect, createContext, useContext, ReactNode } from 'react';
import { Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { PlaceMoodService, PlaceData } from '../utils/place-mood-service';
import { PlaceDiscoveryLogic, DiscoveryResult, DiscoveryFilters, LoadingState } from '../utils/place-discovery-logic';
import { FilterApiBridge, ApiReadyFilterData } from '../utils/filter-api-bridge';
import { ServerFilteringResponse } from '../types/server-filtering';

// Environment variables
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || 'AIzaSyDFDP5a0_AwD-ZC9igtkZWCiwjpf_SfY2E';

// Service account configuration
const NLP_SERVICE_ACCOUNT_PATH = './nlp-service-account.json';
const GEMINI_SERVICE_ACCOUNT_PATH = './functions/gemini-api-client-key.json';

// Default location (BGC, Philippines)
const DEFAULT_LOCATION = { lat: 14.5176, lng: 121.0509 };

// Legacy types for backward compatibility
import { UserFilters, Suggestion, User, AuthState, AppState } from '../types/app';

// Enhanced app state that includes both legacy and new discovery system
interface EnhancedAppState extends AppState {
  // New place discovery state
  currentResults: DiscoveryResult | null;
  isDiscovering: boolean;
  discoveryError: string | null;
  loadingState: LoadingState;
  
  // UI state
  userLocation: { lat: number; lng: number } | null;
  
  // API-ready filter data
  apiReadyFilters: Map<string, ApiReadyFilterData>;
  
  // Server filtering state
  serverFilteringEnabled: boolean;
  serverFilteringError: string | null;
  lastServerResponse?: ServerFilteringResponse;
  
  // State synchronization flags
  isLegacyMode: boolean;
  discoveryInitialized: boolean;
  lastDiscoveryTimestamp: number;
}

export const useAppStore = () => {
  const [state, setState] = useState<EnhancedAppState>({
    // Legacy state
    filters: {
      mood: 50,
      category: null,
      budget: null,
      timeOfDay: null,
      socialContext: null,
      distanceRange: null
    },
    retriesLeft: 3,
    currentSuggestion: null,
    isLoading: false,
    showMoreFilters: false,
    effectiveFilters: null,
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false
    },
    
    // New discovery state
    currentResults: null,
    isDiscovering: false,
    discoveryError: null,
    loadingState: 'initial',
    userLocation: null,
    
    // API state
    apiReadyFilters: new Map(),
    
    // Server filtering state
    serverFilteringEnabled: false,
    serverFilteringError: null,
    lastServerResponse: undefined,
    
    // State synchronization
    isLegacyMode: false,
    discoveryInitialized: false,
    lastDiscoveryTimestamp: 0
  });

  // Convert PlaceData to legacy Suggestion format for backwards compatibility
  const convertPlaceToSuggestion = useCallback((place: PlaceData): Suggestion => {
    return {
      id: place.place_id || place.name.replace(/\s+/g, '-').toLowerCase(),
      name: place.name,
      location: place.vicinity || place.formatted_address || 'Unknown location',
      images: Array.isArray(place.photos) ? place.photos : [],
      budget: place.price_level ? (['P', 'PP', 'PPP'][place.price_level - 1] as 'P' | 'PP' | 'PPP') : 'P',
      tags: place.types || [],
      description: place.description || `${place.name} is a great place to visit.`,
      openHours: place.opening_hours?.weekday_text?.join(', ') || undefined,
      category: (place.category as 'food' | 'activity' | 'something-new') || 'food',
      mood: place.final_mood as 'chill' | 'hype' | 'both' || 'both',
      socialContext: ['solo', 'with-bae', 'barkada'], // Default to all
      timeOfDay: ['morning', 'afternoon', 'night'], // Default to all
      coordinates: typeof place.location === 'object' && place.location ? {
        lat: place.location.lat,
        lng: place.location.lng
      } : undefined,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      reviews: place.reviews?.map(review => ({
        author: 'Anonymous',
        rating: review.rating || 0,
        text: review.text || '',
        time: review.time?.toString() || ''
      })) || [],
      website: place.website
    };
  }, []);

  // Services
  const moodServiceRef = useRef<PlaceMoodService | null>(null);
  const discoveryLogicRef = useRef<PlaceDiscoveryLogic | null>(null);

  // Initialize services with proper error handling
  const getServices = useCallback(() => {
    try {
      if (!moodServiceRef.current) {
        moodServiceRef.current = new PlaceMoodService(
          GOOGLE_PLACES_API_KEY,
          GOOGLE_NATURAL_LANGUAGE_API_KEY
        );
      }
      
      if (!discoveryLogicRef.current) {
        discoveryLogicRef.current = new PlaceDiscoveryLogic(
          moodServiceRef.current,
          GOOGLE_PLACES_API_KEY,
          [] // TODO: Add advertised places
        );
      }
      
      return {
        mood: moodServiceRef.current,
        discovery: discoveryLogicRef.current
      };
    } catch (error) {
      console.error('❌ Error initializing services:', error);
      throw new Error('Failed to initialize discovery services');
    }
  }, []);

  // Get user location with fallback (FIXED: Removed setState to prevent useInsertionEffect error)
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 Location permission denied, using default location');
        return DEFAULT_LOCATION;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
      
      // FIXED: Don't call setState here to prevent useInsertionEffect error
      // setState(prev => ({ ...prev, userLocation: userLoc }));
      return userLoc;
    } catch (error) {
      console.error('❌ Error getting location:', error);
      return DEFAULT_LOCATION;
    }
  }, []);

  // Convert app filters to discovery filters with validation
  const convertToDiscoveryFilters = useCallback(async (): Promise<DiscoveryFilters> => {
    const userLocation = state.userLocation || await getUserLocation();
    
    // Validate and sanitize filters
    const validatedFilters: DiscoveryFilters = {
      category: state.filters.category || 'food',
      mood: Math.max(0, Math.min(100, state.filters.mood || 50)),
      socialContext: state.filters.socialContext || null,
      budget: state.filters.budget || null,
      timeOfDay: state.filters.timeOfDay || null,
      distanceRange: Math.max(1, Math.min(100, state.filters.distanceRange || 50)),
      userLocation
    };
    
    console.log('🔧 Converted filters:', validatedFilters);
    return validatedFilters;
  }, [state.filters, state.userLocation, getUserLocation]);

  // Update filters with proper state synchronization
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    console.log('🔄 Updating filters:', newFilters);
    
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const newApiFilters = new Map(prev.apiReadyFilters);
      
      // Log each filter change with API-ready data
      Object.entries(newFilters).forEach(([key, value]) => {
        let filterData: ApiReadyFilterData | null = null;
        
        switch (key) {
          case 'category':
            filterData = FilterApiBridge.logCategorySelection(value as string);
            break;
          case 'mood':
            filterData = FilterApiBridge.logMoodSelection(value as number);
            break;
          case 'distanceRange':
            filterData = FilterApiBridge.logDistanceSelection(value as number);
            break;
          case 'budget':
            filterData = FilterApiBridge.logBudgetSelection(value as any);
            break;
          case 'socialContext':
            filterData = FilterApiBridge.logSocialContextSelection(value as any);
            break;
          case 'timeOfDay':
            filterData = FilterApiBridge.logTimeOfDaySelection(value as any);
            break;
        }
        
        if (filterData) {
          newApiFilters.set(key, filterData);
        } else if (value === null) {
          // Remove filter data when value is null
          newApiFilters.delete(key);
        }
      });
      
      return {
        ...prev,
        filters: updatedFilters,
        apiReadyFilters: newApiFilters,
        // Clear results when filters change
        currentResults: null,
        currentSuggestion: null,
        discoveryError: null,
        // Update effective filters for legacy compatibility
        effectiveFilters: {
          budget: updatedFilters.budget || 'P',
          timeOfDay: updatedFilters.timeOfDay || 'afternoon',
          socialContext: updatedFilters.socialContext || 'solo',
          distanceRange: updatedFilters.distanceRange || 50
        },
        // Reset discovery state for new filters
        isDiscovering: false,
        loadingState: 'initial',
        lastDiscoveryTimestamp: Date.now()
      };
    });
  }, []);

  // Main place discovery function with proper integration
  const discoverPlaces = useCallback(async (): Promise<DiscoveryResult> => {
    console.log('🎯 Starting place discovery...');
    
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true, // Legacy compatibility
      discoveryError: null,
      loadingState: 'initial',
      discoveryInitialized: true,
      isLegacyMode: false
    }));

    try {
      const { discovery } = getServices();
      const discoveryFilters = await convertToDiscoveryFilters();
      
      // Update loading state
      setState(prev => ({ ...prev, loadingState: 'searching' }));
      
      const results = await discovery.discoverPlaces(discoveryFilters);
      
      // For backwards compatibility, set the first place as currentSuggestion
      const firstPlace = results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
      
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: firstPlace, // Legacy compatibility
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        loadingState: results.loadingState,
        lastDiscoveryTimestamp: Date.now()
      }));
      
      console.log('✅ Place discovery complete:', {
        places: results.places.length,
        hasMore: results.poolInfo.needsRefresh === false,
        status: results.poolInfo
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Place discovery failed:', error);
      
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'error'
      }));
      
      throw error;
    }
  }, [getServices, convertToDiscoveryFilters, convertPlaceToSuggestion]);

  // Get next batch of places with proper state management
  const getNextBatch = useCallback(async (): Promise<DiscoveryResult | null> => {
    if (!discoveryLogicRef.current) {
      console.error('❌ Discovery logic not initialized');
      return null;
    }

    console.log('🔄 Getting next batch...');
    
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true, // Legacy compatibility
      loadingState: 'searching'
    }));

    try {
      const discoveryFilters = await convertToDiscoveryFilters();
      const results = await discoveryLogicRef.current.getNextBatch(discoveryFilters);
      
      // Update current suggestion for legacy compatibility
      const firstPlace = results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
      
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: firstPlace, // Legacy compatibility
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        loadingState: results.loadingState,
        lastDiscoveryTimestamp: Date.now()
      }));
      
      return results;
      
    } catch (error) {
      console.error('❌ Next batch failed:', error);
      
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'error'
      }));
      
      throw error;
    }
  }, [convertToDiscoveryFilters, convertPlaceToSuggestion]);

  // Reset discovery state
  const resetDiscovery = useCallback(() => {
    console.log('🔄 Resetting discovery state...');
    
    setState(prev => ({
      ...prev,
      currentResults: null,
      currentSuggestion: null,
      discoveryError: null,
      isDiscovering: false,
      isLoading: false,
      loadingState: 'initial',
      lastDiscoveryTimestamp: 0
    }));
    
    // Reset discovery logic if available
    if (discoveryLogicRef.current) {
      discoveryLogicRef.current.reset();
    }
  }, []);

  // Legacy compatibility functions with proper integration
  const generateSuggestion = useCallback(async (): Promise<Suggestion | null> => {
    console.log('🔄 Generating suggestion (legacy mode)...');
    
    try {
      const results = await discoverPlaces();
      return results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
    } catch (error) {
      console.error('❌ Failed to generate suggestion:', error);
      return null;
    }
  }, [discoverPlaces, convertPlaceToSuggestion]);

  const resetSuggestion = useCallback(() => {
    console.log('🔄 Resetting suggestion...');
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      retriesLeft: Math.max(0, prev.retriesLeft - 1)
    }));
  }, []);

  const restartSession = useCallback(() => {
    console.log('🔄 Restarting session...');
    setState(prev => ({
      ...prev,
      retriesLeft: 3,
      currentSuggestion: null,
      currentResults: null,
      discoveryError: null,
      isDiscovering: false,
      isLoading: false,
      loadingState: 'initial'
    }));
    
    // Reset discovery logic
    if (discoveryLogicRef.current) {
      discoveryLogicRef.current.reset();
    }
  }, []);

  // Toggle more filters
  const toggleMoreFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      showMoreFilters: !prev.showMoreFilters
    }));
  }, []);

  // Utility functions
  const openInMaps = useCallback((place: Suggestion | PlaceData) => {
    const location = 'coordinates' in place ? place.coordinates : place.location;
    const name = place.name;
    
    if (!location) {
      console.error('❌ No location data for place:', name);
      return;
    }

    const url = Platform.select({
      ios: `maps:0,0?q=${location.lat},${location.lng}`,
      android: `geo:0,0?q=${location.lat},${location.lng}(${encodeURIComponent(name)})`
    });

    if (url) {
      Linking.openURL(url).catch(error => {
        console.error('❌ Error opening maps:', error);
      });
    }
  }, []);

  // Get consolidated filter data for API queries
  const getApiReadyFilters = useCallback(() => {
    const filterArray = Array.from(state.apiReadyFilters.values());
    return FilterApiBridge.consolidateFiltersForApi(filterArray);
  }, [state.apiReadyFilters]);

  // Initialize location on mount (FIXED: Handle setState properly to prevent useInsertionEffect error)
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const userLoc = await getUserLocation();
        setState(prev => ({ ...prev, userLocation: userLoc }));
      } catch (error) {
        console.error('❌ Error initializing location:', error);
        setState(prev => ({ ...prev, userLocation: DEFAULT_LOCATION }));
      }
    };
    
    initializeLocation();
  }, [getUserLocation]);

  // State synchronization effect
  useEffect(() => {
    // Ensure legacy and new state are synchronized
    if (state.currentSuggestion && !state.currentResults) {
      console.log('🔄 Syncing legacy suggestion to new results...');
      // Convert legacy suggestion to new format if needed
    }
  }, [state.currentSuggestion, state.currentResults]);

  // Legacy compatibility - deprecated functions that log warnings
  const deprecatedFunction = useCallback((functionName: string) => {
    console.warn(`⚠️ ${functionName} is deprecated in the new system. Use discoverPlaces() instead.`);
  }, []);

  const enhancedBulkFetchAndFilter = useCallback(() => {
    deprecatedFunction('enhancedBulkFetchAndFilter');
    return discoverPlaces();
  }, [deprecatedFunction, discoverPlaces]);

  const removeFromPool = useCallback(() => {
    deprecatedFunction('removeFromPool');
  }, [deprecatedFunction]);

  const getFilterKey = useCallback(() => {
    deprecatedFunction('getFilterKey');
    return 'deprecated';
  }, [deprecatedFunction]);

  const getPoolStats = useCallback(() => {
    deprecatedFunction('getPoolStats');
    return { size: 0, used: 0 };
  }, [deprecatedFunction]);

  return {
    // Core state (legacy compatible)
    filters: state.filters,
    retriesLeft: state.retriesLeft,
    currentSuggestion: state.currentSuggestion,
    isLoading: state.isLoading || state.isDiscovering, // Combine for legacy compatibility
    showMoreFilters: state.showMoreFilters,
    effectiveFilters: state.effectiveFilters,
    auth: state.auth,
    
    // New enhanced state
    currentResults: state.currentResults,
    isDiscovering: state.isDiscovering,
    discoveryError: state.discoveryError,
    loadingState: state.loadingState,
    userLocation: state.userLocation,
    
    // State synchronization
    isLegacyMode: state.isLegacyMode,
    discoveryInitialized: state.discoveryInitialized,
    lastDiscoveryTimestamp: state.lastDiscoveryTimestamp,
    
    // Core functions
    updateFilters,
    discoverPlaces,
    getNextBatch,
    resetDiscovery,
    getApiReadyFilters,
    
    // UI functions
    toggleMoreFilters,
    openInMaps,
    
    // Legacy compatibility functions (working)
    generateSuggestion,
    resetSuggestion,
    restartSession,
    
    // Legacy compatibility functions (deprecated but present)
    enhancedBulkFetchAndFilter,
    removeFromPool,
    getFilterKey,
    getPoolStats,
    
    // Utility getters
    getServices,
    convertPlaceToSuggestion,
    convertToDiscoveryFilters
  };
};

// Create AppProvider component for context

interface AppContextType {
  // Add the return type from useAppStore here
  filters: any;
  retriesLeft: number;
  currentSuggestion: any;
  isLoading: boolean;
  showMoreFilters: boolean;
  effectiveFilters: any;
  auth: any;
  currentResults: any;
  isDiscovering: boolean;
  discoveryError: string | null;
  loadingState: any;
  userLocation: any;
  isLegacyMode: boolean;
  discoveryInitialized: boolean;
  lastDiscoveryTimestamp: number;
  updateFilters: (filters: any) => void;
  discoverPlaces: () => Promise<any>;
  getNextBatch: () => Promise<any>;
  resetDiscovery: () => void;
  getApiReadyFilters: () => any;
  toggleMoreFilters: () => void;
  openInMaps: (place: any) => void;
  generateSuggestion: () => Promise<any>;
  resetSuggestion: () => void;
  restartSession: () => void;
  enhancedBulkFetchAndFilter: () => Promise<any>;
  removeFromPool: () => void;
  getFilterKey: () => string;
  getPoolStats: () => { size: number; used: number };
  getServices: () => any;
  convertPlaceToSuggestion: (place: any) => any;
  convertToDiscoveryFilters: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const appStore = useAppStore();
  
  return React.createElement(AppContext.Provider, { value: appStore }, children);
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};