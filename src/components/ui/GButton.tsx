/**
 * GButton Component Props
 * @interface GButtonProps
 * @property {number} size - Size of the button (width and height)
 * @property {boolean} disabled - Whether the button is disabled
 * @property {ViewStyle} style - Additional styles for the button
 * @property {string} testID - Test identifier for testing
 */
import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  Animated,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';

interface GButtonProps {
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  onPress?: () => void;
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
  testID,
  onPress 
}: GButtonProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [showErrorTagline, setShowErrorTagline] = useState(false);

  // Check if button should be disabled
  const isDisabled = disabled;
  
  console.log('🎯 GButton state check:', {
    isDisabled,
    hasCategory: !isDisabled
  });

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
      // Stop pulse animation when disabled
      pulseAnim.setValue(1);
      return undefined;
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
      // Trigger shake animation when disabled button is pressed
      triggerShake();
      // Show error tagline and keep it visible until category is selected
      setShowErrorTagline(true);
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    }
  };

  // Navigate directly to results page
  const handlePress = () => {
    if (!isDisabled) {
      console.log('🎯 G! button pressed');
      
      // Use custom onPress if provided, otherwise use default navigation
      if (onPress) {
        onPress();
      } else {
        console.log('🎯 Using default navigation to results page');
        router.push('/mvp-results');
      }
    } else {
      // Trigger shake animation when disabled button is pressed
      triggerShake();
      // Show error tagline and keep it visible until category is selected
      setShowErrorTagline(true);
    }
  };

  const getButtonStyle = () => {
    if (isDisabled) {
      return [styles.button, styles.buttonDisabled, { width: size * 2, height: size * 0.6, borderRadius: 50 }];
    }
    return [styles.button, styles.buttonActive, { width: size * 2, height: size * 0.6, borderRadius: 50 }];
  };

  // Dynamic tagline based on state
  const getTagline = () => {
    if (showErrorTagline && isDisabled) {
      return "Pick 'Food, Activity, or Something NEW' first!";
    }
    return "No more 'bahala na.'";
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.tagline,
        (showErrorTagline && isDisabled) && styles.errorTagline // Only apply error styling when showing error AND disabled
      ]}>
        {getTagline()}
      </Text>
      
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { scale: isDisabled ? 1 : pulseAnim },
              { translateX: shakeAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={isDisabled ? 1 : 0.8}
          disabled={false}
          testID={testID}
        >
          <Image 
            source={{ uri: 'https://r2-pub.rork.com/attachments/ijysleq3wf5s37hickiet' }}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.subtitle}>Push mo na'yan!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorTagline: {
    color: '#8B0000', // Changed from '#7DD3C0' (teal) to '#8B0000' (dark red)
    fontSize: 18,
    fontWeight: '600',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  buttonActive: {
    backgroundColor: '#7DD3C0',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buttonImage: {
    width: 50,
    height: 50,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '600',
    marginTop: 16,
  },
});
