import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { UserFilters } from '../features/filtering/types';
import { AppState } from '../shared/types/types/shared-types';
import { PlaceData, PlaceResult, AdvertisedPlace, Suggestion } from '../features/discovery/types';
import { DiscoveryFilters, DiscoveryResult } from '../features/discovery/types';
import { useAuth } from '../features/auth';
import { unifiedFilterService } from '../features/filtering/services/filtering/unified-filter-service';
import { useDynamicFilterLogger } from '../features/filtering/hooks/use-dynamic-filter-logger';
import { FilterApiBridge } from '../features/filtering/services/filtering/filter-api-service';
import { PlaceMoodAnalysisService } from '../features/filtering/services/filtering/mood/place-mood-analysis.service';
import { getAPIKey } from '../shared/constants/config/api-keys';

// API Configuration
const GOOGLE_PLACES_API_KEY = getAPIKey.places();
const GOOGLE_NATURAL_LANGUAGE_API_KEY = getAPIKey.naturalLanguage();

// Default location (Manila, Philippines)
const DEFAULT_LOCATION = { lat: 14.5995, lng: 120.9842 };

// Convert PlaceData to legacy Suggestion format for backwards compatibility
const convertPlaceToSuggestion = (place: PlaceData): Suggestion => {
  // Handle photos array properly - PlaceData has photos.thumbnail structure
  const images = place.photos?.thumbnail || place.images?.urls || [];
  
  // Handle category mapping - convert from PlaceData category to Suggestion category
  const category = place.category === 'food' || place.category === 'activity' || place.category === 'something-new' 
    ? place.category 
    : 'food';
  
  // Handle mood mapping - convert from PlaceData mood_analysis to Suggestion mood
  const mood = place.mood_analysis?.category === 'neutral' ? 'both' : 
               (place.mood_analysis?.category === 'chill' ? 'chill' : 
                (place.mood_analysis?.category === 'hype' ? 'hype' : 'both'));
  
  // Handle reviews conversion - PlaceData has ReviewEntity[], Suggestion expects Review[]
  const reviews = place.reviews ? place.reviews.map((review: any) => ({
    author: 'Anonymous', // Default author since ReviewEntity doesn't have author
    rating: review.rating || 0,
    text: review.text || '',
    time: new Date(review.time || Date.now()).toISOString()
  })) : [];
  
  // Get location string - prefer vicinity, then formatted_address, fallback to coordinates
  const locationString = place.vicinity || 
                        place.formatted_address || 
                        (place.location ? `${place.location.lat}, ${place.location.lng}` : 'Unknown location');
  
  return {
    id: place.place_id || place.name?.replace(/\s+/g, '-').toLowerCase() || 'unknown-place',
    name: place.name || 'Unknown Place',
    location: locationString,
    images: images,
    budget: place.price_level ? (['P', 'PP', 'PPP'][Math.max(0, Math.min(2, place.price_level - 1))] as 'P' | 'PP' | 'PPP') : 'P',
    tags: place.types || [],
    description: place.description || `${place.name || 'This place'} is a great place to visit.`,
    openHours: place.opening_hours?.weekday_text?.join(', ') || undefined,
    category: category,
    mood: mood,
    socialContext: ['solo', 'with-bae', 'barkada'], // Default to all
    timeOfDay: ['morning', 'afternoon', 'night'], // Default to all
    ...(place.location && {
      coordinates: {
        lat: place.location.lat,
        lng: place.location.lng
      }
    }),
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    reviews: reviews,
    website: place.website || ''
  };
};

// Convert PlaceResult or AdvertisedPlace to legacy Suggestion format
const convertPlaceToSuggestionLegacy = (place: PlaceResult | AdvertisedPlace): Suggestion => {
  return {
    id: place.place_id || place.name.replace(/\s+/g, '-').toLowerCase(),
    name: place.name,
    location: place.address || 'Unknown location',
    images: [], // PlaceResult doesn't have photos property
    budget: place.price_level ? (['P', 'PP', 'PPP'][place.price_level - 1] as 'P' | 'PP' | 'PPP') : 'P',
    tags: place.types || [],
    description: (place as any).descriptor || `${place.name} is a great place to visit.`,
    openHours: 'Unknown hours', // PlaceResult doesn't have weekday_text
    category: (place.category as 'food' | 'activity' | 'something-new') || 'food',
    mood: place.final_mood === 'neutral' ? 'both' : (place.final_mood as 'chill' | 'hype') || 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon', 'night'],
    coordinates: typeof place.location === 'object' && place.location ? {
      lat: place.location.lat,
      lng: place.location.lng
    } : { lat: 0, lng: 0 },
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    reviews: place.reviews?.map((review: any) => ({
      author: 'Anonymous',
      rating: review.rating || 0,
      text: review.text || '',
      time: review.time?.toString() || ''
    })) || [],
    website: place.website || ''
  };
};

