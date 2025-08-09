import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '@/hooks/use-app-store';
import { FilterUtilities } from '@/utils/filtering/filter-utils';
import { DISTANCE_CATEGORIES, DistanceUtils } from '@/utils/filtering/configs/distance-config';
import { socialOptions, SocialUtils } from '@/utils/filtering/configs/social-config';
import { MoodUtils, MOOD_DETAILED_LABELS } from '@/utils/filtering/configs/mood-config';

export const budgetOptions = [
  { 
    display: '₱', 
    value: 'P' as const,
    label: 'Budget-Friendly',
    priceRange: { min: 0, max: 500 },
    googlePriceLevel: 1
  },
  { 
    display: '₱₱', 
    value: 'PP' as const,
    label: 'Moderate',
    priceRange: { min: 500, max: 1500 },
    googlePriceLevel: 2
  },
  { 
    display: '₱₱₱', 
    value: 'PPP' as const,
    label: 'Premium',
    priceRange: { min: 1500, max: 5000 },
    googlePriceLevel: 3
  }
];
export const timeOptions = [
  { 
    id: 'morning', 
    label: 'Morning',
    timeRange: { start: '04:00', end: '12:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '0400' }, close: { day: 0, time: '1200' } }]
    },
    description: 'Early morning activities and breakfast spots'
  },
  { 
    id: 'afternoon', 
    label: 'Afternoon',
    timeRange: { start: '12:00', end: '18:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '1200' }, close: { day: 0, time: '1800' } }]
    },
    description: 'Lunch, shopping, and daytime activities'
  },
  { 
    id: 'night', 
    label: 'Night',
    timeRange: { start: '18:00', end: '04:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '1800' }, close: { day: 1, time: '0400' } }]
    },
    description: 'Dinner, nightlife, and evening entertainment'
  },
] as const;
// socialOptions now imported from social-config.ts

// moodLabels now imported from mood-config.ts as MOOD_DETAILED_LABELS

// Use consolidated distance categories from distance-config
export const distanceCategories = DISTANCE_CATEGORIES;

