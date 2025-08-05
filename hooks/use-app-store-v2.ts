import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters, AppState, Suggestion, AuthState } from '../types/app';
import { useAuth } from './use-auth';
import * as Location from 'expo-location';

// Import our new systems
import { 
  PlaceDiscoveryLogic, 
  UserFilters as DiscoveryFilters, 
  PlaceResult,
  LoadingState 
} from '../utils/place-discovery-logic';
import { 
  PlaceMoodService, 
  PlaceData 
} from '../utils/place-mood-service';
import { 
  FilterApiBridge, 
  ApiReadyFilterData 
} from '../utils/filter-api-bridge';

// API Configuration
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || '';

// Default location (Manila, Philippines)
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lng: 120.9842
};

// Enhanced app state interface
interface EnhancedAppState extends AppState {
  // New place discovery state
  currentResults: PlaceResult | null;
  isDiscovering: boolean;
  discoveryError: string | null;
  loadingState: LoadingState;
  
  // UI state
  userLocation: { lat: number; lng: number } | null;
  
  // API-ready filter data
  apiReadyFilters: Map<string, ApiReadyFilterData>;
}

// Convert PlaceData to legacy Suggestion format for backwards compatibility
const convertPlaceToSuggestion = (place: PlaceData): Suggestion => {
  return {
    id: place.place_id || place.name.replace(/\s+/g, '-').toLowerCase(),
    name: place.name,
    location: place.vicinity || place.formatted_address || 'Unknown location',
    images: place.photos || [],
    budget: place.price_level ? (['P', 'PP', 'PPP'][place.price_level - 1] as 'P' | 'PP' | 'PPP') : 'P',
    tags: place.types || [],
    description: place.description || `${place.name} is a great place to visit.`,
    openHours: place.opening_hours?.weekday_text?.join(', ') || undefined,
    category: place.category || 'food',
    mood: place.mood || 'both',
    socialContext: ['solo', 'with-bae', 'barkada'], // Default to all
    timeOfDay: ['morning', 'afternoon', 'night'], // Default to all
    coordinates: place.location ? {
      lat: place.location.lat,
      lng: place.location.lng
    } : undefined,
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    reviews: place.reviews,
    website: place.website
  };
};

const useNewAppStore = createContextHook<EnhancedAppState>(() => {
  const auth = useAuth();
  
  // State
  const [state, setState] = useState<EnhancedAppState>({
    filters: {
      mood: 50,
      category: null,
      budget: null,
      timeOfDay: null,
      socialContext: null,
      distanceRange: 50
    },
    retriesLeft: 10, // Legacy compatibility
    currentSuggestion: null,
    isLoading: false,
    showMoreFilters: false,
    effectiveFilters: null,
    auth: auth,
    
    // New state
    currentResults: null,
    isDiscovering: false,
    discoveryError: null,
    loadingState: 'initial',
    userLocation: null,
    apiReadyFilters: new Map()
  });

  // Services
  const moodServiceRef = useRef<PlaceMoodService | null>(null);
  const discoveryLogicRef = useRef<PlaceDiscoveryLogic | null>(null);

  // Initialize services
  const getServices = useCallback(() => {
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
  }, []);

  // Get user location
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
      
      setState(prev => ({ ...prev, userLocation: userLoc }));
      return userLoc;
    } catch (error) {
      console.error('❌ Error getting location:', error);
      return DEFAULT_LOCATION;
    }
  }, []);

  // Convert app filters to discovery filters
  const convertToDiscoveryFilters = useCallback(async (): Promise<DiscoveryFilters> => {
    const userLocation = state.userLocation || await getUserLocation();
    
    return {
      category: state.filters.category || 'food',
      mood: state.filters.mood,
      socialContext: state.filters.socialContext,
      budget: state.filters.budget,
      timeOfDay: state.filters.timeOfDay,
      distanceRange: state.filters.distanceRange || 50,
      userLocation
    };
  }, [state.filters, state.userLocation, getUserLocation]);

  // Enhanced filter updates with API-ready logging
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
        }
      };
    });
  }, []);

  // Main place discovery function (replaces generateSuggestion)
  const discoverPlaces = useCallback(async (): Promise<PlaceResult> => {
    console.log('🎯 Starting place discovery...');
    
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true, // Legacy compatibility
      discoveryError: null,
      loadingState: 'initial'
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
        loadingState: results.loadingState
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
        loadingState: 'complete'
      }));
      
      throw error;
    }
  }, [getServices, convertToDiscoveryFilters]);

  // Get next batch of places
  const getNextBatch = useCallback(async (): Promise<PlaceResult | null> => {
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
        loadingState: results.loadingState
      }));
      
      return results;
      
    } catch (error) {
      console.error('❌ Next batch failed:', error);
      
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'complete'
      }));
      
      return null;
    }
  }, [convertToDiscoveryFilters]);

  // Reset discovery state
  const resetDiscovery = useCallback(() => {
    console.log('🔄 Resetting discovery state');
    
    // Reset services
    discoveryLogicRef.current = null;
    moodServiceRef.current = null;
    
    setState(prev => ({
      ...prev,
      currentResults: null,
      currentSuggestion: null, // Legacy compatibility
      isDiscovering: false,
      isLoading: false, // Legacy compatibility
      discoveryError: null,
      loadingState: 'initial',
      retriesLeft: 10 // Reset retries for legacy compatibility
    }));
  }, []);

  // Legacy compatibility functions
  const generateSuggestion = useCallback(async () => {
    console.log('🔄 generateSuggestion called (legacy) - redirecting to discoverPlaces');
    const results = await discoverPlaces();
    return results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
  }, [discoverPlaces]);

  const resetSuggestion = useCallback(() => {
    console.log('🔄 resetSuggestion called (legacy) - redirecting to resetDiscovery');
    resetDiscovery();
  }, [resetDiscovery]);

  const restartSession = useCallback(() => {
    console.log('🔄 restartSession called (legacy) - redirecting to resetDiscovery');
    resetDiscovery();
  }, [resetDiscovery]);

  // UI state management
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

  // Initialize location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

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
    hasResults: !!state.currentResults?.places.length,
    hasMore: state.currentResults?.hasMore || false,
    isExpanding: state.loadingState === 'expanding-distance',
    isLimitReached: state.loadingState === 'limit-reach',
    currentRadius: discoveryLogicRef.current?.currentRadius || 0,
    totalPlaces: state.currentResults?.places.length || 0,
    
    // Analytics and debugging
    getDiscoveryStats: useCallback(() => ({
      totalPlaces: state.currentResults?.places.length || 0,
      hasAdvertised: !!state.currentResults?.advertisedPlace,
            poolStatus: state.currentResults?.poolInfo || {},
      loadingState: state.loadingState,
      hasMore: state.currentResults?.hasMore || false,
      apiFiltersCount: state.apiReadyFilters.size
    }), [state.currentResults, state.loadingState, state.apiReadyFilters.size])
  };
});

export const useAppStore = useNewAppStore;