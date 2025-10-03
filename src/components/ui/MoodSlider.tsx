/**
 * MVP Mood Slider - How are you feeling?
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';

export interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  title?: string;
  style?: ViewStyle;
  testID?: string;
}

export default function MoodSlider({
  value,
  onValueChange,
  title = "How are you feeling today?",
  style,
  testID
}: MoodSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleSlidingStart = () => {
    setIsDragging(true);
  };

  const handleSlidingComplete = (newValue: number) => {
    setIsDragging(false);
    onValueChange(newValue);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Slider Labels */}
      <View style={styles.sliderLabels}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelEmoji}>😌</Text>
          <Text style={styles.labelText}>Chill</Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.labelEmoji}>🔥</Text>
          <Text style={styles.labelText}>Hype</Text>
        </View>
      </View>
      
      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={value}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#7DD3C0"
          maximumTrackTintColor="#E2E8F0"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  labelContainer: {
    alignItems: 'center',
  },
  labelEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
