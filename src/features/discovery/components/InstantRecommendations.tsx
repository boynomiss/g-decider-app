import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock, TrendingUp, Star } from 'lucide-react-native';
import { PlaceMoodData as PlaceData } from '../../../shared/types/types';
import EnhancedPlaceCard from './EnhancedPlaceCard';
import { useRouter } from 'expo-router';

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

export default function InstantRecommendations({
  onPlaceSelect,
  onRefresh,
  userLocation,
  maxRecommendations = 10
}: InstantRecommendationsProps) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);

  useEffect(() => {
    loadInstantRecommendations();
  }, [userLocation]);

  const loadInstantRecommendations = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Simulate API call to background agent cache
      const cachedRecommendations = await fetchCachedRecommendations();
      setRecommendations(cachedRecommendations);
    } catch (error) {
      console.error('Error loading instant recommendations:', error);
      // Fallback to mock data
      setRecommendations(getMockRecommendations());
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCachedRecommendations = async (): Promise<RecommendationCategory[]> => {
    // This would make a real API call to your background agent cache
    // For now, we'll simulate with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return getMockRecommendations();
  };

  const getMockRecommendations = (): RecommendationCategory[] => {
    // Mock data representing cached recommendations from background agent
    const mockPlaces: PlaceData[] = [
      {
        place_id: 'trending_1',
        name: 'The Local Coffee Co.',
        address: 'Makati City, Metro Manila',
        category: 'cafe',
        rating: 4.6,
        user_ratings_total: 324,
        reviews: [],
        mood_score: 75,
        final_mood: 'hype',
        photos: {
          thumbnail: ['https://picsum.photos/150/150?random=1'],
          medium: ['https://picsum.photos/400/300?random=1'],
          large: ['https://picsum.photos/800/600?random=1'],
          count: 1
        },
        contact: {
          website: 'https://thelocalcoffee.com',
          phone: '+63 2 1234 5678',
          formattedPhone: '+63 2 1234 5678',
          hasContact: true
        },
        contactActions: {
          canCall: true,
          canVisitWebsite: true,
          callUrl: 'tel:+6321234567',
          websiteUrl: 'https://thelocalcoffee.com'
        },
        price_level: 2,
        business_status: 'OPERATIONAL'
      },
      {
        place_id: 'trending_2',
        name: 'BGC Food Park',
        address: 'Bonifacio Global City, Taguig',
        category: 'restaurant',
        rating: 4.4,
        user_ratings_total: 156,
        reviews: [],
        mood_score: 85,
        final_mood: 'hype',
        photos: {
          thumbnail: ['https://picsum.photos/150/150?random=2'],
          medium: ['https://picsum.photos/400/300?random=2'],
          large: ['https://picsum.photos/800/600?random=2'],
          count: 1
        },
        contact: {
          hasContact: false
        },
        contactActions: {
          canCall: false,
          canVisitWebsite: false
        },
        price_level: 2,
        business_status: 'OPERATIONAL'
      },
      {
        place_id: 'nearby_1',
        name: 'Greenbelt Park',
        address: 'Makati City, Metro Manila',
        category: 'park',
        rating: 4.2,
        user_ratings_total: 89,
        reviews: [],
        mood_score: 45,
        final_mood: 'chill',
        photos: {
          thumbnail: ['https://picsum.photos/150/150?random=3'],
          medium: ['https://picsum.photos/400/300?random=3'],
          large: ['https://picsum.photos/800/600?random=3'],
          count: 1
        },
        contact: {
          hasContact: false
        },
        contactActions: {
          canCall: false,
          canVisitWebsite: false
        },
        price_level: 0,
        business_status: 'OPERATIONAL'
      }
    ];

    return [
      {
        id: 'trending',
        title: 'Trending Now',
        icon: <TrendingUp size={20} color="#FF6B6B" />,
        description: 'Popular places others are discovering',
        places: mockPlaces.filter(p => p.mood_score && p.mood_score > 70)
      },
      {
        id: 'nearby',
        title: 'Near You',
        icon: <MapPin size={20} color="#4ECDC4" />,
        description: 'Great spots within walking distance',
        places: mockPlaces.filter(p => p.place_id.includes('nearby'))
      },
      {
        id: 'quick',
        title: 'Quick Picks',
        icon: <Clock size={20} color="#45B7D1" />,
        description: 'Perfect for when you need something fast',
        places: mockPlaces.filter(p => p.rating >= 4.5)
      },
      {
        id: 'top_rated',
        title: 'Top Rated',
        icon: <Star size={20} color="#FFA726" />,
        description: 'Highest rated places in your area',
        places: mockPlaces.sort((a, b) => b.rating - a.rating).slice(0, 3)
      }
    ];
  };

  const handleRefresh = async () => {
    await loadInstantRecommendations(true);
    onRefresh?.();
  };

  const handlePass = () => {
    if (selectedCategoryData && currentPlaceIndex < selectedCategoryData.places.length - 1) {
      setCurrentPlaceIndex(currentPlaceIndex + 1);
    } else {
      // If we've gone through all places in this category, reset to first
      setCurrentPlaceIndex(0);
    }
  };

  const handleRestart = () => {
    router.push('/home');
  };

  const getSelectedCategoryData = () => {
    return recommendations.find(cat => cat.id === selectedCategory) || recommendations[0];
  };

  if (isLoading && recommendations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#C8A8E9', '#B19CD9']}
          style={styles.loadingGradient}
        >
          <Zap size={32} color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading instant recommendations...</Text>
        </LinearGradient>
      </View>
    );
  }

  const selectedCategoryData = getSelectedCategoryData();

  return (
    <LinearGradient colors={['#C8A8E9', '#B19CD9']} style={styles.container}>
      {/* Single Place Display */}
      <View style={styles.singlePlaceContainer}>
        {selectedCategoryData && selectedCategoryData.places && selectedCategoryData.places.length > 0 && selectedCategoryData.places[currentPlaceIndex] ? (
          <>
            <EnhancedPlaceCard
              key={`${selectedCategoryData.places[currentPlaceIndex].place_id}_${currentPlaceIndex}`}
              place={selectedCategoryData.places[currentPlaceIndex]}
              onPress={() => onPlaceSelect?.(selectedCategoryData.places[currentPlaceIndex])}
              showFullDetails={true}
              onPass={handlePass}
              onRestart={handleRestart}
            />
            

          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No recommendations available for this category yet.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },


  placesContainer: {
    flex: 1,
  },
  singlePlaceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});