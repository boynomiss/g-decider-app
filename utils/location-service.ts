/**
 * Location Service
 * 
 * Enhanced location handling with simulator support and debugging
 */

import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface LocationResult {
  coords: LocationCoords;
  isSimulated: boolean;
  source: 'gps' | 'network' | 'simulator' | 'fallback';
  accuracy?: number;
  timestamp: number;
}

// Default fallback location (Manila, Philippines)
const DEFAULT_LOCATION: LocationCoords = {
  lat: 14.5995,
  lng: 120.9842
};

// Popular locations for simulator testing
const SIMULATOR_LOCATIONS: Record<string, LocationCoords> = {
  'manila': { lat: 14.5995, lng: 120.9842 },
  'makati': { lat: 14.5547, lng: 121.0244 },
  'bgc': { lat: 14.5176, lng: 121.0509 },
  'ortigas': { lat: 14.5866, lng: 121.0630 },
  'quezon_city': { lat: 14.6760, lng: 121.0437 },
  'alabang': { lat: 14.4297, lng: 121.0403 },
  'cebu': { lat: 10.3157, lng: 123.8854 },
  'davao': { lat: 7.1907, lng: 125.4553 }
};

export class LocationService {
  private static instance: LocationService;
  private lastKnownLocation: LocationResult | null = null;
  private isSimulator: boolean;

  constructor() {
    // Detect if running in simulator
    this.isSimulator = Platform.OS === 'ios' && __DEV__;
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get current location with enhanced simulator support
   */
  async getCurrentLocation(options?: {
    timeout?: number;
    accuracy?: Location.LocationAccuracy;
    simulatorLocation?: keyof typeof SIMULATOR_LOCATIONS;
    enableHighAccuracy?: boolean;
  }): Promise<LocationResult> {
    const {
      timeout = 15000,
      accuracy = Location.Accuracy.Balanced,
      simulatorLocation = 'makati', // Default to Makati for better testing
      enableHighAccuracy = false
    } = options || {};

    console.log('📍 LocationService: Getting current location...', {
      isSimulator: this.isSimulator,
      platform: Platform.OS,
      isDev: __DEV__
    });

    try {
      // Request permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('⚠️ Location permission denied');
        return this.getFallbackLocation('Permission denied');
      }

      console.log('✅ Location permission granted');

      // Check if we're in simulator and should use simulated location
      if (this.isSimulator) {
        console.log('🔧 Running in simulator, attempting to get location...');
        
        try {
          // Try to get actual location first (in case simulator has location set)
          const location = await Location.getCurrentPositionAsync({
            accuracy: enableHighAccuracy ? Location.Accuracy.BestForNavigation : accuracy,
            timeout: Math.min(timeout, 5000), // Shorter timeout for simulator
          });

          // Check if we got a real location (not 0,0 or other default)
          if (location.coords.latitude !== 0 && location.coords.longitude !== 0) {
            const result: LocationResult = {
              coords: {
                lat: location.coords.latitude,
                lng: location.coords.longitude
              },
              isSimulated: false,
              source: 'gps',
              accuracy: location.coords.accuracy || undefined,
              timestamp: Date.now()
            };
            
            console.log('📍 Got real location in simulator:', result.coords);
            this.lastKnownLocation = result;
            return result;
          }
        } catch (simulatorError) {
          console.log('📍 Simulator location failed, using preset location:', simulatorError);
        }

        // Use preset simulator location
        const simulatedCoords = SIMULATOR_LOCATIONS[simulatorLocation];
        const result: LocationResult = {
          coords: simulatedCoords,
          isSimulated: true,
          source: 'simulator',
          timestamp: Date.now()
        };
        
        console.log('🔧 Using simulated location:', result.coords, `(${simulatorLocation})`);
        this.lastKnownLocation = result;
        return result;
      }

      // For real devices, get actual GPS location
      console.log('📱 Getting real device location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: enableHighAccuracy ? Location.Accuracy.BestForNavigation : accuracy,
        timeout,
      });

      const result: LocationResult = {
        coords: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        },
        isSimulated: false,
        source: location.coords.accuracy && location.coords.accuracy < 100 ? 'gps' : 'network',
        accuracy: location.coords.accuracy || undefined,
        timestamp: Date.now()
      };

      console.log('📍 Real device location obtained:', result.coords, {
        accuracy: result.accuracy,
        source: result.source
      });
      
      this.lastKnownLocation = result;
      return result;

    } catch (error) {
      console.error('❌ Error getting location:', error);
      return this.getFallbackLocation(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get fallback location when GPS fails
   */
  private getFallbackLocation(reason: string): LocationResult {
    console.log('🔄 Using fallback location due to:', reason);
    
    const result: LocationResult = {
      coords: DEFAULT_LOCATION,
      isSimulated: true,
      source: 'fallback',
      timestamp: Date.now()
    };
    
    this.lastKnownLocation = result;
    return result;
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationResult | null {
    return this.lastKnownLocation;
  }

  /**
   * Set a custom location for testing
   */
  setTestLocation(coords: LocationCoords): LocationResult {
    const result: LocationResult = {
      coords,
      isSimulated: true,
      source: 'simulator',
      timestamp: Date.now()
    };
    
    console.log('🧪 Test location set:', coords);
    this.lastKnownLocation = result;
    return result;
  }

  /**
   * Get available simulator locations
   */
  getSimulatorLocations(): Record<string, LocationCoords> {
    return SIMULATOR_LOCATIONS;
  }

  /**
   * Check if current location is likely accurate
   */
  isLocationAccurate(location?: LocationResult): boolean {
    const loc = location || this.lastKnownLocation;
    if (!loc) return false;
    
    // Consider location accurate if:
    // 1. It's from GPS with good accuracy
    // 2. It's a known simulator location
    // 3. It's not the default fallback
    
    if (loc.source === 'gps' && loc.accuracy && loc.accuracy < 100) return true;
    if (loc.source === 'simulator' && loc.coords !== DEFAULT_LOCATION) return true;
    if (loc.source === 'network' && loc.accuracy && loc.accuracy < 500) return true;
    
    return false;
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();