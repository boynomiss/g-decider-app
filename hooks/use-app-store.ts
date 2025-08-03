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
import { generateAuthenticPhotoUrls, AuthenticPhotoResult, BloggerPhotoSearch } from '../utils/photo-url-generator';

// API Configuration
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || '';
const BLOGGER_API_KEY = process.env.EXPO_PUBLIC_BLOGGER_API_KEY || '';

// Default location (Manila, Philippines)
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lng: 120.9842
};

// Simplified app state interface - NO CONDITIONAL HOOKS
interface CleanAppState {
  // Filter state
  filters: UserFilters;
  
  // Place discovery state
  currentResults: PlaceResult | null;
  isDiscovering: boolean;
  discoveryError: string | null;
  loadingState: LoadingState;
  
  // UI state
  showMoreFilters: boolean;
  userLocation: { lat: number; lng: number } | null;
  
  // Legacy compatibility (simplified)
  currentSuggestion: Suggestion | null;
  isLoading: boolean;
  retriesLeft: number;
  effectiveFilters: any;
  auth: AuthState;
}

// Convert PlaceData to legacy Suggestion format for backwards compatibility
const convertPlaceToSuggestion = async (place: PlaceData): Promise<Suggestion> => {
  console.log('🔄 Converting place to suggestion:', {
    name: place.name,
    hasImages: !!place.images?.urls?.length,
    imageCount: place.images?.urls?.length || 0,
    location: place.vicinity || place.formatted_address,
    coordinates: place.location,
    priceLevel: place.price_level
  });

  // Use enhanced images if available, otherwise generate them
  let imageUrls: string[] = [];
  
  if (place.images && place.images.urls && place.images.urls.length > 0) {
    // Use pre-generated enhanced images
    imageUrls = place.images.urls;
    console.log(`📸 Using ${imageUrls.length} pre-generated images`);
  } else {
    // Fallback: Generate images if not available
    try {
      const placeInfo: BloggerPhotoSearch = {
        placeName: place.name,
        placeAddress: place.vicinity || place.formatted_address,
        placeTypes: place.types,
        coordinates: place.location ? {
          lat: place.location.lat,
          lng: place.location.lng
        } : undefined
      };

      const authenticPhotos = await generateAuthenticPhotoUrls(
        place.photos,
        placeInfo,
        800, // gallery width
        600, // gallery height
        4,  // min photos
        8   // max photos
      );

      imageUrls = authenticPhotos.map(photo => photo.url);
      console.log(`📸 Generated ${imageUrls.length} fallback images`);
    } catch (error) {
      console.warn('Failed to generate images:', error);
      imageUrls = [];
    }
  }
  
  return {
    id: place.place_id || place.name.replace(/\s+/g, '-').toLowerCase(),
    name: place.name,
    location: place.vicinity || place.formatted_address || place.address || 'Unknown location',
    images: imageUrls,
    budget: place.price_level ? (['P', 'PP', 'PPP'][place.price_level - 1] as 'P' | 'PP' | 'PPP') : 'PP',
    tags: place.types || [],
    description: place.description || `${place.name} is a great place to visit.`,
    openHours: place.opening_hours?.weekday_text?.join(', ') || undefined,
    category: place.category || 'food',
    mood: place.mood || 'both',
    socialContext: ['solo', 'with-bae', 'barkada'], // Default to all
    timeOfDay: ['morning', 'afternoon', 'night'], // Default to all
    coordinates: place.location || place.geometry?.location ? {
      lat: place.location?.lat || place.geometry?.location?.lat,
      lng: place.location?.lng || place.geometry?.location?.lng
    } : undefined,
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    reviews: place.reviews,
    website: place.website
  };
};

