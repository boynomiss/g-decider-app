import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

interface GoButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
}

export default function GoButton({ 
  onPress, 
  disabled = false, 
  loading = false,
  size = 80 
}: GoButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when not disabled
  useEffect(() => {
    if (!disabled && !loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
    return undefined;
  }, [disabled, loading, pulseAnim]);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getButtonStyle = () => {
    if (disabled) {
      return [styles.button, styles.buttonDisabled, { width: size, height: size, borderRadius: size / 2 }];
    }
    if (loading) {
      return [styles.button, styles.buttonLoading, { width: size, height: size, borderRadius: size / 2 }];
    }
    return [styles.button, styles.buttonActive, { width: size, height: size, borderRadius: size / 2 }];
  };

  const getTextStyle = () => {
    if (disabled) {
      return [styles.buttonText, styles.buttonTextDisabled, { fontSize: size * 0.4 }];
    }
    if (loading) {
      return [styles.buttonText, styles.buttonTextLoading, { fontSize: size * 0.4 }];
    }
    return [styles.buttonText, styles.buttonTextActive, { fontSize: size * 0.4 }];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: disabled || loading ? 1 : pulseAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={disabled || loading ? 1 : 0.8}
        disabled={disabled || loading}
      >
        <Text style={getTextStyle()}>
          {loading ? '⏳' : 'G!'}
        </Text>
        
        {!disabled && !loading && (
          <View style={styles.shadowRing} />
        )}
      </TouchableOpacity>
      
      {/* Instruction text */}
      <Text style={styles.instructionText}>
        {disabled ? 'Complete setup first' : loading ? 'Discovering...' : 'Tap to discover places'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
  buttonLoading: {
    backgroundColor: '#FFA726',
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextActive: {
    color: '#FFF',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  buttonTextLoading: {
    color: '#FFF',
  },
  shadowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#7DD3C0',
    opacity: 0.3,
  },
  instructionText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});