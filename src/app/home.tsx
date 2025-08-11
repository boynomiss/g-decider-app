import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Header } from '../features/auth';
import { AdPlacement } from '../features/monetization';
import CategoryButtons from '../components/ui/CategoryButtons';
import { MoodSlider } from '../features/filtering';
import GButton from '../components/ui/GButton';
import { Footer } from '../features/auth';
import APIStatus from '../components/feedback/APIStatus';
import { FilterControlPanel } from '../features/filtering';

import { FilterLogDisplay } from '../features/filtering';
import { useAppStore } from '../store/store';
import { PlaceData } from '../features/discovery/types';
import { SPACING } from '../shared/constants/constants';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    showMoreFilters, 
    filters, 
    updateFilters,
    userLocation
  } = useAppStore();
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);

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
      mood: 50,
      distanceRange: 50
    });
  };

  const handlePlaceSelect = (place: PlaceData) => {
    // Navigate to results page - the suggestion will be handled by the app store
    router.push('/results');
  };

  // Main scrollable content
  const MainContent = React.memo(() => (
    <ErrorBoundary componentName="MainContent">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Header />
          </View>
          
          <ErrorBoundary componentName="APIStatus">
            <APIStatus isVisible={false} />
          </ErrorBoundary>
          <ErrorBoundary componentName="AdPlacement">
            <AdPlacement />
          </ErrorBoundary>
          <ErrorBoundary componentName="CategoryButtons">
            <CategoryButtons />
          </ErrorBoundary>
          <ErrorBoundary componentName="MoodSlider">
            <MoodSlider />
          </ErrorBoundary>
          
          {/* G Button positioned below MoodSlider when showMoreFilters is true */}
          {showMoreFilters && (
            <View style={styles.gButtonInlineContainer}>
              <ErrorBoundary componentName="GButton">
                <GButton />
              </ErrorBoundary>
            </View>
          )}
          
          {/* Spacer to bring FilterLogDisplay down */}
          <View style={styles.filterSpacer} />
          
          <ErrorBoundary componentName="FilterLogDisplay">
            <FilterLogDisplay visible={true} showPlaceTypes={true} />
          </ErrorBoundary>
          
          {/* Bottom spacer for footer */}
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </ErrorBoundary>
  ));

  return (
    <View style={styles.container}>
      {/* Main content with purple background */}
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={styles.mainContent}
      >
        <View style={containerStyle}>
          <MainContent />
        </View>
        
        {/* Footer */}
        <ErrorBoundary componentName="Footer">
          <Footer />
        </ErrorBoundary>
      </LinearGradient>
      
      {/* G Button - Only show at bottom when showMoreFilters is false */}
      {!showMoreFilters && (
        <View style={styles.gButtonArea}>
          <ErrorBoundary componentName="GButton">
            <GButton />
          </ErrorBoundary>
        </View>
      )}
      
      {/* Filter Control Panel Modal */}
      <FilterControlPanel
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        showAsModal={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.CONTAINER_PADDING,
    paddingVertical: SPACING.CONTAINER_PADDING_VERTICAL,
  },
  headerContainer: {
    // No margin needed - Header component handles its own spacing
  },
  spacer: {
    height: SPACING.XLARGE * 4, // 96px
  },
  mainContent: {
    flex: 1,
  },
  gButtonArea: {
    // G Button area outside LinearGradient when at bottom
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  gButtonInlineContainer: {
    // G Button container when positioned below MoodSlider
    alignItems: 'center',
    marginTop: 20, // Add some spacing below the MoodSlider
    marginBottom: 20, // Add some spacing above the next element
  },
  filterSpacer: {
    // Spacer to bring FilterLogDisplay down by 100px
    height: 100,
  },
});
