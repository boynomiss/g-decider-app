// ⚠️ TEMPORARILY DISABLED: Button validation checks are disabled to allow button press
// To re-enable: Remove the "TEMPORARILY DISABLED" comments and restore the return statements
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Image, Alert } from 'react-native';
import { useAppStore } from '../hooks/use-app-store';
import { useServerFiltering } from '../hooks/use-server-filtering';
import { useRouter } from 'expo-router';
import { filterValidationService } from '../utils/filter-validation-service';

export default function ActionButton() {
  const { filters, retriesLeft, showMoreFilters } = useAppStore();
  const { isLoading, error, results, filterPlaces } = useServerFiltering();
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
    console.log('🎯 Action button pressed!');
    console.log('🔍 Button state - Category:', filters.category, 'Retries:', retriesLeft, 'Loading:', isLoading);
    console.log('🔍 Current filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Button disabled state:', isLoading);
    console.log('🔍 Router ready state:', isRouterReady);
    
    try {
      
      console.log('🔍 Category validation - filters.category:', filters.category, 'type:', typeof filters.category);
      
      // TEMPORARILY DISABLED: Category validation to allow button press
      if (!filters.category || filters.category === null || filters.category === undefined) {
        console.log('⚠️ No category selected, but continuing anyway (validation disabled)');
        // Don't return early, continue with the process
      }
      
      console.log('🔍 Retries check - retriesLeft:', retriesLeft);
      
      // TEMPORARILY DISABLED: Retries check to allow button press
      if (retriesLeft === 0) {
        console.log('⚠️ No retries left, but continuing anyway (validation disabled)');
        // Don't return early, continue with the process
      }
      
      console.log('🔍 Loading check - isLoading:', isLoading);
      
      // TEMPORARILY DISABLED: Loading check to allow button press
      if (isLoading) {
        console.log('⚠️ Action would be blocked by loading state, but continuing anyway (validation disabled)');
        // Don't return early, continue with the process
      }
      
      console.log('🔍 Router check - isRouterReady:', isRouterReady);
      
      // TEMPORARILY DISABLED: Router check to allow button press
      if (!isRouterReady) {
        console.log('⚠️ Router not ready, but continuing anyway (validation disabled)');
        // Don't return early, continue with the process
      }

      console.log('🚀 Starting server-side filtering with filters:', filters);
      
      // Pre-validate the filter before proceeding
      console.log('🔍 Pre-validating filter connectivity...');
      try {
        const validationResult = await filterValidationService.validateLookingForFilter(
          filters.category as 'food' | 'activity' | 'something-new'
        );
        
        if (validationResult.success) {
          console.log(`✅ Filter validation successful: ${validationResult.placeCount} places detected`);
        } else {
          console.warn(`⚠️ Filter validation failed: ${validationResult.error}`);
          // Continue anyway, but log the warning
        }
      } catch (error) {
        console.error('❌ Filter validation error:', error);
        // Continue with the main search even if validation fails
      }
      
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
      
      // Call server-side filtering with prepared filters
      console.log('📤 Calling filterPlaces with:', apiFilters);
      await filterPlaces(apiFilters, 5, true);
      
      // Wait for results to be processed and state to update
      console.log('⏳ Waiting for results to be processed...');
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`📊 Attempt ${attempts + 1}: Results count = ${results.length}, Error = ${error}, Loading = ${isLoading}`);
        
        if (error) {
          console.error('❌ Error occurred during filtering:', error);
          Alert.alert(
            'Error',
            `Failed to fetch results: ${error}`,
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
        
        if (!isLoading && results.length > 0) {
          console.log('✅ Results received successfully!');
          break;
        }
        
        attempts++;
      }
      
      console.log('✅ Server filtering completed, checking final results...');
      console.log('📊 Final results count:', results.length);
      console.log('📊 Final error state:', error);
      
      if (error) {
        console.error('❌ Error occurred during filtering:', error);
        Alert.alert(
          'Error',
          `Failed to fetch results: ${error}`,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      if (results.length === 0) {
        console.warn('⚠️ No results returned from server');
        Alert.alert(
          'No Places Found',
          'No places found in your area. Try a different category or increase your search distance.',
          [
            { 
              text: 'Try Activity', 
              onPress: async () => {
                console.log('🔄 Retrying with activity category...');
                const activityFilters = { ...apiFilters, category: 'activity' as const };
                await filterPlaces(activityFilters, 5, true);
                // Wait a moment then navigate
                setTimeout(() => {
                  if (results.length > 0) {
                    router.push('/result');
                  }
                }, 1000);
              }
            },
            { 
              text: 'Try Something New', 
              onPress: async () => {
                console.log('🔄 Retrying with something-new category...');
                const somethingNewFilters = { ...apiFilters, category: 'something-new' as const };
                await filterPlaces(somethingNewFilters, 5, true);
                // Wait a moment then navigate
                setTimeout(() => {
                  if (results.length > 0) {
                    router.push('/result');
                  }
                }, 1000);
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
      
      console.log('🎉 Success! Found', results.length, 'places, navigating to results...');
      
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
          disabled={isLoading}
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