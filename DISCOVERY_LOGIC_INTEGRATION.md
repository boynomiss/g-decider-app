# Place Discovery Logic Integration Guide

## Overview

This guide shows how to integrate the new comprehensive place discovery logic with your existing app infrastructure, including the MoodSlider filters and enhanced place discovery system.

## Integration Points

### 1. Connect with App Store Filters

The new discovery logic is designed to work seamlessly with your existing filter system from `use-app-store.ts`. Here's how to connect them:

```typescript
import { useAppStore } from '@/hooks/use-app-store';
import { usePlaceDiscovery } from '@/hooks/use-place-discovery';
import * as Location from 'expo-location';

function DiscoveryScreen() {
  const { filters } = useAppStore();
  const discovery = usePlaceDiscovery({
    googlePlacesApiKey: 'your-key',
    googleCloudCredentials: { /* ... */ }
  });

  // Get user location
  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
    }
    // Fallback to Manila
    return { lat: 14.5995, lng: 120.9842 };
  };

  // Handle G! button press
  const handleDiscovery = async () => {
    const userLocation = await getUserLocation();
    
    // Map app store filters to discovery filters
    const discoveryFilters = {
      category: filters.category as 'food' | 'activity' | 'something-new',
      mood: filters.mood || 50,
      socialContext: filters.socialContext,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      distanceRange: filters.distanceRange || 50,
      userLocation
    };

    await discovery.discoverPlaces(discoveryFilters);
  };

  return (
    <PlaceDiscoveryButton
      onPress={handleDiscovery}
      loading={discovery.isLoading}
      loadingState={discovery.loadingState}
    />
  );
}
```

### 2. Integrate with Enhanced Place Discovery

The new system builds upon your existing `enhanced-place-discovery.ts`. Here's how they work together:

```typescript
// In place-discovery-logic.ts
import { PlaceMoodService } from './place-mood-service';
import { EnhancedPlaceDiscoveryService } from './enhanced-place-discovery';

export class PlaceDiscoveryLogic {
  private moodService: PlaceMoodService;
  private enhancedService: EnhancedPlaceDiscoveryService;

  constructor() {
    // Use existing services
    this.moodService = new PlaceMoodService(apiKey);
    this.enhancedService = new EnhancedPlaceDiscoveryService(
      placesApiKey,
      naturalLanguageApiKey
    );
  }

  // Enhance places with mood data
  private async enhancePlacesWithMood(places: PlaceData[]): Promise<PlaceData[]> {
    const enhanced = [];
    for (const place of places) {
      try {
        // Use existing mood enhancement
        const enhancedPlace = await this.moodService.enhancePlaceWithMood(place.place_id);
        enhanced.push(enhancedPlace);
      } catch (error) {
        // Fallback to basic data
        enhanced.push(place);
      }
    }
    return enhanced;
  }
}
```

### 3. Update MoodSlider Integration

Your MoodSlider already logs the simplified mood. Update it to store the user location:

```typescript
// In MoodSlider.tsx
import * as Location from 'expo-location';

export default function MoodSlider() {
  const { filters, updateFilters } = useAppStore();

  // Add location tracking
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        updateFilters({
          userLocation: {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          }
        });
      }
    };
    getLocation();
  }, []);

  // Rest of your component...
}
```

### 4. Update Filter Types

Add user location to your filter types:

```typescript
// In types/app.ts (or wherever UserFilters is defined)
export interface UserFilters {
  mood: number;
  category: 'food' | 'activity' | 'something-new' | null;
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null;
  userLocation?: {
    lat: number;
    lng: number;
  };
}
```

### 5. Replace Existing Discovery Logic

Update your main discovery flow to use the new system:

```typescript
// In your main app component or screen
import { PlaceDiscoveryButton } from '@/components/PlaceDiscoveryButton';
import { usePlaceDiscovery } from '@/hooks/use-place-discovery';

function MainScreen() {
  const discovery = usePlaceDiscovery({
    googlePlacesApiKey: GOOGLE_API_KEY,
    googleCloudCredentials: GOOGLE_CLOUD_CREDENTIALS,
    advertisedPlaces: getAdvertisedPlaces() // Your sponsored content
  });

  return (
    <View>
      {/* Your existing filters UI */}
      <MoodSlider />
      <CategoryButtons />
      
      {/* Replace old G! button with new one */}
      <PlaceDiscoveryButton
        googlePlacesApiKey={GOOGLE_API_KEY}
        googleCloudCredentials={GOOGLE_CLOUD_CREDENTIALS}
        onDiscoveryComplete={(places) => {
          // Navigate to results screen
          navigation.navigate('Results', { places });
        }}
      />
    </View>
  );
}
```

