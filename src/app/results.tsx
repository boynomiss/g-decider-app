import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert
} from 'react-native';
import { ResultsLayout } from '@/components/results/ResultsLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/store';
import { useSavedPlaces } from '../features/saved-places';
import { PlaceMoodData as PlaceData } from '../features/discovery/types';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { EnhancedPlaceCard, useGooglePlaces } from '../features/discovery';

import { LoadingState, ErrorState, EmptyState } from '../components/results/ResultStates';


export default function ResultsScreen() {
  const { 
    currentSuggestion,
    setCurrentSuggestion,
    resetSuggestion,
    userLocation,
    filters
  } = useAppStore();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    isSaved,
    savePlace,
    removePlace
  } = useSavedPlaces();

  // Use Google Places API hook
  const {
    places,
    isLoading,
    error,
    fetchPlaces,
    clearPlaces
  } = useGooglePlaces();

  // State for current place index
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState<number>(0);
  // Track first-pass initialization to avoid flashing EmptyState on initial render
  const [initialized, setInitialized] = useState<boolean>(false);

  // Mock place as fallback
  const mockPlace = {
    id: 'mock-place-1',
    name: 'Test Restaurant',
    location: '123 Test Street, Test City',
    images: ['https://via.placeholder.com/300x200/8B5FBF/FFFFFF?text=Test+Place'],
    budget: 'P' as const,
    tags: ['restaurant', 'food', 'test'],
    description: 'This is a test place to verify that action buttons are working correctly.',
    openHours: 'Open 9 AM - 10 PM',
    category: 'food' as const,
    mood: 'neutral' as const,
    socialContext: ['solo', 'with-bae', 'barkada'] as const,
    timeOfDay: ['morning', 'afternoon', 'night'] as const,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    rating: 4.5,
    reviewCount: 100,
    reviews: 100,
    website: 'https://example.com',
    phone: '+1-555-0123'
  };

  // Build query based on user filters
  const buildQueryFromFilters = useCallback(() => {
    if (!filters.category) return 'restaurants cafes bars';
    
    switch (filters.category) {
      case 'food':
        return 'restaurants cafes bars food';
      case 'activity':
        return 'parks museums attractions activities';
      case 'something-new':
        return 'shopping malls libraries bookstores attractions';
      default:
        return 'restaurants cafes bars';
    }
  }, [filters.category]);

  // Auto-fetch places when page loads
  useEffect(() => {
    const initializePlaces = async () => {
      console.log('🎯 initializePlaces called:', {
        placesLength: places.length,
        isLoading,
        error,
        userLocation,
        filters: filters?.category,
        hasCurrentSuggestion: !!currentSuggestion
      });
      
      // Always fetch fresh places when filters change or when no places are loaded
      // This ensures the G! button always gives fresh results
      if ((!currentSuggestion || places.length === 0) && !isLoading && !error) {
        console.log('🎯 Initializing places from Google API');
        const query = buildQueryFromFilters();
        const location = userLocation || { lat: 14.5176, lng: 121.0509 }; // Default to BGC
        const distanceRange = filters?.distanceRange || 10; // Default to 10km if not set
        console.log('🔍 Fetching places with query:', query, 'location:', location, 'category:', filters?.category, 'distance:', distanceRange + 'km');
        await fetchPlaces(query, location, distanceRange);
      } else if (currentSuggestion && places.length > 0) {
        console.log('🎯 Using current suggestion from store:', currentSuggestion.name);
      } else if (currentSuggestion && places.length === 0) {
        console.log('🎯 Has current suggestion but no places - fetching fresh results');
        const query = buildQueryFromFilters();
        const location = userLocation || { lat: 14.5176, lng: 121.0509 };
        const distanceRange = filters?.distanceRange || 10;
        await fetchPlaces(query, location, distanceRange);
      }
      setInitialized(true);
    };

    initializePlaces();
  }, [places.length, isLoading, error, fetchPlaces, userLocation, filters?.category, filters?.distanceRange, buildQueryFromFilters, currentSuggestion]);

  // Track previous filter values to prevent unnecessary refreshes
  const prevFiltersRef = useRef<typeof filters | undefined>(undefined);
  
  // Watch for filter changes and refresh places automatically
  useEffect(() => {
    const handleFilterChange = async () => {
      // Only proceed if we have filters and we're initialized
      if (!initialized || !filters?.category) return;
      
      // Check if filters actually changed by comparing with previous values
      const prevFilters = prevFiltersRef.current;
      const hasChanged = !prevFilters || 
        prevFilters.category !== filters.category ||
        prevFilters.mood !== filters.mood ||
        prevFilters.budget !== filters.budget ||
        prevFilters.socialContext !== filters.socialContext ||
        prevFilters.timeOfDay !== filters.timeOfDay ||
        prevFilters.distanceRange !== filters.distanceRange;
      
      if (!hasChanged) return;
      
      console.log('🔄 Filter change detected, refreshing places for category:', filters.category);
      
      // Clear existing places and suggestion to force fresh results
      clearPlaces();
      setCurrentPlaceIndex(0);
      resetSuggestion();
      
      // Fetch new places based on updated filters
      const query = buildQueryFromFilters();
      const location = userLocation || { lat: 14.5176, lng: 121.0509 };
      const distanceRange = filters.distanceRange || 10;
      
      console.log('🔍 Refreshing places with new filters - query:', query, 'category:', filters.category, 'distance:', distanceRange + 'km');
      await fetchPlaces(query, location, distanceRange);
      
      // Update the previous filters reference
      prevFiltersRef.current = { ...filters };
    };

    handleFilterChange();
  }, [filters?.category, filters?.mood, filters?.budget, filters?.socialContext, filters?.timeOfDay, filters?.distanceRange, initialized, clearPlaces, setCurrentPlaceIndex, resetSuggestion, buildQueryFromFilters, userLocation, fetchPlaces]);

  // Debug logging for places state
  useEffect(() => {
    console.log('🔍 Places state debug:', {
      placesCount: places.length,
      isLoading,
      error,
      currentPlaceIndex,
      userLocation: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Not set',
      category: filters?.category,
      placesData: places.slice(0, 2) // Log first 2 places
    });
  }, [places, isLoading, error, currentPlaceIndex, userLocation, filters?.category]);

  // Auto-set current suggestion when places are loaded (only if no current suggestion exists)
  useEffect(() => {
    if (!currentSuggestion && places.length > 0 && currentPlaceIndex < places.length) {
      const currentPlace = places[currentPlaceIndex];
      if (currentPlace && setCurrentSuggestion) {
        console.log('🎯 Setting current suggestion from Google API:', currentPlace.name);
        setCurrentSuggestion(currentPlace as any);
      }
    }
  }, [places, currentPlaceIndex, setCurrentSuggestion, currentSuggestion]);



  const handlePass = useCallback(() => {
    if (places.length === 0) {
      console.log('⚠️ handlePass called but no places available');
      return;
    }
    const nextIndex = (currentPlaceIndex + 1) % places.length;
    setCurrentPlaceIndex(nextIndex);
    const nextPlace = places[nextIndex];
    if (nextPlace && setCurrentSuggestion) {
      setCurrentSuggestion(nextPlace as any);
      console.log(`🔄 Moving to next place: ${nextIndex + 1}/${places.length} → ${nextPlace?.name ?? 'Unknown'}`);
    } else {
      console.log(`🔄 Moving to next place index only: ${nextIndex + 1}/${places.length}`);
    }
  }, [places, currentPlaceIndex, setCurrentSuggestion]);

  const handleRestart = () => {
    clearPlaces();
    setCurrentPlaceIndex(0);
    resetSuggestion(); // Clear the current suggestion when restarting
    router.push('/home');
  };



  const handleSavePlace = async (place: PlaceData) => {
    try {
      await savePlace(place);
      Alert.alert('Success', 'Place saved to your favorites!');
    } catch (_e) {
      Alert.alert('Error', 'Failed to save place. Please try again.');
    }
  };

  const handleRemovePlace = async (place: PlaceData) => {
    try {
      await removePlace(place.id);
      Alert.alert('Success', 'Place removed from favorites!');
    } catch (_e) {
      Alert.alert('Error', 'Failed to remove place. Please try again.');
    }
  };

  const handleRefreshPlaces = async () => {
    console.log('🔄 Force refreshing places for fresh results');
    clearPlaces();
    setCurrentPlaceIndex(0);
    resetSuggestion(); // Clear the current suggestion to force fresh results
    
    const query = buildQueryFromFilters();
    const location = userLocation || { lat: 14.5176, lng: 121.0509 };
    const distanceRange = filters?.distanceRange || 10;
    console.log('🔄 Refreshing places with query:', query, 'location:', location, 'distance:', distanceRange + 'km');
    await fetchPlaces(query, location, distanceRange);
  };

  const topInset = insets.top;

  // Determine which place to show - prioritize current suggestion from store
  const placeToShow = currentSuggestion || 
    (places.length > 0 && currentPlaceIndex < places.length && places[currentPlaceIndex]
      ? places[currentPlaceIndex] 
      : mockPlace);

  // Debug logging for placeToShow
  useEffect(() => {
    console.log('🔍 placeToShow debug:', {
      name: placeToShow?.name,
      type: typeof placeToShow,
      hasName: !!placeToShow?.name,
      isFromGoogle: places.length > 0 && currentPlaceIndex < places.length,
      currentIndex: currentPlaceIndex,
      totalPlaces: places.length,
      placeData: placeToShow
    });
  }, [placeToShow, places, currentPlaceIndex]);

  // Show loading state
  if ((!initialized) || (isLoading && places.length === 0)) {
    return (
      <ResultsLayout topInset={topInset}>
        <LoadingState testID="results-loading" />
      </ResultsLayout>
    );
  }

  // Show error state
  if (error && places.length === 0) {
    return (
      <ResultsLayout topInset={topInset}>
        <ErrorState message={String(error)} onRetry={handleRefreshPlaces} testID="results-error" />
      </ResultsLayout>
    );
  }

  // Show no results state (when API succeeds but no places found)
  if (!isLoading && !error && places.length === 0) {
    return (
      <ResultsLayout topInset={topInset}>
        <EmptyState onRetry={handleRefreshPlaces} testID="results-empty" />
      </ResultsLayout>
    );
  }

  return (
    <ResultsLayout topInset={topInset}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 200 }}>
        <View style={styles.singleResultContainer}>
          <ErrorBoundary componentName="PlaceCard">
            <EnhancedPlaceCard
              place={placeToShow as any}
              onPress={() => console.log('Place pressed')}
              onSave={() => {
                console.log('🎯 Results: Save callback triggered');
                handleSavePlace(placeToShow as any);
              }}
              onRemove={() => {
                console.log('🎯 Results: Remove callback triggered');
                handleRemovePlace(placeToShow as any);
              }}
              isSaved={isSaved(placeToShow.id)}
              showFullDetails={true}
              showRemoveButton={false}
              onPass={() => {
                console.log('🎯 Results: Pass callback triggered');
                handlePass();
              }}
              onRestart={() => {
                console.log('🎯 Results: Restart callback triggered');
                handleRestart();
              }}
            />
          </ErrorBoundary>
        </View>
      </ScrollView>
    </ResultsLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  singleResultContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
