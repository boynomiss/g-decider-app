/**
 * Custom hook for loading place photos from Google Places API
 */

import { useState, useEffect } from 'react';
import { fetchPlacePhotos, getImageUrl } from '../services/google-places-photos';

interface UsePlacePhotosReturn {
  photos: string[];
  isLoading: boolean;
  error: string | null;
  heroPhoto: string | null;
}

/**
 * Hook to fetch and manage place photos
 * @param googlePlacesId - Optional Google Place ID
 * @param fallbackHero - Fallback hero image URL
 * @param fallbackGallery - Fallback gallery URLs
 * @returns Photos state and loading status
 */
export function usePlacePhotos(
  googlePlacesId?: string,
  fallbackHero?: string,
  fallbackGallery?: string[]
): UsePlacePhotosReturn {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPhotos() {
      // If no Google Place ID, use fallback images
      if (!googlePlacesId) {
        const fallbacks = [fallbackHero, ...(fallbackGallery || [])].filter(Boolean) as string[];
        setPhotos(fallbacks.map(url => getImageUrl(url)));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedPhotos = await fetchPlacePhotos(googlePlacesId);
        
        if (fetchedPhotos.length > 0) {
          setPhotos(fetchedPhotos);
        } else {
          // Fallback to provided images if Google has none
          const fallbacks = [fallbackHero, ...(fallbackGallery || [])].filter(Boolean) as string[];
          setPhotos(fallbacks.map(url => getImageUrl(url)));
        }
      } catch (err) {
        console.error('Error loading place photos:', err);
        setError('Failed to load photos');
        
        // Use fallback images on error
        const fallbacks = [fallbackHero, ...(fallbackGallery || [])].filter(Boolean) as string[];
        setPhotos(fallbacks.map(url => getImageUrl(url)));
      } finally {
        setIsLoading(false);
      }
    }

    loadPhotos();
  }, [googlePlacesId, fallbackHero, fallbackGallery]);

  return {
    photos,
    isLoading,
    error,
    heroPhoto: photos.length > 0 ? (photos[0] ?? null) : null
  };
}

export default usePlacePhotos;

