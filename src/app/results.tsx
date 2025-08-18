import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Text,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/store';
import { useSavedPlaces } from '../features/saved-places';
import { PlaceMoodData as PlaceData } from '../features/discovery/types';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { EnhancedPlaceCard, useGooglePlaces } from '../features/discovery';
import { Footer } from '../features/auth';


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
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);

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

  // Auto-fetch places when page loads (only if no current suggestion exists)
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
      
      // Only fetch from Google API if we don't have a current suggestion and no places loaded
      if (!currentSuggestion && places.length === 0 && !isLoading && !error) {
        console.log('🎯 Initializing places from Google API');
        const query = buildQueryFromFilters();
        const location = userLocation || { lat: 14.5176, lng: 121.0509 }; // Default to BGC
        const distanceRange = filters?.distanceRange || 10; // Default to 10km if not set
        console.log('🔍 Fetching places with query:', query, 'location:', location, 'category:', filters?.category, 'distance:', distanceRange + 'km');
        await fetchPlaces(query, location, distanceRange);
      } else if (currentSuggestion) {
        console.log('🎯 Using current suggestion from store:', currentSuggestion.name);
      }
    };

    initializePlaces();
  }, [places.length, isLoading, error, fetchPlaces, userLocation, filters?.category, buildQueryFromFilters, currentSuggestion]);

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
  }, [places, isLoading, error, currentPlaceIndex, userLocation?.lat, userLocation?.lng, filters?.category]);

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



  const handlePass = () => {
    if (places.length > 0) {
      const nextIndex = (currentPlaceIndex + 1) % places.length;
      setCurrentPlaceIndex(nextIndex);
      console.log(`🔄 Moving to next place: ${nextIndex + 1}/${places.length}`);
    }
  };

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
    } catch (error) {
      Alert.alert('Error', 'Failed to save place. Please try again.');
    }
  };

  const handleRemovePlace = async (place: PlaceData) => {
    try {
      await removePlace(place.id);
      Alert.alert('Success', 'Place removed from favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove place. Please try again.');
    }
  };

  const handleRefreshPlaces = async () => {
    setCurrentPlaceIndex(0);
    const query = buildQueryFromFilters();
    const location = userLocation || { lat: 14.5176, lng: 121.0509 };
    const distanceRange = filters?.distanceRange || 10;
    console.log('🔄 Refreshing places with query:', query, 'location:', location, 'distance:', distanceRange + 'km');
    await fetchPlaces(query, location, distanceRange);
  };

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
  };

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
  if (isLoading && places.length === 0) {
    return (
      <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Finding amazing places for you...</Text>
        </View>
        <Footer />
      </LinearGradient>
    );
  }

  // Show error state
  if (error && places.length === 0) {
    return (
      <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefreshPlaces}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </LinearGradient>
    );
  }

  // Show no results state (when API succeeds but no places found)
  if (!isLoading && !error && places.length === 0) {
    return (
      <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>🔍 No places found in your area</Text>
          <Text style={styles.errorText}>Try adjusting your distance or category preferences</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefreshPlaces}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
      {/* Place Card */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20, paddingBottom: 150 }}>
        <View style={styles.singleResultContainer}>
          {/* Places counter */}
          {places.length > 0 && (
            <View style={styles.placesCounter}>
              <Text style={styles.counterText}>
                {currentPlaceIndex + 1} of {places.length} places
              </Text>
            </View>
          )}
          
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

      {/* Footer */}
      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  singleResultContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placesCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },


});
