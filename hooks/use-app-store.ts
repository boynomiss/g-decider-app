import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { UserFilters, AppState, Suggestion, AuthState } from '../types/app';
import { ApiReadyFilterData } from '../types/filtering';
import { useAuth } from './use-auth';
import { PlaceDiscoveryLogic, DiscoveryResult, DiscoveryFilters, LoadingState } from '../utils/filtering/unified-filter-service';
import { moodAnalysis } from '@/utils/filtering';
import { PlaceMoodData } from '../types/filtering';
import { FilterCoreUtils as FilterUtilities } from '../utils/filtering/filter-core-utils';
import { useDynamicFilterLogger } from './use-dynamic-filter-logger';
import { FilterApiBridge } from '../utils/filtering/filter-api-service';
import { PlaceMoodAnalysisService } from '../utils/filtering/mood/place-mood-analysis.service';

// API Configuration
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || 'AIzaSyDFDP5a0_AwD-ZC9igtkZWCiwjpf_SfY2E';

// Default location (BGC, Philippines)
const DEFAULT_LOCATION = { lat: 14.5176, lng: 121.0509 };

// Enhanced app state interface
interface EnhancedAppState extends AppState {
  currentResults: DiscoveryResult | null;
  isDiscovering: boolean;
  discoveryError: string | null;
  loadingState: LoadingState;
  userLocation: { lat: number; lng: number } | null;
  apiReadyFilters: Map<string, ApiReadyFilterData>;
  serverFilteringEnabled: boolean;
  serverFilteringError: string | null;
  lastServerResponse?: any;
  isLegacyMode: boolean;
  discoveryInitialized: boolean;
  lastDiscoveryTimestamp: number;
}

// Convert PlaceMoodData to legacy Suggestion format
const convertPlaceToSuggestion = (place: PlaceMoodData): Suggestion => {
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
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon', 'night'],
    coordinates: typeof place.location === 'object' && place.location ? {
      lat: place.location.lat,
      lng: place.location.lng
    } : { lat: 0, lng: 0 },
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
};

