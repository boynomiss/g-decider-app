import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserFilters, AppState, Suggestion, AuthState } from '../types/app';
import { useAuth } from './use-auth';
import * as Location from 'expo-location';
import { getComprehensiveImages, getCuratedImages } from '../utils/image-sourcing';
import { generateComprehensiveDescription } from '../utils/description-generator';

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

// Helper: Fetch images from multiple sources for actual places
const fetchAdditionalImages = async (placeName: string, placeLocation: string, category: string, website?: string) => {
  const additionalImages: string[] = [];
  
  try {
    // 1. Try to get images from Google Maps search
    const searchQuery = `${placeName} ${placeLocation}`;
    const googleMapsImages = await fetchGoogleMapsImages(searchQuery);
    additionalImages.push(...googleMapsImages);
    
    // 2. Try to get images from establishment website (if available)
    if (website) {
      const websiteImages = await fetchWebsiteImages(website);
      additionalImages.push(...websiteImages);
    }
    
    // 3. Try to get images from blog sites and reviews
    const blogImages = await fetchBlogImages(searchQuery);
    additionalImages.push(...blogImages);
    
  } catch (error) {
    console.log('⚠️ Error fetching additional images:', error);
  }
  
  return additionalImages;
};

// Helper: Fetch images from Google Maps search
const fetchGoogleMapsImages = async (searchQuery: string): Promise<string[]> => {
  try {
    // This would require a Google Custom Search API or similar
    // For now, we'll return an empty array as this needs API setup
    console.log('🔍 Searching Google Maps for:', searchQuery);
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching Google Maps images:', error);
    return [];
  }
};

// Helper: Fetch images from establishment website
const fetchWebsiteImages = async (websiteUrl: string): Promise<string[]> => {
  try {
    // This would require web scraping capabilities
    // For now, we'll return an empty array as this needs proper implementation
    console.log('🌐 Fetching images from website:', websiteUrl);
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching website images:', error);
    return [];
  }
};

// Helper: Fetch images from blog sites and reviews
const fetchBlogImages = async (searchQuery: string): Promise<string[]> => {
  try {
    // This would require integration with review sites or blog APIs
    // For now, we'll return an empty array as this needs proper implementation
    console.log('📝 Searching blog sites for:', searchQuery);
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching blog images:', error);
    return [];
  }
};

// Helper: Get additional images synchronously (fallback)
const getAdditionalImages = (placeName: string, placeLocation: string, category: string): string[] => {
  // For now, return curated images that match the place type
  const curatedImageMap = {
    food: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80'
    ],
    activity: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'
    ],
    'something-new': [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'
    ]
  };
  
  return curatedImageMap[category as keyof typeof curatedImageMap] || curatedImageMap.food;
};

