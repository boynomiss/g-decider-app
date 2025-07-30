import React from 'react';
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
import { useAppStore } from '../hooks/use-app-store';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { showMoreFilters } = useAppStore();

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
  };

  if (!showMoreFilters) {
    // Non-scrollable layout when filters are collapsed
    return (
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={containerStyle}
      >
        <View style={styles.fixedContent}>
          <Header />
          <APIStatus isVisible={false} />
          <AdPlacement />
          <CategoryButtons />
          <MoodSlider />
        </View>
        <View style={styles.bottomSection}>
          <ActionButton />
          <Footer />
        </View>
      </LinearGradient>
    );
  }

  // Scrollable layout when filters are expanded
  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header />
        <APIStatus isVisible={false} />
        <AdPlacement />
        <CategoryButtons />
        <MoodSlider />
        <ActionButton />
        <View style={styles.spacer} />
      </ScrollView>
      <Footer />
    </LinearGradient>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedContent: {
    flex: 1,
    paddingBottom: SECTION_SPACING,
  },
  bottomSection: {
    justifyContent: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 8,
  },
});