export const [AppProvider, useAppStore] = createContextHook<CleanAppState>(() => {
  const auth = useAuth();
  
  // SINGLE useState call - NEVER conditional
  const [state, setState] = useState<CleanAppState>({
    filters: {
      mood: 50,
      category: null,
      budget: null,
      timeOfDay: null,
      socialContext: null,
      distanceRange: 50
    },
    currentResults: null,
    isDiscovering: false,
    discoveryError: null,
    loadingState: 'initial',
    showMoreFilters: false,
    userLocation: null,
    // Legacy compatibility
    currentSuggestion: null,
    isLoading: false,
    retriesLeft: 10,
    effectiveFilters: null,
    auth: auth
  });

  // SINGLE useRef call - NEVER conditional
  const servicesRef = useRef<{
    moodService: PlaceMoodService | null;
    discovery: PlaceDiscoveryLogic | null;
    filterData: Map<string, ApiReadyFilterData>;
  }>({
    moodService: null,
    discovery: null,
    filterData: new Map()
  });

  // Initialize services - SINGLE useCallback
  const getServices = useCallback(() => {
    if (!servicesRef.current.moodService) {
      servicesRef.current.moodService = new PlaceMoodService(
        GOOGLE_PLACES_API_KEY,
        GOOGLE_NATURAL_LANGUAGE_API_KEY
      );
    }
    
    if (!servicesRef.current.discovery) {
      servicesRef.current.discovery = new PlaceDiscoveryLogic(
        servicesRef.current.moodService,
        GOOGLE_PLACES_API_KEY,
        [], // TODO: Add advertised places
        BLOGGER_API_KEY // Enable enhanced scoring with Blogger API
      );
    }
    
    return servicesRef.current;
  }, []);

  // Get user location - SINGLE useCallback
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
      
      console.log('📍 Setting user location in state (getUserLocation):', userLoc);
      setState(prev => ({ ...prev, userLocation: userLoc }));
      return userLoc;
  } catch (error) {
      console.error('❌ Error getting location:', error);
      return DEFAULT_LOCATION;
    }
  }, []);

  // Convert filters - SINGLE useCallback
  const convertToDiscoveryFilters = useCallback(async (): Promise<DiscoveryFilters> => {
    const userLocation = state.userLocation || await getUserLocation();
    
    console.log('📍 Converting filters with location:', {
      stateLocation: state.userLocation,
      finalLocation: userLocation,
      isUsingDefault: !state.userLocation
    });
    
    const discoveryFilters = {
      category: state.filters.category || 'food',
      mood: state.filters.mood,
      socialContext: state.filters.socialContext,
      budget: state.filters.budget,
      timeOfDay: state.filters.timeOfDay,
      distanceRange: state.filters.distanceRange || 50,
      userLocation
    };
    
    console.log('🔍 Final discovery filters:', discoveryFilters);
    
    return discoveryFilters;
  }, [state.filters, state.userLocation, getUserLocation]);

    // Update filters - SINGLE useCallback
  const updateFilters = useCallback((newFilters: Partial<UserFilters & { userLocation?: { lat: number; lng: number } }>) => {
    console.log('🔄 Updating filters:', newFilters);
    
    // Extract userLocation if provided
    const { userLocation, ...filterUpdates } = newFilters;
    
    // Log each filter change with API-ready data
    Object.entries(filterUpdates).forEach(([key, value]) => {
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
        servicesRef.current.filterData.set(key, filterData);
      } else if (value === null) {
        // Remove filter data when value is null
        servicesRef.current.filterData.delete(key);
      }
    });
    
    // Log userLocation update if provided
    if (userLocation) {
      console.log('📍 Updating user location in state:', userLocation);
    }
    
      setState(prev => ({
        ...prev,
      filters: { ...prev.filters, ...filterUpdates },
      // Update userLocation if provided
      userLocation: userLocation || prev.userLocation,
      // Clear results when filters change
      currentResults: null,
      currentSuggestion: null,
      discoveryError: null,
      // Update effective filters for legacy compatibility
      effectiveFilters: {
        budget: { ...prev.filters, ...filterUpdates }.budget || 'P',
        timeOfDay: { ...prev.filters, ...filterUpdates }.timeOfDay || 'afternoon',
        socialContext: { ...prev.filters, ...filterUpdates }.socialContext || 'solo',
        distanceRange: { ...prev.filters, ...filterUpdates }.distanceRange || 50
        }
    }));
  }, []);

  // Main discovery function - SINGLE useCallback - FIXES HOOK ORDER ISSUES
  const discoverPlaces = useCallback(async () => {
    console.log('🎯 Starting place discovery...');
    
    // Single setState call - no conditional state updates
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true, // Legacy compatibility
      discoveryError: null,
      loadingState: 'initial'
    }));

    try {
      const services = getServices();
      const discoveryFilters = await convertToDiscoveryFilters();
      
      // Single setState call for loading state
      setState(prev => ({ ...prev, loadingState: 'searching' }));
      
      const results = await services.discovery!.discoverPlaces(discoveryFilters);
      
      // Convert first place to legacy format for backwards compatibility
      const firstPlace = results.places[0];
      const legacySuggestion: Suggestion | null = firstPlace ? await convertPlaceToSuggestion(firstPlace) : null;
      
      // Single setState call for success
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: legacySuggestion, // Legacy compatibility
        isDiscovering: false,
        isLoading: false, // Legacy compatibility
        loadingState: results.loadingState,
        effectiveFilters: discoveryFilters
      }));
      
      console.log('✅ Place discovery complete:', {
        places: results.places.length,
        advertised: !!results.advertisedPlace,
        hasMore: results.hasMore
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Place discovery failed:', error);
      
      // Single setState call for error
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

  // Optimized getNextBatch - instant results from pool when available
  const getNextBatch = useCallback(async () => {
    console.log('🔄 getNextBatch called - checking pool first');
    
    // Check if we have places in the current pool
    if (state.currentResults && state.currentResults.places.length > 1) {
      console.log('⚡ Using pool for instant next batch');
      
      // Get next place from pool
      const nextPlace = state.currentResults.places[1];
      const suggestion = await convertPlaceToSuggestion(nextPlace);
      
      // Update state to show next place and remove it from pool
      setState(prev => ({
        ...prev,
        currentSuggestion: suggestion,
        currentResults: prev.currentResults ? {
          ...prev.currentResults,
          places: prev.currentResults.places.slice(1) // Remove first place
        } : null
      }));
      
      return state.currentResults;
    }
    
    // If pool is empty or low, fetch more places
    console.log('🔄 Pool empty/low, fetching more places...');
    if (!servicesRef.current.discovery) {
      console.error('❌ Discovery logic not initialized');
      return null;
    }

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isLoading: true,
      loadingState: 'searching'
    }));

    try {
      const discoveryFilters = await convertToDiscoveryFilters();
      const results = await servicesRef.current.discovery.getNextBatch(discoveryFilters);
      
      // Update current suggestion for legacy compatibility
      const firstPlace = results.places[0] ? await convertPlaceToSuggestion(results.places[0]) : null;
      
      setState(prev => ({
        ...prev,
        currentResults: results,
        currentSuggestion: firstPlace,
        isDiscovering: false,
        isLoading: false,
        loadingState: results.loadingState
      }));
      
      return results;
      
    } catch (error) {
      console.error('❌ Next batch failed:', error);
      
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isLoading: false,
        discoveryError: error instanceof Error ? error.message : 'Unknown error',
        loadingState: 'complete'
      }));
      
      return null;
    }
  }, [convertToDiscoveryFilters, state.currentResults]);

  // Optimized generateSuggestion - uses pool when available for instant results
  const generateSuggestion = useCallback(async (onProgress?: Function) => {
    console.log('🔄 generateSuggestion called - checking pool first');
    
    try {
      // Check if we have results in pool first
      if (state.currentResults && state.currentResults.places.length > 1) {
        console.log('⚡ Using existing pool for instant suggestion');
        const nextPlace = state.currentResults.places[1]; // Get next place from pool
        const suggestion = await convertPlaceToSuggestion(nextPlace);
        
        // Update state to remove used place from pool
        setState(prev => ({
          ...prev,
          currentSuggestion: suggestion,
          currentResults: prev.currentResults ? {
            ...prev.currentResults,
            places: prev.currentResults.places.slice(1) // Remove first place
          } : null
        }));
        
        return suggestion;
      }
      
      // If no pool or pool is empty, discover new places
      console.log('🔄 Pool empty, discovering new places...');
      const results = await discoverPlaces();
      return results?.places[0] ? await convertPlaceToSuggestion(results.places[0]) : null;
    } catch (error) {
      console.error('❌ generateSuggestion failed:', error);
      return null;
    }
  }, [discoverPlaces, state.currentResults]);

  // Reset functions - SINGLE useCallback each
  const resetSuggestion = useCallback(() => {
    console.log('🔄 resetSuggestion called');
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      currentResults: null,
      isLoading: false,
      isDiscovering: false,
      discoveryError: null,
      loadingState: 'initial',
      effectiveFilters: null
    }));
  }, []);

  const restartSession = useCallback(() => {
    console.log('🔄 restartSession called');
    
    // Reset services
    servicesRef.current.moodService = null;
    servicesRef.current.discovery = null;
    servicesRef.current.filterData.clear();
    
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      currentResults: null,
      isLoading: false,
      isDiscovering: false,
      discoveryError: null,
      loadingState: 'initial',
      retriesLeft: 10,
      effectiveFilters: null
    }));
  }, []);

  const toggleMoreFilters = useCallback(() => {
    setState(prev => ({
          ...prev,
      showMoreFilters: !prev.showMoreFilters
    }));
  }, []);

  const openInMaps = useCallback((suggestion: Suggestion) => {
    const location = suggestion.coordinates;
    
    console.log('🗺️ Opening maps for:', {
      name: suggestion.name,
      location: suggestion.location,
      coordinates: location
    });
    
    if (!location || (!location.lat || !location.lng)) {
      console.error('❌ No coordinates for suggestion:', suggestion.name);
      // Fallback: try to open by place name
      const fallbackUrl = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(suggestion.name + ' ' + suggestion.location)}`,
        android: `geo:0,0?q=${encodeURIComponent(suggestion.name + ' ' + suggestion.location)}`
      });
      
      if (fallbackUrl) {
        Linking.openURL(fallbackUrl).catch(error => {
          console.error('❌ Error opening maps with fallback:', error);
        });
      }
      return;
    }
    
    const url = Platform.select({
      ios: `maps:0,0?q=${location.lat},${location.lng}`,
      android: `geo:0,0?q=${location.lat},${location.lng}(${encodeURIComponent(suggestion.name)})`
    });

    if (url) {
      console.log('🗺️ Opening URL:', url);
      Linking.openURL(url).catch(error => {
        console.error('❌ Error opening maps:', error);
        // Additional fallback for web browsers
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
        Linking.openURL(webUrl).catch(webError => {
          console.error('❌ Error opening web maps:', webError);
        });
      });
    }
  }, []);

  // Get consolidated filter data - SINGLE useCallback
  const getApiReadyFilters = useCallback(() => {
    const filterArray = Array.from(servicesRef.current.filterData.values());
    return FilterApiBridge.consolidateFiltersForApi(filterArray);
  }, []);

  // Legacy compatibility functions that are no longer needed but kept for compatibility
  const getPoolStats = useCallback(() => {
    console.log('📊 getPoolStats called (legacy) - returning mock data');
    return { totalPools: 0, totalSuggestions: 0, poolDetails: [] };
  }, []);

  // Deprecated functions that log warnings but don't break
  const enhancedBulkFetchAndFilter = useCallback(() => {
    console.warn('⚠️ enhancedBulkFetchAndFilter is deprecated. Use discoverPlaces() instead.');
    return discoverPlaces();
  }, [discoverPlaces]);

  const removeFromPool = useCallback(() => {
    console.warn('⚠️ removeFromPool is deprecated. Pool management is now automatic.');
  }, []);

  const getFilterKey = useCallback(() => {
    console.warn('⚠️ getFilterKey is deprecated. Filter management is now automatic.');
    return 'deprecated';
  }, []);

  // Initialize location on mount - SINGLE useEffect
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return {
    // Core state (legacy compatible)
    filters: state.filters,
    retriesLeft: state.retriesLeft,
    currentSuggestion: state.currentSuggestion,
    isLoading: state.isLoading,
    showMoreFilters: state.showMoreFilters,
    effectiveFilters: state.effectiveFilters,
    auth: state.auth,
    
    // New enhanced state
    currentResults: state.currentResults,
    isDiscovering: state.isDiscovering,
    discoveryError: state.discoveryError,
    loadingState: state.loadingState,
    userLocation: state.userLocation,
    
    // Main functions (FIXED HOOK ORDER)
    updateFilters,
    generateSuggestion, // FIXED - no more hook order issues
    resetSuggestion,
    restartSession,
    toggleMoreFilters,
    openInMaps,
    
    // New functions
    discoverPlaces,
    getNextBatch,
    getApiReadyFilters,
    
    // Legacy compatibility (working but deprecated)
    enhancedBulkFetchAndFilter,
    removeFromPool,
    getFilterKey,
    getPoolStats,
    
    // Utility getters
    hasResults: !!state.currentResults?.places.length,
    hasMore: state.currentResults?.hasMore || false,
    isExpanding: state.loadingState === 'expanding-distance',
    isLimitReached: state.loadingState === 'limit-reach',
    currentRadius: servicesRef.current.discovery?.currentRadius || 0,
    totalPlaces: state.currentResults?.places.length || 0,
    
    // Analytics and debugging
    getDiscoveryStats: useCallback(() => ({
      totalPlaces: state.currentResults?.places.length || 0,
      hasAdvertised: !!state.currentResults?.advertisedPlace,
      poolStatus: state.currentResults?.poolStatus || 'empty',
      loadingState: state.loadingState,
      hasMore: state.currentResults?.hasMore || false,
      apiFiltersCount: servicesRef.current.filterData.size
    }), [state.currentResults, state.loadingState])
  };
});

// AppProvider and useAppStore are now exported above via destructuring