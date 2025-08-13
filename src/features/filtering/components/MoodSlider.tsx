import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '../../../store/store';
import { FilterApiBridge } from '../services/filtering';
import { DISTANCE_CATEGORIES, DistanceUtils } from '../services/filtering/configs/distance-config';
import { socialOptions } from '../services/filtering/configs/social-config';
import { MOOD_DETAILED_LABELS } from '../services/filtering/configs/mood-config';
import { SPACING } from '../../../shared/constants/constants';

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

// Use consolidated distance categories from distance-config
export const distanceCategories = DISTANCE_CATEGORIES;

// Memoized filter button components to prevent unnecessary re-renders
const SocialContextButton = React.memo(({ 
  social, 
  isActive, 
  onPress 
}: { 
  social: any; 
  isActive: boolean; 
  onPress: () => void; 
}) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      isActive && styles.activeOption
    ]}
    onPress={onPress}
  >
    <Text style={styles.optionIcon}>{social.icon}</Text>
    <Text style={[
      styles.optionText,
      isActive && styles.activeOptionText
    ]}>
      {social.label}
    </Text>
  </TouchableOpacity>
));

const BudgetButton = React.memo(({ 
  budget, 
  isActive, 
  onPress 
}: { 
  budget: any; 
  isActive: boolean; 
  onPress: () => void; 
}) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      isActive && styles.activeOption
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.optionText,
      isActive && styles.activeOptionText
    ]}>
      {budget.display}
    </Text>
  </TouchableOpacity>
));

const TimeOfDayButton = React.memo(({ 
  time, 
  isActive, 
  onPress 
}: { 
  time: any; 
  isActive: boolean; 
  onPress: () => void; 
}) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      isActive && styles.activeOption
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.optionText,
      isActive && styles.activeOptionText
    ]}>
      {time.label}
    </Text>
  </TouchableOpacity>
));

