// Mock Server Filtering Hook
// Replace real server filtering with mock data for UI development

import { useState, useCallback } from 'react';
import { mockEnhancedFilteringWithCache, mockUnifiedCacheService } from '../../../services/mock/cache';

export const useServerFilteringMock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterProgress, setFilterProgress] = useState(0);

  const filterPlaces = useCallback(async (filters: any) => {
    setLoading(true);
    setError(null);
    setFilterProgress(0);
    
    try {
      // Simulate progressive filtering
      for (let i = 0; i <= 100; i += 20) {
        setFilterProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const results = await mockEnhancedFilteringWithCache.getFilteredPlaces(filters);
      setLoading(false);
      setFilterProgress(100);
      return results;
    } catch (err) {
      setError('Mock filtering failed');
      setLoading(false);
      setFilterProgress(0);
      throw err;
    }
  }, []);

  const getCachedResults = useCallback(async (filters: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate cache lookup delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cached = await mockUnifiedCacheService.getCachedPlaces(filters);
      setLoading(false);
      return cached;
    } catch (err) {
      setError('Mock cache lookup failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateFilters = useCallback(async (filterId: string, newFilters: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate filter update delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updated = await mockEnhancedFilteringWithCache.updateFilters(filterId, newFilters);
      setLoading(false);
      return updated;
    } catch (err) {
      setError('Mock filter update failed');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    filterPlaces,
    getCachedResults,
    updateFilters,
    loading,
    error,
    filterProgress
  };
};
