import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { usePlaceDiscovery } from '@/hooks/use-place-discovery';
import { useAppStore } from '@/hooks/use-app-store';
import { locationService } from '../utils/location-service';
import LoadingScreens from './LoadingScreens';
import GoButton from './GoButton';

interface PlaceDiscoveryInterfaceProps {
  googlePlacesApiKey: string;
  googleCloudCredentials?: any;
  onDiscoveryComplete?: (places: any[]) => void;
  onError?: (error: string) => void;
}

export default function PlaceDiscoveryInterface({
  googlePlacesApiKey,
  googleCloudCredentials,
  onDiscoveryComplete,
  onError
}: PlaceDiscoveryInterfaceProps) {
  const { filters, updateFilters, resetSuggestion } = useAppStore();
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Initialize place discovery hook
  const placeDiscovery = usePlaceDiscovery({
    googlePlacesApiKey,
    googleCloudCredentials,
    advertisedPlaces: [] // Add your advertised places here
  });

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log('📍 Getting location with enhanced location service...');
        
        const locationResult = await locationService.getCurrentLocation({
          timeout: 15000,
          accuracy: Location.Accuracy.Balanced,
          simulatorLocation: 'makati', // Use Makati for better testing
          enableHighAccuracy: false
        });
        
        console.log('📍 Location result:', {
          coords: locationResult.coords,
          source: locationResult.source,
          isSimulated: locationResult.isSimulated,
          accuracy: locationResult.accuracy
        });
        
        setUserLocation(locationResult.coords);
        updateFilters({ userLocation: locationResult.coords });
        setLocationPermissionGranted(!locationResult.isSimulated || locationResult.source === 'simulator');
        
        // Show appropriate alert based on location source
        if (locationResult.source === 'fallback') {
          Alert.alert(
            'Location Unavailable',
            'Could not access your location. Using Manila as default. For better results, please enable location services.',
            [{ text: 'OK' }]
          );
        } else if (locationResult.source === 'simulator') {
          // Don't show alert for simulator - it's expected in development
          console.log('🔧 Using simulator location for development testing');
        } else if (locationResult.accuracy && locationResult.accuracy > 1000) {
          Alert.alert(
            'Location Accuracy',
            'Your location has low accuracy. Results may not be optimal.',
            [{ text: 'OK' }]
          );
        }
        
      } catch (error) {
        console.error('❌ Location service failed:', error);
        
        // Final fallback
        const fallbackLocation = { lat: 14.5176, lng: 121.0509 };
        setUserLocation(fallbackLocation);
        updateFilters({ userLocation: fallbackLocation });
        setLocationPermissionGranted(false);
        
        Alert.alert(
          'Location Error',
          'Location service failed. Using Manila as default location.',
          [{ text: 'OK' }]
        );
      }
    };

    getLocation();
  }, [updateFilters]);

  // Handle discovery completion
  useEffect(() => {
    if (placeDiscovery.isComplete && placeDiscovery.discoveredPlaces.length > 0) {
      console.log('🎉 Discovery completed successfully!');
      console.log(`Found ${placeDiscovery.discoveredPlaces.length} places`);
      
      // Log expansion info if available
      if (placeDiscovery.expansionInfo) {
        console.log(`📊 Expansion details:
          - Expansions: ${placeDiscovery.expansionInfo.expansionCount}
          - Final radius: ${placeDiscovery.expansionInfo.finalRadius}m
          - Total places found: ${placeDiscovery.expansionInfo.totalPlacesFound}`
        );
      }
      
      onDiscoveryComplete?.(placeDiscovery.discoveredPlaces);
    }
  }, [placeDiscovery.isComplete, placeDiscovery.discoveredPlaces, placeDiscovery.expansionInfo, onDiscoveryComplete]);

  // Handle discovery errors
  useEffect(() => {
    if (placeDiscovery.error) {
      console.error('❌ Discovery error:', placeDiscovery.error);
      onError?.(placeDiscovery.error);
    }
  }, [placeDiscovery.error, onError]);

  // Handle G! button press
  const handleGoButtonPress = async () => {
    // Validate required filters
    if (!filters.category) {
      Alert.alert(
        'Missing Category',
        'Please select what you\'re looking for (Food, Activity, or Something New)',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Location is required for place discovery. Please enable location access.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (filters.mood === undefined || filters.mood === null) {
      Alert.alert(
        'Missing Mood',
        'Please set your mood using the slider',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('🚀 Starting place discovery with filters:', {
      category: filters.category,
      mood: filters.mood,
      socialContext: filters.socialContext,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      distanceRange: filters.distanceRange,
      userLocation: userLocation
    });

    try {
      await placeDiscovery.discoverPlaces();
    } catch (error) {
      console.error('❌ Error starting discovery:', error);
      Alert.alert(
        'Discovery Error',
        'Failed to start place discovery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle restart filters
  const handleRestartFilters = () => {
    console.log('🔄 Restarting filters and discovery...');
    
    Alert.alert(
      'Restart Discovery',
      'This will reset all your filters and start fresh. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => {
            resetSuggestion();
            placeDiscovery.restartDiscovery();
          }
        }
      ]
    );
  };

  // Handle get more places
  const handleGetMorePlaces = async () => {
    console.log('🔄 Getting more places...');
    
    try {
      await placeDiscovery.getMorePlaces();
    } catch (error) {
      console.error('❌ Error getting more places:', error);
      Alert.alert(
        'Error',
        'Failed to get more places. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Show loading screens when appropriate */}
      {placeDiscovery.isLoading && (
        <LoadingScreens
          loadingState={placeDiscovery.loadingState}
          currentRadius={placeDiscovery.currentRadius}
          expansionCount={placeDiscovery.expansionCount}
          onRestart={handleRestartFilters}
        />
      )}

      {/* Show G! button when not loading and no results */}
      {!placeDiscovery.isLoading && placeDiscovery.discoveredPlaces.length === 0 && (
        <View style={styles.buttonContainer}>
          <GoButton
            onPress={handleGoButtonPress}
            disabled={!userLocation || !filters.category}
            loading={placeDiscovery.isLoading}
          />
          
          {/* Show status info */}
          <View style={styles.statusInfo}>
            {!locationPermissionGranted && (
              <Text style={styles.statusWarning}>
                📍 Using default location (Manila)
              </Text>
            )}
            
            {!filters.category && (
              <Text style={styles.statusError}>
                ⚠️ Please select a category first
              </Text>
            )}
            
            {filters.mood === undefined && (
              <Text style={styles.statusError}>
                ⚠️ Please set your mood
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Results are handled by parent component via onDiscoveryComplete */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusWarning: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusError: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
});