export default function MoodSlider() {
  const { filters, updateFilters, showMoreFilters, toggleMoreFilters } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const translateX = useSharedValue((filters.mood / 100) * 280);
  const distanceTranslateX = useSharedValue(filters.distanceRange !== null ? ((filters.distanceRange / 100) * 280) : 0);
  
  // Animation values for the expand button
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const chevronRotation = useSharedValue(0);
  
  const updateMood = (value: number) => {
    const newMood = Math.max(0, Math.min(100, value));
    // Enhanced logging with API-ready data (null-safe)
    const filterData = FilterApiBridge.logMoodSelection(newMood);
    updateFilters({ 
      mood: newMood
    });
  };

  const setDraggingState = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  const getMoodLevel = (moodValue: number) => {
    return Math.max(1, Math.min(10, Math.round((moodValue / 100) * 10) || 1));
  };

  // New function to convert 0-100 mood to 3-level mood
  const getSimplifiedMood = (moodValue: number): 'chill' | 'neutral' | 'hype' => {
    return MoodUtils.getMoodCategoryId(moodValue);
  };

  const getCurrentMoodLabel = () => {
    const level = getMoodLevel(filters.mood);
    return MOOD_DETAILED_LABELS[level as keyof typeof MOOD_DETAILED_LABELS];
  };

  const getDistanceCategory = (value: number) => {
    return DistanceUtils.getDistanceCategory(value);
  };

  const getCurrentDistanceLabel = () => {
    const distance = filters.distanceRange ?? 0;
    return getDistanceCategory(distance);
  };

  const updateDistance = (value: number) => {
    const newDistance = Math.max(0, Math.min(100, value));
    // Enhanced logging with API-ready data (null-safe)
    const filterData = FilterApiBridge.logDistanceSelection(newDistance);
    updateFilters({ 
      distanceRange: newDistance
    });
  };

  // Animation functions for the expand button
  const animateButtonPress = () => {
    // Scale down animation
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    buttonOpacity.value = withTiming(0.8, { duration: 100 });
    
    // Reset after a short delay
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      buttonOpacity.value = withTiming(1, { duration: 100 });
    }, 150);
  };

  const animateChevron = () => {
    const targetRotation = showMoreFilters ? 0 : 180;
    chevronRotation.value = withSpring(targetRotation, { damping: 15, stiffness: 300 });
  };

  const handleExpandPress = () => {
    animateButtonPress();
    animateChevron();
    toggleMoreFilters();
  };

  const handleSocialContextPress = (socialId: 'solo' | 'with-bae' | 'barkada') => {
    const selectedSocial = socialOptions.find(option => option.id === socialId);
    
    if (filters.socialContext === socialId) {
      // Deselecting
      console.log('Social context deselected');
      updateFilters({ socialContext: null });
    } else {
      // Enhanced logging with API-ready data (null-safe)
      const filterData = FilterApiBridge.logSocialContextSelection(socialId);
      updateFilters({ 
        socialContext: socialId
      });
    }
  };

  const handleBudgetPress = (budgetValue: 'P' | 'PP' | 'PPP') => {
    if (filters.budget === budgetValue) {
      // Deselecting
      console.log('Budget deselected');
      updateFilters({ budget: null });
    } else {
      // Enhanced logging with API-ready data (null-safe)
      const filterData = FilterApiBridge.logBudgetSelection(budgetValue);
      updateFilters({ 
        budget: budgetValue
      });
    }
  };

  const handleTimeOfDayPress = (timeId: 'morning' | 'afternoon' | 'night') => {
    const selectedTime = timeOptions.find(option => option.id === timeId);
    
    if (filters.timeOfDay === timeId) {
      // Deselecting
      console.log('Time of day deselected');
      updateFilters({ timeOfDay: null });
    } else {
      // Enhanced logging with API-ready data (null-safe)
      const filterData = FilterApiBridge.logTimeOfDaySelection(timeId);
      updateFilters({ 
        timeOfDay: timeId
      });
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
      const newValue = (newX / 280) * 100;
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

  // Animated styles for the expand button
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${chevronRotation.value}deg` }],
    };
  });

  // Animation for expanded filters
  const expandedFiltersOpacity = useSharedValue(0);
  const expandedFiltersHeight = useSharedValue(0);

  React.useEffect(() => {
    if (showMoreFilters) {
      expandedFiltersOpacity.value = withTiming(1, { duration: 300 });
      expandedFiltersHeight.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      expandedFiltersOpacity.value = withTiming(0, { duration: 200 });
      expandedFiltersHeight.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
  }, [showMoreFilters]);

  const expandedFiltersAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: expandedFiltersOpacity.value,
      maxHeight: expandedFiltersHeight.value === 0 ? 0 : 1000,
      overflow: 'hidden',
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

      {!showMoreFilters && (
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={handleExpandPress}
            activeOpacity={1}
          >
            <Text style={styles.expandText}>
              View more filters
            </Text>
            <Animated.View style={chevronAnimatedStyle}>
              <ChevronDown size={16} color="#7DD3C0" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

            <Animated.View style={expandedFiltersAnimatedStyle}>
        {/* Social Context */}
        <View style={[styles.filterSection, styles.firstFilterSection]}>
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
        <View style={[styles.filterSection, styles.subsequentFilterSection]}>
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
        <View style={[styles.filterSection, styles.subsequentFilterSection]}>
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
        <View style={[styles.filterSection, styles.subsequentFilterSection]}>
          <View style={styles.distanceHeader}>
            <Text style={[styles.filterTitle, styles.distanceTitle]}>Distance Range:</Text>
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

        {/* View Less Filters Button at Bottom */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.collapseButton}
            onPress={handleExpandPress}
            activeOpacity={1}
          >
            <Text style={styles.collapseText}>
              View less filters
            </Text>
            <ChevronUp size={16} color="#7DD3C0" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 4,
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
    marginTop: 12,
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
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 7.5,
  },
  bottomButtonContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  collapseText: {
    fontSize: 14,
    color: '#7DD3C0',
    fontWeight: '500',
    marginRight: 4,
    textDecorationLine: 'underline',
  },
  filterSection: {
    marginBottom: 12,
  },
  firstFilterSection: {
    marginTop: 24,
  },
  subsequentFilterSection: {
    marginTop: 6,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  distanceTitle: {
    marginBottom: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Reduced by 30% from 80
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