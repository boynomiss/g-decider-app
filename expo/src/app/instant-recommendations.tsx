import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Header } from '../features/auth';
import { InstantRecommendations } from '../features/discovery';
import { useAppStore } from '../store/store';

export default function InstantRecommendationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userLocation, setCurrentSuggestion } = useAppStore();

  const handlePlaceSelect = (place: any) => {
    // Integrate with the G button's decision flow by setting the place as the current suggestion
    // This ensures consistent behavior with the main decision process
    if (place && place.place_id) {
      // Set the place as the current suggestion in the store
      // This mimics what the G button does when generating a suggestion
      console.log('🎯 Instant recommendation selected:', place.name);
      
      // Convert the place to the expected Suggestion format and set it in the store
      const suggestion = {
        id: place.place_id || place.id,
        name: place.name,
        location: place.formatted_address || place.vicinity || place.location,
        images: place.photos?.medium || place.images || [],
        budget: place.budget || 'P',
        tags: place.types || place.tags || [],
        description: place.description || `${place.name} is a great place to visit.`,
        openHours: place.openHours,
        category: place.category,
        mood: place.mood,
        socialContext: place.socialContext || ['solo', 'with-bae', 'barkada'],
        timeOfDay: place.timeOfDay || ['morning', 'afternoon', 'night'],
        coordinates: place.coordinates,
        rating: place.rating || 0,
        reviewCount: place.reviewCount || place.user_ratings_total || 0,
        reviews: place.reviews || [],
        website: place.website || ''
      };
      
      // Set the current suggestion in the store
      setCurrentSuggestion(suggestion);
      
      // Navigate to results page where the place will be displayed
      router.push('/results');
    }
  };

  const handleRefresh = () => {
    // Handle refresh if needed
    console.log('Refreshing recommendations...');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={[styles.container, { paddingTop: insets.top }]}
    >


      {/* Instant Recommendations Component */}
      <ErrorBoundary componentName="InstantRecommendations">
        <InstantRecommendations
          onPlaceSelect={handlePlaceSelect}
          onRefresh={handleRefresh}
          {...(userLocation && { userLocation })}
          maxRecommendations={10}
        />
      </ErrorBoundary>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});
