// Enhanced Image Sourcing Utilities
// Focuses on getting actual photos of places from Google Places, Maps, and other real sources

// Environment variables for API keys
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || '';
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'g-decider-backend';

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_PLACES_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Helper: Get high-quality photos from Google Places API
export const getGooglePlacesPhotos = async (placeId: string, maxPhotos: number = 6): Promise<string[]> => {
  try {
    console.log('📸 Fetching Google Places photos for place ID:', placeId);
    
    // Get place details with photos
    const detailsUrl = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result.photos) {
      const photos = data.result.photos.slice(0, maxPhotos);
      const photoUrls = photos.map((photo: any) => 
        `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      console.log(`📸 Found ${photoUrls.length} Google Places photos`);
      return photoUrls;
    }
    
    console.log('📸 No Google Places photos found');
    return [];
  } catch (error) {
    console.error('❌ Error fetching Google Places photos:', error);
    return [];
  }
};

// Helper: Search for additional images using Google Places Text Search
export const searchGooglePlacesImages = async (query: string, location: string): Promise<string[]> => {
  try {
    console.log('🔍 Searching Google Places for:', query);
    
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&radius=5000&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const photos: string[] = [];
      
      // Get photos from the first few results
      for (const place of data.results.slice(0, 3)) {
        if (place.photos && place.photos.length > 0) {
          const placePhotos = place.photos.slice(0, 2).map((photo: any) => 
            `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_PLACES_API_KEY}`
          );
          photos.push(...placePhotos);
        }
      }
      
      console.log(`📸 Found ${photos.length} additional photos from Google Places search`);
      return photos;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error searching Google Places:', error);
    return [];
  }
};

// Helper: Get images from Google Maps Street View (if available)
export const getStreetViewImages = async (lat: number, lng: number): Promise<string[]> => {
  try {
    console.log('🗺️ Fetching Street View images for:', lat, lng);
    
    // Street View API endpoint
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`;
    
    // Note: Street View API returns a single image, not multiple
    // We'll use this as a fallback option
    return [streetViewUrl];
  } catch (error) {
    console.error('❌ Error fetching Street View images:', error);
    return [];
  }
};

// Helper: Get images from establishment's Google Business Profile
export const getBusinessProfileImages = async (placeName: string, location: string): Promise<string[]> => {
  try {
    console.log('🏢 Searching for business profile images:', placeName);
    
    // Use Google Places API to find the business
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(placeName + ' ' + location)}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      if (place.photos && place.photos.length > 0) {
        const photos = place.photos.slice(0, 4).map((photo: any) => 
          `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_PLACES_API_KEY}`
        );
        
        console.log(`📸 Found ${photos.length} business profile photos`);
        return photos;
      }
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching business profile images:', error);
    return [];
  }
};

// Helper: Get images from nearby similar places (as backup)
export const getNearbyPlaceImages = async (category: string, location: string): Promise<string[]> => {
  try {
    console.log('📍 Searching for nearby place images:', category);
    
    // Map category to Google Places type
    const typeMap: { [key: string]: string } = {
      'food': 'restaurant',
      'activity': 'tourist_attraction',
      'something-new': 'point_of_interest'
    };
    
    const placeType = typeMap[category] || 'establishment';
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${encodeURIComponent(location)}&radius=2000&type=${placeType}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const photos: string[] = [];
      
      // Get photos from nearby places
      for (const place of data.results.slice(0, 2)) {
        if (place.photos && place.photos.length > 0) {
          const placePhotos = place.photos.slice(0, 2).map((photo: any) => 
            `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_PLACES_API_KEY}`
          );
          photos.push(...placePhotos);
        }
      }
      
      console.log(`📸 Found ${photos.length} nearby place photos`);
      return photos;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching nearby place images:', error);
    return [];
  }
};

