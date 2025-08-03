# Place Discovery Logic Implementation Guide

## Overview

The Place Discovery Logic System is a sophisticated algorithm that intelligently discovers and recommends places based on user preferences. It features smart filtering, dynamic distance expansion, ranked selection, and advertised place integration.

## Key Features

### 🎯 Smart Filter Prioritization
- **STRICT Filters**: Category, Mood (contextual), Budget
- **FLEXIBLE Filters**: Distance (expands), Social Context, Time of Day

### 📏 Dynamic Distance Expansion
- Initial search uses user's selected distance
- Expands by 500m increments if insufficient places found
- Maximum 3 expansions allowed
- Shows appropriate loading states during expansion

### 🎲 Ranked Random Selection
- Collects pool of up to 12 places
- Ranks by rating (weighted by review count)
- Selects 4 places using weighted randomization
- Adds 1 advertised place to each result set

### 📱 Loading State Management
- `initial`: Ready to discover
- `searching`: Collecting places
- `expanding-distance`: Expanding search radius
- `limit-reach`: Maximum expansions reached
- `complete`: Results ready
- `error`: Something went wrong

## Implementation Details

### Filter Processing Logic

```typescript
// Filter Priority Implementation
const filterPriority = {
  // STRICT - Must match exactly
  category: 'strict',      // food/activity/something-new
  mood: 'strict-context',  // Within acceptable range
  budget: 'strict',        // Price level must match
  
  // FLEXIBLE - Prefer but don't exclude
  distance: 'flexible',    // Can expand if needed
  socialContext: 'flexible', // Influences ranking
  timeOfDay: 'flexible'    // Prefers open places
};
```

### Distance Expansion Algorithm

```typescript
// Expansion Strategy
const expansionLogic = {
  initialRadius: getUserSelectedDistance(),
  expansionIncrement: 500, // meters
  maxExpansions: 3,
  minPlacesRequired: 15,
  
  shouldExpand: (placesFound, expansionCount) => {
    return placesFound < 15 && expansionCount < 3;
  }
};
```

### Place Selection Process

```typescript
// Selection Algorithm
1. Collect places from Google Places API
2. Enhance with mood data
3. Apply strict filters
4. Rank by weighted score:
   - Rating: 70% weight
   - Review count: 30% weight (logarithmic)
   - Mood match: Bonus points
5. Select 4 places using weighted random
6. Insert 1 advertised place randomly
7. Track used places to avoid duplicates
```

## Usage Example

### Basic Implementation

```typescript
import { PlaceDiscoveryLogic } from '@/utils/place-discovery-logic';
import { PlaceMoodService } from '@/utils/place-mood-service';

// Initialize services
const moodService = new PlaceMoodService(apiKey, credentials);
const discoveryLogic = new PlaceDiscoveryLogic(
  moodService,
  apiKey,
  advertisedPlaces
);

// Define filters from user input
const filters = {
  category: 'food',
  mood: 75, // Hype
  socialContext: 'barkada',
  budget: 'PP',
  timeOfDay: 'night',
  distanceRange: 60, // Short car ride (1-5km)
  userLocation: { lat: 14.5995, lng: 120.9842 }
};

// Discover places
const result = await discoveryLogic.discoverPlaces(filters);
console.log(`Found ${result.places.length} places`);
console.log(`Expansions: ${result.expansionInfo.expansionCount}`);

// Get more places
const nextBatch = await discoveryLogic.getNextBatch(filters);
```

### React Hook Usage

```typescript
import { usePlaceDiscovery } from '@/hooks/use-place-discovery';

function DiscoveryComponent() {
  const {
    isLoading,
    loadingState,
    discoveredPlaces,
    expansionInfo,
    poolInfo,
    discoverPlaces,
    getMorePlaces
  } = usePlaceDiscovery({
    googlePlacesApiKey: 'your-key',
    googleCloudCredentials: { /* ... */ }
  });

  const handleDiscover = async () => {
    await discoverPlaces();
    // Places are now in discoveredPlaces array
  };

  return (
    <View>
      <TouchableOpacity onPress={handleDiscover}>
        <Text>G!</Text>
      </TouchableOpacity>
      
      {loadingState === 'expanding-distance' && (
        <Text>Expanding search area...</Text>
      )}
      
      {discoveredPlaces.map(place => (
        <PlaceCard key={place.place_id} place={place} />
      ))}
    </View>
  );
}
```

## Distance Mapping

The system maps percentage values (0-100) to actual distances:

