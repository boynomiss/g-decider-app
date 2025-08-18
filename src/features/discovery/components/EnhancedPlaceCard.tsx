import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import { Phone, Globe, Star, MapPin, Clock, Heart, Trash, X, RotateCcw } from 'lucide-react-native';
import { PlaceMoodData as PlaceData } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedPlaceCardProps {
  place: PlaceData;
  onPress?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onPass?: () => void;
  onRestart?: () => void;
  isSaved?: boolean;
  showFullDetails?: boolean;
  showRemoveButton?: boolean;
}

export default function EnhancedPlaceCard({
  place,
  onPress,
  onSave,
  onRemove,
  onPass,
  onRestart,
  isSaved = false,
  showFullDetails = false,
  showRemoveButton = false
}: EnhancedPlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(Math.max(320, screenWidth - 40));
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  }, [containerWidth]);

  const imageSources: string[] = useMemo(() => {
    const photos = (place.photos?.medium && Array.isArray(place.photos.medium) ? place.photos.medium : []) as string[];
    const legacy = (place.images && Array.isArray(place.images) ? place.images : []) as string[];
    const merged = photos.length > 0 ? photos : legacy;
    return merged.filter((u) => typeof u === 'string' && u.length > 0);
  }, [place.photos?.medium, place.images]);

  const handleImageScroll = (event: { nativeEvent: { layoutMeasurement: { width: number }; contentOffset: { x: number } } }) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width || containerWidth;
    const total = imageSources.length;
    const index = slideSize > 0 ? event.nativeEvent.contentOffset.x / slideSize : 0;
    const rounded = Math.round(index);
    setCurrentImageIndex(Math.max(0, Math.min(total > 0 ? total - 1 : 0, rounded)));
  };

  const handleCall = async () => {
    if (!place.contactActions || !place.contactActions.canCall || !place.contactActions.callUrl) {
      Alert.alert('No Phone Number', "This place doesn't have a phone number available.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(place.contactActions.callUrl);
      if (supported) {
        await Linking.openURL(place.contactActions.callUrl);
      } else {
        Alert.alert('Cannot Make Call', "Your device doesn't support making calls.");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make call.');
    }
  };

  const handleWebsite = async () => {
    if (!place.contactActions || !place.contactActions.canVisitWebsite || !place.contactActions.websiteUrl) {
      Alert.alert('No Website', "This place doesn't have a website available.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(place.contactActions.websiteUrl);
      if (supported) {
        await Linking.openURL(place.contactActions.websiteUrl);
      } else {
        Alert.alert('Cannot Open Website', 'Failed to open website.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open website.');
    }
  };

  const getMoodDisplay = () => {
    const finalMood = (place as any).final_mood || place.mood || 'neutral';
    const moodLower = String(finalMood).toLowerCase();
    const hypeKeys = ['vibrant', 'lively', 'energetic', 'exciting', 'buzzing', 'dynamic', 'thrilling', 'electric', 'pumping', 'hype'];
    const chillKeys = ['cozy', 'peaceful', 'calm', 'serene', 'tranquil', 'relaxing', 'intimate', 'romantic', 'charming', 'quaint', 'rustic', 'homely', 'comfortable', 'welcoming', 'warm', 'gentle', 'soft', 'mellow', 'laid-back', 'casual', 'unpretentious', 'simple', 'minimalist', 'chill'];
    if (hypeKeys.some(k => moodLower.includes(k))) return { emoji: '🔥', label: 'Lively Atmosphere' };
    if (chillKeys.some(k => moodLower.includes(k))) return { emoji: '😌', label: 'Chill Vibe' };
    return { emoji: '😊', label: 'Balanced' };
  };

  const getOpeningHoursDisplay = () => {
    if (!place.openHours) return null as null | { isOpenNow: boolean; todayHours: string };
    return { isOpenNow: true, todayHours: place.openHours };
  };

  const getBudgetDisplay = () => {
    const priceLevel = place.price_level;
    if (priceLevel === 1) return 'P';
    if (priceLevel === 2) return 'PP';
    if (priceLevel === 3) return 'PPP';
    return 'PP';
  };

  const moodDisplay = getMoodDisplay();

  return (
    <View style={styles.container}>
      <View style={styles.imageCardContainer}>
        <View style={styles.imageContainer} onLayout={onContainerLayout}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            onScroll={handleImageScroll}
            onMomentumScrollEnd={handleImageScroll}
            scrollEventThrottle={16}
            testID="image-scrollview"
          >
            {imageSources.length > 0 ? (
              imageSources.map((photo, index) => (
                <View key={`photo-${index}`} style={[styles.imageWrapper, { width: containerWidth }]}> 
                  {failedImages[index] ? (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>Image unavailable</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: photo }}
                      style={styles.placeImage}
                      resizeMode="cover"
                      onError={() => setFailedImages((p) => ({ ...p, [index]: true }))}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.imageWrapper, { width: containerWidth }]}>
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              </View>
            )}
          </ScrollView>
          {imageSources.length > 1 && (
            <View style={styles.imageCounter} pointerEvents="box-none">
              <Text style={styles.imageCounterText}>
                {Math.min(currentImageIndex + 1, imageSources.length)}/{imageSources.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardSectionContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeLocation}>{place.formatted_address || place.vicinity || 'Address not available'}</Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.budget}>
              {getBudgetDisplay() === 'P' ? '₱' : getBudgetDisplay() === 'PP' ? '₱₱' : '₱₱₱'}
            </Text>
          </View>
          {place.editorial_summary && (
            <Text style={styles.placeDescription} numberOfLines={2}>
              {place.editorial_summary}
            </Text>
          )}
          <View style={styles.enhancedInfoRow}>
            <View style={styles.ratingSection}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {place.rating ? place.rating.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.moodSection}>
              <Text style={styles.moodText}> 
                {moodDisplay.label}
              </Text>
            </View>
            {(() => {
              const hoursDisplay = getOpeningHoursDisplay();
              if (!hoursDisplay) return null;
              return (
                <View style={styles.hoursSection}>
                  <Clock size={14} color={hoursDisplay.isOpenNow ? '#4CAF50' : '#FF6B6B'} />
                  <Text style={[styles.hoursText, { color: hoursDisplay.isOpenNow ? '#4CAF50' : '#FF6B6B' }]}>
                    {hoursDisplay.isOpenNow ? 'Open' : 'Closed'}
                  </Text>
                  {hoursDisplay.todayHours && (
                    <Text style={styles.hoursDetail} numberOfLines={1}>
                      {hoursDisplay.todayHours}
                    </Text>
                  )}
                </View>
              );
            })()}
          </View>
          {place.description ? (
            <Text style={styles.descriptionText}>
              {place.description}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              AI description will appear here once generated. This place offers a unique experience worth exploring!
            </Text>
          )}
          <View style={styles.placeActions}>
            {place.contactActions && place.contactActions.canCall && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <Phone size={16} color="#8B5FBF" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.mapButton} 
              onPress={() => {
                const url = `https://maps.google.com/?q=${encodeURIComponent(place.formatted_address || place.vicinity || '')}`;
                Linking.openURL(url);
              }}
              activeOpacity={0.7}
            >
              <MapPin size={16} color="#8B5FBF" />
              <Text style={styles.mapButtonText}>View in Maps</Text>
            </TouchableOpacity>
            {place.contactActions && place.contactActions.canVisitWebsite && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleWebsite}
                activeOpacity={0.7}
              >
                <Globe size={16} color="#8B5FBF" />
                <Text style={styles.actionText}>Website</Text>
              </TouchableOpacity>
            )}
            {showRemoveButton && onRemove && (
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={onRemove}
                activeOpacity={0.7}
              >
                <Trash size={16} color="#FF6B6B" />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.actionButtonsRow} testID="action-buttons-row">
            <TouchableOpacity 
              testID="pass-button"
              style={[styles.actionButton, styles.passButton]} 
              onPress={() => {
                onPass && onPass();
              }}
              activeOpacity={0.7}
            >
              <X size={24} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: '#FF6B6B', fontWeight: '600' }]}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="restart-button"
              style={[styles.actionButton, styles.restartButton]} 
              onPress={() => {
                onRestart && onRestart();
              }}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color="#666666" />
              <Text style={[styles.actionText, { color: '#666666', fontWeight: '600' }]}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="save-button"
              style={[styles.actionButton, isSaved ? styles.savedButton : styles.saveButton]} 
              onPress={() => {
                onSave && onSave();
              }}
              activeOpacity={0.7}
            >
              <Heart 
                size={24} 
                color="#4CAF50" 
                fill={isSaved ? '#4CAF50' : 'transparent'}
              />
              <Text style={[styles.actionText, { color: '#4CAF50', fontWeight: '600' }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  imageCardContainer: {
    backgroundColor: '#A67BCE',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  cardSectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 240,
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    height: '100%',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
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
  placeInfo: {
    padding: 20,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  enhancedInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8 as const,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#4A90E2',
  },
  hoursDetail: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6 as const,
    backgroundColor: 'transparent',
    flex: 1,
    minWidth: 0,
  },
  actionText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5FBF',
    marginLeft: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    gap: 4 as const,
  },
  removeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    minHeight: 60,
    borderRadius: 8,
    width: '100%',
  },
  passButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 25,
  },
  restartButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 25,
  },
  savedButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 25,
  },
});
