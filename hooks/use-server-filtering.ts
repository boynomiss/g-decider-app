import { useState, useCallback } from 'react';
import { UserFilters } from '../types/app';
import { PlaceData } from '../utils/place-mood-service';
import { serverFilteringService } from '../utils/server-filtering-service';
import { ServerFilteringResponse } from '../types/server-filtering';
import { convertServerResponse, validateAndSanitizeResponse } from '../utils/server-data-converter';

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
      const rawResponse = await serverFilteringService.filterPlaces(filters, minResults, useCache);
      
      // Validate and sanitize the response
      const validatedResponse = validateAndSanitizeResponse(rawResponse);
      
      // Convert server response to client format with proper error handling
      const { placeDataResults, performance, metadata } = convertServerResponse(validatedResponse);

      setResults(placeDataResults);
      setLastResponse(validatedResponse);
      setPerformance(performance);
      setMetadata(metadata);

      console.log('✅ Server filtering completed:', {
        resultsCount: placeDataResults.length,
        source: validatedResponse.source,
        cacheHit: validatedResponse.cacheHit,
        responseTime: performance.responseTime
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