| Percentage | Distance | Label |
|------------|----------|-------|
| 0-20% | 0-250m | Very Close |
| 20-40% | 250m-1km | Walking Distance |
| 40-60% | 1-5km | Short Car Ride |
| 60-80% | 5-10km | Long Car Ride |
| 80-100% | 10-20km | As Far as It Gets |

## Category Mappings

### Food Category
- restaurant, cafe, bakery, bar
- meal_delivery, meal_takeaway
- fast_food_restaurant, pizza_place
- coffee_shop, ice_cream_shop

### Activity Category
- amusement_park, aquarium, art_gallery
- bowling_alley, casino, gym
- movie_theater, museum, night_club
- park, shopping_mall, spa
- stadium, tourist_attraction, zoo

### Something New Category
- art_gallery, book_store, library
- museum, performing_arts_theater
- cultural_center, workshop
- cooking_class, dance_studio
- music_venue, comedy_club

## Pool Management

The system maintains a pool of discovered places:

```typescript
// Pool Configuration
const poolConfig = {
  maxPoolSize: 12,        // Maximum places to keep
  placesPerResult: 4,     // Places per discovery
  advertisedPerResult: 1, // Advertised places per result
  
  refreshThreshold: 4,    // Refresh when < 4 unused places
  
  // Pool lifecycle
  lifecycle: {
    1. Initial discovery fills pool
    2. Each "Get More" draws from pool
    3. Auto-refresh when depleted
    4. Expansion triggered if needed
  }
};
```

## Error Handling

The system handles various error scenarios gracefully:

### API Errors
- Rate limiting: Automatic retry with backoff
- Network errors: User-friendly error messages
- Invalid responses: Fallback to partial results

### Location Errors
- No user location: Prompt for permission
- Invalid coordinates: Validation and error state

### Filter Errors
- Missing required filters: Disable discovery button
- Invalid filter values: Use defaults

## Performance Optimization

### API Call Optimization
```typescript
// Batch requests when possible
const places = await Promise.all(
  placeIds.map(id => getPlaceDetails(id))
);

// Rate limiting
const RATE_LIMIT_DELAY = 100; // ms between requests

// Caching
const placeCache = new Map();
```

### State Management
```typescript
// Efficient state updates
setPlaces(prev => {
  const newPlaces = [...prev];
  // Update only changed places
  return newPlaces;
});

// Memoization
const memoizedFilters = useMemo(() => 
  buildFilters(userInput), [userInput]
);
```

## Testing

### Run Tests
```bash
# Test discovery logic
npm run test-discovery-logic

# Test with real API
GOOGLE_PLACES_API_KEY=your-key npm run test-discovery-logic
```

### Test Scenarios
1. **Close Distance + Strict Filters**: Tests minimal expansion
2. **Far Distance + Flexible Filters**: Tests maximum coverage
3. **Insufficient Places**: Tests expansion logic
4. **Pool Depletion**: Tests refresh mechanism

## Troubleshooting

### Common Issues

#### "No places found"
- Check user location permissions
- Verify API key is valid
- Ensure category mapping is correct

#### "Expansion limit reached"
- Normal behavior in sparse areas
- Consider increasing initial distance
- Check if filters are too restrictive

#### "Same places appearing"
- Pool may be small in the area
- Reset discovery session
- Check deduplication logic

### Debug Mode

Enable debug logging:
```typescript
// In development
if (__DEV__) {
  console.log('Pool status:', poolInfo);
  console.log('Expansion info:', expansionInfo);
}
```

## Best Practices

### 1. Filter Configuration
- Always require category and location
- Set reasonable default distances
- Allow mood flexibility

### 2. User Experience
- Show loading states clearly
- Explain distance expansion
- Provide retry options

### 3. Performance
- Cache enhanced place data
- Batch API requests
- Implement proper error boundaries

### 4. Testing
- Test with various locations
- Simulate API failures
- Verify expansion behavior

## Integration Checklist

- [ ] Configure Google Places API key
- [ ] Set up Natural Language API credentials
- [ ] Implement advertised places system
- [ ] Connect to existing filters (MoodSlider, CategoryButtons)
- [ ] Add PlaceDiscoveryButton to UI
- [ ] Handle loading states in UI
- [ ] Test distance expansion
- [ ] Verify place selection diversity
- [ ] Monitor API usage and costs
- [ ] Implement analytics tracking

## Future Enhancements

1. **Machine Learning Integration**
   - Learn from user preferences
   - Improve ranking algorithm
   - Predict expansion needs

2. **Advanced Filtering**
   - Multi-category search
   - Custom filter combinations
   - Saved filter presets

3. **Performance Improvements**
   - Predictive caching
   - Offline capability
   - Background updates

4. **User Features**
   - Save discovery sessions
   - Share place lists
   - Discovery history