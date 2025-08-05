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
import { PlaceData } from '../utils/place-mood-service';
import { AIDescriptionCard } from '../components/AIDescriptionCard';
import { ActiveDiscountsCard } from '../components/ActiveDiscountsCard';
import { BookingOptionsCard } from '../components/BookingOptionsCard';
import { ErrorBoundary } from '../components/ErrorBoundary';

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

  // Load results on mount if none exist - fixed circular dependency
  useEffect(() => {
    console.log('🔍 Result page effect - hasAttemptedLoad:', hasAttemptedLoad, 'results.length:', results.length, 'isLoading:', isLoading, 'error:', error);
    
    // Only attempt to load if we haven't tried before and have no results
    if (!hasAttemptedLoad && results.length === 0 && !isLoading && !error) {
      console.log('🔄 No results found, triggering server-side filtering...');
      setHasAttemptedLoad(true);
      filterPlaces(filters, 5, true);
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
        const place = results[0];
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
  }, [openBooking, results]);

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
    // For now, just log - in a real implementation, this would skip to next result
    Alert.alert('Pass', 'This would skip to the next result in a full implementation');
  }, []);

  // Handle restart (go back to filters)
  const handleRestart = useCallback(() => {
    console.log('🔄 Restarting with new filters');
    router.back();
  }, [router]);

  // Search for discounts and booking options when results change
  useEffect(() => {
    if (results.length > 0 && !isLoading) {
      const firstPlace = results[0];
      searchDiscounts(firstPlace);
      getBookingOptions(firstPlace);
    }
  }, [results, isLoading, searchDiscounts, getBookingOptions]);

  // Get price display
  const getPriceDisplay = (place: PlaceData) => {
    if (!place?.price_level) return 'PP';
    const prices = ['Free', 'P', 'PP', 'PPP', 'PPPP'];
    return prices[place.price_level] || 'PP';
  };

  // Get mood display
  const getMoodDisplay = (place: PlaceData) => {
    const moodScore = place.mood_score || 50;
    const finalMood = place.final_mood || 'neutral';
    
    const moodConfig = {
      chill: { emoji: '😌', label: 'Chill' },
      neutral: { emoji: '😊', label: 'Balanced' },
      hype: { emoji: '🔥', label: 'Lively' }
    };

    return moodConfig[finalMood as keyof typeof moodConfig] || moodConfig.neutral;
  };

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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Results List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {results.map((place, index) => {
            const moodDisplay = getMoodDisplay(place);
            const hasImageError = imageErrors[place.place_id];
            const displayImage = place.photos?.medium?.[0];
            const placeIsSaved = isSaved(place);
            
            return (
              <View key={`${place.place_id}-${index}`} style={styles.placeCard}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                  {displayImage && !hasImageError ? (
                    <TouchableOpacity 
                      onPress={() => handleImagePress(place, 0)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: displayImage }}
                        style={styles.placeImage}
                        resizeMode="cover"
                        onError={() => handleImageError(place.place_id)}
                      />
                      {/* Image Counter */}
                      {place.photos && place.photos.count > 1 && (
                        <View style={styles.imageCounter}>
                          <Text style={styles.imageCounterText}>
                            1/{place.photos.count}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="location" size={32} color="#9E9E9E" />
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                  
                  {/* Save Button */}
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleSavePlace(place)}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={20}
                      color={placeIsSaved ? '#F44336' : '#FFFFFF'}
                      fill={placeIsSaved ? '#F44336' : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                  <View style={styles.headerRow}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>{getPriceDisplay(place)}</Text>
                    </View>
                  </View>

                  <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {place.rating ? place.rating.toFixed(1) : 'N/A'}
                      </Text>
                      <Text style={styles.reviewCount}>
                        ({place.user_ratings_total || 0})
                      </Text>
                    </View>
                  </View>

                  <View style={styles.moodRow}>
                    <Text style={styles.moodEmoji}>{moodDisplay.emoji}</Text>
                    <Text style={styles.moodLabel}>{moodDisplay.label}</Text>
                    <Text style={styles.moodScore}>
                      {place.mood_score || 50}/100
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* AI Description Card */}
          {results.length > 0 && (
            <AIDescriptionCard
              description={aiDescription}
              isLoading={aiLoading}
              error={aiError}
              onRetry={() => {
                if (results.length > 0) {
                  generateDescription(results[0]);
                }
              }}
              onGenerate={() => {
                if (results.length > 0) {
                  generateDescription(results[0]);
                }
              }}
            />
          )}

          {/* Active Discounts Card */}
          {results.length > 0 && (
            <ActiveDiscountsCard
              discounts={discounts}
              isLoading={discountLoading}
              error={discountError}
              onDiscountPress={handleDiscountPress}
              placeType={results[0].category as 'food' | 'activity' | 'something-new'}
              tags={results[0].types || []}
              description={results[0].editorial_summary || ''}
            />
          )}

          {/* Booking Options Card */}
          {results.length > 0 && (
            <BookingOptionsCard
              platforms={bookingPlatforms}
              isLoading={bookingLoading}
              error={bookingError}
              onBookingPress={handleBookingPress}
              restaurantName={results[0].name}
              location={results[0].address}
              placeType={results[0].category as 'food' | 'activity' | 'something-new'}
              tags={results[0].types || []}
              description={results[0].editorial_summary || ''}
            />
          )}

          {/* Load more indicator */}
          {isLoading && results.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadMoreText}>Loading more places...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Bar */}
        {results.length > 0 && (
          <View style={styles.bottomActionBar}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handlePass}
              activeOpacity={0.7}
            >
              <X size={20} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleRestart}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color="#8B5FBF" />
              <Text style={[styles.actionButtonText, { color: '#8B5FBF' }]}>Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => results.length > 0 && handleSavePlace(results[0])}
              activeOpacity={0.7}
            >
              <Heart 
                size={20} 
                color={results.length > 0 && isSaved(results[0]) ? '#F44336' : '#4CAF50'} 
                fill={results.length > 0 && isSaved(results[0]) ? '#F44336' : 'transparent'}
              />
              <Text style={[styles.actionButtonText, { color: results.length > 0 && isSaved(results[0]) ? '#F44336' : '#4CAF50' }]}>
                {results.length > 0 && isSaved(results[0]) ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
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
                  {selectedPlace.photos.medium.map((image: string, index: number) => (
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
                  {selectedPlace.photos.medium.map((_: string, index: number) => (
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
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  placeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 4,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  priceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  ratingRow: {
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 12,
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
    color: '#666',
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
  backButtonText: {
    color: '#007AFF',
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
    color: '#666',
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
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});