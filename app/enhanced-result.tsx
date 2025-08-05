import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useAppStore } from '../hooks/use-app-store';
import { PlaceData } from '../utils/place-mood-service';
import EnhancedPlaceCard from '../components/EnhancedPlaceCard';
import FilterFeedbackBanner, { FilterRelaxationInfo, createFilterRelaxationInfo } from '../components/FilterFeedbackBanner';
import FilterControlPanel from '../components/FilterControlPanel';
import InstantRecommendations from '../components/InstantRecommendations';
import Footer from '../components/Footer';

export default function EnhancedResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    currentSuggestion, 
    filters,
    updateFilters,
    resetSuggestion,
    generateSuggestion,
    isLoading,
    effectiveFilters
  } = useAppStore();

  // State for new features
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterRelaxationInfo, setFilterRelaxationInfo] = useState<FilterRelaxationInfo | undefined>();
  const [showBanner, setShowBanner] = useState(false);
  const [currentResults, setCurrentResults] = useState<PlaceData[]>([]);
  const [showInstantRecommendations, setShowInstantRecommendations] = useState(false);

  useEffect(() => {
    // Show instant recommendations if no current suggestion
    setShowInstantRecommendations(!currentSuggestion && !isLoading);
  }, [currentSuggestion, isLoading]);

  // Mock function to simulate progressive filtering results
  const simulateProgressiveFiltering = () => {
    // This would come from your backend's progressive filtering logic
    const relaxedFilters = ['mood', 'budget']; // Example relaxed filters
    const originalFilters = Object.keys(filters).filter(key => filters[key as keyof typeof filters] !== null);
    
    const relaxationInfo = createFilterRelaxationInfo(
      relaxedFilters,
      originalFilters,
      "We couldn't find places matching all your preferences, but here are some great options nearby!"
    );
    
    setFilterRelaxationInfo(relaxationInfo);
    setShowBanner(true);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
    // Auto-hide banner when filters change
    setShowBanner(false);
  };

  const handleResetFilters = () => {
    updateFilters({
      category: null,
      mood: 50,
      socialContext: null,
      budget: null,
      timeOfDay: null,
      distanceRange: 50
    });
    setShowBanner(false);
    setFilterRelaxationInfo(undefined);
  };

  const handleRetryStrict = () => {
    // Retry with original strict filters
    setShowBanner(false);
    generateSuggestion();
  };

  const handlePlaceSelect = (place: PlaceData) => {
    // Convert PlaceData to Suggestion format for compatibility
    const suggestion = {
      id: place.place_id,
      name: place.name,
      location: place.address,
      images: place.photos?.medium || [],
      budget: place.price_level === 1 ? 'P' as const : 
              place.price_level === 2 ? 'PP' as const : 
              place.price_level === 3 ? 'PPP' as const : 'PP' as const,
      tags: place.types?.slice(0, 3) || [],
      description: place.editorial_summary || `${place.name} is a ${place.category} in ${place.address}`,
      category: place.category as 'food' | 'activity' | 'something-new',
      mood: place.final_mood as 'chill' | 'hype' | 'both',
      socialContext: ['solo', 'with-bae', 'barkada'] as const,
      timeOfDay: ['morning', 'afternoon', 'night'] as const,
      coordinates: place.location,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      website: place.contact?.website
    };
    
    // Update current suggestion and navigate
    updateFilters({ currentSuggestion: suggestion });
    router.push('/result');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefreshRecommendations = () => {
    // Refresh instant recommendations
    console.log('Refreshing recommendations...');
  };

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Filter Feedback Banner */}
      <FilterFeedbackBanner
        relaxationInfo={filterRelaxationInfo}
        visible={showBanner}
        onDismiss={() => setShowBanner(false)}
        onRetryStrict={handleRetryStrict}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: showBanner ? 80 : 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {showInstantRecommendations ? 'Recommendations' : 'Results'}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilterPanel(true)}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          {!showInstantRecommendations && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => simulateProgressiveFiltering()}
              activeOpacity={0.7}
            >
              <RefreshCw size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {showInstantRecommendations ? (
          // Show instant recommendations when no search results
          <InstantRecommendations
            onPlaceSelect={handlePlaceSelect}
            onRefresh={handleRefreshRecommendations}
            userLocation={filters.userLocation}
          />
        ) : currentSuggestion ? (
          // Show single result (existing behavior)
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <EnhancedPlaceCard
              place={{
                place_id: currentSuggestion.id,
                name: currentSuggestion.name,
                address: currentSuggestion.location,
                category: currentSuggestion.category,
                rating: currentSuggestion.rating || 4.0,
                user_ratings_total: currentSuggestion.reviewCount || 0,
                reviews: [],
                mood_score: currentSuggestion.mood === 'hype' ? 80 : 
                           currentSuggestion.mood === 'chill' ? 30 : 50,
                final_mood: currentSuggestion.mood === 'both' ? 'neutral' : currentSuggestion.mood,
                photos: {
                  thumbnail: currentSuggestion.images.map(img => img.replace('400/300', '150/150')),
                  medium: currentSuggestion.images,
                  large: currentSuggestion.images.map(img => img.replace('400/300', '800/600')),
                  count: currentSuggestion.images.length
                },
                contact: {
                  website: currentSuggestion.website,
                  hasContact: !!currentSuggestion.website
                },
                contactActions: {
                  canCall: false,
                  canVisitWebsite: !!currentSuggestion.website,
                  websiteUrl: currentSuggestion.website
                },
                price_level: currentSuggestion.budget === 'P' ? 1 : 
                            currentSuggestion.budget === 'PP' ? 2 : 3,
                business_status: 'OPERATIONAL'
              }}
              showFullDetails={true}
            />
          </ScrollView>
        ) : isLoading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Finding perfect places for you...</Text>
          </View>
        ) : (
          // No results state
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No Results Found</Text>
            <Text style={styles.noResultsSubtitle}>
              Try adjusting your filters or explore our recommendations
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => setShowInstantRecommendations(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.exploreButtonText}>Explore Recommendations</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Control Panel Modal */}
      <FilterControlPanel
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        showAsModal={true}
      />

      {/* Footer */}
      <Footer />
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
    paddingBottom: 16,
    zIndex: 999,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});