import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Trash, MapPin, Phone } from 'lucide-react-native';
import { useSavedPlaces } from '../hooks/use-saved-places';
import { useContact } from '../hooks/use-contact';
import { contactService } from '../utils/content/results/contact-service';
import EnhancedPlaceCard from '../components/EnhancedPlaceCard';
import { PlaceMoodData } from '../types/filtering';

const { width } = Dimensions.get('window');

export default function SavedPlacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedPlaces, removePlace, clearSavedPlaces, isLoading } = useSavedPlaces();
  const { callContact } = useContact();

  const handleRemovePlace = useCallback((place: any) => {
    Alert.alert(
      'Remove Place',
      `Are you sure you want to remove "${place.name}" from your saved places?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePlace(place) }
      ]
    );
  }, [removePlace]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Saved Places',
      'Are you sure you want to remove all saved places?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearSavedPlaces }
      ]
    );
  }, [clearSavedPlaces]);

  const handleCallPlace = useCallback(async (place: any) => {
    if (place.id) {
      const contactInfo = await contactService.getContactInfo(place.id);
      if (contactInfo.phoneNumber) {
        await callContact(contactInfo.phoneNumber);
      } else {
        Alert.alert('No Contact Info', 'No phone number available for this place.');
      }
    }
  }, [callContact]);

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top + 8,
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: 'Saved Places'
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        {savedPlaces.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved Places Count */}
      {savedPlaces.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {savedPlaces.length} {savedPlaces.length === 1 ? 'place' : 'places'} saved
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading saved places...</Text>
          </View>
        ) : savedPlaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Saved Places</Text>
            <Text style={styles.emptySubtitle}>
              Places you save will appear here for easy access
            </Text>
          </View>
        ) : (
          savedPlaces.map((place, index) => {
            // Convert saved place format to PlaceData format
            const placeData: PlaceMoodData = {
              place_id: place.id || `saved_${index}`,
              name: place.name,
              address: place.location,
              category: place.category || 'food',
              rating: place.rating || 0,
              user_ratings_total: place.reviewCount || 0,
              reviews: [],
              mood_score: place.mood === 'hype' ? 80 : place.mood === 'chill' ? 30 : 50,
              final_mood: place.mood === 'both' ? 'neutral' : (place.mood as 'chill' | 'hype') || 'neutral',
              photos: {
                thumbnail: Array.isArray(place.images) ? place.images : [],
                medium: Array.isArray(place.images) ? place.images : [],
                large: Array.isArray(place.images) ? place.images : [],
                count: Array.isArray(place.images) ? place.images.length : 0
              },
              contact: {
                ...(place.website && { website: place.website }),
                hasContact: !!place.website
              },
              contactActions: {
                canCall: false,
                canVisitWebsite: !!place.website,
                ...(place.website && { websiteUrl: place.website })
              },
              price_level: place.budget === 'P' ? 1 : place.budget === 'PP' ? 2 : 3,
              editorial_summary: place.description,
              business_status: 'OPERATIONAL'
            };

            return (
              <EnhancedPlaceCard
                key={place.id || index}
                place={placeData}
                onSave={() => {}} // Already saved
                isSaved={true}
                showRemoveButton={true}
                onRemove={() => handleRemovePlace(place)}
                showFullDetails={false}
              />
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  placeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeImage: {
    width: '100%',
    height: 150,
  },
  placeInfo: {
    padding: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  budgetContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    gap: 4,
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
  countContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  countText: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
}); 