// Mock-Enhanced InstantRecommendations Component
// Uses mock services for UI development without real API calls

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock, TrendingUp, Star } from 'lucide-react-native';
import { PlaceMoodData as PlaceData } from '../../../shared/types/types';
import EnhancedPlaceCard from './EnhancedPlaceCard';
import { useRouter } from 'expo-router';
import { useMockStore } from '../../../store/mock-store';
import { mockGooglePlacesClient } from '../../../services/mock/api';
import { shouldShowMockIndicators } from '../../../config/mock-config';

interface InstantRecommendationsProps {
  onPlaceSelect?: (place: PlaceData) => void;
  onRefresh?: () => void;
  userLocation?: { lat: number; lng: number };
  maxRecommendations?: number;
}

interface RecommendationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  places: PlaceData[];
}

export default function InstantRecommendationsMock({
  onPlaceSelect,
  onRefresh,
  userLocation,
  maxRecommendations = 10
}: InstantRecommendationsProps) {
  const router = useRouter();
  const { places, setPlaces, loading, setLoading } = useMockStore();
  
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);

  useEffect(() => {
    loadMockRecommendations();
  }, [userLocation]);

  const loadMockRecommendations = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRecommendations = await generateMockRecommendations();
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading mock recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockRecommendations = async (): Promise<RecommendationCategory[]> => {
    // Generate mock data based on user location or default location
    const location = userLocation || { lat: 37.7749, lng: -122.4194 };
    
    // Simulate Google Places API call
    const mockResults = await mockGooglePlacesClient.searchNearby({
      location,
      radius: 5000,
      type: 'restaurant'
    });

    // Transform mock results into recommendation categories
    const mockCategories: RecommendationCategory[] = [
      {
        id: 'trending',
        title: 'Trending Now',
        icon: <TrendingUp size={20} color="#FF6B6B" />,
        description: 'Popular places everyone is talking about',
        places: mockResults.results.slice(0, 3).map((place, index) => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          vicinity: place.vicinity,
          types: place.types,
          geometry: place.geometry,
          mood: 'trendy',
          category: place.types[0] || 'restaurant',
          distance: `${(Math.random() * 2 + 0.1).toFixed(1)} miles`,
          price: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
          isOpen: Math.random() > 0.3,
          waitTime: Math.floor(Math.random() * 30) + 5
        }))
      },
      {
        id: 'quick-bites',
        title: 'Quick Bites',
        icon: <Clock size={20} color="#4ECDC4" />,
        description: 'Fast and delicious options for busy people',
        places: mockResults.results.slice(3, 6).map((place, index) => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          vicinity: place.vicinity,
          types: place.types,
          geometry: place.geometry,
          mood: 'efficient',
          category: place.types[0] || 'restaurant',
          distance: `${(Math.random() * 2 + 0.1).toFixed(1)} miles`,
          price: ['$', '$$'][Math.floor(Math.random() * 2)],
          isOpen: Math.random() > 0.2,
          waitTime: Math.floor(Math.random() * 15) + 2
        }))
      },
      {
        id: 'hidden-gems',
        title: 'Hidden Gems',
        icon: <Star size={20} color="#45B7D1" />,
        description: 'Underrated spots with amazing quality',
        places: mockResults.results.slice(6, 9).map((place, index) => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          vicinity: place.vicinity,
          types: place.types,
          geometry: place.geometry,
          mood: 'discovery',
          category: place.types[0] || 'restaurant',
          distance: `${(Math.random() * 3 + 0.5).toFixed(1)} miles`,
          price: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
          isOpen: Math.random() > 0.4,
          waitTime: Math.floor(Math.random() * 45) + 10
        }))
      }
    ];

    return mockCategories;
  };

  const handlePlaceSelect = (place: PlaceData) => {
    if (onPlaceSelect) {
      onPlaceSelect(place);
    } else {
      // Navigate to results page with selected place
      router.push({
        pathname: '/results',
        params: { selectedPlace: JSON.stringify(place) }
      });
    }
  };

  const handleRefresh = () => {
    loadMockRecommendations(true);
    if (onRefresh) onRefresh();
  };

  const renderCategoryHeader = (category: RecommendationCategory) => (
    <View key={category.id} style={styles.categoryHeader}>
      <View style={styles.categoryTitleRow}>
        {category.icon}
        <Text style={styles.categoryTitle}>{category.title}</Text>
        {shouldShowMockIndicators() && (
          <View style={styles.mockBadge}>
            <Text style={styles.mockBadgeText}>MOCK</Text>
          </View>
        )}
      </View>
      <Text style={styles.categoryDescription}>{category.description}</Text>
    </View>
  );

  const renderPlaceCard = (place: PlaceData, index: number) => (
    <EnhancedPlaceCard
      key={`${place.id}-${index}`}
      place={place}
      onPress={() => handlePlaceSelect(place)}
      style={styles.placeCard}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading mock recommendations...</Text>
        {shouldShowMockIndicators() && (
          <Text style={styles.mockIndicator}>Using mock data for UI development</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Zap size={24} color="#FF6B6B" />
          <Text style={styles.title}>Instant Recommendations</Text>
          {shouldShowMockIndicators() && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>MOCK</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          Discover amazing places near you
        </Text>
      </View>

      {recommendations.map((category) => (
        <View key={category.id} style={styles.categorySection}>
          {renderCategoryHeader(category)}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {category.places.map((place, index) => renderPlaceCard(place, index))}
          </ScrollView>
        </View>
      ))}

      {recommendations.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recommendations available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginLeft: 36,
  },
  mockBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  mockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 12,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 36,
  },
  placeCard: {
    marginRight: 16,
    marginLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 12,
  },
  mockIndicator: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
