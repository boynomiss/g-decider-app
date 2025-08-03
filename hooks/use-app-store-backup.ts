import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters, AppState, Suggestion, AuthState } from '../types/app';
import { useAuth } from './use-auth';
import * as Location from 'expo-location';

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
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (was 5)

// Cost optimization config
const COST_OPTIMIZATION = {
  USE_FALLBACK_MORE: true,
  FALLBACK_THRESHOLD: 10,
  MAX_ATTEMPTS: 3
};

// Track used suggestions to avoid repetition
const usedSuggestions = new Set<string>();
const MAX_USED_SUGGESTIONS = 50;

// Enhanced bulk filtering system variables
const filteredResultsPool = new Map<string, Suggestion[]>();
const MIN_POOL_SIZE = 50;
const TARGET_GATHER_SIZE = 100; // Reduced from 200
const POOL_RESET_THRESHOLD = 5; // Reset earlier to save costs

// Smart ranking system functions
const rankResultsByRating = (suggestions: Suggestion[]): Suggestion[] => {
  return suggestions.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    const reviewCountA = a.reviewCount || 0;
    const reviewCountB = b.reviewCount || 0;
    
    // Primary sort by rating, secondary by review count
    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Higher rating first
    }
    return reviewCountB - reviewCountA; // More reviews first
  });
};

// Randomly select sets of 5 from all suggestions
const randomlySelectSetsOfFive = (suggestions: Suggestion[]): Suggestion[][] => {
  const groups: Suggestion[][] = [];
  const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5); // Shuffle first
  
  // Group into sets of 5
  for (let i = 0; i < shuffledSuggestions.length; i += 5) {
    const group = shuffledSuggestions.slice(i, i + 5);
    if (group.length > 0) {
      // Rank within each group (top to bottom)
      const rankedGroup = rankResultsByRating(group);
      groups.push(rankedGroup);
    }
  }
  
  return groups;
};

// Enhanced pool structure with ranking info
const enhancedPool = new Map<string, {
  suggestions: Suggestion[];
  rankedGroups: Suggestion[][];
  currentGroupIndex: number;
  lastUsedTime: number;
}>();

// Store ranked results in pool
const storeRankedResultsInPool = (filterKey: string, suggestions: Suggestion[]) => {
  const groups = randomlySelectSetsOfFive(suggestions);
  
  enhancedPool.set(filterKey, {
    suggestions: suggestions, // Keep original for reference
    rankedGroups: groups,
    currentGroupIndex: 0,
    lastUsedTime: Date.now()
  });
  
  console.log(`🏆 Stored ${suggestions.length} suggestions in ${groups.length} randomly selected groups (each ranked internally)`);
};

