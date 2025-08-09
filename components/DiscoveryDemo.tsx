import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAppStore } from '@/hooks/use-app-store';
import { usePlaceDiscovery } from '@/hooks/use-place-discovery';
import PlaceDiscoveryInterface from '@/components/PlaceDiscoveryInterface';
import LoadingScreens from '@/components/LoadingScreens';
import MoodSlider from '@/components/MoodSlider';
import CategoryButtons from '@/components/CategoryButtons';
import { DistanceUtils } from '@/utils/filtering/configs/distance-config';

// Mock advertised places for demo
const mockAdvertisedPlaces = [
  {
    place_id: 'ad_001',
    name: 'Premium Steakhouse - Sponsored',
    address: 'BGC, Taguig City',
    category: 'restaurant',
    isAdvertised: true as const,
    advertisementDetails: {
      campaignId: 'camp_steak_001',
      impressions: 1250,
      clickRate: 0.08
    }
  },
  {
    place_id: 'ad_002',
    name: 'Luxury Spa Experience - Featured',
    address: 'Makati City',
    category: 'spa',
    isAdvertised: true as const,
    advertisementDetails: {
      campaignId: 'camp_spa_001',
      impressions: 800,
      clickRate: 0.12
    }
  }
];

export default function DiscoveryDemo() {
  const { filters, updateFilters } = useAppStore();
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for place discovery');
          // Use BGC as fallback
          setUserLocation({ lat: 14.5176, lng: 121.0509 });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setUserLocation(coords);
        updateFilters({ userLocation: coords });
        console.log('📍 User location obtained:', coords);
      } catch (error) {
        console.error('Error getting location:', error);
        // Use BGC as fallback
        setUserLocation({ lat: 14.5176, lng: 121.0509 });
      }
    };

    getLocation();
  }, []);

  // Handle discovery complete
  const handleDiscoveryComplete = (places: any[]) => {
    console.log('🎉 Discovery complete! Found places:', places.length);
    
    // Show results summary
    const regularPlaces = places.filter(p => !p.isAdvertised);
    const advertisedPlaces = places.filter(p => p.isAdvertised);
    
    Alert.alert(
      'Discovery Complete!',
      `Found ${regularPlaces.length} places + ${advertisedPlaces.length} sponsored`,
      [
        {
          text: 'View Details',
          onPress: () => {
            places.forEach((place, index) => {
              console.log(`${index + 1}. ${place.name} ${place.isAdvertised ? '[AD]' : ''}`);
              console.log(`   📍 ${place.address}`);
              console.log(`   🎭 Mood: ${place.final_mood || 'Unknown'}`);
              console.log(`   ⭐ Rating: ${place.rating || 'N/A'}`);
            });
          }
        },
        { text: 'OK' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Place Discovery Demo</Text>
        <Text style={styles.subtitle}>
          Test the comprehensive discovery logic system
        </Text>
      </View>

      {/* Filter Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Filters</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Category:</Text>
            <Text style={styles.statusValue}>{filters.category || 'Not set'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Mood:</Text>
            <Text style={styles.statusValue}>
              {filters.mood ? `${filters.mood} (${getMoodLabel(filters.mood)})` : 'Not set'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Budget:</Text>
            <Text style={styles.statusValue}>{filters.budget || 'Not set'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Time:</Text>
            <Text style={styles.statusValue}>{filters.timeOfDay || 'Not set'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Social:</Text>
            <Text style={styles.statusValue}>{filters.socialContext || 'Not set'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Distance:</Text>
            <Text style={styles.statusValue}>
              {filters.distanceRange ? getDistanceLabel(filters.distanceRange) : 'Not set'}
            </Text>
          </View>
        </View>
        
        {userLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {/* Existing Filter Components */}
      <View style={styles.filtersSection}>
        <CategoryButtons />
        <MoodSlider />
      </View>

      {/* Discovery Interface with Loading Screens */}
      <View style={styles.discoverySection}>
        <PlaceDiscoveryInterface
          googlePlacesApiKey={process.env.GOOGLE_PLACES_API_KEY || 'demo-key'}
          googleCloudCredentials={{
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
          }}
          onDiscoveryComplete={handleDiscoveryComplete}
          onError={(error) => {
            Alert.alert('Discovery Error', error, [{ text: 'OK' }]);
          }}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Test:</Text>
        <Text style={styles.instructionItem}>1. Select a category (Food/Activity/Something New)</Text>
        <Text style={styles.instructionItem}>2. Set your mood using the slider</Text>
        <Text style={styles.instructionItem}>3. Optionally set additional filters</Text>
        <Text style={styles.instructionItem}>4. Press the G! button to discover places</Text>
        <Text style={styles.instructionItem}>5. Watch the loading states and expansion</Text>
        <Text style={styles.instructionItem}>6. Press "Get More" for additional results</Text>
      </View>

      {/* Test Scenarios */}
      <View style={styles.scenarios}>
        <Text style={styles.scenariosTitle}>Test Scenarios:</Text>
        
        <View style={styles.scenario}>
          <Text style={styles.scenarioName}>🏪 Close Distance Test</Text>
          <Text style={styles.scenarioDesc}>
            Set distance to "Very Close" - Should find places within 250m and expand if needed
          </Text>
        </View>

        <View style={styles.scenario}>
          <Text style={styles.scenarioName}>🎭 Strict Mood Test</Text>
          <Text style={styles.scenarioDesc}>
            Set mood to "Hype" (80+) - Should only find energetic, vibrant places
          </Text>
        </View>

        <View style={styles.scenario}>
          <Text style={styles.scenarioName}>💰 Budget Filter Test</Text>
          <Text style={styles.scenarioDesc}>
            Select "Food" + Budget "₱" - Should find budget-friendly restaurants only
          </Text>
        </View>

        <View style={styles.scenario}>
          <Text style={styles.scenarioName}>🔄 Pool Depletion Test</Text>
          <Text style={styles.scenarioDesc}>
            Press "Get More" multiple times - Should handle pool refresh gracefully
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Helper functions
const getMoodLabel = (mood: number): string => {
  if (mood >= 70) return 'Hype 🔥';
  if (mood <= 30) return 'Chill 😌';
  return 'Neutral ⚖️';
};

const getDistanceLabel = (distance: number): string => {
  return DistanceUtils.getDistanceLabelForUI(distance);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statusItem: {
    width: '50%',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  locationInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  filtersSection: {
    marginBottom: 20,
  },
  discoverySection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructions: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 8,
    paddingLeft: 8,
  },
  scenarios: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  scenariosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  scenario: {
    borderLeftWidth: 3,
    borderLeftColor: '#7DD3C0',
    paddingLeft: 12,
    marginBottom: 16,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  scenarioDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});