import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, RotateCcw, ThumbsUp, MapPin } from 'lucide-react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useAIDescription } from '../hooks/use-ai-description';
import { useBookingIntegration } from '../hooks/use-booking-integration';
import { useContact } from '../hooks/use-contact';
import { useSavedPlaces } from '../hooks/use-saved-places';
import { BookingOptionsCard } from '../components/BookingOptionsCard';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

// Extracted components for better organization
const ErrorState = React.memo(({ onBroadenSearch, onGoHome }: { 
  onBroadenSearch: () => void; 
  onGoHome: () => void; 
}) => (
  <LinearGradient
    colors={['#C8A8E9', '#B19CD9']}
    style={styles.errorContainer}
  >
    <Stack.Screen options={{ headerShown: false }} />
    <Text style={styles.errorTitle}>No Results Found</Text>
    <Text style={styles.errorSubtitle}>
      We couldn't find any suggestions that match all your filters. Would you like to broaden your search?
    </Text>
    <TouchableOpacity style={styles.broadenButton} onPress={onBroadenSearch}>
      <Text style={styles.broadenButtonText}>Broaden Search</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
      <Text style={styles.homeButtonText}>Go Back Home</Text>
    </TouchableOpacity>
  </LinearGradient>
));

const LoadingState = React.memo(() => (
  <LinearGradient
    colors={['#C8A8E9', '#B19CD9']}
    style={styles.loadingContainer}
  >
    <Text style={styles.loadingText}>Generating suggestion...</Text>
  </LinearGradient>
));