// Smart selection that prioritizes top-rated results
const selectSmartSuggestion = (filterKey: string): Suggestion | null => {
  const poolData = enhancedPool.get(filterKey);
  if (!poolData) return null;
  
  const { rankedGroups, currentGroupIndex } = poolData;
  
  // If we've used all groups, reset to first group
  if (currentGroupIndex >= rankedGroups.length) {
    poolData.currentGroupIndex = 0;
    console.log('🔄 Reset to first group for variety');
  }
  
  // Select from current group
  const currentGroup = rankedGroups[poolData.currentGroupIndex] || [];
  if (currentGroup.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * currentGroup.length);
  const selectedSuggestion = currentGroup[randomIndex];
  
  // Move to next group for next selection
  poolData.currentGroupIndex++;
  
  console.log(`🏆 Selected from group ${poolData.currentGroupIndex - 1} (rating: ${selectedSuggestion.rating}, reviews: ${selectedSuggestion.reviewCount})`);
  
  return selectedSuggestion;
};

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
  
  // Convert 10-level mood to 3-level mood
  const getSimplifiedMood = (moodValue: number): 'chill' | 'neutral' | 'hype' => {
    const level = Math.max(1, Math.min(10, Math.round((moodValue / 100) * 10) || 1));
    if (level <= 3) return 'chill';
    if (level <= 7) return 'neutral';
    return 'hype';
  };
  
  const simplifiedMood = getSimplifiedMood(mood);
  
  // Add variety based on attempt number to get different results
  if (attempt === 0) {
    if (simplifiedMood === 'chill') keywords.push('cozy', 'quiet', 'relaxing', 'peaceful', 'tranquil');
    else if (simplifiedMood === 'neutral') keywords.push('vibrant', 'lively', 'energetic', 'moderate', 'balanced');
    else keywords.push('exciting', 'adventurous', 'thrilling', 'energetic', 'dynamic');
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
    if (auth) {
      setState(prev => ({
        ...prev,
        auth: {
          user: auth.user,
          isAuthenticated: auth.isAuthenticated,
          isLoading: auth.isLoading
        }
      }));
    }
  }, [auth?.isAuthenticated, auth?.isLoading]);

  // Load retries from storage for unauthenticated users
  useEffect(() => {
    if (auth && !auth.isLoading) {
      if (auth.isAuthenticated && auth.user && auth.user.isPremium) {
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
  }, [auth?.isAuthenticated, auth?.isLoading]);

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

  const generateSuggestion = useCallback(async (onProgress?: (step: number, status: string, resultsCount?: number, distanceInfo?: any) => void) => {
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
        // Enhanced something-new logic with bulk filtering
        const types = ['restaurant', 'tourist_attraction'];
        let allSuggestions: Suggestion[] = [];
        const newRetries = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
        
        for (const t of types) {
          const modifiedFilters = { ...effectiveFilters, category: t === 'restaurant' ? 'food' : 'activity' };
          const typeSuggestions = await enhancedBulkFetchAndFilter(modifiedFilters, userLocation, onProgress as any);
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
          
          // Mark as used and remove from pool
          usedSuggestions.add(selectedSuggestion.id);
          const filterKey = getFilterKey(effectiveFilters);
          removeFromPool(selectedSuggestion.id, filterKey);
          
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
        // Normal food/activity with enhanced bulk filtering
        suggestions = await enhancedBulkFetchAndFilter(effectiveFilters, userLocation, onProgress as any);
        
        if (suggestions.length > 0) {
          // Use smart selection that prioritizes top-rated results
          const filterKey = getFilterKey(effectiveFilters);
          const selectedSuggestion = selectSmartSuggestion(filterKey);
          
          if (selectedSuggestion) {
            // Mark as used and remove from pool
            usedSuggestions.add(selectedSuggestion.id);
            removeFromPool(selectedSuggestion.id, filterKey);
            
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
          }
        }
        
        // Fallback to curated suggestions if smart selection fails
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
    // Clear the filtered results pool when resetting
    filteredResultsPool.clear();
    console.log('🔄 Cleared filtered results pool on reset');
    
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

  // Enhanced step-by-step filtering system
  const enhancedFetchGooglePlaces = async (
    effectiveFilters: any, 
    userLocation: {lat: number, lng: number}, 
    attempt: number = 0,
    onProgress?: (step: number, status: string, resultsCount?: number, distanceInfo?: any) => void
  ): Promise<Suggestion[]> => {
    console.log('🚀 Starting enhanced step-by-step filtering process...');
    
    // Step 1: Gather all places within radius based on "looking for" category
    onProgress?.(1, 'in-progress');
    console.log('📍 Step 1: Gathering all places within radius...');
    const radius = getDistanceRadius(effectiveFilters.distanceRange, attempt);
    const type = getCategoryType(effectiveFilters.category);
    
    // Check if we're expanding the radius beyond the original
    const originalDistance = effectiveFilters.distanceRange;
    const originalRadius = getDistanceRadius(originalDistance, 0);
    if (attempt > 0 && radius > originalRadius) {
      const targetRadius = getDistanceRadius(originalDistance, 3); // Max 3 attempts
      onProgress?.(1, 'in-progress', 0, {
        isExpanding: true,
        currentRadius: radius,
        targetRadius: targetRadius,
        originalDistance: originalDistance
      });
    }
    
    // Use user's actual location for very close ranges (500m or less)
    let searchLocation = { ...userLocation };
    
    if (radius > 1000) {
      const locationOffset = attempt * 0.005;
      searchLocation = {
        lat: userLocation.lat + (Math.random() - 0.5) * locationOffset,
        lng: userLocation.lng + (Math.random() - 0.5) * locationOffset
      };
    }
    
    // Build cache key for initial gathering
    const cacheKey = `${searchLocation.lat},${searchLocation.lng}-${radius}-${type}-initial-${attempt}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Using cached initial results');
      onProgress?.(1, 'completed', cached.data.length);
      return cached.data;
    }
    
    // Step 1: Initial API call - only filter by distance and category
    const initialParams = {
      location: `${searchLocation.lat},${searchLocation.lng}`,
      radius: radius.toString(),
      type,
      key: GOOGLE_API_KEY,
    };
    
    const initialUrl = `${PLACES_SEARCH_URL}?${new URLSearchParams(initialParams).toString()}`;
    console.log(`🔍 Step 1: Fetching all places within ${radius}m radius for ${type}`);
    
    try {
      const response = await Promise.race([
        fetch(initialUrl),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        )
      ]);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Initial API response status:', data.status);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        console.log(`✅ Step 1: Found ${data.results.length} initial places`);
        onProgress?.(1, 'completed', data.results.length);
        
        // Convert all places to suggestions
        let allSuggestions = await Promise.all(
          data.results.map((place: any) => convertGooglePlaceToSuggestion(place, effectiveFilters))
        );
        
        // Filter out already used suggestions
        allSuggestions = allSuggestions.filter((suggestion: Suggestion) => !usedSuggestions.has(suggestion.id));
        
        console.log(`✅ Step 1: ${allSuggestions.length} unique places available for filtering`);
        
        // Step 2: Filter by mood
        onProgress?.(2, 'in-progress');
        console.log('🎭 Step 2: Filtering by mood...');
        let moodFiltered = allSuggestions;
        if (effectiveFilters.mood !== undefined) {
          const vibeKeywords = getVibeKeywords(effectiveFilters.mood, effectiveFilters.category, attempt);
          if (vibeKeywords.length > 0) {
                    moodFiltered = allSuggestions.filter((suggestion: Suggestion) => {
          const placeName = suggestion.name.toLowerCase();
          const placeTags = suggestion.tags || [];
          return vibeKeywords.some(keyword => 
            placeName.includes(keyword.toLowerCase()) || 
            placeTags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
          );
        });
            console.log(`🎭 Step 2: Mood filtering reduced to ${moodFiltered.length} places`);
          }
        }
        onProgress?.(2, 'completed', moodFiltered.length);
        
        // Step 3: Filter by budget
        onProgress?.(3, 'in-progress');
        console.log('💰 Step 3: Filtering by budget...');
        let budgetFiltered = moodFiltered;
        if (effectiveFilters.budget && effectiveFilters.category === 'food') {
          const priceLevel = getBudgetPriceLevel(effectiveFilters.budget, effectiveFilters.category);
                  budgetFiltered = moodFiltered.filter((suggestion: Suggestion) => {
          // Map budget string to price level for comparison
          const budgetToPriceLevel = { 'P': 1, 'PP': 2, 'PPP': 3 };
          const suggestionPriceLevel = budgetToPriceLevel[suggestion.budget] || 2;
          return suggestionPriceLevel >= (priceLevel.minprice || 0) && 
                 suggestionPriceLevel <= (priceLevel.maxprice || 4);
        });
          console.log(`💰 Step 3: Budget filtering reduced to ${budgetFiltered.length} places`);
        }
        onProgress?.(3, 'completed', budgetFiltered.length);
        
        // Step 4: Filter by social context
        onProgress?.(4, 'in-progress');
        console.log('👥 Step 4: Filtering by social context...');
        let socialFiltered = budgetFiltered;
        if (effectiveFilters.socialContext) {
          const socialKeywords = getSocialKeywords(effectiveFilters.socialContext, effectiveFilters.category);
                  socialFiltered = budgetFiltered.filter((suggestion: Suggestion) => {
          const placeName = suggestion.name.toLowerCase();
          const placeTags = suggestion.tags || [];
          return socialKeywords.some(keyword => 
            placeName.includes(keyword.toLowerCase()) || 
            placeTags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
          );
        });
          console.log(`👥 Step 4: Social context filtering reduced to ${socialFiltered.length} places`);
        }
        onProgress?.(4, 'completed', socialFiltered.length);
        
        // Step 5: Filter by time of day
        onProgress?.(5, 'in-progress');
        console.log('🕐 Step 5: Filtering by time of day...');
        let timeFiltered = socialFiltered;
        if (effectiveFilters.timeOfDay) {
          const timeKeywords = {
            'morning': ['breakfast', 'coffee', 'cafe', 'brunch', 'bakery'],
            'afternoon': ['lunch', 'dining', 'restaurant', 'cafe', 'food'],
            'night': ['dinner', 'bar', 'nightlife', 'restaurant', 'pub']
          };
          
          timeFiltered = socialFiltered.filter((suggestion: Suggestion) => {
            const placeName = suggestion.name.toLowerCase();
            const placeTags = suggestion.tags || [];
            const keywords = timeKeywords[effectiveFilters.timeOfDay as keyof typeof timeKeywords] || [];
            return keywords.some(keyword => 
              placeName.includes(keyword) || 
              placeTags.some((tag: string) => tag.toLowerCase().includes(keyword))
            );
          });
          console.log(`🕐 Step 5: Time of day filtering reduced to ${timeFiltered.length} places`);
        }
        onProgress?.(5, 'completed', timeFiltered.length);
        
        // Final result
        const finalResults = timeFiltered;
        console.log(`🎯 Final filtering result: ${finalResults.length} places after all steps`);
        
        // If no results after all filtering, try with relaxed filters
        if (finalResults.length === 0 && attempt < 3) {
          console.log('🔄 No results after comprehensive filtering, trying with relaxed filters...');
          return enhancedFetchGooglePlaces(effectiveFilters, userLocation, attempt + 1, onProgress);
        }
        
        // Cache the result
        apiCache.set(cacheKey, { data: finalResults, timestamp: Date.now() });
        
        // Clear distance expansion state if we were expanding
        if (attempt > 0) {
          onProgress?.(1, 'completed', finalResults.length, { isExpanding: false });
        }
        
        return finalResults;
      }
      
      if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ Google API returned zero results for current filters');
        onProgress?.(1, 'failed');
        if (attempt < 3) {
          console.log(`🔄 No results found with ${radius}m radius, trying with larger radius...`);
          return enhancedFetchGooglePlaces(effectiveFilters, userLocation, attempt + 1, onProgress);
        }
        return [];
      }
      
      throw new Error(`Google Places API error: ${data.status}`);
      
    } catch (error) {
      console.error('❌ Enhanced filtering API request failed:', error);
      onProgress?.(1, 'failed');
      if (attempt < 3) {
        return enhancedFetchGooglePlaces(effectiveFilters, userLocation, attempt + 1, onProgress);
      }
      throw error;
    }
  };

  // Enhanced bulk filtering system that gathers 200+ places and maintains a pool of 50 filtered results
  const enhancedBulkFetchAndFilter = async (
    effectiveFilters: any,
    userLocation: {lat: number, lng: number},
    onProgress?: (step: number, status: string, resultsCount?: number, distanceInfo?: any) => void
  ): Promise<Suggestion[]> => {
    console.log('🚀 Starting enhanced bulk filtering system...');
    
    // Create a unique key for this filter combination
    const filterKey = JSON.stringify({
      category: effectiveFilters.category,
      mood: effectiveFilters.mood,
      socialContext: effectiveFilters.socialContext,
      timeOfDay: effectiveFilters.timeOfDay,
      budget: effectiveFilters.budget,
      distanceRange: effectiveFilters.distanceRange
    });
    
    // Check if we have a sufficient pool for this filter combination
    const currentPool = enhancedPool.get(filterKey);
    console.log(`📊 Current pool size for filter combination: ${currentPool?.suggestions?.length || 0}`);
    
    // If pool is sufficient, return from pool
    if (currentPool && currentPool.suggestions.length >= MIN_POOL_SIZE) {
      console.log(`✅ Pool has ${currentPool.suggestions.length} results, using from pool`);
      onProgress?.(1, 'completed', currentPool.suggestions.length);
      return currentPool.suggestions;
    }
    
    // If pool is too small, reset and gather new places
    if (currentPool && currentPool.suggestions.length < POOL_RESET_THRESHOLD) {
      console.log('🔄 Pool too small, resetting and gathering new places...');
      enhancedPool.delete(filterKey);
    }
    
    // Step 1: Gather all places (target 100+ places)
    onProgress?.(1, 'in-progress');
    console.log('📍 Step 1: Gathering all places (target: 100+)...');
    
    let allPlaces: Suggestion[] = [];
    let attempt = 0;
    const maxAttempts = COST_OPTIMIZATION.MAX_ATTEMPTS; // Use cost-optimized attempts
    const originalDistance = effectiveFilters.distanceRange;
    const originalRadius = getDistanceRadius(originalDistance, 0);
    let isExpandingRadius = false;
    
    while (allPlaces.length < TARGET_GATHER_SIZE && attempt < maxAttempts) {
      const radius = getDistanceRadius(effectiveFilters.distanceRange, attempt);
      const type = getCategoryType(effectiveFilters.category);
      
      // Check if we're expanding the radius beyond the original
      if (attempt > 0 && radius > originalRadius) {
        isExpandingRadius = true;
        const targetRadius = getDistanceRadius(originalDistance, maxAttempts - 1);
        onProgress?.(1, 'in-progress', allPlaces.length, {
          isExpanding: true,
          currentRadius: radius,
          targetRadius: targetRadius,
          originalDistance: originalDistance
        });
      }
      
      // Use different search locations to gather more places
      let searchLocation = { ...userLocation };
      if (attempt > 0) {
        const locationOffset = attempt * 0.01; // 1km offset per attempt
        searchLocation = {
          lat: userLocation.lat + (Math.random() - 0.5) * locationOffset,
          lng: userLocation.lng + (Math.random() - 0.5) * locationOffset
        };
      }
      
      // Build cache key for this attempt
      const cacheKey = `${searchLocation.lat},${searchLocation.lng}-${radius}-${type}-bulk-${attempt}`;
      
      // Check cache first
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Using cached results for attempt ${attempt}`);
        allPlaces = allPlaces.concat(cached.data);
        attempt++;
        continue;
      }
      
      // API call for this attempt
      const params = {
        location: `${searchLocation.lat},${searchLocation.lng}`,
        radius: radius.toString(),
        type,
        key: GOOGLE_API_KEY,
      };
      
      const url = `${PLACES_SEARCH_URL}?${new URLSearchParams(params).toString()}`;
      console.log(`🔍 Attempt ${attempt}: Fetching places within ${radius}m radius`);
      
      try {
        const response = await Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 15000)
          )
        ]);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`📥 Attempt ${attempt} API response status:`, data.status);
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          // Convert places to suggestions
          const newPlaces = await Promise.all(
            data.results.map((place: any) => convertGooglePlaceToSuggestion(place, effectiveFilters))
          );
          
          // Filter out duplicates and already used suggestions
          const uniquePlaces = newPlaces.filter((place: Suggestion) => {
            const isDuplicate = allPlaces.some(existing => existing.id === place.id);
            const isUsed = usedSuggestions.has(place.id);
            return !isDuplicate && !isUsed;
          });
          
          allPlaces = allPlaces.concat(uniquePlaces);
          console.log(`✅ Attempt ${attempt}: Added ${uniquePlaces.length} unique places. Total: ${allPlaces.length}`);
          
          // Cache the results
          apiCache.set(cacheKey, { data: newPlaces, timestamp: Date.now() });
        }
        
        attempt++;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        attempt++;
      }
    }
    
    console.log(`🎯 Total places gathered: ${allPlaces.length}`);
    onProgress?.(1, 'completed', allPlaces.length);
    
    // Clear distance expansion state if we were expanding
    if (isExpandingRadius) {
      onProgress?.(1, 'completed', allPlaces.length, { isExpanding: false });
    }
    
    // Step 2: Apply all filters to get filtered results
    onProgress?.(2, 'in-progress');
    console.log('🔍 Step 2: Applying all filters...');
    
    let filteredResults = allPlaces;
    
    // Filter by mood
    if (effectiveFilters.mood !== undefined) {
      const vibeKeywords = getVibeKeywords(effectiveFilters.mood, effectiveFilters.category, 0);
      if (vibeKeywords.length > 0) {
        filteredResults = filteredResults.filter((suggestion: Suggestion) => {
          const placeName = suggestion.name.toLowerCase();
          const placeTags = suggestion.tags || [];
          return vibeKeywords.some(keyword => 
            placeName.includes(keyword.toLowerCase()) || 
            placeTags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
          );
        });
        console.log(`🎭 Mood filtering: ${filteredResults.length} places remaining`);
      }
    }
    
    // Filter by budget
    if (effectiveFilters.budget && effectiveFilters.category === 'food') {
      const priceLevel = getBudgetPriceLevel(effectiveFilters.budget, effectiveFilters.category);
      filteredResults = filteredResults.filter((suggestion: Suggestion) => {
        const budgetToPriceLevel = { 'P': 1, 'PP': 2, 'PPP': 3 };
        const suggestionPriceLevel = budgetToPriceLevel[suggestion.budget] || 2;
        return suggestionPriceLevel >= (priceLevel.minprice || 0) && 
               suggestionPriceLevel <= (priceLevel.maxprice || 4);
      });
      console.log(`💰 Budget filtering: ${filteredResults.length} places remaining`);
    }
    
    // Filter by social context
    if (effectiveFilters.socialContext) {
      const socialKeywords = getSocialKeywords(effectiveFilters.socialContext, effectiveFilters.category);
      filteredResults = filteredResults.filter((suggestion: Suggestion) => {
        const placeName = suggestion.name.toLowerCase();
        const placeTags = suggestion.tags || [];
        return socialKeywords.some(keyword => 
          placeName.includes(keyword.toLowerCase()) || 
          placeTags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
      });
      console.log(`👥 Social context filtering: ${filteredResults.length} places remaining`);
    }
    
    // Filter by time of day
    if (effectiveFilters.timeOfDay) {
      const timeKeywords = {
        'morning': ['breakfast', 'coffee', 'cafe', 'brunch', 'bakery'],
        'afternoon': ['lunch', 'dining', 'restaurant', 'cafe', 'food'],
        'night': ['dinner', 'bar', 'nightlife', 'restaurant', 'pub']
      };
      
      filteredResults = filteredResults.filter((suggestion: Suggestion) => {
        const placeName = suggestion.name.toLowerCase();
        const placeTags = suggestion.tags || [];
        const keywords = timeKeywords[effectiveFilters.timeOfDay as keyof typeof timeKeywords] || [];
        return keywords.some(keyword => 
          placeName.includes(keyword) || 
          placeTags.some((tag: string) => tag.toLowerCase().includes(keyword))
        );
      });
      console.log(`🕐 Time of day filtering: ${filteredResults.length} places remaining`);
    }
    
    console.log(`🎯 Final filtered results: ${filteredResults.length} places`);
    onProgress?.(2, 'completed', filteredResults.length);
    
    // Cost optimization: Use fallback if too few results
    if (COST_OPTIMIZATION.USE_FALLBACK_MORE && filteredResults.length < COST_OPTIMIZATION.FALLBACK_THRESHOLD) {
      console.log('💰 Too few results after filtering, using fallback to save API costs');
      return [];
    }
    
    // Store the filtered results in the pool using smart ranking
    storeRankedResultsInPool(filterKey, filteredResults);
    
    return filteredResults;
  };

  // Function to remove a used suggestion from the pool
  const removeFromPool = (suggestionId: string, filterKey: string) => {
    const currentPool = enhancedPool.get(filterKey);
    if (currentPool) {
      const updatedPool = currentPool.suggestions.filter(suggestion => suggestion.id !== suggestionId);
      enhancedPool.set(filterKey, { ...currentPool, suggestions: updatedPool });
      console.log(`🗑️ Removed suggestion ${suggestionId} from pool. Pool size: ${updatedPool.length}`);
    }
  };

  // Function to get filter key for a suggestion
  const getFilterKey = (effectiveFilters: any): string => {
    // Convert 10-level mood to 3-level mood for filter key
    const getSimplifiedMood = (moodValue: number): 'chill' | 'neutral' | 'hype' => {
      const level = Math.max(1, Math.min(10, Math.round((moodValue / 100) * 10) || 1));
      if (level <= 3) return 'chill';
      if (level <= 7) return 'neutral';
      return 'hype';
    };
    
    return JSON.stringify({
      category: effectiveFilters.category,
      mood: getSimplifiedMood(effectiveFilters.mood), // Use simplified mood
      socialContext: effectiveFilters.socialContext,
      timeOfDay: effectiveFilters.timeOfDay,
      budget: effectiveFilters.budget,
      distanceRange: effectiveFilters.distanceRange
    });
  };

  // Function to get pool statistics
  const getPoolStats = () => {
    const stats = {
      totalPools: enhancedPool.size,
      totalSuggestions: 0,
      poolDetails: [] as Array<{ key: string; size: number }>
    };
    
    enhancedPool.forEach((pool, key) => {
      stats.totalSuggestions += pool.suggestions.length;
      stats.poolDetails.push({ key, size: pool.suggestions.length });
    });
    
    console.log('📊 Pool Statistics:', stats);
    return stats;
  };

  return {
    ...state,
    updateFilters,
    generateSuggestion,
    resetSuggestion,
    restartSession,
    toggleMoreFilters,
    openInMaps,
    enhancedBulkFetchAndFilter,
    removeFromPool,
    getFilterKey,
    getPoolStats,
    selectSmartSuggestion,
    storeRankedResultsInPool,
    rankResultsByRating,
    randomlySelectSetsOfFive
  };
});