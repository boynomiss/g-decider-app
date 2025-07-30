import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters, AppState, Suggestion, AuthState } from '@/types/app';
import { useAuth } from '@/hooks/use-auth';

// Google Places API configuration
const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
// Updated to use direct Google Places API since proxy is not available
const PLACES_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Default location (Manila, Philippines)
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lng: 120.9842
};

// Distance range mapping
const getDistanceRadius = (distanceRange: number): number => {
  if (distanceRange < 1) return 1000; // Walking Distance (Less than 1 km) 🚶‍♀️
  if (distanceRange < 3) return 3000; // Bike Distance (Less than 3 km) 🚴
  if (distanceRange < 5) return 5000; // Short Trip (Up to 5 km) 🚗
  if (distanceRange < 10) return 10000; // Nearby Drive (Up to 10 km) 🛣️
  if (distanceRange < 15) return 15000; // Moderate Drive (Up to 15 km) 💨
  if (distanceRange < 20) return 20000; // Further Out (Up to 20 km) 🗺️
  if (distanceRange < 24) return 50000; // Long Drive (20+ km) 🚀
  return 100000; // As Far As It Gets (Any distance) 🌍
};

// Budget mapping for Google Places price levels
const getBudgetPriceLevel = (budget: 'P' | 'PP' | 'PPP', category: string): { minprice?: number, maxprice?: number } => {
  // Only restaurants support price levels in Google Places API
  if (category !== 'food') return {};
  
  switch (budget) {
    case 'P': return { minprice: 0, maxprice: 1 };
    case 'PP': return { minprice: 1, maxprice: 2 };
    case 'PPP': return { minprice: 2, maxprice: 4 };
    default: return {};
  }
};

// Category to Google Places type mapping
const getCategoryType = (category: 'food' | 'activity' | 'something-new'): string => {
  switch (category) {
    case 'food': return 'restaurant';
    case 'activity': return 'tourist_attraction';
    case 'something-new': return 'point_of_interest';
    default: return 'establishment';
  }
};

// Convert Google Places result to our Suggestion format
const convertGooglePlaceToSuggestion = (place: any, effectiveFilters: any): Suggestion => {
  console.log('Converting Google Place:', place.name, place);
  
  const photos = place.photos ? place.photos.slice(0, 3).map((photo: any) => 
    `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${GOOGLE_API_KEY}`
  ) : [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
  ];

  const budgetMap: { [key: number]: 'P' | 'PP' | 'PPP' } = { 0: 'P', 1: 'P', 2: 'PP', 3: 'PPP', 4: 'PPP' };
  const budget = place.price_level !== undefined ? budgetMap[place.price_level] || 'PP' : effectiveFilters.budget;

  const tags: string[] = [];
  if (place.rating) tags.push(`⭐ ${place.rating}`);
  if (place.opening_hours?.open_now) tags.push('Open Now');
  if (place.price_level !== undefined) tags.push(`Budget: ${budget}`);
  
  // Extract coordinates from geometry
  const coordinates = place.geometry?.location ? {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng
  } : undefined;
  
  const suggestion: Suggestion = {
    id: place.place_id || Math.random().toString(),
    name: place.name || 'Unknown Place',
    location: place.vicinity || place.formatted_address || 'Manila',
    images: photos,
    budget: budget as 'P' | 'PP' | 'PPP',
    tags,
    description: `Discover this ${effectiveFilters.category === 'food' ? 'dining' : 'activity'} spot with a ${place.rating ? `${place.rating}-star rating` : 'great'} experience.`,
    category: effectiveFilters.category,
    mood: effectiveFilters.mood > 60 ? 'hype' : effectiveFilters.mood < 40 ? 'chill' : 'both',
    socialContext: [effectiveFilters.socialContext],
    timeOfDay: [effectiveFilters.timeOfDay],
    coordinates
  };
  
  console.log('Converted suggestion:', suggestion.name, 'at coordinates:', coordinates);
  return suggestion;
};

