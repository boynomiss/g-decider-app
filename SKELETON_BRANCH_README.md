# Skeleton/Prototype Branch - UI Development Guide

## Overview

This branch (`skeleton-ui`) is designed to separate UI development from production business logic. It provides mock services and data that allow you to experiment with UI components freely without worrying about API calls, Firebase connections, or other external dependencies.

## What's Been Mocked

### 1. API Services
- **Google Places API**: Mock search results and place details
- **Scraping Service**: Mock website content extraction
- **Booking Integration**: Mock reservation system
- **Firebase Client**: Mock authentication and database operations

### 2. Firebase Services
- **Cloud Functions**: Mock filtering, AI processing, and NLP
- **Admin SDK**: Mock server-side operations

### 3. AI Services
- **Description Generator**: Mock AI content generation
- **Image Sourcing**: Mock image search and variations
- **Project Agent**: Mock AI project management

### 4. Cache & Filtering
- **Unified Cache**: Mock data caching
- **Server Filtering**: Mock place filtering logic
- **Enhanced Filtering**: Mock advanced filtering with AI

### 5. External Services
- **Ad Monetization**: Mock advertisement system
- **Discount Service**: Mock promotional offers
- **Affiliate Marketing**: Mock partner integrations

### 6. Mobile Services
- **Location Service**: Mock GPS and location data
- **Device Service**: Mock device information
- **Push Notifications**: Mock notification system

### 7. Hooks & State Management
- **Custom Hooks**: Mock versions of all business logic hooks
- **Store**: Mock Zustand store with sample data

## How to Use

### 1. Switch Between Mock and Real Services

The mock configuration is controlled by `src/config/mock-config.ts`:

```typescript
export const MOCK_CONFIG = {
  ENABLE_MOCK_SERVICES: true,  // Master toggle
  
  API: {
    GOOGLE_PLACES: true,       // Use mock Google Places
    SCRAPING: true,            // Use mock scraping
    // ... other services
  }
};
```

### 2. Use Mock Hooks

Replace real hooks with mock versions:

```typescript
// Instead of:
import { useGooglePlaces } from './use-google-places';

// Use:
import { useGooglePlacesMock } from './use-google-places-mock';
```

### 3. Use Mock Store

```typescript
import { useMockStore } from '../store/mock-store';

const { places, setPlaces, loading } = useMockStore();
```

### 4. Access Mock Services Directly

```typescript
import { mockGooglePlacesClient } from '../services/mock/api';

const results = await mockGooglePlacesClient.searchNearby({
  location: { lat: 37.7749, lng: -122.4194 },
  radius: 5000
});
```

## Mock Data Structure

### Places
```typescript
{
  id: 'place_1',
  name: 'Cozy Italian Restaurant',
  rating: 4.7,
  category: 'restaurant',
  distance: '0.3 miles',
  price: '$$$',
  mood: 'romantic'
}
```

### User
```typescript
{
  id: 'user_123',
  email: 'test@example.com',
  preferences: {
    favoriteCategories: ['restaurant', 'cafe'],
    preferredPriceRange: '$$',
    maxDistance: 5
  },
  savedPlaces: ['place_1', 'place_3']
}
```

### Filters
```typescript
{
  id: 'filter_1',
  categories: ['restaurant'],
  priceRange: '$$',
  distance: 5,
  rating: 4.0,
  mood: 'romantic'
}
```

## Development Workflow

### 1. UI Development
- Work on components without worrying about data
- Test different states (loading, error, success)
- Experiment with layouts and interactions

### 2. State Management
- Test different data scenarios
- Verify component behavior with various states
- Debug UI logic independently

### 3. Integration Testing
- Gradually replace mock services with real ones
- Test integration points one at a time
- Maintain UI consistency during transition

## Switching Back to Production

When you're ready to merge back to production:

1. **Update Configuration**: Set `ENABLE_MOCK_SERVICES: false`
2. **Replace Hooks**: Switch back to real hook implementations
3. **Update Imports**: Change mock service imports to real ones
4. **Test Integration**: Verify real services work with your UI
5. **Merge**: Create a pull request to merge back to main branch

## Benefits

### ✅ **Faster Development**
- No API rate limits or network delays
- Instant feedback on UI changes
- No need to set up external services

### ✅ **Isolated Testing**
- Test UI logic independently
- No interference from external failures
- Consistent test environment

### ✅ **Creative Freedom**
- Experiment with different data scenarios
- Test edge cases easily
- Focus purely on user experience

### ✅ **Team Collaboration**
- UI developers can work independently
- Backend developers can focus on services
- Clear separation of concerns

## Mock Data Customization

### Adding New Mock Places
Edit `src/store/mock-store.ts`:

```typescript
const mockPlaces: MockPlace[] = [
  // ... existing places
  {
    id: 'place_5',
    name: 'New Mock Place',
    rating: 4.9,
    category: 'restaurant',
    distance: '0.1 miles',
    price: '$$$$',
    mood: 'luxurious'
  }
];
```

### Customizing Mock Responses
Edit individual mock services in `src/services/mock/`:

```typescript
export const mockGooglePlacesClient = {
  searchNearby: async (params: any) => ({
    results: [
      // Your custom mock data here
    ]
  })
};
```

### Adjusting Mock Delays
Edit `src/config/mock-config.ts`:

```typescript
MOCK_DATA: {
  DELAYS: {
    FAST: 100,      // Faster for development
    NORMAL: 500,    // Moderate delay
    SLOW: 1000,     // Slower for testing
    AI_PROCESSING: 1500  // AI simulation
  }
}
```

## Troubleshooting

### Mock Services Not Working
1. Check `MOCK_CONFIG.ENABLE_MOCK_SERVICES` is `true`
2. Verify individual service toggles are enabled
3. Ensure you're importing from mock service files

### UI Not Updating
1. Check if you're using mock hooks
2. Verify mock store is being used
3. Check console for any errors

### Data Not Loading
1. Verify mock data structure matches expected format
2. Check if mock delays are too long
3. Ensure mock services are properly exported

## Best Practices

1. **Keep Mock Data Realistic**: Use realistic values that match production data
2. **Simulate Real Delays**: Add appropriate delays to mimic real API calls
3. **Handle Edge Cases**: Include error states and empty data scenarios
4. **Document Changes**: Update this README when adding new mock services
5. **Version Control**: Keep mock data in sync with UI requirements

## Next Steps

1. **Explore Components**: Start with the main UI components
2. **Customize Data**: Modify mock data to match your design needs
3. **Test Interactions**: Verify all UI interactions work with mock data
4. **Iterate**: Make UI improvements based on mock data testing
5. **Plan Integration**: Identify which services to integrate first

Happy UI development! 🎨✨
