// ⚠️ TEMPORARILY DISABLED: Button validation checks are disabled to allow button press
// To re-enable: Remove the "TEMPORARILY DISABLED" comments and restore the return statements
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Image, Alert } from 'react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useServerFiltering } from '../hooks/use-server-filtering';
import { useRouter } from 'expo-router';
import { filterValidationService } from '../utils/filters/filter-validation-service';

export default function ActionButton() {
  const { filters, retriesLeft, showMoreFilters } = useAppStore();
  const { isLoading, error, results, filterPlaces } = useServerFiltering();
  const router = useRouter();
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Small delay to ensure router is ready
    const timer = setTimeout(() => {
      setIsRouterReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset processing state when loading completes
  useEffect(() => {
    if (!isLoading && isProcessing) {
      console.log('🔍 Loading completed, resetting processing state');
      setIsProcessing(false);
    }
  }, [isLoading, isProcessing]);

  // Reset button states when there's an error
  useEffect(() => {
    if (error) {
      console.log('🔍 Error detected, resetting button states');
      setIsButtonPressed(false);
      setIsProcessing(false);
    }
  }, [error]);

  // Cleanup effect to reset states on unmount
  useEffect(() => {
    return () => {
      setIsButtonPressed(false);
      setIsProcessing(false);
    };
  }, []);

  const handlePress = async () => {
    console.log('🎯 Action button pressed!');
    console.log('🔍 Button state - Category:', filters.category, 'Retries:', retriesLeft, 'Loading:', isLoading);
    console.log('🔍 Current filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Button disabled state:', isLoading);
    console.log('🔍 Router ready state:', isRouterReady);
    console.log('🔍 Current results count:', results.length);
    console.log('🔍 Current error state:', error);
    console.log('🔍 Processing state:', isProcessing);
    
    // Prevent multiple rapid presses
    if (isButtonPressed || isProcessing) {
      console.log('⚠️ Button already pressed or processing, ignoring duplicate press');
      return;
    }
    
    setIsButtonPressed(true);
    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting server-side filtering with filters:', filters);
      
      // Consolidated into a single filtering process
      console.log('🔍 Applying the single useful filtering scheme');
      
      // Prepare filters for API call - ensure all required fields are present
      const apiFilters = {
        mood: filters.mood || 50,
        category: filters.category || 'food', // Fallback to 'food' if no category selected
        budget: filters.budget || null,
        timeOfDay: filters.timeOfDay || null,
        socialContext: filters.socialContext || null,
        distanceRange: filters.distanceRange || 5 // Default to 5km if not set
      };
      
      console.log('📤 Sending filters to API:', apiFilters);
      console.log('📤 Calling filterPlaces with:', apiFilters);
      
      // Call server-side filtering with prepared filters
      await filterPlaces(apiFilters, 5, true);
      console.log('📤 filterPlaces call completed');
      
      // Navigate to result screen immediately after triggering the filter
      router.push('/result');
      console.log('🔄 Navigation to /result completed');
      
    } catch (error) {
      console.error('❌ Error in handlePress:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      // Reset button pressed state after a delay to prevent rapid re-presses
      setTimeout(() => {
        setIsButtonPressed(false);
      }, 1000);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = isLoading || isButtonPressed || isProcessing;

  return (
    <View style={styles.container}>
      <Text style={styles.tagline}>No more &apos;bahala na.&apos;</Text>
      
      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={isButtonDisabled}
        >
          {isLoading || isProcessing ? (
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
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
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