const [AppContext, useAppStore] = createContextHook(() => {
  const auth = useAuth();
  const { logFilterChange } = useDynamicFilterLogger();
  
  const [state, setState] = useState<EnhancedAppState>({
    filters: {
      mood: 50,
      category: null,
      budget: null,
      timeOfDay: null,
      socialContext: null,
      distanceRange: 0
    },
    retriesLeft: 3,
    currentSuggestion: null,
    isLoading: false,
    showMoreFilters: false,
    effectiveFilters: null,
    auth: auth,
    currentResults: null,
    isDiscovering: false,
    discoveryError: null,
    loadingState: 'initial',
    userLocation: null,
    apiReadyFilters: new Map(),
    serverFilteringEnabled: false,
    serverFilteringError: null,
    lastServerResponse: undefined,
    isLegacyMode: false,
    discoveryInitialized: false,
    lastDiscoveryTimestamp: 0
  });

  // Log initial filter state
  useEffect(() => {
    if (logFilterChange) {
      logFilterChange({} as UserFilters, state.filters, 'initial');
    }
  }, [logFilterChange]);

  const moodServiceRef = useRef<PlaceMoodAnalysisService | null>(null);
  const discoveryLogicRef = useRef<PlaceDiscoveryLogic | null>(null);

  const getServices = useCallback(() => {
    try {
      if (!moodServiceRef.current) {
        moodServiceRef.current = new PlaceMoodAnalysisService(
          GOOGLE_PLACES_API_KEY,
          GOOGLE_NATURAL_LANGUAGE_API_KEY
        );
      }
      if (!discoveryLogicRef.current) {
        discoveryLogicRef.current = new PlaceDiscoveryLogic(
          moodServiceRef.current,
          GOOGLE_PLACES_API_KEY,
          []
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

  const convertToDiscoveryFilters = useCallback(async (): Promise<DiscoveryFilters> => {
    const userLocation = state.userLocation || await getUserLocation();
    const validatedFilters: DiscoveryFilters = {
      category: state.filters.category || 'food',
      mood: Math.max(0, Math.min(100, state.filters.mood || 50)),
      socialContext: state.filters.socialContext || null,
      budget: state.filters.budget || null,
      timeOfDay: state.filters.timeOfDay || null,
      distanceRange: Math.max(0, Math.min(100, state.filters.distanceRange ?? 0)),
      userLocation
    };
    console.log('🔧 Converted filters:', validatedFilters);
    return validatedFilters;
  }, [state.filters, state.userLocation, getUserLocation]);

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    console.log('🔄 Updating filters:', newFilters);
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const newApiFilters = new Map(prev.apiReadyFilters);
      
      // Track which filter changed for logging
      let changedFilter: string | undefined;
      
      Object.entries(newFilters).forEach(([key, value]) => {
        let filterData: ApiReadyFilterData | null = null;
        switch (key) {
          case 'category':
            filterData = FilterApiBridge.logCategorySelection(value as string);
            changedFilter = 'category';
            break;
          case 'mood':
            filterData = FilterApiBridge.logMoodSelection(value as number);
            changedFilter = 'mood';
            break;
          case 'distanceRange':
            filterData = FilterApiBridge.logDistanceSelection(value as number);
            changedFilter = 'distanceRange';
            break;
          case 'budget':
            filterData = FilterApiBridge.logBudgetSelection(value as any);
            changedFilter = 'budget';
            break;
          case 'socialContext':
            filterData = FilterApiBridge.logSocialContextSelection(value as any);
            changedFilter = 'socialContext';
            break;
          case 'timeOfDay':
            filterData = FilterApiBridge.logTimeOfDaySelection(value as any);
            changedFilter = 'timeOfDay';
            break;
        }
        if (filterData) {
          newApiFilters.set(key, filterData);
        } else if (value === null) {
          newApiFilters.delete(key);
        }
      });
      
      // Log the dynamic filter message
      if (logFilterChange) {
        logFilterChange(prev.filters, updatedFilters, changedFilter);
      }
      
      return {
        ...prev,
        filters: updatedFilters,
        apiReadyFilters: newApiFilters,
        currentResults: null,
        currentSuggestion: null,
        discoveryError: null,
        effectiveFilters: {
          budget: updatedFilters.budget || 'P',
          timeOfDay: updatedFilters.timeOfDay || 'afternoon',
          socialContext: updatedFilters.socialContext || 'solo',
          distanceRange: updatedFilters.distanceRange ?? 0
        },
        isDiscovering: false,
        loadingState: 'initial',
        lastDiscoveryTimestamp: Date.now()
      };
    });
  }, [logFilterChange]);

  const discoverPlaces = useCallback(async (): Promise<DiscoveryResult> => {
    console.log('🎯 Starting place discovery...');
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true,
      discoveryError: null,
      loadingState: 'initial',
      discoveryInitialized: true,
      isLegacyMode: false
    }));
    try {
      const { discovery } = getServices();
      const discoveryFilters = await convertToDiscoveryFilters();
      setState(prev => ({ ...prev, loadingState: 'searching' }));
      const results = await discovery.discoverPlaces(discoveryFilters);
      const firstPlace = results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: firstPlace,
        isDiscovering: false,
        isLoading: false,
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
        isLoading: false,
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'error'
      }));
      throw error;
    }
  }, [getServices, convertToDiscoveryFilters]);

  const getNextBatch = useCallback(async (): Promise<DiscoveryResult | null> => {
    if (!discoveryLogicRef.current) {
      console.error('❌ Discovery logic not initialized');
      return null;
    }
    console.log('🔄 Getting next batch...');
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true,
      loadingState: 'searching'
    }));
    try {
      const discoveryFilters = await convertToDiscoveryFilters();
      const results = await discoveryLogicRef.current.getNextBatch(discoveryFilters);
      const firstPlace = results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: firstPlace,
        isDiscovering: false,
        isLoading: false,
        loadingState: results.loadingState,
        lastDiscoveryTimestamp: Date.now()
      }));
      return results;
    } catch (error) {
      console.error('❌ Next batch failed:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isLoading: false,
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'error'
      }));
      throw error;
    }
  }, [convertToDiscoveryFilters]);

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
    if (discoveryLogicRef.current) {
      discoveryLogicRef.current.reset();
    }
  }, []);

  const generateSuggestion = useCallback(async (): Promise<Suggestion | null> => {
    console.log('🔄 Generating suggestion (legacy mode)...');
    try {
      const results = await discoverPlaces();
      return results.places[0] ? convertPlaceToSuggestion(results.places[0]) : null;
    } catch (error) {
      console.error('❌ Failed to generate suggestion:', error);
      return null;
    }
  }, [discoverPlaces]);

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
    if (discoveryLogicRef.current) {
      discoveryLogicRef.current.reset();
    }
  }, []);

  const toggleMoreFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      showMoreFilters: !prev.showMoreFilters
    }));
  }, []);

  const openInMaps = useCallback((place: Suggestion | PlaceData) => {
    const location = 'coordinates' in place ? place.coordinates : place.location;
    const name = place.name;
    if (!location || typeof location === 'string') {
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

  const getApiReadyFilters = useCallback(() => {
    const filterArray = Array.from(state.apiReadyFilters.values());
    return FilterApiBridge.consolidateFiltersForApi(filterArray);
  }, [state.apiReadyFilters]);

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

  useEffect(() => {
    if (state.currentSuggestion && !state.currentResults) {
      console.log('🔄 Syncing legacy suggestion to new results...');
    }
  }, [state.currentSuggestion, state.currentResults]);

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
    filters: state.filters,
    retriesLeft: state.retriesLeft,
    currentSuggestion: state.currentSuggestion,
    isLoading: state.isLoading || state.isDiscovering,
    showMoreFilters: state.showMoreFilters,
    effectiveFilters: state.effectiveFilters,
    auth: state.auth,
    currentResults: state.currentResults,
    isDiscovering: state.isDiscovering,
    discoveryError: state.discoveryError,
    loadingState: state.loadingState,
    userLocation: state.userLocation,
    isLegacyMode: state.isLegacyMode,
    discoveryInitialized: state.discoveryInitialized,
    lastDiscoveryTimestamp: state.lastDiscoveryTimestamp,
    updateFilters,
    discoverPlaces,
    getNextBatch,
    resetDiscovery,
    getApiReadyFilters,
    toggleMoreFilters,
    openInMaps,
    generateSuggestion,
    resetSuggestion,
    restartSession,
    enhancedBulkFetchAndFilter,
    removeFromPool,
    getFilterKey,
    getPoolStats,
    hasResults: !!state.currentResults?.places.length,
    hasMore: state.currentResults?.poolInfo.needsRefresh === false,
    isExpanding: state.loadingState === 'expanding-distance',
    isLimitReached: state.loadingState === 'limit-reach',
    currentRadius: discoveryLogicRef.current?.currentRadius || 0,
    totalPlaces: state.currentResults?.places.length || 0,
    getDiscoveryStats: useCallback(() => ({
      totalPlaces: state.currentResults?.places.length || 0,
      hasAdvertised: !!state.currentResults?.advertisedPlace,
      poolStatus: state.currentResults?.poolInfo || {},
      loadingState: state.loadingState,
      hasMore: state.currentResults?.poolInfo.needsRefresh === false,
      apiFiltersCount: state.apiReadyFilters.size
    }), [state.currentResults, state.loadingState, state.apiReadyFilters.size])
  };
});

// Export the context provider for use in App layout
export const AppProvider = AppContext;

export { AppContext, useAppStore };