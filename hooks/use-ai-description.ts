import { useState, useCallback, useEffect } from 'react';
import { aiDescriptionService } from '../utils/content/results/ai-description-service';
import { Suggestion } from '../types/app';
import { PlaceMoodData } from '../types/filtering';

type DescriptionInput = Suggestion | PlaceData;

interface UseAIDescriptionReturn {
  aiDescription: string | null;
  isLoading: boolean;
  error: string | null;
  generateDescription: (input: DescriptionInput) => Promise<void>;
  clearDescription: () => void;
}

export const useAIDescription = (): UseAIDescriptionReturn => {
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = useCallback(async (input: DescriptionInput) => {
    if (!input) return;

    setIsLoading(true);
    setError(null);

    try {
      let restaurantData;
      if ('id' in input) {
        // Suggestion
        restaurantData = {
          name: input.name,
          location: input.location,
          budget: input.budget,
          tags: input.tags,
          description: input.description,
          reviews: input.reviews,
          images: input.images,
          category: input.category,
          mood: getMoodNumber(input.mood),
          socialContext: input.socialContext.join(', '),
          timeOfDay: input.timeOfDay.join(', ')
        };
      } else {
        // PlaceData
        restaurantData = {
          name: input.name,
          location: input.address || input.vicinity || input.formatted_address || 'Unknown location',
          budget: input.price_level === 1 ? 'P' : input.price_level === 2 ? 'PP' : 'PPP',
          tags: input.types || [],
          description: input.description,
          reviews: input.reviews,
          images: input.photos?.medium || input.images?.urls || [],
          category: input.category,
          mood: getMoodNumber(input.final_mood || 'both'),
          socialContext: 'solo, with-bae, barkada',
          timeOfDay: 'morning, afternoon, night'
        };
      }

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

  useEffect(() => {
    return () => {
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

function getMoodNumber(mood: string): number {
  switch (mood) {
    case 'chill':
      return 1;
    case 'hype':
      return 2;
    case 'both':
      return 3;
    case 'neutral':
      return 2;
    default:
      return 1;
  }
} 