const [AppContext, useAppStore] = createContextHook(() => {
  const auth = useAuth();
  const { logFilterChange } = useDynamicFilterLogger();
  
  const [state, setState] = useState<AppState>({
    filters: {
      mood: 50,
      category: undefined,
      budget: undefined,
      timeOfDay: undefined, // Will be set in useEffect
      socialContext: undefined,
      distanceRange: 10
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

  // Refs for services
  const filterApiBridgeRef = useRef<FilterApiBridge | null>(null);
  const placeMoodServiceRef = useRef<PlaceMoodAnalysisService | null>(null);

  // Initialize services
  useEffect(() => {
    if (GOOGLE_PLACES_API_KEY) {
      filterApiBridgeRef.current = new FilterApiBridge();
      
      if (GOOGLE_NATURAL_LANGUAGE_API_KEY) {
        placeMoodServiceRef.current = new PlaceMoodAnalysisService(GOOGLE_NATURAL_LANGUAGE_API_KEY);
      }
    }
  }, []);

  // Get current time of day based on device time
  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'night' => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 4 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 18) return 'afternoon';
    return 'night';
  };

  // Initialize time of day on mount
  useEffect(() => {
    const currentTime = getCurrentTimeOfDay();
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        timeOfDay: currentTime
      }
    }));
  }, []);

  // Initialize location
  const initializeLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setState(prev => ({ ...prev, userLocation: DEFAULT_LOCATION }));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // timeout: 15000 // Removed as it's not supported in LocationOptions
      });

      const userLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      setState(prev => ({ ...prev, userLocation }));
      console.log('Location initialized:', userLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      setState(prev => ({ ...prev, userLocation: DEFAULT_LOCATION }));
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setState(prev => {
      // Check if any filter values actually changed (handling undefined properly)
      let hasChanges = false;
      for (const [key, value] of Object.entries(newFilters)) {
        const currentValue = prev.filters[key as keyof UserFilters];
        const newValue = value;
        
        // Handle undefined vs actual values
        if (currentValue !== newValue) {
          // Special case: both undefined is considered the same
          if (currentValue === undefined && newValue === undefined) {
            continue;
          }
          hasChanges = true;
          break;
        }
      }
      
      // Only update state if there are actual changes
      if (!hasChanges) {
        return prev; // Return same reference to prevent re-render
      }
      
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      // Log filter changes
      logFilterChange(prev.filters, updatedFilters, 'update');
      
      return { ...prev, filters: updatedFilters };
    });
  }, [logFilterChange]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters: UserFilters = {
      mood: 50,
      category: undefined,
      budget: undefined,
      timeOfDay: getCurrentTimeOfDay(),
      socialContext: undefined,
      distanceRange: 10
    };
    
    setState(prev => ({ ...prev, filters: defaultFilters }));
    logFilterChange(state.filters, defaultFilters, 'reset');
  }, [logFilterChange]);

  // Toggle more filters
  const toggleMoreFilters = useCallback(() => {
    setState(prev => ({ ...prev, showMoreFilters: !prev.showMoreFilters }));
  }, []);

  // Generate suggestion
  const generateSuggestion = useCallback(async () => {
    if (!state.filters.category || !state.userLocation) {
      console.log('Cannot generate suggestion: missing category or location');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, discoveryError: null }));

    try {
      const result = await unifiedFilterService.discoverPlaces({
        category: state.filters.category as 'food' | 'activity' | 'something-new',
        mood: state.filters.mood || 50,
        socialContext: state.filters.socialContext,
        budget: state.filters.budget,
        timeOfDay: state.filters.timeOfDay,
        distanceRange: state.filters.distanceRange || 10,
        userLocation: state.userLocation
      });

      if (result.success && result.places.length > 0) {
        const place = result.places[0];
        const suggestion = convertPlaceToSuggestion(place);
        
        setState(prev => ({
          ...prev,
          currentSuggestion: suggestion,
          isLoading: false,
          currentResults: result,
          isDiscovering: false,
          loadingState: 'complete'
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          discoveryError: result.error || 'No places found',
          loadingState: 'error'
        }));
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        discoveryError: 'Failed to generate suggestion',
        loadingState: 'error'
      }));
    }
  }, [state.filters, state.userLocation]);

  // Update user location
  const updateUserLocation = useCallback((location: { lat: number; lng: number }) => {
    setState(prev => ({ ...prev, userLocation: location }));
  }, []);

  // Reset suggestion
  const resetSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      currentResults: null,
      isDiscovering: false,
      discoveryError: null,
      loadingState: 'initial'
    }));
  }, []);

  // Initialize location on mount
  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  return {
    ...state,
    filters: state.filters,
    currentSuggestion: state.currentSuggestion,
    isLoading: state.isLoading,
    userLocation: state.userLocation,
    updateFilters,
    resetFilters,
    toggleMoreFilters,
    generateSuggestion,
    updateUserLocation,
    resetSuggestion,
    initializeLocation
  };
});

export { AppContext, useAppStore };
