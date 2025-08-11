import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, Image } from 'react-native';
import { useAppStore } from '../../store/store';
import { useRouter } from 'expo-router';
import { SPACING } from '../../shared/constants/constants';

interface GButtonProps {
  size?: number;
}

export default function GButton({ size = 120 }: GButtonProps) {
  const { filters } = useAppStore();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check if button should be disabled (basic validation)
  const isDisabled = !filters.category;

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
    }
    return undefined;
  }, [isDisabled, pulseAnim]);

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
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
    }
  };

  const getButtonStyle = () => {
    if (isDisabled) {
      return [styles.button, styles.buttonDisabled, { width: size * 2, height: size * 0.6, borderRadius: 50 }];
    }
    return [styles.button, styles.buttonActive, { width: size * 2, height: size * 0.6, borderRadius: 50 }];
  };



  return (
    <View style={styles.container}>
      <Text style={styles.tagline}>No more &apos;bahala na.&apos;</Text>
      
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { scale: isDisabled ? 1 : pulseAnim }
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
          disabled={isDisabled}
        >
          <Image 
            source={{ uri: 'https://r2-pub.rork.com/attachments/ijysleq3wf5s37hickiet' }}
            style={styles.buttonImage}
            resizeMode="contain"
          />
          
          {/* Removed the shadowRing border */}
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.subtitle}>Push mo na&apos;yan!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: SPACING.SMALL,
    paddingBottom: SPACING.XLARGE * 2,
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: SPACING.SMALL,
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
  // Removed shadowRing style completely
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '600',
    marginTop: SPACING.SMALL,
  },
});
