import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, ScrollView, Dimensions } from 'react-native';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image scroll to update current index
  const handleImageScroll = (event: { nativeEvent: { layoutMeasurement: { width: number }; contentOffset: { x: number } } }) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  // Handle contact actions
  const handleCall = async () => {
    if (!place.contactActions || !place.contactActions.canCall || !place.contactActions.callUrl) {
      Alert.alert('No Phone Number', 'This place doesn\'t have a phone number available.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(place.contactActions.callUrl);
      if (supported) {
        await Linking.openURL(place.contactActions.callUrl);
      } else {
        Alert.alert('Cannot Make Call', 'Your device doesn\'t support making calls.');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to make call.');
    }
  };

  const handleWebsite = async () => {
    if (!place.contactActions || !place.contactActions.canVisitWebsite || !place.contactActions.websiteUrl) {
      Alert.alert('No Website', 'This place doesn\'t have a website available.');
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
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Failed to open website.');
    }
  };

  // Get mood display info
  const getMoodDisplay = () => {
    const finalMood = place.final_mood || 'neutral';
    
    // Enhanced mood display that uses entity analysis results
    const getMoodEmoji = (mood: string) => {
      const moodLower = mood.toLowerCase();
      
      // Check for hype-related keywords
      if (moodLower.includes('vibrant') || moodLower.includes('lively') || moodLower.includes('energetic') || 
          moodLower.includes('exciting') || moodLower.includes('buzzing') || moodLower.includes('dynamic') ||
          moodLower.includes('thrilling') || moodLower.includes('electric') || moodLower.includes('pumping')) {
        return '🔥';
      }
      
      // Check for chill-related keywords
      if (moodLower.includes('cozy') || moodLower.includes('peaceful') || moodLower.includes('calm') ||
          moodLower.includes('serene') || moodLower.includes('tranquil') || moodLower.includes('relaxing') ||
          moodLower.includes('intimate') || moodLower.includes('romantic') || moodLower.includes('charming') ||
          moodLower.includes('quaint') || moodLower.includes('rustic') || moodLower.includes('homely') ||
          moodLower.includes('comfortable') || moodLower.includes('welcoming') || moodLower.includes('warm') ||
          moodLower.includes('gentle') || moodLower.includes('soft') || moodLower.includes('mellow') ||
          moodLower.includes('laid-back') || moodLower.includes('casual') || moodLower.includes('unpretentious') ||
          moodLower.includes('simple') || moodLower.includes('minimalist')) {
        return '😌';
      }
      
      // Default to neutral for other cases
      return '😊';
    };
    
    // If final_mood contains enhanced descriptors, use them directly
    if (finalMood && finalMood !== 'neutral' && finalMood !== 'chill' && finalMood !== 'hype') {
      const moodString = String(finalMood);
      return {
        emoji: getMoodEmoji(moodString),
        label: moodString.charAt(0).toUpperCase() + moodString.slice(1) // Capitalize first letter
      };
    }
    
    // Fallback to basic mood categories
    const moodConfig = {
      chill: { emoji: '😌', label: 'Chill Vibe' },
      neutral: { emoji: '😊', label: 'Balanced' },
      hype: { emoji: '🔥', label: 'Lively Atmosphere' }
    };

    return moodConfig[finalMood as keyof typeof moodConfig] || moodConfig.neutral;
  };

  // Get opening hours display
  const getOpeningHoursDisplay = () => {
    if (!place.openHours) return null;
    
    // For now, return a simple open/closed status
    // The openHours property is a string, not the complex Google Places API structure
    return {
      isOpenNow: true, // Default to open since we can't parse the string format
      todayHours: place.openHours
    };
  };

  // Get budget display (old UI style)
  const getBudgetDisplay = () => {
    const priceLevel = place.price_level;
    if (priceLevel === 1) return 'P';
    if (priceLevel === 2) return 'PP';
    if (priceLevel === 3) return 'PPP';
    return 'PP';
  };

  const moodDisplay = getMoodDisplay();
  // const displayImage = getDisplayImage();

  return (
    <View style={styles.container}>
      {/* Image Section Container */}
      <View style={styles.imageCardContainer}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            onScroll={handleImageScroll}
            onMomentumScrollEnd={handleImageScroll}
            scrollEventThrottle={16}
          >
            {/* Display actual place photos if available */}
            {place.photos?.medium && Array.isArray(place.photos.medium) && place.photos.medium.length > 0 ? (
              place.photos.medium.map((photo, index) => (
                <View key={`photo-${index}`} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.placeImage}
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : (
              <View style={styles.imageWrapper}>
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              </View>
            )}
          </ScrollView>
          {/* Carousel Indicators */}
          {place.photos?.medium && Array.isArray(place.photos.medium) && place.photos.medium.length > 1 && (
            <View style={styles.imageCounter} pointerEvents="box-none">
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{place.photos.medium.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Place Info Section Container */}
      <TouchableOpacity
        style={styles.cardSectionContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeLocation}>{place.formatted_address || place.vicinity || 'Address not available'}</Text>
          {/* Budget Badge (Old UI Style) */}
          <View style={styles.budgetContainer}>
            <Text style={styles.budget}>
              {getBudgetDisplay() === 'P' ? '₱' : getBudgetDisplay() === 'PP' ? '₱₱' : '₱₱₱'}
            </Text>
          </View>
          {/* Description (Old UI Style) */}
          {place.editorial_summary && (
            <Text style={styles.placeDescription} numberOfLines={2}>
              {place.editorial_summary}
            </Text>
          )}
          {/* Enhanced Info Row with Rating, Mood, and Hours */}
          <View style={styles.enhancedInfoRow}>
            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {place.rating ? place.rating.toFixed(1) : 'N/A'}
              </Text>
            </View>
            
            {/* Mood Section with Descriptive Words */}
            <View style={styles.moodSection}>
              <Text style={styles.moodText}> 
                {moodDisplay.label}
              </Text>
            </View>
            
            {/* Opening Hours Section */}
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
          
          {/* AI Generated Description */}
          {place.description ? (
            <Text style={styles.descriptionText}>
              {place.description}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              AI description will appear here once generated. This place offers a unique experience worth exploring!
            </Text>
          )}
          {/* Place Actions (Old UI Style) */}
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
                // Open in maps
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
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                console.log('🔴 Pass button pressed');
                onPass && onPass();
              }}
              activeOpacity={0.7}
            >
              <X size={24} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Pass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                console.log('🔄 Restart button pressed');
                onRestart && onRestart();
              }}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color="#4CAF50" />
              <Text style={[styles.actionText, { color: '#4CAF50' }]}>Restart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                console.log('💖 Save button pressed, isSaved:', isSaved);
                onSave && onSave();
              }}
              activeOpacity={0.7}
            >
              <Heart 
                size={24} 
                color={isSaved ? '#F44336' : '#4CAF50'} 
                fill={isSaved ? '#F44336' : 'transparent'}
              />
              <Text style={[styles.actionText, { color: isSaved ? '#F44336' : '#4CAF50' }]}>
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
    marginHorizontal: 16,
    marginVertical: 8,
  },
  imageCardContainer: {
    backgroundColor: '#A67BCE', // 5% lighter purple background for image section
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
    height: 240, // 4:3 aspect ratio
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    width: screenWidth - 32, // Full container width minus margins
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
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  // Old UI Content Styles
  placeInfo: {
    padding: 20, // Increased from 16 to 20 for better overall spacing
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 8, // Standardized to 8
    textAlign: 'center',
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12, // Standardized to 12
    textAlign: 'center',
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16, // Increased to 16 for better separation
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
    marginBottom: 16, // Standardized to 16
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
    marginBottom: 16, // Standardized to 16
    flexWrap: 'wrap',
    gap: 8, // Added gap for consistent spacing between elements
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0, // Removed marginBottom since we're using gap
    marginRight: 0, // Removed marginRight since we're using gap
    height: 26,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2', // Changed from '#0066CC' to less saturated blue (30%)
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
    marginBottom: 0, // Removed marginBottom since we're using gap
    marginRight: 0, // Removed marginRight since we're using gap
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
    marginBottom: 0, // Removed marginBottom since we're using gap
    marginRight: 0, // Removed marginRight since we're using gap
    height: 26,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#4A90E2', // Changed from '#0066CC' to less saturated blue (30%)
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
    color: '#4A90E2', // Changed from '#0066CC' to less saturated blue (30%)
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16, // Added consistent top margin
  },
  actionButton: {
    flexDirection: 'column',        // Vertical layout (icon above text)
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: 60,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 12, // Reduced from 14 to 12 for better proportion
    color: '#8B5FBF',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',           // Horizontal layout (icon beside text)
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',      // White background
    borderWidth: 1,                 // Has a border
    borderColor: '#8B5FBF',        // Purple border
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
    gap: 4,
  },
  removeText: {
    fontSize: 12, // Reduced from 14 to 12 for consistency
    color: '#FF6B6B',
    fontWeight: '500',
  },
  divider: {
    height: 1, // Reduced from 2 to 1 for subtler appearance
    backgroundColor: '#E0E0E0',
    marginVertical: 12, // Standardized to 12 for consistency
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 8,
  },
});