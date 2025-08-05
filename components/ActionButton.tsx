import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Image, Alert } from 'react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useServerFiltering } from '../hooks/use-server-filtering';
import { useRouter } from 'expo-router';

export default function ActionButton() {
  const { filters, retriesLeft, showMoreFilters } = useAppStore();
  const { isLoading, error, filterPlaces } = useServerFiltering();
  const router = useRouter();
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure router is ready
    const timer = setTimeout(() => {
      setIsRouterReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePress = async () => {
    try {
      console.log('🎯 Action button pressed. Category:', filters.category, 'Retries:', retriesLeft, 'Loading:', isLoading);
      
      if (!filters.category) {
        console.log('❌ No category selected, showing shake animation');
        // Gentle shake animation to indicate category selection is needed
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 5, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -5, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 5, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
        return;
      }
      
      if (retriesLeft === 0) {
        console.log('❌ No retries left, showing upgrade prompt');
        Alert.alert(
          'No Tries Left',
          'Sign up to get more tries and unlock unlimited suggestions!',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign Up', 
              onPress: () => {
                try {
                  router.push('/auth');
                } catch (error) {
                  console.error('❌ Error navigating to auth:', error);
                }
              }
            }
          ]
        );
        return;
      }
      
      if (isLoading) {
        console.log('❌ Action blocked: isLoading =', isLoading);
        return;
      }
      
      if (!isRouterReady) {
        console.log('⏳ Router not ready yet, waiting...');
        return;
      }

      console.log('🚀 Starting server-side filtering...');
      
      // Call server-side filtering
      await filterPlaces(filters, 5, true);
      
      // Navigate to result screen to display the results
      router.push('/result');
      
    } catch (error) {
      console.error('❌ Error in handlePress:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.tagline}>No more &apos;bahala na.&apos;</Text>
      
      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#4A90A4" size="large" />
          ) : (
            <Image 
              source={{ uri: 'https://r2-pub.rork.com/attachments/ijysleq3wf5s37hickiet' }}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.subtitle}>Push mo na&apos;yan!</Text>
    </View>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: SECTION_SPACING,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7DD3C0',
    borderRadius: 50,
    paddingVertical: 11,
    paddingHorizontal: 80,
    marginBottom: 12,
    minWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonImage: {
    width: 50,
    height: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});