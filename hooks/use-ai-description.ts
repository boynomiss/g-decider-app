import { useState, useCallback, useEffect } from 'react';
import { aiDescriptionService } from '../utils/ai-description-service';
import { Suggestion } from '../types/app';

interface UseAIDescriptionReturn {
  aiDescription: string | null;
  isLoading: boolean;
  error: string | null;
  generateDescription: (suggestion: Suggestion) => Promise<void>;
  clearDescription: () => void;
}

export const useAIDescription = (): UseAIDescriptionReturn => {
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = useCallback(async (suggestion: Suggestion) => {
    if (!suggestion) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert suggestion to restaurant data format
      const restaurantData = {
        name: suggestion.name,
        location: suggestion.location,
        budget: suggestion.budget,
        tags: suggestion.tags,
        description: suggestion.description,
        reviews: suggestion.reviews,
        images: suggestion.images,
        category: suggestion.category,
        mood: getMoodNumber(suggestion.mood), // Convert string to number
        socialContext: suggestion.socialContext.join(', '), // Convert array to string
        timeOfDay: suggestion.timeOfDay.join(', ') // Convert array to string
      };

      const description = await aiDescriptionService.generateDescription(restaurantData);
      setAiDescription(description);
      
      console.log('🤖 AI description generated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI description';
      setError(errorMessage);
      console.error('❌ AI description generation failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDescription = useCallback(() => {
    setAiDescription(null);
    setError(null);
  }, []);

  // Auto-generate description when suggestion changes
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      clearDescription();
    };
  }, [clearDescription]);

  return {
    aiDescription,
    isLoading,
    error,
    generateDescription,
    clearDescription
  };
};

// Helper function to convert mood string to number
function getMoodNumber(mood: string): number {
  switch (mood) {
    case 'chill':
      return 1;
    case 'hype':
      return 2;
    case 'both':
      return 3;
    default:
      return 1; // Default to chill
  }
} 