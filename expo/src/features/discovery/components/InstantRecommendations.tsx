import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock, TrendingUp, Star } from 'lucide-react-native';
import { PlaceMoodData as PlaceData } from '../../../shared/types/types';
import EnhancedPlaceCard from './EnhancedPlaceCard';
import { useRouter } from 'expo-router';
import { unifiedFilterService } from '../../filtering/services/filtering/unified-filter-service';
import { useAppStore } from '../../../store/store';
import { getAPIKey } from '../../../shared/constants/config/api-keys';

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
  const { filters } = useAppStore(); // Get filters directly from the hook
  
  console.log('🔍 InstantRecommendations filters check:', {
    filters,
    hasCategory: !!filters?.category,
    category: filters?.category
  });
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);

  useEffect(() => {
    loadInstantRecommendations();
  }, [userLocation]); // Remove filters dependency to prevent infinite loop

  const loadInstantRecommendations = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Force real API call instead of mock data
      console.log('🚀 Loading real instant recommendations...');
      const realRecommendations = await fetchRealRecommendations();
      setRecommendations(realRecommendations);
    } catch (error) {
      console.error('Error loading instant recommendations:', error);
      // Don't fall back to mock data - show error instead
      setRecommendations([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const seededShuffle = <T,>(array: T[], seed: number): T[] => {
    let s = seed >>> 0;
    const a: T[] = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      const ai = a[i] as T;
      const aj = a[j] as T;
      a[i] = aj as T;
      a[j] = ai as T;
    }
    return a;
  };

  const fetchRealRecommendations = async (): Promise<RecommendationCategory[]> => {
    console.log('🔍 Fetching real recommendations from Google API...');
    
    if (!userLocation) {
      console.log('❌ No user location available');
      return [];
    }

    // Use filters from props or fallback to avoid infinite loops
    const currentFilters = filters || {
      category: 'food',
      mood: 50,
      socialContext: 'solo',
      budget: 'P',
      timeOfDay: 'any',
      distanceRange: 10
    };
    
    if (!currentFilters.category) {
      console.log('❌ No category selected');
      return [];
    }

    try {
      console.log('🎯 Calling unifiedFilterService with filters:', currentFilters);
      
      // Call the unified filter service to get real Google API results
      const searchParams = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        lookingFor: currentFilters.category as 'food' | 'activity' | 'something-new',
        mood: currentFilters.mood || 50,
        ...(currentFilters.socialContext && { socialContext: currentFilters.socialContext }),
        ...(currentFilters.budget && { budget: currentFilters.budget }),
        timeOfDay: currentFilters.timeOfDay || 'any',
        maxRadius: (currentFilters.distanceRange || 10) * 1000, // Convert km to meters
        minResults: 10,
        maxResults: 20,
        apiKey: (() => {
          try {
            return getAPIKey.places();
          } catch (error) {
            console.error('❌ No Google Places API key available');
            throw new Error('Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
          }
        })()
      };

      console.log('🔍 Search params:', searchParams);
      
      const places = await unifiedFilterService.searchPlaces(searchParams);
      console.log('✅ Got real places from Google API:', places.length);

      const seed = (Date.now() ^ Math.floor(Math.random()*1_000_000)) >>> 0;
      const shuffledRaw = seededShuffle(places, seed);

      if (places.length === 0) {
        console.log('⚠️ No places found from Google API');
        return [];
      }

      // Convert places to the expected format
      const convertedPlaces: PlaceData[] = shuffledRaw.map(place => ({
        id: place.place_id,
        place_id: place.place_id,
        name: place.name,
        location: place.address ?? 'Unknown Location',
        images: [], // Google API places don't have images in this format
        budget: place.raw?.price_level ? (['P', 'PP', 'PPP'][place.raw.price_level - 1] as 'P' | 'PP' | 'PPP') : null,
        priceRange: (() => {
          // Try to extract price range from place data
          const typePriceMap: Record<string, string> = {
            'convenience_store': '₱1-200',
            'cafe': '₱200-400',
            'restaurant': '₱400-800',
            'fine_dining': '₱800+',
            'park': '₱1-200',
            'museum': '₱200-400',
            'spa': '₱800+',
            'bar': '₱400-600',
            'night_club': '₱600-800',
            'hotel': '₱800+',
            'casino': '₱800+'
          };
          
          if (place.tags && Array.isArray(place.tags)) {
            for (const tag of place.tags) {
              if (typePriceMap[tag]) {
                return typePriceMap[tag];
              }
            }
          }
          
          return null;
        })(),
        tags: place.tags || [],
        description: place.descriptor || `${place.name} is a great place to visit.`,
        openHours: place.opening_hours?.weekday_text?.join(', ') || 'Hours not available',
        category: filters.category as 'food' | 'activity' | 'something-new',
        mood: (filters.mood || 50) > 60 ? 'hype' : (filters.mood || 50) < 40 ? 'chill' : 'neutral',
        socialContext: ['solo', 'with-bae', 'barkada'],
        timeOfDay: ['morning', 'afternoon', 'night'],
        coordinates: {
          lat: place.lat || userLocation.lat,
          lng: place.lng || userLocation.lng
        },
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        reviews: place.user_ratings_total || 0,
        website: '',
        vicinity: place.address ?? 'Unknown Location',
        formatted_address: place.address,
        types: place.tags || [],
        price_level: place.raw?.price_level,
        opening_hours: place.opening_hours,
        user_ratings_total: place.user_ratings_total,
        photos: place.photos ? {
          thumbnail: place.photos.thumbnail || [],
          medium: place.photos.medium || [],
          large: place.photos.large || [],
          count: place.photos.count || 0
        } : { thumbnail: [], medium: [], large: [], count: 0 }
      }));

      // Create recommendation categories
      const categories: RecommendationCategory[] = [
        {
          id: 'trending',
          title: 'Trending Now',
          icon: <TrendingUp size={24} color="#8B5FBF" />,
          description: 'Popular places everyone is talking about',
          places: convertedPlaces.slice(0, 5)
        },
        {
          id: 'nearby',
          title: 'Nearby Gems',
          icon: <MapPin size={24} color="#8B5FBF" />,
          description: 'Great places close to you',
          places: convertedPlaces.slice(5, 10)
        },
        {
          id: 'top-rated',
          title: 'Top Rated',
          icon: <Star size={24} color="#8B5FBF" />,
          description: 'Highest rated places in the area',
          places: convertedPlaces.slice(10, 15).sort((a, b) => (b.rating || 0) - (a.rating || 0))
        }
      ];

      // Debug logging for photos
      console.log('📸 Photo debugging for first place:', {
        placeName: convertedPlaces[0]?.name,
        hasPhotos: !!convertedPlaces[0]?.photos,
        photoCount: convertedPlaces[0]?.photos?.count || 0,
        mediumPhotos: convertedPlaces[0]?.photos?.medium?.length || 0,
        samplePhoto: convertedPlaces[0]?.photos?.medium?.[0] || 'No photos'
      });
      
      // Additional detailed debugging
      console.log('🔍 Raw place data from unified filter service:', {
        placeName: places[0]?.name,
        hasPhotos: !!places[0]?.photos,
        photosType: typeof places[0]?.photos,
        photosKeys: places[0]?.photos ? Object.keys(places[0].photos) : 'No photos',
        photosValue: places[0]?.photos
      });
      
      console.log('🔍 Converted place data structure:', {
        placeName: convertedPlaces[0]?.name,
        hasPhotos: !!convertedPlaces[0]?.photos,
        photosType: typeof convertedPlaces[0]?.photos,
        photosKeys: convertedPlaces[0]?.photos ? Object.keys(convertedPlaces[0].photos) : 'No photos',
        photosValue: convertedPlaces[0]?.photos
      });
      
      console.log('✅ Created recommendation categories:', categories.map(c => ({ id: c.id, count: c.places.length })));
      return categories;

    } catch (error) {
      console.error('❌ Error fetching real recommendations:', error);
      throw error;
    }
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
              key={`${selectedCategoryData.places[currentPlaceIndex].id}_${currentPlaceIndex}`}
              place={selectedCategoryData.places[currentPlaceIndex]}
              onPress={() => {
                const place = selectedCategoryData.places[currentPlaceIndex];
                if (place) {
                  onPlaceSelect?.(place);
                }
              }}
              showFullDetails={false}
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