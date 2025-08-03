import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, RotateCcw, ThumbsUp, MapPin, Phone, Globe, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useAIDescription } from '../hooks/use-ai-description';
import { useBookingIntegration } from '../hooks/use-booking-integration';
import { useContact } from '../hooks/use-contact';
import { useSavedPlaces } from '../hooks/use-saved-places';
import { useDiscounts } from '../hooks/use-discounts';
import { BookingOptionsCard } from '../components/BookingOptionsCard';
import { ActiveDiscountsCard } from '../components/ActiveDiscountsCard';
import Footer from '../components/Footer';
import { FilteringProgress } from '../components/FilteringProgress';

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

// Enhanced loading state with filtering progress
const EnhancedLoadingState = React.memo(({ filters }: { filters: any }) => (
  <FilteringProgress filters={filters} />
));

// Distance expansion loading state
const DistanceExpansionLoadingState = React.memo(({ 
  currentRadius, 
  targetRadius, 
  originalDistance 
}: { 
  currentRadius: number; 
  targetRadius: number; 
  originalDistance: number; 
}) => (
  <LinearGradient
    colors={['#C8A8E9', '#B19CD9']}
    style={styles.loadingContainer}
  >
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.distanceExpansionContainer}>
      <Text style={styles.distanceExpansionTitle}>
        No places found within {originalDistance <= 1 ? `${originalDistance * 1000}m` : `${originalDistance}km`}
      </Text>
      <Text style={styles.distanceExpansionSubtitle}>
        We're expanding the search radius to find great places near you
      </Text>
      <View style={styles.radiusProgressContainer}>
        <Text style={styles.radiusProgressText}>
          Searching within {currentRadius < 1000 ? `${currentRadius}m` : `${Math.round(currentRadius / 1000)}km`}...
        </Text>
        <View style={styles.radiusProgressBar}>
          <View 
            style={[
              styles.radiusProgressFill, 
              { width: `${Math.min((currentRadius / targetRadius) * 100, 100)}%` }
            ]} 
          />
        </View>
      </View>
      <Text style={styles.distanceExpansionNote}>
        Don't worry, we'll find something amazing for you! 🌟
      </Text>
    </View>
  </LinearGradient>
));

const ImageGallery = React.memo(({ images, onImagePress, placeName }: { 
  images: string[]; 
  onImagePress: (index: number) => void; 
  placeName?: string;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (width - 32));
    setCurrentImageIndex(index);
  };

  const handleImageError = (index: number) => {
    console.warn(`❌ Image failed to load at index ${index}:`, images[index]);
    setImageErrors(prev => new Set([...prev, index]));
  };

  // Fallback placeholder when no images or all images fail
  const fallbackImage = `https://via.placeholder.com/800x600/C8A8E9/FFFFFF?text=${encodeURIComponent(placeName || 'No Image')}`;
  
  // Filter out failed images and add fallback if needed
  const validImages = images.length > 0 ? images : [fallbackImage];

  return (
  <View style={styles.imageContainer}>
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      style={styles.imageScroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
    >
      {validImages.map((image, index) => (
        <TouchableOpacity key={index} onPress={() => onImagePress(index)}>
          <Image
            source={{ uri: imageErrors.has(index) ? fallbackImage : image }}
            style={styles.image}
            resizeMode="cover"
            onError={() => handleImageError(index)}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
    <View style={styles.imageIndicator}>
      {validImages.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              { 
                opacity: index === currentImageIndex ? 1 : 0.5 
              }
            ]} 
          />
      ))}
    </View>
  </View>
  );
});

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
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(selectedIndex);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / width);
    setCurrentImageIndex(index);
  };

  const handleOverlayPress = (event: any) => {
    // Only close if the press is on the overlay, not on the image area
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalOverlay} onPress={handleOverlayPress}>
        <View style={styles.modalContent}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.modalImageScroll}
            contentOffset={{ x: selectedIndex * width, y: 0 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              scrollEnabled={true}
          >
            {images.map((image, index) => (
                <TouchableWithoutFeedback key={index}>
                  <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: image }}
                style={styles.modalImage}
                resizeMode="contain"
              />
                  </View>
                </TouchableWithoutFeedback>
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
  );
});

