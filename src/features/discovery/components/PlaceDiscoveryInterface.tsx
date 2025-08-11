import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { usePlaceDiscovery } from '../hooks/use-place-discovery';
import { useAppStore } from '../../../store/store';
import { locationService } from '../../../services/mobile/location-service';
import { LoadingScreens } from '../../../components/feedback/LoadingScreens';
import GButton from '../../../components/ui/GButton';

interface PlaceDiscoveryInterfaceProps {
  googlePlacesApiKey: string;
  googleCloudCredentials?: Record<string, unknown>;
  onDiscoveryComplete?: (places: (import('../../filtering/types').PlaceResult | import('../../filtering/types').AdvertisedPlace)[]) => void;
  onError?: (error: string) => void;
}

export default function PlaceDiscoveryInterface({
  googlePlacesApiKey,
  googleCloudCredentials,
  onDiscoveryComplete,
  onError
}: PlaceDiscoveryInterfaceProps) {
  const { filters, resetSuggestion, updateUserLocation } = useAppStore();
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
        updateUserLocation(locationResult.coords);
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
        updateUserLocation(fallbackLocation);
        setLocationPermissionGranted(false);
        
        Alert.alert(
          'Location Error',
          'Location service failed. Using Manila as default location.',
          [{ text: 'OK' }]
        );
      }
    };

    getLocation();
  }, [updateUserLocation]);

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
          onPress: handleRestart
        }
      ]
    );
  };

  // Handle restart action
  const handleRestart = () => {
    resetSuggestion();
    placeDiscovery.restartDiscovery();
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
          <GButton />
          
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