// Convert Google Places result to our Suggestion format
const convertGooglePlaceToSuggestion = async (place: any, effectiveFilters: any): Promise<Suggestion> => {
  console.log('Converting Google Place:', place.name, place);
  
  // Enhanced image handling: ensure 3-8 high-quality images from actual place
  let photos: string[] = [];
  
  // Priority 1: Google Places photos (actual place images)
  if (place.photos && place.photos.length > 0) {
    const googlePhotos = place.photos.slice(0, 6).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
    );
    photos = googlePhotos;
    console.log(`📸 Found ${googlePhotos.length} Google Places photos for ${place.name}`);
  }
  
  // Use comprehensive image sourcing to get 3-8 high-quality images
  try {
    photos = await getComprehensiveImages(
      place.name,
      place.formatted_address || '',
      effectiveFilters.category,
      photos
    );
  } catch (error) {
    console.log('⚠️ Error in comprehensive image sourcing, using fallback:', error);
    // Fallback to basic curated images
    const fallbackImages = getCuratedImages(effectiveFilters.category, place.name);
    photos = fallbackImages.slice(0, 8);
  }
  
  // Limit to maximum 8 images
  photos = photos.slice(0, 8);
  
  console.log(`📸 Generated ${photos.length} high-quality images for ${place.name}`);

  // Enhanced budget mapping with better detection
  const budgetMap: { [key: number]: 'P' | 'PP' | 'PPP' } = { 
    0: 'P',    // Free
    1: 'P',    // Inexpensive
    2: 'PP',   // Moderate
    3: 'PPP',  // Expensive
    4: 'PPP'   // Very Expensive
  };
  
  // Determine budget from Google Places API or user filters
  let budget: 'P' | 'PP' | 'PPP';
  if (place.price_level !== undefined) {
    budget = budgetMap[place.price_level] || 'PP';
    console.log(`💰 Google Places price_level: ${place.price_level} -> Budget: ${budget}`);
  } else {
    budget = effectiveFilters.budget;
    console.log(`💰 Using filter budget: ${budget}`);
  }

  const tags: string[] = [];
  if (place.rating) tags.push(`⭐ ${place.rating}`);
  if (place.opening_hours?.open_now) tags.push('Open Now');
  if (place.price_level !== undefined) tags.push(`Budget: ${budget}`);
  
  // Extract coordinates from geometry
  const coordinates = place.geometry?.location ? {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng
  } : undefined;
  
  // Extract reviews from Google Places API
  const reviews = place.reviews ? place.reviews.slice(0, 5).map((review: any) => ({
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    time: review.relative_time_description
  })) : undefined;
  
  const suggestion: Suggestion = {
    id: place.place_id || Math.random().toString(),
    name: place.name || 'Unknown Place',
    location: place.vicinity || place.formatted_address || 'Manila',
    images: photos,
    budget: budget as 'P' | 'PP' | 'PPP',
    tags,
    description: generateComprehensiveDescription(
      place.name || 'Unknown Place',
      effectiveFilters.category,
      reviews,
      place.rating,
      place.user_ratings_total,
      budget
    ),
    category: effectiveFilters.category,
    mood: effectiveFilters.mood > 60 ? 'hype' : effectiveFilters.mood < 40 ? 'chill' : 'both',
    socialContext: [effectiveFilters.socialContext],
    timeOfDay: [effectiveFilters.timeOfDay],
    coordinates,
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    reviews
  };
  
  console.log('Converted suggestion:', suggestion.name, 'at coordinates:', coordinates);
  return suggestion;
};

// Helper: Map mood slider to keywords - Simplified to be less restrictive
const getVibeKeywords = (mood: number, category: string) => {
  if (category === 'food') {
    if (mood > 60) return ['restaurant', 'bar', 'cafe'];
    if (mood < 40) return ['cafe', 'restaurant'];
    return ['restaurant'];
  } else if (category === 'activity') {
    if (mood > 60) return ['attraction', 'activity'];
    if (mood < 40) return ['museum', 'park', 'attraction'];
    return ['attraction'];
  } else {
    if (mood > 60) return ['activity'];
    if (mood < 40) return ['activity'];
    return ['activity'];
  }
};
// Helper: Map social context to keywords - Simplified to be less restrictive
const getSocialKeywords = (social: string, category: string) => {
  // Return minimal keywords to avoid over-filtering
  return [];
};

