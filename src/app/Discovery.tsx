import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// UI Components
import { 
  Button, 
  Card, 
  ScrapedContentCard,
  MoodSlider 
} from '../components/ui';

// Features
import { Header } from '../features/auth';
import { InstantRecommendationsMock } from '../features/discovery/components/InstantRecommendationsMock';

// Store and Types
import { useMockStore } from '../store/mock-store';
import { PlaceData } from '../features/discovery/types';
import { SPACING } from '../shared/constants/constants';

/**
 * Discovery Screen Component
 * 
 * A screen for discovering new places and experiences featuring:
 * - Header with navigation
 * - Instant recommendations
 * - Mood-based filtering
 * - Place discovery interface
 * - Search and filter options
 */
export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { places, loading, setLoading } = useMockStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate loading places
  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
    };
    
    loadPlaces();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handlePlaceSelect = (place: PlaceData) => {
    router.push({
      pathname: '/results',
      params: { selectedPlace: JSON.stringify(place) }
    });
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleMoodChange = (mood: number) => {
    setSelectedMood(mood);
    // Filter places based on mood
    console.log('Mood changed to:', mood);
  };

  const getMoodLabel = (mood: number) => {
    if (mood < 33) return 'Chill';
    if (mood < 66) return 'Neutral';
    return 'Hype';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          
          {/* Welcome Section */}
          <Card variant="elevated" padding="large" style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Discover New Places</Text>
            <Text style={styles.welcomeSubtitle}>
              Find amazing experiences that match your mood and preferences
            </Text>
          </Card>
          
          {/* Mood-Based Filtering */}
          <MoodSlider
            value={selectedMood}
            onValueChange={handleMoodChange}
            title={`Discover ${getMoodLabel(selectedMood)} Places`}
            subtitle="Adjust your mood to find the perfect match"
            showLabels
            style={styles.moodSlider}
          />
          
          {/* Search Section */}
          <Card variant="outlined" padding="medium" style={styles.searchCard}>
            <Text style={styles.searchTitle}>Looking for something specific?</Text>
            <Button
              title="Search Places"
              onPress={handleSearch}
              variant="outline"
              size="medium"
              style={styles.searchButton}
            />
          </Card>
          
          {/* Instant Recommendations */}
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <InstantRecommendationsMock
              onPlaceSelect={handlePlaceSelect}
              onRefresh={handleRefresh}
              userLocation={{ lat: 37.7749, lng: -122.4194 }}
            />
          </View>
          
          {/* Featured Places */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Places</Text>
            {places.slice(0, 3).map((place) => (
              <ScrapedContentCard
                key={place.id}
                title={place.name}
                description={`A ${place.mood} ${place.category} experience`}
                imageUrl={`https://via.placeholder.com/400x200/7DD3C0/FFFFFF?text=${encodeURIComponent(place.name)}`}
                rating={place.rating}
                reviewCount={Math.floor(Math.random() * 200) + 50}
                address={`${place.distance} away`}
                price={place.price}
                category={place.category}
                isOpen={Math.random() > 0.3}
                onPress={() => handlePlaceSelect(place)}
                style={styles.featuredCard}
              />
            ))}
          </View>
          
          {/* Bottom Spacer */}
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 20,
    backgroundColor: '#7DD3C0',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  moodSlider: {
    marginBottom: 20,
  },
  searchCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchButton: {
    minWidth: 150,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    marginLeft: 16,
  },
  featuredCard: {
    marginBottom: 12,
  },
  spacer: {
    height: SPACING.XLARGE,
  },
});
