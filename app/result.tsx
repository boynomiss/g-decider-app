import React, { useState, useCallback, useEffect } from 'react';
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
import { Heart, ArrowLeft, RotateCcw, X } from 'lucide-react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useServerFiltering } from '../hooks/use-server-filtering';
import { useAIDescription } from '../hooks/use-ai-description';
import { useDiscounts } from '../hooks/use-discounts';
import { useBookingIntegration } from '../hooks/use-booking-integration';
import { useSavedPlaces } from '../hooks/use-saved-places';
import { PlaceData } from '../utils/filtering/mood';
import { AIDescriptionCard } from '../components/AIDescriptionCard';
import { ActiveDiscountsCard } from '../components/ActiveDiscountsCard';
import { BookingOptionsCard } from '../components/BookingOptionsCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import EnhancedPlaceCard from '../components/EnhancedPlaceCard';

const { width: screenWidth } = Dimensions.get('window');

export default function ResultScreen() {
  const { 
    filters, 
    retriesLeft, 
    effectiveFilters
  } = useAppStore();
  
  const { 
    isLoading, 
    error, 
    results, 
    performance, 
    metadata,
    filterPlaces,
    clearResults,
    clearError
  } = useServerFiltering();
  
  console.log('🔍 ResultScreen render - isLoading:', isLoading, 'results.length:', results.length, 'error:', error, 'performance:', performance);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Saved Places hook
  const {
    savedPlaces,
    isSaved,
    savePlace,
    removePlace,
    isLoading: savedPlacesLoading
  } = useSavedPlaces();
  
  // AI Description hook
  const {
    aiDescription,
    isLoading: aiLoading,
    error: aiError,
    generateDescription,
    clearDescription
  } = useAIDescription();

  // Discounts hook
  const {
    discounts,
    isLoading: discountLoading,
    error: discountError,
    searchDiscounts,
    openDiscount,
    clearDiscounts
  } = useDiscounts();

  // Booking Integration hook
  const {
    bookingPlatforms,
    isLoading: bookingLoading,
    error: bookingError,
    getBookingOptions,
    openBooking,
    clearBookingOptions
  } = useBookingIntegration();

  // Image modal state
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Track if we've already attempted to load results
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Track current result index for single result display
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Load results on mount if none exist - fixed circular dependency
  useEffect(() => {
    console.log('🔍 Result page effect - hasAttemptedLoad:', hasAttemptedLoad, 'results.length:', results.length, 'isLoading:', isLoading, 'error:', error);
    
    // Only attempt to load if we haven't tried before and have no results
    // AND if we're not currently loading (which means we came from the home page)
    if (!hasAttemptedLoad && results.length === 0 && !isLoading && !error) {
      console.log('🔄 No results found and not loading, triggering server-side filtering...');
      setHasAttemptedLoad(true);
      filterPlaces(filters, 5, true);
    } else if (results.length > 0) {
      console.log('✅ Results already available, no need to trigger filtering');
      setHasAttemptedLoad(true);
    }
  }, [hasAttemptedLoad, results.length, isLoading, error, filters]);

  // Reset attempt flag when filters change
  useEffect(() => {
    setHasAttemptedLoad(false);
  }, [filters]);

  // Handle retry with different filters
  const handleRetry = useCallback(async () => {
    console.log('🔄 Retrying with current filters...');
    clearResults();
    clearError();
    setHasAttemptedLoad(false); // Reset attempt flag for retry
    await filterPlaces(filters, 5, true);
  }, [filters, filterPlaces, clearResults, clearError]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    console.log('⬅️ Going back to home screen');
    router.back();
  }, [router]);

  // Handle image press to open modal
  const handleImagePress = useCallback((place: PlaceData, imageIndex: number = 0) => {
    setSelectedPlace(place);
    setSelectedImageIndex(imageIndex);
    setImageModalVisible(true);
  }, []);

  // Handle image modal close
  const handleImageModalClose = useCallback(() => {
    setImageModalVisible(false);
    setSelectedPlace(null);
    setSelectedImageIndex(0);
  }, []);

  // Handle image scroll in modal
  const handleImageScroll = useCallback((event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setSelectedImageIndex(Math.round(index));
  }, []);

  // Handle image error
  const handleImageError = useCallback((placeId: string) => {
    setImageErrors(prev => ({ ...prev, [placeId]: true }));
  }, []);

  // Handle discount press
  const handleDiscountPress = useCallback(async (discount: any) => {
    try {
      const success = await openDiscount(discount);
      if (success) {
        console.log('✅ Successfully opened discount');
      } else {
        console.log('❌ Failed to open discount');
      }
    } catch (error) {
      console.error('❌ Error opening discount:', error);
    }
  }, [openDiscount]);

  // Handle booking press
  const handleBookingPress = useCallback(async (platform: any) => {
    try {
      if (results.length > 0) {
        const place = results[currentResultIndex];
        const success = await openBooking(platform, {
          restaurantName: place.name,
          location: place.address,
          cuisine: place.types?.[0],
          budget: place.price_level === 1 ? 'P' : place.price_level === 2 ? 'PP' : 'PPP'
        });
        if (success) {
          console.log('✅ Successfully opened booking');
        } else {
          console.log('❌ Failed to open booking');
        }
      }
    } catch (error) {
      console.error('❌ Error opening booking:', error);
    }
  }, [openBooking, results, currentResultIndex]);

  // Handle save place
  const handleSavePlace = useCallback(async (place: PlaceData) => {
    try {
      if (isSaved(place)) {
        await removePlace(place);
        console.log('🗑️ Removed place from saved places');
      } else {
        await savePlace(place);
        console.log('💾 Saved place to saved places');
      }
    } catch (error) {
      console.error('❌ Error saving/removing place:', error);
    }
  }, [isSaved, savePlace, removePlace]);

  // Handle pass (skip current result)
  const handlePass = useCallback(() => {
    console.log('⏭️ Passing current result');
    if (currentResultIndex < results.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
    } else {
      // No more results, show message
      Alert.alert('No More Results', 'You\'ve seen all available results. Try adjusting your filters for more options.');
    }
  }, [currentResultIndex, results.length]);

  // Handle next result
  const handleNext = useCallback(() => {
    if (currentResultIndex < results.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
    }
  }, [currentResultIndex, results.length]);

  // Handle previous result
  const handlePrevious = useCallback(() => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1);
    }
  }, [currentResultIndex]);

  // Handle restart (go back to filters)
  const handleRestart = useCallback(() => {
    console.log('🔄 Restarting with new filters');
    router.back();
  }, [router]);

  // Search for discounts and booking options when results change
  useEffect(() => {
    if (results.length > 0 && !isLoading) {
      const currentPlace = results[currentResultIndex];
      searchDiscounts(currentPlace);
      getBookingOptions(currentPlace);
      generateDescription(currentPlace);
    }
  }, [results, isLoading, currentResultIndex, searchDiscounts, getBookingOptions, generateDescription]);



  if (isLoading && results.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding perfect places for you...</Text>
        </View>
      </View>
    );
  }

  if (error && results.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >


        {/* Place Details Container */}
        {results.length > 0 && (
          <View style={styles.placeDetailsContainer}>
            <EnhancedPlaceCard
              key={`${results[currentResultIndex].place_id}-${currentResultIndex}`}
              place={results[currentResultIndex]}
              onPress={() => handleImagePress(results[currentResultIndex], 0)}
              onSave={() => handleSavePlace(results[currentResultIndex])}
              onPass={handlePass}
              onRestart={handleRestart}
              isSaved={isSaved(results[currentResultIndex])}
              showFullDetails={true}
              showRemoveButton={false}
            />

          </View>
        )}

        {/* Image Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleImageModalClose}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={handleImageModalClose}
            />
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleImageModalClose}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              {selectedPlace && selectedPlace.photos?.medium && (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleImageScroll}
                  scrollEventThrottle={16}
                  style={styles.imageScrollView}
                >
                  {selectedPlace.photos.medium.slice(0, 5).map((image: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  ))}
                </ScrollView>
              )}
              
              {/* Carousel Indicators */}
              {selectedPlace?.photos?.medium && selectedPlace.photos.medium.length > 1 && (
                <View style={styles.carouselIndicators}>
                  {selectedPlace.photos.medium.slice(0, 5).map((_: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.indicatorDot,
                        index === selectedImageIndex && styles.activeIndicatorDot
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },


  placeDetailsContainer: {
    flex: 1,
    // Remove paddingHorizontal: 16 since EnhancedPlaceCard has marginHorizontal: 16
    // Remove paddingTop: 20 since EnhancedPlaceCard has marginVertical: 8
    // Remove justifyContent: 'space-between' since we removed the action buttons
  },


  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#4A4A4A',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A4A4A',
  },
  // Image Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  imageScrollView: {
    flex: 1,
    width: screenWidth,
  },
  modalImage: {
    width: screenWidth,
    height: '100%',
  },
  carouselIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicatorDot: {
    backgroundColor: 'white',
  },
  // Bottom Action Bar Styles




});