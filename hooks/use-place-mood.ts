import { useState, useCallback, useRef } from 'react';
import { PlaceMoodService, PlaceData, type MoodConfig } from '@/utils/place-mood-service';

interface UsePlaceMoodOptions {
  googlePlacesApiKey: string;
  googleCloudCredentials?: any;
}

interface UsePlaceMoodReturn {
  // State
  isLoading: boolean;
  error: string | null;
  places: PlaceData[];
  moodStats: {
    total: number;
    chill: number;
    neutral: number;
    hype: number;
    averageScore: number;
  } | null;

  // Actions
  enhanceSinglePlace: (placeId: string) => Promise<PlaceData | null>;
  enhanceMultiplePlaces: (placeIds: string[]) => Promise<PlaceData[]>;
  clearPlaces: () => void;
  clearError: () => void;
  
  // Utilities
  getMoodCategory: (score: number) => 'chill' | 'neutral' | 'hype';
  getRandomMoodLabel: (category: 'chill' | 'neutral' | 'hype') => string;
}

export const usePlaceMood = (options: UsePlaceMoodOptions): UsePlaceMoodReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [moodStats, setMoodStats] = useState<UsePlaceMoodReturn['moodStats']>(null);

  // Create service instance (memoized)
  const serviceRef = useRef<PlaceMoodService | null>(null);
  
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new PlaceMoodService(
        options.googlePlacesApiKey,
        options.googleCloudCredentials
      );
    }
    return serviceRef.current;
  }, [options.googlePlacesApiKey, options.googleCloudCredentials]);

  // Update mood statistics
  const updateMoodStats = useCallback((placesData: PlaceData[]) => {
    if (placesData.length === 0) {
      setMoodStats(null);
      return;
    }

    const service = getService();
    const stats = service.getMoodStatistics(placesData);
    setMoodStats(stats);
  }, [getService]);

  // Enhance a single place
  const enhanceSinglePlace = useCallback(async (placeId: string): Promise<PlaceData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🚀 Starting mood enhancement for place: ${placeId}`);
      
      const service = getService();
      const enhancedPlace = await service.enhancePlaceWithMood(placeId);
      
      // Add to places array
      setPlaces(prevPlaces => {
        const existingIndex = prevPlaces.findIndex(p => p.place_id === placeId);
        let newPlaces: PlaceData[];
        
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
  const enhanceMultiplePlaces = useCallback(async (placeIds: string[]): Promise<PlaceData[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🚀 Starting batch mood enhancement for ${placeIds.length} places`);
      
      const service = getService();
      const enhancedPlaces = await service.enhanceMultiplePlaces(placeIds);
      
      // Update places array
      setPlaces(prevPlaces => {
        const newPlaces = [...prevPlaces];
        
        enhancedPlaces.forEach(enhancedPlace => {
          const existingIndex = newPlaces.findIndex(p => p.place_id === enhancedPlace.place_id);
          
          if (existingIndex >= 0) {
            // Update existing place
            newPlaces[existingIndex] = enhancedPlace;
          } else {
            // Add new place
            newPlaces.push(enhancedPlace);
          }
        });
        
        // Update stats
        updateMoodStats(newPlaces);
        
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
    const MOOD_LABELS: MoodConfig = {
      chill: ['Relaxed', 'Low-Key', 'Cozy', 'Mellow', 'Calm'],
      neutral: ['Balanced', 'Standard', 'Casual', 'Average', 'Steady'],
      hype: ['Vibrant', 'Lively', 'Buzzing', 'Energetic', 'Electric']
    };
    
    const labels = MOOD_LABELS[category];
    return labels[Math.floor(Math.random() * labels.length)];
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
    clearPlaces,
    clearError,

    // Utilities
    getMoodCategory,
    getRandomMoodLabel
  };
};

// Additional hook for mood filtering and searching
export const useMoodFiltering = (places: PlaceData[]) => {
  const [moodFilter, setMoodFilter] = useState<'all' | 'chill' | 'neutral' | 'hype'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = places.filter(place => {
    // Apply mood filter
    if (moodFilter !== 'all' && place.mood_score !== undefined) {
      const category = place.mood_score >= 70 ? 'hype' : 
                     place.mood_score <= 30 ? 'chill' : 'neutral';
      if (category !== moodFilter) return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query) ||
        place.final_mood?.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query)
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