// Fetch places from Google Places API directly
const fetchGooglePlaces = async (effectiveFilters: any): Promise<Suggestion[]> => {
  const radius = getDistanceRadius(effectiveFilters.distanceRange);
  const type = getCategoryType(effectiveFilters.category);
  const priceLevel = getBudgetPriceLevel(effectiveFilters.budget, effectiveFilters.category);
  
  // Build URL parameters for direct Google Places API
  const params = new URLSearchParams({
    location: `${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}`,
    radius: radius.toString(),
    type,
    key: GOOGLE_API_KEY,
    ...priceLevel
  });

  const url = `${PLACES_SEARCH_URL}?${params.toString()}`;
  console.log('🔍 Fetching Google Places with URL:', url);
  
  try {
    const response = await Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📥 Google Places API response status:', data.status);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      console.log(`✅ SUCCESS: Found ${data.results.length} real places from Google Places API`);
      const suggestions = data.results.slice(0, 10).map((place: any) => convertGooglePlaceToSuggestion(place, effectiveFilters));
      return suggestions;
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.log('⚠️ Google API returned zero results for current filters');
      return [];
    }
    
    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google API access denied: ${data.error_message || 'Check API key and billing'}`);
    }
    
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    
  } catch (error) {
    console.error('❌ Google Places API request failed:', error);
    throw error;
  }
};

// Generate realistic suggestions using local data as fallback
const generateRealisticSuggestion = async (effectiveFilters: any): Promise<Suggestion> => {
  console.log('🏪 Generating realistic local suggestion as fallback...');
  
  // Curated realistic Manila establishments by category
  const manilaPlaces = {
    food: [
      { name: 'Manam Comfort Filipino', location: 'Greenbelt 2, Makati', tags: ['Filipino Cuisine', 'Comfort Food', 'Popular'] },
      { name: 'Ramen Nagi', location: 'SM Megamall, Ortigas', tags: ['Japanese Ramen', 'Authentic', 'Must-Try'] },
      { name: 'Purple Yam', location: 'Malate, Manila', tags: ['Modern Filipino', 'Creative', 'Instagrammable'] },
      { name: 'Locavore', location: 'Capitol Commons, Pasig', tags: ['Filipino Fusion', 'Trendy', 'Local Favorite'] },
      { name: 'Mesa Filipino Moderne', location: 'Greenbelt 5, Makati', tags: ['Modern Filipino', 'Upscale', 'Date Night'] },
      { name: 'Sarsa Kitchen + Bar', location: 'Bonifacio Global City', tags: ['Filipino', 'Contemporary', 'Group Dining'] }
    ],
    activity: [
      { name: 'National Museum of Fine Arts', location: 'Ermita, Manila', tags: ['Art', 'Culture', 'Educational'] },
      { name: 'Rizal Park', location: 'Ermita, Manila', tags: ['Historical', 'Outdoor', 'Family Friendly'] },
      { name: 'Intramuros Walking Tour', location: 'Intramuros, Manila', tags: ['Historical', 'Walking', 'Cultural'] },
      { name: 'Manila Ocean Park', location: 'Behind Quirino Grandstand', tags: ['Aquarium', 'Family', 'Interactive'] },
      { name: 'Ayala Museum', location: 'Greenbelt, Makati', tags: ['Art', 'History', 'Premium'] },
      { name: 'La Mesa Eco Park', location: 'Quezon City', tags: ['Nature', 'Outdoor', 'Recreation'] }
    ],
    'something-new': [
      { name: 'Art in Island 3D Museum', location: 'Cubao, Quezon City', tags: ['Interactive Art', 'Unique', 'Photo Ops'] },
      { name: 'Escape Room Manila', location: 'Ortigas Center', tags: ['Puzzle', 'Team Building', 'Adventure'] },
      { name: 'Poblacion Night Market', location: 'Poblacion, Makati', tags: ['Street Food', 'Nightlife', 'Local Scene'] },
      { name: 'Bambike Ecotours', location: 'Intramuros, Manila', tags: ['Eco-friendly', 'Cycling', 'Sustainable'] },
      { name: 'Sining Kamalig Art Gallery', location: 'Quezon City', tags: ['Local Art', 'Hidden Gem', 'Cultural'] },
      { name: 'Rooftop Bar Hopping', location: 'Bonifacio Global City', tags: ['Nightlife', 'Views', 'Social'] }
    ]
  };
  
  const categoryPlaces = manilaPlaces[effectiveFilters.category as keyof typeof manilaPlaces] || manilaPlaces.food;
  const selectedPlace = categoryPlaces[Math.floor(Math.random() * categoryPlaces.length)];
  
  // Generate appropriate images based on category
  const getImages = (category: string) => {
    const imageMap = {
      food: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
      ],
      activity: [
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
      ],
      'something-new': [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop'
      ]
    };
    return imageMap[category as keyof typeof imageMap] || imageMap.food;
  };
  
  const mood = effectiveFilters.mood > 60 ? 'hype' : effectiveFilters.mood < 40 ? 'chill' : 'both';
  
  const suggestion: Suggestion = {
    id: Math.random().toString(),
    name: selectedPlace.name,
    location: selectedPlace.location,
    images: getImages(effectiveFilters.category),
    budget: effectiveFilters.budget,
    tags: [...selectedPlace.tags, `${effectiveFilters.budget} Budget`],
    description: `A ${mood === 'chill' ? 'relaxing' : mood === 'hype' ? 'exciting' : 'versatile'} ${effectiveFilters.category === 'food' ? 'dining' : effectiveFilters.category} experience perfect for ${effectiveFilters.socialContext === 'solo' ? 'solo adventures' : effectiveFilters.socialContext === 'with-bae' ? 'romantic moments' : 'group fun'}.`,
    category: effectiveFilters.category,
    mood,
    socialContext: [effectiveFilters.socialContext],
    timeOfDay: [effectiveFilters.timeOfDay],
    coordinates: {
      lat: DEFAULT_LOCATION.lat + (Math.random() - 0.5) * 0.05,
      lng: DEFAULT_LOCATION.lng + (Math.random() - 0.5) * 0.05
    }
  };
  
  console.log('🏪 Generated realistic suggestion:', suggestion.name);
  return suggestion;
};

const defaultFilters: UserFilters = {
  mood: 50,
  category: null,
  budget: null,
  timeOfDay: null,
  socialContext: null,
  distanceRange: null
};

const FREE_TRIAL_RETRIES = 3;
const RETRIES_STORAGE_KEY = '@g_app_retries';

export const [AppProvider, useAppStore] = createContextHook(() => {
  const auth = useAuth();
  
  const [state, setState] = useState<AppState>({
    filters: defaultFilters,
    retriesLeft: FREE_TRIAL_RETRIES,
    currentSuggestion: null,
    isLoading: false,
    showMoreFilters: false,
    effectiveFilters: null,
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: true
    }
  });

  // Update auth state when auth context changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      auth: {
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading
      }
    }));
  }, [auth.user, auth.isAuthenticated, auth.isLoading]);

  // Load retries from storage for unauthenticated users
  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated && auth.user?.isPremium) {
        // Premium users have unlimited retries
        setState(prev => ({ ...prev, retriesLeft: -1 })); // -1 indicates unlimited
      } else if (auth.isAuthenticated) {
        // Authenticated non-premium users get more retries
        setState(prev => ({ ...prev, retriesLeft: 10 }));
      } else {
        // Load stored retries for unauthenticated users
        loadStoredRetries();
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.isPremium]);

  const loadStoredRetries = async () => {
    try {
      const storedRetries = await AsyncStorage.getItem(RETRIES_STORAGE_KEY);
      if (storedRetries !== null) {
        const retries = parseInt(storedRetries, 10);
        setState(prev => ({ ...prev, retriesLeft: Math.max(0, retries) }));
      }
    } catch (error) {
      console.error('Error loading stored retries:', error);
    }
  };

  const saveRetries = async (retries: number) => {
    try {
      await AsyncStorage.setItem(RETRIES_STORAGE_KEY, retries.toString());
    } catch (error) {
      console.error('Error saving retries:', error);
    }
  };

  const stateRef = useRef(state);
  stateRef.current = state;

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const generateSuggestion = useCallback(async () => {
    console.log('generateSuggestion called');
    
    // Use ref to get current state without dependency
    const currentState = stateRef.current;
    
    // Check if user has retries left (unlimited retries = -1)
    if (currentState.retriesLeft === 0 || currentState.isLoading) {
      console.log('Generate suggestion blocked: retriesLeft =', currentState.retriesLeft, 'isLoading =', currentState.isLoading);
      return;
    }
    
    console.log('Starting suggestion generation...');
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get current filters and apply randomization for unselected filters
      const currentFilters = stateRef.current.filters;
      
      // Randomize unselected filters
      const socialContextOptions: ('solo' | 'with-bae' | 'barkada')[] = ['solo', 'with-bae', 'barkada'];
      const budgetOptions: ('P' | 'PP' | 'PPP')[] = ['P', 'PP', 'PPP'];
      const timeOfDayOptions: ('morning' | 'afternoon' | 'night')[] = ['morning', 'afternoon', 'night'];
      
      const effectiveFilters = {
        category: currentFilters.category,
        mood: currentFilters.mood,
        socialContext: currentFilters.socialContext || socialContextOptions[Math.floor(Math.random() * socialContextOptions.length)],
        timeOfDay: currentFilters.timeOfDay || timeOfDayOptions[Math.floor(Math.random() * timeOfDayOptions.length)],
        budget: currentFilters.budget || budgetOptions[Math.floor(Math.random() * budgetOptions.length)],
        distanceRange: currentFilters.distanceRange || (1 + Math.random() * 23) // Random between 1-24 (full range)
      };
      
      console.log('Generating suggestion with effective filters:', effectiveFilters);
      
      let suggestion: Suggestion | null = null;
      let suggestions: Suggestion[] = [];
      
      try {
        // Try to fetch from Google Places API first
        console.log('🔍 Fetching from Google Places API...');
        suggestions = await fetchGooglePlaces(effectiveFilters);
        
        if (suggestions.length > 0) {
          console.log(`✅ SUCCESS: Found ${suggestions.length} real places from Google Places API`);
          suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          console.log(`✅ SELECTED REAL PLACE: "${suggestion.name}" at ${suggestion.location}`);
        } else {
          throw new Error('No results from Google Places API');
        }
      } catch (error) {
        console.warn('❌ Google Places API failed:', (error as Error)?.message || error);
        console.log('🔄 Falling back to realistic local suggestions...');
        
        // Use realistic local data as fallback instead of AI
        suggestion = await generateRealisticSuggestion(effectiveFilters);
        console.log('🏪 FALLBACK: Using realistic local suggestion:', suggestion.name);
      }

      const newRetries = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
      
      // Save retries for unauthenticated users
      if (!auth.isAuthenticated && newRetries >= 0) {
        saveRetries(newRetries);
      }
      
      setState(prev => ({
        ...prev,
        currentSuggestion: suggestion,
        retriesLeft: newRetries,
        isLoading: false,
        effectiveFilters: {
          budget: effectiveFilters.budget,
          timeOfDay: effectiveFilters.timeOfDay,
          socialContext: effectiveFilters.socialContext,
          distanceRange: effectiveFilters.distanceRange
        }
      }));
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        currentSuggestion: null
      }));
      throw error;
    }
  }, []);

  const resetSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      effectiveFilters: null
    }));
  }, []);

  const restartSession = useCallback(async () => {
    const newRetries = FREE_TRIAL_RETRIES;
    if (!auth.isAuthenticated) {
      await saveRetries(newRetries);
    }
    setState(prev => ({
      ...prev,
      currentSuggestion: null,
      retriesLeft: auth.isAuthenticated && auth.user?.isPremium ? -1 : 
                   auth.isAuthenticated ? 10 : newRetries
    }));
  }, [auth.isAuthenticated, auth.user?.isPremium]);

  const toggleMoreFilters = useCallback(() => {
    setState(prev => {
      const newShowMoreFilters = !prev.showMoreFilters;
      
      // Reset additional filters when collapsing
      if (!newShowMoreFilters) {
        return {
          ...prev,
          showMoreFilters: newShowMoreFilters,
          filters: {
            ...prev.filters,
            budget: null,
            timeOfDay: null,
            socialContext: null,
            distanceRange: null
          }
        };
      }
      
      return {
        ...prev,
        showMoreFilters: newShowMoreFilters
      };
    });
  }, []);

  const openInMaps = useCallback((suggestion: Suggestion) => {
    if (!suggestion.coordinates) {
      console.warn('No coordinates available for this suggestion');
      return;
    }
    
    const { lat, lng } = suggestion.coordinates;
    const label = encodeURIComponent(suggestion.name);
    
    let url: string;
    
    if (Platform.OS === 'ios') {
      // Use Apple Maps on iOS
      url = `http://maps.apple.com/?q=${label}&ll=${lat},${lng}`;
    } else {
      // Use Google Maps on Android and web
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${suggestion.id}`;
    }
    
    console.log('🗺️ Opening maps with URL:', url);
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.warn('Cannot open maps URL:', url);
          // Fallback to web Google Maps
          const fallbackUrl = `https://www.google.com/maps/search/${lat},${lng}`;
          return Linking.openURL(fallbackUrl);
        }
      })
      .catch((error) => {
        console.error('Error opening maps:', error);
      });
  }, []);

  return {
    ...state,
    updateFilters,
    generateSuggestion,
    resetSuggestion,
    restartSession,
    toggleMoreFilters,
    openInMaps
  };
});