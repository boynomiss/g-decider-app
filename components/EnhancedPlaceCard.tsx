import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Globe, Star, MapPin, Clock, DollarSign, Users, Heart } from 'lucide-react-native';
import { PlaceData } from '@/utils/place-mood-service';

interface EnhancedPlaceCardProps {
  place: PlaceData;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  showFullDetails?: boolean;
}

export default function EnhancedPlaceCard({
  place,
  onPress,
  onSave,
  isSaved = false,
  showFullDetails = false
}: EnhancedPlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      chill: { emoji: '😌', color: '#4CAF50', label: 'Chill Vibe' },
      neutral: { emoji: '😊', color: '#FF9800', label: 'Balanced' },
      hype: { emoji: '🔥', color: '#F44336', label: 'Lively Atmosphere' }
    };

    return moodConfig[finalMood as keyof typeof moodConfig] || moodConfig.neutral;
  };

  // Get price level display
  const getPriceDisplay = () => {
    const priceLevel = place.price_level;
    if (priceLevel === undefined || priceLevel === null) return '₱₱';
    
    const prices = ['Free', '₱', '₱₱', '₱₱₱', '₱₱₱₱'];
    return prices[priceLevel] || '₱₱';
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
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.gradient}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {displayImage && !imageError ? (
            <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8}>
              <Image
                source={{ uri: displayImage }}
                style={styles.placeImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
              {place.photos && place.photos.count > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1}/{place.photos.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderImage}>
              <MapPin size={32} color="#9E9E9E" />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isSaved ? '#F44336' : '#FFFFFF'}
              fill={isSaved ? '#F44336' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.placeName} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={styles.placeAddress} numberOfLines={1}>
                {place.address}
              </Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{getPriceDisplay()}</Text>
            </View>
          </View>

          {/* Rating and Mood */}
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {place.rating ? place.rating.toFixed(1) : 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>
                ({place.user_ratings_total || 0})
              </Text>
            </View>

            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>{moodDisplay.emoji}</Text>
              <Text style={[styles.moodText, { color: moodDisplay.color }]}>
                {moodDisplay.label}
              </Text>
              <Text style={styles.moodScore}>
                {place.mood_score || 50}/100
              </Text>
            </View>
          </View>

          {/* Contact Actions */}
          {place.contact?.hasContact && (
            <View style={styles.contactRow}>
              {place.contactActions?.canCall && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleCall}
                  activeOpacity={0.7}
                >
                  <Phone size={16} color="#4CAF50" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
              )}

              {place.contactActions?.canVisitWebsite && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleWebsite}
                  activeOpacity={0.7}
                >
                  <Globe size={16} color="#2196F3" />
                  <Text style={styles.contactButtonText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Additional Details (if showFullDetails) */}
          {showFullDetails && (
            <View style={styles.detailsSection}>
              {place.business_status && (
                <View style={styles.detailRow}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.detailText}>
                    {place.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}

              {place.types && place.types.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.categoryText}>
                    {place.types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              )}

              {place.editorial_summary && (
                <Text style={styles.summaryText} numberOfLines={2}>
                  {place.editorial_summary}
                </Text>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    borderRadius: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginTop: 4,
  },
});