// Fetch places from Google Places API directly
const fetchGooglePlaces = async (effectiveFilters: any, userLocation: {lat: number, lng: number}): Promise<Suggestion[]> => {
  const radius = getDistanceRadius(effectiveFilters.distanceRange);
  const type = getCategoryType(effectiveFilters.category);
  const priceLevel = getBudgetPriceLevel(effectiveFilters.budget, effectiveFilters.category);
  // Compose keyword string - Simplified to be less restrictive
  const vibeKeywords = getVibeKeywords(effectiveFilters.mood, effectiveFilters.category);
  const socialKeywords = getSocialKeywords(effectiveFilters.socialContext, effectiveFilters.category);
  // Use only the first keyword to avoid over-filtering
  const keywords = vibeKeywords.length > 0 ? vibeKeywords[0] : '';
  // Build URL parameters for direct Google Places API
  const paramsObj: Record<string, string> = {
    location: `${userLocation.lat},${userLocation.lng}`,
    radius: radius.toString(),
    type,
    key: GOOGLE_API_KEY,
    keyword: keywords,
  };
  if (priceLevel.minprice !== undefined) paramsObj['minprice'] = priceLevel.minprice.toString();
  if (priceLevel.maxprice !== undefined) paramsObj['maxprice'] = priceLevel.maxprice.toString();
  const params = new URLSearchParams(paramsObj);
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
    
          // After fetching, get detailed info including reviews for each place
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Get detailed information including reviews for each place
        const detailedPlaces = await Promise.all(
          data.results.slice(0, 5).map(async (place: any) => {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,geometry,rating,user_ratings_total,photos,reviews,opening_hours,price_level&key=${GOOGLE_API_KEY}`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
              return detailsData.result || place;
            } catch (error) {
              console.log('⚠️ Error fetching place details:', error);
              return place;
            }
          })
        );
        
        let suggestions = await Promise.all(detailedPlaces.map((place: any) => convertGooglePlaceToSuggestion(place, effectiveFilters)));
        // Simplified filter: just return all results
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
  
  // Generate appropriate images based on category - Enhanced with 3-8 high-quality images
  const getImages = (category: string) => {
    const imageMap = {
      food: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551218808-b94bcde164b4?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&q=80'
      ],
      activity: [
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
      ],
      'something-new': [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80'
      ]
    };
    const images = imageMap[category as keyof typeof imageMap] || imageMap.food;
    // Return 3-8 images randomly selected to add variety
    const shuffled = images.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 6) + 3); // 3-8 images
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
      const newRetriesNormal = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
      
      if (effectiveFilters.category === 'something-new') {
        // Only food or activity, and prioritize newness
        const types = ['restaurant', 'tourist_attraction'];
        let allSuggestions: Suggestion[] = [];
        const newRetries = currentState.retriesLeft === -1 ? -1 : currentState.retriesLeft - 1;
        for (const t of types) {
          const params = new URLSearchParams({
            location: `${userLocation.lat},${userLocation.lng}`,
            radius: getDistanceRadius(effectiveFilters.distanceRange).toString(),
            type: t,
            key: GOOGLE_API_KEY
          });
          const url = `${PLACES_SEARCH_URL}?${params.toString()}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            let suggestions = await Promise.all(data.results.map((place: any) => convertGooglePlaceToSuggestion(place, {...effectiveFilters, category: t === 'restaurant' ? 'food' : 'activity'})));
            // Newness: very low review count but high rating
            suggestions = suggestions.filter((s: Suggestion, idx: number) => {
              const reviews = (data.results[idx]?.user_ratings_total) || 0;
              const rating = (data.results[idx]?.rating) || 0;
              return (reviews < 50 && rating >= 4.0);
            });
            allSuggestions = allSuggestions.concat(suggestions);
          }
        }
        // If no API results, use curated fallback
        if (allSuggestions.length === 0) {
          // Filter curated list by filters
          const filteredCurated = curatedNewPlaces.filter((s: Suggestion) => {
            const moodMatch = getVibeKeywords(effectiveFilters.mood, s.category).some(k => s.tags.join(' ').toLowerCase().includes(k) || s.description.toLowerCase().includes(k));
            const socialMatch = getSocialKeywords(effectiveFilters.socialContext, s.category).some(k => s.tags.join(' ').toLowerCase().includes(k) || s.description.toLowerCase().includes(k));
            let budgetMatch = s.budget === effectiveFilters.budget;
            if (s.category === 'activity') {
              const budgetHints: Record<'P' | 'PP' | 'PPP', string[]> = {
                'P': ['free', 'budget', 'cheap', 'affordable', 'low cost'],
                'PP': ['midrange', 'moderate', 'average price', 'standard'],
                'PPP': ['expensive', 'premium', 'luxury', 'high end', 'pricey']
              };
              budgetMatch = budgetHints[effectiveFilters.budget as 'P' | 'PP' | 'PPP']?.some((hint: string) => s.tags.join(' ').toLowerCase().includes(hint) || s.description.toLowerCase().includes(hint)) || s.budget === effectiveFilters.budget;
            }
            return moodMatch && socialMatch && budgetMatch;
          });
          if (filteredCurated.length > 0) {
            const suggestion = filteredCurated[Math.floor(Math.random() * filteredCurated.length)];
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
            return;
          } else {
            setState(prev => ({
              ...prev,
              currentSuggestion: null,
              isLoading: false
            }));
            // Optionally: show a message to broaden search
            return;
          }
        }
        if (allSuggestions.length > 0) {
          const suggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
          setState(prev => ({
            ...prev,
            currentSuggestion: suggestion,
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
          setState(prev => ({
            ...prev,
            currentSuggestion: null,
            isLoading: false
          }));
          // Optionally: show a message to broaden search
          return;
        }
      } else {
        // Normal food/activity
        suggestions = await fetchGooglePlaces(effectiveFilters, userLocation);
        if (suggestions.length > 0) {
          suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          setState(prev => ({
            ...prev,
            currentSuggestion: suggestion,
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
          setState(prev => ({
            ...prev,
            currentSuggestion: null,
            isLoading: false
          }));
          // Optionally: show a message to broaden search
          return;
        }
      }
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