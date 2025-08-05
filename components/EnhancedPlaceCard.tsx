import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Globe, Star, MapPin, Clock, Users, Heart, Trash, X, RotateCcw } from 'lucide-react-native';
import { PlaceData } from '../utils/place-mood-service';

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
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image scroll to update current index
  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  // Get the appropriate image based on screen context
  const getDisplayImage = () => {
    if (!place.photos?.medium || place.photos.medium.length === 0) {
      return null;
    }
    return place.photos.medium[currentImageIndex] || place.photos.medium[0];
  };

  // Handle contact actions
  const handleCall = async () => {
    if (!place.contactActions?.canCall || !place.contactActions.callUrl) {
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
    if (!place.contactActions?.canVisitWebsite || !place.contactActions.websiteUrl) {
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
    const moodScore = place.mood_score || 50;
    const finalMood = place.final_mood || 'neutral';
    
    const moodConfig = {
      chill: { emoji: '😌', label: 'Chill Vibe' },
      neutral: { emoji: '😊', label: 'Balanced' },
      hype: { emoji: '🔥', label: 'Lively Atmosphere' }
    };

    return moodConfig[finalMood as keyof typeof moodConfig] || moodConfig.neutral;
  };

  // Get opening hours display
  const getOpeningHoursDisplay = () => {
    if (!place.opening_hours) return null;
    
    // Check if currently open
    const isOpenNow = place.opening_hours.open_now;
    
    // Get today's hours if available
    const today = new Date().getDay();
    const weekdayText = place.opening_hours.weekday_text;
    const todayHours = weekdayText ? weekdayText[today] : null;
    
    return {
      isOpenNow,
      todayHours,
      hasHours: !!todayHours
    };
  };

  // Get price level display (old UI style)
  const getPriceDisplay = () => {
    const priceLevel = place.price_level;
    if (priceLevel === undefined || priceLevel === null) return '₱₱';
    
    const prices = ['Free', '₱', '₱₱', '₱₱₱', '₱₱₱₱'];
    return prices[priceLevel] || '₱₱';
  };

  // Get budget display (old UI style)
  const getBudgetDisplay = () => {
    const priceLevel = place.price_level;
    if (priceLevel === 1) return 'P';
    if (priceLevel === 2) return 'PP';
    if (priceLevel === 3) return 'PPP';
    return 'PP';
  };

  // Cycle through images if multiple available
  const handleImagePress = () => {
    if (place.photos?.medium && place.photos.medium.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % place.photos.medium.length);
    }
  };

  const moodDisplay = getMoodDisplay();
  const displayImage = getDisplayImage();

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
            {/* Temporary 5 images for testing */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop' }}
                style={styles.placeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop' }}
                style={styles.placeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }}
                style={styles.placeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' }}
                style={styles.placeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop' }}
                style={styles.placeImage}
                resizeMode="cover"
              />
            </View>
          </ScrollView>
          {/* Carousel Indicators */}
          <View style={styles.imageCounter} pointerEvents="box-none">
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/5
            </Text>
          </View>
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
          <Text style={styles.placeLocation}>{place.address}</Text>
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
          {/* Place Actions (Old UI Style) */}
          <View style={styles.placeActions}>
            {place.contactActions?.canCall && (
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
              style={styles.actionButton} 
              onPress={() => {
                // Open in maps
                const url = `https://maps.google.com/?q=${encodeURIComponent(place.address)}`;
                Linking.openURL(url);
              }}
              activeOpacity={0.7}
            >
              <MapPin size={16} color="#8B5FBF" />
              <Text style={styles.actionText}>Map</Text>
            </TouchableOpacity>
            {place.contactActions?.canVisitWebsite && (
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
              onPress={onPass}
              activeOpacity={0.7}
            >
              <X size={24} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Pass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onRestart}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color="#4A4A4A" />
              <Text style={[styles.actionText, { color: '#4A4A4A' }]}>Restart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onSave}
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
    padding: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 4,
    textAlign: 'center',
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#87CEEB',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 8,
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
    marginBottom: 12,
  },
  enhancedInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#87CEEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
    marginRight: 8,
    height: 24,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
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
    backgroundColor: '#87CEEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
    marginRight: 8,
    height: 24,
  },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#87CEEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
    marginRight: 8,
    height: 24,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#0066CC',
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
    color: '#0066CC',
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#8B5FBF',
    fontWeight: '500',
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
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  divider: {
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
});