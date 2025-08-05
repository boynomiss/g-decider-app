import { useState, useCallback } from 'react';
import { UserFilters } from '../types/app';
import { PlaceData } from '../utils/place-mood-service';
import { serverFilteringService, ServerFilteringResponse } from '../utils/server-filtering-service';

export interface UseServerFilteringReturn {
  // State
  isLoading: boolean;
  error: string | null;
  results: PlaceData[];
  lastResponse?: ServerFilteringResponse;
  
  // Actions
  filterPlaces: (filters: UserFilters, minResults?: number, useCache?: boolean) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  
  // Performance metrics
  performance: {
    responseTime: number;
    cacheHitRate: number;
    apiCallsMade: number;
  } | null;
  
  // Metadata
  metadata: {
    filtersApplied: string[];
    queryOptimization: string;
    source: 'cache' | 'api' | 'mixed';
    cacheHit: boolean;
    totalResults: number;
  } | null;
}

export const useServerFiltering = (): UseServerFilteringReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceData[]>([]);
  const [lastResponse, setLastResponse] = useState<ServerFilteringResponse | undefined>(undefined);
  const [performance, setPerformance] = useState<UseServerFilteringReturn['performance']>(null);
  const [metadata, setMetadata] = useState<UseServerFilteringReturn['metadata']>(null);

  const filterPlaces = useCallback(async (
    filters: UserFilters, 
    minResults: number = 5, 
    useCache: boolean = true
  ) => {
    console.log('🚀 Starting server-side filtering with filters:', filters);
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await serverFilteringService.filterPlaces(filters, minResults, useCache);
      
      // Convert server results (Suggestion format) to PlaceData format
      const placeDataResults: PlaceData[] = response.results.map((place: any) => ({
        place_id: place.id,
        name: place.name,
        address: place.location,
        category: place.category,
        user_ratings_total: place.reviewCount || 0,
        rating: place.rating || 0,
        reviews: place.reviews || [],
        images: {
          urls: place.images || [],
          metadata: {
            totalImages: (place.images || []).length,
            authenticImages: (place.images || []).length,
            averageConfidence: 1.0,
            sources: ['server']
          }
        },
        photos: {
          thumbnail: place.images || [],
          medium: place.images || [],
          large: place.images || [],
          count: (place.images || []).length
        },
        location: place.coordinates,
        website: place.website,
        description: place.description,
        vicinity: place.location,
        formatted_address: place.location,
        types: place.tags || [],
        price_level: place.budget === 'P' ? 1 : place.budget === 'PP' ? 2 : 3,
        opening_hours: place.openHours ? { open_now: true } : undefined,
        contact: {
          website: place.website,
          hasContact: !!place.website
        },
        contactActions: {
          canCall: false,
          canVisitWebsite: !!place.website,
          websiteUrl: place.website
        }
      }));

      setResults(placeDataResults);
      setLastResponse(response);
      setPerformance({
        responseTime: response.performance.responseTime,
        cacheHitRate: response.performance.cacheHitRate,
        apiCallsMade: response.performance.apiCallsMade
      });
      setMetadata({
        filtersApplied: response.metadata.filtersApplied,
        queryOptimization: response.metadata.queryOptimization,
        source: response.source,
        cacheHit: response.cacheHit,
        totalResults: response.totalResults
      });

      console.log('✅ Server filtering completed:', {
        resultsCount: placeDataResults.length,
        source: response.source,
        cacheHit: response.cacheHit,
        responseTime: response.performance.responseTime
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Server filtering failed:', errorMessage);
      setError(errorMessage);
      setResults([]);
      setLastResponse(undefined);
      setPerformance(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setLastResponse(undefined);
    setPerformance(null);
    setMetadata(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    results,
    lastResponse,
    filterPlaces,
    clearResults,
    clearError,
    performance,
    metadata
  };
}; 