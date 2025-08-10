import { useState, useCallback, useRef } from 'react';
import { 
  PlaceMoodData, 
  MoodConfig 
} from '../types/filtering';
import { createPlaceMoodService } from '../utils/filtering/mood/mood-service-factory';

interface UsePlaceMoodOptions {
  googlePlacesApiKey: string;
  googleCloudCredentials?: string;
  config?: Partial<MoodConfig>;
}

interface UsePlaceMoodReturn {
  places: PlaceMoodData[];
  moodStats: {
    total: number;
    chill: number;
    neutral: number;
    hype: number;
    averageScore: number;
    averageConfidence: number;
  } | null;
  enhanceSinglePlace: (placeId: string) => Promise<PlaceMoodData | null>;
  enhanceMultiplePlaces: (placeIds: string[]) => Promise<PlaceMoodData[]>;
  updateMoodStats: (placesData: PlaceMoodData[]) => void;
  isLoading: boolean;
  error: string | null;
  clearPlaces: () => void;
  clearError: () => void;
  getMoodCategory: (score: number) => 'chill' | 'neutral' | 'hype';
  getRandomMoodLabel: (category: 'chill' | 'neutral' | 'hype') => string;
}

export const usePlaceMood = (options: UsePlaceMoodOptions): UsePlaceMoodReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceMoodData[]>([]);
  const [moodStats, setMoodStats] = useState<UsePlaceMoodReturn['moodStats']>(null);

  // Create service instance (memoized)
  const serviceRef = useRef<any | null>(null); // Changed to any as PlaceMoodService is removed
  
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = createPlaceMoodService(
        options.googlePlacesApiKey,
        options.googleCloudCredentials
      );
    }
    return serviceRef.current;
  }, [options.googlePlacesApiKey, options.googleCloudCredentials]);

  // Update mood statistics
  const updateMoodStats = useCallback((placesData: PlaceMoodData[]) => {
    if (!serviceRef.current) return;
    
    try {
      const stats = serviceRef.current.getMoodStatistics(placesData);
      setMoodStats(stats);
    } catch (error) {
      console.error('Error updating mood stats:', error);
    }
  }, []);

  // Enhance a single place
  const enhanceSinglePlace = useCallback(async (placeId: string): Promise<PlaceMoodData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🚀 Starting mood enhancement for place: ${placeId}`);
      
      const service = getService();
      const enhancedPlace = await service.enhancePlaceWithMood(placeId);
      
      // Add to places array
      setPlaces(prevPlaces => {
        const existingIndex = prevPlaces.findIndex(p => p.place_id === placeId);
        let newPlaces: PlaceMoodData[];
        
        if (existingIndex >= 0) {
          // Update existing place
          newPlaces = [...prevPlaces];
          newPlaces[existingIndex] = enhancedPlace;
        } else {
          // Add new place
          newPlaces = [...prevPlaces, enhancedPlace];
        }
        
        // Update stats
        updateMoodStats(newPlaces);
        
        return newPlaces;
      });

      console.log(`✅ Successfully enhanced place: ${enhancedPlace.name} - ${enhancedPlace.final_mood}`);
      return enhancedPlace;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance place';
      console.error(`❌ Error enhancing place ${placeId}:`, errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getService, updateMoodStats]);

  // Enhance multiple places
  const enhanceMultiplePlaces = useCallback(async (placeIds: string[]): Promise<PlaceMoodData[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🚀 Starting batch mood enhancement for ${placeIds.length} places`);
      
      const service = getService();
      const enhancedPlaces = await service.enhanceMultiplePlaces(placeIds);
      
      // Update places array
      setPlaces(prevPlaces => {
        const newPlaces = [...prevPlaces];
        
        enhancedPlaces.forEach((enhancedPlace: PlaceMoodData) => {
          if (enhancedPlace.mood_analysis) {
            setMoodStats(prev => {
              if (!prev) return {
                total: 1,
                chill: enhancedPlace.mood_analysis!.category === 'chill' ? 1 : 0,
                neutral: enhancedPlace.mood_analysis!.category === 'neutral' ? 1 : 0,
                hype: enhancedPlace.mood_analysis!.category === 'hype' ? 1 : 0,
                averageScore: enhancedPlace.mood_analysis!.score,
                averageConfidence: enhancedPlace.mood_analysis!.confidence
              };
              
              const newTotal = prev.total + 1;
              const newChill = prev.chill + (enhancedPlace.mood_analysis!.category === 'chill' ? 1 : 0);
              const newNeutral = prev.neutral + (enhancedPlace.mood_analysis!.category === 'neutral' ? 1 : 0);
              const newHype = prev.hype + (enhancedPlace.mood_analysis!.category === 'hype' ? 1 : 0);
              const newAverageScore = ((prev.averageScore * prev.total) + enhancedPlace.mood_analysis!.score) / newTotal;
              const newAverageConfidence = ((prev.averageConfidence * prev.total) + enhancedPlace.mood_analysis!.confidence) / newTotal;
              
              return {
                total: newTotal,
                chill: newChill,
                neutral: newNeutral,
                hype: newHype,
                averageScore: newAverageScore,
                averageConfidence: newAverageConfidence
              };
            });
          }
        });
        
        return newPlaces;
      });

      console.log(`✅ Successfully enhanced ${enhancedPlaces.length} places`);
      return enhancedPlaces;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance places';
      console.error(`❌ Error enhancing places:`, errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getService, updateMoodStats]);

  // Clear all places
  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setMoodStats(null);
    console.log('🧹 Cleared all places and mood statistics');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utility functions
  const getMoodCategory = useCallback((score: number): 'chill' | 'neutral' | 'hype' => {
    if (score >= 70) return 'hype';
    if (score <= 30) return 'chill';
    return 'neutral';
  }, []);

  const getRandomMoodLabel = useCallback((category: 'chill' | 'neutral' | 'hype'): string => {
    const MOOD_LABELS = {
      chill: ['Relaxed', 'Low-Key', 'Cozy', 'Mellow', 'Calm'],
      neutral: ['Balanced', 'Standard', 'Casual', 'Average', 'Steady'],
      hype: ['Vibrant', 'Lively', 'Buzzing', 'Energetic', 'Electric']
    };
    
    const labels = MOOD_LABELS[category];
    if (!labels || labels.length === 0) return 'Unknown';
    return labels[Math.floor(Math.random() * labels.length)] || 'Unknown';
  }, []);

  return {
    // State
    isLoading,
    error,
    places,
    moodStats,

    // Actions
    enhanceSinglePlace,
    enhanceMultiplePlaces,
    updateMoodStats,
    clearPlaces,
    clearError,

    // Utilities
    getMoodCategory,
    getRandomMoodLabel
  };
};

// Additional hook for mood filtering and searching
export const useMoodFiltering = (places: PlaceMoodData[]) => {
  const [moodFilter, setMoodFilter] = useState<'all' | 'chill' | 'neutral' | 'hype'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = places.filter(place => {
    // Apply mood filter
    if (moodFilter !== 'all' && place.mood_score !== undefined && place.mood_score !== null) {
      const category = place.mood_score >= 70 ? 'hype' : 
                     place.mood_score <= 30 ? 'chill' : 'neutral';
      if (category !== moodFilter) return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (place.name && place.name.toLowerCase().includes(query)) ||
        (place.address && place.address.toLowerCase().includes(query)) ||
        place.final_mood?.toLowerCase().includes(query) ||
        (place.category && place.category.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return {
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    filteredPlaces,
    totalResults: filteredPlaces.length
  };
};