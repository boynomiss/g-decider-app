import { useState, useCallback, useEffect, useRef } from 'react';
import { PlaceMoodData } from '../types';
import { getAPIKey } from '../../../shared/constants/config/api-keys';

// Helper function to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface UseGooglePlacesReturn {
  places: PlaceMoodData[];
  isLoading: boolean;
  error: string | null;
  fetchPlaces: (query: string, location?: { lat: number; lng: number }, distanceRange?: number) => Promise<void>;
  clearPlaces: () => void;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  console.log('🎯 useGooglePlaces hook initialized');
  
  const [places, setPlaces] = useState<PlaceMoodData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous calls
  
  // Simple cache to prevent duplicate API calls
  const lastRequestRef = useRef<{
    query: string;
    location: { lat: number; lng: number } | undefined;
    distanceRange: number;
  } | null>(null);

  // Log when places state changes
  useEffect(() => {
    console.log('🔍 Places state changed:', {
      count: places.length,
      places: places.slice(0, 2) // Log first 2 places
    });
  }, [places]);

  const fetchPlaces = useCallback(async (query: string, location?: { lat: number; lng: number }, distanceRange: number = 10) => {
    console.log('🎯 fetchPlaces called with:', { query, location, distanceRange });
    
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log('🔄 Already fetching places, skipping duplicate call');
      return;
    }
    
    // Validate distance range to prevent wasteful API calls
    if (distanceRange < 1) {
      console.log('⚠️ Distance range too small (< 1km), setting to minimum 1km');
      distanceRange = 1;
    } else if (distanceRange > 50) {
      console.log('⚠️ Distance range too large (> 50km), capping at 50km');
      distanceRange = 50;
    }
    
    // Check if this is a duplicate request
    const currentRequest = { query, location, distanceRange };
    if (lastRequestRef.current && 
        lastRequestRef.current.query === currentRequest.query &&
        lastRequestRef.current.distanceRange === currentRequest.distanceRange &&
        lastRequestRef.current.location?.lat === currentRequest.location?.lat &&
        lastRequestRef.current.location?.lng === currentRequest.location?.lng) {
      console.log('🔄 Duplicate request detected, skipping API call');
      return;
    }
    
    // Store current request for future comparison
    lastRequestRef.current = currentRequest;
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);

    try {
      let apiKey: string;
      try {
        apiKey = getAPIKey.places();
        console.log('🔍 API Key loaded:', apiKey ? '✅ Present' : '❌ Missing');
        console.log('🔍 API Key length:', apiKey?.length || 0);
      } catch {
        console.log('❌ Google Places API key not configured, cannot fetch places');
        setError('Google Places API key not configured');
        setPlaces([]);
        return;
      }
      
      const url = 'https://places.googleapis.com/v1/places:searchText';
      
      const requestBody: any = {
        textQuery: query,
        maxResultCount: 20,
        regionCode: 'PH' // Restrict to Philippines
      };

      if (location) {
        // Use distance range for location bias (convert km to meters)
        const radiusInMeters = Math.min(distanceRange * 1000, 50000); // Cap at 50km max
        
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius: radiusInMeters
          }
        };
        
        console.log(`📍 Using location bias with ${distanceRange}km radius (${radiusInMeters}m)`);
      }
      
      console.log('🔍 Google Places API request body:', JSON.stringify(requestBody, null, 2));
      console.log('📍 Location bias details:', {
        hasLocation: !!location,
        locationCoords: location,
        biasType: requestBody.locationBias ? Object.keys(requestBody.locationBias)[0] : 'none',
        isBGC: location?.lat === 14.5176 && location?.lng === 121.0509
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.location,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('🔍 Google API response:', {
        hasPlaces: !!data.places,
        placesCount: data.places?.length || 0,
        firstPlace: data.places?.[0],
        responseStatus: 'success',
        query: query,
        location: location,
        distanceRange: distanceRange
      });
      
      // Log summary of API results
      if (data.places && data.places.length > 0) {
        console.log(`📍 API returned ${data.places.length} places`);
        
        // Log first 3 places for debugging (to avoid excessive logging)
        data.places.slice(0, 3).forEach((place: any, index: number) => {
          if (place.location) {
            const distance = calculateDistance(
              location?.lat || 14.5176, 
              location?.lng || 121.0509,
              place.location.latitude,
              place.location.longitude
            );
            const isInPhilippines = place.location.latitude >= 4.5 && place.location.latitude <= 21.5 &&
                                   place.location.longitude >= 116.9 && place.location.longitude <= 126.6;
            
            console.log(`📍 Place ${index + 1}: ${place.displayName?.text || place.displayName} - ${distance.toFixed(2)}km, PH: ${isInPhilippines ? '✅' : '❌'}`);
          }
        });
        
        if (data.places.length > 3) {
          console.log(`📍 ... and ${data.places.length - 3} more places`);
        }
      }
      
      if (!data.places || data.places.length === 0) {
        console.log('🔍 No places found, returning empty results');
        setPlaces([]);
        return;
      }

      // Transform Google Places API response to PlaceMoodData format
      const transformedPlaces: PlaceMoodData[] = data.places.map((place: any) => {
        const photoUrls = place.photos?.map((photo: any) => {
          if (photo.name) {
            const resourceName = photo.name; // e.g., "places/PLACE_ID/photos/PHOTO_ID"
            return `https://places.googleapis.com/v1/${resourceName}/media?maxWidthPx=800&maxHeightPx=600&key=${apiKey}`;
          }
          return null;
        }).filter(Boolean) || [];
        
        const placeName = place.displayName?.text || place.displayName || 'Unknown Place';
        
        const minImages = 3;
        const maxImages = 5;
        
        let finalPhotoUrls = [...photoUrls];
        
        if (finalPhotoUrls.length === 0) {
          const fallbackImages = [
            `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80`,
            `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&auto=format&q=80`,
            `https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop&auto=format&q=80`
          ];
          finalPhotoUrls = fallbackImages;
        }
        
        while (finalPhotoUrls.length < minImages && finalPhotoUrls.length > 0) {
          const originalLength = finalPhotoUrls.length;
          for (let i = 0; i < originalLength && finalPhotoUrls.length < minImages; i++) {
            finalPhotoUrls.push(finalPhotoUrls[i]);
          }
        }
        
        if (finalPhotoUrls.length > maxImages) {
          finalPhotoUrls = finalPhotoUrls.slice(0, maxImages);
        }
        
        const photos = {
          thumbnail: finalPhotoUrls.map((url: string) => url?.replace('maxWidthPx=800&maxHeightPx=600', 'maxWidthPx=200&maxHeightPx=150')).filter(Boolean),
          medium: finalPhotoUrls,
          large: finalPhotoUrls.map((url: string) => url?.replace('maxWidthPx=800&maxHeightPx=600', 'maxWidthPx=1200&maxHeightPx=900')).filter(Boolean),
          count: finalPhotoUrls.length
        };
        
        console.log(`📸 Photo debugging for ${placeName}:`, {
          rawPhotos: place.photos?.length || 0,
          originalUrls: photoUrls.length,
          finalUrls: finalPhotoUrls.length,
          hasPhotos: finalPhotoUrls.length > 0,
          mediumPhotos: photos.medium.length,
          photoCount: photos.count,
          samplePhoto: finalPhotoUrls[0]
        });

        // Determine budget level from price level
        const budget = place.priceLevel ? 
          (place.priceLevel === 1 ? 'P' : place.priceLevel === 2 ? 'PP' : 'PPP') : 
          'PP';

        // Determine category from types
        const category = place.types?.includes('restaurant') ? 'food' :
                        place.types?.includes('park') || place.types?.includes('museum') ? 'activity' :
                        'something-new';

        // Determine mood based on place type (simplified logic)
        const mood = place.types?.includes('bar') || place.types?.includes('nightclub') ? 'hype' :
                    place.types?.includes('park') || place.types?.includes('library') ? 'chill' :
                    'neutral';
        
        return {
          id: place.id,
          name: placeName,
          location: place.formattedAddress || 'Unknown Location',
          formatted_address: place.formattedAddress || 'Unknown Location',
          vicinity: place.formattedAddress || 'Unknown Location',
          images: finalPhotoUrls, // Keep for backward compatibility
          photos: photos, // New structured photos object
          budget: budget as 'P' | 'PP' | 'PPP',
          price_level: place.priceLevel || 2,
          tags: place.types || [],
          description: `${place.displayName?.text || 'This place'} is a great place to visit.`,
          editorial_summary: `${place.displayName?.text || 'This place'} is a great place to visit.`,
          openHours: place.regularOpeningHours?.weekdayDescriptions?.join(', ') || 'Hours not available',
          category: category as 'food' | 'activity' | 'something-new',
          mood: mood as 'chill' | 'hype' | 'neutral',
          final_mood: mood as 'chill' | 'hype' | 'neutral',
          socialContext: ['solo', 'with-bae', 'barkada'] as const,
          timeOfDay: ['morning', 'afternoon', 'night'] as const,
          coordinates: place.location ? {
            lat: place.location.latitude,
            lng: place.location.longitude
          } : { lat: 14.5176, lng: 121.0509 }, // Default to BGC
          rating: place.rating || 0,
          reviewCount: place.userRatingCount || 0,
          reviews: [],
          website: place.websiteUri || '',
          phone: place.nationalPhoneNumber || '',
          contactActions: {
            canCall: !!place.nationalPhoneNumber,
            canVisitWebsite: !!place.websiteUri,
            callUrl: place.nationalPhoneNumber ? `tel:${place.nationalPhoneNumber}` : undefined,
            websiteUrl: place.websiteUri || undefined
          }
        };
      });

      // Filter places by distance and Philippines location if location is provided
      let filteredPlaces = transformedPlaces;
      if (location) {
        const maxDistance = distanceRange; // Use user's distance preference
        
        // Philippines bounding box (rough approximation)
        const PHILIPPINES_BOUNDS = {
          north: 21.5,   // Northernmost point
          south: 4.5,    // Southernmost point  
          east: 126.6,   // Easternmost point
          west: 116.9    // Westernmost point
        };
        
        filteredPlaces = transformedPlaces.filter(place => {
          if (!place.coordinates) return false;
          
          const { lat, lng } = place.coordinates;
          
                  // First check: Must be within Philippines bounds
        const isInPhilippines = lat >= PHILIPPINES_BOUNDS.south && 
                               lat <= PHILIPPINES_BOUNDS.north && 
                               lng >= PHILIPPINES_BOUNDS.west && 
                               lng <= PHILIPPINES_BOUNDS.east;
        
        if (!isInPhilippines) {
          return false;
        }
        
        // Additional check: Address should contain Philippines indicators
        const address = place.location || '';
        const philippinesIndicators = ['Philippines', 'PH', 'Manila', 'Makati', 'Taguig', 'BGC', 'Quezon City', 'Pasig', 'Pasay'];
        const hasPhilippinesAddress = philippinesIndicators.some(indicator => 
          address.toLowerCase().includes(indicator.toLowerCase())
        );
        
        // Temporarily relax this check to see if it's blocking results
        if (!hasPhilippinesAddress) {
          console.log(`🏠 Address check failed for: ${place.name} - ${address}`);
          // For now, let's allow places without Philippines address if they pass coordinate check
          // return false;
        }
          
          // Second check: Must be within distance limit
          const distance = calculateDistance(
            location.lat,
            location.lng,
            lat,
            lng
          );
          
          if (distance > maxDistance) {
            return false;
          }
          
          return true;
        });
        
        console.log(`📍 Filtered places: ${transformedPlaces.length} → ${filteredPlaces.length} (Philippines + ${maxDistance}km max)`);
        console.log(`📍 Filtering details: maxDistance=${maxDistance}km, location=${location.lat},${location.lng}`);
        
        // Log summary of what was filtered out
        const nonPhilippinesPlaces = transformedPlaces.filter(place => {
          if (!place.coordinates) return true;
          const { lat, lng } = place.coordinates;
          return lat < PHILIPPINES_BOUNDS.south || lat > PHILIPPINES_BOUNDS.north || 
                 lng < PHILIPPINES_BOUNDS.west || lng > PHILIPPINES_BOUNDS.east;
        });
        
        const distantPlaces = transformedPlaces.filter(place => {
          if (!place.coordinates) return false;
          const distance = calculateDistance(
            location.lat,
            location.lng,
            place.coordinates.lat,
            place.coordinates.lng
          );
          return distance > maxDistance;
        });
        
        if (nonPhilippinesPlaces.length > 0) {
          console.log(`🌍 Filtered out ${nonPhilippinesPlaces.length} non-Philippines places`);
        }
        
        if (distantPlaces.length > 0) {
          console.log(`📍 Filtered out ${distantPlaces.length} places beyond ${maxDistance}km`);
        }
      }
      
      console.log('🔍 About to set places state with:', filteredPlaces.length, 'places');
      setPlaces(filteredPlaces);
      console.log(`✅ Fetched ${filteredPlaces.length} places from Google API`);
      console.log('🔍 First transformed place:', filteredPlaces[0]);
      console.log('🔍 Places state should now be updated');
      
    } catch (err) {
      console.error('❌ Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
      setPlaces([]);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    clearPlaces
  };
};
