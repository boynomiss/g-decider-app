import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '@/hooks/use-app-store';

const budgetOptions = [
  { display: '₱', value: 'P' as const },
  { display: '₱₱', value: 'PP' as const },
  { display: '₱₱₱', value: 'PPP' as const }
];
const timeOptions = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'night', label: 'Night' },
] as const;
const socialOptions = [
  { id: 'solo', label: 'Solo', icon: '🧍' },
  { id: 'with-bae', label: 'With Bae', icon: '❤️' },
  { id: 'barkada', label: 'Barkada', icon: '🎉' },
] as const;

const moodLabels = {
  1: { emoji: '😌', text: 'Chill' },
  2: { emoji: '🧘‍♀️', text: 'Zen' },
  3: { emoji: '☕', text: 'Mellow' },
  4: { emoji: '🏞️', text: 'Tranquil' },
  5: { emoji: '👀', text: 'Eager' },
  6: { emoji: '🎶', text: 'Upbeat' },
  7: { emoji: '🥳', text: 'Lively' },
  8: { emoji: '💪', text: 'Pumped' },
  9: { emoji: '🤩', text: 'Thrilled' },
  10: { emoji: '🔥', text: 'Hype' }
} as const;

const distanceLabels = {
  1: { emoji: '🚶‍♀️', text: 'Very Close' },
  2: { emoji: '🚶‍♀️', text: 'Walking Distance' },
  3: { emoji: '🚶‍♀️', text: 'Walking Distance' },
  4: { emoji: '🚶‍♀️', text: 'Walking Distance' },
  5: { emoji: '🚴', text: 'Bike Distance' },
  6: { emoji: '🚴', text: 'Bike Distance' },
  7: { emoji: '🚗', text: 'Short Trip' },
  8: { emoji: '🚗', text: 'Short Trip' },
  9: { emoji: '🚗', text: 'Short Trip' },
  10: { emoji: '🚗', text: 'Short Trip' },
  11: { emoji: '🚗', text: 'Short Trip' },
  12: { emoji: '🛣️', text: 'Nearby Drive' },
  13: { emoji: '🛣️', text: 'Nearby Drive' },
  14: { emoji: '🛣️', text: 'Nearby Drive' },
  15: { emoji: '🛣️', text: 'Nearby Drive' },
  16: { emoji: '🛣️', text: 'Nearby Drive' },
  17: { emoji: '💨', text: 'Moderate Drive' },
  18: { emoji: '💨', text: 'Moderate Drive' },
  19: { emoji: '💨', text: 'Moderate Drive' },
  20: { emoji: '🗺️', text: 'Further Out' },
  21: { emoji: '🗺️', text: 'Further Out' },
  22: { emoji: '🗺️', text: 'Further Out' },
  23: { emoji: '🚀', text: 'Long Drive' },
  24: { emoji: '🌍', text: 'Any Distance' }
} as const;