// Main function: Get comprehensive image set for a place - ENSURES MINIMUM 4 HIGH-QUALITY IMAGES
export const getComprehensiveImages = async (
  placeName: string, 
  placeLocation: string, 
  category: string,
  googlePhotos: string[] = [],
  placeId?: string,
  coordinates?: { lat: number; lng: number },
  minPhotos: number = 4,
  maxPhotos: number = 8
): Promise<string[]> => {
  let photos: string[] = [...googlePhotos];
  
  console.log(`📸 Starting enhanced comprehensive image search for ${placeName} (min: ${minPhotos}, max: ${maxPhotos})`);
  console.log(`📸 Initial Google Photos: ${googlePhotos.length}`);
  
  // Priority 1: Use provided Google Places photos
  if (photos.length > 0) {
    console.log(`📸 Using ${photos.length} provided Google Places photos`);
  }
  
  // Priority 2: Get additional photos from Google Places API if placeId is available
  if (placeId && photos.length < maxPhotos) {
    const placePhotos = await getGooglePlacesPhotos(placeId, maxPhotos - photos.length);
    photos.push(...placePhotos);
    console.log(`📸 Added ${placePhotos.length} additional Google Places photos`);
  }
  
  // Priority 3: Search for business profile images - more aggressive search
  if (photos.length < minPhotos) {
    const businessPhotos = await getBusinessProfileImages(placeName, placeLocation);
    photos.push(...businessPhotos);
    console.log(`📸 Added ${businessPhotos.length} business profile photos`);
  }
  
  // Priority 4: Search for additional images using Google Places Text Search - expanded search
  if (photos.length < minPhotos) {
    const searchPhotos = await searchGooglePlacesImages(placeName, placeLocation);
    photos.push(...searchPhotos);
    console.log(`📸 Added ${searchPhotos.length} search photos`);
    
    // Additional search with different terms if still below minimum
    if (photos.length < minPhotos) {
      const expandedSearchPhotos = await searchGooglePlacesImages(`${placeName} ${category}`, placeLocation);
      photos.push(...expandedSearchPhotos);
      console.log(`📸 Added ${expandedSearchPhotos.length} expanded search photos`);
    }
  }
  
  // Priority 5: Get Street View images if coordinates are available - multiple angles
  if (coordinates && photos.length < minPhotos) {
    const streetViewPhotos = await getEnhancedStreetViewImages(coordinates.lat, coordinates.lng, minPhotos - photos.length);
    photos.push(...streetViewPhotos);
    console.log(`📸 Added ${streetViewPhotos.length} Street View photos`);
  }
  
  // Priority 6: Get images from nearby similar places - more comprehensive search
  if (photos.length < minPhotos) {
    const nearbyPhotos = await getNearbyPlaceImages(category, placeLocation);
    photos.push(...nearbyPhotos);
    console.log(`📸 Added ${nearbyPhotos.length} nearby place photos`);
  }
  
  // Priority 7: Use high-quality fallback images if still below minimum
  if (photos.length < minPhotos) {
    const fallbacksNeeded = minPhotos - photos.length;
    console.log(`📸 Adding ${fallbacksNeeded} high-quality fallback images`);
    
    for (let i = 0; i < fallbacksNeeded; i++) {
      photos.push(getHighQualityFallbackImage(category, i));
    }
  }
  
  // Remove duplicates and ensure we have exactly the right number of photos
  const uniquePhotos = Array.from(new Set(photos));
  const finalPhotos = uniquePhotos.slice(0, maxPhotos);
  
  // Ensure minimum requirement is met
  while (finalPhotos.length < minPhotos) {
    finalPhotos.push(getHighQualityFallbackImage(category, finalPhotos.length));
  }
  
  console.log(`📸 Final high-quality image count for ${placeName}: ${finalPhotos.length} images`);
  
  return finalPhotos;
};

// Helper: Enhanced Street View images with multiple angles
export const getEnhancedStreetViewImages = async (lat: number, lng: number, count: number): Promise<string[]> => {
  try {
    console.log('🗺️ Fetching enhanced Street View images for:', lat, lng);
    
    const photos: string[] = [];
    const headings = [0, 90, 180, 270]; // North, East, South, West
    const pitches = [0, -10, 10]; // Level, down, up angles
    
    for (let i = 0; i < Math.min(count, headings.length * pitches.length); i++) {
      const headingIndex = i % headings.length;
      const pitchIndex = Math.floor(i / headings.length) % pitches.length;
      
      const heading = headings[headingIndex];
      const pitch = pitches[pitchIndex];
      
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${GOOGLE_PLACES_API_KEY}`;
      photos.push(streetViewUrl);
    }
    
    return photos;
  } catch (error) {
    console.error('❌ Error fetching enhanced Street View images:', error);
    return [];
  }
};

// Helper: Get high-quality fallback images based on category
export const getHighQualityFallbackImage = (category: string, index: number = 0): string => {
  // High-quality Unsplash images categorized by place type
  const categoryImages: { [key: string]: string[] } = {
    'food': [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop&auto=format&q=80'
    ],
    'activity': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1555529669-2269763671c0?w=800&h=600&fit=crop&auto=format&q=80'
    ],
    'something-new': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format&q=80'
    ]
  };
  
  const images = categoryImages[category] || categoryImages['food'];
  if (!images || images.length === 0) {
    return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80';
  }
  return images[index % images.length] || images[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80';
}; 