export default function ResultScreen() {
  const { 
    currentSuggestion, 
    resetSuggestion, 
    generateSuggestion, 
    retriesLeft, 
    isLoading, 
    effectiveFilters, 
    openInMaps, 
    updateFilters,
    getPoolStats
  } = useAppStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [distanceExpansion, setDistanceExpansion] = useState<{
    isExpanding: boolean;
    currentRadius: number;
    targetRadius: number;
    originalDistance: number;
    startTime: number;
  } | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [minimumLoadingTime] = useState(3000); // 3 seconds minimum
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
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
    openWebsite,
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

  // Discounts hook
  const {
    discounts,
    isLoading: discountLoading,
    error: discountError,
    searchDiscounts,
    openDiscount,
    clearDiscounts
  } = useDiscounts();
  
  // Optimized pass handler - uses pool for instant results
  const handlePass = useCallback(async () => {
    console.log('🚫 Pass button pressed, getting next suggestion from pool');
    try {
      // Check if we have more places in the pool for instant results
      const { hasMore, getNextBatch } = useAppStore();
      
      if (hasMore) {
        // Use pool for instant results - no loading screen needed
        console.log('⚡ Using pool for instant next suggestion');
        await getNextBatch();
      } else {
        // Only show loading if we need to fetch more places
        console.log('🔄 Pool empty, fetching more places...');
        
        // Create progress callback for expansion tracking
        const onProgress = (step: number, status: string, resultsCount?: number, distanceInfo?: any) => {
          if (distanceInfo && distanceInfo.isExpanding) {
            setDistanceExpansion({
              isExpanding: true,
              currentRadius: distanceInfo.currentRadius,
              targetRadius: distanceInfo.targetRadius,
              originalDistance: distanceInfo.originalDistance,
              startTime: Date.now()
            });
          } else if (distanceInfo && !distanceInfo.isExpanding) {
            setDistanceExpansion(null);
          }
        };
        
        await generateSuggestion(onProgress);
      }
      
    } catch (error) {
      console.error('❌ Error getting next suggestion:', error);
    }
  }, [generateSuggestion]);

  // Enhanced save functionality with user feedback
  const handleSavePlace = useCallback(async () => {
    if (!currentSuggestion) return;
    
    try {
      const isCurrentlySaved = isSaved(currentSuggestion);
      
      if (isCurrentlySaved) {
        await removePlace(currentSuggestion);
        console.log('🗑️ Removed from saved places:', currentSuggestion.name);
        
        // Optional: Show success feedback
        Alert.alert(
          'Removed from Saved Places',
          `${currentSuggestion.name} has been removed from your saved places.`,
          [{ text: 'OK' }]
        );
      } else {
        await savePlace(currentSuggestion);
        console.log('💾 Saved to saved places:', currentSuggestion.name);
        
        // Show success feedback with option to view saved places
        Alert.alert(
          'Saved Successfully!',
          `${currentSuggestion.name} has been added to your saved places.`,
          [
            { text: 'OK' },
            { 
              text: 'View Saved Places', 
              onPress: () => router.push('/saved-places')
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error saving/removing place:', error);
      Alert.alert(
        'Error',
        'Failed to save place. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [currentSuggestion, isSaved, savePlace, removePlace, router]);

  const handleContactThem = useCallback(async () => {
    if (currentSuggestion && currentSuggestion.id) {
      // Get contact info if not already loaded
      if (!contactInfo.phoneNumber && !contactInfo.website) {
        await getContactInfo(currentSuggestion.id, currentSuggestion.name);
      }
      
      // Call the contact if phone number is available
      if (contactInfo.phoneNumber) {
        await callContact(contactInfo.phoneNumber);
      } 
      // Open website if no phone number but website is available
      else if (contactInfo.website) {
        await openWebsite(contactInfo.website);
      } 
      // If neither phone nor website is available, show feedback
      else {
        console.log('📞 No contact info available');
        // You could add a toast or alert here to inform the user
        // For now, we'll just log it
      }
    }
  }, [currentSuggestion, contactInfo.phoneNumber, contactInfo.website, getContactInfo, callContact, openWebsite]);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  }, []);

  const handleBroadenSearch = useCallback(async () => {
    updateFilters({ budget: null, mood: 50 });
    
    // Reset distance expansion
    setDistanceExpansion(null);
    
    // Create progress callback
    const onProgress = (step: number, status: string, resultsCount?: number, distanceInfo?: any) => {
      // Handle distance expansion tracking
      if (distanceInfo && distanceInfo.isExpanding) {
        setDistanceExpansion({
          isExpanding: true,
          currentRadius: distanceInfo.currentRadius,
          targetRadius: distanceInfo.targetRadius,
          originalDistance: distanceInfo.originalDistance,
          startTime: Date.now()
        });
      } else if (distanceInfo && !distanceInfo.isExpanding) {
        setDistanceExpansion(null);
      }
    };
    
    await generateSuggestion(onProgress);
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
    // Reset description expansion when suggestion changes
    setIsDescriptionExpanded(false);
  }, [currentSuggestion, aiDescription, aiLoading, generateDescription]);

  // Auto-load booking options when suggestion changes
  useEffect(() => {
    if (currentSuggestion && bookingPlatforms.length === 0 && !bookingLoading) {
      getBookingOptions(currentSuggestion);
    }
  }, [currentSuggestion, bookingPlatforms.length, bookingLoading, getBookingOptions]);

  // Auto-load contact info when suggestion changes
  useEffect(() => {
    if (currentSuggestion && currentSuggestion.id && !contactInfo.phoneNumber && !contactInfo.website && !contactLoading) {
      getContactInfo(currentSuggestion.id, currentSuggestion.name);
    }
  }, [currentSuggestion, contactInfo.phoneNumber, contactInfo.website, contactLoading, getContactInfo]);

  // Auto-search discounts when suggestion changes
  useEffect(() => {
    if (currentSuggestion && discounts.length === 0 && !discountLoading) {
      searchDiscounts(currentSuggestion);
    }
  }, [currentSuggestion, discounts.length, discountLoading, searchDiscounts]);

  // Set loading start time when suggestion generation begins or when no suggestion exists
  useEffect(() => {
    if ((isLoading || !currentSuggestion) && !loadingStartTime) {
      setLoadingStartTime(Date.now());
      console.log('🔄 Loading started at:', new Date().toISOString(), {
        isLoading,
        hasSuggestion: !!currentSuggestion
      });
    }
  }, [isLoading, currentSuggestion, loadingStartTime]);

  // Auto-generate suggestion when component mounts if no suggestion exists
  useEffect(() => {
    if (!currentSuggestion && !isLoading) {
      console.log('🚀 Auto-generating suggestion on mount...');
      generateSuggestion();
    }
  }, [currentSuggestion, isLoading, generateSuggestion]);

  // Optimized restart handler - direct navigation to main page
  const handleRestart = useCallback(() => {
    console.log('🔄 Restart button pressed, navigating to main page');
    
    // Clear all data and navigate immediately - no confirmation dialog
    clearDescription();
    clearBookingOptions();
    clearContactInfo();
    clearDiscounts();
    resetSuggestion();
    
    // Navigate directly to main page
    router.replace('/');
  }, [clearDescription, clearBookingOptions, clearContactInfo, clearDiscounts, resetSuggestion, router]);

  // Helper function to get first sentence without period
  const getFirstSentence = useCallback((text: string): string => {
    if (!text || text.trim().length === 0) return '';
    
    // Split by sentence endings and filter out empty sentences
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length === 0) return text;
    
    // Get the first sentence without punctuation
    const firstSentence = sentences[0].trim();
    
    return firstSentence;
  }, []);

  // Check if all data is ready (comprehensive loading state) - MOVED BEFORE EARLY RETURNS
  const isAllDataReady = useMemo(() => {
    if (!currentSuggestion) return false;
    
    // Check if all individual loading states are complete
    const isDescriptionReady = !aiLoading && (aiDescription || currentSuggestion.description);
    const isContactReady = !contactLoading && (contactInfo.phoneNumber || contactInfo.website);
    const isDiscountReady = !discountLoading;
    const isBookingReady = !bookingLoading;
    
    // Debug logging
    console.log('🔍 Loading states:', {
      hasSuggestion: !!currentSuggestion,
      isDescriptionReady,
      isContactReady,
      isDiscountReady,
      isBookingReady,
      aiLoading,
      contactLoading,
      discountLoading,
      bookingLoading
    });
    
    // All data should be ready
    return isDescriptionReady && isContactReady && isDiscountReady && isBookingReady;
  }, [currentSuggestion, aiLoading, aiDescription, contactLoading, contactInfo, discountLoading, bookingLoading]);

  // Handle loading start time with useEffect to avoid conditional setState calls - MOVED BEFORE EARLY RETURNS
  useEffect(() => {
    const shouldBeLoading = !currentSuggestion || isLoading || !isAllDataReady;
    
    if (shouldBeLoading && !loadingStartTime) {
      // Set loading start time if not already set
      setLoadingStartTime(Date.now());
      console.log('🔄 Loading screen started at:', new Date().toISOString());
    } else if (!shouldBeLoading && loadingStartTime) {
      // Reset loading start time when not loading and all data is ready
      console.log('✅ Loading complete, hiding loading screen');
      setLoadingStartTime(null);
    }
  }, [currentSuggestion, isLoading, isAllDataReady, loadingStartTime]);

  // Enhanced budget display logic
  const budgetDisplay = useMemo(() => {
    const budgetMap = {
      'P': '₱',
      'PP': '₱₱', 
      'PPP': '₱₱₱'
    };
    
    // Priority: 1) User's chosen filter, 2) Place's actual budget, 3) Default
    const { filters } = useAppStore();
    const chosenBudget = filters?.budget;
    const placeBudget = currentSuggestion?.budget;
    
    const budgetToShow = chosenBudget || placeBudget || 'PP';
    
    console.log('💰 Budget display:', {
      chosenBudget,
      placeBudget,
      finalBudget: budgetToShow
    });
    
    return budgetMap[budgetToShow] || '₱₱';
  }, [currentSuggestion?.budget]);

  // Show error state if no suggestion and not loading
  if (!currentSuggestion && !isLoading) {
    return <ErrorState onBroadenSearch={handleBroadenSearch} onGoHome={handleGoHome} />;
  }

  // Priority 1: Show distance expansion loading if we're expanding the search radius
  if (distanceExpansion && distanceExpansion.isExpanding) {
    // Check if minimum loading time has passed for distance expansion
    const elapsed = Date.now() - distanceExpansion.startTime;
    const shouldShowDistanceLoading = elapsed < minimumLoadingTime;
    
    if (shouldShowDistanceLoading) {
      return (
        <DistanceExpansionLoadingState 
          currentRadius={distanceExpansion.currentRadius}
          targetRadius={distanceExpansion.targetRadius}
          originalDistance={distanceExpansion.originalDistance}
        />
      );
    }
  }

  // Priority 2: Show simplified loading if still generating suggestion or data not ready
  // Show loading screen immediately when no suggestion exists (initial state)
  if (!currentSuggestion || isLoading || !isAllDataReady) {    
    // Check if minimum loading time has passed
    const elapsed = loadingStartTime ? Date.now() - loadingStartTime : 0;
    const shouldShowLoading = !currentSuggestion || isLoading || !isAllDataReady || elapsed < minimumLoadingTime;
    
    if (shouldShowLoading) {
      console.log('🔄 Showing loading screen:', {
        hasSuggestion: !!currentSuggestion,
        isLoading,
        isAllDataReady,
        elapsed,
        minimumLoadingTime
      });
      return <EnhancedLoadingState filters={effectiveFilters || {}} />;
    }
  }

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top + 2, // Reduced to 2px
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
          placeName={currentSuggestion.name}
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

          <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
              {isDescriptionExpanded 
                ? (aiDescription || currentSuggestion.description)
                : (
                  <>
                    {getFirstSentence(aiDescription || currentSuggestion.description)}
                    {(aiDescription || currentSuggestion.description).split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length > 1 && (
                      <TouchableOpacity 
                        onPress={() => setIsDescriptionExpanded(true)}
                        style={styles.inlineReadMore}
                      >
                        <Text style={styles.readMoreText}> ...</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )
              }
          </Text>
            {isDescriptionExpanded && (
              <TouchableOpacity 
                style={styles.readMoreButton} 
                onPress={() => setIsDescriptionExpanded(false)}
              >
                <ChevronUp size={20} color="#8B5FBF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Active Discounts */}
          <ActiveDiscountsCard
            discounts={discounts}
            isLoading={discountLoading}
            error={discountError}
            onDiscountPress={openDiscount}
            placeType={currentSuggestion.category}
            tags={currentSuggestion.tags}
            description={aiDescription || currentSuggestion.description}
          />

          {currentSuggestion.discount && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>🎉 {currentSuggestion.discount}</Text>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[
                  styles.mapButton, 
                  (!contactInfo.phoneNumber && !contactInfo.website && !contactLoading) && styles.fullWidthMapButton
                ]} 
                onPress={handleOpenMaps}
              >
              <MapPin size={20} color="#8B5FBF" />
              <Text style={styles.mapButtonText}>View in Maps</Text>
            </TouchableOpacity>
            
              {((contactInfo.phoneNumber || contactInfo.website) || contactLoading) && (
            <TouchableOpacity style={styles.contactButton} onPress={handleContactThem}>
                  {contactLoading ? (
                    <Text style={styles.contactButtonText}>Loading...</Text>
                  ) : contactInfo.phoneNumber ? (
                    <>
                      <Phone size={16} color="#FFF" />
                      <Text style={styles.contactButtonText}>Call Now</Text>
                    </>
                  ) : contactInfo.website ? (
                    <>
                      <Globe size={16} color="#FFF" />
                      <Text style={styles.contactButtonText}>Visit Website</Text>
                    </>
                  ) : (
                    <Text style={styles.contactButtonText}>Contact Them Now</Text>
                  )}
            </TouchableOpacity>
              )}
            </View>
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
  // Distance expansion loading state styles
  distanceExpansionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  distanceExpansionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  distanceExpansionSubtitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  radiusProgressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  radiusProgressText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  radiusProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  radiusProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  distanceExpansionNote: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Image gallery styles
  imageContainer: {
    height: 262, // Reduced by 25% from 350px to 262px
    marginTop: 2, // Increased to 2px
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
    height: 262, // Reduced by 25% from 350px to 262px
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  dot: {
    width: 7.5, // Reduced by 25% from 10px to 7.5px
    height: 7.5, // Reduced by 25% from 10px to 7.5px
    borderRadius: 3.75, // Reduced by 25% from 5px to 3.75px
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  // Content card styles
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    marginTop: -10,
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
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  readMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inlineReadMore: {
    marginLeft: 2,
    alignSelf: 'center',
  },
  readMoreText: {
    fontSize: 16,
    color: '#8B5FBF',
    fontWeight: '600',
    lineHeight: 16,
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
  actionButtonsContainer: {
    marginTop: 16,
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
  fullWidthMapButton: {
    flex: 1,
    width: '100%',
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
    flexDirection: 'row',
    gap: 8,
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
  modalImageContainer: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // Prevent any visual feedback on touch
    opacity: 1,
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
