/**
 * Featured Place Card
 * 
 * Displays a featured place using the EnhancedPlaceCard component
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EnhancedPlaceCard } from './EnhancedPlaceCard';
import { useFeaturedPlaces } from '../hooks/use-featured-places';
import type { FeaturedPlace } from '../types/featured-place-types';

interface FeaturedPlaceCardProps {
  place: FeaturedPlace;
  onPress?: () => void;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

export const FeaturedPlaceCard: React.FC<FeaturedPlaceCardProps> = ({
  place,
  onPress,
  onSwipeRight,
  onSwipeLeft
}) => {
  const { recordImpression, recordSwipe, recordProfileView } = useFeaturedPlaces();

  // Record impression when card is displayed
  useEffect(() => {
    recordImpression(place.id);
  }, [place.id, recordImpression]);

  // Convert FeaturedPlace to the format expected by EnhancedPlaceCard
  const enhancedPlaceData = {
    id: place.id,
    name: place.name,
    location: place.location.formatted_address || place.location.address,
    images: [place.images.hero, ...place.images.gallery],
    budget: place.business_info.price_range as any, // Convert to BudgetOption
    priceRange: place.business_info.price_range,
    tags: place.discovery.tags,
    description: place.description,
    openHours: Object.values(place.business_info.hours).filter(Boolean).join(', '),
    category: place.category as any, // Convert to LookingForOption
    mood: place.discovery.mood_category as any, // Convert to MoodOption
    socialContext: place.discovery.perfect_for as any, // Convert to SocialContext
    timeOfDay: place.discovery.best_time ? [place.discovery.best_time] : [],
    rating: 0, // Featured places don't have ratings yet
    reviews: 0,
    coordinates: {
      lat: place.location.lat,
      lng: place.location.lng
    },
    website: place.contact.website,
    phone: place.contact.phone,
    types: [place.category],
    business_status: 'OPERATIONAL',
    open_now: true, // Would need to calculate based on current time and hours
    vicinity: place.location.vicinity || place.location.barangay || place.location.city
  };

  const handleSwipeRight = () => {
    recordSwipe(place.id, 'right');
    onSwipeRight?.();
  };

  const handleSwipeLeft = () => {
    recordSwipe(place.id, 'left');
    onSwipeLeft?.();
  };

  const handlePress = () => {
    recordProfileView(place.id);
    onPress?.();
  };

  return (
    <View style={styles.container}>
      <EnhancedPlaceCard
        place={enhancedPlaceData}
        onPress={handlePress}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
      />
      
      {/* Featured badge */}
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredText}>✨ Featured</Text>
      </View>
      
      {/* Partnership tier indicator */}
      {place.partnership.tier !== 'basic' && (
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>
            {place.partnership.tier === 'premium' ? '⭐ Premium' : '💎 Enterprise'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(138, 43, 226, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  tierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
