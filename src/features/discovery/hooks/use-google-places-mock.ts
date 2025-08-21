// Mock Google Places Hook
// Replace real API calls with mock data for UI development

import { useState, useCallback } from 'react';
import { mockGooglePlacesClient } from '../../../services/mock/api';

export const useGooglePlacesMock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNearby = useCallback(async (params: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = await mockGooglePlacesClient.searchNearby(params);
      setLoading(false);
      return results;
    } catch (err) {
      setError('Mock search failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const details = await mockGooglePlacesClient.getPlaceDetails(placeId);
      setLoading(false);
      return details;
    } catch (err) {
      setError('Mock place details failed');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    searchNearby,
    getPlaceDetails,
    loading,
    error
  };
};
