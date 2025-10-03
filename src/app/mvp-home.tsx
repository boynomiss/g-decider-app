/**
 * MVP Home Screen - Simplified core functionality
 */

import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { MoodSlider, CategoryButtons, GButton } from '../components';
import { useMVPStore } from '../store/mvp-store';

export default function MVPHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences, updatePreferences, searchPlaces, isLoading, error } = useMVPStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [moodValue, setMoodValue] = useState(50);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    updatePreferences({ lookingFor: [categoryId] });
  };

  const handleMoodChange = (value: number) => {
    setMoodValue(value);
    updatePreferences({ mood: value });
  };

  const handleSearch = async () => {
    if (!selectedCategory) return;
    
    try {
      // Update preferences with current selections
      const updatedPreferences = {
        ...userPreferences,
        lookingFor: [selectedCategory],
        mood: moodValue
      };
      
      // Search places using Firebase
      await searchPlaces(updatedPreferences);
      
      // Navigate to results
      router.push('/mvp-results');
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const isButtonDisabled = !selectedCategory;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={styles.background}
      >
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.appTitle}>G-Decider</Text>
              <Text style={styles.appSubtitle}>Find the perfect place for your mood</Text>
            </View>

            {/* Category Selection */}
            <CategoryButtons 
              title="Looking for:" 
              onCategoryChange={handleCategoryChange}
            />

            {/* Mood Slider */}
            <MoodSlider 
              value={moodValue}
              onValueChange={handleMoodChange}
              title="How are you feeling today?"
            />

            {/* G! Button */}
            <GButton 
              size={120} 
              disabled={isButtonDisabled || isLoading}
              onPress={handleSearch}
            />

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});
