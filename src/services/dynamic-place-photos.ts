/**
 * Dynamic Place Photos Service
 * Fetches images from Google Places API on-demand when place is viewed
 * Falls back to Street View if no photos available
 */

import { API_KEYS } from '../shared/constants/config/api-keys';

interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface PlaceResult {
  id: string;
  displayName: { text: string };
  photos?: PlacePhoto[];
}

/**
 * Search for place and get photos using new Google Places API
 */
export async function fetchPlacePhotos(
  placeName: string,
  address: string,
  lat: number,
  lng: number
): Promise<string[]> {
  try {
    const apiKey = API_KEYS.GOOGLE_PLACES;
    
    // Search for the place
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
      },
      body: JSON.stringify({
        textQuery: `${placeName} ${address}`
      })
    });
    
    const data = await response.json();
    
    // Check if we found photos
    if (data.places && data.places.length > 0) {
      const place: PlaceResult = data.places[0];
      
      if (place.photos && place.photos.length > 0) {
        // Get up to 3 best photos (Google returns them ranked by quality)
        const topPhotos = place.photos.slice(0, 3);
        const photoUrls = topPhotos.map(photo => 
          `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${apiKey}`
        );
        
        console.log(`✅ Fetched ${photoUrls.length} real photos for: ${placeName}`);
        return photoUrls;
      }
    }
    
    // No photos found - fallback to Street View
    console.log(`⚠️ No photos found for: ${placeName}, using Street View`);
    return getStreetViewFallback(lat, lng);
    
  } catch (error) {
    console.error(`Error fetching photos for ${placeName}:`, error);
    return getStreetViewFallback(lat, lng);
  }
}

/**
 * Generate 3 quality Street View images as fallback
 */
function getStreetViewFallback(lat: number, lng: number): string[] {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  
  return [
    // Front view
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=0&pitch=0&fov=90&key=${apiKey}`,
    // Side view
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=90&pitch=0&fov=90&key=${apiKey}`,
    // Elevated view
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=0&pitch=10&fov=80&key=${apiKey}`
  ];
}

/**
 * Cache for fetched photos to avoid re-fetching
 */
const photoCache = new Map<string, string[]>();

/**
 * Get photos with caching
 */
export async function getPlacePhotosWithCache(
  placeId: string,
  placeName: string,
  address: string,
  lat: number,
  lng: number
): Promise<string[]> {
  // Check cache first
  if (photoCache.has(placeId)) {
    console.log(`📦 Using cached photos for: ${placeName}`);
    return photoCache.get(placeId)!;
  }
  
  // Fetch from API
  const photos = await fetchPlacePhotos(placeName, address, lat, lng);
  
  // Cache the result
  photoCache.set(placeId, photos);
  
  return photos;
}

/**
 * Clear cache (optional - for refreshing photos)
 */
export function clearPhotoCache() {
  photoCache.clear();
  console.log('🗑️ Photo cache cleared');
}

export default {
  fetchPlacePhotos,
  getPlacePhotosWithCache,
  getStreetViewFallback,
  clearPhotoCache
};

