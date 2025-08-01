import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserFilters } from '../types/app';

interface FilteringProgressProps {
  filters: UserFilters;
}

export const FilteringProgress: React.FC<FilteringProgressProps> = ({ filters }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hasShownMinimum, setHasShownMinimum] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const startTime = useRef(Date.now()).current;

  // Get the selected filters (non-null values)
  const selectedFilters = [
    filters.mood !== null && 'mood',
    filters.budget !== null && 'budget',
    filters.socialContext !== null && 'context',
    filters.distanceRange !== null && 'distance',
    filters.timeOfDay !== null && 'time'
  ].filter(Boolean) as string[];

  // If no specific filters are selected, show all
  const wordsToShow = selectedFilters.length > 0 ? selectedFilters : ['mood', 'budget', 'context', 'distance', 'time'];

  useEffect(() => {
    const animateWords = () => {
      Animated.sequence([
        // Fade out and scale down
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Small delay for readability
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        // Change word
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setCurrentWordIndex((prev) => (prev + 1) % wordsToShow.length);
      });
    };

    // Check if minimum time has passed
    const checkMinimumTime = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 3000) {
        setHasShownMinimum(true);
      }
    };

    const wordInterval = setInterval(animateWords, 750); // Change words every 0.75 seconds
    const minimumTimeInterval = setInterval(checkMinimumTime, 100);

    return () => {
      clearInterval(wordInterval);
      clearInterval(minimumTimeInterval);
    };
  }, [wordsToShow.length, fadeAnim, scaleAnim, startTime]);

  const getCurrentWord = () => {
    return wordsToShow[currentWordIndex];
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={styles.container}
    >
      <Text style={styles.title}>Finding Your Perfect Match</Text>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>We're finding your perfect match based on your </Text>
        <Animated.Text 
          style={[
            styles.animatedWord, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {getCurrentWord()}
        </Animated.Text>
        <Text style={styles.subtitle}>...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  animatedWord: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 