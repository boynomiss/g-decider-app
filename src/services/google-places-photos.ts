/**
 * Google Places Photos Service
 * Fetches place photos dynamically from Google Places API
 */

import { API_KEYS } from '../shared/constants/config/api-keys';

interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions: string[];
}

interface PlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    photos?: PlacePhoto[];
  };
  status: string;
}

/**
 * Get photo URL from Google Places API
 * @param photoReference - Photo reference from Places API
 * @param maxWidth - Maximum width of the photo (default 800)
 * @returns Full URL to the photo
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 800): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

/**
 * Fetch place details including photos from Google Places API
 * @param placeId - Google Place ID
 * @returns Place details with photo references
 */
export async function fetchPlacePhotos(placeId: string): Promise<string[]> {
  try {
    const apiKey = API_KEYS.GOOGLE_PLACES;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    
    const response = await fetch(url);
    const data: PlaceDetailsResponse = await response.json();
    
    if (data.status !== 'OK' || !data.result.photos) {
      console.warn(`No photos found for place: ${placeId}`);
      return [];
    }
    
    // Convert photo references to full URLs
    return data.result.photos.map(photo => 
      getPlacePhotoUrl(photo.photo_reference)
    );
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return [];
  }
}

/**
 * Search for a place and get its Google Place ID
 * @param placeName - Name of the place
 * @param location - Optional location (lat, lng) to narrow search
 * @returns Google Place ID or null
 */
export async function searchPlaceId(
  placeName: string, 
  location?: { lat: number; lng: number }
): Promise<string | null> {
  try {
    const apiKey = API_KEYS.GOOGLE_PLACES;
    let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    
    if (location) {
      url += `&locationbias=circle:2000@${location.lat},${location.lng}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching for place:', error);
    return null;
  }
}

/**
 * Get photos for a place by name and location
 * Searches for the place, gets its ID, then fetches photos
 * @param placeName - Name of the place
 * @param location - Location to narrow search
 * @returns Array of photo URLs
 */
export async function getPhotosByPlaceName(
  placeName: string,
  location: { lat: number; lng: number }
): Promise<string[]> {
  try {
    // First, find the place ID
    const placeId = await searchPlaceId(placeName, location);
    
    if (!placeId) {
      console.warn(`Could not find place ID for: ${placeName}`);
      return [];
    }
    
    // Then fetch photos
    return await fetchPlacePhotos(placeId);
  } catch (error) {
    console.error('Error getting photos by place name:', error);
    return [];
  }
}

/**
 * Check if a string is a Google photo reference (vs a direct URL)
 */
export function isGooglePhotoReference(imageString: string): boolean {
  return !imageString.startsWith('http://') && !imageString.startsWith('https://');
}

/**
 * Get image URL - handles both Google photo references and direct URLs
 * @param imageString - Either a photo reference or direct URL
 * @param maxWidth - Max width for Google photos
 * @returns Full image URL
 */
export function getImageUrl(imageString: string, maxWidth: number = 800): string {
  if (isGooglePhotoReference(imageString)) {
    return getPlacePhotoUrl(imageString, maxWidth);
  }
  return imageString;
}

export default {
  getPlacePhotoUrl,
  fetchPlacePhotos,
  searchPlaceId,
  getPhotosByPlaceName,
  isGooglePhotoReference,
  getImageUrl
};

