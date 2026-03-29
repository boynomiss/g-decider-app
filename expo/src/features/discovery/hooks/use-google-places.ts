import { useState, useCallback, useEffect, useRef } from 'react';
import { PlaceMoodData } from '../types';
import { getAPIKey } from '../../../shared/constants/config/api-keys';
import { BudgetUtils } from '../../../features/filtering/services/filtering/configs/budget-config';
import { SocialContext, TimeOfDay } from '../../../features/filtering/types';

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
  fetchPlaces: (query: string, location?: { lat: number; lng: number }, distanceRange?: number, options?: { force?: boolean; randomize?: boolean }) => Promise<void>;
  clearPlaces: () => void;
  fetchPlaceDetails: (placeId: string) => Promise<PlaceMoodData | null>;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  console.log('🎯 useGooglePlaces hook initialized');
  
  const [places, setPlaces] = useState<PlaceMoodData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false); // Prevent multiple simultaneous calls
  
  // Simple cache to prevent duplicate API calls
  const lastRequestRef = useRef<{
    query: string;
    location: { lat: number; lng: number } | undefined;
    distanceRange: number;
  } | null>(null);

  // Session seed to introduce small randomness per session
  const sessionSeedRef = useRef<number>((Date.now() ^ Math.floor(Math.random() * 1_000_000)) >>> 0);
  const shuffleCounterRef = useRef<number>(0);

  const seededShuffle = <T,>(array: T[], seed: number): T[] => {
    let s = seed >>> 0;
    const a: T[] = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      const ai = a[i] as T;
      const aj = a[j] as T;
      a[i] = aj as T;
      a[j] = ai as T;
    }
    return a;
  };

  const rotateTokens = (q: string, offset: number): string => {
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length <= 1) return q;
    const n = ((offset % tokens.length) + tokens.length) % tokens.length;
    return tokens.slice(n).concat(tokens.slice(0, n)).join(' ');
  };

  // Log when places state changes
  useEffect(() => {
    console.log('🔍 Places state changed:', {
      count: places.length,
      places: places.slice(0, 2) // Log first 2 places
    });
  }, [places]);

  const fetchPlaces = useCallback(async (query: string, location?: { lat: number; lng: number }, distanceRange: number = 10, options?: { force?: boolean; randomize?: boolean }) => {
    console.log('🎯 fetchPlaces called with:', { query, location, distanceRange, options });
    
    if (isFetching) {
      console.log('🔄 Already fetching places, skipping duplicate call');
      return;
    }
    
    if (distanceRange < 1) {
      console.log('⚠️ Distance range too small (< 1km), setting to minimum 1km');
      distanceRange = 1;
    } else if (distanceRange > 50) {
      console.log('⚠️ Distance range too large (> 50km), capping at 50km');
      distanceRange = 50;
    }

    const randomSalt = options?.randomize ? Math.floor(Math.random() * 1_000_000) : 0;
    const rotationOffset = (sessionSeedRef.current + (++shuffleCounterRef.current) + randomSalt) % 7;
    const rotatedQuery = rotateTokens(query, rotationOffset);
    
    const currentRequest = { query: rotatedQuery, location, distanceRange };
    if (!options?.force && lastRequestRef.current && 
        lastRequestRef.current.query === currentRequest.query &&
        lastRequestRef.current.distanceRange === currentRequest.distanceRange &&
        lastRequestRef.current.location?.lat === currentRequest.location?.lat &&
        lastRequestRef.current.location?.lng === currentRequest.location?.lng) {
      console.log('🔄 Duplicate request detected, skipping API call');
      return;
    }
    
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
        textQuery: rotatedQuery,
        maxResultCount: 20,
        regionCode: 'PH'
      };

      if (location) {
        const baseRadius = Math.min(distanceRange * 1000, 50000);
        const jitterPct = (((sessionSeedRef.current + shuffleCounterRef.current + randomSalt) % 201) - 100) / 1000;
        const radiusInMeters = Math.max(500, Math.round(baseRadius * (1 + jitterPct)));
        
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius: radiusInMeters
          }
        };
        
        console.log(`📍 Using location bias with ~${distanceRange}km radius (${radiusInMeters}m, jitter ${Math.round(jitterPct*100)}%)`);
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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.location,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.currentOpeningHours.openNow,places.businessStatus,places.reviews,places.editorialSummary'
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

      // Helper to estimate open status if API didn't return currentOpeningHours
      const inferOpenNowFromRegularHours = (weekdayDescriptions?: string[] | null): boolean | undefined => {
        if (!weekdayDescriptions || weekdayDescriptions.length === 0) return undefined;
        try {
          const now = new Date();
          const day = now.getDay();
          const map: Record<number, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
          const today = (weekdayDescriptions.find((d: string) => (d ?? '').startsWith(map[day] ?? '')) ?? '');
          if (!today) return undefined;
          const hoursPart = today.split(':')[1]?.trim();
          if (!hoursPart || hoursPart.toLowerCase().includes('closed')) return false;
          const ranges = hoursPart.split(',').map(s => s.trim());
          const toMinutes = (h: number, m: number) => h * 60 + m;
          const nowMin = toMinutes(now.getHours(), now.getMinutes());
          for (const r of ranges) {
            const m = r.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s*[–-]\s*(\d{1,2}):(\d{2})\s*([AP]M)/i) as RegExpMatchArray | null;
            if (!m) continue;
            const parse = (hStr: string, mStr: string, ampm: string) => {
              const hNum = parseInt(hStr || '0', 10);
              const mNum = parseInt(mStr || '0', 10);
              let h = hNum % 12;
              if ((ampm || '').toUpperCase() === 'PM') h += 12;
              return toMinutes(h, mNum);
            };
            const start = parse(m[1] ?? '0', m[2] ?? '0', m[3] ?? 'AM');
            const end = parse(m[4] ?? '0', m[5] ?? '0', m[6] ?? 'AM');
            if (end < start) {
              if (nowMin >= start || nowMin <= end) return true;
            } else {
              if (nowMin >= start && nowMin <= end) return true;
            }
          }
          return false;
        } catch {
          return undefined;
        }
      };

      // Transform Google Places API response to PlaceMoodData format
      const transformedPlaces: PlaceMoodData[] = data.places.map((place: any) => {
        // Sort photos by quality (width * height) descending and take top N
        const rawPhotos: any[] = Array.isArray(place.photos) ? [...place.photos] : [];
        const sortedByQuality = rawPhotos
          .map((p: any) => ({
            ...p,
            _quality: Number(p?.widthPx || 0) * Number(p?.heightPx || 0)
          }))
          .sort((a, b) => (b._quality - a._quality));

        const maxImages = 5;
        const minImages = 3;
        const topPhotos = sortedByQuality.slice(0, maxImages);

        const photoUrls = topPhotos.map((photo: any) => {
          if (photo?.name) {
            const resourceName = photo.name; // e.g., "places/PLACE_ID/photos/PHOTO_ID"
            // Request a reasonably large size for quality while keeping bandwidth reasonable
            return `https://places.googleapis.com/v1/${resourceName}/media?maxWidthPx=1000&maxHeightPx=750&key=${apiKey ?? ''}`;
          }
          return null as unknown as string;
        }).filter((u: string | null) => typeof u === 'string' && !!u) as string[];
        
        const placeName = place.displayName?.text || place.displayName || 'Unknown Place';
        
        let finalPhotoUrls: string[] = [...photoUrls];
        
        if (finalPhotoUrls.length === 0) {
          const fallbackImages: string[] = [
            `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&h=750&fit=crop&auto=format&q=85`,
            `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&h=750&fit=crop&auto=format&q=85`,
            `https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1000&h=750&fit=crop&auto=format&q=85`
          ];
          finalPhotoUrls = fallbackImages;
        }
        
        while (finalPhotoUrls.length < minImages && finalPhotoUrls.length > 0) {
          const originalLength = finalPhotoUrls.length;
          for (let i = 0; i < originalLength && finalPhotoUrls.length < minImages; i++) {
            const next = finalPhotoUrls[i];
            if (typeof next === 'string') {
              finalPhotoUrls.push(next);
            }
          }
        }
        
        if (finalPhotoUrls.length > maxImages) {
          finalPhotoUrls = finalPhotoUrls.slice(0, maxImages);
        }
        
        const photos = {
          thumbnail: finalPhotoUrls.map((url: string) => url.replace('maxWidthPx=1000&maxHeightPx=750', 'maxWidthPx=200&maxHeightPx=150')).filter(Boolean) as string[],
          medium: finalPhotoUrls,
          large: finalPhotoUrls.map((url: string) => url.replace('maxWidthPx=1000&maxHeightPx=750', 'maxWidthPx=1400&maxHeightPx=1050')).filter(Boolean) as string[],
          count: finalPhotoUrls.length
        };
        
        console.log(`📸 Photo debugging for ${placeName}:`, {
          rawPhotos: rawPhotos.length,
          topPhotos: topPhotos.length,
          originalUrls: photoUrls.length,
          finalUrls: finalPhotoUrls.length,
          hasPhotos: finalPhotoUrls.length > 0,
          mediumPhotos: photos.medium.length,
          photoCount: photos.count,
          samplePhoto: finalPhotoUrls[0]
        });

        // Normalize Google Places priceLevel (string enum) to numeric 0-4
        const normalizePriceLevel = (pl: unknown): number | undefined => {
          if (pl == null) return undefined;
          if (typeof pl === 'number') return pl;
          if (typeof pl === 'string') {
            const s = pl.toUpperCase();
            if (s.includes('VERY_EXPENSIVE')) return 4;
            if (s.includes('EXPENSIVE')) return 3;
            if (s.includes('MODERATE')) return 2;
            if (s.includes('INEXPENSIVE')) return 1;
            if (s.includes('FREE')) return 0;
            return undefined;
          }
          return undefined;
        };

        const numericPriceLevel = normalizePriceLevel(place.priceLevel);

        // Use centralized price range extraction service
        const extractedPriceRange = BudgetUtils.extractPriceRangeFromGooglePlaces(place);

        // Determine budget label from numeric price level or extracted price range
        const budget = ((): 'P' | 'PP' | 'PPP' | null => {
          // If we have an extracted price range, use that to determine budget
          if (extractedPriceRange) {
            if (extractedPriceRange.includes('₱1-200') || extractedPriceRange.includes('₱200-400')) {
              return 'P';
            } else if (extractedPriceRange.includes('₱400-600') || extractedPriceRange.includes('₱600-800')) {
              return 'PP';
            } else if (extractedPriceRange.includes('₱800+')) {
              return 'PPP';
            }
          }
          
          // Fallback to numeric price level logic
          if (typeof numericPriceLevel === 'number') {
            if (numericPriceLevel <= 1) return 'P';
            if (numericPriceLevel === 2) return 'PP';
            if (numericPriceLevel >= 3) return 'PPP';
          }
          
          return null;
        })();

        // Determine category from types
        const category = place.types?.includes('restaurant') ? 'food' :
                        place.types?.includes('park') || place.types?.includes('museum') ? 'activity' :
                        'something-new';

        // Determine mood based on place type (simplified logic)
        const mood = place.types?.includes('bar') || place.types?.includes('nightclub') ? 'hype' :
                    place.types?.includes('park') || place.types?.includes('library') ? 'chill' :
                    'neutral';
        
        // Extract and transform reviews from Google Places API
        const reviews = place.reviews ? place.reviews.slice(0, 5).map((review: any) => ({
          text: review.text?.text || review.text || '',
          rating: review.rating || 0,
          time: typeof review.time === 'number' ? review.time : new Date(review.time || Date.now()).getTime(),
          author: review.authorAttribution?.displayName || 'Anonymous',
          relativeTimeDescription: review.relativePublishTimeDescription || ''
        })) : [];

        // Get editorial summary if available
        const editorialSummary = place.editorialSummary?.text || '';
        
        return {
          id: place.id,
          name: placeName,
          location: place.formattedAddress || 'Unknown Location',
          formatted_address: place.formattedAddress || 'Unknown Location',
          vicinity: place.formattedAddress || 'Unknown Location',
          images: finalPhotoUrls, // Keep for backward compatibility
          photos: photos, // New structured photos object
          budget: budget as 'P' | 'PP' | 'PPP' | null, // Allow null for unknown budget
          ...(extractedPriceRange && { priceRange: extractedPriceRange }),
          ...(numericPriceLevel !== undefined && { price_level: numericPriceLevel }),
          tags: place.types || [],
          description: editorialSummary || `${place.displayName?.text || 'This place'} is a great place to visit.`,
          editorial_summary: editorialSummary,
          openHours: place.regularOpeningHours?.weekdayDescriptions?.join(', ') || 'Hours not available',
          category: category as 'food' | 'activity' | 'something-new',
          mood: mood as 'chill' | 'hype' | 'neutral',
          final_mood: mood as 'chill' | 'hype' | 'neutral',
          socialContext: ['solo', 'with-bae', 'barkada'] as SocialContext[],
          timeOfDay: ['morning', 'afternoon', 'night'] as TimeOfDay[],
          coordinates: place.location ? {
            lat: place.location.latitude,
            lng: place.location.longitude
          } : { lat: 14.5176, lng: 121.0509 }, // Default to BGC
          rating: place.rating || 0,
          reviewCount: place.userRatingCount || 0,
          reviews: reviews,
          website: place.websiteUri || '',
          phone: place.nationalPhoneNumber || '',
          contactActions: {
            canCall: !!place.nationalPhoneNumber,
            canVisitWebsite: !!place.websiteUri,
            ...(place.nationalPhoneNumber && { callUrl: `tel:${place.nationalPhoneNumber}` }),
            ...(place.websiteUri && { websiteUrl: place.websiteUri })
          },
          business_status: place.businessStatus,
          open_now: typeof place.currentOpeningHours?.openNow === 'boolean'
            ? Boolean(place.currentOpeningHours.openNow)
            : inferOpenNowFromRegularHours(place.regularOpeningHours?.weekdayDescriptions || [])
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
      
      const seed = (sessionSeedRef.current + (++shuffleCounterRef.current) + randomSalt) >>> 0;
      // Prioritize currently open places while preserving randomness within groups
      const openPlaces = filteredPlaces.filter(p => p.open_now === true);
      const closedPlaces = filteredPlaces.filter(p => p.open_now !== true);
      const shuffledOpen = seededShuffle(openPlaces, (seed ^ 0xA5A5A5A5) >>> 0);
      const shuffledClosed = seededShuffle(closedPlaces, (seed ^ 0x5A5A5A5A) >>> 0);
      const shuffled = [...shuffledOpen, ...shuffledClosed];

      console.log('🔍 About to set places state with:', shuffled.length, 'places (shuffled)');
      setPlaces(shuffled);
      console.log(`✅ Fetched ${shuffled.length} places from Google API`);
      console.log('🔍 First transformed place:', shuffled[0]);
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
    console.log('🧹 Clearing places and resetting session randomness');
    setPlaces([]);
    setError(null);
    lastRequestRef.current = null;
    sessionSeedRef.current = (Date.now() ^ Math.floor(Math.random() * 1_000_000)) >>> 0;
    shuffleCounterRef.current = 0;
  }, []);

  /**
   * Fetch detailed place information including reviews
   */
  const fetchPlaceDetails = useCallback(async (placeId: string): Promise<PlaceMoodData | null> => {
    try {
      let apiKey: string;
      try {
        apiKey = getAPIKey.places();
        if (!apiKey) {
          console.log('❌ Google Places API key not configured, cannot fetch place details');
          return null;
        }
      } catch {
        console.log('❌ Google Places API key not configured, cannot fetch place details');
        return null;
      }

      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,types,rating,userRatingCount,priceLevel,photos,location,websiteUri,nationalPhoneNumber,regularOpeningHours,currentOpeningHours.openNow,businessStatus,reviews,editorialSummary,reviews.authorAttribution,reviews.relativePublishTimeDescription'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Place details API error:', response.status, errorText);
        return null;
      }

      const place = await response.json();
      
      if (!place) {
        console.log('❌ No place data returned from API');
        return null;
      }

      // Transform the detailed place data to PlaceMoodData format
      const transformedPlace = (() => {
        // Sort photos by quality (width * height) descending and take top N
        const rawPhotos: any[] = Array.isArray(place.photos) ? [...place.photos] : [];
        const sortedByQuality = rawPhotos
          .map((p: any) => ({
            ...p,
            _quality: Number(p?.widthPx || 0) * Number(p?.heightPx || 0)
          }))
          .sort((a, b) => (b._quality - a._quality));

        const maxImages = 5;
        const minImages = 3;
        const topPhotos = sortedByQuality.slice(0, maxImages);

        const photoUrls = topPhotos.map((photo: any) => {
          if (photo?.name) {
            const resourceName = photo.name;
            return `https://places.googleapis.com/v1/${resourceName}/media?maxWidthPx=1000&maxHeightPx=750&key=${apiKey ?? ''}`;
          }
          return null as unknown as string;
        }).filter((u: string | null) => typeof u === 'string' && !!u) as string[];
        
        let finalPhotoUrls: string[] = [...photoUrls];
        
        if (finalPhotoUrls.length === 0) {
          const fallbackImages: string[] = [
            `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&h=750&fit=crop&auto=format&q=85`,
            `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&h=750&fit=crop&auto=format&q=85`,
            `https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1000&h=750&fit=crop&auto=format&q=85`
          ];
          finalPhotoUrls = fallbackImages;
        }
        
        while (finalPhotoUrls.length < minImages && finalPhotoUrls.length > 0) {
          const originalLength = finalPhotoUrls.length;
          for (let i = 0; i < originalLength && finalPhotoUrls.length < minImages; i++) {
            const next = finalPhotoUrls[i];
            if (typeof next === 'string') {
              finalPhotoUrls.push(next);
            }
          }
        }
        
        if (finalPhotoUrls.length > maxImages) {
          finalPhotoUrls = finalPhotoUrls.slice(0, maxImages);
        }
        
        const photos = {
          thumbnail: finalPhotoUrls.map((url: string) => url.replace('maxWidthPx=1000&maxHeightPx=750', 'maxWidthPx=200&maxHeightPx=150')).filter(Boolean) as string[],
          medium: finalPhotoUrls,
          large: finalPhotoUrls.map((url: string) => url.replace('maxWidthPx=1000&maxHeightPx=750', 'maxWidthPx=1400&maxHeightPx=1050')).filter(Boolean) as string[],
          count: finalPhotoUrls.length
        };

        // Normalize Google Places priceLevel
        const normalizePriceLevel = (pl: unknown): number | undefined => {
          if (pl == null) return undefined;
          if (typeof pl === 'number') return pl;
          if (typeof pl === 'string') {
            const s = pl.toUpperCase();
            if (s.includes('VERY_EXPENSIVE')) return 4;
            if (s.includes('EXPENSIVE')) return 3;
            if (s.includes('MODERATE')) return 2;
            if (s.includes('INEXPENSIVE')) return 1;
            if (s.includes('FREE')) return 0;
            return undefined;
          }
          return undefined;
        };

        const numericPriceLevel = normalizePriceLevel(place.priceLevel);

        // Use centralized price range extraction service
        const extractedPriceRange = BudgetUtils.extractPriceRangeFromGooglePlaces(place);

        // Determine budget label
        const budget = ((): 'P' | 'PP' | 'PPP' | null => {
          if (extractedPriceRange) {
            if (extractedPriceRange.includes('₱1-200') || extractedPriceRange.includes('₱200-400')) {
              return 'P';
            } else if (extractedPriceRange.includes('₱400-600') || extractedPriceRange.includes('₱600-800')) {
              return 'PP';
            } else if (extractedPriceRange.includes('₱800+')) {
              return 'PPP';
            }
          }
          
          if (typeof numericPriceLevel === 'number') {
            if (numericPriceLevel <= 1) return 'P';
            if (numericPriceLevel === 2) return 'PP';
            if (numericPriceLevel >= 3) return 'PPP';
          }
          
          return null;
        })();

        // Determine category from types
        const category = place.types?.includes('restaurant') ? 'food' :
                        place.types?.includes('park') || place.types?.includes('museum') ? 'activity' :
                        'something-new';

        // Determine mood based on place type
        const mood = place.types?.includes('bar') || place.types?.includes('nightclub') ? 'hype' :
                    place.types?.includes('park') || place.types?.includes('library') ? 'chill' :
                    'neutral';
        
        // Extract and transform reviews
        const reviews = place.reviews ? place.reviews.slice(0, 10).map((review: any) => ({
          text: review.text?.text || review.text || '',
          rating: review.rating || 0,
          time: typeof review.time === 'number' ? review.time : new Date(review.time || Date.now()).getTime(),
          author: review.authorAttribution?.displayName || 'Anonymous',
          relativeTimeDescription: review.relativePublishTimeDescription || ''
        })) : [];

        // Get editorial summary if available
        const editorialSummary = place.editorialSummary?.text || '';
        
        return {
          id: place.id,
          name: place.displayName?.text || place.displayName || 'Unknown Place',
          location: place.formattedAddress || 'Unknown Location',
          formatted_address: place.formattedAddress || 'Unknown Location',
          vicinity: place.formattedAddress || 'Unknown Location',
          images: finalPhotoUrls,
          photos: photos,
          budget: budget as 'P' | 'PP' | 'PPP' | null,
          ...(extractedPriceRange && { priceRange: extractedPriceRange }),
          ...(numericPriceLevel !== undefined && { price_level: numericPriceLevel }),
          tags: place.types || [],
          description: editorialSummary || `${place.displayName?.text || 'This place'} is a great place to visit.`,
          editorial_summary: editorialSummary,
          openHours: place.regularOpeningHours?.weekdayDescriptions?.join(', ') || 'Hours not available',
          category: category as 'food' | 'activity' | 'something-new',
          mood: mood as 'chill' | 'hype' | 'neutral',
          final_mood: mood as 'chill' | 'hype' | 'neutral',
          socialContext: ['solo', 'with-bae', 'barkada'] as SocialContext[],
          timeOfDay: ['morning', 'afternoon', 'night'] as TimeOfDay[],
          coordinates: place.location ? {
            lat: place.location.latitude,
            lng: place.location.longitude
          } : { lat: 14.5176, lng: 121.0509 },
          rating: place.rating || 0,
          reviewCount: place.userRatingCount || 0,
          reviews: reviews,
          website: place.websiteUri || '',
          phone: place.nationalPhoneNumber || '',
          contactActions: {
            canCall: !!place.nationalPhoneNumber,
            canVisitWebsite: !!place.websiteUri,
            ...(place.nationalPhoneNumber && { callUrl: `tel:${place.nationalPhoneNumber}` }),
            ...(place.websiteUri && { websiteUrl: place.websiteUri })
          },
          business_status: place.businessStatus,
          open_now: typeof place.currentOpeningHours?.openNow === 'boolean'
            ? Boolean(place.currentOpeningHours.openNow)
            : undefined
        };
      })();

      console.log('🔍 Fetched detailed place information:', {
        placeId,
        name: transformedPlace.name,
        reviewCount: transformedPlace.reviews.length,
        hasEditorialSummary: !!transformedPlace.editorial_summary
      });

      return transformedPlace;
      
    } catch (error) {
      console.error('❌ Error fetching place details:', error);
      return null;
    }
  }, []);

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    clearPlaces,
    fetchPlaceDetails
  };
};
