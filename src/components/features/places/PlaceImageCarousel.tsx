/**
 * Place Image Carousel Component
 * Displays multiple images in a swipeable carousel
 * Shows hero + gallery images with dots indicator
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Text
} from 'react-native';
import { API_KEYS } from '../../../shared/constants/config/api-keys';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32; // Account for horizontal margins

/**
 * Convert image URL to proper format with API key if needed
 */
function ensureApiKey(imageUrl: string): string {
  // If it's a Google Places photo without key, add it
  if (imageUrl.includes('places.googleapis.com') && !imageUrl.includes('key=')) {
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}key=${API_KEYS.GOOGLE_PLACES}`;
  }
  // If it's Google Maps API without key, add it  
  if (imageUrl.includes('maps.googleapis.com') && !imageUrl.includes('key=')) {
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}key=${API_KEYS.GOOGLE_PLACES}`;
  }
  return imageUrl;
}

interface PlaceImageCarouselProps {
  heroImage: string;
  galleryImages: string[];
  testID?: string;
}

export default function PlaceImageCarousel({
  heroImage,
  galleryImages = [],
  testID
}: PlaceImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Combine hero + gallery (limit to 3 images as requested)
  const allRawImages = [heroImage, ...galleryImages];
  const allImagesWithKeys = allRawImages.map(ensureApiKey);
  const allImages = allImagesWithKeys.slice(0, 3); // Take only first 3 images
  const imageCount = allImages.length;
  
  // Check if using Google Places photos (vs Street View)
  const hasRealPhotos = heroImage.includes('places.googleapis.com');

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / IMAGE_WIDTH);
    setCurrentIndex(index);
  };

  const setImageLoading = (index: number, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [index]: loading }));
  };

  const setImageError = (index: number, hasError: boolean) => {
    setErrorStates(prev => ({ ...prev, [index]: hasError }));
  };

  // Fallback for error images
  const fallbackImage = 'https://via.placeholder.com/800x400/E8E8E8/666666?text=Image+Not+Available';

  return (
    <View style={styles.container} testID={testID}>
      {/* Photo Source Badge */}
      {hasRealPhotos && (
        <View style={styles.photoBadge}>
          <Text style={styles.photoBadgeText}>📸 Google Photos</Text>
        </View>
      )}
      
      {/* Image Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {allImages.map((imageUri, index) => (
          <View key={index} style={styles.imageSlide}>
            {loadingStates[index] && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            <Image
              source={{ uri: errorStates[index] ? fallbackImage : imageUri }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(index, true)}
              onLoadEnd={() => setImageLoading(index, false)}
              onError={() => {
                setImageError(index, true);
                setImageLoading(index, false);
              }}
            />
            {/* Label for last image (map view) */}
            {index === imageCount - 1 && (
              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText}>📍 Location Map</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {imageCount > 1 && (
        <View style={styles.paginationContainer}>
          {allImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {imageCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollView: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageSlide: {
    width: IMAGE_WIDTH,
    height: 300,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  counterContainer: {
    position: 'absolute',
    top: 12,
    right: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  photoBadge: {
    position: 'absolute',
    top: 12,
    left: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

