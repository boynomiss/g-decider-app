import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import AdPlacement from '../components/AdPlacement';
import CategoryButtons from '../components/CategoryButtons';
import MoodSlider from '../components/MoodSlider';
import ActionButton from '../components/ActionButton';
import Footer from '../components/Footer';
import APIStatus from '../components/APIStatus';
import FilterLogDisplay from '../components/FilterLogDisplay';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAppStore } from '../hooks/use-app-store';

// Extracted fixed content component
const FixedContent = React.memo(() => (
  <ErrorBoundary componentName="FixedContent">
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.fixedContent}>
        <ErrorBoundary componentName="Header">
          <Header />
        </ErrorBoundary>
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
        <ErrorBoundary componentName="ActionButton">
          <ActionButton />
        </ErrorBoundary>
        <ErrorBoundary componentName="FilterLogDisplay">
          <FilterLogDisplay visible={true} showPlaceTypes={true} />
        </ErrorBoundary>
      </View>
      <View style={styles.spacer} />
    </ScrollView>
  </ErrorBoundary>
));

// Extracted scrollable content component
const ScrollableContent = React.memo(() => (
  <ErrorBoundary componentName="ScrollableContent">
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ErrorBoundary componentName="Header">
        <Header />
      </ErrorBoundary>
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
      <ErrorBoundary componentName="ActionButton">
        <ActionButton />
      </ErrorBoundary>
      <ErrorBoundary componentName="FilterLogDisplay">
        <FilterLogDisplay visible={true} showPlaceTypes={true} />
      </ErrorBoundary>
      <View style={styles.spacer} />
    </ScrollView>
  </ErrorBoundary>
));

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { showMoreFilters } = useAppStore();

  // Memoized container style
  const containerStyle = useMemo(() => ({
    ...styles.container,
    paddingTop: insets.top,
  }), [insets.top]);

  // Memoized layout based on filter state
  const layout = useMemo(() => {
    if (!showMoreFilters) {
      // Scrollable layout when filters are collapsed
      return (
        <LinearGradient
          colors={['#C8A8E9', '#B19CD9']}
          style={containerStyle}
        >
          <FixedContent />
          <ErrorBoundary componentName="Footer">
            <Footer />
          </ErrorBoundary>
        </LinearGradient>
      );
    }

    // Scrollable layout when filters are expanded
    return (
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={containerStyle}
      >
        <ScrollableContent />
        <ErrorBoundary componentName="Footer">
          <Footer />
        </ErrorBoundary>
      </LinearGradient>
    );
  }, [showMoreFilters, containerStyle]);

  return (
    <ErrorBoundary componentName="HomeScreen">
      {layout}
    </ErrorBoundary>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedContent: {
    paddingBottom: SECTION_SPACING,
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 8,
  },
});