// Separate component for expandable filters to prevent re-renders
const ExpandableFiltersSection = React.memo(({ 
  filters, 
  onSocialContextPress, 
  onBudgetPress, 
  onTimeOfDayPress, 
  onExpandPress,
  distanceTrackStyle,
  distanceThumbStyle,
  distanceGestureHandler,
  getCurrentDistanceLabel
}: { 
  filters: any; 
  onSocialContextPress: (id: 'solo' | 'with-bae' | 'barkada') => void; 
  onBudgetPress: (value: 'P' | 'PP' | 'PPP') => void; 
  onTimeOfDayPress: (id: 'morning' | 'afternoon' | 'night') => void; 
  onExpandPress: () => void;
  distanceTrackStyle: any;
  distanceThumbStyle: any;
  distanceGestureHandler: any;
  getCurrentDistanceLabel: () => { text: string; emoji: string };
}) => (
  <View style={styles.expandedFilters}>
    {/* Social Context */}
    <View style={[styles.filterSection, styles.firstFilterSection]}>
      <Text style={styles.filterTitle}>Social Context:</Text>
      <View style={styles.optionsRow}>
        {socialOptions.map((social) => (
          <SocialContextButton
            key={social.id}
            social={social}
            isActive={filters.socialContext === social.id}
            onPress={() => onSocialContextPress(social.id)}
          />
        ))}
      </View>
    </View>

    {/* Budget */}
    <View style={[styles.filterSection, styles.subsequentFilterSection]}>
      <Text style={styles.filterTitle}>Budget:</Text>
      <View style={styles.optionsRow}>
        {budgetOptions.map((budget) => (
          <BudgetButton
            key={budget.value}
            budget={budget}
            isActive={filters.budget === budget.value}
            onPress={() => onBudgetPress(budget.value)}
          />
        ))}
      </View>
    </View>

    {/* Time of Day */}
    <View style={[styles.filterSection, styles.subsequentFilterSection]}>
      <Text style={styles.filterTitle}>Time of Day:</Text>
      <View style={styles.optionsRow}>
        {timeOptions.map((time) => (
          <TimeOfDayButton
            key={time.id}
            time={time}
            isActive={filters.timeOfDay === time.id}
            onPress={() => onTimeOfDayPress(time.id)}
          />
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
        onPress={onExpandPress}
        activeOpacity={1}
      >
        <Text style={styles.collapseText}>
          View less filters
        </Text>
        <ChevronUp size={16} color="#7DD3C0" />
      </TouchableOpacity>
    </View>
  </View>
));

const MoodSlider = React.memo(() => {
  const { filters, updateFilters, showMoreFilters, toggleMoreFilters } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragMood, setCurrentDragMood] = useState(filters.mood ?? 50);
  
  // Separate visual drag position from actual mood value
  const dragTranslateX = useSharedValue(((filters.mood ?? 50) / 100) * 280);
  const actualMoodTranslateX = useSharedValue(((filters.mood ?? 50) / 100) * 280);
  const distanceTranslateX = useSharedValue((filters.distanceRange ?? 10) !== null ? (((filters.distanceRange ?? 10) / 100) * 280) : 0);
  
  // Animation values for the expand button
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const chevronRotation = useSharedValue(0);

  // 10 mood visual indicators for better UX during slider interaction
  const moodIndicators = [
    { emoji: '🌟', text: 'Chill' },      // Position 1 (0-10%)
    { emoji: '🧘‍♀️', text: 'Zen' },       // Position 2 (10-20%)
    { emoji: '☕', text: 'Mellow' },     // Position 3 (20-30%)
    { emoji: '🌙', text: 'Tranquil' },   // Position 4 (30-40%)
    { emoji: '💪', text: 'Eager' },      // Position 5 (40-50%)
    { emoji: '🎶', text: 'Upbeat' },     // Position 6 (50-60%)
    { emoji: '🥳', text: 'Lively' },     // Position 7 (60-70%)
    { emoji: '💪', text: 'Pumped' },     // Position 8 (70-80%)
    { emoji: '🎉', text: 'Thrilled' },   // Position 9 (80-90%)
    { emoji: '🔥', text: 'Hype' }        // Position 10 (90-100%)
  ];

  // Update actual mood value (only called when drag ends)
  const updateMood = React.useCallback((value: number) => {
    const newMood = Math.max(0, Math.min(100, value));
    // Enhanced logging with API-ready data (null-safe)
    FilterApiBridge.logMoodSelection(newMood);
    updateFilters({ 
      mood: newMood
    });
  }, [updateFilters]);

  // Get current mood category from percentage (0-33.33% = chill, 33.34-66.66% = neutral, 66.67-100% = hype)
  const getMoodCategoryFromPercentage = (percentage: number): 'chill' | 'neutral' | 'hype' => {
    if (percentage <= 33.33) return 'chill';
    if (percentage <= 66.66) return 'neutral';
    return 'hype';
  };

  // Get mood indicator from percentage for dynamic visual updates
  const getMoodIndicatorFromPercentage = (percentage: number): { emoji: string, text: string } => {
    const index = Math.min(Math.max(0, Math.floor(percentage / 10)), 9); // Ensure index is 0-9
    // Since we guarantee index is within bounds, this will always return a valid mood indicator
    return moodIndicators[index]!;
  };

  // Get mood level for visual display (1-10 scale)
  const getMoodLevel = (moodValue: number) => {
    return Math.max(1, Math.min(10, Math.round((moodValue / 100) * 10) || 1));
  };

  // Get current mood label for visual display
  const getCurrentMoodLabel = () => {
    const level = getMoodLevel(filters.mood ?? 50);
    return MOOD_DETAILED_LABELS[level as keyof typeof MOOD_DETAILED_LABELS];
  };

  // Get current drag mood indicator for real-time visual feedback during drag
  const getCurrentDragMoodIndicator = () => {
    return getMoodIndicatorFromPercentage(currentDragMood);
  };

  const setDraggingState = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  const getCurrentDistanceLabel = () => {
    const distance = filters.distanceRange ?? 10;
    const category = DistanceUtils.getDistanceCategory(distance);
    return {
      text: category.text,
      emoji: category.emoji
    };
  };



  const updateDistance = React.useCallback((value: number) => {
    const newDistance = Math.max(0, Math.min(100, value));
    // Enhanced logging with API-ready data (null-safe)
    FilterApiBridge.logDistanceSelection(newDistance);
    updateFilters({ 
      distanceRange: newDistance
    });
  }, [updateFilters]);

  // Animation functions for the expand button
  const animateButtonPress = () => {
    // Smooth scale down animation
    buttonScale.value = withTiming(0.95, { 
      duration: 100,
      easing: Easing.out(Easing.cubic)
    });
    buttonOpacity.value = withTiming(0.8, { 
      duration: 100,
      easing: Easing.out(Easing.cubic)
    });
    
    // Smooth reset animation
    setTimeout(() => {
      buttonScale.value = withTiming(1, { 
        duration: 150,
        easing: Easing.out(Easing.cubic)
      });
      buttonOpacity.value = withTiming(1, { 
        duration: 150,
        easing: Easing.out(Easing.cubic)
      });
    }, 100);
  };

  const animateChevron = () => {
    const targetRotation = showMoreFilters ? 180 : 0;
    chevronRotation.value = withTiming(targetRotation, { 
      duration: 300,
      easing: Easing.out(Easing.cubic)
    });
  };

  const handleExpandPress = React.useCallback(() => {
    animateButtonPress();
    animateChevron();
    toggleMoreFilters();
  }, [toggleMoreFilters]);

  const handleSocialContextPress = React.useCallback((socialId: 'solo' | 'with-bae' | 'barkada') => {
    // Only update if the value actually changed
    if (filters.socialContext === socialId) {
      // Deselecting
      console.log('Social context deselected');
      updateFilters({ socialContext: undefined as any });
    } else if (filters.socialContext !== socialId) {
      // Enhanced logging with API-ready data (null-safe)
      FilterApiBridge.logSocialContextSelection(socialId);
      updateFilters({ 
        socialContext: socialId
      });
    }
  }, [filters.socialContext, updateFilters]);

  const handleBudgetPress = React.useCallback((budgetValue: 'P' | 'PP' | 'PPP') => {
    // Only update if the value actually changed
    if (filters.budget === budgetValue) {
      // Deselecting
      console.log('Budget deselected');
      updateFilters({ budget: undefined as any });
    } else if (filters.budget !== budgetValue) {
      // Enhanced logging with API-ready data (null-safe)
      FilterApiBridge.logBudgetSelection(budgetValue);
      updateFilters({ 
        budget: budgetValue
      });
    }
  }, [filters.budget, updateFilters]);

  const handleTimeOfDayPress = React.useCallback((timeId: 'morning' | 'afternoon' | 'night') => {
    // Only update if the value actually changed
    if (filters.timeOfDay === timeId) {
      // Deselecting
      console.log('Time of day deselected');
      updateFilters({ timeOfDay: undefined as any });
    } else if (filters.timeOfDay !== timeId) {
      // Enhanced logging with API-ready data (null-safe)
      FilterApiBridge.logTimeOfDaySelection(timeId);
      updateFilters({ 
        timeOfDay: timeId
      });
    }
  }, [filters.timeOfDay, updateFilters]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX?: number }) => {
      context.startX = dragTranslateX.value;
      runOnJS(setDraggingState)(true);
    },
    onActive: (event, context) => {
      const startX = context.startX ?? 0;
      const newX = Math.max(0, Math.min(280, startX + event.translationX));
      dragTranslateX.value = newX;
      
      // Update the state to trigger re-render of tooltip in real-time
      const newValue = (newX / 280) * 100;
      runOnJS(setCurrentDragMood)(newValue);
    },
    onEnd: () => {
      // Calculate final mood value and update store
      const finalMoodValue = (dragTranslateX.value / 280) * 100;
      runOnJS(updateMood)(finalMoodValue);
      
      // Sync visual position with actual mood value
      actualMoodTranslateX.value = dragTranslateX.value;
      
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
      transform: [{ translateX: dragTranslateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    return {
      width: dragTranslateX.value + 10,
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

  // Sync drag position when filters change externally (e.g., from other components)
  React.useEffect(() => {
    const moodValue = filters.mood ?? 50;
    const newPosition = (moodValue / 100) * 280;
    dragTranslateX.value = newPosition;
    actualMoodTranslateX.value = newPosition;
    setCurrentDragMood(moodValue);
  }, [filters.mood]);

  // Set initial chevron rotation based on current state
  React.useEffect(() => {
    const initialRotation = showMoreFilters ? 180 : 0;
    chevronRotation.value = initialRotation;
  }, [showMoreFilters]);



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
                  <Text style={styles.valueEmoji}>{getCurrentDragMoodIndicator().emoji}</Text>
                  <Text style={styles.valueText}>{getCurrentDragMoodIndicator().text}</Text>
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

      {showMoreFilters && (
        <ExpandableFiltersSection
          filters={filters}
          onSocialContextPress={handleSocialContextPress}
          onBudgetPress={handleBudgetPress}
          onTimeOfDayPress={handleTimeOfDayPress}
          onExpandPress={handleExpandPress}
          distanceTrackStyle={distanceTrackStyle}
          distanceThumbStyle={distanceThumbStyle}
          distanceGestureHandler={distanceGestureHandler}
          getCurrentDistanceLabel={getCurrentDistanceLabel}
        />
      )}
    </View>
  );
});

export default MoodSlider;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingTop: SPACING.CONTAINER_PADDING_VERTICAL,
    paddingHorizontal: SPACING.CONTAINER_PADDING,
    paddingBottom: SPACING.CONTAINER_PADDING_VERTICAL,
    marginHorizontal: SPACING.CONTAINER_MARGIN,
    marginBottom: SPACING.SECTION_SPACING,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderContainer: {
    paddingHorizontal: 0,
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
    marginBottom: 8,
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
    marginTop: 8,
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
    paddingTop: 8,
  },
  bottomButtonContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 0, // Remove top margin since expandedFilters already has paddingBottom
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 8,
  },
  subsequentFilterSection: {
    marginTop: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  distanceTitle: {
    marginBottom: 0,
    flex: 1,
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
    marginLeft: 8,
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
    marginBottom: 12,
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
  moodCategoryContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  moodCategoryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  moodCategoryValue: {
    color: '#7DD3C0',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
