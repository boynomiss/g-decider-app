/**
 * Hook for dynamically fetching place photos
 * Fetches from Google Places API when place is viewed
 * Falls back to Street View if no photos available
 */

import { useState, useEffect } from 'react';
import { getPlacePhotosWithCache } from '../services/dynamic-place-photos';

interface UseDynamicPlacePhotosReturn {
  photos: string[];
  isLoading: boolean;
  error: string | null;
  hasRealPhotos: boolean;
}

/**
 * Hook to dynamically fetch place photos
 * @param placeId - Firestore place ID
 * @param placeName - Place name
 * @param address - Place address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Photos array, loading state, and error
 */
export function useDynamicPlacePhotos(
  placeId: string,
  placeName: string,
  address: string,
  lat: number,
  lng: number
): UseDynamicPlacePhotosReturn {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRealPhotos, setHasRealPhotos] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedPhotos = await getPlacePhotosWithCache(
          placeId,
          placeName,
          address,
          lat,
          lng
        );
        
        if (isMounted) {
          setPhotos(fetchedPhotos);
          // Check if these are real Google Places photos (not Street View fallback)
          setHasRealPhotos(fetchedPhotos.length > 0 && !(fetchedPhotos[0]?.includes('streetview') ?? true));
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading place photos:', err);
          setError('Failed to load photos');
          setIsLoading(false);
        }
      }
    }

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [placeId, placeName, address, lat, lng]);

  return {
    photos,
    isLoading,
    error,
    hasRealPhotos
  };
}

export default useDynamicPlacePhotos;

