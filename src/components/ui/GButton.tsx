import React, { useRef, useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, ViewStyle } from 'react-native';
import { useAppStore } from '../../store/store';
import { useRouter } from 'expo-router';
import { SPACING } from '../../shared/constants/constants';

/**
 * GButton Component Props
 * @interface GButtonProps
 * @property {number} size - Size of the button (width and height)
 * @property {boolean} disabled - Whether the button is disabled
 * @property {ViewStyle} style - Additional styles for the button
 * @property {string} testID - Test identifier for testing
 */
interface GButtonProps {
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * The main action button for the app - triggers the discovery process
 * 
 * @example
 * ```tsx
 * <GButton size={120} />
 * ```
 */
export default function GButton({ 
  size = 120, 
  disabled = false,
  style,
  testID 
}: GButtonProps) {
  const { filters: { category } } = useAppStore();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [showErrorTagline, setShowErrorTagline] = useState(false);

  // Check if button should be disabled
  const isDisabled = disabled || !category;
  
  // Bounce animation when not disabled
  useEffect(() => {
    if (!isDisabled) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();
      return () => bounceAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDisabled, pulseAnim]);

  // Shake animation function
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    } else {
      triggerShake();
      setShowErrorTagline(true);
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePress = () => {
    if (!isDisabled) {
      // Navigate to results page
      router.push('/results');
    }
  };

  const buttonStyle = [
    styles.button,
    { width: size, height: size },
    style
  ];

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { scale: pulseAnim },
      { translateX: shakeAnim }
    ]
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[buttonStyle, animatedStyle]}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={isDisabled}
          testID={testID}
        >
          <Text style={styles.buttonText}>G</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {showErrorTagline && isDisabled && (
        <Text style={styles.errorTagline}>
          Please select a category first
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 60,
    backgroundColor: '#7DD3C0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  buttonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorTagline: {
    marginTop: 12,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
