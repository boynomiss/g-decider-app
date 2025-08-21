import { useState, useCallback, useEffect } from 'react';
import { aiDescriptionService } from '../../../services/ai/content/results/ai-description-service';
import { Suggestion } from '../types';
import { PlaceData } from '../types';

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
          description: input.description || `${input.name} is a great place to visit.`,
          reviews: Array.isArray(input.reviews) ? input.reviews.map(review => ({
            author: 'Anonymous',
            rating: review.rating,
            text: review.text,
            time: new Date(review.time).toISOString()
          })) : [],
          images: input.images,
          category: input.category,
          mood: getMoodNumber(input.mood),
          socialContext: input.socialContext?.length ? input.socialContext.join(', ') : 'solo',
          timeOfDay: input.timeOfDay?.length ? input.timeOfDay.join(', ') : 'morning',
          // Enhanced Google Places API data
          rating: input.rating,
          reviewCount: input.reviews,
          editorialSummary: input.editorial_summary,
          openHours: input.openHours,
          website: input.website,
          phone: input.phone,
          businessStatus: input.business_status,
          openNow: input.open_now
        };
      } else {
        // PlaceData
        restaurantData = {
          name: input.name,
          location: input.address || input.vicinity || input.formatted_address || 'Unknown location',
          budget: input.price_level === 1 ? 'P' : input.price_level === 2 ? 'PP' : 'PPP',
          tags: input.types || [],
          description: input.description || `${input.name} is a great place to visit.`,
          reviews: Array.isArray(input.reviews) ? input.reviews.map(review => ({
            author: 'Anonymous',
            rating: review.rating,
            text: review.text,
            time: new Date(review.time).toISOString()
          })) : [],
          images: input.photos?.medium || input.images?.urls || [],
          category: input.category,
          mood: getMoodNumber(input.final_mood || 'both'),
          socialContext: 'solo, with-bae, barkada',
          timeOfDay: 'morning, afternoon, night',
          // Enhanced Google Places API data
          rating: input.rating,
          reviewCount: input.reviewCount,
          editorialSummary: input.editorial_summary,
          openHours: input.openHours,
          website: input.website,
          phone: input.phone,
          businessStatus: input.business_status,
          openNow: input.open_now
        };
      }

      const description = await aiDescriptionService.generateDescription(restaurantData);
      setAiDescription(description);
      console.log('🤖 AI description generated successfully');
      console.log('🔍 [useAIDescription] Data passed to AI service:', {
        name: restaurantData.name,
        hasReviews: restaurantData.reviews?.length > 0,
        reviewCount: restaurantData.reviews?.length || 0,
        hasRating: restaurantData.rating !== undefined,
        rating: restaurantData.rating,
        hasEditorialSummary: !!restaurantData.editorialSummary,
        hasOpenHours: !!restaurantData.openHours,
        hasWebsite: !!restaurantData.website,
        hasPhone: !!restaurantData.phone,
        businessStatus: restaurantData.businessStatus,
        openNow: restaurantData.openNow
      });
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