const ImageGallery = React.memo(({ images, onImagePress }: { 
  images: string[]; 
  onImagePress: (index: number) => void; 
}) => (
  <View style={styles.imageContainer}>
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      style={styles.imageScroll}
    >
      {images.map((image, index) => (
        <TouchableOpacity key={index} onPress={() => onImagePress(index)}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
    <View style={styles.imageIndicator}>
      {images.map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
  </View>
));

const ActionButtons = React.memo(({ onPass, onRestart, onSave, retriesLeft, isSaved }: {
  onPass: () => void;
  onRestart: () => void;
  onSave: () => void;
  retriesLeft: number;
  isSaved: boolean;
}) => (
  <View style={styles.bottomActions}>
    <TouchableOpacity style={styles.actionButton} onPress={onPass}>
      <X size={24} color="#FF6B6B" />
      <Text style={styles.actionText}>Pass</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.actionButton} 
      onPress={onRestart}
    >
      <RotateCcw size={24} color="#666" />
      <Text style={styles.actionText}>Restart</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.actionButton} onPress={onSave}>
      <ThumbsUp size={24} color={isSaved ? "#FFD700" : "#4CAF50"} />
      <Text style={styles.actionText}>{isSaved ? 'Saved' : 'Save'}</Text>
    </TouchableOpacity>
  </View>
));

const ImageModal = React.memo(({ 
  visible, 
  images, 
  selectedIndex, 
  onClose, 
  reviews 
}: {
  visible: boolean;
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  reviews?: any[];
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.modalImageScroll}
            contentOffset={{ x: selectedIndex * width, y: 0 }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          
          {reviews && reviews.length > 0 && (
            <View style={styles.reviewsContainer}>
              <Text style={styles.reviewsTitle}>What people say</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.reviewsScroll}
              >
                {reviews.map((review, index) => (
                  <View key={index} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Text key={i} style={styles.star}>
                            {i < review.rating ? '★' : '☆'}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText} numberOfLines={3}>
                      "{review.text}"
                    </Text>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  </Modal>
));

export default function ResultScreen() {
  const { 
    currentSuggestion, 
    resetSuggestion, 
    generateSuggestion, 
    retriesLeft, 
    isLoading, 
    effectiveFilters, 
    openInMaps, 
    updateFilters 
  } = useAppStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // AI Description hook
  const {
    aiDescription,
    isLoading: aiLoading,
    error: aiError,
    generateDescription,
    clearDescription
  } = useAIDescription();

  // Booking Integration hook
  const {
    bookingPlatforms,
    isLoading: bookingLoading,
    error: bookingError,
    getBookingOptions,
    openBooking,
    clearBookingOptions
  } = useBookingIntegration();

  // Contact hook
  const {
    contactInfo,
    isLoading: contactLoading,
    error: contactError,
    getContactInfo,
    callContact,
    clearContactInfo
  } = useContact();

  // Saved Places hook
  const {
    savedPlaces,
    isLoading: savedLoading,
    isSaved,
    savePlace,
    removePlace,
    loadSavedPlaces,
    clearSavedPlaces
  } = useSavedPlaces();
  
  // Memoized handlers
  const handlePass = useCallback(async () => {
    console.log('🚫 Pass button pressed, generating new suggestion');
    try {
      await generateSuggestion();
    } catch (error) {
      console.error('Error generating new suggestion:', error);
    }
  }, [generateSuggestion]);

  const handleSavePlace = useCallback(async () => {
    if (currentSuggestion) {
      if (isSaved(currentSuggestion)) {
        await removePlace(currentSuggestion);
        console.log('🗑️ Removed from saved places');
      } else {
        await savePlace(currentSuggestion);
        console.log('💾 Saved to saved places');
      }
    }
  }, [currentSuggestion, isSaved, savePlace, removePlace]);

  const handleContactThem = useCallback(async () => {
    if (currentSuggestion && currentSuggestion.id) {
      // Get contact info if not already loaded
      if (!contactInfo.phoneNumber) {
        await getContactInfo(currentSuggestion.id);
      }
      
      // Call the contact if phone number is available
      if (contactInfo.phoneNumber) {
        await callContact(contactInfo.phoneNumber);
      } else {
        console.log('📞 No contact number available');
      }
    }
  }, [currentSuggestion, contactInfo.phoneNumber, getContactInfo, callContact]);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  }, []);

  const handleBroadenSearch = useCallback(async () => {
    updateFilters({ budget: null, mood: 50 });
    await generateSuggestion();
  }, [updateFilters, generateSuggestion]);

  const handleGoHome = useCallback(() => {
    console.log('🏠 Going back home from error state');
    router.replace('/');
  }, [router]);

  const handleOpenMaps = useCallback(() => {
    if (currentSuggestion) {
      openInMaps(currentSuggestion);
    }
  }, [currentSuggestion, openInMaps]);

  // Auto-generate AI description when suggestion changes
  useEffect(() => {
    if (currentSuggestion && !aiDescription && !aiLoading) {
      generateDescription(currentSuggestion);
    }
  }, [currentSuggestion, aiDescription, aiLoading, generateDescription]);

  // Auto-load booking options when suggestion changes
  useEffect(() => {
    if (currentSuggestion && bookingPlatforms.length === 0 && !bookingLoading) {
      getBookingOptions(currentSuggestion);
    }
  }, [currentSuggestion, bookingPlatforms.length, bookingLoading, getBookingOptions]);

  // Auto-load contact info when suggestion changes
  useEffect(() => {
    if (currentSuggestion && currentSuggestion.id && !contactInfo.phoneNumber && !contactLoading) {
      getContactInfo(currentSuggestion.id);
    }
  }, [currentSuggestion, contactInfo.phoneNumber, contactLoading, getContactInfo]);

  // Clear AI description when restarting
  const handleRestart = useCallback(() => {
    console.log('🔄 Restart button pressed, going back to main page');
    clearDescription();
    clearBookingOptions();
    clearContactInfo();
    resetSuggestion();
    router.replace('/');
  }, [clearDescription, clearBookingOptions, clearContactInfo, resetSuggestion, router]);

  // Memoized budget display
  const budgetDisplay = useMemo(() => {
    const budgetMap = {
      'P': '₱',
      'PP': '₱₱', 
      'PPP': '₱₱₱'
    };
    const budgetToShow = effectiveFilters?.budget || currentSuggestion?.budget || 'PP';
    return budgetMap[budgetToShow];
  }, [effectiveFilters?.budget, currentSuggestion?.budget]);

  // Show error state if no suggestion and not loading
  if (!currentSuggestion && !isLoading) {
    return <ErrorState onBroadenSearch={handleBroadenSearch} onGoHome={handleGoHome} />;
  }

  // Show loading if still generating suggestion
  if (isLoading || !currentSuggestion) {
    return <LoadingState />;
  }

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top + 8,
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ImageGallery 
          images={currentSuggestion.images} 
          onImagePress={handleImagePress} 
        />

        <View style={styles.contentCard}>
          <Text style={styles.name}>{currentSuggestion.name}</Text>
          <Text style={styles.location}>{currentSuggestion.location}</Text>
          
          <View style={styles.budgetContainer}>
            <Text style={styles.budget}>{budgetDisplay}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {currentSuggestion.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            {aiDescription || currentSuggestion.description}
          </Text>

          {/* Booking Options */}
          <BookingOptionsCard
            platforms={bookingPlatforms}
            isLoading={bookingLoading}
            error={bookingError}
            onBookingPress={(platform) => {
              if (currentSuggestion) {
                openBooking(platform, {
                  restaurantName: currentSuggestion.name,
                  location: currentSuggestion.location,
                  budget: currentSuggestion.budget
                });
              }
            }}
            restaurantName={currentSuggestion.name}
            location={currentSuggestion.location}
          />

          {currentSuggestion.discount && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>🎉 {currentSuggestion.discount}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
              <MapPin size={20} color="#8B5FBF" />
              <Text style={styles.mapButtonText}>View in Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={handleContactThem}>
              <Text style={styles.contactButtonText}>
                {contactLoading ? 'Loading...' : contactInfo.phoneNumber ? 'Contact Them Now' : 'Contact Them Now'}
              </Text>
            </TouchableOpacity>
          </View>

          <ActionButtons 
            onPass={handlePass}
            onRestart={handleRestart}
            onSave={handleSavePlace}
            retriesLeft={retriesLeft}
            isSaved={currentSuggestion ? isSaved(currentSuggestion) : false}
          />
        </View>
      </ScrollView>
      
      <Footer />
      
      <ImageModal 
        visible={imageModalVisible}
        images={currentSuggestion.images}
        selectedIndex={selectedImageIndex}
        onClose={() => setImageModalVisible(false)}
        reviews={currentSuggestion.reviews}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Error state styles
  errorContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  errorTitle: {
    color: '#FFF', 
    fontSize: 22, 
    marginBottom: 16, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  errorSubtitle: {
    color: '#FFF', 
    fontSize: 16, 
    marginBottom: 28, 
    textAlign: 'center' 
  },
  broadenButton: {
    backgroundColor: '#7DD3C0', 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 25, 
    marginBottom: 16 
  },
  broadenButtonText: {
    color: '#4A4A4A', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  homeButton: {
    backgroundColor: '#FFF', 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 25 
  },
  homeButtonText: {
    color: '#4A4A4A', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  // Loading state styles
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    color: '#FFF', 
    fontSize: 18, 
    marginBottom: 20 
  },
  // Image gallery styles
  imageContainer: {
    height: 300,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  imageScroll: {
    flex: 1,
  },
  image: {
    width: width - 32,
    height: 300,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  // Content card styles
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    marginTop: -20,
    opacity: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  budget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#4A90A4',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  discountContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  discountText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#8B5FBF',
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageScroll: {
    flex: 1,
    width: '100%',
  },
  modalImage: {
    width: width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  // Reviews styles
  reviewsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  reviewsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  reviewsScroll: {
    maxHeight: 120,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    minWidth: 250,
    maxWidth: 300,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFD700',
    fontSize: 12,
  },
  reviewText: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  reviewTime: {
    color: '#CCC',
    fontSize: 11,
    textAlign: 'right',
  },
});
