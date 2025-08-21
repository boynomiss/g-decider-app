// Mock AI Description Hook
// Replace real AI calls with mock data for UI development

import { useState, useCallback } from 'react';
import { mockDescriptionGenerator, mockResultsServices } from '../../../services/mock/ai';

export const useAIDescriptionMock = () => {
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = useCallback(async (placeData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const description = await mockDescriptionGenerator.generatePlaceDescription(placeData);
      setAiDescription(description.description);
      setIsLoading(false);
      return description;
    } catch (err) {
      setError('Mock AI description generation failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const enhanceDescription = useCallback(async (existingDescription: string, enhancements: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enhanced = await mockDescriptionGenerator.enhanceDescription(existingDescription, enhancements);
      setAiDescription(enhanced.enhancedDescription);
      setIsLoading(false);
      return enhanced;
    } catch (err) {
      setError('Mock AI enhancement failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const generateEnhancedDescription = useCallback(async (placeData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const enhanced = await mockResultsServices.aiDescriptionService.generateEnhancedDescription(placeData);
      setAiDescription(enhanced.description);
      setIsLoading(false);
      return enhanced;
    } catch (err) {
      setError('Mock AI enhanced description failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const clearDescription = useCallback(() => {
    setAiDescription(null);
    setError(null);
  }, []);

  return {
    aiDescription,
    isLoading,
    error,
    generateDescription,
    enhanceDescription,
    generateEnhancedDescription,
    clearDescription
  };
};
