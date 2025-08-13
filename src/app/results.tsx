import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Settings, ArrowLeft } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { useServerFiltering } from '../features/filtering';
import { useSavedPlaces } from '../features/saved-places';
import { useDiscounts } from '../features/monetization';
import { useBookingIntegration } from '../features/booking';
import { useAIDescription } from '../features/discovery';
import { PlaceMoodData as PlaceData } from '../features/discovery/types';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { EnhancedPlaceCard } from '../features/discovery';
import { FilterFeedbackBanner, FilterRelaxationInfo, createFilterRelaxationInfo } from '../features/filtering';
import { FilterControlPanel } from '../features/filtering';
import { InstantRecommendations } from '../features/discovery';
import { Footer } from '../features/auth';

const { width: screenWidth } = Dimensions.get('window');

export default function ResultsScreen() {
  const { 
    filters,
    updateFilters,
    currentSuggestion,
    userLocation,
    isLoading: appLoading,
    generateSuggestion
  } = useAppStore();
  
  const { 
    isLoading: serverLoading, 
    results, 
    filterPlaces,
    error
  } = useServerFiltering();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Saved Places hook
  const {
    isSaved,
    savePlace,
    removePlace
  } = useSavedPlaces();



  // State management
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterRelaxationInfo, setFilterRelaxationInfo] = useState<FilterRelaxationInfo | undefined>();
  const [showBanner, setShowBanner] = useState(false);
  const [showInstantRecommendations, setShowInstantRecommendations] = useState(false);

  const isLoading = appLoading || serverLoading;

  // Show instant recommendations if no current suggestion
  useEffect(() => {
    setShowInstantRecommendations(!currentSuggestion && !isLoading);
  }, [currentSuggestion, isLoading]);

  // Load results on mount if none exist
  useEffect(() => {
    if (!hasAttemptedLoad && results.length === 0 && !isLoading && !error) {
      setHasAttemptedLoad(true);
      filterPlaces(filters, 5, true);
    } else if (results.length > 0) {
      setHasAttemptedLoad(true);
    }
  }, [hasAttemptedLoad, results.length, isLoading, error, filters, filterPlaces]);

  // Mock function to simulate progressive filtering results
  const simulateProgressiveFiltering = () => {
    const relaxedFilters = ['mood', 'budget'];
    const originalFilters = Object.keys(filters).filter(key => filters[key as keyof typeof filters] !== null);
    
    const relaxationInfo = createFilterRelaxationInfo(
      relaxedFilters,
      originalFilters,
      "We couldn't find places matching all your preferences, but here are some great options nearby!"
    );
    
    setFilterRelaxationInfo(relaxationInfo);
    setShowBanner(true);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
    setShowBanner(false);
  };

  const handleResetFilters = () => {
    updateFilters({
      mood: 50,
      distanceRange: 10  // Changed from 50 to 10
    });
    setShowBanner(false);
    setFilterRelaxationInfo(undefined);
  };

  const handleRetryStrict = () => {
    setShowBanner(false);
    generateSuggestion();
  };

  const handlePlaceSelect = (place: PlaceData) => {
    router.push('/results');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefreshRecommendations = () => {
    console.log('Refreshing recommendations...');
  };

  const handlePass = () => {
    if (currentResultIndex < results.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
    } else {
      // If we've gone through all results, show no more results
      setCurrentResultIndex(0);
    }
  };

  const handleRestart = () => {
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

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
  };

  // Render loading state
  if (isLoading && results.length === 0) {
    return (
      <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Finding perfect places for you...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Render error state
  if (error && results.length === 0) {
    return (
      <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => filterPlaces(filters, 5, true)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalBackButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Render results
  return (
    <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={containerStyle}>


      {/* Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterPanel(true)}>
          <Settings size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Feedback Banner */}
      {showBanner && filterRelaxationInfo && (
        <FilterFeedbackBanner
          relaxationInfo={filterRelaxationInfo}
          onDismiss={() => setShowBanner(false)}
          onRetryStrict={handleRetryStrict}
          visible={true}
        />
      )}

      {/* Results Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20 }}>
        {results.length > 0 && results[currentResultIndex] ? (
          <View style={styles.singleResultContainer}>
            <ErrorBoundary componentName={`PlaceCard-${currentResultIndex}`}>
              <EnhancedPlaceCard
                place={results[currentResultIndex]!}
                onPress={() => handlePlaceSelect(results[currentResultIndex]!)}
                onSave={() => handleSavePlace(results[currentResultIndex]!)}
                onRemove={() => handleRemovePlace(results[currentResultIndex]!)}
                isSaved={isSaved(results[currentResultIndex]!.id)}
                showFullDetails={true}
                showRemoveButton={false}
                onPass={handlePass}
                onRestart={handleRestart}
              />
            </ErrorBoundary>
            

          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No places found</Text>
            <Text style={styles.noResultsMessage}>
              Try adjusting your filters or expanding your search area
            </Text>
            <TouchableOpacity style={styles.progressiveFilterButton} onPress={simulateProgressiveFiltering}>
              <Text style={styles.progressiveFilterButtonText}>Try Progressive Filtering</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <Footer />

      {/* Filter Control Panel Modal */}
      <FilterControlPanel
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        showAsModal={true}
      />

      {/* Instant Recommendations Modal */}
      {showInstantRecommendations && (
        <InstantRecommendations
          onPlaceSelect={handlePlaceSelect}
          onRefresh={handleRefreshRecommendations}
          {...(userLocation && { userLocation })}
          maxRecommendations={10}
        />
      )}

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedPlace && (
            <Image
              source={{ uri: selectedPlace.photos?.medium?.[selectedImageIndex] || selectedPlace.photos?.thumbnail?.[0] || selectedPlace.images?.[0] }}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  filterButton: {
    padding: 8,
  },
  filterButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#8B5FBF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  singleResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noResultsMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressiveFilterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  progressiveFilterButtonText: {
    color: '#8B5FBF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  imageModalImage: {
    width: screenWidth,
    height: screenWidth,
  },
});