export default function MoodSlider() {
  const { filters, updateFilters, showMoreFilters, toggleMoreFilters } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const translateX = useSharedValue((filters.mood / 100) * 280);
  const distanceTranslateX = useSharedValue(filters.distanceRange ? (((filters.distanceRange - 1) / 23) * 280) : 140);
  
  const updateMood = (value: number) => {
    const newMood = Math.max(0, Math.min(100, value));
    console.log('Updating mood to:', newMood);
    updateFilters({ mood: newMood });
  };

  const setDraggingState = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  const getMoodLevel = (moodValue: number) => {
    return Math.max(1, Math.min(10, Math.round((moodValue / 100) * 10) || 1));
  };

  const getCurrentMoodLabel = () => {
    const level = getMoodLevel(filters.mood);
    return moodLabels[level as keyof typeof moodLabels];
  };

  const getCurrentDistanceLabel = () => {
    const distance = filters.distanceRange || 12;
    const roundedDistance = Math.max(1, Math.min(24, Math.round(distance)));
    return distanceLabels[roundedDistance as keyof typeof distanceLabels];
  };

  const updateDistance = (value: number) => {
    const newDistance = Math.max(1, Math.min(24, value));
    console.log('Updating distance to:', newDistance);
    updateFilters({ distanceRange: newDistance });
  };

  const handleSocialContextPress = (socialId: 'solo' | 'with-bae' | 'barkada') => {
    if (filters.socialContext === socialId) {
      // Deselect if already selected
      updateFilters({ socialContext: null });
    } else {
      // Select the new option
      updateFilters({ socialContext: socialId });
    }
  };

  const handleBudgetPress = (budgetValue: 'P' | 'PP' | 'PPP') => {
    if (filters.budget === budgetValue) {
      // Deselect if already selected
      updateFilters({ budget: null });
    } else {
      // Select the new option
      updateFilters({ budget: budgetValue });
    }
  };

  const handleTimeOfDayPress = (timeId: 'morning' | 'afternoon' | 'night') => {
    if (filters.timeOfDay === timeId) {
      // Deselect if already selected
      updateFilters({ timeOfDay: null });
    } else {
      // Select the new option
      updateFilters({ timeOfDay: timeId });
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX?: number }) => {
      context.startX = translateX.value;
      runOnJS(setDraggingState)(true);
    },
    onActive: (event, context) => {
      const startX = context.startX ?? 0;
      const newX = Math.max(0, Math.min(280, startX + event.translationX));
      translateX.value = newX;
      const newValue = (newX / 280) * 100;
      runOnJS(updateMood)(newValue);
    },
    onEnd: () => {
      runOnJS(setDraggingState)(false);
    },
  });

  const distanceGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX?: number }) => {
      context.startX = distanceTranslateX.value;
    },
    onActive: (event, context) => {
      const startX = context.startX ?? 0;
      const newX = Math.max(0, Math.min(280, startX + event.translationX));
      distanceTranslateX.value = newX;
      const newValue = 1 + (newX / 280) * 23;
      runOnJS(updateDistance)(newValue);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + 10,
    };
  });

  const distanceThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: distanceTranslateX.value }],
    };
  });

  const distanceTrackStyle = useAnimatedStyle(() => {
    return {
      width: distanceTranslateX.value + 10,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      
      <View style={styles.sliderContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>😌 Chill</Text>
          <Text style={styles.label}>Hype 🔥</Text>
        </View>
        
        <View style={styles.sliderTrack}>
          <Animated.View style={[styles.activeTrack, trackStyle]} />
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.thumb, thumbStyle]}>
              {isDragging && (
                <View style={styles.valueDisplay}>
                  <Text style={styles.valueEmoji}>{getCurrentMoodLabel().emoji}</Text>
                  <Text style={styles.valueText}>{getCurrentMoodLabel().text}</Text>
                  <View style={styles.valueArrow} />
                </View>
              )}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.expandButton}
        onPress={toggleMoreFilters}
      >
        <Text style={styles.expandText}>
          {showMoreFilters ? 'View less filters' : 'View more filters'}
        </Text>
        {showMoreFilters ? (
          <ChevronUp size={16} color="#7DD3C0" />
        ) : (
          <ChevronDown size={16} color="#7DD3C0" />
        )}
      </TouchableOpacity>

      {showMoreFilters && (
        <View style={styles.expandedFilters}>
          {/* Social Context */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Social Context:</Text>
            <View style={styles.optionsRow}>
              {socialOptions.map((social) => (
                <TouchableOpacity
                  key={social.id}
                  style={[
                    styles.optionButton,
                    filters.socialContext === social.id && styles.activeOption
                  ]}
                  onPress={() => handleSocialContextPress(social.id)}
                >
                  <Text style={styles.optionIcon}>{social.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    filters.socialContext === social.id && styles.activeOptionText
                  ]}>
                    {social.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Budget:</Text>
            <View style={styles.optionsRow}>
              {budgetOptions.map((budget) => (
                <TouchableOpacity
                  key={budget.value}
                  style={[
                    styles.optionButton,
                    filters.budget === budget.value && styles.activeOption
                  ]}
                  onPress={() => handleBudgetPress(budget.value)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.budget === budget.value && styles.activeOptionText
                  ]}>
                    {budget.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time of Day */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Time of Day:</Text>
            <View style={styles.optionsRow}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time.id}
                  style={[
                    styles.optionButton,
                    filters.timeOfDay === time.id && styles.activeOption
                  ]}
                  onPress={() => handleTimeOfDayPress(time.id)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.timeOfDay === time.id && styles.activeOptionText
                  ]}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Range */}
          <View style={styles.filterSection}>
            <View style={styles.distanceHeader}>
              <Text style={styles.filterTitle}>Distance Range:</Text>
              <View style={styles.distanceValueContainer}>
                <Text style={styles.distanceValue}>
                  {getCurrentDistanceLabel().text}
                </Text>
                <Text style={styles.distanceEmoji}>
                  {getCurrentDistanceLabel().emoji}
                </Text>
              </View>
            </View>
            <View style={styles.sliderTrack}>
              <Animated.View style={[styles.activeTrack, distanceTrackStyle]} />
              <PanGestureHandler onGestureEvent={distanceGestureHandler}>
                <Animated.View style={[styles.thumb, distanceThumbStyle]} />
              </PanGestureHandler>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: SECTION_SPACING,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  sliderTrack: {
    width: 300,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    alignSelf: 'center',
    marginTop: 8,
  },
  activeTrack: {
    height: 4,
    backgroundColor: '#7DD3C0',
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#7DD3C0',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#7DD3C0',
    fontWeight: '500',
    marginRight: 4,
    textDecorationLine: 'underline',
  },
  expandedFilters: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  activeOption: {
    backgroundColor: '#7DD3C0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeOptionText: {
    color: '#FFF',
  },
  optionIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  distanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 120,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7DD3C0',
  },
  distanceEmoji: {
    fontSize: 16,
    marginLeft: 4,
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueDisplay: {
    position: 'absolute',
    bottom: 35,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#7DD3C0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  valueEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  valueText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  valueArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -6 }],
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7DD3C0',
  },
});