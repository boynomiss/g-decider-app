import { useState, useCallback } from 'react';
import { UserFilters } from '../types/app';
import { PlaceMoodData, PlaceData } from '../types/filtering';
import { serverFilteringService } from '../utils/data/server-filtering-service';
import { ServerFilteringResponse } from '../types/server-filtering';
import { convertServerResponse, validateAndSanitizeResponse } from '../utils/data/server-data-converter';

export interface UseServerFilteringReturn {
  // State
  isLoading: boolean;
  error: string | null;
  results: PlaceData[];
  lastResponse: ServerFilteringResponse | null;
  
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
  const [lastResponse, setLastResponse] = useState<ServerFilteringResponse | null>(null);
  const [performance, setPerformance] = useState<UseServerFilteringReturn['performance']>(null);
  const [metadata, setMetadata] = useState<UseServerFilteringReturn['metadata']>(null);

  const filterPlaces = useCallback(async (
    filters: UserFilters, 
    minResults: number = 5, 
    useCache: boolean = true
  ) => {
    console.log('🚀 Starting server-side filtering with filters:', filters);
    console.log('🔍 Current state before filtering - isLoading:', isLoading, 'error:', error, 'results.length:', results.length);
    
    setIsLoading(true);
    setError(null);
    
    console.log('🔍 Set isLoading to true, error to null');

    try {
      console.log('📤 About to call serverFilteringService.filterPlaces...');
      const rawResponse = await serverFilteringService.filterPlaces(filters, minResults, useCache);
      console.log('📤 serverFilteringService.filterPlaces completed, rawResponse:', rawResponse);
      
      // Validate and sanitize the response
      console.log('🔍 Validating and sanitizing response...');
      const validatedResponse = validateAndSanitizeResponse(rawResponse);
      console.log('🔍 Response validated:', validatedResponse);
      
      // Convert server response to client format with proper error handling
      console.log('🔍 Converting server response to client format...');
      const { placeDataResults, performance, metadata } = convertServerResponse(validatedResponse);
      console.log('🔍 Response converted - placeDataResults.length:', placeDataResults.length);

      setResults(placeDataResults);
      setLastResponse(validatedResponse);
      setPerformance(performance);
      setMetadata(metadata);
      
      console.log('🔍 State updated - results set to:', placeDataResults.length, 'items');

      console.log('✅ Server filtering completed:', {
        resultsCount: placeDataResults.length,
        source: validatedResponse.source,
        cacheHit: validatedResponse.cacheHit,
        responseTime: performance.responseTime
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Server filtering failed:', errorMessage);
      console.error('❌ Full error object:', err);
      setError(errorMessage);
      setResults([]);
      setLastResponse(null);
      setPerformance(null);
      setMetadata(null);
    } finally {
      console.log('🔍 Setting isLoading to false');
      setIsLoading(false);
    }
  }, [isLoading, error, results.length]);

  const clearResults = useCallback(() => {
    setResults([]);
    setLastResponse(null);
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