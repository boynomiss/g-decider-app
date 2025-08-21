// Mock AI Description Hook
// Replace real AI calls with mock data for UI development

import { useState, useCallback } from 'react';
import { mockDescriptionGenerator, mockResultsServices } from '../../../services/mock/ai';

export const useAIDescriptionMock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = useCallback(async (placeData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const description = await mockDescriptionGenerator.generatePlaceDescription(placeData);
      setLoading(false);
      return description;
    } catch (err) {
      setError('Mock AI description generation failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const enhanceDescription = useCallback(async (existingDescription: string, enhancements: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enhanced = await mockDescriptionGenerator.enhanceDescription(existingDescription, enhancements);
      setLoading(false);
      return enhanced;
    } catch (err) {
      setError('Mock AI enhancement failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const generateEnhancedDescription = useCallback(async (placeData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const enhanced = await mockResultsServices.aiDescriptionService.generateEnhancedDescription(placeData);
      setLoading(false);
      return enhanced;
    } catch (err) {
      setError('Mock AI enhanced description failed');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    generateDescription,
    enhanceDescription,
    generateEnhancedDescription,
    loading,
    error
  };
};
