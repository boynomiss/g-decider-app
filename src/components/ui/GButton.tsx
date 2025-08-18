import React, { useRef, useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, Image } from 'react-native';
import { useAppStore } from '../../store/store';
import { useRouter } from 'expo-router';
import { SPACING } from '../../shared/constants/constants';

interface GButtonProps {
  size?: number;
}

export default function GButton({ size = 120 }: GButtonProps) {
  const { filters: { category } } = useAppStore();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [showErrorTagline, setShowErrorTagline] = useState(false);

  // Check if button should be disabled (basic validation)
  const isDisabled = !category;
  
  console.log('🎯 GButton state check:', {
    category,
    isDisabled,
    hasCategory: !!category
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

  // Navigate to instant recommendations page (same as instant recommendations flow)
  const handlePress = () => {
    if (!isDisabled) {
      console.log('🎯 G! button pressed - navigating to instant recommendations');
      router.push('/instant-recommendations');
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
    <View style={styles.container}>
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
    paddingTop: SPACING.SMALL,
    paddingBottom: SPACING.XLARGE,
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: SPACING.SMALL,
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
    marginVertical: SPACING.SMALL,
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
    marginTop: SPACING.SMALL,
  },
});
