import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters, AppState, Suggestion, AuthState } from '../types/app';
import { useAuth } from './use-auth';
import * as Location from 'expo-location';
import { getCuratedImages } from '../utils/image-sourcing';
import { generateComprehensiveDescription } from '../utils/description-generator';

// Google Places API configuration
const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const PLACES_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Default location (Manila, Philippines)
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lng: 120.9842
};

// Cache for API responses to avoid repeated calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track used suggestions to avoid repetition
const usedSuggestions = new Set<string>();
const MAX_USED_SUGGESTIONS = 50;

// Enhanced distance radius mapping with more practical ranges
const getDistanceRadius = (distanceRange: number, attempt: number = 0): number => {
  console.log(`🎯 Distance range input: ${distanceRange}, attempt: ${attempt}`);
  
  // Round the distance range to handle decimal values
  const roundedDistance = Math.round(distanceRange);
  console.log(`🎯 Rounded distance range: ${roundedDistance}`);
  
  // Base radius based on distance range
  let baseRadius: number;
  
  // Special case for very close range (0-500m) - perfect for mall scenarios
  if (roundedDistance <= 1) {
    baseRadius = 500;
    console.log(`📍 Very Close selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 2) {
    baseRadius = 1000;
    console.log(`🚶 Walking Distance selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 4) {
    baseRadius = 2000;
    console.log(`🚶 Walking Distance selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 6) {
    baseRadius = 5000;
    console.log(`🚴 Bike Distance selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 10) {
    baseRadius = 10000;
    console.log(`🚗 Short Trip selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 15) {
    baseRadius = 15000;
    console.log(`🛣️ Nearby Drive selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 20) {
    baseRadius = 20000;
    console.log(`🗺️ Further Out selected: ${baseRadius}m radius`);
  } else if (roundedDistance <= 23) {
    baseRadius = 50000;
    console.log(`🚀 Long Drive selected: ${baseRadius}m radius`);
  } else {
    baseRadius = 100000;
    console.log(`🌍 Any Distance selected: ${baseRadius}m radius`);
  }
  
  // If this is a retry attempt, gradually increase the radius
  if (attempt > 0) {
    const multiplier = 1 + (attempt * 0.5); // Increase by 50% each attempt
    const adjustedRadius = Math.round(baseRadius * multiplier);
    console.log(`🔄 Attempt ${attempt}: Increasing radius to ${adjustedRadius}m`);
    return adjustedRadius;
  }
  
  return baseRadius;
};

// Optimized budget mapping
const getBudgetPriceLevel = (budget: 'P' | 'PP' | 'PPP', category: string): { minprice?: number, maxprice?: number } => {
  if (category !== 'food') return {};
  
  switch (budget) {
    case 'P': return { minprice: 0, maxprice: 1 };
    case 'PP': return { minprice: 1, maxprice: 2 };
    case 'PPP': return { minprice: 2, maxprice: 4 };
    default: return {};
  }
};

// Optimized category mapping
const getCategoryType = (category: 'food' | 'activity' | 'something-new'): string => {
  switch (category) {
    case 'food': return 'restaurant';
    case 'activity': return 'tourist_attraction';
    case 'something-new': return 'point_of_interest';
    default: return 'establishment';
  }
};

// Enhanced image fetching with comprehensive sourcing
// Import the new image sourcing function
import { getComprehensiveImages as getComprehensiveImagesFromUtils } from '../utils/image-sourcing';

const getComprehensiveImages = async (
  placeName: string, 
  placeLocation: string, 
  category: string, 
  existingPhotos: string[] = [],
  placeId?: string,
  coordinates?: { lat: number; lng: number }
): Promise<string[]> => {
  // Use the new image sourcing function that focuses on real photos
  return await getComprehensiveImagesFromUtils(
    placeName,
    placeLocation,
    category,
    existingPhotos,
    placeId,
    coordinates
  );
};

// Optimized place conversion
const convertGooglePlaceToSuggestion = async (place: any, effectiveFilters: any): Promise<Suggestion> => {
  console.log('Converting Google Place:', place.name);
  
  // Get optimized images with placeId and coordinates
  const photos = await getComprehensiveImages(
    place.name,
    place.formatted_address || '',
    effectiveFilters.category,
    place.photos?.slice(0, 3).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
    ) || [],
    place.place_id,
    place.geometry?.location ? {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    } : undefined
  );
  
  // Optimized budget mapping
  const budgetMap: { [key: number]: 'P' | 'PP' | 'PPP' } = { 
    0: 'P', 1: 'P', 2: 'PP', 3: 'PPP', 4: 'PPP'
  };
  
  const budget = place.price_level !== undefined 
    ? budgetMap[place.price_level] || 'PP'
    : effectiveFilters.budget;
  
  // Generate description
  const description = await generateComprehensiveDescription(
    place.name || 'Unknown Place',
    effectiveFilters.category,
    place.reviews?.slice(0, 3) || [],
    place.rating,
    place.user_ratings_total,
    budget
  );
  
  // Determine mood based on effective filters
  const mood = effectiveFilters.mood > 60 ? 'hype' : effectiveFilters.mood < 40 ? 'chill' : 'both';
  
  return {
    id: place.place_id || `local_${Date.now()}`,
    name: place.name,
    location: place.formatted_address || place.vicinity || 'Manila, Philippines',
    description,
    budget,
    images: photos,
    tags: [
      effectiveFilters.category === 'food' ? 'Restaurant' : 'Activity',
      budget === 'P' ? 'Budget-Friendly' : budget === 'PP' ? 'Mid-Range' : 'Premium',
      effectiveFilters.socialContext === 'solo' ? 'Solo-Friendly' : 
      effectiveFilters.socialContext === 'with-bae' ? 'Perfect for Two' : 'Group Activity'
    ],
    discount: Math.random() > 0.7 ? 'Special Offer Available' : undefined,
    reviews: place.reviews?.slice(0, 3) || [],
    category: effectiveFilters.category,
    mood,
    socialContext: [effectiveFilters.socialContext],
    timeOfDay: [effectiveFilters.timeOfDay],
    coordinates: place.geometry?.location ? {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    } : undefined,
    rating: place.rating,
    reviewCount: place.user_ratings_total
  };
};

// Optimized keyword generation with more variety
const getVibeKeywords = (mood: number, category: string, attempt: number = 0) => {
  const keywords = [];
  
  // Add variety based on attempt number to get different results
  if (attempt === 0) {
    if (mood < 30) keywords.push('cozy', 'quiet', 'relaxing');
    else if (mood < 70) keywords.push('vibrant', 'lively', 'energetic');
    else keywords.push('exciting', 'adventurous', 'thrilling');
  } else if (attempt === 1) {
    if (category === 'food') keywords.push('restaurant', 'cafe', 'dining');
    else keywords.push('attraction', 'activity', 'experience');
  } else if (attempt === 2) {
    keywords.push('popular', 'trendy', 'local');
  } else {
    // No keywords for maximum variety
  }
  
  return keywords;
};

const getSocialKeywords = (social: string, category: string) => {
  switch (social) {
    case 'solo': return ['solo-friendly', 'individual'];
    case 'with-bae': return ['romantic', 'intimate', 'couple'];
    case 'barkada': return ['group', 'social', 'party'];
    default: return [];
  }
};

// Enhanced Google Places API call with prioritized filters
const fetchGooglePlaces = async (effectiveFilters: any, userLocation: {lat: number, lng: number}, attempt: number = 0): Promise<Suggestion[]> => {
  const radius = getDistanceRadius(effectiveFilters.distanceRange, attempt);
  const type = getCategoryType(effectiveFilters.category);
  const priceLevel = getBudgetPriceLevel(effectiveFilters.budget, effectiveFilters.category);
  
  // Use user's actual location for very close ranges (500m or less)
  let searchLocation = { ...userLocation };
  
  if (radius > 1000) {
    const locationOffset = attempt * 0.005;
    searchLocation = {
      lat: userLocation.lat + (Math.random() - 0.5) * locationOffset,
      lng: userLocation.lng + (Math.random() - 0.5) * locationOffset
    };
  }
  
  // Build cache key with attempt number - simplified
  const cacheKey = `${searchLocation.lat},${searchLocation.lng}-${radius}-${type}-${attempt}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached API response');
    return cached.data;
  }
  
  // Build URL parameters with priority-based filtering
  const paramsObj: Record<string, string> = {
    location: `${searchLocation.lat},${searchLocation.lng}`,
    radius: radius.toString(),
    type,
    key: GOOGLE_API_KEY,
  };
  
  // Priority 1: Distance (always included - highest priority)
  console.log(`📍 Priority 1 - Distance: ${radius}m radius`);
  
  // Priority 2: Budget (for food category)
  if (effectiveFilters.category === 'food' && priceLevel.minprice !== undefined && priceLevel.maxprice !== undefined) {
    // Only add price filter if it's not too restrictive for very close searches
    if (radius > 1000 || (priceLevel.minprice > 0 || priceLevel.maxprice > 1)) {
      paramsObj['minprice'] = priceLevel.minprice.toString();
      paramsObj['maxprice'] = priceLevel.maxprice.toString();
      console.log(`💰 Priority 2 - Budget: ${priceLevel.minprice}-${priceLevel.maxprice}`);
    }
  }
  
  // Priority 3: Mood (only if not too restrictive)
  const vibeKeywords = getVibeKeywords(effectiveFilters.mood, effectiveFilters.category, attempt);
  const keywords = vibeKeywords.length > 0 ? vibeKeywords[Math.floor(Math.random() * vibeKeywords.length)] : '';
  
  // Only add mood keywords if this is not a retry attempt (prioritize distance over mood)
  if (keywords && attempt === 0) {
    paramsObj['keyword'] = keywords;
    console.log(`🎭 Priority 3 - Mood: ${keywords}`);
  } else if (attempt > 0) {
    console.log(`🎯 Skipping mood (attempt ${attempt}) to prioritize distance`);
  }
  
  // Priority 4 & 5: Social Context & Time of Day are handled in post-processing
  // (These are used for filtering results after API call, not in the API call itself)
  
  const params = new URLSearchParams(paramsObj);
  const url = `${PLACES_SEARCH_URL}?${params.toString()}`;
  
  console.log(`🔍 Fetching Google Places (attempt ${attempt}) with radius: ${radius}m, location: ${searchLocation.lat},${searchLocation.lng}`);
  console.log(`🔍 URL: ${url}`);
  
  try {
    const response = await Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📥 Google Places API response status:', data.status);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      console.log(`✅ Found ${data.results.length} places`);
      
      // Filter out already used suggestions
      let newResults = data.results.filter((place: any) => !usedSuggestions.has(place.place_id));
      
      // Priority 4: Social Context filtering (post-processing)
      if (effectiveFilters.socialContext && newResults.length > 0) {
        const socialKeywords = getSocialKeywords(effectiveFilters.socialContext, effectiveFilters.category);
        const socialFiltered = newResults.filter((place: any) => {
          const placeName = place.name?.toLowerCase() || '';
          const placeTypes = place.types || [];
          return socialKeywords.some(keyword => 
            placeName.includes(keyword.toLowerCase()) || 
            placeTypes.some((type: string) => type.toLowerCase().includes(keyword.toLowerCase()))
          );
        });
        
        if (socialFiltered.length > 0) {
          newResults = socialFiltered;
          console.log(`👥 Priority 4 - Social Context: ${effectiveFilters.socialContext} (filtered to ${newResults.length} places)`);
        } else {
          console.log(`👥 Priority 4 - Social Context: ${effectiveFilters.socialContext} (no matches, keeping all results)`);
        }
      }
      
      // Priority 5: Time of Day filtering (post-processing)
      if (effectiveFilters.timeOfDay && newResults.length > 0) {
        const timeKeywords = {
          'morning': ['breakfast', 'coffee', 'cafe', 'brunch'],
          'afternoon': ['lunch', 'dining', 'restaurant', 'cafe'],
          'night': ['dinner', 'bar', 'nightlife', 'restaurant']
        };
        
        const timeFiltered = newResults.filter((place: any) => {
          const placeName = place.name?.toLowerCase() || '';
          const placeTypes = place.types || [];
          const keywords = timeKeywords[effectiveFilters.timeOfDay as keyof typeof timeKeywords] || [];
          return keywords.some(keyword => 
            placeName.includes(keyword) || 
            placeTypes.some((type: string) => type.toLowerCase().includes(keyword))
          );
        });
        
        if (timeFiltered.length > 0) {
          newResults = timeFiltered;
          console.log(`🕐 Priority 5 - Time of Day: ${effectiveFilters.timeOfDay} (filtered to ${newResults.length} places)`);
        } else {
          console.log(`🕐 Priority 5 - Time of Day: ${effectiveFilters.timeOfDay} (no matches, keeping all results)`);
        }
      }
      
      if (newResults.length === 0 && attempt < 3) {
        console.log('🔄 No results after priority filtering, trying with different parameters...');
        return fetchGooglePlaces(effectiveFilters, userLocation, attempt + 1);
      }
      
      const suggestions = await Promise.all(
        newResults.slice(0, 5).map((place: any) => convertGooglePlaceToSuggestion(place, effectiveFilters))
      );
      
      // Cache the result
      apiCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });
      
      return suggestions;
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.log('⚠️ Google API returned zero results for current filters');
      if (attempt < 3) {
        console.log(`🔄 No results found with ${radius}m radius, trying with larger radius and relaxed filters...`);
        return fetchGooglePlaces(effectiveFilters, userLocation, attempt + 1);
      }
      return [];
    }
    
    throw new Error(`Google Places API error: ${data.status}`);
    
  } catch (error) {
    console.error('❌ Google Places API request failed:', error);
    if (attempt < 3) {
      return fetchGooglePlaces(effectiveFilters, userLocation, attempt + 1);
    }
    throw error;
  }
};

// Optimized fallback suggestion generation
const generateRealisticSuggestion = async (effectiveFilters: any): Promise<Suggestion> => {
  console.log('🏪 Generating realistic local suggestion as fallback...');
  
  const manilaPlaces = {
    food: [
      { name: 'Manam Comfort Filipino', location: 'Greenbelt 2, Makati', tags: ['Filipino Cuisine', 'Comfort Food', 'Popular'] },
      { name: 'Ramen Nagi', location: 'SM Megamall, Ortigas', tags: ['Japanese Ramen', 'Authentic', 'Must-Try'] },
      { name: 'Purple Yam', location: 'Malate, Manila', tags: ['Modern Filipino', 'Creative', 'Instagrammable'] },
      { name: 'Locavore', location: 'Capitol Commons, Pasig', tags: ['Filipino Fusion', 'Trendy', 'Local Favorite'] },
      { name: 'Mesa Filipino Moderne', location: 'Greenbelt 5, Makati', tags: ['Modern Filipino', 'Upscale', 'Date Night'] }
    ],
    activity: [
      { name: 'National Museum of Fine Arts', location: 'Ermita, Manila', tags: ['Art', 'Culture', 'Educational'] },
      { name: 'Rizal Park', location: 'Ermita, Manila', tags: ['Historical', 'Outdoor', 'Family Friendly'] },
      { name: 'Intramuros Walking Tour', location: 'Intramuros, Manila', tags: ['Historical', 'Walking', 'Cultural'] },
      { name: 'Manila Ocean Park', location: 'Behind Quirino Grandstand', tags: ['Aquarium', 'Family', 'Interactive'] },
      { name: 'Ayala Museum', location: 'Greenbelt, Makati', tags: ['Art', 'History', 'Premium'] }
    ],
    'something-new': [
      { name: 'Art in Island 3D Museum', location: 'Cubao, Quezon City', tags: ['Interactive Art', 'Unique', 'Photo Ops'] },
      { name: 'Escape Room Manila', location: 'Ortigas Center', tags: ['Puzzle', 'Team Building', 'Adventure'] },
      { name: 'Poblacion Night Market', location: 'Poblacion, Makati', tags: ['Street Food', 'Nightlife', 'Local Scene'] },
      { name: 'Bambike Ecotours', location: 'Intramuros, Manila', tags: ['Eco-friendly', 'Cycling', 'Sustainable'] },
      { name: 'Sining Kamalig Art Gallery', location: 'Quezon City', tags: ['Local Art', 'Hidden Gem', 'Cultural'] }
    ]
  };
  
  const categoryPlaces = manilaPlaces[effectiveFilters.category as keyof typeof manilaPlaces] || manilaPlaces.food;
  const selectedPlace = categoryPlaces[Math.floor(Math.random() * categoryPlaces.length)];
  
  // Get optimized images
  const images = await getComprehensiveImages(selectedPlace.name, selectedPlace.location, effectiveFilters.category);
  
  // Determine mood based on effective filters
  const mood = effectiveFilters.mood > 60 ? 'hype' : effectiveFilters.mood < 40 ? 'chill' : 'both';
  
  return {
    id: `fallback_${Date.now()}`,
    name: selectedPlace.name,
    location: selectedPlace.location,
    description: `Experience the best of ${effectiveFilters.category} at ${selectedPlace.name}. Perfect for ${effectiveFilters.socialContext === 'solo' ? 'solo exploration' : effectiveFilters.socialContext === 'with-bae' ? 'romantic dates' : 'group activities'}.`,
    budget: effectiveFilters.budget,
    images,
    tags: selectedPlace.tags,
    discount: Math.random() > 0.8 ? 'Local Favorite' : undefined,
    reviews: [],
    category: effectiveFilters.category,
    mood,
    socialContext: [effectiveFilters.socialContext],
    timeOfDay: [effectiveFilters.timeOfDay],
    coordinates: {
      lat: DEFAULT_LOCATION.lat + (Math.random() - 0.5) * 0.05,
      lng: DEFAULT_LOCATION.lng + (Math.random() - 0.5) * 0.05
    }
  };
};

// Curated fallback for new places
const curatedNewPlaces: Suggestion[] = [
  {
    id: 'curated-1',
    name: 'The Newest Ramen Spot',
    location: 'Greenhills, San Juan',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80'
    ],
    budget: 'PP',
    tags: ['Japanese', 'Ramen', 'New', 'Trendy'],
    description: 'The Newest Ramen Spot is a hidden gem that locals can\'t stop talking about. With its authentic flavors and modern vibes, this spot has become a must-visit destination for food enthusiasts.',
    category: 'food',
    mood: 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['afternoon', 'night'],
    coordinates: { lat: 14.6042, lng: 121.0359 }
  },
  {
    id: 'curated-2',
    name: 'Escape Room X',
    location: 'BGC, Taguig',
    images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80'
    ],
    budget: 'PP',
    tags: ['Escape Room', 'Puzzle', 'New', 'Adventure'],
    description: 'Escape Room X delivers with its thrilling puzzles and immersive experience. It\'s the perfect place to create unforgettable memories with friends.',
    category: 'activity',
    mood: 'hype',
    socialContext: ['barkada', 'with-bae'],
    timeOfDay: ['afternoon', 'night'],
    coordinates: { lat: 14.5534, lng: 121.0492 }
  }
];

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

    let userLocation = DEFAULT_LOCATION;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        userLocation = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }
    } catch (e) { /* fallback to default */ }

    try {
      // Get current filters and apply smart defaults for unselected filters
      const currentFilters = stateRef.current.filters;
      
      // Get current time for smart time of day default
      const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'night' => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        return 'night';
      };
      
      // Smart defaults
      const budgetOptions: ('P' | 'PP' | 'PPP')[] = ['P', 'PP', 'PPP'];
      
      const effectiveFilters = {
        category: currentFilters.category,
        mood: currentFilters.mood,
        socialContext: currentFilters.socialContext || 'solo', // Default to solo when not selected
        timeOfDay: currentFilters.timeOfDay || getCurrentTimeOfDay(), // Default to current time of day
        budget: currentFilters.budget || budgetOptions[Math.floor(Math.random() * budgetOptions.length)], // Randomize budget when not selected
        distanceRange: currentFilters.distanceRange || (1 + Math.random() * 23) // Random between 1-24 (full range)
      };
      
      console.log('Generating suggestion with effective filters:', effectiveFilters);
      
      let suggestion: Suggestion | null = null;
      let suggestions: Suggestion[] = [];
      const newRetriesNormal = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
      
      // Clear used suggestions if we have too many
      if (usedSuggestions.size >= MAX_USED_SUGGESTIONS) {
        console.log('🔄 Clearing used suggestions cache for variety');
        usedSuggestions.clear();
      }
      
      if (effectiveFilters.category === 'something-new') {
        // Enhanced something-new logic with diversification
        const types = ['restaurant', 'tourist_attraction'];
        let allSuggestions: Suggestion[] = [];
        const newRetries = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
        
        for (const t of types) {
          const modifiedFilters = { ...effectiveFilters, category: t === 'restaurant' ? 'food' : 'activity' };
          const typeSuggestions = await fetchGooglePlaces(modifiedFilters, userLocation);
          allSuggestions = allSuggestions.concat(typeSuggestions);
        }
        
        // Filter for newness: low review count but high rating
        const newSuggestions = allSuggestions.filter((s: Suggestion) => {
          const reviewCount = s.reviewCount || 0;
          const rating = s.rating || 0;
          return reviewCount < 50 && rating >= 4.0;
        });
        
        if (newSuggestions.length > 0) {
          // Select a suggestion that hasn't been used
          const unusedSuggestions = newSuggestions.filter(s => !usedSuggestions.has(s.id));
          const selectedSuggestion = unusedSuggestions.length > 0 
            ? unusedSuggestions[Math.floor(Math.random() * unusedSuggestions.length)]
            : newSuggestions[Math.floor(Math.random() * newSuggestions.length)];
          
          // Mark as used
          usedSuggestions.add(selectedSuggestion.id);
          
          setState(prev => ({
            ...prev,
            currentSuggestion: selectedSuggestion,
            retriesLeft: newRetries,
            isLoading: false,
            effectiveFilters: {
              budget: effectiveFilters.budget,
              timeOfDay: effectiveFilters.timeOfDay,
              socialContext: effectiveFilters.socialContext,
              distanceRange: effectiveFilters.distanceRange
            }
          }));
          return;
        } else {
          // Fallback to curated suggestions
          const fallbackSuggestion = await generateRealisticSuggestion(effectiveFilters);
          usedSuggestions.add(fallbackSuggestion.id);
          
          setState(prev => ({
            ...prev,
            currentSuggestion: fallbackSuggestion,
            retriesLeft: newRetries,
            isLoading: false,
            effectiveFilters: {
              budget: effectiveFilters.budget,
              timeOfDay: effectiveFilters.timeOfDay,
              socialContext: effectiveFilters.socialContext,
              distanceRange: effectiveFilters.distanceRange
            }
          }));
          return;
        }
      } else {
        // Normal food/activity with enhanced diversification
        suggestions = await fetchGooglePlaces(effectiveFilters, userLocation);
        
        if (suggestions.length > 0) {
          // Select a suggestion that hasn't been used
          const unusedSuggestions = suggestions.filter(s => !usedSuggestions.has(s.id));
          const selectedSuggestion = unusedSuggestions.length > 0 
            ? unusedSuggestions[Math.floor(Math.random() * unusedSuggestions.length)]
            : suggestions[Math.floor(Math.random() * suggestions.length)];
          
          // Mark as used
          usedSuggestions.add(selectedSuggestion.id);
          
          setState(prev => ({
            ...prev,
            currentSuggestion: selectedSuggestion,
            retriesLeft: newRetriesNormal,
            isLoading: false,
            effectiveFilters: {
              budget: effectiveFilters.budget,
              timeOfDay: effectiveFilters.timeOfDay,
              socialContext: effectiveFilters.socialContext,
              distanceRange: effectiveFilters.distanceRange
            }
          }));
          return;
        } else {
          // Fallback to curated suggestions
          const fallbackSuggestion = await generateRealisticSuggestion(effectiveFilters);
          usedSuggestions.add(fallbackSuggestion.id);
          
          setState(prev => ({
            ...prev,
            currentSuggestion: fallbackSuggestion,
            retriesLeft: newRetriesNormal,
            isLoading: false,
            effectiveFilters: {
              budget: effectiveFilters.budget,
              timeOfDay: effectiveFilters.timeOfDay,
              socialContext: effectiveFilters.socialContext,
              distanceRange: effectiveFilters.distanceRange
            }
          }));
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error generating suggestion:', error);
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