import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Sparkles } from 'lucide-react-native';
import Header from '../components/Header';
import AdPlacement from '../components/AdPlacement';
import CategoryButtons from '../components/CategoryButtons';
import MoodSlider from '../components/MoodSlider';
import ActionButton from '../components/ActionButton';
import Footer from '../components/Footer';
import APIStatus from '../components/APIStatus';
import FilterControlPanel from '../components/FilterControlPanel';
import InstantRecommendations from '../components/InstantRecommendations';
import { useAppStore } from '../hooks/use-app-store';
import { PlaceData } from '../utils/filtering/place-mood-service';
import { useRouter } from 'expo-router';

export default function EnhancedHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    showMoreFilters, 
    filters, 
    updateFilters,
    generateSuggestion 
  } = useAppStore();
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Memoized container style
  const containerStyle = useMemo(() => ({
    ...styles.container,
    paddingTop: insets.top,
  }), [insets.top]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
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

  const handleRefreshRecommendations = () => {
    console.log('Refreshing recommendations...');
  };

  // Fixed content for when filters are collapsed
  const FixedContent = React.memo(() => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.fixedContent}>
        <View style={styles.headerContainer}>
          <Header />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterPanel(true)}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <APIStatus isVisible={false} />
        <AdPlacement />
        <CategoryButtons />
        <MoodSlider />
        
        {/* Quick Access to Recommendations */}
        <TouchableOpacity
          style={styles.recommendationsButton}
          onPress={() => setShowRecommendations(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5FBF', '#9C6ECC']}
            style={styles.recommendationsGradient}
          >
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={styles.recommendationsText}>Instant Recommendations</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <ActionButton />
      </View>
      <View style={styles.spacer} />
    </ScrollView>
  ));

  // Scrollable content for when filters are expanded
  const ScrollableContent = React.memo(() => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Header />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterPanel(true)}
          activeOpacity={0.7}
        >
          <Settings size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <APIStatus isVisible={false} />
      <AdPlacement />
      <CategoryButtons />
      <MoodSlider />
      
      {/* Embedded Filter Panel Preview */}
      <View style={styles.filterPreviewContainer}>
        <FilterControlPanel
          filters={filters}
          onFiltersChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          visible={true}
          showAsModal={false}
        />
      </View>
      
      <ActionButton />
      
      {/* Inline Recommendations */}
      <View style={styles.inlineRecommendations}>
        <Text style={styles.sectionTitle}>While You Decide...</Text>
        <InstantRecommendations
          onPlaceSelect={handlePlaceSelect}
          onRefresh={handleRefreshRecommendations}
          userLocation={filters.userLocation}
          maxRecommendations={5}
        />
      </View>
      
      <View style={styles.spacer} />
    </ScrollView>
  ));

  // Layout based on filter state and recommendations state
  const layout = useMemo(() => {
    if (showRecommendations) {
      return (
        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationsHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowRecommendations(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.recommendationsTitle}>Instant Recommendations</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterPanel(true)}
              activeOpacity={0.7}
            >
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.recommendationsContent}>
            <InstantRecommendations
              onPlaceSelect={handlePlaceSelect}
              onRefresh={handleRefreshRecommendations}
              userLocation={filters.userLocation}
            />
          </View>
        </View>
      );
    }

    if (!showMoreFilters) {
      return <FixedContent />;
    }

    return <ScrollableContent />;
  }, [showMoreFilters, showRecommendations, filters.userLocation]);

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      {layout}
      
      {/* Filter Control Panel Modal */}
      <FilterControlPanel
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        showAsModal={true}
      />

      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedContent: {
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  recommendationsButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recommendationsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterPreviewContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  inlineRecommendations: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  spacer: {
    height: 100,
  },
  recommendationsContainer: {
    flex: 1,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  recommendationsContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});