### 6. Update Results Display

Modify your results screen to handle the new place format:

```typescript
function ResultsScreen({ route }) {
  const { places } = route.params;

  return (
    <ScrollView>
      {places.map((place, index) => (
        <PlaceCard
          key={place.place_id}
          place={place}
          isAdvertised={place.isAdvertised}
          position={index + 1}
        />
      ))}
    </ScrollView>
  );
}
```

## Migration Checklist

- [ ] Update `UserFilters` type to include `userLocation`
- [ ] Add location permission request in app initialization
- [ ] Replace existing `generateSuggestion` calls with new discovery logic
- [ ] Update PlaceCard components to handle `isAdvertised` flag
- [ ] Configure advertised places array
- [ ] Test distance expansion with various filter combinations
- [ ] Verify mood enhancement integration
- [ ] Update loading screens to show expansion status
- [ ] Test pool management and "Get More" functionality

## Configuration Updates

### Environment Variables

```env
# Existing
GOOGLE_PLACES_API_KEY=your_key
GOOGLE_NATURAL_LANGUAGE_API_KEY=your_key

# New (optional)
DISCOVERY_MAX_EXPANSIONS=3
DISCOVERY_EXPANSION_INCREMENT=500
DISCOVERY_MIN_PLACES_REQUIRED=15
```

### Advertised Places Setup

```typescript
// advertisedPlaces.ts
export const advertisedPlaces: AdvertisedPlace[] = [
  {
    place_id: 'sponsored_1',
    name: 'Premium Restaurant',
    address: '123 Main St, Manila',
    category: 'restaurant',
    isAdvertised: true,
    advertisementDetails: {
      campaignId: 'camp_001',
      impressions: 0,
      clickRate: 0
    }
  },
  // Add more sponsored places...
];
```

## Performance Optimization

### 1. Cache Integration

The new system uses the same caching mechanism as your existing code:

```typescript
// Shared cache instance
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### 2. Rate Limiting

Both systems respect Google API rate limits:

```typescript
// Shared rate limiting
const RATE_LIMIT_DELAY = 100; // ms between requests
```

### 3. Pool Management

The new system maintains its own pool separate from the existing one:

```typescript
// New pool for discovery logic
const discoveryPool = new Map<string, PlaceData[]>();

// Existing pool for app store
const enhancedPool = new Map<string, { suggestions: Suggestion[] }>();
```

## Testing Integration

### Test Scenarios

1. **Basic Discovery**
   ```typescript
   // Test with all filters set
   const filters = {
     category: 'food',
     mood: 75,
     socialContext: 'barkada',
     budget: 'PP',
     timeOfDay: 'night',
     distanceRange: 60,
     userLocation: { lat: 14.5995, lng: 120.9842 }
   };
   ```

2. **Distance Expansion**
   ```typescript
   // Test with very close distance
   const filters = {
     category: 'activity',
     mood: 25,
     distanceRange: 20, // Very close
     // ... other filters
   };
   ```

3. **Pool Depletion**
   ```typescript
   // Test "Get More" multiple times
   for (let i = 0; i < 5; i++) {
     await discovery.getMorePlaces();
   }
   ```

## Troubleshooting

### Common Issues

1. **"No places found" with new system**
   - Check if user location is properly set
   - Verify category mapping is correct
   - Ensure mood values are 0-100

2. **Expansion not triggering**
   - Verify MIN_PLACES_REQUIRED is set correctly
   - Check if enough unique places exist in the area

3. **Advertised places not showing**
   - Ensure advertisedPlaces array is passed to PlaceDiscoveryLogic
   - Verify place format matches AdvertisedPlace interface

### Debug Mode

Enable debug logging:

```typescript
// In place-discovery-logic.ts
const DEBUG = true;

if (DEBUG) {
  console.log('🔍 Discovery state:', {
    poolSize: this.placePool.length,
    usedPlaces: this.usedPlaceIds.size,
    expansionCount: this.currentExpansionCount
  });
}
```

## Benefits of Integration

1. **Improved User Experience**
   - Smart filter prioritization
   - Automatic distance expansion
   - Better loading states

2. **Better Place Quality**
   - Ranked selection algorithm
   - Mood-enhanced results
   - Duplicate prevention

3. **Monetization Ready**
   - Built-in advertised place support
   - Tracking capabilities
   - Campaign management

4. **Performance Optimized**
   - Efficient pool management
   - Shared caching
   - Batch processing