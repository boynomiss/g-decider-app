// Enhanced Image Sourcing Utilities
// Focuses on getting actual photos of places from Google Places, Maps, and other real sources

const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_PLACES_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Helper: Get high-quality photos from Google Places API
export const getGooglePlacesPhotos = async (placeId: string, maxPhotos: number = 6): Promise<string[]> => {
  try {
    console.log('📸 Fetching Google Places photos for place ID:', placeId);
    
    // Get place details with photos
    const detailsUrl = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result.photos) {
      const photos = data.result.photos.slice(0, maxPhotos);
      const photoUrls = photos.map((photo: any) => 
        `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
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
    
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&radius=5000&key=${GOOGLE_API_KEY}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const photos: string[] = [];
      
      // Get photos from the first few results
      for (const place of data.results.slice(0, 3)) {
        if (place.photos && place.photos.length > 0) {
          const placePhotos = place.photos.slice(0, 2).map((photo: any) => 
            `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
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
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    
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
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(placeName + ' ' + location)}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      if (place.photos && place.photos.length > 0) {
        const photos = place.photos.slice(0, 4).map((photo: any) => 
          `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
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
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${encodeURIComponent(location)}&radius=2000&type=${placeType}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const photos: string[] = [];
      
      // Get photos from nearby places
      for (const place of data.results.slice(0, 2)) {
        if (place.photos && place.photos.length > 0) {
          const placePhotos = place.photos.slice(0, 2).map((photo: any) => 
            `${GOOGLE_PLACES_PHOTO_URL}?photoreference=${photo.photo_reference}&maxwidth=800&key=${GOOGLE_API_KEY}`
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

// Main function: Get comprehensive image set for a place
export const getComprehensiveImages = async (
  placeName: string, 
  placeLocation: string, 
  category: string,
  googlePhotos: string[] = [],
  placeId?: string,
  coordinates?: { lat: number; lng: number }
): Promise<string[]> => {
  let photos: string[] = [...googlePhotos];
  
  console.log(`📸 Starting comprehensive image search for ${placeName}`);
  console.log(`📸 Initial Google Photos: ${googlePhotos.length}`);
  
  // Priority 1: Use provided Google Places photos
  if (photos.length > 0) {
    console.log(`📸 Using ${photos.length} provided Google Places photos`);
  }
  
  // Priority 2: Get additional photos from Google Places API if placeId is available
  if (placeId && photos.length < 6) {
    const placePhotos = await getGooglePlacesPhotos(placeId, 6 - photos.length);
    photos.push(...placePhotos);
    console.log(`📸 Added ${placePhotos.length} additional Google Places photos`);
  }
  
  // Priority 3: Search for business profile images
  if (photos.length < 4) {
    const businessPhotos = await getBusinessProfileImages(placeName, placeLocation);
    photos.push(...businessPhotos);
    console.log(`📸 Added ${businessPhotos.length} business profile photos`);
  }
  
  // Priority 4: Search for additional images using Google Places Text Search
  if (photos.length < 3) {
    const searchPhotos = await searchGooglePlacesImages(placeName, placeLocation);
    photos.push(...searchPhotos);
    console.log(`📸 Added ${searchPhotos.length} search photos`);
  }
  
  // Priority 5: Get Street View images if coordinates are available
  if (coordinates && photos.length < 3) {
    const streetViewPhotos = await getStreetViewImages(coordinates.lat, coordinates.lng);
    photos.push(...streetViewPhotos);
    console.log(`📸 Added ${streetViewPhotos.length} Street View photos`);
  }
  
  // Priority 6: Get images from nearby similar places as last resort
  if (photos.length < 2) {
    const nearbyPhotos = await getNearbyPlaceImages(category, placeLocation);
    photos.push(...nearbyPhotos);
    console.log(`📸 Added ${nearbyPhotos.length} nearby place photos`);
  }
  
  // Remove duplicates and cap at 6 images maximum
  const uniquePhotos = [...new Set(photos)];
  const finalPhotos = uniquePhotos.slice(0, 6);
  
  console.log(`📸 Final image count for ${placeName}: ${finalPhotos.length} images`);
  
  return finalPhotos;
}; 