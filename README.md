# G-Decider App - Skeleton Branch

A React Native app for discovering and filtering places with AI-powered recommendations. This branch (`skeleton-ui`) is configured for **UI prototyping and development** with all business logic stubbed out.

## 🏗️ Skeleton/Stubbed Files Structure

### Mock Services (`src/services/mock/`)
All external API calls and business logic have been replaced with mock implementations:

```
src/services/mock/
├── api/                    # Mock API services
│   ├── index.ts           # Google Places, scraping, booking, Firebase client
│   └── ...                # All real API calls stubbed
├── firebase/              # Mock Firebase services
│   ├── index.ts           # Cloud functions, admin SDK, AI processing
│   └── ...                # All Firebase calls stubbed
├── ai/                    # Mock AI services
│   ├── index.ts           # Description generation, image sourcing, projects
│   └── ...                # All AI processing stubbed
├── cache/                 # Mock caching & filtering
│   ├── index.ts           # Data caching, server filtering, enhanced filtering
│   └── ...                # All filtering logic stubbed
├── external/              # Mock external services
│   ├── index.ts           # Ads, discounts, affiliate marketing
│   └── ...                # All monetization stubbed
├── mobile/                # Mock mobile services
│   ├── index.ts           # Location, device info, notifications
│   └── ...                # All device features stubbed
└── index.ts               # Main export file
```

### Mock Hooks (`src/features/*/hooks/`)
Business logic hooks replaced with mock versions:

```
src/features/
├── auth/hooks/
│   └── use-auth-mock.ts           # Mock authentication
├── discovery/hooks/
│   ├── use-google-places-mock.ts  # Mock Google Places API
│   └── use-ai-description-mock.ts # Mock AI descriptions
├── filtering/hooks/
│   └── use-server-filtering-mock.ts # Mock server filtering
└── ...
```

### Mock Store (`src/store/`)
- `mock-store.ts` - Zustand store with sample data
- All real state management stubbed

### Mock Components (`src/features/*/components/`)
- `InstantRecommendationsMock.tsx` - Example of using mock services
- Shows how to integrate mock data with UI components

### Configuration (`src/config/`)
- `mock-config.ts` - Central control for enabling/disabling mock services

## 🚀 Running the App for UI Prototyping

### Prerequisites
```bash
# Install dependencies
npm install
# or
yarn install
# or
bun install
```

### Start the Development Server
```bash
# Start Expo development server
npm start
# or
yarn start
# or
bun start
```

### Run on Device/Simulator
```bash
# iOS Simulator
npm run ios
# or
yarn ios

# Android Emulator
npm run android
# or
yarn android

# Web (for testing UI components)
npm run web
# or
yarn web
```

### What You'll See
- **Mock Data**: All components will display realistic sample data
- **Mock Badges**: "MOCK" indicators show which services are stubbed
- **Simulated Delays**: Loading states that mimic real API calls
- **Sample Places**: Restaurants, cafes, and other venues with mock ratings, prices, etc.

## 🎨 UI Development Workflow

### 1. **Component Development**
```typescript
// Import mock services instead of real ones
import { useMockStore } from '../store/mock-store';
import { useGooglePlacesMock } from '../hooks/use-google-places-mock';

// Use mock data for UI development
const { places, loading } = useMockStore();
const { searchNearby } = useGooglePlacesMock();
```

### 2. **State Testing**
```typescript
// Test different UI states with mock data
const mockPlaces = [
  { id: '1', name: 'Test Restaurant', rating: 4.5 },
  { id: '2', name: 'Test Cafe', rating: 4.2 }
];

// Test loading states
setLoading(true);
// Test error states
setError('Mock error message');
```

### 3. **Data Customization**
Edit `src/store/mock-store.ts` to customize mock data:
```typescript
const mockPlaces: MockPlace[] = [
  {
    id: 'custom_1',
    name: 'Your Custom Place',
    rating: 4.9,
    category: 'restaurant',
    // ... customize as needed
  }
];
```

### 4. **Mock Service Configuration**
Control which services use mocks in `src/config/mock-config.ts`:
```typescript
export const MOCK_CONFIG = {
  ENABLE_MOCK_SERVICES: true,
  API: {
    GOOGLE_PLACES: true,    // Use mock Google Places
    SCRAPING: true,         // Use mock scraping
    // ... other services
  }
};
```

## 🔌 Reconnecting to Real API/Firebase

### Step 1: Update Configuration
```typescript
// src/config/mock-config.ts
export const MOCK_CONFIG = {
  ENABLE_MOCK_SERVICES: false,  // Disable all mocks
  // ... or disable individual services
};
```

### Step 2: Replace Mock Imports
```typescript
// Instead of:
import { useGooglePlacesMock } from './use-google-places-mock';
import { useMockStore } from '../store/mock-store';

// Use:
import { useGooglePlaces } from './use-google-places';
import { useAppStore } from '../store/store';
```

