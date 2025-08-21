import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Slider } from '@react-native-community/slider';

/**
 * MoodSlider Component Props
 * @interface MoodSliderProps
 * @property {number} value - Current mood value (0-100)
 * @property {(value: number) => void} onValueChange - Function called when mood value changes
 * @property {string} title - Title text above the slider
 * @property {string} subtitle - Subtitle text below the title
 * @property {boolean} showLabels - Whether to show mood labels (Chill, Neutral, Hype)
 * @property {ViewStyle} style - Additional styles for the container
 * @property {string} testID - Test identifier for testing
 */
interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  title?: string;
  subtitle?: string;
  showLabels?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A mood slider component for filtering based on user's current mood
 * 
 * @example
 * ```tsx
 * <MoodSlider
 *   value={mood}
 *   onValueChange={setMood}
 *   title="How are you feeling?"
 *   subtitle="This helps us find the perfect match"
 *   showLabels
 * />
 * ```
 */
export default function MoodSlider({
  value,
  onValueChange,
  title = "How are you feeling?",
  subtitle,
  showLabels = true,
  style,
  testID
}: MoodSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getMoodLabel = (moodValue: number) => {
    if (moodValue < 33) return 'Chill';
    if (moodValue < 66) return 'Neutral';
    return 'Hype';
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue < 33) return '#4ECDC4'; // Teal for chill
    if (moodValue < 66) return '#45B7D1'; // Blue for neutral
    return '#FF6B6B'; // Red for hype
  };

  const getMoodEmoji = (moodValue: number) => {
    if (moodValue < 33) return '😌';
    if (moodValue < 66) return '😐';
    return '🔥';
  };

  const handleSlidingStart = () => {
    setIsDragging(true);
  };

  const handleSlidingComplete = (newValue: number) => {
    setIsDragging(false);
    onValueChange(newValue);
  };

  const handleQuickSelect = (moodValue: number) => {
    onValueChange(moodValue);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      
      {/* Current Mood Display */}
      <View style={styles.moodDisplay}>
        <Text style={styles.moodEmoji}>
          {getMoodEmoji(value)}
        </Text>
        <Text style={[styles.moodLabel, { color: getMoodColor(value) }]}>
          {getMoodLabel(value)}
        </Text>
        <Text style={styles.moodValue}>
          {Math.round(value)}
        </Text>
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
          thumbStyle={[
            styles.thumb,
            { backgroundColor: getMoodColor(value) }
          ]}
          trackStyle={styles.track}
        />
      </View>
      
      {/* Quick Select Buttons */}
      {showLabels && (
        <View style={styles.quickSelectContainer}>
          <TouchableOpacity
            style={[
              styles.quickSelectButton,
              value < 33 && styles.quickSelectButtonActive
            ]}
            onPress={() => handleQuickSelect(16)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.quickSelectText,
              value < 33 && styles.quickSelectTextActive
            ]}>
              😌 Chill
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickSelectButton,
              value >= 33 && value < 66 && styles.quickSelectButtonActive
            ]}
            onPress={() => handleQuickSelect(50)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.quickSelectText,
              value >= 33 && value < 66 && styles.quickSelectTextActive
            ]}>
              😐 Neutral
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickSelectButton,
              value >= 66 && styles.quickSelectButtonActive
            ]}
            onPress={() => handleQuickSelect(84)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.quickSelectText,
              value >= 66 && styles.quickSelectTextActive
            ]}>
              🔥 Hype
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Mood Scale Labels */}
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>Chill</Text>
        <Text style={styles.scaleLabel}>Neutral</Text>
        <Text style={styles.scaleLabel}>Hype</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  moodValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickSelectButtonActive: {
    backgroundColor: '#7DD3C0',
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  quickSelectTextActive: {
    color: '#FFFFFF',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