### Step 3: Update Component Imports
```typescript
// Replace mock components with real ones
// Instead of:
import InstantRecommendationsMock from './InstantRecommendationsMock';

// Use:
import InstantRecommendations from './InstantRecommendations';
```

### Step 4: Environment Setup
```bash
# Set up environment variables for real services
cp .env.example .env

# Add your API keys
GOOGLE_PLACES_API_KEY=your_key_here
FIREBASE_CONFIG=your_firebase_config
AI_SERVICE_KEY=your_ai_key
```

### Step 5: Test Integration
```bash
# Test with real services
npm start

# Verify API calls are working
# Check Firebase connections
# Test AI services
```

## 📁 File Mapping: Mock → Real

| Mock File | Real File | Purpose |
|-----------|-----------|---------|
| `src/services/mock/api/index.ts` | `src/services/api/index.ts` | API services |
| `src/services/mock/firebase/index.ts` | `src/services/firebase/index.ts` | Firebase services |
| `src/services/mock/ai/index.ts` | `src/services/ai/index.ts` | AI services |
| `src/features/*/hooks/use-*-mock.ts` | `src/features/*/hooks/use-*.ts` | Business logic hooks |
| `src/store/mock-store.ts` | `src/store/store.ts` | State management |
| `src/config/mock-config.ts` | N/A | Configuration only |

## 🧪 Testing Different Scenarios

### Loading States
```typescript
// Mock loading delays
const mockDelay = 2000; // 2 seconds
await new Promise(resolve => setTimeout(resolve, mockDelay));
```

### Error States
```typescript
// Simulate API errors
if (Math.random() > 0.8) {
  throw new Error('Mock API error');
}
```

### Empty Data
```typescript
// Test empty states
const emptyResults = { results: [] };
```

### Network Issues
```typescript
// Simulate network problems
const simulateNetworkError = () => {
  throw new Error('Network connection failed');
};
```

## 🔧 Customization Options

### Mock Data Delays
```typescript
// src/config/mock-config.ts
MOCK_DATA: {
  DELAYS: {
    FAST: 100,           // Quick responses
    NORMAL: 1000,        // Standard API delay
    SLOW: 3000,          // Slow network simulation
    AI_PROCESSING: 5000  // AI processing time
  }
}
```

### Mock Data Variety
```typescript
// Add randomization to mock responses
const randomRating = (min: number, max: number) => 
  Math.random() * (max - min) + min;

const mockPlace = {
  rating: randomRating(3.5, 5.0),
  price: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)]
};
```

### Mock Error Simulation
```typescript
// src/config/mock-config.ts
FEATURES: {
  ENABLE_MOCK_ERRORS: true,  // Simulate errors for testing
  ERROR_RATE: 0.1            // 10% chance of error
}
```

## 🚨 Troubleshooting

### Mock Services Not Working
1. Check `MOCK_CONFIG.ENABLE_MOCK_SERVICES` is `true`
2. Verify individual service toggles are enabled
3. Ensure you're importing from mock service files
4. Check console for any errors

### UI Not Updating
1. Verify you're using mock hooks
2. Check if mock store is being used
3. Ensure component re-renders on state changes
4. Check for any TypeScript errors

### Data Not Loading
1. Verify mock data structure matches expected format
2. Check if mock delays are too long
3. Ensure mock services are properly exported
4. Check component lifecycle methods

## 📚 Additional Resources

- **Skeleton Branch Guide**: `SKELETON_BRANCH_README.md`
- **Setup Summary**: `SKELETON_SETUP_SUMMARY.md`
- **Mock Configuration**: `src/config/mock-config.ts`
- **Example Component**: `src/features/discovery/components/InstantRecommendationsMock.tsx`

## 🎯 Development Phases

### Phase 1: UI Development (Current)
- ✅ Use mock services for all business logic
- ✅ Focus on component design and user experience
- ✅ Test different data scenarios and edge cases
- ✅ Iterate on UI/UX without external dependencies

### Phase 2: Service Integration
- 🔄 Gradually replace mock services with real ones
- 🔄 Test integration points one at a time
- 🔄 Maintain UI consistency during transition
- 🔄 Add error handling for real service failures

### Phase 3: Production Ready
- ⏳ All real services integrated
- ⏳ Comprehensive error handling
- ⏳ Performance optimization
- ⏳ Production deployment

## 🤝 Contributing

When working on this skeleton branch:

1. **Keep Mock Data Realistic** - Use values that match production expectations
2. **Document Changes** - Update this README when adding new mock services
3. **Test Edge Cases** - Include error states and empty data scenarios
4. **Maintain Consistency** - Keep mock data structure aligned with UI requirements

---

**Happy UI Development! 🎨✨**

This skeleton branch gives you the freedom to experiment with UI components while keeping all business logic safely stubbed. When you're ready to integrate real services, the transition will be smooth and controlled.
